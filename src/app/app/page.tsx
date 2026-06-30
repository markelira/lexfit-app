"use client";

import "./foundation.css";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { ensureProgress, getProgress } from "@/lib/progress";
import { getMyList, setSaved } from "@/lib/mylist";
import { NcardModal } from "@/components/NcardModal";
import { NCard } from "@/components/NCard";
import { cardGrad, catOf, catWord, dayGrad, levelWord } from "@/lib/categories";
import {
  dayState, loadFoundation, type FoundationData, type WeekGroup, type WorkoutItem,
} from "@/lib/program";

export default function FoundationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<FoundationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVideo, setModalVideo] = useState<WorkoutItem | null>(null);
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const [resumeMap, setResumeMap] = useState<Record<string, number>>({});

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      setData(await loadFoundation(user.uid));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
    if (user) {
      getMyList(user.uid).then(setMyList).catch(() => {});
      getProgress(user.uid).then((p) => p && setResumeMap(p.resume ?? {})).catch(() => {});
    }
  }, [reload, user]);

  async function toggleSave(code: string) {
    if (!user) return;
    const has = myList.has(code);
    setMyList((m) => {
      const n = new Set(m);
      has ? n.delete(code) : n.add(code);
      return n;
    });
    await setSaved(user.uid, code, !has);
  }

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

  const allWorkouts = weeks.flatMap((w) => w.workouts);
  const sel = data.byCode[todayCode ?? ""] ?? allWorkouts[0];
  const upcoming = (joined ? allWorkouts.filter((w) => w.order >= currentIndex) : weeks[0]?.workouts ?? []).slice(0, 8);
  const pool = allWorkouts.map((w) => ({ ...w, phase: w.phaseIdx }));
  const resumeFrac = (v: WorkoutItem) =>
    resumeMap[v.code] != null ? Math.min(1, resumeMap[v.code] / ((v.muxDuration || v.mins * 60) || 1)) : undefined;
  const card = (v: WorkoutItem) => (
    <NCard
      key={v.code}
      v={{ ...v, phase: v.phaseIdx }}
      resume={resumeFrac(v)}
      saved={myList.has(v.code)}
      onToggleSave={() => toggleSave(v.code)}
      onPlay={(c) => play(c)}
      pool={pool}
    />
  );

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
      {sel && (
        <ProgPreviewDeck
          sel={sel}
          upcoming={upcoming}
          joined={joined}
          phases={program.phases}
          onOpenStage={setModalVideo}
          renderCard={card}
        />
      )}
      <ThisWeek
        week={weeks.find((w) => w.num === curWeek)}
        joined={joined}
        doneCount={doneCount}
        currentIndex={currentIndex}
        perWeek={program.perWeek ?? 5}
        onOpen={setModalVideo}
      />
      <ProgSplit />
      <ProgRetest />
      <Stats program={program} />

      {modalVideo && (
        <NcardModal
          video={{ ...modalVideo, phase: modalVideo.phaseIdx }}
          pool={weeks.flatMap((w) => w.workouts).map((w) => ({ ...w, phase: w.phaseIdx }))}
          saved={myList.has(modalVideo.code)}
          onToggleSave={() => toggleSave(modalVideo.code)}
          onClose={() => setModalVideo(null)}
          onPlay={(c) => play(c)}
        />
      )}
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
  week, joined, doneCount, currentIndex, perWeek, onOpen,
}: {
  week?: WeekGroup; joined: boolean; doneCount: number; currentIndex: number; perWeek: number;
  onOpen: (v: WorkoutItem) => void;
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
            <DayCard key={c.v.code} v={c.v} st={dayState(c.v.order, joined, doneCount, currentIndex)} onClick={() => onOpen(c.v)} />
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

function pvBlocks(v: WorkoutItem): { name: string; mins: number }[] {
  if (v.blocks?.length) return v.blocks.map((b) => ({ name: b.name, mins: b.mins }));
  const warm = Math.max(2, Math.round(v.mins * 0.14));
  const cool = Math.max(2, Math.round(v.mins * 0.16));
  const main = v.mins - warm - cool;
  if (v.mins <= 15) return [{ name: "Bemelegítés", mins: warm }, { name: v.format, mins: main }, { name: "Levezetés", mins: cool }];
  const m1 = Math.ceil(main / 2);
  return [
    { name: "Bemelegítés", mins: warm },
    { name: `${v.format} · 1. blokk`, mins: m1 },
    { name: `${v.format} · 2. blokk`, mins: main - m1 },
    { name: "Levezetés", mins: cool },
  ];
}

function ProgPreviewDeck({
  sel, upcoming, joined, phases, onOpenStage, renderCard,
}: {
  sel: WorkoutItem; upcoming: WorkoutItem[]; joined: boolean;
  phases: FoundationData["program"]["phases"];
  onOpenStage: (v: WorkoutItem) => void; renderCard: (v: WorkoutItem) => React.ReactNode;
}) {
  const phase = phases[sel.phaseIdx];
  const blocks = pvBlocks(sel);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <section className="npview">
        <button className="npv-stage" onClick={() => onOpenStage(sel)}>
          <span className="npv-kb" style={{ background: cardGrad(sel.theme) }}>
            <span className="ring" />
            <span className="word">{catWord(sel.theme)}</span>
          </span>
          <span className="vig" />
          <span className="npv-badge">{joined ? "MAI EDZÉS" : "1. NAP"}</span>
          <span className="npv-dur">{sel.mins} PERC</span>
          <span className="npv-live"><span className="d" /> ELŐNÉZET</span>
          <span className="npv-play"><i><LxIcon d={lxPaths.play} size={22} fill /></i></span>
          <span className="npv-progress"><i /></span>
        </button>
        <div className="npv-info">
          <div className="npv-ey">
            {joined ? `MAI EDZÉS · ${(sel.dayName ?? "").toUpperCase()} · HÉT ${sel.week}` : "AZ ELSŐ EDZÉSED · HÉTFŐ · HÉT 1"}
          </div>
          <h2 className="npv-h">{sel.title}</h2>
          <div className="npv-meta">
            <span className="lvl">{levelWord(sel.level)}</span>
            <span>{sel.mins} perc</span><i />
            <span>{sel.format}</span><i />
            <span>{phase?.icon} {phase?.name}</span>
          </div>
          {sel.types.length > 0 && (
            <div className="npv-tags">{sel.types.map((t) => <span key={t}>{t}</span>)}</div>
          )}
          <p className="npv-syn">Vezetett edzés, eszköz nélkül — elég egy matrac. Alexa végig veled csinálja.</p>
          <div className="npv-struct">
            <div className="ns-h">Az edzés felépítése</div>
            <div className="ns-rows">
              {blocks.map((b, i) => (
                <div className="ns-row" key={b.name}>
                  <span className="ns-bar">
                    <i style={{ width: `${Math.round((b.mins / sel.mins) * 100)}%`, background: i === 0 || i === blocks.length - 1 ? "var(--surface-2)" : "var(--accent-soft)" }} />
                  </span>
                  <span className="ns-nm">{b.name}</span>
                  <span className="ns-m">{b.mins}′</span>
                </div>
              ))}
            </div>
          </div>
          <div className="npv-ctas">
            <button className="npv-play-btn" onClick={() => onOpenStage(sel)}>
              <LxIcon d={lxPaths.play} size={17} fill /> {joined ? "Edzés indítása" : "Kezdés — 1. nap"}
            </button>
          </div>
        </div>
      </section>

      <div>
        <div className="npv-railhead">
          <h3 className="pg-h" style={{ fontSize: 17 }}>{joined ? "Folytasd a programot" : "Az első heted"}</h3>
          <span className="mono">{joined ? `MA + ${Math.max(0, upcoming.length - 1)} jön` : "5 edzés · Hét 1"}</span>
        </div>
        <div className="npv-grid">{upcoming.map((v) => renderCard(v))}</div>
      </div>
    </div>
  );
}

const SPLIT: { d: string; theme?: string }[] = [
  { d: "Hétfő", theme: "Alsótest" }, { d: "Kedd", theme: "Felsőtest" }, { d: "Szerda" },
  { d: "Csütörtök", theme: "Cardio + has" }, { d: "Péntek", theme: "Teljes test" },
  { d: "Szombat", theme: "Mobility / nyújtás" }, { d: "Vasárnap" },
];

function ProgSplit() {
  return (
    <div>
      <div className="pg-sechd"><h2 className="pg-h">A heti ritmus</h2><span className="sub">5 edzés + 2 pihenő</span></div>
      <div className="pg-split">
        {SPLIT.map((s) => (
          <div className={`sp${s.theme ? "" : " rest"}`} key={s.d}>
            <div className="dd">{s.d}</div>
            {s.theme ? (
              <>
                <div className="dot" style={{ background: catOf(s.theme).c }} />
                <div className="th">{catWord(s.theme) === "MOBILITY" ? "Mobility" : s.theme}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 17, margin: "5px 0 4px" }}>🛌</div>
                <div className="th">Pihenő</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgRetest() {
  return (
    <section className="pg-retest">
      <div className="rt-head">
        <span className="rt-ic">📊</span>
        <div>
          <h2 className="rt-ttl">Fejlődés-mérés</h2>
          <p className="rt-sub">Kétszer visszahozzuk a nyitóhetet — így a fejlődésed mérhető tény, nem érzés.</p>
        </div>
      </div>
      <div className="rt-grid">
        <div className="rt-card">
          <div className="rc-wk">🔥 Hét 5 · Visszamérés</div>
          <div className="rc-h">Újra, erősebben</div>
          <p className="rc-p">A nyitóhét edzései +1 körrel vagy +1 gyakorlattal. Az első mérföldköved.</p>
        </div>
        <div className="rt-card">
          <div className="rc-wk">🏆 Hét 8 · Záró mérés</div>
          <div className="rc-h">Pontosan a Hét 1</div>
          <p className="rc-p">Ugyanaz az edzés, mint az elején. A különbség te leszel — számokban.</p>
        </div>
      </div>
    </section>
  );
}
