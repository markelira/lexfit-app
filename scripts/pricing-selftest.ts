/**
 * F0 self-test — the entitlement rule across every status, plus the doc-id /
 * Budapest-day conventions. No test framework is wired in this repo, so this is
 * a plain assertion script.
 *
 * Run:  node --import tsx scripts/pricing-selftest.ts
 */
import assert from "node:assert/strict";
import { hasAccessFromData, type SubscriptionDoc } from "../src/lib/pricing/types";
import { budapestDay, budapestHour, checkinDocId, offerDocId } from "../src/lib/pricing/keys";
import { formatHuf, perWeekHuf, annualSavingsPct } from "../src/lib/pricing/display";
import { computeRefundMinor, unusedFraction, type PaidPeriod } from "../src/lib/pricing/refund";
import {
  earningWindowDays,
  isEarned,
  allowedCheckinDays,
  isOfferEligible,
  isOfferRedeemable,
} from "../src/lib/pricing/earning";
import type { OfferDoc } from "../src/lib/pricing/types";

const now = 1_700_000_000_000;
const future = now + 86_400_000;
const past = now - 86_400_000;

function accessMatrix() {
  const cases: Array<[SubscriptionDoc | null, boolean, string]> = [
    [null, false, "no doc"],
    [{ status: "ACTIVE", accessUntil: future }, true, "ACTIVE + future"],
    [{ status: "ACTIVE", accessUntil: past }, false, "ACTIVE + elapsed"],
    [{ status: "ACTIVE", accessUntil: null }, false, "ACTIVE + no accessUntil"],
    [{ status: "PAST_DUE", accessUntil: future }, true, "PAST_DUE within grace"],
    [{ status: "PAST_DUE", accessUntil: past }, false, "PAST_DUE past grace"],
    [{ status: "CANCELED", accessUntil: future }, true, "CANCELED until period end"],
    [{ status: "CANCELED", accessUntil: past }, false, "CANCELED after period end"],
    [{ status: "PAUSED", accessUntil: future }, false, "PAUSED (hard deny)"],
    [{ status: "EXPIRED", accessUntil: future }, false, "EXPIRED (hard deny)"],
  ];
  for (const [doc, expected, label] of cases) {
    assert.equal(hasAccessFromData(doc, now), expected, `access: ${label}`);
  }
  console.log(`✓ entitlement matrix (${cases.length} cases)`);
}

function budapestDays() {
  // 2025-06-30 23:30 UTC is already 2025-07-01 01:30 in Budapest (CEST, +2).
  const summerNight = new Date("2025-06-30T23:30:00Z");
  assert.equal(budapestDay(summerNight), "2025-07-01", "summer night rolls to Budapest tomorrow");
  // 2025-01-31 23:30 UTC → 2025-02-01 00:30 Budapest (CET, +1).
  const winterNight = new Date("2025-01-31T23:30:00Z");
  assert.equal(budapestDay(winterNight), "2025-02-01", "winter night rolls to Budapest tomorrow");
  assert.equal(budapestHour(summerNight), 1, "summer hour is 01 Budapest");
  console.log("✓ Budapest-day / hour conversion (not UTC)");
}

function docIds() {
  assert.equal(checkinDocId("u1", "2025-07-01"), "u1_2025-07-01");
  assert.equal(offerDocId("u1", "EARNED_ANNUAL"), "u1_EARNED_ANNUAL");
  console.log("✓ doc-id builders");
}

function displayNumbers() {
  // The spec's headline figures must fall out of the config, not be hardcoded.
  assert.equal(perWeekHuf(39900), 767, "annual → 767 Ft/hét");
  assert.equal(annualSavingsPct(5990, 39900), 44, "annual vs 12× monthly → 44%");
  // hu-HU groups with a narrow no-break space (U+202F/U+00A0), not a plain space —
  // that's correct rendering; normalize whitespace to assert the grouping itself.
  assert.equal(
    formatHuf(39900).replace(/\s/g, " "),
    "39 900 Ft",
    "Hungarian grouping (space thousands)",
  );
  console.log("✓ display derivations (767 Ft/hét, 44%, hu grouping)");
}

function withdrawalProRata() {
  const DAY = 86_400_000;
  const t0 = 1_700_000_000_000;
  // The critical two-price case: weekly buyer withdraws on day 10.
  //   week 1 [day0..7]  paid 490 Ft  (49000 minor) — fully consumed → refund 0
  //   week 2 [day7..14] paid 1990 Ft (199000 minor) — 4/7 unused → refund 199000×4/7
  const periods: PaidPeriod[] = [
    { amountPaid: 49_000, periodStart: t0, periodEnd: t0 + 7 * DAY },
    { amountPaid: 199_000, periodStart: t0 + 7 * DAY, periodEnd: t0 + 14 * DAY },
  ];
  const now = t0 + 10 * DAY;
  const expected = Math.round(199_000 * (4 / 7)); // 113714 minor = 1137.14 Ft
  assert.equal(computeRefundMinor(periods, now), expected, "day-10 refund sums per invoice");
  // A single-price sanity check: day 3 of a 7-day 490 period → 4/7 unused.
  assert.equal(
    computeRefundMinor([{ amountPaid: 49_000, periodStart: t0, periodEnd: t0 + 7 * DAY }], t0 + 3 * DAY),
    Math.round(49_000 * (4 / 7)),
    "day-3 weekly refund",
  );
  assert.equal(unusedFraction(t0, t0 + 7 * DAY, t0 + 7 * DAY), 0, "fully consumed → 0");
  console.log("✓ withdrawal pro-rata (two-price first period + single period)");
}

function earningWindow() {
  // Purchase at 23:30 Budapest on 2025-06-30 (21:30 UTC in CEST). Day 0 must be
  // 06-30 (the purchase's Budapest day) and count as the first window day.
  const buy = new Date("2025-06-30T21:30:00Z").getTime();
  const win = earningWindowDays(buy); // default 7 days
  assert.deepEqual(win, [
    "2025-06-30", "2025-07-01", "2025-07-02", "2025-07-03",
    "2025-07-04", "2025-07-05", "2025-07-06",
  ], "window is day0..day0+6, day0 = purchase Budapest day");

  // A first check-in the NEXT day (07-01) is inside the window.
  assert.equal(win.includes("2025-07-01"), true, "next-day check-in in window");
  // The day after the window (07-07) is NOT.
  assert.equal(win.includes("2025-07-07"), false, "day 7 is outside the window");

  // 5 window-days (incl. day 0) → earned; 4 → not.
  assert.equal(isEarned(["2025-06-30", "2025-07-01", "2025-07-03", "2025-07-05", "2025-07-06"], buy), true, "5/7 earns");
  assert.equal(isEarned(["2025-06-30", "2025-07-01", "2025-07-03", "2025-07-05"], buy), false, "4/7 does not");
  // A check-in dated 07-07 doesn't count even alongside 4 real ones.
  assert.equal(isEarned(["2025-06-30", "2025-07-01", "2025-07-03", "2025-07-05", "2025-07-07"], buy), false, "out-of-window day doesn't count");

  console.log("✓ earning window (23:30 purchase, day0 counts, 5/7 boundary)");
}

function makeupCutoff() {
  // 2025-07-07 03:00 Budapest (01:00 UTC, CEST) — before the 04:00 cutoff, so
  // YESTERDAY (07-06, the window's LAST day) is still loggable. This is the exact
  // "I had 5 but it didn't unlock" support scenario.
  const early = new Date("2025-07-07T01:00:00Z").getTime();
  assert.deepEqual(allowedCheckinDays(early), ["2025-07-07", "2025-07-06"], "before 04:00 → today + yesterday");
  assert.equal(allowedCheckinDays(early).includes("2025-07-06"), true, "last window day still loggable at 03:00");

  // 2025-07-07 07:00 Budapest (05:00 UTC) — after cutoff, only today.
  const late = new Date("2025-07-07T05:00:00Z").getTime();
  assert.deepEqual(allowedCheckinDays(late), ["2025-07-07"], "after 04:00 → today only");
  console.log("✓ 04:00 makeup cutoff vs last window day");
}

function eligibilityAndOfferState() {
  assert.equal(isOfferEligible({ plan: "WEEK" }), true, "weekly eligible");
  assert.equal(isOfferEligible({ plan: "MONTH" }), true, "monthly eligible");
  assert.equal(isOfferEligible({ plan: "ANNUAL" }), false, "annual NOT eligible (nothing to upsell)");
  assert.equal(isOfferEligible({ plan: "ONEOFF_WEEK" }), false, "one-off NOT eligible");
  assert.equal(isOfferEligible(null), false, "no sub not eligible");

  const base: OfferDoc = {
    type: "EARNED_ANNUAL", userId: "u", unlockedAt: 0, expiresAt: 1000,
    redeemedAt: null, voidedAt: null, redeemingAt: null, createdAt: 0,
  };
  assert.equal(isOfferRedeemable(base, 500), true, "live offer redeemable");
  assert.equal(isOfferRedeemable(base, 1500), false, "expired by server time not redeemable");
  assert.equal(isOfferRedeemable({ ...base, redeemedAt: 1 }, 500), false, "already redeemed");
  assert.equal(isOfferRedeemable({ ...base, voidedAt: 1 }, 500), false, "voided is final");
  assert.equal(isOfferRedeemable(null, 500), false, "no offer");
  console.log("✓ eligibility (WEEK/MONTH only) + offer-state machine");
}

accessMatrix();
budapestDays();
docIds();
displayNumbers();
withdrawalProRata();
earningWindow();
makeupCutoff();
eligibilityAndOfferState();
console.log("\nAll self-tests passed.");
