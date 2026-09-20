"use client";

// Firebase Auth action handler - the in-app landing for the e-mail links
// (password reset, e-mail verification, e-mail-change recovery). The Firebase
// console's e-mail templates must point their action URL at
// https://www.lexfit.hu/auth/action for this page to receive the links;
// until then Firebase's hosted (English) page handles them.
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  applyActionCode,
  confirmPasswordReset,
  isSignInWithEmailLink,
  signInWithEmailLink,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { SIGN_IN_EMAIL_KEY } from "@/lib/auth-link-config";

const wrap: React.CSSProperties = {
  minHeight: "100dvh", display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center", gap: 12,
  textAlign: "center", padding: 24,
};
const mark: React.CSSProperties = {
  fontFamily: "var(--mono, monospace)", letterSpacing: "0.18em", fontWeight: 700,
};
const inputStyle: React.CSSProperties = {
  font: "inherit", padding: "10px 14px", borderRadius: 10,
  border: "1px solid oklch(0.85 0.01 170)", width: "min(320px, 80vw)",
};
const btn: React.CSSProperties = {
  marginTop: 8, padding: "10px 18px", borderRadius: 999,
  border: "1px solid currentColor", background: "none", cursor: "pointer", font: "inherit",
};

function ActionHandler() {
  const params = useSearchParams();
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  const [state, setState] = useState<
    "working" | "reset-form" | "signin-email" | "done" | "error"
  >("working");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!mode || !oobCode) {
      setErr("Hiányos vagy sérült link. Kérj újat az appból.");
      setState("error");
      return;
    }
    // P1 - passwordless sign-in. The address is NOT in the link on purpose:
    // anyone who received a forwarded copy could otherwise take the session.
    // It comes from the device that asked for the link; when that is missing
    // (a different device, cleared storage) we ask for it, which is exactly
    // the confirmation Firebase wants before completing.
    if (mode === "signIn" && isSignInWithEmailLink(auth, window.location.href)) {
      let stored: string | null = null;
      try { stored = localStorage.getItem(SIGN_IN_EMAIL_KEY); } catch {}
      if (!stored) {
        setState("signin-email");
        return;
      }
      void completeSignIn(stored);
      return;
    }
    if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, oobCode)
        .then((mail) => {
          setEmail(mail);
          setState("reset-form");
        })
        .catch(() => {
          setErr("Ez a jelszó-visszaállító link lejárt vagy már fel lett használva. Kérj újat a bejelentkező oldalon.");
          setState("error");
        });
    } else if (mode === "verifyEmail" || mode === "recoverEmail") {
      applyActionCode(auth, oobCode)
        .then(() => {
          setMsg(
            mode === "verifyEmail"
              ? "Az e-mail címedet megerősítettük. ✅"
              : "Az e-mail címedet visszaállítottuk a korábbi címre.",
          );
          setState("done");
        })
        .catch(() => {
          setErr("Ez a link lejárt vagy már fel lett használva.");
          setState("error");
        });
    } else {
      setErr("Ismeretlen művelet.");
      setState("error");
    }
  }, [mode, oobCode]);

  async function completeSignIn(mail: string) {
    setBusy(true);
    setErr("");
    try {
      await signInWithEmailLink(auth, mail.trim().toLowerCase(), window.location.href);
      try { localStorage.removeItem(SIGN_IN_EMAIL_KEY); } catch {}
      // continueUrl carries where they were headed; the link route restricts
      // it to a same-site path, so this can only land inside the app.
      const next = params.get("continueUrl");
      let dest = "/app";
      try {
        if (next) {
          const u = new URL(next, window.location.origin);
          if (u.origin === window.location.origin) dest = u.pathname + u.search;
        }
      } catch {}
      window.location.replace(dest);
    } catch {
      setErr(
        "Ez a belépő link lejárt vagy már fel lett használva. Kérj újat - ugyanarra a címre küldjük.",
      );
      setState("error");
    } finally {
      setBusy(false);
    }
  }

  async function submitNewPassword() {
    if (pw.length < 6) {
      setErr("A jelszó legalább 6 karakter legyen.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await confirmPasswordReset(auth, oobCode!, pw);
      setMsg("Az új jelszavad él. Jelentkezz be vele!");
      setState("done");
    } catch {
      setErr("Nem sikerült menteni - a link lejárhatott. Kérj új jelszó-visszaállítást.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={wrap}>
      <p style={mark}>LEXFIT</p>

      {state === "working" && <p style={{ opacity: 0.7 }}>Egy pillanat…</p>}

      {state === "signin-email" && (
        <>
          <h1 style={{ fontSize: 22, margin: 0 }}>Erősítsd meg a címed</h1>
          <p style={{ opacity: 0.7, margin: 0, maxWidth: 320 }}>
            Add meg azt az e-mail címet, amire a belépő linket kérted.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nev@example.com"
            style={inputStyle}
            autoFocus
            autoComplete="email"
            onKeyDown={(e) => e.key === "Enter" && completeSignIn(email)}
          />
          <button style={btn} disabled={busy} onClick={() => completeSignIn(email)}>
            {busy ? "Egy pillanat…" : "Belépek"}
          </button>
        </>
      )}

      {state === "reset-form" && (
        <>
          <h1 style={{ fontSize: 22, margin: 0 }}>Új jelszó</h1>
          <p style={{ opacity: 0.7, margin: 0 }}>Fiók: {email}</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Új jelszó (min. 6 karakter)"
            style={inputStyle}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && submitNewPassword()}
          />
          <button style={btn} disabled={busy} onClick={submitNewPassword}>
            {busy ? "Mentés…" : "Jelszó mentése"}
          </button>
        </>
      )}

      {state === "done" && (
        <>
          <h1 style={{ fontSize: 22, margin: 0 }}>Kész ✔</h1>
          <p style={{ opacity: 0.8, margin: 0 }}>{msg}</p>
          <Link href="/login" style={{ marginTop: 8, textDecoration: "underline" }}>
            Tovább a bejelentkezéshez
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <h1 style={{ fontSize: 22, margin: 0 }}>Ez a link nem működik</h1>
          <p style={{ opacity: 0.8, margin: 0, maxWidth: 420 }}>{err}</p>
          <Link href="/login" style={{ marginTop: 8, textDecoration: "underline" }}>
            Vissza a bejelentkezéshez
          </Link>
        </>
      )}

      {err && state === "reset-form" && (
        <p style={{ color: "oklch(0.5 0.19 25)", margin: 0, fontSize: 14 }}>{err}</p>
      )}
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={<div style={wrap}><p style={mark}>LEXFIT</p></div>}>
      <ActionHandler />
    </Suspense>
  );
}
