// Theme → cover word + color, ported from the prototype's LX_CAT_STYLE.
export const CAT: Record<string, { c: string; word: string }> = {
  "Alsótest": { c: "var(--cat-also)", word: "ALSÓ" },
  "Felsőtest": { c: "var(--cat-felso)", word: "FELSŐ" },
  "Cardio + has": { c: "var(--cat-cardio)", word: "CARDIO" },
  "Teljes test": { c: "var(--cat-teljes)", word: "TELJES" },
  "Mobility / nyújtás": { c: "var(--cat-mobility)", word: "MOBILITY" },
  "Tartás-fókusz": { c: "var(--cat-tartas)", word: "TARTÁS" },
};

export const catOf = (t: string) => CAT[t] ?? CAT["Teljes test"];
export const catWord = (t: string) => catOf(t).word;

/** Program day-card gradient (progGrad). */
export const dayGrad = (t: string) => {
  const c = catOf(t).c;
  return `linear-gradient(135deg, oklch(from ${c} calc(l + 0.06) c h) 0%, ${c} 62%, oklch(from ${c} calc(l - 0.12) c h) 100%)`;
};

export const levelWord = (n: number) => ["Kezdő", "Közepes", "Haladó"][n - 1] ?? "Kezdő";
