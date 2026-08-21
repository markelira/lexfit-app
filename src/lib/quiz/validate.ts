// Lead magnet quiz - S14 field validation (spec §4).
//
// Runs on BOTH sides: the form gates its CTA on it, and the API route re-checks
// it before writing, because a client is never trusted. Pure, so both can share it.
//
// The consent rule is not cosmetic: `consent_health` is the GDPR Art. 9 legal
// basis for the body metrics, so a submit without it must be rejected server-
// side, not merely disabled in the UI.

/** Letters (incl. Hungarian accents), spaces and hyphens - nothing else. */
const NAME_OK = /^[\p{L}][\p{L} -]*$/u;

export type FieldError = "required" | "too_short" | "too_long" | "bad_chars" | "bad_email";

/** Trim, then upper-case the first letter - "  anna " → "Anna". */
export function normalizeFirstName(raw: string): string {
  const t = raw.trim().replace(/\s+/g, " ");
  return t ? t[0].toLocaleUpperCase("hu-HU") + t.slice(1) : "";
}

export function validateFirstName(raw: string): FieldError | null {
  const t = raw.trim();
  if (!t) return "required";
  if (t.length < 2) return "too_short";
  if (t.length > 30) return "too_long";
  // Digits and punctuation are the common paste-accidents we want to catch.
  if (!NAME_OK.test(t)) return "bad_chars";
  return null;
}

// Deliberately not RFC 5322: a permissive shape check plus a real TLD is what
// actually filters typos, and anything stricter rejects valid addresses.
const EMAIL_OK = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function validateEmail(raw: string): FieldError | null {
  const t = raw.trim();
  if (!t) return "required";
  return EMAIL_OK.test(t) ? null : "bad_email";
}

/** Normalised form used as the lead's document id, so a retake upserts. */
export const normalizeEmail = (raw: string): string => raw.trim().toLowerCase();

export interface LeadForm {
  firstName: string;
  email: string;
  consentHealth: boolean;
  consentMarketing: boolean;
}

/** All three CTA conditions at once (spec §4 S14). Marketing consent is optional. */
export function canSubmit(f: LeadForm): boolean {
  return (
    validateFirstName(f.firstName) === null &&
    validateEmail(f.email) === null &&
    f.consentHealth === true
  );
}
