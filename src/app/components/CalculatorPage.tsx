import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import logoImg from "@/assets/dd0f90164673663df94faa349662ec5a4dc60874.png";
import { Calculator } from "./Calculator";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function CalculatorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Minimal top bar */}
      <motion.div
        initial={{ opacity: 0, y: -10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-center justify-between px-6 lg:px-10 h-14 flex-shrink-0 border-b border-[#F0F0F0]"
      >
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ x: -3 }}
          className="flex items-center gap-2 text-[#0B0B0B]/40 hover:text-[#0B0B0B] transition-colors cursor-pointer"
          style={{ fontSize: "0.85rem" }}
        >
          <ArrowLeft size={16} />
          <span>{t("calculatorPage.back")}</span>
        </motion.button>
        <span
          className="tracking-tight text-[#0B0B0B]"
        >
          <img src={logoImg} alt={t("header.logoAlt")} className="h-8" />
        </span>
        <div className="w-16" />
      </motion.div>

      {/* Calculator fills remaining space */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(12px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="flex-1 min-h-0"
      >
        <Calculator id="calculadora" />
      </motion.div>
    </div>
  );
}