"use client";

import { useState } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { SIGN_IN_EMAIL_KEY, SIGN_IN_LINK_MINUTES } from "@/lib/auth-link-config";
import "./belepes.css";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Ask for an address, mail a sign-in link (P1).
 *
 * The address is stored locally BEFORE the request goes out, because Firebase
 * needs it back to complete the sign-in and the link deliberately does not
 * carry it. Storing it first means a link opened on this device completes in
 * one tap; opened elsewhere, /auth/action asks for it instead.
 *
 * The success state never says whether an account exists. The answer is the
 * same either way, so this page cannot be used to find out who has bought.
 */
export function LoginLinkScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const mail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(mail)) {
      setErr("Adj meg egy érvényes e-mail címet.");
      return;
    }
    setBusy(true);
    setErr(null);
    try { localStorage.setItem(SIGN_IN_EMAIL_KEY, mail); } catch {}
    try {
      const res = await fetch("/api/auth/login-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail }),
      });
      if (!res.ok) throw new Error("failed");
      setSent(true);
    } catch {
      setErr("Most nem sikerült elküldeni. Próbáld újra egy perc múlva.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="lxb">
      <div className="lxb-card">
        <p className="lxb-mark">LEXFIT</p>

        {sent ? (
          <>
            <span className="lxb-ic">
              <LxIcon d={lxPaths.mail} size={26} sw={1.7} />
            </span>
            <h1>Elküldtük a belépő linket</h1>
            <p className="lxb-sub">
              Nézd meg a <strong>{email.trim().toLowerCase()}</strong> postafiókot. Egy
              koppintás a linkre, és bent vagy - jelszó nem kell.
            </p>
            <p className="lxb-note">
              A link {SIGN_IN_LINK_MINUTES} percig él. Ha pár percen belül nem látod, nézd
              meg a levélszemét mappát is.
            </p>
            <button type="button" className="lxb-again" onClick={() => setSent(false)}>
              Másik címet adok meg
            </button>
          </>
        ) : (
          <>
            <h1>Belépés</h1>
            <p className="lxb-sub">
              Add meg az e-mail címed, és küldünk egy belépő linket. Nem kell jelszó.
            </p>
            <form onSubmit={submit} noValidate>
              <label htmlFor="lxb-email">E-mail cím</label>
              <input
                id="lxb-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nev@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErr(null); }}
                autoFocus
              />
              <button type="submit" className={`lxb-cta${busy ? " busy" : ""}`} disabled={busy}>
                {busy ? "Küldjük…" : "Küldj belépő linket"}
              </button>
            </form>
            {err && <p className="lxb-err" role="alert">{err}</p>}
            <p className="lxb-note">
              Ha jelszóval szoktál belépni, azt is <a href="/login">megteheted</a>.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
