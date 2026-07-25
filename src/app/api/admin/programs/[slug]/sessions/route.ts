import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Canonical workout-day pattern (rest days omitted — the app inserts those).
const DAY_PATTERN = [
  { day: "H", dayName: "Hétfő" },
  { day: "K", dayName: "Kedd" },
  { day: "Cs", dayName: "Csütörtök" },
  { day: "P", dayName: "Péntek" },
  { day: "Szo", dayName: "Szombat" },
  { day: "V", dayName: "Vasárnap" },
];

/** Which phase (index) covers a given 1-based week — parse each phase's weeks label, else distribute evenly. */
function phaseForWeek(week: number, phases: { weeks?: string }[], totalWeeks: number): number | null {
  for (let i = 0; i < phases.length; i++) {
    const nums = String(phases[i]?.weeks ?? "").match(/\d+/g)?.map(Number) ?? [];
    if (nums.length) {
      const lo = Math.min(...nums);
      const hi = Math.max(...nums);
      if (week >= lo && week <= hi) return i;
    }
  }
  if (phases.length && totalWeeks > 0) {
    const per = Math.ceil(totalWeeks / phases.length);
    return Math.min(phases.length - 1, Math.floor((week - 1) / per));
  }
  return null;
}

/**
 * Admin-only: replace a program's playlist (ordered video codes). Week/day/phase
 * are DERIVED from position + the program's config — the admin only orders videos.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { slug } = await params;
  const b = (await req.json().catch(() => ({}))) as { sessions?: unknown };
  const list = Array.isArray(b.sessions) ? (b.sessions as Record<string, unknown>[]) : [];
  const codes = list.map((s) => String(s.videoCode ?? "").trim()).filter(Boolean);

  const progRef = adminDb.collection("programs").doc(slug);
  const progSnap = await progRef.get();
  if (!progSnap.exists) return NextResponse.json({ error: "Ismeretlen program." }, { status: 404 });
  const prog = (progSnap.data() ?? {}) as { perWeek?: number | null; weeks?: number | null; phases?: { weeks?: string }[] };
  const perWeek = prog.perWeek && prog.perWeek > 0 ? prog.perWeek : 5;
  const phases = Array.isArray(prog.phases) ? prog.phases : [];
  const totalWeeks = prog.weeks ?? Math.ceil(codes.length / perWeek);

  const sessCol = progRef.collection("sessions");
  const existing = await sessCol.get();
  const batch = adminDb.batch();
  existing.forEach((d) => batch.delete(d.ref));
  codes.forEach((videoCode, i) => {
    const week = Math.floor(i / perWeek) + 1;
    const dp = DAY_PATTERN[i % perWeek % DAY_PATTERN.length];
    batch.set(sessCol.doc(String(i).padStart(2, "0")), {
      videoCode,
      order: i,
      week,
      day: dp.day,
      dayName: dp.dayName,
      phaseIdx: phaseForWeek(week, phases, totalWeeks),
      retest: null,
    });
  });
  batch.set(progRef, { totalSessions: codes.length, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await batch.commit();

  return NextResponse.json({ ok: true, count: codes.length });
}
