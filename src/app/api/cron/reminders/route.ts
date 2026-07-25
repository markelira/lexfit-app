import "server-only";
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp, adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, milestoneDocId, offerDocId } from "@/lib/pricing/keys";
import {
  WEEKLY_REMINDER_DAY,
  DAY_MS,
  PAUSE_RESUME_REMINDER_DAYS,
  ANNUAL_NUDGE_WINDOW,
} from "@/lib/pricing/config";
import {
  weeklyDay5Reminder,
  pauseResumingSoon,
  annualNudge,
  dunningDay3,
} from "@/lib/pricing/templates";
import { resumeSubscription } from "@/lib/pricing/lifecycle";
import { voidExpiredOffers } from "@/lib/pricing/earning-server";
import { isOfferEligible } from "@/lib/pricing/earning";
import { retryFailedInvoices } from "@/lib/pricing/invoice";
import { getStripe } from "@/lib/stripe";
import { DUNNING } from "@/lib/pricing/config";
import { sendEmail } from "@/lib/email";
import type { SubscriptionDoc } from "@/lib/pricing/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY5_KIND = "day5_reminder_sent";

async function emailFor(uid: string): Promise<string | null> {
  try {
    return (await getAuth(adminApp).getUser(uid)).email ?? null;
  } catch {
    return null;
  }
}

/** Daily job (Vercel Cron). Sends the F2.2 weekly day-5 renewal reminder once
 *  per user, idempotently via a milestone doc. Secured with CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();

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

    const mRef = adminDb
      .collection(COLLECTIONS.milestones)
      .doc(milestoneDocId(doc.id, DAY5_KIND));
    if ((await mRef.get()).exists) continue;

    const email = await emailFor(doc.id);
    if (!email) continue;

    const { subject, text } = weeklyDay5Reminder();
    await sendEmail({ to: email, subject, text });
    await mRef.set({ userId: doc.id, kind: DAY5_KIND, firedAt: now });
    sent++;
  }

  // ── F3.4: non-earner annual nudge (days 10–18, weekly/monthly, once) ──
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

    const mRef = adminDb
      .collection(COLLECTIONS.milestones)
      .doc(milestoneDocId(doc.id, "annual_nudge_sent"));
    if ((await mRef.get()).exists) continue;

    const email = await emailFor(doc.id);
    if (email) {
      const { subject, text } = annualNudge();
      await sendEmail({ to: email, subject, text });
    }
    await mRef.set({ userId: doc.id, kind: "annual_nudge_sent", firedAt: now });
    nudges++;
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
      const { subject, text } = dunningDay3(payUrl);
      await sendEmail({ to: email, subject, text });
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
      const rRef = adminDb
        .collection(COLLECTIONS.milestones)
        .doc(milestoneDocId(doc.id, "pause_resume_reminder_sent"));
      if (!(await rRef.get()).exists) {
        const email = await emailFor(doc.id);
        if (email) {
          const { subject, text } = pauseResumingSoon();
          await sendEmail({ to: email, subject, text });
        }
        await rRef.set({ userId: doc.id, kind: "pause_resume_reminder_sent", firedAt: now });
        pauseReminders++;
      }
    }

    // Auto-resume once the pause window has elapsed.
    if (now >= sub.pauseUntil) {
      await resumeSubscription(doc.id, { email: await emailFor(doc.id) });
      resumed++;
    }
  }

  return NextResponse.json({
    ok: true,
    weeklyScanned: weekly.size,
    day5Sent: sent,
    annualNudges: nudges,
    dunningDay3Sent: dunning3,
    invoicesRetried,
    offersVoided: voided,
    pausedScanned: paused.size,
    pauseReminders,
    resumed,
  });
}
