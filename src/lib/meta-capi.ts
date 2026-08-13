import "server-only";
import { createHash } from "node:crypto";
import * as Sentry from "@sentry/nextjs";

// Meta Conversions API - server-side purchase reporting.
//
// WHY SERVER-SIDE, AND ONLY SERVER-SIDE:
// the browser cannot be trusted to report a purchase. After the embedded Stripe
// Checkout the tab may be closed, the connection may drop, and ad blockers stop
// the Pixel outright. The Stripe webhook is the only place that knows for
// certain that money arrived. Because the purchase is reported from exactly ONE
// source, no event_id deduplication against a browser event is needed - there is
// no browser Purchase event to collide with.
//
// CONSENT (the important part):
// reporting a purchase to Meta is advertising measurement, not performance of
// the contract, so it requires the buyer's consent. The webhook cannot see the
// cookie banner decision, so the browser records it on the Checkout session
// metadata (`adConsent`) at session creation. `sendPurchase` refuses anything
// that is not an explicit "granted" - see the guard in the caller.
//
// Inert until META_PIXEL_ID and META_CAPI_TOKEN are set, exactly like the rest
// of the measurement stack: unset env = feature off, never a crash.

const PIXEL_ID = process.env.META_PIXEL_ID;
const TOKEN = process.env.META_CAPI_TOKEN;
const API_VERSION = "v21.0";

// TESTING ONLY. Meta's "Test events" tab shows a SERVER event only if the
// payload carries a test_event_code - without one the event is real, but it
// surfaces in Overview ~20 minutes later, which is useless while wiring things
// up. Set META_CAPI_TEST_CODE to the code shown on that tab to watch purchases
// land in real time, then REMOVE it: events sent with a test code are flagged
// as test traffic and do not count towards ad optimisation.
const TEST_CODE = process.env.META_CAPI_TEST_CODE;

/** Meta requires SHA-256 of the normalised (trimmed, lower-cased) value. */
function hash(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

// Every exit from this module emits exactly one greppable line, because
// "no Sentry error" does NOT mean "reported": three of the exits below are
// deliberate silent skips, and without this you cannot tell success from skip
// while debugging a live funnel. Search Vercel logs for `[meta-capi]`.
//
// NEVER put PII here - only whether a field was present, never its value.
function log(outcome: string, detail: Record<string, unknown>): void {
  console.log(`[meta-capi] ${outcome}`, JSON.stringify(detail));
}

export interface PurchaseInput {
  /** Stable id for this purchase (Stripe invoice or payment-intent id). Meta
   *  dedupes on it, so a Stripe webhook retry cannot double-count. */
  eventId: string;
  /** Unix seconds when the payment happened (not when we send it). */
  eventTime: number;
  valueHuf: number;
  email?: string | null;
  /** Meta's first-party cookies, forwarded from the browser via Stripe metadata. */
  fbp?: string | null;
  fbc?: string | null;
}

/**
 * Report a purchase. Best-effort: never throws, so a Meta outage can never fail
 * a Stripe webhook (which would make Stripe retry the whole delivery).
 * Returns true when Meta accepted the event.
 */
export async function sendPurchase(p: PurchaseInput): Promise<boolean> {
  if (!PIXEL_ID || !TOKEN) {
    log("skipped: env missing", {
      eventId: p.eventId,
      hasPixelId: !!PIXEL_ID,
      hasToken: !!TOKEN,
    });
    return false;
  }

  // At least one identifier is required, else Meta cannot match the event.
  const user_data: Record<string, unknown> = {};
  if (p.email) user_data.em = [hash(p.email)];
  if (p.fbp) user_data.fbp = p.fbp;
  if (p.fbc) user_data.fbc = p.fbc;
  if (Object.keys(user_data).length === 0) {
    log("skipped: no identifiers", {
      eventId: p.eventId,
      hasEmail: !!p.email,
      hasFbp: !!p.fbp,
      hasFbc: !!p.fbc,
    });
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`,
      {
        method: "POST",
        signal: AbortSignal.timeout(8000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: TOKEN,
          ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
          data: [
            {
              event_name: "Purchase",
              event_time: p.eventTime,
              event_id: p.eventId,
              action_source: "website",
              event_source_url: process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu",
              user_data,
              custom_data: { currency: "HUF", value: p.valueHuf },
            },
          ],
        }),
      },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Meta CAPI ${res.status}: ${detail.slice(0, 300)}`);
    }
    // Meta answers 200 with {"events_received":N,...}. A 200 with N=0 means it
    // accepted the request but dropped the event - which looks identical to
    // success unless we read the body, so read it.
    const body = (await res.json().catch(() => null)) as { events_received?: number } | null;
    log("sent", {
      eventId: p.eventId,
      valueHuf: p.valueHuf,
      eventsReceived: body?.events_received ?? "unknown",
      // A test-coded event does NOT count towards ad optimisation. If this is
      // ever true in production, META_CAPI_TEST_CODE was left set.
      testMode: !!TEST_CODE,
    });
    return true;
  } catch (e) {
    console.error("[meta-capi] purchase report failed", e);
    Sentry.captureException(e, { tags: { integration: "meta-capi" } });
    return false;
  }
}
