"use client";

import "./auth.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { ensureUserDoc, hasOnboarded, saveOnboarding, BLANK_ONBOARDING } from "@/lib/user";
import { paidDestination } from "@/lib/billing";
import { readDraft, clearDraft } from "@/lib/onboarding-draft";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { Loader } from "@/components/Protected";

type Mode = "login" | "register";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Pending email-register extras, consumed by the redirect effect when it writes
 *  the user doc. Kept in a ref so the value survives the auth-state re-render. */
type PendingExtra = { firstName: string; marketing: boolean } | null;

export default function AuthScreen({ mode }: { mode: Mode }) {
  const { user, loading, signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail } =
    useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errs, setErrs] = useState<{ name?: string; email?: string; password?: string }>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [stay, setStay] = useState(true); // login: default checked (GDPR-safe, user choice)
  const [marketing, setMarketing] = useState(false); // register: default UNCHECKED (GDPR opt-in)
  const [busy, setBusy] = useState(false);

  const [attachError, setAttachError] = useState(false);

  const pendingRef = useRef<PendingExtra>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  const isReg = mode === "register";

  // Route once authenticated (40 §40.8). A pre-auth onboarding draft is attached
  // here — exactly once, idempotently — before any redirect:
  //  · already onboarded → discard the local draft, go to the app (never re-ask);
  //  · not onboarded + a draft → save it, then checkout (/subscribe);
  //  · not onboarded, no draft → finish onboarding.
  // On attach failure the draft is kept and we retry in place — the user is
  // never sent back through the questions (40 §40.12 / P3.5). Pricing is not part
  // of auth — plan selection is the checkout step.
  const routeAfterAuth = useCallback(async () => {
    if (!user) return;
    setAttachError(false);
    const done = await hasOnboarded(user.uid);
    if (done) {
      clearDraft();
      router.replace(await paidDestination(user.uid));
      return;
    }
    const draft = readDraft();
    if (draft?.answers && draft.answers.goal != null) {
      try {
        await saveOnboarding(user.uid, { ...BLANK_ONBOARDING, ...draft.answers });
        clearDraft();
        router.replace("/subscribe");
      } catch {
        setAttachError(true);
      }
    } else {
      router.replace("/onboarding");
    }
  }, [user, router]);

  useEffect(() => {
    if (loading || !user) return;
    let active = true;
    (async () => {
      await ensureUserDoc(user, pendingRef.current ?? undefined);
      pendingRef.current = null;
      if (active) await routeAfterAuth();
    })();
    return () => {
      active = false;
    };
  }, [user, loading, routeAfterAuth]);

  // Autofocus the first field on mount / route change (matches the reference).
  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [mode]);

  function clearErr(field: "name" | "email" | "password") {
    setErrs((e) => (e[field] ? { ...e, [field]: undefined } : e));
    setFormErr(null);
  }

  function validate(): boolean {
    const next: typeof errs = {};
    if (isReg && name.trim().length < 1) next.name = "Add meg a keresztneved.";
    if (!EMAIL_RE.test(email.trim())) next.email = "Adj meg egy érvényes e-mail címet.";
    if (isReg) {
      if (!(password.length >= 8 && /\d/.test(password)))
        next.password = "A jelszó legyen legalább 8 karakter, és tartalmazzon számot.";
    } else if (password.length < 1) {
      next.password = "Add meg a jelszavad.";
    }
    setErrs(next);
    // Focus the first bad field, in visual order.
    if (next.name) nameRef.current?.focus();
    else if (next.email) emailRef.current?.focus();
    else if (next.password) pwRef.current?.focus();
    return Object.keys(next).length === 0;
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    setNotice(null);
    if (!validate()) return;
    setBusy(true);
    try {
      if (isReg) {
        pendingRef.current = { firstName: name.trim(), marketing };
        // New account → keep the session on this device.
        await setPersistence(auth, browserLocalPersistence);
        await signUpWithEmail(email.trim(), password);
        // Best-effort: mirror the name onto the Firebase Auth profile too.
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name.trim() }).catch(() => {});
        }
      } else {
        await setPersistence(auth, stay ? browserLocalPersistence : browserSessionPersistence);
        await signInWithEmail(email.trim(), password);
      }
      // The redirect effect takes over once `user` updates.
    } catch (err) {
      pendingRef.current = null;
      setFormErr(authErrorHu(err));
      setBusy(false);
    }
  }

  async function handleSso(provider: () => Promise<void>) {
    setFormErr(null);
    setNotice(null);
    setBusy(true);
    try {
      // On register the account is created; on login honour "stay signed in".
      await setPersistence(auth, isReg || stay ? browserLocalPersistence : browserSessionPersistence);
      // Apple/Google supply their own name; carry only the marketing opt-in.
      if (isReg) pendingRef.current = { firstName: "", marketing };
      await provider();
    } catch (err) {
      pendingRef.current = null;
      setFormErr(authErrorHu(err));
      setBusy(false);
    }
  }

  async function handleForgot() {
    setFormErr(null);
    setNotice(null);
    if (!EMAIL_RE.test(email.trim())) {
      setErrs((e) => ({ ...e, email: "Adj meg egy érvényes e-mail címet." }));
      emailRef.current?.focus();
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      // Don't leak whether the address exists — only surface real input errors.
      if (code === "auth/invalid-email" || code === "auth/too-many-requests") {
        setFormErr(authErrorHu(err));
        return;
      }
    }
    setNotice("Ha létezik fiók ezzel a címmel, elküldtük a jelszó-visszaállító linket.");
  }

  function go(target: Mode) {
    router.push(target === "login" ? "/login" : "/register");
  }

  // While auth resolves or a redirect is pending, show the branded loader — or,
  // if attaching the onboarding answers failed, an in-place retry (never a trip
  // back through the questions — the draft is still in localStorage; P3.5).
  if (loading) return <Loader />;
  if (user) {
    if (attachError) {
      return (
        <div className="lx authx">
          <div className="attach-retry" role="alert">
            <p>A fiókod elkészült, de a válaszaidat nem tudtuk elmenteni. Újrapróbáljuk?</p>
            <button type="button" className="submit" onClick={() => void routeAfterAuth()}>
              <span className="tx">Újra</span>
            </button>
          </div>
        </div>
      );
    }
    return <Loader />;
  }

  return (
    <div className="lx authx">
      <div className="authx-shell">
        {/* ── LEFT · brand panel (shared with the /register wizard) ── */}
        <AuthBrand />

        {/* ── RIGHT · auth column ── */}
        <main className="authx-auth">
          <div className="authx-card">
            <div className="topline">
              {isReg ? (
                <>
                  <span>Van már fiókod?</span>
                  <button type="button" className="lnk" onClick={() => go("login")}>
                    Lépj be
                  </button>
                </>
              ) : (
                <>
                  <span>Még nincs fiókod?</span>
                  <button type="button" className="lnk" onClick={() => go("register")}>
                    Regisztrálj
                  </button>
                </>
              )}
            </div>

            <div className="seg" role="tablist" aria-label="Belépés vagy regisztráció">
              <button
                role="tab"
                type="button"
                className={!isReg ? "on" : ""}
                aria-selected={!isReg}
                onClick={() => go("login")}
              >
                Belépés
              </button>
              <button
                role="tab"
                type="button"
                className={isReg ? "on" : ""}
                aria-selected={isReg}
                onClick={() => go("register")}
              >
                Regisztráció
              </button>
            </div>

            <section className="pane" key={mode}>
              <h1 className="ax-h1">{isReg ? "Kezdjük el." : "Üdv újra itt."}</h1>
              <p className="lede">
                {isReg
                  ? "Hozz létre egy fiókot — a csomagot a következő lépésben választod ki."
                  : "Lépj be, és folytasd ott, ahol abbahagytad."}
              </p>

              <div className="oauth">
                <button
                  className="ob"
                  type="button"
                  onClick={() => handleSso(signInWithGoogle)}
                  disabled={busy}
                >
                  <GoogleMark />
                  {isReg ? "Regisztráció Google-lel" : "Folytatás Google-lel"}
                </button>
                <button
                  className="ob"
                  type="button"
                  onClick={() => handleSso(signInWithApple)}
                  disabled={busy}
                >
                  <AppleMark />
                  {isReg ? "Regisztráció Apple-lel" : "Folytatás Apple-lel"}
                </button>
              </div>

              <div className="div">vagy</div>

              <form onSubmit={handleEmailSubmit} noValidate>
                {isReg && (
                  <div className={`field${errs.name ? " bad" : ""}`}>
                    <label htmlFor="ax-name">Keresztneved</label>
                    <div className="inp">
                      <input
                        id="ax-name"
                        ref={(el) => { nameRef.current = el; firstFieldRef.current = el; }}
                        type="text"
                        placeholder="Anna"
                        autoComplete="given-name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); clearErr("name"); }}
                        aria-invalid={!!errs.name}
                        aria-describedby={errs.name ? "ax-name-err" : undefined}
                      />
                    </div>
                    {errs.name && (
                      <div className="err" id="ax-name-err" role="alert">
                        {errs.name}
                      </div>
                    )}
                  </div>
                )}

                <div className={`field${errs.email ? " bad" : ""}`}>
                  <label htmlFor="ax-email">E-mail cím</label>
                  <div className="inp">
                    <input
                      id="ax-email"
                      ref={(el) => { emailRef.current = el; if (!isReg) firstFieldRef.current = el; }}
                      type="email"
                      placeholder="nev@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearErr("email"); }}
                      aria-invalid={!!errs.email}
                      aria-describedby={errs.email ? "ax-email-err" : undefined}
                    />
                  </div>
                  {errs.email && (
                    <div className="err" id="ax-email-err" role="alert">
                      {errs.email}
                    </div>
                  )}
                </div>

                <div className={`field${errs.password ? " bad" : ""}`}>
                  <div className="lab-row">
                    <label htmlFor="ax-pw">Jelszó</label>
                    {!isReg && (
                      <button type="button" className="lnk" onClick={handleForgot}>
                        Elfelejtetted?
                      </button>
                    )}
                  </div>
                  <div className="inp has-btn">
                    <input
                      id="ax-pw"
                      ref={pwRef}
                      type={showPw ? "text" : "password"}
                      placeholder={isReg ? "Legalább 8 karakter" : "••••••••"}
                      autoComplete={isReg ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearErr("password"); }}
                      aria-invalid={!!errs.password}
                      aria-describedby={
                        errs.password ? "ax-pw-err" : isReg ? "ax-pw-hint" : undefined
                      }
                    />
                    <button
                      type="button"
                      className={`eye${showPw ? " on" : ""}`}
                      aria-label={showPw ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
                      onClick={() => setShowPw((v) => !v)}
                    >
                      <EyeIcon off={showPw} />
                    </button>
                  </div>
                  {isReg && !errs.password && (
                    <div className="hint" id="ax-pw-hint">
                      Legalább 8 karakter, egy számmal.
                    </div>
                  )}
                  {errs.password && (
                    <div className="err" id="ax-pw-err" role="alert">
                      {errs.password}
                    </div>
                  )}
                </div>

                {isReg ? (
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                    />
                    <span>
                      Kérek heti emlékeztetőt és új edzés-értesítőt. Bármikor leiratkozhatsz.
                    </span>
                  </label>
                ) : (
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={stay}
                      onChange={(e) => setStay(e.target.checked)}
                    />
                    <span>Maradjak bejelentkezve ezen az eszközön</span>
                  </label>
                )}

                <button className={`submit${busy ? " loading" : ""}`} type="submit" disabled={busy}>
                  <span className="sp" aria-hidden="true" />
                  <span className="tx">{isReg ? "Fiók létrehozása" : "Belépés"}</span>
                </button>
              </form>

              {formErr && (
                <p className="formerr" role="alert">
                  {formErr}
                </p>
              )}
              {notice && (
                <p className="notice" role="status">
                  {notice}
                </p>
              )}

              {isReg ? (
                <p className="legal">
                  A folytatással elfogadod az <a href="/aszf">ÁSZF</a>-et és az{" "}
                  <a href="/adatvedelem">Adatkezelési tájékoztatót</a>.
                </p>
              ) : null}

              <div className="trust">
                {isReg ? <ShieldIcon /> : <LockIcon />}
                {isReg ? "14 napos elállási jog" : "Titkosított kapcsolat"}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export function authErrorHu(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Ezzel az e-mail címmel már van fiók. Lépj be.";
    case "auth/invalid-email":
      return "Érvénytelen e-mail cím.";
    case "auth/weak-password":
      return "A jelszó túl gyenge — legalább 8 karakter, egy számmal.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Hibás e-mail cím vagy jelszó.";
    case "auth/too-many-requests":
      return "Túl sok próbálkozás — próbáld kicsit később.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "A bejelentkezés megszakadt. Próbáld újra.";
    case "auth/popup-blocked":
      return "A böngésző blokkolta a felugró ablakot. Engedélyezd, és próbáld újra.";
    case "auth/account-exists-with-different-credential":
      return "Ehhez az e-mail címhez már tartozik fiók egy másik bejelentkezési móddal. Lépj be azzal.";
    case "auth/operation-not-allowed":
      return "Ez a bejelentkezési mód még nincs engedélyezve. Próbáld másképp.";
    default:
      return "Sikertelen művelet. Próbáld újra.";
  }
}

export function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.5 7l7.6 5.9c4.4-4.1 6.6-10.1 6.6-17.4z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.4 0 20.1 0 24s1 7.6 2.6 10.8l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.7-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

export function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#18201d"
        d="M16.4 12.8c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9s-1.9-.9-3.1-.8c-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.2 1.8 2.4 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.1.7c1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.5-1-2.6-3.8zM14 4.9c.7-.8 1.1-1.9 1-3-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.9-1.4z"
      />
    </svg>
  );
}

export function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M3 3l18 18" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.4 8.3-8 9-4.6-.7-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
