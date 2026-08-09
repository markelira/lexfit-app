"use client";

import "../foundation.css";
import "../home.css";
import "./programs.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getProgress } from "@/lib/progress";
import { Button } from "@/components/Button";
import { ProgramMark } from "@/components/ProgramMark";
import { lxPaths } from "@/lib/icons";
import { programVisual } from "@/lib/programs";
import { loadProgramIndex, programPosition, type ProgramEntry, type ProgramIndex } from "@/lib/program-index";

// Programok — the catalog of every published program, in the Kezdőlap's visual
// grammar: billboard hero (the program you should continue) + rows grouped by
// category. Cards keep the colorless program identity (mark + word); tapping
// one opens /app/program/[slug].

// Section order + plural labels for the category groups. Unknown categories
// fall through with their raw name.
const CATEGORY_LABEL: Record<string, string> = {
  Program: "Programok",
  Sorozat: "Sorozatok",
  Kihívás: "Kihívások",
};
const CATEGORY_ORDER = ["Program", "Sorozat", "Kihívás"];

interface ProgWithPos extends ProgramEntry {
  done: number;
  total: number;
  finished: boolean;
}

export default function ProgramsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pindex, setPindex] = useState<ProgramIndex | null>(null);
  const [completedCodes, setCompletedCodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgramIndex()
      .then(setPindex)
      .catch(() => setPindex(null))
      .finally(() => setLoading(false));
    if (user) {
      getProgress(user.uid)
        .then((p) => setCompletedCodes(new Set((p?.completed ?? []).map((c) => c.code))))
        .catch(() => {});
    }
  }, [user]);

  const programs: ProgWithPos[] = useMemo(
    () =>
      (pindex?.programs ?? []).map((p) => {
        const pos = programPosition(p.codes, completedCodes);
        const total = p.totalSessions || p.codes.length;
        return { ...p, done: pos.doneCount, total, finished: pos.completed };
      }),
    [pindex, completedCodes],
  );

  if (loading) return <p style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", marginTop: 40 }}>Töltés…</p>;
  if (!programs.length) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>Még nincs elérhető program.</p>;

  // Hero: the program to continue — in progress first, then the first unfinished.
  const hero =
    programs.find((p) => p.done > 0 && !p.finished) ??
    programs.find((p) => !p.finished) ??
    programs[0];

  const open = (slug: string) => router.push(`/app/program/${slug}`);

  // Group by category, in a fixed order, unknowns appended.
  const groups = new Map<string, ProgWithPos[]>();
  for (const p of programs) {
    const cat = p.category || "Program";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(p);
  }
  const orderedCats = [
    ...CATEGORY_ORDER.filter((c) => groups.has(c)),
    ...[...groups.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  const heroName = hero.hu || hero.title;

  return (
    <div className="home fade-in">
      <section className="hb">
        <div
          className="hb-art"
          style={{ background: "linear-gradient(120deg, oklch(0.28 0.05 168) 0%, oklch(0.5 0.05 168) 58%, oklch(0.66 0.05 168) 100%)" }}
        />
        <span className="hb-ring" aria-hidden="true" />
        <span className="hb-word" aria-hidden="true">{hero.title.toUpperCase()}</span>
        <span className="hb-scrim" aria-hidden="true" />
        <span className="hb-vig" aria-hidden="true" />

        <div className="hb-content">
          <div className="hb-eyebrow">
            {hero.done > 0
              ? `FOLYTASD · ${hero.done}/${hero.total}. EDZÉS KÉSZ`
              : `PROGRAMOK · ${programs.length} PROGRAM`}
          </div>
          <h1 className="hb-title">
            {heroName}
            {hero.title !== heroName && <small>{hero.title}</small>}
          </h1>
          <p className="hb-syn">{hero.synopsis}</p>
          <div className="hb-ctas">
            <Button size="l" variant="primary" onDark iconLeft={lxPaths.play} onClick={() => open(hero.slug)}>
              {hero.done > 0 ? "Folytatom" : "Megnézem"}
            </Button>
          </div>
        </div>
      </section>

      <div className="home-rows">
        {orderedCats.map((cat) => (
          <section className="hrow-sec" key={cat}>
            <div className="hrow-head">
              <h3>{CATEGORY_LABEL[cat] ?? cat} <span style={{ color: "var(--ink-3)", fontWeight: 600, fontSize: 13 }}>· {groups.get(cat)!.length}</span></h3>
            </div>
            <div className="pgm-grid">
              {groups.get(cat)!.map((p) => (
                <ProgramCard key={p.slug} p={p} onOpen={open} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ProgramCard({ p, onOpen }: { p: ProgWithPos; onOpen: (slug: string) => void }) {
  const pv = programVisual(p.slug, p.hu || p.title);
  const name = p.hu || p.title;
  const meta = [p.level, p.total > 0 ? `${p.total} edzés` : null, p.defaultMins ? `~${p.defaultMins} perc` : null]
    .filter(Boolean)
    .join(" · ");
  const pct = p.total > 0 ? Math.round((Math.min(p.done, p.total) / p.total) * 100) : 0;

  return (
    <button type="button" className="pgm" onClick={() => onOpen(p.slug)} aria-label={`${name} megnyitása`}>
      <div className="pgm-art">
        <span className="pgm-mark" aria-hidden="true"><ProgramMark shape={pv.icon} size={14} /></span>
        {p.total === 0 && <span className="pgm-soon">HAMAROSAN</span>}
        <span className="pgm-word" aria-hidden="true">{p.title.toUpperCase()}</span>
      </div>
      <div className="pgm-body">
        <div className="pgm-name">{name}</div>
        {meta && <div className="pgm-meta">{meta}</div>}
        {p.total > 0 && (
          <div className="pgm-prog">
            <span className="pgm-bar"><i style={{ width: `${pct}%` }} /></span>
            <span className={`pgm-count${p.done === 0 ? " new" : ""}`}>
              {p.finished ? "KÉSZ 🎉" : p.done === 0 ? "ÚJ" : `${p.done}/${p.total}`}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
