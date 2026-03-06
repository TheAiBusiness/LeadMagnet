export const SECTORS = ["Ecommerce", "Servicios", "Inmobiliaria", "Salud", "Logística", "Agencia", "SaaS", "Otros"];

export type SliderCfg = { label: string; min: number; max: number; step?: number; unit: string };
export type MetricsConfig = { subtitle: string; ticketLabel: string; sliders: [SliderCfg, SliderCfg, SliderCfg, SliderCfg] };

export const TASK_SHORT: Record<string, string> = {
  "Atención cliente": "soporte", Emails: "emails", "Entrada datos": "datos",
  Informes: "informes", Leads: "leads", Agenda: "agenda",
  Facturación: "facturación", Contenido: "contenido",
};

export const TEAMS = [
  { label: "1 – 5", multiplier: 3 },
  { label: "6 – 20", multiplier: 12 },
  { label: "21 – 50", multiplier: 35 },
  { label: "50 +", multiplier: 70 },
];

export const REVENUES = [
  { label: "< 100 K €", value: 80000 },
  { label: "100 K – 500 K €", value: 300000 },
  { label: "500 K – 2 M €", value: 1200000 },
  { label: "2 M – 10 M €", value: 5000000 },
  { label: "> 10 M €", value: 15000000 },
];

export const TASKS = [
  { label: "Atención cliente", savings: 0.7 },
  { label: "Emails", savings: 0.6 },
  { label: "Entrada datos", savings: 0.85 },
  { label: "Informes", savings: 0.75 },
  { label: "Leads", savings: 0.65 },
  { label: "Agenda", savings: 0.8 },
  { label: "Facturación", savings: 0.7 },
  { label: "Contenido", savings: 0.5 },
];

export const PRIORITIES = ["Reducir costes", "Más ventas", "Mejor soporte", "Acelerar procesos"];

export function buildMetricsConfig(
  _sector: string, _teamSize: string, _revenue: string,
  _usesAI: boolean | null, _tasks: string[],
): MetricsConfig {
  const sector = _sector || "Otros";
  const teamSize = _teamSize || "6 – 20";
  const tasks = _tasks || [];
  const usesAI = _usesAI;

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

  const teamRanges: Record<string, { maxH: number; maxVol: number }> = {
    "1 – 5": { maxH: 40, maxVol: 1500 },
    "6 – 20": { maxH: 60, maxVol: 3000 },
    "21 – 50": { maxH: 80, maxVol: 5000 },
    "50 +": { maxH: 80, maxVol: 5000 },
  };
  const tr = teamRanges[teamSize] || { maxH: 80, maxVol: 5000 };
  const revIdx = REVENUES.findIndex((r) => r.label === _revenue);
  const maxCost = revIdx >= 4 ? 120 : revIdx >= 3 ? 100 : revIdx >= 2 ? 80 : 60;

  const shortTasks = tasks.slice(0, 2).map((t) => TASK_SHORT[t] || t.toLowerCase());
  const taskFragment = shortTasks.length ? shortTasks.join(" y ").toUpperCase() : null;

  const hoursBase: Record<string, string> = {
    Ecommerce: "HORAS PROCESANDO PEDIDOS", Servicios: "HORAS EN GESTIÓN ADMINISTRATIVA",
    Inmobiliaria: "HORAS EN GESTIÓN DE PROPIEDADES", Salud: "HORAS EN TAREAS CLÍNICO-ADMIN",
    Logística: "HORAS EN OPERATIVA MANUAL", Agencia: "HORAS EN PRODUCCIÓN MANUAL",
    SaaS: "HORAS EN OPS Y SOPORTE MANUAL", Otros: "HORAS EN TAREAS REPETITIVAS",
  };
  const hoursLabel = taskFragment
    ? `HORAS EN ${taskFragment} / SEM`
    : `${hoursBase[sector] || hoursBase.Otros} / SEM`;

  const roleMap: Record<string, Record<string, string>> = {
    "1 – 5": {
      Ecommerce: "COSTE / HORA FUNDADOR–EQUIPO", SaaS: "COSTE / HORA FUNDADOR–DEV",
      Agencia: "COSTE / HORA FUNDADOR–CREATIVO", Salud: "COSTE / HORA PROFESIONAL SANITARIO",
      Inmobiliaria: "COSTE / HORA AGENTE", Logística: "COSTE / HORA RESPONSABLE OPS",
      Servicios: "COSTE / HORA PROFESIONAL", Otros: "COSTE / HORA EMPLEADO",
    },
    "6 – 20": {
      Ecommerce: "COSTE MEDIO / HORA EQUIPO", SaaS: "COSTE MEDIO / HORA DEVELOPER",
      Agencia: "COSTE MEDIO / HORA EQUIPO CREATIVO", Salud: "COSTE MEDIO / HORA PERSONAL",
      Inmobiliaria: "COSTE MEDIO / HORA AGENTE", Logística: "COSTE MEDIO / HORA OPERARIO",
      Servicios: "COSTE MEDIO / HORA EQUIPO", Otros: "COSTE MEDIO / HORA EMPLEADO",
    },
    "21 – 50": {
      Ecommerce: "COSTE MEDIO / HORA EMPLEADO", SaaS: "COSTE MEDIO / HORA EQUIPO TECH",
      Agencia: "COSTE MEDIO / HORA EQUIPO", Salud: "COSTE MEDIO / HORA PERSONAL CLÍNICO",
      Inmobiliaria: "COSTE MEDIO / HORA EQUIPO COMERCIAL", Logística: "COSTE MEDIO / HORA OPERARIO",
      Servicios: "COSTE MEDIO / HORA EQUIPO", Otros: "COSTE MEDIO / HORA EMPLEADO",
    },
    "50 +": {
      Ecommerce: "COSTE MEDIO / HORA DEPARTAMENTO", SaaS: "COSTE MEDIO / HORA EQUIPO TECH",
      Agencia: "COSTE MEDIO / HORA EQUIPO", Salud: "COSTE MEDIO / HORA PERSONAL",
      Inmobiliaria: "COSTE MEDIO / HORA RED DE AGENTES", Logística: "COSTE MEDIO / HORA PLANTILLA OPS",
      Servicios: "COSTE MEDIO / HORA EQUIPO", Otros: "COSTE MEDIO / HORA PLANTILLA",
    },
  };
  const costRoles = roleMap[teamSize] || roleMap["6 – 20"];
  const costLabel = costRoles[sector] || costRoles.Otros || "COSTE MEDIO / HORA";

  const volBase: Record<string, string> = {
    Ecommerce: "PEDIDOS Y CONSULTAS", Servicios: "SOLICITUDES DE SERVICIO",
    Inmobiliaria: "CONTACTOS DE INTERESADOS", Salud: "CITAS Y CONSULTAS",
    Logística: "ENVÍOS E INCIDENCIAS", Agencia: "PROYECTOS Y SOLICITUDES",
    SaaS: "TICKETS Y SIGNUPS", Otros: "CONSULTAS Y GESTIONES",
  };
  let volLabel = volBase[sector] || volBase.Otros;
  if (tasks.includes("Leads") && tasks.includes("Atención cliente")) {
    const ve: Record<string, string> = {
      Ecommerce: "LEADS + CONSULTAS DE COMPRA", SaaS: "LEADS + TICKETS DE SOPORTE",
      Agencia: "LEADS + SOLICITUDES DE PROYECTO", Salud: "PACIENTES NUEVOS + CONSULTAS",
      Inmobiliaria: "LEADS + VISITAS SOLICITADAS", Logística: "NUEVOS CLIENTES + INCIDENCIAS",
      Servicios: "LEADS + SOLICITUDES ENTRANTES", Otros: "LEADS + CONSULTAS ENTRANTES",
    };
    volLabel = ve[sector] || ve.Otros;
  } else if (tasks.includes("Leads")) {
    volLabel = ({ SaaS: "LEADS Y TRIALS", Inmobiliaria: "LEADS DE INTERESADOS", Salud: "PACIENTES NUEVOS" } as Record<string, string>)[sector] || "LEADS ENTRANTES";
  } else if (tasks.includes("Atención cliente")) {
    volLabel = ({ SaaS: "TICKETS DE SOPORTE", Salud: "CONSULTAS DE PACIENTES", Ecommerce: "CONSULTAS POST-VENTA" } as Record<string, string>)[sector] || "CONSULTAS DE CLIENTES";
  }
  volLabel += " / MES";

  const respBase: Record<string, string> = {
    Ecommerce: "TIEMPO RESPUESTA AL COMPRADOR", Servicios: "TIEMPO DE RESPUESTA AL CLIENTE",
    Inmobiliaria: "TIEMPO RESPUESTA AL INTERESADO", Salud: "TIEMPO DE ESPERA DEL PACIENTE",
    Logística: "TIEMPO RESOLUCIÓN DE INCIDENCIA", Agencia: "TIEMPO DE ENTREGA AL CLIENTE",
    SaaS: "TIEMPO DE PRIMERA RESPUESTA", Otros: "TIEMPO MEDIO DE RESPUESTA",
  };
  let respLabel = respBase[sector] || respBase.Otros;
  if (tasks.includes("Atención cliente")) {
    const rt: Record<string, string> = {
      SaaS: "RESPUESTA A TICKET DE SOPORTE", Salud: "RESPUESTA A CONSULTA PACIENTE",
      Ecommerce: "RESPUESTA A CONSULTA DE COMPRA", Inmobiliaria: "RESPUESTA A INTERESADO",
      Logística: "RESPUESTA A INCIDENCIA", Agencia: "RESPUESTA AL CLIENTE",
      Servicios: "RESPUESTA A SOLICITUD", Otros: "RESPUESTA A CLIENTE",
    };
    respLabel = rt[sector] || rt.Otros;
  } else if (tasks.includes("Leads")) {
    respLabel = "TIEMPO DE CONTACTO CON LEAD";
  }

  const ticketLabels: Record<string, string> = {
    Ecommerce: "TICKET MEDIO POR PEDIDO", SaaS: "TICKET MEDIO POR SUSCRIPCIÓN",
    Agencia: "TICKET MEDIO POR PROYECTO", Servicios: "TICKET MEDIO POR SERVICIO",
    Salud: "TICKET MEDIO POR CONSULTA", Inmobiliaria: "COMISIÓN MEDIA POR OPERACIÓN",
    Logística: "TICKET MEDIO POR ENVÍO", Otros: "TICKET MEDIO POR OPERACIÓN",
  };
  const ticketLabel = ticketLabels[sector] || ticketLabels.Otros;

  return {
    subtitle,
    ticketLabel,
    sliders: [
      { label: hoursLabel, min: 1, max: tr.maxH, unit: "h" },
      { label: costLabel, min: 10, max: maxCost, step: 5, unit: "€/h" },
      { label: volLabel, min: 10, max: tr.maxVol, step: 10, unit: "" },
      { label: respLabel, min: 1, max: 240, unit: "min" },
    ],
  };
}
