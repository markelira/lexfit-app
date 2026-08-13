import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, milestoneDocId } from "@/lib/pricing/keys";

// One-shot email/action markers ("send this once per user per kind"). The
// claim-then-act pattern keeps concurrent runs from double-firing; the clear
// rolls a claim back when the action definitely failed, so the user is retried
// on the next run instead of being permanently dropped. Shared here because
// three separate copies (cron/reminders, auth/post-register, inline variants)
// had already started to drift.

/** Claim `kind` for `uid`. Returns false when already claimed. */
export async function milestoneOnce(uid: string, kind: string): Promise<boolean> {
  const ref = adminDb.collection(COLLECTIONS.milestones).doc(milestoneDocId(uid, kind));
  if ((await ref.get()).exists) return false;
  await ref.set({ userId: uid, kind, firedAt: Date.now() });
  return true;
}

/** Roll back a milestoneOnce claim whose action failed, so the next run
 *  retries. Best-effort - a failed delete just means one extra skip. */
export async function milestoneClear(uid: string, kind: string): Promise<void> {
  await adminDb
    .collection(COLLECTIONS.milestones)
    .doc(milestoneDocId(uid, kind))
    .delete()
    .catch(() => {});
}
