"use client";

import "../../foundation.css";
import "../../home.css";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getProgress, type ProgressState } from "@/lib/progress";
import { getMyList, setSaved } from "@/lib/mylist";
import { WorkoutCard } from "@/components/WorkoutCard";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { loadFoundation, type FoundationData } from "@/lib/program";

// Programme detail — the Foundation programme in full: phases, facts and every
// week. This is where the programme-specific content lives (README §3.4), reached
// from the Kezdőlap "A Foundation heted · Program ›" link.
export default function FoundationDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<FoundationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<ProgressState | null>(null);

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

  if (loading) return <p style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", marginTop: 40 }}>Töltés…</p>;
  if (!data) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>A Foundation program még nem érhető el.</p>;

  const { program, phases, playlist, joined, doneCount, currentIndex, todayCode } = data;
  const play = (code: string | null) => code && router.push(`/player/${code}?autostart=1`);

  const resumeMap = progress?.resume ?? {};
  const completedMap: Record<string, { at: string; atTime?: string }> = {};
  (progress?.completed ?? []).forEach((c) => (completedMap[c.code] = { at: typeof c.at === "string" ? c.at : "", atTime: c.atTime }));
  const resumeFrac = (mux: number | null, mins: number, code: string) =>
    resumeMap[code] != null ? Math.min(1, resumeMap[code] / ((mux || mins * 60) || 1)) : undefined;
  const programTotal = program.totalSessions || playlist.length;

  return (
    <div className="home fade-in">
      <Link href="/app" className="hrow-head" style={{ marginBottom: 4, textDecoration: "none", color: "var(--ink-2)", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
        <LxIcon d={lxPaths.arrowR} size={14} style={{ transform: "rotate(180deg)" }} /> Kezdőlap
      </Link>

      <section>
        <div className="pg-h" style={{ fontSize: 28 }}>{program.title} <span style={{ color: "var(--ink-3)", fontWeight: 600 }}>· {program.hu}</span></div>
        <p style={{ color: "var(--ink-2)", marginTop: 10, fontSize: 15, maxWidth: "60ch", lineHeight: 1.55 }}>{program.synopsis}</p>
      </section>

      {program.facts.length > 0 && (
        <div className="pg-facts">
          {program.facts.map((f) => (
            <div className="pg-fact" key={f.label}>
              <div className="fl">{f.label}</div>
              <div className="fv">{f.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="home-rows">
        {phases.map((ph) => (
          <section className="hrow-sec" key={ph.idx}>
            <div className="hrow-head">
              <h3>{ph.icon ? `${ph.icon} ` : ""}{ph.name || "Edzések"} <span style={{ color: "var(--ink-3)", fontWeight: 600, fontSize: 13 }}>· {ph.workouts.length} edzés</span></h3>
              {ph.workouts.some((w) => w.retest) && <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.06em", color: "var(--accent-2)", background: "var(--accent-soft)", padding: "3px 9px", borderRadius: 999 }}>VISSZAMÉRÉS</span>}
            </div>
            <div className="hrow">
              {ph.workouts.map((v) => (
                <WorkoutCard
                  key={v.code}
                  v={v}
                  isToday={v.code === todayCode}
                  isProgram
                  programStep={v.order + 1}
                  programTotal={programTotal}
                  resume={resumeFrac(v.muxDuration, v.mins, v.code)}
                  completedAt={completedMap[v.code] ? completedMap[v.code].at : null}
                  completedTime={completedMap[v.code]?.atTime ?? null}
                  saved={myList.has(v.code)}
                  onPlay={(c) => play(c)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {!joined && (
        <p className="mono" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
          {doneCount} / {program.totalSessions} kész · aktuális: {currentIndex + 1}.
        </p>
      )}
    </div>
  );
}
