import "server-only";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Per-uid fixed-window rate limit backed by a server-only Firestore doc
 * (rateLimits/{scope}_{uid}) - same approach as the account-export limiter.
 * The collection is unreachable by clients (default-deny rules). Fail-open:
 * a limiter hiccup must never take a product flow down.
 */
export async function allowRequest(
  scope: string,
  uid: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  const ref = adminDb.doc(`rateLimits/${scope}_${uid}`);
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const d = snap.data() as { windowStart?: number; count?: number } | undefined;
      const count = d?.windowStart === windowStart ? (d.count ?? 0) : 0;
      if (count >= max) return false;
      tx.set(ref, { windowStart, count: count + 1, updatedAt: Date.now() });
      return true;
    });
  } catch {
    return true;
  }
}

export const HOUR_MS = 3600_000;
export const DAY_MS_RL = 24 * HOUR_MS;
