// ONE-OFF PRODUCTION WIPE — pre-launch clean slate (2026-08-09).
// Deletes EVERY Firestore collection, all Auth users except the admin, and all
// Storage user files. IRREVERSIBLE. Requires an explicit flag to run.
//
//   node --env-file=.env.local scripts/wipe-prod-oneoff.mjs --yes-delete-prod
//
// Keeps only: gorgeimarko@gmail.com auth login (the /admin allowlist account).
// Delete this file after running it.
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

if (!process.argv.includes("--yes-delete-prod")) {
  console.error("Refusing to run without --yes-delete-prod. This IRREVERSIBLY wipes production.");
  process.exit(1);
}

const KEEP_UID = "eTpetwHhUdSrczBFUSWThj3Eohh1"; // gorgeimarko@gmail.com (admin)

const pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n");
if (!getApps().length) initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: pk,
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});
const db = getFirestore();

console.log("PROJECT:", process.env.FIREBASE_ADMIN_PROJECT_ID);

console.log("\n=== FIRESTORE: recursive-delete every collection ===");
const cols = await db.listCollections();
for (const c of cols) {
  const before = (await c.get()).size;
  await db.recursiveDelete(c);
  console.log(`  ${c.id}: deleted ${before} doc(s) (+ subcollections)`);
}
const after = await db.listCollections();
console.log("  remaining top-level collections:", after.length ? after.map((c) => c.id).join(", ") : "(none — empty)");

console.log("\n=== AUTH: delete all users except the admin ===");
const list = await getAuth().listUsers(1000);
const toDelete = list.users.filter((u) => u.uid !== KEEP_UID).map((u) => u.uid);
const kept = list.users.filter((u) => u.uid === KEEP_UID);
if (toDelete.length) {
  const res = await getAuth().deleteUsers(toDelete);
  console.log(`  deleted ${res.successCount} user(s), failed ${res.failureCount}`);
  res.errors.forEach((e) => console.log("   fail:", e.index, e.error.message));
}
console.log("  KEPT:", kept.map((u) => `${u.email} (${u.uid})`).join(", ") || "(NONE — check KEEP_UID!)");

console.log("\n=== STORAGE: delete user files (progress photos/avatars) ===");
try {
  const bucket = getStorage().bucket();
  const [files] = await bucket.getFiles({ prefix: "users/" });
  if (files.length) await Promise.all(files.map((f) => f.delete()));
  console.log(`  deleted ${files.length} storage object(s) under users/`);
} catch (e) {
  console.log("  storage cleanup skipped:", e.message);
}

console.log("\n✅ Wipe complete. Delete this script now.");
process.exit(0);
