"use client";

import "../onboarding/onb.css";
import "./auth.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ensureUserDoc, hasOnboarded } from "@/lib/user";
import { Loader } from "@/components/Protected";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf, perWeekHuf, annualSavingsPct } from "@/lib/pricing/display";

type PlanCard = {
  role: string;
  name: string;
  amt: string;
  per: string;
  detail: React.ReactNode;
  badge?: string;
  featured?: boolean;
};

const PLANS: PlanCard[] = [
  {
    role: "week_intro",
    name: "Heti",
    amt: formatHuf(PRICES.week_intro.amountHuf),
    per: "első 7 nap",
    detail: <>utána {formatHuf(PRICES.week_std.amountHuf)}/hét</>,
  },
  {
    role: "annual_std",
    name: "Éves",
    amt: formatHuf(perWeekHuf(PRICES.annual_std.amountHuf)),
    per: "/ hét",
    badge: `Legnépszerűbb · Spórolj ${annualSavingsPct()}%`,
    featured: true,
    detail: (
      <>
        {formatHuf(PRICES.annual_std.amountHuf)}/év
        <br />
        évente számlázva
      </>
    ),
  },
  {
    role: "month_std",
    name: "Havi",
    amt: formatHuf(PRICES.month_std.amountHuf),
    per: "/ hó",
    detail: <>havonta megújul</>,
  },
];

const LEFT_STATS: [string, string][] = [
  ["8 hét", "vezetett program"],
  ["40 edzés", "a Foundationben"],
  ["Közösség", "Szavazz Magadra"],
];
const RIGHT_STATS: [string, string][] = [
  ["200+", "edzés a videótárban"],
  ["Heti", "közösségi kihívás"],
  ["Napi", "fejlődéskövetés"],
];

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<string>("annual_std");

  useEffect(() => {
    if (loading || !user) return;
    let active = true;
    (async () => {
      await ensureUserDoc(user);
      const done = await hasOnboarded(user.uid);
      // New members go pick their plan → checkout; returning members to the app.
      if (active) router.replace(done ? "/app" : `/subscribe?plan=${plan}`);
    })();
    return () => {
      active = false;
    };
  }, [user, loading, router, plan]);

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sikertelen bejelentkezés.");
      setBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") await signUpWithEmail(email.trim(), password);
      else await signInWithEmail(email.trim(), password);
    } catch (err) {
      setError(authErrorHu(err));
      setBusy(false);
    }
  }

  if (loading || user) return <Loader />;

  return (
    <div className="lx">
      <div className="auth2">
        <FlowField />
        <header className="auth2-head">
          <div
            className="auth2-avatar"
            style={{ backgroundImage: "url(/trainer-underlayer.jpg)" }}
            aria-hidden="true"
          />
          <div className="auth2-brand">LEXFIT</div>
          <p className="auth2-eyebrow">Szavazz magadra</p>
        </header>

        <div className="auth2-cols">
          {/* LEFT — sign up */}
          <section className="auth2-panel">
            <h1 className="auth2-title">
              Hozz létre
              <br />
              fiókot
            </h1>
            <IconRow which="left" />
            <Stats items={LEFT_STATS} />

            <div className="sso-row">
              <button type="button" className="sso" onClick={handleGoogle} disabled={busy}>
                <GoogleMark />
                {busy ? "Bejelentkezés…" : "Folytatás Google-lel"}
              </button>
            </div>

            {!showEmail ? (
              <button
                type="button"
                className="onb-alt"
                onClick={() => {
                  setError(null);
                  setShowEmail(true);
                }}
              >
                vagy folytatás e-mail címmel
              </button>
            ) : (
              <>
                <div className="onb-or">e-mail cím</div>
                <form className="email-form" onSubmit={handleEmail}>
                  <input
                    className="onb-input"
                    type="email"
                    placeholder="E-mail cím"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    className="onb-input"
                    type="password"
                    placeholder="Jelszó"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <button className="onb-primary" type="submit" disabled={busy}>
                    {busy ? "…" : mode === "signup" ? "Fiók létrehozása" : "Bejelentkezés"}
                  </button>
                </form>
                <button
                  type="button"
                  className="onb-switch"
                  onClick={() => {
                    setError(null);
                    setMode((m) => (m === "signup" ? "signin" : "signup"));
                  }}
                >
                  {mode === "signup"
                    ? "Van már fiókod? Jelentkezz be"
                    : "Nincs még fiókod? Regisztrálj"}
                </button>
              </>
            )}

            {error && <p className="onb-err">{error}</p>}
            <p className="auth2-legal">
              A regisztrációval elfogadod az ÁSZF-et és az Adatkezelési tájékoztatót.
            </p>
          </section>

          {/* RIGHT — subscribe */}
          <section className="auth2-panel">
            <h1 className="auth2-title">
              Válaszd a teljes
              <br />
              hozzáférést
            </h1>
            <IconRow which="right" />
            <Stats items={RIGHT_STATS} />
            <p className="auth2-lead">
              Válaszd ki a csomagod. A periódus végén automatikusan megújul — bármikor egy
              kattintással lemondhatod.
            </p>

            <div className="auth2-plans">
              {PLANS.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  className={`plan-bar ${p.featured ? "featured" : ""} ${plan === p.role ? "on" : ""}`}
                  onClick={() => setPlan(p.role)}
                >
                  <div className="plan-bar-main">
                    <span className="plan-bar-name">{p.name}</span>
                    <span className="plan-bar-price">
                      {p.amt}
                      <em>{p.per}</em>
                    </span>
                  </div>
                  {p.badge && <span className="plan-bar-badge">{p.badge}</span>}
                  <span className="plan-bar-detail">{p.detail}</span>
                </button>
              ))}
            </div>
            <p className="auth2-legal">
              A kiválasztott csomaggal a regisztráció után a fizetéshez lépsz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stats({ items }: { items: [string, string][] }) {
  return (
    <div className="auth2-stats">
      {items.map(([big, sub]) => (
        <div key={big} className="auth2-stat">
          <div className="auth2-stat-big">{big}</div>
          <div className="auth2-stat-sub">{sub}</div>
        </div>
      ))}
    </div>
  );
}

function IconRow({ which }: { which: "left" | "right" }) {
  const s = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6 } as const;
  const play = <svg {...s}><path d="M8 5v14l11-7z" /></svg>;
  const heart = <svg {...s}><path d="M12 21s-7-4.5-9.5-8A5 5 0 0 1 12 6a5 5 0 0 1 9.5 7C19 16.5 12 21 12 21z" /></svg>;
  const bowl = <svg {...s}><path d="M3 11h18a9 9 0 01-18 0zM12 3v4" /></svg>;
  const chart = <svg {...s}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg>;
  const cal = <svg {...s}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>;
  const icons = which === "left" ? [play, heart, bowl] : [play, cal, chart, bowl];
  return (
    <div className="auth2-icons">
      {icons.map((ic, i) => (
        <span key={i} className="auth2-icon">
          {ic}
        </span>
      ))}
    </div>
  );
}

/** Ambient infinitely-flowing line field — the page's animated signature.
 *  Seamless (each layer scrolls one 1440px tile), varied speeds/directions,
 *  and frozen under prefers-reduced-motion (see auth.css). */
function FlowField() {
  const layers = [
    { top: "1%", dur: 46, rev: false, op: 0.5 },
    { top: "16%", dur: 63, rev: true, op: 0.32 },
    { top: "32%", dur: 39, rev: false, op: 0.46 },
    { top: "50%", dur: 72, rev: true, op: 0.28 },
    { top: "68%", dur: 53, rev: false, op: 0.4 },
    { top: "84%", dur: 84, rev: true, op: 0.3 },
  ];
  return (
    <div className="flow" aria-hidden="true">
      {layers.map((l, i) => (
        <div
          key={i}
          className="flow-layer"
          style={{
            top: l.top,
            opacity: l.op,
            animationDuration: `${l.dur}s`,
            animationDirection: l.rev ? "reverse" : "normal",
          }}
        />
      ))}
    </div>
  );
}

function authErrorHu(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Ezzel az e-mail címmel már van fiók. Jelentkezz be.";
    case "auth/invalid-email":
      return "Érvénytelen e-mail cím.";
    case "auth/weak-password":
      return "A jelszó túl rövid (legalább 6 karakter).";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Hibás e-mail cím vagy jelszó.";
    case "auth/too-many-requests":
      return "Túl sok próbálkozás — próbáld kicsit később.";
    default:
      return "Sikertelen bejelentkezés. Próbáld újra.";
  }
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
