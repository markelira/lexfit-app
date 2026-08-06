"use client";

import "./challenges.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { Button } from "@/components/Button";
import { BottomSheet } from "@/components/BottomSheet";
import { useIsMobile } from "@/lib/useIsMobile";
import { Rail } from "@/components/Rail";
import { ChallengeCard } from "@/components/ChallengeCard";
import { getMyList, setSaved } from "@/lib/mylist";
import {
  type ActiveChallengeFilters, type ChallengeCardData, type ChallengesData,
  daysBucket, emptyChallengeFilters, filterChallenges, loadChallenges,
} from "@/lib/challenges";

type SortKey = "newest" | "shortest";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "LEGÚJABB ELŐL" },
  { key: "shortest", label: "LEGRÖVIDEBB ELŐL" },
];

const STATE_OPTS = ["Elkezdetlen", "Folyamatban", "Kész"];
type ChipKey = keyof ActiveChallengeFilters;
const SYNC_DIMS: ChipKey[] = ["len", "theme", "state"];

function sameFilters(a: ActiveChallengeFilters, b: ActiveChallengeFilters): boolean {
  for (const k of SYNC_DIMS) {
    if (a[k].size !== b[k].size) return false;
    for (const v of a[k]) if (!b[k].has(v)) return false;
  }
  return true;
}
const cloneFilters = (f: ActiveChallengeFilters): ActiveChallengeFilters => ({
  len: new Set(f.len), theme: new Set(f.theme), state: new Set(f.state),
});

export default function ChallengesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ChallengesData | null>(null);
  const [failed, setFailed] = useState(false);
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<ActiveChallengeFilters>(emptyChallengeFilters);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const isMobile = useIsMobile();
  const [openChip, setOpenChip] = useState<string | null>(null);
  const [filterSheet, setFilterSheet] = useState(false);
  const [draft, setDraft] = useState<ActiveChallengeFilters>(emptyChallengeFilters);

  const searchParams = useSearchParams();
  useEffect(() => {
    const nextQ = searchParams.get("q") ?? "";
    setQ((prev) => (prev === nextQ ? prev : nextQ));
    setActive((prev) => {
      const next = emptyChallengeFilters();
      SYNC_DIMS.forEach((g) => {
        const val = searchParams.get(g);
        if (val) next[g] = new Set(val.split(","));
      });
      return sameFilters(prev, next) ? prev : next;
    });
  }, [searchParams]);

  useEffect(() => {
    loadChallenges(user?.uid ?? null).then(setData).catch(() => setFailed(true));
    if (user) getMyList(user.uid).then(setMyList).catch(() => {});
  }, [user]);

  const didMountWrite = useRef(false);
  useEffect(() => {
    if (!didMountWrite.current) { didMountWrite.current = true; return; }
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    SYNC_DIMS.forEach((g) => {
      if (active[g].size) p.set(g, [...active[g]].join(","));
    });
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `/app/challenges?${qs}` : "/app/challenges");
  }, [q, active]);

  useEffect(() => {
    if (!openChip) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element)?.closest?.(".ch-chip-wrap")) setOpenChip(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenChip(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openChip]);

  const toggle = (group: ChipKey, opt: string) =>
    setActive((a) => {
      const next = { ...a, [group]: new Set(a[group]) };
      next[group].has(opt) ? next[group].delete(opt) : next[group].add(opt);
      return next;
    });

  const activeCount = useMemo(() => active.len.size + active.theme.size + active.state.size, [active]);
  const searching = q.trim().length > 0;
  const resultsMode = searching || activeCount > 0;

  const results = useMemo(() => {
    if (!data) return [];
    let r = filterChallenges(data.challenges, active);
    if (searching) {
      const term = q.trim().toLowerCase();
      r = r.filter((c) => `${c.title} ${c.bodyPart} ${c.monthLabel}`.toLowerCase().includes(term));
    }
    // "newest" — loadChallenges already returns newest-first; only re-sort for shortest.
    return sort === "shortest" ? [...r].sort((a, b) => a.durationDays - b.durationDays) : r;
  }, [data, active, q, searching, sort]);

  async function toggleSave(slug: string) {
    if (!user) return;
    const has = myList.has(slug);
    setMyList((m) => {
      const n = new Set(m);
      has ? n.delete(slug) : n.add(slug);
      return n;
    });
    await setSaved(user.uid, slug, !has);
  }

  const clearAll = () => {
    setActive(emptyChallengeFilters());
    setQ("");
  };
  const openFilterSheet = () => { setDraft(cloneFilters(active)); setFilterSheet(true); };
  const draftToggle = (group: ChipKey, opt: string) =>
    setDraft((d) => {
      const next = { ...d, [group]: new Set(d[group]) };
      next[group].has(opt) ? next[group].delete(opt) : next[group].add(opt);
      return next;
    });
  const applyFilters = () => { setActive(draft); setFilterSheet(false); };

  const countWith = (f: ActiveChallengeFilters): number => {
    if (!data) return 0;
    let r = filterChallenges(data.challenges, f);
    const term = q.trim().toLowerCase();
    if (term) r = r.filter((c) => `${c.title} ${c.bodyPart} ${c.monthLabel}`.toLowerCase().includes(term));
    return r.length;
  };

  const openChallenge = (slug: string) => router.push(`/app/challenges/${slug}`);
  const cardOf = (c: ChallengeCardData, ribbon?: string) => (
    <ChallengeCard key={c.slug} c={c} saved={myList.has(c.slug)} ribbon={ribbon} onOpen={openChallenge} onToggleSave={toggleSave} />
  );

  if (failed) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>Nem sikerült betölteni a kihívásokat. Frissítsd az oldalt.</p>;
  if (!data) return <p style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", marginTop: 40 }}>Töltés…</p>;

  const inProgress = data.challenges.filter((c) => c.state === "folyamatban");
  const recent = data.challenges.slice(0, 10); // already newest-first
  const shortOnes = data.challenges.filter((c) => c.durationDays <= 7);

  const CHIP_DIMS: { key: ChipKey; label: string; icon?: string | string[]; options: string[] }[] = [
    { key: "len", label: "HOSSZ", icon: lxPaths.clock, options: data.filters.len?.options ?? [] },
    { key: "theme", label: "TESTRÉSZ", options: data.filters.theme?.options ?? [] },
    { key: "state", label: "ÁLLAPOT", icon: lxPaths.check, options: STATE_OPTS },
  ];

  const filterBar = (
    <div className="ch-filterbar">
      <div className="ch-chips">
        {CHIP_DIMS.map(({ key, label, icon, options }) => {
          const sel = [...active[key]];
          const chipLabel = sel.length === 0 ? label : sel.length === 1 ? sel[0].toUpperCase() : `${sel[0].toUpperCase()} +${sel.length - 1}`;
          return (
            <div className="ch-chip-wrap" key={key}>
              <button
                type="button"
                className={`ch-chip${sel.length ? " on" : ""}`}
                aria-expanded={openChip === key}
                onClick={() => (isMobile ? openFilterSheet() : setOpenChip((o) => (o === key ? null : key)))}
              >
                {icon && <LxIcon d={icon} size={12} />}
                {chipLabel} <LxIcon d={lxPaths.chevronDown} size={12} />
              </button>
              {openChip === key && !isMobile && (
                <div className="ch-chip-menu" role="menu">
                  {options.map((o) => {
                    const on = active[key].has(o);
                    return (
                      <button key={o} type="button" className={`ch-chip-opt${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggle(key, o)}>
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
      <div className="ch-chip-wrap ch-sort">
        <button
          type="button"
          className="ch-chip ghost"
          aria-expanded={openChip === "sort"}
          onClick={() => setOpenChip((o) => (o === "sort" ? null : "sort"))}
        >
          <LxIcon d={lxPaths.arrowR} size={12} style={{ transform: "rotate(90deg)" }} />
          {SORTS.find((s) => s.key === sort)!.label}
        </button>
        {openChip === "sort" && (
          <div className="ch-chip-menu right" role="menu">
            {SORTS.map((s) => (
              <button key={s.key} type="button" className={`ch-chip-opt${sort === s.key ? " on" : ""}`} onClick={() => { setSort(s.key); setOpenChip(null); }}>
                <span className="box">{sort === s.key && <LxIcon d={lxPaths.check} size={11} sw={3} />}</span>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const fbRow = data.fbGroupUrl && (
    <div className="ch-fb">
      <LxIcon d={lxPaths.users} size={18} />
      <div className="tx">
        <b>A szavazás a Facebook-csoportban zajlik.</b> Ott döntjük el, mi legyen a következő heti kihívás — itt pedig bármikor újra elővehető az összes eddigi.
      </div>
      <a className="ch-fb-btn" href={data.fbGroupUrl} target="_blank" rel="noopener noreferrer">Ugrás a csoportba</a>
    </div>
  );

  return (
    <div className="ch-page fade-in">
      <header className="ch-head">
        <div className="ch-head-row">
          <h1>Kihívások</h1>
          <span className="ch-eyebrow">Szavazz Magadra · {data.challenges.length} kihívás</span>
        </div>
        <p className="ch-lede">Minden heti kihívás, amit a csoportban végigcsináltunk. Bármelyiket elkezdheted, bármikor, a saját tempódban.</p>
      </header>

      {filterBar}

      {resultsMode ? (
        <>
          <div className={`ch-resmeta${results.length === 0 ? " is-empty" : ""}`}>
            <span className="ch-resmeta-count">{results.length === 0 ? "Nincs találat" : `${results.length} kihívás`}</span>
            <div className="ch-resmeta-chips">
              {(Object.entries(active) as [ChipKey, Set<string>][]).flatMap(([k, s]) =>
                [...s].map((o) => (
                  <button key={k + o} type="button" className="ch-fchip" onClick={() => toggle(k, o)}>
                    {o.toUpperCase()}
                    <LxIcon d={lxPaths.close} size={11} sw={2.4} />
                  </button>
                )),
              )}
              {(activeCount > 0 || searching) && (
                <button className="linkish" style={{ fontSize: 12.5 }} onClick={clearAll}>Törlés mind</button>
              )}
            </div>
          </div>
          {results.length === 0 ? (
            <div className="ch-empty">
              <span className="ic" aria-hidden="true"><LxIcon d={lxPaths.searchX} size={34} sw={1.9} /></span>
              <p className="t">Ehhez a szűréshez még nincs kihívás.</p>
              <p className="s">{searching ? `A „${q.trim()}” kifejezésre nincs kihívás.` : "Vegyél ki egy szűrőt."}</p>
              <div className="acts"><Button variant="secondary" onClick={clearAll}>Összes szűrő törlése</Button></div>
            </div>
          ) : (
            <div className="ch-grid">{results.map((c) => cardOf(c))}</div>
          )}
        </>
      ) : (
        <>
          {inProgress.length > 0 && (
            <Rail title="Folytatod" sub="ott veszed fel, ahol abbahagytad" items={inProgress} renderItem={(c) => cardOf(c)} />
          )}
          <Rail
            title="A legutóbbi hetek"
            sub="legújabb kihívások"
            items={recent}
            renderItem={(c) => cardOf(c, c.featured ? undefined : c === recent[0] ? "ÚJ" : undefined)}
          />
          {shortOnes.length > 0 && (
            <Rail title="Ha csak egy hetet vállalsz" sub="max. 7 nap" items={shortOnes} renderItem={(c) => cardOf(c)} />
          )}
        </>
      )}

      {fbRow}

      {isMobile && (
        <BottomSheet open={filterSheet} onClose={() => setFilterSheet(false)} ariaLabel="Szűrők">
          <div className="bsheet-head">
            <span className="rt">Szűrők</span>
            <button type="button" className="bsheet-clear" onClick={() => setDraft(emptyChallengeFilters())}>Törlés mind</button>
          </div>
          {CHIP_DIMS.map(({ key, label, options }) => (
            <div className="bsheet-sec" key={key}>
              <span className="lbl">{label}</span>
              <div className="bsheet-chips">
                {options.map((o) => {
                  const on = draft[key].has(o);
                  return (
                    <button key={o} type="button" className={`chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => draftToggle(key, o)}>
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="bsheet-foot">
            <Button size="l" variant="primary" fullWidth onClick={applyFilters}>{countWith(draft)} kihívás megnézése</Button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
