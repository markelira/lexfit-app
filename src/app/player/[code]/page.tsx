"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection, doc, getDoc, getDocs, query, where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Protected, Loader } from "@/components/Protected";
import { Check } from "@/components/OnbAside";
import { getPlaybackTokens, type PlaybackResponse } from "@/lib/playback";
import { ensureProgress, getProgress, markComplete, saveResume } from "@/lib/progress";
import type { Video, VideoBlock } from "@/lib/types";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Synthesize a 3-block plan for videos without an authored breakdown.
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

  const [video, setVideo] = useState<Video | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [sessionOrder, setSessionOrder] = useState(0);
  const [resumeAt, setResumeAt] = useState(0);

  const [stage, setStage] = useState<"preview" | "playing" | "finished">("preview");
  const [pb, setPb] = useState<PlaybackResponse | null>(null);
  const [pbError, setPbError] = useState<string | null>(null);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [result, setResult] = useState<{ streak: number } | null>(null);
  const lastSavedRef = useRef(0);

  // Load the workout, its session order, and any saved resume position.
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const snap = await getDoc(doc(db, "videos", code));
      if (!active) return;
      if (!snap.exists()) {
        setNotFound(true);
        return;
      }
      setVideo({ code: snap.id, ...(snap.data() as Omit<Video, "code">) });

      const sess = await getDocs(
        query(collection(db, "programs", "foundation", "sessions"), where("videoCode", "==", code)),
      );
      if (active && !sess.empty) setSessionOrder(sess.docs[0].data().order ?? 0);

      const prog = await getProgress(user.uid);
      if (active && prog?.resume?.[code]) setResumeAt(prog.resume[code]);
    })();
    return () => {
      active = false;
    };
  }, [user, code]);

  const blocks = useMemo(() => (video ? planBlocks(video) : []), [video]);
  const totalMins = useMemo(() => blocks.reduce((n, b) => n + b.mins, 0), [blocks]);

  // Map cumulative block minutes onto the real video duration (proportional).
  const frac = dur > 0 ? cur / dur : 0;
  const blockBounds = useMemo(() => {
    let acc = 0;
    return blocks.map((b) => {
      const start = acc / totalMins;
      acc += b.mins;
      return { start, end: acc / totalMins };
    });
  }, [blocks, totalMins]);
  const curBlock = blockBounds.findIndex((b) => frac >= b.start && frac < b.end);
  const activeBlock = curBlock === -1 ? blockBounds.length - 1 : curBlock;

  async function start() {
    setPbError(null);
    try {
      const data = await getPlaybackTokens(code);
      if (user) await ensureProgress(user.uid);
      setPb(data);
      setStage("playing");
    } catch (e) {
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

  // Wire native media events on the Mux player element (reliable for the custom
  // element); throttle resume saves to ~every 5s of playback.
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
    const onEnd = () => void finish();
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pb, user, code, sessionOrder]);

  if (notFound)
    return (
      <div className="lx" style={centerStage}>
        <p style={{ color: "var(--ink-2)" }}>Ez az edzés nem található.</p>
        <button className="btn ghost" onClick={() => router.push("/app")}>← Vissza</button>
      </div>
    );
  if (!video) return <Loader label="Edzés…" />;

  // ── preview ──
  if (stage === "preview") {
    return (
      <div className="lx" style={{ ...centerStage, padding: "40px 24px" }}>
        <button className="btn ghost" style={{ position: "absolute", top: 24, left: 28 }} onClick={() => router.push("/app")}>
          ← Vissza
        </button>
        <div style={{ width: "100%", maxWidth: 880 }}>
          <div className="mono" style={{ fontSize: 12, color: "var(--accent-ink)", letterSpacing: "0.12em" }}>
            KÉSZÜLJ — EZ VÁR MA RÁD
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6 }}>{video.title}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <span className="chip">⏱ {video.mins} perc</span>
            {video.format && <span className="chip">{video.format}</span>}
            <span className="chip">🧘 csak matrac kell</span>
            {resumeAt > 1 && <span className="chip">▸ Folytatás · {fmt(resumeAt)}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: `repeat(${blocks.length}, 1fr)`, gap: 14, marginTop: 32 }}>
            {blocks.map((b, i) => (
              <div key={b.name} className="card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--accent-ink)", letterSpacing: "0.07em" }}>
                    {i + 1} · {b.name.toUpperCase()}
                  </span>
                  <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-3)" }}>{b.mins}′</span>
                </div>
                <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                  {b.items.map((it) => (
                    <li key={it} style={{ fontSize: 13, color: "var(--ink-2)", display: "flex", gap: 7 }}>
                      <span style={{ color: "var(--accent)" }}>·</span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 36 }}>
            <button className="btn accent" style={{ fontSize: 18, padding: "18px 52px" }} onClick={start}>
              ▶ {resumeAt > 1 ? "Folytatom" : "Kezdjük"}
            </button>
            {pbError && <span style={{ fontSize: 13.5, color: "var(--accent-2)" }}>{pbError}</span>}
            <span style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
              A videó azonnal indul — Alexa végig veled csinálja.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── playing / finished ──
  return (
    <div className="lx" style={{ flex: 1, minHeight: "100dvh", display: "flex" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 28px" }}>
          <button onClick={() => router.push("/app")} className="btn ghost" style={{ padding: "9px 18px" }}>
            ← Kilépés
          </button>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{video.title}</div>
          <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{video.code}</span>
          <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)" }}>FOUNDATION</span>
        </header>

        <div style={{ flex: 1, margin: "0 28px", position: "relative", borderRadius: 22, overflow: "hidden", minHeight: 320 }}>
          {pb && (
            <MuxPlayer
              ref={playerRef}
              playbackId={pb.playbackId}
              tokens={pb.tokens}
              startTime={resumeAt}
              streamType="on-demand"
              accentColor="#e5719b"
              autoPlay
              metadata={{ video_title: video.title, video_id: video.code }}
              style={{ width: "100%", height: "100%", aspectRatio: "16/9" }}
            />
          )}

          {stage === "finished" && (
            <div
              style={{
                position: "absolute", inset: 0, background: "var(--grad-hero)", display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "white",
              }}
            >
              <span style={{ width: 68, height: 68, borderRadius: "50%", background: "oklch(1 0 0 / 0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={32} />
              </span>
              <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.01em" }}>Megcsináltad.</div>
              <div style={{ fontSize: 15, opacity: 0.9 }}>
                ✅ beírva · a sorozatod <strong>{result?.streak ?? 1} napos</strong> lett
              </div>
              <div style={{ marginTop: 18, fontSize: 14.5, fontWeight: 600, opacity: 0.95 }}>Hogy ment ma?</div>
              <div style={{ display: "flex", gap: 10 }}>
                {["😮‍💨 Könnyű volt", "💪 Jó volt", "🥵 Kemény volt"].map((f) => (
                  <button key={f} onClick={() => router.push("/app")} className="glass-chip" style={{ cursor: "pointer", fontWeight: 600, fontSize: 14.5, padding: "11px 20px" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer style={{ padding: "18px 28px 22px" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {blocks.map((b, i) => {
              const bnd = blockBounds[i];
              const fill = Math.max(0, Math.min(1, (frac - bnd.start) / (bnd.end - bnd.start)));
              return (
                <div key={b.name} title={b.name} style={{ flex: b.mins, height: 7, borderRadius: 99, background: "oklch(0.89 0.02 0)", overflow: "hidden" }}>
                  <div style={{ width: `${fill * 100}%`, height: "100%", background: i === activeBlock ? "var(--accent)" : "var(--ok)" }} />
                </div>
              );
            })}
          </div>
          <div className="mono" style={{ marginTop: 13, fontSize: 13, color: "var(--ink-3)" }}>
            {fmt(cur)} / {dur ? fmt(dur) : fmt(totalMins * 60)}
          </div>
        </footer>
      </div>

      <aside className="glass-l" style={{ width: 296, flexShrink: 0, borderRadius: 28, margin: 16, marginLeft: 0, padding: "22px 20px", display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Az edzés menete</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {blocks.map((b, i) => {
            const now = i === activeBlock && stage === "playing";
            const done = frac >= blockBounds[i].end;
            return (
              <div key={b.name} style={{ borderRadius: 16, padding: "10px 13px", background: now ? "oklch(1 0 0 / 0.85)" : "transparent", boxShadow: now ? "inset 0 1px 0 white, 0 4px 14px -6px oklch(0.45 0.08 0 / 0.25)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, fontSize: 10.5, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, background: done ? "var(--ok)" : now ? "var(--accent-2)" : "oklch(0.9 0.02 0)", color: done || now ? "white" : "var(--ink-3)" }}>
                    {done ? <Check size={11} /> : i + 1}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: now ? 700 : 600, color: done ? "var(--ink-3)" : "var(--ink)" }}>{b.name}</span>
                  <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-3)" }}>{b.mins}′</span>
                </div>
                {now && (
                  <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                    {b.items.map((it) => (
                      <li key={it} style={{ fontSize: 12.5, color: "var(--ink-2)", display: "flex", gap: 7 }}>
                        <span style={{ color: "var(--ink-3)" }}>·</span>
                        {it}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: "auto", borderTop: "1px solid oklch(1 0 0 / 0.55)", paddingTop: 13, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
          A végén a ✅ automatikus — neked csak mozognod kell.
        </div>
      </aside>
    </div>
  );
}

const centerStage: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 14,
  position: "relative",
};

export default function Page() {
  const params = useParams();
  const code = String(params.code);
  return (
    <Protected>
      <PlayerScreen code={code} />
    </Protected>
  );
}
