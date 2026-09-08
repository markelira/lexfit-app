"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import "./ujrakezdes.css";
import { ALEXA, HERO, HERO_WEEK, IGY_NEZ_KI, ISMEROS } from "./copy";
import { trackUjrakezdesQuizStart, trackUjrakezdesView } from "@/lib/track";

// The ad landing page: ONE composition, nothing below it.
//
// It has a single job - get the click into the quiz - and it has to carry the
// whole argument in one screen on desktop, so hierarchy does the work that
// sections used to. Three tiers, and nothing competes across them:
//
//   1. the ask        headline, sub, CTA          - largest, left, first
//   2. the artifact   the week grid               - the one bold element
//   3. the argument   the pain, the steps, Alexa  - compact, subordinate
//
// The left column is the argument, the right is the product. On a phone the two
// stack and the composition runs a little past the fold, deliberately: fitting
// all of this inside 660px would mean shrinking everything into exactly the
// cramped grid this layout exists to avoid.

export default function Landing() {
  useEffect(() => { trackUjrakezdesView(); }, []);

  return (
    <main className="lxu u-hero">
      <div className="u-hero-grid">
        {/* ── The argument ─────────────────────────────────────────────── */}
        <div className="u-hero-copy">
          <p className="u-eyebrow">LEXFIT</p>

          <h1>{HERO.headline}</h1>
          <p className="u-sub">{HERO.sub}</p>
          <p className="u-audience">{HERO.audience}</p>

          {/* The recognition beat. Left as an aside rather than a section: it
              has to be readable without competing with the headline above it
              or the CTA below. */}
          <aside className="u-pain">
            <h2>{ISMEROS.heading}</h2>
            <p>{ISMEROS.body}</p>
            <p className="u-pain-answer">{ISMEROS.answer}</p>
          </aside>

          <div className="u-hero-cta">
            <Link
              href="/ujrakezdes/terv"
              className="u-cta"
              onClick={trackUjrakezdesQuizStart}
            >
              {HERO.cta}
            </Link>
            <ul className="u-chips">
              {HERO.chips.map((c) => <li key={c} className="u-chip">{c}</li>)}
            </ul>
          </div>
        </div>

        {/* ── The product ──────────────────────────────────────────────── */}
        <div className="u-hero-art">
          {/* The one bold element. It is the thing the quiz actually hands
              over, so it earns the space that a stock photograph would not. */}
          <figure className="u-weekcard">
            <figcaption>
              <span className="u-eyebrow">{HERO_WEEK.eyebrow}</span>
            </figcaption>
            <ul className="u-weekgrid">
              {HERO_WEEK.days.map((d, i) => (
                <li
                  key={d.d}
                  className={d.on ? "on" : ""}
                  style={{ ["--i" as string]: i }}
                >
                  <span className="d">{d.d}</span>
                  <span className="m">{d.on ? HERO_WEEK.train : HERO_WEEK.rest}</span>
                </li>
              ))}
            </ul>
            <p className="u-weeknote">{HERO_WEEK.note}</p>
          </figure>

          {/* Genuinely a sequence, so genuinely numbered. */}
          <ol className="u-flow">
            {IGY_NEZ_KI.stepsShort.map((s) => <li key={s}>{s}</li>)}
          </ol>

          {/* Alexa as a signature, not a section - a face and the one line that
              carries the register. */}
          <figure className="u-sig">
            <Image
              src="/alexa-av.jpg"
              alt=""
              width={52}
              height={52}
              className="u-sig-av"
            />
            <figcaption>
              <p className="u-sig-quote">{ALEXA.signature}</p>
              <p className="u-sig-name">
                <b>{ALEXA.name}</b> · {ALEXA.role}
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </main>
  );
}
