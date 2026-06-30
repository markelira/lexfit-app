import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { mux } from "@/lib/mux";
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

  const ref = (code: string) => adminDb.collection("videos").doc(code);

  if (event.type === "video.asset.ready") {
    const asset = event.data;
    const code = asset.passthrough;
    const playbackId = asset.playback_ids?.[0]?.id;
    if (code && playbackId) {
      await ref(code).set(
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
    const code = event.data.passthrough;
    if (code) {
      await ref(code).set({ muxStatus: "error", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
  }

  return new Response("ok", { status: 200 });
}
