import React from 'react'
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
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "es";
  const today = new Date().toLocaleDateString(lang === "en" ? "en-GB" : "es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* ── Urgency score from diagnosis answers (key-based) ── */
  const urgencyScore = useMemo(() => {
    let score = 0;
    const issueKeys: string[] = [];

    if (clients === "c1000") {
      score += 3;
      issueKeys.push("diagnostic.issueHighVolume");
    } else if (clients === "c201_1000") {
      score += 2;
      issueKeys.push("diagnostic.issueVolumeGrowth");
    } else if (clients === "c51_200") score += 1;

    if (upselling === "no") {
      score += 3;
      issueKeys.push("diagnostic.issueUpsellingLost");
    } else if (upselling === "little") {
      score += 2.5;
      issueKeys.push("diagnostic.issueUpsellingLow");
    } else if (upselling === "sometimes") score += 1;

    if (memoryDecisions === "tooMany") {
      score += 4;
      issueKeys.push("diagnostic.issueDecisionsNoData");
    } else if (memoryDecisions === "often") {
      score += 3;
      issueKeys.push("diagnostic.issueNoCentralizedInfo");
    } else if (memoryDecisions === "sometimes") score += 1.5;

    if (absence === "depends") {
      score += 4;
      issueKeys.push("diagnostic.issueDependencyCritical");
    } else if (absence === "slowdown") {
      score += 3;
      issueKeys.push("diagnostic.issueProcessesNotDoc");
    } else if (absence === "adjustments") score += 1.5;

    if (lostTime === "tooMuch") {
      score += 3;
      issueKeys.push("diagnostic.issueScatteredKnowledge");
    } else if (lostTime === "quite") {
      score += 2;
      issueKeys.push("diagnostic.issueInfoNotCentralized");
    } else if (lostTime === "sometimes") score += 1;

    if (manualWork === "tooMuch") {
      score += 3;
      issueKeys.push("diagnostic.issueManualTasksCost");
    } else if (manualWork === "quite") {
      score += 2;
      issueKeys.push("diagnostic.issueProcessesNotAuto");
    } else if (manualWork === "some") score += 1;

    if (profitVisibility === "dontKnow") {
      score += 4;
      issueKeys.push("diagnostic.issueNoProfitVisibility");
    } else if (profitVisibility === "intuition") {
      score += 3;
      issueKeys.push("diagnostic.issueLackDataProfit");
    } else if (profitVisibility === "moreOrLess") score += 1.5;

    if (opportunities === "late") {
      score += 3.5;
      issueKeys.push("diagnostic.issueSlowOpportunities");
    } else if (opportunities === "hard") {
      score += 2.5;
      issueKeys.push("diagnostic.issueLackAgility");
    } else if (opportunities === "sometimes") score += 1;

    if (doubleClients === "break") {
      score += 4;
      issueKeys.push("diagnostic.issueInfraNotReady");
    } else if (doubleClients === "complicated") {
      score += 3;
      issueKeys.push("diagnostic.issueProcessesNotScale");
    } else if (doubleClients === "adjustments") score += 1.5;

    if (mainDisorder === "scale") {
      score += 3.5;
      issueKeys.push("diagnostic.issueGrowthBlocked");
    } else if (mainDisorder === "opportunities") {
      score += 3;
      issueKeys.push("diagnostic.issueOpportunitiesLost");
    } else if (mainDisorder === "processes") {
      score += 2.5;
      issueKeys.push("diagnostic.issueOperationalChaos");
    } else if (mainDisorder === "freeTeam") {
      score += 2;
      issueKeys.push("diagnostic.issueTeamTrapped");
    } else if (mainDisorder === "control") score += 1.5;

    const maxScore = 37;
    const normalizedScore = Math.min(Math.round((score / maxScore) * 100), 100);

    let levelKey: string;
    let color: string;

    if (normalizedScore >= 65) {
      levelKey = "VeryCritical";
      color = "#DC2626";
    } else if (normalizedScore >= 45) {
      levelKey = "Urgent";
      color = "#EA580C";
    } else if (normalizedScore >= 25) {
      levelKey = "Attention";
      color = "#F59E0B";
    } else {
      levelKey = "WellPositioned";
      color = "#10B981";
    }

    return {
      value: normalizedScore,
      levelKey,
      color,
      insightKey: `diagnostic.insight${levelKey}` as const,
      actionKey: `diagnostic.action${levelKey}` as const,
      levelLabelKey: `diagnostic.level${levelKey}` as const,
      issues: issueKeys.slice(0, 3),
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
              <span className="text-[#0B0B0B]/25">{t("diagnostic.to")}</span> {email}
            </p>
            <p className="text-[#0B0B0B]/40" style={{ fontSize: "0.62rem" }}>
              <span className="text-[#0B0B0B]/25">{t("diagnostic.from")}</span> info@theaibusiness.com
            </p>
            <p className="text-[#0B0B0B]/40" style={{ fontSize: "0.62rem" }}>
              <span className="text-[#0B0B0B]/25">{t("diagnostic.subject")}</span>{" "}
              <span className="text-[#0B0B0B]/60" style={{ fontWeight: 500 }}>
                {t("diagnostic.subjectReady", { name: name || t("diagnostic.yourBusiness") })}
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

          {/* ═══ URGENCY LEVEL ═══ */}
          <div>
            <SectionHeader label={t("diagnostic.urgencyLevel")} delay={0.6} />
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
                      {t(urgencyScore.levelLabelKey)}
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
                    {t("diagnostic.of100")}
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
                    {t("diagnostic.diagnosis")}
                  </p>
                  <p
                    className="text-[#0B0B0B]"
                    style={{
                      fontSize: "0.85rem",
                      lineHeight: 1.7,
                      fontWeight: 500,
                    }}
                  >
                    {t(urgencyScore.insightKey)}
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
                      {t("diagnostic.mainSignals")}
                    </p>
                    <div className="space-y-1.5">
                      {urgencyScore.issues.map((key, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: urgencyScore.color }}
                          />
                          <p
                            className="text-[#0B0B0B]/50"
                            style={{ fontSize: "0.7rem", lineHeight: 1.6 }}
                          >
                            {t(key)}
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
                    {t("diagnostic.whatToDoNow")}
                  </p>
                  <p
                    className="text-[#0B0B0B]"
                    style={{
                      fontSize: "0.78rem",
                      lineHeight: 1.65,
                      fontWeight: 500,
                    }}
                  >
                    {t(urgencyScore.actionKey)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Profile */}
          {(role || employees || clients || mainDisorder) && (
            <div>
              <SectionHeader label={t("diagnostic.profileSection")} delay={1.0} />
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
                        {t("diagnostic.role")}
                      </p>
                      <p
                        className="text-[#0B0B0B]"
                        style={{ fontSize: "0.78rem", fontWeight: 500 }}
                      >
                        {t(`calculator.step1.${role}`)}
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
                        {t("diagnostic.employees")}
                      </p>
                      <p
                        className="text-[#0B0B0B]"
                        style={{ fontSize: "0.78rem", fontWeight: 500 }}
                      >
                        {t(`calculator.step2.${employees}`)}
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
                        {t("diagnostic.activeClients")}
                      </p>
                      <p
                        className="text-[#0B0B0B]"
                        style={{ fontSize: "0.78rem", fontWeight: 500 }}
                      >
                        {t(`calculator.step3.${clients}`)}
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
                        {t("diagnostic.mainPriority")}
                      </p>
                      <p
                        className="text-[#0B0B0B]"
                        style={{ fontSize: "0.78rem", fontWeight: 500 }}
                      >
                        {t(`calculator.step12.${mainDisorder}`)}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Key insights */}
          <div>
            <SectionHeader label={t("diagnostic.insightsSection")} delay={1.3} />
            <div className="space-y-3">
              {doubleClients && (
                <InsightCard
                  icon={TrendingUp}
                  title={t("diagnostic.insightScaleCapacity")}
                  value={t(`calculator.step11.${doubleClients}`)}
                  insight={t(`diagnostic.insightScale${doubleClients.charAt(0).toUpperCase() + doubleClients.slice(1)}` as "diagnostic.insightScaleBreak")}
                  delay={1.4}
                />
              )}
              {profitVisibility && (
                <InsightCard
                  icon={BarChart3}
                  title={t("diagnostic.insightDataVisibility")}
                  value={t(`calculator.step9.${profitVisibility}`)}
                  insight={t(`diagnostic.insightData${profitVisibility === "dontKnow" ? "DontKnow" : profitVisibility === "intuition" ? "Intuition" : profitVisibility === "moreOrLess" ? "MoreOrLess" : "YesClear"}` as "diagnostic.insightDataYesClear")}
                  delay={1.5}
                />
              )}
              {opportunities && (
                <InsightCard
                  icon={Zap}
                  title={t("diagnostic.insightAgility")}
                  value={t(`calculator.step10.${opportunities}`)}
                  insight={t(`diagnostic.insightAgility${opportunities === "late" ? "Late" : opportunities === "hard" ? "Hard" : opportunities === "sometimes" ? "Sometimes" : "Fast"}` as "diagnostic.insightAgilityFast")}
                  delay={1.6}
                />
              )}
              {absence && (
                <InsightCard
                  icon={Users}
                  title={t("diagnostic.insightAutonomy")}
                  value={t(`calculator.step6.${absence}`)}
                  insight={t(`diagnostic.insightAutonomy${absence === "depends" ? "Depends" : absence === "slowdown" ? "Slowdown" : absence === "adjustments" ? "Adjustments" : "Same"}` as "diagnostic.insightAutonomySame")}
                  delay={1.7}
                />
              )}
            </div>
          </div>

          {/* CTA */}
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
              {t("diagnostic.ctaBookSession")}
              <ArrowUpRight size={15} className="text-white/60" />
            </div>
            <p
              className="text-[#0B0B0B]/25 mt-4"
              style={{ fontSize: "0.62rem", lineHeight: 1.6 }}
            >
              {t("diagnostic.ctaSub")}
            </p>
            <p
              className="text-[#0B0B0B]/40 mt-3 max-w-[480px] mx-auto"
              style={{ fontSize: "0.7rem", lineHeight: 1.65 }}
            >
              {t("diagnostic.ctaBasedOn", {
                level: t(urgencyScore.levelLabelKey),
              })}
            </p>
          </motion.div>

          {/* Footer */}
          <div className="pt-6 border-t border-[#F0F0F0] text-center">
            <p
              className="text-[#0B0B0B]/15"
              style={{ fontSize: "0.55rem", lineHeight: 1.6 }}
            >
              {t("diagnostic.footer")}
              <br />
              {t("diagnostic.footerDisclaimer")}
              <br />
              {t("diagnostic.footerDisclaimer2")}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
