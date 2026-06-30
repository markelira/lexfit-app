// One-off connectivity check: writes, reads back, and deletes a Firestore doc
// using the Admin SDK credentials from .env.local.
// Run: node --env-file=.env.local scripts/firebase-healthcheck.mjs
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
const ref = db.collection("_healthcheck").doc("ping");

await ref.set({ ok: true, at: new Date().toISOString() });
const snap = await ref.get();
console.log("✅ Wrote + read back:", JSON.stringify(snap.data()));
await ref.delete();
console.log("✅ Cleaned up. Firestore read/write/delete all working.");
process.exit(0);
