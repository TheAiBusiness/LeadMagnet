import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "motion/react";
import { CONTACT_EMAIL } from "../lib/constants";

export function Legal() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 px-6 border-t border-[#EAEAEA]/50"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-[720px] mx-auto space-y-16">
        <motion.div
          id="privacidad"
          initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-[#0B0B0B] mb-4" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            {t("legal.privacyTitle")}
          </h2>
          <div className="text-[#0B0B0B]/60 space-y-3" style={{ fontSize: "0.9rem", lineHeight: 1.75 }}>
            <p>{t("legal.privacyP1")}</p>
            <p>{t("legal.privacyP2")}</p>
            <p>
              {t("legal.privacyP3Pre")}{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0B0B0B] underline hover:no-underline">
                {CONTACT_EMAIL}
              </a>
              {t("legal.privacyP3Post")}
            </p>
          </div>
        </motion.div>

        <motion.div
          id="terminos"
          initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-[#0B0B0B] mb-4" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            {t("legal.termsTitle")}
          </h2>
          <div className="text-[#0B0B0B]/60 space-y-3" style={{ fontSize: "0.9rem", lineHeight: 1.75 }}>
            <p>{t("legal.termsP1")}</p>
            <p>{t("legal.termsP2")}</p>
            <p>
              {t("legal.termsP3Pre")}{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0B0B0B] underline hover:no-underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
