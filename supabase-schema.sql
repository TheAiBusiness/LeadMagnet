-- =========================================================
-- LeadMagnet — Supabase schema (RLS + RPC + Views safe)
-- =========================================================

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists citext;

-- =========================================================
-- Admins
-- =========================================================
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  role text not null default 'admin',
  note text
);

-- Helper: is_admin()
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admins a
    where a.user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

alter table public.app_admins enable row level security;

drop policy if exists "Admins can read admin list" on public.app_admins;
create policy "Admins can read admin list"
on public.app_admins
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can manage admins" on public.app_admins;
create policy "Admins can manage admins"
on public.app_admins
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- Leads (1 por email)
-- =========================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email citext not null unique,
  name text,
  last_submission_at timestamptz,
  consent_marketing boolean,
  consent_at timestamptz,
  meta jsonb not null default '{}'::jsonb
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create index if not exists idx_leads_last_submission_at on public.leads (last_submission_at desc);
create index if not exists idx_leads_created_at on public.leads (created_at desc);

alter table public.leads enable row level security;

drop policy if exists "Admins can read leads" on public.leads;
create policy "Admins can read leads"
on public.leads
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update leads" on public.leads;
create policy "Admins can update leads"
on public.leads
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete leads" on public.leads;
create policy "Admins can delete leads"
on public.leads
for delete
to authenticated
using (public.is_admin());

-- =========================================================
-- AI Reports (histórico de calculadora)
-- =========================================================
create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  client_created_at timestamptz,

  sector text,
  team_size text,              -- payload: teamSize
  revenue_band text,           -- payload: revenue
  uses_ai boolean,             -- payload: usesAI
  tasks text[],                -- payload: tasks
  hours integer,               -- payload: hours
  cost_per_hour numeric(10,2), -- payload: costH
  leads_per_month integer,     -- payload: leads
  response_time_minutes integer, -- payload: respTime
  avg_ticket numeric(12,2),    -- payload: avgTicket
  has_24_7 boolean,            -- payload: h24
  priority text,

  calc jsonb,

  hrs_saved numeric(10,2),
  monthly_savings numeric(12,2),
  additional_revenue numeric(12,2),
  new_response_time_minutes numeric(10,2),
  response_improve_pct numeric(6,2),
  ai_score integer,
  total_monthly_impact numeric(12,2),
  total_annual_impact numeric(14,2),

  payload jsonb not null default '{}'::jsonb,
  meta jsonb not null default '{}'::jsonb
);

create index if not exists idx_ai_reports_created_at on public.ai_reports (created_at desc);
create index if not exists idx_ai_reports_lead_created on public.ai_reports (lead_id, created_at desc);
create index if not exists idx_ai_reports_sector on public.ai_reports (sector);
create index if not exists idx_ai_reports_score on public.ai_reports (ai_score);
create index if not exists idx_ai_reports_total_monthly on public.ai_reports (total_monthly_impact desc);

alter table public.ai_reports enable row level security;

drop policy if exists "Admins can read reports" on public.ai_reports;
create policy "Admins can read reports"
on public.ai_reports
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update reports" on public.ai_reports;
create policy "Admins can update reports"
on public.ai_reports
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete reports" on public.ai_reports;
create policy "Admins can delete reports"
on public.ai_reports
for delete
to authenticated
using (public.is_admin());

-- =========================================================
-- Contact messages
-- =========================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now(),
  name text,
  email citext not null,
  message text not null,
  status text not null default 'new', -- new | read | replied | archived
  meta jsonb not null default '{}'::jsonb
);

create index if not exists idx_contact_created_at on public.contact_messages (created_at desc);
create index if not exists idx_contact_email on public.contact_messages (email);

alter table public.contact_messages enable row level security;

drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages"
on public.contact_messages
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update contact messages" on public.contact_messages;
create policy "Admins can update contact messages"
on public.contact_messages
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete contact messages" on public.contact_messages;
create policy "Admins can delete contact messages"
on public.contact_messages
for delete
to authenticated
using (public.is_admin());

-- =========================================================
-- RPC: submit_ai_report(payload, meta)
-- SECURITY DEFINER (para escribir aunque RLS esté ON)
-- Por defecto: SOLO service_role (backend)
-- =========================================================
create or replace function public.submit_ai_report(
  p_payload jsonb,
  p_meta jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email citext;
  v_name text;
  v_lead_id uuid;
  v_report_id uuid;

  v_calc jsonb;
  v_tasks text[];
  v_client_created_at timestamptz;
begin
  v_email := nullif(trim((p_payload->>'email')), '')::citext;
  if v_email is null then
    raise exception 'email is required';
  end if;

  v_name := nullif(trim(p_payload->>'name'), '');
  v_client_created_at := nullif(p_payload->>'createdAt','')::timestamptz;

  if jsonb_typeof(p_payload->'tasks') = 'array' then
    select coalesce(array_agg(x), '{}'::text[])
      into v_tasks
    from jsonb_array_elements_text(p_payload->'tasks') as t(x);
  else
    v_tasks := '{}'::text[];
  end if;

  v_calc := p_payload->'calc';

  insert into public.leads (email, name, last_submission_at, meta)
  values (v_email, v_name, now(), coalesce(p_meta,'{}'::jsonb))
  on conflict (email) do update set
    name = coalesce(excluded.name, leads.name),
    last_submission_at = now(),
    meta = leads.meta || excluded.meta
  returning id into v_lead_id;

  insert into public.ai_reports (
    lead_id, client_created_at,
    sector, team_size, revenue_band, uses_ai, tasks,
    hours, cost_per_hour, leads_per_month, response_time_minutes, avg_ticket,
    has_24_7, priority,
    calc,
    hrs_saved, monthly_savings, additional_revenue, new_response_time_minutes,
    response_improve_pct, ai_score, total_monthly_impact, total_annual_impact,
    payload, meta
  )
  values (
    v_lead_id, v_client_created_at,
    p_payload->>'sector',
    p_payload->>'teamSize',
    p_payload->>'revenue',
    case when p_payload ? 'usesAI' then (p_payload->>'usesAI')::boolean else null end,
    v_tasks,
    nullif(p_payload->>'hours','')::int,
    nullif(p_payload->>'costH','')::numeric,
    nullif(p_payload->>'leads','')::int,
    nullif(p_payload->>'respTime','')::int,
    nullif(p_payload->>'avgTicket','')::numeric,
    case when p_payload ? 'h24' then (p_payload->>'h24')::boolean else null end,
    p_payload->>'priority',
    v_calc,
    nullif(v_calc->>'hrsSaved','')::numeric,
    nullif(v_calc->>'monthlySav','')::numeric,
    nullif(v_calc->>'addRev','')::numeric,
    nullif(v_calc->>'newResp','')::numeric,
    nullif(v_calc->>'respImprove','')::numeric,
    nullif(v_calc->>'score','')::int,
    nullif(v_calc->>'total','')::numeric,
    nullif(v_calc->>'annual','')::numeric,
    coalesce(p_payload,'{}'::jsonb),
    coalesce(p_meta,'{}'::jsonb)
  )
  returning id into v_report_id;

  return v_report_id;
end;
$$;

-- IMPORTANTE: por defecto NO lo exponemos a anon/authenticated.
revoke all on function public.submit_ai_report(jsonb, jsonb) from public;
revoke all on function public.submit_ai_report(jsonb, jsonb) from anon, authenticated;
grant execute on function public.submit_ai_report(jsonb, jsonb) to service_role;

-- =========================================================
-- RPC: submit_contact_message(payload, meta)
-- =========================================================
create or replace function public.submit_contact_message(
  p_payload jsonb,
  p_meta jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email citext;
  v_name text;
  v_message text;
  v_lead_id uuid;
  v_message_id uuid;
begin
  v_email := nullif(trim((p_payload->>'email')), '')::citext;
  v_message := nullif(p_payload->>'message','');
  if v_email is null or v_message is null then
    raise exception 'email and message are required';
  end if;

  v_name := nullif(trim(p_payload->>'name'), '');

  insert into public.leads (email, name, last_submission_at, meta)
  values (v_email, v_name, now(), coalesce(p_meta,'{}'::jsonb))
  on conflict (email) do update set
    name = coalesce(excluded.name, leads.name),
    last_submission_at = greatest(coalesce(leads.last_submission_at, now()), now()),
    meta = leads.meta || excluded.meta
  returning id into v_lead_id;

  insert into public.contact_messages (lead_id, name, email, message, meta)
  values (v_lead_id, v_name, v_email, v_message, coalesce(p_meta,'{}'::jsonb))
  returning id into v_message_id;

  return v_message_id;
end;
$$;

revoke all on function public.submit_contact_message(jsonb, jsonb) from public;
revoke all on function public.submit_contact_message(jsonb, jsonb) from anon, authenticated;
grant execute on function public.submit_contact_message(jsonb, jsonb) to service_role;

-- =========================================================
-- Views (SOLUCIÓN: SECURITY INVOKER)
-- Esto evita "SECURITY DEFINER view" y respeta RLS del usuario.
-- =========================================================
drop view if exists public.v_leads_latest_report;
create view public.v_leads_latest_report
with (security_invoker = true)
as
select
  l.id as lead_id,
  l.email,
  l.name,
  l.created_at as lead_created_at,
  l.last_submission_at,
  r.id as last_report_id,
  r.created_at as last_report_at,
  r.sector,
  r.team_size,
  r.revenue_band,
  r.ai_score,
  r.total_monthly_impact,
  r.total_annual_impact
from public.leads l
left join lateral (
  select *
  from public.ai_reports ar
  where ar.lead_id = l.id
  order by ar.created_at desc
  limit 1
) r on true;

drop view if exists public.v_reports_daily;
create view public.v_reports_daily
with (security_invoker = true)
as
select
  date_trunc('day', created_at) as day,
  count(*) as reports,
  count(distinct lead_id) as unique_leads,
  avg(ai_score)::numeric(6,2) as avg_score,
  avg(total_monthly_impact)::numeric(12,2) as avg_monthly_impact
from public.ai_reports
group by 1
order by 1 desc;

-- Permisos en views (opcional: explícito)
revoke all on public.v_leads_latest_report from anon;
revoke all on public.v_reports_daily from anon;

-- Nota: aunque concedas SELECT a authenticated, RLS en tablas seguirá aplicando
grant select on public.v_leads_latest_report to authenticated;
grant select on public.v_reports_daily to authenticated;
