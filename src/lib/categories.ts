// Theme → cover word + color, ported from the prototype's LX_CAT_STYLE.
// `word` = the FULL category name (final spec, centered on covers).
// `short` = the legacy abbreviation, kept for tight single-line spots that overflow.
export const CAT: Record<string, { c: string; word: string; short: string }> = {
  "Alsótest": { c: "var(--cat-also)", word: "ALSÓTEST", short: "ALSÓ" },
  "Felsőtest": { c: "var(--cat-felso)", word: "FELSŐTEST", short: "FELSŐ" },
  "Cardio + has": { c: "var(--cat-cardio)", word: "CARDIO + HAS", short: "CARDIO" },
  "Teljes test": { c: "var(--cat-teljes)", word: "TELJES TEST", short: "TELJES" },
  "Mobility / nyújtás": { c: "var(--cat-mobility)", word: "MOBILITY / NYÚJTÁS", short: "MOBILITY" },
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
