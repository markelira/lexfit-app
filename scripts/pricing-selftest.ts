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
import { formatHuf, perWeekHuf, perMonthHuf, annualSavingsPct } from "../src/lib/pricing/display";
import { nextChargeDay, formatHuDate } from "../src/lib/pricing/renewal";
import { planFromParam, planFromSearch } from "../src/lib/pricing/preselect";
import {
  computeRefundMinor, unusedFraction, fullRefundTotalMinor, guaranteeEligibility,
  type PaidPeriod,
} from "../src/lib/pricing/refund";
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
    // Comp (staff/admin/press) outranks everything Stripe wrote - including the
    // two hard denials and an elapsed/absent accessUntil.
    [{ comp: true }, true, "comp, no other fields"],
    [{ comp: true, status: "EXPIRED", accessUntil: past }, true, "comp beats EXPIRED + elapsed"],
    [{ comp: true, status: "PAUSED", accessUntil: past }, true, "comp beats PAUSED"],
    [{ comp: false, status: "EXPIRED", accessUntil: past }, false, "comp revoked → normal rules"],
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

function perMonthDerivation() {
  // The annual card's derived line. 39 900 / 12 is exact, and the savings figure
  // is the ONE legitimate comparison (monthly-annualized vs annual).
  assert.equal(perMonthHuf(39900), 3325, "39 900/év → 3 325 Ft/hó");
  assert.equal(annualSavingsPct(5990, 39900), 44, "annual saves 44% vs 12x monthly");
  // Grouping must match formatHuf's hand-rolled rule, not Intl's ICU-dependent
  // one - a mismatched separator is what broke hydration on / before.
  assert.equal(formatHuf(perMonthHuf(39900)), "3325 Ft", "4-digit stays solid");
  assert.equal(formatHuf(39900), "39\u00A0900 Ft", "5-digit groups with NBSP");
  console.log("✓ per-month derivation + grouping");
}

function renewalDates() {
  // Hard rule 7: the next charge date is shown BEFORE payment, so it has to be
  // right across a DST boundary. Budapest springs forward 2026-03-29 and falls
  // back 2026-10-25; millisecond arithmetic lands an hour off on both and can
  // move the displayed calendar day.
  const midJan = Date.UTC(2026, 0, 15, 10);
  assert.equal(nextChargeDay("week_intro", midJan), "2026-01-22", "weekly intro renews after 7 days");
  assert.equal(nextChargeDay("month_std", midJan), "2026-02-15", "monthly renews same day next month");
  assert.equal(nextChargeDay("annual_std", midJan), "2027-01-15", "annual renews same day next year");

  // Across the autumn change: 25 Oct is the fall-back Sunday, so a purchase on
  // the 22nd must still renew on the 29th - same weekday, not the 28th.
  const preFallBack = Date.UTC(2026, 9, 22, 10);
  assert.equal(nextChargeDay("week_intro", preFallBack), "2026-10-29", "weekly survives fall-back");
  // And across the spring change (29 March 2026).
  const preSpringFwd = Date.UTC(2026, 2, 25, 10);
  assert.equal(nextChargeDay("week_intro", preSpringFwd), "2026-04-01", "weekly survives spring-forward");

  // Late-evening UTC is already tomorrow in Budapest - the date shown must be
  // the Budapest day, not the UTC one.
  const lateUtc = Date.UTC(2026, 5, 30, 23, 30);
  assert.equal(nextChargeDay("week_intro", lateUtc), "2026-07-08", "23:30 UTC counts as the Budapest tomorrow");

  // Month-end CLAMPING, not overflow. JS setUTCMonth(+1) turns 31 Jan into
  // 3 March; Stripe charges the last day of the month instead. A pre-payment
  // disclosure that names a date Stripe will not use is worse than no date.
  const jan31 = Date.UTC(2026, 0, 31, 10);
  assert.equal(nextChargeDay("month_std", jan31), "2026-02-28", "31 Jan renews 28 Feb, not 3 Mar");
  const jan31leap = Date.UTC(2028, 0, 31, 10);
  assert.equal(nextChargeDay("month_std", jan31leap), "2028-02-29", "leap year clamps to the 29th");
  const feb29 = Date.UTC(2028, 1, 29, 10);
  assert.equal(nextChargeDay("annual_std", feb29), "2029-02-28", "29 Feb renews 28 Feb next year");
  const may31 = Date.UTC(2026, 4, 31, 10);
  assert.equal(nextChargeDay("month_std", may31), "2026-06-30", "31 May renews 30 Jun");
  const jan15 = Date.UTC(2026, 0, 15, 10);
  assert.equal(nextChargeDay("month_std", jan15), "2026-02-15", "a normal day is unaffected by the clamp");
  const dec15 = Date.UTC(2026, 11, 15, 10);
  assert.equal(nextChargeDay("month_std", dec15), "2027-01-15", "December rolls the year");
  const dec31 = Date.UTC(2026, 11, 31, 10);
  assert.equal(nextChargeDay("month_std", dec31), "2027-01-31", "31 Dec renews 31 Jan");

  assert.equal(formatHuDate("2026-09-11"), "2026. szeptember 11.", "Hungarian long form");
  assert.equal(formatHuDate("2026-01-01"), "2026. január 1.", "no zero padding in the display form");
  console.log("✓ next-charge dates (DST, Budapest day, month-end) + hu format");
}

function planPreselect() {
  // The three plans a pricing card can offer.
  for (const role of ["week_intro", "month_std", "annual_std"]) {
    assert.equal(planFromParam(role), role, `${role} round-trips`);
  }
  // Everything else keeps the funnel's own default. This is the only thing
  // between a URL and a Stripe price id, so the list is an allow-list: one-off
  // roles are real roles but are not offered on any pricing surface, and
  // internal/earned roles must never be selectable from a link.
  for (const bad of [
    "week_oneoff", "month_oneoff", "annual_earned", "month_founder",
    "annual_winback", "free", "", " ", "WEEK_INTRO", "../admin", null, undefined,
  ]) {
    assert.equal(planFromParam(bad as string | null), null, `rejects ${JSON.stringify(bad)}`);
  }
  // Read out of a real query string, with the ad parameters alongside it.
  assert.equal(
    planFromSearch("?utm_source=facebook&plan=annual_std&fbclid=X"),
    "annual_std",
    "reads ?plan= from a live ad URL",
  );
  assert.equal(planFromSearch("?utm_source=facebook"), null, "absent param → default");
  assert.equal(planFromSearch(""), null, "empty search → default");
  console.log("✓ ?plan= preselect allow-list");
}

function guaranteeRules() {
  // 2026-06-01 (summer, Budapest is +02:00). Window = 35 days → last day is
  // 2026-07-06 inclusive.
  const startedAt = Date.parse("2026-06-01T08:00:00+02:00");
  const day = (n: number) => {
    const d = new Date(Date.UTC(2026, 5, 1 + n, 12));
    return d.toISOString().slice(0, 10);
  };
  const runs = (n: number, dayOffsets?: number[]) =>
    Array.from({ length: n }, (_, i) => ({
      code: `F${String(i + 1).padStart(3, "0")}`,
      at: day(dayOffsets ? dayOffsets[i] : i),
    }));

  assert.equal(guaranteeEligibility({ completed: runs(9), startedAt }).eligible, false, "9 is not enough");
  assert.equal(guaranteeEligibility({ completed: runs(10), startedAt }).eligible, true, "10 earns it");

  // The boundary. Day 35 is the last day of the window and counts; day 36 does
  // not - the copy says "öt héten belül" and it is enforced exactly.
  const onLastDay = runs(10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 35]);
  assert.equal(guaranteeEligibility({ completed: onLastDay, startedAt }).eligible, true, "day 35 is inside");
  const oneDayLate = runs(10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 36]);
  const late = guaranteeEligibility({ completed: oneDayLate, startedAt });
  assert.equal(late.eligible, false, "day 36 is outside");
  assert.equal(late.completedInWindow, 9, "the late one is not counted");
  assert.equal(late.missedWindow, true, "did the work, missed the window - flagged for /admin");

  // DISTINCT codes. Ten replays of one video are one workout, not ten - this is
  // the case that would otherwise hand out refunds for watching day 1 all week.
  const replays = Array.from({ length: 10 }, (_, i) => ({ code: "F001", at: day(i) }));
  const r = guaranteeEligibility({ completed: replays, startedAt });
  assert.equal(r.completedInWindow, 1, "same code counted once");
  assert.equal(r.eligible, false, "replays do not earn the guarantee");

  // Completions from BEFORE the subscription started do not count.
  const early = runs(10, [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1]);
  assert.equal(guaranteeEligibility({ completed: early, startedAt }).eligible, false, "pre-start does not count");

  // Missing / malformed data must produce "no", never a throw.
  for (const bad of [null, undefined, [], [{ code: "", at: "" }] as never]) {
    const v = guaranteeEligibility({ completed: bad as never, startedAt });
    assert.equal(v.eligible, false, "malformed completions → not eligible");
  }
  assert.equal(
    guaranteeEligibility({ completed: runs(10), startedAt: null }).eligible,
    false,
    "no subscription start → not eligible",
  );

  // A winter start, to prove the day comparison is not offset-sensitive: the
  // window must still be 35 calendar days across the CET/CEST changeover.
  const winterStart = Date.parse("2026-03-01T08:00:00+01:00");
  const acrossDst = Array.from({ length: 10 }, (_, i) => ({
    code: `W${i}`,
    at: new Date(Date.UTC(2026, 2, 1 + (i === 9 ? 35 : i), 12)).toISOString().slice(0, 10),
  }));
  assert.equal(
    guaranteeEligibility({ completed: acrossDst, startedAt: winterStart }).eligible,
    true,
    "35 calendar days holds across the spring clock change",
  );

  // The guarantee refunds what was PAID, not what is unused - the opposite of
  // the statutory withdrawal above it.
  const periods: PaidPeriod[] = [
    { amountPaid: 49_000, periodStart: 0, periodEnd: 100 },
    { amountPaid: 199_000, periodStart: 100, periodEnd: 200 },
  ];
  assert.equal(fullRefundTotalMinor(periods), 248_000, "full refund is the sum of fees paid");
  assert.ok(
    fullRefundTotalMinor(periods) > computeRefundMinor(periods, 150),
    "guarantee refunds more than a pro-rata withdrawal at the same moment",
  );
  assert.equal(fullRefundTotalMinor([]), 0, "no invoices → nothing to refund");
  console.log("✓ 10 edzés garancia (boundary, distinct codes, DST, full vs pro-rata)");
}

accessMatrix();
budapestDays();
docIds();
displayNumbers();
perMonthDerivation();
renewalDates();
planPreselect();
guaranteeRules();
withdrawalProRata();
earningWindow();
makeupCutoff();
eligibilityAndOfferState();
console.log("\nAll self-tests passed.");
