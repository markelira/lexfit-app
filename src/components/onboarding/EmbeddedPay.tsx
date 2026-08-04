"use client";

import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { fetchEmbeddedClientSecret, type Consents } from "@/lib/billing";

// Stripe.js is loaded lazily, once, at module scope (publishable key is public).
const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

// The funnel's recurring plans need both consents (J1 auto-renew + J2 immediate
// start); the single compact checkbox below covers both, and the server records
// the consent before the session is created.
const CONSENTS: Consents = { autoRenew: true, immediateStart: true };

// Embedded Stripe Checkout mounted on the pay step (E2). Consent gates it; once
// given, we create the session (server-side consent record) and mount Stripe's
// own secure checkout inline. On success Stripe returns to /app?sub=success,
// where confirmCheckout grants access.
export function EmbeddedPay({
  role,
  planLabel,
  planPrice,
  planTerms,
}: {
  role: string;
  planLabel: string;
  planPrice: string;
  planTerms: string;
}) {
  const [consented, setConsented] = useState(false);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchClientSecret = useCallback(
    () =>
      fetchEmbeddedClientSecret(role, CONSENTS).catch((e) => {
        setErr("A fizetést most nem tudtuk elindítani. Próbáld újra.");
        throw e;
      }),
    [role],
  );

  return (
    <div className="fnl-pay">
      <div className="fnl-paysum">
        <span className="lbl mono">{planLabel}</span>
        <span className="amt tabular">{planPrice}</span>
        <span className="terms">{planTerms}</span>
      </div>

      {!ready && (
        <>
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
      )}

      {ready && stripePromise && !err && (
        <div className="fnl-embed">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}

      {ready && !stripePromise && (
        <p className="fnl-formerr">A fizetés jelenleg nem elérhető.</p>
      )}
      {err && (
        <div>
          <p className="fnl-formerr">{err}</p>
          <button className="fnl-cta" onClick={() => { setErr(null); setReady(false); }}>
            Vissza
          </button>
        </div>
      )}
    </div>
  );
}
