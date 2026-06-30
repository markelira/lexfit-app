"use client";

import "./haladasom.css";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { getOnboarding } from "@/lib/user";
import { getProgress, type ProgressState } from "@/lib/progress";
import { getPhotos, uploadMilestonePhoto, type Milestone } from "@/lib/photos";

const CAM = ["M4 8 h3 l1.5 -2 h7 l1.5 2 h3 v11 h-19 Z", "M12 16.5 a3 3 0 1 0 0-6 a3 3 0 0 0 0 6 Z"];

export default function HaladasomPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [why, setWhy] = useState<string>("");
  const [photos, setPhotos] = useState<Partial<Record<Milestone, string>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getProgress(user.uid), getOnboarding(user.uid), getPhotos(user.uid)]).then(
      ([p, onb, ph]) => {
        setProgress(p);
        setWhy(String((onb?.why ?? onb?.motiv ?? "") || ""));
        setPhotos(ph);
        setLoading(false);
      },
    );
  }, [user]);

  if (loading) return <p style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", marginTop: 40 }}>Töltés…</p>;

  const doneCount = progress?.doneCount ?? 0;
  const streak = progress?.streak ?? 0;
  const total = 40;
  const currentWeek = Math.min(8, Math.floor((progress?.currentIndex ?? 0) / 5) + 1);
  const nowMilestone: Milestone = currentWeek >= 8 ? 8 : currentWeek >= 5 ? 5 : 1;

  async function upload(m: Milestone, file: File) {
    if (!user) return;
    const url = await uploadMilestonePhoto(user.uid, m, file);
    setPhotos((p) => ({ ...p, [m]: url }));
  }

  const wins: [string, string, string][] = [
    ["🔥", String(streak), "nap sorozat"],
    ["✅", `${doneCount}/${total}`, "edzés kész"],
    ["📅", String(currentWeek), "aktuális hét"],
    ["⚡", "Több", "energia"],
  ];
  const miles: { ic: string; week: number; label: string }[] = [
    { ic: "🌱", week: 1, label: "Hét 1 · Indulás" },
    { ic: "🔥", week: 5, label: "Hét 5 · Félút" },
    { ic: "🏆", week: 8, label: "Hét 8 · Cél" },
  ];

  return (
    <div className="halc fade-in">
      <div className="halc-head">
        <h1>A különbség, egy képben</h1>
        <p>A te utad — magadhoz mérve, senki máshoz. Húzd a csúszkát, vagy nézd egymás mellett.</p>
      </div>

      <Compare
        startUrl={photos[1]}
        nowUrl={photos[nowMilestone] ?? photos[8] ?? photos[5] ?? photos[1]}
        currentWeek={currentWeek}
        onUploadStart={(f) => upload(1, f)}
        onUploadNow={(f) => upload(nowMilestone, f)}
      />

      <div className="halc-tip">📱 Álló (portré) telefonos képet tölts fel — azonos pózban, fényben és ruhában.</div>

      <div className="halc-miles">
        {miles.map((m) => {
          const has = !!photos[m.week as Milestone];
          const state = currentWeek >= m.week || has ? "done" : "locked";
          const st = state === "done" ? "kész ✓" : `${m.week - currentWeek} hét múlva`;
          return (
            <div className={`halc-mile ${state}`} key={m.week}>
              <span className="mi">{state === "done" ? <LxIcon d={lxPaths.check} size={15} sw={2.6} /> : m.ic}</span>
              <span className="ml">{m.label}</span>
              <span className="ms">{st}</span>
            </div>
          );
        })}
      </div>

      <div className="halc-strip">
        {wins.map(([e, v, k], i) => (
          <div className="s" key={i}>
            <div className="v">{v}</div>
            <div className="k">{e} {k}</div>
          </div>
        ))}
      </div>

      <div className="halc-why">
        <span className="qm">&ldquo;</span>
        <div>
          <p>{why || "Írd meg az onboardingban, miért vágtál bele — ide kerül, hogy a nehéz napokon emlékeztessen."}</p>
          <span className="src">A te szavaiddal · onboarding</span>
        </div>
      </div>

      <div className="halc-note">
        🤍 <b>Légy kedves magaddal.</b> A víz, a hormonok, a napszak ingadozik — a trend számít. A fotóid privátak.
      </div>
    </div>
  );
}

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
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  const photoStyle = (url?: string) =>
    url ? { backgroundImage: `url(${url})` } : undefined;

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
            <button className="ba-change l" onClick={() => startInput.current?.click()}>
              <LxIcon d={CAM} size={15} sw={1.8} /> Csere
            </button>
            <button className="ba-change r" onClick={() => nowInput.current?.click()}>
              <LxIcon d={CAM} size={15} sw={1.8} /> Csere
            </button>
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
              <button className="cmp-chg" onClick={() => startInput.current?.click()}>
                <LxIcon d={CAM} size={14} sw={1.8} /> Indulás cseréje
              </button>
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
              <button className="cmp-chg" onClick={() => nowInput.current?.click()}>
                <LxIcon d={CAM} size={14} sw={1.8} /> Mai cseréje
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
