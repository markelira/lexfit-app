import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { mux, passthroughTarget } from "@/lib/mux";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mux webhook → write the playback id onto the workout when its asset is ready.
 * Used by the Phase 7 admin upload flow in production (dev attaches via script).
 * Register this URL in the Mux dashboard and set MUX_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret) return new Response("webhook not configured", { status: 500 });

  const body = await req.text();
  let event;
  try {
    event = await mux.webhooks.unwrap(body, req.headers, secret);
  } catch (e) {
    return new Response(`bad signature: ${e instanceof Error ? e.message : ""}`, { status: 400 });
  }

  // The passthrough tells us which collection to write (videos/ or challengeVideos/).
  const ref = (t: { collection: string; code: string }) => adminDb.collection(t.collection).doc(t.code);

  if (event.type === "video.asset.ready") {
    const asset = event.data;
    const target = passthroughTarget(asset.passthrough);
    const playbackId = asset.playback_ids?.[0]?.id;
    if (target && playbackId) {
      await ref(target).set(
        {
          muxAssetId: asset.id,
          muxPlaybackId: playbackId,
          muxStatus: "ready",
          muxDuration: asset.duration ?? null,
          published: true,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
  } else if (event.type === "video.asset.errored") {
    const target = passthroughTarget(event.data.passthrough);
    if (target) {
      await ref(target).set({ muxStatus: "error", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
  }

  return new Response("ok", { status: 200 });
}
