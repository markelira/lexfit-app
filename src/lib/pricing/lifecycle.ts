import "server-only";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { subscriptionRef } from "./subscription";
import { priceIdForRole } from "./checkout-server";
import { DAY_MS, type PauseMonths } from "./config";
import { logEvent } from "./events";
import { sendEmail } from "@/lib/email";
import { pauseResumingSoon } from "./templates";
import type { SubscriptionDoc } from "./types";

async function loadSub(uid: string): Promise<SubscriptionDoc | undefined> {
  return (await subscriptionRef(uid).get()).data() as SubscriptionDoc | undefined;
}

function addMonths(fromMs: number, months: number): number {
  const d = new Date(fromMs);
  d.setMonth(d.getMonth() + months);
  return d.getTime();
}

export class LifecycleError extends Error {}

/**
 * A weekly-intro (or earned-annual) subscription is managed by a Stripe
 * subscription schedule until its phases complete — and Stripe forbids
 * canceling or setting cancel behavior on the subscription directly while a
 * schedule manages it ("updating any cancelation behavior directly is not
 * allowed"). Releasing the schedule detaches it and leaves the subscription in
 * place as a standalone sub, so the normal cancel/withdrawal path then works.
 * No-op when there is no schedule. Returns the live subscription so callers can
 * reuse it without a second retrieve.
 */
export async function releaseScheduleIfManaged(
  stripeSubscriptionId: string,
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  const live = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  // TEMP INSTRUMENTATION [cxl] — remove after the schedule-cancel bug is confirmed fixed.
  console.log(
    "[cxl] releaseScheduleIfManaged",
    JSON.stringify({
      marker: "cxl-v3",
      askedId: stripeSubscriptionId,
      retrievedId: live.id,
      status: live.status,
      schedule: live.schedule ?? null,
    }),
  );
  if (live.schedule) {
    const schedId = typeof live.schedule === "string" ? live.schedule : live.schedule.id;
    try {
      const released = await stripe.subscriptionSchedules.release(schedId);
      console.log("[cxl] released schedule", JSON.stringify({ schedId, newStatus: released.status }));
    } catch (e) {
      console.error("[cxl] release FAILED", schedId, JSON.stringify(errInfo(e)));
      throw e;
    }
  } else {
    console.log("[cxl] no schedule attached — skipping release");
  }
  return live;
}

// TEMP [cxl] — compact Stripe error shape for logs.
function errInfo(e: unknown): Record<string, unknown> {
  const x = e as { name?: string; type?: string; code?: string; message?: string; statusCode?: number };
  return {
    name: x?.name,
    type: x?.type,
    code: x?.code,
    statusCode: x?.statusCode,
    message: e instanceof Error ? e.message : String(e),
  };
}

/**
 * F2.3 pause — stop billing AND access. `pause_collection: void` halts invoicing;
 * the PAUSED status hard-denies access (hasAccessFromData). The remaining paid
 * time is banked (`pauseRemainingMs`) so resume restores exactly what was left —
 * the period does not burn down while paused.
 */
export async function pauseSubscription(uid: string, months: PauseMonths): Promise<void> {
  const sub = await loadSub(uid);
  if (!sub?.stripeSubscriptionId) throw new LifecycleError("no_subscription");
  if (sub.status !== "ACTIVE") throw new LifecycleError("not_active");

  const now = Date.now();
  const periodEnd = sub.currentPeriodEnd ?? sub.accessUntil ?? now;
  const remaining = Math.max(0, periodEnd - now);

  // If still in the intro step-up window, release the managing schedule so the
  // pause/resume updates (pause_collection, then trial_end on resume) aren't
  // rejected. Trade-off: a sub paused during intro week resumes on the intro
  // price instead of stepping up — rare, user-favorable; refine post-launch.
  await releaseScheduleIfManaged(sub.stripeSubscriptionId);
  await getStripe().subscriptions.update(sub.stripeSubscriptionId, {
    pause_collection: { behavior: "void" },
  });

  await subscriptionRef(uid).set(
    {
      status: "PAUSED",
      pausedAt: now,
      pauseUntil: addMonths(now, months),
      pauseRemainingMs: remaining,
      updatedAt: now,
    },
    { merge: true },
  );
  await logEvent("pause_started", { uid, props: { months, remainingMs: remaining } });
}

/**
 * Resume a paused subscription. Restores the banked paid time via `trial_end`
 * (no charge until it elapses), and accumulates the ACTUAL paused days into
 * `pausedDaysTotal` — actual, not the requested months, because an early resume
 * (F5.2) makes them differ. This is the tenure input for the F4.3 founder lock.
 */
export async function resumeSubscription(uid: string, opts?: { email?: string | null }): Promise<void> {
  const sub = await loadSub(uid);
  if (!sub?.stripeSubscriptionId) throw new LifecycleError("no_subscription");
  if (sub.status !== "PAUSED") throw new LifecycleError("not_paused");

  const now = Date.now();
  const remaining = sub.pauseRemainingMs ?? 0;
  const nowSec = Math.floor(now / 1000);
  const trialEndSec = Math.floor((now + remaining) / 1000);

  await getStripe().subscriptions.update(sub.stripeSubscriptionId, {
    pause_collection: "",
    proration_behavior: "none",
    trial_end: trialEndSec > nowSec ? trialEndSec : "now",
  });

  const actualPausedDays = sub.pausedAt ? (now - sub.pausedAt) / DAY_MS : 0;
  await subscriptionRef(uid).set(
    {
      status: "ACTIVE",
      accessUntil: now + remaining, // restore exactly what was banked
      pausedDaysTotal: (sub.pausedDaysTotal ?? 0) + actualPausedDays,
      pausedAt: null,
      pauseUntil: null,
      pauseRemainingMs: null,
      updatedAt: now,
    },
    { merge: true },
  );
  await logEvent("pause_resumed", { uid, props: { actualPausedDays } });

  const to = opts?.email ?? null;
  if (to) {
    const { subject, text } = pauseResumingSoon();
    await sendEmail({ to, subject, text }).catch((e) => console.error("[resume email]", e));
  }
}

/**
 * F2.3 downgrade — monthly → weekly standard, at the PERIOD BOUNDARY, no
 * proration. The user stays monthly through the already-paid month, then moves
 * to the weekly standard price (1 990, never the intro — the once-per-user guard
 * holds). Implemented as a subscription schedule.
 */
export async function downgradeToWeekly(uid: string): Promise<number> {
  const sub = await loadSub(uid);
  if (!sub?.stripeSubscriptionId) throw new LifecycleError("no_subscription");
  if (sub.plan !== "MONTH" || sub.status !== "ACTIVE") throw new LifecycleError("not_downgradable");

  const stripe = getStripe();
  const live = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
  const monthPrice = live.items.data[0]?.price.id;
  const periodEnd = live.items.data[0]?.current_period_end; // seconds
  if (!monthPrice || !periodEnd) throw new LifecycleError("no_period");
  const stdPrice = await priceIdForRole("week_std");

  const schedule = await stripe.subscriptionSchedules.create({
    from_subscription: sub.stripeSubscriptionId,
  });
  const start = schedule.phases[0]?.start_date;
  await stripe.subscriptionSchedules.update(schedule.id, {
    end_behavior: "release",
    phases: [
      // stay monthly until the paid month ends (no proration)
      { items: [{ price: monthPrice }], start_date: start, end_date: periodEnd },
      // then weekly standard, released to continue indefinitely
      { items: [{ price: stdPrice }], duration: { interval: "week", interval_count: 1 } },
    ],
  });

  await subscriptionRef(uid).set(
    { downgradeScheduled: true, updatedAt: Date.now() },
    { merge: true },
  );
  await logEvent("downgrade_scheduled", { uid, props: { effectiveAt: periodEnd * 1000 } });
  return periodEnd * 1000; // when the weekly price takes effect
}

/**
 * F2.3 final cancel — one action. Access continues until the period end (J1
 * transparency), then Stripe deletes the sub and the webhook flips to EXPIRED.
 * Returns the access-until date for the UI to display.
 */
export async function cancelAtPeriodEnd(uid: string): Promise<number> {
  const sub = await loadSub(uid);
  if (!sub?.stripeSubscriptionId) throw new LifecycleError("no_subscription");

  // Weekly-intro subs are schedule-managed during the step-up; release the
  // schedule first or Stripe rejects the cancel. The user is leaving, so the
  // intro→standard step-up is moot.
  console.log("[cxl] cancelAtPeriodEnd start", JSON.stringify({ uid, subId: sub.stripeSubscriptionId }));
  const live = await releaseScheduleIfManaged(sub.stripeSubscriptionId);
  const schedBefore = live.schedule ? (typeof live.schedule === "string" ? live.schedule : live.schedule.id) : "none";
  try {
    await getStripe().subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    console.log("[cxl] cancel_at_period_end set OK");
  } catch (e) {
    console.error("[cxl] cancel update FAILED", JSON.stringify(errInfo(e)));
    // TEMP [cxl]: surface the diagnostic to the client so the on-screen error
    // tells us marker + schedule-before-release + released-flag.
    throw new Error(
      `[cxl-v3 sched=${schedBefore} released=${schedBefore !== "none"}] ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  const now = Date.now();
  const accessUntil = sub.currentPeriodEnd ?? sub.accessUntil ?? now;
  await subscriptionRef(uid).set(
    { status: "CANCELED", canceledAt: now, cancelReason: null, updatedAt: now },
    { merge: true },
  );
  await logEvent("canceled", { uid, props: { accessUntil } });
  return accessUntil;
}

/** Optional post-cancel reason (asked AFTER cancel, skippable). */
export async function setCancelReason(uid: string, reason: string): Promise<void> {
  await subscriptionRef(uid).set(
    { cancelReason: reason.slice(0, 200), updatedAt: Date.now() },
    { merge: true },
  );
}
