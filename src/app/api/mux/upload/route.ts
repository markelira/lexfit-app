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

  await adminDb.collection("videos").doc(code).set(
    { muxUploadId: upload.id, muxStatus: "uploading", updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );

  return NextResponse.json({ url: upload.url, uploadId: upload.id });
}
