/**
 * Google Ads conversion tracking.
 *
 * The base Google tag (gtag.js) lives in index.html — it loads gtag and runs
 * `gtag('config', 'AW-18196431700')`, which by itself only tracks page views and
 * remarketing. This module fires the individual *conversion actions* on top of it.
 */

// gtag.js attaches `gtag` / `dataLayer` to window at runtime. Declared here (next
// to its only use) so the type resolves even without a project-wide tsconfig.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * "Calculadora completada" conversion action.
 * Value is the Google Ads `send_to` target (account ID + conversion label) taken
 * from the event snippet in Google Ads → Conversions.
 */
const CALCULATOR_CONVERSION_SEND_TO = "AW-18196431700/10JBCIibzbUcENSG3uRD";

/**
 * Fires the "Calculadora completada" Google Ads conversion.
 *
 * Safe to call when gtag is unavailable (e.g. blocked by an ad-blocker or not yet
 * loaded): it no-ops instead of throwing. Call this exactly once, when the user
 * reaches the final "¡Listo!" screen — not on every render/page load.
 */
export function trackCalculatorConversion(): void {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", { send_to: CALCULATOR_CONVERSION_SEND_TO });
}
