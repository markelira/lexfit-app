// Dev helper: point the emulator's F023 at the existing Mux test asset (reuses
// the real signed asset in the cloud — no new asset created). Runs under
// `firebase emulators:exec`, which sets FIRESTORE_EMULATOR_HOST so the Admin SDK
// writes to the emulator, not production.
import "./require-emulator.mjs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const PLAYBACK = process.env.MUX_TEST_PLAYBACK || "Jesvqhi026cuUAacaHaElapfXVJ2RzuO6NRrzXTXtqqI";
// Attach the (single real) test asset to a few codes so the home + player are
// testable in dev without filming. F001 = week-1 first card, F018 = "today", F023.
const CODES = ["F001", "F002", "F018", "F023"];

const pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n");
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: pk,
    }),
  });
}
const db = getFirestore();

for (const code of CODES) {
  await db.collection("videos").doc(code).set(
    {
      muxPlaybackId: PLAYBACK,
      muxStatus: "ready",
      muxDuration: 24,
      published: true,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
console.log("✅ emulator test video attached to", CODES.join(", "));
process.exit(0);
