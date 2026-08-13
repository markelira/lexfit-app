// Funnel events → GTM dataLayer.
//
// Deliberately VENDOR-NEUTRAL: the app emits its own domain events
// (`lx_*`), and the GTM container maps them to whatever each vendor calls
// them (Meta Pixel: Lead / CompleteRegistration / InitiateCheckout, GA4:
// its own names). Adding or renaming a vendor event is then a container
// change, not a deploy - which is the whole reason the Pixel lives in GTM.
//
// CONSENT: pushing to `window.dataLayer` is not tracking - the array is just
// an in-page queue. Nothing leaves the browser until GTM itself loads, and
// GTM only loads after the visitor accepts (src/components/Analytics.tsx).
// Because of that, these calls need no consent check of their own - but they
// must NEVER carry personal data (no e-mail, no name, no uid, no answers).

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function push(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}

/** The visitor left the welcome screen and answered the first question.
 *  Fires ONCE per funnel run - not on resume. (Meta: Lead) */
export function trackOnboardingStart(): void {
  push("lx_onboarding_start");
}

/** A new account was created (not a returning sign-in).
 *  (Meta: CompleteRegistration) */
export function trackRegistrationComplete(): void {
  push("lx_registration_complete");
}

/** The embedded Stripe Checkout step was reached.
 *  `plan` is the chosen package, never a person. (Meta: InitiateCheckout) */
export function trackCheckoutStart(plan?: string): void {
  push("lx_checkout_start", plan ? { plan } : undefined);
}
