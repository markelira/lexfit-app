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

import { PRICES, type PriceRole } from "@/lib/pricing/config";
import { readClickIds } from "@/lib/attribution";

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
 *  `plan` is the chosen package, never a person. (Meta: InitiateCheckout)
 *
 *  Carries the price too: both TikTok and Meta flag a commerce event that
 *  arrives without a value, and value-based bidding cannot work without one.
 *  The number is resolved from PRICES rather than written here, so it can never
 *  drift from what we actually charge - the same rule that keeps every other
 *  price out of the codebase's body. */
export function trackCheckoutStart(plan?: string): void {
  const spec = plan && plan in PRICES ? PRICES[plan as PriceRole] : undefined;
  push("lx_checkout_start", {
    ...(plan ? { plan } : {}),
    ...(spec ? { value: spec.amountHuf, currency: "HUF" } : {}),
  });
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

/**
 * The email was submitted - the real lead. (Meta: Lead)
 *
 * `eventId` is NOT optional bookkeeping. This event is reported twice - by the
 * Pixel here and by the server's Conversions API call - and Meta only collapses
 * the pair when both carry the same id. The GTM tag MUST map `event_id` to the
 * Pixel's eventID field, or every lead counts twice.
 */
export function trackQuizLead(eventId: string, programCode?: string): void {
  push("lx_quiz_lead", { event_id: eventId, ...(programCode ? { program_code: programCode } : {}) });
}

/** A fresh id for one lead submission, shared by the Pixel and the server. */
export function newEventId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Older in-app browsers lack randomUUID; collisions here only cost dedup.
    return `q-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function trackQuizResultView(programCode?: string): void {
  push("lx_quiz_result_view", programCode ? { program_code: programCode } : undefined);
}

export function trackQuizCtaClick(programCode?: string): void {
  push("lx_quiz_cta_click", programCode ? { program_code: programCode } : undefined);
}

// ── Offer v3 surfaces (landing · /arak · pay step) ─────────────────────────
//
// Same rules as everything above: `lx_` prefixed and vendor-neutral (the GTM
// container maps them), no consent check of their own because nothing leaves
// the browser until GTM loads, and never any personal data. Note in particular
// that no ANSWER and no uid travels with these - only the surface and the plan.

/** The guarantee block came into view. Fires once per session per surface: it
 *  measures whether the objection was SEEN, and a scroll that re-crosses the
 *  section is not new information. */
export function trackGuaranciaView(surface: "landing" | "arak" | "pay"): void {
  const key = `lx_garancia_view_${surface}`;
  try {
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
  } catch {
    // Private mode / storage disabled: emit rather than stay silent. A
    // duplicate is a better failure than a missing view.
  }
  push("lx_garancia_view", { surface });
}

/** A plan card was chosen on a pricing surface. Carries the price for the same
 *  reason trackCheckoutStart does - value-based bidding cannot work without
 *  one - resolved from PRICES so it can never drift from what we charge. */
export function trackPricingPlanSelect(plan: string, surface: "landing" | "arak"): void {
  const spec = plan in PRICES ? PRICES[plan as PriceRole] : undefined;
  push("lx_pricing_plan_select", {
    plan,
    surface,
    ...(spec ? { value: spec.amountHuf, currency: "HUF" } : {}),
  });
}

/** /arak pageview. `ref` is the referrer HOST only, never a full URL - a query
 *  string can carry anything, including someone else's personal data. */
export function trackArakView(): void {
  let ref: string | undefined;
  try {
    if (document.referrer) ref = new URL(document.referrer).host;
  } catch {
    ref = undefined;
  }
  push("lx_arak_view", ref ? { ref } : undefined);
}

/** The forgiveness whisper after the `days` step was shown. */
export function trackOnbWhisperView(): void {
  push("lx_onb_whisper_view");
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
 *  - `ttp`/`ttclid` — the same idea on TikTok's side: `_ttp` is its first-party
 *    cookie and `ttclid` the click id it appends to an ad landing URL. Both
 *    only exist once the TikTok pixel has run, which needs consent too.
 */
export interface MarketingContext {
  consent: "granted" | "denied";
  fbp?: string;
  fbc?: string;
  ttp?: string;
  ttclid?: string;
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
  // The click ids fall back to the landing-URL snapshot. The cookies only exist
  // once the pixel has run, and the pixel only runs after consent - so someone
  // who accepts partway through the funnel has already lost the id from the
  // URL, which the first navigation rewrote. readClickIds() applies the same
  // consent check itself, so this cannot leak from a refusal.
  const snapshot = readClickIds();
  return {
    consent,
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
    ttp: readCookie("_ttp"),
    ttclid: readCookie("ttclid") ?? readCookie("_ttclid") ?? snapshot.ttclid,
  };
}
