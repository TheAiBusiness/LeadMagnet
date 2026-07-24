import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Check, Calendar, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trackBookingConversion } from "../lib/tracking";
import { getStoredGclid } from "../lib/attribution";

/**
 * Landing page for confirmed Calendly bookings ("/gracias").
 *
 * Calendly redirects here with "Pass event details" enabled, so the booking
 * arrives as query parameters. Those parameters are what make the page safe to
 * use as a conversion trigger: a bare visit (someone typing the URL, a crawler,
 * a bookmarked reload) carries none of them and fires nothing.
 */

/** Calendly's redirect parameters. Names are fixed by Calendly, not by us. */
function readBooking(search: string) {
  const params = new URLSearchParams(search);
  const email = params.get("invitee_email");
  return {
    email,
    name: params.get("invitee_full_name") || params.get("invitee_first_name") || "",
    startTime: params.get("event_start_time") || "",
    /* An invitee email only exists on a real Calendly redirect — treat its
       presence as proof the booking happened. */
    isConfirmed: Boolean(email),
  };
}

/** Renders Calendly's ISO start time in the active locale, or "" if absent/invalid. */
function formatStart(startTime: string, locale: string): string {
  if (!startTime) return "";
  const date = new Date(startTime);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ThankYou() {
  const { t, i18n } = useTranslation();
  const booking = readBooking(window.location.search);
  const firedRef = useRef(false); // guard: one conversion per page load

  useEffect(() => {
    if (!booking.isConfirmed || firedRef.current) return;
    firedRef.current = true;
    trackBookingConversion(getStoredGclid());
  }, [booking.isConfirmed]);

  const when = formatStart(booking.startTime, i18n.language);
  const firstName = booking.name.split(" ")[0];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-white"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, filter: "blur(16px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-lg flex flex-col items-start"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-[#0B0B0B] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(11,11,11,0.15)]"
        >
          <Check size={28} className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, filter: "blur(12px)", y: 8 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-[#0B0B0B] mb-3"
          style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 600, lineHeight: 1.15 }}
        >
          {firstName
            ? t("thanks.titleNamed", { name: firstName })
            : t("thanks.title")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-[#0B0B0B]/40 mb-8"
          style={{ fontSize: "0.95rem", lineHeight: 1.6 }}
        >
          {t("thanks.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full flex flex-col gap-3 mb-10"
        >
          {when && (
            <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-[#F7F7F7]">
              <Calendar size={18} className="text-[#0B0B0B]/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-[#0B0B0B]/40" style={{ fontSize: "0.8rem" }}>
                  {t("thanks.whenLabel")}
                </p>
                <p className="text-[#0B0B0B]" style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                  {when}
                </p>
              </div>
            </div>
          )}
          {booking.email && (
            <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-[#F7F7F7]">
              <Mail size={18} className="text-[#0B0B0B]/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-[#0B0B0B]/40" style={{ fontSize: "0.8rem" }}>
                  {t("thanks.inviteLabel")}
                </p>
                <p className="text-[#0B0B0B]" style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                  {booking.email}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full"
        >
          <p className="text-[#0B0B0B]/40 mb-3" style={{ fontSize: "0.8rem" }}>
            {t("thanks.prepareTitle")}
          </p>
          <ul className="flex flex-col gap-2 mb-10">
            {[t("thanks.prepare1"), t("thanks.prepare2"), t("thanks.prepare3")].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[#0B0B0B]/60"
                style={{ fontSize: "0.9rem", lineHeight: 1.6 }}
              >
                <span className="w-1 h-1 rounded-full bg-[#0B0B0B]/25 mt-2.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            to="/"
            className="inline-block px-8 py-3.5 bg-[#0B0B0B] text-white rounded-full no-underline shadow-[0_4px_20px_rgba(11,11,11,0.08)] hover:opacity-90 transition-opacity"
            style={{ fontSize: "0.95rem", fontWeight: 500 }}
          >
            {t("thanks.backHome")}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
