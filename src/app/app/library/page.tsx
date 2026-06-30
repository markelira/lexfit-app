"use client";

import "./library.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { NCard } from "@/components/NCard";
import { getMyList, setSaved } from "@/lib/mylist";
import { getProgress } from "@/lib/progress";
import {
  type ActiveFilters, type LibraryData, emptyFilters, filterVideos, loadLibrary,
} from "@/lib/library";

export default function LibraryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<LibraryData | null>(null);
  const [failed, setFailed] = useState(false);
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<ActiveFilters>(emptyFilters);
  const [q, setQ] = useState("");
  const [refine, setRefine] = useState(false);
  const [resumeMap, setResumeMap] = useState<Record<string, number>>({});

  useEffect(() => {
    loadLibrary().then(setData).catch(() => setFailed(true));
    if (user) {
      getMyList(user.uid).then(setMyList).catch(() => {});
      getProgress(user.uid).then((p) => p && setResumeMap(p.resume ?? {})).catch(() => {});
    }
  }, [user]);

  const toggle = (group: keyof ActiveFilters, opt: string) =>
    setActive((a) => {
      const next = { ...a, [group]: new Set(a[group]) };
      next[group].has(opt) ? next[group].delete(opt) : next[group].add(opt);
      return next;
    });

  const activeCount = useMemo(
    () => Object.values(active).reduce((n, s) => n + s.size, 0),
    [active],
  );
  const searching = q.trim().length > 0;
  const resultsMode = searching || activeCount > 0;

  const results = useMemo(() => {
    if (!data) return [];
    let r = filterVideos(data.videos, active, data.filters);
    if (searching) {
      const term = q.trim().toLowerCase();
      r = r.filter((v) =>
        `${v.title} ${v.code} ${v.theme} ${v.types.join(" ")}`.toLowerCase().includes(term),
      );
    }
    return r;
  }, [data, active, q, searching]);

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

  const clearAll = () => {
    setActive(emptyFilters());
    setQ("");
  };

  if (failed) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>Nem sikerült betölteni a videótárat. Frissítsd az oldalt.</p>;
  if (!data) return <p style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", marginTop: 40 }}>Töltés…</p>;

  return (
    <div className="lib-page fade-in">
      <div className="lib-bar">
        <div>
          <div className="mono">{data.videos.length} VIDEÓ · F · B · R · T · N · M</div>
          <h1>Videótár</h1>
        </div>
        <div className="lib-search">
          <LxIcon d={lxPaths.search} size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keresés cím, kód, kategória…" />
          {searching && <button className="clr" onClick={() => setQ("")} aria-label="Törlés">×</button>}
        </div>
        <button className={`lib-refine${refine || activeCount ? " on" : ""}`} onClick={() => setRefine((r) => !r)}>
          <LxIcon d={lxPaths.filter} size={15} /> Szűrők
          {activeCount > 0 && <span className="cnt">{activeCount}</span>}
        </button>
      </div>

      {refine && (
        <div className="lib-refinepanel">
          {Object.entries(data.filters)
            .sort((a, b) => a[1].order - b[1].order)
            .map(([key, g]) => (
              <div key={key}>
                <div className="frail-hd">{g.label.toUpperCase()}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {g.options.map((o) => {
                    const on = active[key as keyof ActiveFilters].has(o);
                    return (
                      <button key={o} className={`frail-opt${on ? " on" : ""}`} onClick={() => toggle(key as keyof ActiveFilters, o)}>
                        <span className="box">{on && <LxIcon d={lxPaths.check} size={11} sw={3} />}</span>
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {resultsMode && (
        <div className="lib-resmeta">
          <span style={{ fontSize: 13.5, color: "var(--ink-2)", fontWeight: 600 }}>{results.length} találat</span>
          {Object.entries(active).flatMap(([k, s]) =>
            [...s].map((o) => (
              <button key={k + o} className="chip on" style={{ fontSize: 12.5, padding: "5px 11px" }} onClick={() => toggle(k as keyof ActiveFilters, o)}>
                {o} ✕
              </button>
            )),
          )}
          <button className="linkish" style={{ fontSize: 12.5 }} onClick={clearAll}>Törlés mind</button>
        </div>
      )}

      {results.length === 0 ? (
        <div className="card" style={{ padding: "48px 40px", textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 700 }}>Ilyen kombináció még nincs.</p>
          <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>Vegyél ki egy szűrőt.</p>
          <button className="btn ghost" style={{ marginTop: 18 }} onClick={clearAll}>Szűrők törlése</button>
        </div>
      ) : (
        <div className="lib-grid">
          {results.map((v) => (
            <NCard
              key={v.code}
              v={v}
              resume={resumeMap[v.code] != null ? Math.min(1, resumeMap[v.code] / ((v.muxDuration || v.mins * 60) || 1)) : undefined}
              saved={myList.has(v.code)}
              onToggleSave={() => toggleSave(v.code)}
              onPlay={(c) => router.push(`/player/${c}`)}
              pool={data.videos}
              browse
            />
          ))}
        </div>
      )}
    </div>
  );
}
