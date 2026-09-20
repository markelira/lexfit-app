"use client";

import { useEffect, useState } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { trackProgramPurchase } from "@/lib/track";
import { START } from "../copy";
import "../start.css";

type State = { phase: "working" | "done" | "slow"; email?: string | null };

/**
 * The moment the product is handed over (P1).
 *
 * The buyer has no account yet, so this screen has one job: tell them, in
 * their own address, where the way in just went. Anything else on the page
 * competes with the only instruction that matters.
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
        const b = (await res.json()) as { ok?: boolean; email?: string | null };
        if (!active) return;
        // `slow`, not `failed`: the webhook retries for three days and the
        // money is safe, so the honest message is "it is coming", not "it
        // broke". Saying failed would send a paying customer to support for
        // something that resolves itself.
        setState({ phase: b.ok ? "done" : "slow", email: b.email });
        if (b.ok) trackProgramPurchase(START.role, START.slug);
      } catch {
        if (active) setState({ phase: "slow" });
      }
    })();
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <main className="lxs">
      <section className="s-done">
        <span className="s-gic">
          <LxIcon d={lxPaths[state.phase === "done" ? "check" : "mail"]} size={26} sw={2} />
        </span>
        <p className="s-eyebrow">Megvan</p>
        <h1 className="s-h1">
          {state.phase === "working" ? "Egy pillanat…" : "Köszönöm, hogy belevágtál"}
        </h1>

        {state.phase === "done" && (
          <>
            <p className="s-sub">
              A programod a tiéd. Elküldtük a belépőd{state.email ? " ide:" : " emailben."}
              {state.email ? <> <strong>{state.email}</strong></> : null}
            </p>
            <div className="s-mailrow">
              <strong>Mi a következő lépés?</strong>
              Nyisd meg az emailt, állíts be egy jelszót, és a program azonnal megnyílik. Nem
              kell regisztrálnod - a fiókod már elkészült erre a címre. Ha pár percen belül
              nem látod, nézd meg a levélszemét mappát is.
            </div>
          </>
        )}

        {state.phase === "slow" && (
          <>
            <p className="s-sub">
              A fizetés megtörtént - a belépő emailed úton van. Néhány percet még kérhet.
            </p>
            <div className="s-mailrow">
              <strong>Semmi teendőd</strong>
              Ha negyedóra múlva sem látod a leveleinket (a levélszemét mappát is beleértve),
              írj a <a href="mailto:hello@lexfit.hu">hello@lexfit.hu</a> címre, és kézzel
              nyitjuk meg a hozzáférésed.
            </div>
          </>
        )}
      </section>
    </main>
  );
}
