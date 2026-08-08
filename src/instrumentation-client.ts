import * as Sentry from "@sentry/nextjs";

// Client-side error monitoring — inert until NEXT_PUBLIC_SENTRY_DSN is set.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.05,
    environment: process.env.NODE_ENV,
  });
}
