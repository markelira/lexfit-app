"use client";

import "../foundation.css";
import "../home.css";
import "./programs.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getProgress, type ProgressState } from "@/lib/progress";
import { getMyList, setSaved } from "@/lib/mylist";
import { Button } from "@/components/Button";
import { WorkoutCard } from "@/components/WorkoutCard";
import { MobileWorkoutSheet, type SheetVideo } from "@/components/MobileWorkoutSheet";
import { useIsMobile } from "@/lib/useIsMobile";
import { ProgramBanner, bannerChips, bannerEyebrow, CATEGORY_WORD } from "@/components/ProgramBanner";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { loadLibrary, type LibVideo } from "@/lib/library";
import { ProgramsSkeleton } from "@/components/Skeletons";
import { loadProgramIndex, programPosition, type ProgramEntry, type ProgramIndex } from "@/lib/program-index";

// Programok - Netflix/Apple TV catalog in the Kezdőlap's visual grammar: every
// published program gets its own full-width billboard band (colorless identity:
// same green art for all, differentiated by word + geometric mark) with its
// playlist beneath as a horizontal WorkoutCard rail. Position is derived from
// the global per-video completions (lib/program-index).

export default function ProgramsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [pindex, setPindex] = useState<ProgramIndex | null>(null);
  const [libVideos, setLibVideos] = useState<LibVideo[]>([]);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const [sheetVideo, setSheetVideo] = useState<SheetVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgramIndex()
      .then(setPindex)
      .catch(() => setPindex(null))
      .finally(() => setLoading(false));
    loadLibrary().then((d) => setLibVideos(d.videos)).catch(() => {});
    if (user) {
      getProgress(user.uid).then(setProgress).catch(() => {});
      getMyList(user.uid).then(setMyList).catch(() => {});
    }
  }, [user]);

  const libByCode = useMemo(() => new Map(libVideos.map((v) => [v.code, v])), [libVideos]);
  const completedCodes = useMemo(
    () => new Set((progress?.completed ?? []).map((c) => c.code)),
    [progress],
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

  if (loading) return <ProgramsSkeleton />;
  const programs = pindex?.programs ?? [];
  if (!programs.length) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>Még nincs elérhető program.</p>;

  const play = (code: string) => router.push(`/player/${code}?autostart=1`);
  const openOrPlay = (code: string) => {
    const v = libByCode.get(code);
    if (isMobile && v) setSheetVideo(v as SheetVideo);
    else play(code);
  };

  const resumeMap = progress?.resume ?? {};
  const completedMap: Record<string, { at: string; atTime?: string }> = {};
  (progress?.completed ?? []).forEach((c) => (completedMap[c.code] = { at: typeof c.at === "string" ? c.at : "", atTime: c.atTime }));
  const resumeFrac = (v: LibVideo) =>
    resumeMap[v.code] != null ? Math.min(1, resumeMap[v.code] / ((v.muxDuration || v.mins * 60) || 1)) : undefined;

  return (
    <div className="home fade-in">
      <div className="pgs-stack">
        {programs.map((p) => (
          <ProgramBand
            key={p.slug}
            p={p}
            videos={p.codes.map((c) => libByCode.get(c)).filter(Boolean) as LibVideo[]}
            completedCodes={completedCodes}
            completedMap={completedMap}
            resumeFrac={resumeFrac}
            myList={myList}
            onToggleSave={toggleSave}
            onPlayCard={openOrPlay}
            onPlay={play}
            onOpen={() => router.push(`/app/program/${p.slug}`)}
          />
        ))}
      </div>

      <MobileWorkoutSheet
        v={sheetVideo}
        programHue={
          sheetVideo && pindex
            ? pindex.bySlug[pindex.programOfVideo[sheetVideo.code] ?? ""]?.hue ?? null
            : null
        }
        saved={sheetVideo ? myList.has(sheetVideo.code) : false}
        onPlay={(c) => { setSheetVideo(null); play(c); }}
        onToggleSave={toggleSave}
        onClose={() => setSheetVideo(null)}
      />
    </div>
  );
}

function ProgramBand({
  p, videos, completedCodes, completedMap, resumeFrac, myList, onToggleSave, onPlayCard, onPlay, onOpen,
}: {
  p: ProgramEntry;
  videos: LibVideo[];
  completedCodes: Set<string>;
  completedMap: Record<string, { at: string; atTime?: string }>;
  resumeFrac: (v: LibVideo) => number | undefined;
  myList: Set<string>;
  onToggleSave: (code: string) => void;
  onPlayCard: (code: string) => void;
  onPlay: (code: string) => void;
  onOpen: () => void;
}) {
  const name = p.hu || p.title;
  const total = p.totalSessions || videos.length;
  const pos = programPosition(videos.map((v) => v.code), completedCodes);
  const nextVideo = videos[pos.currentIndex];
  const started = pos.doneCount > 0;

  const eyebrow = bannerEyebrow([
    CATEGORY_WORD[p.category] ?? p.category?.toUpperCase() ?? "PROGRAM",
    total > 0 ? `${total} EDZÉS` : "HAMAROSAN",
    pos.completed ? "KÉSZ 🎉" : started ? `${pos.doneCount}/${total} KÉSZ` : null,
  ]);

  return (
    <section className="pgs">
      <ProgramBanner
        slug={p.slug}
        title={p.title}
        name={name}
        hue={p.hue}
        eyebrow={eyebrow}
        synopsis={p.synopsis}
        chips={bannerChips(p)}
      >
        {nextVideo && !pos.completed && (
          <Button size="l" variant="primary" onDark iconLeft={lxPaths.play} onClick={() => onPlay(nextVideo.code)}>
            {started ? `Folytatom · ${pos.currentIndex + 1}. edzés` : "Kezdd el"}
          </Button>
        )}
        <Button size="l" variant="secondary" onDark onClick={onOpen}>A program megnyitása</Button>
      </ProgramBanner>

      {videos.length > 0 && (
        <section className="hrow-sec">
          <div className="hrow-head">
            <h3>Edzések <span style={{ color: "var(--ink-3)", fontWeight: 600, fontSize: 13 }}>· {videos.length}</span></h3>
            <button className="all" onClick={onOpen}>
              Program <LxIcon d={lxPaths.arrowR} size={14} />
            </button>
          </div>
          <div className="hrow">
            {videos.map((v, i) => (
              <WorkoutCard
                key={v.code}
                v={v}
                isProgram
                programStep={i + 1}
                programTotal={total}
                programHue={p.hue}
                resume={resumeFrac(v)}
                completedAt={completedMap[v.code] ? completedMap[v.code].at : null}
                completedTime={completedMap[v.code]?.atTime ?? null}
                saved={myList.has(v.code)}
                onPlay={onPlayCard}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
