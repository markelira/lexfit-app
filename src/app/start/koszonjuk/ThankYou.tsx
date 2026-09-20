"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken, browserLocalPersistence, setPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { trackProgramPurchase } from "@/lib/track";
import { START } from "../copy";
import "./koszonjuk.css";

type Phase = "working" | "in" | "mailed" | "slow";
type State = { phase: Phase; email?: string | null };

/** How long the confirmation stays before it hands over, when they are already
 *  signed in. Long enough to read the line and see where they are going; short
 *  enough that nobody is left waiting on a screen with nothing to do. */
const HANDOFF_MS = 5000;

/**
 * The moment the product is handed over (P1).
 *
 * Its stylesheet is its OWN. It used to borrow the landing's, and when the
 * landing was rebuilt on a different layer every class this page names went
 * with it - the receipt screen rendered as unstyled text for anyone who paid.
 * A page this far downstream must not depend on the styling of a page that is
 * still being iterated.
 *
 * When the sign-in took, the page hands over to the app by itself rather than
 * waiting to be clicked: the purchase is done, they are already inside, and
 * the first workout is the point. The handoff is visible and cancels on ANY
 * sign of intent - a moved pointer, a key, a scroll, a touch - because it is a
 * convenience, not a rail. The other phases never auto-forward; there is
 * nowhere to send someone who is not signed in.
 */
export function ThankYou({ sessionId }: { sessionId: string | null }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ phase: "working" });
  const [handing, setHanding] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!sessionId) { setState({ phase: "slow" }); return; }
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/stripe/program-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const b = (await res.json()) as {
          ok?: boolean; email?: string | null; amountHuf?: number; customToken?: string;
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
        if (!b.customToken) { setState({ phase: "mailed", email: b.email }); return; }
        try {
          await setPersistence(auth, browserLocalPersistence);
          await signInWithCustomToken(auth, b.customToken);
          if (active) { setState({ phase: "in", email: b.email }); setHanding(true); }
        } catch {
          // Signing in is the nicety; the email is the guarantee. If the token
          // will not take, fall back to the path that always works rather than
          // showing an error for something they already own.
          if (active) setState({ phase: "mailed", email: b.email });
        }
      } catch {
        if (active) setState({ phase: "slow" });
      }
    })();
    return () => { active = false; };
  }, [sessionId]);

  const enter = useCallback(() => router.replace("/app"), [router]);

  // The handoff, and everything that calls it off.
  useEffect(() => {
    if (!handing) return;
    const stop = () => {
      if (cancelled.current) return;
      cancelled.current = true;
      setHanding(false);
    };
    const t = setTimeout(() => { if (!cancelled.current) enter(); }, HANDOFF_MS);
    const evs: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "wheel", "touchstart"];
    evs.forEach((e) => window.addEventListener(e, stop, { passive: true, once: true }));
    return () => {
      clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, stop));
    };
  }, [handing, enter]);

  const mail = state.email ? <strong>{state.email}</strong> : null;

  return (
    <main className="lxk">
      <div className="lxk-card">
        <span className={`lxk-mark${state.phase === "in" ? " ok" : ""}`} aria-hidden="true">
          <LxIcon
            d={state.phase === "in" ? lxPaths.check : lxPaths.mail}
            size={30}
            sw={2.2}
          />
        </span>

        <p className="lxk-eyebrow">Megvan</p>
        <h1>{state.phase === "working" ? "Egy pillanat…" : "A programod a tiéd"}</h1>

        {state.phase === "in" && (
          <>
            <p className="lxk-sub">
              Be is léptettünk - nem kell se regisztrálnod, se jelszót kitalálnod.
            </p>
            <button type="button" className="lxk-cta" onClick={enter}>
              Kezdjük az első edzést
            </button>
            {handing ? (
              <p className="lxk-handoff">
                <span className="bar" aria-hidden="true"><i /></span>
                Átviszünk az appba…
              </p>
            ) : (
              <p className="lxk-handoff quiet">Amikor készen állsz.</p>
            )}
            <div className="lxk-note">
              <strong>És ha később kilépnél?</strong>
              Elküldtük a belépőd {mail ?? "a megadott címre"} - abból bármikor
              visszajutsz, egy koppintással. Jelszóra soha nem lesz szükséged.
            </div>
          </>
        )}

        {state.phase === "mailed" && (
          <>
            <p className="lxk-sub">
              Elküldtük a belépőd {mail ?? "a megadott címre"}. Egy koppintás a
              linkre, és bent vagy - jelszó nem kell.
            </p>
            <div className="lxk-note">
              <strong>Mi a következő lépés?</strong>
              Nyisd meg az emailt, és koppints a gombra. Ha pár percen belül nem
              látod, nézd meg a levélszemét mappát is.
            </div>
          </>
        )}

        {state.phase === "slow" && (
          <>
            <p className="lxk-sub">
              A fizetés megtörtént - a belépőd úton van. Néhány percet még kérhet.
            </p>
            <div className="lxk-note">
              <strong>Semmi teendőd</strong>
              Ha negyedóra múlva sem látod a leveleinket (a levélszemét mappát is
              beleértve), írj a <a href="mailto:hello@lexfit.hu">hello@lexfit.hu</a>{" "}
              címre, és kézzel nyitjuk meg a hozzáférésed.
            </div>
          </>
        )}

        {state.phase === "working" && <p className="lxk-sub">Megerősítjük a fizetést.</p>}
      </div>
    </main>
  );
}
