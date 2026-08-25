// Grant (or revoke) comped access - staff, admin and press accounts that should
// stream everything without paying.
//
//   node --env-file=.env.local scripts/grant-comp-access.mjs <email> [reason]
//   node --env-file=.env.local scripts/grant-comp-access.mjs <email> --revoke
//
// Writes `comp: true` on subscriptions/{uid} - the ONE document that governs
// access (src/lib/pricing/types.ts). The flag, not a far-future `accessUntil`,
// is what makes this durable: the Stripe webhook merges its own status and
// accessUntil over this doc, so a date-based comp would be silently revoked the
// next time the account went through checkout. `hasAccessFromData` checks the
// flag before anything else, so both the UI and the Mux token route honour it.
//
// Against the emulator, run with FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 (and the
// auth emulator host) - the Admin SDK picks those up automatically.
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const [email, ...rest] = process.argv.slice(2);
const revoke = rest.includes("--revoke");
const reason = rest.filter((a) => a !== "--revoke").join(" ") || "admin";

if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/grant-comp-access.mjs <email> [reason|--revoke]");
  process.exit(1);
}

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const target = process.env.FIRESTORE_EMULATOR_HOST
  ? `EMULATOR (${process.env.FIRESTORE_EMULATOR_HOST})`
  : `PRODUCTION (${process.env.FIREBASE_ADMIN_PROJECT_ID})`;

const db = getFirestore();
const user = await getAuth().getUserByEmail(email).catch(() => null);
if (!user) {
  console.error(`✗ No account for ${email} in ${target}. They must sign in once first.`);
  process.exit(1);
}

const ref = db.collection("subscriptions").doc(user.uid);
const before = (await ref.get()).data() ?? {};
console.log(`Target: ${target}`);
console.log(`Account: ${email} (${user.uid})`);
console.log(`Before: status=${before.status ?? "-"} accessUntil=${before.accessUntil ?? "-"} comp=${before.comp ?? false}`);

if (revoke) {
  await ref.set({ comp: false, compReason: null, updatedAt: Date.now() }, { merge: true });
  console.log(`✓ Comp access REVOKED. Stripe-derived access (if any) is untouched.`);
  process.exit(0);
}

const now = Date.now();
const patch = {
  comp: true,
  compReason: reason,
  compGrantedAt: now,
  updatedAt: now,
};

// A live Stripe subscription stays in charge of its own status/plan fields -
// only comp the account, never rewrite a paying subscription's bookkeeping.
// A dead one (EXPIRED/CANCELED, or none at all) would otherwise leave the
// membership screen offering pause/cancel against a subscription Stripe has
// already closed, so clear the stale pointer and show an honest ACTIVE state.
const stripeSubIsLive = before.stripeSubscriptionId && !["EXPIRED", "CANCELED"].includes(before.status);
if (stripeSubIsLive) {
  console.log("! Account has a LIVE Stripe subscription - leaving its status/plan fields alone.");
} else {
  patch.status = "ACTIVE";
  patch.stripeSubscriptionId = null;
}

await ref.set(patch, { merge: true });
const after = (await ref.get()).data();
console.log(`After:  status=${after.status ?? "-"} comp=${after.comp} reason="${after.compReason}"`);
console.log(`✓ Comp access GRANTED. Revoke with: --revoke`);
process.exit(0);
