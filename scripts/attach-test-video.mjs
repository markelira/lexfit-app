// Attach a REAL Mux video to a workout doc so the player has content to play.
// Creates a signed-playback asset from a hosted sample, polls until ready, and
// writes the playback id onto videos/{code}.
//
// Usage: node --env-file=.env.local scripts/attach-test-video.mjs [CODE] [URL]
import "./require-emulator.mjs";
import Mux from "@mux/mux-node";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const CODE = process.argv[2] ?? "F023";
const URL =
  process.argv[3] ?? "https://storage.googleapis.com/muxdemofiles/mux-video-intro.mp4";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const ref = db.collection("videos").doc(CODE);
  if (!(await ref.get()).exists) throw new Error(`videos/${CODE} does not exist`);

  console.log(`Creating Mux asset for ${CODE} from sample…`);
  const asset = await mux.video.assets.create({
    inputs: [{ url: URL }],
    playback_policies: ["signed"],
    passthrough: CODE,
  });
  await ref.set(
    { muxAssetId: asset.id, muxStatus: "preparing", updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  console.log("  asset:", asset.id, "· waiting for ready…");

  let ready = null;
  for (let i = 0; i < 60; i++) {
    const a = await mux.video.assets.retrieve(asset.id);
    if (a.status === "ready") {
      ready = a;
      break;
    }
    if (a.status === "errored") throw new Error("Mux asset errored: " + JSON.stringify(a.errors));
    await sleep(3000);
  }
  if (!ready) throw new Error("Timed out waiting for asset to be ready");

  const playbackId = ready.playback_ids?.[0]?.id ?? null;
  await ref.set(
    {
      muxPlaybackId: playbackId,
      muxStatus: "ready",
      muxDuration: ready.duration ?? null,
      published: true,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log(`✅ ${CODE} ready · playbackId ${playbackId} · ${Math.round(ready.duration)}s · published`);
  process.exit(0);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
