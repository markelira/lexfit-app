"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { FinishExamples } from "@/components/finish/FinishExamples";
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
const DWELL = [4600, 5600, 5000, 4200];

export function CinemaReveal({ plan, onDone }: { plan: CinemaPlan; onDone: () => void }) {
  const [i, setI] = useState(0);
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
    setI((v) => (v >= 3 ? (onDone(), v) : v + 1));
  }, [onDone]);
  const prev = useCallback(() => setI((v) => Math.max(0, v - 1)), []);

  // Wall-clock progress so a pause resumes where it stopped rather than
  // restarting the beat - the difference between "held" and "interrupted".
  const [prog, setProg] = useState(0);
  const startedAt = useRef(0);
  const elapsed = useRef(0);
  useEffect(() => {
    elapsed.current = 0;
    setProg(0);
  }, [i]);
  useEffect(() => {
    if (reduced || paused) return;
    startedAt.current = performance.now() - elapsed.current;
    let raf = 0;
    const tick = (t: number) => {
      elapsed.current = t - startedAt.current;
      const p = Math.min(1, elapsed.current / DWELL[i]);
      setProg(p);
      if (p >= 1) { next(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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
  ];

  return (
    <div
      className={`mz${reduced ? " mz-still" : ""}`}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={() => { down.current = null; setPaused(false); }}
    >
      {/* Progress: four segments, filled behind, live on the current one. It is
          the goal gradient made visible - and it promises the end is near. */}
      <div className="mz-bars" aria-hidden="true">
        {[0, 1, 2, 3].map((n) => (
          <span key={n} className="mz-bar">
            <i style={{ transform: `scaleX(${n < i ? 1 : n === i ? (reduced ? 1 : prog) : 0})` }} />
          </span>
        ))}
      </div>

      <header className="mz-top">
        <span className="mz-mark">LEXFIT</span>
        <button type="button" className="mz-skip" onClick={(e) => { e.stopPropagation(); onDone(); }}>
          Kihagyom
        </button>
      </header>

      <main className="mz-stage" key={i}>{beats[i]}</main>

      <footer className="mz-foot" aria-hidden="true">
        <span className="mz-hint">
          {i < 3 ? "Koppints a folytatáshoz" : "Koppints, és jöhet a terved"}
        </span>
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={w.poster} alt="" />
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
