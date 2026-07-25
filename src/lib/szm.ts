// LEXFIT — "Szavazz Magadra" community screen data model (ported from szm-data.jsx).
// A separate content group from the program: weekly vote → 5-day vertical video drop.
// Preview/mock content — a real community backend replaces this later.

export type SzmState = "done" | "today" | "locked";

export interface SzmDay {
  day: number;
  code: string;
  title: string;
  mins: number;
  level: number;
  state: SzmState;
  quiet?: boolean;
  drops?: string;
  done?: number;
  react?: number;
  comments?: number;
}

export interface SzmVoteOption {
  theme: string;
  votes: number;
  blurb: string;
}

// ── SZM theme palette (from the brand category colours, separate dictionary) ──
const SZM_THEMES: Record<string, { c: string; word: string }> = {
  "Fenék & comb": { c: "var(--cat-also)", word: "FENÉK" },
  "Has-szakítás": { c: "var(--cat-cardio)", word: "HAS" },
  "Has-szakítás 2.0": { c: "var(--cat-cardio)", word: "HAS" },
  "Karok & váll": { c: "var(--cat-felso)", word: "KAROK" },
  "Tánc-cardio": { c: "var(--cat-teljes)", word: "TÁNC" },
  "Mobility-reset": { c: "var(--cat-mobility)", word: "RESET" },
  "Felsőtest-szculpt": { c: "var(--cat-felso)", word: "FELSŐ" },
  "Tartás-hét": { c: "var(--cat-tartas)", word: "TARTÁS" },
};

export const szmCat = (t: string) => SZM_THEMES[t] || { c: "var(--cat-teljes)", word: "EDZÉS" };
export const szmGrad = (t: string) => {
  const c = szmCat(t).c;
  return `linear-gradient(155deg, oklch(from ${c} calc(l - 0.16) calc(c * 0.85) h) 0%, ${c} 58%, oklch(from ${c} calc(l + 0.07) c h) 100%)`;
};
export const szmWord = (t: string) => szmCat(t).word;

export const SZM_DAYS = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"];

// ── the current week's programme (Week 24 · winning theme: Fenék & comb) ──
export const SZM_WEEK = {
  num: 24,
  theme: "Fenék & comb",
  tagline: "A múlt heti szavazás nyertese — 58%-otok ezt kérte.",
  todayIdx: 2,
  days: [
    { day: 0, code: "SZM24-1", title: "Ébresztő-guggoló sorozat", mins: 18, level: 1, state: "done", done: 247, react: 89, comments: 31, quiet: true },
    { day: 1, code: "SZM24-2", title: "Híd, rúgás, ismétlés", mins: 21, level: 2, state: "done", done: 198, react: 74, comments: 22, quiet: false },
    { day: 2, code: "SZM24-3", title: "Lépcsőző comb-égő", mins: 19, level: 2, state: "today", done: 64, react: 41, comments: 18, quiet: false },
    { day: 3, code: "SZM24-4", title: "Oldalsó tűz", mins: 17, level: 2, state: "locked", drops: "Csütörtök reggel" },
    { day: 4, code: "SZM24-5", title: "Záró comb-égetés", mins: 22, level: 3, state: "locked", drops: "Péntek reggel" },
  ] as SzmDay[],
};

// ── the running vote (about NEXT week, Week 25) ──
export const SZM_VOTE = {
  forWeek: 25,
  closes: "Vasárnap 20:00",
  total: 397,
  myPick: "Karok & váll",
  options: [
    { theme: "Karok & váll", votes: 142, blurb: "Tónusos kar, erős váll — falra fogva is megy." },
    { theme: "Has-szakítás 2.0", votes: 121, blurb: "Vissza kérted: a legnépszerűbb hét folytatása." },
    { theme: "Tánc-cardio", votes: 96, blurb: "Zene, mozgás, izzadás — edzés, ami nem tűnik annak." },
    { theme: "Mobility-reset", votes: 38, blurb: "Egy lágyabb hét: ízületek, nyújtás, légzés." },
  ] as SzmVoteOption[],
};

// ── the group (FB-group feel) ──
export const SZM_GROUP = {
  name: "Szavazz Magadra · Otthoni Edzés & Fitnesz Közösség",
  members: "1 248",
  online: 37,
  privacy: "Zárt csoport",
  cover: null as string | null, // no cover image bundled → renders the gradient variant
  tagline:
    "Te döntöd el, mit edzünk. Minden héten ti szavaztok a jövő hét témájára — aztán 5 napon át, minden reggel egy friss függőleges edzésvideó.",
  faces: ["R", "D", "N", "K", "E", "Zs", "Bo", "Vi", "Lu", "Cs", "Ag", "Ti"],
};

const SZM_AV_COLORS = [
  "var(--cat-also)", "var(--cat-cardio)", "var(--cat-felso)",
  "var(--cat-teljes)", "var(--cat-mobility)", "var(--cat-tartas)",
];
export const szmAvColor = (s: string) =>
  SZM_AV_COLORS[(s.charCodeAt(0) + (s.charCodeAt(1) || 0)) % SZM_AV_COLORS.length];

export const szmLevelWord = (n: number) => ["Kezdő", "Közepes", "Haladó"][n - 1] || "Kezdő";

// ── archive: by month, then by week within the month ──
export const SZM_ARCHIVE = [
  { month: "Június", year: 2026, weeks: [
    { wim: 2, theme: "Has-szakítás", win: 61 },
    { wim: 1, theme: "Tánc-cardio", win: 47 },
  ] },
  { month: "Május", year: 2026, weeks: [
    { wim: 4, theme: "Felsőtest-szculpt", win: 52 },
    { wim: 3, theme: "Mobility-reset", win: 44 },
    { wim: 2, theme: "Tartás-hét", win: 55 },
    { wim: 1, theme: "Karok & váll", win: 49 },
  ] },
  { month: "Április", year: 2026, weeks: [
    { wim: 4, theme: "Fenék & comb", win: 57 },
    { wim: 3, theme: "Has-szakítás", win: 60 },
    { wim: 2, theme: "Tánc-cardio", win: 46 },
    { wim: 1, theme: "Mobility-reset", win: 51 },
  ] },
];

const SZM_MONTH_ABBR: Record<string, string> = {
  Január: "JAN", Február: "FEB", Március: "MAR", Április: "APR", Május: "MAJ", Június: "JUN",
  Július: "JUL", Augusztus: "AUG", Szeptember: "SZE", Október: "OKT", November: "NOV", December: "DEC",
};

// deterministic 5-part archive week (all completed)
export function szmArchiveDays(month: string, w: { wim: number; theme: string }): SzmDay[] {
  const ab = SZM_MONTH_ABBR[month] || "HET";
  const titles = [
    `Bemelegítő ${w.theme.toLowerCase()}`,
    `${w.theme} — erő`,
    `${w.theme} — tempó`,
    `${w.theme} — kitartás`,
    `Záró ${szmWord(w.theme).toLowerCase()}-égetés`,
  ];
  return titles.map((title, i) => {
    const seed = ab.charCodeAt(0) + w.wim * 11 + i;
    return {
      day: i, code: `${ab}${w.wim}-${i + 1}`, title,
      mins: 16 + (seed % 9), level: 1 + (seed % 3), state: "done" as SzmState,
      quiet: i % 2 === 0,
    };
  });
}
