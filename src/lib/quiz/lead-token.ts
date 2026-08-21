import { createHmac, timingSafeEqual } from "node:crypto";

// Signed, expiring links for a lead's GDPR rights (erasure and access).
//
// Not `server-only` so the acceptance tests can import it; `node:crypto` still
// keeps it out of any browser bundle.
//
// WHY A TOKEN AT ALL. A lead has no account, so there is nothing to log into.
// The only thing that proves control of the record is control of the mailbox -
// so the flow is always: ask by email → we mail a signed link → the link acts.
// Accepting a bare `?email=` would let anyone erase anyone's data by guessing
// an address, which is a worse privacy failure than the one it solves.
//
// Distinct from the unsubscribe token in one deliberate way: these EXPIRE.
// An unsubscribe link must work in a year-old email; an erasure link is
// destructive, so a leaked or forwarded mail should not stay armed forever.

export type RightsAction = "erase" | "export";

const TTL_MS = 24 * 3600_000;

function secret(): string | null {
  return process.env.CRON_SECRET || null;
}

function sign(id: string, action: RightsAction, exp: number): string {
  const s = secret();
  if (!s) return "";
  return createHmac("sha256", s).update(`lead:${action}:${id}:${exp}`).digest("hex").slice(0, 40);
}

export function rightsUrl(id: string, action: RightsAction, now = Date.now()): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";
  const exp = now + TTL_MS;
  const t = sign(id, action, exp);
  return `${base}/api/quiz-lead/rights/confirm?id=${id}&a=${action}&e=${exp}&t=${t}`;
}

/** Fails closed: no secret, malformed input, bad signature or past expiry → false. */
export function verifyRightsToken(
  id: string, action: RightsAction, exp: number, token: string, now = Date.now(),
): boolean {
  if (!secret() || !id || !token) return false;
  if (!Number.isFinite(exp) || exp < now) return false;
  const want = sign(id, action, exp);
  if (!want || token.length !== want.length) return false;
  try {
    return timingSafeEqual(Buffer.from(want), Buffer.from(token));
  } catch {
    return false;
  }
}
