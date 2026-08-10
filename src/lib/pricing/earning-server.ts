import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, checkinDocId, offerDocId } from "./keys";
import { subscriptionRef } from "./subscription";
import {
  earningWindowDays,
  grandSlamExpiry,
  isOfferEligible,
  isOfferRedeemable,
} from "./earning";
import { EARNING, GRAND_SLAM_REDEEM_LOCK_MS } from "./config";
import { logEvent } from "./events";
import { sendEarnedUnlocked } from "@/lib/mailer";
import type { OfferDoc, SubscriptionDoc } from "./types";

const EARNED = "EARNED_ANNUAL" as const;
const offerRef = (uid: string) =>
  adminDb.collection(COLLECTIONS.offers).doc(offerDocId(uid, EARNED));

/** Record a daily check-in (community mechanic — runs for EVERY user). The doc
 *  ID is `{uid}_{Budapest-day}`, so it's naturally one-per-user-per-day. The
 *  route validates that `day` is allowed (today, or yesterday before 04:00). */
export async function recordCheckin(uid: string, day: string): Promise<void> {
  await adminDb
    .collection(COLLECTIONS.checkins)
    .doc(checkinDocId(uid, day))
    .set({ userId: uid, day, createdAt: Date.now() }, { merge: true });
}

/**
 * Try to unlock the kiérdemelt éves (Grand Slam) offer. Idempotent and
 * abuse-safe. STEP ORDER MATTERS:
 *   1. offer-doc existence — if one EVER existed (even voided), stop. This is
 *      what stops cancel→resubscribe from starting a fresh earning week.
 *   2. eligibility — weekly/monthly only.
 *   3. window + count — ≥5 check-ins among the 7 window days.
 *   4. create the offer in a transaction (re-checks non-existence).
 * Returns the created offer, or null.
 */
export async function maybeUnlockEarnedAnnual(
  uid: string,
  opts?: { email?: string | null },
): Promise<OfferDoc | null> {
  const ref = offerRef(uid);

  // 1) Anti-abuse: any prior offer (unlocked/redeemed/voided) → never re-earn.
  if ((await ref.get()).exists) return null;

  // 2) Eligibility: only weekly/monthly can earn.
  const sub = (await subscriptionRef(uid).get()).data() as SubscriptionDoc | undefined;
  if (!isOfferEligible(sub) || sub?.startedAt == null) return null;

  // 3) Count qualifying check-ins by reading the exact window-day docs.
  const windowDays = earningWindowDays(sub.startedAt);
  const refs = windowDays.map((d) =>
    adminDb.collection(COLLECTIONS.checkins).doc(checkinDocId(uid, d)),
  );
  const snaps = await adminDb.getAll(...refs);
  const count = snaps.filter((s) => s.exists).length;
  if (count < EARNING.requiredCheckins) return null;

  // 4) Create atomically (re-check inside the tx to avoid a double-create race).
  const now = Date.now();
  const offer: OfferDoc = {
    type: EARNED,
    userId: uid,
    unlockedAt: now,
    expiresAt: grandSlamExpiry(now),
    redeemedAt: null,
    voidedAt: null,
    redeemingAt: null,
    createdAt: now,
  };
  const created = await adminDb.runTransaction(async (tx) => {
    if ((await tx.get(ref)).exists) return false;
    tx.set(ref, offer);
    return true;
  });
  if (!created) return null;

  await logEvent("earned_unlocked", { uid, props: { expiresAt: offer.expiresAt } });
  if (opts?.email) {
    await sendEarnedUnlocked(opts.email).catch((e) => console.error("[earned email]", e));
  }
  return offer;
}

export async function getEarnedOffer(uid: string): Promise<OfferDoc | null> {
  const snap = await offerRef(uid).get();
  return snap.exists ? (snap.data() as OfferDoc) : null;
}

export class RedeemError extends Error {}

/**
 * Transactional redeem gate (F3 requirement #1). In ONE transaction: verify the
 * offer is redeemable (not redeemed/voided, not expired by SERVER time) and not
 * already being redeemed, then stamp `redeemingAt`. This closes the race at the
 * expiry instant and between two concurrent checkouts. Returns the offer.
 */
export async function lockOfferForRedeem(uid: string): Promise<OfferDoc> {
  const ref = offerRef(uid);
  const now = Date.now();
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const offer = snap.data() as OfferDoc | undefined;
    if (!offer) throw new RedeemError("no_offer");
    if (!isOfferRedeemable(offer, now)) throw new RedeemError("offer_not_redeemable");
    if (offer.redeemingAt && now - offer.redeemingAt < GRAND_SLAM_REDEEM_LOCK_MS) {
      throw new RedeemError("redeem_in_progress");
    }
    tx.update(ref, { redeemingAt: now });
    return { ...offer, redeemingAt: now };
  });
}

/** Mark redeemed once the earned-annual checkout completes (from the webhook). */
export async function markOfferRedeemed(uid: string): Promise<void> {
  await offerRef(uid).set({ redeemedAt: Date.now() }, { merge: true });
}

/**
 * Void offers whose deadline has passed (cron). Expired = voided, FINAL — the
 * offer disappears and never reopens (J4). Single-field inequality query, then
 * filter state in code (no composite index).
 */
export async function voidExpiredOffers(nowMs: number): Promise<number> {
  const snap = await adminDb
    .collection(COLLECTIONS.offers)
    .where("expiresAt", "<", nowMs)
    .get();
  let voided = 0;
  for (const doc of snap.docs) {
    const o = doc.data() as OfferDoc;
    if (o.redeemedAt || o.voidedAt) continue;
    await doc.ref.set({ voidedAt: nowMs }, { merge: true });
    await logEvent("grand_slam_expired", { uid: o.userId });
    voided++;
  }
  return voided;
}
