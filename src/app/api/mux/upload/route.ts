import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { createDirectUpload } from "@/lib/mux";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: create a direct browser upload bound to a workout code. */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { code } = (await req.json()) as { code?: string };
  if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });

  const origin = req.headers.get("origin") ?? "*";
  const upload = await createDirectUpload(code, origin);

  const ref = adminDb.collection("videos").doc(code);
  const snap = await ref.get();
  // If uploading before the metadata form was saved, seed a complete draft so we
  // never persist a fields-less video doc.
  const base = snap.exists
    ? {}
    : {
        code,
        kind: "workout",
        series: null,
        title: code,
        theme: "",
        level: 1,
        format: "",
        types: [],
        blocks: [],
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
