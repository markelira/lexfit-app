// LEXFIT pricing — THE single source of truth for every price, window, and
// threshold in the "Kiérdemelt Ár" system (F0.5).
//
// HARD RULE: no pricing-numeric value (amount, window length, count) may be
// hardcoded anywhere outside this file. Every knob is env-overridable so the
// A/B framework (F6) flips thresholds and windows without a code deploy.
//
// Pure and dependency-free (re-exports the Budapest helpers from ./keys) so the
// Stripe seed script and the client can both import it safely.

import { budapestDay, budapestHour, BUSINESS_TZ } from "./keys";
export { budapestDay, budapestHour, BUSINESS_TZ };

function envInt(name: string, fallback: number): number {
  // Guard `process` so this module is safe to import in the client bundle
  // (overrides are server-authoritative; the client renders the defaults).
  const raw = typeof process !== "undefined" ? process.env?.[name] : undefined;
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

// ── Currency / tax ─────────────────────────────────────────────────────────
export const CURRENCY = "huf";
/** HU ÁFA. Every amount below is GROSS (VAT already included) — see J5. */
export const VAT_RATE = 0.27;

/**
 * Stripe wants amounts in the currency's smallest unit. HUF is NOT a
 * zero-decimal currency in Stripe: multiply forints by 100, and the result
 * must be a whole multiple of 100 (no fractional forint). 490 Ft → 49000.
 * Centralised here so no route ever gets the ×100 wrong.
 */
export function stripeMinorAmount(huf: number): number {
  return huf * 100;
}

export const DAY_MS = 86_400_000;

// ── Price catalog (1.4) ────────────────────────────────────────────────────
// `lookupKey` is the stable id used everywhere in code and by the seed script.
// M2 is a coupon/credit, not a price, so it is intentionally absent here.
export type PriceRole =
  | "week_intro"
  | "week_std"
  | "week_oneoff"
  | "month_std"
  | "month_oneoff"
  | "annual_std"
  | "annual_earned"
  | "month_founder"
  | "annual_renew"
  | "biennial_renew"
  | "annual_winback";

export interface PriceSpec {
  role: PriceRole;
  /** Stripe price lookup_key — idempotency key for the seed script. */
  lookupKey: string;
  /** Gross HUF (VAT included). */
  amountHuf: number;
  type: "recurring" | "one_time";
  interval: "week" | "month" | "year" | null;
  intervalCount: number;
  /** Human-readable Stripe price nickname. */
  nickname: string;
}

export const PRICES: Record<PriceRole, PriceSpec> = {
  week_intro: {
    role: "week_intro",
    lookupKey: "price_week_intro_490",
    amountHuf: envInt("PRICE_WEEK_INTRO", 490),
    type: "recurring",
    interval: "week",
    intervalCount: 1,
    nickname: "Heti — intro (első 7 nap)",
  },
  week_std: {
    role: "week_std",
    lookupKey: "price_week_std_1990",
    amountHuf: envInt("PRICE_WEEK_STD", 1990),
    type: "recurring",
    interval: "week",
    intervalCount: 1,
    nickname: "Heti — folyamatos",
  },
  week_oneoff: {
    role: "week_oneoff",
    lookupKey: "price_week_oneoff_2990",
    amountHuf: envInt("PRICE_WEEK_ONEOFF", 2990),
    type: "one_time",
    interval: null,
    intervalCount: 1,
    nickname: "Heti — egyszeri (7 nap)",
  },
  month_std: {
    role: "month_std",
    lookupKey: "price_month_std_5990",
    amountHuf: envInt("PRICE_MONTH_STD", 5990),
    type: "recurring",
    interval: "month",
    intervalCount: 1,
    nickname: "Havi — folyamatos",
  },
  month_oneoff: {
    role: "month_oneoff",
    lookupKey: "price_month_oneoff_7990",
    amountHuf: envInt("PRICE_MONTH_ONEOFF", 7990),
    type: "one_time",
    interval: null,
    intervalCount: 1,
    nickname: "Havi — egyszeri (30 nap)",
  },
  annual_std: {
    role: "annual_std",
    lookupKey: "price_annual_std_39900",
    amountHuf: envInt("PRICE_ANNUAL_STD", 39900),
    type: "recurring",
    interval: "year",
    intervalCount: 1,
    nickname: "Éves — standard",
  },
  annual_earned: {
    role: "annual_earned",
    lookupKey: "price_annual_earned_34900",
    amountHuf: envInt("PRICE_ANNUAL_EARNED", 34900),
    type: "recurring",
    interval: "year",
    intervalCount: 1,
    nickname: "Éves — kiérdemelt (első év)",
  },
  month_founder: {
    role: "month_founder",
    lookupKey: "price_month_founder_4990",
    amountHuf: envInt("PRICE_MONTH_FOUNDER", 4990),
    type: "recurring",
    interval: "month",
    intervalCount: 1,
    nickname: "Havi — alapító zárolás",
  },
  annual_renew: {
    role: "annual_renew",
    lookupKey: "price_annual_renew_34900",
    amountHuf: envInt("PRICE_ANNUAL_RENEW", 34900),
    type: "recurring",
    interval: "year",
    intervalCount: 1,
    nickname: "Éves — hosszabbítás (12 hó)",
  },
  biennial_renew: {
    role: "biennial_renew",
    lookupKey: "price_2yr_62900",
    amountHuf: envInt("PRICE_BIENNIAL_RENEW", 62900),
    type: "recurring",
    interval: "year",
    intervalCount: 2,
    nickname: "Kétéves — előre (24 hó)",
  },
  annual_winback: {
    role: "annual_winback",
    lookupKey: "price_annual_winback_29900",
    amountHuf: envInt("PRICE_ANNUAL_WINBACK", 29900),
    type: "recurring",
    interval: "year",
    intervalCount: 1,
    nickname: "Éves — win-back (első év)",
  },
};

/** All specs as a list — the seed script iterates this. */
export const PRICE_LIST: PriceSpec[] = Object.values(PRICES);

/** Reverse lookup: Stripe price lookup_key → role. Used by the webhook to map a
 *  purchased price back to a plan/duration. */
export const ROLE_BY_LOOKUP_KEY: Record<string, PriceRole> = Object.fromEntries(
  PRICE_LIST.map((p) => [p.lookupKey, p.role]),
) as Record<string, PriceRole>;

/** The one Stripe Product every price lives under. */
export const PRODUCT = {
  name: "Lexfit teljes hozzáférés",
  lookupId: "lexfit_full_access", // metadata key so the seed script finds it idempotently
} as const;

// ── One-off access durations (days) ────────────────────────────────────────
// One-off purchases have no recurring period; accessUntil = now + these days.
export const ONEOFF_ACCESS_DAYS: Record<"week_oneoff" | "month_oneoff", number> = {
  week_oneoff: envInt("PRICING_ONEOFF_WEEK_DAYS", 7),
  month_oneoff: envInt("PRICING_ONEOFF_MONTH_DAYS", 30),
};

// ── Lifecycle windows & thresholds (1.5) ───────────────────────────────────
/** Kiérdemlés: ≥requiredCheckins check-ins within windowDays of the first day. */
export const EARNING = {
  windowDays: envInt("PRICING_EARNING_WINDOW_DAYS", 7),
  requiredCheckins: envInt("PRICING_EARNING_REQUIRED_CHECKINS", 5),
} as const;

/** Grand Slam offer lifetime — a REAL, final deadline (J4). */
export const GRAND_SLAM_WINDOW_HOURS = envInt("PRICING_GRAND_SLAM_HOURS", 72);
/** How long a "redeeming" lock holds before a new checkout attempt may retry. */
export const GRAND_SLAM_REDEEM_LOCK_MS = envInt("PRICING_GRAND_SLAM_REDEEM_LOCK_MIN", 15) * 60_000;

/** Weekly intro (490 Ft) phase length before step-up to standard. */
export const WEEK_INTRO_DAYS = envInt("PRICING_WEEK_INTRO_DAYS", 7);

/** Late check-in: yesterday can still be logged until this Budapest hour. */
export const LATE_CHECKIN_CUTOFF_HOUR = envInt("PRICING_LATE_CHECKIN_CUTOFF_HOUR", 4);

/** Non-earner annual nudge fires once between these days after start. */
export const ANNUAL_NUDGE_WINDOW = {
  fromDay: envInt("PRICING_ANNUAL_NUDGE_FROM", 10),
  toDay: envInt("PRICING_ANNUAL_NUDGE_TO", 18),
} as const;

/** M2 credit-toward-annual offer valid only within the first N months. */
export const M2_MAX_MONTHS = envInt("PRICING_M2_MAX_MONTHS", 3);

/** M11 annual renewal window emails. */
export const M11 = {
  recapDaysBefore: envInt("PRICING_M11_RECAP_DAYS", 30),
  reminderDaysBefore: envInt("PRICING_M11_REMINDER_DAYS", 7),
} as const;

/** Founder-price lock auto-applies after this many successful monthly payments. */
export const FOUNDER_LOCK_AFTER_MONTHS = envInt("PRICING_FOUNDER_LOCK_MONTHS", 12);

/** Dunning: access is kept through `graceDays` after a failed payment. */
export const DUNNING = {
  firstEmailDay: 0,
  reminderDay: envInt("PRICING_DUNNING_REMINDER_DAY", 3),
  graceDays: envInt("PRICING_DUNNING_GRACE_DAYS", 7),
} as const;

/** Renewal reminders (J6). */
export const WEEKLY_REMINDER_DAY = envInt("PRICING_WEEKLY_REMINDER_DAY", 5);
export const MONTHLY_REMINDER_DAYS_BEFORE = envInt("PRICING_MONTHLY_REMINDER_DAYS", 3);

/** 14-day right of withdrawal (45/2014. Korm. r.) — J2. Non-excludable. */
export const WITHDRAWAL_DAYS = envInt("PRICING_WITHDRAWAL_DAYS", 14);

/** Pause durations offered in the cancel flow (F2.3). */
export const PAUSE_MONTHS_ALLOWED = [1, 2, 3] as const;
export type PauseMonths = (typeof PAUSE_MONTHS_ALLOWED)[number];
/** Auto-resume reminder — days before a pause ends (F5.2). */
export const PAUSE_RESUME_REMINDER_DAYS = envInt("PRICING_PAUSE_RESUME_REMINDER_DAYS", 3);

// ── Which roles are purchasable from the pricing page (the 6 starting SKUs) ──
// Weekly recurring enters on the intro price; the intro→standard step-up and
// the once-per-user guard are F2.1. The recurring set requires the J1 auto-renew
// consent; every purchase requires the J2 immediate-start consent.
export const RECURRING_CHECKOUT_ROLES = [
  "week_intro",
  "month_std",
  "annual_std",
] as const;
export const ONEOFF_CHECKOUT_ROLES = ["week_oneoff", "month_oneoff"] as const;
export type CheckoutRole =
  | (typeof RECURRING_CHECKOUT_ROLES)[number]
  | (typeof ONEOFF_CHECKOUT_ROLES)[number];

export function isRecurringRole(role: string): role is (typeof RECURRING_CHECKOUT_ROLES)[number] {
  return (RECURRING_CHECKOUT_ROLES as readonly string[]).includes(role);
}
export function isCheckoutRole(role: string): role is CheckoutRole {
  return (
    isRecurringRole(role) ||
    (ONEOFF_CHECKOUT_ROLES as readonly string[]).includes(role)
  );
}
