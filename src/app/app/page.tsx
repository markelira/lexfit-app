"use client";

import "./foundation.css";
import "./home.css";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ensureProgress, getProgress, type ProgressState } from "@/lib/progress";
import { getMyList, setSaved } from "@/lib/mylist";
import { NcardModal } from "@/components/NcardModal";
import { WorkoutCard } from "@/components/WorkoutCard";
import { MobileWorkoutSheet, type SheetVideo } from "@/components/MobileWorkoutSheet";
import { useIsMobile } from "@/lib/useIsMobile";
import { Button } from "@/components/Button";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { levelWord } from "@/lib/categories";
import { loadLibrary, type LibVideo } from "@/lib/library";
import { GuideController, GUIDE_START_EVENT } from "@/components/GuidedTour";
import { JoinCinematic } from "@/components/JoinCinematic";
import { loadFoundation, dayState, type FoundationData, type WorkoutItem } from "@/lib/program";
import { confirmCheckout } from "@/lib/billing";

type AnyVideo = WorkoutItem | LibVideo;

export default function KezdolapPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<FoundationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVideo, setModalVideo] = useState<WorkoutItem | null>(null);
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [cineOpen, setCineOpen] = useState(false);
  const [libVideos, setLibVideos] = useState<LibVideo[]>([]);
  const [sheetVideo, setSheetVideo] = useState<SheetVideo | null>(null);
  const isMobile = useIsMobile();

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

  // Success-page fulfillment: confirm the Checkout session so access is instant.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const sid = p.get("session_id");
    if (p.get("sub") === "success" && sid) {
      confirmCheckout(sid).finally(() => {
        window.history.replaceState({}, "", "/app");
        reload();
      });
    }
  }, [reload]);

  useEffect(() => {
    reload();
    loadLibrary().then((d) => setLibVideos(d.videos)).catch(() => {});
    if (user) {
      getMyList(user.uid).then(setMyList).catch(() => {});
      getProgress(user.uid).then(setProgress).catch(() => {});
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
    getProgress(user.uid).then(setProgress).catch(() => {});
  }

  async function completeJoin() {
    setCineOpen(false);
    await join();
    window.dispatchEvent(new Event(GUIDE_START_EVENT));
  }

  if (loading) return <p style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", marginTop: 40 }}>Töltés…</p>;
  if (!data) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>A Foundation program még nem érhető el.</p>;

  const { program, weeks, joined, doneCount, currentIndex, todayCode } = data;
  const perWeek = program.perWeek || 5;
  // Current week per handout §5: which session you're ON, not how many you've finished.
  const curWeek = joined ? Math.min(weeks.length || 1, Math.floor(currentIndex / perWeek) + 1) : 1;
  const programWeeks = program.weeks ?? weeks.length;
  const name = user?.displayName?.split(" ")[0] ?? "te";
  const play = (code: string | null) => code && router.push(`/player/${code}?autostart=1`);

  // lookup that spans both program workouts and the wider library
  const videoByCode: Record<string, AnyVideo> = {};
  libVideos.forEach((v) => (videoByCode[v.code] = v));
  Object.values(data.byCode).forEach((v) => (videoByCode[v.code] = v));

  // On mobile, tapping a card opens the detail sheet (§M4); desktop plays directly.
  const openOrPlay = (code: string) => {
    if (isMobile && videoByCode[code]) setSheetVideo(videoByCode[code] as SheetVideo);
    else play(code);
  };

  const resumeMap = progress?.resume ?? {};
  const resumeAt = progress?.resumeAt ?? {};
  const completedMap: Record<string, { at: string; atTime?: string }> = {};
  (progress?.completed ?? []).forEach((c) => {
    completedMap[c.code] = { at: typeof c.at === "string" ? c.at : "", atTime: c.atTime };
  });

  const resumeFrac = (v: AnyVideo) =>
    resumeMap[v.code] != null
      ? Math.min(1, resumeMap[v.code] / ((v.muxDuration || v.mins * 60) || 1))
      : undefined;

  const cardFor = (v: AnyVideo) => {
    const item = data.byCode[v.code];
    const comp = completedMap[v.code];
    return (
      <WorkoutCard
        key={v.code}
        v={v}
        isToday={v.code === todayCode}
        isProgram={!!item}
        programWeek={item?.week ?? null}
        programWeeks={programWeeks}
        resume={resumeFrac(v)}
        completedAt={comp ? comp.at : null}
        completedTime={comp?.atTime ?? null}
        saved={myList.has(v.code)}
        onPlay={openOrPlay}
        onToggleSave={toggleSave}
      />
    );
  };

  const todayVideo = todayCode ? (data.byCode[todayCode] as WorkoutItem | undefined) : undefined;

  // ── rows (exact order — §3.3) ──
  // 1 · Folytatod — in-progress resume entries, most recent first
  const resumeCodes = Object.keys(resumeMap)
    .filter((c) => resumeMap[c] > 0 && videoByCode[c])
    .sort((a, b) => (resumeAt[b] ?? 0) - (resumeAt[a] ?? 0)); // most recent first (§3.3)
  const rowResume = resumeCodes.map((c) => videoByCode[c]);

  // 2 · A Foundation heted — current week's sessions
  const rowWeek = joined ? weeks.find((w) => w.num === curWeek)?.workouts ?? [] : [];

  // 3 · Listám
  const rowList = [...myList].map((c) => videoByCode[c]).filter(Boolean) as AnyVideo[];

  // 4 · Ha csak 15 perced van
  const rowShort = libVideos.filter((v) => v.mins <= 15 && v.kind === "workout");

  // 5 · Szavazz Magadra · a heti kihívás
  const rowChallenge = libVideos.filter((v) => v.kind === "bonus");

  return (
    <div className="home fade-in">
      <Billboard
        program={program}
        joined={joined}
        name={name}
        curWeek={curWeek}
        today={todayVideo}
        onPlayToday={() => play(todayCode)}
        onSecondary={() => todayVideo && setModalVideo(todayVideo)}
        onJoin={() => setCineOpen(true)}
      />

      <WeekStrip
        workouts={weeks.find((w) => w.num === curWeek)?.workouts ?? weeks[0]?.workouts ?? []}
        joined={joined}
        doneCount={doneCount}
        currentIndex={currentIndex}
        perWeek={perWeek}
        curWeek={curWeek}
      />

      <div className="home-rows">
        <HomeRow title="A Foundation heted" allLabel="Program" onAll={() => router.push("/app/program/foundation")} cards={rowWeek.map(cardFor)} />
        <HomeRow title="Folytatod" allLabel="Összes" onAll={() => router.push("/app/library")} cards={rowResume.map(cardFor)} />
        <HomeRow title="Listám" allLabel="Összes" onAll={() => router.push("/app/library")} cards={rowList.map(cardFor)} />
        <HomeRow title="Ha csak 15 perced van" allLabel="Összes" onAll={() => router.push("/app/library")} cards={rowShort.map(cardFor)} />
        <HomeRow title="Szavazz Magadra · a heti kihívás" allLabel="Kihívások" onAll={() => router.push("/app/challenges")} cards={rowChallenge.map(cardFor)} />
      </div>

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
      {cineOpen && (
        <JoinCinematic
          name={name}
          onJoin={completeJoin}
          onClose={() => setCineOpen(false)}
        />
      )}
      <MobileWorkoutSheet
        v={sheetVideo}
        saved={sheetVideo ? myList.has(sheetVideo.code) : false}
        onPlay={(c) => { setSheetVideo(null); play(c); }}
        onToggleSave={toggleSave}
        onClose={() => setSheetVideo(null)}
      />
      <GuideController />
    </div>
  );
}

/* ════════ Billboard — today's workout (§3.1) ════════ */
function Billboard({
  program, joined, name, curWeek, today, onPlayToday, onSecondary, onJoin,
}: {
  program: FoundationData["program"];
  joined: boolean;
  name: string;
  curWeek: number;
  today: WorkoutItem | undefined;
  onPlayToday: () => void;
  onSecondary: () => void;
  onJoin: () => void;
}) {
  const equip = !program.equipment || /nincs/i.test(program.equipment) ? "ESZKÖZ NÉLKÜL" : program.equipment.toUpperCase();
  const eyebrow = joined
    ? `${program.title.toUpperCase()} · ${curWeek}. HÉT · MAI EDZÉS`
    : "LEXFIT · 8 HETES PROGRAM";

  return (
    <section className="hb">
      <div
        className="hb-art"
        style={{ background: "linear-gradient(120deg, oklch(0.28 0.05 168) 0%, oklch(0.5 0.05 168) 58%, oklch(0.66 0.05 168) 100%)" }}
      />
      <div className="hb-photo" style={{ backgroundImage: "url(/trainer-underlayer.jpg)" }} aria-hidden="true" />
      <span className="hb-ring" aria-hidden="true" />
      <span className="hb-word" aria-hidden="true">{program.title.toUpperCase()}</span>
      <span className="hb-scrim" aria-hidden="true" />
      <span className="hb-vig" aria-hidden="true" />

      <div className="hb-top">
        <span className="hb-hello">Szia, {name}!</span>
      </div>

      <div className="hb-content">
        <div className="hb-eyebrow">{eyebrow}</div>
        {joined ? (
          <>
            <h1 className="hb-title">{today?.title ?? program.title}</h1>
            {today && (
              <div className="hb-chips">
                <span className="hb-chip">{today.mins} PERC</span>
                <span className="hb-chip">{levelWord(today.level).toUpperCase()}</span>
                <span className="hb-chip">{equip}</span>
              </div>
            )}
            <div className="hb-ctas">
              <Button size="l" variant="primary" onDark iconLeft={lxPaths.play} data-tour="start" onClick={onPlayToday}>
                Edzés indítása
              </Button>
              <Button size="l" variant="secondary" onDark onClick={onSecondary}>Mit fogok ma csinálni?</Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="hb-title">
              {program.title}
              <small>{program.hu}</small>
            </h1>
            <p className="hb-syn">{program.synopsis}</p>
            <div className="hb-ctas">
              <Button size="l" variant="primary" onDark iconLeft={lxPaths.play} data-tour="start" onClick={onJoin}>
                Csatlakozz a programhoz
              </Button>
              <Button size="l" variant="secondary" onDark onClick={onSecondary}>Előzetes · 1. nap</Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ════════ Week strip (§3.2) ════════ */
const WEEK_DAYS: [string, string][] = [
  ["H", "Hétfő"], ["K", "Kedd"], ["SZE", "Szerda"], ["CS", "Csütörtök"],
  ["P", "Péntek"], ["SZO", "Szombat"], ["V", "Vasárnap"],
];

function WeekStrip({
  workouts, joined, doneCount, currentIndex, perWeek, curWeek,
}: {
  workouts: WorkoutItem[];
  joined: boolean;
  doneCount: number;
  currentIndex: number;
  perWeek: number;
  curWeek: number;
}) {
  if (!workouts.length) return null;

  // map each scheduled session onto its weekday column
  const byCol: Record<string, "done" | "today" | "todo" | "preview"> = {};
  workouts.forEach((w) => {
    const key = (w.day || "").toUpperCase();
    if (key) byCol[key] = dayState(w.order, joined, doneCount, currentIndex);
  });

  const doneThisWeek = Math.min(perWeek, Math.max(0, doneCount - (curWeek - 1) * perWeek));
  const ringPct = perWeek ? Math.round((doneThisWeek / perWeek) * 100) : 0;

  const cls = (s?: string) =>
    s === "done" ? "done" : s === "today" ? "today" : s == null ? "rest" : "todo";
  const label = (s?: string) =>
    s === "done" ? "kész" : s === "today" ? "mai nap · nincs kész" : s == null ? "pihenőnap" : "nincs kész";

  return (
    <div>
      <div className="wstrip" role="group" aria-label={`A hét: ${doneThisWeek} / ${perWeek} kész`}>
        <div
          className="wstrip-ring"
          style={{ "--p": ringPct } as React.CSSProperties}
          role="progressbar"
          aria-valuenow={doneThisWeek}
          aria-valuemin={0}
          aria-valuemax={perWeek}
          aria-label={`Heti haladás: ${doneThisWeek} / ${perWeek} kész`}
        >
          <b>{doneThisWeek}/{perWeek}</b>
        </div>
        {WEEK_DAYS.map(([abbr, full]) => {
          const s = byCol[abbr];
          const c = cls(s);
          return (
            <div key={abbr} className={`wstrip-day ${c}`}>
              <div className="d">{abbr}</div>
              <div className="dot" role="img" aria-label={`${full} · ${label(s)}`}>
                {c === "done" ? <LxIcon d={lxPaths.check} size={15} sw={2.6} /> : c === "rest" ? "☾" : ""}
              </div>
            </div>
          );
        })}
      </div>
      <p className="wstrip-note">A pihenőnap nem töri meg a sorozatot.</p>
    </div>
  );
}

/* ════════ Home row — heading + right link + horizontal scroll ════════ */
function HomeRow({
  title, allLabel, onAll, cards,
}: {
  title: string;
  allLabel: string;
  onAll: () => void;
  cards: React.ReactNode[];
}) {
  if (!cards.length) return null;
  return (
    <section className="hrow-sec">
      <div className="hrow-head">
        <h3>{title}</h3>
        <button className="all" onClick={onAll}>
          {allLabel} <LxIcon d={lxPaths.arrowR} size={14} />
        </button>
      </div>
      <div className="hrow">{cards}</div>
    </section>
  );
}
