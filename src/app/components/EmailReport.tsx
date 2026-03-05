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
  const fmt = (n: number) => n.toLocaleString("es-ES");
  const today = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

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
  const taskBreakdown = tasks.map((t) => {
    const baseSav = TASK_SAVINGS[t]?.savings ?? 0.6;
    const adjusted = Math.min(baseSav * eff * aiDisc, 0.95);
    const hSaved = Math.round(hoursPerTask * 4.33 * adjusted);
    const eurSaved = Math.round(hSaved * costH * overhead);
    return { label: t, savings: adjusted, hSaved, eurSaved, desc: TASK_SAVINGS[t]?.desc ?? "" };
  });

  const priorityRec: Record<string, string> = {
    "Reducir costes": `Con un ahorro potencial de €${fmt(calc.monthlySav)}/mes, recomendamos empezar automatizando ${taskBreakdown[0]?.label ?? "las tareas más repetitivas"} (${Math.round((taskBreakdown[0]?.savings ?? 0.6) * 100)}% automatizable). En 6 semanas tendrás ROI positivo.`,
    "Más ventas": `Tu pipeline de ${leads.toLocaleString()} leads/mes con ticket medio de €${avgTicket >= 1000 ? Math.round(avgTicket/1000) + "K" : fmt(avgTicket)} tiene un potencial de €${fmt(calc.addRev)} adicionales/mes. ${h24 ? "Con atención 24/7," : "Activando atención 24/7,"} el conversion rate sube significativamente.`,
    "Mejor soporte": `Reducir tu tiempo de respuesta de ${respTime}min a ${calc.newResp}min (–${calc.respImprove}%) impactará directamente en retención. ${h24 ? "Ya cubrís 24/7, ideal para chatbots AI." : "Recomendamos activar soporte 24/7 con chatbots AI."}`,
    "Acelerar procesos": `Con ${hours}h/semana en tareas repetitivas y un equipo de ${teamSize}, la automatización liberará ${calc.hrsSaved}h/mes que tu equipo puede dedicar a trabajo de alto valor.`,
  };

  const sectorAdoption = SECTOR_AI_ADOPTION[sector] ?? 40;
  const sectorAvgResp = SECTOR_AVG_RESPONSE[sector] ?? 40;
  const scoreLevel = calc.score >= 75 ? { label: "Muy alto", insight: "Tu negocio tiene un potencial de transformación excepcional." } : calc.score >= 55 ? { label: "Alto", insight: "Estás en una posición excelente para obtener ROI rápido con automatización AI." } : calc.score >= 35 ? { label: "Moderado", insight: "Hay oportunidades claras de mejora. Empieza con las tareas de mayor impacto." } : { label: "Inicial", insight: "Empezar con AI ahora te dará ventaja competitiva." };

  const revValue = revenue === "< 100 K €" ? 80000 : revenue === "100 K – 500 K €" ? 300000 : revenue === "500 K – 2 M €" ? 1200000 : revenue === "2 M – 10 M €" ? 5000000 : 15000000;
  const annualImpactPct = ((calc.annual / revValue) * 100).toFixed(1);

  const recCtx: IdeaContext = useMemo(() => ({ sector, teamSize, tasks, priority, hours, costH, leads, respTime, h24, usesAI, hrsSaved: calc.hrsSaved, monthlySav: calc.monthlySav, addRev: calc.addRev, newResp: calc.newResp }), [sector, teamSize, tasks, priority, hours, costH, leads, respTime, h24, usesAI, calc]);
  const topIdeas = useMemo(() => selectTopIdeas(recCtx), [recCtx]);

  return (
    <motion.div initial={{ opacity: 0, y: 30, filter: "blur(16px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.3, ease: [0.25,0.46,0.45,0.94] }} className="w-full max-w-[640px] mx-auto">
      <div className="rounded-2xl border border-[#E8E8E8] bg-white overflow-hidden" style={{ boxShadow: "0 12px 60px rgba(11,11,11,0.08), 0 2px 8px rgba(11,11,11,0.04)" }}>
        {/* Email header */}
        <div className="px-6 py-4 border-b border-[#F0F0F0] bg-[#FAFAFA]">
          <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Mail size={13} className="text-[#0B0B0B]/25"/><span className="text-[#0B0B0B]/30" style={{ fontSize: "0.65rem" }}>Vista previa del email</span></div><span className="text-[#0B0B0B]/20" style={{ fontSize: "0.6rem" }}>{today}</span></div>
          <div className="space-y-1"><p className="text-[#0B0B0B]/40" style={{ fontSize: "0.62rem" }}><span className="text-[#0B0B0B]/25">Para:</span> {email}</p><p className="text-[#0B0B0B]/40" style={{ fontSize: "0.62rem" }}><span className="text-[#0B0B0B]/25">De:</span> info@theaibusiness.com</p><p className="text-[#0B0B0B]/40" style={{ fontSize: "0.62rem" }}><span className="text-[#0B0B0B]/25">Asunto:</span>{" "}<span className="text-[#0B0B0B]/60" style={{ fontWeight: 500 }}>{name}, tu informe AI personalizado está listo</span></p></div>
        </div>

        <div className="px-6 py-8 space-y-8">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="text-center">
            <p className="text-[#0B0B0B]/20 tracking-[0.2em] mb-3" style={{ fontSize: "0.55rem", fontWeight: 600 }}>THE AI BUSINESS</p>
            <h2 className="text-[#0B0B0B] mb-2" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.2 }}>Informe de Potencial AI</h2>
            <p className="text-[#0B0B0B]/35" style={{ fontSize: "0.8rem" }}>Preparado para <span className="text-[#0B0B0B]" style={{ fontWeight: 500 }}>{name || "tu negocio"}</span> · {today}</p>
          </motion.div>

          {/* Perfil */}
          <div>
            <SectionHeader label="PERFIL DE EMPRESA" delay={0.6}/>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.65 }} className="grid grid-cols-2 gap-3">
              {[{ icon: Building2, label: "Sector", value: sector }, { icon: Users, label: "Equipo", value: `${teamSize} personas` }, { icon: Wallet, label: "Facturación", value: revenue }, { icon: Euro, label: "Ticket medio", value: `€${avgTicket >= 1000 ? Math.round(avgTicket/1000) + "K" : avgTicket.toLocaleString("es-ES")}` }, { icon: Brain, label: "Usa AI", value: usesAI ? "Sí, actualmente" : "Aún no" }, { icon: Headphones, label: "Soporte 24/7", value: h24 ? "Sí, necesario" : "Horario estándar" }, { icon: Target, label: "Prioridad", value: priority }].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.4, delay: 0.7 + i * 0.06 }} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAFAFA]">
                  <item.icon size={13} className="text-[#0B0B0B]/20 mt-0.5 flex-shrink-0"/>
                  <div><p className="text-[#0B0B0B]/25" style={{ fontSize: "0.58rem", fontWeight: 500 }}>{item.label}</p><p className="text-[#0B0B0B]" style={{ fontSize: "0.78rem", fontWeight: 500 }}>{item.value}</p></div>
                </motion.div>))}
            </motion.div>
          </div>

          {/* AI Score */}
          <div>
            <SectionHeader label="AI SCORE" delay={1.0}/>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 1.05 }} className="flex flex-col items-center py-4">
              <CircleGauge value={calc.score} max={100} size={120} strokeWidth={7} label={`${calc.score}`} delay={1.1}/>
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 1.5 }} className="text-center mt-3">
                <p className="text-[#0B0B0B]" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Potencial {scoreLevel.label}</p>
                <p className="text-[#0B0B0B]/35 mt-1 max-w-[360px]" style={{ fontSize: "0.7rem", lineHeight: 1.55 }}>{scoreLevel.insight}</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Impacto financiero */}
          <div>
            <SectionHeader label="IMPACTO FINANCIERO" delay={1.6}/>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <CircleGauge value={calc.monthlySav} max={calc.total > 0 ? calc.total : 1} size={90} strokeWidth={6} label={`€${calc.monthlySav >= 1000 ? Math.round(calc.monthlySav/1000) + "K" : fmt(calc.monthlySav)}`} sublabel="Ahorro operativo / mes" delay={1.7}/>
              <CircleGauge value={calc.addRev} max={calc.total > 0 ? calc.total : 1} size={90} strokeWidth={6} label={`€${calc.addRev >= 1000 ? Math.round(calc.addRev/1000) + "K" : fmt(calc.addRev)}`} sublabel="Ingreso adicional / mes" delay={1.85}/>
            </div>
            {/* Desglose preciso */}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.92 }} className="mb-4 p-4 rounded-xl border border-[#F0F0F0] bg-[#FAFAFA]">
              <p className="text-[#0B0B0B]/25 tracking-[0.12em] mb-3" style={{ fontSize: "0.52rem", fontWeight: 600 }}>DESGLOSE DEL CÁLCULO</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#0B0B0B]/40" style={{ fontSize: "0.68rem" }}>{calc.hrsSaved}h liberadas × {costH}€/h × overhead equipo</span>
                  <span className="text-[#0B0B0B]" style={{ fontSize: "0.75rem", fontWeight: 600 }}>€ {fmt(calc.monthlySav)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#0B0B0B]/40" style={{ fontSize: "0.68rem" }}>{fmt(leads)} leads × conv. boost × €{avgTicket >= 1000 ? Math.round(avgTicket/1000) + "K" : fmt(avgTicket)} ticket</span>
                  <span className="text-[#0B0B0B]" style={{ fontSize: "0.75rem", fontWeight: 600 }}>€ {fmt(calc.addRev)}</span>
                </div>
                <div className="h-px bg-[#E8E8E8] my-1"/>
                <div className="flex items-center justify-between">
                  <span className="text-[#0B0B0B]/60" style={{ fontSize: "0.72rem", fontWeight: 600 }}>Impacto total mensual</span>
                  <span className="text-[#0B0B0B]" style={{ fontSize: "0.85rem", fontWeight: 700 }}>€ {fmt(calc.total)}</span>
                </div>
              </div>
              <p className="text-[#0B0B0B]/20 mt-2.5" style={{ fontSize: "0.55rem", lineHeight: 1.5 }}>
                Factores: eficiencia AI en {sector} ({Math.round((sectorEff[sector] || 1) * 100)}%), {usesAI ? "descuento por IA existente (–30%)" : "sin IA previa (100% potencial)"}, overhead coordinación equipo {teamSize} ({Math.round(((teamOverhead[teamSize] || 1) - 1) * 100)}% extra).
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, delay: 2.0 }} className="p-5 rounded-xl bg-[#0B0B0B] text-white text-center" style={{ boxShadow: "0 8px 40px rgba(11,11,11,0.15)" }}>
              <p className="text-white/35 tracking-[0.15em] mb-1" style={{ fontSize: "0.55rem", fontWeight: 500 }}>IMPACTO TOTAL ESTIMADO</p>
              <p style={{ fontSize: "2rem", fontWeight: 700 }}>€ {fmt(calc.total)}<span className="text-white/40" style={{ fontSize: "0.85rem" }}> /mes</span></p>
              <p className="text-white/30 mt-1" style={{ fontSize: "0.7rem" }}>≈ € {fmt(calc.annual)}/año · {annualImpactPct}% de tu facturación</p>
            </motion.div>
          </div>

          {/* Métricas operativas */}
          <div>
            <SectionHeader label="MÉTRICAS OPERATIVAS" delay={2.2}/>
            <div className="grid grid-cols-2 gap-3">
              <InsightCard icon={Clock} title="Horas liberadas" value={`${calc.hrsSaved}h / mes`} insight={`De ${hours}h/sem repetitivas, tu equipo recuperará ${calc.hrsSaved}h mensuales. Eso son ${Math.round(calc.hrsSaved / 8)} días laborales completos.`} delay={2.3}/>
              <InsightCard icon={Euro} title="Coste/hora ahorrado" value={`€ ${fmt(calc.monthlySav)}`} insight={`${calc.hrsSaved}h × ${costH}€/h = ahorro directo mensual. En 12 meses: €${fmt(calc.monthlySav * 12)}.`} delay={2.4}/>
              <InsightCard icon={Zap} title="Tiempo de respuesta" value={`${respTime} → ${calc.newResp} min`} insight={`Mejora del ${calc.respImprove}%. La media en ${sector} es ${sectorAvgResp}min. ${respTime > sectorAvgResp ? "Estás por encima de la media, hay margen." : "Ya estás bien, pero AI lo llevará al siguiente nivel."}`} delay={2.5}/>
              <InsightCard icon={TrendingUp} title="Revenue adicional" value={`€ ${fmt(calc.addRev)}/mes`} insight={`Sobre ${leads.toLocaleString()} leads con ticket medio de €${avgTicket >= 1000 ? Math.round(avgTicket/1000) + "K" : fmt(avgTicket)}. Boost conversión por ${h24 ? "atención 24/7" : "mejor respuesta"} + respuesta ${calc.respImprove}% más rápida.`} delay={2.6}/>
            </div>
          </div>

          {/* Benchmark */}
          <div>
            <SectionHeader label="BENCHMARK SECTORIAL" delay={2.7}/>
            <motion.div initial={{ opacity: 0, y: 8, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.5, delay: 2.8 }} className="p-4 rounded-xl border border-[#F0F0F0] bg-[#FAFAFA]">
              <div className="flex items-center gap-2 mb-3"><Building2 size={13} className="text-[#0B0B0B]/30"/><span className="text-[#0B0B0B]/35" style={{ fontSize: "0.65rem", fontWeight: 500 }}>{sector}</span></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[#0B0B0B]/25 mb-0.5" style={{ fontSize: "0.58rem" }}>Adopción AI en el sector</p><span className="text-[#0B0B0B]" style={{ fontSize: "1.3rem", fontWeight: 700 }}>{sectorAdoption}%</span><span className="text-[#0B0B0B]/25 ml-1" style={{ fontSize: "0.6rem" }}>de empresas</span><p className="text-[#0B0B0B]/30 mt-1" style={{ fontSize: "0.62rem", lineHeight: 1.5 }}>{usesAI ? `Ya formas parte del ${sectorAdoption}% que usa AI. El siguiente paso es escalar.` : `El ${sectorAdoption}% de empresas en ${sector} ya usa AI. Es momento de actuar.`}</p></div>
                <div><p className="text-[#0B0B0B]/25 mb-0.5" style={{ fontSize: "0.58rem" }}>Resp. media del sector</p><span className="text-[#0B0B0B]" style={{ fontSize: "1.3rem", fontWeight: 700 }}>{sectorAvgResp} min</span><p className="text-[#0B0B0B]/30 mt-1" style={{ fontSize: "0.62rem", lineHeight: 1.5 }}>{respTime > sectorAvgResp ? `Estás ${respTime - sectorAvgResp}min por encima. Con AI llegarás a ${calc.newResp}min.` : `Estás ${sectorAvgResp - respTime}min por debajo de la media. Con AI serás referente.`}</p></div>
              </div>
            </motion.div>
          </div>

          {/* Tareas */}
          {tasks.length > 0 && (<div>
            <SectionHeader label="AUTOMATIZACIÓN POR TAREA" delay={3.0}/>
            <div className="space-y-2.5">{taskBreakdown.map((t, i) => (
              <motion.div key={t.label} initial={{ opacity: 0, x: -10, filter: "blur(6px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ duration: 0.4, delay: 3.1 + i * 0.08 }} className="flex items-center gap-3 p-3 rounded-lg border border-[#F0F0F0] bg-white">
                <MiniDonut pct={t.savings} delay={3.1 + i * 0.08}/>
                <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="text-[#0B0B0B]" style={{ fontSize: "0.78rem", fontWeight: 500 }}>{t.label}</p><span className="text-[#0B0B0B]/30" style={{ fontSize: "0.6rem" }}>{t.hSaved}h · €{fmt(t.eurSaved)}</span></div><p className="text-[#0B0B0B]/30 mt-0.5" style={{ fontSize: "0.6rem" }}>{t.desc} · {Math.round(t.savings * 100)}% automatizable</p></div>
              </motion.div>))}</div>
          </div>)}

          {/* Recomendación personalizada */}
          <div>
            <SectionHeader label="RECOMENDACIÓN PERSONALIZADA" delay={3.5}/>
            <motion.div initial={{ opacity: 0, y: 10, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, delay: 3.6 }} className="p-5 rounded-xl border-2 border-[#0B0B0B]/8 bg-[#FAFAFA]">
              <div className="flex items-center gap-2 mb-3"><Target size={14} className="text-[#0B0B0B]/40"/><span className="text-[#0B0B0B]" style={{ fontSize: "0.75rem", fontWeight: 600 }}>Basado en tu prioridad: {priority}</span></div>
              <p className="text-[#0B0B0B]/50" style={{ fontSize: "0.75rem", lineHeight: 1.65 }}>{priorityRec[priority] ?? priorityRec["Reducir costes"]}</p>
            </motion.div>
          </div>

          {/* ═══ QUICK WINS — Soluciones Inmediatas ═══ */}
          <div>
            <SectionHeader label="QUICK WINS — SOLUCIONES INMEDIATAS" delay={3.7}/>
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 3.75 }} className="text-[#0B0B0B]/35 mb-5 -mt-1" style={{ fontSize: "0.7rem", lineHeight: 1.55 }}>
              3 ideas de tecnología seleccionadas para tu perfil ({sector} · {teamSize} pers. · {priority.toLowerCase()}) que se pueden poner en marcha en pocas semanas.
            </motion.p>
            <div className="space-y-3">
              {topIdeas.map((idea, i) => (
                <motion.div key={idea.id} initial={{ opacity: 0, y: 10, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.4, delay: 3.85 + i * 0.12 }} className="flex items-start gap-3 p-4 rounded-xl border border-[#F0F0F0] bg-white">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#F5F5F5", color: "#0B0B0B", fontSize: "0.7rem", fontWeight: 700 }}><idea.icon size={16}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[#0B0B0B]" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{idea.title}</p>
                      <span className="text-[#0B0B0B]/15" style={{ fontSize: "0.5rem" }}>#{i + 1}</span>
                    </div>
                    <p className="text-[#0B0B0B]/45 mb-2" style={{ fontSize: "0.68rem", lineHeight: 1.5 }}>{idea.getDescription(recCtx)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#0B0B0B]/35" style={{ fontSize: "0.5rem" }}><Timer size={8}/> {idea.setupTime}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#0B0B0B]/35" style={{ fontSize: "0.5rem" }}><Zap size={8}/> Impacto {idea.impact.toLowerCase()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 4.3 }} className="mt-4 p-4 rounded-xl bg-[#0B0B0B] text-white" style={{ boxShadow: "0 6px 30px rgba(11,11,11,0.12)" }}>
              <p className="text-white/40 tracking-[0.12em] mb-1.5" style={{ fontSize: "0.52rem", fontWeight: 600 }}>STACK COMBINADO — IMPACTO ESTIMADO</p>
              <p className="text-white mb-1" style={{ fontSize: "0.78rem", fontWeight: 500, lineHeight: 1.5 }}>Poniendo en marcha las 3 ideas a la vez, tu equipo de {teamSize} puede alcanzar un ahorro de <span style={{ fontWeight: 700 }}>€{fmt(calc.monthlySav)}/mes</span> y generar <span style={{ fontWeight: 700 }}>€{fmt(calc.addRev)}/mes</span> adicionales en las primeras 4–6 semanas.</p>
              <p className="text-white/30" style={{ fontSize: "0.6rem" }}>* Nuestro equipo se encarga de todo: análisis, configuración y puesta en marcha.</p>
            </motion.div>
          </div>

          {/* Timeline */}
          <div>
            <SectionHeader label="TIMELINE SUGERIDO" delay={4.5}/>
            <div className="space-y-0">{[
              { week: "Sem 1–2", title: "Auditoría & setup", desc: `Análisis profundo de tus ${tasks.length} procesos clave y diseño de la arquitectura AI.` },
              { week: "Sem 3–4", title: "Implementación", desc: `Despliegue de automatizaciones para ${taskBreakdown.slice(0, 2).map(t => t.label).join(" y ")}${taskBreakdown.length > 2 ? ` (+${taskBreakdown.length - 2} más)` : ""}.` },
              { week: "Sem 5–6", title: "Optimización & ROI", desc: `Fine-tuning y medición. Objetivo: ${calc.hrsSaved}h liberadas y €${fmt(calc.total)} de impacto/mes.` },
            ].map((phase, i) => (
              <motion.div key={phase.week} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 4.6 + i * 0.12 }} className="flex gap-4 py-3">
                <div className="flex flex-col items-center"><div className="w-2 h-2 rounded-full bg-[#0B0B0B] flex-shrink-0"/>{i < 2 && <div className="w-px flex-1 bg-[#E8E8E8] mt-1"/>}</div>
                <div className="pb-2"><p className="text-[#0B0B0B]/25 mb-0.5" style={{ fontSize: "0.58rem", fontWeight: 600 }}>{phase.week}</p><p className="text-[#0B0B0B] mb-1" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{phase.title}</p><p className="text-[#0B0B0B]/35" style={{ fontSize: "0.68rem", lineHeight: 1.55 }}>{phase.desc}</p></div>
              </motion.div>))}</div>
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 5.0 }} className="text-center pt-4 pb-2">
            <div className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0B0B0B] text-white rounded-full" style={{ fontSize: "0.9rem", fontWeight: 500, boxShadow: "0 6px 30px rgba(11,11,11,0.12)" }}><Calendar size={15}/>Reservar sesión estratégica gratuita<ArrowUpRight size={14} className="text-white/50"/></div>
            <p className="text-[#0B0B0B]/20 mt-4" style={{ fontSize: "0.58rem", lineHeight: 1.6 }}>Sesión de 30 min · Sin compromiso · Resultados en 48h</p>
          </motion.div>

          {/* Footer */}
          <div className="pt-6 border-t border-[#F0F0F0] text-center">
            <p className="text-[#0B0B0B]/15" style={{ fontSize: "0.55rem", lineHeight: 1.6 }}>The AI Business · info@theaibusiness.com<br/>* Todas las estimaciones están basadas en benchmarks del sector y los datos proporcionados.<br/>Los resultados reales pueden variar según la implementación.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}