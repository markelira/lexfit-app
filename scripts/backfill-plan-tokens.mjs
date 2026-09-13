// One-off backfill for the 2026-09-13 lead-conversion fixes
// (docs/lead-conversion-diagnosis.md P0-2/P0-3). For every lm_v2 lead:
//
//  1. `planToken` - existing leads predate the field; the D3/D6/D9 links and
//     the ?lt= handoff need it.
//  2. `paidAt` - the sequence's new stop key. Stamped for leads whose email
//     belongs to a user with a live (or ever-started) subscription, so D6
//     never pitches a membership to a paying member.
//  3. Re-arm the sequence for registered-but-unpaid leads: the old rule nulled
//     their schedule at registration; the new rule keeps mailing them until
//     they pay. Only within the 9-day window, only with marketing consent.
//
// Run (PROD - deliberate):  node --env-file=.env.local scripts/backfill-plan-tokens.mjs
// Dry run:                  node --env-file=.env.local scripts/backfill-plan-tokens.mjs --dry
import { randomBytes } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.error("FIRESTORE_EMULATOR_HOST is set — refusing (prod-only script).");
  process.exit(1);
}
const DRY = process.argv.includes("--dry");

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
const db = getFirestore();
const auth = getAuth();

const DAY = 24 * 3600_000;
const LM_STEPS = [3, 6, 9];
const now = Date.now();

/** Mirror of lmDueAt + the cron's catch-up semantics. */
function nextUnsentStep(lead) {
  const last = lead.lastEmailStep ?? 0;
  for (const s of LM_STEPS) {
    if (s <= last) continue;
    // Give up 3 days after the last step's due date - re-arming a weeks-old
    // lead would dump the whole sequence on them in one morning.
    if (now > lead.createdAt + (s + 3) * DAY) continue;
    return s;
  }
  return null;
}

async function subscriptionFor(email) {
  try {
    const user = await auth.getUserByEmail(email);
    const snap = await db.doc(`subscriptions/${user.uid}`).get();
    return snap.exists ? snap.data() : null;
  } catch {
    return null; // no account with this email
  }
}

const everPaid = (sub) =>
  !!sub &&
  (["ACTIVE", "PAUSED", "PAST_DUE"].includes(sub.status) ||
    (sub.accessUntil ?? 0) > now ||
    (sub.amountPaid ?? 0) > 0 ||
    !!sub.startedAt);

const snap = await db.collection("quizLeads").get();
const stats = { total: 0, tokened: 0, paidStamped: 0, rearmed: 0, untouched: 0 };

for (const doc of snap.docs) {
  const lead = doc.data();
  if (lead.variant !== "lm_v2") continue;
  stats.total++;
  const patch = {};

  if (!lead.planToken) {
    patch.planToken = randomBytes(16).toString("hex");
    stats.tokened++;
  }

  if (!lead.paidAt) {
    const sub = await subscriptionFor(lead.email);
    if (everPaid(sub)) {
      patch.paidAt = sub.startedAt ?? now;
      patch.nextEmailAt = null;
      patch.nextEmailStep = null;
      stats.paidStamped++;
    } else if (
      lead.convertedAt && // registered under the old rule…
      lead.nextEmailStep == null && // …and expelled from the sequence by it
      lead.consents?.marketing &&
      !lead.unsubscribedAt
    ) {
      const step = nextUnsentStep(lead);
      if (step) {
        patch.registeredAt = lead.registeredAt ?? lead.convertedAt;
        patch.nextEmailStep = step;
        patch.nextEmailAt = lead.createdAt + step * DAY;
        stats.rearmed++;
      }
    }
  }

  if (Object.keys(patch).length === 0) {
    stats.untouched++;
    continue;
  }
  console.log(`${DRY ? "[dry] " : ""}${doc.id.slice(0, 10)}…`, Object.keys(patch).join(", "));
  if (!DRY) await doc.ref.set(patch, { merge: true });
}

console.log(DRY ? "DRY RUN — nothing written." : "Done.", stats);
process.exit(0);
