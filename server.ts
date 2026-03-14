import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import compression from "compression";
import sgMail from "@sendgrid/mail";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { buildReportEmailHtml } from "./report-email";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
app.use(compression());
app.use(express.json({ limit: "100kb" }));

// CORS — whitelist de orígenes permitidos
const ALLOWED_ORIGINS = new Set([
  "https://theaibusiness.com",
  "https://www.theaibusiness.com",
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map(s => s.trim()) : []),
]);
if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.add("http://localhost:5173");
  ALLOWED_ORIGINS.add("http://localhost:3000");
}
app.use("/api", (req, res, next) => {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Rate limit simple en memoria (evitar abuso de envío de emails)
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 min
const RATE_MAX = 15; // máx solicitudes por IP en la ventana
const rateMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(req: express.Request, res: express.Response, next: () => void) {
  if (req.method !== "POST") return next();
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  let entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateMap.set(ip, entry);
  }
  entry.count++;
  if (entry.count > RATE_MAX) {
    res.status(429).json({ error: "Demasiadas solicitudes. Intenta en unos minutos." });
    return;
  }
  next();
}

// ─── Supabase ───
// Solo crear cliente si la URL tiene formato válido (evita Invalid supabaseUrl en Railway)
const SUPABASE_URL_REGEX = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/?$/;
let supabase: SupabaseClient | null = null;
function setupSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = (process.env.SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_KEY || "").trim();
  if (!SUPABASE_URL_REGEX.test(url) || !key) return null;
  try {
    supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch (err) {
    console.error("Supabase createClient error:", err);
  }
  return supabase;
}

// ─── SendGrid ───
const setupSG = () => { const k = process.env.SENDGRID_API_KEY; if (k) sgMail.setApiKey(k); return !!k; };
const from = () => ({ email: process.env.SENDGRID_FROM_EMAIL || "info@theaibusiness.com", name: process.env.SENDGRID_FROM_NAME || "The AI Business" });
const notify = () => process.env.NOTIFY_EMAIL || from().email;
const calendlyUrl = () => process.env.CALENDLY_URL || "https://cal.com/alejandro-rios-calera-qcnhfq/auditoria-theaibusiness";
const fmtLocale = (n: number, lang: string) => n.toLocaleString(lang === "en" ? "en-US" : "es-ES");
const esc = (v: unknown): string => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ═══════════════════════════════════
// POST /api/send-report
// ═══════════════════════════════════
app.post("/api/send-report", rateLimit, async (req, res) => {
  if (!setupSG()) return res.status(500).json({ error: "SendGrid not configured" });
  try {
    const { name, email, sector, teamSize, revenue, usesAI, tasks, hours, costH, leads, respTime, avgTicket, h24, priority, calc, lang: rawLang } = req.body;
    const lang = rawLang === "en" ? "en" as const : "es" as const;
    const fmt = (n: number) => fmtLocale(n, lang);
    const emailStr = typeof email === "string" ? email.trim() : "";
    if (!emailStr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) return res.status(400).json({ error: "Email válido requerido" });
    if (!calc || typeof calc.total !== "number") return res.status(400).json({ error: "Datos del informe inválidos" });
    const emailTo = emailStr;

    const sName = esc(name);
    const sSector = esc(sector);
    const sTeam = esc(teamSize);
    const sRevenue = esc(revenue);
    const sPriority = esc(priority);
    const sResp = esc(respTime);
    const sTasks = Array.isArray(tasks) ? tasks.map(esc).join(", ") : esc(tasks);

    // Asegurar que calc tiene todos los campos (evitar errores en Railway)
    const safeCalc = {
      hrsSaved: Number(calc.hrsSaved) || 0,
      monthlySav: Number(calc.monthlySav) || 0,
      addRev: Number(calc.addRev) || 0,
      newResp: Number(calc.newResp) || 0,
      respImprove: Number(calc.respImprove) || 0,
      score: Number(calc.score) || 0,
      total: Number(calc.total) || 0,
      annual: Number(calc.annual) || 0,
      avgTicket: Number(calc.avgTicket) || Number(avgTicket) || 0,
    };

    // Informe completo (mismo contenido que la web)
    let reportHtml: string;
    try {
      reportHtml = buildReportEmailHtml(
        { name, email: emailTo, sector, teamSize, revenue, usesAI, tasks: Array.isArray(tasks) ? tasks : [], hours: Number(hours) || 0, costH: Number(costH) || 0, leads: Number(leads) || 0, respTime: Number(respTime) || 0, avgTicket: Number(avgTicket) || 0, h24: h24 ?? null, priority: priority || "", calc: safeCalc },
        { fmt, esc, calendlyUrl },
        lang
      );
    } catch (templateErr: unknown) {
      console.error("buildReportEmailHtml error:", templateErr);
      if (templateErr instanceof Error) console.error("Stack:", templateErr.stack);
      return res.status(500).json({ error: "Failed to build report" });
    }

    // Email al lead
    const subjectText = lang === "en"
      ? `${sName ? sName + ", your" : "Your"} AI report — € ${fmt(safeCalc.total)}/mo`
      : `${sName ? sName + ", tu" : "Tu"} informe AI — € ${fmt(safeCalc.total)}/mes`;
    await sgMail.send({
      to: emailTo, from: from(),
      subject: subjectText,
      html: reportHtml,
    });

    // Notificación interna — no bloquea la respuesta al usuario
    try {
      await sgMail.send({
        to: notify(), from: from(),
        subject: `🔔 Lead: ${sName || "Anónimo"} — ${sSector} — € ${fmt(safeCalc.total)}/mes`,
        html: `<pre style="font-size:13px;line-height:1.8;">Nombre: ${sName || "-"}\nEmail: ${esc(emailTo)}\nSector: ${sSector}\nEquipo: ${esc(teamSize)}\nFacturación: ${esc(revenue)}\nUsa IA: ${usesAI ? "Sí" : "No"}\nTareas: ${sTasks}\nHoras/sem: ${esc(hours)} | Coste/h: ${esc(costH)}€\nLeads/mes: ${esc(leads)} | Ticket medio: ${esc(avgTicket)}€\nResp: ${esc(respTime)}min | 24/7: ${h24 ? "Sí" : "No"}\nPrioridad: ${esc(priority)}\n\nAhorro/mes: € ${fmt(safeCalc.monthlySav)}\nIngreso: € ${fmt(safeCalc.addRev)}\nTotal/mes: € ${fmt(safeCalc.total)}\nAnual: € ${fmt(safeCalc.annual)}\nScore: ${esc(safeCalc.score)}/100</pre>`,
      });
    } catch (notifyErr) {
      console.error("Notification email failed (non-blocking):", notifyErr);
    }

    // Guardar informe en Supabase vía RPC
    const sb = setupSupabase();
    if (sb) {
      try {
        const p_payload = {
          name: name || null,
          email: emailTo,
          sector,
          teamSize,
          revenue,
          usesAI: usesAI ?? null,
          tasks: tasks || [],
          hours: Number(hours) || 0,
          costH: Number(costH) || 0,
          leads: Number(leads) || 0,
          respTime: Number(respTime) || 0,
          avgTicket: Number(avgTicket) || 0,
          h24: h24 ?? null,
          priority: priority || "",
          createdAt: new Date().toISOString(),
          calc: {
            hrsSaved: safeCalc.hrsSaved,
            monthlySav: safeCalc.monthlySav,
            addRev: safeCalc.addRev,
            newResp: safeCalc.newResp,
            respImprove: safeCalc.respImprove,
            score: safeCalc.score,
            total: safeCalc.total,
            annual: safeCalc.annual,
          },
        };
        const { error: dbErr } = await sb.rpc("submit_ai_report", { p_payload, p_meta: {} });
        if (dbErr) console.error("Supabase submit_ai_report error:", dbErr.message);
      } catch (dbEx) {
        console.error("Supabase submit_ai_report error:", dbEx);
      }
    }

    res.json({ ok: true });
  } catch (err: unknown) {
    const sgErr = err as { response?: { body?: { errors?: Array<{ message?: string }> }; statusCode?: number } };
    const msg = sgErr?.response?.body || err;
    console.error("SendGrid /api/send-report error:", msg);
    if (err instanceof Error) console.error("Stack:", err.stack);
    res.status(500).json({ error: "Failed to send report. Please try again later." });
  }
});

// ═══════════════════════════════════
// POST /api/send-diagnostic
// ═══════════════════════════════════
function computeUrgencyScore(d: Record<string, string>, lang: "en" | "es" = "es") {
  let score = 0;
  if (d.clients === "c1000") score += 3; else if (d.clients === "c201_1000") score += 2; else if (d.clients === "c51_200") score += 1;
  if (d.upselling === "no") score += 3; else if (d.upselling === "little") score += 2.5; else if (d.upselling === "sometimes") score += 1;
  if (d.memoryDecisions === "tooMany") score += 4; else if (d.memoryDecisions === "often") score += 3; else if (d.memoryDecisions === "sometimes") score += 1.5;
  if (d.absence === "depends") score += 4; else if (d.absence === "slowdown") score += 3; else if (d.absence === "adjustments") score += 1.5;
  if (d.lostTime === "tooMuch") score += 3; else if (d.lostTime === "quite") score += 2; else if (d.lostTime === "sometimes") score += 1;
  if (d.manualWork === "tooMuch") score += 3; else if (d.manualWork === "quite") score += 2; else if (d.manualWork === "some") score += 1;
  if (d.profitVisibility === "dontKnow") score += 4; else if (d.profitVisibility === "intuition") score += 3; else if (d.profitVisibility === "moreOrLess") score += 1.5;
  if (d.opportunities === "late") score += 3.5; else if (d.opportunities === "hard") score += 2.5; else if (d.opportunities === "sometimes") score += 1;
  if (d.doubleClients === "break") score += 4; else if (d.doubleClients === "complicated") score += 3; else if (d.doubleClients === "adjustments") score += 1.5;
  if (d.mainDisorder === "scale") score += 3.5; else if (d.mainDisorder === "opportunities") score += 3; else if (d.mainDisorder === "processes") score += 2.5; else if (d.mainDisorder === "freeTeam") score += 2; else if (d.mainDisorder === "control") score += 1.5;
  const value = Math.min(Math.round((score / 37) * 100), 100);
  let level: string, color: string;
  if (value >= 65) {
    level = lang === "en" ? "VERY CRITICAL" : "MUY GRAVE";
    color = "#DC2626";
  } else if (value >= 45) {
    level = lang === "en" ? "URGENT" : "URGENTE";
    color = "#EA580C";
  } else if (value >= 25) {
    level = lang === "en" ? "ATTENTION NEEDED" : "ATENCIÓN NECESARIA";
    color = "#F59E0B";
  } else {
    level = lang === "en" ? "WELL POSITIONED" : "BIEN POSICIONADO";
    color = "#10B981";
  }
  return { value, level, color };
}

// ─── Label lookup tables for diagnostic email ───────────────────────────────
const DIAG_LABELS: Record<"en" | "es", Record<string, Record<string, string>>> = {
  en: {
    step1:  { roleCeo: "CEO / founder", roleDireccion: "Management", roleOps: "Operations", roleTech: "Technology", roleOtro: "Other" },
    step2:  { e1_10: "1–10", e11_50: "11–50", e51_200: "51–200", e200: "+200" },
    step3:  { c1_10: "1–10", c11_50: "11–50", c51_200: "51–200", c201_1000: "201–1000", c1000: "+1000" },
    step4:  { yesClear: "Yes, with a clear system", sometimes: "Sometimes", little: "Very little", no: "Not really" },
    step5:  { rarely: "Almost never", sometimes: "Sometimes", often: "Quite often", tooMany: "Too many times" },
    step6:  { same: "It would run the same", adjustments: "There'd be some adjustments", slowdown: "It would slow down", depends: "It depends on me" },
    step7:  { rarely: "Almost never", sometimes: "Sometimes", quite: "Quite a bit", tooMuch: "Too much" },
    step8:  { almostNone: "Almost none", some: "Some", quite: "Quite a bit", tooMuch: "Too much" },
    step9:  { yesClear: "Yes, with clear data", moreOrLess: "More or less", intuition: "We have a feeling", dontKnow: "We don't know" },
    step10: { fast: "We execute fast", sometimes: "We sometimes get there", hard: "We struggle to react", late: "We often get there late" },
    step11: { ok: "We'd hold up fine", adjustments: "With some adjustments", complicated: "It'd get complicated", break: "It'd break" },
    step12: { control: "More control", freeTeam: "Free up the team", opportunities: "Not miss opportunities", processes: "Tidy processes", scale: "Scale without breaking" },
  },
  es: {
    step1:  { roleCeo: "CEO / fundador", roleDireccion: "Dirección", roleOps: "Operaciones", roleTech: "Tecnología", roleOtro: "Otro" },
    step2:  { e1_10: "1–10", e11_50: "11–50", e51_200: "51–200", e200: "+200" },
    step3:  { c1_10: "1–10", c11_50: "11–50", c51_200: "51–200", c201_1000: "201–1000", c1000: "+1000" },
    step4:  { yesClear: "Sí, con sistema claro", sometimes: "Algunas veces", little: "Muy poco", no: "No realmente" },
    step5:  { rarely: "Casi nunca", sometimes: "A veces", often: "Bastante a menudo", tooMany: "Demasiadas veces" },
    step6:  { same: "Funcionaría igual", adjustments: "Habría ajustes", slowdown: "Se ralentizaría", depends: "Depende de mí" },
    step7:  { rarely: "Casi nunca", sometimes: "A veces", quite: "Bastante", tooMuch: "Demasiado" },
    step8:  { almostNone: "Casi nada", some: "Algo", quite: "Bastante", tooMuch: "Demasiado" },
    step9:  { yesClear: "Sí, con datos claros", moreOrLess: "Más o menos", intuition: "Lo intuimos", dontKnow: "No lo sabemos" },
    step10: { fast: "La ejecutamos rápido", sometimes: "A veces llegamos", hard: "Nos cuesta reaccionar", late: "Solemos llegar tarde" },
    step11: { ok: "Aguantaríamos bien", adjustments: "Con algunos ajustes", complicated: "Se complicaría", break: "Se rompería" },
    step12: { control: "Tener más control", freeTeam: "Liberar al equipo", opportunities: "No perder oportunidades", processes: "Ordenar procesos", scale: "Escalar sin romper" },
  },
};

function buildDiagnosticEmailHtml(p: {
  name: string; email: string; urgency: { value: number; level: string; color: string };
  role?: string; employees?: string; clients?: string; mainDisorder?: string;
  doubleClients?: string; profitVisibility?: string; opportunities?: string; absence?: string;
  calendlyUrl: string; lang?: "en" | "es";
}): string {
  const { name, urgency, calendlyUrl: cal } = p;
  const lang = p.lang ?? "es";
  const isEn = lang === "en";

  const tr = (step: string, key?: string): string =>
    key ? (DIAG_LABELS[lang][step]?.[key] ?? key) : "";

  const locale = isEn ? "en-GB" : "es-ES";
  const today = new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  const barWidth = `${urgency.value}%`;

  const labelRole      = isEn ? "Role"           : "Rol";
  const labelEmployees = isEn ? "Employees"       : "Empleados";
  const labelClients   = isEn ? "Active clients"  : "Clientes activos";
  const labelPriority  = isEn ? "Main priority"   : "Prioridad principal";
  const labelUrgency   = isEn ? "URGENCY LEVEL"   : "NIVEL DE URGENCIA";
  const labelDetected  = isEn ? "DETECTED LEVEL"  : "NIVEL DETECTADO";
  const labelOf100     = isEn ? "of 100"          : "de 100";
  const labelProfile   = isEn ? "YOUR PROFILE"    : "TU PERFIL";
  const labelTitle     = isEn ? "Business Diagnosis" : "Diagnóstico Empresarial";
  const labelPrepared  = isEn ? "Prepared for"    : "Preparado para";
  const labelCta       = isEn
    ? "Book your free strategy session"
    : "Agenda tu sesión estratégica gratuita";
  const labelCtaSub    = isEn
    ? "30 minutes to design your action plan · No commitment · Results in 48h"
    : "30 minutos para diseñar tu plan de acción · Sin compromiso · Resultados en 48h";
  const labelFooter    = isEn
    ? "* This diagnosis is based on your responses and industry benchmarks. It is a guidance tool to help you identify areas for improvement."
    : "* Este diagnóstico está basado en tus respuestas y benchmarks del sector. Es una herramienta orientativa para ayudarte a identificar áreas de mejora.";
  const subjectPreview = isEn
    ? `${name ? esc(name) + ", your" : "Your"} business diagnosis is ready`
    : `${name ? esc(name) + ", tu" : "Tu"} diagnóstico empresarial está listo`;

  const profileRows = [
    p.role      && `<tr><td style="color:#999;font-size:12px;padding:4px 0;">${labelRole}</td><td style="font-size:13px;font-weight:500;color:#0B0B0B;">${esc(tr("step1", p.role))}</td></tr>`,
    p.employees && `<tr><td style="color:#999;font-size:12px;padding:4px 0;">${labelEmployees}</td><td style="font-size:13px;font-weight:500;color:#0B0B0B;">${esc(tr("step2", p.employees))}</td></tr>`,
    p.clients   && `<tr><td style="color:#999;font-size:12px;padding:4px 0;">${labelClients}</td><td style="font-size:13px;font-weight:500;color:#0B0B0B;">${esc(tr("step3", p.clients))}</td></tr>`,
    p.mainDisorder && `<tr><td style="color:#999;font-size:12px;padding:4px 0;">${labelPriority}</td><td style="font-size:13px;font-weight:500;color:#0B0B0B;">${esc(tr("step12", p.mainDisorder))}</td></tr>`,
  ].filter(Boolean).join("");

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${labelTitle}</title></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.06);">
  <!-- Header -->
  <tr><td style="padding:20px 32px;border-bottom:1px solid #F0F0F0;background:#FAFAFA;">
    <table width="100%"><tr>
      <td style="font-size:11px;color:#999;">${isEn ? "Email preview" : "Vista previa del email"}</td>
      <td align="right" style="font-size:11px;color:#ccc;">${today}</td>
    </tr><tr>
      <td colspan="2" style="padding-top:8px;font-size:11px;color:#aaa;">
        ${isEn ? "To" : "Para"}: ${esc(p.email)}<br>
        ${isEn ? "From" : "De"}: info@theaibusiness.com<br>
        <span style="color:#555;font-weight:500;">${isEn ? "Subject" : "Asunto"}: ${subjectPreview}</span>
      </td>
    </tr></table>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:40px 32px;">
    <!-- Brand -->
    <p style="margin:0 0 8px;font-size:10px;color:#ccc;letter-spacing:0.2em;text-align:center;">THE AI BUSINESS</p>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#0B0B0B;text-align:center;">${labelTitle}</h1>
    <p style="margin:0 0 40px;font-size:13px;color:#999;text-align:center;">${labelPrepared} <strong style="color:#0B0B0B;">${name ? esc(name) : (isEn ? "your business" : "tu negocio")}</strong> · ${today}</p>

    <!-- Urgency -->
    <p style="margin:0 0 16px;font-size:10px;color:#aaa;letter-spacing:0.18em;text-align:center;border-top:1px solid #EBEBEB;padding-top:16px;">${labelUrgency}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${urgency.color};border-radius:12px;padding:0;margin-bottom:32px;">
    <tr><td style="padding:24px;">
      <table width="100%"><tr>
        <td><p style="margin:0;font-size:10px;color:#aaa;letter-spacing:0.1em;">${labelDetected}</p>
            <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:${urgency.color};">${esc(urgency.level)}</p></td>
        <td align="right"><span style="display:inline-block;padding:8px 20px;border-radius:999px;background:${urgency.color}20;color:${urgency.color};font-size:20px;font-weight:700;">${urgency.value}</span>
            <p style="margin:4px 0 0;font-size:10px;color:#ccc;text-align:right;">${labelOf100}</p></td>
      </tr></table>
      <!-- Bar -->
      <div style="height:10px;background:#F0F0F0;border-radius:999px;margin:20px 0;overflow:hidden;">
        <div style="height:10px;width:${barWidth};background:${urgency.color};border-radius:999px;"></div>
      </div>
    </td></tr></table>

    ${profileRows ? `
    <!-- Profile -->
    <p style="margin:0 0 12px;font-size:10px;color:#aaa;letter-spacing:0.18em;text-align:center;border-top:1px solid #EBEBEB;padding-top:16px;">${labelProfile}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F0F0F0;border-radius:10px;margin-bottom:32px;">
    <tr><td style="padding:16px;"><table width="100%">${profileRows}</table></td></tr>
    </table>` : ""}

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${cal || "https://theaibusiness.com/#contacto"}" style="display:inline-block;padding:16px 36px;background:#0B0B0B;color:#fff;text-decoration:none;border-radius:999px;font-size:15px;font-weight:500;">${labelCta}</a>
      <p style="margin:16px 0 0;font-size:11px;color:#aaa;">${labelCtaSub}</p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #F0F0F0;padding-top:20px;text-align:center;">
      <p style="margin:0;font-size:10px;color:#ccc;line-height:1.8;">
        The AI Business · info@theaibusiness.com<br>
        ${labelFooter}
      </p>
    </div>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

app.post("/api/send-diagnostic", rateLimit, async (req, res) => {
  if (!setupSG()) return res.status(500).json({ error: "SendGrid not configured" });
  try {
    const {
      name, email,
      role, employees, clients, upselling, memoryDecisions, absence,
      lostTime, manualWork, profitVisibility, opportunities, doubleClients, mainDisorder,
      sector, teamSize, revenue, usesAI, tasks, hours, costH, leads, respTime, avgTicket, h24, priority,
      calc, lang: rawDiagLang,
    } = req.body;

    const diagLang = rawDiagLang === "en" ? "en" as const : "es" as const;
    const isEnDiag = diagLang === "en";

    const emailStr = typeof email === "string" ? email.trim() : "";
    if (!emailStr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      return res.status(400).json({ error: "Email válido requerido" });
    }

    const sName = esc(name || "");
    const urgency = computeUrgencyScore({ clients, upselling, memoryDecisions, absence, lostTime, manualWork, profitVisibility, opportunities, doubleClients, mainDisorder }, diagLang);

    // Email to user
    const userHtml = buildDiagnosticEmailHtml({
      name: sName, email: emailStr, urgency,
      role, employees, clients, mainDisorder, doubleClients, profitVisibility, opportunities, absence,
      calendlyUrl: calendlyUrl(), lang: diagLang,
    });

    const diagSubject = isEnDiag
      ? `${sName ? sName + ", your" : "Your"} business diagnosis is ready`
      : `${sName ? sName + ", tu" : "Tu"} diagnóstico empresarial está listo`;

    await sgMail.send({
      to: emailStr, from: from(),
      subject: diagSubject,
      html: userHtml,
    });

    // Internal notification
    try {
      const tl = (step: string, key?: string) => key ? (DIAG_LABELS.es[step]?.[key] ?? key) : "-";
      await sgMail.send({
        to: notify(), from: from(),
        subject: `🔔 Diagnóstico: ${sName || "Anónimo"} — ${urgency.level} (${urgency.value}/100)`,
        html: `<pre style="font-size:13px;line-height:1.8;">Nombre: ${sName || "-"}\nEmail: ${esc(emailStr)}\nUrgencia: ${urgency.level} (${urgency.value}/100)\n\nRol: ${tl("step1", role)}\nEmpleados: ${tl("step2", employees)}\nClientes: ${tl("step3", clients)}\nUpselling: ${tl("step4", upselling)}\nDecisiones por memoria: ${tl("step5", memoryDecisions)}\nAusencia: ${tl("step6", absence)}\nTiempo perdido: ${tl("step7", lostTime)}\nTrabajo manual: ${tl("step8", manualWork)}\nVisibilidad rentab.: ${tl("step9", profitVisibility)}\nOportunidades: ${tl("step10", opportunities)}\nDuplicar clientes: ${tl("step11", doubleClients)}\nDesorden principal: ${tl("step12", mainDisorder)}\n\nSector: ${esc(sector)}\nEquipo: ${esc(teamSize)}\nFacturación: ${esc(revenue)}</pre>`,
      });
    } catch (notifyErr) {
      console.error("Notification email failed (non-blocking):", notifyErr);
    }

    // Save to Supabase
    const sb = setupSupabase();
    if (sb) {
      try {
        const p_payload = {
          name: name || null, email: emailStr,
          role, employees, clients, upselling, memoryDecisions, absence,
          lostTime, manualWork, profitVisibility, opportunities, doubleClients, mainDisorder,
          sector, teamSize, revenue,
          usesAI: usesAI ?? null,
          tasks: tasks || [],
          hours: Number(hours) || 0, costH: Number(costH) || 0,
          leads: Number(leads) || 0, respTime: Number(respTime) || 0, avgTicket: Number(avgTicket) || 0,
          h24: h24 ?? null, priority: priority || "",
          createdAt: new Date().toISOString(),
          urgency,
          calc: calc ? {
            hrsSaved: Number(calc.hrsSaved) || 0,
            monthlySav: Number(calc.monthlySav) || 0,
            addRev: Number(calc.addRev) || 0,
            newResp: Number(calc.newResp) || 0,
            respImprove: Number(calc.respImprove) || 0,
            score: Number(calc.score) || 0,
            total: Number(calc.total) || 0,
            annual: Number(calc.annual) || 0,
            avgTicket: Number(calc.avgTicket) || Number(avgTicket) || 0,
          } : null,
        };
        const { error: dbErr } = await sb.rpc("submit_ai_report", { p_payload, p_meta: {} });
        if (dbErr) console.error("Supabase submit_ai_report error:", dbErr.message);
      } catch (dbEx) {
        console.error("Supabase submit_ai_report error:", dbEx);
      }
    }

    res.json({ ok: true });
  } catch (err: unknown) {
    console.error("send-diagnostic error:", err);
    if (err instanceof Error) console.error("Stack:", err.stack);
    res.status(500).json({ error: "Failed to send. Please try again later." });
  }
});

// ═══════════════════════════════════
// POST /api/send-contact
// ═══════════════════════════════════
app.post("/api/send-contact", rateLimit, async (req, res) => {
  if (!setupSG()) return res.status(500).json({ error: "SendGrid not configured" });
  try {
    const { name, email, message, lang: rawContactLang } = req.body;
    const contactLang = rawContactLang === "en" ? "en" : "es";
    const emailStr = typeof email === "string" ? email.trim() : "";
    const messageStr = typeof message === "string" ? message.trim().slice(0, 5000) : "";
    if (!emailStr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) return res.status(400).json({ error: "Email válido requerido" });
    if (!messageStr) return res.status(400).json({ error: "El mensaje es obligatorio" });
    const nameSafe = typeof name === "string" ? name.trim().slice(0, 200).replace(/</g, "&lt;") : "";
    const messageSafe = messageStr.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    await sgMail.send({
      to: notify(), from: from(), replyTo: { email: emailStr, name: nameSafe || undefined },
      subject: `📩 Contacto: ${nameSafe || "Sin nombre"}`,
      html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.8;padding:20px;max-width:500px;"><h2 style="margin:0 0 20px;">Nuevo contacto</h2><p><strong>Nombre:</strong> ${nameSafe || "-"}<br><strong>Email:</strong> ${emailStr}</p><div style="background:#f5f5f5;border-radius:12px;padding:16px;margin-top:16px;white-space:pre-wrap;">${messageSafe}</div></div>`,
    });

    const contactSubject = contactLang === "en"
      ? "We've received your message — The AI Business"
      : "Hemos recibido tu mensaje — The AI Business";
    const contactThanks = contactLang === "en"
      ? `Thank you${nameSafe ? `, ${nameSafe}` : ""}`
      : `Gracias${nameSafe ? `, ${nameSafe}` : ""}`;
    const contactReply = contactLang === "en"
      ? "We'll get back to you within 24 hours."
      : "Te responderemos en menos de 24 horas.";
    const contactCta = contactLang === "en" ? "Book a call" : "Reservar llamada";
    await sgMail.send({
      to: emailStr, from: from(),
      subject: contactSubject,
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;"><div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.04);"><h1 style="font-size:20px;color:#0B0B0B;margin:0 0 16px;">${contactThanks} 👋</h1><p style="color:#666;line-height:1.7;margin:0 0 24px;">${contactReply}</p><div style="text-align:center;"><a href="${calendlyUrl()}" style="display:inline-block;padding:12px 28px;background:#0B0B0B;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;">${contactCta}</a></div></div></div>`,
    });

    // Guardar mensaje de contacto en Supabase vía RPC
    const sb = setupSupabase();
    if (sb) {
      try {
        const p_payload = {
          name: nameSafe || null,
          email: emailStr,
          message: messageStr,
        };
        const { error: dbErr } = await sb.rpc("submit_contact_message", { p_payload, p_meta: {} });
        if (dbErr) console.error("Supabase submit_contact_message error:", dbErr.message);
      } catch (dbEx) {
        console.error("Supabase submit_contact_message error:", dbEx);
      }
    }

    res.json({ ok: true });
  } catch (err: unknown) {
    const sgErr = err as { response?: { body?: unknown } };
    console.error("SendGrid error:", sgErr?.response?.body || err);
    res.status(500).json({ error: "Failed to send" });
  }
});

// Health
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    sendgrid: !!process.env.SENDGRID_API_KEY,
    supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY,
  });
});

// Serve Vite build + SPA fallback
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

app.listen(PORT, () => {
  console.log(`✓ Server on port ${PORT}`);
  console.log(`✓ SendGrid: ${process.env.SENDGRID_API_KEY ? "OK" : "NOT configured"}`);
  console.log(`✓ Supabase: ${process.env.SUPABASE_URL ? "OK" : "NOT configured"}`);
});
