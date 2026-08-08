import "server-only";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest } from "@/lib/auth-server";
import { allowRequest, DAY_MS_RL } from "@/lib/rate-limit";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL_MS = 15 * 60 * 1000;

// Whitelist the workout stats we forward to the phone (no PII, no free-form data).
function sanitize(d: unknown): Record<string, unknown> {
  const o = (d ?? {}) as Record<string, unknown>;
  const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : undefined);
  const str = (v: unknown) => (typeof v === "string" && v.length <= 60 ? v : undefined);
  const out: Record<string, unknown> = {
    mins: num(o.mins) ?? 0,
    streak: num(o.streak) ?? 0,
  };
  const reps = num(o.reps); if (reps != null) out.reps = reps;
  const exercises = num(o.exercises); if (exercises != null) out.exercises = exercises;
  const workoutNo = num(o.workoutNo); if (workoutNo != null) out.workoutNo = workoutNo;
  const week = num(o.week); if (week != null) out.week = week;
  const theme = str(o.theme); if (theme) out.theme = theme;
  const title = str(o.title); if (title) out.title = title;
  const milestone = str(o.milestone); if (milestone) out.milestone = milestone;
  return out;
}

/** Create a desktop→phone handoff session. Authed; returns a one-time token. */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Unbounded doc creation otherwise (TTL only cleans up later) — cap per uid.
  if (!(await allowRequest("finishShare", token.uid, 30, DAY_MS_RL))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as { data?: unknown };
  const id = randomBytes(18).toString("base64url");

  await adminDb.doc(`shareSessions/${id}`).set({
    uid: token.uid,
    data: sanitize(body.data),
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Date.now() + TTL_MS,
  });

  return NextResponse.json({ token: id });
}
