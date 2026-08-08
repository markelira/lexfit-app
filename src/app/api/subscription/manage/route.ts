import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth-server";
import {
  cancelAtPeriodEnd,
  downgradeToWeekly,
  pauseSubscription,
  setCancelReason,
  LifecycleError,
} from "@/lib/pricing/lifecycle";
import { PAUSE_MONTHS_ALLOWED, type PauseMonths } from "@/lib/pricing/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * F2.3 cancel-flow actions — the J3-compliant replacement for the Stripe
 * Customer Portal cancel. One endpoint, `action`-dispatched:
 *   pause     { months: 1|2|3 }  → pause billing + access, bank remaining time
 *   downgrade                    → monthly → weekly std at period end (no proration)
 *   cancel                       → cancel at period end; returns accessUntil
 *   reason    { reason }         → optional post-cancel reason (skippable)
 */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    months?: number;
    reason?: string;
  };

  console.log("[cxl] manage route", JSON.stringify({ marker: "cxl-v3", action: body.action, uid: token.uid }));
  try {
    switch (body.action) {
      case "pause": {
        const months = body.months as PauseMonths;
        if (!PAUSE_MONTHS_ALLOWED.includes(months)) {
          return NextResponse.json({ error: "invalid_months" }, { status: 400 });
        }
        await pauseSubscription(token.uid, months);
        return NextResponse.json({ ok: true });
      }
      case "downgrade": {
        const effectiveAt = await downgradeToWeekly(token.uid);
        return NextResponse.json({ ok: true, effectiveAt });
      }
      case "cancel": {
        const accessUntil = await cancelAtPeriodEnd(token.uid);
        return NextResponse.json({ ok: true, accessUntil });
      }
      case "reason": {
        if (body.reason) await setCancelReason(token.uid, body.reason);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "invalid_action" }, { status: 400 });
    }
  } catch (e) {
    if (e instanceof LifecycleError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    const x = e as { name?: string; type?: string; code?: string };
    console.error(
      "[cxl] manage route ERROR",
      JSON.stringify({ action: body.action, name: x?.name, type: x?.type, code: x?.code, message: e instanceof Error ? e.message : String(e) }),
    );
    return NextResponse.json(
      { error: `stripe_error: ${e instanceof Error ? e.message : ""}` },
      { status: 502 },
    );
  }
}
