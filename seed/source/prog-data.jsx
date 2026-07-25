// LEXFIT — Foundation program dataset (4 hét · 20 edzés · 4 fázis)
// Forrás: Áttekintés doc. Heti split: H Alsó / K Felső / Sze 🛌 / Cs Cardio+has / P Teljes / Szo Mobility / V 🛌
// Minden edzés fix 30 perc, eszköz nélkül. F001–F020 sorrendben, 5/hét. (F021–F040 tartalék.)

const PROG_PHASES = [
  { idx: 0, icon: "🌱", name: "Alap", weeks: "Hét 1", short: "Forma + szokás",
    desc: "Forma és szokás kialakítása. Lassú tempó, alapgyakorlatok, bőséges modifikációkkal.",
    c: "var(--cat-mobility)" },
  { idx: 1, icon: "🔨", name: "Építés", weeks: "Hét 2", short: "Variációk + cardio",
    desc: "Új variációk és cardio-alapozás. Tempo-játékok, új formátumok lépnek be.",
    c: "var(--cat-tartas)" },
  { idx: 2, icon: "🔥", name: "Elmélyítés", weeks: "Hét 3", short: "Komplexitás + intenzitás",
    desc: "Komplexitás és intenzitás. Egylábú gyakorlatok, EMOM, AMRAP.",
    c: "var(--cat-cardio)" },
  { idx: 3, icon: "🏆", name: "Kifejezés", weeks: "Hét 4", short: "Flow-k + záró mérés",
    desc: "Komplex flow-k és záró visszamérés. Hét 4 = Hét 1 pontos visszamérése — mit fejlődtél.",
    c: "var(--cat-teljes)" },
];

// heti split — a slot-sorrend minden héten azonos
const PROG_SPLIT = [
  { d: "H",   name: "Hétfő",     theme: "Alsótest" },
  { d: "K",   name: "Kedd",      theme: "Felsőtest" },
  { d: "Sze", name: "Szerda",    rest: true },
  { d: "Cs",  name: "Csütörtök", theme: "Cardio + has" },
  { d: "P",   name: "Péntek",    theme: "Teljes test" },
  { d: "Szo", name: "Szombat",   theme: "Mobility / nyújtás" },
  { d: "V",   name: "Vasárnap",  rest: true },
];

// 40 edzés — [code, title, theme, level, format, types]
const _W = [
  // Hét 1 — 🌱 Alap
  ["F001","Láb alapokról","Alsótest",1,"Klasszikus circuit",[]],
  ["F002","Felsőtest indító","Felsőtest",1,"Klasszikus circuit",["🪑 Falra fogva"]],
  ["F003","Csendes cardio","Cardio + has",1,"50/50",["🔇 Csendes"]],
  ["F004","Mindent egy edzésben","Teljes test",1,"Klasszikus circuit",[]],
  ["F005","Reset szombat — alap flow","Mobility / nyújtás",1,"Folyamatos flow",["🧘 Lazító"]],
  // Hét 2 — 🌱 Alap
  ["F006","Fenék-fókusz, első réteg","Alsótest",1,"Klasszikus circuit",["🔇 Csendes"]],
  ["F007","Egyenes hát, nyitott mell","Felsőtest",1,"Időzített tartások",["🪑 Falra fogva"]],
  ["F008","Lépés-alapú cardio + has","Cardio + has",1,"50/50",["🔇 Csendes"]],
  ["F009","Egész test flow, könnyedén","Teljes test",1,"Folyamatos flow",[]],
  ["F010","Csípő + váll mobility","Mobility / nyújtás",1,"Steady-state",["🧘 Lazító"]],
  // Hét 3 — 🔨 Építés
  ["F011","Combé az erő — pulzusok és tempo","Alsótest",2,"Klasszikus circuit",[]],
  ["F012","Felsőtest variációkkal","Felsőtest",2,"Ladder",[]],
  ["F013","Step it up — cardio építés","Cardio + has",2,"EMOM",[]],
  ["F014","Teljes test fél órában","Teljes test",2,"Klasszikus circuit",[]],
  ["F015","Lazító flow + mély nyújtás","Mobility / nyújtás",1,"Folyamatos flow",["🧘 Lazító","🌙 Esti"]],
  // Hét 4 — 🔨 Építés  (← aktuális hét)
  ["F016","Lábmunka oldalra és átlósan","Alsótest",2,"Pyramid",[]],
  ["F017","Lapockák erősítése","Felsőtest",2,"Ladder",[]],
  ["F018","Cardio combo + ferde has","Cardio + has",2,"EMOM",["🔇 Csendes"]],
  ["F019","Multi-mozgás minden testrésznek","Teljes test",2,"AMRAP",["⚡ Intenzív"]],
  ["F020","Mély nyújtás — egész test","Mobility / nyújtás",1,"Steady-state",["🧘 Lazító"]],
  // Hét 5 — 🔥 Elmélyítés · 📊 VISSZAMÉRÉS (Hét 1 erősebben)
  ["F021","Erős alapok — újra, erősebben","Alsótest",2,"Klasszikus circuit",["📊 Visszamérő"]],
  ["F022","Felsőtest, második menet","Felsőtest",2,"Klasszikus circuit",["📊 Visszamérő"]],
  ["F023","30 perc izzadás, nulla ugrás","Cardio + has",2,"EMOM",["🔇 Csendes","📊 Visszamérő"]],
  ["F024","Mindenből erősebben","Teljes test",2,"AMRAP",["📊 Visszamérő"]],
  ["F025","Reggeli energizáló flow","Mobility / nyújtás",1,"Folyamatos flow",["🌅 Reggeli"]],
  // Hét 6 — 🔥 Elmélyítés
  ["F026","Egylábú belépő","Alsótest",3,"Klasszikus circuit",[]],
  ["F027","Fekvőtámasz minden szögből","Felsőtest",3,"Pyramid",["⚡ Intenzív"]],
  ["F028","Tabata, csendes verzió","Cardio + has",3,"Tabata",["🔇 Csendes","⚡ Intenzív"]],
  ["F029","Csinálj amennyit bírsz","Teljes test",3,"AMRAP",["⚡ Intenzív"]],
  ["F030","Mobility CARs — minden ízület","Mobility / nyújtás",1,"Steady-state",[]],
  // Hét 7 — 🏆 Kifejezés
  ["F031","Komplex láb-flow","Alsótest",3,"Folyamatos flow",[]],
  ["F032","Tartás-reset komplett","Felsőtest",2,"Időzített tartások",["🧘 Lazító"]],
  ["F033","Cardio finisher + has","Cardio + has",3,"Tabata",["⚡ Intenzív"]],
  ["F034","Pyramid — fokozó full body","Teljes test",3,"Pyramid",["⚡ Intenzív"]],
  ["F035","Sűrű napra fél óra","Mobility / nyújtás",1,"Folyamatos flow",[]],
  // Hét 8 — 🏆 Kifejezés · 📊 ZÁRÓ VISSZAMÉRÉS (Hét 1 pontosan)
  ["F036","Visszamérő — alsótest","Alsótest",2,"Klasszikus circuit",["📊 Visszamérő"]],
  ["F037","Visszamérő — felsőtest","Felsőtest",2,"Klasszikus circuit",["📊 Visszamérő"]],
  ["F038","Visszamérő — cardio","Cardio + has",2,"EMOM",["📊 Visszamérő"]],
  ["F039","Visszamérő — egész test","Teljes test",2,"Klasszikus circuit",["📊 Visszamérő"]],
  ["F040","Záró flow — ünnep","Mobility / nyújtás",2,"Folyamatos flow",["🧘 Lazító"]],
];

// build 4 weeks, each its own phase + 5 workouts (+ the rest-day rhythm)
const PROG_WEEKS = Array.from({ length: 4 }, (_, w) => {
  const phase = w; // 4 hét · 4 fázis (heti egy)
  const retest = w === 3 ? "final" : null; // hét 4 = záró visszamérés
  const slots = PROG_SPLIT.filter((s) => !s.rest); // 5 workout slots
  const workouts = slots.map((slot, i) => {
    const [code, title, theme, level, format, types] = _W[w * 5 + i];
    return {
      code, title, theme, level, format, types, phase,
      mins: 30, week: w + 1, day: slot.d, dayName: slot.name,
      globalIndex: w * 5 + i, retest,
    };
  });
  return { num: w + 1, phase, retest, workouts };
});

// flat lookup
const PROG_BY_CODE = {};
PROG_WEEKS.forEach((wk) => wk.workouts.forEach((v) => { PROG_BY_CODE[v.code] = v; }));

// ── progress model ──────────────────────────────────────────────
// in-progress: Réka, 3. hét csütörtök. 2 teljes hét (10) + H,K (2) = 12 kész, F013 = ma.
const PROG_CURRENT_INDEX = 12;        // F013 — a mai edzés
const PROG_DONE_COUNT = 12;           // ennyi kész előtte
const PROG_STREAK = 11;

// state egy edzéshez az adott user-szcenárióban
function progDayState(v, joined) {
  if (!joined) return "preview";
  if (v.globalIndex < PROG_DONE_COUNT) return "done";
  if (v.globalIndex === PROG_CURRENT_INDEX) return "today";
  return "todo";
}
// state egy egész fázishoz
function progPhaseState(phaseIdx, joined) {
  if (!joined) return phaseIdx === 0 ? "open" : "locked-preview";
  const start = phaseIdx * 5, end = start + 5;
  if (PROG_DONE_COUNT >= end) return "done";
  if (PROG_CURRENT_INDEX >= start && PROG_CURRENT_INDEX < end) return "now";
  if (PROG_DONE_COUNT >= start) return "now";
  return "next";
}

// program-szintű tények
const PROG_META = {
  title: "Foundation",
  hu: "Alapozó program",
  weeks: 4, total: 20, perWeek: 5, mins: 30,
  level: "Kezdő – újrakezdő",
  eyebrow: "4 HETES PROGRAM · KEZDŐ",
  synopsis: "Stabil alap mindenhez: heti 5 edzés, napi fix 30 perc, eszköz nélkül. Négy fázis vezet a formától a záró mérésig.",
  facts: [
    ["Időtartam", "4 hét"],
    ["Heti edzés", "5 nap + 2 pihenő"],
    ["Edzés hossza", "fix 30 perc"],
    ["Eszköz", "nincs (matrac)"],
    ["Szint", "kezdő – újrakezdő"],
    ["Formátumok", "circuit · EMOM · Tabata · AMRAP · flow"],
  ],
};

Object.assign(window, {
  PROG_PHASES, PROG_SPLIT, PROG_WEEKS, PROG_BY_CODE, PROG_META,
  PROG_CURRENT_INDEX, PROG_DONE_COUNT, PROG_STREAK,
  progDayState, progPhaseState,
});
