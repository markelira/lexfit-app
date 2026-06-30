"use client";

import "../onboarding/onb.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ensureUserDoc, hasOnboarded } from "@/lib/user";
import { Loader } from "@/components/Protected";
import { OnbAside } from "@/components/OnbAside";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    let active = true;
    (async () => {
      await ensureUserDoc(user);
      const done = await hasOnboarded(user.uid);
      if (active) router.replace(done ? "/app" : "/onboarding");
    })();
    return () => {
      active = false;
    };
  }, [user, loading, router]);

  async function handleSignIn() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sikertelen bejelentkezés.");
      setBusy(false);
    }
  }

  if (loading || user) return <Loader />;

  return (
    <div className="lx">
      <div className="onb-stage">
        <div className="onb-shell">
          <OnbAside welcome />

          <div className="onb-main">
            <div className="onb-main-center">
              <div className="onb-login step-in">
                <h2>Hozz létre fiókot</h2>
                <p className="onb-sub" style={{ marginTop: 0 }}>
                  Pár másodperc, és összerakjuk a programod.
                </p>

                <div className="sso-row">
                  <button type="button" className="sso fb" disabled title="Hamarosan">
                    <span style={{ fontWeight: 900, fontSize: 17 }}>f</span> Facebook — hamarosan
                  </button>
                  <button type="button" className="sso" onClick={handleSignIn} disabled={busy}>
                    <GoogleMark />
                    {busy ? "Bejelentkezés…" : "Folytatás Google-lel"}
                  </button>
                </div>

                {error && <p className="onb-err">{error}</p>}

                <p className="onb-legal">
                  A folytatással elfogadod az ÁSZF-et és az Adatkezelési tájékoztatót.
                  Apple és Facebook bejelentkezés hamarosan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}
