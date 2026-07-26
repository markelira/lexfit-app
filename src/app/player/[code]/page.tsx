"use client";

import "./player.css";
import MuxPlayer from "@mux/mux-player-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Protected, Loader } from "@/components/Protected";
import { Check } from "@/components/OnbAside";
import { getPlaybackTokens, type PlaybackResponse } from "@/lib/playback";
import { ensureProgress, getProgress, markComplete, saveResume } from "@/lib/progress";
import { normalizeExercise } from "@/lib/blocks";
import type { Video, VideoBlock } from "@/lib/types";
import { secToClock } from "@/lib/time";

const CAT: Record<string, { c: string; word: string }> = {
  "Alsótest": { c: "var(--cat-also)", word: "ALSÓ" },
  "Felsőtest": { c: "var(--cat-felso)", word: "FELSŐ" },
  "Cardio + has": { c: "var(--cat-cardio)", word: "CARDIO" },
  "Teljes test": { c: "var(--cat-teljes)", word: "TELJES" },
  "Mobility / nyújtás": { c: "var(--cat-mobility)", word: "MOBILITY" },
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
  if (v.blocks?.length) return v.blocks;
  return [
    { name: "Bemelegítés", mins: Math.max(2, Math.round(v.mins * 0.15)), items: ["Átmozgatás Alexával"] },
    { name: "Fő rész", mins: Math.round(v.mins * 0.65), items: ["Vezetett blokk — kövesd Alexát"] },
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
  const [result, setResult] = useState<{ streak: number } | null>(null);
  const lastSavedRef = useRef(0);

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
      if (active && prog?.resume?.[code]) setResumeAt(prog.resume[code]);
    })();
    return () => { active = false; };
  }, [user, code]);

  // Seed duration from the stored Mux duration so stamped block math is correct
  // before the player's own `loadedmetadata` fires (which then sets the exact value).
  useEffect(() => {
    if (video?.muxDuration) setDur(video.muxDuration);
  }, [video]);

  // Skip the player's own preview stage when arrived via an explicit "play" action
  // (e.g. the detail modal's "Edzés indítása") — go straight into playback.
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
  // is off the click path — clicking "Kezdjük" then jumps straight to the player.
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
  const stamped = blocks.length > 0 && blocks.every((b) => typeof b.start === "number");
  const bounds = useMemo(() => {
    if (stamped && dur > 0) {
      return blocks.map((b, i) => {
        const s = b.start as number;
        const e = i + 1 < blocks.length ? (blocks[i + 1].start as number) : dur;
        return { start: s / dur, end: e / dur, startSec: s, endSec: e };
      });
    }
    let acc = 0;
    return blocks.map((b) => {
      const start = acc / totalMins;
      acc += b.mins;
      return { start, end: acc / totalMins, startSec: 0, endSec: 0 };
    });
  }, [blocks, totalMins, stamped, dur]);
  // Layout weight for the segment/timeline widths: real block seconds when stamped.
  const weight = (i: number) => (stamped ? Math.max(1, bounds[i].endSec - bounds[i].startSec) : blocks[i].mins);
  const cb = bounds.findIndex((b) => frac >= b.start && frac < b.end);
  const active = cb === -1 ? Math.max(0, bounds.length - 1) : cb;
  const blockEndSec = (bounds[active]?.end ?? 1) * dur;
  const blockStartSec = (bounds[active]?.start ?? 0) * dur;
  const blockLeft = Math.max(0, Math.ceil(blockEndSec - cur));
  const nextBlock = blocks[active + 1];

  // Active block's exercises, normalized. `start` (absolute seconds) is optional per
  // exercise — these power the now-panel highlight, the next-exercise countdown, and
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

  async function finish() {
    setStage("finished");
    if (user) {
      const r = await markComplete(user.uid, code, sessionOrder);
      setResult({ streak: r.streak });
    }
  }

  useEffect(() => {
    const el = playerRef.current;
    if (!el || !pb) return;
    const onTime = () => {
      const t = el.currentTime ?? 0;
      setCur(t);
      if (user && t - lastSavedRef.current >= 5) {
        lastSavedRef.current = t;
        saveResume(user.uid, code, t);
      }
    };
    const onMeta = () => setDur(el.duration ?? 0);
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    const onEnd = () => void finish();
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
    };
    // `stage` is required: the token is now prefetched during preview, so `pb` is
    // already set before the player mounts. We must re-run when we enter "playing"
    // (the point the MuxPlayer element actually exists) to attach the listeners.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pb, stage, user, code, sessionOrder]);

  const togglePlay = () => {
    const el = playerRef.current;
    if (!el) return;
    el.paused ? el.play() : el.pause();
  };
  const seekTo = (sec: number) => { const el = playerRef.current; if (el && dur) el.currentTime = Math.max(0, Math.min(dur - 0.1, sec)); };
  const rewind = () => { const el = playerRef.current; if (el) el.currentTime = Math.max(0, el.currentTime - 10); };
  const skip = () => { const el = playerRef.current; if (el && dur) el.currentTime = Math.min(dur - 0.1, blockEndSec); };
  const changeSpeed = () => {
    const el = playerRef.current;
    const next = speed === 1 ? 0.75 : 1;
    setSpeed(next);
    if (el) el.playbackRate = next;
  };
  const toggleFs = () => {
    const el = frameRef.current;
    if (!fs && el?.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (fs && document.fullscreenElement) document.exitFullscreen();
    setFs((v) => !v);
  };

  if (notFound)
    return (
      <div className="lx szm-player" style={{ alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--d-ink-2)" }}>Ez az edzés nem található.</p>
        <button className="btn ghost" onClick={() => router.push("/app")}>← Vissza</button>
      </div>
    );
  if (!video) return <Loader label="Edzés…" />;

  // ── preview ──
  if (stage === "preview") {
    // Arrived via an explicit play action → don't flash the redundant preview,
    // show a loader until start() flips us into playback.
    if (wantAutostart && video.muxPlaybackId) return <Loader label="Edzés…" />;
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
                  <span className="mn">{b.mins}′</span>
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
                <span className="prev-note">Ez az edzés még készül — nézz vissza később.</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── playing / finished ──
  return (
    <div className="lx szm-player">
      <div className="szm-pl-stagebg" style={{ background: grad(video.theme) }} aria-hidden="true" />

      <header className="szm-pl-top">
        <button onClick={() => router.push("/app")} className="btn ghost" style={{ padding: "9px 18px" }}>← Kilépés</button>
        <div className="ttl">{video.title}</div>
        <span className="mono code">{video.code}</span>
        <span className="mono note">FOUNDATION · {video.theme}</span>
      </header>

      <div className="szm-pl-stage">
        {/* LEFT — live now/next */}
        <aside className="szm-pl-now">
          <div className="np-eyebrow">{blocks[active]?.name.toUpperCase()}</div>
          <div className="np-move">{currentMove}</div>
          <div className="np-clock">{fmt(hasExStamps ? exLeft : blockLeft)}</div>
          {hasExStamps && nextExName && (
            <div className="np-cdlabel">KÖVETKEZŐ GYAKORLAT · {nextExName}</div>
          )}
          <div className="np-blockprog">
            <i style={{ width: `${Math.max(0, Math.min(1, (cur - blockStartSec) / Math.max(1, blockEndSec - blockStartSec))) * 100}%` }} />
          </div>
          {nextBlock && (
            <div className="np-next">
              <span className="lbl">KÖVETKEZIK</span>
              <span className="val">{nextBlock.name}</span>
            </div>
          )}
          <div className="np-chips">
            <span className="szm-stat">⏱ {fmt(cur)} / {dur ? fmt(dur) : fmt(totalMins * 60)}</span>
            {video.format && <span className="szm-stat">{video.format}</span>}
          </div>
        </aside>

        {/* CENTER — video */}
        <div className="szm-pl-center">
          {/* MOBILE — compact countdown above the player (desktop uses the left aside) */}
          <div className="szm-pl-mnow">
            <div className="mn-txt">
              <span className="mn-block">{blocks[active]?.name}</span>
              <span className="mn-move">{currentMove}</span>
              {hasExStamps && nextExName && <span className="mn-next">KÖV · {nextExName}</span>}
            </div>
            <span className="mn-clock">{fmt(hasExStamps ? exLeft : blockLeft)}</span>
          </div>

          <div className={`szm-pl-portrait wide${fs ? " fs" : ""}`} ref={frameRef}>
            <div className="szm-pl-segs">
              {blocks.map((b, i) => {
                const fill = Math.max(0, Math.min(1, (frac - bounds[i].start) / (bounds[i].end - bounds[i].start)));
                return <span key={b.name} className="sg" style={{ flex: weight(i) }}><i style={{ width: `${fill * 100}%` }} /></span>;
              })}
            </div>
            {pb && (
              <MuxPlayer
                ref={playerRef}
                className="szm-pl-video"
                playbackId={pb.playbackId}
                tokens={pb.tokens}
                startTime={resumeAt}
                streamType="on-demand"
                accentColor="#7a9b8d"
                autoPlay
                preload="auto"
                // Fast-start ABR: HLS.js's default first estimate is derived from the
                // first segment download, which TCP slow-start skews low — making quality
                // ramp up sluggishly. Seed a realistic broadband estimate so ABR reaches
                // good quality within a segment or two. Only used during init; HLS.js
                // switches to measured bandwidth after `initialEstimateSegments`, so a bad
                // guess self-corrects fast. TUNE these once real content/telemetry exists.
                initialBandwidthEstimateKbps={3000}
                initialEstimateSegments={2}
                metadata={{ video_title: video.title, video_id: video.code }}
              />
            )}
            <div className="szm-pl-tint" style={{ background: `linear-gradient(to top, oklch(from ${cat(video.theme).c} 0.3 0.06 h / 0.5), transparent 46%)` }} />
            <button className="szm-pl-fs" onClick={toggleFs} aria-label="Teljes képernyő">⛶</button>

            {stage === "playing" && paused && (
              <div className="szm-pl-pause fade-in">
                <div className="lbl">SZÜNET</div>
                <div className="big">Levegő.<br />Innen folytatjuk.</div>
                <div className="ctx">{blocks[active]?.name}</div>
                <button className="btn glass-cta" style={{ marginTop: 6 }} onClick={togglePlay}>
                  ▶ Folytatás
                </button>
              </div>
            )}

            {stage === "finished" && (
              <div className="szm-pl-finish" style={{ background: "var(--grad-hero)" }}>
                <span className="ic"><Check size={34} /></span>
                <div className="big">Megcsináltad.</div>
                <div className="sub">✅ beírva · a sorozatod <strong>{result?.streak ?? 1} napos</strong> lett</div>
                <div className="q">Hogy ment ma?</div>
                <div className="fbs">
                  {["😮‍💨 Könnyű volt", "💪 Jó volt", "🥵 Kemény volt"].map((f) => (
                    <button key={f} className="glass-chip" onClick={() => router.push("/app")}>{f}</button>
                  ))}
                </div>
                <button className="skip" onClick={() => router.push("/app")}>kihagyom</button>
              </div>
            )}
          </div>

          <div className="szm-pl-timeline">
            {blocks.map((b, i) => {
              const fill = Math.max(0, Math.min(1, (frac - bounds[i].start) / (bounds[i].end - bounds[i].start)));
              return (
                <button key={b.name} className={`tl${i === active ? " on" : ""}`} style={{ flex: weight(i) }}
                  onClick={() => seekTo(bounds[i].start * dur)}>
                  <span className="bar"><i style={{ width: `${fill * 100}%` }} /></span>
                  <span className="lb">{b.name}</span>
                </button>
              );
            })}
          </div>

          <div className="szm-pl-dock">
            <button onClick={rewind} title="10 mp vissza">↺ 10</button>
            <button className="play" onClick={togglePlay} aria-label={paused ? "Folytatás" : "Szünet"}>
              {!paused ? <span className="bars"><i /><i /></span> : <span style={{ fontSize: 20 }}>▶</span>}
            </button>
            <button onClick={skip} title="Blokk átugrása">⇥</button>
            <button className="spd" onClick={changeSpeed}>{speed === 1 ? "1×" : "0.75×"}</button>
          </div>

          {/* MOBILE — horizontal "edzés menete" below the player (desktop uses the right aside) */}
          <div className="szm-pl-msched">
            <div className="ms-title">Az edzés menete</div>
            {/* blocks — always seekable, like the timeline */}
            <div className="ms-row ms-blocks">
              {blocks.map((b, i) => (
                <button
                  key={b.name}
                  type="button"
                  className={`ms-blk${i === active ? " on" : ""}`}
                  onClick={() => seekTo(bounds[i].start * dur)}
                >
                  <span className="i">{i + 1}</span>
                  <span className="nm">{b.name}</span>
                </button>
              ))}
            </div>
            {/* exercises of the active block */}
            <div className="ms-row">
              {activeItems.map((ex, k) => (
                <button
                  key={k}
                  type="button"
                  className={`ms-ex${k === activeEx ? " on" : ""}`}
                  disabled={ex.start == null}
                  onClick={ex.start != null ? () => seekTo(ex.start!) : undefined}
                >
                  {ex.start != null && <span className="t">{secToClock(ex.start)}</span>}
                  <span className="nm">{ex.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — schedule */}
        <aside className="szm-pl-sched">
          <h3>Az edzés menete</h3>
          <div className="sl">
            {blocks.map((b, i) => {
              const now = i === active;
              const done = frac >= bounds[i].end;
              return (
                <div key={b.name} className={`sb${now ? " now" : ""}`}>
                  <button type="button" className="sb-hd" onClick={() => seekTo(bounds[i].start * dur)} title="Ugrás a blokkra">
                    <span className={`n${done ? " done" : now ? " now" : ""}`}>{done ? <Check size={11} /> : i + 1}</span>
                    <span className="nm">{b.name}</span>
                    <span className="mn">{b.mins}′</span>
                  </button>
                  {now && (
                    <ul>
                      {b.items.map(normalizeExercise).map((ex, k) =>
                        ex.start != null ? (
                          <li key={k}>
                            <button
                              type="button"
                              className={`exseek${k === activeEx ? " on" : ""}`}
                              onClick={() => seekTo(ex.start!)}
                            >
                              <span className="t">{secToClock(ex.start)}</span>
                              <span className="nm">{ex.name}</span>
                            </button>
                          </li>
                        ) : (
                          <li key={k} className={k === activeEx ? "on" : ""}><span className="bul">·</span>{ex.name}</li>
                        ),
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
          <div className="sched-foot">A ✅ a végén automatikus — neked csak mozognod kell.</div>
        </aside>
      </div>
    </div>
  );
}

export default function Page() {
  const params = useParams();
  const code = String(params.code);
  return (
    <Protected>
      <PlayerScreen code={code} />
    </Protected>
  );
}
