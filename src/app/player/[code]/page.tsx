"use client";

import "./player.css";
import "../../skeleton.css";
import MuxPlayer from "@mux/mux-player-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Protected } from "@/components/Protected";
import { PlayerSkeleton } from "@/components/Skeletons";
import { Check } from "@/components/OnbAside";
import { getPlaybackTokens, type PlaybackResponse } from "@/lib/playback";
import {
  ensureProgress, getProgress, saveResume, clearResume,
  notePendingCompletion, getPendingCompletions, syncMuxProgress, type ProgressState,
} from "@/lib/progress";
import { computeStreak, ymd } from "@/lib/streak";
import { getMyList, setSaved as setSavedRemote } from "@/lib/mylist";
import { inferBlockStarts, normalizeExercise } from "@/lib/blocks";
import type { Video, VideoBlock } from "@/lib/types";
import { secToClock } from "@/lib/time";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { FinishShareEntry } from "@/components/finish/FinishShareEntry";
import { FinishComplete } from "@/components/finish/FinishComplete";
import { buildFinishData } from "@/lib/finish-data";

const CAT: Record<string, { c: string; word: string }> = {
  "Alsótest": { c: "var(--cat-also)", word: "ALSÓ" },
  "Felsőtest": { c: "var(--cat-felso)", word: "FELSŐ" },
  "Kardió + has": { c: "var(--cat-cardio)", word: "KARDIÓ" },
  "Teljes test": { c: "var(--cat-teljes)", word: "TELJES" },
  "Mobilitás / nyújtás": { c: "var(--cat-mobility)", word: "MOBILITÁS" },
  "Tartás-fókusz": { c: "var(--cat-tartas)", word: "TARTÁS" },
};
const cat = (t: string) => CAT[t] ?? CAT["Teljes test"];
const grad = (t: string) => {
  const c = cat(t).c;
  return `linear-gradient(155deg, oklch(from ${c} calc(l - 0.16) calc(c * 0.85) h) 0%, ${c} 58%, oklch(from ${c} calc(l + 0.07) c h) 100%)`;
};
const levelWord = (n: number) => ["Kezdő", "Közepes", "Haladó"][n - 1] ?? "Kezdő";
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function planBlocks(v: Video): VideoBlock[] {
  // Heal missing block stamps (first block → 0:00, others → first stamped
  // exercise) so one forgotten field can't collapse the chapter math.
  if (v.blocks?.length) return inferBlockStarts(v.blocks);
  return [
    { name: "Bemelegítés", mins: Math.max(2, Math.round(v.mins * 0.15)), items: ["Átmozgatás Alexával"] },
    { name: "Fő rész", mins: Math.round(v.mins * 0.65), items: ["Vezetett blokk - kövesd Alexát"] },
    { name: "Levezetés", mins: Math.max(2, Math.round(v.mins * 0.2)), items: ["Nyújtás + légzés"] },
  ];
}

function PlayerScreen({ code }: { code: string }) {
  const { user } = useAuth();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const [video, setVideo] = useState<Video | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [sessionOrder, setSessionOrder] = useState(0);
  const [resumeAt, setResumeAt] = useState(0);

  const [stage, setStage] = useState<"preview" | "playing" | "finished">("preview");
  const [wantAutostart, setWantAutostart] = useState(false);
  const startedRef = useRef(false);
  const [pb, setPb] = useState<PlaybackResponse | null>(null);
  const [pbError, setPbError] = useState<string | null>(null);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fs, setFs] = useState(false);
  const [fakeFs, setFakeFs] = useState(false); // iPhone CSS pseudo-fullscreen
  const [result, setResult] = useState<{ streak: number } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const lastSavedRef = useRef(0);
  // Watch time + completions come from Mux Data server-side (/api/progress/sync).
  // The player only tags views with viewer_user_id and drops an optimistic local
  // marker when a workout visibly completes, bridging Mux's finalization delay.
  const progRef = useRef<ProgressState | null>(null);
  const posRef = useRef(0);
  const durRef = useRef(0);
  // L4 controls: volume, mute, gear menu, elapsed⇄remaining, keyboard help, idle-fade.
  const [vol, setVol] = useState(1);
  const [muted, setMuted] = useState(false);
  const [castAvail, setCastAvail] = useState(false); // a real cast target exists
  const [gearOpen, setGearOpen] = useState(false);
  const [showRemain, setShowRemain] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const [idle, setIdle] = useState(false);
  const [hud, setHud] = useState(true); // over-video info (name+countdown) in fullscreen - toggleable
  const [mCtl, setMCtl] = useState(false); // mobile tap-to-reveal overlay
  const [ctlPing, setCtlPing] = useState(0); // bumps on overlay taps → re-arms the auto-hide timer
  const [saved, setSaved] = useState(false); // mobile "Mentés" pill
  const [seek, setSeek] = useState<{ left: number; e: string; t: string } | null>(null);
  // Playlist accordion: which block is expanded. null = follow the current block.
  const [expanded, setExpanded] = useState<number | null>(null);
  // L3 up-next: tomorrow's Foundation session + its autoplay countdown.
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const snap = await getDoc(doc(db, "videos", code));
      if (!active) return;
      if (!snap.exists()) return setNotFound(true);
      setVideo({ code: snap.id, ...(snap.data() as Omit<Video, "code">) });
      const sess = await getDocs(query(collection(db, "programs", "foundation", "sessions"), where("videoCode", "==", code)));
      if (active && !sess.empty) setSessionOrder(sess.docs[0].data().order ?? 0);
      const prog = await getProgress(user.uid);
      progRef.current = prog;
      if (active && prog?.resume?.[code]) setResumeAt(prog.resume[code]);
    })();
    return () => { active = false; };
  }, [user, code]);

  // Seed duration from the stored Mux duration so stamped block math is correct
  // before the player's own `loadedmetadata` fires (which then sets the exact value).
  useEffect(() => {
    if (video?.muxDuration) { setDur(video.muxDuration); durRef.current = video.muxDuration; }
  }, [video]);

  // Skip the player's own preview stage when arrived via an explicit "play" action
  // (e.g. the detail modal's "Edzés indítása") - go straight into playback.
  useEffect(() => {
    setWantAutostart(new URLSearchParams(window.location.search).get("autostart") === "1");
  }, []);
  useEffect(() => {
    if (wantAutostart && !startedRef.current && stage === "preview" && video?.muxPlaybackId) {
      startedRef.current = true;
      void start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantAutostart, video, stage]);

  // Prefetch the signed playback token the moment the preview is shown, so the
  // token round-trip (auth verify → subscription check → Firestore read → JWT sign)
  // is off the click path - clicking "Kezdjük" then jumps straight to the player.
  // Tokens are valid 6h, so lingering on the preview never expires them. A 403 (no
  // subscription) is swallowed here; the click path still routes to the paywall.
  useEffect(() => {
    if (stage !== "preview" || !user || !video?.muxPlaybackId || pb) return;
    let active = true;
    getPlaybackTokens(code).then(
      (data) => { if (active) setPb(data); },
      () => {},
    );
    return () => { active = false; };
  }, [stage, user, video, code, pb]);

  const blocks = useMemo(() => (video ? planBlocks(video) : []), [video]);
  const totalMins = useMemo(() => blocks.reduce((n, b) => n + b.mins, 0), [blocks]);
  const frac = dur > 0 ? cur / dur : 0;
  // "Stamped": every block has a real start time → use exact seconds; else fall back
  // to proportional-minutes. `bounds` stays as fractions of `dur` so all the math below
  // is identical for both paths.
  // Number.isFinite, not typeof: a NaN stamp is typeof "number" and would sail
  // through into the bounds math → NaN blockEndSec → non-finite seek throw.
  const stamped = blocks.length > 0 && blocks.every((b) => Number.isFinite(b.start));
  const bounds = useMemo(() => {
    if (stamped && dur > 0) {
      return blocks.map((b, i) => {
        const s = b.start as number;
        const e = i + 1 < blocks.length ? (blocks[i + 1].start as number) : dur;
        return { start: s / dur, end: e / dur, startSec: s, endSec: e };
      });
    }
    // Guard totalMins=0 (mins never authored): distribute evenly instead of
    // dividing by zero - NaN bounds silently killed the seekbar + active-block
    // detection (found live 2026-08-09).
    if (totalMins <= 0) {
      const n = Math.max(1, blocks.length);
      return blocks.map((_, i) => ({ start: i / n, end: (i + 1) / n, startSec: 0, endSec: 0 }));
    }
    let acc = 0;
    return blocks.map((b) => {
      const start = acc / totalMins;
      acc += b.mins;
      return { start, end: acc / totalMins, startSec: 0, endSec: 0 };
    });
  }, [blocks, totalMins, stamped, dur]);
  // Layout weight for the segment/timeline widths: real block seconds when
  // stamped; authored minutes otherwise (min 1 so a 0-min block stays visible).
  const weight = (i: number) => (stamped ? Math.max(1, bounds[i].endSec - bounds[i].startSec) : Math.max(1, blocks[i].mins));
  // Rail/preview duration label: derive from stamps when available (stored mins
  // can be 0 when the video was saved before its Mux duration existed).
  const blockMins = (i: number) =>
    stamped && dur > 0 ? Math.max(1, Math.round((bounds[i].endSec - bounds[i].startSec) / 60)) : blocks[i].mins;
  const cb = bounds.findIndex((b) => frac >= b.start && frac < b.end);
  // No match → past the end means the last block; anything else (start, NaN
  // safety) means the first - never default to the end at 0:00.
  const active = cb !== -1 ? cb : frac >= 1 ? Math.max(0, bounds.length - 1) : 0;
  const blockEndSec = (bounds[active]?.end ?? 1) * dur;
  const blockLeft = Math.max(0, Math.ceil(blockEndSec - cur));
  const nextBlock = blocks[active + 1];
  // The expanded block in the playlist - the current one unless the user opened another.
  const openBlock = expanded ?? active;

  // Active block's exercises, normalized. `start` (absolute seconds) is optional per
  // exercise - these power the now-panel highlight, the next-exercise countdown, and
  // the click-to-seek list. Everything below degrades to today's behavior when unstamped.
  const activeItems = useMemo(() => (blocks[active]?.items ?? []).map(normalizeExercise), [blocks, active]);
  const activeEx = useMemo(() => {
    let idx = -1;
    activeItems.forEach((ex, i) => { if (typeof ex.start === "number" && ex.start <= cur) idx = i; });
    return idx;
  }, [activeItems, cur]);
  const hasExStamps = activeItems.some((ex) => typeof ex.start === "number");
  const nextExStart = activeItems
    .map((ex) => ex.start)
    .filter((s): s is number => typeof s === "number" && s > cur)
    .sort((a, b) => a - b)[0];
  const exLeft = Math.max(0, Math.ceil((nextExStart ?? blockEndSec) - cur));
  const nextExName = nextExStart != null ? activeItems.find((ex) => ex.start === nextExStart)?.name : undefined;
  const currentMove = activeEx >= 0 ? activeItems[activeEx]?.name : activeItems[0]?.name;

  // ── overlay copy ──────────────────────────────────────────────────────────
  const blockName = blocks[active]?.name ?? "";
  const totalEx = useMemo(() => blocks.reduce((n, b) => n + (b.items?.length ?? 0), 0), [blocks]);
  // Memoized so the share sheet / desktop handoff gets a STABLE `data` object -
  // an inline rebuild each render tears down the handoff's onSnapshot listener.
  const finishData = useMemo(
    () => (video ? buildFinishData({
      title: video.title, mins: video.mins, theme: video.theme,
      streak: result?.streak ?? 1, exercises: totalEx,
      workoutNo: (progRef.current?.doneCount ?? 0) + 1,
    }) : null),
    [video, result?.streak, totalEx],
  );
  const exBefore = useMemo(() => blocks.slice(0, active).reduce((n, b) => n + (b.items?.length ?? 0), 0), [blocks, active]);
  const curExNum = exBefore + Math.max(0, activeEx) + 1;
  const repText = totalEx > 0 ? `${curExNum} / ${totalEx} · ${blockName.toUpperCase()}` : `${active + 1} / ${blocks.length} · ${blockName.toUpperCase()}`;
  const nextName = nextExName ?? nextBlock?.name;
  // The dominant countdown is MM:SS, zero-padded (reference "00:42").
  const cdSec = Math.max(0, hasExStamps ? exLeft : blockLeft);
  const countdown = `${String(Math.floor(cdSec / 60)).padStart(2, "0")}:${String(cdSec % 60).padStart(2, "0")}`;
  const totalSec = dur || totalMins * 60;
  const timeText = showRemain ? `−${fmt(Math.max(0, totalSec - cur))}` : `${fmt(cur)} / ${fmt(totalSec)}`;

  // Exercise + timestamp under a hovered point on the chapter bar (L4 seek preview).
  const seekInfoAt = (fraction: number) => {
    const t = Math.max(0, Math.min(1, fraction)) * (dur || totalMins * 60);
    const bi = bounds.findIndex((b) => fraction >= b.start && fraction < b.end);
    const b = blocks[bi === -1 ? blocks.length - 1 : bi];
    if (!b) return null;
    const items = (b.items ?? []).map(normalizeExercise);
    let name = items[0]?.name ?? b.name;
    items.forEach((ex) => { if (typeof ex.start === "number" && ex.start <= t) name = ex.name; });
    return { e: name, t: `${secToClock(Math.round(t))} · ${b.name.toUpperCase()}` };
  };

  async function start() {
    setPbError(null);
    try {
      // Reuse the token prefetched while the preview was shown (see effect below);
      // only fetch here if the prefetch hasn't landed (or was skipped).
      const data = pb ?? (await getPlaybackTokens(code));
      if (user) await ensureProgress(user.uid);
      setPb(data);
      setStage("playing");
    } catch (e) {
      // No active subscription → send to the paywall.
      if (e instanceof Error && e.message === "forbidden") {
        router.push("/subscribe");
        return;
      }
      setPbError(e instanceof Error ? e.message : "A videó nem elérhető.");
    }
  }

  // The workout visibly completed. No Firestore write - the authoritative
  // completion arrives via the Mux sync once the view finalizes. Locally: drop
  // the pending marker, clear the resume position, and compute the streak
  // optimistically for the finish screen (identical math to the server's).
  function finish() {
    setStage("finished");
    if (user) {
      notePendingCompletion(code);
      void clearResume(user.uid, code);
      const p = progRef.current;
      const dates = new Set([
        ...((p?.completed ?? []).map((c) => String(c.at))),
        ...getPendingCompletions().map((c) => c.at),
        ymd(new Date()),
      ]);
      setResult({ streak: computeStreak(dates, new Set(p?.workoutDays ?? []), ymd(new Date())) });
      // Nudge the sync once Mux has likely finalized the view.
      setTimeout(() => void syncMuxProgress({ force: true }), 20_000);
    }
  }

  useEffect(() => {
    const el = playerRef.current;
    if (!el || !pb) return;
    const onTime = () => {
      const t = el.currentTime ?? 0;
      posRef.current = t;
      setCur(t);
      if (user && t - lastSavedRef.current >= 5) {
        lastSavedRef.current = t;
        saveResume(user.uid, code, t);
      }
    };
    // ?? only catches null/undefined - a NaN duration would poison `dur` and
    // silently disable every seek, so normalize with Number.isFinite.
    const onMeta = () => { const d = Number.isFinite(el.duration) ? el.duration : 0; setDur(d); durRef.current = d; };
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    const onEnd = () => finish();
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnd);
      // Leaving inside the last 10% still counts - mark it so Haladásom can
      // show the workout before the Mux view lands.
      const d = durRef.current;
      if (d > 0 && posRef.current / d >= 0.9) notePendingCompletion(code);
    };
    // `stage` is required: the token is now prefetched during preview, so `pb` is
    // already set before the player mounts. We must re-run when we enter "playing"
    // (the point the MuxPlayer element actually exists) to attach the listeners.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pb, stage, user, code, sessionOrder]);

  const togglePlay = () => {
    const el = playerRef.current;
    if (!el) return;
    // play() returns a promise that rejects with AbortError when a seek/pause
    // interrupts it (chapter-bar scrub while autoplaying). Harmless - but
    // unhandled it escapes to onunhandledrejection and lands in Sentry.
    el.paused ? el.play()?.catch(() => {}) : el.pause();
  };
  // EVERY currentTime write funnels through here. Non-finite values throw
  // ("provided double value is non-finite", seen live 2026-08-09) and
  // Math.min/max propagate NaN straight through a clamp - so gate first.
  const seekTo = (sec: number) => {
    const el = playerRef.current;
    if (!el || !Number.isFinite(sec) || !(dur > 0)) return;
    el.currentTime = Math.max(0, Math.min(dur - 0.1, sec));
  };
  // el.currentTime can be undefined/NaN before loadedmetadata upgrades the
  // custom element - treat it as 0 rather than arithmetic on it.
  const posOf = (el: { currentTime?: number }) => (Number.isFinite(el.currentTime) ? (el.currentTime as number) : 0);
  // rewind doesn't need `dur` (a backward seek can't overshoot the end), so it
  // writes directly - it must keep working before metadata loads.
  const rewind = () => { const el = playerRef.current; if (el) el.currentTime = Math.max(0, posOf(el) - 10); };
  const forward = () => { const el = playerRef.current; if (el) seekTo(posOf(el) + 10); };
  const skip = () => seekTo(blockEndSec);
  // Symmetric speed cycle 0.75× · 1× · 1.25× (L4 - slowing down is an a11y feature).
  const cycleSpeed = () => {
    const steps = [0.75, 1, 1.25];
    const next = steps[(steps.indexOf(speed) + 1) % steps.length] ?? 1;
    setSpeed(next);
    const el = playerRef.current;
    if (el) el.playbackRate = next;
  };
  const applyVolume = (v: number) => {
    const nv = Math.max(0, Math.min(1, v));
    setVol(nv);
    setMuted(nv === 0);
    const el = playerRef.current;
    if (el) { el.volume = nv; el.muted = nv === 0; }
  };
  const toggleMute = () => {
    const el = playerRef.current;
    const next = !muted;
    setMuted(next);
    if (el) el.muted = next;
  };
  // Cast to TV. mux-player proxies the media API; the underlying <video> carries
  // AirPlay (Safari) + the Remote Playback API (Chromecast-capable Chrome). We
  // gate the cast UI on real device availability so we never show a dead button.
  const getVideo = () => {
    const p = playerRef.current; // mux-player element (useRef<any>)
    return p?.media?.nativeEl ?? p?.media ?? p ?? null;
  };
  const castToTv = () => {
    const v = getVideo();
    if (!v) return;
    try {
      if (typeof v.webkitShowPlaybackTargetPicker === "function") { v.webkitShowPlaybackTargetPicker(); return; }
      if (v.remote?.prompt) v.remote.prompt().catch(() => {});
    } catch { /* no cast target - button is only shown when available anyway */ }
  };
  // Watch for cast targets once the media element exists (it mounts after "playing").
  useEffect(() => {
    if (stage !== "playing") return;
    let disposed = false;
    let cleanup = () => {};
    const attach = (): boolean => {
      const v = getVideo();
      if (!v) return false;
      if (typeof v.webkitShowPlaybackTargetPicker === "function") {
        const onAvail = (e: { availability?: string }) => setCastAvail(e.availability === "available");
        v.addEventListener("webkitplaybacktargetavailabilitychanged", onAvail);
        cleanup = () => v.removeEventListener("webkitplaybacktargetavailabilitychanged", onAvail);
        return true;
      }
      if (v.remote?.watchAvailability) {
        v.remote.watchAvailability((a: boolean) => setCastAvail(a))
          .then((id: number) => { if (disposed) v.remote.cancelWatchAvailability(id).catch(() => {}); else cleanup = () => v.remote.cancelWatchAvailability(id).catch(() => {}); })
          .catch(() => {});
        return true;
      }
      return false;
    };
    if (!attach()) {
      const iv = setInterval(() => { if (attach()) clearInterval(iv); }, 400);
      const stop = setTimeout(() => clearInterval(iv), 4000);
      cleanup = () => { clearInterval(iv); clearTimeout(stop); };
    }
    return () => { disposed = true; cleanup(); setCastAvail(false); };
  }, [stage]);
  // Fullscreen ladder, YouTube-style. Element fullscreen keeps our HUD
  // (desktop, Android, iPadOS 16.4+, iPhone iOS 17.2+). Older iPhones have NO
  // element-fullscreen API - there we do exactly what m.youtube.com does:
  // native video fullscreen (webkitEnterFullscreen → AVPlayer chrome, HUD
  // lost, but genuinely fullscreen). The CSS pseudo-fullscreen is the last
  // resort only - it can never hide Safari's URL bar.
  const isPhone = () => typeof window !== "undefined" && Math.min(window.screen.width, window.screen.height) <= 500;
  const enterFs = () => {
    const el = frameRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!el) return;
    const nativeVideoFs = () => {
      const v = getVideo();
      try {
        if (v && typeof v.webkitEnterFullscreen === "function") v.webkitEnterFullscreen();
        else setFakeFs(true);
      } catch { setFakeFs(true); }
    };
    if (el.requestFullscreen) {
      el.requestFullscreen()
        .then(() => {
          // YouTube: fullscreen video is always landscape on a phone.
          if (isPhone()) (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.("landscape").catch(() => {});
        })
        .catch(nativeVideoFs);
    } else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else nativeVideoFs();
  };
  const exitFs = () => {
    const d = document as Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };
    try { (screen.orientation as ScreenOrientation & { unlock?: () => void }).unlock?.(); } catch { /* not locked */ }
    if (d.fullscreenElement) d.exitFullscreen();
    else if (d.webkitFullscreenElement) d.webkitExitFullscreen?.();
    else {
      const v = getVideo();
      if (v?.webkitDisplayingFullscreen && typeof v.webkitExitFullscreen === "function") v.webkitExitFullscreen();
    }
    setFakeFs(false);
  };
  const fsActive = fs || fakeFs;
  const toggleFs = () => (fsActive ? exitFs() : enterFs());
  const exit = () => router.push("/app");

  // Keep the fullscreen icon (maximize ⇄ minimize) in sync with the browser
  // state - including the iPhone NATIVE video fullscreen, which reports via
  // webkitbegin/endfullscreen on the <video>, not on document.
  useEffect(() => {
    const d = document as Document & { webkitFullscreenElement?: Element | null };
    const onFs = () => setFs(!!(d.fullscreenElement ?? d.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    const onBegin = () => setFs(true);
    const onEnd = () => setFs(false);
    let v: HTMLVideoElement | null = null;
    let iv: ReturnType<typeof setInterval> | undefined;
    if (stage === "playing") {
      iv = setInterval(() => {
        v = getVideo();
        if (v) {
          clearInterval(iv);
          v.addEventListener("webkitbeginfullscreen", onBegin);
          v.addEventListener("webkitendfullscreen", onEnd);
        }
      }, 400);
    }
    return () => {
      if (iv) clearInterval(iv);
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
      v?.removeEventListener("webkitbeginfullscreen", onBegin);
      v?.removeEventListener("webkitendfullscreen", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Rotate-to-fullscreen (YouTube behavior): on a phone, landscape while
  // playing = fullscreen, portrait = exit. Checked BOTH when playback starts
  // (the phone may already be rotated) and on every orientation change. A
  // gestureless element-fullscreen request is refused by the browser - the
  // ladder inside enterFs then drops to native video fullscreen (iPhone) or
  // the CSS fallback, neither of which needs a gesture.
  useEffect(() => {
    if (stage !== "playing") { setFakeFs(false); return; }
    const mq = window.matchMedia("(orientation: landscape)");
    const onTurn = () => {
      if (!isPhone()) return;
      if (mq.matches) enterFs();
      else exitFs();
    };
    // Give autoplay a moment - native video fullscreen needs a playing <video>.
    const t = setTimeout(() => { if (isPhone() && mq.matches) enterFs(); }, 600);
    mq.addEventListener("change", onTurn);
    return () => { clearTimeout(t); mq.removeEventListener("change", onTurn); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // YouTube-style auto-hide: visible mobile controls fade out after 3s of
  // inactivity while playing; they stay while paused. Any overlay tap bumps
  // ctlPing and re-arms the timer.
  useEffect(() => {
    if (!mCtl || stage !== "playing" || paused) return;
    const t = setTimeout(() => setMCtl(false), 3000);
    return () => clearTimeout(t);
  }, [mCtl, stage, paused, ctlPing]);

  // The workout ended → leave fullscreen (any rung: element, native AVPlayer,
  // pseudo) so the finish screen actually shows. Inside native fullscreen the
  // DOM can't render at all, and in landscape element-fullscreen the finish
  // screen is cramped - exiting also unlocks orientation back to the sensor.
  useEffect(() => {
    if (stage === "finished") exitFs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Pseudo-fullscreen pins the stage over the page - freeze the page behind it.
  useEffect(() => {
    if (!fakeFs) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [fakeFs]);

  // ── HUD inside the NATIVE fullscreen player ───────────────────────────────
  // AVPlayer (webkitEnterFullscreen) can't show our DOM overlay, but it DOES
  // render WebVTT captions. Mirror the HUD (exercise · countdown) into a
  // script-created text track, switched on only while the native player is up
  // (fs true without a document.fullscreenElement = the native path).
  const hudTrackRef = useRef<TextTrack | null>(null);
  const nativeFsHud = fs && !fakeFs && typeof document !== "undefined" && !document.fullscreenElement && stage === "playing";
  useEffect(() => {
    if (!nativeFsHud || !hud) return;
    const v = getVideo();
    if (!v || typeof v.addTextTrack !== "function") return;
    if (!hudTrackRef.current) {
      try { hudTrackRef.current = v.addTextTrack("captions", "LEXFIT", "hu"); } catch { return; }
    }
    const track = hudTrackRef.current;
    if (track) track.mode = "showing";
    return () => { if (track) track.mode = "hidden"; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeFsHud, hud]);
  // Re-issue the cue on every HUD tick (countdown changes once a second);
  // replacing the cue - rather than mutating its text - forces a repaint.
  useEffect(() => {
    const track = hudTrackRef.current;
    const v = getVideo();
    if (!track || track.mode !== "showing" || !v || typeof window === "undefined" || !("VTTCue" in window)) return;
    try {
      Array.from(track.cues ?? []).forEach((c) => track.removeCue(c));
      const t = v.currentTime ?? 0;
      const text = currentMove ? `${currentMove}  ·  ${countdown}` : countdown;
      track.addCue(new VTTCue(Math.max(0, t - 0.05), t + 2, text));
    } catch { /* cue churn during teardown - harmless */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, currentMove, nativeFsHud]);

  // When playback crosses into a new block, snap the playlist back to auto-follow it.
  useEffect(() => { setExpanded(null); }, [active]);

  // Keyboard map (L4): Space ← → F M Esc N 1/2/3 ? - the set the audience already
  // has in their fingers from YouTube/Netflix. Only active during playback.
  useEffect(() => {
    if (stage !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "ArrowLeft": e.preventDefault(); rewind(); break;
        case "ArrowRight": e.preventDefault(); forward(); break;
        case "f": case "F": toggleFs(); break;
        case "m": case "M": toggleMute(); break;
        case "n": case "N": skip(); break;
        case "h": case "H": setHud((v) => !v); break;
        case "Escape": if (!document.fullscreenElement) { if (keysOpen) setKeysOpen(false); else exit(); } break;
        case "?": setKeysOpen((v) => !v); break;
        default:
          if (["1", "2", "3", "4", "5"].includes(e.key)) {
            const bi = Number(e.key) - 1;
            if (bounds[bi]) seekTo(bounds[bi].start * dur);
          }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, dur, bounds, keysOpen, paused, muted, speed]);

  // Reflect saved state for the mobile "Mentés" pill.
  useEffect(() => {
    if (!user) return;
    getMyList(user.uid).then((s) => setSaved(s.has(code))).catch(() => {});
  }, [user, code]);

  // Controls stay on at all times; they only idle-fade in fullscreen (theater immersion).
  useEffect(() => {
    if (stage !== "playing" || !fs) { setIdle(false); return; }
    const wake = () => {
      setIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIdle(true), 3200);
    };
    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("keydown", wake);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [stage, fs]);

  async function toggleSave() {
    const next = !saved;
    setSaved(next);
    if (user) await setSavedRemote(user.uid, code, next).catch(() => {});
  }

  if (notFound)
    return (
      <div className="lx szm-player" style={{ alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--d-ink-2)" }}>Ez az edzés nem található.</p>
        <button className="btn ghost" onClick={() => router.push("/app")}>← Vissza</button>
      </div>
    );
  if (!video) return <PlayerSkeleton />;

  // ── preview ──
  if (stage === "preview") {
    // Arrived via an explicit play action → don't flash the redundant preview,
    // show a loader until start() flips us into playback.
    if (wantAutostart && video.muxPlaybackId) return <PlayerSkeleton />;
    return (
      <div className="lx szm-player szm-pl-prevwrap">
        <div className="szm-pl-stagebg" style={{ background: grad(video.theme) }} aria-hidden="true" />
        <button onClick={() => router.push("/app")} className="btn ghost" style={{ position: "absolute", top: 22, left: 26, zIndex: 3 }}>
          ← Vissza
        </button>
        <div className="szm-pl-prev wide">
          <div className="prev-poster wide" style={{ background: grad(video.theme) }}>
            <span className="ring" />
            <span className="word">{cat(video.theme).word}</span>
            <span className="play-badge">▶</span>
            <span className="vig" />
            <span className="ttl">{video.title}</span>
          </div>
          <div className="prev-info">
            <div className="szm-mark"><span className="dot" />FOUNDATION · {video.theme}</div>
            <h1>{video.title}</h1>
            <div className="prev-chips">
              <span className="chip">⏱ {video.mins} perc</span>
              <span className="chip">{levelWord(video.level)}</span>
              {video.format && <span className="chip">{video.format}</span>}
              <span className="chip">🧘 csak matrac kell</span>
              {resumeAt > 1 && <span className="chip">▸ Folytatás · {fmt(resumeAt)}</span>}
            </div>
            <div className="prev-blocks">
              {blocks.map((b, i) => (
                <div key={b.name} className="pb">
                  <span className="i">{i + 1}</span>
                  <span className="nm">{b.name}</span>
                  <span className="mn">{blockMins(i)}′</span>
                </div>
              ))}
            </div>
            {video.muxPlaybackId ? (
              <>
                <button className="btn accent" style={{ fontSize: 17, padding: "16px 44px", marginTop: 4 }} onClick={start}>
                  ▶ {resumeAt > 1 ? "Folytatom" : "Kezdjük"}
                </button>
                {pbError && <span style={{ display: "block", marginTop: 10, color: "var(--accent)", fontSize: 13.5 }}>{pbError}</span>}
                <span className="prev-note">Alexa végig veled csinálja.</span>
              </>
            ) : (
              <>
                <span className="chip" style={{ marginTop: 4, padding: "12px 22px" }}>🎬 A videó hamarosan elérhető</span>
                <span className="prev-note">Ez az edzés még készül - nézz vissza később.</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── playing / finished ──
  // ── playing / finished ──
  const isFinished = stage === "finished";
  return (
    <div className="lx szm-player">
      <div className="szm-pl-stagebg" style={{ background: grad(video.theme) }} aria-hidden="true" />

      {/* TOP BAR - exit always visible (L-RULE 06) */}
      <header className="pf-top">
        <button className="pf-ex" onClick={exit}><LxIcon d={lxPaths.chevronLeft} size={16} /> Kilépés</button>
        <div className="pf-ttl"><span className="nm">{video.title}</span><span className="c">{video.code} · FOUNDATION · {video.theme.toUpperCase()}</span></div>
        <div className="pf-toprt">
          {castAvail && <button className="pf-ico" onClick={castToTv} aria-label="Lejátszás TV-n"><LxIcon d={lxPaths.cast} size={16} /></button>}
          <button className={`pf-ico${muted ? " on" : ""}`} onClick={toggleMute} aria-label={muted ? "Hang be" : "Némítás"}><LxIcon d={muted ? lxPaths.volumeX : lxPaths.volume2} size={16} /></button>
          <button className="pf-ico" onClick={() => setKeysOpen((v) => !v)} aria-label="Gyorsbillentyűk"><LxIcon d={lxPaths.ellipsis} size={16} /></button>
        </div>
      </header>

      <div className="pf-body">
        <div className={`pf-main${idle && !paused && !isFinished ? " idle" : ""}`}>
          <div className={`pf-stage${hud ? "" : " hud-off"}${fakeFs ? " fake-fs" : ""}`} ref={frameRef} onClick={() => { if (typeof window !== "undefined" && window.innerWidth <= 900) setMCtl((v) => !v); }}>
            {pb && (
              <MuxPlayer ref={playerRef} className="pf-video" playbackId={pb.playbackId} tokens={pb.tokens}
                startTime={resumeAt} streamType="on-demand" accentColor="#7a9b8d" autoPlay preload="auto"
                initialBandwidthEstimateKbps={3000} initialEstimateSegments={2}
                metadata={{
                  video_title: video.title,
                  video_id: video.code,
                  // Attribute the view to the user - the /api/progress/sync
                  // route queries Mux Data by this id (watch time + completions).
                  viewer_user_id: user?.uid,
                  video_duration: video.muxDuration ? Math.round(video.muxDuration * 1000) : undefined,
                }} />
            )}

            {/* over-video: two numbers dominate (L2 · L-RULE 01/02) */}
            {stage === "playing" && (
              <>
                <span className="pf-repchip">{repText}</span>
                {nextName && <span className="pf-nextpill">Következik: <b>{nextName}</b></span>}
                <div className="pf-ovwork">
                  <div>
                    <div className="blk">{blockName.toUpperCase()}</div>
                    <div className="name">{currentMove}</div>
                  </div>
                  <div className="cdw"><div className="cdk">HÁTRA VAN</div><div className="cd">{countdown}</div></div>
                </div>
                {/* mobile: thin chapter progress on the video - hidden while the tap
                    overlay is open (its own bar takes over, so no doubled bar) */}
                {!mCtl && (
                  <div className="pf-ytp-restbar">
                    {blocks.map((b, i) => { const fill = Math.max(0, Math.min(1, (frac - bounds[i].start) / (bounds[i].end - bounds[i].start))); return <span key={b.name} style={{ flex: weight(i) }}><i style={{ width: `${fill * 100}%` }} /></span>; })}
                  </div>
                )}
              </>
            )}

            {/* mobile: tap-to-reveal controls */}
            {stage === "playing" && mCtl && (
              <div
                className="pf-ytov"
                onClick={(e) => {
                  // YouTube tap model: a tap on empty overlay area hides the
                  // controls; taps on buttons act AND re-arm the hide timer.
                  e.stopPropagation();
                  if ((e.target as HTMLElement).closest("button")) setCtlPing((p) => p + 1);
                  else setMCtl(false);
                }}
              >
                <div className="pf-ytov-top">
                  <button onClick={exit} aria-label="Kilépés"><LxIcon d={lxPaths.chevronDown} size={18} /></button>
                  <div className="rt">
                    <button onClick={() => setHud((v) => !v)} aria-label={hud ? "Adatok elrejtése" : "Adatok mutatása"}><LxIcon d={hud ? lxPaths.eye : lxPaths.eyeOff} size={17} /></button>
                    {castAvail && <button onClick={castToTv} aria-label="TV-re"><LxIcon d={lxPaths.cast} size={17} /></button>}
                    <button onClick={() => setKeysOpen((v) => !v)} aria-label="Továbbiak"><LxIcon d={lxPaths.ellipsisV} size={17} /></button>
                  </div>
                </div>
                <div className="pf-ytov-mid">
                  <button onClick={rewind} aria-label="10 mp vissza"><LxIcon d={lxPaths.rotateCcw} size={20} /></button>
                  <button className="main" onClick={togglePlay} aria-label={paused ? "Folytatás" : "Szünet"}><LxIcon d={paused ? lxPaths.play : lxPaths.pauseBars} size={24} fill={paused} /></button>
                  <button onClick={forward} aria-label="10 mp előre"><LxIcon d={lxPaths.rotateCw} size={20} /></button>
                </div>
                <div className="pf-ytov-bot">
                  <span>{fmt(cur)}</span>
                  <div className="pf-chapbar">
                    {blocks.map((b, i) => { const fill = Math.max(0, Math.min(1, (frac - bounds[i].start) / (bounds[i].end - bounds[i].start))); return <span key={b.name} style={{ flex: weight(i) }}><i style={{ width: `${fill * 100}%` }} /></span>; })}
                  </div>
                  <span>{fmt(totalSec)}</span>
                  <button onClick={toggleFs} aria-label="Teljes képernyő"><LxIcon d={fsActive ? lxPaths.minimize : lxPaths.maximize} size={15} /></button>
                </div>
              </div>
            )}

            {/* PAUSE (L3 · L-RULE 05) */}
            {stage === "playing" && paused && (
              <div className="pf-full pause fade-in">
                <div className="k">SZÜNET</div>
                <div className="h">Levegő. Ráérsz.</div>
                <div className="s">{blockName} · <b>{currentMove}</b> · {fmt(cur)} / {fmt(totalSec)}</div>
                <button className="pf-gbtn" onClick={togglePlay}><LxIcon d={lxPaths.play} size={16} fill /> Folytatás</button>
                <button className="pf-gbtn ghost" onClick={exit}>Kilépés - a haladásod megmarad</button>
              </div>
            )}

            {/* END (L3) - redesigned completion moment + share examples */}
            {isFinished && (
              <FinishComplete
                title={video.title}
                mins={video.mins}
                streak={result?.streak ?? 1}
                onShare={() => setShareOpen(true)}
                onSkip={exit}
              />
            )}

            {/* Finish share - selfie + data overlay (mobile: inline camera; desktop: QR handoff) */}
            {finishData && (
              <FinishShareEntry open={shareOpen} onClose={() => setShareOpen(false)} data={finishData} />
            )}

            {/* keyboard help (?) */}
            {keysOpen && (
              <div className="pf-keys" onClick={() => setKeysOpen(false)}>
                <div className="pf-keys-box" onClick={(e) => e.stopPropagation()}>
                  <h4>Gyorsbillentyűk</h4>
                  {([["Space", "Lejátszás / szünet"], ["←", "10 mp vissza"], ["→", "10 mp előre"], ["F", "Teljes képernyő"], ["M", "Némítás"], ["N", "Következő blokk"], ["H", "Adatok ki / be"], ["1 2 3", "Ugrás blokkra"], ["Esc", "Kilépés"]] as const).map(([k, t]) => (
                    <div className="row" key={k}><kbd>{k}</kbd><span className="t">{t}</span></div>
                  ))}
                  <button className="pf-keys-close" onClick={() => setKeysOpen(false)}>Bezár</button>
                </div>
              </div>
            )}
          </div>

          {/* DESKTOP CONTROLS (L2/L4) */}
          <div className="pf-ctl">
            <div className="pf-chapwrap"
              onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const f = (e.clientX - r.left) / r.width; const info = seekInfoAt(f); if (info) setSeek({ left: f * 100, ...info }); }}
              onMouseLeave={() => setSeek(null)}
              onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); const f = (e.clientX - r.left) / r.width; seekTo(f * (dur || totalMins * 60)); }}>
              <div className="pf-chaps">
                {blocks.map((b, i) => { const fill = Math.max(0, Math.min(1, (frac - bounds[i].start) / (bounds[i].end - bounds[i].start))); return <span key={b.name} className={`sg${frac >= bounds[i].end ? " done" : ""}`} style={{ flex: weight(i) }}><i style={{ width: `${fill * 100}%` }} /></span>; })}
              </div>
              {seek && (<><div className="pf-seekprev" style={{ left: `${seek.left}%` }}><div className="e">{seek.e}</div><div className="t">{seek.t}</div></div><span className="pf-seekhead" style={{ left: `${seek.left}%` }} /></>)}
            </div>
            <div className="pf-crow">
              <button className="pf-time" onClick={() => setShowRemain((v) => !v)}>{timeText} <b>· {blockName}</b></button>
              <div className="pf-mid">
                <button className="pf-btn" onClick={rewind}><LxIcon d={lxPaths.rotateCcw} size={15} /> 10 mp</button>
                <button className="pf-main-btn" onClick={togglePlay} aria-label={paused ? "Folytatás" : "Szünet"}><LxIcon d={paused ? lxPaths.play : lxPaths.pauseBars} size={22} fill={paused} /></button>
                <button className="pf-btn" onClick={forward}><LxIcon d={lxPaths.rotateCw} size={15} /> 10 mp</button>
                <button className="pf-btn" onClick={skip}><LxIcon d={lxPaths.chevronRight} size={15} /> Átugrom</button>
              </div>
              <div className="pf-right">
                <div className="pf-vol">
                  <button onClick={toggleMute} aria-label="Némítás"><LxIcon d={muted || vol === 0 ? lxPaths.volumeX : lxPaths.volume2} size={16} /></button>
                  <div className="pf-volbar" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); applyVolume((e.clientX - r.left) / r.width); }}>
                    <i style={{ width: `${(muted ? 0 : vol) * 100}%` }} /><b style={{ left: `${(muted ? 0 : vol) * 100}%` }} />
                  </div>
                </div>
                <button className={`pf-ico${gearOpen ? " on" : ""}`} style={{ width: 34, height: 34 }} onClick={() => setGearOpen((v) => !v)} aria-label="Beállítások"><LxIcon d={lxPaths.settings} size={16} /></button>
                <button className="pf-ico" style={{ width: 34, height: 34 }} onClick={toggleFs} aria-label="Teljes képernyő"><LxIcon d={fsActive ? lxPaths.minimize : lxPaths.maximize} size={16} /></button>
              </div>
            </div>
            {gearOpen && (
              <div className="pf-gear">
                <button className="r" onClick={cycleSpeed}><LxIcon d={lxPaths.gauge} size={15} /> Sebesség <span className="v">{speed}×</span></button>
                <div className="r"><LxIcon d={lxPaths.captions} size={15} /> Felirat <span className="v">MAGYAR</span></div>
                <div className="r"><LxIcon d={lxPaths.settings} size={15} /> Minőség <span className="v">AUTO · 1080p</span></div>
                {castAvail && <button className="r" onClick={castToTv}><LxIcon d={lxPaths.cast} size={15} /> Lejátszás TV-n <span className="v">AIRPLAY</span></button>}
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP RAIL - the playlist (L2 pin 4) */}
        <aside className="pf-rail">
          <h3>Az edzés menete</h3>
          {blocks.map((b, i) => {
            const now = i === active; const done = frac >= bounds[i].end; const open = i === openBlock;
            return (
              <div key={b.name} className={`pf-blk${now ? " now" : ""}${done ? " done" : ""}`}>
                {/* click a block to EXPAND it (not seek) - only exercises seek */}
                <button className="pf-blk-hd" onClick={() => setExpanded(i)} aria-expanded={open}>
                  <span className={`n${done ? " done" : now ? " on" : ""}`}>{done ? <Check size={11} /> : i + 1}</span>
                  <span className="nm">{b.name}</span>
                  <span className="m">{blockMins(i)}′</span>
                </button>
                {open && b.items.map(normalizeExercise).map((ex, k) => {
                  const exDone = now ? activeEx > k : done;
                  return (
                    <button key={k} className={`pf-ex-row${now && k === activeEx ? " on" : ""}${exDone ? " done" : ""}`} disabled={!Number.isFinite(ex.start)} onClick={Number.isFinite(ex.start) ? () => seekTo(ex.start!) : undefined}>
                      {exDone ? <span className="dc"><Check size={11} /></span> : <span className="d" />}
                      <span className="nm">{ex.name}</span>
                      {Number.isFinite(ex.start) && <span className="t">{secToClock(ex.start!)}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
          <div className="pf-railfoot">A végén a ✅ automatikus - neked csak mozognod kell.</div>
        </aside>

        {/* MOBILE - YouTube watch page (L5) */}
        <div className="pf-mbody">
          <div className="pf-yttitle">
            <div className="tt">{video.title} <LxIcon d={lxPaths.chevronDown} size={16} /></div>
            <div className="mt">Foundation · {video.theme} · {video.mins} perc · {video.format ?? "eszköz nélkül"}</div>
          </div>
          <div className="pf-nowstrip">
            <div className="cd">{countdown}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="stp">{repText}</div>
              <div className="ex">{currentMove}</div>
              {nextName && <div className="nx">Következik: {nextName}</div>}
            </div>
          </div>
          <div className="pf-pills">
            <button className={`pf-pill${saved ? " on" : ""}`} onClick={toggleSave}><LxIcon d={saved ? lxPaths.check : lxPaths.plus} size={13} /> {saved ? "Mentve" : "Mentés"}</button>
            {castAvail && <button className="pf-pill" onClick={castToTv}><LxIcon d={lxPaths.cast} size={13} /> TV-re</button>}
          </div>
          <div className="pf-chrow">
            <span className="ava"><img src="/alexa-av.jpg" alt="" /></span>
            <div style={{ flex: 1 }}><div className="nm">Alexa</div><div className="sb">A te edződ</div></div>
            {result?.streak != null && <span className="pf-streak"><span className="fire" aria-hidden="true">🔥</span>{result.streak}</span>}
          </div>
          <div className="pf-menulist">
            <div className="lbl">Mai menü</div>
            {blocks.map((b, bi) => {
              const bNow = bi === active;
              const bDone = frac >= bounds[bi].end;
              const bOpen = bi === openBlock;
              const items = (b.items ?? []).map(normalizeExercise);
              return (
                <div key={b.name} className="pf-mblk">
                  {/* tap a block to expand it (not seek); only exercises seek */}
                  <button className={`pf-mblk-hd${bNow ? " now" : ""}`} onClick={() => setExpanded(bi)} aria-expanded={bOpen}>
                    <span className={`n${bDone ? " done" : bNow ? " on" : ""}`}>{bDone ? <LxIcon d={lxPaths.check} size={11} /> : bi + 1}</span>
                    <span className="nm">{b.name}</span>
                    <span className="m">{blockMins(bi)}′</span>
                  </button>
                  {bOpen && items.map((ex, k) => {
                    const exActive = bNow && k === activeEx;
                    const exDone = bNow ? activeEx > k : bDone;
                    return (
                      <button key={k} className={`pf-mi${exActive ? " on" : ""}${exDone ? " done" : ""}`} disabled={!Number.isFinite(ex.start)} onClick={Number.isFinite(ex.start) ? () => seekTo(ex.start!) : undefined}>
                        <span className="ix">{exDone ? <LxIcon d={lxPaths.check} size={12} /> : <span className="dot" />}</span>
                        <span className="nm">{ex.name}</span>
                        <span className="tm">{exActive ? "MOST" : Number.isFinite(ex.start) ? secToClock(ex.start!) : ""}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE tab bar stays (L5 - page, not takeover) */}
        <nav className="pf-mtabs">
          <button className="pf-mtab on" onClick={() => router.push("/app")}><LxIcon d={lxPaths.house} size={20} /> Kezdőlap</button>
          <button className="pf-mtab" onClick={() => router.push("/app/library")}><LxIcon d={lxPaths.layoutGrid} size={20} /> Videótár</button>
          <button className="pf-mtab" onClick={() => router.push("/app/progress")}><LxIcon d={lxPaths.chartColumn} size={20} /> Haladásom</button>
          <button className="pf-mtab" onClick={() => router.push("/app/challenges")}><LxIcon d={lxPaths.trophy} size={20} /> Kihívások</button>
        </nav>
      </div>
    </div>
  );
}

export default function Page() {
  const params = useParams();
  const code = String(params.code);
  return (
    <Protected requirePaid fallback={<PlayerSkeleton />}>
      <PlayerScreen code={code} />
    </Protected>
  );
}
