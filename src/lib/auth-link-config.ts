/**
 * Passwordless sign-in settings (P1). Pure and dependency-free so the mailer,
 * the API route and the client page all quote the same number - a lifetime
 * stated in an email that does not match the real one is a support ticket.
 *
 * Firebase's own expiry for an email-link action code is one hour and is NOT
 * configurable from here; this constant exists to keep the copy honest about
 * it, not to set it.
 */
export const SIGN_IN_LINK_MINUTES = 60;

/** localStorage key holding the address a link was requested for. Firebase
 *  requires the email back when completing the sign-in, and the link itself
 *  deliberately does not carry it (anyone forwarding the mail would otherwise
 *  hand over the session). */
export const SIGN_IN_EMAIL_KEY = "lx-signin-email";
