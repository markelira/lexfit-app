"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { cardGrad, catWord, levelWord } from "@/lib/categories";
import type { VideoBlock } from "@/lib/types";

export interface CardVideo {
  code: string;
  title: string;
  theme: string;
  mins: number;
  level: number;
  format: string;
  types: string[];
  blocks?: VideoBlock[];
  phase?: number | null;
}

const PHASES = ["🌱 Alap", "🔨 Építés", "🔥 Elmélyítés", "🏆 Kifejezés"];
const phaseLabel = (p?: number | null) => (p == null ? "✦ Bónusz" : PHASES[p] ?? "✦ Bónusz");
const matchPct = (code: string) => 84 + (((parseInt(code.replace(/\D/g, ""), 10) || 7) * 7) % 14);

const FMT: Record<string, string> = {
  EMOM: "Minden perc elején új gyakorlat indul — ami a percből marad, az a pihenőd.",
  Tabata: "20 másodperc munka, 10 másodperc pihenő — rövid, intenzív körökben.",
  AMRAP: "Adott idő alatt annyi kört teljesítesz, amennyit bírsz — a saját tempódban.",
  "Klasszikus circuit": "Gyakorlatról gyakorlatra haladsz, körönként rövid pihenővel.",
  Pyramid: "Az ismétlésszám körönként emelkedik, majd visszaereszkedik.",
  Ladder: "Lépcsőzetesen változó ismétlésszámok — fokozatosan melegszel bele.",
  "50/50": "Fél perc munka, fél perc pihenő — kiszámítható, tartható ritmus.",
  "Folyamatos flow": "Megállás nélküli, folyamatos mozgássor — a légzésed vezet.",
  "Steady-state": "Egyenletes, nyugodt tempó az elejétől a végéig.",
  "Időzített tartások": "Statikus tartások időre — a mély, tartó izmok dolgoznak.",
};
const THEME: Record<string, string> = {
  "Alsótest": "Comb-, fenék- és vádlifókuszú edzés",
  "Felsőtest": "Kar-, váll- és hátfókuszú edzés",
  "Cardio + has": "Pulzusemelő edzés erős hasfókusszal",
  "Teljes test": "Az egész testet átmozgató edzés",
  "Mobility / nyújtás": "Ízület-átmozgató, nyújtó egység",
  "Tartás-fókusz": "Tartásjavító, gerincbarát egység",
};
const desc = (v: CardVideo) => {
  const quiet = v.types.some((t) => t.includes("Csendes"));
  return `${THEME[v.theme] ?? "Vezetett edzés"}, eszköz nélkül — elég egy matrac. ${FMT[v.format] ?? ""}${quiet ? " Csendes, szomszédbarát változat, ugrálás nélkül." : ""} Alexa végig veled csinálja.`;
};
function blocksOf(v: CardVideo): { name: string; mins: number }[] {
  if (v.blocks?.length) return v.blocks.map((b) => ({ name: b.name, mins: b.mins }));
  const warm = Math.max(2, Math.round(v.mins * 0.14));
  const cool = Math.max(2, Math.round(v.mins * 0.16));
  const main = v.mins - warm - cool;
  if (v.mins <= 15) return [{ name: "Bemelegítés", mins: warm }, { name: v.format, mins: main }, { name: "Levezetés", mins: cool }];
  const m1 = Math.ceil(main / 2);
  return [
    { name: "Bemelegítés", mins: warm },
    { name: `${v.format} — 1. blokk`, mins: m1 },
    { name: `${v.format} — 2. blokk`, mins: main - m1 },
    { name: "Levezetés", mins: cool },
  ];
}

export function NcardModal({
  video, pool = [], saved, onToggleSave, onClose, onPlay,
}: {
  video: CardVideo; pool?: CardVideo[]; saved: boolean;
  onToggleSave: () => void; onClose: () => void; onPlay: (code: string) => void;
}) {
  const [v, setV] = useState<CardVideo>(video);
  const [sec, setSec] = useState(0);
  const [liked, setLiked] = useState(false);
  const ended = sec >= 60;

  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setSec((s) => Math.min(60, s + 1)), 1000);
    return () => clearInterval(t);
  }, [v.code, ended]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const blocks = blocksOf(v);
  const tags = v.types.map((t) => t.split(" ").slice(1).join(" "));
  const similar = pool
    .filter((x) => x.code !== v.code)
    .sort((a) => (a.theme === v.theme ? -1 : a.format === v.format ? 0 : 1))
    .slice(0, 3);

  return createPortal(
    <div className="lx nmod-backdrop" onClick={onClose}>
      <div className="nmod" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="nmod-hero" style={{ background: cardGrad(v.theme) }}>
          <div className={`nmod-kb${ended ? " paused" : ""}`} key={v.code}>
            <span className="nmod-ring" />
            <span className="nmod-word">{catWord(v.theme)}</span>
          </div>
          <span className="nmod-vig" />
          <button className="nmod-close" onClick={onClose} aria-label="Bezárás">✕</button>
          <span className="nmod-prevbadge">
            {ended ? "ELŐNÉZET VÉGE" : `ELŐNÉZET · 0:${String(60 - sec).padStart(2, "0")}`}
          </span>

          <div className="nmod-herobottom">
            <h2 className="nmod-title">{v.title}</h2>
            <div className="nmod-actions">
              <button className="btn accent nmod-play" onClick={() => { onClose(); onPlay(v.code); }}>
                <LxIcon d={lxPaths.play} size={17} fill /> Edzés indítása
              </button>
              <button className={`nmod-rbtn${saved ? " on" : ""}`} title="Mentés a listámra" onClick={onToggleSave}>
                {saved ? <LxIcon d={lxPaths.check} size={16} sw={2.6} /> : "+"}
              </button>
              <button className={`nmod-rbtn${liked ? " on" : ""}`} title="Kedvenc" onClick={() => setLiked(!liked)}>
                ♥
              </button>
              <span style={{ flex: 1 }} />
              {ended && (
                <button className="nmod-rbtn" title="Előnézet újra" onClick={() => setSec(0)}>↺</button>
              )}
            </div>
          </div>
          <div className="nmod-prevbar"><i style={{ width: `${(sec / 60) * 100}%` }} /></div>
        </div>

        <div className="nmod-body">
          <div className="nmod-cols">
            <div className="nmod-main">
              <div className="nmod-metarow">
                <span className="nmod-match">{matchPct(v.code)}% — neked ajánlott</span>
                <span>{v.mins} perc</span>
                <span className="nmod-box">{levelWord(v.level).toUpperCase()}</span>
                <span className="nmod-box mono">{v.code}</span>
                <span className="nmod-phase">{phaseLabel(v.phase)}</span>
              </div>
              <p className="nmod-desc">{desc(v)}</p>

              <div className="nmod-secthd">Az edzés felépítése</div>
              <div className="nmod-blocks">
                {blocks.map((b, i) => (
                  <div key={b.name} className="nmod-block">
                    <span className="bn">{b.name}</span>
                    <span className="bbar">
                      <i style={{ width: `${Math.round((b.mins / v.mins) * 100)}%`, background: i === 0 || i === blocks.length - 1 ? "var(--surface-2)" : "var(--accent-soft)" }}>
                        <em style={{ background: i === 0 || i === blocks.length - 1 ? "var(--ink-3)" : "var(--accent)" }} />
                      </i>
                    </span>
                    <span className="bm mono">{b.mins}′</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="nmod-facts">
              {[
                ["Fókusz", v.theme], ["Formátum", v.format], ["Fázis", phaseLabel(v.phase)],
                ["Nehézség", levelWord(v.level)], ["Időtartam", `${v.mins} perc`],
                ["Címkék", tags.length ? tags.join(" · ") : "—"],
              ].map(([k, val]) => (
                <div key={k} className="nmod-fact"><span>{k}:</span> {val}</div>
              ))}
            </div>
          </div>

          {similar.length > 0 && (
            <>
              <div className="nmod-secthd" style={{ marginTop: 22 }}>Hasonló edzések</div>
              <div className="nmod-simgrid">
                {similar.map((x) => (
                  <button key={x.code} className="ncard" onClick={() => { setV(x); setSec(0); setLiked(false); }}>
                    <div className="ncard-art" style={{ background: cardGrad(x.theme) }}>
                      <span className="ncard-ring" />
                      <div className="ncard-lockup"><div className="wd">{catWord(x.theme)}</div><div className="un" /></div>
                      <span className="ncard-vig" />
                      <span className="ncard-chip">{x.mins} PERC</span>
                      <div className="ncard-title">{x.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
