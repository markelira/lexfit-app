// Canonical default filter taxonomy (2026-08 Hungarian glossary). On an EMPTY
// production Firestore the admin Szűrők screen renders these as the starting
// point, and the first save creates the filters/{key} docs - without this,
// taxonomy could never be authored on prod (the API used to 404 on missing
// docs and the screen listed nothing). Firestore content always wins over
// these defaults once the docs exist.
import type { FilterDimension } from "@/lib/types";

export const DEFAULT_FILTERS: FilterDimension[] = [
  { key: "phase", label: "Fázis", options: ["🌱 Alap", "🔨 Építés", "🔥 Elmélyítés", "🏆 Kifejezés"], order: 0, editable: true },
  { key: "theme", label: "Testrész / Téma", options: ["Alsótest", "Felsőtest", "Kardió + has", "Teljes test", "Mobilitás / nyújtás", "Tartás-fókusz"], order: 1, editable: true },
  { key: "dur", label: "Időtartam", options: ["5–15 perc", "16–25 perc", "26–35 perc", "36+ perc"], order: 2, editable: true },
  { key: "level", label: "Nehézség", options: ["🔥 Kezdő", "🔥🔥 Közepes", "🔥🔥🔥 Haladó"], order: 3, editable: true },
  { key: "format", label: "Formátum", options: ["Klasszikus circuit", "EMOM", "Tabata", "AMRAP", "Pyramid", "Ladder", "50/50", "Folyamatos flow", "Steady-state", "Időzített tartások"], order: 4, editable: true },
  { key: "type", label: "Típus", options: ["🔇 Csendes", "🪑 Falra fogva", "🧘 Lazító", "⚡ Intenzív", "🌅 Reggeli", "🌙 Esti"], order: 5, editable: true },
];

// Kihívások taxonomy - challengeFilters/{key}. Only "theme" (TESTRÉSZ) exists.
export const DEFAULT_CHALLENGE_FILTERS: FilterDimension[] = [
  { key: "theme", label: "Testrész", options: ["Has & törzs", "Fenék & comb", "Karok & váll", "Tánc-kardió", "Mobilitás", "Felsőtest", "Tartás"], order: 0, editable: true },
];

/** Firestore docs win; defaults fill what doesn't exist yet. `stored: false`
 *  marks a dimension that only exists as a default - the admin UI treats it as
 *  unsaved so one Mentés bootstraps the doc. */
export function mergeWithDefaults(
  defaults: FilterDimension[],
  stored: FilterDimension[],
): (FilterDimension & { stored: boolean })[] {
  const byKey = new Map(stored.map((d) => [d.key, d]));
  const merged = defaults.map((d) => {
    const s = byKey.get(d.key);
    return s ? { ...s, stored: true } : { ...d, stored: false };
  });
  const extra = stored
    .filter((d) => !defaults.some((x) => x.key === d.key))
    .map((d) => ({ ...d, stored: true }));
  return [...merged, ...extra].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
