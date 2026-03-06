/**
 * Genera el HTML completo del informe por email (mismo contenido que la web).
 */

const TASK_SAVINGS: Record<string, { savings: number; desc: string }> = {
  "Atención cliente": { savings: 0.7, desc: "Chatbots AI + routing inteligente" },
  Emails: { savings: 0.6, desc: "Redacción y respuesta automatizada" },
  "Entrada datos": { savings: 0.85, desc: "OCR + extracción automática" },
  Informes: { savings: 0.75, desc: "Generación y distribución auto." },
  Leads: { savings: 0.65, desc: "Scoring y nurturing con AI" },
  Agenda: { savings: 0.8, desc: "Scheduling inteligente" },
  Facturación: { savings: 0.7, desc: "Procesamiento automático" },
  Contenido: { savings: 0.5, desc: "Generación asistida por AI" },
};

const SECTOR_AI_ADOPTION: Record<string, number> = { SaaS: 68, Agencia: 54, Ecommerce: 61, Salud: 38, Servicios: 42, Inmobiliaria: 29, Logística: 45, Otros: 40 };
const SECTOR_AVG_RESPONSE: Record<string, number> = { Ecommerce: 35, SaaS: 20, Agencia: 45, Servicios: 55, Salud: 30, Inmobiliaria: 75, Logística: 50, Otros: 40 };

interface TechIdea {
  id: string;
  title: string;
  taskAffinity: string[];
  priorityAffinity: string[];
  sectorBoost: string[];
  needs24h: boolean;
  setupTime: string;
  impact: string;
  getDesc: (ctx: IdeaCtx) => string;
}

interface IdeaCtx {
  sector: string;
  teamSize: string;
  tasks: string[];
  priority: string;
  hours: number;
  costH: number;
  leads: number;
  respTime: number;
  h24: boolean | null;
  usesAI: boolean | null;
  hrsSaved: number;
  monthlySav: number;
  addRev: number;
  newResp: number;
}

const taskMap: Record<string, string> = { "Entrada datos": "pasar datos", "Emails": "enviar emails", "Facturación": "facturar", "Informes": "hacer informes", "Agenda": "coordinar agenda" };

const TECH_IDEAS: TechIdea[] = [
  { id: "virtual-assistant", title: "Asistente virtual para clientes", taskAffinity: ["Atención cliente", "Leads"], priorityAffinity: ["Mejor soporte", "Más ventas"], sectorBoost: ["SaaS", "Ecommerce", "Servicios", "Salud", "Inmobiliaria"], needs24h: true, setupTime: "1–2 semanas", impact: "Alto", getDesc: () => "Respuestas automáticas a las dudas más frecuentes de tus clientes, 24/7." },
  { id: "auto-workflows", title: "Automatizar tareas repetitivas", taskAffinity: ["Entrada datos", "Emails", "Facturación", "Informes", "Agenda"], priorityAffinity: ["Acelerar procesos", "Reducir costes"], sectorBoost: ["Agencia", "Logística", "Servicios", "Ecommerce", "SaaS"], needs24h: false, setupTime: "2–3 semanas", impact: "Alto", getDesc: (ctx) => { const relevant = ctx.tasks.filter(t => taskMap[t]).slice(0, 2).map(t => taskMap[t]); return `Dejar de ${relevant.length > 0 ? relevant.join(" y ") : "repetir tareas"} a mano — se configura una vez y funciona solo.`; } },
  { id: "smart-crm", title: "Seguimiento comercial automático", taskAffinity: ["Leads", "Emails", "Agenda"], priorityAffinity: ["Más ventas", "Acelerar procesos"], sectorBoost: ["Servicios", "Inmobiliaria", "Agencia", "Ecommerce", "SaaS"], needs24h: false, setupTime: "2–4 semanas", impact: "Alto", getDesc: () => "Que ningún cliente interesado se quede sin respuesta. Seguimiento y recordatorios automáticos." },
  { id: "auto-content", title: "Creación rápida de contenidos", taskAffinity: ["Contenido", "Emails"], priorityAffinity: ["Más ventas", "Acelerar procesos"], sectorBoost: ["Agencia", "Ecommerce", "SaaS"], needs24h: false, setupTime: "1 semana", impact: "Medio", getDesc: () => "Textos para web, emails y redes en minutos en vez de horas, con tu tono de marca." },
  { id: "live-dashboard", title: "Panel de control en tiempo real", taskAffinity: ["Informes", "Entrada datos"], priorityAffinity: ["Acelerar procesos", "Reducir costes"], sectorBoost: ["Ecommerce", "Agencia", "SaaS", "Logística"], needs24h: false, setupTime: "1–2 semanas", impact: "Medio", getDesc: () => "Ver cómo va tu negocio de un vistazo, siempre actualizado, sin preparar informes a mano." },
  { id: "smart-scheduling", title: "Reservas y agenda automática", taskAffinity: ["Agenda", "Leads"], priorityAffinity: ["Acelerar procesos", "Más ventas"], sectorBoost: ["Servicios", "Salud", "Inmobiliaria", "Agencia"], needs24h: false, setupTime: "3–5 días", impact: "Medio", getDesc: () => "Tus clientes reservan cita solos desde la web. Recordatorios automáticos incluidos." },
  { id: "auto-billing", title: "Facturación en piloto automático", taskAffinity: ["Facturación", "Informes", "Entrada datos"], priorityAffinity: ["Reducir costes", "Acelerar procesos"], sectorBoost: ["Servicios", "Agencia", "Ecommerce", "Logística"], needs24h: false, setupTime: "2–3 semanas", impact: "Alto", getDesc: () => "Facturas, cobros y recordatorios de pago generados y enviados sin intervención manual." },
  { id: "smart-email", title: "Comunicación personalizada a escala", taskAffinity: ["Emails", "Leads", "Contenido"], priorityAffinity: ["Más ventas", "Reducir costes"], sectorBoost: ["Ecommerce", "Servicios", "Inmobiliaria", "Salud"], needs24h: false, setupTime: "1–2 semanas", impact: "Medio–Alto", getDesc: () => "El mensaje justo a cada cliente en el momento adecuado, de forma automática." },
  { id: "support-triage", title: "Clasificación inteligente de consultas", taskAffinity: ["Atención cliente", "Emails", "Informes"], priorityAffinity: ["Mejor soporte", "Reducir costes"], sectorBoost: ["Salud", "Logística", "Servicios", "Ecommerce"], needs24h: true, setupTime: "1–2 semanas", impact: "Alto", getDesc: () => "Cada consulta se clasifica y dirige al responsable correcto sin intervención manual." },
];

function selectTopIdeas(ctx: IdeaCtx): TechIdea[] {
  const scored = TECH_IDEAS.map((idea) => {
    let score = 0;
    const taskMatches = idea.taskAffinity.filter((t) => ctx.tasks.includes(t)).length;
    score += taskMatches * 25;
    if (idea.priorityAffinity.includes(ctx.priority)) score += 20;
    if (idea.sectorBoost.includes(ctx.sector)) score += 15;
    if (idea.needs24h && ctx.h24) score += 12;
    if (taskMatches >= 3) score += 8;
    return { idea, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const selected: TechIdea[] = [];
  const usedIds = new Set<string>();
  for (const { idea } of scored) {
    if (selected.length >= 3) break;
    if (!usedIds.has(idea.id)) { selected.push(idea); usedIds.add(idea.id); }
  }
  return selected;
}

export interface ReportEmailParams {
  name: string;
  email: string;
  sector: string;
  teamSize: string;
  revenue: string;
  usesAI: boolean | null;
  tasks: string[];
  hours: number;
  costH: number;
  leads: number;
  respTime: number;
  avgTicket: number;
  h24: boolean | null;
  priority: string;
  calc: {
    hrsSaved: number;
    monthlySav: number;
    addRev: number;
    newResp: number;
    respImprove: number;
    score: number;
    total: number;
    annual: number;
    avgTicket: number;
  };
}

export function buildReportEmailHtml(
  params: ReportEmailParams,
  helpers: { fmt: (n: number) => string; esc: (v: unknown) => string; calendlyUrl: () => string }
): string {
  const { name, sector, teamSize, revenue, usesAI, tasks, hours, costH, leads, respTime, avgTicket, h24, priority, calc } = params;
  const { fmt, esc, calendlyUrl } = helpers;

  const today = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  const sName = esc(name);
  const sSector = esc(sector);
  const sTeam = esc(teamSize);
  const sRevenue = esc(revenue);
  const sPriority = esc(priority);
  const sResp = esc(respTime);
  const sNewResp = esc(calc.newResp);

  const sectorEff: Record<string, number> = { SaaS: 1.15, Ecommerce: 1.10, Logística: 1.08, Agencia: 1.05, Servicios: 1.00, Inmobiliaria: 0.95, Salud: 0.92, Otros: 1.00 };
  const teamOverhead: Record<string, number> = { "1 – 5": 1.00, "6 – 20": 1.08, "21 – 50": 1.15, "50 +": 1.22 };
  const eff = sectorEff[sector] ?? 1.0;
  const aiDisc = usesAI ? 0.70 : 1.0;
  const overhead = teamOverhead[teamSize] ?? 1.0;
  const hoursPerTask = tasks.length > 0 ? hours / tasks.length : 0;
  const taskBreakdown = tasks.map((t) => {
    const baseSav = TASK_SAVINGS[t]?.savings ?? 0.6;
    const adjusted = Math.min(baseSav * eff * aiDisc, 0.95);
    const hSaved = Math.round(hoursPerTask * 4.33 * adjusted);
    const eurSaved = Math.round(hSaved * costH * overhead);
    return { label: t, savings: adjusted, hSaved, eurSaved, desc: TASK_SAVINGS[t]?.desc ?? "" };
  });

  const firstTaskLabel = taskBreakdown[0]?.label ?? "las tareas más repetitivas";
  const firstTaskPct = taskBreakdown[0] != null ? Math.round(taskBreakdown[0].savings * 100) : 60;
  const ticketStr = avgTicket >= 1000 ? Math.round(avgTicket / 1000) + "K" : fmt(avgTicket);
  const priorityRec: Record<string, string> = {
    "Reducir costes": `Con un ahorro potencial de €${fmt(calc.monthlySav)}/mes, recomendamos empezar automatizando ${firstTaskLabel} (${firstTaskPct}% automatizable). En 6 semanas tendrás ROI positivo.`,
    "Más ventas": `Tu pipeline de ${leads.toLocaleString()} leads/mes con ticket medio de €${ticketStr} tiene un potencial de €${fmt(calc.addRev)} adicionales/mes. ${h24 ? "Con atención 24/7," : "Activando atención 24/7,"} el conversion rate sube significativamente.`,
    "Mejor soporte": `Reducir tu tiempo de respuesta de ${respTime}min a ${calc.newResp}min (–${calc.respImprove}%) impactará directamente en retención. ${h24 ? "Ya cubrís 24/7, ideal para chatbots AI." : "Recomendamos activar soporte 24/7 con chatbots AI."}`,
    "Acelerar procesos": `Con ${hours}h/semana en tareas repetitivas y un equipo de ${teamSize}, la automatización liberará ${calc.hrsSaved}h/mes que tu equipo puede dedicar a trabajo de alto valor.`,
  };
  const priorityRecText = esc(priorityRec[priority] ?? priorityRec["Reducir costes"]);

  const sectorAdoption = SECTOR_AI_ADOPTION[sector] ?? 40;
  const sectorAvgResp = SECTOR_AVG_RESPONSE[sector] ?? 40;
  const scoreLevel = calc.score >= 75 ? { label: "Muy alto", insight: "Tu negocio tiene un potencial de transformación excepcional." } : calc.score >= 55 ? { label: "Alto", insight: "Estás en una posición excelente para obtener ROI rápido con automatización AI." } : calc.score >= 35 ? { label: "Moderado", insight: "Hay oportunidades claras de mejora. Empieza con las tareas de mayor impacto." } : { label: "Inicial", insight: "Empezar con AI ahora te dará ventaja competitiva." };

  const revValue = revenue === "< 100 K €" ? 80000 : revenue === "100 K – 500 K €" ? 300000 : revenue === "500 K – 2 M €" ? 1200000 : revenue === "2 M – 10 M €" ? 5000000 : 15000000;
  const annualImpactPct = ((calc.annual / revValue) * 100).toFixed(1);

  const recCtx: IdeaCtx = { sector, teamSize, tasks, priority, hours, costH, leads, respTime, h24, usesAI, hrsSaved: calc.hrsSaved, monthlySav: calc.monthlySav, addRev: calc.addRev, newResp: calc.newResp };
  const topIdeas = selectTopIdeas(recCtx);

  const sectorEffPct = Math.round((sectorEff[sector] ?? 1) * 100);
  const overheadPct = Math.round(((teamOverhead[teamSize] ?? 1) - 1) * 100);
  const factorsText = esc(`Factores: eficiencia AI en ${sector} (${sectorEffPct}%), ${usesAI ? "descuento por IA existente (–30%)" : "sin IA previa (100% potencial)"}, overhead coordinación equipo ${teamSize} (${overheadPct}% extra).`);

  const tasksList = taskBreakdown.map((t) => `<tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;"><strong>${esc(t.label)}</strong><br><span style="font-size:12px;color:#0B0B0B99;">${esc(t.desc)} · ${Math.round(t.savings * 100)}% automatizable</span></td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${t.hSaved}h · €${fmt(t.eurSaved)}</td></tr>`).join("");

  const ideasHtml = topIdeas.map((idea, i) => {
    const desc = idea.getDesc(recCtx);
    return `<div style="margin-bottom:16px;padding:16px;border:1px solid #f0f0f0;border-radius:12px;background:#fff;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#0B0B0B;">${esc(idea.title)} <span style="font-size:11px;color:#0B0B0B33;">#${i + 1}</span></p>
        <p style="margin:0 0 10px;font-size:12px;color:#0B0B0B99;line-height:1.5;">${esc(desc)}</p>
        <span style="display:inline-block;margin-right:8px;padding:4px 10px;border-radius:999px;background:#f5f5f5;font-size:11px;color:#0B0B0B99;">⏱ ${idea.setupTime}</span>
        <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:#f5f5f5;font-size:11px;color:#0B0B0B99;">Impacto ${idea.impact.toLowerCase()}</span>
      </div>`;
  }).join("");

  const timelineTaskNames = taskBreakdown.length >= 2 ? taskBreakdown.slice(0, 2).map(t => t.label).join(" y ") : taskBreakdown[0]?.label ?? "procesos clave";
  const timelinePhases = [
    { week: "Sem 1–2", title: "Auditoría y setup", desc: `Análisis profundo de tus ${tasks.length} procesos clave y diseño de la arquitectura AI.` },
    { week: "Sem 3–4", title: "Implementación", desc: `Despliegue de automatizaciones para ${timelineTaskNames}${taskBreakdown.length > 2 ? ` (+${taskBreakdown.length - 2} más)` : ""}.` },
    { week: "Sem 5–6", title: "Optimización y ROI", desc: `Fine-tuning y medición. Objetivo: ${calc.hrsSaved}h liberadas y €${fmt(calc.total)} de impacto/mes.` },
  ];

  const profileRows = [
    { label: "Sector", value: sSector },
    { label: "Equipo", value: `${sTeam} personas` },
    { label: "Facturación", value: sRevenue },
    { label: "Ticket medio", value: `€${avgTicket >= 1000 ? Math.round(avgTicket / 1000) + "K" : fmt(avgTicket)}` },
    { label: "Usa AI", value: usesAI ? "Sí, actualmente" : "Aún no" },
    { label: "Soporte 24/7", value: h24 ? "Sí, necesario" : "Horario estándar" },
    { label: "Prioridad", value: sPriority },
  ].map((r) => `<div style="padding:12px;border-radius:8px;background:#FAFAFA;margin-bottom:8px;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">${r.label}</p><p style="margin:0;font-size:13px;font-weight:500;color:#0B0B0B;">${r.value}</p></div>`).join("");

  const benchmarkText = usesAI ? `Ya formas parte del ${sectorAdoption}% que usa AI. El siguiente paso es escalar.` : `El ${sectorAdoption}% de empresas en ${sector} ya usa AI. Es momento de actuar.`;
  const respCompare = respTime > sectorAvgResp ? `Estás ${respTime - sectorAvgResp}min por encima. Con AI llegarás a ${calc.newResp}min.` : `Estás ${sectorAvgResp - respTime}min por debajo de la media. Con AI serás referente.`;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:24px 20px;">
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 12px 60px rgba(11,11,11,0.08);border:1px solid #E8E8E8;">
    <div style="padding:24px 28px;border-bottom:1px solid #f0f0f0;background:#FAFAFA;">
      <p style="margin:0 0 8px;font-size:10px;color:#0B0B0B66;letter-spacing:0.15em;">THE AI BUSINESS</p>
      <p style="margin:0;font-size:11px;color:#0B0B0B44;">${today}</p>
    </div>
    <div style="padding:28px 28px 32px;">
      <div style="text-align:center;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-size:10px;color:#0B0B0B66;letter-spacing:0.2em;">INFORME DE POTENCIAL AI</p>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0B0B0B;">Informe de Potencial AI</h1>
        <p style="margin:0;font-size:14px;color:#0B0B0B99;">Preparado para <strong>${sName || "tu negocio"}</strong> · ${today}</p>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">PERFIL DE EMPRESA</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;">${profileRows}</div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">AI SCORE</p></div>
      <div style="text-align:center;padding:20px 0;">
        <p style="margin:0 0 8px;font-size:48px;font-weight:700;color:#0B0B0B;">${esc(calc.score)}</p>
        <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0B0B0B;">Potencial ${scoreLevel.label}</p>
        <p style="margin:0;font-size:12px;color:#0B0B0B99;line-height:1.55;max-width:360px;margin:0 auto;">${esc(scoreLevel.insight)}</p>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">IMPACTO FINANCIERO</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="text-align:center;padding:20px;background:#FAFAFA;border-radius:12px;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">Ahorro operativo / mes</p><p style="margin:0;font-size:22px;font-weight:700;color:#0B0B0B;">€${calc.monthlySav >= 1000 ? Math.round(calc.monthlySav / 1000) + "K" : fmt(calc.monthlySav)}</p></div>
        <div style="text-align:center;padding:20px;background:#FAFAFA;border-radius:12px;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">Ingreso adicional / mes</p><p style="margin:0;font-size:22px;font-weight:700;color:#0B0B0B;">€${calc.addRev >= 1000 ? Math.round(calc.addRev / 1000) + "K" : fmt(calc.addRev)}</p></div>
      </div>
      <div style="padding:20px;border:1px solid #f0f0f0;border-radius:12px;background:#FAFAFA;margin-bottom:20px;">
        <p style="margin:0 0 12px;font-size:10px;color:#0B0B0B66;letter-spacing:0.12em;">DESGLOSE DEL CÁLCULO</p>
        <p style="margin:0 0 8px;font-size:12px;color:#0B0B0B99;">${calc.hrsSaved}h liberadas × ${costH}€/h × overhead equipo <strong style="float:right;color:#0B0B0B;">€ ${fmt(calc.monthlySav)}</strong></p>
        <p style="margin:0 0 8px;font-size:12px;color:#0B0B0B99;">${fmt(leads)} leads × conv. boost × €${ticketStr} ticket <strong style="float:right;color:#0B0B0B;">€ ${fmt(calc.addRev)}</strong></p>
        <hr style="border:none;border-top:1px solid #E8E8E8;margin:12px 0;">
        <p style="margin:0;font-size:13px;font-weight:600;">Impacto total mensual <strong style="float:right;font-size:14px;">€ ${fmt(calc.total)}</strong></p>
        <p style="margin:12px 0 0;font-size:10px;color:#0B0B0B66;line-height:1.5;">${factorsText}</p>
      </div>
      <div style="padding:24px;background:#0B0B0B;border-radius:12px;text-align:center;margin-bottom:28px;">
        <p style="margin:0 0 4px;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:0.15em;">IMPACTO TOTAL ESTIMADO</p>
        <p style="margin:0;font-size:28px;font-weight:700;color:#fff;">€ ${fmt(calc.total)} <span style="font-size:14px;color:rgba(255,255,255,0.5)">/mes</span></p>
        <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.4);">≈ € ${fmt(calc.annual)}/año · ${annualImpactPct}% de tu facturación</p>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">MÉTRICAS OPERATIVAS</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;">
        <div style="padding:16px;border:1px solid #f0f0f0;border-radius:12px;background:#fff;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B99;">Horas liberadas</p><p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0B0B0B;">${calc.hrsSaved}h / mes</p><p style="margin:0;font-size:11px;color:#0B0B0B99;line-height:1.5;">De ${hours}h/sem repetitivas, tu equipo recuperará ${calc.hrsSaved}h mensuales.</p></div>
        <div style="padding:16px;border:1px solid #f0f0f0;border-radius:12px;background:#fff;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B99;">Coste/hora ahorrado</p><p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0B0B0B;">€ ${fmt(calc.monthlySav)}</p><p style="margin:0;font-size:11px;color:#0B0B0B99;">${calc.hrsSaved}h × ${costH}€/h = ahorro mensual.</p></div>
        <div style="padding:16px;border:1px solid #f0f0f0;border-radius:12px;background:#fff;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B99;">Tiempo de respuesta</p><p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0B0B0B;">${sResp} → ${sNewResp} min</p><p style="margin:0;font-size:11px;color:#0B0B0B99;">Mejora del ${calc.respImprove}%. La media en ${sSector} es ${sectorAvgResp}min.</p></div>
        <div style="padding:16px;border:1px solid #f0f0f0;border-radius:12px;background:#fff;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B99;">Revenue adicional</p><p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0B0B0B;">€ ${fmt(calc.addRev)}/mes</p><p style="margin:0;font-size:11px;color:#0B0B0B99;">Sobre ${leads.toLocaleString()} leads con ticket €${ticketStr}.</p></div>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">BENCHMARK SECTORIAL</p></div>
      <div style="padding:20px;border:1px solid #f0f0f0;border-radius:12px;background:#FAFAFA;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-size:12px;color:#0B0B0B99;">${sSector}</p>
        <p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">Adopción AI en el sector</p>
        <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0B0B0B;">${sectorAdoption}% de empresas</p>
        <p style="margin:0 0 16px;font-size:12px;color:#0B0B0B99;line-height:1.5;">${esc(benchmarkText)}</p>
        <p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">Resp. media del sector</p>
        <p style="margin:0;font-size:20px;font-weight:700;color:#0B0B0B;">${sectorAvgResp} min</p>
        <p style="margin:4px 0 0;font-size:12px;color:#0B0B0B99;">${esc(respCompare)}</p>
      </div>

      ${tasks.length > 0 ? `<div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">AUTOMATIZACIÓN POR TAREA</p></div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:28px;">${tasksList}</table>` : ""}

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">RECOMENDACIÓN PERSONALIZADA</p></div>
      <div style="padding:20px;border:2px solid rgba(11,11,11,0.08);border-radius:12px;background:#FAFAFA;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0B0B0B;">Basado en tu prioridad: ${sPriority}</p>
        <p style="margin:0;font-size:12px;color:#0B0B0B99;line-height:1.65;">${priorityRecText}</p>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">QUICK WINS — SOLUCIONES INMEDIATAS</p></div>
      <p style="margin:-8px 0 16px;font-size:12px;color:#0B0B0B99;">3 ideas seleccionadas para tu perfil (${sSector} · ${sTeam} · ${sPriority.toLowerCase()}).</p>
      ${ideasHtml}
      <div style="margin-top:20px;padding:20px;background:#0B0B0B;color:#fff;border-radius:12px;">
        <p style="margin:0 0 8px;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:0.12em;">STACK COMBINADO — IMPACTO ESTIMADO</p>
        <p style="margin:0;font-size:13px;line-height:1.5;">Poniendo en marcha las 3 ideas, tu equipo de ${sTeam} puede alcanzar <strong>€${fmt(calc.monthlySav)}/mes</strong> ahorro y <strong>€${fmt(calc.addRev)}/mes</strong> adicionales en 4–6 semanas.</p>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:28px 0 12px;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">TIMELINE SUGERIDO</p></div>
      ${timelinePhases.map((p) => `<div style="margin-bottom:16px;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">${p.week}</p><p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0B0B0B;">${p.title}</p><p style="margin:0;font-size:12px;color:#0B0B0B99;line-height:1.5;">${esc(p.desc)}</p></div>`).join("")}

      <div style="text-align:center;margin-top:32px;padding-top:24px;">
        <a href="${calendlyUrl()}" style="display:inline-block;padding:14px 28px;background:#0B0B0B;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:500;">Reservar sesión estratégica gratuita →</a>
        <p style="margin:12px 0 0;font-size:11px;color:#0B0B0B66;">Sesión de 30 min · Sin compromiso</p>
      </div>

      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f0f0f0;text-align:center;">
        <p style="margin:0;font-size:10px;color:#0B0B0B44;line-height:1.6;">The AI Business<br>* Estimaciones basadas en benchmarks del sector. Los resultados pueden variar.</p>
      </div>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#0B0B0B44;margin-top:20px;">© ${new Date().getFullYear()} The AI Business</p>
</div></body></html>`;
}
