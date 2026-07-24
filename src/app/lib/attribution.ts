/**
 * Ad-click attribution that survives the trip to Calendly and back.
 *
 * Calendly cannot forward dynamic parameters such as `{gclid}` in its redirect
 * URL, so the click id would be lost between the calculator and the "gracias"
 * page. Since both of those live on our own domain, we stash the id in
 * localStorage on the first landing and read it back after the redirect.
 */

const GCLID_KEY = "tab_gclid";
const GCLID_TS_KEY = "tab_gclid_ts";

/** Google Ads attributes a click for 90 days; anything older is noise. */
const GCLID_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Persists the `gclid` from the current URL, if present.
 *
 * Call once per app load, as early as possible. Later landings overwrite the
 * stored id so the most recent ad click always wins. Storage access is wrapped
 * because Safari private mode and cookie-blocking extensions make it throw.
 */
export function captureGclid(): void {
  try {
    const gclid = new URLSearchParams(window.location.search).get("gclid");
    if (!gclid) return;
    localStorage.setItem(GCLID_KEY, gclid);
    localStorage.setItem(GCLID_TS_KEY, String(Date.now()));
  } catch {
    /* storage unavailable — attribution degrades, the app keeps working */
  }
}

/** Returns the stored `gclid`, or null if absent, expired or unreadable. */
export function getStoredGclid(): string | null {
  try {
    const gclid = localStorage.getItem(GCLID_KEY);
    if (!gclid) return null;
    const ts = Number(localStorage.getItem(GCLID_TS_KEY));
    if (!ts || Date.now() - ts > GCLID_MAX_AGE_MS) return null;
    return gclid;
  } catch {
    return null;
  }
}
