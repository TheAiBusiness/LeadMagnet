import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import sgMail from "@sendgrid/mail";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

    // Email al lead
    await sgMail.send({
      to: emailTo, from: from(),
      subject: `${name ? name + ", tu" : "Tu"} informe AI — € ${fmt(calc.total)}/mes`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-size:24px;color:#0B0B0B;margin:0 0 8px;">Tu informe personalizado</h1>
    <p style="font-size:14px;color:#0B0B0B99;margin:0;">The AI Business</p>
  </div>
  <div style="background:#fff;border-radius:16px;padding:32px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
    <p style="font-size:16px;color:#0B0B0B;margin:0 0 24px;">Hola${name ? ` ${name}` : ""},</p>
    <p style="font-size:14px;color:#0B0B0B99;line-height:1.7;margin:0 0 28px;">Aquí tienes una estimación del impacto que la IA podría tener en tu negocio.</p>
    <div style="background:#FAFAFA;border-radius:12px;padding:24px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;"><span style="font-size:12px;color:#0B0B0B66;text-transform:uppercase;letter-spacing:0.05em;">Ahorro mensual</span><br><span style="font-size:28px;font-weight:700;color:#0B0B0B;">€ ${fmt(calc.monthlySav)}</span></td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;"><span style="font-size:12px;color:#0B0B0B66;text-transform:uppercase;letter-spacing:0.05em;">Ingreso adicional</span><br><span style="font-size:28px;font-weight:700;color:#0B0B0B;">€ ${fmt(calc.addRev)}</span></td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;"><span style="font-size:12px;color:#0B0B0B66;text-transform:uppercase;letter-spacing:0.05em;">Mejora respuesta</span><br><span style="font-size:28px;font-weight:700;color:#0B0B0B;">${respTime} → ${calc.newResp} min</span></td></tr>
        <tr><td style="padding:12px 0;"><span style="font-size:12px;color:#0B0B0B66;text-transform:uppercase;letter-spacing:0.05em;">AI Score</span><br><span style="font-size:28px;font-weight:700;color:#0B0B0B;">${calc.score}/100</span></td></tr>
      </table>
    </div>
    <div style="background:#0B0B0B;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Impacto total / mes</p>
      <p style="font-size:36px;font-weight:700;color:#fff;margin:0;">€ ${fmt(calc.total)}</p>
      <p style="font-size:12px;color:rgba(255,255,255,0.3);margin:4px 0 0;">≈ € ${fmt(calc.annual)}/año</p>
    </div>
    <div style="background:#FAFAFA;border-radius:12px;padding:20px;margin-bottom:28px;">
      <p style="font-size:11px;color:#0B0B0B44;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Tu perfil</p>
      <table style="font-size:13px;color:#0B0B0B99;line-height:1.8;">
        <tr><td style="padding-right:16px;color:#0B0B0B44;">Sector</td><td>${sector}</td></tr>
        <tr><td style="padding-right:16px;color:#0B0B0B44;">Equipo</td><td>${teamSize}</td></tr>
        <tr><td style="padding-right:16px;color:#0B0B0B44;">Facturación</td><td>${revenue}</td></tr>
        <tr><td style="padding-right:16px;color:#0B0B0B44;">Tareas</td><td>${(tasks as string[]).join(", ")}</td></tr>
        <tr><td style="padding-right:16px;color:#0B0B0B44;">Prioridad</td><td>${priority}</td></tr>
      </table>
    </div>
    <div style="text-align:center;">
      <a href="${calendlyUrl()}" style="display:inline-block;padding:14px 32px;background:#0B0B0B;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:500;">Reservar llamada gratuita →</a>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#0B0B0B33;">© ${new Date().getFullYear()} The AI Business</p>
</div></body></html>`,
    });

    // Notificación interna
    await sgMail.send({
      to: notify(), from: from(),
      subject: `🔔 Lead: ${name || "Anónimo"} — ${sector} — € ${fmt(calc.total)}/mes`,
      html: `<pre style="font-size:13px;line-height:1.8;">Nombre: ${name || "-"}\nEmail: ${email}\nSector: ${sector}\nEquipo: ${teamSize}\nFacturación: ${revenue}\nUsa IA: ${usesAI ? "Sí" : "No"}\nTareas: ${(tasks as string[]).join(", ")}\nHoras/sem: ${hours} | Coste/h: ${costH}€\nLeads/mes: ${leads} | Ticket medio: ${avgTicket}€\nResp: ${respTime}min | 24/7: ${h24 ? "Sí" : "No"}\nPrioridad: ${priority}\n\nAhorro/mes: € ${fmt(calc.monthlySav)}\nIngreso: € ${fmt(calc.addRev)}\nTotal/mes: € ${fmt(calc.total)}\nAnual: € ${fmt(calc.annual)}\nScore: ${calc.score}/100</pre>`,
    });

    // Guardar lead en Supabase (no bloquea la respuesta)
    const sb = setupSupabase();
    if (sb) {
      sb.from("leads").insert({
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
        monthly_savings: calc.monthlySav,
        additional_revenue: calc.addRev,
        total_impact: calc.total,
        annual_impact: calc.annual,
        ai_score: calc.score,
      }).then(({ error: dbErr }) => {
        if (dbErr) console.error("Supabase leads insert error:", dbErr.message);
      });
    }

    res.json({ ok: true });
  } catch (err: any) {
    console.error("SendGrid error:", err?.response?.body || err);
    res.status(500).json({ error: "Failed to send" });
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
      sb.from("contacts").insert({
        name: nameSafe || null,
        email: emailStr,
        message: messageStr,
      }).then(({ error: dbErr }) => {
        if (dbErr) console.error("Supabase contacts insert error:", dbErr.message);
      });
    }

    res.json({ ok: true });
  } catch (err: any) {
    console.error("SendGrid error:", err?.response?.body || err);
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
