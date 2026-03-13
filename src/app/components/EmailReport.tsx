import { motion } from "motion/react";
import {
  Euro,
  TrendingUp,
  Clock,
  BarChart3,
  Building2,
  Users,
  Wallet,
  Brain,
  Headphones,
  Target,
  Zap,
  ArrowUpRight,
  Mail,
  Calendar,
  Timer,
  MessageCircle,
  RefreshCw,
  LineChart,
  FileText,
  UserCheck,
  CalendarCheck,
  Send,
  Shield,
} from "lucide-react";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CALENDLY_URL } from "../lib/constants";

/* ─── Task savings data ─── */
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

/* ═══════════════════════════════════════════════════════════════
   TECH IDEAS ENGINE
   Generic technology implications (no brand names). Selects the
   3 most relevant ideas based on the user's profile.
   ═══════════════════════════════════════════════════════════════ */

interface TechIdea {
  id: string;
  title: string;
  icon: React.ElementType;
  setupTime: string;
  impact: string;
  taskAffinity: string[];
  priorityAffinity: string[];
  sectorBoost: string[];
  needs24h: boolean;
  getDescription: (ctx: IdeaContext) => string;
}

interface IdeaContext {
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

const TECH_IDEAS: TechIdea[] = [
  {
    id: "virtual-assistant",
    title: "Asistente virtual para clientes",
    icon: MessageCircle,
    setupTime: "1–2 semanas",
    impact: "Alto",
    taskAffinity: ["Atención cliente", "Leads"],
    priorityAffinity: ["Mejor soporte", "Más ventas"],
    sectorBoost: ["SaaS", "Ecommerce", "Servicios", "Salud", "Inmobiliaria"],
    needs24h: true,
    getDescription: (ctx) =>
      `Respuestas automáticas a las dudas más frecuentes de tus clientes, 24/7.`,
  },
  {
    id: "auto-workflows",
    title: "Automatizar tareas repetitivas",
    icon: RefreshCw,
    setupTime: "2–3 semanas",
    impact: "Alto",
    taskAffinity: ["Entrada datos", "Emails", "Facturación", "Informes", "Agenda"],
    priorityAffinity: ["Acelerar procesos", "Reducir costes"],
    sectorBoost: ["Agencia", "Logística", "Servicios", "Ecommerce", "SaaS"],
    needs24h: false,
    getDescription: (ctx) => {
      const taskMap: Record<string, string> = { "Entrada datos": "pasar datos", "Emails": "enviar emails", "Facturación": "facturar", "Informes": "hacer informes", "Agenda": "coordinar agenda" };
      const relevant = ctx.tasks.filter(t => taskMap[t]).slice(0, 2).map(t => taskMap[t]);
      return `Dejar de ${relevant.length > 0 ? relevant.join(" y ") : "repetir tareas"} a mano — se configura una vez y funciona solo.`;
    },
  },
  {
    id: "smart-crm",
    title: "Seguimiento comercial automático",
    icon: UserCheck,
    setupTime: "2–4 semanas",
    impact: "Alto",
    taskAffinity: ["Leads", "Emails", "Agenda"],
    priorityAffinity: ["Más ventas", "Acelerar procesos"],
    sectorBoost: ["Servicios", "Inmobiliaria", "Agencia", "Ecommerce", "SaaS"],
    needs24h: false,
    getDescription: (ctx) =>
      `Que ningún cliente interesado se quede sin respuesta. Seguimiento y recordatorios automáticos.`,
  },
  {
    id: "auto-content",
    title: "Creación rápida de contenidos",
    icon: FileText,
    setupTime: "1 semana",
    impact: "Medio",
    taskAffinity: ["Contenido", "Emails"],
    priorityAffinity: ["Más ventas", "Acelerar procesos"],
    sectorBoost: ["Agencia", "Ecommerce", "SaaS"],
    needs24h: false,
    getDescription: (ctx) =>
      `Textos para web, emails y redes en minutos en vez de horas, con tu tono de marca.`,
  },
  {
    id: "live-dashboard",
    title: "Panel de control en tiempo real",
    icon: LineChart,
    setupTime: "1–2 semanas",
    impact: "Medio",
    taskAffinity: ["Informes", "Entrada datos"],
    priorityAffinity: ["Acelerar procesos", "Reducir costes"],
    sectorBoost: ["Ecommerce", "Agencia", "SaaS", "Logística"],
    needs24h: false,
    getDescription: (ctx) =>
      `Ver cómo va tu negocio de un vistazo, siempre actualizado, sin preparar informes a mano.`,
  },
  {
    id: "smart-scheduling",
    title: "Reservas y agenda automática",
    icon: CalendarCheck,
    setupTime: "3–5 días",
    impact: "Medio",
    taskAffinity: ["Agenda", "Leads"],
    priorityAffinity: ["Acelerar procesos", "Más ventas"],
    sectorBoost: ["Servicios", "Salud", "Inmobiliaria", "Agencia"],
    needs24h: false,
    getDescription: (ctx) =>
      `Tus clientes reservan cita solos desde la web. Recordatorios automáticos incluidos.`,
  },
  {
    id: "auto-billing",
    title: "Facturación en piloto automático",
    icon: Euro,
    setupTime: "2–3 semanas",
    impact: "Alto",
    taskAffinity: ["Facturación", "Informes", "Entrada datos"],
    priorityAffinity: ["Reducir costes", "Acelerar procesos"],
    sectorBoost: ["Servicios", "Agencia", "Ecommerce", "Logística"],
    needs24h: false,
    getDescription: (ctx) =>
      `Facturas, cobros y recordatorios de pago generados y enviados sin intervención manual.`,
  },
  {
    id: "smart-email",
    title: "Comunicación personalizada a escala",
    icon: Send,
    setupTime: "1–2 semanas",
    impact: "Medio–Alto",
    taskAffinity: ["Emails", "Leads", "Contenido"],
    priorityAffinity: ["Más ventas", "Reducir costes"],
    sectorBoost: ["Ecommerce", "Servicios", "Inmobiliaria", "Salud"],
    needs24h: false,
    getDescription: (ctx) =>
      `El mensaje justo a cada cliente en el momento adecuado, de forma automática.`,
  },
  {
    id: "support-triage",
    title: "Clasificación inteligente de consultas",
    icon: Shield,
    setupTime: "1–2 semanas",
    impact: "Alto",
    taskAffinity: ["Atención cliente", "Emails", "Informes"],
    priorityAffinity: ["Mejor soporte", "Reducir costes"],
    sectorBoost: ["Salud", "Logística", "Servicios", "Ecommerce"],
    needs24h: true,
    getDescription: (ctx) =>
      `Cada consulta se clasifica y dirige al responsable correcto sin intervención manual.`,
  },
];

/* ── Smart selection: scores each idea and returns top 3 ── */
function selectTopIdeas(ctx: IdeaContext): TechIdea[] {
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
    if (!usedIds.has(idea.id)) {
      selected.push(idea);
      usedIds.add(idea.id);
    }
  }

  return selected;
}

/* ─── Main Report Component ─── */
/* ─── SVG Circular Gauge ─── */
function CircleGauge({ value, max, size = 80, strokeWidth = 5, label, sublabel, delay = 0, color = "#0B0B0B" }: { value: number; max: number; size?: number; strokeWidth?: number; label: string; sublabel?: string; delay?: number; color?: string; }) {
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r, pct = Math.min(value / max, 1), offset = circ * (1 - pct);
  return (<motion.div initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.6, delay }} className="flex flex-col items-center"><div className="relative" style={{ width: size, height: size }}><svg width={size} height={size} className="-rotate-90"><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={strokeWidth}/><motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, delay: delay + 0.2, ease: [0.25,0.46,0.45,0.94] }}/></svg><div className="absolute inset-0 flex items-center justify-center"><span style={{ fontSize: size*0.22, fontWeight: 700, color }}>{label}</span></div></div>{sublabel && <span className="text-[#0B0B0B]/35 mt-1.5 text-center" style={{ fontSize: "0.6rem", lineHeight: 1.3 }}>{sublabel}</span>}</motion.div>);
}

function MiniDonut({ pct, size = 36, delay = 0 }: { pct: number; size?: number; delay?: number }) {
  const sw = 3.5, r = (size - sw) / 2, circ = 2 * Math.PI * r, offset = circ * (1 - pct);
  return (<svg width={size} height={size} className="-rotate-90 flex-shrink-0"><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={sw}/><motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#0B0B0B" strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1, delay: delay + 0.3, ease: [0.25,0.46,0.45,0.94] }}/><text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" transform={`rotate(90, ${size/2}, ${size/2})`} style={{ fontSize: "0.5rem", fontWeight: 600, fill: "#0B0B0B" }}>{Math.round(pct * 100)}</text></svg>);
}

function SectionHeader({ label, delay = 0 }: { label: string; delay?: number }) {
  return (<motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay }} className="flex items-center gap-2 mb-4"><div className="h-px flex-1 bg-[#EBEBEB]"/><span className="text-[#0B0B0B]/25 tracking-[0.18em] flex-shrink-0" style={{ fontSize: "0.55rem", fontWeight: 600 }}>{label}</span><div className="h-px flex-1 bg-[#EBEBEB]"/></motion.div>);
}

function InsightCard({ icon: Icon, title, value, insight, delay = 0 }: { icon: React.ElementType; title: string; value: string; insight: string; delay?: number }) {
  return (<motion.div initial={{ opacity: 0, y: 10, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.5, delay }} className="rounded-xl border border-[#F0F0F0] p-4 bg-white"><div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0"><Icon size={12} className="text-[#0B0B0B]/40"/></div><span className="text-[#0B0B0B]/35" style={{ fontSize: "0.65rem", fontWeight: 500 }}>{title}</span></div><p className="text-[#0B0B0B] mb-1.5" style={{ fontSize: "1.05rem", fontWeight: 600 }}>{value}</p><p className="text-[#0B0B0B]/35" style={{ fontSize: "0.72rem", lineHeight: 1.55 }}>{insight}</p></motion.div>);
}

const SECTOR_AI_ADOPTION: Record<string, number> = { SaaS: 68, Agencia: 54, Ecommerce: 61, Salud: 38, Servicios: 42, Inmobiliaria: 29, Logística: 45, Otros: 40 };
const SECTOR_AVG_RESPONSE: Record<string, number> = { Ecommerce: 35, SaaS: 20, Agencia: 45, Servicios: 55, Salud: 30, Inmobiliaria: 75, Logística: 50, Otros: 40 };

interface EmailReportProps { name: string; email: string; sector: string; teamSize: string; revenue: string; usesAI: boolean | null; tasks: string[]; hours: number; costH: number; leads: number; respTime: number; avgTicket: number; h24: boolean | null; priority: string; calc: { hrsSaved: number; monthlySav: number; addRev: number; newResp: number; respImprove: number; score: number; total: number; annual: number; avgTicket: number; }; }

export function EmailReport({ name, email, sector, teamSize, revenue, usesAI, tasks, hours, costH, leads, respTime, avgTicket, h24, priority, calc }: EmailReportProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "es-ES";

  const fmt = (n: number) => n.toLocaleString(locale);
  const today = new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });

  /* ── Sector-aware task breakdown (mirrors Calculator precision engine) ── */
  const sectorEff: Record<string, number> = {
    SaaS: 1.15, Ecommerce: 1.10, Logística: 1.08, Agencia: 1.05,
    Servicios: 1.00, Inmobiliaria: 0.95, Salud: 0.92, Otros: 1.00,
  };
  const eff = sectorEff[sector] || 1.0;
  const aiDisc = usesAI ? 0.70 : 1.0;
  const teamOverhead: Record<string, number> = {
    "1 – 5": 1.00, "6 – 20": 1.08, "21 – 50": 1.15, "50 +": 1.22,
  };
  const overhead = teamOverhead[teamSize] || 1.0;
  const hoursPerTask = tasks.length > 0 ? hours / tasks.length : 0;
  const taskBreakdown = tasks.map((tk) => {
    const baseSav = TASK_SAVINGS[tk]?.savings ?? 0.6;
    const adjusted = Math.min(baseSav * eff * aiDisc, 0.95);
    const hSaved = Math.round(hoursPerTask * 4.33 * adjusted);
    const eurSaved = Math.round(hSaved * costH * overhead);
    return { label: tk, savings: adjusted, hSaved, eurSaved, desc: t(`report.taskSavingsDesc.${tk}`, TASK_SAVINGS[tk]?.desc ?? "") };
  });

  const priorityRec: Record<string, string> = {
    "Reducir costes": t("report.recReduceCosts", { savings: fmt(calc.monthlySav), task: taskBreakdown[0]?.label ?? t("tasks.Atención cliente"), pct: Math.round((taskBreakdown[0]?.savings ?? 0.6) * 100) }),
    "Más ventas": t("report.recMoreSales", { leads: leads.toLocaleString(locale), ticket: avgTicket >= 1000 ? Math.round(avgTicket/1000) + "K" : fmt(avgTicket), rev: fmt(calc.addRev), h24Note: h24 ? t("report.recMoreSalesH24Yes") : t("report.recMoreSalesH24No") }),
    "Mejor soporte": t("report.recBetterSupport", { from: respTime, to: calc.newResp, improve: calc.respImprove, h24Note: h24 ? t("report.recBetterSupportH24Yes") : t("report.recBetterSupportH24No") }),
    "Acelerar procesos": t("report.recAccelerate", { hours, team: teamSize, saved: calc.hrsSaved }),
  };

  const sectorAdoption = SECTOR_AI_ADOPTION[sector] ?? 40;
  const sectorAvgResp = SECTOR_AVG_RESPONSE[sector] ?? 40;
  const scoreLevel = calc.score >= 75 ? { label: t("report.scoreVeryHigh"), insight: t("report.scoreVeryHighInsight") } : calc.score >= 55 ? { label: t("report.scoreHigh"), insight: t("report.scoreHighInsight") } : calc.score >= 35 ? { label: t("report.scoreModerate"), insight: t("report.scoreModerateInsight") } : { label: t("report.scoreInitial"), insight: t("report.scoreInitialInsight") };

  const revValue = revenue === "< 100 K €" ? 80000 : revenue === "100 K – 500 K €" ? 300000 : revenue === "500 K – 2 M €" ? 1200000 : revenue === "2 M – 10 M €" ? 5000000 : 15000000;
  const annualImpactPct = ((calc.annual / revValue) * 100).toFixed(1);

  const recCtx: IdeaContext = useMemo(() => ({ sector, teamSize, tasks, priority, hours, costH, leads, respTime, h24, usesAI, hrsSaved: calc.hrsSaved, monthlySav: calc.monthlySav, addRev: calc.addRev, newResp: calc.newResp }), [sector, teamSize, tasks, priority, hours, costH, leads, respTime, h24, usesAI, calc]);
  const topIdeas = useMemo(() => selectTopIdeas(recCtx), [recCtx]);

  return (
    <motion.div initial={{ opacity: 0, y: 30, filter: "blur(16px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.3, ease: [0.25,0.46,0.45,0.94] }} className="w-full max-w-[640px] mx-auto">
      <div className="rounded-2xl border border-[#E8E8E8] bg-white overflow-hidden" style={{ boxShadow: "0 12px 60px rgba(11,11,11,0.08), 0 2px 8px rgba(11,11,11,0.04)" }}>
        {/* Email header */}
        <div className="px-6 py-4 border-b border-[#F0F0F0] bg-[#FAFAFA]">
          <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Mail size={13} className="text-[#0B0B0B]/25"/><span className="text-[#0B0B0B]/30" style={{ fontSize: "0.65rem" }}>{t("report.emailPreview")}</span></div><span className="text-[#0B0B0B]/20" style={{ fontSize: "0.6rem" }}>{today}</span></div>
          <div className="space-y-1"><p className="text-[#0B0B0B]/40" style={{ fontSize: "0.62rem" }}><span className="text-[#0B0B0B]/25">{t("report.to")}</span> {email}</p><p className="text-[#0B0B0B]/40" style={{ fontSize: "0.62rem" }}><span className="text-[#0B0B0B]/25">{t("report.from")}</span> hola@theaibusiness.io</p><p className="text-[#0B0B0B]/40" style={{ fontSize: "0.62rem" }}><span className="text-[#0B0B0B]/25">{t("report.subject")}</span>{" "}<span className="text-[#0B0B0B]/60" style={{ fontWeight: 500 }}>{t("report.subjectText", { name })}</span></p></div>
        </div>

        <div className="px-6 py-8 space-y-8">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="text-center">
            <p className="text-[#0B0B0B]/20 tracking-[0.2em] mb-3" style={{ fontSize: "0.55rem", fontWeight: 600 }}>THE AI BUSINESS</p>
            <h2 className="text-[#0B0B0B] mb-2" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.2 }}>{t("report.heroTitle")}</h2>
            <p className="text-[#0B0B0B]/35" style={{ fontSize: "0.8rem" }}>{t("report.heroPrepared")} <span className="text-[#0B0B0B]" style={{ fontWeight: 500 }}>{name || t("report.yourBusiness")}</span> · {today}</p>
          </motion.div>

          {/* Perfil */}
          <div>
            <SectionHeader label={t("report.profileSection")} delay={0.6}/>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.65 }} className="grid grid-cols-2 gap-3">
              {[{ icon: Building2, label: t("report.profileSector"), value: t(`sectors.${sector}`, sector) }, { icon: Users, label: t("report.profileTeam"), value: `${teamSize} ${t("report.profilePeople")}` }, { icon: Wallet, label: t("report.profileRevenue"), value: revenue }, { icon: Euro, label: t("report.profileTicket"), value: `€${avgTicket >= 1000 ? Math.round(avgTicket/1000) + "K" : avgTicket.toLocaleString(locale)}` }, { icon: Brain, label: t("report.profileUsesAI"), value: usesAI ? t("report.profileAIYes") : t("report.profileAINo") }, { icon: Headphones, label: t("report.profileSupport"), value: h24 ? t("report.profileSupportYes") : t("report.profileSupportNo") }, { icon: Target, label: t("report.profilePriority"), value: t(`priorities.${priority}`, priority) }].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.4, delay: 0.7 + i * 0.06 }} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAFAFA]">
                  <item.icon size={13} className="text-[#0B0B0B]/20 mt-0.5 flex-shrink-0"/>
                  <div><p className="text-[#0B0B0B]/25" style={{ fontSize: "0.58rem", fontWeight: 500 }}>{item.label}</p><p className="text-[#0B0B0B]" style={{ fontSize: "0.78rem", fontWeight: 500 }}>{item.value}</p></div>
                </motion.div>))}
            </motion.div>
          </div>

          {/* AI Score */}
          <div>
            <SectionHeader label={t("report.scoreSection")} delay={1.0}/>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 1.05 }} className="flex flex-col items-center py-4">
              <CircleGauge value={calc.score} max={100} size={120} strokeWidth={7} label={`${calc.score}`} delay={1.1}/>
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 1.5 }} className="text-center mt-3">
                <p className="text-[#0B0B0B]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{t("report.scorePotential")} {scoreLevel.label}</p>
                <p className="text-[#0B0B0B]/35 mt-1 max-w-[360px]" style={{ fontSize: "0.7rem", lineHeight: 1.55 }}>{scoreLevel.insight}</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Impacto financiero */}
          <div>
            <SectionHeader label={t("report.financialSection")} delay={1.6}/>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <CircleGauge value={calc.monthlySav} max={calc.total > 0 ? calc.total : 1} size={90} strokeWidth={6} label={`€${calc.monthlySav >= 1000 ? Math.round(calc.monthlySav/1000) + "K" : fmt(calc.monthlySav)}`} sublabel={t("report.opSavingsMonth")} delay={1.7}/>
              <CircleGauge value={calc.addRev} max={calc.total > 0 ? calc.total : 1} size={90} strokeWidth={6} label={`€${calc.addRev >= 1000 ? Math.round(calc.addRev/1000) + "K" : fmt(calc.addRev)}`} sublabel={t("report.addRevMonth")} delay={1.85}/>
            </div>
            {/* Desglose preciso */}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.92 }} className="mb-4 p-4 rounded-xl border border-[#F0F0F0] bg-[#FAFAFA]">
              <p className="text-[#0B0B0B]/25 tracking-[0.12em] mb-3" style={{ fontSize: "0.52rem", fontWeight: 600 }}>{t("report.breakdownSection")}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#0B0B0B]/40" style={{ fontSize: "0.68rem" }}>{t("report.breakdownHours", { hours: calc.hrsSaved, cost: costH })}</span>
                  <span className="text-[#0B0B0B]" style={{ fontSize: "0.75rem", fontWeight: 600 }}>€ {fmt(calc.monthlySav)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#0B0B0B]/40" style={{ fontSize: "0.68rem" }}>{t("report.breakdownLeads", { leads: fmt(leads), ticket: avgTicket >= 1000 ? Math.round(avgTicket/1000) + "K" : fmt(avgTicket) })}</span>
                  <span className="text-[#0B0B0B]" style={{ fontSize: "0.75rem", fontWeight: 600 }}>€ {fmt(calc.addRev)}</span>
                </div>
                <div className="h-px bg-[#E8E8E8] my-1"/>
                <div className="flex items-center justify-between">
                  <span className="text-[#0B0B0B]/60" style={{ fontSize: "0.72rem", fontWeight: 600 }}>{t("report.breakdownTotal")}</span>
                  <span className="text-[#0B0B0B]" style={{ fontSize: "0.85rem", fontWeight: 700 }}>€ {fmt(calc.total)}</span>
                </div>
              </div>
              <p className="text-[#0B0B0B]/20 mt-2.5" style={{ fontSize: "0.55rem", lineHeight: 1.5 }}>
                {t("report.breakdownFactors", { sector, eff: Math.round((sectorEff[sector] || 1) * 100), aiNote: usesAI ? t("report.breakdownAIDiscount") : t("report.breakdownAIFull"), team: teamSize, overhead: Math.round(((teamOverhead[teamSize] || 1) - 1) * 100) })}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, delay: 2.0 }} className="p-5 rounded-xl bg-[#0B0B0B] text-white text-center" style={{ boxShadow: "0 8px 40px rgba(11,11,11,0.15)" }}>
              <p className="text-white/35 tracking-[0.15em] mb-1" style={{ fontSize: "0.55rem", fontWeight: 500 }}>{t("report.totalEstimated")}</p>
              <p style={{ fontSize: "2rem", fontWeight: 700 }}>€ {fmt(calc.total)}<span className="text-white/40" style={{ fontSize: "0.85rem" }}> {t("report.perMonth")}</span></p>
              <p className="text-white/30 mt-1" style={{ fontSize: "0.7rem" }}>≈ € {fmt(calc.annual)}{t("report.perYear")} · {annualImpactPct}% {t("report.ofRevenue")}</p>
            </motion.div>
          </div>

          {/* Métricas operativas */}
          <div>
            <SectionHeader label={t("report.metricsSection")} delay={2.2}/>
            <div className="grid grid-cols-2 gap-3">
              <InsightCard icon={Clock} title={t("report.metricHoursTitle")} value={t("report.metricHoursValue", { hours: calc.hrsSaved })} insight={t("report.metricHoursInsight", { weeklyH: hours, hours: calc.hrsSaved, days: Math.round(calc.hrsSaved / 8) })} delay={2.3}/>
              <InsightCard icon={Euro} title={t("report.metricCostTitle")} value={`€ ${fmt(calc.monthlySav)}`} insight={t("report.metricCostInsight", { hours: calc.hrsSaved, cost: costH, annual: fmt(calc.monthlySav * 12) })} delay={2.4}/>
              <InsightCard icon={Zap} title={t("report.metricRespTitle")} value={`${respTime} → ${calc.newResp} min`} insight={t("report.metricRespInsight", { improve: calc.respImprove, sector, avg: sectorAvgResp, note: respTime > sectorAvgResp ? t("report.metricRespAbove") : t("report.metricRespBelow") })} delay={2.5}/>
              <InsightCard icon={TrendingUp} title={t("report.metricRevTitle")} value={t("report.metricRevValue", { value: fmt(calc.addRev) })} insight={t("report.metricRevInsight", { leads: leads.toLocaleString(locale), ticket: avgTicket >= 1000 ? Math.round(avgTicket/1000) + "K" : fmt(avgTicket), reason: h24 ? t("report.metricRevReason247") : t("report.metricRevReasonResp"), improve: calc.respImprove })} delay={2.6}/>
            </div>
          </div>

          {/* Benchmark */}
          <div>
            <SectionHeader label={t("report.benchmarkSection")} delay={2.7}/>
            <motion.div initial={{ opacity: 0, y: 8, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.5, delay: 2.8 }} className="p-4 rounded-xl border border-[#F0F0F0] bg-[#FAFAFA]">
              <div className="flex items-center gap-2 mb-3"><Building2 size={13} className="text-[#0B0B0B]/30"/><span className="text-[#0B0B0B]/35" style={{ fontSize: "0.65rem", fontWeight: 500 }}>{sector}</span></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[#0B0B0B]/25 mb-0.5" style={{ fontSize: "0.58rem" }}>{t("report.benchmarkAdoption")}</p><span className="text-[#0B0B0B]" style={{ fontSize: "1.3rem", fontWeight: 700 }}>{sectorAdoption}%</span><span className="text-[#0B0B0B]/25 ml-1" style={{ fontSize: "0.6rem" }}>{t("report.benchmarkOfCompanies")}</span><p className="text-[#0B0B0B]/30 mt-1" style={{ fontSize: "0.62rem", lineHeight: 1.5 }}>{usesAI ? t("report.benchmarkAdoptionYes", { pct: sectorAdoption }) : t("report.benchmarkAdoptionNo", { pct: sectorAdoption, sector })}</p></div>
                <div><p className="text-[#0B0B0B]/25 mb-0.5" style={{ fontSize: "0.58rem" }}>{t("report.benchmarkResponse")}</p><span className="text-[#0B0B0B]" style={{ fontSize: "1.3rem", fontWeight: 700 }}>{sectorAvgResp} min</span><p className="text-[#0B0B0B]/30 mt-1" style={{ fontSize: "0.62rem", lineHeight: 1.5 }}>{respTime > sectorAvgResp ? t("report.benchmarkAbove", { diff: respTime - sectorAvgResp, newResp: calc.newResp }) : t("report.benchmarkBelow", { diff: sectorAvgResp - respTime })}</p></div>
              </div>
            </motion.div>
          </div>

          {/* Tareas */}
          {tasks.length > 0 && (<div>
            <SectionHeader label={t("report.taskSection")} delay={3.0}/>
            <div className="space-y-2.5">{taskBreakdown.map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, x: -10, filter: "blur(6px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ duration: 0.4, delay: 3.1 + i * 0.08 }} className="flex items-center gap-3 p-3 rounded-lg border border-[#F0F0F0] bg-white">
                <MiniDonut pct={item.savings} delay={3.1 + i * 0.08}/>
                <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="text-[#0B0B0B]" style={{ fontSize: "0.78rem", fontWeight: 500 }}>{t(`tasks.${item.label}`, item.label)}</p><span className="text-[#0B0B0B]/30" style={{ fontSize: "0.6rem" }}>{item.hSaved}h · €{fmt(item.eurSaved)}</span></div><p className="text-[#0B0B0B]/30 mt-0.5" style={{ fontSize: "0.6rem" }}>{item.desc} · {Math.round(item.savings * 100)}% {t("report.taskAutomatable")}</p></div>
              </motion.div>))}</div>
          </div>)}

          {/* Recomendación personalizada */}
          <div>
            <SectionHeader label={t("report.recSection")} delay={3.5}/>
            <motion.div initial={{ opacity: 0, y: 10, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, delay: 3.6 }} className="p-5 rounded-xl border-2 border-[#0B0B0B]/8 bg-[#FAFAFA]">
              <div className="flex items-center gap-2 mb-3"><Target size={14} className="text-[#0B0B0B]/40"/><span className="text-[#0B0B0B]" style={{ fontSize: "0.75rem", fontWeight: 600 }}>{t("report.recBasedOn", { priority: t(`priorities.${priority}`, priority) })}</span></div>
              <p className="text-[#0B0B0B]/50" style={{ fontSize: "0.75rem", lineHeight: 1.65 }}>{priorityRec[priority] ?? priorityRec["Reducir costes"]}</p>
            </motion.div>
          </div>

          {/* ═══ QUICK WINS — Soluciones Inmediatas ═══ */}
          <div>
            <SectionHeader label={t("report.quickWinsSection")} delay={3.7}/>
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 3.75 }} className="text-[#0B0B0B]/35 mb-5 -mt-1" style={{ fontSize: "0.7rem", lineHeight: 1.55 }}>
              {t("report.quickWinsSub", { sector: t(`sectors.${sector}`, sector), team: teamSize, priority: t(`priorities.${priority}`, priority).toLowerCase() })}
            </motion.p>
            <div className="space-y-3">
              {topIdeas.map((idea, i) => (
                <motion.div key={idea.id} initial={{ opacity: 0, y: 10, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.4, delay: 3.85 + i * 0.12 }} className="flex items-start gap-3 p-4 rounded-xl border border-[#F0F0F0] bg-white">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#F5F5F5", color: "#0B0B0B", fontSize: "0.7rem", fontWeight: 700 }}><idea.icon size={16}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[#0B0B0B]" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{t(`report.techIdeas.${idea.id}.title`)}</p>
                      <span className="text-[#0B0B0B]/15" style={{ fontSize: "0.5rem" }}>#{i + 1}</span>
                    </div>
                    <p className="text-[#0B0B0B]/45 mb-2" style={{ fontSize: "0.68rem", lineHeight: 1.5 }}>{
  idea.id === "auto-workflows"
    ? (() => {
        const taskMapT: Record<string, string> = Object.fromEntries(
          Object.entries({"Entrada datos":"","Emails":"","Facturación":"","Informes":"","Agenda":""}).map(([k])=>[k, t(`report.autoWorkflowsTaskMap.${k}`)])
        );
        const relevant = recCtx.tasks.filter(tk => taskMapT[tk]).slice(0, 2).map(tk => taskMapT[tk]);
        return relevant.length > 0
          ? t("report.techIdeas.auto-workflows.desc", { tasks: relevant.join(` ${t("calc.and")} `) })
          : t("report.techIdeas.auto-workflows.descFallback");
      })()
    : t(`report.techIdeas.${idea.id}.desc`)
}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#0B0B0B]/35" style={{ fontSize: "0.5rem" }}><Timer size={8}/> {t(`report.techIdeas.${idea.id}.setup`)}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#0B0B0B]/35" style={{ fontSize: "0.5rem" }}><Zap size={8}/> {t("report.impact")} {idea.impact === "Alto" ? t("report.impactHigh") : idea.impact === "Medio–Alto" ? t("report.impactMediumHigh") : t("report.impactMedium")}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 4.3 }} className="mt-4 p-4 rounded-xl bg-[#0B0B0B] text-white" style={{ boxShadow: "0 6px 30px rgba(11,11,11,0.12)" }}>
              <p className="text-white/40 tracking-[0.12em] mb-1.5" style={{ fontSize: "0.52rem", fontWeight: 600 }}>{t("report.stackSection")}</p>
              <p className="text-white mb-1" style={{ fontSize: "0.78rem", fontWeight: 500, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: t("report.stackDesc", { team: teamSize, savings: fmt(calc.monthlySav), rev: fmt(calc.addRev) }) }} />
              <p className="text-white/30" style={{ fontSize: "0.6rem" }}>{t("report.stackNote")}</p>
            </motion.div>
          </div>

          {/* Timeline */}
          <div>
            <SectionHeader label={t("report.timelineSection")} delay={4.5}/>
            <div className="space-y-0">{[
              { week: t("report.tw12"), title: t("report.tw12Title"), desc: t("report.tw12Desc", { count: tasks.length }) },
              { week: t("report.tw34"), title: t("report.tw34Title"), desc: t("report.tw34Desc", { tasks: taskBreakdown.slice(0, 2).map(tb => t(`tasks.${tb.label}`, tb.label)).join(` ${t("calc.and")} `), extra: taskBreakdown.length > 2 ? t("report.tw34Extra", { count: taskBreakdown.length - 2 }) : "" }) },
              { week: t("report.tw56"), title: t("report.tw56Title"), desc: t("report.tw56Desc", { hours: calc.hrsSaved, total: fmt(calc.total) }) },
            ].map((phase, i) => (
              <motion.div key={phase.week} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 4.6 + i * 0.12 }} className="flex gap-4 py-3">
                <div className="flex flex-col items-center"><div className="w-2 h-2 rounded-full bg-[#0B0B0B] flex-shrink-0"/>{i < 2 && <div className="w-px flex-1 bg-[#E8E8E8] mt-1"/>}</div>
                <div className="pb-2"><p className="text-[#0B0B0B]/25 mb-0.5" style={{ fontSize: "0.58rem", fontWeight: 600 }}>{phase.week}</p><p className="text-[#0B0B0B] mb-1" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{phase.title}</p><p className="text-[#0B0B0B]/35" style={{ fontSize: "0.68rem", lineHeight: 1.55 }}>{phase.desc}</p></div>
              </motion.div>))}</div>
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 5.0 }} className="text-center pt-4 pb-2">
            <a href={CALENDLY_URL || "/#contacto"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0B0B0B] text-white rounded-full no-underline cursor-pointer hover:opacity-90 transition-opacity" style={{ fontSize: "0.9rem", fontWeight: 500, boxShadow: "0 6px 30px rgba(11,11,11,0.12)" }}><Calendar size={15}/>{t("report.ctaBtn")}<ArrowUpRight size={14} className="text-white/50"/></a>
            <p className="text-[#0B0B0B]/20 mt-4" style={{ fontSize: "0.58rem", lineHeight: 1.6 }}>{t("report.ctaSub")}</p>
          </motion.div>

          {/* Footer */}
          <div className="pt-6 border-t border-[#F0F0F0] text-center">
            <p className="text-[#0B0B0B]/15" style={{ fontSize: "0.55rem", lineHeight: 1.6 }}>{t("report.footerNote")}<br/>{t("report.footerDisclaimer")}<br/>{t("report.footerDisclaimer2")}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}