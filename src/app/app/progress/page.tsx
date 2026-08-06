"use client";

import "./haladasom.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { getOnboarding } from "@/lib/user";
import {
  getProgress, addObservation, syncMuxProgress,
  getPendingCompletions, clearConfirmedPending,
  type ProgressState, type PendingCompletion,
} from "@/lib/progress";
import { computeStreak } from "@/lib/streak";
import { getPrefs } from "@/lib/prefs";
import { getPhotos, uploadMilestonePhoto, MILESTONES, type Milestone } from "@/lib/photos";
import { loadFoundation, type FoundationData } from "@/lib/program";

const CAM = ["M4 8 h3 l1.5 -2 h7 l1.5 2 h3 v11 h-19 Z", "M12 16.5 a3 3 0 1 0 0-6 a3 3 0 0 0 0 6 Z"];
const DAY_LABELS = ["H", "K", "SZE", "CS", "P", "SZO", "V"]; // Monday-first (HU)
// program day codes → Monday-first weekday index
const DAY_IDX: Record<string, number> = { h: 0, k: 1, sze: 2, cs: 3, p: 4, szo: 5, v: 6 };

// ── date helpers (completions store `at` as YYYY-MM-DD strings) ──
const pad = (n: number) => String(n).padStart(2, "0");
const sgn = (n: number) => `${n >= 0 ? "+" : ""}${n}`;
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const daysBetween = (a: Date, b: Date) => Math.floor((b.getTime() - a.getTime()) / 86400000);

function longestStreak(dateStrs: string[]): number {
  const days = [...new Set(dateStrs)].map(parseYmd).sort((a, b) => a.getTime() - b.getTime());
  let best = 0, run = 0;
  let prev: Date | null = null;
  for (const d of days) {
    run = prev && daysBetween(prev, d) === 1 ? run + 1 : 1;
    prev = d;
    if (run > best) best = run;
  }
  return best;
}

type Won = { text: string; week: number; at: string };

export default function HaladasomPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [onb, setOnb] = useState<Record<string, unknown> | null>(null);
  const [photos, setPhotos] = useState<Partial<Record<Milestone, string>>>({});
  const [fnd, setFnd] = useState<FoundationData | null>(null);
  const [pending, setPending] = useState<PendingCompletion[]>([]);
  const [restDayKeepsStreak, setRestDayKeepsStreak] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    // Pull fresh Mux data first — this page is the reason the sync exists.
    syncMuxProgress({ force: true })
      .then(() => Promise.all([getProgress(uid), getOnboarding(uid), getPhotos(uid), loadFoundation(uid), getPrefs(uid)]))
      .then(([p, o, ph, f, pr]) => {
        clearConfirmedPending(p?.completed ?? []);
        setPending(getPendingCompletions());
        setProgress(p); setOnb(o); setPhotos(ph); setFnd(f); setRestDayKeepsStreak(pr.plan.restDayKeepsStreak);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const model = useMemo(
    () => derive(progress, onb, fnd, pending, restDayKeepsStreak),
    [progress, onb, fnd, pending, restDayKeepsStreak],
  );

  async function upload(m: Milestone, file: File) {
    if (!user) return;
    const url = await uploadMilestonePhoto(user.uid, m, file);
    setPhotos((p) => ({ ...p, [m]: url }));
  }
  async function refresh() { if (user) setProgress(await getProgress(user.uid)); }
  async function submitWin(text: string) { if (user) { await addObservation(user.uid, text, model.currentWeek); await refresh(); } }

  if (loading) return <p className="hp-loading">Töltés…</p>;

  const m = model;

  return (
    <div className="hp fade-in">
      <header className="hp-top">
        <h1>Haladásom</h1>
        <span className="hp-crumb">az edzéseid, hétről hétre</span>
      </header>

      {/* ── Q1 · „Jól állok a héten?" — ring + week strip ── */}
      <section className="hp-q1">
        <div className="hp-card hp-ring-card">
          <div className="hp-ring" style={{ "--p": Math.min(100, Math.round((m.thisWeek / Math.max(1, m.weekTarget)) * 100)) } as React.CSSProperties} aria-hidden="true" />
          <div className="hp-ring-txt">
            <div className="hp-ring-num">{m.thisWeek}<i> / {m.weekTarget}</i></div>
            <div className="hp-ring-sub">edzés ezen a héten</div>
            <Delta value={m.thisWeek - m.lastWeek} unit="a múlt héthez képest" />
          </div>
        </div>

        <div className="hp-card hp-week-card">
          <div className="hp-eyebrow">Ez a hét · {m.weekRange}</div>
          <div className="hp-week">
            {m.days.map((d) => (
              <div key={d.label} className={`hp-day${d.done ? " done" : d.today ? " today" : d.rest ? " rest" : ""}`}>
                <span className="dl">{d.label}</span>
                <span className="dd">
                  {d.done ? <LxIcon d={lxPaths.check} size={15} sw={2.6} /> : d.rest && !d.today ? <LxIcon d={lxPaths.moon} size={14} /> : null}
                </span>
              </div>
            ))}
          </div>
          <div className="hp-week-note">A pihenőnap nem töri meg a sorozatot.</div>
        </div>
      </section>

      {/* ── Q2 · „Tartom a szokást?" — consistency (streak with forgiveness) ── */}
      <section className="hp-stats">
        {m.streak >= 1
          ? <Stat n={String(m.streak)} k="napos sorozat" d={m.streak >= m.longest ? "a leghosszabb eddig" : `a leghosszabb: ${m.longest} nap`} />
          : m.done > 0
            ? <Stat n={String(m.longest)} k="nap volt a leghosszabb" d="új sorozat egy edzésre van" />
            : <Stat n="0" k="napos sorozat" d="kezdd el ma" />}
        {m.totalMins > 0
          ? <Stat n={String(m.totalMins)} k="perc mozgás összesen"
              d={`${sgn(m.weekMins - m.lastWeekMins)} perc a múlt héthez${m.lastMonthMins > 0 ? ` · ${sgn(m.monthMins - m.lastMonthMins)} a múlt hónaphoz` : ` · ${m.monthMins} perc a hónapban`}`} />
          : <Stat n={String(m.activeDays)} k="aktív nap" d="amikor mozogtál" />}
        <Stat n={String(m.done)} k="elvégzett edzés" d={m.weekStreak > 0 ? `${m.weekStreak} hét egymás után` : "eddig összesen"} />
      </section>

      {/* rolling weekly rhythm — starts once there's real activity (first started
          or completed video); before that, an invitation to begin, not an empty chart */}
      <section className="hp-card hp-chart">
        <div className="hp-card-ttl"><LxIcon d={lxPaths.chartColumn} size={16} /> Heti ritmus</div>
        {m.hasActivity ? (
          <>
            <div className="hp-bars">
              {m.bars.map((b, i) => {
                const now = i === m.bars.length - 1;
                const h = Math.max(6, Math.round((b / m.maxBar) * 100));
                return (
                  <div key={i} className={`hp-bar${now ? " now" : ""}`}>
                    <span className="fill" style={{ height: `${h}%` }} />
                    <span className="wl">{now ? "EZ A HÉT" : b > 0 ? String(b) : ""}</span>
                  </div>
                );
              })}
            </div>
            <div className="hp-chart-note">Heti edzésszám az elmúlt {m.bars.length} hétben. A heti célod: {m.weekTarget}.</div>
          </>
        ) : (
          <div className="hp-chart-empty">
            <p>Még nincs mit mutatni. Indítsd el az első edzésed, és itt épül fel a heti ritmusod — hétről hétre.</p>
            <button className="lxbtn m primary" onClick={() => router.push("/app")}>
              <LxIcon d={lxPaths.play} size={15} fill /> Első edzés indítása
            </button>
          </div>
        )}
      </section>

      {/* ── Q3 · the proof — non-scale wins (real, Firebase-backed observations) ── */}
      <section className="hp-h4">
        <Wins why={m.why} observations={m.observations} onAdd={submitWin} />
      </section>

      {/* private progress photos — own full-width row, larger slots */}
      <Photos photos={photos} currentWeek={m.currentWeek} onUpload={upload} />

      <p className="hp-foot">
        <LxIcon d={lxPaths.check} size={13} sw={2.6} /> A víz, a hormonok és a napszak ingadoznak — a trend számít.
      </p>
    </div>
  );
}

// ── derivation ─────────────────────────────────────────────────────────────
function derive(p: ProgressState | null, onb: Record<string, unknown> | null, fnd: FoundationData | null, pending: PendingCompletion[] = [], restDayKeepsStreak = true) {
  const program = fnd?.program ?? null;
  const perWeek = program?.perWeek ?? 5;
  const weekTarget = (typeof onb?.days === "number" ? (onb.days as number) : undefined) ?? perWeek;

  const confirmed = p?.completed ?? [];
  // Optimistic bridge: workouts the player saw finish that the Mux sync hasn't
  // confirmed yet (a view finalizes seconds-to-minutes after the player closes).
  const completed = [
    ...confirmed,
    ...pending
      .filter((x) => !confirmed.some((c) => c.code === x.code && String(c.at) === x.at))
      .map((x) => ({ code: x.code, at: x.at })),
  ];
  const dates = completed.map((c) => String(c.at));
  const today = new Date();
  const start = (p?.joinedAt as { toDate?: () => Date } | undefined)?.toDate?.() ?? null;

  const currentWeek = start
    ? Math.max(1, Math.floor(daysBetween(start, today) / 7) + 1)
    : Math.max(1, Math.floor((p?.currentIndex ?? 0) / perWeek) + 1);

  // fixed weekly workout-day set (same every week) → the rest are rest days
  const workoutIdx = new Set<number>(p?.workoutDays ?? []);
  const firstWeek = fnd?.weeks[0];
  if (firstWeek) for (const w of firstWeek.workouts) { const i = DAY_IDX[(w.day || "").toLowerCase()]; if (i != null) workoutIdx.add(i); }

  const inRange = (from: Date, to: Date) => dates.filter((s) => { const d = parseYmd(s); return d >= from && d < to; }).length;

  // THIS calendar week — the unit of commitment (R6-01). Program-agnostic.
  const mon = mondayOf(today);
  const days = DAY_LABELS.map((label, i) => {
    const key = ymd(addDays(mon, i));
    return { label, done: dates.includes(key), today: key === ymd(today), rest: workoutIdx.size > 0 && !workoutIdx.has(i) };
  });
  const thisWeek = inRange(mon, addDays(mon, 7));
  const lastWeek = inRange(addDays(mon, -7), mon);

  // Rolling last-8 CALENDAR weeks (oldest → this week) — the weekly rhythm across
  // every activity (programs, challenges, standalone), not one program's arc.
  const ROLL = 8;
  const bars = Array.from({ length: ROLL }, (_, k) => {
    const wm = addDays(mon, -(ROLL - 1 - k) * 7);
    return inRange(wm, addDays(wm, 7));
  });
  const maxBar = Math.max(weekTarget, ...bars, 1);
  // consecutive fully-completed past weeks (weekly-goal consistency)
  let weekStreak = 0;
  for (let k = ROLL - 2; k >= 0; k--) { if (bars[k] >= weekTarget) weekStreak++; else break; }

  const MONTHS = ["jan.", "feb.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
  const sun = addDays(mon, 6);
  const weekRange = mon.getMonth() === sun.getMonth()
    ? `${MONTHS[mon.getMonth()]} ${mon.getDate()}–${sun.getDate()}.`
    : `${MONTHS[mon.getMonth()]} ${mon.getDate()}. – ${MONTHS[sun.getMonth()]} ${sun.getDate()}.`;

  const distinctCodes = [...new Set(completed.map((c) => c.code))];
  // Real watched time from the dated watchByDay buckets (Mux-synced) — total,
  // this-week vs last-week, and this-month vs last-month directions.
  const watch = p?.watchByDay ?? {};
  const totalMins = Math.round(Object.values(watch).reduce((a, b) => a + b, 0) / 60);
  const sumRange = (from: Date, to: Date) =>
    Object.entries(watch).reduce((a, [k, v]) => { const d = parseYmd(k); return d >= from && d < to ? a + v : a; }, 0);
  const weekMins = Math.round(sumRange(mon, addDays(mon, 7)) / 60);
  const lastWeekMins = Math.round(sumRange(addDays(mon, -7), mon) / 60);
  const monPrefix = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const thisMon = monPrefix(today);
  const lastMon = monPrefix(new Date(today.getFullYear(), today.getMonth() - 1, 1));
  const sumWhere = (pre: string) => Object.entries(watch).filter(([k]) => k.startsWith(pre)).reduce((a, [, v]) => a + v, 0);
  const monthMins = Math.round(sumWhere(thisMon) / 60);
  const lastMonthMins = Math.round(sumWhere(lastMon) / 60);

  return {
    weekTarget, weekRange, currentWeek,
    thisWeek, lastWeek, days,
    // Derived fresh on every read (never stored-stale), rest-day aware.
    streak: computeStreak(dates, workoutIdx, ymd(today), restDayKeepsStreak),
    longest: longestStreak(dates),
    weekStreak,
    totalMins, weekMins, lastWeekMins, monthMins, lastMonthMins,
    done: distinctCodes.length,
    activeDays: new Set(dates).size,
    // Any real activity yet? First completed OR first started video (a started
    // video leaves watched seconds in a day bucket). Gates the Heti ritmus chart.
    hasActivity: completed.length > 0 || Object.keys(watch).length > 0,
    bars, maxBar,
    observations: [...(p?.observations ?? [])].reverse() as Won[],
    why: String((onb?.why ?? onb?.motiv ?? "") || ""),
  };
}

// ── small pieces ───────────────────────────────────────────────────────────
function Delta({ value, unit }: { value: number; unit: string }) {
  if (value === 0) return <div className="hp-delta flat">azonos, mint {unit}</div>;
  const up = value > 0;
  return <div className={`hp-delta${up ? " up" : " down"}`}>{up ? "+" : ""}{value} {unit}</div>;
}

function Stat({ n, k, d }: { n: string; k: string; d: string }) {
  return (
    <div className="hp-card hp-stat">
      <div className="n">{n}</div>
      <div className="k">{k}</div>
      <div className="d">{d}</div>
    </div>
  );
}

function Wins({ why, observations, onAdd }: { why: string; observations: Won[]; onAdd: (t: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const submit = () => { if (text.trim()) { onAdd(text); setText(""); setAdding(false); } };
  return (
    <div className="hp-card hp-wins">
      <div className="hp-card-ttl"><LxIcon d={lxPaths.check} size={16} /> Amit észrevettél</div>
      {why && <div className="hp-why">Miért kezdted: <span>„{why}”</span></div>}
      {observations.length === 0 && !adding && (
        <p className="hp-wins-empty">Amit egy mérleg sosem mutat meg — kevesebb kifulladás, könnyebb reggelek. Írd le a saját szavaiddal.</p>
      )}
      {observations.map((o, i) => (
        <div className="hp-win" key={i}>
          <LxIcon d={lxPaths.check} size={15} sw={2.4} />
          <div><div className="t">{o.text}</div><div className="s">{o.week}. hét · a te szavaiddal</div></div>
        </div>
      ))}
      {adding ? (
        <div className="hp-win-add">
          <input autoFocus value={text} maxLength={140} placeholder="pl. A lépcsőn nem fulladok ki."
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setAdding(false); }} />
          <button className="lxbtn s primary" onClick={submit}>Mentés</button>
        </div>
      ) : (
        <button className="lxbtn s secondary hp-win-btn" onClick={() => setAdding(true)}><LxIcon d={lxPaths.plus} size={14} /> Új megfigyelés</button>
      )}
    </div>
  );
}

function Photos({ photos, currentWeek, onUpload }: { photos: Partial<Record<Milestone, string>>; currentWeek: number; onUpload: (m: Milestone, f: File) => void }) {
  const [compare, setCompare] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pending = useRef<Milestone | null>(null);
  const pick = (mm: Milestone) => { pending.current = mm; fileRef.current?.click(); };
  const nowMilestone: Milestone = currentWeek >= 8 ? 8 : currentWeek >= 5 ? 5 : 1;
  const hasTwo = !!photos[1] && !!(photos[8] ?? photos[5] ?? photos[nowMilestone]);

  return (
    <div className="hp-card hp-photos">
      <div className="hp-card-ttl"><LxIcon d={lxPaths.user} size={16} /> Haladásfotók</div>
      <p className="hp-photos-priv">Csak te látod. Nem oszthatók meg egy gombnyomással, és nem kerülnek sehova.</p>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f && pending.current) onUpload(pending.current, f); e.target.value = ""; }} />

      {compare ? (
        <Compare
          startUrl={photos[1]}
          nowUrl={photos[8] ?? photos[5] ?? photos[nowMilestone]}
          currentWeek={currentWeek}
          onUploadStart={(f) => onUpload(1, f)}
          onUploadNow={(f) => onUpload(nowMilestone, f)}
        />
      ) : (
        <div className="hp-slots">
          {MILESTONES.map((mm) => {
            const url = photos[mm];
            const reached = currentWeek >= mm;
            const locked = !reached && !url;
            return (
              <button key={mm} type="button" className={`hp-slot${url ? " filled" : ""}${locked ? " locked" : ""}`}
                style={url ? { backgroundImage: `url(${url})` } : undefined} disabled={locked} onClick={() => !locked && pick(mm)}>
                {locked ? <LxIcon d={lxPaths.lock} size={18} /> : !url ? <span className="add"><LxIcon d={CAM} size={18} sw={1.8} /></span> : null}
                <span className="cap">{mm}. HÉT</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="hp-photos-cta">
        <button className="lxbtn s secondary" onClick={() => (compare ? setCompare(false) : pick(nowMilestone))}>{compare ? "Slotok" : "Fotó hozzáadása"}</button>
        <button className="lxbtn s secondary" onClick={() => setCompare((v) => !v)} disabled={!hasTwo && !compare}>{compare ? "Bezár" : "Összehasonlítás"}</button>
      </div>
    </div>
  );
}

// ── before/after comparison (kept — slider + side-by-side) ───────────────────
function Compare({
  startUrl, nowUrl, currentWeek, onUploadStart, onUploadNow,
}: {
  startUrl?: string; nowUrl?: string; currentWeek: number;
  onUploadStart: (f: File) => void; onUploadNow: (f: File) => void;
}) {
  const [view, setView] = useState<"slider" | "side">("slider");
  const [pos, setPos] = useState(52);
  const ref = useRef<HTMLDivElement>(null);
  const startInput = useRef<HTMLInputElement>(null);
  const nowInput = useRef<HTMLInputElement>(null);

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    const move = (ev: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      setPos(Math.max(4, Math.min(96, ((ev.clientX - r.left) / r.width) * 100)));
    };
    const up = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };
  const photoStyle = (url?: string) => (url ? { backgroundImage: `url(${url})` } : undefined);

  return (
    <div className="cmp">
      <input ref={startInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onUploadStart(e.target.files[0])} />
      <input ref={nowInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onUploadNow(e.target.files[0])} />
      <div className="cmp-toggle">
        <button className={view === "slider" ? "on" : ""} onClick={() => setView("slider")}>
          <LxIcon d={["M9 6 L4 12 L9 18", "M15 6 L20 12 L15 18"]} size={15} sw={2} /> Csúszka
        </button>
        <button className={view === "side" ? "on" : ""} onClick={() => setView("side")}>
          <LxIcon d={["M4 5 H10 V19 H4 Z", "M14 5 H20 V19 H14 Z"]} size={15} sw={1.8} /> Egymás mellett
        </button>
      </div>
      <div className="cmp-stage">
        {view === "slider" ? (
          <div className="halc-slider" ref={ref}>
            <div className="ba-layer">
              <div className={`hal-photo${nowUrl ? "" : " empty"}`} style={photoStyle(nowUrl)}>
                {!nowUrl && <span className="ph-hint">Mai fotó — tölts fel egy álló képet</span>}
              </div>
            </div>
            <div className="ba-layer" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <div className={`hal-photo${startUrl ? "" : " empty"}`} style={photoStyle(startUrl)}>
                {!startUrl && <span className="ph-hint">Indulás-fotó — tölts fel egy álló képet</span>}
              </div>
            </div>
            <span className="halc-tag l" style={{ opacity: pos < 16 ? 0.35 : 1 }}>INDULÁS · HÉT 1</span>
            <span className="halc-tag r" style={{ opacity: pos > 84 ? 0.35 : 1 }}>MOST · {currentWeek}. HÉT</span>
            <span className="ba-divider" style={{ left: `${pos}%` }} />
            <span className="ba-handle" style={{ left: `${pos}%`, top: "50%" }} onPointerDown={startDrag}>
              <LxIcon d={["M9 6 L4 12 L9 18", "M15 6 L20 12 L15 18"]} size={20} sw={2} />
            </span>
            <button className="ba-change l" onClick={() => startInput.current?.click()}><LxIcon d={CAM} size={15} sw={1.8} /> Csere</button>
            <button className="ba-change r" onClick={() => nowInput.current?.click()}><LxIcon d={CAM} size={15} sw={1.8} /> Csere</button>
            {currentWeek > 1 && (
              <span className="halc-badge"><LxIcon d={lxPaths.flame} size={16} sw={2} /> +{currentWeek - 1} HÉT EREJE</span>
            )}
          </div>
        ) : (
          <div className="cmp-side">
            <div className="cmp-fig">
              <div className="cmp-frame">
                <div className={`hal-photo${startUrl ? "" : " empty"}`} style={photoStyle(startUrl)}>
                  {!startUrl && <span className="ph-hint">Indulás</span>}
                </div>
                <span className="cmp-flabel">INDULÁS · HÉT 1</span>
              </div>
              <button className="cmp-chg" onClick={() => startInput.current?.click()}><LxIcon d={CAM} size={14} sw={1.8} /> Indulás cseréje</button>
            </div>
            <div className="cmp-arrow">
              <span className="ar"><LxIcon d={lxPaths.arrowR} size={18} /></span>
              <span className="lab">+{Math.max(0, currentWeek - 1)} HÉT</span>
            </div>
            <div className="cmp-fig">
              <div className="cmp-frame">
                <div className={`hal-photo${nowUrl ? "" : " empty"}`} style={photoStyle(nowUrl)}>
                  {!nowUrl && <span className="ph-hint">Most</span>}
                </div>
                <span className="cmp-flabel">MOST · {currentWeek}. HÉT</span>
              </div>
              <button className="cmp-chg" onClick={() => nowInput.current?.click()}><LxIcon d={CAM} size={14} sw={1.8} /> Mai cseréje</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
