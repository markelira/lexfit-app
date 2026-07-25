import "server-only";
import { adminDb } from "@/lib/firebase-admin";

// F6.1 instrumentation, seeded early so events exist retroactively. Firestore
// adaptation of the plan's `events` table: one doc per event in `events`.
// Admin-only collections (default-deny in rules; Admin SDK bypasses) — never
// read client-side.

export type PricingEvent =
  | "checkout_started"
  | "checkout_completed"
  | "withdrawal_requested"
  | "canceled"
  | "pause_started"
  | "pause_resumed"
  | "downgrade_scheduled"
  | "dunning_started"
  | "dunning_recovered"
  | "earned_unlocked"
  | "grand_slam_viewed"
  | "grand_slam_redeemed"
  | "grand_slam_expired";

/** Append an analytics event. Best-effort: never throw into the caller's flow. */
export async function logEvent(
  name: PricingEvent,
  data: { uid?: string | null; props?: Record<string, unknown> } = {},
): Promise<void> {
  try {
    await adminDb.collection("events").add({
      name,
      uid: data.uid ?? null,
      props: data.props ?? {},
      at: Date.now(),
    });
  } catch (e) {
    console.error(`[events] failed to log ${name}:`, e);
  }
}

/**
 * Raise an admin notification (e.g. every withdrawal — an F6 guardrail signal).
 * Written to `adminNotifications` for the dashboard to surface. Email delivery
 * is deferred until the transactional provider is wired (F5); this doc is the
 * durable record in the meantime.
 */
export async function notifyAdmin(
  kind: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  try {
    await adminDb.collection("adminNotifications").add({
      kind,
      data,
      read: false,
      at: Date.now(),
    });
  } catch (e) {
    console.error(`[events] failed to notify admin (${kind}):`, e);
  }
}
