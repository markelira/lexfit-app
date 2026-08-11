import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth-server";
import { allowedCheckinDays } from "@/lib/pricing/earning";
import { recordCheckin, maybeUnlockEarnedAnnual } from "@/lib/pricing/earning-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * F3.1 daily check-in. Works for EVERY signed-in user (community mechanic - not
 * gated on plan). `day` defaults to today; an explicit day is accepted only if
 * it is currently loggable (today, or yesterday before the 04:00 makeup cutoff).
 * After recording, the offer engine is nudged - but it self-guards on plan and
 * on prior-offer existence, so nothing unlocks for annual/one-off buyers.
 */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { day?: string };
  const allowed = allowedCheckinDays(Date.now());
  const day = body.day ?? allowed[0];
  if (!allowed.includes(day)) {
    return NextResponse.json({ error: "day_not_allowed" }, { status: 400 });
  }

  await recordCheckin(token.uid, day);
  const offer = await maybeUnlockEarnedAnnual(token.uid, { email: token.email });

  return NextResponse.json({ ok: true, day, earned: !!offer });
}
