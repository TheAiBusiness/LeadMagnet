import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

interface HeroProps {
  onProcessClick: () => void;
}

/* Split text into words — each word scales down from large + blur */
function BlurWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.28em] origin-center"
          initial={{ opacity: 0, filter: "blur(18px)", scale: 1.35, y: 18 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
          transition={{
            duration: 0.85,
            delay: delay + i * 0.065,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

/* Animated CTA button with blur/shadow on click */
function HeroCTA({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <motion.button
      onClick={() => {
        setPressed(true);
        setTimeout(() => {
          setPressed(false);
          onClick();
        }, 400);
      }}
      animate={
        pressed
          ? {
              scale: 0.93,
              filter: "blur(2px)",
              boxShadow: primary
                ? "0 20px 60px rgba(11,11,11,0.25)"
                : "0 12px 40px rgba(11,11,11,0.08)",
            }
          : {
              scale: 1,
              filter: "blur(0px)",
              boxShadow: primary
                ? "0 4px 24px rgba(11,11,11,0.10)"
                : "0 0px 0px rgba(11,11,11,0)",
            }
      }
      whileHover={{
        scale: 1.05,
        boxShadow: primary
          ? "0 12px 50px rgba(11,11,11,0.18)"
          : "0 6px 28px rgba(11,11,11,0.06)",
      }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className={`cursor-pointer rounded-full ${
        primary
          ? "px-10 py-4.5 bg-[#0B0B0B] text-white"
          : "px-8 py-4.5 text-[#0B0B0B]/40 hover:text-[#0B0B0B]"
      }`}
      style={{ fontSize: "1rem", fontWeight: primary ? 500 : 400 }}
    >
      {children}
    </motion.button>
  );
}

export function Hero({ onProcessClick }: HeroProps) {
  const navigate = useNavigate();

  return (
    <section
      className="relative pt-36 pb-24 md:pt-52 md:pb-36 px-6 overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Ambient gradient orbs */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#0B0B0B]/[0.02] to-transparent pointer-events-none"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#0B0B0B]/[0.03] to-transparent pointer-events-none"
        animate={{ x: [0, -25, 0], y: [0, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-[900px] mx-auto text-center relative z-10">
        {/* Badge — scale down from big */}
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(10px)", scale: 1.2 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B0B0B]/[0.04] border border-[#0B0B0B]/[0.06] mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#0B0B0B]/30" />
          <span
            className="text-[#0B0B0B]/40"
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
            }}
          >
            Inteligencia artificial aplicada a negocio
          </span>
        </motion.div>

        {/* Headline — words come from large scale + blur */}
        <h1
          className="text-[#0B0B0B] mb-2"
          style={{
            fontSize: "clamp(2rem, 5.5vw, 3.6rem)",
            fontWeight: 600,
            lineHeight: 0.86,
            letterSpacing: "-0.06em",
          }}
        >
          <BlurWords text="¿Cuánto dinero estás" delay={0.15} />
          <br />
          <BlurWords text="perdiendo por" delay={0.5} />
          {" "}
          <motion.span
            className="inline-block font-semibold origin-center"
            style={{ textShadow: "0 4px 24px rgba(11,11,11,0.25)" }}
            initial={{
              opacity: 0,
              filter: "blur(20px)",
              scale: 1.6,
            }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
            }}
            transition={{
              duration: 0.9,
              delay: 0.72,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            NO
          </motion.span>{" "}
          <BlurWords text="aplicar" delay={0.82} />
          <br className="hidden sm:inline" />
          <span className="sm:hidden"> </span>
          <BlurWords text="tecnología" delay={0.95} />
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
          <BlurWords text="en tu negocio?" delay={1.05} />
        </h1>

        {/* Subline — also scale from big */}
        <motion.p
          initial={{ opacity: 0, filter: "blur(12px)", y: 14, scale: 1.15 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 1.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 text-[#0B0B0B]/40 max-w-[460px] mx-auto"
          style={{ fontSize: "1.15rem", fontWeight: 400, lineHeight: 1.6 }}
        >
          Descúbrelo en 60 segundos. Sin compromiso.
        </motion.p>

        {/* CTAs — scale from big + blur */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(10px)", scale: 1.12 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 0.85, delay: 1.75, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <HeroCTA primary onClick={() => navigate("/calculadora")}>
            Calcular mi potencial
          </HeroCTA>
          <HeroCTA onClick={onProcessClick}>
            Ver cómo trabajamos →
          </HeroCTA>
        </motion.div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex items-center justify-center gap-6"
        >
          {["50+ empresas", "€2M+ ahorrados", "+€1.3M generados", "< 6 sem. setup"].map(
            (stat, i) => (
              <motion.span
                key={stat}
                initial={{ opacity: 0, filter: "blur(8px)", scale: 1.2 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 2.3 + i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-[#0B0B0B]/20"
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                }}
              >
                {stat}
              </motion.span>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}