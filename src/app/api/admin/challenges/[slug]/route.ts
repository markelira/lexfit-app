import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCESS = new Set(["members", "free"]);
const STATUSES = new Set(["draft", "published", "soon", "archived"]);
const str = (v: unknown) => String(v ?? "").trim();
const numOrNull = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Admin-only: create/update a challenge's metadata. durationDays/totalDays are
 *  managed by the days route (a challenge's length IS its linked-day count). */
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { slug } = await params;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!str(b.title)) return NextResponse.json({ error: "A cím kötelező." }, { status: 400 });

  const ref = adminDb.collection("challenges").doc(slug);
  const snap = await ref.get();
  if (b.create && snap.exists) {
    return NextResponse.json({ error: `A(z) "${slug}" kihívás már létezik.` }, { status: 409 });
  }

  const patch: Record<string, unknown> = {
    title: str(b.title),
    series: str(b.series) || "Szavazz Magadra",
    monthLabel: str(b.monthLabel),
    sortDate: str(b.sortDate),
    synopsis: str(b.synopsis),
    bodyPart: str(b.bodyPart),
    equipment: str(b.equipment) || null,
    perDayMinsLabel: str(b.perDayMinsLabel) || null,
    participantCount: numOrNull(b.participantCount),
    fbPostUrl: str(b.fbPostUrl) || null,
    featured: b.featured === true || b.featured === "true",
    featuredLabel: str(b.featuredLabel) || null,
    cover: str(b.cover) || null,
    access: ACCESS.has(String(b.access)) ? b.access : "members",
    status: STATUSES.has(String(b.status)) ? b.status : "draft",
    order: numOrNull(b.order) ?? 0,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Length is derived from the day list; seed to 0 until days are linked.
  if (!snap.exists) {
    Object.assign(patch, { slug, durationDays: 0, totalDays: 0, createdAt: FieldValue.serverTimestamp() });
  }

  await ref.set(patch, { merge: true });
  return NextResponse.json({ ok: true, slug });
}

/** Admin-only: delete a challenge and its days subcollection. */
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { slug } = await params;
  const ref = adminDb.collection("challenges").doc(slug);
  const days = await ref.collection("days").get();
  const batch = adminDb.batch();
  days.forEach((d) => batch.delete(d.ref));
  batch.delete(ref);
  await batch.commit();
  return NextResponse.json({ ok: true });
}
