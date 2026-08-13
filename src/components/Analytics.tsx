"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import "./analytics-consent.css";

// Consent-gated Google tags. GDPR-first: NOTHING loads and no cookie is
// written until the visitor explicitly accepts - hard-gating the scripts is
// simpler and stricter than Consent Mode. The choice persists in localStorage;
// "Elutasítom" is remembered and never nags again.
//
// Two independent loaders, each off until its env var is set:
//   NEXT_PUBLIC_GA_ID  (G-…)   - GA4 via gtag.js, wired directly in code.
//   NEXT_PUBLIC_GTM_ID (GTM-…) - the GTM container, for future marketing tags.
// IMPORTANT: do NOT also add the same G-… as a Google Tag inside the GTM
// container - pageviews would double-count.

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const KEY = "lx-consent"; // "granted" | "denied"

// GDPR 7. cikk (3): a hozzájárulás visszavonása legyen ugyanolyan egyszerű, mint
// a megadása. A footerekben ülő CookieSettingsButton ezt az eseményt küldi, amire
// a sáv újra megjelenik - a döntés így egy kattintással bármikor átírható.
const REOPEN_EVENT = "lx-consent-reopen";

/** Reopens the cookie banner from anywhere on the site (footer link). */
export function CookieSettingsButton({ className }: { className?: string }) {
  // Nothing to configure when neither tag is wired - don't offer a dead control.
  if (!GTM_ID && !GA_ID) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))}
    >
      Süti-beállítások
    </button>
  );
}

export function Analytics() {
  // null = no stored choice (show banner); undefined = not yet read (SSR-safe)
  const [consent, setConsent] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    try {
      setConsent(localStorage.getItem(KEY));
    } catch {
      setConsent("denied");
    }
  }, []);

  // Footer "Süti-beállítások" → show the banner again. The stored choice stays
  // in force until a new one is made, so abandoning the banner changes nothing.
  useEffect(() => {
    const onReopen = () => setConsent(null);
    window.addEventListener(REOPEN_EVENT, onReopen);
    return () => window.removeEventListener(REOPEN_EVENT, onReopen);
  }, []);

  if (!GTM_ID && !GA_ID) return null;

  const decide = (v: "granted" | "denied") => {
    let prev: string | null = null;
    try {
      prev = localStorage.getItem(KEY);
      localStorage.setItem(KEY, v);
    } catch {}
    setConsent(v);
    // Withdrawing after the tags already loaded: unmounting <Script> cannot
    // unload gtag/GTM from the live page, so reload to actually stop them.
    if (prev === "granted" && v === "denied") window.location.reload();
  };

  return (
    <>
      {consent === "granted" && GTM_ID && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}
      {consent === "granted" && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}

      {consent === null && (
        <div className="lx-consent" role="dialog" aria-label="Sütik">
          <p className="lx-consent-txt">
            Sütiket használunk a látogatottság méréséhez (Google Analytics). Részletek:{" "}
            <a href="/adatvedelem">Adatkezelési tájékoztató</a>.
          </p>
          <div className="lx-consent-btns">
            <button type="button" className="lx-consent-no" onClick={() => decide("denied")}>
              Elutasítom
            </button>
            <button type="button" className="lx-consent-yes" onClick={() => decide("granted")}>
              Elfogadom
            </button>
          </div>
        </div>
      )}
    </>
  );
}
