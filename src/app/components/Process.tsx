import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { useTranslation } from "react-i18next";

interface ProcessProps {
  id?: string;
}

export function Process({ id }: ProcessProps) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });

  const steps = [
    {
      num: "01",
      title: t("process.s0Title"),
      desc: t("process.s0Desc"),
      detail: t("process.s0Detail"),
    },
    {
      num: "02",
      title: t("process.s1Title"),
      desc: t("process.s1Desc"),
      detail: t("process.s1Detail"),
    },
    {
      num: "03",
      title: t("process.s2Title"),
      desc: t("process.s2Desc"),
      detail: t("process.s2Detail"),
    },
  ];

  return (
    <section
      id={id}
      className="py-24 md:py-36 px-6 bg-[#FAFAFA] relative overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-[1100px] mx-auto" ref={ref}>
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={inView ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.6 }}
          className="text-center tracking-[0.25em] text-[#0B0B0B]/30 mb-4"
          style={{ fontSize: "0.7rem", fontWeight: 500 }}
        >
          {t("process.tag")}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, filter: "blur(12px)", y: 12 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(12px)", y: 12 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center text-[#0B0B0B] mb-20 md:mb-24"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 600, lineHeight: 1.15 }}
        >
          {t("process.title")}
        </motion.h2>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, filter: "blur(16px)", y: 30 }}
              animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(16px)", y: 30 }}
              transition={{
                duration: 0.8,
                delay: 0.25 + i * 0.18,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="relative text-center px-8 py-10 md:py-0"
            >

              {/* Number */}
              <motion.span
                className="block text-[#0B0B0B]/[0.05] mb-3 relative z-10"
                style={{ fontSize: "4.5rem", fontWeight: 700, lineHeight: 1 }}
                initial={{ opacity: 0, filter: "blur(10px)", scale: 0.8 }}
                animate={inView ? { opacity: 1, filter: "blur(0px)", scale: 1 } : { opacity: 0, filter: "blur(10px)", scale: 0.8 }}
                transition={{ duration: 0.7, delay: 0.35 + i * 0.18 }}
              >
                {s.num}
              </motion.span>

              <h3
                className="text-[#0B0B0B] mb-3"
                style={{ fontSize: "1.2rem", fontWeight: 500 }}
              >
                {s.title}
              </h3>
              <p
                className="text-[#0B0B0B]/40 max-w-[320px] mx-auto mb-3"
                style={{ fontSize: "0.85rem", fontWeight: 400, lineHeight: 1.7 }}
              >
                {s.desc}
              </p>
              <motion.span
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.18 }}
                className="inline-block px-3 py-1 rounded-full bg-[#0B0B0B]/[0.03] text-[#0B0B0B]/25"
                style={{ fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.06em" }}
              >
                {s.detail}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}