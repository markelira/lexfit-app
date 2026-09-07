// Lead magnet v2 - every user-visible string for /ujrakezdes, in one place.
//
// SINGLE-SOURCE RULE, same as src/components/landing/offer-copy.ts: the copy is
// the product on this surface, marketing iterates on it, and a claim buried in
// JSX is a claim nobody re-reads.
//
// NO AMOUNTS LIVE HERE. The offer block on the reveal renders <PricingBand>,
// which interpolates every forint from PRICES via @/lib/pricing/display (offer
// v3 hard rule 6). This module can therefore never quote a stale price.
//
// Copy is verbatim from the Lead Magnet v2 spec (§1-§4). Do not "improve" it:
// the register is deliberate - no exclamation marks, no weight-loss
// vocabulary, no second-person health assumptions. Every place where v2's text
// could NOT be pasted is marked // COPY-REVIEW with the rule that forced it,
// and listed in docs/lead-magnet-v2-plan.md §3.

import type { Anchor, Care, Daypart, Days, Focus, Level, Place } from "@/lib/ujrakezdes/types";
import { lxPaths } from "@/lib/icons";

// ─── §1 Landing ──────────────────────────────────────────────────────────────

export const HERO = {
  headline: "Szeptemberi újrakezdés",
  sub: "7 kérdés, és kész a heti edzésterved. Otthonra, eszköz nélkül, pihenőnapokkal — Alexával.",
  audience: "Azoknak, akik már többször újrakezdték.",
  cta: "Kérem a tervem",
  chips: ["20–30 perces edzések", "elég egy matrac", "1 200+ fős közösség"],
} as const;

export const ISMEROS = {
  heading: "Ismerős?",
  body: "Hétfőn még megvolt a lendület. Csütörtökön közbejött valami. A jövő héten majd újra — aztán a jövő hétből hónap lett. Nem az akaraterővel van baj. Azzal, hogy minden kihagyás után nulláról kell kezdeni.",
} as const;

export const MASKEPP = {
  heading: "Ezért másképp működik",
  body: "A LEXFIT-ben a pihenőnap nem töri meg a sorozatot, és a kihagyott hét nem nulláz — ott folytatod, ahol abbahagytad. A tervedet nem neked kell kitalálnod: hét kérdésből elkészül, és minden edzést Alexa vezet végig.",
} as const;

export const IGY_NEZ_KI = {
  heading: "Így néz ki",
  steps: [
    "Válaszolsz 7 kérdésre — nagyjából egy perc.",
    "Megkapod a heti tervedet, pihenőnapokkal.",
    "Az első edzést azonnal elindíthatod — 20–30 perc, eszköz nélkül.",
  ],
} as const;

export const ALEXA = {
  heading: "Ki az az Alexa?",
  body: "Tíz évig versenyszerűen tornáztam, aztán évekig semmit. Nulláról, egy matracon kezdtem újra — ebből lett a LEXFIT. Nem vagyok orvos és nem ígérek csodát. Egy rendszert ígérek, ami kibírja az életet.",
} as const;

// ─── §2 Quiz ─────────────────────────────────────────────────────────────────

export interface Choice<T extends string> {
  value: T;
  label: string;
  /** The second line on the option row. The /register wizard gives every option
   *  one, and without it the rows read as a bare list rather than as choices
   *  with consequences. // COPY-REVIEW - not supplied by the v2 spec. */
  sub?: string;
  /** lxPaths value for the 34px tile. The tile always renders, so an option
   *  without one shows an empty square. */
  icon?: string;
}

export const Q_ANCHOR = {
  hd: "Mi hozott ide?",
  options: [
    { value: "restart", label: "Újra rendszeresen mozognék", sub: "Volt már, hogy ment — most maradjon is meg.", icon: lxPaths.rotateCcw },
    { value: "careful", label: "Óvatosan mozognék", sub: "A hátam, az ízületeim miatt figyelnem kell.", icon: lxPaths.shield },
    { value: "no_energy", label: "A nap végén nincs energiám", sub: "Elkezdeni a nehéz, nem maga a mozgás.", icon: lxPaths.moon },
    { value: "stronger", label: "Erősödnék, formálódnék", sub: "Van alapom, csak kell hozzá egy rend.", icon: lxPaths.dumbbell },
    { value: "browsing", label: "Csak körülnézek", sub: "Még nem döntöttem el semmit.", icon: lxPaths.eye },
  ] as Choice<Anchor>[],
};

export const Q_LEVEL = {
  hd: "Mennyire mozogsz mostanában?",
  options: [
    { value: "none", label: "Szinte semennyit", sub: "Nulláról indulunk — ez teljesen rendben van.", icon: lxPaths.house },
    { value: "rare", label: "Néha, rendszertelenül", sub: "Van mozgás, csak nincs mögötte rendszer.", icon: lxPaths.clock },
    { value: "weekly", label: "Hetente egyszer-kétszer", sub: "Megvan az alap, erre lehet építeni.", icon: lxPaths.calendarCheck },
    { value: "regular", label: "Rendszeresen", sub: "Csak egy keret hiányzik, ami összefogja.", icon: lxPaths.gauge },
  ] as Choice<Level>[],
};

export const Q_DAYS = {
  hd: "Hány nap férne bele egy hetedbe?",
  options: [
    { value: "2", label: "2 nap", sub: "Kevés, de tartható — ez többet ér, mint a semmi." },
    { value: "3", label: "3 nap", sub: "A legtöbb embernek ez a jó egyensúly." },
    { value: "4", label: "4 nap", sub: "Sűrűbb ritmus, még mindig három pihenőnappal." },
    { value: "flex", label: "Ahogy jön", sub: "Legyen rugalmas — hárommal számolunk.", icon: lxPaths.sliders },
  ] as Choice<Days>[],
};

export const Q_FOCUS = {
  hd: "Hol szeretnél erősödni?",
  micro: "Erre teszünk külön hangsúlyt — később bármikor módosítható.",
  options: [
    { value: "fenek", label: "Fenék, comb", sub: "Stabil, erős alsótest.", icon: lxPaths.flame },
    { value: "core", label: "Has, törzs", sub: "Erős törzs, biztos tartás.", icon: lxPaths.gauge },
    { value: "felso", label: "Kar, váll", sub: "Feszes, erős felsőtest.", icon: lxPaths.dumbbell },
    { value: "tartas", label: "Hát, tartás", sub: "Egyenes gerinc, nyitott mellkas.", icon: lxPaths.userRound },
    { value: "teljes", label: "Teljes test", sub: "Mindenből egyensúlyban.", icon: lxPaths.layoutGrid },
  ] as Choice<Focus>[],
};

/** Between Q4 and Q5, auto-advancing. The two rules, stated before they are
 *  asked about their knees - so the caution question lands as care, not risk. */
export const INTERSTITIAL = {
  lines: [
    "A terved pihenőnapokkal készül.",
    "A kihagyott hét nálunk nem nulláz.",
  ],
  /** ~2 s per the spec. Reduced-motion users get the same beat, no animation. */
  holdMs: 2000,
} as const;

export const Q_CARE = {
  hd: "Mire figyeljünk a testednél?",
  micro: "többet is jelölhetsz",
  options: [
    { value: "knee", label: "Térd", sub: "Ugrálás nélkül, becsapódásmentes párokkal.", icon: lxPaths.shield },
    { value: "back", label: "Derék, hát", sub: "Kíméletes felépítés, biztonságos gyakorlatokkal.", icon: lxPaths.userRound },
    { value: "quiet", label: "Csendben kell edzenem", sub: "Alvó gyerek, szomszédok — van csendes változat.", icon: lxPaths.volumeX },
    { value: "none", label: "Semmi különös", sub: "Jöhet bármi, bírom.", icon: lxPaths.check },
  ] as Choice<Care>[],
  cta: "Tovább",
};

export const Q_PLACE = {
  hd: "Hol fogsz mozogni?",
  options: [
    { value: "living_room", label: "Nappaliban, matracon", sub: "A leggyakoribb — pont erre épül minden edzés.", icon: lxPaths.house },
    { value: "small", label: "Kisebb helyen", sub: "Két négyzetméter is elég hozzá.", icon: lxPaths.layers },
    { value: "varied", label: "Változó helyeken", sub: "Nincs fix hely — ahol épp vagy.", icon: lxPaths.layoutGrid },
  ] as Choice<Place>[],
};

export const Q_DAYPART = {
  hd: "Napszak, ami reális nálad?",
  options: [
    { value: "morning", label: "Reggel, munka előtt", sub: "Amíg még nem jött közbe semmi.", icon: lxPaths.gauge },
    { value: "midday", label: "Napközben", sub: "Ebédszünet, vagy két dolog között.", icon: lxPaths.clock },
    { value: "evening", label: "Este, a nap végén", sub: "Levezetésnek, a nap után.", icon: lxPaths.moon },
    { value: "varies", label: "Mindig máskor", sub: "Nem tervezhető — a terv ehhez igazodik.", icon: lxPaths.sliders },
  ] as Choice<Daypart>[],
};

// ---- The tray: answers echoed back as you go ------------------------------
//
// Each answer drops a chip here, so the quiz reads as BUILDING something rather
// than filling a form. The labels are short restatements of what they picked -
// never a score, never a grade. This audience has failed at fitness before;
// inventing a number they can do badly at is the one thing this funnel must not
// do. (docs/onboarding-personalization-plan.md 5 recommends exactly this:
// "answers echoed back as labelled chips".)

export const TRAY = {
  heading: "A terved",
  anchor: {
    restart: "újrakezdés", careful: "kíméletes", no_energy: "esti energia",
    stronger: "erősödés", browsing: "körülnézek",
  } as Record<Anchor, string>,
  level: {
    none: "nulláról", rare: "néha mozogsz", weekly: "heti 1-2", regular: "van bázisod",
  } as Record<Level, string>,
  days: { "2": "2 nap", "3": "3 nap", "4": "4 nap", flex: "rugalmas" } as Record<Days, string>,
  focus: {
    fenek: "fenék, comb", core: "has, törzs", felso: "kar, váll",
    tartas: "hát, tartás", teljes: "teljes test",
  } as Record<Focus, string>,
  care: {
    knee: "térdkímélő", back: "derékkímélő", quiet: "csendes", none: "nincs korlát",
  } as Record<Care, string>,
  place: { living_room: "nappali", small: "kis hely", varied: "változó hely" } as Record<Place, string>,
  daypart: { morning: "reggel", midday: "napközben", evening: "este", varies: "váltakozó" } as Record<Daypart, string>,
} as const;

// ─── §3 Gate ─────────────────────────────────────────────────────────────────

export const GATE = {
  hd: "Kész a terved.",
  sub: "Hova küldjük, hogy meg is maradjon?",
  emailPlaceholder: "e-mail címed",
  emailLabel: "E-mail cím",
  consent:
    "Kérem mellé Alexa 6 napos induló sorozatát és a LEXFIT híreit e-mailben. Bármikor, egy kattintással leiratkozhatsz.",
  cta: "Mutasd a tervem",
  ctaBusy: "Küldjük…",
  fine: "A tervet enélkül is elküldjük erre a címre.",
  privacy: "Adatkezelési tájékoztató",
  emailError: "Kérlek, ellenőrizd az e-mail címed.",
  networkError:
    "Nem sikerült elküldeni — ellenőrizd a netkapcsolatod, és próbáld újra.",
} as const;

/** The consent text version recorded with every submission (spec §3). Bump this
 *  string and the copy above together, never one alone: a consent log naming a
 *  version whose wording nobody kept is a log that proves nothing. */
export const CONSENT_TEXT_VERSION = "consent_lm_v1";

// ─── §4 Reveal ───────────────────────────────────────────────────────────────

export const REVEAL = {
  hd: "A heted, készen",
  /** "3 nap mozgás, 20–30 perc, a te szintedhez igazítva." - the numbers come
   *  from the answers, so the sentence is assembled rather than pasted. */
  sub: (days: number, sessionLabel: string) =>
    `${days} nap mozgás, ${sessionLabel}, a te szintedhez igazítva. A pihenőnap is a terv része.`,
  restLabel: "pihenőnap",

  // COPY-REVIEW. v2 §4's first-workout block reads "Kezdd el az első edzést —
  // most, vendégként is." LEXFIT has a pay-to-join hard gate (src/lib/billing.ts)
  // and the locked P0 decision is "no free workout", so a guest player does not
  // exist and promising one would be the funnel's first broken promise. Written
  // in the same register, saying only what is true. Owner decision 2026-09-07,
  // docs/lead-magnet-v2-plan.md §2.
  firstWorkout: {
    lead: "Az első edzésed",
    body: (minutes: number) =>
      `${minutes} perc, eszköz nélkül. Ott vár a tagságodban, az első naptól — ma vagy hétfőn kezded, mindegy.`,
  },

  alexaVideo: {
    heading: "Alexa neked",
    /** The 30-second script, verbatim from v2 §4. Used as the caption/transcript
     *  so the page still says it when the video cannot play. */
    transcript:
      "Szia, Alexa vagyok. Ez a terv mostantól a tiéd — és igen, direkt van benne pihenőnap. Nem az a kérdés, hogy bírod-e egyben a tíz hetet. Az a kérdés, mi történik, amikor jön egy rossz hét. Nálunk annyi: ott folytatod, ahol abbahagytad. Az első edzés húsz perc. Nem kell ma elkezdened — de ha ma kezded, holnap már könnyebb lesz. Ott találkozunk.",
  },

  footer: "A tervet elküldtük e-mailben is, hogy TV-n vagy laptopon is megnyithasd.",
} as const;

/** Q5 → the one line the reveal adds about how the plan was adjusted. Each is a
 *  restatement of their own answer, never a claim about their body. */
export const CARE_NOTE: Record<Exclude<Care, "none">, string> = {
  knee: "Ugrálás nélküli változat — minden gyakorlatnak van becsapódásmentes párja.",
  back: "Kíméletes felépítés, a deréknak biztonságos gyakorlatsorral.",
  quiet: "Csendes változat: ugrás és dobbantás nélkül, alvó gyerek mellett is megy.",
};

/** Q1 → the D3 postscript. `restart` deliberately has none: the base mail is
 *  already written to them, and a postscript restating it would be filler. */
export const SEGMENT_PS: Partial<Record<Anchor, string>> = {
  careful:
    "Ui. Ha az ízületeid miatt vagy óvatos: minden edzésnek van csendes, fal mellett végezhető változata — és az is teljes értékű.",
  no_energy:
    "Ui. Ha estére semmi nem marad: a Napzáró rutinok 6–8 percesek. Az is mozgás.",
  stronger:
    "Ui. A terv fokozatosan nehezedik — a 30 edzés alatt észre fogod venni, csak nem az első héten.",
  browsing:
    "Ui. Nyugodtan nézelődj. A terved addig is megvár.",
};

export const NAV = {
  pickHint: "Válassz egyet",
  back: "Vissza",
  progress: (a: number, b: number) => `${a}/${b}`,
} as const;

// ─── Energy module (opt-in, after the reveal) ────────────────────────────────
//
// ⚠️ SCOPED WAIVER OF OFFER V3 HARD RULE 3.2. Everything above this line obeys
// the no-weight-loss-vocabulary rule. This block does not, and cannot: a
// calorie target is a weight-management number, and naming the goal „fogyás" is
// the honest word for what the arithmetic does. Owner decision 2026-09-07,
// taken with the rule stated - see docs/lead-magnet-v2-plan.md.
//
// The waiver is kept as NARROW as the maths requires. Still excluded, because
// nothing here needs them:
//   - no „zsírégetés", „kockás has", „bikini test", before/after
//   - no BMI category labels („Túlsúlyos", „Elhízott")
//   - no goal-weight projection and no „X kg Y hét alatt" timeline
//   - no second-person health assumption; the goal is something they pick,
//     never something we infer about their body
// The selftest asserts each of those, so the waiver cannot quietly widen.

export const ENERGY = {
  /** The invitation on the reveal. Opt-in: nothing is asked before this. */
  teaserHeading: "Kiszámoljuk a napi kalóriacélod?",
  teaserBody:
    "Ha szeretnéd, a testadataidból kiszámoljuk a napi kalória- és fehérjecélod, és a napi lépéscélod. Nem kötelező — a heti terved enélkül is a tiéd.",
  teaserCta: "Kiszámolom",

  formHeading: "Néhány adat, és kész",
  formMicro: "Csak a számoláshoz kell. Bármikor kérheted a törlésüket.",

  sexLabel: "Nem",
  sexOptions: [
    { value: "female", label: "Nő" },
    { value: "male", label: "Férfi" },
  ] as Choice<"female" | "male">[],
  sexMicro: "A képlet férfi és női szervezetre eltérő alapanyagcserével számol.",

  ageLabel: "Kor",
  heightLabel: "Magasság (cm)",
  weightLabel: "Testsúly (kg)",

  goalLabel: "Mi a célod?",
  goalOptions: [
    { value: "fogyas", label: "Fogyás" },
    { value: "tonus", label: "Tónusosodás" },
    { value: "tomeg", label: "Izomépítés" },
  ] as Choice<"fogyas" | "tonus" | "tomeg">[],

  tempoLabel: "Milyen tempóban?",
  tempoOptions: [
    { value: "laza", label: "Laza" },
    { value: "kozepes", label: "Közepes" },
    { value: "intenziv", label: "Intenzív" },
  ] as Choice<"laza" | "kozepes" | "intenziv">[],
  tempoMicro: "A közepes a legtöbb embernek jó kiindulás. Bármikor átállíthatod.",

  consent:
    "Hozzájárulok, hogy a LEXFIT a megadott testadataimat (nem, kor, magasság, testsúly) a kalóriacélom kiszámításához kezelje. Ezeket az adatokat bármikor töröltethetem.",


  // -- The three steps, as in the source calculator: Adatok, Tempo, Eredmeny.
  // (Its fourth step is an email gate; ours is already the quiz's own gate, so
  // asking again here would be asking twice for the same address.)
  steps: ["Adatok", "Tempó", "Eredmény"] as const,

  card1: "Alapadatok",
  card2: "Célod",
  card3: "Tempó",

  tempoHeading: "Válassz tempót",
  tempoTag: {
    fogyas: "Fogyás",
    tonus: "Tónusosodás",
    tomeg: "Izomépítés",
  } as Record<"fogyas" | "tonus" | "tomeg", string>,
  tempoLead: {
    fogyas: "Mindhárom biztonságos — a különbség a sebesség és a fenntarthatóság egyensúlya.",
    tonus: "Itt az erősítés és a fehérje a fontos; a kalória csak finomhangolás.",
    tomeg: "A többlet mérete dönti el, mennyi izom és mennyi zsír épül mellé.",
  } as Record<"fogyas" | "tonus" | "tomeg", string>,
  tempoName: { laza: "Laza", kozepes: "Közepes", intenziv: "Intenzív" } as Record<string, string>,
  tempoDesc: {
    fogyas: {
      laza: "Minimális izomvesztés, hosszú távon könnyen tartható.",
      kozepes: "A szakmailag ajánlott alap. Jó egyensúly tempó és tarthatóság között.",
      intenziv: "Biztonságos tartományon belül, de nagyobb fegyelmet kér.",
    },
    tonus: {
      laza: "Fenntartó kalória — a legtisztább átalakulás, türelmesen.",
      kozepes: "Enyhe deficit. A legtöbb embernek ez a jó kiindulás.",
      intenziv: "Erősebb zsírvesztési fókusz, az izom megőrzése mellett.",
    },
    tomeg: {
      laza: "Lassú, minőségi izomépítés, minimális zsírral.",
      kozepes: "Az ajánlott alap — észrevehető fejlődés, kordában tartva.",
      intenziv: "Gyorsabb építés, valamivel több zsírral együtt.",
    },
  } as Record<string, Record<string, string>>,
  tempoRecommended: "Ajánlott",

  resultHeading: "A napi célod",
  resultEyebrow: "A napi kalóriacélod",
  macroHeading: "Makrótápanyagok",
  perDay: "naponta",
  weekSplitLabel: (n: number) => `× ${n} perces edzés / hét`,
  stepsSplitLabel: "lépés / nap ajánlott",
  waterEyebrow: "Napi vízfogyasztás",
  waterUnit: "liter",

  back: "Vissza",
  next: "Tovább",
  skip: "Kihagyom",
  submit: "Mutasd az eredményem",
  submitBusy: "Számoljuk…",
  error: "Ellenőrizd az adatokat — a mezőknek valós értéket kell tartalmazniuk.",

  // ── Results ──
  kcalLabel: "napi kalória",
  proteinLabel: "fehérje",
  carbsLabel: "szénhidrát",
  fatLabel: "zsír",
  stepsLabel: "napi lépés",
  waterLabel: "víz naponta",

  /** The workout half. The session count is NOT repeated here - the plan above
   *  already answered it, and two numbers for one question is worse than one. */
  workoutHeading: "Mivel kezdd",
  workoutLead: (days: number) =>
    `A heti ${days} edzésnapodra ezt ajánljuk — a tagságban mind a kettő benne van.`,

  /** Shown when the deficit would have gone under the safety floor. */
  flooredNote:
    "A célod ennél alacsonyabb értéket adna, de nem megyünk lejjebb — ennyi kalória alatt már szakember felügyelete kell hozzá.",

  /** The one honesty line. Not a disclaimer to hide: it is the register. */
  disclaimer:
    "Ezek becsült értékek, tájékoztató jelleggel — nem minősülnek orvosi vagy dietetikai tanácsnak. Ha bármilyen krónikus betegséged van, vagy kezelés alatt állsz, beszéld meg az orvosoddal.",

  recalcCta: "Újraszámolom",
} as const;

// ─── The Foundation programme on the reveal ─────────────────────────────────

export const PROGRAM_PREVIEW = {
  heading: "Ez vár rád",
  /** The count comes from the live catalogue, never from a literal - the
   *  programme is authored in /admin and a hardcoded number would go stale the
   *  first time somebody adds a session. */
  lead: (n: number) =>
    `A LEXFIT Start mind a ${n} edzése, sorrendben. Nyisd meg bármelyiket — megnézheted, mi van benne, mielőtt bármit fizetnél.`,
  foot: "Az edzések a tagsággal indíthatók. A heti terved enélkül is a tiéd marad.",
  modalCta: "Ezzel kezdenék",
} as const;

/**
 * The energy module is ON by default - owner decision 2026-09-07, taken after
 * the Art. 9 position was put in writing three times.
 *
 * The switch survives as an OFF switch: set NEXT_PUBLIC_ENERGY_MODULE=0 to pull
 * the module without a deploy if counsel asks for it. What it no longer does is
 * hide the feature from the person who asked for it.
 *
 * ⚠️ STILL OUTSTANDING, and not something code can close: the amendment at
 * docs/legal/adatkezelesi-tajekoztato-kviz-modositas-TERVEZET.md must be
 * approved and published with a real effective date before this collects body
 * metrics from real traffic.
 */
export const ENERGY_LIVE = process.env.NEXT_PUBLIC_ENERGY_MODULE !== "0";

/** The consent wording version recorded with every body-block submission. */
export const CONSENT_HEALTH_VERSION = "consent_lm_health_v1";
