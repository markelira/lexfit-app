import * as Sentry from "@sentry/nextjs";

// Client-side error monitoring - inert until NEXT_PUBLIC_SENTRY_DSN is set.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    environment: process.env.NODE_ENV,
    // Session Replay - 10% of sessions, 100% of error sessions. Defaults mask
    // all text and block all media, which matters here: LEXFIT handles
    // body-image-sensitive content (progress photos); never loosen the masking.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration()],
  });
}

// App Router navigation spans.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
