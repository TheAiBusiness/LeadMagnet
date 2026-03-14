import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useAnimate,
} from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  TrendingUp,
  Clock,
  Euro,
  BarChart3,
  ChevronDown,
  Download,
} from "lucide-react";
import { EmailReport } from "./EmailReport";
import { API_BASE, CALENDLY_URL } from "../lib/constants";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/* ─── Data ─── */
const SECTORS = [
  "Ecommerce",
  "Servicios",
  "Inmobiliaria",
  "Salud",
  "Logística",
  "Agencia",
  "SaaS",
  "Otros",
];

/* ─── Context-aware slider engine (uses ALL previous answers) ─── */
type SliderCfg = {
  label: string;
  min: number;
  max: number;
  step?: number;
  unit: string;
};
type MetricsConfig = {
  subtitle: string;
  ticketLabel: string;
  sliders: [SliderCfg, SliderCfg, SliderCfg, SliderCfg];
};

const TASK_SHORT: Record<string, string> = {
  "Atención cliente": "soporte",
  Emails: "emails",
  "Entrada datos": "datos",
  Informes: "informes",
  Leads: "leads",
  Agenda: "agenda",
  Facturación: "facturación",
  Contenido: "contenido",
};

function buildMetricsConfig(
  _sector: string,
  _teamSize: string,
  _revenue: string,
  _usesAI: boolean | null,
  _tasks: string[],
): MetricsConfig {
  const sector = _sector || "Otros";
  const teamSize = _teamSize || "6 – 20";
  const tasks = _tasks || [];
  const usesAI = _usesAI;

  /* ── Contextual subtitle ── */
  const teamMap: Record<string, string> = {
    "1 – 5": "un equipo pequeño de 1–5",
    "6 – 20": "un equipo de 6–20",
    "21 – 50": "una empresa de 21–50",
    "50 +": "una organización de +50",
  };
  const teamDesc = teamMap[teamSize] || "tu equipo";
  const aiHint = usesAI
    ? " — ya usáis IA, ajusta el margen real de mejora"
    : " — sin IA activa, el potencial de ahorro es mayor";
  const subtitle = `Para ${teamDesc} personas en ${sector}${aiHint}.`;

  /* ── Dynamic ranges based on team + revenue ── */
  const teamRanges: Record<
    string,
    { maxH: number; maxVol: number }
  > = {
    "1 – 5": { maxH: 40, maxVol: 1500 },
    "6 – 20": { maxH: 60, maxVol: 3000 },
    "21 – 50": { maxH: 80, maxVol: 5000 },
    "50 +": { maxH: 80, maxVol: 5000 },
  };
  const tr = teamRanges[teamSize] || { maxH: 80, maxVol: 5000 };
  const revIdx = REVENUES.findIndex(
    (r) => r.label === _revenue,
  );
  const maxCost =
    revIdx >= 4
      ? 120
      : revIdx >= 3
        ? 100
        : revIdx >= 2
          ? 80
          : 60;

  /* ── Task-aware short names (pick first 2) ── */
  const shortTasks = tasks
    .slice(0, 2)
    .map((t) => TASK_SHORT[t] || t.toLowerCase());
  const taskFragment = shortTasks.length
    ? shortTasks.join(" y ").toUpperCase()
    : null;

  /* ── SLIDER 1: Hours — what eats their time ── */
  const hoursBase: Record<string, string> = {
    Ecommerce: "HORAS PROCESANDO PEDIDOS",
    Servicios: "HORAS EN GESTIÓN ADMINISTRATIVA",
    Inmobiliaria: "HORAS EN GESTIÓN DE PROPIEDADES",
    Salud: "HORAS EN TAREAS CLÍNICO-ADMIN",
    Logística: "HORAS EN OPERATIVA MANUAL",
    Agencia: "HORAS EN PRODUCCIÓN MANUAL",
    SaaS: "HORAS EN OPS Y SOPORTE MANUAL",
    Otros: "HORAS EN TAREAS REPETITIVAS",
  };
  const hoursLabel = taskFragment
    ? `HORAS EN ${taskFragment} / SEM`
    : `${hoursBase[sector] || hoursBase.Otros} / SEM`;

  /* ── SLIDER 2: Cost — who's doing it (role × team size) ── */
  const roleMap: Record<string, Record<string, string>> = {
    "1 – 5": {
      Ecommerce: "COSTE / HORA FUNDADOR–EQUIPO",
      SaaS: "COSTE / HORA FUNDADOR–DEV",
      Agencia: "COSTE / HORA FUNDADOR–CREATIVO",
      Salud: "COSTE / HORA PROFESIONAL SANITARIO",
      Inmobiliaria: "COSTE / HORA AGENTE",
      Logística: "COSTE / HORA RESPONSABLE OPS",
      Servicios: "COSTE / HORA PROFESIONAL",
      Otros: "COSTE / HORA EMPLEADO",
    },
    "6 – 20": {
      Ecommerce: "COSTE MEDIO / HORA EQUIPO",
      SaaS: "COSTE MEDIO / HORA DEVELOPER",
      Agencia: "COSTE MEDIO / HORA EQUIPO CREATIVO",
      Salud: "COSTE MEDIO / HORA PERSONAL",
      Inmobiliaria: "COSTE MEDIO / HORA AGENTE",
      Logística: "COSTE MEDIO / HORA OPERARIO",
      Servicios: "COSTE MEDIO / HORA EQUIPO",
      Otros: "COSTE MEDIO / HORA EMPLEADO",
    },
    "21 – 50": {
      Ecommerce: "COSTE MEDIO / HORA EMPLEADO",
      SaaS: "COSTE MEDIO / HORA EQUIPO TECH",
      Agencia: "COSTE MEDIO / HORA EQUIPO",
      Salud: "COSTE MEDIO / HORA PERSONAL CLÍNICO",
      Inmobiliaria: "COSTE MEDIO / HORA EQUIPO COMERCIAL",
      Logística: "COSTE MEDIO / HORA OPERARIO",
      Servicios: "COSTE MEDIO / HORA EQUIPO",
      Otros: "COSTE MEDIO / HORA EMPLEADO",
    },
    "50 +": {
      Ecommerce: "COSTE MEDIO / HORA DEPARTAMENTO",
      SaaS: "COSTE MEDIO / HORA EQUIPO TECH",
      Agencia: "COSTE MEDIO / HORA EQUIPO",
      Salud: "COSTE MEDIO / HORA PERSONAL",
      Inmobiliaria: "COSTE MEDIO / HORA RED DE AGENTES",
      Logística: "COSTE MEDIO / HORA PLANTILLA OPS",
      Servicios: "COSTE MEDIO / HORA EQUIPO",
      Otros: "COSTE MEDIO / HORA PLANTILLA",
    },
  };
  const costRoles = roleMap[teamSize] || roleMap["6 – 20"];
  const costLabel =
    costRoles[sector] ||
    costRoles.Otros ||
    "COSTE MEDIO / HORA";

  /* ── SLIDER 3: Volume — what flows through (sector × tasks) ── */
  const volBase: Record<string, string> = {
    Ecommerce: "PEDIDOS Y CONSULTAS",
    Servicios: "SOLICITUDES DE SERVICIO",
    Inmobiliaria: "CONTACTOS DE INTERESADOS",
    Salud: "CITAS Y CONSULTAS",
    Logística: "ENVÍOS E INCIDENCIAS",
    Agencia: "PROYECTOS Y SOLICITUDES",
    SaaS: "TICKETS Y SIGNUPS",
    Otros: "CONSULTAS Y GESTIONES",
  };
  let volLabel = volBase[sector] || volBase.Otros;
  if (
    tasks.includes("Leads") &&
    tasks.includes("Atención cliente")
  ) {
    const ve: Record<string, string> = {
      Ecommerce: "LEADS + CONSULTAS DE COMPRA",
      SaaS: "LEADS + TICKETS DE SOPORTE",
      Agencia: "LEADS + SOLICITUDES DE PROYECTO",
      Salud: "PACIENTES NUEVOS + CONSULTAS",
      Inmobiliaria: "LEADS + VISITAS SOLICITADAS",
      Logística: "NUEVOS CLIENTES + INCIDENCIAS",
      Servicios: "LEADS + SOLICITUDES ENTRANTES",
      Otros: "LEADS + CONSULTAS ENTRANTES",
    };
    volLabel = ve[sector] || ve.Otros;
  } else if (tasks.includes("Leads")) {
    volLabel =
      (
        {
          SaaS: "LEADS Y TRIALS",
          Inmobiliaria: "LEADS DE INTERESADOS",
          Salud: "PACIENTES NUEVOS",
        } as Record<string, string>
      )[sector] || "LEADS ENTRANTES";
  } else if (tasks.includes("Atención cliente")) {
    volLabel =
      (
        {
          SaaS: "TICKETS DE SOPORTE",
          Salud: "CONSULTAS DE PACIENTES",
          Ecommerce: "CONSULTAS POST-VENTA",
        } as Record<string, string>
      )[sector] || "CONSULTAS DE CLIENTES";
  }
  volLabel += " / MES";

  /* ── SLIDER 4: Response time — what are they waiting on ── */
  const respBase: Record<string, string> = {
    Ecommerce: "TIEMPO RESPUESTA AL COMPRADOR",
    Servicios: "TIEMPO DE RESPUESTA AL CLIENTE",
    Inmobiliaria: "TIEMPO RESPUESTA AL INTERESADO",
    Salud: "TIEMPO DE ESPERA DEL PACIENTE",
    Logística: "TIEMPO RESOLUCIÓN DE INCIDENCIA",
    Agencia: "TIEMPO DE ENTREGA AL CLIENTE",
    SaaS: "TIEMPO DE PRIMERA RESPUESTA",
    Otros: "TIEMPO MEDIO DE RESPUESTA",
  };
  let respLabel = respBase[sector] || respBase.Otros;
  if (tasks.includes("Atención cliente")) {
    const rt: Record<string, string> = {
      SaaS: "RESPUESTA A TICKET DE SOPORTE",
      Salud: "RESPUESTA A CONSULTA PACIENTE",
      Ecommerce: "RESPUESTA A CONSULTA DE COMPRA",
      Inmobiliaria: "RESPUESTA A INTERESADO",
      Logística: "RESPUESTA A INCIDENCIA",
      Agencia: "RESPUESTA AL CLIENTE",
      Servicios: "RESPUESTA A SOLICITUD",
      Otros: "RESPUESTA A CLIENTE",
    };
    respLabel = rt[sector] || rt.Otros;
  } else if (tasks.includes("Leads")) {
    respLabel = "TIEMPO DE CONTACTO CON LEAD";
  }

  /* ── TICKET MEDIO label (sector-aware) ── */
  const ticketLabels: Record<string, string> = {
    Ecommerce: "TICKET MEDIO POR PEDIDO",
    SaaS: "TICKET MEDIO POR SUSCRIPCIÓN",
    Agencia: "TICKET MEDIO POR PROYECTO",
    Servicios: "TICKET MEDIO POR SERVICIO",
    Salud: "TICKET MEDIO POR CONSULTA",
    Inmobiliaria: "COMISIÓN MEDIA POR OPERACIÓN",
    Logística: "TICKET MEDIO POR ENVÍO",
    Otros: "TICKET MEDIO POR OPERACIÓN",
  };
  const ticketLabel =
    ticketLabels[sector] || ticketLabels.Otros;

  return {
    subtitle,
    ticketLabel,
    sliders: [
      { label: hoursLabel, min: 1, max: tr.maxH, unit: "h" },
      {
        label: costLabel,
        min: 10,
        max: maxCost,
        step: 5,
        unit: "€/h",
      },
      {
        label: volLabel,
        min: 10,
        max: tr.maxVol,
        step: 10,
        unit: "",
      },
      { label: respLabel, min: 1, max: 240, unit: "min" },
    ],
  };
}

const TEAMS = [
  { label: "1 – 5", multiplier: 3 },
  { label: "6 – 20", multiplier: 12 },
  { label: "21 – 50", multiplier: 35 },
  { label: "50 +", multiplier: 70 },
];
const REVENUES = [
  { label: "< 100 K €", value: 80000 },
  { label: "100 K – 500 K €", value: 300000 },
  { label: "500 K – 2 M €", value: 1200000 },
  { label: "2 M – 10 M €", value: 5000000 },
  { label: "> 10 M €", value: 15000000 },
];
const TASKS = [
  { label: "Atención cliente", savings: 0.7 },
  { label: "Emails", savings: 0.6 },
  { label: "Entrada datos", savings: 0.85 },
  { label: "Informes", savings: 0.75 },
  { label: "Leads", savings: 0.65 },
  { label: "Agenda", savings: 0.8 },
  { label: "Facturación", savings: 0.7 },
  { label: "Contenido", savings: 0.5 },
];
const PRIORITIES = [
  "Reducir costes",
  "Más ventas",
  "Mejor soporte",
  "Acelerar procesos",
];

/* ─── Pill ─── */
function Pill({
  active,
  onClick,
  children,
  big,
  delay = 0,
  groupId,
  multi,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  big?: boolean;
  delay?: number;
  groupId?: string;
  multi?: boolean;
}) {
  const [justClicked, setJustClicked] = useState(false);

  const handleClick = useCallback(() => {
    setJustClicked(true);
    onClick();
    setTimeout(() => setJustClicked(false), 350);
  }, [onClick]);

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, filter: "blur(10px)", y: 8 }}
      animate={
        justClicked
          ? {
              opacity: 1,
              filter: "blur(3px)",
              y: 0,
              scale: 0.92,
            }
          : { opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }
      }
      transition={
        justClicked
          ? { type: "spring", stiffness: 400, damping: 18 }
          : {
              duration: 0.4,
              delay: active ? 0 : delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }
      }
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      style={{
        position: "relative",
        backgroundColor: active
          ? "#0B0B0B"
          : "rgba(255,255,255,0.9)",
        color: active ? "#fff" : "rgba(11,11,11,0.5)",
        borderColor: active ? "#0B0B0B" : "#E8E8E8",
        fontSize: big ? "1.05rem" : "0.95rem",
        fontWeight: active ? 500 : 400,
        zIndex: active ? 2 : 1,
      }}
      className={`rounded-full border cursor-pointer select-none ${big ? "px-7 py-3.5" : "px-6 py-3"}`}
    >
      {active && groupId && !multi && (
        <motion.div
          layoutId={`pill-shadow-${groupId}`}
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "0 8px 32px rgba(11,11,11,0.22), 0 2px 8px rgba(11,11,11,0.12)",
            zIndex: -1,
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 26,
            mass: 0.9,
          }}
        />
      )}
      {active && multi && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "0 6px 24px rgba(11,11,11,0.18), 0 2px 6px rgba(11,11,11,0.10)",
            zIndex: -1,
          }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 22,
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

/* ─── Slider ─── */
function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  delay = 0,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 12 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <div className="flex justify-between items-end mb-3">
        <span
          className="text-[#0B0B0B]/30"
          style={{
            fontSize: "0.7rem",
            fontWeight: 500,
            letterSpacing: "0.12em",
          }}
        >
          {label}
        </span>
        <span
          className="text-[#0B0B0B]"
          style={{ fontSize: "1.8rem", fontWeight: 600 }}
        >
          {value.toLocaleString()}
          <span
            className="text-[#0B0B0B]/30"
            style={{ fontSize: "0.9rem", fontWeight: 400 }}
          >
            {" "}
            {unit}
          </span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step || 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-[#EBEBEB] rounded-full appearance-none cursor-pointer accent-[#0B0B0B]"
      />
    </motion.div>
  );
}

/* ─── Log-scale Slider for ticket medio (€10 → €100K) ─── */
const LOG_MIN = Math.log10(10); // 1
const LOG_MAX = Math.log10(100000); // 5
const LOG_STEPS = 1000;

function logToValue(pos: number): number {
  const v = Math.pow(
    10,
    LOG_MIN + (pos / LOG_STEPS) * (LOG_MAX - LOG_MIN),
  );
  if (v < 100) return Math.round(v / 5) * 5;
  if (v < 1000) return Math.round(v / 10) * 10;
  if (v < 10000) return Math.round(v / 100) * 100;
  return Math.round(v / 500) * 500;
}
function valueToLog(val: number): number {
  return Math.round(
    ((Math.log10(Math.max(val, 10)) - LOG_MIN) /
      (LOG_MAX - LOG_MIN)) *
      LOG_STEPS,
  );
}
function fmtTicket(v: number): string {
  if (v >= 1000)
    return `${(v / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 })}K`;
  return v.toLocaleString("es-ES");
}

function LogSliderInput({
  label,
  value,
  onChange,
  delay = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 12 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <div className="flex justify-between items-end mb-3">
        <span
          className="text-[#0B0B0B]/30"
          style={{
            fontSize: "0.7rem",
            fontWeight: 500,
            letterSpacing: "0.12em",
          }}
        >
          {label}
        </span>
        <span
          className="text-[#0B0B0B]"
          style={{ fontSize: "1.8rem", fontWeight: 600 }}
        >
          €{fmtTicket(value)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={LOG_STEPS}
        step={1}
        value={valueToLog(value)}
        onChange={(e) =>
          onChange(logToValue(Number(e.target.value)))
        }
        className="w-full h-2 bg-[#EBEBEB] rounded-full appearance-none cursor-pointer accent-[#0B0B0B]"
      />
      <div className="flex justify-between mt-1.5">
        {["10€", "100€", "1K", "10K", "100K"].map((t) => (
          <span
            key={t}
            className="text-[#0B0B0B]/15"
            style={{ fontSize: "0.5rem" }}
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Slide wrapper with blur transitions ─── */
const slideAnim = {
  enter: (d: number) => ({
    x: d > 0 ? 60 : -60,
    opacity: 0,
    filter: "blur(16px)",
  }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (d: number) => ({
    x: d > 0 ? -60 : 60,
    opacity: 0,
    filter: "blur(16px)",
  }),
};
const slideTrans = {
  duration: 0.45,
  ease: [0.25, 0.46, 0.45, 0.94],
};

/* ─── Main ─── */
interface CalculatorProps {
  id?: string;
}

const ROLE_KEYS = ["roleCeo", "roleDireccion", "roleOps", "roleTech", "roleOtro"] as const;
const EMPLOYEE_KEYS = ["e1_10", "e11_50", "e51_200", "e200"] as const;
const CLIENT_KEYS = ["c1_10", "c11_50", "c51_200", "c201_1000", "c1000"] as const;
const UPSELL_KEYS = ["yesClear", "sometimes", "little", "no"] as const;
const MEMORY_KEYS = ["rarely", "sometimes", "often", "tooMany"] as const;
const ABSENCE_KEYS = ["same", "adjustments", "slowdown", "depends"] as const;
const LOSTTIME_KEYS = ["rarely", "sometimes", "quite", "tooMuch"] as const;
const MANUAL_KEYS = ["almostNone", "some", "quite", "tooMuch"] as const;
const PROFIT_KEYS = ["yesClear", "moreOrLess", "intuition", "dontKnow"] as const;
const OPPORTUNITY_KEYS = ["fast", "sometimes", "hard", "late"] as const;
const DOUBLE_KEYS = ["ok", "adjustments", "complicated", "break"] as const;
const DISORDER_KEYS = ["control", "freeTeam", "opportunities", "processes", "scale"] as const;

export function Calculator({ id }: CalculatorProps) {
  const { t, i18n } = useTranslation();
  const TOTAL_STEPS = 13; // 12 preguntas + 1 captura email
  const [step, setStep] = useState(0); // Empezamos en 0 para la pantalla inicial
  const [dir, setDir] = useState(1);

  /* slot-machine spin trigger */
  const [spinKey, setSpinKey] = useState(0);
  const [metricsRef, animateMetrics] = useAnimate();

  // Nuevas variables de estado para las 12 preguntas
  const [role, setRole] = useState("");
  const [employees, setEmployees] = useState("");
  const [clients, setClients] = useState("");
  const [upselling, setUpselling] = useState("");
  const [memoryDecisions, setMemoryDecisions] = useState("");
  const [absence, setAbsence] = useState("");
  const [lostTime, setLostTime] = useState("");
  const [manualWork, setManualWork] = useState("");
  const [profitVisibility, setProfitVisibility] = useState("");
  const [opportunities, setOpportunities] = useState("");
  const [doubleClients, setDoubleClients] = useState("");
  const [mainDisorder, setMainDisorder] = useState("");

  // Mantenemos algunas variables para compatibilidad con el motor de cálculo
  const [sector, setSector] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [revenue, setRevenue] = useState("");
  const [usesAI, setUsesAI] = useState<boolean | null>(null);
  const [tasks, setTasks] = useState<string[]>([]);
  const [hours, setHours] = useState(20);
  const [costH, setCostH] = useState(25);
  const [leads, setLeads] = useState(500);
  const [respTime, setRespTime] = useState(30);
  const [avgTicket, setAvgTicket] = useState(200);
  const [h24, setH24] = useState<boolean | null>(null);
  const [priority, setPriority] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  /* PDF download */
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = useCallback(async () => {
    if (!reportRef.current || downloading) return;
    setDownloading(true);
    try {
      const el = reportRef.current;

      /* ── Helper: resolve any oklch() → rgb() via browser engine ── */
      const resolveOklch = (raw: string): string => {
        if (!raw || !raw.includes("oklch")) return raw;
        return raw.replace(
          /oklch\([^)]*(?:\([^)]*\)[^)]*)*\)/gi,
          (match) => {
            const d = document.createElement("div");
            d.style.color = match;
            document.body.appendChild(d);
            const rgb = getComputedStyle(d).color;
            document.body.removeChild(d);
            return rgb || "transparent";
          },
        );
      };

      /* ── 1. Patch <style> tag textContent — html2canvas reads raw CSS ── */
      const savedStyleTexts: {
        styleEl: HTMLStyleElement;
        original: string;
      }[] = [];
      try {
        document
          .querySelectorAll("style")
          .forEach((styleEl) => {
            const txt = styleEl.textContent || "";
            if (txt.includes("oklch")) {
              savedStyleTexts.push({ styleEl, original: txt });
              styleEl.textContent = txt.replace(
                /oklch\([^)]*(?:\([^)]*\)[^)]*)*\)/gi,
                (m) => resolveOklch(m),
              );
            }
          });
      } catch {
        /* ignore */
      }

      /* ── 2. Patch LIVE CSSOM rules — replace oklch in-place ── */
      const savedRules: {
        rule: CSSStyleRule;
        prop: string;
        original: string;
        priority: string;
      }[] = [];
      try {
        const processRules = (ruleList: CSSRuleList) => {
          for (let j = 0; j < ruleList.length; j++) {
            const rule = ruleList[j];
            if (
              "cssRules" in rule &&
              (rule as CSSGroupingRule).cssRules
            ) {
              processRules((rule as CSSGroupingRule).cssRules);
              continue;
            }
            if (!(rule instanceof CSSStyleRule)) continue;
            for (let k = 0; k < rule.style.length; k++) {
              const prop = rule.style[k];
              const val = rule.style.getPropertyValue(prop);
              if (val && val.includes("oklch")) {
                const priority =
                  rule.style.getPropertyPriority(prop);
                savedRules.push({
                  rule,
                  prop,
                  original: val,
                  priority,
                });
                rule.style.setProperty(
                  prop,
                  resolveOklch(val),
                  priority,
                );
              }
            }
          }
        };
        for (let i = 0; i < document.styleSheets.length; i++) {
          try {
            processRules(document.styleSheets[i].cssRules);
          } catch {
            /* cross-origin */
          }
        }
      } catch {
        /* ignore */
      }

      /* ── 3. Patch computed oklch on element styles inside report ── */
      const savedInline: {
        el: HTMLElement;
        prop: string;
        original: string;
      }[] = [];
      const allEls = [
        el,
        ...Array.from(el.querySelectorAll("*")),
      ];
      const COLOR_PROPS = [
        "color",
        "backgroundColor",
        "borderColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "outlineColor",
        "textDecorationColor",
        "boxShadow",
        "background",
      ];
      allEls.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        const comp = getComputedStyle(node);
        COLOR_PROPS.forEach((camel) => {
          const kebab = camel.replace(
            /[A-Z]/g,
            (c) => "-" + c.toLowerCase(),
          );
          const v = comp.getPropertyValue(kebab);
          if (v && v.includes("oklch")) {
            savedInline.push({
              el: node,
              prop: camel,
              original: (node.style as any)[camel] || "",
            });
            (node.style as any)[camel] = resolveOklch(v);
          }
        });
        /* Also patch CSS custom properties (--*) containing oklch */
        const inlineStyle = node.getAttribute("style") || "";
        const cssVarMatches = inlineStyle.match(/--[\w-]+/g);
        if (cssVarMatches) {
          cssVarMatches.forEach((varName) => {
            const v = comp.getPropertyValue(varName).trim();
            if (v && v.includes("oklch")) {
              savedInline.push({
                el: node,
                prop: varName,
                original: node.style.getPropertyValue(varName),
              });
              node.style.setProperty(varName, resolveOklch(v));
            }
          });
        }
      });

      /* ── 4. Capture ── */
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      /* ── 5. Restore <style> tag text ── */
      savedStyleTexts.forEach(({ styleEl, original }) => {
        styleEl.textContent = original;
      });

      /* ── 6. Restore CSSOM rules ── */
      savedRules.forEach(
        ({ rule, prop, original, priority }) => {
          rule.style.setProperty(prop, original, priority);
        },
      );

      /* ── 7. Restore inline styles ── */
      savedInline.forEach(({ el: node, prop, original }) => {
        if (prop.startsWith("--")) {
          node.style.setProperty(prop, original);
        } else {
          (node.style as any)[prop] = original;
        }
      });

      /* ── Generate PDF ── */
      const imgData = canvas.toDataURL("image/png");
      const imgW = canvas.width;
      const imgH = canvas.height;

      const pdfW = 210;
      const margin = 10;
      const contentW = pdfW - margin * 2;
      const contentH = (imgH * contentW) / imgW;
      const pageH = 297 - margin * 2;

      const pdf = new jsPDF("p", "mm", "a4");

      if (contentH <= pageH) {
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin,
          contentW,
          contentH,
        );
      } else {
        const pageCanvasHeight = (pageH / contentH) * imgH;
        let yOffset = 0;
        let page = 0;

        while (yOffset < imgH) {
          if (page > 0) pdf.addPage();
          const sliceH = Math.min(
            pageCanvasHeight,
            imgH - yOffset,
          );
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = imgW;
          sliceCanvas.height = sliceH;
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, imgW, sliceH);
            ctx.drawImage(
              canvas,
              0,
              yOffset,
              imgW,
              sliceH,
              0,
              0,
              imgW,
              sliceH,
            );
          }
          const sliceData = sliceCanvas.toDataURL("image/png");
          const sliceMMH = (sliceH * contentW) / imgW;
          pdf.addImage(
            sliceData,
            "PNG",
            margin,
            margin,
            contentW,
            sliceMMH,
          );
          yOffset += pageCanvasHeight;
          page++;
        }
      }

      const safeName = (name || "empresa")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      pdf.save(`informe-ai-${safeName}.pdf`);
    } catch (e) {
      console.error("PDF generation error:", e);
    } finally {
      setDownloading(false);
    }
  }, [downloading, name]);

  /* ══════ PRECISION CALCULATION ENGINE ══════
     Every factor from the previous slides feeds in:
     · Sector    → automation efficiency, conversion rates, 24/7 boost
     · Team size → coordination-overhead savings multiplier
     · Revenue   → average deal value for addRev
     · Uses AI?  → discount on remaining automation headroom
     · Tasks     → per-task savings (not a flat average)
     · Hours     → base weekly repetitive hours
     · CostH     → cost per hour of affected staff
     · Leads     → pipeline volume for revenue uplift
     · RespTime  → current response latency
     · H24       → night-coverage conversion boost
  ══════════════════════════════════════════ */
  const calc = useMemo(() => {
    /* ── 1. Sector AI automation efficiency curves ── */
    const sectorEff: Record<string, number> = {
      SaaS: 1.15,
      Ecommerce: 1.1,
      Logística: 1.08,
      Agencia: 1.05,
      Servicios: 1.0,
      Inmobiliaria: 0.95,
      Salud: 0.92,
      Otros: 1.0,
    };
    const eff = sectorEff[sector] || 1.0;
    const aiDiscount = usesAI
      ? 0.7
      : 1.0; /* already using AI → 30 % less room */

    /* ── 2. Per-task hour savings (granular, not averaged) ── */
    const monthlyH = hours * 4.33;
    let totalHrsSaved = 0;
    if (tasks.length > 0) {
      const perTask = monthlyH / tasks.length;
      tasks.forEach((t) => {
        const base =
          TASKS.find((x) => x.label === t)?.savings || 0.6;
        totalHrsSaved +=
          perTask * Math.min(base * eff * aiDiscount, 0.95);
      });
    } else {
      totalHrsSaved = monthlyH * 0.5 * eff * aiDiscount;
    }
    const hrsSaved = Math.round(totalHrsSaved);

    /* ── 3. Operational savings (+ team-coordination overhead) ── */
    const teamMult: Record<string, number> = {
      "1 – 5": 1.0,
      "6 – 20": 1.08,
      "21 – 50": 1.15,
      "50 +": 1.22,
    };
    const monthlySav = Math.round(
      hrsSaved * costH * (teamMult[teamSize] || 1.0),
    );

    /* ── 4. Revenue uplift — multi-factor conversion model ── */

    /* 4a. Sector base conversion rate (lead → sale) */
    const baseConvRate: Record<string, number> = {
      Ecommerce: 0.025,
      SaaS: 0.045,
      Salud: 0.03,
      Inmobiliaria: 0.008,
      Logística: 0.02,
      Agencia: 0.035,
      Servicios: 0.025,
      Otros: 0.02,
    };
    const baseConv = baseConvRate[sector] || 0.02;

    /* 4b. Response-time reduction */
    const attnFactor = tasks.includes("Atención cliente")
      ? 0.8
      : 1.0;
    const effFactor = eff > 1 ? 0.9 : 1.0;
    const reductionK = h24 ? 0.05 : 0.15;
    const newResp = Math.max(
      Math.round(
        respTime * reductionK * attnFactor * effFactor,
      ),
      1,
    );
    const respDrop = (respTime - newResp) / respTime;
    /* Harvard BR: 50 % faster response ≈ +15 % conversions (RELATIVE boost) */
    const convFromResp = respDrop * 0.3;

    /* 4c. 24/7 night-coverage conversion boost (RELATIVE, sector-specific) */
    const h24Mult: Record<string, number> = {
      Ecommerce: 0.08,
      SaaS: 0.06,
      Salud: 0.07,
      Inmobiliaria: 0.04,
      Logística: 0.05,
      Agencia: 0.03,
      Servicios: 0.05,
      Otros: 0.04,
    };
    const nightBoost = h24 ? h24Mult[sector] || 0.04 : 0;

    /* 4d. "Leads" task affinity bonus (RELATIVE) */
    const leadBoost = tasks.includes("Leads") ? 0.03 : 0;

    /* Total RELATIVE improvement on base conversion rate */
    const relativeBoost = convFromResp + nightBoost + leadBoost;
    /* Incremental conversions = leads × baseConv × relativeBoost */
    const incrementalConv = leads * baseConv * relativeBoost;
    /* addRev = incremental conversions × avgTicket (from user slider) */
    let addRev = Math.round(incrementalConv * avgTicket);

    /* Sanity cap: addRev ≤ 12 % of declared annual revenue (monthly equiv.) */
    const declaredAnnual =
      REVENUES.find((r) => r.label === revenue)?.value ||
      300000;
    const monthlyRevCap = Math.round(
      (declaredAnnual * 0.12) / 12,
    );
    addRev = Math.min(addRev, monthlyRevCap);

    /* ── 5. Response metrics ── */
    const respImprove = Math.round(respDrop * 100);

    /* ── 6. AI Score — multi-dimensional ── */
    const score = Math.min(
      Math.round(
        (hours / 80) * 22 +
          (tasks.length / 8) * 18 +
          (leads / 5000) * 14 +
          (respTime / 240) * 12 +
          (h24 ? 10 : 0) +
          (usesAI === false ? 10 : 5) +
          (eff > 1 ? 7 : 4) +
          (
            {
              "50 +": 5,
              "21 – 50": 4,
              "6 – 20": 3,
              "1 – 5": 2,
            } as Record<string, number>
          )[teamSize] || 3,
      ),
      100,
    );

    const total = monthlySav + addRev;
    const annual = total * 12;

    return {
      hrsSaved,
      monthlySav,
      addRev,
      newResp,
      respImprove,
      score,
      total,
      annual,
      avgTicket,
    };
  }, [
    hours,
    costH,
    tasks,
    leads,
    respTime,
    h24,
    usesAI,
    sector,
    teamSize,
    avgTicket,
    revenue,
  ]);

  const toggleTask = (t: string) =>
    setTasks((p) =>
      p.includes(t) ? p.filter((x) => x !== t) : [...p, t],
    );
  const next = useCallback(() => {
    setDir(1);
    setStep((s) => (s < TOTAL_STEPS ? s + 1 : s));
    setSpinKey((k) => k + 1);
  }, []);
  const prev = () => {
    if (step > 0) {
      setDir(-1);
      setStep(step - 1);
    }
  };

  /* Auto-advance for single-select steps */
  const pendingAdvanceRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const autoAdvance = useCallback(() => {
    if (pendingAdvanceRef.current)
      clearTimeout(pendingAdvanceRef.current);
    pendingAdvanceRef.current = setTimeout(() => {
      next();
      pendingAdvanceRef.current = null;
    }, 420);
  }, [next]);
  useEffect(
    () => () => {
      if (pendingAdvanceRef.current)
        clearTimeout(pendingAdvanceRef.current);
    },
    [],
  );

  /* ── Smart presets for step 6 sliders based on previous answers ── */
  const presetsAppliedRef = useRef(false);
  useEffect(() => {
    if (step !== 6 || presetsAppliedRef.current) return;
    presetsAppliedRef.current = true;

    const teamBase: Record<string, number> = {
      "1 – 5": 12,
      "6 – 20": 25,
      "21 – 50": 40,
      "50 +": 60,
    };
    let h = teamBase[teamSize] ?? 20;
    h += Math.round(tasks.length * 2.5);
    if (usesAI === false) h = Math.round(h * 1.2);
    if (["Ecommerce", "Logística"].includes(sector))
      h = Math.round(h * 1.15);
    setHours(Math.min(Math.max(h, 1), 80));

    const sectorCost: Record<string, number> = {
      SaaS: 45,
      Agencia: 40,
      Salud: 38,
      Inmobiliaria: 32,
      Ecommerce: 28,
      Servicios: 25,
      Logística: 22,
      Otros: 28,
    };
    let c = sectorCost[sector] ?? 25;
    const revIdx = REVENUES.findIndex(
      (r) => r.label === revenue,
    );
    if (revIdx >= 3) c += 10;
    else if (revIdx === 2) c += 5;
    setCostH(
      Math.min(Math.max(Math.round(c / 5) * 5, 10), 120),
    );

    const sectorLeads: Record<string, number> = {
      Ecommerce: 1200,
      SaaS: 600,
      Agencia: 350,
      Servicios: 200,
      Salud: 300,
      Inmobiliaria: 150,
      Logística: 250,
      Otros: 300,
    };
    let l = sectorLeads[sector] ?? 300;
    const teamMult: Record<string, number> = {
      "1 – 5": 0.5,
      "6 – 20": 1,
      "21 – 50": 1.6,
      "50 +": 2.5,
    };
    l = Math.round(l * (teamMult[teamSize] ?? 1));
    if (revIdx >= 3) l = Math.round(l * 1.5);
    else if (revIdx === 2) l = Math.round(l * 1.2);
    if (tasks.includes("Leads")) l = Math.round(l * 1.15);
    if (tasks.includes("Atención cliente"))
      l = Math.round(l * 1.1);
    setLeads(
      Math.min(Math.max(Math.round(l / 10) * 10, 10), 5000),
    );

    const sectorResp: Record<string, number> = {
      Ecommerce: 25,
      SaaS: 15,
      Agencia: 35,
      Servicios: 45,
      Salud: 20,
      Inmobiliaria: 60,
      Logística: 40,
      Otros: 30,
    };
    let r = sectorResp[sector] ?? 30;
    if (usesAI === true) r = Math.round(r * 0.7);
    if (teamSize === "21 – 50") r = Math.round(r * 1.15);
    if (teamSize === "50 +") r = Math.round(r * 1.3);
    if (tasks.includes("Atención cliente"))
      r = Math.round(r * 1.25);
    setRespTime(Math.min(Math.max(r, 1), 240));

    /* Ticket medio preset by sector + revenue */
    const sectorTicket: Record<string, number> = {
      Ecommerce: 45,
      SaaS: 200,
      Agencia: 2500,
      Servicios: 500,
      Salud: 80,
      Inmobiliaria: 15000,
      Logística: 150,
      Otros: 200,
    };
    let tk = sectorTicket[sector] ?? 200;
    if (revIdx >= 4) tk = Math.round(tk * 2.5);
    else if (revIdx >= 3) tk = Math.round(tk * 1.8);
    else if (revIdx >= 2) tk = Math.round(tk * 1.3);
    else if (revIdx <= 0) tk = Math.round(tk * 0.7);
    setAvgTicket(Math.min(Math.max(tk, 10), 100000));
  }, [step, sector, teamSize, revenue, usesAI, tasks]);

  useEffect(() => {
    if (step === 1 && !sector)
      presetsAppliedRef.current = false;
  }, [step, sector]);

  const canNext = () => {
    if (step === 0) return true; // Pantalla inicial
    if (step === 1) return !!role;
    if (step === 2) return !!employees;
    if (step === 3) return !!clients;
    if (step === 4) return !!upselling;
    if (step === 5) return !!memoryDecisions;
    if (step === 6) return !!absence;
    if (step === 7) return !!lostTime;
    if (step === 8) return !!manualWork;
    if (step === 9) return !!profitVisibility;
    if (step === 10) return !!opportunities;
    if (step === 11) return !!doubleClients;
    if (step === 12) return !!mainDisorder;
    return true;
  };
  const submit = async () => {
    setErr("");
    if (
      !email ||
      !email.includes("@") ||
      !email.includes(".")
    ) {
      setErr(t("calculator.invalidEmail"));
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/send-diagnostic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email,
          role, employees, clients, upselling, memoryDecisions, absence,
          lostTime, manualWork, profitVisibility, opportunities, doubleClients, mainDisorder,
          sector, teamSize, revenue, usesAI, tasks, hours, costH, leads, respTime, avgTicket, h24, priority,
          calc, lang: i18n.language,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr((data as { error?: string }).error || t("calculator.errorSend"));
        return;
      }
      setDone(true);
    } catch {
      setErr(t("calculator.errorConnection"));
    } finally {
      setSending(false);
    }
  };
  const reset = () => {
    setStep(0);
    setDir(-1);
    setRole("");
    setEmployees("");
    setClients("");
    setUpselling("");
    setMemoryDecisions("");
    setAbsence("");
    setLostTime("");
    setManualWork("");
    setProfitVisibility("");
    setOpportunities("");
    setDoubleClients("");
    setMainDisorder("");
    setSector("");
    setTeamSize("");
    setRevenue("");
    setUsesAI(null);
    setTasks([]);
    setHours(20);
    setCostH(25);
    setLeads(500);
    setRespTime(30);
    setAvgTicket(200);
    setH24(null);
    setPriority("");
    setName("");
    setEmail("");
    setDone(false);
    setSending(false);
    setErr("");
  };

  const fmt = (n: number) => n.toLocaleString("es-ES");
  const pct = step / TOTAL_STEPS;

  /* Slot-machine spin effect on the preview panel */
  useEffect(() => {
    if (spinKey === 0 || !metricsRef.current) return;
    animateMetrics(
      metricsRef.current,
      {
        y: [0, -70, 70, -3, 0],
        rotateX: [0, 10, -8, 1, 0],
        opacity: [1, 0, 0, 1, 1],
        filter: [
          "blur(0px)",
          "blur(6px)",
          "blur(6px)",
          "blur(1px)",
          "blur(0px)",
        ],
      },
      {
        duration: 1.3,
        ease: [0.33, 0, 0.15, 1],
        times: [0, 0.35, 0.55, 0.85, 1],
      },
    ).then(() => {
      if (metricsRef.current) {
        metricsRef.current.style.transform = "";
        metricsRef.current.style.opacity = "";
        metricsRef.current.style.filter = "";
      }
    });
  }, [spinKey, animateMetrics, metricsRef]);

  return (
    <section
      id={id}
      className="h-full flex flex-col lg:flex-row"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ──── LEFT: question slides ──── */}
      <div className="flex-1 min-h-0 flex flex-col bg-white items-center">
        {/* progress bar */}
        <div className="h-1 bg-[#F0F0F0] flex-shrink-0 w-full">
          <motion.div
            className="h-full bg-[#0B0B0B]"
            animate={{ width: `${pct * 100}%` }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        </div>

        {/* slide area */}
        <div
          className={`flex-1 flex flex-col ${done ? "justify-start" : "justify-center"} px-8 md:px-16 lg:px-20 py-8 min-h-0 overflow-y-auto w-full max-w-2xl`}
        >
          <LayoutGroup>
            <AnimatePresence mode="wait" custom={dir}>
              {/* 0 — Pantalla inicial de honestidad */}
              {step === 0 && (
                <motion.div
                  key="q0"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                  className="text-center max-w-[600px] mx-auto"
                >
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[#0B0B0B] mb-8"
                    style={{
                      fontSize: "clamp(1.5rem, 3.2vw, 2.2rem)",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    <span className="text-[#0B0B0B]/40">{t("calculator.step0.intro1")}</span>
                    {" "}{t("calculator.step0.intro2")}{" "}
                    <span style={{ fontWeight: 700 }}>{t("calculator.step0.honesty")}</span>.
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="text-[#0B0B0B]/50 mb-10"
                    style={{
                      fontSize: "1.05rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {t("calculator.step0.question")}
                  </motion.p>
                  <motion.button
                    onClick={next}
                    initial={{
                      opacity: 0,
                      filter: "blur(10px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: 0.6,
                    }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow:
                        "0 8px 35px rgba(11,11,11,0.18)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="px-10 py-4 bg-[#0B0B0B] text-white rounded-full cursor-pointer shadow-[0_6px_24px_rgba(11,11,11,0.12)]"
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 500,
                    }}
                  >
                    {t("calculator.step0.cta")}
                  </motion.button>
                </motion.div>
              )}

              {/* 1 — Rol */}
              {step === 1 && (
                <motion.div
                  key="q1"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step1.stepNum")}
                  </motion.p>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="text-[#0B0B0B]/35 mb-3"
                    style={{ fontSize: "0.9rem", lineHeight: 1.5 }}
                  >
                    {t("calculator.step1.intro")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-[#0B0B0B] mb-8"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                      fontWeight: 600,
                      lineHeight: 1.15,
                    }}
                  >
                    {t("calculator.step1.title")}
                  </motion.h2>
                  <div className="flex flex-wrap gap-2.5">
                    {ROLE_KEYS.map((r, i) => (
                      <Pill
                        key={r}
                        active={role === r}
                        onClick={() => {
                          setRole(r);
                          autoAdvance();
                        }}
                        big
                        delay={0.25 + i * 0.04}
                        groupId="role"
                      >
                        {t(`calculator.step1.${r}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 2 — Número de empleados */}
              {step === 2 && (
                <motion.div
                  key="q2"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step2.stepNum")}
                  </motion.p>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="text-[#0B0B0B]/35 mb-3"
                    style={{ fontSize: "0.9rem", lineHeight: 1.5 }}
                  >
                    {t("calculator.step2.intro")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-[#0B0B0B] mb-8"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                      fontWeight: 600,
                      lineHeight: 1.15,
                    }}
                  >
                    {t("calculator.step2.title")}
                  </motion.h2>
                  <div className="flex flex-wrap gap-2.5">
                    {EMPLOYEE_KEYS.map((e, i) => (
                      <Pill
                        key={e}
                        active={employees === e}
                        onClick={() => {
                          setEmployees(e);
                          autoAdvance();
                        }}
                        big
                        delay={0.25 + i * 0.04}
                        groupId="employees"
                      >
                        {t(`calculator.step2.${e}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 3 — Clientes */}
              {step === 3 && (
                <motion.div
                  key="q3"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step3.stepNum")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[#0B0B0B] mb-8"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                      fontWeight: 600,
                      lineHeight: 1.15,
                    }}
                  >
                    {t("calculator.step3.title")}
                  </motion.h2>
                  <div className="flex flex-wrap gap-2.5">
                    {CLIENT_KEYS.map((c, i) => (
                      <Pill
                        key={c}
                        active={clients === c}
                        onClick={() => {
                          setClients(c);
                          autoAdvance();
                        }}
                        big
                        delay={0.2 + i * 0.04}
                        groupId="clients"
                      >
                        {t(`calculator.step3.${c}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 4 — Upselling/Cross-selling */}
              {step === 4 && (
                <motion.div
                  key="q4"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step4.stepNum")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[#0B0B0B] mb-3"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                      fontWeight: 600,
                      lineHeight: 1.15,
                    }}
                  >
                    {t("calculator.step4.title")}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-[#0B0B0B]/35 mb-8"
                    style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                  >
                    {t("calculator.step4.sub")}
                  </motion.p>
                  <div className="flex flex-wrap gap-2.5">
                    {UPSELL_KEYS.map((u, i) => (
                      <Pill
                        key={u}
                        active={upselling === u}
                        onClick={() => {
                          setUpselling(u);
                          autoAdvance();
                        }}
                        big
                        delay={0.25 + i * 0.04}
                        groupId="upselling"
                      >
                        {t(`calculator.step4.${u}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 5 — Decisiones basadas en memoria */}
              {step === 5 && (
                <motion.div
                  key="q5"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step5.stepNum")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[#0B0B0B] mb-3"
                    style={{
                      fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {t("calculator.step5.title")}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-[#0B0B0B]/35 mb-8"
                    style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                  >
                    {t("calculator.step5.sub")}
                  </motion.p>
                  <div className="flex flex-wrap gap-2.5">
                    {MEMORY_KEYS.map((m, i) => (
                      <Pill
                        key={m}
                        active={memoryDecisions === m}
                        onClick={() => {
                          setMemoryDecisions(m);
                          autoAdvance();
                        }}
                        big
                        delay={0.25 + i * 0.04}
                        groupId="memory"
                      >
                        {t(`calculator.step5.${m}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 6 — Ausencia del negocio */}
              {step === 6 && (
                <motion.div
                  key="q6"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step6.stepNum")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[#0B0B0B] mb-3"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                      fontWeight: 600,
                      lineHeight: 1.15,
                    }}
                  >
                    {t("calculator.step6.title")}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-[#0B0B0B]/35 mb-8"
                    style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                  >
                    {t("calculator.step6.sub")}
                  </motion.p>
                  <div className="flex flex-wrap gap-2.5">
                    {ABSENCE_KEYS.map((a, i) => (
                      <Pill
                        key={a}
                        active={absence === a}
                        onClick={() => {
                          setAbsence(a);
                          autoAdvance();
                        }}
                        big
                        delay={0.25 + i * 0.04}
                        groupId="absence"
                      >
                        {t(`calculator.step6.${a}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 7 — Tiempo perdido buscando información */}
              {step === 7 && (
                <motion.div
                  key="q7"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step7.stepNum")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[#0B0B0B] mb-3"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                      fontWeight: 600,
                      lineHeight: 1.15,
                    }}
                  >
                    {t("calculator.step7.title")}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-[#0B0B0B]/35 mb-8"
                    style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                  >
                    {t("calculator.step7.sub")}
                  </motion.p>
                  <div className="flex flex-wrap gap-2.5">
                    {LOSTTIME_KEYS.map((l, i) => (
                      <Pill
                        key={l}
                        active={lostTime === l}
                        onClick={() => {
                          setLostTime(l);
                          autoAdvance();
                        }}
                        big
                        delay={0.25 + i * 0.04}
                        groupId="losttime"
                      >
                        {t(`calculator.step7.${l}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 8 — Trabajo manual */}
              {step === 8 && (
                <motion.div
                  key="q8"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step8.stepNum")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[#0B0B0B] mb-3"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                      fontWeight: 600,
                      lineHeight: 1.15,
                    }}
                  >
                    {t("calculator.step8.title")}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-[#0B0B0B]/35 mb-8"
                    style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                  >
                    {t("calculator.step8.sub")}
                  </motion.p>
                  <div className="flex flex-wrap gap-2.5">
                    {MANUAL_KEYS.map((w, i) => (
                      <Pill
                        key={w}
                        active={manualWork === w}
                        onClick={() => {
                          setManualWork(w);
                          autoAdvance();
                        }}
                        big
                        delay={0.25 + i * 0.04}
                        groupId="manualwork"
                      >
                        {t(`calculator.step8.${w}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 9 — Visibilidad de rentabilidad */}
              {step === 9 && (
                <motion.div
                  key="q9"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step9.stepNum")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[#0B0B0B] mb-3"
                    style={{
                      fontSize: "clamp(1.55rem, 2.9vw, 2.2rem)",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {t("calculator.step9.title")}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-[#0B0B0B]/35 mb-8"
                    style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                  >
                    {t("calculator.step9.sub")}
                  </motion.p>
                  <div className="flex flex-wrap gap-2.5">
                    {PROFIT_KEYS.map((p, i) => (
                      <Pill
                        key={p}
                        active={profitVisibility === p}
                        onClick={() => {
                          setProfitVisibility(p);
                          autoAdvance();
                        }}
                        big
                        delay={0.25 + i * 0.04}
                        groupId="profit"
                      >
                        {t(`calculator.step9.${p}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 10 — Oportunidades de negocio */}
              {step === 10 && (
                <motion.div
                  key="q10"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step10.stepNum")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[#0B0B0B] mb-3"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                      fontWeight: 600,
                      lineHeight: 1.15,
                    }}
                  >
                    {t("calculator.step10.title")}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-[#0B0B0B]/35 mb-8"
                    style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                  >
                    {t("calculator.step10.sub")}
                  </motion.p>
                  <div className="flex flex-wrap gap-2.5">
                    {OPPORTUNITY_KEYS.map((o, i) => (
                      <Pill
                        key={o}
                        active={opportunities === o}
                        onClick={() => {
                          setOpportunities(o);
                          autoAdvance();
                        }}
                        big
                        delay={0.25 + i * 0.04}
                        groupId="opportunities"
                      >
                        {t(`calculator.step10.${o}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 11 — Duplicar clientes */}
              {step === 11 && (
                <motion.div
                  key="q11"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step11.stepNum")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[#0B0B0B] mb-3"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                      fontWeight: 600,
                      lineHeight: 1.15,
                    }}
                  >
                    {t("calculator.step11.title")}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-[#0B0B0B]/35 mb-8"
                    style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                  >
                    {t("calculator.step11.sub")}
                  </motion.p>
                  <div className="flex flex-wrap gap-2.5">
                    {DOUBLE_KEYS.map((d, i) => (
                      <Pill
                        key={d}
                        active={doubleClients === d}
                        onClick={() => {
                          setDoubleClients(d);
                          autoAdvance();
                        }}
                        big
                        delay={0.25 + i * 0.04}
                        groupId="double"
                      >
                        {t(`calculator.step11.${d}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 12 — Desorden principal */}
              {step === 12 && (
                <motion.div
                  key="q12"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                >
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-[#0B0B0B]/25 mb-3"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t("calculator.step12.stepNum")}
                  </motion.p>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(14px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-[#0B0B0B] mb-3"
                    style={{
                      fontSize: "clamp(1.55rem, 2.9vw, 2.2rem)",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {t("calculator.step12.title")}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-[#0B0B0B]/35 mb-8"
                    style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                  >
                    {t("calculator.step12.sub")}
                  </motion.p>
                  <div className="flex flex-wrap gap-2.5">
                    {DISORDER_KEYS.map((dis, i) => (
                      <Pill
                        key={dis}
                        active={mainDisorder === dis}
                        onClick={() => {
                          setMainDisorder(dis);
                          autoAdvance();
                        }}
                        big
                        delay={0.25 + i * 0.04}
                        groupId="disorder"
                      >
                        {t(`calculator.step12.${dis}`)}
                      </Pill>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 13 — Unlock form */}
              {step === 13 && !done && (
                <motion.div
                  key="q10"
                  custom={dir}
                  variants={slideAnim}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTrans}
                  className="relative"
                >
                  {/* ── Mobile-only: blurred preview background ── */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.35 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="lg:hidden absolute inset-0 -mx-8 -my-4 px-8 py-4 pointer-events-none select-none overflow-hidden"
                    style={{ filter: "blur(8px)" }}
                    aria-hidden="true"
                  >
                    <div className="space-y-4 mb-5">
                      {[
                        {
                          label: t("calculator.savingsMonth"),
                          icon: Euro,
                          val: `€ ${fmt(calc.monthlySav)}`,
                        },
                        {
                          label: t("calculator.additionalRev"),
                          icon: TrendingUp,
                          val: `€ ${fmt(calc.addRev)}`,
                        },
                        {
                          label: t("calculator.responseImprove"),
                          icon: Clock,
                          val: `–${calc.respImprove}%`,
                        },
                        {
                          label: t("calculator.aiScore"),
                          icon: BarChart3,
                          val: `${calc.score}/100`,
                        },
                      ].map((m) => (
                        <div key={m.label}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <m.icon
                              size={12}
                              className="text-[#0B0B0B]/20"
                            />
                            <span
                              className="text-[#0B0B0B]/30"
                              style={{ fontSize: "0.65rem" }}
                            >
                              {m.label}
                            </span>
                          </div>
                          <p
                            className="text-[#0B0B0B]"
                            style={{
                              fontSize: "1.5rem",
                              fontWeight: 600,
                            }}
                          >
                            {m.val}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-[#EBEBEB]">
                      <p
                        className="text-[#0B0B0B]/25 mb-1"
                        style={{
                          fontSize: "0.6rem",
                          fontWeight: 500,
                          letterSpacing: "0.12em",
                        }}
                      >
                        IMPACTO TOTAL / MES
                      </p>
                      <p
                        className="text-[#0B0B0B]"
                        style={{
                          fontSize: "2rem",
                          fontWeight: 700,
                        }}
                      >
                        € {fmt(calc.total)}
                      </p>
                    </div>
                  </motion.div>

                  {/* ── Form content (foreground) ── */}
                  <div className="relative z-10">
                    <motion.p
                      initial={{
                        opacity: 0,
                        filter: "blur(6px)",
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                      }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="text-[#0B0B0B]/25 mb-3"
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        letterSpacing: "0.15em",
                      }}
                    >
                      {t("calculator.step13.stepNum")}
                    </motion.p>
                    <motion.h2
                      initial={{
                        opacity: 0,
                        filter: "blur(14px)",
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: 0.15,
                      }}
                      className="text-[#0B0B0B] mb-3"
                      style={{
                        fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                        fontWeight: 600,
                        lineHeight: 1.15,
                      }}
                    >
                      {t("calculator.step13.title")}
                      <br />
                      {t("calculator.step13.title2")}
                    </motion.h2>
                    <motion.p
                      initial={{
                        opacity: 0,
                        filter: "blur(8px)",
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                      }}
                      transition={{
                        duration: 0.4,
                        delay: 0.25,
                      }}
                      className="text-[#0B0B0B]/30 mb-10"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {t("calculator.step13.sub")}
                    </motion.p>
                    <div className="max-w-[440px] space-y-4">
                      <motion.div
                        initial={{
                          opacity: 0,
                          filter: "blur(10px)",
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          filter: "blur(0px)",
                          y: 0,
                        }}
                        transition={{
                          duration: 0.5,
                          delay: 0.3,
                        }}
                      >
                        <input
                          type="text"
                          placeholder={t("calc.namePlaceholder")}
                          value={name}
                          onChange={(e) =>
                            setName(e.target.value)
                          }
                          className="w-full px-0 py-3 bg-transparent border-b-2 border-[#E8E8E8] focus:border-[#0B0B0B] focus:outline-none transition-colors duration-300 placeholder:text-[#0B0B0B]/20 text-[#0B0B0B]"
                          style={{
                            fontSize: "1.3rem",
                            fontWeight: 400,
                          }}
                        />
                      </motion.div>
                      <motion.div
                        initial={{
                          opacity: 0,
                          filter: "blur(10px)",
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          filter: "blur(0px)",
                          y: 0,
                        }}
                        transition={{
                          duration: 0.5,
                          delay: 0.38,
                        }}
                      >
                        <input
                          type="email"
                          placeholder={t("calc.emailPlaceholder")}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setErr("");
                          }}
                          onKeyDown={(e) =>
                            e.key === "Enter" && submit()
                          }
                          className={`w-full px-0 py-3 bg-transparent border-b-2 ${err ? "border-red-400" : "border-[#E8E8E8]"} focus:border-[#0B0B0B] focus:outline-none transition-colors duration-300 placeholder:text-[#0B0B0B]/20 text-[#0B0B0B]`}
                          style={{
                            fontSize: "1.3rem",
                            fontWeight: 400,
                          }}
                        />
                        <AnimatePresence>
                          {err && (
                            <motion.p
                              initial={{
                                opacity: 0,
                                filter: "blur(6px)",
                                y: -4,
                              }}
                              animate={{
                                opacity: 1,
                                filter: "blur(0px)",
                                y: 0,
                              }}
                              exit={{
                                opacity: 0,
                                filter: "blur(6px)",
                              }}
                              className="text-red-500 mt-2"
                              style={{ fontSize: "0.78rem" }}
                            >
                              {err}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      <motion.button
                        onClick={submit}
                        disabled={sending}
                        initial={{
                          opacity: 0,
                          filter: "blur(10px)",
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          filter: "blur(0px)",
                          y: 0,
                        }}
                        transition={{
                          duration: 0.5,
                          delay: 0.46,
                        }}
                        whileHover={!sending ? {
                          scale: 1.02,
                          boxShadow:
                            "0 8px 35px rgba(11,11,11,0.15)",
                        } : {}}
                        whileTap={!sending ? { scale: 0.97 } : {}}
                        className={`w-full py-4 mt-4 bg-[#0B0B0B] text-white rounded-full shadow-[0_4px_20px_rgba(11,11,11,0.08)] transition-opacity ${sending ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 500,
                        }}
                      >
                        {sending ? t("calculator.sending") : t("calculator.unlockBtn")}
                      </motion.button>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.55,
                        }}
                        className="text-[#0B0B0B]/20 text-center"
                        style={{ fontSize: "0.68rem" }}
                      >
                        {t("calculator.gdprNote")}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Done ── */}
              {step === 13 && done && (
                <motion.div
                  key="done"
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                    filter: "blur(16px)",
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="flex flex-col items-start"
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.2,
                    }}
                    className="w-16 h-16 rounded-full bg-[#0B0B0B] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(11,11,11,0.15)]"
                  >
                    <Check size={28} className="text-white" />
                  </motion.div>
                  <motion.h2
                    initial={{
                      opacity: 0,
                      filter: "blur(12px)",
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-[#0B0B0B] mb-2"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                      fontWeight: 600,
                      lineHeight: 1.15,
                    }}
                  >
                    {t("calculator.doneTitle", { name: name || t("calculator.doneFallback") })}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="text-[#0B0B0B]/40 mb-8"
                    style={{ fontSize: "0.95rem" }}
                  >
                    {t("calculator.reportSentTo")}{" "}
                    <span
                      className="text-[#0B0B0B]"
                      style={{ fontWeight: 500 }}
                    >
                      {email}
                    </span>
                  </motion.p>
                  <motion.div
                    initial={{
                      opacity: 0,
                      filter: "blur(10px)",
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-wrap gap-3 mb-10"
                  >
                    <motion.a
                      href={CALENDLY_URL || "/#contacto"}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{
                        scale: 1.03,
                        boxShadow:
                          "0 8px 30px rgba(11,11,11,0.12)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="px-8 py-3.5 bg-[#0B0B0B] text-white rounded-full cursor-pointer shadow-[0_4px_20px_rgba(11,11,11,0.08)] no-underline"
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                      }}
                    >
                      {t("calculator.bookCall")}
                    </motion.a>
                    <div className="hidden">
                    <motion.button
                      onClick={downloadPDF}
                      disabled={downloading}
                      whileHover={
                        !downloading
                          ? {
                              scale: 1.03,
                              boxShadow:
                                "0 8px 30px rgba(11,11,11,0.08)",
                            }
                          : {}
                      }
                      whileTap={
                        !downloading ? { scale: 0.97 } : {}
                      }
                      className={`flex items-center gap-2 px-6 py-3.5 rounded-full border cursor-pointer transition-colors ${
                        downloading
                          ? "border-[#E8E8E8] text-[#0B0B0B]/20 cursor-wait"
                          : "border-[#0B0B0B]/15 text-[#0B0B0B]/60 hover:border-[#0B0B0B]/30 hover:text-[#0B0B0B]"
                      }`}
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                      }}
                    >
                      <Download
                        size={16}
                        className={
                          downloading ? "animate-pulse" : ""
                        }
                      />
                      {downloading
                        ? t("calculator.generating")
                        : t("calculator.downloadPdf")}
                    </motion.button>
                    </div>
                  </motion.div>

                  {/* ── Scroll hint ── */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="flex items-center gap-1.5 mb-6 self-center"
                  >
                    <ChevronDown
                      size={14}
                      className="text-[#0B0B0B]/20 animate-bounce"
                    />
                    <span
                      className="text-[#0B0B0B]/20"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {t("calculator.emailPreviewHint")}
                    </span>
                    <ChevronDown
                      size={14}
                      className="text-[#0B0B0B]/20 animate-bounce"
                    />
                  </motion.div>

                  {/* ── Email Report Preview ── */}
                  <div ref={reportRef} className="w-full">
                    <EmailReport
                      name={name}
                      email={email}
                      role={role}
                      employees={employees}
                      clients={clients}
                      upselling={upselling}
                      memoryDecisions={memoryDecisions}
                      absence={absence}
                      lostTime={lostTime}
                      manualWork={manualWork}
                      profitVisibility={profitVisibility}
                      opportunities={opportunities}
                      doubleClients={doubleClients}
                      mainDisorder={mainDisorder}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </div>

        {/* nav */}
        {!(step === 13 && done) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center justify-between px-8 md:px-16 lg:px-20 py-4 border-t border-[#F0F0F0] flex-shrink-0 w-full max-w-2xl self-center"
          >
            <motion.button
              onClick={prev}
              disabled={step === 0}
              whileHover={step > 1 ? { scale: 1.05 } : {}}
              whileTap={step > 1 ? { scale: 0.95 } : {}}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full cursor-pointer ${
                step === 1
                  ? "text-[#0B0B0B]/10 cursor-not-allowed"
                  : "text-[#0B0B0B]/40 hover:text-[#0B0B0B] hover:bg-[#F5F5F5]"
              }`}
              style={{ fontSize: "0.88rem" }}
            >
              <ArrowLeft size={16} /> {t("calculator.prev")}
            </motion.button>
            {(step === 5 || step === 6 || step === 7) && (
              <div className="hidden">
              <motion.button
                onClick={next}
                disabled={!canNext()}
                whileHover={
                  canNext()
                    ? {
                        scale: 1.05,
                        boxShadow:
                          "0 6px 24px rgba(11,11,11,0.12)",
                      }
                    : {}
                }
                whileTap={canNext() ? { scale: 0.95 } : {}}
                className={`flex items-center gap-2 px-7 py-2.5 rounded-full cursor-pointer ${
                  !canNext()
                    ? "bg-[#0B0B0B]/5 text-[#0B0B0B]/15 cursor-not-allowed"
                    : "bg-[#0B0B0B] text-white shadow-[0_4px_16px_rgba(11,11,11,0.08)]"
                }`}
                style={{ fontSize: "0.88rem", fontWeight: 500 }}
              >
                {t("calculator.next")} <ArrowRight size={16} />
              </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ──── RIGHT: live preview ──── */}
      <div className="hidden w-[380px] xl:w-[420px] flex-shrink-0 flex-col bg-[#FAFAFA] border-l border-[#F0F0F0]">
        <div className="flex-1 overflow-y-auto px-7 py-8">
          <motion.div
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-between mb-6"
          >
            <span
              className="tracking-[0.2em] text-[#0B0B0B]/25"
              style={{ fontSize: "0.6rem", fontWeight: 500 }}
            >
              {done ? t("calculator.yourReport") : t("calculator.preview")}
            </span>
            <span
              className="text-[#0B0B0B]/20"
              style={{ fontSize: "0.65rem" }}
            >
              {Math.round(pct * 100)}%
            </span>
          </motion.div>

          {/* profile snippet */}
          <AnimatePresence>
            {(sector || teamSize) && (
              <motion.div
                initial={{
                  opacity: 0,
                  filter: "blur(8px)",
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  filter: "blur(8px)",
                  height: 0,
                }}
                transition={{ duration: 0.4 }}
                className="mb-5 pb-4 border-b border-[#EBEBEB]"
              >
                <p
                  className="text-[#0B0B0B]/60"
                  style={{ fontSize: "0.78rem" }}
                >
                  {[
                    sector,
                    teamSize && `${teamSize} pers.`,
                    revenue,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {priority && (
                  <p
                    className="text-[#0B0B0B]/30 mt-0.5"
                    style={{ fontSize: "0.72rem" }}
                  >
                    {priority}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metrics area with slot-machine spin */}
          <div style={{ perspective: "800px" }}>
            <div
              ref={metricsRef}
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              {!done ? (
                <>
                  <div className="space-y-4 mb-6">
                    {[
                      {
                        label: t("calculator.savingsMonth"),
                        icon: Euro,
                        val: `€ ${fmt(calc.monthlySav)}`,
                      },
                      {
                        label: t("calculator.additionalRev"),
                        icon: TrendingUp,
                        val: `€ ${fmt(calc.addRev)}`,
                      },
                      {
                        label: t("calculator.responseImprove"),
                        icon: Clock,
                        val: `–${calc.respImprove}%`,
                      },
                      {
                        label: t("calculator.aiScore"),
                        icon: BarChart3,
                        val: `${calc.score}/100`,
                      },
                    ].map((m, i) => (
                      <motion.div
                        key={m.label}
                        initial={{
                          opacity: 0,
                          filter: "blur(8px)",
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          filter: "blur(0px)",
                          y: 0,
                        }}
                        transition={{
                          duration: 0.4,
                          delay: 0.3 + i * 0.08,
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <m.icon
                            size={12}
                            className="text-[#0B0B0B]/20"
                          />
                          <span
                            className="text-[#0B0B0B]/30"
                            style={{ fontSize: "0.65rem" }}
                          >
                            {m.label}
                          </span>
                        </div>
                        <p
                          className="text-[#0B0B0B] blur-[6px] select-none"
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 600,
                          }}
                        >
                          {m.val}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{
                      opacity: 0,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="pt-5 border-t border-[#EBEBEB] mb-5"
                  >
                    <p
                      className="text-[#0B0B0B]/25 mb-1"
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: 500,
                        letterSpacing: "0.12em",
                      }}
                    >
                      IMPACTO TOTAL / MES
                    </p>
                    <p
                      className="text-[#0B0B0B] blur-[6px] select-none"
                      style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                      }}
                    >
                      € {fmt(calc.total)}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="flex items-start gap-2"
                  >
                    <Lock
                      size={12}
                      className="text-[#0B0B0B]/15 mt-0.5 flex-shrink-0"
                    />
                    <p
                      className="text-[#0B0B0B]/25"
                      style={{
                        fontSize: "0.68rem",
                        lineHeight: 1.6,
                      }}
                    >
                      Completa todas las preguntas para
                      desbloquear tus resultados.
                    </p>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(14px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.7 }}
                >
                  <div className="space-y-4 mb-6">
                    {[
                      {
                        label: t("calculator.opSavingsMonth"),
                        val: `€ ${fmt(calc.monthlySav)}`,
                        sub: t("calc.subSavings", { hours: calc.hrsSaved, cost: costH }),
                        icon: Euro,
                      },
                      {
                        label: t("calculator.addRevMonth"),
                        val: `€ ${fmt(calc.addRev)}`,
                        sub: t("calc.subRevenue", { leads: fmt(leads), ticket: fmtTicket(avgTicket) }),
                        icon: TrendingUp,
                      },
                      {
                        label: t("calculator.responseTime"),
                        val: `${respTime} → ${calc.newResp} min`,
                        sub: `–${calc.respImprove}% · ${t("calc.media")} ${sector}: ${({ Ecommerce: 35, SaaS: 20, Agencia: 45, Servicios: 55, Salud: 30, Inmobiliaria: 75, Logística: 50, Otros: 40 } as Record<string, number>)[sector] || 40}min`,
                        icon: Clock,
                      },
                      {
                        label: t("calculator.aiScore"),
                        val: `${calc.score}/100`,
                        sub:
                          calc.score >= 75
                            ? t("calculator.veryHighPotential")
                            : calc.score >= 55
                              ? t("calculator.highPotential")
                              : calc.score >= 35
                                ? t("calculator.moderate")
                                : t("calculator.initial"),
                        icon: BarChart3,
                      },
                    ].map((m, i) => (
                      <motion.div
                        key={m.label}
                        initial={{
                          opacity: 0,
                          filter: "blur(10px)",
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          filter: "blur(0px)",
                          y: 0,
                        }}
                        transition={{
                          delay: 0.15 + i * 0.12,
                          duration: 0.5,
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <m.icon
                            size={12}
                            className="text-[#0B0B0B]/25"
                          />
                          <span
                            className="text-[#0B0B0B]/30"
                            style={{ fontSize: "0.65rem" }}
                          >
                            {m.label}
                          </span>
                        </div>
                        <p
                          className="text-[#0B0B0B]"
                          style={{
                            fontSize: "1.4rem",
                            fontWeight: 600,
                          }}
                        >
                          {m.val}
                        </p>
                        <p
                          className="text-[#0B0B0B]/25"
                          style={{ fontSize: "0.65rem" }}
                        >
                          {m.sub}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{
                      opacity: 0,
                      filter: "blur(12px)",
                      y: 14,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="p-5 rounded-2xl bg-[#0B0B0B] text-white shadow-[0_8px_40px_rgba(11,11,11,0.18)]"
                  >
                    <p
                      className="text-white/40 mb-1"
                      style={{
                        fontSize: "0.6rem",
                        letterSpacing: "0.12em",
                      }}
                    >
                      {t("calculator.totalImpactMonth")}
                    </p>
                    <p
                      style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                      }}
                    >
                      € {fmt(calc.total)}
                    </p>
                    <p
                      className="text-white/30 mt-1"
                      style={{ fontSize: "0.65rem" }}
                    >
                      ≈ € {fmt(calc.annual)}{t("calculator.perYear")} ·{" "}
                      {(
                        (calc.annual /
                          (REVENUES.find(
                            (r) => r.label === revenue,
                          )?.value || 300000)) *
                        100
                      ).toFixed(1)}
                      % {t("calculator.ofRevenue")}
                    </p>
                    <p
                      className="text-white/20 mt-2"
                      style={{
                        fontSize: "0.52rem",
                        lineHeight: 1.5,
                      }}
                    >
                      €{fmt(calc.monthlySav)} {t("calculator.savingsPlusRev")}
                      {fmt(calc.addRev)} {t("calculator.additionalRevenue")}
                    </p>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-[#0B0B0B]/15 text-center mt-5"
                    style={{
                      fontSize: "0.6rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {t("calculator.estimationNote", {
                      sector: sector || "—",
                      efficiency: Math.round(
                        (
                          {
                            SaaS: 1.15,
                            Ecommerce: 1.1,
                            Logística: 1.08,
                            Agencia: 1.05,
                            Servicios: 1.0,
                            Inmobiliaria: 0.95,
                            Salud: 0.92,
                            Otros: 1.0,
                          } as Record<string, number>
                        )[sector] * 100 || 100,
                      ),
                      aiNote: usesAI ? t("calculator.discountExisting") : "",
                    })}
                  </motion.p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}