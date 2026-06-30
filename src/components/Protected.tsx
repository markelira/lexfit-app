"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { hasOnboarded } from "@/lib/user";

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
 * Guards a page. Redirects unauthenticated users to /login and, when
 * requireOnboarded is true, sends not-yet-onboarded users to /onboarding.
 */
export function Protected({
  children,
  requireOnboarded = true,
}: {
  children: React.ReactNode;
  requireOnboarded?: boolean;
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
    hasOnboarded(user.uid).then((done) => {
      if (!active) return;
      if (!done) router.replace("/onboarding");
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [user, loading, requireOnboarded, router]);

  if (loading || !user || checking) return <Loader />;
  return <>{children}</>;
}
