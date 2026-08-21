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

// ── Lead magnet quiz (/terv) ────────────────────────────────────────────────
//
// The quiz submit is the campaign's optimisation signal, so it - not
// `lx_onboarding_start` - is what the GTM container should map to Meta's
// `Lead`. Retagging that is a container change, which is the whole reason this
// layer is vendor-neutral.
//
// HARD RULE, and it is stricter here than anywhere else in this file: a quiz
// ANSWER may never be a parameter. The answers include body metrics and a
// life-stage question, so shipping them to an ad platform would breach both
// the module rule above and Meta's own Business Tools terms. Only `step_id`
// travels - never what was chosen.

export function trackQuizStart(): void {
  push("lx_quiz_start");
}

/** `stepId` is the SCREEN, e.g. "goal" or "body" - never the answer. */
export function trackQuizStep(stepId: string): void {
  push("lx_quiz_step", { step_id: stepId });
}

export function trackQuizEmailView(): void {
  push("lx_quiz_email_view");
}

/** The email was submitted - the real lead. (Meta: Lead) */
export function trackQuizLead(programCode?: string): void {
  push("lx_quiz_lead", programCode ? { program_code: programCode } : undefined);
}

export function trackQuizResultView(programCode?: string): void {
  push("lx_quiz_result_view", programCode ? { program_code: programCode } : undefined);
}

export function trackQuizCtaClick(programCode?: string): void {
  push("lx_quiz_cta_click", programCode ? { program_code: programCode } : undefined);
}

/** What the SERVER needs to report a purchase to Meta's Conversions API.
 *
 *  Why it is collected here, in the browser, and carried through Stripe:
 *  the purchase is confirmed by a Stripe webhook, which runs server-side and
 *  can see neither the cookie-consent decision nor Meta's browser cookies. So
 *  the client hands both to checkout-session creation, Stripe stores them on
 *  the session metadata, and the webhook reads them back.
 *
 *  - `consent`  — the visitor's own cookie decision. Reporting a purchase to
 *    Meta is advertising measurement, NOT contract performance, so a visitor
 *    who declined must not be reported. The webhook honours this.
 *  - `fbp`/`fbc` — Meta's own first-party cookies, set by the Pixel. They are
 *    the strongest match signal available and only exist if the visitor
 *    accepted (no Pixel → no cookies), so they cannot leak from a refusal.
 */
export interface MarketingContext {
  consent: "granted" | "denied";
  fbp?: string;
  fbc?: string;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
}

export function marketingContext(): MarketingContext {
  let consent: "granted" | "denied" = "denied";
  try {
    if (localStorage.getItem("lx-consent") === "granted") consent = "granted";
  } catch {
    // Storage blocked (Safari private mode, some in-app browsers) → treat as
    // refusal. Failing closed is the only safe default for a consent check.
  }
  if (consent !== "granted") return { consent };
  return { consent, fbp: readCookie("_fbp"), fbc: readCookie("_fbc") };
}
