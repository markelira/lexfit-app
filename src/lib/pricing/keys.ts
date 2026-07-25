// LEXFIT pricing — Firestore collection names + deterministic document IDs.
//
// Pure and dependency-free (no firebase, no server-only) so the SAME id logic is
// shared by the client, the Admin-SDK server code, and the Stripe seed script.
//
// Firestore has no `@@unique` constraint like Prisma: the DOCUMENT ID *is* the
// uniqueness / idempotency guarantee. Every builder below turns a business key
// into one stable id, so "one check-in per user per day", "one offer of a type
// per user", "process each webhook once" all fall out of the id, not app logic.

export const BUSINESS_TZ = "Europe/Budapest";

export const COLLECTIONS = {
  /** users/{uid} → one doc per user; SOLE source of truth for access. */
  subscriptions: "subscriptions",
  /** {uid}_{YYYY-MM-DD} (Budapest day) → one check-in per user per day. */
  checkins: "checkins",
  /** {uid}_{OfferType} → a user can hold each offer type once. */
  offers: "offers",
  /** {uid}_{kind} → each milestone automation fires once per user. */
  milestones: "milestones",
  /** {stripe event.id} → webhook dedup. */
  stripeWebhookEvents: "stripeWebhookEvents",
} as const;

/**
 * Europe/Budapest calendar day as `YYYY-MM-DD`.
 *
 * NEVER derive a check-in day from UTC: a 23:30 Budapest check-in is already
 * "tomorrow" in UTC for part of the year, which would silently split one day's
 * check-in across two doc ids (or collide two calendar days into one). `en-CA`
 * formats as `YYYY-MM-DD`, and `timeZone` pins the wall-clock day to Budapest.
 */
export function budapestDay(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TZ }).format(date);
}

/** Hour-of-day (0–23) in Europe/Budapest — used for the 04:00 late-check-in cutoff. */
export function budapestHour(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TZ,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour")?.value);
  return h === 24 ? 0 : h; // some engines render midnight as "24"
}

/**
 * Add `n` calendar days to a `YYYY-MM-DD` day-string. Pure civil-date
 * arithmetic (UTC anchored, no timezone) — the input already IS a Budapest
 * calendar day, so we just walk the civil calendar and never re-introduce a TZ.
 */
export function addDaysToDay(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d) + n * 86_400_000;
  const dt = new Date(t);
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}

export const subscriptionDocId = (uid: string): string => uid;
/** `day` must come from budapestDay() — the Budapest calendar day, not UTC. */
export const checkinDocId = (uid: string, day: string): string => `${uid}_${day}`;
export const offerDocId = (uid: string, type: string): string => `${uid}_${type}`;
export const milestoneDocId = (uid: string, kind: string): string => `${uid}_${kind}`;
export const webhookEventDocId = (eventId: string): string => eventId;
