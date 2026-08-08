"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { hasOnboarded } from "@/lib/user";
import { getSubscription, isSubscribed } from "@/lib/billing";

/** Full-screen branded loader shown while auth/onboarding state resolves. */
export function Loader({ label = "Töltés…" }: { label?: string }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--mono)",
        color: "var(--ink-3)",
        fontSize: 13,
        letterSpacing: "0.04em",
      }}
    >
      {label}
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
 *  - a `session_id` query param — the post-checkout success return; the page's
 *    confirmCheckout fulfills access before the webhook lands, so the gate
 *    must not bounce the buyer while the doc is still being written;
 *  - /app/membership — PAUSED hard-denies access, but resume/cancel live there.
 * The gate is UX only — real enforcement stays server-side (video tokens).
 */
export function Protected({
  children,
  requireOnboarded = true,
  requirePaid = false,
}: {
  children: React.ReactNode;
  requireOnboarded?: boolean;
  requirePaid?: boolean;
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
    hasOnboarded(user.uid).then(async (done) => {
      if (!active) return;
      if (!done) {
        router.replace("/onboarding");
        return;
      }
      if (requirePaid) {
        const exempt =
          typeof window !== "undefined" &&
          (new URLSearchParams(window.location.search).has("session_id") ||
            window.location.pathname.startsWith("/app/membership"));
        if (!exempt) {
          let paid = true; // fail-open on read errors — the server re-validates anyway
          try {
            paid = isSubscribed(await getSubscription(user.uid));
          } catch {}
          if (!active) return;
          if (!paid) {
            router.replace("/subscribe");
            return;
          }
        }
      }
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [user, loading, requireOnboarded, requirePaid, router]);

  if (loading || !user || checking) return <Loader />;
  return <>{children}</>;
}
