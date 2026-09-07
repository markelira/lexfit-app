"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./ujrakezdes.css";
import { ALEXA, HERO, IGY_NEZ_KI, ISMEROS, MASKEPP } from "./copy";
// The two forgiveness rules appear here AND on the landing/#ismeros section, so
// per the repo's single-source rule they are defined once in offer-copy.ts and
// imported - not restated in this file.
import { ISMEROS as OFFER_ISMEROS } from "@/components/landing/offer-copy";
import { trackUjrakezdesQuizStart, trackUjrakezdesView } from "@/lib/track";

// The ad landing page (spec §1). One job: get the click into the wizard.
//
// Everything below the fold is for scrollers only - the spec is explicit that
// the hero has to stand alone, because most of the paid traffic decides in the
// first screen and never scrolls. So the CTA appears twice and says the same
// thing both times, and nothing between them introduces a second ask.

export default function Landing() {
  useEffect(() => { trackUjrakezdesView(); }, []);

  const cta = (
    <div className="u-ctawrap">
      <Link href="/ujrakezdes/terv" className="u-cta" onClick={trackUjrakezdesQuizStart}>
        {HERO.cta}
      </Link>
    </div>
  );

  return (
    <main className="lxu">
      {/* The hero is a full-bleed sage card inset 16px with a 28px radius - the
          same signature as the landing page's. On cold traffic arriving from an
          ad, the first screen has to be unmistakably LEXFIT before it is
          anything else, and a flat cream page is not. */}
      <header className="u-herocard">
        <p className="u-eyebrow">LEXFIT</p>
        <h1>{HERO.headline}</h1>
        <p className="u-sub">{HERO.sub}</p>
        <p className="u-audience">{HERO.audience}</p>
        {cta}
        <ul className="u-chips">
          {HERO.chips.map((c) => <li key={c} className="u-chip">{c}</li>)}
        </ul>
      </header>

      <div className="u-wrap">

        <section className="u-sec" aria-labelledby="u-ismeros">
          <h2 id="u-ismeros">{ISMEROS.heading}</h2>
          <p>{ISMEROS.body}</p>
        </section>

        <section className="u-sec" aria-labelledby="u-maskepp">
          <h2 id="u-maskepp">{MASKEPP.heading}</h2>
          <p>{MASKEPP.body}</p>
          {/* The two forgiveness rules are the differentiator, so they get a
              surface of their own instead of being buried in the paragraph. */}
          <ul className="u-rules">
            {OFFER_ISMEROS.rules.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </section>

        <section className="u-sec" aria-labelledby="u-igy">
          <h2 id="u-igy">{IGY_NEZ_KI.heading}</h2>
          <ol className="u-steps">
            {IGY_NEZ_KI.steps.map((s) => <li key={s}>{s}</li>)}
          </ol>

          {/* Two member finish cards, one male. Real ones from the existing set
              are an open item (docs/lead-magnet-v2-plan.md §8); the aspect ratio
              is reserved here so swapping them in causes no layout shift. */}
          <div className="u-proof">
            <figure><figcaption>tagi kép</figcaption></figure>
            <figure><figcaption>tagi kép</figcaption></figure>
          </div>
        </section>

        <section className="u-sec" aria-labelledby="u-alexa">
          <h2 id="u-alexa">{ALEXA.heading}</h2>
          <p>{ALEXA.body}</p>
          {cta}
        </section>
      </div>
    </main>
  );
}
