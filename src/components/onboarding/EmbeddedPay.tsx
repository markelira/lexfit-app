"use client";

import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { fetchEmbeddedClientSecret, type Consents } from "@/lib/billing";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

// Stripe.js is loaded lazily, once, at module scope (publishable key is public).
const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

// The funnel's recurring plans need both consents (J1 auto-renew + J2 immediate
// start); the single compact checkbox below covers both, and the server records
// the consent before the session is created.
const CONSENTS: Consents = { autoRenew: true, immediateStart: true };

export interface PayPlan {
  role: string;
  name: string;
  price: string;
  unit: string;
  sub: string;
  badge?: string;
}

// Embedded Stripe Checkout mounted on the pay step (E2). The user can still
// change the plan here (no need to go back) — the selection is controlled by the
// funnel (onRoleChange → answers.plan). Consent gates it; once "Tovább" is hit we
// lock the plan, create the session (server-side consent record), and mount
// Stripe's own secure checkout inline. Success returns to /app?sub=success.
export function EmbeddedPay({
  plans,
  role,
  onRoleChange,
}: {
  plans: PayPlan[];
  role: string;
  onRoleChange: (role: string) => void;
}) {
  const [consented, setConsented] = useState(false);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const selected = plans.find((p) => p.role === role) ?? plans[0];

  const fetchClientSecret = useCallback(
    () =>
      fetchEmbeddedClientSecret(selected.role, CONSENTS).catch((e) => {
        setErr("A fizetést most nem tudtuk elindítani. Próbáld újra.");
        throw e;
      }),
    [selected.role],
  );

  // Roving-focus arrow-key nav across the plan radios (a11y).
  const onKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const n = plans.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
    if (next < 0) return;
    e.preventDefault();
    onRoleChange(plans[next].role);
    (e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=radio]")[next])?.focus();
  };

  return (
    <div className="fnl-pay">
      {!ready ? (
        <>
          {/* Same summary-card style — but all three are selectable here, so the
              user can switch plan without going back. */}
          <div className="fnl-payopts" role="radiogroup" aria-label="Csomag">
            {plans.map((p, i) => {
              const on = p.role === selected.role;
              return (
                <button
                  key={p.role} type="button" role="radio" aria-checked={on}
                  className={`fnl-paysum fnl-payopt${on ? " on" : ""}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => onRoleChange(p.role)} onKeyDown={onKeyDown(i)}
                >
                  <span className="lbl mono">{p.name}</span>
                  <span className="amt tabular">{p.price} {p.unit}</span>
                  <span className="terms">{p.sub}</span>
                  <span className="fnl-paydot" aria-hidden="true">
                    {on && <LxIcon d={lxPaths.check} size={11} sw={2.6} />}
                  </span>
                </button>
              );
            })}
          </div>

          <label className="fnl-check">
            <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)} />
            <span>
              Elfogadom, hogy az előfizetés a fenti ár és periódus szerint automatikusan megújul,
              a szolgáltatás azonnal elindul, és elállás esetén az igénybe vett időszakra időarányos
              díj számolható el — <a href="/aszf">részletek</a>.
            </span>
          </label>
          <button className="fnl-cta" disabled={!consented} onClick={() => setReady(true)}>
            Tovább a fizetéshez
          </button>
          <p className="fnl-alt">Bármikor lemondható · 14 napos pénzvisszafizetési garancia</p>
        </>
      ) : (
        <>
          {/* Locked to the chosen plan; one tap to change it again. */}
          <div className="fnl-paysum">
            <span className="lbl mono">{selected.name}</span>
            <span className="amt tabular">{selected.price} {selected.unit}</span>
            <span className="terms">{selected.sub}</span>
            <button type="button" className="fnl-payedit" onClick={() => setReady(false)}>Módosítás</button>
          </div>

          {stripePromise && !err && (
            <div className="fnl-embed">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}
          {!stripePromise && <p className="fnl-formerr">A fizetés jelenleg nem elérhető.</p>}
          {err && (
            <div>
              <p className="fnl-formerr">{err}</p>
              <button className="fnl-cta" onClick={() => { setErr(null); setReady(false); }}>Vissza</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
