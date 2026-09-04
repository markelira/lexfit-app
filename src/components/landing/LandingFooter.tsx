"use client";

import { CookieSettingsButton } from "@/components/Analytics";

// The page footer, lifted out of the #elofizetes band (offer v3 restructure).
//
// It used to be nested INSIDE the pricing band's <div>, which was fine while
// #elofizetes was the last section on the page. Offer v3 moves #gyik below the
// pricing band, so a footer that lives inside #elofizetes would render in the
// middle of the page. Extracting it also lets /arak reuse it verbatim rather
// than growing a second, drifting copy.
export function LandingFooter() {
  return (
    <div className="foot">
      <div className="help">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
        <span>Kérdésed van? Írj nekünk, és segítünk - <a href="mailto:hi@lexfit.hu">hi@lexfit.hu</a></span>
      </div>
      <div className="legal">
        <a href="/arak">Árak</a> | <a href="/aszf">Felhasználási feltételek</a> |{" "}
        <a href="/adatvedelem">Adatvédelem</a> | <a href="/impresszum">Impresszum</a> |{" "}
        <CookieSettingsButton className="lx-cookie-btn" />
      </div>
    </div>
  );
}
