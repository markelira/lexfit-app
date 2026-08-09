"use client";

import "./foundation.css";
import "./home.css";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ensureProgress, getProgress, getPendingCompletions, type ProgressState } from "@/lib/progress";
import { computeWeekProgress, type WeekProgress } from "@/lib/week-progress";
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
import { loadChallenges, type ChallengeCardData } from "@/lib/challenges";
import { ChallengeCard } from "@/components/ChallengeCard";
import { GuideController, GUIDE_START_EVENT } from "@/components/GuidedTour";
import { JoinCinematic } from "@/components/JoinCinematic";
import { loadFoundation, type FoundationData, type WorkoutItem } from "@/lib/program";
import { loadProgramIndex, type ProgramIndex } from "@/lib/program-index";
import { confirmCheckout } from "@/lib/billing";
import { getPrefs, updatePrefs } from "@/lib/prefs";
import type { Prefs } from "@/lib/profile";
import { FirstEntry } from "@/components/FirstEntry";
import { HomeSkeleton } from "@/components/Skeletons";

type AnyVideo = WorkoutItem | LibVideo;

export default function KezdolapPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<FoundationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVideo, setModalVideo] = useState<WorkoutItem | null>(null);
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [cineOpen, setCineOpen] = useState(false);
  const [libVideos, setLibVideos] = useState<LibVideo[]>([]);
  const [challenges, setChallenges] = useState<ChallengeCardData[]>([]);
  const [sheetVideo, setSheetVideo] = useState<SheetVideo | null>(null);
  const [pindex, setPindex] = useState<ProgramIndex | null>(null);
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
    loadProgramIndex().then(setPindex).catch(() => {});
    if (user) {
      getMyList(user.uid).then(setMyList).catch(() => {});
      getProgress(user.uid).then(setProgress).catch(() => {});
      getPrefs(user.uid).then(setPrefs).catch(() => {});
      loadChallenges(user.uid).then((d) => setChallenges(d.challenges)).catch(() => {});
    }
  }, [reload, user]);

  // First-entry reminder card (40 §40.9 / P7.2). P0.6 = email channel, so
  // "Beállítom" only writes the pref — no OS permission prompt. Both answers set
  // `prompted` so the card never returns; the toggle stays in Beállítások.
  const answerReminder = useCallback(
    async (enabled: boolean) => {
      if (!user) return;
      setPrefs((p) =>
        p ? { ...p, reminders: { ...p.reminders, workout: { ...p.reminders.workout, enabled, prompted: true } } } : p,
      );
      await updatePrefs(user.uid, { reminders: { workout: { enabled, prompted: true } } }).catch(() => {});
    },
    [user],
  );

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

  if (loading) return <HomeSkeleton />;
  if (!data) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>A Foundation program még nem érhető el.</p>;

  const { program, playlist, joined, doneCount, currentIndex, todayCode } = data;
  // The program is an ordered pool; "this week" is the user's own cadence.
  const daysPerWeek = prefs?.plan.daysPerWeek ?? 5;
  const programTotal = program.totalSessions || playlist.length;
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

  // Program membership from the playlists (lib/program-index): the eyebrow
  // badge shows only in mixed rows, but the program's brand hue colors the
  // cover EVERYWHERE. Standalone videos keep their category color.
  const memberOf = (code: string) => {
    const slug = pindex?.programOfVideo[code];
    return slug ? pindex?.bySlug[slug] ?? null : null;
  };

  const cardFor = (v: AnyVideo, withBadge = true) => {
    const item = data.byCode[v.code];
    const comp = completedMap[v.code];
    const member = memberOf(v.code);
    return (
      <WorkoutCard
        key={v.code}
        v={v}
        isToday={v.code === todayCode}
        isProgram={!!item}
        programStep={item ? item.order + 1 : null}
        programTotal={programTotal}
        programBadge={withBadge && member ? { slug: member.slug, name: member.hu || member.title } : null}
        programHue={member?.hue ?? null}
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

  // 2 · A heted — the next `daysPerWeek` upcoming workouts from where you are,
  // at YOUR chosen cadence (not an authored week).
  const rowWeek = joined ? playlist.slice(currentIndex, currentIndex + daysPerWeek) : [];

  // 3 · Listám
  const rowList = [...myList].map((c) => videoByCode[c]).filter(Boolean) as AnyVideo[];

  // 4 · Ha csak 15 perced van
  const rowShort = libVideos.filter((v) => v.mins <= 15 && v.kind === "workout");

  // 5 · Szavazz Magadra · kihívások — in-progress first (C-RULE 06: challenges
  // live in the rows, never the hero), then the rest newest-first for discovery.
  const chInProgress = challenges.filter((c) => c.state === "folyamatban");
  const chSeen = new Set(chInProgress.map((c) => c.slug));
  const rowChallenge = [...chInProgress, ...challenges.filter((c) => !chSeen.has(c.slug))].slice(0, 10);

  return (
    <div className="home fade-in">
      <FirstEntry
        doneCount={doneCount}
        prefs={prefs}
        onSetReminder={() => answerReminder(true)}
        onDismissReminder={() => answerReminder(false)}
      />

      <Billboard
        program={program}
        joined={joined}
        name={name}
        step={currentIndex + 1}
        total={programTotal}
        today={todayVideo}
        onPlayToday={() => play(todayCode)}
        onSecondary={() => todayVideo && setModalVideo(todayVideo)}
        onJoin={() => setCineOpen(true)}
      />

      <WeekStrip
        week={computeWeekProgress({
          weekdays: prefs?.plan.weekdays ?? [],
          daysPerWeek: prefs?.plan.daysPerWeek ?? 5,
          completed: progress?.completed ?? [],
          pending: getPendingCompletions(),
        })}
      />

      <div className="home-rows">
        <HomeRow title="A heted" allLabel="Program" onAll={() => router.push("/app/program/foundation")} cards={rowWeek.map((v) => cardFor(v, false))} />
        <HomeRow title="Folytatod" allLabel="Összes" onAll={() => router.push("/app/library")} cards={rowResume.map((v) => cardFor(v))} />
        <HomeRow title="Listám" allLabel="Összes" onAll={() => router.push("/app/library")} cards={rowList.map((v) => cardFor(v))} />
        <HomeRow title="Ha csak 15 perced van" allLabel="Összes" onAll={() => router.push("/app/library")} cards={rowShort.map((v) => cardFor(v))} />
        <HomeRow
          title="Szavazz Magadra · kihívások"
          allLabel="Kihívások"
          onAll={() => router.push("/app/challenges")}
          cards={rowChallenge.map((c) => (
            <ChallengeCard
              key={c.slug}
              c={c}
              saved={myList.has(c.slug)}
              onOpen={(s) => router.push(`/app/challenges/${s}`)}
              onToggleSave={toggleSave}
            />
          ))}
        />
      </div>

      {modalVideo && (
        <NcardModal
          programName={program.hu || program.title}
          programHue={pindex?.bySlug[program.slug]?.hue ?? null}
          video={{ ...modalVideo, phase: modalVideo.phaseIdx }}
          pool={playlist.map((w) => ({ ...w, phase: w.phaseIdx }))}
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
        programHue={sheetVideo ? memberOf(sheetVideo.code)?.hue ?? null : null}
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
  program, joined, name, step, total, today, onPlayToday, onSecondary, onJoin,
}: {
  program: FoundationData["program"];
  joined: boolean;
  name: string;
  step: number;   // 1-based position in the program playlist
  total: number;  // total workouts in the program
  today: WorkoutItem | undefined;
  onPlayToday: () => void;
  onSecondary: () => void;
  onJoin: () => void;
}) {
  const equip = !program.equipment || /nincs/i.test(program.equipment) ? "ESZKÖZ NÉLKÜL" : program.equipment.toUpperCase();
  const eyebrow = joined
    ? `${program.title.toUpperCase()} · ${step}/${total}. EDZÉS · MAI`
    : "LEXFIT · OTTHONI EDZÉS"; // cadence-driven; no fixed program length

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

/**
 * The weekly plan strip. Renders straight from the shared weekly collector
 * (lib/week-progress) so it is identical to the Haladásom week card — same
 * training days (the user's plan), same "done" (dated completions incl. the
 * optimistic bridge), same real calendar week and target.
 */
function WeekStrip({ week }: { week: WeekProgress }) {
  if (!week.weekdays.length) return null;
  const { days, target, doneThisWeek } = week;
  const ringPct = Math.round((Math.min(doneThisWeek, target) / target) * 100);

  const clsOf = (d: WeekProgress["days"][number]) =>
    d.done ? "done" : d.today ? "today" : d.rest ? "rest" : "todo";
  const labelOf = (d: WeekProgress["days"][number]) => {
    const base = d.done ? "kész" : d.rest ? "pihenőnap" : d.missed ? "kihagyva" : "nincs kész";
    return d.today ? `ma · ${base}` : base;
  };

  return (
    <div>
      <div className="wstrip" role="group" aria-label={`A hét: ${doneThisWeek} / ${target} kész`}>
        <div
          className="wstrip-ring"
          style={{ "--p": ringPct } as React.CSSProperties}
          role="progressbar"
          aria-valuenow={doneThisWeek}
          aria-valuemin={0}
          aria-valuemax={target}
          aria-label={`Heti haladás: ${doneThisWeek} / ${target} kész`}
        >
          <b>{doneThisWeek}/{target}</b>
        </div>
        {days.map((d, i) => {
          const k = clsOf(d);
          return (
            <div key={d.weekday} className={`wstrip-day ${k}`}>
              <div className="d">{WEEK_DAYS[i][0]}</div>
              <div className="dot" role="img" aria-label={`${WEEK_DAYS[i][1]} · ${labelOf(d)}`}>
                {k === "done" ? <LxIcon d={lxPaths.check} size={15} sw={2.6} /> : k === "rest" ? "☾" : ""}
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
