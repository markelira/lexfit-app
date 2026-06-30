"use client";

import "./library.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { NCard } from "@/components/NCard";
import { cardGrad, catWord } from "@/lib/categories";
import { getMyList, setSaved } from "@/lib/mylist";
import { getProgress } from "@/lib/progress";
import {
  type ActiveFilters, type LibVideo, type LibraryData, emptyFilters, filterVideos, loadLibrary,
} from "@/lib/library";

type SpotFilter = { group?: keyof ActiveFilters; opt?: string; kind?: "short" };
const LIB_SPOTS: { ey: string; title: string; theme: string; word: string; blurb: string; play: string; filter: SpotFilter }[] = [
  { ey: "A HÉT VÁLOGATÁSA", title: "Csendes esték", theme: "Mobility / nyújtás", word: "CSEND",
    blurb: "Amikor elalszik a ház, te akkor is mozoghatsz. Ugrálás és zaj nélküli edzések — a szomszéd se veszi észre.",
    play: "N003", filter: { group: "type", opt: "🔇 Csendes" } },
  { ey: "NINCS IDŐD? DE ENNYI VAN", title: "15 perc, ami belefér", theme: "Cardio + has", word: "GYORS",
    blurb: "A rövid edzés is edzés. Tizenöt perc, amit a napod bármelyik résébe becsúsztathatsz — kifogás nélkül.",
    play: "B007", filter: { kind: "short" } },
  { ey: "INDÍTSD MOZGÁSSAL", title: "Reggeli rituálé", theme: "Mobility / nyújtás", word: "REGGEL",
    blurb: "Pár perc átmozgatás ébredés után — és másképp indul az egész napod. Kíméletes, ébresztő flow-k.",
    play: "R001", filter: { group: "type", opt: "🌅 Reggeli" } },
];

const RAIL_FILTER: Record<string, SpotFilter> = {
  "Csendben is megy": { group: "type", opt: "🔇 Csendes" },
  "Erősödő alsótest": { group: "theme", opt: "Alsótest" },
  "Felsőtest & kar": { group: "theme", opt: "Felsőtest" },
  "Cardio + has": { group: "theme", opt: "Cardio + has" },
  "Teljes test, fél óra": { group: "theme", opt: "Teljes test" },
  "Reggeli rituálé": { group: "type", opt: "🌅 Reggeli" },
  "Mobility & nyújtás": { group: "theme", opt: "Mobility / nyújtás" },
  "Tartás-fókusz": { group: "theme", opt: "Tartás-fókusz" },
  "Falra fogva": { group: "type", opt: "🪑 Falra fogva" },
  "15 perc, ami belefér": { kind: "short" },
};

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

  const [spot, setSpot] = useState(0);
  const browseFrom = (f?: SpotFilter) => {
    if (!f) return;
    if (f.kind === "short") setActive((a) => ({ ...a, dur: new Set(["5–15 perc"]) }));
    else if (f.group && f.opt) setActive((a) => ({ ...a, [f.group!]: new Set([f.opt!]) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const resumeOf = (v: LibVideo) =>
    resumeMap[v.code] != null ? Math.min(1, resumeMap[v.code] / ((v.muxDuration || v.mins * 60) || 1)) : undefined;
  const card = (v: LibVideo, browse = false) => (
    <NCard
      key={v.code}
      v={v}
      resume={resumeOf(v)}
      saved={myList.has(v.code)}
      onToggleSave={() => toggleSave(v.code)}
      onPlay={(c) => router.push(`/player/${c}`)}
      pool={data?.videos ?? []}
      browse={browse}
    />
  );

  if (failed) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>Nem sikerült betölteni a videótárat. Frissítsd az oldalt.</p>;
  if (!data) return <p style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", marginTop: 40 }}>Töltés…</p>;

  const byTheme = (t: string) => data.videos.filter((v) => v.theme === t);
  const byType = (t: string) => data.videos.filter((v) => v.types.includes(t));
  const byPhase = (p: number | null) => data.videos.filter((v) => v.phase === p);
  const rails: { title: string; sub?: string; v: LibVideo[] }[] = [
    { title: "A te fázisod · 🔨 Építés", sub: "a mostani heteid", v: byPhase(1) },
    { title: "Csendben is megy", sub: "🔇 szomszéd-barát", v: byType("🔇 Csendes") },
    { title: "15 perc, ami belefér", sub: "gyors rutinok", v: data.videos.filter((x) => x.mins <= 15) },
    { title: "Erősödő alsótest", sub: "comb · fenék", v: byTheme("Alsótest") },
    { title: "Felsőtest & kar", v: byTheme("Felsőtest") },
    { title: "Cardio + has", sub: "pulzus fel", v: byTheme("Cardio + has") },
    { title: "Teljes test, fél óra", v: byTheme("Teljes test") },
    { title: "Reggeli rituálé", sub: "🌅 indítsd mozgással", v: byType("🌅 Reggeli") },
    { title: "Esti levezetés", sub: "🌙 lazíts el", v: data.videos.filter((x) => x.types.includes("🌙 Esti") || x.types.includes("🧘 Lazító")) },
    { title: "Mobility & nyújtás", v: byTheme("Mobility / nyújtás") },
    { title: "Tartás-fókusz", sub: "egyenes hát", v: byTheme("Tartás-fókusz") },
    { title: "Falra fogva", sub: "🪑 támaszkodj rá", v: byType("🪑 Falra fogva") },
    { title: "Kihívások & bónusz", sub: "a programon túl", v: byPhase(null) },
    { title: "Haladóknak", sub: "🔥🔥🔥 ha készen állsz", v: data.videos.filter((x) => x.level === 3) },
  ];

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

      {resultsMode ? (
        <>
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
          {results.length === 0 ? (
            <div className="card" style={{ padding: "48px 40px", textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 700 }}>Ilyen kombináció még nincs.</p>
              <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>Vegyél ki egy szűrőt.</p>
              <button className="btn ghost" style={{ marginTop: 18 }} onClick={clearAll}>Szűrők törlése</button>
            </div>
          ) : (
            <div className="lib-grid">{results.map((v) => card(v, true))}</div>
          )}
        </>
      ) : (
        <>
          <LibSpotlight
            spot={spot}
            setSpot={setSpot}
            count={(t) => byTheme(t).length}
            onPlay={(c) => router.push(`/player/${c}`)}
            onBrowse={browseFrom}
          />
          {rails.filter((r) => r.v.length > 0).map((r) => (
            <NxRail
              key={r.title}
              title={r.title}
              sub={r.sub}
              videos={r.v}
              renderCard={(v) => card(v, true)}
              onAll={RAIL_FILTER[r.title] ? () => browseFrom(RAIL_FILTER[r.title]) : undefined}
            />
          ))}
        </>
      )}
    </div>
  );
}

function LibSpotlight({
  spot, setSpot, count, onPlay, onBrowse,
}: {
  spot: number; setSpot: (n: number | ((i: number) => number)) => void;
  count: (theme: string) => number; onPlay: (code: string) => void; onBrowse: (f: SpotFilter) => void;
}) {
  const s = LIB_SPOTS[spot];
  useEffect(() => {
    const t = setInterval(() => setSpot((i) => (i + 1) % LIB_SPOTS.length), 7000);
    return () => clearInterval(t);
  }, [setSpot]);
  return (
    <section className="lib-spot">
      <div className="art" style={{ background: cardGrad(s.theme) }}>
        <span className="ring" />
        <span className="word">{s.word}</span>
      </div>
      <span className="scrim" />
      <div className="content">
        <div className="ey">{s.ey}</div>
        <h2>{s.title}</h2>
        <p>{s.blurb}</p>
        <div className="ctas">
          <button className="nhb-playw" onClick={() => onPlay(s.play)}>
            <LxIcon d={lxPaths.play} size={18} fill /> Lejátszás
          </button>
          <button className="nhb-info" onClick={() => onBrowse(s.filter)}>Böngészd a válogatást</button>
        </div>
        <div className="lib-spot-dots">
          {LIB_SPOTS.map((x, j) => (
            <button key={x.title} className={j === spot ? "on" : ""} onClick={() => setSpot(j)} aria-label={x.title} />
          ))}
        </div>
      </div>
      <span className="count">{count(s.theme)} edzés a témában</span>
    </section>
  );
}

function NxRail({
  title, sub, videos, renderCard, onAll,
}: {
  title: string; sub?: string; videos: LibVideo[];
  renderCard: (v: LibVideo) => React.ReactNode; onAll?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const upd = () => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };
  useEffect(() => { upd(); }, [videos]);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  if (!videos.length) return null;
  return (
    <section className="nxrail-sec">
      <div className="nxrail-head">
        <h3>{title}</h3>
        {sub && <span className="sub">{sub}</span>}
        {onAll && <button className="all" onClick={onAll}>Mind ({videos.length}) <LxIcon d={lxPaths.arrowR} size={14} /></button>}
      </div>
      <div className="nxrail-wrap">
        <button className="nxrail-btn l" disabled={atStart} onClick={() => scroll(-1)} aria-label="Vissza">
          <span><LxIcon d={lxPaths.arrowR} size={17} style={{ transform: "rotate(180deg)" }} /></span>
        </button>
        <div className="nxrail" ref={ref} onScroll={upd}>
          {videos.map((v) => renderCard(v))}
        </div>
        <button className="nxrail-btn r" disabled={atEnd} onClick={() => scroll(1)} aria-label="Tovább">
          <span><LxIcon d={lxPaths.arrowR} size={17} /></span>
        </button>
      </div>
    </section>
  );
}
