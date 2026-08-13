import * as Sentry from "@sentry/nextjs";

// Server-side error monitoring. Inert until SENTRY_DSN is set in the
// environment - safe in dev/emulator, active in prod once the Sentry
// project exists. Source-map upload happens at build time via
// withSentryConfig (next.config.ts) once SENTRY_AUTH_TOKEN/ORG/PROJECT
// are set; runtime capture works without them.
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
