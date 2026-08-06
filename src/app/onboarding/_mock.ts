// ─────────────────────────────────────────────────────────────────────────
// THE FIXTURE (40 §41 P1). The single content source for the v2 funnel while
// layout is reviewed. Deleted in P4, one block at a time, as real content
// (onboarding-data.ts / loadFoundation / PRICES) replaces each part. The build
// MUST break when this file is removed — nothing may fall back to a default.
//
// Copy is verbatim from 40 §40.11 / §40.4. Option labels/subs are verbatim from
// STEP_OPTIONS; only the icons change (emoji → lxPaths, 40 §B5). No emoji here.
// ─────────────────────────────────────────────────────────────────────────
import { lxPaths } from "@/lib/icons";
import type { OptionItem } from "@/components/onboarding/OptionRow";

export const MOCK = {
  welcome: {
    eyebrow: "LEXFIT · OTTHONI EDZÉS",
    // The slogan "A változás otthon kezdődik" lives on the LEFT brand panel
    // (persistent identity); the right hero invites action so they don't mirror.
    // "Egyedül nehéz. Együtt muszáj." is reserved for community/belonging panels.
    line1: "Rakjuk össze",
    line2: "a heted.",
    sub: "Alexa vagyok. 30 perc, csak egy matrac, és egy közösség mögötted. Pár kérdés, és kész a heted.",
    cta: "Kezdjük",
    loginPrompt: "Van már fiókod?",
    loginCta: "Lépj be",
    // PLACEHOLDER stats, pending the marketing-copy rewrite. Deliberately assert
    // nothing false: no fixed program length and not Foundation-centric (the app
    // is broader than one program). Reuses copy already verified in the funnel
    // sub + brand. Kept identical to the auth brand panel (P4.7 single-source).
    stats: [
      { n: "30 perc", l: "egy edzés" },
      { n: "Otthon", l: "eszköz nélkül" },
      { n: "1 200+", l: "csoporttag" },
    ],
  },

  // The five questions, in order. `key` matches OnboardingAnswers fields.
  goal: {
    heading: "Mi hozott ide?",
    sub: "Egyet válassz — ez adja az edzéseid fókuszát. Később módosítható.",
    options: [
      { v: "ero", icon: lxPaths.dumbbell, label: "Erősebb, energikusabb test", sub: "Hogy bírjam a napot, és jó legyen a tükörben." },
      { v: "forma", icon: lxPaths.flame, label: "Lefogyni, formálódni", sub: "Égessünk, formáljunk — fokozatosan, fenntarthatóan." },
      { v: "vissza", icon: lxPaths.rotateCcw, label: "Visszatérni a mozgáshoz", sub: "Régen volt — most újrakezdem, nulláról, szépen." },
      { v: "tartas", icon: lxPaths.userRound, label: "Jobb tartás, kevesebb fájdalom", sub: "Sok ülés, fáradt hát — mozduljunk ki belőle." },
      { v: "szokas", icon: lxPaths.calendarCheck, label: "Napi mozgás-szokás", sub: "Nem a csoda kell, hanem hogy végre rendszer legyen." },
    ] satisfies OptionItem[],
  },

  // Focus area — the body-positive rewrite of "problem areas" (research: the
  // single biggest untapped "this is mine" lever). Framed
  // as "where you want to feel stronger", never "trouble zones". Single-select.
  focus: {
    heading: "Hol szeretnél erősödni?",
    sub: "Egyet válassz — erre teszek majd külön hangsúlyt. Később módosítható.",
    options: [
      { v: "fenek", icon: lxPaths.flame, label: "Fenék, comb", sub: "Stabil, erős alsótest." },
      { v: "core", icon: lxPaths.gauge, label: "Has, törzs", sub: "Erős törzs, biztos tartás." },
      { v: "kar", icon: lxPaths.dumbbell, label: "Kar, váll", sub: "Feszes, erős felsőtest." },
      { v: "tartas", icon: lxPaths.userRound, label: "Hát, tartás", sub: "Egyenes gerinc, nyitott mellkas." },
      { v: "teljes", icon: lxPaths.layoutGrid, label: "Teljes test", sub: "Mindenből egyensúlyban." },
    ] satisfies OptionItem[],
  },

  level: {
    heading: "Hol tartasz most?",
    sub: "Ne becsüld túl és ne is alá — ehhez igazítjuk a tempót.",
    // flames → FlameRating, injected by the step (leading node needs no data here).
    options: [
      { v: 1, flames: 1, label: "Kezdő", sub: "Most kezdem, vagy rég mozogtam — vezess végig." },
      { v: 2, flames: 2, label: "Közepes", sub: "Szoktam mozogni, az alapok mennek." },
      { v: 3, flames: 3, label: "Haladó", sub: "Edzett vagyok — jöhet a kihívás." },
    ],
  },

  days: {
    heading: "Hány nap fér bele?",
    sub: "Ebből épül a heted. Bármikor változtathatod.",
    counts: [
      { v: 3, label: "kényelmes" },
      { v: 4, label: "haladós" },
      { v: 5, label: "ajánlott" },
      { v: 6, label: "intenzív" },
    ],
    recommended: 5,
    weekHeading: "Így néz majd ki a heted",
    weekdaysLabel: "Mely napokon?",
    restNote: "A pihenőnap is a terv része — nem töri meg a sorozatot.",
    // Sensible default weekday sets per count (1=Mon … 7=Sun).
    defaults: { 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 4, 5, 6], 6: [1, 2, 3, 4, 5, 6] } as Record<number, number[]>,
  },

  time: {
    heading: "Mikor a legjobb?",
    sub: "Ide teszem majd az emlékeztetőt.",
    options: [
      { v: "reggel", icon: lxPaths.gauge, label: "Reggel", sub: "Indítsuk a nappal a mozgást." },
      { v: "napkozben", icon: lxPaths.clock, label: "Napközben", sub: "Ebédszünet, vagy két meló közt." },
      { v: "este", icon: lxPaths.moon, label: "Este", sub: "A nap végén vezetem le a feszültséget." },
    ] satisfies OptionItem[],
  },

  env: {
    heading: "Van bármi, amire figyeljek?",
    sub: "Többet is választhatsz. Ehhez igazítom a variációkat.",
    exclusive: "none",
    options: [
      { v: "csendes", icon: lxPaths.volumeX, label: "Csendben kell", sub: "Szomszéd-barát, ugrálás nélkül." },
      { v: "fal", icon: lxPaths.house, label: "Van falam / székem", sub: "Tudok hozzá támaszkodni." },
      { v: "terd", icon: lxPaths.shield, label: "Kíméld a térdem", sub: "Adj alternatívát a térdelős részekre." },
      { v: "hat", icon: lxPaths.userRound, label: "Vigyázz a hátamra", sub: "Óvatosan a gerinc-terheléssel." },
      { v: "none", icon: lxPaths.check, label: "Nincs külön kérésem", sub: "Jöhet bármi, bírom." },
    ] satisfies OptionItem[],
  },

  // Obstacle — "what stopped you before?" (research: reflect it back on the
  // reveal, pre-empt the churn reason). Empathy, not failure. Single-select.
  obstacle: {
    heading: "Mi állított meg eddig?",
    sub: "Hogy tudjam, mire figyeljek — és mikor bátorítsalak. Nincs rossz válasz.",
    options: [
      { v: "ido", icon: lxPaths.clock, label: "Nem volt rá időm", sub: "Sose jött ki a naptárból." },
      { v: "motiv", icon: lxPaths.rotateCcw, label: "Elfogyott a lendület", sub: "Elkezdtem, de abbamaradt." },
      { v: "tudas", icon: lxPaths.search, label: "Nem tudtam, mit csináljak", sub: "Túl sok infó, semmi rendszer." },
      { v: "serules", icon: lxPaths.shield, label: "Fájdalom vagy sérülés", sub: "Óvatosnak kellett lennem." },
      { v: "elso", icon: lxPaths.play, label: "Most vágok bele először", sub: "Eddig nem próbáltam igazán." },
    ] satisfies OptionItem[],
  },

  why: {
    heading: "És miért most?",
    sub: "Egy mondat elég. Ezt később visszahozom neked — akkor, amikor nehéz lesz.",
    placeholder: "Pl. „Hogy a lépcsőn ne fulladjak ki, és bírjam a gyerekekkel.”",
    maxLength: 160,
    whisper: "„Ezt csak te fogod látni. Nem kell szépnek lennie — elég, ha igaz.”",
    cta: "Mehet",
    skip: "Most kihagyom",
  },

  // The reveal now CONSUMES every answer (research: perceived personalization =
  // echo the user's own inputs back). Copy is real & honest — NO weight numbers,
  // NO fixed program length, NO placeholder beats. The "trajectory" is effort/
  // consistency (days → monthly cadence + habit), never a body outcome.
  reveal: {
    eyebrow: "A te terved",
    whyLabel: "Amiért belevágtál",
    whyEcho: "Ezt viszem végig veled.",
    chipsLabel: "Ezt raktam össze neked",
    weekLabel: "Ez a heted",
    phaseLabel: "1. blokk · Alapozás",
    paceLabel: "A tempód",
    // {days}/{sessions} filled at render — computed, honest, no fixed length.
    paceLine: "Heti {days} edzés · havonta ~{sessions} alkalom",
    paceNote: "A lényeg a rendszer, nem a sebesség — pár hét, és magától megy.",
    workoutLabel: "Az első edzésed",
    social: "1 200+ csoporttag — akik már velünk csinálják.",
    whisper: "„Ezt a hetet a válaszaidból raktam össze. Ha nem passzol, együtt átírjuk.”",
    cta: "Mentsük el a tervedet",
    // Goal → the reveal headline (real per-goal capability line). Also reused at
    // the pay step. No beats, no fixed-length claim.
    outcomes: {
      ero: { headline: "Erősebb, energikusabb tested lesz." },
      forma: { headline: "Formálódsz — fokozatosan, fenntarthatóan." },
      vissza: { headline: "Visszatérsz a mozgáshoz — nulláról, szépen." },
      tartas: { headline: "Jobb tartás, kevesebb fájdalom." },
      szokas: { headline: "Végre meglesz a napi mozgás-szokásod." },
    } as Record<string, { headline: string }>,
    // Focus → a short chip phrase for the summary row.
    focusPhrase: {
      fenek: "Fenék-comb fókusz", core: "Törzs-fókusz", kar: "Felsőtest-fókusz",
      tartas: "Tartás-fókusz", teljes: "Teljes test",
    } as Record<string, string>,
    // Level → a tempo chip + how Alexa frames the pace.
    levelPhrase: { 1: "Nyugodt tempó", 2: "Lendületes tempó", 3: "Erős kihívás" } as Record<number, string>,
    // Env → a compact safety chip (the sentence-shaped envPhrase is too long here).
    envChip: { csendes: "Csendes", fal: "Támaszos", terd: "Térdkímélő", hat: "Hátkímélő" } as Record<string, string>,
    envChipMany: "Rád szabva",
    // Obstacle → Alexa's reassurance, reflected back (empathy, not failure).
    obstaclePhrase: {
      ido: "Tudom, hogy az idő a legszűkösebb — ezért napi 30 perc, és kész.",
      motiv: "A lendület el szokott fogyni — ezért viszlek végig, lépésről lépésre.",
      tudas: "Nem kell kitalálnod semmit — mindig megmondom, mi a következő.",
      serules: "Óvatosak leszünk — minden mozdulathoz van kíméletes változat.",
      elso: "Az első lépés a legnehezebb — innentől már együtt csináljuk.",
    } as Record<string, string>,
  },

  // Napszak → reveal phrasing (40 §40.5 "reggelente").
  timePhrase: { reggel: "reggelente", napkozben: "napközben", este: "esténként" } as Record<string, string>,
  // Env → reveal phrasing (40 §40.5 "csendes variációkkal").
  envPhrase: {
    csendes: "csendes variációkkal",
    fal: "támaszos variációkkal",
    terd: "térdkímélő variációkkal",
    hat: "hátkímélő variációkkal",
  } as Record<string, string>,
  envPhraseNone: "bármilyen variációval",
  envPhraseMany: "rád szabott variációkkal",
};

// (The subscribe fixture was removed — P6 built /subscribe from real PRICES, so
// the placeholder plan prices are gone. Deleting was a P9.3 audit fix.)

// ── First-entry fixture (40 §P1.5 / §40.9). ──
export const MOCK_FIRST_ENTRY = {
  hero: {
    kicker: "Kezdjük az elsőt",
    whisper: "„Itt vagyok. Az első nap a legnehezebb — utána már csak csináljuk.”",
    workout: { flag: "1. NAP", duration: "22 PERC", title: "Foundation · alapozás" },
  },
  reminder: {
    label: "Beállítanál egy emlékeztetőt?",
    // {time} filled from the `time` answer (reggel 07:15 · napközben 12:30 · este 19:30).
    bodyTemplate: "Reggel {time}-kor szólok az edzésnapjaidon.",
    decline: "Most nem",
    accept: "Beállítom",
  },
  reminderTimes: { reggel: "07:15", napkozben: "12:30", este: "19:30" } as Record<string, string>,
};
