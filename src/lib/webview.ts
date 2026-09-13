// In-app browser (webview) detection and escape.
//
// WHY THIS EXISTS. ~100% of the /ujrakezdes ad traffic arrives inside the
// Facebook/Instagram in-app browser on Android (verified from the leads'
// consents.userAgent records, 2026-09-13), and embedded Stripe Checkout inside
// that webview is a documented kill zone: it can refuse to load outright
// (Stripe UA detection), and even when it loads there is no Google Pay, no
// card autofill and third-party-cookie restrictions. Every checkout attempt of
// the first campaign flight (3/3) abandoned there.
//
// Two layers of defence, both fed by this module:
//  1. The reveal's CTAs break out of the webview into the system browser
//     BEFORE the register wizard starts (nothing to lose yet - the quiz
//     answers travel by the ?lt= token, not by localStorage).
//  2. The pay step falls back from embedded Checkout to Stripe's hosted page
//     via a full-page redirect when it finds itself still inside a webview.

/** Meta's in-app browsers (Facebook app, Messenger, Instagram). */
export function isMetaWebview(ua: string): boolean {
  return /FBAN|FBAV|FB_IAB|Instagram/i.test(ua);
}

const isAndroid = (ua: string): boolean => /Android/i.test(ua);

/**
 * An `intent://` URL that opens `path` (same-origin) in Chrome, escaping the
 * webview - or null when we are not in an Android Meta webview, in which case
 * the caller should just follow the normal link.
 *
 * `S.browser_fallback_url` keeps the navigation working on the rare Android
 * without Chrome: the webview then follows the plain https URL itself, which
 * is exactly the behaviour we had before this module existed. iOS has no
 * equivalent escape hatch; there the pay step's hosted-checkout fallback is
 * the mitigation.
 */
export function externalBrowserHref(path: string): string | null {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (!isMetaWebview(ua) || !isAndroid(ua)) return null;
  const abs = new URL(path, window.location.origin);
  if (abs.protocol !== "https:") return null; // intent:// carries scheme=https
  const rest = abs.href.slice("https://".length);
  return (
    `intent://${rest}#Intent;scheme=https;package=com.android.chrome;` +
    `S.browser_fallback_url=${encodeURIComponent(abs.href)};end`
  );
}

/** True when the current page runs inside any Meta in-app browser. */
export function inMetaWebview(): boolean {
  return typeof navigator !== "undefined" && isMetaWebview(navigator.userAgent);
}
