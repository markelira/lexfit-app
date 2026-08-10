// Sends EVERY system email (all variants, realistic sample data) to one inbox
// through the real mailer → SendGrid path — a live end-to-end test of the
// templates, the plain-text parts, categories, and unsubscribe headers.
//
// Run:
//   node --env-file=.env.local --import tsx scripts/send-test-emails.ts [recipient]
//
// Default recipient: info@amstudios.hu.
//
// NOTE: the unsubscribe links/headers in these test sends are signed for the
// fake uid below — clicking one only touches users/email-live-test/… , never a
// real user. Auth links (reset/verify) are demo URLs, not real action codes.

// The mailer stack is guarded by `server-only`, which throws outside a React
// server bundle — but `--conditions react-server` would break react-email's
// renderer (react-dom/server is forbidden under that condition). So: stub the
// guard in the require cache BEFORE loading the mailer. tsx compiles this
// script to CJS, so `require` is available directly.
/* eslint-disable @typescript-eslint/no-require-imports */
const soPath = require.resolve("server-only");
require.cache[soPath] = { id: soPath, filename: soPath, loaded: true, exports: {} } as never;
const mailer = require("../src/lib/mailer") as typeof import("../src/lib/mailer");

import type { DayState } from "../src/lib/mailer";

const {
  dateHu,
  planDisplay,
  sendAnnualNudge,
  sendAnnualRenewal,
  sendCancelConfirm,
  sendDay2Nudge,
  sendDunningDay0,
  sendDunningDay3,
  sendEarnedUnlocked,
  sendFirstWorkout,
  sendPasswordReset,
  sendPauseResuming,
  sendStreakRisk,
  sendSubscriptionStarted,
  sendVerifyEmail,
  sendWeeklyDay5,
  sendWeeklyRecap,
  sendWelcome,
  sendWithdrawalConfirm,
  sendWorkoutReminder,
} = mailer;

const TO = process.argv[2] ?? "info@amstudios.hu";
const UID = "email-live-test"; // fake uid for unsubscribe-link signing
const DAY_MS = 86_400_000;
const now = Date.now();

const demoAction = (mode: string) =>
  `https://www.lexfit.hu/auth/action?mode=${mode}&oobCode=DEMO-TESZT`;

const sampleWeek: { label: string; state: DayState }[] = [
  { label: "H", state: "done" },
  { label: "K", state: "done" },
  { label: "Sz", state: "rest" },
  { label: "Cs", state: "done" },
  { label: "P", state: "missed" },
  { label: "Szo", state: "done" },
  { label: "V", state: "rest" },
];

const sends: [string, () => Promise<{ sent: boolean }>][] = [
  // Account & auth
  ["welcome", () => sendWelcome(TO, "Anna")],
  ["verify-email", () => sendVerifyEmail(TO, demoAction("verifyEmail"))],
  ["password-reset", () => sendPasswordReset(TO, demoAction("resetPassword"))],
  // Billing & subscription
  [
    "subscription-started (heti intro)",
    () => sendSubscriptionStarted(TO, planDisplay("price_week_intro_490", now + 7 * DAY_MS)!),
  ],
  [
    "subscription-started (egyszeri 7 nap)",
    () => sendSubscriptionStarted(TO, planDisplay("price_week_oneoff_2990", now + 7 * DAY_MS)!),
  ],
  ["weekly-day5-reminder", () => sendWeeklyDay5(TO)],
  [
    "annual-renewal (−30 recap)",
    () => sendAnnualRenewal(TO, "recap30", { renewDateMs: now + 30 * DAY_MS, priceHuf: 39900, doneCount: 142 }),
  ],
  [
    "annual-renewal (−7 final)",
    () => sendAnnualRenewal(TO, "final7", { renewDateMs: now + 7 * DAY_MS, priceHuf: 39900 }),
  ],
  ["dunning-day0", () => sendDunningDay0(TO, "https://invoice.stripe.com/i/DEMO-TESZT")],
  ["dunning-day3", () => sendDunningDay3(TO, "https://invoice.stripe.com/i/DEMO-TESZT")],
  ["cancel-confirm (lemondás)", () => sendCancelConfirm(TO, { variant: "cancel", accessUntilMs: now + 23 * DAY_MS })],
  [
    "cancel-confirm (váltás hetire)",
    () =>
      sendCancelConfirm(TO, {
        variant: "downgrade",
        accessUntilMs: now + 23 * DAY_MS,
        newPlanLine: "Heti — 1 990 Ft / hét",
      }),
  ],
  ["withdrawal-confirm", () => sendWithdrawalConfirm(TO, 490)],
  ["withdrawal-confirm (0 Ft)", () => sendWithdrawalConfirm(TO, 0)],
  ["pause-resuming", () => sendPauseResuming(TO)],
  ["earned-unlocked", () => sendEarnedUnlocked(TO)],
  // Marketing
  ["annual-nudge", () => sendAnnualNudge(TO, UID)],
  // Habit & lifecycle
  ["workout-reminder", () => sendWorkoutReminder(TO, UID)],
  ["streak-risk", () => sendStreakRisk(TO, UID, 12)],
  [
    "weekly-recap (4/5 hét)",
    () =>
      sendWeeklyRecap(TO, UID, {
        doneThisWeek: 4,
        target: 5,
        streak: 12,
        days: sampleWeek,
        nextWeekDays: "hétfő, kedd, csütörtök, péntek, szombat",
        newContentLine: "3 új alsótest-edzés a videótárban",
      }),
  ],
  [
    "weekly-recap (üres hét)",
    () =>
      sendWeeklyRecap(TO, UID, {
        doneThisWeek: 0,
        target: 5,
        streak: 0,
        days: [],
        nextWeekDays: "hétfő, kedd, csütörtök, péntek, szombat",
      }),
  ],
  ["first-workout", () => sendFirstWorkout(TO, UID, "csütörtök")],
  ["day2-nudge", () => sendDay2Nudge(TO, UID, "Erősebb akarok lenni, és jobban aludni.")],
];

async function main() {
  if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_FROM) {
    console.error("SENDGRID_API_KEY / EMAIL_FROM missing — run with --env-file=.env.local");
    process.exit(1);
  }
  console.log(`Sending ${sends.length} test emails → ${TO} (sample date: ${dateHu(now)})\n`);
  let ok = 0;
  let failed = 0;
  for (const [name, fn] of sends) {
    try {
      const r = await fn();
      console.log(`  ${r.sent ? "✓" : "○ skipped"}  ${name}`);
      if (r.sent) ok++;
      // Gentle pacing so the inbox arrives in order.
      await new Promise((res) => setTimeout(res, 400));
    } catch (e) {
      failed++;
      console.error(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`);
    }
  }
  console.log(`\n${ok} sent, ${failed} failed.`);
  if (failed) process.exit(1);
}

main();
