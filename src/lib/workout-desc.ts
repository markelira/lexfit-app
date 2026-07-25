// Shared workout copy helpers — the generated description, format/theme blurbs,
// phase label, and block breakdown used by the detail modal and the program overview.

export const PHASES = ["🌱 Alap", "🔨 Építés", "🔥 Elmélyítés", "🏆 Kifejezés"];
export const phaseLabel = (p?: number | null) => (p == null ? "✦ Bónusz" : PHASES[p] ?? "✦ Bónusz");
export const matchPct = (code: string) => 84 + (((parseInt(code.replace(/\D/g, ""), 10) || 7) * 7) % 14);

const FMT: Record<string, string> = {
  EMOM: "Minden perc elején új gyakorlat indul — ami a percből marad, az a pihenőd.",
  Tabata: "20 másodperc munka, 10 másodperc pihenő — rövid, intenzív körökben.",
  AMRAP: "Adott idő alatt annyi kört teljesítesz, amennyit bírsz — a saját tempódban.",
  "Klasszikus circuit": "Gyakorlatról gyakorlatra haladsz, körönként rövid pihenővel.",
  Pyramid: "Az ismétlésszám körönként emelkedik, majd visszaereszkedik.",
  Ladder: "Lépcsőzetesen változó ismétlésszámok — fokozatosan melegszel bele.",
  "50/50": "Fél perc munka, fél perc pihenő — kiszámítható, tartható ritmus.",
  "Folyamatos flow": "Megállás nélküli, folyamatos mozgássor — a légzésed vezet.",
  "Steady-state": "Egyenletes, nyugodt tempó az elejétől a végéig.",
  "Időzített tartások": "Statikus tartások időre — a mély, tartó izmok dolgoznak.",
};
const THEME: Record<string, string> = {
  "Alsótest": "Comb-, fenék- és vádlifókuszú edzés",
  "Felsőtest": "Kar-, váll- és hátfókuszú edzés",
  "Cardio + has": "Pulzusemelő edzés erős hasfókusszal",
  "Teljes test": "Az egész testet átmozgató edzés",
  "Mobility / nyújtás": "Ízület-átmozgató, nyújtó egység",
  "Tartás-fókusz": "Tartásjavító, gerincbarát egység",
};

export const workoutDesc = (v: { theme: string; format: string; types: string[] }) => {
  const quiet = v.types.some((t) => t.includes("Csendes"));
  return `${THEME[v.theme] ?? "Vezetett edzés"}, eszköz nélkül — elég egy matrac. ${FMT[v.format] ?? ""}${quiet ? " Csendes, szomszédbarát változat, ugrálás nélkül." : ""} Alexa végig veled csinálja.`;
};

export function workoutBlocks(v: {
  blocks?: { name: string; mins: number }[];
  mins: number;
  format: string;
}): { name: string; mins: number }[] {
  if (v.blocks?.length) return v.blocks.map((b) => ({ name: b.name, mins: b.mins }));
  const warm = Math.max(2, Math.round(v.mins * 0.14));
  const cool = Math.max(2, Math.round(v.mins * 0.16));
  const main = v.mins - warm - cool;
  if (v.mins <= 15) return [{ name: "Bemelegítés", mins: warm }, { name: v.format, mins: main }, { name: "Levezetés", mins: cool }];
  const m1 = Math.ceil(main / 2);
  return [
    { name: "Bemelegítés", mins: warm },
    { name: `${v.format} — 1. blokk`, mins: m1 },
    { name: `${v.format} — 2. blokk`, mins: main - m1 },
    { name: "Levezetés", mins: cool },
  ];
}
