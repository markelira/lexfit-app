import "server-only";
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";
import { adminApp, adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, milestoneDocId, offerDocId } from "@/lib/pricing/keys";
import {
  WEEKLY_REMINDER_DAY,
  DAY_MS,
  PAUSE_RESUME_REMINDER_DAYS,
  ANNUAL_NUDGE_WINDOW,
  M11,
  PRICES,
  ROLE_BY_LOOKUP_KEY,
  DUNNING,
} from "@/lib/pricing/config";
import { resumeSubscription } from "@/lib/pricing/lifecycle";
import { voidExpiredOffers } from "@/lib/pricing/earning-server";
import { isOfferEligible } from "@/lib/pricing/earning";
import { retryFailedInvoices } from "@/lib/pricing/invoice";
import { getStripe } from "@/lib/stripe";
import {
  sendAnnualNudge,
  sendAnnualRenewal,
  sendDay2Nudge,
  sendDunningDay3,
  sendPauseResuming,
  sendWeeklyDay5,
  sendWeeklyRecap,
  type DayState,
} from "@/lib/mailer";
import { computeWeekProgress } from "@/lib/week-progress";
import { computeStreak } from "@/lib/streak";
import { weekdayNamesHu } from "@/lib/profile";
import type { SubscriptionDoc } from "@/lib/pricing/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY5_KIND = "day5_reminder_sent";

async function emailFor(uid: string): Promise<string | null> {
  try {
    return (await getAuth(adminApp).getUser(uid)).email ?? null;
  } catch {
    return null;
  }
}

async function milestoneOnce(uid: string, kind: string): Promise<boolean> {
  const ref = adminDb.collection(COLLECTIONS.milestones).doc(milestoneDocId(uid, kind));
  if ((await ref.get()).exists) return false;
  await ref.set({ userId: uid, kind, firedAt: Date.now() });
  return true;
}

/** Budapest calendar day + Monday-first weekday of `now`. */
function budapestToday(): { day: string; weekday: number } {
  const WD: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Budapest",
      year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
    }).formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  return { day: `${parts.year}-${parts.month}-${parts.day}`, weekday: WD[parts.weekday as string] ?? 1 };
}

type ProgressDoc = {
  completed?: { code?: string; at: string }[];
  lastCompletedDate?: string | null;
};

type PrefsDoc = {
  plan?: { weekdays?: number[]; daysPerWeek?: number; restDayKeepsStreak?: boolean };
  reminders?: { weeklyRecap?: boolean };
};

/** Daily job (Vercel Cron, 8:00). Renewal + habit lifecycle emails, all
 *  idempotent via milestone docs / sub-doc flags. Secured with CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Fail CLOSED: a missing CRON_SECRET must never make this public.
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const today = budapestToday();

  // ── F2.2: weekly day-5 renewal reminders ──
  const weekly = await adminDb
    .collection(COLLECTIONS.subscriptions)
    .where("plan", "==", "WEEK")
    .where("status", "==", "ACTIVE")
    .get();

  let sent = 0;
  for (const doc of weekly.docs) {
    const sub = doc.data() as SubscriptionDoc;
    if (sub.startedAt == null) continue;
    const day = Math.floor((now - sub.startedAt) / DAY_MS);
    // Fire in the day-5..6 window of the intro week; the milestone keeps it once.
    if (day < WEEKLY_REMINDER_DAY || day >= 7) continue;
    if (!(await milestoneOnce(doc.id, DAY5_KIND))) continue;

    const email = await emailFor(doc.id);
    if (!email) continue;
    await sendWeeklyDay5(email);
    sent++;
  }

  // ── F4.2/M11: annual renewal reminders (−30 recap, −7 final) ──
  // Milestone keys include the period end, so each renewal year re-fires.
  const annuals = await adminDb
    .collection(COLLECTIONS.subscriptions)
    .where("plan", "==", "ANNUAL")
    .where("status", "==", "ACTIVE")
    .get();

  let annualReminders = 0;
  for (const doc of annuals.docs) {
    const sub = doc.data() as SubscriptionDoc;
    if (sub.currentPeriodEnd == null || sub.canceledAt != null) continue;
    const daysLeft = (sub.currentPeriodEnd - now) / DAY_MS;
    if (daysLeft <= 0 || daysLeft > M11.recapDaysBefore) continue;
    const variant = daysLeft <= M11.reminderDaysBefore ? ("final7" as const) : ("recap30" as const);
    if (!(await milestoneOnce(doc.id, `annual_${variant}_${sub.currentPeriodEnd}`))) continue;

    const email = await emailFor(doc.id);
    if (!email) continue;
    // Renewal price: the earned first-year price steps up to standard.
    const role = sub.priceLookupKey ? ROLE_BY_LOOKUP_KEY[sub.priceLookupKey] : undefined;
    const priceHuf =
      role && role !== "annual_earned" ? PRICES[role].amountHuf : PRICES.annual_std.amountHuf;
    let doneCount: number | undefined;
    if (variant === "recap30") {
      const prog = (await adminDb.doc(`users/${doc.id}/progress/state`).get()).data() as
        | ProgressDoc
        | undefined;
      const yearAgo = new Date(now - 365 * DAY_MS).toISOString().slice(0, 10);
      doneCount = (prog?.completed ?? []).filter((c) => String(c.at) >= yearAgo).length;
    }
    await sendAnnualRenewal(email, variant, {
      renewDateMs: sub.currentPeriodEnd,
      priceHuf,
      doneCount,
    });
    annualReminders++;
  }

  // ── F3.4: non-earner annual nudge (days 10–18, weekly/monthly, once) ──
  // Promotional in character → Grtv. §6: only with the user's marketing opt-in.
  const active = await adminDb
    .collection(COLLECTIONS.subscriptions)
    .where("status", "==", "ACTIVE")
    .get();

  let nudges = 0;
  for (const doc of active.docs) {
    const sub = doc.data() as SubscriptionDoc;
    if (!isOfferEligible(sub) || sub.startedAt == null) continue;
    const day = Math.floor((now - sub.startedAt) / DAY_MS);
    if (day < ANNUAL_NUDGE_WINDOW.fromDay || day > ANNUAL_NUDGE_WINDOW.toDay) continue;

    // Only non-earners: skip anyone who ever had an earned offer.
    const hasOffer = (
      await adminDb
        .collection(COLLECTIONS.offers)
        .doc(offerDocId(doc.id, "EARNED_ANNUAL"))
        .get()
    ).exists;
    if (hasOffer) continue;
    if (!(await milestoneOnce(doc.id, "annual_nudge_sent"))) continue;

    const optedIn =
      (await adminDb.doc(`users/${doc.id}`).get()).data()?.marketingOptIn === true;
    const email = optedIn ? await emailFor(doc.id) : null;
    if (email) {
      await sendAnnualNudge(email, doc.id);
      nudges++;
    }
  }

  // ── F5.1: day-3 dunning reminder (PAST_DUE, once per episode) ──
  const pastDue = await adminDb
    .collection(COLLECTIONS.subscriptions)
    .where("status", "==", "PAST_DUE")
    .get();

  let dunning3 = 0;
  for (const doc of pastDue.docs) {
    const sub = doc.data() as SubscriptionDoc;
    if (sub.pastDueSince == null || sub.dunningDay3Sent) continue;
    if (now - sub.pastDueSince < DUNNING.reminderDay * DAY_MS) continue;
    if (!sub.stripeSubscriptionId) continue;

    // Stripe hosted invoice = pay / update-card link.
    const open = await getStripe().invoices.list({
      subscription: sub.stripeSubscriptionId,
      status: "open",
      limit: 1,
    });
    const payUrl = open.data[0]?.hosted_invoice_url ?? "";
    const email = await emailFor(doc.id);
    if (email && payUrl) {
      await sendDunningDay3(email, payUrl);
    }
    await doc.ref.set({ dunningDay3Sent: true }, { merge: true });
    dunning3++;
  }

  // ── F0.6: retry any invoices that failed to issue ──
  const invoicesRetried = await retryFailedInvoices();

  // ── F3.3: void Grand Slam offers whose 72h deadline has passed (J4) ──
  const voided = await voidExpiredOffers(now);

  // ── F2.3/F5.2: paused subs — 3-day resume reminder + auto-resume ──
  const paused = await adminDb
    .collection(COLLECTIONS.subscriptions)
    .where("status", "==", "PAUSED")
    .get();

  let resumed = 0;
  let pauseReminders = 0;
  for (const doc of paused.docs) {
    const sub = doc.data() as SubscriptionDoc;
    if (sub.pauseUntil == null) continue;

    // Reminder N days before the pause ends (once, via milestone).
    const remindAt = sub.pauseUntil - PAUSE_RESUME_REMINDER_DAYS * DAY_MS;
    if (now >= remindAt && now < sub.pauseUntil) {
      if (await milestoneOnce(doc.id, "pause_resume_reminder_sent")) {
        const email = await emailFor(doc.id);
        if (email) await sendPauseResuming(email);
        pauseReminders++;
      }
    }

    // Auto-resume once the pause window has elapsed.
    if (now >= sub.pauseUntil) {
      await resumeSubscription(doc.id, { email: await emailFor(doc.id) });
      resumed++;
    }
  }

  // ── Activation: day-2 first-workout nudge (§4e/18) ──
  // Users created 2–4 days ago with zero completions, once (milestone).
  let day2Nudges = 0;
  const newUsers = await adminDb
    .collection("users")
    .where("createdAt", ">=", Timestamp.fromMillis(now - 4 * DAY_MS))
    .where("createdAt", "<=", Timestamp.fromMillis(now - 2 * DAY_MS))
    .get();
  for (const doc of newUsers.docs) {
    const uid = doc.id;
    const prog = (await adminDb.doc(`users/${uid}/progress/state`).get()).data() as
      | ProgressDoc
      | undefined;
    if ((prog?.completed?.length ?? 0) > 0) continue; // already active — skip
    if (!(await milestoneOnce(uid, "day2_nudge_sent"))) continue;
    const email = await emailFor(uid);
    if (!email) continue;
    const motiv = String(
      (await adminDb.doc(`users/${uid}/onboarding/profile`).get()).data()?.motiv ?? "",
    ).trim();
    await sendDay2Nudge(email, uid, motiv || undefined);
    day2Nudges++;
  }

  // ── Weekly recap — Mondays, covering last Mon–Sun (§4d/16) ──
  // Skips: opted-out, never-activated (day-2 nudge territory), >21 days
  // inactive (win-back territory, F5.3), and PAST_DUE users (one narrative at
  // a time — dunning owns the inbox).
  let recaps = 0;
  if (today.weekday === 1) {
    const labels = ["H", "K", "Sz", "Cs", "P", "Szo", "V"];
    const prefsDocs = await adminDb.collectionGroup("settings").get();
    for (const p of prefsDocs.docs) {
      if (p.id !== "prefs") continue;
      const uid = p.ref.parent.parent?.id;
      if (!uid) continue;
      const prefs = p.data() as PrefsDoc;
      if (prefs.reminders?.weeklyRecap === false) continue;

      const prog = (await adminDb.doc(`users/${uid}/progress/state`).get()).data() as
        | ProgressDoc
        | undefined;
      const completed = prog?.completed ?? [];
      if (!completed.length) continue;
      const last = prog?.lastCompletedDate;
      if (!last || Date.parse(today.day) - Date.parse(String(last)) > 21 * DAY_MS) continue;

      const sub = (
        await adminDb.collection(COLLECTIONS.subscriptions).doc(uid).get()
      ).data() as SubscriptionDoc | undefined;
      if (sub?.status === "PAST_DUE") continue;

      if (!(await milestoneOnce(uid, `weekly_recap_${today.day}`))) continue;
      const email = await emailFor(uid);
      if (!email) continue;

      // Last week's snapshot: anchor computeWeekProgress on yesterday (Sunday).
      const wp = computeWeekProgress({
        weekdays: prefs.plan?.weekdays ?? [],
        daysPerWeek: prefs.plan?.daysPerWeek ?? 0,
        completed: completed.map((c) => ({ code: c.code, at: String(c.at) })),
        now: new Date(now - DAY_MS),
      });
      const days = wp.days.map((d, i) => ({
        label: labels[i],
        state: (d.done ? "done" : d.rest ? "rest" : "missed") as DayState,
      }));
      const workoutIdx = new Set((prefs.plan?.weekdays ?? []).map((w) => w - 1));
      const streak = computeStreak(
        completed.map((c) => String(c.at)),
        workoutIdx,
        today.day,
        prefs.plan?.restDayKeepsStreak ?? true,
      );
      await sendWeeklyRecap(email, uid, {
        doneThisWeek: wp.doneThisWeek,
        target: wp.target,
        streak,
        days,
        nextWeekDays: weekdayNamesHu(wp.weekdays),
      });
      recaps++;
    }
  }

  return NextResponse.json({
    ok: true,
    weeklyScanned: weekly.size,
    day5Sent: sent,
    annualReminders,
    annualNudges: nudges,
    dunningDay3Sent: dunning3,
    invoicesRetried,
    offersVoided: voided,
    pausedScanned: paused.size,
    pauseReminders,
    resumed,
    day2Nudges,
    recaps,
  });
}
