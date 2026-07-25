import "server-only";

// Transactional email — brought forward from F5 because F2.2's day-5 renewal
// reminder (a J6 trust element) and the F3 offer notifications can't ship
// without it. Only the provider wiring lives here; the full templated suite
// remains F5.
//
// Provider: SendGrid v3 Mail Send API via fetch (no SDK dependency). Set
// SENDGRID_API_KEY and EMAIL_FROM (EMAIL_FROM must be a verified SendGrid
// sender, else sends 403). Without a key (local dev) sends are logged & skipped
// so flows still work without a provider.

export interface EmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(msg: EmailInput): Promise<{ sent: boolean }> {
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.log(`[email] skipped (no SENDGRID_API_KEY/EMAIL_FROM) → ${msg.to}: ${msg.subject}`);
    return { sent: false };
  }
  const fromName = process.env.EMAIL_FROM_NAME; // e.g. "Alexa"
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: msg.to }] }],
      from: fromName ? { email: from, name: fromName } : { email: from },
      subject: msg.subject,
      content: [
        { type: "text/plain", value: msg.text },
        ...(msg.html ? [{ type: "text/html", value: msg.html }] : []),
      ],
    }),
  });
  // SendGrid returns 202 Accepted on success.
  if (res.status !== 202) {
    throw new Error(`SendGrid ${res.status}: ${await res.text().catch(() => "")}`);
  }
  return { sent: true };
}
