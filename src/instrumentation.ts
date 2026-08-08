import * as Sentry from "@sentry/nextjs";

// Server-side error monitoring. Inert until SENTRY_DSN is set in the
// environment — safe in dev/emulator, active in prod once the Sentry
// project exists. No source-map upload (that needs withSentryConfig +
// an auth token; runtime capture works without it).
export function register() {
  if (!process.env.SENTRY_DSN) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}

// Reports every server error Next captures (API routes, RSC, actions).
export const onRequestError = Sentry.captureRequestError;
