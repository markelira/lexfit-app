import "server-only";
import { createHash } from "node:crypto";
import * as Sentry from "@sentry/nextjs";

// TikTok Events API - server-side purchase reporting.
//
// The mirror of meta-capi.ts, and it exists for the same reason: after the
// embedded Stripe Checkout the tab may be closed, the connection may drop, and
// ad blockers stop the pixel outright. The Stripe webhook is the only place
// that knows for certain that money arrived.
//
// DEDUPLICATION. Unlike the browser events (InitiateCheckout, SubmitForm,
// CompleteRegistration), CompletePayment is reported from exactly ONE source -
// there is no TikTok pixel purchase event to collide with. `event_id` is still
// sent, because a Stripe webhook retry would otherwise double-count.
//
// CONSENT. Reporting a purchase is advertising measurement, not performance of
// the contract, so it requires the buyer's consent. The webhook cannot see the
// cookie banner, so the browser records the decision on the Checkout session
// metadata (`adConsent`) and the caller checks it before reaching this module -
// the same gate meta-capi.ts sits behind.
//
// Inert until TIKTOK_PIXEL_ID and TIKTOK_CAPI_TOKEN are set: unset env means
// the feature is off, never a crash.

const PIXEL_ID = process.env.TIKTOK_PIXEL_ID;
const TOKEN = process.env.TIKTOK_CAPI_TOKEN;
const API = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

// TESTING ONLY. TikTok's "Test events" tab shows a server event only when the
// payload carries a test_event_code. Set TIKTOK_CAPI_TEST_CODE while wiring up,
// then REMOVE it - test-coded events do not count towards ad optimisation.
const TEST_CODE = process.env.TIKTOK_CAPI_TEST_CODE;

/** TikTok requires SHA-256 of the normalised (trimmed, lower-cased) value. */
function hash(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

// Every exit emits exactly one greppable line, because "no Sentry error" does
// NOT mean "reported" - two of the exits below are deliberate silent skips.
// Search Vercel logs for `[tiktok-capi]`. NEVER put PII here.
function log(outcome: string, detail: Record<string, unknown>): void {
  console.log(`[tiktok-capi] ${outcome}`, JSON.stringify(detail));
}

export interface TikTokPurchaseInput {
  /** Stripe invoice or payment-intent id. TikTok dedupes on it, so a webhook
   *  retry cannot double-count. */
  eventId: string;
  /** Unix seconds when the payment happened (not when we send it). */
  eventTime: number;
  valueHuf: number;
  email?: string | null;
  /** The pricing role bought (week_intro, month_std, …) - catalogue data, and
   *  what makes TikTok's reporting break down by package. */
  contentId?: string | null;
  /** TikTok's own click id, forwarded from the browser via Stripe metadata. */
  ttclid?: string | null;
  /** TikTok's first-party cookie (`_ttp`), same path. */
  ttp?: string | null;
  /** Where the purchase completed - TikTok wants a page URL on every event. */
  pageUrl?: string | null;
}

/**
 * Report a purchase. Best-effort: never throws, so a TikTok outage can never
 * fail a Stripe webhook (which would make Stripe retry the whole delivery).
 * Returns true when TikTok accepted the event.
 */
export async function sendTikTokPurchase(p: TikTokPurchaseInput): Promise<boolean> {
  if (!PIXEL_ID || !TOKEN) {
    log("skipped: env missing", {
      eventId: p.eventId,
      hasPixelId: !!PIXEL_ID,
      hasToken: !!TOKEN,
    });
    return false;
  }

  // At least one identifier is required, else TikTok cannot match the event.
  const user: Record<string, unknown> = {};
  if (p.email) user.email = hash(p.email);
  if (p.ttclid) user.ttclid = p.ttclid;
  if (p.ttp) user.ttp = p.ttp;
  if (Object.keys(user).length === 0) {
    log("skipped: no identifiers", {
      eventId: p.eventId,
      hasEmail: !!p.email,
      hasTtclid: !!p.ttclid,
      hasTtp: !!p.ttp,
    });
    return false;
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";

  try {
    const res = await fetch(API, {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: { "Content-Type": "application/json", "Access-Token": TOKEN },
      body: JSON.stringify({
        event_source: "web",
        event_source_id: PIXEL_ID,
        ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
        data: [
          {
            event: "CompletePayment",
            event_time: p.eventTime,
            event_id: p.eventId,
            user,
            page: { url: p.pageUrl ?? `${base}/app` },
            properties: {
              currency: "HUF",
              value: p.valueHuf,
              // Mirrors what the browser InitiateCheckout sends, so the funnel
              // reads consistently on TikTok's side.
              ...(p.contentId
                ? {
                    content_type: "product",
                    content_id: p.contentId,
                    contents: [
                      {
                        content_id: p.contentId,
                        content_type: "product",
                        quantity: 1,
                        price: p.valueHuf,
                      },
                    ],
                  }
                : {}),
            },
          },
        ],
      }),
    });

    const body = (await res.json().catch(() => null)) as
      | { code?: number; message?: string }
      | null;

    // TikTok answers HTTP 200 even for rejected payloads; `code` is the real
    // verdict, and 0 means accepted. Reading only the status would report
    // success on every validation error.
    if (!res.ok || (body?.code ?? -1) !== 0) {
      throw new Error(
        `TikTok Events API ${res.status} code=${body?.code ?? "?"}: ${String(body?.message ?? "").slice(0, 200)}`,
      );
    }

    log("sent", {
      eventId: p.eventId,
      valueHuf: p.valueHuf,
      // If this is ever true in production, TIKTOK_CAPI_TEST_CODE was left set
      // and the events are not counting towards optimisation.
      testMode: !!TEST_CODE,
    });
    return true;
  } catch (e) {
    console.error("[tiktok-capi] purchase report failed", e);
    Sentry.captureException(e, { tags: { integration: "tiktok-capi" } });
    return false;
  }
}
