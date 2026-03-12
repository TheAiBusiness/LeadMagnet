import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export function MobileBottomCTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-xl border-t border-[#EAEAEA]/60 p-4"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <button
        onClick={() => navigate("/calculadora")}
        className="w-full py-3.5 bg-[#0B0B0B] text-white rounded-2xl hover:bg-[#0B0B0B]/90 transition-all duration-300 cursor-pointer"
        style={{ fontSize: "0.9rem", fontWeight: 500 }}
      >
        {t("mobileCta.btn")}
      </button>
    </div>
  );
}
