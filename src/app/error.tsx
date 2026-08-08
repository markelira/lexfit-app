"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Root error boundary — anything below the root layout that throws at render
// lands here instead of Next's unstyled default screen.
export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 12,
      textAlign: "center", padding: 24,
    }}>
      <p style={{ fontFamily: "var(--mono, monospace)", letterSpacing: "0.18em", fontWeight: 700 }}>LEXFIT</p>
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
    </div>
  );
}
