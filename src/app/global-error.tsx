"use client";

// Root-layout error boundary — errors thrown in the root layout itself bypass
// app/error.tsx and land here. Must render its own <html>/<body>.
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="hu">
      <body style={{
        minHeight: "100dvh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
        textAlign: "center", padding: 24, fontFamily: "system-ui, sans-serif",
      }}>
        <p style={{ letterSpacing: "0.18em", fontWeight: 700 }}>LEXFIT</p>
        <h1 style={{ fontSize: 22, margin: 0 }}>Valami elromlott</h1>
        <p style={{ opacity: 0.7, margin: 0 }}>
          Ez a mi hibánk, nem a tiéd. Próbáld újra — ha nem segít, írj nekünk:{" "}
          <a href="mailto:hi@lexfit.hu">hi@lexfit.hu</a>
        </p>
        <button
          onClick={reset}
          style={{ marginTop: 8, padding: "10px 18px", borderRadius: 999, border: "1px solid currentColor", background: "none", cursor: "pointer", font: "inherit" }}
        >
          Újrapróbálom
        </button>
      </body>
    </html>
  );
}
