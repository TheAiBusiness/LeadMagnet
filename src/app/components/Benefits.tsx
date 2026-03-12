import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Database, TrendingUp, Clock, ShieldCheck } from "lucide-react";

export function Benefits() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });

  const benefits = [
    {
      icon: Database,
      title: t("benefits.b0Title"),
      desc: t("benefits.b0Desc"),
      stat: "100%",
      statLabel: t("benefits.b0StatLabel"),
    },
    {
      icon: TrendingUp,
      title: t("benefits.b1Title"),
      desc: t("benefits.b1Desc"),
      stat: "–40%",
      statLabel: t("benefits.b1StatLabel"),
    },
    {
      icon: Clock,
      title: t("benefits.b2Title"),
      desc: t("benefits.b2Desc"),
      stat: "85%",
      statLabel: t("benefits.b2StatLabel"),
    },
    {
      icon: ShieldCheck,
      title: t("benefits.b3Title"),
      desc: t("benefits.b3Desc"),
      stat: "3×",
      statLabel: t("benefits.b3StatLabel"),
    },
  ];

  return (
    <section
      id="servicios"
      className="py-24 md:py-36 px-6 relative overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Soft background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#0B0B0B]/[0.015] to-transparent rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10" ref={ref}>
        {/* Section header */}
        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={inView ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.6 }}
          className="text-center tracking-[0.25em] text-[#0B0B0B]/30 mb-4"
          style={{ fontSize: "0.7rem", fontWeight: 500 }}
        >
          {t("benefits.tag")}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, filter: "blur(12px)", y: 12 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(12px)", y: 12 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center text-[#0B0B0B] mb-16 md:mb-20"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 600, lineHeight: 1.15 }}
        >
          {t("benefits.title")}
        </motion.h2>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, filter: "blur(14px)", y: 30 }}
              animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(14px)", y: 30 }}
              transition={{
                duration: 0.7,
                delay: 0.2 + i * 0.12,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              whileHover={{
                y: -6,
                boxShadow: "0 12px 60px rgba(11,11,11,0.08)",
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className="group relative bg-white/70 backdrop-blur-[20px] border border-[#EAEAEA]/70 rounded-3xl p-8 shadow-[0_2px_30px_rgba(0,0,0,0.02)] cursor-default"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#0B0B0B]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                {/* Big stat */}
                <motion.span
                  className="block text-[#0B0B0B]/[0.06] mb-2"
                  style={{ fontSize: "2.8rem", fontWeight: 700, lineHeight: 1 }}
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={inView ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.12 }}
                >
                  {b.stat}
                </motion.span>

                <b.icon
                  size={22}
                  strokeWidth={1.5}
                  className="text-[#0B0B0B]/70 mb-4"
                />
                <h3
                  className="text-[#0B0B0B] mb-2"
                  style={{ fontSize: "1.1rem", fontWeight: 500 }}
                >
                  {b.title}
                </h3>
                <p
                  className="text-[#0B0B0B]/40 break-words"
                  style={{ fontSize: "0.85rem", fontWeight: 400, lineHeight: 1.65 }}
                >
                  {b.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}