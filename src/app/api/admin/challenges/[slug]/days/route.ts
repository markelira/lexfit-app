import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only: replace a challenge's day list (ordered challengeVideo codes). The
 * list is FLAT — day N is just position N (no weeks/phases). durationDays and
 * totalDays are both set to the day count so the card badge always matches the
 * actual list. Body shape matches SessionsBuilder: { sessions: [{ videoCode }] }.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { slug } = await params;
  const b = (await req.json().catch(() => ({}))) as { sessions?: unknown };
  const list = Array.isArray(b.sessions) ? (b.sessions as Record<string, unknown>[]) : [];
  const codes = list.map((s) => String(s.videoCode ?? "").trim()).filter(Boolean);

  const chRef = adminDb.collection("challenges").doc(slug);
  const chSnap = await chRef.get();
  if (!chSnap.exists) return NextResponse.json({ error: "Ismeretlen kihívás." }, { status: 404 });

  const daysCol = chRef.collection("days");
  const existing = await daysCol.get();
  const batch = adminDb.batch();
  existing.forEach((d) => batch.delete(d.ref));
  codes.forEach((videoCode, i) => {
    batch.set(daysCol.doc(String(i).padStart(2, "0")), {
      videoCode,
      order: i,
      dayTitle: null, // the day's label falls back to the video's own title
    });
  });
  batch.set(
    chRef,
    { durationDays: codes.length, totalDays: codes.length, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  await batch.commit();

  return NextResponse.json({ ok: true, count: codes.length });
}
