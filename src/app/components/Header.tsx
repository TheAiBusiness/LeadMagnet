import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Menu, X } from "lucide-react";
import logoImg from "@/assets/dd0f90164673663df94faa349662ec5a4dc60874.png";

export function Header() {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isEn = i18n.language === "en";

  return (
    <motion.header
      initial={{ opacity: 0, y: -10, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-[#EAEAEA]/40"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <motion.span
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="tracking-tight text-[#0B0B0B] cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logoImg} alt={t("header.logoAlt")} className="h-10" />
        </motion.span>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {([
            { label: t("header.services"), href: "#servicios" },
            { label: t("header.cases"), href: "#casos" },
            { label: t("header.contact"), href: "/#contacto" },
          ]).map((item, i) => (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
              className="text-[#0B0B0B]/45 hover:text-[#0B0B0B] transition-colors duration-300"
              style={{ fontSize: "0.875rem", fontWeight: 400 }}
            >
              {item.label}
            </motion.a>
          ))}
          <span className="flex items-center gap-1 text-[#0B0B0B]/40" style={{ fontSize: "0.75rem" }}>
            <button
              type="button"
              onClick={() => i18n.changeLanguage("es")}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${!isEn ? "bg-[#0B0B0B] text-white" : "hover:bg-[#0B0B0B]/10"}`}
              aria-label="Español"
            >
              {t("header.langEs")}
            </button>
            <span className="opacity-50">|</span>
            <button
              type="button"
              onClick={() => i18n.changeLanguage("en")}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${isEn ? "bg-[#0B0B0B] text-white" : "hover:bg-[#0B0B0B]/10"}`}
              aria-label="English"
            >
              {t("header.langEn")}
            </button>
          </span>
          <motion.button
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, delay: 0.45 }}
            whileHover={{ scale: 1.05, backgroundColor: "#0B0B0B", color: "#fff" }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/calculadora")}
            className="px-5 py-2 rounded-full border border-[#0B0B0B]/12 text-[#0B0B0B] cursor-pointer"
            style={{ fontSize: "0.875rem", fontWeight: 500 }}
          >
            {t("header.calculate")}
          </motion.button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.nav
          aria-label="Menú principal"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-[#EAEAEA]/40 px-6 py-5 flex flex-col gap-4"
        >
          {([
            { label: t("header.services"), href: "#servicios" },
            { label: t("header.cases"), href: "#casos" },
            { label: t("header.contact"), href: "/#contacto" },
          ]).map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[#0B0B0B]/50 hover:text-[#0B0B0B] transition-colors"
              style={{ fontSize: "0.9rem" }}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => { setMobileOpen(false); navigate("/calculadora"); }}
            className="text-left text-[#0B0B0B] transition-colors"
            style={{ fontSize: "0.9rem", fontWeight: 500 }}
          >
            {t("header.calculateArrow")}
          </button>
        </motion.nav>
      )}
    </motion.header>
  );
}