// Dev helper: point a few Kihívások day videos at the existing Mux test asset so
// the whole flow (archive → playlist → vertical player → completion → next day)
// is testable in the emulator without filming. Reuses the one real signed asset
// in the cloud — no new asset created. The test clip is landscape; the vertical
// player crops it (object-fit: cover), which is fine for exercising the flow.
//
// Run: npm run attach:challenge:local   (emulator must be running + seeded)
//   ( = FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node --env-file=.env.local
//       scripts/attach-emulator-challenge-video.mjs )
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const PLAYBACK = process.env.MUX_TEST_PLAYBACK || "Jesvqhi026cuUAacaHaElapfXVJ2RzuO6NRrzXTXtqqI";
// Attach every day of these challenges so a full playlist completes end-to-end.
// Override with CH_SLUGS="a,b" to target different ones.
const SLUGS = (process.env.CH_SLUGS || "5-napos-tartas-kihivas,7-napos-has-kihivas").split(",").map((s) => s.trim()).filter(Boolean);

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

let attached = 0;
for (const slug of SLUGS) {
  const daysSnap = await db.collection("challenges").doc(slug).collection("days").get();
  if (daysSnap.empty) {
    console.warn(`⚠ challenge "${slug}" has no days — seed first (npm run seed:challenges:local).`);
    continue;
  }
  const codes = daysSnap.docs.map((d) => d.data().videoCode).filter(Boolean);
  await Promise.all(
    codes.map((code) =>
      db.collection("challengeVideos").doc(code).set(
        {
          muxPlaybackId: PLAYBACK,
          muxStatus: "ready",
          muxDuration: 24,
          published: true,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
    ),
  );
  attached += codes.length;
  console.log(`  ${slug}: attached ${codes.length} day videos`);
}
console.log(`✅ emulator test video attached to ${attached} challenge day video(s) across ${SLUGS.length} challenge(s).`);
process.exit(0);
