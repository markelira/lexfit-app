import "server-only";
import * as Sentry from "@sentry/nextjs";

// Transactional email - SendGrid v3 Mail Send API via fetch (no SDK dependency).
// Set SENDGRID_API_KEY and EMAIL_FROM (EMAIL_FROM must be a verified SendGrid
// sender, else sends 403). Without a key (local dev) sends are logged & skipped
// so flows still work without a provider.
//
// `categories` tag the send in SendGrid stats (auth/billing/habit/recap/
// marketing) so spam-complaint spikes are attributable per stream.
// `listUnsubscribeUrl` adds the RFC 8058 one-click headers - REQUIRED on every
// non-transactional send (Grtv. opt-out applies at any volume); never set it on
// transactional mail.

export interface EmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  categories?: string[];
  listUnsubscribeUrl?: string;
}

/** Transport-level failure (timeout, dropped connection): the POST may or may
 *  not have reached SendGrid, so the message MAY already be queued. Callers
 *  must NOT retry these - a retry can double-send. Definite rejections (an
 *  HTTP error status came back) throw a plain Error and are safe to retry. */
export class EmailTransportError extends Error {
  constructor(cause: unknown) {
    super(`SendGrid transport failure: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = "EmailTransportError";
  }
}

export async function sendEmail(msg: EmailInput): Promise<{ sent: boolean }> {
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    // In production a missing key means user-facing emails silently vanish -
    // shout so it's visible in logs AND Sentry, don't whisper.
    if (process.env.NODE_ENV === "production") {
      console.error(`[email] SKIPPED - SENDGRID_API_KEY/EMAIL_FROM not configured → ${msg.to}: ${msg.subject}`);
      Sentry.captureMessage("sendEmail skipped: SENDGRID_API_KEY/EMAIL_FROM not configured", "error");
    } else {
      console.log(`[email] SKIPPED - SENDGRID_API_KEY/EMAIL_FROM not configured → ${msg.to}: ${msg.subject}`);
    }
    return { sent: false };
  }
  const fromName = process.env.EMAIL_FROM_NAME; // e.g. "Alexa"
  let res: Response;
  try {
    res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      // Bounded: the crons call this in per-user loops inside a 60s lambda - a
      // hung SendGrid connection must not eat the whole budget.
      signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: msg.to }] }],
        from: fromName ? { email: from, name: fromName } : { email: from },
        subject: msg.subject,
        content: [
          { type: "text/plain", value: msg.text },
          ...(msg.html ? [{ type: "text/html", value: msg.html }] : []),
        ],
        ...(msg.categories?.length ? { categories: msg.categories } : {}),
        ...(msg.listUnsubscribeUrl
          ? {
              headers: {
                "List-Unsubscribe": `<${msg.listUnsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            }
          : {}),
      }),
    });
  } catch (e) {
    throw new EmailTransportError(e);
  }
  // SendGrid returns 202 Accepted on success; take any 2xx as delivered.
  if (!res.ok) {
    throw new Error(`SendGrid ${res.status}: ${await res.text().catch(() => "")}`);
  }
  return { sent: true };
}
