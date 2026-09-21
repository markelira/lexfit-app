import "server-only";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { adminDb } from "@/lib/firebase-admin";
import { sendStartC1, sendStartC2, sendStartC3, sendStartC4 } from "@/lib/mailer";
import {
  CAMPAIGN_START_MS,
  ctaHref,
  dueStep,
  segmentOf,
  stopFor,
  type CampaignLead,
  type Step,
} from "@/lib/start-campaign/sequence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * The Lexfit Start campaign's daily send (2026-09).
 *
 * One run a day, at 17:30 Budapest. It works out which step is due from the
 * calendar rather than from per-lead scheduling state, so there is nothing to
 * seed and nothing to drift: `dueStep` answers "which mail should everyone
 * have by now", and `startCampaignStep` on each lead records what they have
 * actually received.
 *
 * That pairing is what makes it idempotent. Running the cron twice in a day
 * re-computes the same due step, finds `startCampaignStep` already at or above
 * it, and sends nothing. A lead who joins the campaign late catches up one mail
 * per day instead of receiving four at once.
 *
 * A transport failure does NOT advance the step, so tomorrow's run retries that
 * person rather than silently skipping their mail.
 *
 * `?dry=1` walks every lead and applies every gate but sends nothing. It exists
 * because the first real run mails 223 people at once, and "I think the consent
 * filter works" is not good enough for that.
 */

// Above the whole collection (456 docs at launch): a limit BELOW the list
// size would silently drop the tail, which is the worst kind of send bug
// because everything reports success.
const BATCH = 2000;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const openUpTo = dueStep(now);
  const dry = new URL(req.url).searchParams.get("dry") === "1";
  if (openUpTo == null) {
    return NextResponse.json({ ok: true, sent: 0, reason: "not_started", startsAt: CAMPAIGN_START_MS });
  }

  const stats = { candidates: 0, sent: 0, failed: 0, skipped: {} as Record<string, number> };
  const skip = (k: string) => { stats.skipped[k] = (stats.skipped[k] ?? 0) + 1; };

  try {
    const snap = await adminDb.collection("quizLeads").limit(BATCH).get();

    for (const doc of snap.docs) {
      const lead = doc.data() as CampaignLead;
      stats.candidates++;

      // The NEXT mail this lead owes, never a jump. If a run times out half
      // way, tomorrow resumes where they actually are instead of skipping a
      // mail nobody notices was missing.
      const step = Math.min((lead.startCampaignStep ?? 0) + 1, openUpTo) as Step;

      const stop = stopFor(lead, step, now);
      if (stop) { skip(stop); continue; }
      if (dry) { stats.sent++; continue; }

      const href = ctaHref(APP_URL, step);
      const to = lead.email as string;
      let ok = false;
      switch (step) {
        case 1: ok = (await sendStartC1(to, doc.id, { ctaHref: href })).sent; break;
        case 2: ok = (await sendStartC2(to, doc.id, { ctaHref: href })).sent; break;
        case 3: {
          // Their own quiz answer, not a guess about them.
          const seg = segmentOf((lead as { computed?: { segment?: string } }).computed?.segment);
          ok = (await sendStartC3(to, doc.id, { ctaHref: href, segment: seg })).sent;
          break;
        }
        case 4: ok = (await sendStartC4(to, doc.id, { ctaHref: href })).sent; break;
      }

      if (!ok) { stats.failed++; continue; }
      // Written only after a successful send - this is the idempotency record.
      await doc.ref.set({ startCampaignStep: step, startCampaignAt: now }, { merge: true });
      stats.sent++;
    }

    // Deliberately NOT written to the `events` collection: those rows feed the
    // campaign brief's purchase funnel, and a run marker in there would inflate
    // "checkout starts" with sends. A log line is the right weight for this.
    console.log("[start-campaign]", JSON.stringify({ dry, openUpTo, ...stats }));

    return NextResponse.json({ ok: true, dry, openUpTo, ...stats });
  } catch (e) {
    console.error("[start-campaign] failed:", e);
    Sentry.captureException(e, { tags: { cron: "start-campaign" } });
    return NextResponse.json({ error: "failed", ...stats }, { status: 500 });
  }
}
