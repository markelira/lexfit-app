"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { catOf, catWord, dayGrad } from "@/lib/categories";
import "./cinematic.css";

type Scene = {
  dur?: number;
  kind?: "title" | "big" | "rhythm" | "types" | "phases" | "goals";
  finale?: boolean;
  kicker?: string;
  big?: string;
  title?: string;
  sub?: string;
  bg: string;
};

const CINE: Scene[] = [
  { dur: 3200, kind: "title", kicker: "LEXFIT · BEMUTATJA",
    bg: "radial-gradient(125% 125% at 30% 18%, oklch(0.52 0.18 8) 0%, oklch(0.16 0.04 350) 70%)" },
  { dur: 4400, kind: "big", big: "EGY STABIL ALAP", sub: "8 hét alatt szokást építünk, formába hozunk, és felkészítünk minden következő edzésre.",
    bg: "radial-gradient(125% 125% at 72% 26%, oklch(0.56 0.17 32) 0%, oklch(0.15 0.03 330) 72%)" },
  { dur: 5000, kind: "rhythm", title: "A HETED", sub: "5 edzésnap, 2 pihenő. Napi fix 30 perc, eszköz nélkül — csak egy matrac.",
    bg: "linear-gradient(135deg, oklch(0.5 0.15 300) 0%, oklch(0.14 0.03 350) 78%)" },
  { dur: 5000, kind: "types", title: "AMIT CSINÁLNI FOGSZ", sub: "Circuit, EMOM, Tabata, AMRAP, flow — minden nap más, sosem unalmas.",
    bg: "radial-gradient(120% 120% at 60% 80%, oklch(0.52 0.16 45) 0%, oklch(0.14 0.03 340) 74%)" },
  { dur: 4600, kind: "phases", title: "4 FÁZIS", sub: "A formától az erőig — lépésről lépésre építünk fel.",
    bg: "radial-gradient(110% 130% at 50% 0%, oklch(0.5 0.16 150) 0%, oklch(0.15 0.03 340) 74%)" },
  { dur: 4800, kind: "big", big: "MÉRD MAGAD", sub: "A 8. héten ugyanazt csinálod, mint az 1.-en. A különbség te leszel.",
    bg: "radial-gradient(125% 125% at 38% 82%, oklch(0.55 0.18 18) 0%, oklch(0.13 0.03 350) 72%)" },
  { dur: 5200, kind: "goals", title: "MIT NYERSZ?", sub: "Nem csak edzéseket. Egy erősebb, magabiztosabb verziódat.",
    bg: "radial-gradient(120% 120% at 40% 30%, oklch(0.5 0.15 280) 0%, oklch(0.14 0.03 345) 74%)" },
  { finale: true, title: "KÉSZEN ÁLLSZ?", sub: "Az első edzésed innen egy kattintás.",
    bg: "radial-gradient(125% 125% at 50% 30%, oklch(0.6 0.17 5) 0%, oklch(0.16 0.03 345) 76%)" },
];

const CINE_PHASES = [
  { icon: "🌱", name: "Alap" },
  { icon: "🔨", name: "Építés" },
  { icon: "🔥", name: "Elmélyítés" },
  { icon: "🏆", name: "Kifejezés" },
];
const CINE_SPLIT: { d: string; theme?: string; rest?: boolean }[] = [
  { d: "Hétfő", theme: "Alsótest" }, { d: "Kedd", theme: "Felsőtest" }, { d: "Szerda", rest: true },
  { d: "Csüt", theme: "Cardio + has" }, { d: "Péntek", theme: "Teljes test" },
  { d: "Szombat", theme: "Mobility / nyújtás" }, { d: "Vasárnap", rest: true },
];
const CINE_THEMES = ["Alsótest", "Felsőtest", "Cardio + has", "Teljes test", "Mobility / nyújtás"];
const CINE_GOALS: [string, string][] = [
  ["💪", "Erősebb láb és törzs"], ["🧍", "Jobb testtartás"], ["🔁", "Napi mozgás-szokás"], ["📈", "Mérhető fejlődés"],
];
const CONFETTI_COLORS = ["#e5719b", "#d56487", "#ffb86b", "#7ee0a8", "#ffffff", "#b692d8"];

// Deterministic 0..1 hash (pure — avoids Math.random impurity + hydration mismatch).
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Netflix-trailer-style join intro. `onJoin` runs after the celebration (do the real
 * join + start the guide there). `onClose` is "skip" — close without joining.
 */
export function JoinCinematic({
  name = "te",
  onJoin,
  onClose,
}: {
  name?: string;
  onJoin: () => void;
  onClose: () => void;
}) {
  const [i, setI] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const last = CINE.length - 1;
  const sc = CINE[i];

  const confetti = useMemo(
    () =>
      Array.from({ length: 44 }, (_, k) => ({
        left: rand(k + 1) * 100,
        dur: 2.4 + rand(k + 100) * 1.9,
        delay: rand(k + 200) * 1.3,
        bg: CONFETTI_COLORS[k % 6],
        w: 7 + rand(k + 300) * 7,
      })),
    [],
  );

  useEffect(() => {
    if (i >= last || celebrating) return;
    const t = setTimeout(() => setI((v) => Math.min(last, v + 1)), sc.dur || 4000);
    return () => clearTimeout(t);
  }, [i, last, sc.dur, celebrating]);

  useEffect(() => {
    if (!celebrating) return;
    const t = setTimeout(() => onJoin(), 2900);
    return () => clearTimeout(t);
  }, [celebrating, onJoin]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => Math.min(last, v + 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
    };
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [onClose, last]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="lx cine-back">
      <span className="cine-bar top" />
      <span className="cine-bar bot" />

      <div className="cine-progress">
        {CINE.map((_, j) => (
          <span key={j} className={"cine-progseg" + (j < i ? " done" : j === i ? " active" : "")}>
            <i style={j === i ? { animationDuration: `${sc.dur || 4000}ms` } : undefined} />
          </span>
        ))}
      </div>
      <button className="cine-skip" onClick={onClose}>Kihagyom ✕</button>

      <button className="cine-nav l" onClick={() => setI((v) => Math.max(0, v - 1))} aria-label="Vissza" />
      <button className="cine-nav r" onClick={() => setI((v) => Math.min(last, v + 1))} aria-label="Tovább" />

      <div className="cine-stage" key={i}>
        <div className="cine-bg" style={{ background: sc.bg }} />
        <div className="cine-grain" />
        <div className="cine-vig" />
        <div className="cine-content">
          {sc.kind === "title" ? (
            <>
              <div className="cine-kicker">{sc.kicker}</div>
              <div className="cine-title">FOUNDATION</div>
              <div className="cine-sub">A 8 hetes alapprogram — kezdőknek és újrakezdőknek.</div>
            </>
          ) : sc.finale ? (
            <>
              <div className="cine-title" style={{ fontSize: "clamp(40px,8vw,104px)" }}>{sc.title}</div>
              <div className="cine-sub">{sc.sub}</div>
              <div className="cine-cta">
                <button className="cine-join" onClick={() => setCelebrating(true)}>
                  <LxIcon d={lxPaths.flame} size={20} sw={2} /> Csatlakozom — kezdjük az 1. nappal
                </button>
                <button className="cine-ghost" onClick={onClose}>Még körülnézek</button>
              </div>
            </>
          ) : sc.kind === "phases" ? (
            <>
              <div className="cine-title" style={{ fontSize: "clamp(36px,7vw,92px)" }}>{sc.title}</div>
              <div className="cine-phases">
                {CINE_PHASES.map((p, k) => (
                  <div className="cine-phase" key={p.name} style={{ animationDelay: `${0.35 + k * 0.22}s` }}>
                    <span className="e">{p.icon}</span>
                    <span className="n">{p.name}</span>
                  </div>
                ))}
              </div>
              <div className="cine-sub">{sc.sub}</div>
            </>
          ) : sc.kind === "rhythm" ? (
            <>
              <div className="cine-title" style={{ fontSize: "clamp(34px,6vw,80px)" }}>{sc.title}</div>
              <div className="cine-week">
                {CINE_SPLIT.map((s, k) => (
                  <div className={"cw-day" + (s.rest ? " rest" : "")} key={s.d} style={{ animationDelay: `${0.3 + k * 0.1}s` }}>
                    <span className="d">{s.d}</span>
                    {s.rest ? (
                      <>
                        <span style={{ fontSize: 16 }}>🛌</span>
                        <span className="t rest">pihenő</span>
                      </>
                    ) : (
                      <>
                        <span className="dot" style={{ background: catOf(s.theme!).c }} />
                        <span className="t">{catWord(s.theme!)}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="cine-sub">{sc.sub}</div>
            </>
          ) : sc.kind === "types" ? (
            <>
              <div className="cine-title" style={{ fontSize: "clamp(32px,5.6vw,72px)" }}>{sc.title}</div>
              <div className="cine-types">
                {CINE_THEMES.map((th, k) => (
                  <div className="ct-card" key={th} style={{ background: dayGrad(th), animationDelay: `${0.25 + k * 0.13}s` }}>
                    <b>{catWord(th)}</b>
                  </div>
                ))}
              </div>
              <div className="cine-sub">{sc.sub}</div>
            </>
          ) : sc.kind === "goals" ? (
            <>
              <div className="cine-title" style={{ fontSize: "clamp(34px,6vw,80px)" }}>{sc.title}</div>
              <div className="cine-goals">
                {CINE_GOALS.map(([e, txt], k) => (
                  <div className="cg" key={txt} style={{ animationDelay: `${0.3 + k * 0.13}s` }}>
                    <span className="e">{e}</span>
                    <span>{txt}</span>
                  </div>
                ))}
              </div>
              <div className="cine-sub">{sc.sub}</div>
            </>
          ) : (
            <>
              <div className="cine-big">{sc.big}</div>
              <div className="cine-sub">{sc.sub}</div>
            </>
          )}
        </div>
      </div>

      {celebrating && (
        <div className="cine-celebrate">
          <div className="cine-confetti">
            {confetti.map((c, k) => (
              <i
                key={k}
                style={{
                  left: `${c.left}%`,
                  width: c.w,
                  height: c.w * 1.4,
                  background: c.bg,
                  animationDuration: `${c.dur}s`,
                  animationDelay: `${c.delay}s`,
                }}
              />
            ))}
          </div>
          <div className="ce-badge">🎉</div>
          <h2>Üdv a programban!</h2>
          <p>{name}, ez itt a kezdet. Megmutatom, hogyan működik — 30 másodperc.</p>
          <button className="ce-go" onClick={() => onJoin()}>Mutasd meg, hogyan működik →</button>
        </div>
      )}
    </div>,
    document.body,
  );
}
