"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { inMetaWebview } from "@/lib/webview";
import { marketingContext, trackProgramCheckout } from "@/lib/track";
import { START } from "../copy";
import "../../ujrakezdes/ujrakezdes.css"; // the shared look: .lxu tokens
import "../start.css";
import "./fizetes.css";

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Stripe.js, loaded lazily and retryably.
 *
 * A module-scope promise is how the silent empty-checkout dead end happened:
 * one flaky fetch poisoned it for the session and every later attempt mounted
 * an empty frame. Clearing the memo on failure means a retry actually retries.
 */
let stripeMemo: Promise<Stripe | null> | null = null;
function getStripe(): Promise<Stripe | null> | null {
  if (!pk) return null;
  if (!stripeMemo) {
    stripeMemo = loadStripe(pk).catch((e) => { stripeMemo = null; throw e; });
  }
  return stripeMemo;
}

/**
 * /start/fizetes - the checkout.
 *
 * One job. The only things on the page are what is being bought, what it
 * costs, the consent the law requires, and the card form - plus one way back.
 * Everything else that could live here is a reason to stop.
 *
 * Stripe.js is fetched on mount rather than on a press: by the time someone
 * arrives here they have already decided, so the wait belongs before the tap,
 * not after it.
 */
export function PayPage({ sessionCount }: { sessionCount: number }) {
  const [consented, setConsented] = useState(false);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [webview, setWebview] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const consentRef = useRef<HTMLLabelElement>(null);

  useEffect(() => { trackProgramCheckout(START.role, "pay-page"); }, []);
  // Read after mount: the UA is not available on the server, and a render-time
  // read would hydrate-mismatch.
  useEffect(() => { setWebview(inMetaWebview()); }, []);

  // Warm Stripe.js immediately - never inside the consent branch, so the form
  // is ready the instant the tick lands.
  useEffect(() => {
    if (webview !== false) return;
    const p = getStripe();
    if (!p) { setErr(START.pay.unavailable); return; }
    let active = true;
    p.then((s) => { if (active && s) setStripe(s); })
      .catch(() => { if (active) setErr(START.pay.unavailable); });
    return () => { active = false; };
  }, [webview]);

  const createSession = useCallback(async (embedded: boolean) => {
    const res = await fetch("/api/stripe/program-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: START.role,
        immediateStart: true,
        embedded,
        where: "pay-page",
        marketing: marketingContext(),
      }),
    });
    const body = (await res.json()) as { clientSecret?: string; url?: string; error?: string };
    if (!res.ok) throw new Error(body.error ?? "checkout_failed");
    return body;
  }, []);

  const fetchClientSecret = useCallback(async () => {
    const b = await createSession(true);
    if (!b.clientSecret) throw new Error("no_client_secret");
    return b.clientSecret;
  }, [createSession]);

  /** Meta's in-app browser has failed embedded Stripe before, and most of this
   *  page's traffic lives there. It gets the hosted page - a redirect, but one
   *  that works. */
  const goHosted = useCallback(async () => {
    if (!consented) {
      requestAnimationFrame(() => {
        consentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
        consentRef.current?.classList.add("lxs-ask");
      });
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const b = await createSession(false);
      if (!b.url) throw new Error("no_url");
      window.location.href = b.url;
    } catch {
      setBusy(false);
      setErr(START.pay.failed);
    }
  }, [consented, createSession]);

  const consentRow = (
    <label className="lxs-consent" ref={consentRef}>
      <input
        type="checkbox"
        checked={consented}
        onChange={(e) => {
          setConsented(e.target.checked);
          setErr(null);
          consentRef.current?.classList.remove("lxs-ask");
        }}
      />
      <span>{START.consent(START.guaranteeDays)}</span>
    </label>
  );

  return (
    <main className="lxu lxs lxf">
      <header className="lxf-head">
        <Link href="/start" className="lxf-back">
          <LxIcon d={lxPaths.chevronLeft} size={16} sw={2.2} />
          {START.pay.backToPage}
        </Link>
        <span className="lp-mark">LEXFIT</span>
      </header>

      <div className="lxf-wrap">
        {/* What is being bought, stated once and completely. A summary that
            omits a fact the buyer would want is how a chargeback starts. */}
        <section className="lxf-order" aria-label={START.pay.orderHd}>
          <p className="lxf-eyebrow">{START.pay.orderHd}</p>
          <h1 className="lxf-title">{START.pay.orderTitle}</h1>
          <ul className="lxf-facts">
            {[
              `${sessionCount} edzés, sorrendbe rakva`,
              "Otthonra, eszköz nélkül",
              "Örökre a tiéd - nem jár le",
              `${START.guaranteeDays} nap pénzvisszafizetés, feltétel nélkül`,
            ].map((f) => (
              <li key={f}><LxIcon d={lxPaths.check} size={15} sw={2.4} />{f}</li>
            ))}
          </ul>
          <div className="lxf-total">
            <span>{START.pay.totalLabel}</span>
            <strong>{START.price}</strong>
          </div>
          <p className="lxf-once">{START.pay.onceNote}</p>
        </section>

        <section className="lxf-pay" aria-label={START.pay.hd}>
          <div className="lxs-paybox">
            {consentRow}

            {webview === null ? (
              <p className="lxs-await">{START.pay.loading}</p>
            ) : webview ? (
              // No panel to put a form in: the hosted page is a full
              // navigation, so the tick has to be given before we leave.
              <div className="lxf-hosted">
                <button
                  type="button"
                  className="lxs-cta"
                  disabled={busy}
                  onClick={() => void goHosted()}
                >
                  {busy ? START.pay.redirecting : START.pay.webviewCta}
                </button>
                <p className="lxf-hostednote">{START.pay.webviewNote}</p>
              </div>
            ) : err ? (
              <p className="lxs-err">{err}</p>
            ) : !consented ? (
              <p className="lxs-await">{START.pay.await}</p>
            ) : stripe ? (
              <div className="lxs-embed">
                <EmbeddedCheckoutProvider stripe={stripe} options={{ fetchClientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            ) : (
              <p className="lxs-await">{START.pay.loading}</p>
            )}
          </div>

          <div className="lxs-paytrust">
            {START.pay.trust.map((t) => <span key={t}>{t}</span>)}
          </div>

          <p className="lxf-legal">
            A vásárlással elfogadod az <Link href="/aszf">ÁSZF</Link>-et és az{" "}
            <Link href="/adatvedelem">Adatkezelési tájékoztatót</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
