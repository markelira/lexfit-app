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

// ─── §1 Landing — design-handoff rebuild (2026-09-08) ────────────────────────
//
// Source: ~/Downloads/design_handoff_ujrakezdes (README §5-§7 + wireframe).
// Every Hungarian string is the handoff's paste-ready copy, VERBATIM. The page
// asks for one thing, once: starting the quiz. No prices, no nav, no popups.
//
// Handoff open questions, resolved against repo truth:
//   Q1/Q2 the quiz lives at /ujrakezdes/terv - the CTA navigates there
//        client-side, forwarding every utm_* param (readUtm() reads them on
//        the quiz page at submit).
//   Q3  the calculator IS optional (built that way) - the page's claims about
//       it are true as written.
//   Q4  no consented member photos → S6 does not render, and the hero's
//       member-HUD card is omitted. No 30s Alexa video exists in the repo →
//       S7 shows her real photo without a fake play affordance.

export const LP = {
  /** S1 · hero. Three variants, picked SERVER-side from utm_content - an
   *  unknown or missing value falls back to `base`. The variant only swaps
   *  headline and lead; everything else is shared. */
  hero: {
    eyebrow: "Szeptemberi Újrakezdés",
    variants: {
      base: {
        hd: "7 kérdés, és kész a heti edzésterved.",
        lead: "Otthonra, eszköz nélkül, pihenőnapokkal - Alexával.",
      },
      ovatos: {
        hd: "Óvatos mozgás, vezetve.",
        lead: "Minden edzésnek van csendes, fal mellett végezhető változata, és mindet Alexa vezeti végig. Hét kérdés, és a terved ehhez igazodik.",
      },
      napvegi: {
        hd: "A nap végén is elég 20 perc.",
        lead: "Fáradtan hazaérni és még kitalálni, mi legyen - ez a legnehezebb rész. Ezért nálunk a terv készen vár: 20-30 perc, eszköz nélkül. Este kilenckor is működik.",
      },
    },
    antiAvatar: "Azoknak, akik már többször újrakezdték.",
    chips: ["Ingyenes", "Kb. 1 perc", "Az első edzés még ma"],
    second: "20-30 perces edzések · elég egy matrac · 1 200+ fős közösség",
    cta: "Kérem a tervem",
    ctaSub:
      "7 kérdés, nagyjából egy perc. Nem kell fiókot létrehozni - a kész tervet e-mailben küldjük, hogy TV-n és laptopon is megnyisd.",
    mechanism: "A pihenőnap a terv része. A kihagyott hét nem nulláz.",
    mechanismSub: "1 200+ fős közösség · a heti terv ingyenes, és a tiéd marad",
  },

  /** S1 · the card pair - the page's one ownable element (handoff §6): the
   *  empty week („majd hétfőn") behind, the finished plan in front. */
  mock: {
    emptyTag: "Ma",
    emptyNote: "„majd hétfőn”",
    bridge: "7 kérdés · kb. 1 perc",
    doneTag: "Egy perc múlva",
    doneNote: "Példa · a heti terved",
    /** H/Sze/P on, like every sample week on this funnel. */
    days: [
      { d: "H", on: true }, { d: "K", on: false }, { d: "Sze", on: true },
      { d: "Cs", on: false }, { d: "P", on: true }, { d: "Szo", on: false },
      { d: "V", on: false },
    ],
    stats1: [
      { v: "3", l: "nap / hét" },
      { v: "30", l: "perc" },
      { v: "0", l: "eszköz" },
    ],
    stats2: [
      { v: "1640", l: "kcal / nap" },
      { v: "8000", l: "lépés" },
      { v: "Start", l: "program" },
    ],
    /** Sample answer chips - the same tray vocabulary the quiz itself uses. */
    chips: ["újrakezdés", "heti 3 nap", "este", "nappali", "térdkímélő"],
    note: "Heti 3 nap, pihenőnapokkal, kalória- és lépéscéllal. A tiéd a válaszaidból készül.",
    dream: "Nem egy hetet kapsz. Egy hetet, ami kibírja a rossz heteket is.",
    /** The gate's mail preview echoes the person's REAL answers with this
     *  lead - shared here so the sample and the real artifact use one word. */
    answersLead: "A válaszaidból:",
  },

  /** S2 · what the quiz gives. The free offer is only worth something if it
   *  can be LISTED - five items, one sentence each, and the seven question
   *  topics up front so the length is never unknown. */
  results: {
    eyebrow: "A kvíz eredménye",
    hd: "Öt dolog, egy perc alatt.",
    lead: "Nem általános tanácsokat kapsz, hanem a saját válaszaidra épített tervet - azonnal, e-mailben is.",
    items: [
      { b: "A heti edzésterved", d: "Heti 2, 3 vagy 4 nap - te választod. Pihenőnapokkal, a te szintedhez igazítva." },
      { b: "A napi kalória-célod", d: "A szinten tartó és a célodhoz ajánlott érték, a megadott adataidból számolva." },
      { b: "A napi lépéscélod", d: "Hol tartasz most, és mi a reális következő lépcső - szakaszosan, nem egyszerre." },
      { b: "A rád szabott LEXFIT program", d: "Melyik programmal érdemes kezdened, és miért pont azzal." },
      { b: "Az első edzésed", d: "Konkrét videó, 20-30 perc, eszköz nélkül. Ma is elindíthatod." },
    ],
    qTitle: "Ezt kérdezzük",
    qChips: [
      "Mi a célod", "Mennyit mozogsz most", "Hány nap fér bele",
      "Mennyi idő egy alkalomra", "Mire figyeljünk", "Hol mozogsz", "Melyik napszak",
    ],
    qNote: "Hét kérdés, egy koppintás mindegyik. A kalória- és lépéscélhoz jön még három - az opcionális.",
  },

  /** S3 · the problem mirror. The first chip carries the ad's angle. */
  problem: {
    eyebrow: "A probléma",
    hd: "Ismerős?",
    body: "Hétfőn még megvolt a lendület. Csütörtökön közbejött valami. A jövő héten majd újra - aztán a jövő hétből hónap lett. Nem az akaraterővel van baj: azzal, hogy minden kihagyás után nulláról kell kezdeni.",
    listTitle: "Mind ugyanabba futnak bele.",
    chips: ["Az ötödik nekifutás", "A derék, a térd", "A nap vége"],
    lines: [
      "Van, aki már ötödször kezdte újra.",
      "Van, akinek a derék vagy a térd miatt kell óvatosabban.",
      "Van, akinek a nap végére semmi nem marad.",
    ],
  },

  /** S4 · the mechanism (navy). */
  mech: {
    eyebrow: "A mechanizmus",
    hd: "Egy rossz hét nem dönti el.",
    rules: [
      { b: "A pihenőnap nem töri meg a sorozatot.", d: "Előre be van tervezve. Nem kihagyás, hanem a terv része." },
      { b: "A kihagyott hét nem nulláz.", d: "Ott folytatod, ahol abbahagytad - nem elölről." },
    ],
    foot: "A LEXFIT-ben a pihenőnap nem töri meg a sorozatot, és a kihagyott hét nem nulláz - ott folytatod, ahol abbahagytad. A tervedet nem neked kell kitalálnod: hét kérdésből elkészül, és minden edzést Alexa vezet végig.",
  },

  /** S5 · how it looks - three real app screens. */
  how: {
    eyebrow: "Hogyan működik",
    hd: "Így néz ki",
    lead: "Három lépés, nagyjából egy perc.",
    shots: ["/step-1-question.png", "/step-2-plan.png", "/step-3-player.png"],
    steps: [
      "Válaszolsz 7 kérdésre - nagyjából egy perc.",
      "Megadod az e-mail címed, és megkapod a heti tervedet, pihenőnapokkal. A kalória- és lépéscélhoz három plusz kérdés jön - ez opcionális, a terved enélkül is kész.",
      "Az első edzést azonnal elindíthatod - 20-30 perc, eszköz nélkül.",
    ],
    foot: "A heti terv ingyenes, és a tiéd marad. A LEXFIT tagság fizetős - az árakat a terved mellett mutatjuk meg.",
  },

  /** S7 · Alexa (navy). Story + promise come from the shared ALEXA block. */
  alexa: {
    eyebrow: "Kivel csinálod",
    quote: "„Nulláról, egy matracon kezdtem újra.”",
    chips: ["10 év versenysport", "Minden edzést Alexa vezet", "1 200+ fős közösség"],
  },

  /** S8 · the close (accent). */
  close: {
    eyebrow: "Az első lépés",
    hd: "Kezdjük a heteddel.",
    lead: "Hét kérdés, és a terved kész. A heti terv ingyenes, és a tiéd marad. A LEXFIT tagság fizetős - az árakat a terved mellett mutatjuk meg.",
    cta: "Kérem a tervem",
    ctaSub: "7 kérdés · kb. 1 perc · ingyenes",
    legal: "Az e-mail címed a tervhez kell, hogy meg is maradjon. Bármikor leiratkozhatsz.",
    privacy: "Adatkezelési tájékoztató",
  },

  /** S · the mobile sticky bar. */
  sticky: {
    line: "7 kérdés, kb. 1 perc",
    sub: "ingyenes · nem kell regisztrálni",
    go: "Kérem a tervem",
  },
} as const;

/** The utm_content → hero-variant map (funnel_v2 §2.4 ad codes). Server-side
 *  only: the page component reads searchParams and passes the resolved
 *  variant down, so there is no client flash. Unknown → base. */
export type LpVariant = keyof typeof LP.hero.variants;
export function lpVariantFor(utmContent: string | undefined): LpVariant {
  if (!utmContent) return "base";
  if (/^(s4_|s5_|s15_)/.test(utmContent)) return "ovatos";
  if (/^s7_/.test(utmContent)) return "napvegi";
  return "base";
}

export const ALEXA = {
  heading: "Ki az az Alexa?",
  /** The pull quote, set in the homepage's own `.alexa-pull-big` treatment. Her
   *  sentence, not a slogan written about her. */
  pull: "„Nulláról, egy matracon kezdtem újra.”",
  /** The homepage's founder-facts chips. „1 200+ fős közösség" lives here now
   *  rather than in a band of its own - it is a fact about her world, and it
   *  was carrying a whole 276px section on its own before. */
  facts: ["10 év versenysport", "minden edzést Alexa vezet", "1 200+ fős közösség"],
  /** Split into two paragraphs: the story, then the promise. As one block the
   *  disclaimer („nem ígérek csodát") disappeared into the biography, and it is
   *  the half that answers the hype objection (offer_v2 §2 #10). */
  story:
    "Tíz évig versenyszerűen tornáztam, aztán évekig semmit. Nulláról, egy matracon kezdtem újra — ebből lett a LEXFIT.",
  promise:
    "Nem vagyok orvos és nem ígérek csodát. Egy rendszert ígérek, ami kibírja az életet.",
  name: "Alexa",
  /** Not "a LEXFIT alapítója": offer v3 §7 bans `alapító` because of the
   *  founder PRICE, and the guard cannot tell the two senses apart. Saying what
   *  she does for the reader is more useful than a job title anyway. */
  role: "ő vezet végig minden edzést",
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
  /** // COPY-REVIEW - not in the v2 spec. The beat now shows their actual week,
   *  so it needs one line naming what they are looking at. */
  eyebrow: "Ennyi már megvan",
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


/** The example week drawn in the hero. Labelled as an EXAMPLE on purpose: it is
 *  rendered before anybody has answered anything, and a week grid that looks
 *  like a personal plan would be promising one that does not exist yet. */
// ─── Sections ────────────────────────────────────────────────────────────────
//
// The progress bar names SECTIONS, not question numbers. "4 / 10" tells
// somebody how much work is left; it never tells them why they are doing it.
// Each label here is one or two words naming what that run of questions
// actually produces, so the chrome carries meaning instead of arithmetic.

export const SECTIONS = [
  { key: "start", label: "Kiindulás" },   // where they are starting from
  { key: "week", label: "A heted" },      // the schedule
  { key: "training", label: "Az edzéseid" }, // which workouts, in what variant
  // The last section was labelled „A számaid", which was a lie for everyone who
  // skipped the calculator: they still had to walk through a section promising
  // numbers they had just declined. „A terved" is true either way, and the
  // calorie block is part of the plan when it is taken.
  { key: "plan", label: "A terved" },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

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

// ─── §4 Reveal — the design-handoff rebuild (2026-09-08) ─────────────────────
//
// Source of truth: ~/Downloads/design_handoff_reveal (README §5-§6 + wireframe).
// Every Hungarian string is the handoff's paste-ready copy, VERBATIM - do not
// rephrase. The block order IS the design: plan + offer in the first viewport,
// everything below only dismantles objections.
//
// NO FORINT LITERALS. Every amount arrives as an already-formatted argument,
// interpolated in PlanWizard from PRICES (hard rule 6). The selftest sweeps
// this module for `\d Ft` and would catch a hardcoded price.
//
// Handoff open questions, resolved against repo truth (2026-09-08):
//   Q1 CTA → /register?plan=week_intro (planHref pattern; the pay step shows
//      the real renewal date via nextChargeLabel, so the microcopy is true).
//   Q2 monthly/annual cards are information, not buttons (wireframe rule).
//   Q3 guest playback DOES NOT EXIST (pay-to-join hard gate, locked P0) - the
//      guest button and every „vendégként" string are omitted per the
//      handoff's own instruction for that case.
//   Q4 no consented member photos → the HUD band (B5) does not render at all.
//   Q5 the 490 intro continues as weekly 1 990 (repo reality); the honesty
//      line about monthly being cheaper stays.

export const REVEAL = {
  /** B0 · the quiz's own progress, held at 88% until payment. The bar not
   *  reaching 100% is the point: the quiz is done, the plan is not. */
  progress: { done: "Kész a kvíz", left: "1 lépés", pct: 88 },

  /** B1 · the plan card. */
  b1: {
    eyebrow: "A terved · Szeptemberi Újrakezdés",
    hd: "A heted, készen.",
    sub: (days: number, sessionLabel: string) =>
      `${days} nap mozgás, ${sessionLabel}, a te szintedhez igazítva. A pihenőnap is a terv része.`,
    identity: "Nem egy hét a cél. Az, hogy fél év múlva ne kelljen újrakezdened.",
    chipsAria: "Amikből a terv készült",
    /** The milestone chain. Labels are the handoff's (15 = „félidő" here even
     *  though the shared MILESTONES notes it as visszamérés - display copy
     *  follows the handoff verbatim). Index 2 (the 10th) carries the accent. */
    milestones: ["1. edzés", "5.", "10. — garancia", "15. félidő", "30. visszamérés"],
    guardIdx: 2,
    stats: { days: "nap / hét", mins: "perc / edzés", equip: "eszköz" },
    calc: (kcal: string, steps: string) =>
      `Ha a kalkulátort is kitöltötted: ${kcal} kcal napi cél · ${steps} lépés — becslés a megadott adataid alapján.`,
  },

  /** B2 / desktop rail / sticky bar - one offer, three placements. */
  offer: {
    proofGuar: "10 edzés garancia",
    proofRest: " · 1 200+ ember mozog velünk otthon",
    proofNoGuar: "1 200+ ember mozog velünk otthon",
    cta: (intro: string) => `Kezdem — az első hét ${intro}`,
    renew: (weekStd: string) =>
      `Utána ${weekStd} / hét — a megújítás dátumát a fizetés előtt megmutatjuk. Bármikor lemondható.`,
  },

  /** B3 · the mechanism. The failure is written onto the system, never the
   *  person - that is the whole psychological argument of the page. */
  b3: {
    eyebrow: "Ismerős?",
    body: "Hétfőn még megvolt a lendület. Csütörtökön közbejött valami. A jövő héten majd újra — aztán a jövő hétből hónap lett. Nem az akaraterővel van baj: azzal, hogy minden kihagyás után nulláról kell kezdeni.",
    rules: [
      "A pihenőnap nem töri meg a sorozatot.",
      "A kihagyott hét nem nulláz — ott folytatod, ahol abbahagytad.",
    ],
  },

  /** B4 · the first workout. No guest button (Q3): the cover, the claim and
   *  the milestone reframe stand on their own. */
  b4: {
    eyebrow: (day: string) => `Az első edzésed · ${day}`,
    hd: "Az első pipa ma este megvan.",
    sub: (mins: number) =>
      `${mins} perc, eszköz nélkül. Az első mérföldkő nem 30 edzés — öt.`,
  },

  /** B6 · the entry. The one price the page asks about. */
  entry: {
    eyebrow: "Ez a heted. Ha rendszert szeretnél belőle:",
    hd: (intro: string) => `Az első hét ${intro}.`,
    lead: (weekStd: string) =>
      `Teljes hozzáférés az első naptól — nem próbaverzió. Utána ${weekStd} / hét, vagy válts havira és évesre.`,
    listTitle: "Egy tagság, minden benne",
    items: [
      { k: "30", b: "Teljes edzés program", d: "30 vezetett edzés, max 30 perc, eszköz nélkül. A te tempódban, heti 2, 3 vagy 4 nap." },
      { k: "07", b: "7 napos kezdő program", d: "napi 8-10 perc, csendes, ízületkímélő. Hogy hétből hetet teljesíts." },
      { k: "03", b: "Reggeli rutinok", d: "három napindító, 5-8 perc, pizsamában is." },
      { k: "03", b: "Esti rutinok", d: "három rutin, 6-8 perc, lassú tartások, átvezetnek az alvásba." },
      { k: "05", b: "Has & Mély Törzs", d: "öt nap, 10-15 perc. Stabil törzs és jobb tartás, nem kockás has." },
      { k: "05", b: "Láb & Fenék", d: "öt nap, 10-15 perc. Guggolás, csípőemelés, kitörés, lassan." },
      { k: "04", b: "Tartásjavító", d: "négy hét, heti egy új edzés. A monitor előtti görnyedés két oka ellen." },
      { k: "16+", b: "Heti kihívás archívum", d: "minden héten 5 új videó." },
      { k: "✓", b: "Mérföldkövek és visszamérés", d: "1 · 5 · 10 · 15 · 30 · szünet 1-3 hónapra" },
    ],
    rhythmTitle: "A ritmust később is átállíthatod",
    monthTag: "/ hó · mint egy edzőóra",
    annualTag: (perMonth: string, pct: number) => `/ év · ${perMonth} / hó · −${pct}%`,
    same: "Mindhárom tagságban ugyanaz van: minden program, minden edzés, minden új heti tartalom. Csak a ritmus más.",
    honestyLead: "Ha tudod, hogy maradsz, a havi olcsóbb.",
    honesty: (weeklyMonthly: string, month: string) =>
      ` A heti ritmus havi szinten ${weeklyMonthly} — a havi tagság ${month}.`,
    later: "A ritmust a fizetés után, egy kattintással állítod át. Most csak az első hét kérdés.",
    youtube: "A videó ingyen is megvan. A sorrend, a terv és a vezetés — az a tagság.",
  },

  /** B7 · the guarantee band. Body and statutory line come from the shared
   *  GARANCIA (offer-copy) - one source for every surface. */
  guarEyebrow: "Mielőtt bármit fizetnél",

  /** B8 · Alexa. Story + promise from the shared ALEXA block above. */
  alexaEyebrow: "Ki az az Alexa?",
  alexaSigned: "„Ezt személyesen vállalom.” — Alexa",

  /** B9 · the anti-avatar. */
  notFor: {
    eyebrow: "Kinek nem való",
    body: "Minden edzésnek van csendes, ugrálásmentes és fal mellett végezhető változata. De nem vagyunk orvosok: ha kezelés alatt állsz, előbb kérdezd meg az orvosod.",
  },

  /** B10 · FAQ. #3 references the guarantee, so it is filtered while the
   *  guarantee is dark. */
  faq: [
    { q: "Mi van, ha kihagyok egy hetet?", a: "Ott folytatod, ahol abbahagytad — nálunk nincs „lemaradás”.", guar: false },
    { q: "Meddig tart a Start program?", a: "30 edzés, a te tempódban. Nem az idő számít, hanem hogy a 30 meglegyen.", guar: false },
    { q: "Hogyan működik a 10 edzés garancia?", a: "Egy e-mail a hi@lexfit.hu-ra, és visszautaljuk a befizetett díjaidat.", guar: true },
    { q: "Szüneteltethetem?", a: "Igen, 1–3 hónapra, egy kattintással — a haladásod megmarad.", guar: false },
    { q: "Kell hozzá eszköz?", a: "Nem. Elég egy matrac és 2×2 méter.", guar: false },
  ],
  faqTitle: "GYIK",

  /** B11 · the close. */
  close: {
    quote: "„Nem az a kérdés, bírod-e egyben. Az, hogy mi történik, amikor jön egy rossz hét.”",
    by: "— Alexa",
    sub: "Nem kell ma biztosnak lenned: az első 10 edzésre garancia van.",
    subNoGuar: "Bármikor lemondhatod, egy kattintással.",
    later: "Most nem? A terved így is a tiéd — e-mailben is elküldtük, hogy TV-n vagy laptopon is megnyithasd.",
    trust: "Stripe · e-számla · 14 napos elállás · bármikor lemondható egy kattintással",
  },

  /** S · the mobile sticky bar. Desktop has none - the rail is the price. */
  sticky: {
    line: (intro: string) => `Az első hét ${intro}`,
    sub: (weekStd: string) => `utána ${weekStd} / hét · bármikor lemondható`,
    go: "Kezdem",
  },
} as const;

/** B8's personal signature, kept as its own export because the guarantee ops
 *  emails reference the same wording. */
export const GUARANTEE_BLOCK = {
  eyebrow: "Mielőtt bármit fizetnél",
  signedLead: "Ezt személyesen vállalom.",
  signedName: "Alexa",
} as const;

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

  /** The screen has to answer "why am I being asked this?" before it asks.
   *  "Alapadatok" named the fields; it never named the outcome. */
  formHeading: "Kiszámoljuk a kalóriacélod",
  formSub: "Ebből jön ki a napi kalória- és fehérjecélod, és a napi lépéscélod — a heti terved mellé.",
  formMicro: "Csak a számoláshoz kell. Bármikor kérheted a törlésüket.",
  /** Shown when every field is filled but the Art. 9 consent is not ticked.
   *  The consent cannot be required - that is the whole point - but walking on
   *  in silence and then showing no numbers at the end is a dead end nobody can
   *  diagnose. So the screen says what will happen, and still lets them pass. */
  consentMissing:
    "A számoláshoz a hozzájárulásod is kell. Enélkül is továbbmehetsz — a heti terved ugyanúgy elkészül, csak a napi célok maradnak ki.",

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
  goalSub: "Ez dönti el, hogy a napi célod deficit, fenntartás vagy többlet lesz.",
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

/**
 * The calculator's opt-in beat, asked after the seventh question.
 *
 * Every ad promises „7 kérdés". The calculator adds three, so it is offered
 * rather than assumed - which protects the ad-to-page promise AND is the only
 * shape that makes the Art. 9 consent visibly freely given. Declining goes
 * straight to the gate; the plan is identical either way.
 */
export const CALC_INVITE = {
  hd: "Kérsz mellé napi kalóriacélt is?",
  sub: "Három kérdés, és a heti terved mellé megkapod a napi kalória- és fehérjecélod, meg a napi lépéscélod.",
  helper: "A hét kérdés megvan, a terved kész. Ez ráadás — nélküle is a tiéd.",
  yes: "Kérem, három kérdés",
  no: "Köszönöm, elég a terv",
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
