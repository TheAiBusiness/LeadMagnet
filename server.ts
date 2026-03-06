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

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json({ limit: "100kb" }));

// CORS
app.use("/api", (req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
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
let supabase: SupabaseClient | null = null;
function setupSupabase() {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (url && key) {
    supabase = createClient(url, key);
  }
  return supabase;
}

// ─── SendGrid ───
const setupSG = () => { const k = process.env.SENDGRID_API_KEY; if (k) sgMail.setApiKey(k); return !!k; };
const from = () => ({ email: process.env.SENDGRID_FROM_EMAIL || "info@theaibusiness.com", name: process.env.SENDGRID_FROM_NAME || "The AI Business" });
const notify = () => process.env.NOTIFY_EMAIL || from().email;
const calendlyUrl = () => process.env.CALENDLY_URL || "https://theaibusiness.com/#contacto";
const fmt = (n: number) => n.toLocaleString("es-ES");
const esc = (v: unknown): string => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ═══════════════════════════════════
// POST /api/send-report
// ═══════════════════════════════════
app.post("/api/send-report", rateLimit, async (req, res) => {
  if (!setupSG()) return res.status(500).json({ error: "SendGrid not configured" });
  try {
    const { name, email, sector, teamSize, revenue, usesAI, tasks, hours, costH, leads, respTime, avgTicket, h24, priority, calc } = req.body;
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
        { fmt, esc, calendlyUrl }
      );
    } catch (templateErr: unknown) {
      console.error("buildReportEmailHtml error:", templateErr);
      if (templateErr instanceof Error) console.error("Stack:", templateErr.stack);
      return res.status(500).json({ error: "Failed to build report" });
    }

    // Email al lead
    await sgMail.send({
      to: emailTo, from: from(),
      subject: `${sName ? sName + ", tu" : "Tu"} informe AI — € ${fmt(safeCalc.total)}/mes`,
      html: reportHtml,
    });

    // Notificación interna (usamos esc() directo para no depender de variables intermedias)
    await sgMail.send({
      to: notify(), from: from(),
      subject: `🔔 Lead: ${sName || "Anónimo"} — ${sSector} — € ${fmt(safeCalc.total)}/mes`,
      html: `<pre style="font-size:13px;line-height:1.8;">Nombre: ${sName || "-"}\nEmail: ${esc(email)}\nSector: ${sSector}\nEquipo: ${esc(teamSize)}\nFacturación: ${esc(revenue)}\nUsa IA: ${usesAI ? "Sí" : "No"}\nTareas: ${sTasks}\nHoras/sem: ${esc(hours)} | Coste/h: ${esc(costH)}€\nLeads/mes: ${esc(leads)} | Ticket medio: ${esc(avgTicket)}€\nResp: ${esc(respTime)}min | 24/7: ${h24 ? "Sí" : "No"}\nPrioridad: ${esc(priority)}\n\nAhorro/mes: € ${fmt(safeCalc.monthlySav)}\nIngreso: € ${fmt(safeCalc.addRev)}\nTotal/mes: € ${fmt(safeCalc.total)}\nAnual: € ${fmt(safeCalc.annual)}\nScore: ${esc(safeCalc.score)}/100</pre>`,
    });

    // Guardar lead en Supabase
    const sb = setupSupabase();
    if (sb) {
      try {
        const { error: dbErr } = await sb.from("leads").insert({
          name: name || null,
          email: emailTo,
          sector,
          team_size: teamSize,
          revenue,
          uses_ai: usesAI ?? null,
          tasks: tasks || [],
          hours_week: hours,
          cost_per_hour: costH,
          leads_month: leads,
          response_time: respTime,
          avg_ticket: avgTicket,
          h24: h24 ?? null,
          priority,
          monthly_savings: safeCalc.monthlySav,
          additional_revenue: safeCalc.addRev,
          total_impact: safeCalc.total,
          annual_impact: safeCalc.annual,
          ai_score: safeCalc.score,
        });
        if (dbErr) console.error("Supabase leads insert error:", dbErr.message);
      } catch (dbEx) {
        console.error("Supabase leads exception:", dbEx);
      }
    }

    res.json({ ok: true });
  } catch (err: unknown) {
    const sgErr = err as { response?: { body?: { errors?: Array<{ message?: string }> }; statusCode?: number } };
    const msg = sgErr?.response?.body || err;
    console.error("SendGrid /api/send-report error:", msg);
    if (err instanceof Error) console.error("Stack:", err.stack);
    // Mensaje seguro para ver en el navegador (pestaña Red) sin exponer datos sensibles
    let hint = "Failed to send";
    if (sgErr?.response?.body && typeof sgErr.response.body === "object") {
      const body = sgErr.response.body as { errors?: Array<{ message?: string }> };
      const first = body.errors?.[0]?.message;
      if (typeof first === "string") hint = first;
    } else if (err instanceof Error) hint = err.message.slice(0, 120);
    res.status(500).json({ error: "Failed to send", hint });
  }
});

// ═══════════════════════════════════
// POST /api/send-contact
// ═══════════════════════════════════
app.post("/api/send-contact", rateLimit, async (req, res) => {
  if (!setupSG()) return res.status(500).json({ error: "SendGrid not configured" });
  try {
    const { name, email, message } = req.body;
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

    await sgMail.send({
      to: emailStr, from: from(),
      subject: "Hemos recibido tu mensaje — The AI Business",
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;"><div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.04);"><h1 style="font-size:20px;color:#0B0B0B;margin:0 0 16px;">Gracias${nameSafe ? `, ${nameSafe}` : ""} 👋</h1><p style="color:#666;line-height:1.7;margin:0 0 24px;">Te responderemos en menos de 24 horas.</p><div style="text-align:center;"><a href="${calendlyUrl()}" style="display:inline-block;padding:12px 28px;background:#0B0B0B;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;">Reservar llamada</a></div></div></div>`,
    });

    // Guardar contacto en Supabase
    const sb = setupSupabase();
    if (sb) {
      try {
        const { error: dbErr } = await sb.from("contacts").insert({
          name: nameSafe || null,
          email: emailStr,
          message: messageStr,
        });
        if (dbErr) console.error("Supabase contacts insert error:", dbErr.message);
      } catch (dbEx) {
        console.error("Supabase contacts exception:", dbEx);
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
