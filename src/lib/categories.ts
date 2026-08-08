// Theme → cover word + color, ported from the prototype's LX_CAT_STYLE.
// `word` = the FULL category name (final spec, centered on covers).
// `short` = the legacy abbreviation, kept for tight single-line spots that overflow.
export const CAT: Record<string, { c: string; word: string; short: string }> = {
  "Alsótest": { c: "var(--cat-also)", word: "ALSÓTEST", short: "ALSÓ" },
  "Felsőtest": { c: "var(--cat-felso)", word: "FELSŐTEST", short: "FELSŐ" },
  "Kardió + has": { c: "var(--cat-cardio)", word: "KARDIÓ + HAS", short: "KARDIÓ" },
  "Teljes test": { c: "var(--cat-teljes)", word: "TELJES TEST", short: "TELJES" },
  "Mobilitás / nyújtás": { c: "var(--cat-mobility)", word: "MOBILITÁS / NYÚJTÁS", short: "MOBILITÁS" },
  "Tartás-fókusz": { c: "var(--cat-tartas)", word: "TARTÁS-FÓKUSZ", short: "TARTÁS" },
};

export const catOf = (t: string) => CAT[t] ?? CAT["Teljes test"];
/** Full category name, UPPERCASED — the centered cover word (final spec). */
export const catWord = (t: string) => catOf(t).word;
/** Legacy abbreviation, for tight single-line spots that can't fit the full name. */
export const catShort = (t: string) => catOf(t).short;

/** Program day-card gradient (progGrad). */
export const dayGrad = (t: string) => {
  const c = catOf(t).c;
  return `linear-gradient(135deg, oklch(from ${c} calc(l + 0.06) c h) 0%, ${c} 62%, oklch(from ${c} calc(l - 0.12) c h) 100%)`;
};

/** Netflix-card gradient (nxGrad). */
export const cardGrad = (t: string) => {
  const c = catOf(t).c;
  return `linear-gradient(135deg, oklch(from ${c} calc(l + 0.07) c h) 0%, ${c} 100%)`;
};

export const levelWord = (n: number) => ["Kezdő", "Közepes", "Haladó"][n - 1] ?? "Kezdő";

// ── Kihívások: body-part → cover word + colour (the archive's own taxonomy,
//    distinct from the Videótár themes above). Falls back to the teljes hue. ──
export const CH_CAT: Record<string, { c: string; word: string }> = {
  "Has & törzs": { c: "var(--cat-cardio)", word: "HAS & TÖRZS" },
  "Fenék & comb": { c: "var(--cat-also)", word: "FENÉK & COMB" },
  "Karok & váll": { c: "var(--cat-felso)", word: "KAROK & VÁLL" },
  "Tánc-kardió": { c: "var(--cat-teljes)", word: "TÁNC-KARDIÓ" },
  "Mobilitás": { c: "var(--cat-mobility)", word: "MOBILITÁS" },
  "Felsőtest": { c: "var(--cat-felso)", word: "FELSŐTEST" },
  "Tartás": { c: "var(--cat-tartas)", word: "TARTÁS" },
};

export const challengeCatOf = (t: string) => CH_CAT[t] ?? { c: "var(--cat-teljes)", word: (t || "KIHÍVÁS").toUpperCase() };

/** Portrait cover gradient for a challenge (9:16-leaning poster). */
export const challengeGrad = (t: string) => {
  const c = challengeCatOf(t).c;
  return `linear-gradient(157deg, oklch(from ${c} calc(l - 0.14) calc(c * 0.9) h) 0%, ${c} 58%, oklch(from ${c} calc(l + 0.06) c h) 100%)`;
};
