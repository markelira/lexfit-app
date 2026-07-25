import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth-server";
import { getEarnedOffer } from "@/lib/pricing/earning-server";
import { isOfferRedeemable } from "@/lib/pricing/earning";
import { logEvent } from "@/lib/pricing/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Grand Slam state for the UI. Returns `serverNow` so the countdown is computed
 * from SERVER time, never the client clock (the deadline's credibility is legal,
 * J4, not decorative). `redeemable` already reflects server-time expiry.
 */
export async function GET(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const offer = await getEarnedOffer(token.uid);
  const serverNow = Date.now();
  const redeemable = isOfferRedeemable(offer, serverNow);
  if (offer && redeemable) {
    await logEvent("grand_slam_viewed", { uid: token.uid });
  }

  return NextResponse.json({
    serverNow,
    redeemable,
    offer: offer
      ? { expiresAt: offer.expiresAt, redeemedAt: offer.redeemedAt, voidedAt: offer.voidedAt }
      : null,
  });
}
