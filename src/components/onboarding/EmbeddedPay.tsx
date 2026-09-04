"use client";

import { useCallback, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { fetchEmbeddedClientSecret, type Consents } from "@/lib/billing";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { type PayPlan } from "./paywall";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf } from "@/lib/pricing/display";
import { nextChargeLabel, type RenewalRole } from "@/lib/pricing/renewal";
import { GARANCIA, GUARANTEE_LIVE, PAY_STEP } from "@/components/landing/offer-copy";

// Stripe.js is loaded lazily, once, at module scope (publishable key is public).
const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

// The funnel's recurring plans need both consents (J1 auto-renew + J2 immediate
// start); the single compact checkbox below covers both, and the server records
// the consent before the session is created.
const CONSENTS: Consents = { autoRenew: true, immediateStart: true };

/** The pre-payment renewal sentence for one plan.
 *
 *  The date is resolved AFTER mount on purpose: /register is a statically
 *  prerendered route, so a date computed during render would be frozen at build
 *  time and shown to every visitor forever. Until it resolves the sentence just
 *  omits the date clause - shorter, never wrong. */
function useRenewalLine(role: string): string {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(Date.now()), []);

  const intro = formatHuf(PRICES.week_intro.amountHuf);
  const weekStd = formatHuf(PRICES.week_std.amountHuf);
  const month = formatHuf(PRICES.month_std.amountHuf);
  const annual = formatHuf(PRICES.annual_std.amountHuf);

  if (today == null) {
    if (role === "month_std") return PAY_STEP.renewalPending.month_std(month);
    if (role === "annual_std") return PAY_STEP.renewalPending.annual_std(annual);
    return PAY_STEP.renewalPending.week_intro(intro, weekStd);
  }
  const date = nextChargeLabel(role as RenewalRole, today);
  if (role === "month_std") return PAY_STEP.renewal.month_std(month, date);
  if (role === "annual_std") return PAY_STEP.renewal.annual_std(annual, date);
  return PAY_STEP.renewal.week_intro(intro, weekStd, date);
}

// Embedded Stripe Checkout mounted on the pay step (E2). The user can still
// change the plan here (no need to go back) - the selection is controlled by the
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
  const renewalLine = useRenewalLine(selected.role);

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
          {/* The guarantee sits ABOVE the selector and is deliberately quiet:
              it de-risks the choice, it must not compete with it, so it has no
              CTA of its own (offer v3 §6 "one goal per screen"). */}
          {GUARANTEE_LIVE && (
            <p className="fnl-guarantee">
              <b>{GARANCIA.shortLead}</b>{GARANCIA.shortBody}
            </p>
          )}

          {/* Same summary-card style - but all three are selectable here, so the
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

          {/* Hard rule 7: the renewal amount AND the next charge date are shown
              before the visitor pays, not after, and not only inside Stripe. */}
          <p className="fnl-renewal">{renewalLine}</p>

          <label className="fnl-check">
            <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)} />
            <span>
              Elfogadom, hogy az előfizetés a fenti ár és periódus szerint automatikusan megújul,
              a szolgáltatás azonnal elindul, és elállás esetén az igénybe vett időszakra időarányos
              díj számolható el - <a href="/aszf">részletek</a>.
            </span>
          </label>
          <button className="fnl-cta" disabled={!consented} onClick={() => setReady(true)}>
            Tovább a fizetéshez
          </button>
          <p className="fnl-alt">{PAY_STEP.cancelLine}</p>
          <div className="fnl-paytrust">
            {PAY_STEP.trust.map((t) => <span key={t}>{t}</span>)}
          </div>
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
