import { motion } from "motion/react";
import {
  BarChart3,
  Building2,
  Users,
  Target,
  Zap,
  ArrowUpRight,
  Mail,
  Calendar,
  Timer,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import { useMemo } from "react";

/* ─── Helper Components ─── */
function SectionHeader({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-2 mb-4"
    >
      <div className="h-px flex-1 bg-[#EBEBEB]" />
      <span
        className="text-[#0B0B0B]/25 tracking-[0.18em] flex-shrink-0"
        style={{ fontSize: "0.55rem", fontWeight: 600 }}
      >
        {label}
      </span>
      <div className="h-px flex-1 bg-[#EBEBEB]" />
    </motion.div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  value,
  insight,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  insight: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl border border-[#F0F0F0] p-4 bg-white"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
          <Icon size={12} className="text-[#0B0B0B]/40" />
        </div>
        <span
          className="text-[#0B0B0B]/35"
          style={{ fontSize: "0.65rem", fontWeight: 500 }}
        >
          {title}
        </span>
      </div>
      <p
        className="text-[#0B0B0B] mb-1.5"
        style={{ fontSize: "1.05rem", fontWeight: 600 }}
      >
        {value}
      </p>
      <p
        className="text-[#0B0B0B]/35"
        style={{ fontSize: "0.72rem", lineHeight: 1.55 }}
      >
        {insight}
      </p>
    </motion.div>
  );
}

/* ─── Main Report Component ─── */
interface EmailReportProps {
  name: string;
  email: string;
  role?: string;
  employees?: string;
  clients?: string;
  upselling?: string;
  memoryDecisions?: string;
  absence?: string;
  lostTime?: string;
  manualWork?: string;
  profitVisibility?: string;
  opportunities?: string;
  doubleClients?: string;
  mainDisorder?: string;
}

export function EmailReport({
  name,
  email,
  role,
  employees,
  clients,
  upselling,
  memoryDecisions,
  absence,
  lostTime,
  manualWork,
  profitVisibility,
  opportunities,
  doubleClients,
  mainDisorder,
}: EmailReportProps) {
  const today = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* ── Termómetro de urgencia basado en las respuestas del diagnóstico ── */
  const urgencyScore = useMemo(() => {
    let score = 0;
    const issues: string[] = [];

    // Pregunta 3: Clientes activos
    if (clients === "+1000") {
      score += 3;
      issues.push("Alto volumen de clientes requiere sistemas escalables");
    } else if (clients === "201–1000") {
      score += 2;
      issues.push("Volumen de clientes en crecimiento");
    } else if (clients === "51–200") {
      score += 1;
    }

    // Pregunta 4: Upselling
    if (upselling === "No realmente") {
      score += 3;
      issues.push("Oportunidades de upselling sin aprovechar");
    } else if (upselling === "Muy poco") {
      score += 2.5;
      issues.push("Potencial de upselling desaprovechado");
    } else if (upselling === "Algunas veces") {
      score += 1;
    }

    // Pregunta 5: Decisiones por memoria
    if (memoryDecisions === "Demasiadas veces") {
      score += 4;
      issues.push("Decisiones sin datos: riesgo operativo crítico");
    } else if (memoryDecisions === "Bastante a menudo") {
      score += 3;
      issues.push("Falta de información centralizada para decidir");
    } else if (memoryDecisions === "A veces") {
      score += 1.5;
    }

    // Pregunta 6: Ausencia
    if (absence === "Depende de mí") {
      score += 4;
      issues.push("Dependencia crítica: el negocio no funciona sin ti");
    } else if (absence === "Se ralentizaría") {
      score += 3;
      issues.push("Procesos no documentados ni sistematizados");
    } else if (absence === "Habría ajustes") {
      score += 1.5;
    }

    // Pregunta 7: Tiempo perdido
    if (lostTime === "Demasiado") {
      score += 3;
      issues.push("Conocimiento disperso frena la operativa");
    } else if (lostTime === "Bastante") {
      score += 2;
      issues.push("Información no centralizada");
    } else if (lostTime === "A veces") {
      score += 1;
    }

    // Pregunta 8: Trabajo manual
    if (manualWork === "Demasiado") {
      score += 3;
      issues.push("Tareas manuales consumen recursos valiosos");
    } else if (manualWork === "Bastante") {
      score += 2;
      issues.push("Procesos sin automatizar");
    } else if (manualWork === "Algo") {
      score += 1;
    }

    // Pregunta 9: Visibilidad de rentabilidad
    if (profitVisibility === "No lo sabemos") {
      score += 4;
      issues.push("Sin visibilidad de rentabilidad: decisiones a ciegas");
    } else if (profitVisibility === "Lo intuimos") {
      score += 3;
      issues.push("Falta de datos para optimizar rentabilidad");
    } else if (profitVisibility === "Más o menos") {
      score += 1.5;
    }

    // Pregunta 10: Oportunidades
    if (opportunities === "Solemos llegar tarde") {
      score += 3.5;
      issues.push("Lentitud en ejecutar oportunidades comerciales");
    } else if (opportunities === "Nos cuesta reaccionar") {
      score += 2.5;
      issues.push("Falta de agilidad comercial");
    } else if (opportunities === "A veces llegamos") {
      score += 1;
    }

    // Pregunta 11: Duplicar clientes
    if (doubleClients === "Se rompería") {
      score += 4;
      issues.push("Infraestructura no preparada para escalar");
    } else if (doubleClients === "Se complicaría") {
      score += 3;
      issues.push("Procesos no diseñados para crecer");
    } else if (doubleClients === "Con algunos ajustes") {
      score += 1.5;
    }

    // Pregunta 12: Desorden principal
    if (mainDisorder === "Escalar sin romper") {
      score += 3.5;
      issues.push("Crecimiento frenado por falta de sistemas");
    } else if (mainDisorder === "No perder oportunidades") {
      score += 3;
      issues.push("Oportunidades comerciales que se escapan");
    } else if (mainDisorder === "Ordenar procesos") {
      score += 2.5;
      issues.push("Caos operativo afecta rendimiento");
    } else if (mainDisorder === "Liberar al equipo") {
      score += 2;
      issues.push("Equipo atrapado en tareas de bajo valor");
    } else if (mainDisorder === "Tener más control") {
      score += 1.5;
    }

    // Normalizar a escala 0-100
    const maxScore = 37;
    const normalizedScore = Math.min(Math.round((score / maxScore) * 100), 100);

    // Lógica con 4 niveles (Verde/Amarillo/Naranja/Rojo)
    let level: string;
    let color: string;
    let insight: string;
    let action: string;

    if (normalizedScore >= 65) {
      level = "MUY GRAVE";
      color = "#DC2626"; // Rojo
      insight = "Tu empresa tiene problemas estructurales críticos que están frenando su crecimiento y poniendo en riesgo su operativa diaria.";
      action = "Necesitas actuar inmediatamente. Los problemas identificados están costando dinero y oportunidades cada día que pasa.";
    } else if (normalizedScore >= 45) {
      level = "URGENTE";
      color = "#EA580C"; // Naranja
      insight = "Hay señales claras de desorden operativo que están limitando tu capacidad de crecer y aprovechar oportunidades.";
      action = "Es momento de sistematizar. Estos problemas no se resolverán solos, necesitan intervención estructurada.";
    } else if (normalizedScore >= 25) {
      level = "ATENCIÓN NECESARIA";
      color = "#F59E0B"; // Amarillo
      insight = "Tu empresa funciona, pero hay áreas de mejora importantes que podrían multiplicar tu eficiencia.";
      action = "Tienes oportunidad de optimizar antes de que los pequeños problemas se conviertan en grandes. Es el momento ideal.";
    } else {
      level = "BIEN POSICIONADO";
      color = "#10B981"; // Verde
      insight = "Tu empresa tiene bases sólidas. Los sistemas que implementes ahora te darán ventaja competitiva sostenible.";
      action = "Aprovecha tu posición fuerte para automatizar e innovar desde una base estable.";
    }

    return {
      value: normalizedScore,
      level,
      color,
      insight,
      action,
      issues: issues.slice(0, 3),
    };
  }, [
    clients,
    upselling,
    memoryDecisions,
    absence,
    lostTime,
    manualWork,
    profitVisibility,
    opportunities,
    doubleClients,
    mainDisorder,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(16px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-[640px] mx-auto"
    >
      <div
        className="rounded-2xl border border-[#E8E8E8] bg-white overflow-hidden"
        style={{
          boxShadow:
            "0 12px 60px rgba(11,11,11,0.08), 0 2px 8px rgba(11,11,11,0.04)",
        }}
      >
        {/* Email header */}
        <div className="px-6 py-4 border-b border-[#F0F0F0] bg-[#FAFAFA]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-[#0B0B0B]/25" />
              <span
                className="text-[#0B0B0B]/30"
                style={{ fontSize: "0.65rem" }}
              >
                Vista previa del email
              </span>
            </div>
            <span className="text-[#0B0B0B]/20" style={{ fontSize: "0.6rem" }}>
              {today}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[#0B0B0B]/40" style={{ fontSize: "0.62rem" }}>
              <span className="text-[#0B0B0B]/25">Para:</span> {email}
            </p>
            <p className="text-[#0B0B0B]/40" style={{ fontSize: "0.62rem" }}>
              <span className="text-[#0B0B0B]/25">De:</span> hola@theaibusiness.io
            </p>
            <p className="text-[#0B0B0B]/40" style={{ fontSize: "0.62rem" }}>
              <span className="text-[#0B0B0B]/25">Asunto:</span>{" "}
              <span className="text-[#0B0B0B]/60" style={{ fontWeight: 500 }}>
                {name}, tu diagnóstico empresarial está listo
              </span>
            </p>
          </div>
        </div>

        <div className="px-6 py-8 space-y-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <p
              className="text-[#0B0B0B]/20 tracking-[0.2em] mb-3"
              style={{ fontSize: "0.55rem", fontWeight: 600 }}
            >
              THE AI BUSINESS
            </p>
            <h2
              className="text-[#0B0B0B] mb-2"
              style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.2 }}
            >
              Diagnóstico Empresarial
            </h2>
            <p className="text-[#0B0B0B]/35" style={{ fontSize: "0.8rem" }}>
              Preparado para{" "}
              <span className="text-[#0B0B0B]" style={{ fontWeight: 500 }}>
                {name || "tu negocio"}
              </span>{" "}
              · {today}
            </p>
          </motion.div>

          {/* ═══ TERMÓMETRO DE URGENCIA (PRIORIDAD #1) ═══ */}
          <div>
            <SectionHeader label="NIVEL DE URGENCIA" delay={0.6} />
            <motion.div
              initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="p-6 rounded-xl border-2 bg-gradient-to-br from-white to-[#FAFAFA]"
              style={{ borderColor: urgencyScore.color }}
            >
              {/* Header con nivel y score */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${urgencyScore.color}15`,
                      boxShadow: `0 0 20px ${urgencyScore.color}30`,
                    }}
                  >
                    <Timer size={20} style={{ color: urgencyScore.color }} />
                  </div>
                  <div>
                    <p
                      className="text-[#0B0B0B]/40"
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: 500,
                        letterSpacing: "0.1em",
                      }}
                    >
                      NIVEL DETECTADO
                    </p>
                    <p
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        color: urgencyScore.color,
                      }}
                    >
                      {urgencyScore.level}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className="inline-block px-4 py-2 rounded-full"
                    style={{
                      backgroundColor: `${urgencyScore.color}20`,
                      color: urgencyScore.color,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      boxShadow: `0 4px 12px ${urgencyScore.color}20`,
                    }}
                  >
                    {urgencyScore.value}
                  </span>
                  <p
                    className="text-[#0B0B0B]/30 mt-1"
                    style={{ fontSize: "0.55rem" }}
                  >
                    de 100
                  </p>
                </div>
              </div>

              {/* Barra de urgencia animada */}
              <div className="relative h-4 bg-[#F0F0F0] rounded-full overflow-hidden mb-5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${urgencyScore.value}%` }}
                  transition={{
                    duration: 1.5,
                    delay: 0.8,
                    ease: [0.33, 0, 0.15, 1],
                  }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${urgencyScore.color}AA, ${urgencyScore.color})`,
                    boxShadow: `0 0 16px ${urgencyScore.color}50`,
                  }}
                />
              </div>

              {/* Diagnóstico */}
              <div className="space-y-3">
                <div>
                  <p
                    className="text-[#0B0B0B]/30 mb-1.5"
                    style={{
                      fontSize: "0.55rem",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                    }}
                  >
                    DIAGNÓSTICO
                  </p>
                  <p
                    className="text-[#0B0B0B]"
                    style={{
                      fontSize: "0.85rem",
                      lineHeight: 1.7,
                      fontWeight: 500,
                    }}
                  >
                    {urgencyScore.insight}
                  </p>
                </div>

                {urgencyScore.issues.length > 0 && (
                  <div>
                    <p
                      className="text-[#0B0B0B]/30 mb-2"
                      style={{
                        fontSize: "0.55rem",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                      }}
                    >
                      PRINCIPALES SEÑALES
                    </p>
                    <div className="space-y-1.5">
                      {urgencyScore.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: urgencyScore.color }}
                          />
                          <p
                            className="text-[#0B0B0B]/50"
                            style={{ fontSize: "0.7rem", lineHeight: 1.6 }}
                          >
                            {issue}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 mt-3 border-t border-[#E8E8E8]">
                  <p
                    className="text-[#0B0B0B]/30 mb-1.5"
                    style={{
                      fontSize: "0.55rem",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                    }}
                  >
                    QUÉ HACER AHORA
                  </p>
                  <p
                    className="text-[#0B0B0B]"
                    style={{
                      fontSize: "0.78rem",
                      lineHeight: 1.65,
                      fontWeight: 500,
                    }}
                  >
                    {urgencyScore.action}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Información básica del diagnóstico */}
          {(role || employees || clients || mainDisorder) && (
            <div>
              <SectionHeader label="TU PERFIL" delay={1.0} />
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.05 }}
                className="grid grid-cols-2 gap-3"
              >
                {role && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAFAFA]">
                    <UserCheck
                      size={13}
                      className="text-[#0B0B0B]/20 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p
                        className="text-[#0B0B0B]/25"
                        style={{ fontSize: "0.58rem", fontWeight: 500 }}
                      >
                        Rol
                      </p>
                      <p
                        className="text-[#0B0B0B]"
                        style={{ fontSize: "0.78rem", fontWeight: 500 }}
                      >
                        {role}
                      </p>
                    </div>
                  </div>
                )}
                {employees && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAFAFA]">
                    <Users
                      size={13}
                      className="text-[#0B0B0B]/20 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p
                        className="text-[#0B0B0B]/25"
                        style={{ fontSize: "0.58rem", fontWeight: 500 }}
                      >
                        Empleados
                      </p>
                      <p
                        className="text-[#0B0B0B]"
                        style={{ fontSize: "0.78rem", fontWeight: 500 }}
                      >
                        {employees}
                      </p>
                    </div>
                  </div>
                )}
                {clients && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAFAFA]">
                    <Building2
                      size={13}
                      className="text-[#0B0B0B]/20 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p
                        className="text-[#0B0B0B]/25"
                        style={{ fontSize: "0.58rem", fontWeight: 500 }}
                      >
                        Clientes activos
                      </p>
                      <p
                        className="text-[#0B0B0B]"
                        style={{ fontSize: "0.78rem", fontWeight: 500 }}
                      >
                        {clients}
                      </p>
                    </div>
                  </div>
                )}
                {mainDisorder && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAFAFA]">
                    <Target
                      size={13}
                      className="text-[#0B0B0B]/20 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p
                        className="text-[#0B0B0B]/25"
                        style={{ fontSize: "0.58rem", fontWeight: 500 }}
                      >
                        Prioridad principal
                      </p>
                      <p
                        className="text-[#0B0B0B]"
                        style={{ fontSize: "0.78rem", fontWeight: 500 }}
                      >
                        {mainDisorder}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Insights clave del diagnóstico */}
          <div>
            <SectionHeader label="INSIGHTS CLAVE" delay={1.3} />
            <div className="space-y-3">
              {/* Escalabilidad */}
              {doubleClients && (
                <InsightCard
                  icon={TrendingUp}
                  title="Capacidad de escalar"
                  value={doubleClients}
                  insight={
                    doubleClients === "Se rompería"
                      ? "Tu infraestructura actual no está preparada para duplicar el volumen. Necesitas sistematizar antes de crecer."
                      : doubleClients === "Se complicaría"
                        ? "Podrías crecer, pero sería caótico. Es el momento de construir sistemas escalables."
                        : doubleClients === "Con algunos ajustes"
                          ? "Tienes buena base, algunos ajustes te permitirán escalar sin problemas."
                          : "Tu empresa puede crecer de forma sostenible con tu estructura actual."
                  }
                  delay={1.4}
                />
              )}

              {/* Visibilidad */}
              {profitVisibility && (
                <InsightCard
                  icon={BarChart3}
                  title="Visibilidad de datos"
                  value={profitVisibility}
                  insight={
                    profitVisibility === "No lo sabemos"
                      ? "Estás tomando decisiones estratégicas sin datos. Esto es un riesgo crítico que debes resolver ya."
                      : profitVisibility === "Lo intuimos"
                        ? "La intuición es valiosa, pero los datos te darían certeza y te ayudarían a optimizar."
                        : profitVisibility === "Más o menos"
                          ? "Tienes visibilidad parcial. Completar el panorama te dará ventaja competitiva."
                          : "Excelente control de datos. Ahora es momento de automatizar la extracción de insights."
                  }
                  delay={1.5}
                />
              )}

              {/* Agilidad comercial */}
              {opportunities && (
                <InsightCard
                  icon={Zap}
                  title="Agilidad comercial"
                  value={opportunities}
                  insight={
                    opportunities === "Solemos llegar tarde"
                      ? "Estás perdiendo oportunidades por falta de sistemas. Cada oportunidad perdida es dinero que se va."
                      : opportunities === "Nos cuesta reaccionar"
                        ? "Tienes capacidad pero te falta velocidad. Sistematizar te dará la agilidad que necesitas."
                        : opportunities === "A veces llegamos"
                          ? "Tu tasa de aprovechamiento puede mejorar significativamente con mejor estructura."
                          : "Gran capacidad de ejecución. Mantén y mejora este nivel con automatización."
                  }
                  delay={1.6}
                />
              )}

              {/* Dependencia personal */}
              {absence && (
                <InsightCard
                  icon={Users}
                  title="Autonomía del negocio"
                  value={absence}
                  insight={
                    absence === "Depende de mí"
                      ? "Dependencia crítica: has construido un trabajo, no un negocio. Necesitas documentar y sistematizar urgentemente."
                      : absence === "Se ralentizaría"
                        ? "El conocimiento está en las personas, no en sistemas. Esto te impide escalar y te genera estrés."
                        : absence === "Habría ajustes"
                          ? "Vas por buen camino. Completa la sistematización para tener verdadera autonomía."
                          : "Excelente nivel de autonomía. Tu negocio funciona con o sin ti."
                  }
                  delay={1.7}
                />
              )}
            </div>
          </div>

          {/* CTA principal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.0 }}
            className="text-center pt-4"
          >
            <div
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#0B0B0B] text-white rounded-full cursor-pointer"
              style={{
                fontSize: "0.95rem",
                fontWeight: 500,
                boxShadow: "0 8px 32px rgba(11,11,11,0.15)",
              }}
            >
              <Calendar size={16} />
              Agenda tu sesión estratégica gratuita
              <ArrowUpRight size={15} className="text-white/60" />
            </div>
            <p
              className="text-[#0B0B0B]/25 mt-4"
              style={{ fontSize: "0.62rem", lineHeight: 1.6 }}
            >
              30 minutos para diseñar tu plan de acción · Sin compromiso ·
              Resultados en 48h
            </p>
            <p
              className="text-[#0B0B0B]/40 mt-3 max-w-[480px] mx-auto"
              style={{ fontSize: "0.7rem", lineHeight: 1.65 }}
            >
              Basándonos en tu diagnóstico (nivel{" "}
              <span style={{ color: urgencyScore.color, fontWeight: 600 }}>
                {urgencyScore.level}
              </span>
              ), te ayudaremos a priorizar las acciones que generarán más
              impacto en menos tiempo.
            </p>
          </motion.div>

          {/* Footer */}
          <div className="pt-6 border-t border-[#F0F0F0] text-center">
            <p
              className="text-[#0B0B0B]/15"
              style={{ fontSize: "0.55rem", lineHeight: 1.6 }}
            >
              The AI Business · hola@theaibusiness.io
              <br />* Este diagnóstico está basado en tus respuestas y
              benchmarks del sector.
              <br />
              Es una herramienta orientativa para ayudarte a identificar áreas
              de mejora.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
