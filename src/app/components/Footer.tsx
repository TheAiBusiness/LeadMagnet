import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import logoImg from "@/assets/dd0f90164673663df94faa349662ec5a4dc60874.png";

export function Footer() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-40px" });
  const navigate = useNavigate();

  return (
    <footer
      ref={ref}
      className="relative py-20 md:py-28 px-6 border-t border-[#EAEAEA]/40 overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* CTA block before footer */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(16px)", y: 30 }}
        animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(16px)", y: 30 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-[600px] mx-auto text-center mb-20"
      >
        <h3
          className="text-[#0B0B0B] mb-4"
          style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", fontWeight: 600, lineHeight: 1.2 }}
        >
          {t("footer.ctaTitle")}
        </h3>
        <p
          className="text-[#0B0B0B]/35 mb-8"
          style={{ fontSize: "0.9rem", lineHeight: 1.6 }}
        >
          {t("footer.ctaSub")}
        </p>
        <motion.button
          onClick={() => navigate("/calculadora")}
          whileHover={{ scale: 1.04, boxShadow: "0 10px 50px rgba(11,11,11,0.14)" }}
          whileTap={{ scale: 0.97 }}
          className="px-10 py-4 bg-[#0B0B0B] text-white rounded-full cursor-pointer shadow-[0_4px_24px_rgba(11,11,11,0.1)]"
          style={{ fontSize: "0.95rem", fontWeight: 500 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {t("footer.ctaBtn")}
        </motion.button>
      </motion.div>

      {/* Footer bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <span
          className="text-[#0B0B0B] tracking-tight"
          style={{ fontSize: "0.95rem", fontWeight: 600 }}
        >
          <img src={logoImg} alt={t("header.logoAlt")} className="h-10" />
        </span>
        <p
          className="text-[#0B0B0B]/25"
          style={{ fontSize: "0.78rem", fontWeight: 400 }}
        >
          {t("footer.copyright")}
        </p>
        <div className="flex gap-6">
          {([
            { label: t("footer.privacy"), href: "#privacidad" },
            { label: t("footer.terms"), href: "#términos" },
            { label: t("footer.contact"), href: "#contacto" },
          ]).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[#0B0B0B]/30 hover:text-[#0B0B0B] transition-colors duration-300"
              style={{ fontSize: "0.78rem", fontWeight: 400 }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </motion.div>
    </footer>
  );
}