"use client";

import { useEffect, useState } from "react";
import { signInWithCustomToken, browserLocalPersistence, setPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { trackProgramPurchase } from "@/lib/track";
import { START } from "../copy";
import "../start.css";

type Phase = "working" | "in" | "mailed" | "slow";
type State = { phase: Phase; email?: string | null };

/**
 * The moment the product is handed over (P1).
 *
 * The buyer paid without an account, and the worst thing this screen can do is
 * send them to their inbox. It signs them in with the one-shot token the
 * fulfilment mints, so the next thing they touch is the first workout. The
 * access email still goes out - that is how they get back in next week, not how
 * they get in now.
 */
export function ThankYou({ sessionId }: { sessionId: string | null }) {
  const [state, setState] = useState<State>({ phase: "working" });

  useEffect(() => {
    if (!sessionId) {
      setState({ phase: "slow" });
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/stripe/program-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const b = (await res.json()) as {
          ok?: boolean;
          email?: string | null;
          amountHuf?: number;
          customToken?: string;
        };
        if (!active) return;
        if (!b.ok) {
          // `slow`, not `failed`: the webhook retries for three days and the
          // money is safe, so the honest message is "it is coming", not "it
          // broke". Saying failed would send a paying customer to support for
          // something that resolves itself.
          setState({ phase: "slow", email: b.email });
          return;
        }
        trackProgramPurchase(START.role, START.slug, b.amountHuf);
        if (!b.customToken) {
          setState({ phase: "mailed", email: b.email });
          return;
        }
        try {
          await setPersistence(auth, browserLocalPersistence);
          await signInWithCustomToken(auth, b.customToken);
          if (active) setState({ phase: "in", email: b.email });
        } catch {
          // Signing in is the nicety; the email is the guarantee. If the token
          // will not take (clock skew, a blocked third-party context), fall
          // back to the path that always works rather than showing an error
          // for something they already own.
          if (active) setState({ phase: "mailed", email: b.email });
        }
      } catch {
        if (active) setState({ phase: "slow" });
      }
    })();
    return () => { active = false; };
  }, [sessionId]);

  const mail = state.email ? <strong>{state.email}</strong> : null;

  return (
    <main className="lxs">
      <section className="s-done">
        <span className="s-gic">
          <LxIcon
            d={lxPaths[state.phase === "in" ? "check" : "mail"]}
            size={26}
            sw={2}
          />
        </span>
        <p className="s-eyebrow">Megvan</p>
        <h1 className="s-h1">
          {state.phase === "working" ? "Egy pillanat…" : "A programod a tiéd"}
        </h1>

        {state.phase === "in" && (
          <>
            <p className="s-sub">
              Be is léptettünk - nem kell se regisztrálnod, se jelszót kitalálnod.
              Kezdheted az első edzést.
            </p>
            <a className="s-cta" href="/app">Kezdjük az első edzést</a>
            <div className="s-mailrow">
              <strong>És ha később kilépnél?</strong>
              Elküldtük a belépőd {mail ?? "a megadott címre"} - abból bármikor
              visszajutsz, egy koppintással. Jelszóra soha nem lesz szükséged.
            </div>
          </>
        )}

        {state.phase === "mailed" && (
          <>
            <p className="s-sub">
              Elküldtük a belépőd {mail ?? "a megadott címre"}. Egy koppintás a
              linkre, és bent vagy - jelszó nem kell.
            </p>
            <div className="s-mailrow">
              <strong>Mi a következő lépés?</strong>
              Nyisd meg az emailt, és koppints a gombra. Ha pár percen belül nem
              látod, nézd meg a levélszemét mappát is.
            </div>
          </>
        )}

        {state.phase === "slow" && (
          <>
            <p className="s-sub">
              A fizetés megtörtént - a belépőd úton van. Néhány percet még kérhet.
            </p>
            <div className="s-mailrow">
              <strong>Semmi teendőd</strong>
              Ha negyedóra múlva sem látod a leveleinket (a levélszemét mappát is
              beleértve), írj a <a href="mailto:hello@lexfit.hu">hello@lexfit.hu</a>{" "}
              címre, és kézzel nyitjuk meg a hozzáférésed.
            </div>
          </>
        )}
      </section>
    </main>
  );
}
