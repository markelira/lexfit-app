import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { getUploadAsset } from "@/lib/mux";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: resolve an upload to its asset and store the playback id. */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { code, uploadId } = (await req.json()) as { code?: string; uploadId?: string };
  if (!code || !uploadId) {
    return NextResponse.json({ error: "missing code or uploadId" }, { status: 400 });
  }

  const state = await getUploadAsset(uploadId);
  if (state.status === "ready" && state.playbackId) {
    await adminDb.collection("videos").doc(code).set(
      {
        muxAssetId: state.assetId,
        muxPlaybackId: state.playbackId,
        muxStatus: "ready",
        muxDuration: state.duration ?? null,
        published: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  return NextResponse.json(state);
}
