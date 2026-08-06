import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { createDirectUpload, CHALLENGE_PASSTHROUGH_PREFIX } from "@/lib/mux";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: direct browser upload for a Kihívások day video (challengeVideos/). */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { code } = (await req.json()) as { code?: string };
  if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });

  const origin = req.headers.get("origin") ?? "*";
  // Namespaced passthrough so the shared webhook writes to challengeVideos/, not videos/.
  const upload = await createDirectUpload(code, origin, { passthrough: `${CHALLENGE_PASSTHROUGH_PREFIX}${code}` });

  const ref = adminDb.collection("challengeVideos").doc(code);
  const snap = await ref.get();
  // Seed a complete draft if uploading before the metadata form was saved.
  const base = snap.exists
    ? {}
    : {
        code,
        title: code,
        bodyPart: "",
        mins: 0,
        level: 1,
        blocks: [],
        orientation: "portrait",
        status: "draft",
        published: false,
        muxAssetId: null,
        muxPlaybackId: null,
        muxDuration: null,
        thumb: null,
        createdAt: FieldValue.serverTimestamp(),
      };
  await ref.set(
    { ...base, muxUploadId: upload.id, muxStatus: "uploading", updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );

  return NextResponse.json({ url: upload.url, uploadId: upload.id });
}
