"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import "./guided-tour.css";

const GUIDE_SEEN_KEY = "lexfit_found_guided_v1";
/** Fire this on window to (re)start the guided welcome from elsewhere (e.g. after the join cinematic). */
export const GUIDE_START_EVENT = "lexfit:guide-start";

type Slide = { grad: string; word: string; emoji: string; ey: string; h: string; p: string; a: string };
type Step = { sel: string; h: string; t: string; action?: boolean; act?: string };
type Rect = { top: number; left: number; w: number; h: number };

const GW_SLIDES: Slide[] = [
  { grad: "var(--grad-hero)", word: "FOUNDATION", emoji: "👋", ey: "ÜDV A FOUNDATION-BEN",
    h: "Az alap, amire minden épül",
    p: "Ez a kezdő-újrakezdő alapprogramod. Rövid, vezetett edzések, eszköz nélkül — elég egy matrac.",
    a: "Szia! Alexa vagyok, végig veled csinálom. Megmutatom, hogy működik — 5 kártya, fél perc." },
  { grad: "linear-gradient(135deg, oklch(0.72 0.13 45), oklch(0.6 0.15 30))", word: "RITMUS", emoji: "🗓️", ey: "A HETED",
    h: "A te heted, a te ritmusod",
    p: "Az edzésnapjaidat te választottad — alsótest, felsőtest, kardió, teljes test és mobilitás váltják egymást, a pihenőnap pedig ugyanúgy a terv része.",
    a: "Nem kell kitalálnod, mit csinálj. Minden napra megvan a dolgod — te csak megnyomod a Kezdést." },
  { grad: "linear-gradient(135deg, oklch(0.6 0.12 300), oklch(0.5 0.05 168))", word: "FÁZIS", emoji: "🌱", ey: "PROGRESSZIÓ",
    h: "Fázisról fázisra feljebb",
    p: "🌱 Alap → 🔨 Építés → 🔥 Elmélyítés → 🏆 Kifejezés. Fázisonként lépsz tovább; a gyakorlatok fokról fokra nehezednek.",
    a: "Az első fázis a legkönnyebb, az utolsó a legerősebb. Nem ugrunk — felépítünk." },
  { grad: "linear-gradient(135deg, oklch(0.55 0.16 12), oklch(0.62 0.15 28))", word: "MÉRÉS", emoji: "📊", ey: "FEJLŐDÉS-MÉRÉS",
    h: "Méred a fejlődésed, nem hiszed",
    p: "A program során visszahozom a nyitóhét edzéseit. Ugyanaz a mozgás, ugyanannyi idő — számokban látod, mennyit erősödtél.",
    a: "A visszamérésen ugyanazt csinálod, mint az elején. A különbség te leszel." },
  { grad: "var(--grad-hero)", word: "START", emoji: "🚀", ey: "KÉSZ?",
    h: "Megmutatom az appot",
    p: "Egy gyors körbevezetés: hol indítod a mai edzést, hol követed a haladásod. Bármikor kihagyhatod.",
    a: "Gyere — pár koppintás, és otthon leszel benne." },
];

const GT_STEPS: Step[] = [
  { sel: '[data-tour="start"]', h: "Itt indítod a mai edzést", t: "Ez a fő gomb. Bárhonnan jössz vissza, innen folytatod ott, ahol abbahagytad." },
  { sel: '[data-tour="journey"]', h: "Hol tartasz a programban", t: "A te utad a programon át. Zöld, ami kész; a rózsaszín jelző mutatja, hol jársz most; 📊 a visszamérések." },
  { sel: '[data-tour="today"]', h: "A mai edzésed — és ami jön", t: "Bal oldalon az előnézet, jobbra a leírás és a felépítés. Alul a Folytasd-sor: a soron következő edzéseid.",
    action: true, act: "Koppints a mai edzésre" },
];

function WelcomeCarousel({ onStartTour, onSkip }: { onStartTour: () => void; onSkip: () => void }) {
  const [i, setI] = useState(0);
  const s = GW_SLIDES[i];
  const last = i === GW_SLIDES.length - 1;
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [onSkip]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="lx gw-back" onClick={onSkip}>
      <div className="gw-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="gw-skip" onClick={onSkip}>Kihagyom</button>
        <div className="gw-art" style={{ background: s.grad }} key={i}>
          <span className="ring" />
          <span className="word">{s.word}</span>
          <span className="big">{s.emoji}</span>
          <span className="vig" />
        </div>
        <div className="gw-body">
          <div className="gw-ey">{s.ey}</div>
          <h2 className="gw-h">{s.h}</h2>
          <p className="gw-p">{s.p}</p>
          <div className="gw-alexa">
            <span className="av">A</span>
            <p>{s.a}</p>
          </div>
        </div>
        <div className="gw-foot">
          {i > 0 && <button className="gw-prev" onClick={() => setI(i - 1)}>← Vissza</button>}
          <div className="gw-dots">
            {GW_SLIDES.map((_, j) => (
              <i key={j} className={j === i ? "on" : ""} />
            ))}
          </div>
          <button className="gw-next" onClick={() => (last ? onStartTour() : setI(i + 1))}>
            {last ? (
              <>
                Mutasd meg <LxIcon d={lxPaths.arrowR} size={16} />
              </>
            ) : (
              "Tovább"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function GuidedTour({ onClose, steps = GT_STEPS }: { onClose: (completed: boolean) => void; steps?: Step[] }) {
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const [tipH, setTipH] = useState(180);
  const step = steps[idx];
  const last = idx === steps.length - 1;
  const PAD = 8;

  const measure = useCallback(() => {
    const el = document.querySelector(steps[idx].sel);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, w: r.width, h: r.height });
  }, [idx, steps]);

  // scroll to target on step change, then measure
  useLayoutEffect(() => {
    const el = document.querySelector(steps[idx].sel);
    if (el) {
      const r = el.getBoundingClientRect();
      const top = window.scrollY + r.top - 150;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
    const t = setTimeout(measure, 460);
    return () => clearTimeout(t);
  }, [idx, measure, steps]);

  useEffect(() => {
    measure();
    const h = () => measure();
    window.addEventListener("scroll", h, true);
    window.addEventListener("resize", h);
    return () => {
      window.removeEventListener("scroll", h, true);
      window.removeEventListener("resize", h);
    };
  }, [idx, measure]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
      if (e.key === "ArrowRight" && !step.action) {
        if (last) onClose(true);
        else setIdx(idx + 1);
      }
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [idx, step, last, onClose]);

  // action step: close the tour when the target is clicked (the card opens its own modal)
  useEffect(() => {
    if (!step.action) return;
    const el = document.querySelector(step.sel);
    if (!el) return;
    const end = () => onClose(true);
    el.addEventListener("click", end, { once: true });
    return () => el.removeEventListener("click", end);
  }, [idx, step, onClose]);

  useLayoutEffect(() => {
    if (tipRef.current) setTipH(tipRef.current.offsetHeight);
  }, [idx, rect]);

  if (typeof document === "undefined" || !rect) return null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const hole = {
    top: Math.max(0, rect.top - PAD),
    left: Math.max(0, rect.left - PAD),
    w: rect.w + PAD * 2,
    h: rect.h + PAD * 2,
  };
  const holeBottom = hole.top + hole.h;
  const holeRight = hole.left + hole.w;
  const tipW = Math.min(340, vw - 32);
  const below = holeBottom + tipH + 18 < vh;
  let tipTop = below ? holeBottom + 14 : hole.top - tipH - 14;
  tipTop = Math.max(14, Math.min(tipTop, vh - tipH - 14));
  const tipLeft = Math.max(14, Math.min(hole.left + hole.w / 2 - tipW / 2, vw - tipW - 14));

  const pane = (st: React.CSSProperties) => <div className="pane" style={st} />;
  return createPortal(
    <div className="lx">
      <div className="gt-mask">
        {pane({ top: 0, left: 0, width: vw, height: hole.top })}
        {pane({ top: holeBottom, left: 0, width: vw, height: Math.max(0, vh - holeBottom) })}
        {pane({ top: hole.top, left: 0, width: hole.left, height: hole.h })}
        {pane({ top: hole.top, left: holeRight, width: Math.max(0, vw - holeRight), height: hole.h })}
      </div>
      <div className="gt-ringbox pulse" style={{ top: hole.top, left: hole.left, width: hole.w, height: hole.h }} />
      {!step.action && (
        <div
          className="gt-hole-catch"
          style={{ top: hole.top, left: hole.left, width: hole.w, height: hole.h }}
          onClick={() => (last ? onClose(true) : setIdx(idx + 1))}
        />
      )}
      <div className="gt-tip" ref={tipRef} style={{ top: tipTop, left: tipLeft, width: tipW }}>
        <div className="gt-alexa">
          <span className="av">A</span>
          <span className="nm">Alexa</span>
          <span className="ct">
            {idx + 1} / {steps.length}
          </span>
        </div>
        <div className="gt-h">{step.h}</div>
        <div className="gt-tx">{step.t}</div>
        {step.action && (
          <div className="gt-act">
            <span className="pin" />
            {step.act}
          </div>
        )}
        <div className="gt-foot">
          <button className="gt-skip" onClick={() => onClose(false)}>Kihagyom</button>
          {idx > 0 && <button className="gt-back" onClick={() => setIdx(idx - 1)}>Vissza</button>}
          {!step.action && (
            <button
              className="gt-next"
              style={idx === 0 ? { marginLeft: "auto" } : undefined}
              onClick={() => (last ? onClose(true) : setIdx(idx + 1))}
            >
              {last ? (
                "Kész 🎉"
              ) : (
                <>
                  Tovább <LxIcon d={lxPaths.arrowR} size={15} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** First-run gate + replay "?" pill. Drop once into the Foundation page. */
export function GuideController({ autoStart = true, steps = GT_STEPS }: { autoStart?: boolean; steps?: Step[] }) {
  const [phase, setPhase] = useState<null | "welcome" | "tour">(null);

  useEffect(() => {
    if (!autoStart) return;
    let seen = false;
    try {
      seen = localStorage.getItem(GUIDE_SEEN_KEY) === "1";
    } catch {}
    if (!seen) setPhase("welcome");
  }, [autoStart]);

  // external trigger (e.g. after the join cinematic)
  useEffect(() => {
    const start = () => setPhase("welcome");
    window.addEventListener(GUIDE_START_EVENT, start);
    return () => window.removeEventListener(GUIDE_START_EVENT, start);
  }, []);

  const markSeen = () => {
    try {
      localStorage.setItem(GUIDE_SEEN_KEY, "1");
    } catch {}
  };
  const finish = () => {
    markSeen();
    setPhase(null);
  };

  return (
    <>
      {phase === "welcome" && <WelcomeCarousel onStartTour={() => setPhase("tour")} onSkip={finish} />}
      {phase === "tour" && <GuidedTour onClose={finish} steps={steps} />}
    </>
  );
}
