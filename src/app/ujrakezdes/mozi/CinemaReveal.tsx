"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { FinishExamples } from "@/components/finish/FinishExamples";
import * as C from "../copy";
import "./mozi.css";

// ─────────────────────────────────────────────────────────────────────────────
// THE CINEMATIC REVEAL - prototype, /ujrakezdes/mozi
//
// The problem it exists to solve: today the reveal drops a 7-screen page on
// someone the instant she finishes the quiz. Everything is present at once, so
// nothing is emphasised, and the page has to win attention it was never given.
// 42 people reached the offer on Sep 14 and none clicked.
//
// This turns the same material into four timed beats. Each beat owns ONE thing
// to look at, ONE thing to feel and ONE thing to conclude - and only after the
// fourth does the full page (and the price) exist. Sequence is the argument.
//
// ── The four beats ───────────────────────────────────────────────────────────
//  1 · A TERVED      look: her own week      feel: "ez rólam szól"
//                    think: "tényleg elkészült"
//      Psychology: IKEA effect + endowment - she built this with her seven
//      answers, so it is already hers before anything is asked of her.
//
//  2 · A HÓNAPOD     look: four weeks        feel: "ezt kibírom"
//                    think: "nem csak egy hetet kapok"
//      Psychology: Zeigarnik - week 1 is done, weeks 2-4 are an open loop the
//      mind wants closed. Loss aversion is answered pre-emptively: the missed
//      week does not reset anything.
//
//  3 · AZ ELSŐ EDZÉS look: a real workout    feel: "ez valódi és azonnali"
//                    think: "megnézhetem fizetés előtt"
//      Psychology: zero-price effect + reciprocity. The free thing arrives
//      BEFORE the ask, and it is the product itself, not a brochure.
//
//  4 · NEM EGYEDÜL   look: real members      feel: "olyanok, mint én"
//                    think: "ez működik másoknak"
//      Psychology: social proof + similarity. Placed last on purpose: proof
//      answers the doubt that the first three beats have just created.
//
// ── Craft rules (apple-design) ───────────────────────────────────────────────
//  · Agency over spectacle: it auto-advances, but tap-right/tap-left/swipe
//    always win, holding pauses, and "Kihagyom" is on screen from the first
//    frame. A cinematic that traps you is a cutscene, and people skip those.
//  · Interruptible: the timer is wall-clock based, not a CSS animation that
//    cannot be grabbed - pausing resumes from where it actually stopped.
//  · Motion is entrance-only and compositor-only (transform/opacity), so a
//    slow device degrades to "arrives plainly", never to jank.
//  · prefers-reduced-motion collapses every entrance to a short cross-fade and
//    stops auto-advance entirely - vestibular safety outranks the effect.
// ─────────────────────────────────────────────────────────────────────────────

export interface CinemaPlan {
  days: { short: string; training: boolean }[];
  trainingCount: number;
  minutes: number;
  firstWorkout: { title: string; theme: string; mins: number; poster: string };
}

/** Per-beat dwell. Long enough to read the one line, short enough that nobody
 *  feels held: beat 2 carries the most to absorb, beat 4 the least. */
/* Beat 5 is 0: the offer never auto-advances. Every beat before it is paced
   by us; the one that asks for money is paced by her. */
const DWELL = [4600, 5600, 5000, 4200, 0];

export interface CinemaOffer {
  intro: string;
  weekStd: string;
  href: string;
  onGo: (e: React.MouseEvent) => void;
  guarantee?: string;
  /** "Ma: 490 Ft → szeptember 21-től 1 990 Ft / hét." Resolved by the caller,
   *  because the date needs today's clock and this route is prerendered. */
  timeline?: string;
  /** The annual plan's per-day figure, shown NEXT TO the weekly price and
   *  never instead of it. */
  perDay?: string;
  /** Up to two lines answering what she told the quiz. Empty falls back to
   *  the generic three - a fabricated "personal" line is worse than none. */
  fit?: string[];
}

export function CinemaReveal({ plan, offer, onDone, start = 0 }: {
  plan: CinemaPlan;
  /** Beat 5. The price exists ONLY here - everything before it is the case. */
  offer: CinemaOffer;
  onDone: () => void;
  /** Jump straight to a beat (?beat=1..5). A review tool: four beats that
   *  auto-advance are hard to look at one at a time, and "watch the whole
   *  thing again to see slide 3" is how design feedback dies. */
  start?: number;
}) {
  const [i, setI] = useState(start);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const on = () => setReduced(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  const next = useCallback(() => {
    setI((v) => (v >= 4 ? (onDone(), v) : v + 1));
  }, [onDone]);
  const prev = useCallback(() => setI((v) => Math.max(0, v - 1)), []);

  // The beat timer is a setTimeout, and the progress bar is a CSS animation -
  // NOT a requestAnimationFrame that setStates every frame. The first version
  // did exactly that and it broke the whole effect: re-rendering at 60fps
  // rewrote each element's `--d` delay every 16ms, so every entrance animation
  // restarted before it could begin and the slides sat at opacity 0. Paused
  // state is handled where it belongs - `animation-play-state` for the bar,
  // a remaining-time calculation for the timer.
  const startedAt = useRef(0);
  const left = useRef(0);
  useEffect(() => { left.current = DWELL[i]; }, [i]);
  useEffect(() => {
    if (reduced) return;            // no auto-advance without motion consent
    if (paused) return;
    if (DWELL[i] === 0) return;     // the offer waits for her, not a timer
    startedAt.current = performance.now();
    const t = setTimeout(next, left.current);
    return () => {
      clearTimeout(t);
      left.current = Math.max(0, left.current - (performance.now() - startedAt.current));
    };
  }, [i, paused, reduced, next]);

  // Swipe, with the same 10px hysteresis the rest of the funnel uses.
  const down = useRef<{ x: number; t: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    down.current = { x: e.clientX, t: performance.now() };
    setPaused(true);
  };
  const onUp = (e: React.PointerEvent) => {
    const d = down.current;
    down.current = null;
    setPaused(false);
    if (!d) return;
    // On the offer beat a stray tap must not dismiss the decision - only the
    // buttons act. Swiping back still works.
    if (i === 4 && e.clientX - d.x > -40) {
      if (e.clientX - d.x > 40) prev();
      return;
    }
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); return; }
    // A tap: right two-thirds advances, left third goes back - the story
    // grammar everyone already knows from their phone.
    if (performance.now() - d.t < 400) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      (e.clientX - rect.left) / rect.width > 0.33 ? next() : prev();
    }
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [next, prev, onDone]);

  const beats = [
    <BeatPlan key="a" plan={plan} />,
    <BeatMonth key="b" plan={plan} />,
    <BeatFirst key="c" plan={plan} />,
    <BeatProof key="d" />,
    <BeatOffer key="e" offer={offer} />,
  ];
  const onOffer = i === 4;

  return (
    <div
      className={`mz${reduced ? " mz-still" : ""}${paused ? " mz-paused" : ""}`}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={() => { down.current = null; setPaused(false); }}
    >
      {/* Progress: four segments, filled behind, live on the current one. It is
          the goal gradient made visible - and it promises the end is near. */}
      <div className="mz-bars" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((n) => (
          <span key={n} className="mz-bar">
            <i
              // `key` on the live segment restarts its animation on each beat.
              key={n === i ? `live-${i}` : `static-${n}`}
              className={n < i ? "done" : n === i ? "live" : ""}
              style={n === i ? { ["--dwell" as string]: `${DWELL[i]}ms` } : undefined}
            />
          </span>
        ))}
      </div>

      {/* No skip button in the corner (owner decision 2026-09-14). The way out
          is the footer link on the offer beat, plus the sequence itself: every
          beat advances on a tap and the whole thing runs under half a minute.
          A corner escape on beat 1 invites leaving before anything was said. */}
      <header className="mz-top">
        <span className="mz-mark">LEXFIT</span>
      </header>

      <main className="mz-stage" key={i}>{beats[i]}</main>

      <footer className="mz-foot">
        {onOffer ? (
          <button type="button" className="mz-more" onClick={(e) => { e.stopPropagation(); onDone(); }}>
            {C.REVEAL.cinema.more}
          </button>
        ) : (
          <span className="mz-hint" aria-hidden="true">
            {i < 3 ? "Koppints a folytatáshoz" : "Koppints, és jöhet az ajánlat"}
          </span>
        )}
      </footer>
    </div>
  );
}

/* ── Beat 1 · her own week ─────────────────────────────────────────────────
   Look: the week. Feel: this is mine. Think: it really is done.
   The chips land first because they are HER answers played back - the IKEA
   effect needs to see its own work before anything else is claimed. */
function BeatPlan({ plan }: { plan: CinemaPlan }) {
  return (
    <section className="mz-beat">
      <p className="mz-eyebrow mz-in" style={{ ["--d" as string]: "0ms" }}>A terved</p>
      <h1 className="mz-h mz-in" style={{ ["--d" as string]: "90ms" }}>A heted, készen.</h1>

      <div className="mz-week mz-in" style={{ ["--d" as string]: "260ms" }}>
        {plan.days.map((d, n) => (
          <span
            key={d.short}
            className={`mz-day${d.training ? " on" : ""} mz-pop`}
            style={{ ["--d" as string]: `${420 + n * 70}ms` }}
          >
            <b>{d.short}</b>
            <i />
          </span>
        ))}
      </div>

      <div className="mz-stats mz-in" style={{ ["--d" as string]: "980ms" }}>
        <div><b>{plan.trainingCount}</b><span>nap / hét</span></div>
        <div><b>{plan.minutes}</b><span>perc</span></div>
        <div><b>0</b><span>eszköz</span></div>
      </div>

      <p className="mz-line mz-in" style={{ ["--d" as string]: "1150ms" }}>
        A pihenőnap is a terv része.
      </p>
    </section>
  );
}

/* ── Beat 2 · the month ────────────────────────────────────────────────────
   Look: four weeks. Feel: I can survive this. Think: it is not one week.
   Week 1 draws itself first and the other three follow - an open loop the
   mind closes by itself (Zeigarnik), which is exactly the loop a membership
   is the answer to. */
function BeatMonth({ plan }: { plan: CinemaPlan }) {
  return (
    <section className="mz-beat">
      <p className="mz-eyebrow mz-in" style={{ ["--d" as string]: "0ms" }}>Az első hónapod</p>
      <h1 className="mz-h mz-in" style={{ ["--d" as string]: "90ms" }}>Négy hét, a te ritmusoddal.</h1>

      <div className="mz-month mz-in" style={{ ["--d" as string]: "240ms" }}>
        {[0, 1, 2, 3].map((w) => (
          <div key={w} className="mz-mrow">
            <span className="mz-mw">{w + 1}</span>
            {plan.days.map((d, n) => (
              <i
                key={d.short}
                className={`${d.training ? "on" : ""} mz-cell`}
                style={{ ["--d" as string]: `${360 + w * 220 + n * 26}ms` }}
              />
            ))}
          </div>
        ))}
      </div>

      <p className="mz-line mz-in" style={{ ["--d" as string]: "1420ms" }}>
        <b>A kihagyott hét nem nulláz.</b> Ott folytatod, ahol abbahagytad.
      </p>
    </section>
  );
}

/* ── Beat 3 · the first workout ────────────────────────────────────────────
   Look: a real session. Feel: this is real and it is now. Think: I can see it
   before I pay for anything.
   The free thing arrives BEFORE the ask and it is the product itself - not a
   sample of it (reciprocity + zero-price effect). */
function BeatFirst({ plan }: { plan: CinemaPlan }) {
  const w = plan.firstWorkout;
  return (
    <section className="mz-beat">
      <p className="mz-eyebrow mz-in" style={{ ["--d" as string]: "0ms" }}>Az első edzésed</p>
      <h1 className="mz-h mz-in" style={{ ["--d" as string]: "90ms" }}>Ma este megvan az első.</h1>

      <figure className="mz-shot mz-rise" style={{ ["--d" as string]: "240ms" }}>
        {/* The poster may still be in flight for the first second or two - the
            frame holds its shape either way, so nothing jumps when it lands. */}
        {w.poster
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={w.poster} alt="" />
          : <div className="mz-shot-wait" aria-hidden="true" />}
        <span className="mz-play" aria-hidden="true"><LxIcon d={lxPaths.play} size={26} sw={1.6} /></span>
        <figcaption>
          <b>{w.title}</b>
          <span>{w.theme} · {w.mins} perc</span>
        </figcaption>
      </figure>

      <p className="mz-free mz-in" style={{ ["--d" as string]: "760ms" }}>
        <LxIcon d={lxPaths.check} size={15} sw={2.4} />
        Ingyen megnézed, fiók nélkül
      </p>
    </section>
  );
}

/* ── Beat 4 · not alone ────────────────────────────────────────────────────
   Look: real members. Feel: people like me. Think: it works for them.
   Proof comes LAST because it answers the doubt the first three beats create;
   arriving earlier it would be a claim, arriving here it is an answer. */
function BeatProof() {
  return (
    <section className="mz-beat mz-beat-wide">
      <p className="mz-eyebrow mz-in" style={{ ["--d" as string]: "0ms" }}>Akik már csinálják</p>
      <h1 className="mz-h mz-in" style={{ ["--d" as string]: "90ms" }}>Nem egyedül csinálod.</h1>

      <div className="mz-belt mz-in" style={{ ["--d" as string]: "280ms" }}>
        <FinishExamples onPick={() => { /* the belt is scenery here */ }} />
      </div>

      <p className="mz-line mz-in" style={{ ["--d" as string]: "620ms" }}>
        <b>1 200+</b> ember mozog velünk otthon.
      </p>
      <p className="mz-fine mz-in" style={{ ["--d" as string]: "760ms" }}>
        A fotók valódi tagoké, az ő engedélyükkel.
      </p>
    </section>
  );
}

/* ── Beat 5 · the offer ────────────────────────────────────────────────────
   Look: one price. Feel: this is small and reversible. Think: I can start
   tonight.
   Everything before this beat was the case; this is the ask, and it is the
   only screen in the sequence that does not move on by itself. The guarantee
   sits under the button because the last thing read before a decision should
   be the way out of it (regret aversion), and the secondary action is a plain
   text link - a second button would make this a choice between two things
   instead of one thing and an escape. */
function BeatOffer({ offer }: { offer: CinemaOffer }) {
  return (
    <section className="mz-beat">
      <p className="mz-eyebrow mz-in" style={{ ["--d" as string]: "0ms" }}>{C.REVEAL.cinema.eyebrow}</p>
      <h1 className="mz-h mz-h-sm mz-in" style={{ ["--d" as string]: "80ms" }}>{C.REVEAL.cinema.hd}</h1>

      {/* Value BEFORE price, and personal where it can be. Each line either
          answers something she told the quiz or calls back to a beat she just
          watched - nothing here is a fresh claim to evaluate. */}
      <ul className="mz-got">
        {(offer.fit?.length ? [...offer.fit, C.REVEAL.cinema.libLine] : C.REVEAL.cinema.lines).map((l, n) => (
          <li key={l} className="mz-in" style={{ ["--d" as string]: `${200 + n * 90}ms` }}>
            <LxIcon d={lxPaths.check} size={14} sw={2.6} />
            <span>{l}</span>
          </li>
        ))}
      </ul>

      <div className="mz-price mz-rise" style={{ ["--d" as string]: "520ms" }}>
        <b>{offer.intro}</b>
        <span>{C.REVEAL.cinema.priceTail}</span>
      </div>
      {/* The sentence that decides it: the date and the amount of the SECOND
          charge, before the button rather than after it. */}
      <p className="mz-after mz-in" style={{ ["--d" as string]: "620ms" }}>
        {offer.timeline ?? `utána ${offer.weekStd} / hét · bármikor lemondható`}
        {offer.perDay && <> · évesre váltva {offer.perDay} / nap</>}
      </p>

      <a
        className="mz-cta mz-rise"
        style={{ ["--d" as string]: "700ms" }}
        href={offer.href}
        onClick={offer.onGo}
      >
        Csináljuk végig
      </a>

      {offer.guarantee && (
        <p className="mz-guar mz-in" style={{ ["--d" as string]: "800ms" }}>
          <LxIcon d={lxPaths.shield} size={14} sw={1.8} />
          {offer.guarantee}
        </p>
      )}

      <ul className="mz-trust mz-in" style={{ ["--d" as string]: "880ms" }}>
        {C.REVEAL.cinema.trust.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </section>
  );
}
