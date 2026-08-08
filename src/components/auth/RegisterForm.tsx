"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { browserLocalPersistence, setPersistence, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { ensureUserDoc, saveOnboarding, BLANK_ONBOARDING } from "@/lib/user";
import { readDraft, clearDraft } from "@/lib/onboarding-draft";
import { authErrorHu, GoogleMark, EyeIcon } from "@/app/login/AuthScreen";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// The account step as a reusable register-OR-login form (E1.2). Creates or signs
// into the account (email or Google/Apple), attaches the pre-auth onboarding
// draft idempotently, then calls onAuthed() so the wizard advances to payment.
// If the email already exists during register, we switch to login in place —
// the user is never dead-ended. Attach failure retries (40 §40.12).
export function RegisterForm({ onAuthed }: { onAuthed: () => void }) {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [marketing, setMarketing] = useState(false); // GDPR opt-in — default UNCHECKED
  const [showPw, setShowPw] = useState(false);
  const [errs, setErrs] = useState<{ name?: string; email?: string; password?: string }>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attachError, setAttachError] = useState(false);

  const isReg = mode === "register";
  const pendingRef = useRef<{ firstName: string; marketing: boolean } | null>(null);

  const attachAndContinue = useCallback(async () => {
    if (!user) return;
    setAttachError(false);
    const draft = readDraft();
    if (draft?.answers && draft.answers.goal != null) {
      try {
        await saveOnboarding(user.uid, { ...BLANK_ONBOARDING, ...draft.answers });
        clearDraft();
      } catch {
        setAttachError(true);
        return;
      }
    }
    onAuthed();
  }, [user, onAuthed]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      await ensureUserDoc(user, pendingRef.current ?? undefined);
      pendingRef.current = null;
      if (active) await attachAndContinue();
    })();
    return () => {
      active = false;
    };
  }, [user, attachAndContinue]);

  function switchMode(next: "register" | "login") {
    setMode(next);
    setErrs({});
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
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    setNotice(null);
    if (!validate()) return;
    setBusy(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (isReg) {
        pendingRef.current = { firstName: name.trim(), marketing };
        await signUpWithEmail(email.trim(), password);
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name.trim() }).catch(() => {});
        }
      } else {
        await signInWithEmail(email.trim(), password);
      }
      // The user effect takes over once `user` updates.
    } catch (err) {
      pendingRef.current = null;
      const code = (err as { code?: string })?.code ?? "";
      // Email already registered → flip to login in place, keep the email.
      if (isReg && code === "auth/email-already-in-use") {
        setMode("login");
        setPassword("");
        setNotice("Ezzel a címmel már van fiók — lépj be a folytatáshoz.");
      } else {
        setFormErr(authErrorHu(err));
      }
      setBusy(false);
    }
  }

  async function handleSso(provider: () => Promise<void>) {
    setFormErr(null);
    setNotice(null);
    setBusy(true);
    try {
      pendingRef.current = { firstName: "", marketing };
      await setPersistence(auth, browserLocalPersistence);
      await provider();
    } catch (err) {
      pendingRef.current = null;
      setFormErr(authErrorHu(err));
      setBusy(false);
    }
  }

  if (attachError) {
    return (
      <div role="alert">
        <p className="formerr">
          A fiókod elkészült, de a válaszaidat nem tudtuk elmenteni. Újrapróbáljuk?
        </p>
        <button type="button" className="submit" onClick={() => void attachAndContinue()}>
          <span className="tx">Újra</span>
        </button>
      </div>
    );
  }

  // Uses the /login (.authx) form classes so the account step is identical to it.
  return (
    <div>
      <div className="oauth">
        <button type="button" className="ob" onClick={() => handleSso(signInWithGoogle)} disabled={busy}>
          <GoogleMark />
          {isReg ? "Regisztráció Google-lel" : "Folytatás Google-lel"}
        </button>
        {/* Apple sign-in deferred (no Apple Developer membership yet). */}
      </div>

      <div className="div">vagy</div>

      <form onSubmit={handleSubmit} noValidate>
        {isReg && (
          <div className={`field${errs.name ? " bad" : ""}`}>
            <label htmlFor="rf-name">Keresztneved</label>
            <div className="inp">
              <input
                id="rf-name"
                type="text"
                placeholder="Anna"
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {errs.name && <div className="err">{errs.name}</div>}
          </div>
        )}

        <div className={`field${errs.email ? " bad" : ""}`}>
          <label htmlFor="rf-email">E-mail cím</label>
          <div className="inp">
            <input
              id="rf-email"
              type="email"
              placeholder="nev@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errs.email && <div className="err">{errs.email}</div>}
        </div>

        <div className={`field${errs.password ? " bad" : ""}`}>
          <label htmlFor="rf-pw">Jelszó</label>
          <div className="inp has-btn">
            <input
              id="rf-pw"
              type={showPw ? "text" : "password"}
              placeholder={isReg ? "Legalább 8 karakter" : "••••••••"}
              autoComplete={isReg ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {errs.password
            ? <div className="err">{errs.password}</div>
            : isReg ? <div className="hint">Legalább 8 karakter, egy számmal.</div> : null}
        </div>

        {isReg && (
          <label className="check">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            <span>Kérek heti emlékeztetőt és új edzés-értesítőt. Bármikor leiratkozhatsz.</span>
          </label>
        )}

        <button type="submit" className={`submit${busy ? " loading" : ""}`} disabled={busy}>
          <span className="sp" aria-hidden="true" />
          <span className="tx">{isReg ? "Fiók létrehozása" : "Belépés"}</span>
        </button>
      </form>

      {formErr && <p className="formerr" role="alert">{formErr}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}

      <div className="topline" style={{ justifyContent: "center", marginTop: 18, marginBottom: 0 }}>
        <span>{isReg ? "Van már fiókod?" : "Még nincs fiókod?"}</span>
        <button type="button" className="lnk" onClick={() => switchMode(isReg ? "login" : "register")}>
          {isReg ? "Lépj be" : "Regisztrálj"}
        </button>
      </div>

      {isReg && (
        <p className="legal">
          A folytatással elfogadod az <a href="/aszf">ÁSZF</a>-et és az{" "}
          <a href="/adatvedelem">Adatkezelési tájékoztatót</a>.
        </p>
      )}
    </div>
  );
}
