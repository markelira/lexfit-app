import "server-only";

/**
 * The cost side of the campaign, read from Meta (P1).
 *
 * Kept separate from `campaign-brief` on purpose: that module is pure and
 * testable, this one is the network edge. It is also entirely optional - the
 * brief was built to be useful without it and says so in every mail, so a
 * missing or revoked token degrades the report rather than breaking the job.
 *
 * Scope: a token with `ads_read` on one ad account. It can read numbers and
 * change nothing, which is the whole point - a monitoring job has no business
 * holding a credential that could edit or pause the campaign it watches.
 */

const API = "https://graph.facebook.com/v21.0";

export interface InsightDay {
  /** "2026-09-21" - Meta reports in the ad account's timezone. */
  date: string;
  spendHuf: number;
  impressions: number;
  clicks: number;
  /** Percent, as Meta reports it. */
  ctr: number;
  cpmHuf: number;
  frequency: number;
  /** Purchases Meta attributes to this campaign - NOT our own count. */
  purchases: number;
}

export interface Insights {
  ok: boolean;
  /** Why it is unavailable, when it is. Never contains the token. */
  reason?: string;
  days: InsightDay[];
  totalSpendHuf: number;
  totalPurchases: number;
}

const UNAVAILABLE = (reason: string): Insights => ({
  ok: false,
  reason,
  days: [],
  totalSpendHuf: 0,
  totalPurchases: 0,
});

/** Meta reports conversions as a list of {action_type, value}. A pixel
 *  purchase arrives under one of these two names depending on how the event
 *  was received; summing both would double-count the same sale, so the more
 *  specific one wins. */
function purchasesFrom(actions: unknown): number {
  if (!Array.isArray(actions)) return 0;
  const byType = new Map<string, number>();
  for (const a of actions) {
    const t = (a as { action_type?: string })?.action_type;
    const v = Number((a as { value?: string })?.value);
    if (typeof t === "string" && Number.isFinite(v)) byType.set(t, v);
  }
  return byType.get("offsite_conversion.fb_pixel_purchase") ?? byType.get("purchase") ?? 0;
}

/** YYYY-MM-DD in Budapest, which is the ad account's reporting timezone. */
function ymd(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

export async function fetchInsights(opts: {
  adAccountId: string;
  campaignId: string;
  sinceMs: number;
  untilMs: number;
}): Promise<Insights> {
  const token = process.env.META_ADS_TOKEN;
  if (!token) return UNAVAILABLE("no_token");

  const params = new URLSearchParams({
    level: "campaign",
    time_increment: "1",
    time_range: JSON.stringify({ since: ymd(opts.sinceMs), until: ymd(opts.untilMs) }),
    fields: "date_start,spend,impressions,clicks,ctr,cpm,frequency,actions",
    filtering: JSON.stringify([
      { field: "campaign.id", operator: "EQUAL", value: opts.campaignId },
    ]),
    access_token: token,
  });

  try {
    const res = await fetch(`${API}/act_${opts.adAccountId}/insights?${params}`, {
      // The cron has a 60s lambda and other work to do; a hung Graph call must
      // not eat the budget that the email send needs.
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });
    const body = (await res.json()) as {
      data?: unknown[];
      error?: { message?: string; code?: number };
    };

    if (!res.ok || body.error) {
      // The message can echo back request details, so report the code and a
      // short reason rather than pasting Meta's string into an email.
      const code = body.error?.code;
      const reason =
        code === 190 ? "token_invalid" : code === 200 ? "token_lacks_ads_read" : `http_${res.status}`;
      console.error("[meta-insights] failed:", code, body.error?.message);
      return UNAVAILABLE(reason);
    }

    const days: InsightDay[] = (body.data ?? []).map((r) => {
      const d = r as Record<string, unknown>;
      const num = (k: string) => {
        const n = Number(d[k]);
        return Number.isFinite(n) ? n : 0;
      };
      return {
        date: String(d.date_start ?? ""),
        spendHuf: num("spend"),
        impressions: num("impressions"),
        clicks: num("clicks"),
        ctr: num("ctr"),
        cpmHuf: num("cpm"),
        frequency: num("frequency"),
        purchases: purchasesFrom(d.actions),
      };
    });

    return {
      ok: true,
      days,
      totalSpendHuf: days.reduce((a, d) => a + d.spendHuf, 0),
      totalPurchases: days.reduce((a, d) => a + d.purchases, 0),
    };
  } catch (e) {
    console.error("[meta-insights] transport failure:", e);
    return UNAVAILABLE("unreachable");
  }
}
