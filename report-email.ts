/**
 * Genera el HTML completo del informe por email (mismo contenido que la web).
 * Soporta idiomas: es (español) y en (inglés).
 */

type Lang = "es" | "en";
type Translations = Record<string, string>;

const i18n: Record<Lang, Translations> = {
  es: {
    reportHeader: "INFORME DE POTENCIAL AI",
    reportTitle: "Informe de Potencial AI",
    preparedFor: "Preparado para",
    yourBusiness: "tu negocio",
    profileSection: "PERFIL DE EMPRESA",
    sector: "Sector",
    team: "Equipo",
    people: "personas",
    billing: "Facturación",
    avgTicket: "Ticket medio",
    usesAI: "Usa AI",
    aiYes: "Sí, actualmente",
    aiNo: "Aún no",
    support247: "Soporte 24/7",
    supportYes: "Sí, necesario",
    supportNo: "Horario estándar",
    priority: "Prioridad",
    aiScoreSection: "AI SCORE",
    potential: "Potencial",
    financialSection: "IMPACTO FINANCIERO",
    opSavingsMonth: "Ahorro operativo / mes",
    addRevMonth: "Ingreso adicional / mes",
    breakdownSection: "DESGLOSE DEL CÁLCULO",
    hoursFreed: "h liberadas",
    teamOverhead: "overhead equipo",
    leadsConv: "leads × conv. boost",
    ticket: "ticket",
    totalMonthly: "Impacto total mensual",
    factors: "Factores",
    aiEfficiency: "eficiencia AI en",
    aiDiscountExisting: "descuento por IA existente (–30%)",
    aiFullPotential: "sin IA previa (100% potencial)",
    coordOverhead: "overhead coordinación equipo",
    extra: "extra",
    totalEstimated: "IMPACTO TOTAL ESTIMADO",
    perMonth: "/mes",
    perYear: "/año",
    ofRevenue: "de tu facturación",
    metricsSection: "MÉTRICAS OPERATIVAS",
    hoursFreedLabel: "Horas liberadas",
    hoursPerMonth: "/ mes",
    fromWeekly: "De",
    weeklyRepetitive: "h/sem repetitivas, tu equipo recuperará",
    monthlyHours: "h mensuales.",
    costSaved: "Coste/hora ahorrado",
    costCalc: "= ahorro mensual.",
    responseTime: "Tiempo de respuesta",
    improvement: "Mejora del",
    sectorAvg: "La media en",
    is: "es",
    additionalRev: "Revenue adicional",
    onLeads: "Sobre",
    leadsWithTicket: "leads con ticket",
    benchmarkSection: "BENCHMARK SECTORIAL",
    aiAdoption: "Adopción AI en el sector",
    ofCompanies: "de empresas",
    adoptionYes: "Ya formas parte del {pct}% que usa AI. El siguiente paso es escalar.",
    adoptionNo: "El {pct}% de empresas en {sector} ya usa AI. Es momento de actuar.",
    sectorResponse: "Resp. media del sector",
    aboveAvg: "Estás {diff}min por encima. Con AI llegarás a {newResp}min.",
    belowAvg: "Estás {diff}min por debajo de la media. Con AI serás referente.",
    taskSection: "AUTOMATIZACIÓN POR TAREA",
    automatable: "automatizable",
    recSection: "RECOMENDACIÓN PERSONALIZADA",
    basedOnPriority: "Basado en tu prioridad:",
    quickWinsSection: "QUICK WINS — SOLUCIONES INMEDIATAS",
    quickWinsSub: "3 ideas seleccionadas para tu perfil",
    impact: "Impacto",
    stackSection: "STACK COMBINADO — IMPACTO ESTIMADO",
    stackDesc: "Poniendo en marcha las 3 ideas, tu equipo de {team} puede alcanzar <strong>€{savings}/mes</strong> ahorro y <strong>€{rev}/mes</strong> adicionales en 4–6 semanas.",
    timelineSection: "TIMELINE SUGERIDO",
    tw12: "Sem 1–2",
    tw12Title: "Auditoría y setup",
    tw12Desc: "Análisis profundo de tus {count} procesos clave y diseño de la arquitectura AI.",
    tw34: "Sem 3–4",
    tw34Title: "Implementación",
    tw34Desc: "Despliegue de automatizaciones para {tasks}{extra}.",
    tw34Extra: " (+{count} más)",
    tw56: "Sem 5–6",
    tw56Title: "Optimización y ROI",
    tw56Desc: "Fine-tuning y medición. Objetivo: {hours}h liberadas y €{total} de impacto/mes.",
    ctaBtn: "Reservar sesión estratégica gratuita →",
    ctaSub: "Sesión de 30 min · Sin compromiso",
    footer: "* Estimaciones basadas en benchmarks del sector. Los resultados pueden variar.",
    recReduceCosts: "Con un ahorro potencial de €{savings}/mes, recomendamos empezar automatizando {task} ({pct}% automatizable). En 6 semanas tendrás ROI positivo.",
    recMoreSales: "Tu pipeline de {leads} leads/mes con ticket medio de €{ticket} tiene un potencial de €{rev} adicionales/mes. {h24Note} el conversion rate sube significativamente.",
    recMoreSalesH24Yes: "Con atención 24/7,",
    recMoreSalesH24No: "Activando atención 24/7,",
    recBetterSupport: "Reducir tu tiempo de respuesta de {from}min a {to}min (–{improve}%) impactará directamente en retención. {h24Note}",
    recBetterSupportH24Yes: "Ya cubrís 24/7, ideal para chatbots AI.",
    recBetterSupportH24No: "Recomendamos activar soporte 24/7 con chatbots AI.",
    recAccelerate: "Con {hours}h/semana en tareas repetitivas y un equipo de {team}, la automatización liberará {saved}h/mes que tu equipo puede dedicar a trabajo de alto valor.",
    emailSubject: "{name}tu informe AI — € {total}/mes",
    emailSubjectComma: ", ",
    defaultTasks: "las tareas más repetitivas",
    scoreVeryHigh: "Muy alto",
    scoreVeryHighInsight: "Tu negocio tiene un potencial de transformación excepcional.",
    scoreHigh: "Alto",
    scoreHighInsight: "Estás en una posición excelente para obtener ROI rápido con automatización AI.",
    scoreModerate: "Moderado",
    scoreModerateInsight: "Hay oportunidades claras de mejora. Empieza con las tareas de mayor impacto.",
    scoreInitial: "Inicial",
    scoreInitialInsight: "Empezar con AI ahora te dará ventaja competitiva.",
    ideaVirtualAssistant: "Asistente virtual para clientes",
    ideaVirtualAssistantDesc: "Respuestas automáticas a las dudas más frecuentes de tus clientes, 24/7.",
    ideaAutoWorkflows: "Automatizar tareas repetitivas",
    ideaAutoWorkflowsDesc: "Dejar de {tasks} a mano — se configura una vez y funciona solo.",
    ideaAutoWorkflowsFallback: "repetir tareas",
    ideaSmartCrm: "Seguimiento comercial automático",
    ideaSmartCrmDesc: "Que ningún cliente interesado se quede sin respuesta. Seguimiento y recordatorios automáticos.",
    ideaAutoContent: "Creación rápida de contenidos",
    ideaAutoContentDesc: "Textos para web, emails y redes en minutos en vez de horas, con tu tono de marca.",
    ideaLiveDashboard: "Panel de control en tiempo real",
    ideaLiveDashboardDesc: "Ver cómo va tu negocio de un vistazo, siempre actualizado, sin preparar informes a mano.",
    ideaSmartScheduling: "Reservas y agenda automática",
    ideaSmartSchedulingDesc: "Tus clientes reservan cita solos desde la web. Recordatorios automáticos incluidos.",
    ideaAutoBilling: "Facturación en piloto automático",
    ideaAutoBillingDesc: "Facturas, cobros y recordatorios de pago generados y enviados sin intervención manual.",
    ideaSmartEmail: "Comunicación personalizada a escala",
    ideaSmartEmailDesc: "El mensaje justo a cada cliente en el momento adecuado, de forma automática.",
    ideaSupportTriage: "Clasificación inteligente de consultas",
    ideaSupportTriageDesc: "Cada consulta se clasifica y dirige al responsable correcto sin intervención manual.",
    taskMapEntradaDatos: "pasar datos",
    taskMapEmails: "enviar emails",
    taskMapFacturacion: "facturar",
    taskMapInformes: "hacer informes",
    taskMapAgenda: "coordinar agenda",
    and: "y",
    taskDescAtencionCliente: "Chatbots AI + routing inteligente",
    taskDescEmails: "Redacción y respuesta automatizada",
    taskDescEntradaDatos: "OCR + extracción automática",
    taskDescInformes: "Generación y distribución auto.",
    taskDescLeads: "Scoring y nurturing con AI",
    taskDescAgenda: "Scheduling inteligente",
    taskDescFacturacion: "Procesamiento automático",
    taskDescContenido: "Generación asistida por AI",
  },
  en: {
    reportHeader: "AI POTENTIAL REPORT",
    reportTitle: "AI Potential Report",
    preparedFor: "Prepared for",
    yourBusiness: "your business",
    profileSection: "COMPANY PROFILE",
    sector: "Sector",
    team: "Team",
    people: "people",
    billing: "Revenue",
    avgTicket: "Avg. ticket",
    usesAI: "Uses AI",
    aiYes: "Yes, currently",
    aiNo: "Not yet",
    support247: "24/7 Support",
    supportYes: "Yes, required",
    supportNo: "Standard hours",
    priority: "Priority",
    aiScoreSection: "AI SCORE",
    potential: "Potential",
    financialSection: "FINANCIAL IMPACT",
    opSavingsMonth: "Operational savings / month",
    addRevMonth: "Additional revenue / month",
    breakdownSection: "CALCULATION BREAKDOWN",
    hoursFreed: "h freed",
    teamOverhead: "team overhead",
    leadsConv: "leads × conv. boost",
    ticket: "ticket",
    totalMonthly: "Total monthly impact",
    factors: "Factors",
    aiEfficiency: "AI efficiency in",
    aiDiscountExisting: "discount for existing AI (–30%)",
    aiFullPotential: "no prior AI (100% potential)",
    coordOverhead: "team coordination overhead",
    extra: "extra",
    totalEstimated: "TOTAL ESTIMATED IMPACT",
    perMonth: "/mo",
    perYear: "/yr",
    ofRevenue: "of your revenue",
    metricsSection: "OPERATIONAL METRICS",
    hoursFreedLabel: "Hours freed",
    hoursPerMonth: "/ month",
    fromWeekly: "From",
    weeklyRepetitive: "h/wk repetitive, your team recovers",
    monthlyHours: "h monthly.",
    costSaved: "Cost/hour saved",
    costCalc: "= monthly savings.",
    responseTime: "Response time",
    improvement: "Improvement of",
    sectorAvg: "Average in",
    is: "is",
    additionalRev: "Additional revenue",
    onLeads: "From",
    leadsWithTicket: "leads with ticket",
    benchmarkSection: "SECTOR BENCHMARK",
    aiAdoption: "AI adoption in sector",
    ofCompanies: "of companies",
    adoptionYes: "You're already part of the {pct}% using AI. Next step: scale.",
    adoptionNo: "{pct}% of companies in {sector} already use AI. Time to act.",
    sectorResponse: "Sector avg. response",
    aboveAvg: "You're {diff}min above average. With AI you'll reach {newResp}min.",
    belowAvg: "You're {diff}min below average. With AI you'll be a reference.",
    taskSection: "AUTOMATION BY TASK",
    automatable: "automatable",
    recSection: "PERSONALIZED RECOMMENDATION",
    basedOnPriority: "Based on your priority:",
    quickWinsSection: "QUICK WINS — IMMEDIATE SOLUTIONS",
    quickWinsSub: "3 ideas selected for your profile",
    impact: "Impact",
    stackSection: "COMBINED STACK — ESTIMATED IMPACT",
    stackDesc: "By implementing all 3 ideas, your team of {team} can achieve <strong>€{savings}/mo</strong> savings and <strong>€{rev}/mo</strong> additional revenue in 4–6 weeks.",
    timelineSection: "SUGGESTED TIMELINE",
    tw12: "Wk 1–2",
    tw12Title: "Audit & setup",
    tw12Desc: "Deep analysis of your {count} key processes and AI architecture design.",
    tw34: "Wk 3–4",
    tw34Title: "Implementation",
    tw34Desc: "Deployment of automations for {tasks}{extra}.",
    tw34Extra: " (+{count} more)",
    tw56: "Wk 5–6",
    tw56Title: "Optimization & ROI",
    tw56Desc: "Fine-tuning and measurement. Target: {hours}h freed and €{total} impact/mo.",
    ctaBtn: "Book a free strategy session →",
    ctaSub: "30 min session · No commitment",
    footer: "* Estimates based on sector benchmarks. Actual results may vary.",
    recReduceCosts: "With a potential saving of €{savings}/mo, we recommend starting by automating {task} ({pct}% automatable). You'll see positive ROI in 6 weeks.",
    recMoreSales: "Your pipeline of {leads} leads/mo with avg. ticket of €{ticket} has a potential of €{rev} additional/mo. {h24Note} the conversion rate increases significantly.",
    recMoreSalesH24Yes: "With 24/7 support,",
    recMoreSalesH24No: "By enabling 24/7 support,",
    recBetterSupport: "Reducing response time from {from}min to {to}min (–{improve}%) will directly impact retention. {h24Note}",
    recBetterSupportH24Yes: "You already cover 24/7, ideal for AI chatbots.",
    recBetterSupportH24No: "We recommend enabling 24/7 support with AI chatbots.",
    recAccelerate: "With {hours}h/week on repetitive tasks and a team of {team}, automation will free {saved}h/mo your team can dedicate to high-value work.",
    emailSubject: "{name}your AI report — € {total}/mo",
    emailSubjectComma: ", ",
    defaultTasks: "the most repetitive tasks",
    scoreVeryHigh: "Very high",
    scoreVeryHighInsight: "Your business has exceptional transformation potential.",
    scoreHigh: "High",
    scoreHighInsight: "You're in an excellent position to get fast ROI with AI automation.",
    scoreModerate: "Moderate",
    scoreModerateInsight: "There are clear improvement opportunities. Start with the highest-impact tasks.",
    scoreInitial: "Initial",
    scoreInitialInsight: "Starting with AI now will give you a competitive edge.",
    ideaVirtualAssistant: "Virtual assistant for customers",
    ideaVirtualAssistantDesc: "Automatic answers to your customers' most common questions, 24/7.",
    ideaAutoWorkflows: "Automate repetitive tasks",
    ideaAutoWorkflowsDesc: "Stop doing {tasks} manually — set it up once and it runs itself.",
    ideaAutoWorkflowsFallback: "repeating tasks",
    ideaSmartCrm: "Automatic sales follow-up",
    ideaSmartCrmDesc: "No interested customer goes unanswered. Automatic follow-ups and reminders.",
    ideaAutoContent: "Fast content creation",
    ideaAutoContentDesc: "Web, email and social media copy in minutes instead of hours, in your brand tone.",
    ideaLiveDashboard: "Real-time dashboard",
    ideaLiveDashboardDesc: "See how your business is doing at a glance, always up to date, no manual reports.",
    ideaSmartScheduling: "Automatic booking & scheduling",
    ideaSmartSchedulingDesc: "Your clients book appointments on their own from your website. Auto reminders included.",
    ideaAutoBilling: "Billing on autopilot",
    ideaAutoBillingDesc: "Invoices, payments and reminders generated and sent without manual intervention.",
    ideaSmartEmail: "Personalized communication at scale",
    ideaSmartEmailDesc: "The right message to each customer at the right time, automatically.",
    ideaSupportTriage: "Smart query classification",
    ideaSupportTriageDesc: "Each query is classified and routed to the right person without manual intervention.",
    taskMapEntradaDatos: "entering data",
    taskMapEmails: "sending emails",
    taskMapFacturacion: "invoicing",
    taskMapInformes: "making reports",
    taskMapAgenda: "scheduling",
    and: "and",
    taskDescAtencionCliente: "AI chatbots + smart routing",
    taskDescEmails: "Automated drafting & responses",
    taskDescEntradaDatos: "OCR + automatic extraction",
    taskDescInformes: "Auto generation & distribution",
    taskDescLeads: "AI scoring & nurturing",
    taskDescAgenda: "Smart scheduling",
    taskDescFacturacion: "Automatic processing",
    taskDescContenido: "AI-assisted generation",
  },
};

function t(lang: Lang, key: string, replacements?: Record<string, string | number>): string {
  let val = i18n[lang][key] ?? i18n.es[key] ?? key;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      val = val.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return val;
}

const TASK_DESC_KEYS: Record<string, string> = {
  "Atención cliente": "taskDescAtencionCliente",
  Emails: "taskDescEmails",
  "Entrada datos": "taskDescEntradaDatos",
  Informes: "taskDescInformes",
  Leads: "taskDescLeads",
  Agenda: "taskDescAgenda",
  Facturación: "taskDescFacturacion",
  Contenido: "taskDescContenido",
};

const TASK_SAVINGS: Record<string, number> = {
  "Atención cliente": 0.7, Emails: 0.6, "Entrada datos": 0.85,
  Informes: 0.75, Leads: 0.65, Agenda: 0.8, Facturación: 0.7, Contenido: 0.5,
};

const SECTOR_AI_ADOPTION: Record<string, number> = { SaaS: 68, Agencia: 54, Ecommerce: 61, Salud: 38, Servicios: 42, Inmobiliaria: 29, Logística: 45, Otros: 40 };
const SECTOR_AVG_RESPONSE: Record<string, number> = { Ecommerce: 35, SaaS: 20, Agencia: 45, Servicios: 55, Salud: 30, Inmobiliaria: 75, Logística: 50, Otros: 40 };

const IDEA_KEYS: Record<string, { title: string; desc: string }> = {
  "virtual-assistant": { title: "ideaVirtualAssistant", desc: "ideaVirtualAssistantDesc" },
  "auto-workflows": { title: "ideaAutoWorkflows", desc: "ideaAutoWorkflowsDesc" },
  "smart-crm": { title: "ideaSmartCrm", desc: "ideaSmartCrmDesc" },
  "auto-content": { title: "ideaAutoContent", desc: "ideaAutoContentDesc" },
  "live-dashboard": { title: "ideaLiveDashboard", desc: "ideaLiveDashboardDesc" },
  "smart-scheduling": { title: "ideaSmartScheduling", desc: "ideaSmartSchedulingDesc" },
  "auto-billing": { title: "ideaAutoBilling", desc: "ideaAutoBillingDesc" },
  "smart-email": { title: "ideaSmartEmail", desc: "ideaSmartEmailDesc" },
  "support-triage": { title: "ideaSupportTriage", desc: "ideaSupportTriageDesc" },
};

interface TechIdea {
  id: string;
  taskAffinity: string[];
  priorityAffinity: string[];
  sectorBoost: string[];
  needs24h: boolean;
  setupTime: Record<Lang, string>;
  impact: Record<Lang, string>;
}

interface IdeaCtx {
  sector: string; teamSize: string; tasks: string[]; priority: string;
  hours: number; costH: number; leads: number; respTime: number;
  h24: boolean | null; usesAI: boolean | null;
  hrsSaved: number; monthlySav: number; addRev: number; newResp: number;
}

const TASK_MAP_KEYS: Record<string, string> = {
  "Entrada datos": "taskMapEntradaDatos", Emails: "taskMapEmails",
  Facturación: "taskMapFacturacion", Informes: "taskMapInformes", Agenda: "taskMapAgenda",
};

const TECH_IDEAS: TechIdea[] = [
  { id: "virtual-assistant", taskAffinity: ["Atención cliente", "Leads"], priorityAffinity: ["Mejor soporte", "Más ventas"], sectorBoost: ["SaaS", "Ecommerce", "Servicios", "Salud", "Inmobiliaria"], needs24h: true, setupTime: { es: "1–2 semanas", en: "1–2 weeks" }, impact: { es: "Alto", en: "High" } },
  { id: "auto-workflows", taskAffinity: ["Entrada datos", "Emails", "Facturación", "Informes", "Agenda"], priorityAffinity: ["Acelerar procesos", "Reducir costes"], sectorBoost: ["Agencia", "Logística", "Servicios", "Ecommerce", "SaaS"], needs24h: false, setupTime: { es: "2–3 semanas", en: "2–3 weeks" }, impact: { es: "Alto", en: "High" } },
  { id: "smart-crm", taskAffinity: ["Leads", "Emails", "Agenda"], priorityAffinity: ["Más ventas", "Acelerar procesos"], sectorBoost: ["Servicios", "Inmobiliaria", "Agencia", "Ecommerce", "SaaS"], needs24h: false, setupTime: { es: "2–4 semanas", en: "2–4 weeks" }, impact: { es: "Alto", en: "High" } },
  { id: "auto-content", taskAffinity: ["Contenido", "Emails"], priorityAffinity: ["Más ventas", "Acelerar procesos"], sectorBoost: ["Agencia", "Ecommerce", "SaaS"], needs24h: false, setupTime: { es: "1 semana", en: "1 week" }, impact: { es: "Medio", en: "Medium" } },
  { id: "live-dashboard", taskAffinity: ["Informes", "Entrada datos"], priorityAffinity: ["Acelerar procesos", "Reducir costes"], sectorBoost: ["Ecommerce", "Agencia", "SaaS", "Logística"], needs24h: false, setupTime: { es: "1–2 semanas", en: "1–2 weeks" }, impact: { es: "Medio", en: "Medium" } },
  { id: "smart-scheduling", taskAffinity: ["Agenda", "Leads"], priorityAffinity: ["Acelerar procesos", "Más ventas"], sectorBoost: ["Servicios", "Salud", "Inmobiliaria", "Agencia"], needs24h: false, setupTime: { es: "3–5 días", en: "3–5 days" }, impact: { es: "Medio", en: "Medium" } },
  { id: "auto-billing", taskAffinity: ["Facturación", "Informes", "Entrada datos"], priorityAffinity: ["Reducir costes", "Acelerar procesos"], sectorBoost: ["Servicios", "Agencia", "Ecommerce", "Logística"], needs24h: false, setupTime: { es: "2–3 semanas", en: "2–3 weeks" }, impact: { es: "Alto", en: "High" } },
  { id: "smart-email", taskAffinity: ["Emails", "Leads", "Contenido"], priorityAffinity: ["Más ventas", "Reducir costes"], sectorBoost: ["Ecommerce", "Servicios", "Inmobiliaria", "Salud"], needs24h: false, setupTime: { es: "1–2 semanas", en: "1–2 weeks" }, impact: { es: "Medio–Alto", en: "Medium–High" } },
  { id: "support-triage", taskAffinity: ["Atención cliente", "Emails", "Informes"], priorityAffinity: ["Mejor soporte", "Reducir costes"], sectorBoost: ["Salud", "Logística", "Servicios", "Ecommerce"], needs24h: true, setupTime: { es: "1–2 semanas", en: "1–2 weeks" }, impact: { es: "Alto", en: "High" } },
];

function selectTopIdeas(ctx: IdeaCtx): TechIdea[] {
  const scored = TECH_IDEAS.map((idea) => {
    let score = 0;
    const taskMatches = idea.taskAffinity.filter((tk) => ctx.tasks.includes(tk)).length;
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
  name: string; email: string; sector: string; teamSize: string; revenue: string;
  usesAI: boolean | null; tasks: string[]; hours: number; costH: number;
  leads: number; respTime: number; avgTicket: number; h24: boolean | null;
  priority: string;
  calc: { hrsSaved: number; monthlySav: number; addRev: number; newResp: number; respImprove: number; score: number; total: number; annual: number; avgTicket: number; };
}

export function buildReportEmailHtml(
  params: ReportEmailParams,
  helpers: { fmt: (n: number) => string; esc: (v: unknown) => string; calendlyUrl: () => string },
  lang: Lang = "es"
): string {
  const { name, sector, teamSize, revenue, usesAI, tasks, hours, costH, leads, respTime, avgTicket, h24, priority, calc } = params;
  const { fmt, esc, calendlyUrl } = helpers;
  const T = (key: string, r?: Record<string, string | number>) => t(lang, key, r);

  const locale = lang === "en" ? "en-US" : "es-ES";
  const today = new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
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
  const taskBreakdown = tasks.map((tk) => {
    const baseSav = TASK_SAVINGS[tk] ?? 0.6;
    const adjusted = Math.min(baseSav * eff * aiDisc, 0.95);
    const hSaved = Math.round(hoursPerTask * 4.33 * adjusted);
    const eurSaved = Math.round(hSaved * costH * overhead);
    const descKey = TASK_DESC_KEYS[tk];
    return { label: tk, savings: adjusted, hSaved, eurSaved, desc: descKey ? T(descKey) : "" };
  });

  const firstTaskLabel = taskBreakdown[0]?.label ?? T("defaultTasks");
  const firstTaskPct = taskBreakdown[0] != null ? Math.round(taskBreakdown[0].savings * 100) : 60;
  const ticketStr = avgTicket >= 1000 ? Math.round(avgTicket / 1000) + "K" : fmt(avgTicket);

  const priorityRec: Record<string, string> = {
    "Reducir costes": T("recReduceCosts", { savings: fmt(calc.monthlySav), task: firstTaskLabel, pct: firstTaskPct }),
    "Más ventas": T("recMoreSales", { leads: leads.toLocaleString(locale), ticket: ticketStr, rev: fmt(calc.addRev), h24Note: h24 ? T("recMoreSalesH24Yes") : T("recMoreSalesH24No") }),
    "Mejor soporte": T("recBetterSupport", { from: respTime, to: calc.newResp, improve: calc.respImprove, h24Note: h24 ? T("recBetterSupportH24Yes") : T("recBetterSupportH24No") }),
    "Acelerar procesos": T("recAccelerate", { hours, team: teamSize, saved: calc.hrsSaved }),
  };
  const priorityRecText = esc(priorityRec[priority] ?? priorityRec["Reducir costes"]);

  const sectorAdoption = SECTOR_AI_ADOPTION[sector] ?? 40;
  const sectorAvgResp = SECTOR_AVG_RESPONSE[sector] ?? 40;
  const scoreLevel = calc.score >= 75
    ? { label: T("scoreVeryHigh"), insight: T("scoreVeryHighInsight") }
    : calc.score >= 55
    ? { label: T("scoreHigh"), insight: T("scoreHighInsight") }
    : calc.score >= 35
    ? { label: T("scoreModerate"), insight: T("scoreModerateInsight") }
    : { label: T("scoreInitial"), insight: T("scoreInitialInsight") };

  const revValue = revenue === "< 100 K €" ? 80000 : revenue === "100 K – 500 K €" ? 300000 : revenue === "500 K – 2 M €" ? 1200000 : revenue === "2 M – 10 M €" ? 5000000 : 15000000;
  const annualImpactPct = ((calc.annual / revValue) * 100).toFixed(1);

  const recCtx: IdeaCtx = { sector, teamSize, tasks, priority, hours, costH, leads, respTime, h24, usesAI, hrsSaved: calc.hrsSaved, monthlySav: calc.monthlySav, addRev: calc.addRev, newResp: calc.newResp };
  const topIdeas = selectTopIdeas(recCtx);

  const sectorEffPct = Math.round((sectorEff[sector] ?? 1) * 100);
  const overheadPct = Math.round(((teamOverhead[teamSize] ?? 1) - 1) * 100);
  const factorsText = esc(`${T("factors")}: ${T("aiEfficiency")} ${sector} (${sectorEffPct}%), ${usesAI ? T("aiDiscountExisting") : T("aiFullPotential")}, ${T("coordOverhead")} ${teamSize} (${overheadPct}% ${T("extra")}).`);

  const tasksList = taskBreakdown.map((tk) => `<tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;"><strong>${esc(tk.label)}</strong><br><span style="font-size:12px;color:#0B0B0B99;">${esc(tk.desc)} · ${Math.round(tk.savings * 100)}% ${T("automatable")}</span></td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${tk.hSaved}h · €${fmt(tk.eurSaved)}</td></tr>`).join("");

  const ideasHtml = topIdeas.map((idea, i) => {
    const ik = IDEA_KEYS[idea.id];
    let desc = T(ik.desc);
    if (idea.id === "auto-workflows") {
      const relevant = recCtx.tasks.filter(tk => TASK_MAP_KEYS[tk]).slice(0, 2).map(tk => T(TASK_MAP_KEYS[tk]));
      desc = relevant.length > 0
        ? T("ideaAutoWorkflowsDesc", { tasks: relevant.join(` ${T("and")} `) })
        : T("ideaAutoWorkflowsDesc", { tasks: T("ideaAutoWorkflowsFallback") });
    }
    return `<div style="margin-bottom:16px;padding:16px;border:1px solid #f0f0f0;border-radius:12px;background:#fff;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#0B0B0B;">${esc(T(ik.title))} <span style="font-size:11px;color:#0B0B0B33;">#${i + 1}</span></p>
        <p style="margin:0 0 10px;font-size:12px;color:#0B0B0B99;line-height:1.5;">${esc(desc)}</p>
        <span style="display:inline-block;margin-right:8px;padding:4px 10px;border-radius:999px;background:#f5f5f5;font-size:11px;color:#0B0B0B99;">⏱ ${idea.setupTime[lang]}</span>
        <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:#f5f5f5;font-size:11px;color:#0B0B0B99;">${T("impact")} ${idea.impact[lang].toLowerCase()}</span>
      </div>`;
  }).join("");

  const timelineTaskNames = taskBreakdown.length >= 2 ? taskBreakdown.slice(0, 2).map(tk => tk.label).join(` ${T("and")} `) : taskBreakdown[0]?.label ?? "";
  const timelinePhases = [
    { week: T("tw12"), title: T("tw12Title"), desc: T("tw12Desc", { count: tasks.length }) },
    { week: T("tw34"), title: T("tw34Title"), desc: T("tw34Desc", { tasks: timelineTaskNames, extra: taskBreakdown.length > 2 ? T("tw34Extra", { count: taskBreakdown.length - 2 }) : "" }) },
    { week: T("tw56"), title: T("tw56Title"), desc: T("tw56Desc", { hours: calc.hrsSaved, total: fmt(calc.total) }) },
  ];

  const benchmarkText = usesAI
    ? T("adoptionYes", { pct: sectorAdoption })
    : T("adoptionNo", { pct: sectorAdoption, sector });
  const respCompare = respTime > sectorAvgResp
    ? T("aboveAvg", { diff: respTime - sectorAvgResp, newResp: calc.newResp })
    : T("belowAvg", { diff: sectorAvgResp - respTime });

  const profileRows = [
    { label: T("sector"), value: sSector },
    { label: T("team"), value: `${sTeam} ${T("people")}` },
    { label: T("billing"), value: sRevenue },
    { label: T("avgTicket"), value: `€${avgTicket >= 1000 ? Math.round(avgTicket / 1000) + "K" : fmt(avgTicket)}` },
    { label: T("usesAI"), value: usesAI ? T("aiYes") : T("aiNo") },
    { label: T("support247"), value: h24 ? T("supportYes") : T("supportNo") },
    { label: T("priority"), value: sPriority },
  ].map((r) => `<div style="padding:12px;border-radius:8px;background:#FAFAFA;margin-bottom:8px;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">${r.label}</p><p style="margin:0;font-size:13px;font-weight:500;color:#0B0B0B;">${r.value}</p></div>`).join("");

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:24px 20px;">
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 12px 60px rgba(11,11,11,0.08);border:1px solid #E8E8E8;">
    <div style="padding:24px 28px;border-bottom:1px solid #f0f0f0;background:#FAFAFA;">
      <p style="margin:0 0 8px;font-size:10px;color:#0B0B0B66;letter-spacing:0.15em;">THE AI BUSINESS</p>
      <p style="margin:0;font-size:11px;color:#0B0B0B44;">${today}</p>
    </div>
    <div style="padding:28px 28px 32px;">
      <div style="text-align:center;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-size:10px;color:#0B0B0B66;letter-spacing:0.2em;">${T("reportHeader")}</p>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0B0B0B;">${T("reportTitle")}</h1>
        <p style="margin:0;font-size:14px;color:#0B0B0B99;">${T("preparedFor")} <strong>${sName || T("yourBusiness")}</strong> · ${today}</p>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">${T("profileSection")}</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;">${profileRows}</div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">${T("aiScoreSection")}</p></div>
      <div style="text-align:center;padding:20px 0;">
        <p style="margin:0 0 8px;font-size:48px;font-weight:700;color:#0B0B0B;">${esc(calc.score)}</p>
        <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0B0B0B;">${T("potential")} ${scoreLevel.label}</p>
        <p style="margin:0;font-size:12px;color:#0B0B0B99;line-height:1.55;max-width:360px;margin:0 auto;">${esc(scoreLevel.insight)}</p>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">${T("financialSection")}</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="text-align:center;padding:20px;background:#FAFAFA;border-radius:12px;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">${T("opSavingsMonth")}</p><p style="margin:0;font-size:22px;font-weight:700;color:#0B0B0B;">€${calc.monthlySav >= 1000 ? Math.round(calc.monthlySav / 1000) + "K" : fmt(calc.monthlySav)}</p></div>
        <div style="text-align:center;padding:20px;background:#FAFAFA;border-radius:12px;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">${T("addRevMonth")}</p><p style="margin:0;font-size:22px;font-weight:700;color:#0B0B0B;">€${calc.addRev >= 1000 ? Math.round(calc.addRev / 1000) + "K" : fmt(calc.addRev)}</p></div>
      </div>
      <div style="padding:20px;border:1px solid #f0f0f0;border-radius:12px;background:#FAFAFA;margin-bottom:20px;">
        <p style="margin:0 0 12px;font-size:10px;color:#0B0B0B66;letter-spacing:0.12em;">${T("breakdownSection")}</p>
        <p style="margin:0 0 8px;font-size:12px;color:#0B0B0B99;">${calc.hrsSaved}${T("hoursFreed")} × ${costH}€/h × ${T("teamOverhead")} <strong style="float:right;color:#0B0B0B;">€ ${fmt(calc.monthlySav)}</strong></p>
        <p style="margin:0 0 8px;font-size:12px;color:#0B0B0B99;">${fmt(leads)} ${T("leadsConv")} × €${ticketStr} ${T("ticket")} <strong style="float:right;color:#0B0B0B;">€ ${fmt(calc.addRev)}</strong></p>
        <hr style="border:none;border-top:1px solid #E8E8E8;margin:12px 0;">
        <p style="margin:0;font-size:13px;font-weight:600;">${T("totalMonthly")} <strong style="float:right;font-size:14px;">€ ${fmt(calc.total)}</strong></p>
        <p style="margin:12px 0 0;font-size:10px;color:#0B0B0B66;line-height:1.5;">${factorsText}</p>
      </div>
      <div style="padding:24px;background:#0B0B0B;border-radius:12px;text-align:center;margin-bottom:28px;">
        <p style="margin:0 0 4px;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:0.15em;">${T("totalEstimated")}</p>
        <p style="margin:0;font-size:28px;font-weight:700;color:#fff;">€ ${fmt(calc.total)} <span style="font-size:14px;color:rgba(255,255,255,0.5)">${T("perMonth")}</span></p>
        <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.4);">≈ € ${fmt(calc.annual)}${T("perYear")} · ${annualImpactPct}% ${T("ofRevenue")}</p>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">${T("metricsSection")}</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;">
        <div style="padding:16px;border:1px solid #f0f0f0;border-radius:12px;background:#fff;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B99;">${T("hoursFreedLabel")}</p><p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0B0B0B;">${calc.hrsSaved}h ${T("hoursPerMonth")}</p><p style="margin:0;font-size:11px;color:#0B0B0B99;line-height:1.5;">${T("fromWeekly")} ${hours}${T("weeklyRepetitive")} ${calc.hrsSaved}${T("monthlyHours")}</p></div>
        <div style="padding:16px;border:1px solid #f0f0f0;border-radius:12px;background:#fff;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B99;">${T("costSaved")}</p><p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0B0B0B;">€ ${fmt(calc.monthlySav)}</p><p style="margin:0;font-size:11px;color:#0B0B0B99;">${calc.hrsSaved}h × ${costH}€/h ${T("costCalc")}</p></div>
        <div style="padding:16px;border:1px solid #f0f0f0;border-radius:12px;background:#fff;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B99;">${T("responseTime")}</p><p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0B0B0B;">${sResp} → ${sNewResp} min</p><p style="margin:0;font-size:11px;color:#0B0B0B99;">${T("improvement")} ${calc.respImprove}%. ${T("sectorAvg")} ${sSector} ${T("is")} ${sectorAvgResp}min.</p></div>
        <div style="padding:16px;border:1px solid #f0f0f0;border-radius:12px;background:#fff;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B99;">${T("additionalRev")}</p><p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0B0B0B;">€ ${fmt(calc.addRev)}${T("perMonth")}</p><p style="margin:0;font-size:11px;color:#0B0B0B99;">${T("onLeads")} ${leads.toLocaleString(locale)} ${T("leadsWithTicket")} €${ticketStr}.</p></div>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">${T("benchmarkSection")}</p></div>
      <div style="padding:20px;border:1px solid #f0f0f0;border-radius:12px;background:#FAFAFA;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-size:12px;color:#0B0B0B99;">${sSector}</p>
        <p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">${T("aiAdoption")}</p>
        <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0B0B0B;">${sectorAdoption}% ${T("ofCompanies")}</p>
        <p style="margin:0 0 16px;font-size:12px;color:#0B0B0B99;line-height:1.5;">${esc(benchmarkText)}</p>
        <p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">${T("sectorResponse")}</p>
        <p style="margin:0;font-size:20px;font-weight:700;color:#0B0B0B;">${sectorAvgResp} min</p>
        <p style="margin:4px 0 0;font-size:12px;color:#0B0B0B99;">${esc(respCompare)}</p>
      </div>

      ${tasks.length > 0 ? `<div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">${T("taskSection")}</p></div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:28px;">${tasksList}</table>` : ""}

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">${T("recSection")}</p></div>
      <div style="padding:20px;border:2px solid rgba(11,11,11,0.08);border-radius:12px;background:#FAFAFA;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0B0B0B;">${T("basedOnPriority")} ${sPriority}</p>
        <p style="margin:0;font-size:12px;color:#0B0B0B99;line-height:1.65;">${priorityRecText}</p>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:24px 0;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">${T("quickWinsSection")}</p></div>
      <p style="margin:-8px 0 16px;font-size:12px;color:#0B0B0B99;">${T("quickWinsSub")} (${sSector} · ${sTeam} · ${sPriority.toLowerCase()}).</p>
      ${ideasHtml}
      <div style="margin-top:20px;padding:20px;background:#0B0B0B;color:#fff;border-radius:12px;">
        <p style="margin:0 0 8px;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:0.12em;">${T("stackSection")}</p>
        <p style="margin:0;font-size:13px;line-height:1.5;">${T("stackDesc", { team: sTeam, savings: fmt(calc.monthlySav), rev: fmt(calc.addRev) })}</p>
      </div>

      <div style="border-top:1px solid #EBEBEB;border-bottom:1px solid #EBEBEB;margin:28px 0 12px;padding:12px 0;"><p style="margin:0;font-size:10px;color:#0B0B0B66;letter-spacing:0.18em;">${T("timelineSection")}</p></div>
      ${timelinePhases.map((p) => `<div style="margin-bottom:16px;"><p style="margin:0 0 4px;font-size:11px;color:#0B0B0B66;">${p.week}</p><p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0B0B0B;">${p.title}</p><p style="margin:0;font-size:12px;color:#0B0B0B99;line-height:1.5;">${esc(p.desc)}</p></div>`).join("")}

      <div style="text-align:center;margin-top:32px;padding-top:24px;">
        <a href="${calendlyUrl()}" style="display:inline-block;padding:14px 28px;background:#0B0B0B;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:500;">${T("ctaBtn")}</a>
        <p style="margin:12px 0 0;font-size:11px;color:#0B0B0B66;">${T("ctaSub")}</p>
      </div>

      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f0f0f0;text-align:center;">
        <p style="margin:0;font-size:10px;color:#0B0B0B44;line-height:1.6;">The AI Business<br>${T("footer")}</p>
      </div>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#0B0B0B44;margin-top:20px;">© ${new Date().getFullYear()} The AI Business</p>
</div></body></html>`;
}
