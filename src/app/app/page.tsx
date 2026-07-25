"use client";

import "./foundation.css";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ensureProgress, getProgress } from "@/lib/progress";
import { getMyList, setSaved } from "@/lib/mylist";
import { NcardModal } from "@/components/NcardModal";
import { ProgramOverviewModal } from "@/components/ProgramOverviewModal";
import { NCard } from "@/components/NCard";
import { Rail } from "@/components/Rail";
import { loadLibrary, type LibVideo } from "@/lib/library";
import type { Video } from "@/lib/types";
import { GuideController, GUIDE_START_EVENT } from "@/components/GuidedTour";
import { JoinCinematic } from "@/components/JoinCinematic";
import { loadFoundation, type FoundationData, type WorkoutItem } from "@/lib/program";
import { CheckinWeek } from "@/components/CheckinWeek";

export default function FoundationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<FoundationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVideo, setModalVideo] = useState<WorkoutItem | null>(null);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const [resumeMap, setResumeMap] = useState<Record<string, number>>({});
  const [cineOpen, setCineOpen] = useState(false);
  const [libVideos, setLibVideos] = useState<LibVideo[]>([]);

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
    loadLibrary().then((d) => setLibVideos(d.videos)).catch(() => {});
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

  // The join CTA plays the cinematic; on completion we do the real join and
  // hand off to the guided "how it works" walkthrough.
  async function completeJoin() {
    setCineOpen(false);
    await join();
    window.dispatchEvent(new Event(GUIDE_START_EVENT));
  }

  if (loading) return <p style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", marginTop: 40 }}>Töltés…</p>;
  if (!data) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>A Foundation program még nem érhető el.</p>;

  const { program, weeks, joined, doneCount, currentIndex } = data;
  const total = program.totalSessions;
  const perWeek = program.perWeek || 5;
  // Current week = how far the user has progressed by COMPLETED videos (a week = perWeek
  // videos): ≤5 done → week 1, 6–10 → week 2, … capped at the program's week count.
  const curWeek = joined ? Math.min(weeks.length || 1, Math.max(1, Math.ceil(doneCount / perWeek))) : 1;
  const todayCode = data.todayCode;
  const play = (code: string | null) => code && router.push(`/player/${code}?autostart=1`);

  const allWorkouts = weeks.flatMap((w) => w.workouts);
  const name = user?.displayName?.split(" ")[0] ?? "te";
  const heroPhaseIdx = weeks.find((w) => w.num === curWeek)?.phaseIdx ?? 0;
  const heroPhase = program.phases[heroPhaseIdx];
  // final re-measurement week, from the real session data (retest flag), else last week.
  const retestWeek =
    weeks.find((w) => w.retest === "final")?.num ??
    [...weeks].reverse().find((w) => w.retest)?.num ??
    weeks[weeks.length - 1]?.num ??
    program.weeks ??
    null;
  const upcoming = (joined ? allWorkouts.filter((w) => w.order >= currentIndex) : weeks[0]?.workouts ?? []).slice(0, 8);
  const pool = allWorkouts.map((w) => ({ ...w, phase: w.phaseIdx }));
  const resumeFrac = (v: Video) =>
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
  const libCard = (v: LibVideo) => (
    <NCard
      key={v.code}
      v={v}
      resume={resumeFrac(v)}
      saved={myList.has(v.code)}
      onToggleSave={() => toggleSave(v.code)}
      onPlay={(c) => play(c)}
      pool={libVideos}
    />
  );

  // ── home rails (Concept 1 — Folytatás & polcok) ──
  const curWeekWorkouts = weeks.find((w) => w.num === curWeek)?.workouts ?? [];
  const byTheme = (t: string) => libVideos.filter((v) => v.theme === t);
  const bonus = libVideos.filter((v) => v.kind === "bonus");
  const quiet = libVideos.filter((v) => v.types.includes("🔇 Csendes"));
  const quick = libVideos.filter((v) => v.mins <= 15 && v.kind === "workout");
  const toLib = () => router.push("/app/library");

  return (
    <div className="pg fade-in">
      <Billboard
        program={program}
        joined={joined}
        name={name}
        curWeek={curWeek}
        phase={heroPhase}
        phaseIdx={heroPhaseIdx}
        doneCount={doneCount}
        total={total}
        retestWeek={retestWeek}
        onPlayToday={() => play(todayCode)}
        onOverview={() => setOverviewOpen(true)}
        onJoin={() => setCineOpen(true)}
      />

      <CheckinWeek />

      <div className="pg-rails">
        <Rail
          title={joined ? "Folytatás" : "Az első heted"}
          sub={joined ? "ott, ahol abbahagytad" : `${upcoming.length} edzés · 1. hét`}
          items={upcoming}
          renderItem={card}
          onAll={() => setOverviewOpen(true)}
        />
        <Rail
          title={`A ${curWeek}. heted`}
          sub={heroPhase ? `${heroPhase.icon} ${heroPhase.name}` : undefined}
          items={curWeekWorkouts}
          renderItem={card}
          onAll={() => setOverviewOpen(true)}
        />
        <Rail title="Kihívások & bónusz" sub="a programon túl" items={bonus} renderItem={libCard} onAll={toLib} />
        <Rail title="Cardio + has" sub="pulzus fel" items={byTheme("Cardio + has")} renderItem={libCard} onAll={toLib} />
        <Rail title="Erősödő alsótest" sub="comb · fenék" items={byTheme("Alsótest")} renderItem={libCard} onAll={toLib} />
        <Rail title="Csendben is megy" sub="🔇 szomszéd-barát" items={quiet} renderItem={libCard} onAll={toLib} />
        <Rail title="15 perc, ami belefér" sub="gyors rutinok" items={quick} renderItem={libCard} onAll={toLib} />
        <Rail title="Mobility & nyújtás" sub="lazíts el" items={byTheme("Mobility / nyújtás")} renderItem={libCard} onAll={toLib} />
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
      {overviewOpen && (
        <ProgramOverviewModal
          program={program}
          weeks={weeks}
          joined={joined}
          doneCount={doneCount}
          currentIndex={currentIndex}
          curWeek={curWeek}
          total={total}
          myList={myList}
          onToggleSave={toggleSave}
          onPlay={(c) => { setOverviewOpen(false); play(c); }}
          onClose={() => setOverviewOpen(false)}
        />
      )}
      {cineOpen && (
        <JoinCinematic
          name={user?.displayName?.split(" ")[0] ?? "te"}
          onJoin={completeJoin}
          onClose={() => setCineOpen(false)}
        />
      )}
      <GuideController />
    </div>
  );
}

const HERO_TRAINER = "/trainer-underlayer.jpg";
/** Foundation hero — "Az utad" Netflix billboard. Left-aligned F-stack: greeting,
 *  program pill + phase eyebrow, title, synopsis, phase-progress bar, and one dominant
 *  CTA (today's workout / join). State-aware via `joined`. */
function Billboard({
  program, joined, name, curWeek, phase, phaseIdx, doneCount, total, retestWeek,
  onPlayToday, onOverview, onJoin,
}: {
  program: FoundationData["program"];
  joined: boolean;
  name: string;
  curWeek: number;
  phase: FoundationData["program"]["phases"][number] | undefined;
  phaseIdx: number;
  doneCount: number;
  total: number;
  retestWeek: number | null;
  onPlayToday: () => void;
  onOverview: () => void;
  onJoin: () => void;
}) {
  return (
    <section className="hb">
      <div
        className="hb-art"
        style={{ background: "linear-gradient(120deg, oklch(0.28 0.06 358) 0%, oklch(0.5 0.16 358) 58%, oklch(0.66 0.155 5) 100%)" }}
      />
      <div className="hb-photo" style={{ backgroundImage: `url(${HERO_TRAINER})` }} aria-hidden="true" />
      <span className="hb-ring" aria-hidden="true" />
      <span className="hb-word" aria-hidden="true">{program.title.toUpperCase()}</span>
      <span className="hb-scrim" aria-hidden="true" />
      <span className="hb-vig" aria-hidden="true" />

      <div className="hb-top">
        <span className="hb-hello">Szia, {name}!</span>
      </div>

      <div className="hb-content">
        <span className="hb-lock">
          <span className="mk">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6" /></svg>
          </span>
          <span className="nm">{program.title.toUpperCase()}</span>
        </span>
        <div className="hb-eyebrow">
          {joined
            ? `A PROGRAMOD · ${curWeek}. HÉT · ${phase?.icon ?? ""} ${(phase?.name ?? "").toUpperCase()} FÁZIS`
            : "AZ ÚJ PROGRAMOD"}
        </div>
        <h1 className="hb-title">
          {program.title}
          <small>{program.hu}</small>
        </h1>
        <p className="hb-syn">{program.synopsis}</p>
        {joined && (
          <>
            <div className="hb-phase" aria-hidden="true">
              {program.phases.map((_, i) => (
                <span key={i} className={`hb-seg${i < phaseIdx ? " done" : i === phaseIdx ? " now" : ""}`} />
              ))}
            </div>
            <div className="hb-phaselbl">
              <span>{doneCount} / {total} EDZÉS KÉSZ</span>
              {retestWeek != null && <span>VISSZAMÉRÉS: {retestWeek}. HÉT</span>}
            </div>
          </>
        )}
        <div className="hb-ctas">
          <button className="hb-play" data-tour="start" onClick={joined ? onPlayToday : onJoin}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z" /></svg>
            {joined ? "Mai edzés indítása" : "Csatlakozz a programhoz"}
          </button>
          <button className="hb-info" onClick={onOverview}>
            <span style={{ fontSize: 16 }}>ⓘ</span> Program áttekintése
          </button>
        </div>
      </div>
    </section>
  );
}

