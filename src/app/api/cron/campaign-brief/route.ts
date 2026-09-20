import "server-only";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { sendEmail } from "@/lib/email";
import { collectBrief, renderBrief, CAMPAIGN } from "@/lib/campaign-brief";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * The September campaign's two scheduled reads (P1). One route, two modes,
 * because they share every line of the analysis and differ only in when they
 * are allowed to stay quiet:
 *
 *  · `watch` (every 12h) mails ONLY when something is broken. A watchdog that
 *    reports "all fine" twice a day teaches its reader to archive it unread,
 *    and then it is useless on the morning it matters.
 *
 *  · `brief` (20:00 Budapest) always mails - it is the standing report, and a
 *    missing evening mail should itself read as a signal that something is
 *    wrong with the job.
 *
 * Both are silent outside the campaign window, except for the configuration
 * alert: a pixel that is not reporting is worth knowing about BEFORE the money
 * starts moving, not on day two.
 */

const OWNER = "gorgeimarko@gmail.com";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const mode = new URL(req.url).searchParams.get("mode") === "brief" ? "brief" : "watch";
  const now = Date.now();

  try {
    const brief = await collectBrief(now);

    // Nothing to say, and this mode is allowed to say nothing.
    const quiet = mode === "watch" && brief.alerts.length === 0;
    // Before the campaign opens only the config alert is worth a mail; daily
    // numbers on a campaign that has not started are noise.
    const tooEarly = mode === "brief" && !brief.live && brief.alerts.length === 0;

    if (quiet || tooEarly) {
      return NextResponse.json({
        ok: true,
        mode,
        sent: false,
        reason: quiet ? "no_alerts" : "not_live",
        purchases: brief.total.purchases,
        // Booleans only, never values. `vercel env pull` returns an empty
        // string for env vars marked sensitive, so reading the config from
        // outside cannot tell "unset" from "write-only" - the runtime can.
        config: brief.config,
      });
    }

    const { subject, text } = renderBrief(brief);
    const { sent } = await sendEmail({
      to: OWNER,
      subject: mode === "watch" ? subject.replace("kampány -", "kampány (figyelő) -") : subject,
      text,
      categories: ["recap"],
    });

    // A critical alert is worth a Sentry issue too - email can be delayed,
    // filtered or simply not opened, and this one costs 100 000 Ft if missed.
    for (const a of brief.alerts) {
      if (a.severity === "critical") {
        Sentry.captureMessage(`[campaign] ${a.key}: ${a.what}`, "error");
      }
    }

    return NextResponse.json({
      ok: true,
      mode,
      sent,
      campaign: CAMPAIGN.name,
      day: brief.dayIndex,
      purchases: brief.total.purchases,
      alerts: brief.alerts.map((a) => a.key),
    });
  } catch (e) {
    console.error("[campaign-brief] failed:", e);
    Sentry.captureException(e, { tags: { cron: "campaign-brief" } });
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
