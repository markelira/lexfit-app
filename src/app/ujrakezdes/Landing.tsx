"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
// The homepage's stylesheet IS this page's stylesheet. Everything below is
// scoped under `.lxl` and built from the landing's own primitives - `.hero`,
// `.wrap`, `.band-cream`, `.h-bold`, `.cap-body`, `.pill`, `.steps`, `.ism-*` -
// so /ujrakezdes and / are the same design rather than two designs that merely
// resemble each other. ujrakezdes.css then adds only what this page has and the
// homepage does not: the week card, and a few page-scoped adjustments.
import "@/app/landing.css";
import "./ujrakezdes.css";
import { LexMark } from "@/components/LexMark";
import PlanMail from "./PlanMail";
import * as C from "./copy";
import {
  ALEXA, FINAL_CTA, HERO, HERO_WEEK, IGY_NEZ_KI, ISMEROS, MASKEPP, PROOF,
  SECTION_LABEL,
} from "./copy";
import { trackUjrakezdesQuizStart, trackUjrakezdesView } from "@/lib/track";

// The ad landing page for the Szeptemberi Újrakezdés lead magnet.
//
// ── WHY IT LOOKS LIKE THE HOMEPAGE ───────────────────────────────────────────
// It is the same company and, for most of these visitors, the first and second
// page they will ever see of it. A funnel whose landing page has its own visual
// language teaches people that the ad and the product are different things,
// which is the one impression a cold-traffic page cannot afford.
//
// ── WHERE IT DELIBERATELY DIVERGES ───────────────────────────────────────────
// The homepage exists to let somebody explore; this page exists to get one
// click. So the hero nav carries the wordmark and NO links - a nav here is a row
// of exits - and the page has exactly one destination, repeated three times.
//
// Research: docs/funnel-research/03-landing-page.md, 06-design-craft.md.

/** Scroll-reveal, mirroring the homepage's own `Rise` so both pages animate
 *  identically: one shot, unobserved after firing, and flattened by the
 *  reduced-motion rules that already cover `.rise`. */
function Rise({
  className = "", children, id, style,
}: { className?: string; children: ReactNode; id?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { setShown(true); io.unobserve(e.target); } }),
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} id={id} style={style} className={`${className} rise${shown ? " in" : ""}`}>
      {children}
    </div>
  );
}

/** The one link on the page, used three times. Module scope, not inline: a
 *  component created during render gets a new identity on every pass. */
function Cta({ variant = "dark" }: { variant?: "dark" | "outline" | "sage" }) {
  return (
    <Link
      href="/ujrakezdes/terv"
      className={`pill pill-${variant}`}
      onClick={trackUjrakezdesQuizStart}
    >
      {HERO.cta}
    </Link>
  );
}

export default function Landing() {
  useEffect(() => { trackUjrakezdesView(); }, []);

  // The sticky bar REPLACES the hero's button once it leaves the screen. Two
  // live CTAs at once is two asks, not one reinforced.
  const heroCta = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = heroCta.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => setStuck(!!e && !e.isIntersecting),
      { rootMargin: "-8px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="lxl u-lp">
      {/* ═══ Hero ══════════════════════════════════════════════════════════ */}
      <header className="hero">
        <div className="wrap hero-inner">
          <div className="hero-nav">
            <span className="wordmark"><LexMark />LEXFIT</span>
          </div>

          <div className="hero-body">
            <div className="hero-copy">
              <div className="hero-eyebrow">{HERO.eyebrow}</div>
              <h1>{HERO.headline[0]}<br /><b>{HERO.headline[1]}</b></h1>
              <p className="body">{HERO.sub}</p>

              <div className="hero-row" ref={heroCta}>
                <Cta />
                <span className="hero-cta2 u-ctasub">{HERO.ctaSub}</span>
              </div>

              <div className="hero-chips">
                {HERO.chips.map((c) => <span key={c}>{c}</span>)}
              </div>

              {/* The damaging admission, in the slot the homepage gives its price
                  line - same position, same weight, same job. */}
              <div className="hero-price">{HERO.honest}</div>
            </div>

            {/* The homepage puts a photograph of Alexa here. This page puts
                the thing the quiz actually hands over - and puts it in the form
                it arrives in, as the email. Same <PlanMail> the gate renders
                with a real week, so the sample here cannot drift away from what
                the funnel produces. A portrait is not evidence of a plan. */}
            <div className="hero-device u-weekdevice">
              <PlanMail
                headline={C.REVEAL.b1.hd}
                sampleTag={HERO_WEEK.sampleTag}
                cta="Megnyitom a tervem"
                stats={[...HERO_WEEK.stats]}
                answersLead={HERO_WEEK.answersLead}
                answers={HERO_WEEK.answers}
                days={HERO_WEEK.days.map((d) => ({
                  key: d.d,
                  short: d.d,
                  training: d.on,
                  ...(d.on ? { minutes: 30 } : {}),
                }))}
              />
              <p className="u-weeknote">{HERO_WEEK.note}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ 1 · The problem ═══════════════════════════════════════════════
          The homepage's own `#ismeros` layout, class for class: a narrow centred
          column (`.ism`) with the white rule card (`.ism-rules`) under it. The
          three ad angles ride in the homepage's `.starter-facts` chips, which is
          what that page uses for a scannable row of short facts. */}
      <div className="band-cream sec-first" id="ismeros">
        <Rise className="wrap seq ism">
          <div className="eyebrow">{SECTION_LABEL.ismeros}</div>
          <h2 className="h-bold ism-h">{ISMEROS.heading}</h2>
          <p className="cap-body ism-b">{ISMEROS.body}</p>

          <div className="starter-facts">
            {ISMEROS.angles.map((a) => <span key={a.label}>{a.label}</span>)}
          </div>

          <div className="ism-rules">
            <b className="ism-lead">{ISMEROS.convergeLead}</b>
            <ul>
              {ISMEROS.angles.map((a) => <li key={a.line}>{a.line}</li>)}
            </ul>
          </div>
        </Rise>
      </div>

      {/* ═══ 2 · The mechanism ════════════════════════════════════════════
          The homepage's `heted-band` layout: navy ground, eyebrow, a large
          `.starter-title` statement, body, the payload, then a sage pill. On the
          homepage the payload is the WeekPicker; here it is the two rules, set
          in `.aq-promise` - the same mono list that carries her three promises
          in the homepage's Alexa section. */}
      <div className="band-navy sec heted-band" id="maskepp">
        <Rise className="wrap seq">
          <div className="eyebrow u-eyebrow-d">{SECTION_LABEL.maskepp}</div>
          <h2 className="starter-title u-title-d">{MASKEPP.title}</h2>
          <p className="cap-body u-body-d">{MASKEPP.lead}</p>

          <ul className="aq-promise u-mech-rules">
            {MASKEPP.rules.map((r) => (
              <li key={r.hd}>
                <b>{r.hd}</b>
                <span>{r.body}</span>
              </li>
            ))}
          </ul>

          <p className="cap-body u-body-d">{MASKEPP.foot}</p>
          <Cta variant="sage" />
        </Rise>
      </div>

      {/* ═══ 3 · How it works ═════════════════════════════════════════════
          The homepage's `#hogyan` band, unchanged: centred head, `.steps` row of
          three real screenshots. */}
      <div className="band-cream sec-sm" id="igy">
        <div className="wrap">
          <Rise className="seq" style={{ textAlign: "center" }}>
            <div className="eyebrow">{SECTION_LABEL.igy}</div>
            <h2 className="h-bold" style={{ marginTop: 10 }}>{IGY_NEZ_KI.heading}</h2>
            <p className="cap-body">{IGY_NEZ_KI.lead}</p>
          </Rise>
          <Rise className="steps seq">
            {IGY_NEZ_KI.steps.map((s, i) => (
              <div className="step" key={s}>
                <span className="step-n">{i + 1}</span>
                <div className="frame step-shot">
                  <Image
                    src={IGY_NEZ_KI.shots[i]!}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 60vw, 208px"
                  />
                </div>
                <span className="step-b">{s}</span>
              </div>
            ))}
          </Rise>
        </div>
      </div>

      {/* ═══ 4 · Alexa ════════════════════════════════════════════════════
          The homepage's Alexa layout: pull quote, `.ax-story` column, the
          `.founder-facts` chips, the vow and the signature. The community count
          is one of those chips now - it was carrying a 276px band by itself. */}
      <div className="band-navy sec u-ax" id="alexa">
        <div className="wrap">
          <Rise className="ax-headin seq">
            <div className="eyebrow u-eyebrow-d">{SECTION_LABEL.alexa}</div>
            <h2 className="alexa-pull-big">{ALEXA.pull}</h2>
          </Rise>
          <Rise className="ax-inner seq">
            <div className="ax-story">
              <p>{ALEXA.story}</p>
              <p>{PROOF.lead}</p>
            </div>
            <div className="starter-facts founder-facts">
              {ALEXA.facts.map((f) => <span key={f}>{f}</span>)}
            </div>
            <p className="aq-vow">{ALEXA.promise}</p>
            <p className="aq-sign">- {ALEXA.name}</p>
          </Rise>
        </div>
      </div>

      {/* ═══ 5 · The ask ══════════════════════════════════════════════════
          The homepage's `Panel` interior: `.ticon.center` - thin heading, body,
          pill - inside a `.panel.panel-pad`. */}
      <div className="band-cream sec" id="close">
        <div className="wrap">
          <Rise className="panel panel-pad">
            <div className="ticon center">
              <div className="eyebrow">{SECTION_LABEL.close}</div>
              <h3 className="h-thin">{FINAL_CTA.heading}</h3>
              <div className="body">{FINAL_CTA.body}</div>
              <Cta />
            </div>
          </Rise>
        </div>
      </div>

      {/* Mobile sticky bar. Hidden with `visibility`, so its link never sits in
          the tab order while parked. */}
      <div className={`u-sticky${stuck ? " on" : ""}`} aria-hidden={!stuck}>
        <Cta />
      </div>
    </div>
  );
}
