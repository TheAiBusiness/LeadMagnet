import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "¿Cuánto tiempo tarda la implementación?",
    a: "Depende de la complejidad, pero la mayoría de proyectos están operativos en 2–6 semanas. Empezamos con un MVP funcional en los primeros días.",
  },
  {
    q: "¿Necesito un equipo técnico interno?",
    a: "No. Nos encargamos de todo: diseño, desarrollo, integración y mantenimiento. Solo necesitas a alguien que nos dé contexto de negocio.",
  },
  {
    q: "¿Cuál es la inversión mínima?",
    a: "Cada proyecto es diferente. Tras la auditoría inicial gratuita, te presentamos un plan con presupuesto cerrado y ROI estimado.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Absolutamente. Trabajamos con infraestructuras encriptadas end-to-end y cumplimos con GDPR. Nunca accedemos a datos sensibles sin autorización explícita.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });

  return (
    <section
      className="py-24 md:py-36 px-6 relative"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-[720px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={inView ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.6 }}
          className="text-center tracking-[0.25em] text-[#0B0B0B]/30 mb-4"
          style={{ fontSize: "0.7rem", fontWeight: 500 }}
        >
          FAQ
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, filter: "blur(12px)", y: 12 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(12px)", y: 12 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center text-[#0B0B0B] mb-16 md:mb-20"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 600, lineHeight: 1.15 }}
        >
          Preguntas frecuentes
        </motion.h2>

        {/* Items */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, filter: "blur(10px)", y: 16 }}
                animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(10px)", y: 16 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + i * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="group"
              >
                <motion.div
                  animate={{
                    boxShadow: isOpen
                      ? "0 8px 40px rgba(11,11,11,0.06)"
                      : "0 2px 20px rgba(11,11,11,0.02)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/70 backdrop-blur-[20px] border border-[#EAEAEA]/70 rounded-2xl overflow-hidden hover:shadow-[0_6px_35px_rgba(11,11,11,0.05)] transition-all duration-400"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-6 md:p-7 cursor-pointer"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                  >
                    <span
                      className="text-left text-[#0B0B0B]"
                      style={{ fontSize: "1rem", fontWeight: 500 }}
                    >
                      {faq.q}
                    </span>
                    <motion.span
                      className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-[#0B0B0B]/[0.04] flex items-center justify-center"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {isOpen ? (
                        <Minus size={15} className="text-[#0B0B0B]/40" />
                      ) : (
                        <Plus size={15} className="text-[#0B0B0B]/40" />
                      )}
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        <motion.p
                          initial={{ filter: "blur(6px)" }}
                          animate={{ filter: "blur(0px)" }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="px-6 md:px-7 pb-6 md:pb-7 text-[#0B0B0B]/45"
                          style={{ fontSize: "0.88rem", fontWeight: 400, lineHeight: 1.75 }}
                        >
                          {faq.a}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}