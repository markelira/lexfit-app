// LEXFIT pricing - the next-charge date shown BEFORE payment (offer v3 hard
// rule 7: wherever a recurring price is shown at point of sale, the renewal
// amount and the next-charge date are shown before the visitor pays).
//
// Pure and dependency-light so it can be asserted in the self-test without a
// browser or a Stripe call.
//
// Two deliberate choices:
//
// 1. CALENDAR arithmetic, not millisecond arithmetic. Adding 7 * 86_400_000 ms
//    to a timestamp crosses a DST boundary twice a year in Budapest and lands
//    an hour off, which can move the displayed wall-clock DAY. The day parts
//    are therefore taken in Budapest, advanced in calendar units, and
//    reassembled - so "a week from Sunday 26 October" is Sunday 2 November
//    regardless of the clocks changing in between.
//
// 2. NO Intl for the month name. src/lib/pricing/display.ts already documents
//    why: the separator/format Intl emits depends on the runtime's ICU version,
//    and server-rendered text hydrated on an older browser produced mismatched
//    text nodes. A hand-written month table cannot drift.

import { budapestDay, WEEK_INTRO_DAYS } from "./config";

/** Days in a UTC month (0-indexed month, as Date reports it). */
function daysInUtcMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

const HU_MONTHS = [
  "január", "február", "március", "április", "május", "június",
  "július", "augusztus", "szeptember", "október", "november", "december",
];

/** Which calendar step each purchasable recurring role renews on. The weekly
 *  plan enters on the intro price, so its FIRST renewal is the intro window -
 *  which is also the moment the price steps up to `week_std`. */
export type RenewalRole = "week_intro" | "month_std" | "annual_std";

/**
 * The next charge date for `role`, as `YYYY-MM-DD` in Budapest.
 *
 * `nowMs` must be the real current time on the CLIENT - `/register` is a
 * statically prerendered route, so a date computed during the render pass would
 * be frozen at build time and shown to every visitor forever.
 */
export function nextChargeDay(role: RenewalRole, nowMs: number): string {
  const [y, m, d] = budapestDay(new Date(nowMs)).split("-").map(Number);

  if (role === "week_intro") {
    // Noon UTC: far enough from either midnight that no offset change can roll
    // the date while we add days to it.
    const at = new Date(Date.UTC(y, m - 1, d, 12));
    at.setUTCDate(at.getUTCDate() + WEEK_INTRO_DAYS);
    return iso(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate());
  }

  // Monthly and annual are built from PARTS rather than mutated, because every
  // mutating form of this overflows. setUTCMonth(+1) on 31 January gives 3
  // March; setUTCFullYear(+1) on 29 February gives 1 March, and then reading
  // back getUTCMonth() to clamp reads MARCH's length, not February's. Stripe
  // clamps instead: when the anchor day does not exist in the billing period it
  // charges the last day of that month, so 31 Jan renews 28 Feb and a 29 Feb
  // annual renews 28 Feb. A pre-payment disclosure naming a date Stripe will
  // not use is worse than naming none.
  const year = role === "annual_std" ? y + 1 : m === 12 ? y + 1 : y;
  const month = role === "annual_std" ? m - 1 : m === 12 ? 0 : m;
  return iso(year, month, Math.min(d, daysInUtcMonth(year, month)));
}

/** `YYYY-MM-DD` from parts (0-indexed month, as Date reports it). */
function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** `2026-09-11` → `2026. szeptember 11.` (Hungarian long form). */
export function formatHuDate(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return `${y}. ${HU_MONTHS[m - 1]} ${d}.`;
}

/** The full pre-payment disclosure date for a role, formatted. */
export function nextChargeLabel(role: RenewalRole, nowMs: number): string {
  return formatHuDate(nextChargeDay(role, nowMs));
}
