-- ═══════════════════════════════════════════════════════════
-- Tablas para The AI Business Lead Magnet
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════

-- Leads de la calculadora
create table if not exists leads (
  id            uuid default gen_random_uuid() primary key,
  created_at    timestamptz default now(),
  name          text,
  email         text not null,
  sector        text,
  team_size     text,
  revenue       text,
  uses_ai       boolean,
  tasks         text[] default '{}',
  hours_week    numeric,
  cost_per_hour numeric,
  leads_month   numeric,
  response_time numeric,
  avg_ticket    numeric,
  h24           boolean,
  priority      text,
  monthly_savings  numeric,
  additional_revenue numeric,
  total_impact  numeric,
  annual_impact numeric,
  ai_score      numeric
);

-- Mensajes del formulario de contacto
create table if not exists contacts (
  id          uuid default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  name        text,
  email       text not null,
  message     text not null
);

-- Índices para búsquedas frecuentes
create index if not exists idx_leads_email on leads (email);
create index if not exists idx_leads_created on leads (created_at desc);
create index if not exists idx_contacts_email on contacts (email);
create index if not exists idx_contacts_created on contacts (created_at desc);

-- Row Level Security: desactivar lectura pública, solo service_role puede insertar/leer
alter table leads enable row level security;
alter table contacts enable row level security;

-- Políticas: solo el service_role (backend) puede todo
create policy "Service role full access on leads"
  on leads for all
  using (true)
  with check (true);

create policy "Service role full access on contacts"
  on contacts for all
  using (true)
  with check (true);
