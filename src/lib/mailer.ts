import "server-only";
import * as Sentry from "@sentry/nextjs";
import type { ReactElement } from "react";
import { render } from "react-email";
import { EmailTransportError, sendEmail } from "@/lib/email";
import { unsubUrl, type UnsubKind } from "@/lib/email-unsub";
import { formatHuf, perWeekHuf } from "@/lib/pricing/display";
import {
  GRAND_SLAM_WINDOW_HOURS,
  PRICES,
  ROLE_BY_LOOKUP_KEY,
} from "@/lib/pricing/config";

// ── The render+send layer for every system email. ───────────────────────────
// Templates live in emails/ (react-email; `npm run email:dev` to preview) and
// carry the copy; this module composes their data (prices from config so no
// number is ever hardcoded here - the F0.5 hard rule), renders html+text, tags
// the SendGrid category, and attaches the one-click unsubscribe header for
// every non-transactional send. Callers own idempotency (milestone docs /
// dunning flags) - mailer functions just send.
//
// deliver() NEVER throws: a vendor failure becomes a return value + a Sentry
// report. The crons iterate many users - one rejected send once aborted a
// whole run mid-loop (2026-08-10, SendGrid "Maximum credits exceeded"),
// starving every user after the failure.
//
// The `sent` flag answers "may the caller mark this delivered?", chosen so a
// retry can never double-send:
//   - definite rejection (SendGrid returned an error status: quota, bad key)
//     → { sent: false }: the mail was NOT queued; callers roll back their
//     idempotency marker so the user is retried on the next run.
//   - ambiguous transport failure (timeout / dropped connection - the POST may
//     already be queued at SendGrid) → { sent: true }: retrying could deliver
//     the mail twice, so callers keep their marker; Sentry still records it.
// Callers that mark idempotency must check `sent` before writing the marker.

import AnnualNudge, { subject as annualNudgeSubject } from "../../emails/annual-nudge";
import AnnualRenewalReminder, { subjectFor as annualRenewalSubject } from "../../emails/annual-renewal-reminder";
import CancelConfirm, { subjectFor as cancelSubject } from "../../emails/cancel-confirm";
import Day2Nudge, { subject as day2Subject } from "../../emails/day2-nudge";
import DunningDay0, { subject as dunning0Subject } from "../../emails/dunning-day0";
import DunningDay3, { subject as dunning3Subject } from "../../emails/dunning-day3";
import EarnedUnlocked, { subject as earnedSubject } from "../../emails/earned-unlocked";
import FirstWorkout, { subject as firstWorkoutSubject } from "../../emails/first-workout";
import LeadRightsConfirm, { subject as leadRightsSubject } from "../../emails/lead-rights-confirm";
import QuizResult, { subject as quizResultSubject } from "../../emails/quiz-result";
import QuizObstacle, { subjectFor as quizObstacleSubject, type Obstacle as QuizObstacleKind } from "../../emails/quiz-obstacle";
import QuizHowItWorks, { subject as quizHowSubject } from "../../emails/quiz-how-it-works";
import QuizOffer, { subject as quizOfferSubject } from "../../emails/quiz-offer";
import QuizObjections, { subject as quizObjectionsSubject } from "../../emails/quiz-objections";
import QuizLastCall, { subject as quizLastCallSubject } from "../../emails/quiz-last-call";
import QuizWinback, { subject as quizWinbackSubject } from "../../emails/quiz-winback";
import PasswordReset, { subject as pwResetSubject } from "../../emails/password-reset";
import PauseResuming, { subject as pauseSubject } from "../../emails/pause-resuming";
import StreakRisk, { subjectFor as streakSubject } from "../../emails/streak-risk";
import SubscriptionStarted, { subject as subStartedSubject } from "../../emails/subscription-started";
import VerifyEmail, { subject as verifySubject } from "../../emails/verify-email";
import WeeklyDay5Reminder, { subject as day5Subject } from "../../emails/weekly-day5-reminder";
import WeeklyRecap, { subjectFor as recapSubject } from "../../emails/weekly-recap";
import Welcome, { subject as welcomeSubject } from "../../emails/welcome";
import WithdrawalConfirm, { subject as withdrawalSubject } from "../../emails/withdrawal-confirm";
import WorkoutReminder, { subject as workoutSubject } from "../../emails/workout-reminder";
import type { DayState } from "../../emails/components/Bits";

export type { DayState };

async function deliver(opts: {
  to: string;
  subject: string;
  make: () => ReactElement;
  category: "auth" | "billing" | "habit" | "recap" | "marketing";
  unsub?: { uid: string; kind: UnsubKind };
}): Promise<{ sent: boolean }> {
  try {
    const html = await render(opts.make());
    const text = await render(opts.make(), { plainText: true });
    return await sendEmail({
      to: opts.to,
      subject: opts.subject,
      text,
      html,
      categories: [opts.category],
      ...(opts.unsub ? { listUnsubscribeUrl: unsubUrl(opts.unsub.uid, opts.unsub.kind) } : {}),
    });
  } catch (e) {
    console.error(`[mailer] ${opts.category} send failed: ${opts.subject}`, e);
    Sentry.captureException(e, { tags: { mailer_category: opts.category } });
    // Ambiguous transport failure → sent:true (see module comment: the mail
    // may already be queued; a rollback-driven retry could double-send).
    return { sent: e instanceof EmailTransportError };
  }
}

/** "2026. szeptember 9." - Budapest calendar date from epoch ms. */
export function dateHu(ms: number): string {
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(ms));
}

const DAY_FULL = ["hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat", "vasárnap"];

/** Next training day name after `todayWeekday` (1=Mon…7=Sun), or undefined. */
export function nextTrainingDayHu(weekdays: number[], todayWeekday: number): string | undefined {
  const set = new Set(weekdays);
  if (!set.size) return undefined;
  for (let i = 1; i <= 7; i++) {
    const w = ((todayWeekday - 1 + i) % 7) + 1;
    if (set.has(w)) return DAY_FULL[w - 1];
  }
  return undefined;
}

const INTERVAL_HU: Record<string, string> = { week: "hét", month: "hó", year: "év" };

/** Compose the subscription-started facts from the sub doc's lookup key. */
export function planDisplay(
  priceLookupKey: string | null | undefined,
  periodEndMs: number | null | undefined,
): { planName: string; priceLine: string; nextChargeDate: string; oneOff: boolean } | null {
  const role = priceLookupKey ? ROLE_BY_LOOKUP_KEY[priceLookupKey] : undefined;
  if (!role) return null;
  const spec = PRICES[role];
  const oneOff = spec.type === "one_time";
  let priceLine: string;
  if (role === "week_intro") {
    priceLine = `${formatHuf(spec.amountHuf)} / első 7 nap, utána ${formatHuf(PRICES.week_std.amountHuf)} / hét`;
  } else if (oneOff) {
    priceLine = `${formatHuf(spec.amountHuf)} egyszeri`;
  } else {
    const unit = INTERVAL_HU[spec.interval ?? "month"] ?? "hó";
    priceLine =
      spec.intervalCount > 1
        ? `${formatHuf(spec.amountHuf)} / ${spec.intervalCount} ${unit}`
        : `${formatHuf(spec.amountHuf)} / ${unit}`;
  }
  return {
    planName: spec.nickname,
    priceLine,
    nextChargeDate: periodEndMs != null ? dateHu(periodEndMs) : "-",
    oneOff,
  };
}

/**
 * The entry offer, formatted. Read from PRICES so the quiz mails can never
 * quote a stale figure - the F0.5 hard rule (no pricing number outside config)
 * matters most in marketing copy, where a wrong price is a false claim.
 */
function introAndStdPrice(): { introPrice: string; stdPrice: string } {
  return {
    introPrice: formatHuf(PRICES.week_intro.amountHuf),
    stdPrice: formatHuf(PRICES.week_std.amountHuf),
  };
}

// ── Account & auth (transactional) ──────────────────────────────────────────

export const sendWelcome = (to: string, name?: string | null) =>
  deliver({ to, subject: welcomeSubject, category: "auth", make: () => Welcome({ name }) });

export const sendVerifyEmail = (to: string, verifyUrl: string) =>
  deliver({ to, subject: verifySubject, category: "auth", make: () => VerifyEmail({ verifyUrl }) });

export const sendPasswordReset = (to: string, resetUrl: string) =>
  deliver({ to, subject: pwResetSubject, category: "auth", make: () => PasswordReset({ resetUrl }) });

// ── Lead magnet quiz ────────────────────────────────────────────────────────
//
// E1 is TRANSACTIONAL - it is the result the lead asked for by handing over
// their address, so it ships regardless of the marketing box. Everything after
// it is marketing: gated on consent, and carrying a working one-click opt-out
// keyed on the LEAD id, because these people have no account to unsubscribe in
// (Grtv. §6 - no soft opt-in in Hungary).

export type { QuizObstacleKind };

export const sendQuizResult = (
  to: string,
  p: {
    firstName: string; maintenanceKcal: number; goalKcal: number;
    programTitle: string; stepsTarget: number; bonusTitle?: string | null;
  },
) => deliver({ to, subject: quizResultSubject, category: "habit", make: () => QuizResult(p) });

/** Every nurture send needs the lead id: it keys the unsubscribe token. */
const leadUnsub = (leadId: string) => ({
  unsub: { uid: leadId, kind: "leadMarketing" as UnsubKind },
  href: unsubUrl(leadId, "leadMarketing"),
});

export const sendQuizObstacle = (
  to: string, leadId: string, p: { firstName: string; obstacle: QuizObstacleKind },
) => {
  const u = leadUnsub(leadId);
  return deliver({
    to, subject: quizObstacleSubject(p.obstacle), category: "marketing",
    unsub: u.unsub, make: () => QuizObstacle({ ...p, unsubHref: u.href }),
  });
};

export const sendQuizHowItWorks = (
  to: string, leadId: string, p: { firstName: string; programTitle: string },
) => {
  const u = leadUnsub(leadId);
  return deliver({
    to, subject: quizHowSubject, category: "marketing",
    unsub: u.unsub, make: () => QuizHowItWorks({ ...p, unsubHref: u.href }),
  });
};

export const sendQuizOffer = (to: string, leadId: string, p: { firstName: string }) => {
  const u = leadUnsub(leadId);
  return deliver({
    to, subject: quizOfferSubject, category: "marketing", unsub: u.unsub,
    make: () => QuizOffer({ ...p, ...introAndStdPrice(), unsubHref: u.href }),
  });
};

export const sendQuizObjections = (
  to: string, leadId: string, p: { firstName: string; obstacle: QuizObstacleKind },
) => {
  const u = leadUnsub(leadId);
  return deliver({
    to, subject: quizObjectionsSubject, category: "marketing",
    unsub: u.unsub, make: () => QuizObjections({ ...p, unsubHref: u.href }),
  });
};

export const sendQuizLastCall = (
  to: string, leadId: string, p: { firstName: string; programTitle: string },
) => {
  const u = leadUnsub(leadId);
  return deliver({
    to, subject: quizLastCallSubject, category: "marketing", unsub: u.unsub,
    make: () => QuizLastCall({ ...p, introPrice: introAndStdPrice().introPrice, unsubHref: u.href }),
  });
};

export const sendQuizWinback = (to: string, leadId: string, p: { firstName: string }) => {
  const u = leadUnsub(leadId);
  return deliver({
    to, subject: quizWinbackSubject, category: "marketing", unsub: u.unsub,
    make: () => QuizWinback({ ...p, introPrice: introAndStdPrice().introPrice, unsubHref: u.href }),
  });
};

/** A quiz lead exercising a GDPR right. Transactional: no consent gate, no
 *  unsubscribe footer - it answers a request they just made. */
export const sendLeadRightsConfirm = (
  to: string,
  p: { action: "erase" | "export"; confirmUrl: string },
) =>
  deliver({
    to,
    subject: leadRightsSubject,
    category: "auth",
    make: () => LeadRightsConfirm(p),
  });

// ── Billing & subscription (transactional) ──────────────────────────────────

export const sendSubscriptionStarted = (
  to: string,
  p: { planName: string; priceLine: string; nextChargeDate: string; oneOff: boolean },
) =>
  deliver({
    to,
    subject: subStartedSubject,
    category: "billing",
    make: () => SubscriptionStarted(p),
  });

export const sendWeeklyDay5 = (to: string) =>
  deliver({
    to,
    subject: day5Subject,
    category: "billing",
    make: () => WeeklyDay5Reminder({ stdPrice: formatHuf(PRICES.week_std.amountHuf) }),
  });

export const sendAnnualRenewal = (
  to: string,
  variant: "recap30" | "final7",
  p: { renewDateMs: number; priceHuf: number; doneCount?: number },
) =>
  deliver({
    to,
    subject: annualRenewalSubject(variant),
    category: "billing",
    make: () =>
      AnnualRenewalReminder({
        variant,
        renewDate: dateHu(p.renewDateMs),
        price: formatHuf(p.priceHuf),
        doneCount: p.doneCount,
      }),
  });

export const sendDunningDay0 = (to: string, payUrl: string) =>
  deliver({ to, subject: dunning0Subject, category: "billing", make: () => DunningDay0({ payUrl }) });

export const sendDunningDay3 = (to: string, payUrl: string) =>
  deliver({ to, subject: dunning3Subject, category: "billing", make: () => DunningDay3({ payUrl }) });

export const sendCancelConfirm = (
  to: string,
  p: { variant: "cancel" | "downgrade"; accessUntilMs: number; newPlanLine?: string },
) =>
  deliver({
    to,
    subject: cancelSubject(p.variant),
    category: "billing",
    make: () =>
      CancelConfirm({
        variant: p.variant,
        accessUntil: dateHu(p.accessUntilMs),
        newPlanLine: p.newPlanLine,
      }),
  });

export const sendWithdrawalConfirm = (to: string, refundHuf: number) =>
  deliver({
    to,
    subject: withdrawalSubject,
    category: "billing",
    make: () =>
      WithdrawalConfirm({ refundAmount: formatHuf(refundHuf), zeroRefund: refundHuf <= 0 }),
  });

export const sendPauseResuming = (to: string) =>
  deliver({ to, subject: pauseSubject, category: "billing", make: () => PauseResuming() });

export const sendEarnedUnlocked = (to: string) =>
  deliver({
    to,
    subject: earnedSubject,
    category: "billing",
    make: () =>
      EarnedUnlocked({
        earnedPrice: formatHuf(PRICES.annual_earned.amountHuf),
        perWeek: formatHuf(perWeekHuf(PRICES.annual_earned.amountHuf)),
        windowHours: GRAND_SLAM_WINDOW_HOURS,
      }),
  });

// ── Marketing (Grtv. §6 - caller MUST gate on marketingOptIn) ───────────────

export const sendAnnualNudge = (to: string, uid: string) =>
  deliver({
    to,
    subject: annualNudgeSubject,
    category: "marketing",
    unsub: { uid, kind: "marketing" },
    make: () =>
      AnnualNudge({
        weekStd: formatHuf(PRICES.week_std.amountHuf),
        annualPerWeek: formatHuf(perWeekHuf(PRICES.annual_std.amountHuf)),
      }),
  });

// ── Habit & lifecycle (reminder consent; unsubscribe header attached) ───────

export const sendWorkoutReminder = (to: string, uid: string) =>
  deliver({
    to,
    subject: workoutSubject,
    category: "habit",
    unsub: { uid, kind: "workout" },
    make: () => WorkoutReminder(),
  });

export const sendStreakRisk = (to: string, uid: string, streak: number) =>
  deliver({
    to,
    subject: streakSubject(streak),
    category: "habit",
    unsub: { uid, kind: "streakRisk" },
    make: () => StreakRisk({ streak }),
  });

export const sendWeeklyRecap = (
  to: string,
  uid: string,
  p: {
    doneThisWeek: number;
    target: number;
    streak: number;
    days: { label: string; state: DayState }[];
    nextWeekDays: string;
    newContentLine?: string;
  },
) =>
  deliver({
    to,
    subject: recapSubject(p.doneThisWeek === 0),
    category: "recap",
    unsub: { uid, kind: "weeklyRecap" },
    make: () => WeeklyRecap(p),
  });

export const sendFirstWorkout = (to: string, uid: string, nextDayName?: string) =>
  deliver({
    to,
    subject: firstWorkoutSubject,
    category: "habit",
    unsub: { uid, kind: "weeklyRecap" },
    make: () => FirstWorkout({ nextDayName }),
  });

export const sendDay2Nudge = (to: string, uid: string, motiv?: string) =>
  deliver({
    to,
    subject: day2Subject,
    category: "habit",
    unsub: { uid, kind: "workout" },
    make: () => Day2Nudge({ motiv }),
  });
