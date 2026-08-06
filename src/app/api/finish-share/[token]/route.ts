import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public GET/POST (no auth) — the phone opened via the QR token; the token is the
// only credential and exposes non-PII workout stats + lets the phone report
// status. DELETE is authed (the desktop cleans up its own session).
// NOTE: a Firestore TTL policy on `expiresAt` is the durable backstop for
// abandoned sessions; delete-on-read + the desktop DELETE handle the rest.
const VALID_STATUS = new Set(["opened", "shared"]);

async function loadSession(token: string) {
  const ref = adminDb.doc(`shareSessions/${token}`);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const d = snap.data() as { expiresAt?: number };
  if (typeof d.expiresAt === "number" && Date.now() > d.expiresAt) {
    ref.delete().catch(() => {}); // clean up expired docs as they're touched
    return null;
  }
  return { ref, data: snap.data() as Record<string, unknown> };
}

/** GET — return the workout data for the phone to render; mark the session opened. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const s = await loadSession(token);
  if (!s) return NextResponse.json({ error: "expired" }, { status: 404 });
  if (s.data.status === "pending") await s.ref.update({ status: "opened" });
  return NextResponse.json({ data: s.data.data ?? {} });
}

/** POST — the phone reports progress ("opened" | "shared"). */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !VALID_STATUS.has(body.status)) {
    return NextResponse.json({ error: "bad status" }, { status: 400 });
  }
  const s = await loadSession(token);
  if (!s) return NextResponse.json({ error: "expired" }, { status: 404 });
  await s.ref.update({ status: body.status });
  return NextResponse.json({ ok: true });
}

/** DELETE — the desktop cleans up its own session (auth required; must own it). */
export async function DELETE(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const auth = await verifyRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { token } = await params;
  const ref = adminDb.doc(`shareSessions/${token}`);
  const snap = await ref.get();
  if (snap.exists && snap.data()?.uid === auth.uid) await ref.delete();
  return NextResponse.json({ ok: true });
}
