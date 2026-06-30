import "server-only";

/**
 * One-membership access model. Until Stripe lands in Phase 6, any authenticated
 * user is entitled to playback. Phase 6 flips this to read
 * users/{uid}/subscription.status and require an active subscription.
 */
export async function hasAccess(_uid: string): Promise<boolean> {
  // TODO(Phase 6): gate on subscription status.
  //   const snap = await adminDb.doc(`users/${_uid}/subscription/status`).get();
  //   return snap.exists && ["active", "trialing"].includes(snap.data()?.status);
  return true;
}
