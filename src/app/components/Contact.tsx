import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Calendar, Mail, Send, MessageCircle } from "lucide-react";
import { CONTACT_EMAIL, WHATSAPP_NUMBER, CALENDLY_URL, API_BASE } from "../lib/constants";

export function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const openCalendly = () => {
    if (CALENDLY_URL) window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
    else document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent("Hola, me gustaría saber más sobre vuestros servicios de IA.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const submit = async () => {
    const n = name.trim(), e = email.trim(), m = msg.trim();
    if (!e || !e.includes("@")) { setSendError("Email no válido"); return; }
    if (!m) { setSendError("Escribe un mensaje"); return; }
    setSendError("");

    try {
      setSending(true);
      const res = await fetch(`${API_BASE}/api/send-contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, email: e, message: m }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      const subject = encodeURIComponent("Contacto — The AI Business");
      const body = encodeURIComponent(`${m}\n\n—\n${n || "Sin nombre"}\n${e}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      setSendError("Se ha abierto tu cliente de correo. Envíalo desde ahí.");
    } finally { setSending(false); }
  };

  return (
    <section id="contacto" className="py-24 md:py-32 px-6 relative overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-[1200px] mx-auto relative z-10" ref={ref}>
        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={inView ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.6 }}
          className="text-center tracking-[0.25em] text-[#0B0B0B]/30 mb-4"
          style={{ fontSize: "0.7rem", fontWeight: 500 }}
        >CONTACTO</motion.p>
        <motion.h2
          initial={{ opacity: 0, filter: "blur(12px)", y: 12 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(12px)", y: 12 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center text-[#0B0B0B] mb-10"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 600, lineHeight: 1.15 }}
        >¿Hablamos de tu caso?</motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left — channels */}
          <motion.div
            initial={{ opacity: 0, filter: "blur(14px)", y: 20 }}
            animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(14px)", y: 20 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-3xl border border-[#EAEAEA]/60 bg-white/70 backdrop-blur-xl p-8"
          >
            <p className="text-[#0B0B0B]/40 mb-6" style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
              Elige la vía que prefieras. Si ya tienes el informe de la calculadora, tráelo y lo revisamos juntos.
            </p>
            <div className="space-y-3">
              <button onClick={openCalendly}
                className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-2xl border border-[#0B0B0B]/10 hover:border-[#0B0B0B]/25 hover:bg-[#0B0B0B]/[0.02] transition-all duration-300 cursor-pointer group">
                <span className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#0B0B0B]/[0.04] flex items-center justify-center group-hover:bg-[#0B0B0B]/[0.08] transition-colors"><Calendar size={18} className="text-[#0B0B0B]/60" /></span>
                  <span className="text-left">
                    <span className="block text-[#0B0B0B]" style={{ fontWeight: 600 }}>Reservar llamada</span>
                    <span className="block text-[#0B0B0B]/35" style={{ fontSize: "0.85rem" }}>20–30 min · sin compromiso</span>
                  </span>
                </span>
                <span className="text-[#0B0B0B]/35 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button onClick={openWhatsApp}
                className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-2xl border border-[#25D366]/20 hover:border-[#25D366]/40 hover:bg-[#25D366]/[0.03] transition-all duration-300 cursor-pointer group">
                <span className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#25D366]/[0.08] flex items-center justify-center group-hover:bg-[#25D366]/[0.15] transition-colors"><MessageCircle size={18} className="text-[#25D366]" /></span>
                  <span className="text-left">
                    <span className="block text-[#0B0B0B]" style={{ fontWeight: 600 }}>WhatsApp</span>
                    <span className="block text-[#0B0B0B]/35" style={{ fontSize: "0.85rem" }}>Respuesta rápida · chat directo</span>
                  </span>
                </span>
                <span className="text-[#0B0B0B]/35 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <a href={`mailto:${CONTACT_EMAIL}`}
                className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-2xl border border-[#0B0B0B]/10 hover:border-[#0B0B0B]/25 hover:bg-[#0B0B0B]/[0.02] transition-all duration-300 group">
                <span className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-[#0B0B0B]/[0.04] flex items-center justify-center group-hover:bg-[#0B0B0B]/[0.08] transition-colors"><Mail size={18} className="text-[#0B0B0B]/60" /></span>
                  <span className="text-left">
                    <span className="block text-[#0B0B0B]" style={{ fontWeight: 600 }}>Email directo</span>
                    <span className="block text-[#0B0B0B]/35" style={{ fontSize: "0.85rem" }}>{CONTACT_EMAIL}</span>
                  </span>
                </span>
                <span className="text-[#0B0B0B]/35 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, filter: "blur(14px)", y: 20 }}
            animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(14px)", y: 20 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="rounded-3xl border border-[#EAEAEA]/60 bg-white/70 backdrop-blur-xl p-8"
          >
            <p className="text-[#0B0B0B] mb-1" style={{ fontWeight: 600 }}>Envíanos un mensaje</p>
            <p className="text-[#0B0B0B]/35 mb-6" style={{ fontSize: "0.9rem" }}>Respondemos en menos de 24h.</p>
            <div className="space-y-4">
              <label htmlFor="contact-name" className="sr-only">Nombre</label>
              <input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-2xl border border-[#0B0B0B]/10 focus:outline-none focus:border-[#0B0B0B]/30 focus:ring-2 focus:ring-[#0B0B0B]/5 bg-white transition-all" style={{ fontSize: "0.95rem" }} />
              <label htmlFor="contact-email" className="sr-only">Email</label>
              <input id="contact-email" value={email} onChange={(e) => { setEmail(e.target.value); setSendError(""); }} placeholder="tu@email.com" type="email"
                className="w-full px-4 py-3 rounded-2xl border border-[#0B0B0B]/10 focus:outline-none focus:border-[#0B0B0B]/30 focus:ring-2 focus:ring-[#0B0B0B]/5 bg-white transition-all" style={{ fontSize: "0.95rem" }} />
              <label htmlFor="contact-msg" className="sr-only">Mensaje</label>
              <textarea id="contact-msg" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Cuéntanos brevemente tu situación…" rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-[#0B0B0B]/10 focus:outline-none focus:border-[#0B0B0B]/30 focus:ring-2 focus:ring-[#0B0B0B]/5 bg-white resize-none transition-all" style={{ fontSize: "0.95rem", lineHeight: 1.6 }} />
              <motion.button onClick={submit} disabled={sending}
                whileHover={!sending ? { scale: 1.01, boxShadow: "0 8px 30px rgba(11,11,11,0.12)" } : {}}
                whileTap={!sending ? { scale: 0.98 } : {}}
                className={`w-full flex items-center justify-center gap-2 py-3.5 bg-[#0B0B0B] text-white rounded-2xl shadow-[0_4px_20px_rgba(11,11,11,0.08)] ${sending ? "opacity-70 cursor-wait" : "hover:bg-[#0B0B0B]/90 cursor-pointer"}`}
                style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                <Send size={16} />{sending ? "Enviando…" : "Enviar mensaje"}
              </motion.button>
              {sendError && <p className="text-center text-red-500" style={{ fontSize: "0.8rem" }}>{sendError}</p>}
              {sent && !sendError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-green-600" style={{ fontSize: "0.8rem" }}>
                  ✓ Mensaje enviado. Te responderemos pronto.
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
