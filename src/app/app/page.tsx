"use client";

import "./foundation.css";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { catWord, dayGrad, levelWord } from "@/lib/categories";
import { ensureProgress } from "@/lib/progress";
import {
  dayState, loadFoundation, type FoundationData, type WeekGroup, type WorkoutItem,
} from "@/lib/program";

export default function FoundationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<FoundationData | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    const d = await loadFoundation(user.uid);
    setData(d);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function join() {
    if (!user) return;
    await ensureProgress(user.uid);
    await reload();
  }

  if (loading) return <p style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", marginTop: 40 }}>Töltés…</p>;
  if (!data) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>A Foundation program még nem érhető el.</p>;

  const { program, weeks, joined, doneCount, currentIndex, streak } = data;
  const total = program.totalSessions;
  const curWeek = joined ? Math.min(weeks.length, Math.floor(currentIndex / (program.perWeek || 5)) + 1) : 1;
  const todayCode = data.todayCode;
  const play = (code: string | null) => code && router.push(`/player/${code}`);

  return (
    <div className="pg fade-in">
      <Billboard
        program={program}
        joined={joined}
        doneCount={doneCount}
        total={total}
        streak={streak}
        curWeek={curWeek}
        onContinue={() => play(todayCode)}
        onJoin={join}
        onPreview={() => play(weeks[0]?.workouts[0]?.code ?? null)}
      />
      <Journey weeks={weeks} phases={program.phases} joined={joined} curWeek={curWeek} />
      <ThisWeek
        week={weeks.find((w) => w.num === curWeek)}
        joined={joined}
        doneCount={doneCount}
        currentIndex={currentIndex}
        perWeek={program.perWeek ?? 5}
        onPlay={play}
      />
      <Stats program={program} />
    </div>
  );
}

function Billboard({
  program, joined, doneCount, total, streak, curWeek, onContinue, onJoin, onPreview,
}: {
  program: FoundationData["program"]; joined: boolean; doneCount: number; total: number;
  streak: number; curWeek: number; onContinue: () => void; onJoin: () => void; onPreview: () => void;
}) {
  const pct = Math.round((doneCount / total) * 100);
  return (
    <section className="pgb">
      <div className="pgb-art" style={{ background: "var(--grad-hero)" }}>
        <span className="ring" />
        <span className="ring2" />
        <span className="word">FOUNDATION</span>
      </div>
      <span className="pgb-scrim" />
      <span className="pgb-vig" />
      <div className="pgb-bc">
        <LxIcon d={lxPaths.flame} size={15} sw={2} />
        {joined ? <>A te programod</> : <>LEXFIT · <b>8 hetes program</b></>}
      </div>
      <div className="pgb-content">
        <div className="pgb-eyebrow">{program.eyebrow}</div>
        <h1 className="pgb-title">
          {program.title}
          <small className="pgb-sub">{program.hu} · 8 hét, ami megalapoz mindent</small>
        </h1>
        <p className="pgb-syn">{program.synopsis}</p>
        <div className="pgb-ctas">
          {joined ? (
            <>
              <button className="pgb-play" onClick={onContinue}>
                <LxIcon d={lxPaths.play} size={18} fill /> Folytatás · {curWeek}. hét
              </button>
              <button className="pgb-2nd" onClick={onContinue}>Mai edzés</button>
            </>
          ) : (
            <>
              <button className="pgb-play" onClick={onJoin}>
                <LxIcon d={lxPaths.flame} size={17} sw={2} /> Csatlakozz a programhoz
              </button>
              <button className="pgb-2nd" onClick={onPreview}>
                <LxIcon d={lxPaths.play} size={15} fill /> Előzetes · 1. nap
              </button>
            </>
          )}
        </div>
      </div>
      {joined && (
        <div className="pgb-prog">
          <div className="pp-top">
            <span className="pp-pct">{pct}%</span>
            <span className="pp-lab">{doneCount}/{total} edzés</span>
          </div>
          <div className="pp-bar"><i style={{ width: `${pct}%` }} /></div>
          <div className="pp-streak"><LxIcon d={lxPaths.flame} size={15} sw={2} /> {streak} napos sorozat</div>
        </div>
      )}
    </section>
  );
}

function Journey({
  weeks, phases, joined, curWeek,
}: {
  weeks: WeekGroup[]; phases: FoundationData["program"]["phases"]; joined: boolean; curWeek: number;
}) {
  const frac = joined ? (curWeek - 1) / 7 : 0;
  const curPhase = phases[weeks.find((w) => w.num === curWeek)?.phaseIdx ?? 0];
  return (
    <section className="pgjourney">
      <div className="pj-head">
        <h3>{joined ? "A te utad" : "Ez vár rád · 8 hét"}</h3>
        <span className="pj-now">
          {joined ? `Hét ${curWeek} / 8 · ${curPhase?.icon} ${curPhase?.name}` : "Hét 1 / 8 · 🌱 Alap · innen indulsz"}
        </span>
      </div>
      <div className="pj-track">
        <div className="pj-line" />
        <div className="pj-line fill" style={{ width: `calc((100% - 38px) * ${frac})` }} />
        {weeks.map((w) => {
          const state = w.num < curWeek ? "done" : w.num === curWeek ? "current" : "future";
          const ph = phases[w.phaseIdx];
          return (
            <div className={`pj-step is-${state}`} key={w.num}>
              <span className="pj-node" style={state === "future" ? { borderColor: ph?.colorVar, color: ph?.colorVar } : undefined}>
                {state === "done" ? <LxIcon d={lxPaths.check} size={15} sw={3} />
                  : state === "current" ? (joined ? <LxIcon d={lxPaths.flame} size={16} sw={2.2} /> : w.num)
                  : w.num}
                {w.retest && <span className="pj-flag" title="Visszamérés">📊</span>}
                {state === "current" && <span className="pj-here">{joined ? "MOST ITT" : "START"}</span>}
              </span>
              <span className="pj-wk">Hét {w.num}</span>
            </div>
          );
        })}
      </div>
      <div className="pj-phases">
        {phases.map((p) => (
          <div className="pj-ph" key={p.idx} style={{ borderTopColor: p.colorVar }}>
            <span style={{ color: p.colorVar }}>{p.icon}</span> {p.name}
            <em>{p.weeks}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function ThisWeek({
  week, joined, doneCount, currentIndex, perWeek, onPlay,
}: {
  week?: WeekGroup; joined: boolean; doneCount: number; currentIndex: number; perWeek: number;
  onPlay: (code: string) => void;
}) {
  if (!week) return null;
  const w = week.workouts;
  // 7 cells: H, K, [rest], Cs, P, Szo, [rest]
  const cells: ({ rest: true } | { v: WorkoutItem })[] = [
    { v: w[0] }, { v: w[1] }, { rest: true },
    { v: w[2] }, { v: w[3] }, { v: w[4] }, { rest: true },
  ].filter((c) => "rest" in c || c.v) as never;
  const doneInWeek = joined ? w.filter((x) => x.order < doneCount).length : 0;

  return (
    <section>
      <div className="pg-sechd">
        <h2 className="pg-h">Ez a heted</h2>
        <span className="sub">Hét {week.num}{week.retest ? " · 📊 visszamérés" : ""}</span>
        <span className="mono">{doneInWeek}/{perWeek} kész</span>
      </div>
      <div className="pgwk-grid">
        {cells.map((c, i) =>
          "rest" in c ? (
            <div className="pgrest" key={`r${i}`}><span className="ic">🛌</span><span className="lb">Pihenő</span></div>
          ) : (
            <DayCard key={c.v.code} v={c.v} st={dayState(c.v.order, joined, doneCount, currentIndex)} onClick={() => onPlay(c.v.code)} />
          ),
        )}
      </div>
    </section>
  );
}

function DayCard({
  v, st, onClick,
}: {
  v: WorkoutItem; st: "preview" | "done" | "today" | "todo"; onClick: () => void;
}) {
  return (
    <button className={`pgday is-${st}`} onClick={onClick}>
      <div className="pgday-art" style={{ background: dayGrad(v.theme) }}>
        <span className="ring" />
        <span className="word">{catWord(v.theme)}</span>
        <span className="pgday-day">{v.day} · {v.code}</span>
        {st === "done" && <span className="pgday-state done"><LxIcon d={lxPaths.check} size={13} sw={2.6} /></span>}
        {st === "today" && <span className="pgday-state today">MA</span>}
        {st !== "done" && st !== "today" && v.retest && <span className="pgday-rmark">📊 MÉRÉS</span>}
        <span className="pgday-title">{v.title}</span>
      </div>
    </button>
  );
}

function Stats({ program }: { program: FoundationData["program"] }) {
  const cells: [string, string, string][] = [
    [String(program.weeks ?? 8), "hét", `${program.phases.length} fázis`],
    [String(program.totalSessions), "edzés", `${program.perWeek} / hét`],
    [String(program.defaultMins ?? 30), "perc", "minden nap fix"],
    ["0", "eszköz", program.equipment ?? "csak matrac"],
    ["2", "mérés", "Hét 5 · Hét 8"],
  ];
  return (
    <div className="pg-stats">
      {cells.map(([v, u, k]) => (
        <div className="pg-stat" key={k}>
          <div className="v">{v} <small>{u}</small></div>
          <div className="k">{k}</div>
        </div>
      ))}
    </div>
  );
}
