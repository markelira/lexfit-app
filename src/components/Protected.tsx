"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { hasOnboarded } from "@/lib/user";
import { getSubscription, hasAnyAccess } from "@/lib/billing";

/** Full-screen branded loader shown while auth/onboarding state resolves -
 *  a quiet pulsing brand mark, no text (the label feeds screen readers only). */
export function Loader({ label = "Töltés…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}
    >
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            background: "var(--accent-2, oklch(0.5 0.046 168))",
            animation: "lx-loader-pulse 1.2s ease-in-out infinite",
          }}
        />
        <div style={{ width: 58, height: 8, borderRadius: 999, background: "var(--line, oklch(0.9 0.012 168))" }} />
      </div>
      <style>{`
        @keyframes lx-loader-pulse {
          0%, 100% { opacity: 0.35; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-busy="true"] div { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/**
 * Guards a page. Redirects unauthenticated users to /login; when
 * requireOnboarded is true, sends not-yet-onboarded users to /onboarding;
 * when requirePaid is true (E4 pay-to-join hard gate), sends users without
 * an active entitlement to /subscribe.
 *
 * requirePaid exemptions (deliberate):
 *  - a `session_id` query param - the post-checkout success return; the page's
 *    confirmCheckout fulfills access before the webhook lands, so the gate
 *    must not bounce the buyer while the doc is still being written;
 *  - /app/membership - PAUSED hard-denies access, but resume/cancel live there.
 * The gate is UX only - real enforcement stays server-side (video tokens).
 */
export function Protected({
  children,
  requireOnboarded = true,
  requirePaid = false,
  fallback,
}: {
  children: React.ReactNode;
  requireOnboarded?: boolean;
  requirePaid?: boolean;
  /** Rendered while the gate resolves - pass a page skeleton for a seamless
   *  load; defaults to the branded Loader. */
  fallback?: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!requireOnboarded) {
      setChecking(false);
      return;
    }
    let active = true;
    (async () => {
      const exempt =
        typeof window !== "undefined" &&
        (new URLSearchParams(window.location.search).has("session_id") ||
          window.location.pathname.startsWith("/app/membership"));

      // Read ONCE and decide twice from it: whether to enforce the paid gate,
      // and whether an unanswered onboarding should send someone out of the
      // app at all. It is read even when `requirePaid` is false, so a future
      // onboarded-but-not-paid-gated page cannot silently lose the bounce
      // below by leaving `paid` at its optimistic default.
      let paid = true; // fail-open on read errors - the server re-validates anyway
      if (!exempt) {
        try {
          // The door, not the rooms (P1): owning one programme is enough to
          // enter; the Mux token route still decides each individual video.
          paid = hasAnyAccess(await getSubscription(user.uid));
        } catch {}
        if (!active) return;
        if (requirePaid && !paid) {
          router.replace("/subscribe");
          return;
        }
      }

      const done = await hasOnboarded(user.uid).catch(() => true);
      if (!active) return;
      if (!done && !paid) {
        // Only someone who has NOT paid belongs in /onboarding: for them it is
        // the acquisition funnel. Sending a paying member there would hand
        // them a flow that ends by asking for an account and a card they have
        // already given - and the lead base is full of accounts that started
        // that funnel and stopped. Their setup happens inside the app instead
        // (components/onboarding/OnboardingSheet).
        router.replace("/onboarding");
        return;
      }
      setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [user, loading, requireOnboarded, requirePaid, router]);

  if (loading || !user || checking) return <>{fallback ?? <Loader />}</>;
  return <>{children}</>;
}
