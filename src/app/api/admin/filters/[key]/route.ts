import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: replace a filter dimension's options (and optionally its label). */
export async function PUT(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { key } = await params;
  const body = (await req.json().catch(() => ({}))) as { options?: unknown; label?: unknown };

  const options = Array.isArray(body.options)
    ? [...new Set(body.options.map((o) => String(o).trim()).filter(Boolean))]
    : null;
  if (!options || options.length === 0) {
    return NextResponse.json({ error: "Legalább egy értéket meg kell adni." }, { status: 400 });
  }

  const snap = await adminDb.collection("filters").doc(key).get();
  if (!snap.exists) {
    return NextResponse.json({ error: `Ismeretlen szűrő: ${key}` }, { status: 404 });
  }

  const patch: Record<string, unknown> = { options, updatedAt: FieldValue.serverTimestamp() };
  if (typeof body.label === "string" && body.label.trim()) patch.label = body.label.trim();

  await adminDb.collection("filters").doc(key).set(patch, { merge: true });
  return NextResponse.json({ ok: true, key, options });
}
