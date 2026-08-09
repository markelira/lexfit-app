"use client";

import "./library.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { WorkoutCard } from "@/components/WorkoutCard";
import { Button } from "@/components/Button";
import { BottomSheet } from "@/components/BottomSheet";
import { MobileWorkoutSheet, type SheetVideo } from "@/components/MobileWorkoutSheet";
import { useIsMobile } from "@/lib/useIsMobile";
import { Rail } from "@/components/Rail";
import { cardGrad, catOf } from "@/lib/categories";
import { getMyList, setSaved } from "@/lib/mylist";
import { getProgress } from "@/lib/progress";
import {
  type ActiveFilters, type LibVideo, type LibraryData, emptyFilters, filterVideos, loadLibrary,
} from "@/lib/library";
import { loadProgramIndex, type ProgramIndex } from "@/lib/program-index";

type SpotFilter = { group?: keyof ActiveFilters; opt?: string; kind?: "short" };
const LIB_SPOTS: { ey: string; title: string; theme: string; word: string; blurb: string; play: string; filter: SpotFilter }[] = [
  { ey: "A HÉT VÁLOGATÁSA", title: "Csendes esték", theme: "Mobilitás / nyújtás", word: "CSEND",
    blurb: "Amikor elalszik a ház, te akkor is mozoghatsz. Ugrálás és zaj nélküli edzések — a szomszéd se veszi észre.",
    play: "N003", filter: { group: "type", opt: "🔇 Csendes" } },
  { ey: "NINCS IDŐD? DE ENNYI VAN", title: "15 perc, ami belefér", theme: "Kardió + has", word: "GYORS",
    blurb: "A rövid edzés is edzés. Tizenöt perc, amit a napod bármelyik résébe becsúsztathatsz — kifogás nélkül.",
    play: "B007", filter: { kind: "short" } },
  { ey: "INDÍTSD MOZGÁSSAL", title: "Reggeli rituálé", theme: "Mobilitás / nyújtás", word: "REGGEL",
    blurb: "Pár perc átmozgatás ébredés után — és másképp indul az egész napod. Kíméletes, ébresztő flow-k.",
    play: "R001", filter: { group: "type", opt: "🌅 Reggeli" } },
];

const RAIL_FILTER: Record<string, SpotFilter> = {
  "Csendben is megy": { group: "type", opt: "🔇 Csendes" },
  "Erősödő alsótest": { group: "theme", opt: "Alsótest" },
  "Felsőtest & kar": { group: "theme", opt: "Felsőtest" },
  "Kardió + has": { group: "theme", opt: "Kardió + has" },
  "Teljes test, fél óra": { group: "theme", opt: "Teljes test" },
  "Reggeli rituálé": { group: "type", opt: "🌅 Reggeli" },
  "Mobilitás & nyújtás": { group: "theme", opt: "Mobilitás / nyújtás" },
  "Tartás-fókusz": { group: "theme", opt: "Tartás-fókusz" },
  "Falra fogva": { group: "type", opt: "🪑 Falra fogva" },
  "15 perc, ami belefér": { kind: "short" },
};

// Only the two must-have filter dimensions live on the bar. Everything
// rarer was cut — intensity/type/phase/format added noise without pulling weight.
const CHIP_DIMS: { key: keyof ActiveFilters; label: string; icon?: string | string[] }[] = [
  { key: "dur", label: "HOSSZ", icon: lxPaths.clock },
  { key: "theme", label: "TESTRÉSZ" },
];
const CHIP_KEYS = ["dur", "theme"];
// Leading icon for a restated active-filter pill, keyed by dimension.
const CHIP_ICON: Partial<Record<keyof ActiveFilters, string | string[]>> = {
  dur: lxPaths.clock,
  level: lxPaths.flame,
};

// Dimensions that round-trip through the URL (§20.2 C2).
const SYNC_DIMS: (keyof ActiveFilters)[] = ["phase", "theme", "dur", "level", "format", "type"];

// Value equality for two filter sets — lets the URL-read effect bail out (return the
// same reference) when nothing changed, so it can't loop against the URL-write effect.
// (This Next version patches history.replaceState → useSearchParams updates, so an
//  unguarded read effect would re-fire on every write and re-render forever.)
function sameFilters(a: ActiveFilters, b: ActiveFilters): boolean {
  for (const k of SYNC_DIMS) {
    if (a[k].size !== b[k].size) return false;
    for (const v of a[k]) if (!b[k].has(v)) return false;
  }
  return true;
}

export default function LibraryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<LibraryData | null>(null);
  const [failed, setFailed] = useState(false);
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<ActiveFilters>(emptyFilters);
  const [q, setQ] = useState("");
  const [resumeMap, setResumeMap] = useState<Record<string, number>>({});
  const isMobile = useIsMobile();
  const [filterSheet, setFilterSheet] = useState(false);
  const [draft, setDraft] = useState<ActiveFilters>(emptyFilters);
  const [sheetVideo, setSheetVideo] = useState<SheetVideo | null>(null);
  const [openChip, setOpenChip] = useState<string | null>(null); // desktop chip dropdown
  const [pindex, setPindex] = useState<ProgramIndex | null>(null);

  // Read the search + filter state from the URL (top-bar search / quick filters).
  // Reactive so a shell search while already on the library updates the page.
  const searchParams = useSearchParams();
  useEffect(() => {
    const nextQ = searchParams.get("q") ?? "";
    setQ((prev) => (prev === nextQ ? prev : nextQ));
    setActive((prev) => {
      const next = emptyFilters();
      SYNC_DIMS.forEach((g) => {
        const val = searchParams.get(g);
        if (val) next[g] = new Set(val.split(","));
      });
      // Return the SAME reference when unchanged → React bails, no re-render, no loop.
      return sameFilters(prev, next) ? prev : next;
    });
  }, [searchParams]);

  useEffect(() => {
    loadLibrary().then(setData).catch(() => setFailed(true));
    loadProgramIndex().then(setPindex).catch(() => {});
    if (user) {
      getMyList(user.uid).then(setMyList).catch(() => {});
      getProgress(user.uid).then((p) => p && setResumeMap(p.resume ?? {})).catch(() => {});
    }
  }, [user]);

  // Program membership (playlists are the source): eyebrow for mixed rails,
  // brand hue for the cover everywhere.
  const memberOf = (code: string) => {
    const slug = pindex?.programOfVideo[code];
    return slug ? pindex?.bySlug[slug] ?? null : null;
  };
  const badgeFor = (code: string) => {
    const p = memberOf(code);
    return p ? { slug: p.slug, name: p.hu || p.title } : null;
  };

  // Keep the URL meaningful — q + filter state (§20.2 C2). Linkable, analytics-legible.
  // Skip the mount write so it can't wipe params we were opened with (e.g. ?q= from the
  // shell search) before the read effect above has applied them.
  const didMountWrite = useRef(false);
  useEffect(() => {
    if (!didMountWrite.current) { didMountWrite.current = true; return; }
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    SYNC_DIMS.forEach((g) => {
      if (active[g].size) p.set(g, [...active[g]].join(","));
    });
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `/app/library?${qs}` : "/app/library");
  }, [q, active]);

  // Close a chip dropdown on outside-click / Escape.
  useEffect(() => {
    if (!openChip) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element)?.closest?.(".lib-chip-wrap")) setOpenChip(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenChip(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openChip]);

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
  // Only spotlight cards whose "Lejátszás" target actually exists in the
  // loaded library — the codes are curated, and on fresh prod content they
  // may not have been uploaded (a dead play button would 404).
  const spots = useMemo(
    () => LIB_SPOTS.filter((s) => (data?.videos ?? []).some((v) => v.code === s.play)),
    [data],
  );
  const browseFrom = (f?: SpotFilter) => {
    if (!f) return;
    if (f.kind === "short") setActive((a) => ({ ...a, dur: new Set(["5–15 perc"]) }));
    else if (f.group && f.opt) setActive((a) => ({ ...a, [f.group!]: new Set([f.opt!]) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const resumeOf = (v: LibVideo) =>
    resumeMap[v.code] != null ? Math.min(1, resumeMap[v.code] / ((v.muxDuration || v.mins * 60) || 1)) : undefined;

  // Mobile: card/row tap opens the detail sheet; desktop plays directly (§M4).
  const openOrPlay = (code: string) => {
    const v = data?.videos.find((x) => x.code === code);
    if (isMobile && v) setSheetVideo(v as SheetVideo);
    else router.push(`/player/${code}?autostart=1`);
  };

  // Filter bottom sheet — draft state, count updates live, applies on confirm (§1.5).
  const cloneFilters = (f: ActiveFilters): ActiveFilters => ({
    phase: new Set(f.phase), theme: new Set(f.theme), dur: new Set(f.dur),
    level: new Set(f.level), format: new Set(f.format), type: new Set(f.type),
  });
  const openFilterSheet = () => { setDraft(cloneFilters(active)); setFilterSheet(true); };
  const draftToggle = (group: keyof ActiveFilters, opt: string) =>
    setDraft((d) => {
      const next = { ...d, [group]: new Set(d[group]) };
      next[group].has(opt) ? next[group].delete(opt) : next[group].add(opt);
      return next;
    });
  const applyFilters = () => { setActive(draft); setFilterSheet(false); };

  // Count results under a hypothetical filter set (for the sheet's live count and the
  // no-results "which filter caused it" suggestion — §0.9).
  const countWith = (f: ActiveFilters): number => {
    if (!data) return 0;
    let r = filterVideos(data.videos, f, data.filters);
    const term = q.trim().toLowerCase();
    if (term) r = r.filter((v) => `${v.title} ${v.code} ${v.theme} ${v.types.join(" ")}`.toLowerCase().includes(term));
    return r.length;
  };

  // withBadge=false inside a program's own rail — the rail title already names it.
  const card = (v: LibVideo, withBadge = true) => (
    <WorkoutCard
      key={v.code}
      v={v}
      isProgram={v.phase != null}
      programBadge={withBadge ? badgeFor(v.code) : null}
      programHue={memberOf(v.code)?.hue ?? null}
      resume={resumeOf(v)}
      saved={myList.has(v.code)}
      onToggleSave={toggleSave}
      onPlay={openOrPlay}
    />
  );

  if (failed) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>Nem sikerült betölteni a videótárat. Frissítsd az oldalt.</p>;
  if (!data) return <p style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", marginTop: 40 }}>Töltés…</p>;

  const byTheme = (t: string) => data.videos.filter((v) => v.theme === t);
  const byType = (t: string) => data.videos.filter((v) => v.types.includes(t));
  const byPhase = (p: number | null) => data.videos.filter((v) => v.phase === p);

  // Category tile → applies one theme filter and enters results mode (§20.3).
  const selectCategory = (theme: string) => {
    setActive((a) => ({ ...a, theme: new Set([theme]) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const activeTheme = active.theme.size === 1 ? [...active.theme][0] : null;
  const resumed = data.videos.filter((v) => (resumeMap[v.code] ?? 0) > 0);

  // One rail per published program, in catalog order, videos in playlist order.
  const libByCode = new Map(data.videos.map((v) => [v.code, v]));
  const programRails = (pindex?.programs ?? [])
    .map((p) => ({ p, v: p.codes.map((c) => libByCode.get(c)).filter(Boolean) as LibVideo[] }))
    .filter((r) => r.v.length > 0);
  const rails: { title: string; sub?: string; v: LibVideo[] }[] = [
    ...(resumed.length ? [{ title: "Folytatás", sub: "ott veszed fel, ahol abbahagytad", v: resumed }] : []),
    { title: "A te fázisod · 🔨 Építés", sub: "a mostani heteid", v: byPhase(1) },
    { title: "Csendben is megy", sub: "🔇 szomszéd-barát", v: byType("🔇 Csendes") },
    { title: "15 perc, ami belefér", sub: "gyors rutinok", v: data.videos.filter((x) => x.mins <= 15) },
    { title: "Erősödő alsótest", sub: "comb · fenék", v: byTheme("Alsótest") },
    { title: "Felsőtest & kar", v: byTheme("Felsőtest") },
    { title: "Kardió + has", sub: "pulzus fel", v: byTheme("Kardió + has") },
    { title: "Teljes test, fél óra", v: byTheme("Teljes test") },
    { title: "Reggeli rituálé", sub: "🌅 indítsd mozgással", v: byType("🌅 Reggeli") },
    { title: "Esti levezetés", sub: "🌙 lazíts el", v: data.videos.filter((x) => x.types.includes("🌙 Esti") || x.types.includes("🧘 Lazító")) },
    { title: "Mobilitás & nyújtás", v: byTheme("Mobilitás / nyújtás") },
    { title: "Tartás-fókusz", sub: "egyenes hát", v: byTheme("Tartás-fókusz") },
    { title: "Falra fogva", sub: "🪑 támaszkodj rá", v: byType("🪑 Falra fogva") },
    { title: "Kihívások & bónusz", sub: "a programon túl", v: byPhase(null) },
    { title: "Haladóknak", sub: "🔥🔥🔥 ha készen állsz", v: data.videos.filter((x) => x.level === 3) },
  ];

  // Visible filter chips (§20.2 C1) + the Szűrők overflow panel. Renders under the
  // category tiles in browse mode, and at the top in results mode. Mobile: a
  // horizontally scrolling strip that never collapses.
  const filterControls = (
    <>
      <div className="lib-filterbar">
        <div className="lib-chips">
          {CHIP_DIMS.map(({ key, label, icon }) => {
            const sel = [...active[key]];
            const chipLabel = sel.length === 0 ? label : sel.length === 1 ? sel[0].toUpperCase() : `${sel[0].toUpperCase()} +${sel.length - 1}`;
            return (
              <div className="lib-chip-wrap" key={key}>
                <button
                  type="button"
                  className={`lib-chip${sel.length ? " on" : ""}`}
                  aria-expanded={openChip === key}
                  onClick={() => (isMobile ? openFilterSheet() : setOpenChip((o) => (o === key ? null : key)))}
                >
                  {icon && <LxIcon d={icon} size={12} />}
                  {chipLabel} <LxIcon d={lxPaths.chevronDown} size={12} />
                </button>
                {openChip === key && !isMobile && data.filters[key] && (
                  <div className="lib-chip-menu" role="menu">
                    {data.filters[key].options.map((o) => {
                      const on = active[key].has(o);
                      return (
                        <button key={o} type="button" className={`lib-chip-opt${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggle(key, o)}>
                          <span className="box">{on && <LxIcon d={lxPaths.check} size={11} sw={3} />}</span>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className="lib-page fade-in">
      {resultsMode ? (
        <>
          {filterControls}
          {activeTheme && (
            <div className="lib-catbanner" style={{ "--cat": catOf(activeTheme).c } as React.CSSProperties}>
              <button type="button" className="lib-crumb" onClick={clearAll}>
                <LxIcon d={lxPaths.arrowR} size={14} style={{ transform: "rotate(180deg)" }} /> Videótár
              </button>
              <h1>{activeTheme}</h1>
              <span className="cnt">{results.length} edzés</span>
            </div>
          )}
          <div className={`lib-resmeta${results.length === 0 ? " is-empty" : ""}`}>
            {results.length === 0 ? (
              <span className="lib-resmeta-none">Nincs találat</span>
            ) : (
              <span className="lib-resmeta-count">{results.length} találat</span>
            )}
            <div className="lib-resmeta-chips">
              {Object.entries(active).flatMap(([k, s]) =>
                [...s].map((o) => (
                  <button key={k + o} type="button" className="lib-fchip" onClick={() => toggle(k as keyof ActiveFilters, o)}>
                    {CHIP_ICON[k as keyof ActiveFilters] && <LxIcon d={CHIP_ICON[k as keyof ActiveFilters]!} size={12} />}
                    {o.toUpperCase()}
                    <LxIcon d={lxPaths.close} size={11} sw={2.4} />
                  </button>
                )),
              )}
              <button className="linkish" style={{ fontSize: 12.5 }} onClick={clearAll}>Törlés mind</button>
            </div>
          </div>
          {results.length === 0 ? (
            (() => {
              const opts = (Object.entries(active) as [keyof ActiveFilters, Set<string>][]).flatMap(([g, s]) =>
                [...s].map((opt) => ({ g, opt })),
              );
              let best: { g: keyof ActiveFilters; opt: string; n: number } | null = null;
              for (const { g, opt } of opts) {
                const trial = { ...active, [g]: new Set([...active[g]].filter((o) => o !== opt)) } as ActiveFilters;
                const n = countWith(trial);
                if (n > 0 && (!best || n > best.n)) best = { g, opt, n };
              }
              return (
                <div className="lib-empty">
                  <span className="ic" aria-hidden="true"><LxIcon d={lxPaths.searchX} size={34} sw={1.9} /></span>
                  {best ? (
                    <>
                      <p className="t">Ehhez a szűréshez még nincs edzés.</p>
                      <p className="s">A „{best.opt}” szűrő nélkül {best.n} edzés van.</p>
                      <div className="acts">
                        <Button variant="primary" onClick={() => toggle(best!.g, best!.opt)}>A {best.n} edzés megnézése</Button>
                        <Button variant="secondary" onClick={clearAll}>Összes szűrő törlése</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="t">Nincs találat.</p>
                      <p className="s">{q.trim() ? `A „${q.trim()}” kifejezésre nincs edzés.` : "Vegyél ki egy szűrőt."}</p>
                      <div className="acts"><Button variant="secondary" onClick={clearAll}>Keresés törlése</Button></div>
                    </>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="lib-grid">{results.map((v) => card(v))}</div>
          )}
        </>
      ) : (
        <>
          {spots.length > 0 && (
            <LibSpotlight
              spots={spots}
              spot={Math.min(spot, spots.length - 1)}
              setSpot={setSpot}
              count={(t) => byTheme(t).length}
              onPlay={(c) => router.push(`/player/${c}?autostart=1`)}
              onBrowse={browseFrom}
            />
          )}

          {/* Kategóriák — the one browse element that navigates (applies a filter), not plays (§20.3) */}
          <section className="lib-cats">
            <h2 className="lib-cats-h">Kategóriák</h2>
            <div className="lib-cattiles">
              {["Alsótest", "Felsőtest", "Kardió + has", "Teljes test", "Mobilitás / nyújtás", "Tartás-fókusz"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className="lib-cattile"
                  style={{ "--cat": catOf(t).c } as React.CSSProperties}
                  onClick={() => selectCategory(t)}
                >
                  <span className="band" aria-hidden="true" />
                  <span className="nm">{t}</span>
                  <span className="cnt">{byTheme(t).length} edzés</span>
                </button>
              ))}
            </div>
          </section>

          {filterControls}

          {/* Programok — one rail per published program, playlist order. */}
          {programRails.length > 0 && (
            <section className="lib-cats" style={{ marginBottom: 0 }}>
              <h2 className="lib-cats-h">Programok</h2>
            </section>
          )}
          {programRails.map(({ p, v }) => (
            <Rail
              key={p.slug}
              title={p.hu || p.title}
              sub={`${v.length} edzés · a program sorrendjében`}
              items={v}
              renderItem={(v) => card(v, false)}
              onAll={() => router.push(`/app/program/${p.slug}`)}
            />
          ))}

          {/* Editorial rows: at most three (§20.2 C3). Rest reachable via tiles + chips. */}
          {rails
            .filter((r) => ["A te fázisod · 🔨 Építés", "15 perc, ami belefér", "Csendben is megy"].includes(r.title) && r.v.length > 0)
            .map((r) => (
              <Rail
                key={r.title}
                title={r.title}
                sub={r.sub}
                items={r.v}
                renderItem={(v) => card(v)}
                onAll={RAIL_FILTER[r.title] ? () => browseFrom(RAIL_FILTER[r.title]) : undefined}
              />
            ))}

          {/* Minden edzés — the complete library, so no video is unreachable in browse. */}
          <Rail
            title="Minden edzés"
            sub={`${data.videos.length} videó`}
            items={data.videos}
            renderItem={(v) => card(v)}
          />
        </>
      )}

      {isMobile && (
        <BottomSheet open={filterSheet} onClose={() => setFilterSheet(false)} ariaLabel="Szűrők">
          <div className="bsheet-head">
            <span className="rt">Szűrők</span>
            <button type="button" className="bsheet-clear" onClick={() => setDraft(emptyFilters())}>Törlés mind</button>
          </div>
          {Object.entries(data.filters)
            .filter(([key]) => CHIP_KEYS.includes(key))
            .sort((a, b) => a[1].order - b[1].order)
            .map(([key, g]) => (
              <div className="bsheet-sec" key={key}>
                <span className="lbl">{g.label}</span>
                <div className="bsheet-chips">
                  {g.options.map((o) => {
                    const on = draft[key as keyof ActiveFilters].has(o);
                    return (
                      <button key={o} type="button" className={`chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => draftToggle(key as keyof ActiveFilters, o)}>
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          <div className="bsheet-foot">
            <Button size="l" variant="primary" fullWidth onClick={applyFilters}>{countWith(draft)} találat megnézése</Button>
          </div>
        </BottomSheet>
      )}

      <MobileWorkoutSheet
        v={sheetVideo}
        programHue={sheetVideo ? memberOf(sheetVideo.code)?.hue ?? null : null}
        saved={sheetVideo ? myList.has(sheetVideo.code) : false}
        onPlay={(c) => { setSheetVideo(null); router.push(`/player/${c}?autostart=1`); }}
        onToggleSave={toggleSave}
        onClose={() => setSheetVideo(null)}
      />
    </div>
  );
}

function LibSpotlight({
  spots, spot, setSpot, count, onPlay, onBrowse,
}: {
  spots: typeof LIB_SPOTS; spot: number; setSpot: (n: number | ((i: number) => number)) => void;
  count: (theme: string) => number; onPlay: (code: string) => void; onBrowse: (f: SpotFilter) => void;
}) {
  const s = spots[spot];
  // The spotlight does NOT auto-advance (§20.6) — carousels that move on their own
  // lose the user's place. The dots stay; the user drives.
  return (
    <section className="lib-spot">
      <div className="art" style={{ background: cardGrad(s.theme) }}>
        <span className="ring" />
        <span className="word">{s.word}</span>
      </div>
      <span className="scrim" />
      <span className="vig" />
      <div className="content">
        <div className="ey">{s.ey}</div>
        <h2>{s.title}</h2>
        <p>{s.blurb}</p>
        <div className="ctas">
          <Button size="m" variant="primary" onDark iconLeft={lxPaths.play} onClick={() => onPlay(s.play)}>Lejátszás</Button>
          <Button size="m" variant="secondary" onDark onClick={() => onBrowse(s.filter)}>Böngészd a válogatást</Button>
        </div>
        <div className="lib-spot-dots">
          {spots.map((x, j) => (
            <button key={x.title} className={j === spot ? "on" : ""} onClick={() => setSpot(j)} aria-label={x.title} />
          ))}
        </div>
      </div>
      <span className="count">{count(s.theme)} edzés a témában</span>
    </section>
  );
}

