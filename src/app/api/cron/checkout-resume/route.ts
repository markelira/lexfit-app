import "server-only";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getAuth } from "firebase-admin/auth";
import { adminApp, adminDb } from "@/lib/firebase-admin";
import { logEvent } from "@/lib/pricing/events";
import { sendCheckoutResume } from "@/lib/mailer";
import { leadId } from "@/lib/quiz/lead";
import { LM_VARIANT, type LmLeadDoc } from "@/lib/ujrakezdes/lead";
import { PRICES, type PriceRole } from "@/lib/pricing/config";
import { formatHuf } from "@/lib/pricing/display";
import { hasAccessFromData, type SubscriptionDoc } from "@/lib/pricing/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Sprint P1-1 · the 2-HOUR checkout recovery. The webhook's
 * checkout.session.expired mail lands ~24h after abandonment - an eternity
 * for a 490 Ft decision. This hourly job finds checkouts started 2-24 hours
 * ago with no completion and sends the short "Ott maradt félbe — segítsek?"
 * nudge; the webhook's 24h mail (with the full reassurance) remains the
 * second and last stage. One 2h mail per user per 72h window.
 *
 * The events collection is small (a few hundred docs); a single at>= query
 * with in-memory filtering avoids a composite index.
 */

const H = 3600_000;
const COOLDOWN_MS = 72 * H;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const stats = { candidates: 0, sent: 0, skipped: 0 };
  try {
    const snap = await adminDb.collection("events")
      .where("at", ">=", now - 24 * H)
      .get();
    const evs = snap.docs.map((d) => d.data() as { name: string; uid?: string; at: number; props?: { role?: string } });

    const completed = new Set(
      evs.filter((e) => e.name === "checkout_completed" && e.uid).map((e) => e.uid as string),
    );
    // Latest qualifying start per uid, 2h..24h old.
    const starts = new Map<string, { at: number; role: string }>();
    for (const e of evs) {
      if (e.name !== "checkout_started" || !e.uid) continue;
      if (e.at > now - 2 * H) continue; // still warm - give them the 2 hours
      const cur = starts.get(e.uid);
      if (!cur || e.at > cur.at) starts.set(e.uid, { at: e.at, role: e.props?.role ?? "week_intro" });
    }

    for (const [uid, start] of starts) {
      stats.candidates++;
      if (completed.has(uid)) { stats.skipped++; continue; }

      const subSnap = await adminDb.doc(`subscriptions/${uid}`).get();
      const sub = subSnap.data() as (SubscriptionDoc & { resume2hSentAt?: number }) | undefined;
      if (sub && hasAccessFromData(sub, now)) { stats.skipped++; continue; }
      if (sub?.resume2hSentAt && now - sub.resume2hSentAt < COOLDOWN_MS) { stats.skipped++; continue; }

      let email: string | null = null;
      try { email = (await getAuth(adminApp).getUser(uid)).email ?? null; } catch { /* gone */ }
      if (!email) { stats.skipped++; continue; }

      // Consent: account opt-in OR the quiz lead's marketing consent - same
      // posture as the webhook's 24h stage.
      const userDoc = (await adminDb.doc(`users/${uid}`).get()).data() as { marketingOptIn?: boolean } | undefined;
      let consented = userDoc?.marketingOptIn === true;
      let lt: string | null = null;
      const leadSnap = await adminDb.doc(`quizLeads/${leadId(email)}`).get();
      if (leadSnap.exists) {
        const lead = leadSnap.data() as LmLeadDoc;
        if (lead.variant === LM_VARIANT) {
          if (lead.consents?.marketing && !lead.unsubscribedAt) consented = true;
          lt = lead.planToken ?? null;
        }
      }
      if (!consented) { stats.skipped++; continue; }

      const role = (start.role in PRICES ? start.role : "week_intro") as PriceRole;
      const spec = PRICES[role];
      const introLine = role === "week_intro"
        ? `Az első heted ${formatHuf(PRICES.week_intro.amountHuf)}, utána ${formatHuf(PRICES.week_std.amountHuf)} hetente.`
        : role === "annual_std"
          ? `${formatHuf(spec.amountHuf)} egy évre.`
          : `${formatHuf(spec.amountHuf)} havonta.`;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";
      const ctaHref = `${appUrl}/register?q=plan&plan=${role}${lt ? `&lt=${lt}` : ""}`;

      const res = await sendCheckoutResume(email, {
        ctaHref, roleName: spec.nickname, introLine, stage: "2h",
      });
      if (res.sent) {
        await adminDb.doc(`subscriptions/${uid}`).set({ resume2hSentAt: now }, { merge: true });
        await logEvent("resume_email_sent", { uid, props: { role, stage: "2h" } });
        stats.sent++;
      }
    }
  } catch (e) {
    console.error("[checkout-resume] run failed", e);
    Sentry.captureException(e, { tags: { cron: "checkout-resume" } });
    return NextResponse.json({ ok: false, ...stats }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...stats });
}
