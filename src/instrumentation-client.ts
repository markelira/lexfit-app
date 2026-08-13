import * as Sentry from "@sentry/nextjs";

// Client-side error monitoring - inert until NEXT_PUBLIC_SENTRY_DSN is set.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    environment: process.env.NODE_ENV,
    // Noise that is not ours (2026-08 audit: 95% of all event volume - see
    // docs/sentry-error-audit.md). Filtered at the SDK so real signal stays
    // readable; resolving these in the Sentry UI just reopens them.
    denyUrls: [
      // MetaMask (and other wallet extensions) inject scripts/inpage.js and
      // retry wallet connects on every page view. LEXFIT has no wallet code.
      /scripts\/inpage\.js/,
      // Meta's in-app browsers (Instagram/Facebook) inject performance loggers
      // that throw when the webview tears down their native bridge.
      /navigation_performance_logger/,
    ],
    ignoreErrors: [
      "Failed to connect to MetaMask",
      "MetaMask extension not found",
      // Meta webview bridge teardown (Android + iOS variants).
      /Error invoking (postMessage|enableDidUserTypeOnKeyboardLogging)/,
      "evaluating 'window.webkit.messageHandlers'",
      // User's network dropped mid-read - client connectivity, not a defect.
      "Failed to get document because the client is offline",
    ],
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
