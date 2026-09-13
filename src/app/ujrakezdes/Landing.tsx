"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import "./ujrakezdes.css";
import * as C from "./copy";
import { FinishExamples } from "@/components/finish/FinishExamples";
import { trackUjrakezdesLpCta, trackUjrakezdesView } from "@/lib/track";

// /ujrakezdes — the quiz-starter page (design-handoff rebuild, 2026-09-08).
//
// Section order per the handoff §5 - the order IS the design: S0 logo-only
// header → S1 sage hero with the CARD PAIR (empty week behind, finished plan
// in front - the transformation is the visual) → S2 what the quiz gives →
// S3 the problem mirror → S4 mechanism (navy) → S5 three real app screens →
// (S6 hidden: no consented member photos) → S7 Alexa (navy) → S8 close
// (accent) → S sticky bar (mobile).
//
// One interactive element type on the whole page: the CTA, and it says the
// same sentence everywhere - „Kérem a tervem". It names what they GET.
//
// The hero variant arrives as a PROP, resolved server-side in page.tsx from
// utm_content - no client flash, unknown values fall back to base.

/** The CTA target. utm_* params are forwarded because the quiz's readUtm()
 *  reads them on ITS page at submit - a bare link would drop attribution. */
function quizHref(): string {
  if (typeof window === "undefined") return "/ujrakezdes/terv";
  const p = new URLSearchParams(window.location.search);
  const keep = new URLSearchParams();
  for (const [k, v] of p) if (k.startsWith("utm_")) keep.set(k, v);
  const q = keep.toString();
  return q ? `/ujrakezdes/terv?${q}` : "/ujrakezdes/terv";
}

function Cta({ position, small = false }: { position: "hero" | "sticky" | "close"; small?: boolean }) {
  // The rendered href is the bare route (so Link prefetches it and SSR/client
  // markup agree); the utm-carrying URL is computed at CLICK time and pushed
  // client-side - which is also what M2 asks for: no full reload between the
  // landing and the first question.
  const router = useRouter();
  return (
    <Link
      href="/ujrakezdes/terv"
      className={`lp-cta${small ? " lp-cta-sm" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        trackUjrakezdesLpCta(position);
        router.push(quizHref());
      }}
    >
      {C.LP.hero.cta}
    </Link>
  );
}

export default function Landing({ variant = "base" }: { variant?: C.LpVariant }) {
  const router = useRouter();
  useEffect(() => { trackUjrakezdesView(variant); }, [variant]);

  const v = C.LP.hero.variants[variant];

  // S · sticky bar (M3, revised per the 2026-09-14 mobile review P1/3): the
  // first viewport has no CTA at all - the hero CTA sits below the card pair -
  // so the bar now arms on the FIRST scroll instead of only after the hero CTA
  // has passed. It still yields whenever an in-flow CTA is on screen (hero or
  // close), so two identical buttons are never visible at once.
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLElement>(null);
  const [stickyOn, setStickyOn] = useState(false);
  useEffect(() => {
    const h = heroCtaRef.current, c = closeRef.current;
    if (!h || !c || typeof IntersectionObserver === "undefined") return;
    let ctaVis = true, closeVis = false, scrolled = window.scrollY > 120;
    const upd = () => setStickyOn(scrolled && !ctaVis && !closeVis);
    // Read the LAST entry of each batch: a flick can cross "enters viewport"
    // and "leaves above" between two frames, and the observer then delivers
    // both crossings in ONE callback - entries[0] is the stale one.
    const io1 = new IntersectionObserver((es) => {
      const e = es[es.length - 1];
      ctaVis = !!e && e.isIntersecting;
      upd();
    });
    const io2 = new IntersectionObserver((es) => {
      const e = es[es.length - 1];
      closeVis = !!e && e.isIntersecting;
      upd();
    });
    const onScroll = () => { scrolled = window.scrollY > 120; upd(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    io1.observe(h);
    io2.observe(c);
    return () => { io1.disconnect(); io2.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <div className="lxu lp">
      {/* ── S0 · header: the logo, and deliberately nothing else. A nav on an
          ad landing page is a row of exits. ─────────────────────────────── */}
      <header className="lp-head">
        <span className="lp-mark">LEXFIT</span>
      </header>

      {/* ── S1 · hero (sage) ───────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow lp-m1" style={{ ["--i" as string]: 0 }}>{C.LP.hero.eyebrow}</p>

            {/* The two-weight headline; the base variant sets the „7" in
                display size (handoff §6). */}
            <h1 className="lp-m1" style={{ ["--i" as string]: 1 }}>
              {variant === "base" ? (
                <><span className="lp-h-num">7</span><span className="lp-h-rest"><em>kérdés,</em> és kész a heti edzésterved.</span></>
              ) : (
                v.hd
              )}
            </h1>

            <p className="lp-lead lp-m1" style={{ ["--i" as string]: 2 }}>{v.lead}</p>
            <p className="lp-anti lp-m1" style={{ ["--i" as string]: 3 }}>{C.LP.hero.antiAvatar}</p>

            <ul className="lp-chips lp-m1" style={{ ["--i" as string]: 4 }}>
              {C.LP.hero.chips.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <p className="lp-second lp-m1" style={{ ["--i" as string]: 5 }}>{C.LP.hero.second}</p>

          </div>

          {/* The card pair (M4): the empty week stays perfectly still - the
              contrast is the point - while the finished plan assembles once. */}
          <div className="lp-pair lp-m1" style={{ ["--i" as string]: 8 }} aria-hidden="true">
            <div className="lp-mock lp-mock-empty">
              <p className="lp-tag"><b>{C.LP.mock.emptyTag}</b><span>{C.LP.mock.emptyNote}</span></p>
              <ul className="lp-week">
                {C.LP.mock.days.map((d) => (
                  <li key={d.d}><span className="d">{d.d}</span><span className="dot" /></li>
                ))}
              </ul>
            </div>

            <p className="lp-bridge">{C.LP.mock.bridge}</p>

            <div className="lp-mock lp-mock-done">
              <p className="lp-tag"><b>{C.LP.mock.doneTag}</b><span>{C.LP.mock.doneNote}</span></p>
              <ul className="lp-week">
                {C.LP.mock.days.map((d, i) => (
                  <li key={d.d} className={d.on ? "on lp-m4" : ""} style={{ ["--i" as string]: i }}>
                    <span className="d">{d.d}</span><span className="dot" />
                  </li>
                ))}
              </ul>
              <dl className="lp-bar3 lp-m4" style={{ ["--i" as string]: 8 }}>
                {C.LP.mock.stats1.map((f) => (
                  <div key={f.l}><dt>{f.v}</dt><dd>{f.l}</dd></div>
                ))}
              </dl>
              {C.LP.mock.stats2.length > 0 && (
                <dl className="lp-bar3 lp-m4" style={{ ["--i" as string]: 10 }}>
                  {C.LP.mock.stats2.map((f) => (
                    <div key={f.l}><dt>{f.v}</dt><dd>{f.l}</dd></div>
                  ))}
                </dl>
              )}
              <ul className="lp-mchips lp-m4" style={{ ["--i" as string]: 12 }}>
                {C.LP.mock.chips.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>

            <p className="lp-mocknote">{C.LP.mock.note}</p>
            <p className="lp-dream">{C.LP.mock.dream}</p>
          </div>

          {/* The CTA block. Third grid area on purpose: the wireframe's mobile
              order is headline → card pair → CTA, while desktop keeps the CTA
              under the copy - grid areas do the repositioning, the DOM order
              stays the mobile one. */}
          <div className="lp-hero-after">
            <div className="lp-ctarow lp-m1" style={{ ["--i" as string]: 6 }} ref={heroCtaRef}>
              <Cta position="hero" />
              <p className="lp-ctasub">{C.LP.hero.ctaSub}</p>
            </div>

            <div className="lp-mechrow lp-m1" style={{ ["--i" as string]: 7 }}>
              <p><b>{C.LP.hero.mechanism}</b></p>
              <p className="lp-xs">{C.LP.hero.mechanismSub}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── S2 · what the quiz gives ───────────────────────────────────────── */}
      <section className="lp-band">
        <div className="lp-col">
          <p className="lp-eyebrow">{C.LP.results.eyebrow}</p>
          <h2>{C.LP.results.hd}</h2>
          <p className="lp-body">{C.LP.results.lead}</p>

          <ol className="lp-deliv">
            {C.LP.results.items.map((it, i) => (
              <li key={it.b}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <span><b>{it.b}</b> {it.d}</span>
              </li>
            ))}
          </ol>

          <div className="lp-qprev">
            <p className="lp-label">{C.LP.results.qTitle}</p>
            <ul>
              {C.LP.results.qChips.map((q) => <li key={q}>{q}</li>)}
            </ul>
            <p className="lp-xs">{C.LP.results.qNote}</p>
          </div>
        </div>
      </section>

      {/* ── S3 · the problem mirror ────────────────────────────────────────── */}
      <section className="lp-band lp-tight">
        <div className="lp-col">
          <p className="lp-eyebrow">{C.LP.problem.eyebrow}</p>
          <h2>{C.LP.problem.hd}</h2>
          <p className="lp-body">{C.LP.problem.body}</p>
          <p className="lp-body">{C.LP.problem.body2}</p>

          <ul className="lp-segchips">
            {C.LP.problem.chips.map((c, i) => <li key={c} className={i === 0 ? "on" : ""}>{c}</li>)}
          </ul>
          <p className="lp-listtitle">{C.LP.problem.listTitle}</p>
          <ul className="lp-lines">
            {C.LP.problem.lines.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </div>
      </section>

      {/* ── S4 · the mechanism (navy) ──────────────────────────────────────── */}
      <section className="lp-band lp-dark">
        <div className="lp-col">
          <p className="lp-eyebrow">{C.LP.mech.eyebrow}</p>
          <h2>{C.LP.mech.hd}</h2>
          <ol className="lp-rules">
            {C.LP.mech.rules.map((r, i) => (
              <li key={r.b}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <span><b>{r.b}</b> {r.d}</span>
              </li>
            ))}
          </ol>
          <p className="lp-body">{C.LP.mech.foot}</p>
        </div>
      </section>

      {/* ── S5 · how it looks ──────────────────────────────────────────────── */}
      <section className="lp-band">
        <div className="lp-col lp-col-wide">
          <p className="lp-eyebrow">{C.LP.how.eyebrow}</p>
          <h2>{C.LP.how.hd}</h2>
          <p className="lp-body">{C.LP.how.lead}</p>

          <ol className="lp-steps">
            {C.LP.how.steps.map((s, i) => (
              <li key={s}>
                <div className="lp-shot">
                  <Image src={C.LP.how.shots[i]!} alt="" fill sizes="(max-width: 1023px) 60vw, 280px" />
                </div>
                <span className="n">{i + 1}</span>
                <p>{s}</p>
              </li>
            ))}
          </ol>
          <p className="lp-xs lp-honest">{C.LP.how.foot}</p>
        </div>
      </section>

      {/* ── S6 · „Akik már csinálják" — UNLOCKED 2026-09-14: the consented
          member photos shipped on the reveal B5; the same belt renders here.
          Tapping a card is a quiz start - on this page every road leads to
          the same door. ───────────────────────────────────────────────────── */}
      <section className="lp-band lp-tight lp-members">
        <div className="lp-col">
          <p className="lp-eyebrow">{C.LP.members.eyebrow}</p>
          <h2>{C.LP.members.hd}</h2>
        </div>
        <div className="lp-members-belt">
          <FinishExamples
            onPick={() => {
              trackUjrakezdesLpCta("members");
              router.push(quizHref());
            }}
          />
        </div>
        <div className="lp-col">
          <p className="lp-xs">{C.LP.members.honesty}</p>
        </div>
      </section>

      {/* ── S7 · Alexa (navy) ──────────────────────────────────────────────── */}
      <section className="lp-band lp-dark">
        <div className="lp-col lp-alexa">
          <div>
            <p className="lp-eyebrow">{C.LP.alexa.eyebrow}</p>
            <h2>{C.LP.alexa.quote}</h2>
            <p className="lp-body">{C.ALEXA.story}</p>
            <p className="lp-body">{C.ALEXA.promise}</p>
            <ul className="lp-chips lp-chips-d">
              {C.LP.alexa.chips.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
          {/* Her real photo. No play chrome: a 30s video does not exist in the
              repo, and a play button over a still would be a false affordance.
              If the video lands, this is where the tap-to-play poster goes.
              The mat shot, not the gymnastics one (review 2026-09-14 P2/5): a
              contortion pose beside „egy matracon kezdtem újra" argues with
              the quote; the credential lives in the „10 év versenysport" chip. */}
          <div className="lp-alexa-photo">
            <Image src="/hero-alexa.jpg" alt="Alexa" width={420} height={520} sizes="(max-width: 1023px) 80vw, 380px" />
          </div>
        </div>
      </section>

      {/* ── S8 · the close (accent) ────────────────────────────────────────── */}
      <section className="lp-band lp-acc" ref={closeRef}>
        <div className="lp-col lp-close">
          <p className="lp-eyebrow">{C.LP.close.eyebrow}</p>
          <h2>{C.LP.close.hd}</h2>
          <p className="lp-body">{C.LP.close.lead}</p>
          <Cta position="close" />
          <p className="lp-xs">{C.LP.close.ctaSub}</p>
          <p className="lp-legal">
            {C.LP.close.legal}{" "}
            <Link href="/adatvedelem" className="lp-privacy">{C.LP.close.privacy}</Link>
          </p>
        </div>
      </section>

      {/* ── S · sticky bar (mobile only, M3) ───────────────────────────────── */}
      <div className={`lp-sticky${stickyOn ? " on" : ""}`} aria-hidden={!stickyOn}>
        <div className="lp-sticky-p">
          <b>{C.LP.sticky.line}</b>
          <span>{C.LP.sticky.sub}</span>
        </div>
        <Cta position="sticky" small />
      </div>
    </div>
  );
}
