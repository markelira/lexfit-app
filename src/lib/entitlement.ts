import "server-only";
import { adminDb } from "@/lib/firebase-admin";

const ACTIVE = new Set(["active", "trialing"]);

/**
 * Access model: all videos are gated — a user needs an active (or trialing)
 * subscription to stream. Previews/catalog are free, playback is not.
 * Subscription status is mirrored from Stripe by the webhook.
 */
export async function hasAccess(uid: string): Promise<boolean> {
  const snap = await adminDb.doc(`users/${uid}/subscription/status`).get();
  return snap.exists && ACTIVE.has(snap.data()?.status);
}
