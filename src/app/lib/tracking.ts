/**
 * Ad-platform conversion tracking for the calculator.
 *
 * The base tags live in index.html and only track page views / remarketing on
 * their own:
 *   • Google Ads — gtag.js, `gtag('config', 'AW-18196431700')`.
 *   • LinkedIn   — Insight Tag, partner id 9227658.
 * This module fires the individual *conversion actions* on top of those bases.
 */

// gtag.js / LinkedIn Insight Tag attach these to window at runtime. Declared here
// (next to their only use) so the types resolve even without a project-wide tsconfig.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    lintrk?: (action: string, data?: Record<string, unknown>) => void;
  }
}

/**
 * "Calculadora completada" Google Ads conversion action.
 * Value is the `send_to` target (account ID + conversion label) from the event
 * snippet in Google Ads → Conversions.
 */
const GOOGLE_ADS_CONVERSION_SEND_TO = "AW-18196431700/10JBCIibzbUcENSG3uRD";

/** "Calculadora completada" LinkedIn conversion id (Campaign Manager). */
const LINKEDIN_CONVERSION_ID = 26852660;

/**
 * Fires the "Calculadora completada" conversion on every connected ad platform
 * (Google Ads + LinkedIn).
 *
 * Each platform is guarded independently, so if one tag is blocked or not yet
 * loaded the others still fire (and it never throws). Call this exactly once, when
 * the user reaches the final "¡Listo!" screen — not on every render/page load.
 */
export function trackCalculatorConversion(): void {
  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", { send_to: GOOGLE_ADS_CONVERSION_SEND_TO });
  }
  if (typeof window.lintrk === "function") {
    window.lintrk("track", { conversion_id: LINKEDIN_CONVERSION_ID });
  }
}

/**
 * "Reserva llamada" conversion, fired on /gracias after Calendly redirects a
 * confirmed booking back to us.
 *
 * Deliberately a *separate* conversion action from the calculator one: a booked
 * call is worth far more than a finished quiz, and reusing the same action would
 * double-count the same user and skew the campaign's cost per conversion.
 *
 * The Google Ads target defaults to the "Reserva de llamada agendada" action
 * (Google Ads → Conversiones); the env vars allow overriding without a deploy.
 */
const BOOKING_SEND_TO =
  import.meta.env.VITE_ADS_BOOKING_SEND_TO || "AW-18196431700/Qt-WCNmJ89QcENSG3uRD";
const BOOKING_LINKEDIN_ID = Number(import.meta.env.VITE_LINKEDIN_BOOKING_ID) || 0;

/** Fires the booking conversion. Call once, only for a verified booking. */
export function trackBookingConversion(gclid?: string | null): void {
  if (BOOKING_SEND_TO && typeof window.gtag === "function") {
    /* gclid is passed back explicitly because the redirect from Calendly drops
       it from the URL, leaving gtag no click id to attribute this hit to. */
    window.gtag("event", "conversion", {
      send_to: BOOKING_SEND_TO,
      ...(gclid ? { gclid } : {}),
    });
  }
  if (BOOKING_LINKEDIN_ID && typeof window.lintrk === "function") {
    window.lintrk("track", { conversion_id: BOOKING_LINKEDIN_ID });
  }
}
