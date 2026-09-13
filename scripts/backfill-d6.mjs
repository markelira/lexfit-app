// Sprint P0-3: the Sep 10-12 cohort never received a sales mail - stage the
// NEW D6 (OfferBox, guarantee subject) for every consented, non-paying lead
// of those days, all at once. Sets nextEmailStep=6 / nextEmailAt=06:45 UTC
// tomorrow; the 07:00 UTC quiz-leads cron (added for this) delivers the whole
// batch at ~09:00 Budapest. D9 then follows on the normal createdAt+9d anchor
// (Sep 19-21). Leads still owed a D3 skip it - the sprint's call: the selling
// mail outranks the belief mail for a cohort this old.
//
// Run:      node --env-file=.env.local scripts/backfill-d6.mjs
// Dry run:  node --env-file=.env.local scripts/backfill-d6.mjs --dry
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (process.env.FIRESTORE_EMULATOR_HOST) { console.error("emulator set — abort"); process.exit(1); }
const DRY = process.argv.includes("--dry");
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!getApps().length) {
  initializeApp({ credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  })});
}
const db = getFirestore();

const FROM = new Date("2026-09-10T00:00:00Z").getTime();
const TO = new Date("2026-09-13T00:00:00Z").getTime();
const DUE = new Date("2026-09-14T06:45:00Z").getTime(); // 08:45 Budapest → 07:00 UTC cron delivers ~09:00

const snap = await db.collection("quizLeads").where("variant", "==", "lm_v2").get();
const stats = { cohort: 0, staged: 0, skipped: 0 };
for (const doc of snap.docs) {
  const l = doc.data();
  if (l.createdAt < FROM || l.createdAt >= TO) continue;
  stats.cohort++;
  const skip =
    !l.consents?.marketing ? "no-consent" :
    l.unsubscribedAt ? "unsubscribed" :
    l.paidAt ? "paid" :
    l.lastEmailStep >= 6 ? "already-got-d6" : null;
  if (skip) { stats.skipped++; console.log(`skip ${doc.id.slice(0, 8)}… (${skip})`); continue; }
  console.log(`${DRY ? "[dry] " : ""}stage D6 → ${doc.id.slice(0, 8)}… (created ${new Date(l.createdAt).toISOString().slice(0, 10)}, lastStep ${l.lastEmailStep ?? "-"})`);
  if (!DRY) await doc.ref.set({ nextEmailStep: 6, nextEmailAt: DUE }, { merge: true });
  stats.staged++;
}
console.log(DRY ? "DRY RUN." : "Staged.", stats, "| delivery: 07:00 UTC cron (≈09:00 Budapest)");
process.exit(0);
