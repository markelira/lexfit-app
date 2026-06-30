// LEXFIT app — video library dataset + filter model
// Sources: Áttekintés doc (F/B/R/T/N/M codes, filters, formats)

const LX_FILTERS = {
  phase: { label: "Fázis", options: ["🌱 Alap", "🔨 Építés", "🔥 Elmélyítés", "🏆 Kifejezés"] },
  theme: { label: "Testrész / Téma", options: ["Alsótest", "Felsőtest", "Cardio + has", "Teljes test", "Mobility / nyújtás", "Tartás-fókusz"] },
  dur:   { label: "Időtartam", options: ["5–15 perc", "16–25 perc", "26–35 perc", "36+ perc"] },
  level: { label: "Nehézség", options: ["🔥 Kezdő", "🔥🔥 Közepes", "🔥🔥🔥 Haladó"] },
  format:{ label: "Formátum", options: ["Klasszikus circuit", "EMOM", "Tabata", "AMRAP", "Pyramid", "Ladder", "50/50", "Folyamatos flow", "Steady-state", "Időzített tartások"] },
  type:  { label: "Típus", options: ["🔇 Csendes", "🪑 Falra fogva", "🧘 Lazító", "⚡ Intenzív", "🌅 Reggeli", "🌙 Esti"] },
};

// phase: 0-3 index or null (bónusz tartalom) · level: 1-3 · types: string[]
const LX_VIDEOS = [
  { code: "F001", title: "Láb alapokról", phase: 0, theme: "Alsótest", mins: 30, level: 1, format: "Klasszikus circuit", types: [] },
  { code: "F002", title: "Felsőtest indító", phase: 0, theme: "Felsőtest", mins: 30, level: 1, format: "Klasszikus circuit", types: ["🪑 Falra fogva"] },
  { code: "F003", title: "Csendes cardio", phase: 0, theme: "Cardio + has", mins: 30, level: 1, format: "50/50", types: ["🔇 Csendes"] },
  { code: "F004", title: "Mindent egy edzésben", phase: 0, theme: "Teljes test", mins: 30, level: 1, format: "Klasszikus circuit", types: [] },
  { code: "F005", title: "Reset szombat — alap flow", phase: 0, theme: "Mobility / nyújtás", mins: 28, level: 1, format: "Folyamatos flow", types: ["🧘 Lazító"] },
  { code: "F006", title: "Fenék-fókusz", phase: 0, theme: "Alsótest", mins: 30, level: 1, format: "Klasszikus circuit", types: ["🔇 Csendes"] },
  { code: "F007", title: "Egyenes hát", phase: 0, theme: "Tartás-fókusz", mins: 30, level: 1, format: "Időzített tartások", types: [] },
  { code: "F011", title: "Combé az erő — pulzusok és tempo", phase: 0, theme: "Alsótest", mins: 30, level: 2, format: "Klasszikus circuit", types: [] },
  { code: "F014", title: "Teljes test fél órában", phase: 0, theme: "Teljes test", mins: 30, level: 2, format: "Klasszikus circuit", types: [] },
  { code: "F015", title: "Lazító flow + mély nyújtás", phase: 0, theme: "Mobility / nyújtás", mins: 30, level: 1, format: "Folyamatos flow", types: ["🧘 Lazító", "🌙 Esti"] },
  { code: "F021", title: "Második fázis — alsótest", phase: 1, theme: "Alsótest", mins: 30, level: 2, format: "Klasszikus circuit", types: [] },
  { code: "F022", title: "Második fázis — felsőtest", phase: 1, theme: "Felsőtest", mins: 30, level: 2, format: "Ladder", types: [] },
  { code: "F023", title: "Második fázis — cardio", phase: 1, theme: "Cardio + has", mins: 30, level: 2, format: "EMOM", types: ["🔇 Csendes"] },
  { code: "F024", title: "Második fázis — egész test", phase: 1, theme: "Teljes test", mins: 30, level: 2, format: "AMRAP", types: ["⚡ Intenzív"] },
  { code: "F025", title: "Reggeli energizáló flow", phase: 1, theme: "Mobility / nyújtás", mins: 26, level: 1, format: "Folyamatos flow", types: ["🌅 Reggeli"] },
  { code: "F027", title: "Fekvőtámasz minden szögből", phase: 2, theme: "Felsőtest", mins: 32, level: 3, format: "Pyramid", types: ["⚡ Intenzív"] },
  { code: "F028", title: "Tabata, csendes verzió", phase: 2, theme: "Cardio + has", mins: 32, level: 3, format: "Tabata", types: ["🔇 Csendes", "⚡ Intenzív"] },
  { code: "F029", title: "Csinálj amennyit bírsz", phase: 2, theme: "Teljes test", mins: 32, level: 3, format: "AMRAP", types: ["⚡ Intenzív"] },
  { code: "F031", title: "Komplex láb-flow", phase: 3, theme: "Alsótest", mins: 30, level: 3, format: "Folyamatos flow", types: [] },
  { code: "F034", title: "Csökkenő piramis egész testre", phase: 3, theme: "Teljes test", mins: 30, level: 3, format: "Pyramid", types: ["⚡ Intenzív"] },
  { code: "F036", title: "Visszamérő — alsótest", phase: 3, theme: "Alsótest", mins: 30, level: 2, format: "Klasszikus circuit", types: [] },
  { code: "F040", title: "Záró ünnepi flow", phase: 3, theme: "Teljes test", mins: 30, level: 2, format: "Folyamatos flow", types: ["🧘 Lazító"] },
  { code: "B001", title: "Has-kihívás · 1. nap", phase: null, theme: "Cardio + has", mins: 12, level: 1, format: "Klasszikus circuit", types: ["🔇 Csendes"] },
  { code: "B004", title: "Has-kihívás · 4. nap", phase: null, theme: "Cardio + has", mins: 13, level: 2, format: "50/50", types: ["🔇 Csendes"] },
  { code: "B007", title: "Has-kihívás · döntő nap", phase: null, theme: "Cardio + has", mins: 15, level: 2, format: "Tabata", types: ["⚡ Intenzív"] },
  { code: "R001", title: "Reggeli flow · 1. nap", phase: null, theme: "Mobility / nyújtás", mins: 8, level: 1, format: "Folyamatos flow", types: ["🌅 Reggeli", "🧘 Lazító"] },
  { code: "R007", title: "Reggeli flow · 7. nap", phase: null, theme: "Mobility / nyújtás", mins: 10, level: 1, format: "Folyamatos flow", types: ["🌅 Reggeli"] },
  { code: "R014", title: "Reggeli flow · zárónap", phase: null, theme: "Mobility / nyújtás", mins: 12, level: 1, format: "Folyamatos flow", types: ["🌅 Reggeli"] },
  { code: "T001", title: "Tartás-reset irodai nap után", phase: null, theme: "Tartás-fókusz", mins: 14, level: 1, format: "Időzített tartások", types: ["🪑 Falra fogva", "🌙 Esti"] },
  { code: "T003", title: "Váll és nyak felszabadítás", phase: null, theme: "Tartás-fókusz", mins: 16, level: 1, format: "Időzített tartások", types: ["🧘 Lazító"] },
  { code: "N002", title: "Teljes test nyújtás alapok", phase: null, theme: "Mobility / nyújtás", mins: 20, level: 1, format: "Steady-state", types: ["🧘 Lazító"] },
  { code: "N003", title: "Esti mély nyújtás", phase: null, theme: "Mobility / nyújtás", mins: 18, level: 1, format: "Steady-state", types: ["🌙 Esti", "🧘 Lazító"] },
  { code: "M001", title: "Csípő-mobility minden szintre", phase: null, theme: "Mobility / nyújtás", mins: 22, level: 1, format: "Steady-state", types: [] },
  { code: "M002", title: "Gerinc átmozgatás reggelre", phase: null, theme: "Mobility / nyújtás", mins: 15, level: 1, format: "Folyamatos flow", types: ["🌅 Reggeli"] },
];

const lxDurBucket = (mins) =>
  mins <= 15 ? "5–15 perc" : mins <= 25 ? "16–25 perc" : mins <= 35 ? "26–35 perc" : "36+ perc";

// active = { phase: Set, theme: Set, dur: Set, level: Set, format: Set, type: Set }
function lxFilterVideos(videos, active) {
  return videos.filter((v) => {
    if (active.phase.size && (v.phase === null || !active.phase.has(LX_FILTERS.phase.options[v.phase]))) return false;
    if (active.theme.size && !active.theme.has(v.theme)) return false;
    if (active.dur.size && !active.dur.has(lxDurBucket(v.mins))) return false;
    if (active.level.size && !active.level.has(LX_FILTERS.level.options[v.level - 1])) return false;
    if (active.format.size && !active.format.has(v.format)) return false;
    if (active.type.size && ![...active.type].some((t) => v.types.includes(t))) return false;
    return true;
  });
}

// today's session structure — exercise peek for the hero + player
const LX_TODAY_PLAN = {
  code: "F023", title: "Második fázis — cardio", theme: "Cardio + has",
  mins: 30, level: 2, format: "EMOM", type: "🔇 Csendes",
  blocks: [
    { name: "Bemelegítés", mins: 4, items: ["Helyben járás + karkörzés", "Csípőkörzés", "Dinamikus nyújtás"] },
    { name: "1. blokk — EMOM 10", mins: 10, items: ["Térdelés-felállás", "Hegymászó (csendes)", "Oldalsó lépés + érintés", "Plank váll-érintés", "Guggolás + sarokemelés"] },
    { name: "2. blokk — EMOM 10", mins: 10, items: ["Kitörés hátra, váltott", "Lassú burpee (ugrás nélkül)", "Orosz csavarás", "Lábemelés fekvésben", "Híd + tartás"] },
    { name: "Levezetés", mins: 6, items: ["Kobra nyújtás", "Gyermekpóz", "Mély légzés a falnál"] },
  ],
};

Object.assign(window, { LX_FILTERS, LX_VIDEOS, LX_TODAY_PLAN, lxDurBucket, lxFilterVideos });
