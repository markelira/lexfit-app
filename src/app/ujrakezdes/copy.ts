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
  /** The campaign wrapper, demoted from headline to eyebrow. Three ad angles
   *  point at this page; the H1 has to be the thing all three promised, and
   *  what they all promised is the plan - not the season. Message match is
   *  worth up to +212% (docs/funnel-research/03-landing-page.md). */
  eyebrow: "Szeptemberi Újrakezdés",
  /** Two lines, second emphasised - the homepage's own h1 treatment, so the two
   *  pages set their headline identically. */
  headline: ["7 kérdés, és kész", "a heti edzésterved"] as const,
  sub: "Otthonra, eszköz nélkül, pihenőnapokkal — Alexával.",
  audience: "Azoknak, akik már többször újrakezdték.",
  cta: "Kérem a tervem",
  ctaSub: "Nagyjából egy perc. Regisztráció nélkül.",
  /** The damaging admission, at the CTA. Fewer leads, better ones - and nobody
   *  meets the pricing band at the end feeling ambushed. Owner decision
   *  2026-09-08. */
  honest:
    "A heti terv ingyenes, és a tiéd marad. A LEXFIT tagság fizetős — az árakat a terved mellett mutatjuk meg.",
  /** offer v3 §3.1's chips, not lead-magnet v2's. „20–30 perces edzések" was
   *  the older number; „max 30 perc" is the migrated one. */
  chips: ["max 30 perc", "elég egy matrac", "heti 2–4 nap — te választod"],
} as const;

export const ISMEROS = {
  heading: "Ismerős?",
  body: "Hétfőn még megvolt a lendület. Csütörtökön közbejött valami. A jövő héten majd újra — aztán a jövő hétből hónap lett.",
  /**
   * The three launch ad angles (restart · óvatos · napvégi), answered on the
   * page that all three point at. Whichever creative somebody clicked, they
   * find their own sentence here and then all three converge on one mechanism.
   *
   * THIRD PERSON, deliberately. „Van, akinél a derék szól közbe" describes
   * somebody; „A derekad miatt óvatos vagy" claims knowledge of the reader's
   * body - which is the second-person health assumption Meta enforces against
   * and our own rules ban outright.
   */
  angles: [
    { label: "Az ötödik nekifutás", line: "Van, aki már ötödször kezdte újra." },
    { label: "A derék, a térd", line: "Van, akinél a derék vagy a térd miatt kell óvatosabban." },
    { label: "A nap vége", line: "Van, akinek a nap végére semmi nem marad." },
  ],
  /** The lead on the `.ism-rules` card, in the homepage's own ismeros layout. */
  convergeLead: "Mind ugyanabba futnak bele.",
  converge:
    "Mind ugyanabba futnak bele: minden kihagyás után nulláról kell kezdeni. Nem az akaraterővel van baj.",
} as const;

export const MASKEPP = {
  heading: "Ezért másképp működik",
  /** Set in `.starter-title`, the homepage's large statement tier. */
  title: "Egy rossz hét nem dönti el.",
  lead: "Két szabály, és mindkettő arról szól, mi történik, amikor közbejön valami.",
  /** The two rules, as two rules. They were one paragraph, and a paragraph is
   *  where a mechanism goes to be skimmed past - these are the whole product
   *  argument, so they get to be structural. */
  rules: [
    {
      hd: "A pihenőnap nem töri meg a sorozatot.",
      body: "Előre be van tervezve. Nem kihagyás, hanem a terv része.",
    },
    {
      hd: "A kihagyott hét nem nulláz.",
      body: "Ott folytatod, ahol abbahagytad — nem elölről.",
    },
  ],
  foot: "A tervedet nem neked kell kitalálnod: hét kérdésből elkészül, és minden edzést Alexa vezet végig.",
} as const;

/**
 * The proof band — text only, and that is a finding, not a shortcut.
 *
 * `public/finish-examples/` was assumed to hold member finish cards. It does
 * not: those files are the raw post-workout SELFIES that feed the Finish Share
 * overlay - shirtless mirror shots, a gym locker room. Three separate reasons
 * not to put them on this page:
 *
 *   1. Captioning them „valódi befejezett edzések" would be false. They are
 *      photographs of people, not evidence of a completed workout.
 *   2. Physique imagery is the body-transformation frame this entire funnel is
 *      built to avoid, and one of them is shot in a GYM - on the landing page
 *      for a home programme.
 *   3. Meta's health policy restricts exactly this kind of body imagery, and a
 *      young ad account carries account-level risk.
 *
 * So the proof is the one true, already-published claim we have. If real finish
 * cards (selfie + data overlay) get exported, this band is where they go - see
 * docs/funnel-research/08-audit-and-changes.md §6.
 */
export const PROOF = {
  heading: "Nem vagy egyedül vele",
  /** From funnel_v2 §2.2 P5, which is approved ad copy. */
  lead: "1 200+ tag a zárt Facebook-csoportban — a legtöbben nem sportolók, hanem dolgozó felnőttek, akik sokadszorra kezdték újra.",
  note: "Kérdezni is van kitől.",
} as const;

export const IGY_NEZ_KI = {
  heading: "Így néz ki",
  lead: "Három lépés, nagyjából egy perc. A terved azelőtt megvan, hogy fiókot csinálnál.",
  /** The compact form for the hero - the full sentences below are too long for
   *  a three-up row beside a graphic. // COPY-REVIEW */
  stepsShort: ["Válaszolsz 7 kérdésre", "Megkapod a heti terved", "Elindítod az elsőt"],
  /** Real product screenshots, one per step - the question screen, the plan and
   *  the player. Owner-approved asset set (2026-09-08); the alternative was
   *  stock or illustration, and cross-source consensus is that recognized-stock
   *  erodes trust on exactly this kind of page. */
  shots: ["/step-1-question.png", "/step-2-plan.png", "/step-3-player.png"],
  steps: [
    "Válaszolsz 7 kérdésre — nagyjából egy perc.",
    "Megkapod a heti tervedet, pihenőnapokkal.",
    "Az első edzést azonnal elindíthatod — 20–30 perc, eszköz nélkül.",
  ],
} as const;

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

/** The closing ask. Same words as the hero button - one page, one action, and
 *  a second verb here would read as a second offer. */
/**
 * The eyebrow on each band. Every section carries one, in the same place, in
 * the same type - so somebody scanning the page reads five labels and knows the
 * shape of the argument without reading a sentence. Naming the section is
 * wayfinding; leaving it unnamed makes the reader derive it from the prose.
 */
export const SECTION_LABEL = {
  ismeros: "A probléma",
  maskepp: "A mechanizmus",
  igy: "Hogyan működik",
  alexa: "Kivel csinálod",
  close: "Az első lépés",
} as const;

export const FINAL_CTA = {
  heading: "Kezdjük a heteddel",
  body: "Hét kérdés, és a terved kész. Ha utána nem folytatod, a heti terved akkor is a tiéd marad.",
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
/**
 * The sample plan drawn in the hero - and it is drawn as the EMAIL, because the
 * email is the deliverable. The hero used to show a bare week grid, which
 * showed the schedule but not the thing that arrives; the same component now
 * renders here with sample data and at the gate with the person's real answers,
 * so the promise on the landing page and the artifact at the end of the quiz
 * are literally the same object.
 *
 * Everything below is a TYPICAL answer set, not an average of anything: three
 * days is the middle option and the one most people pick, 30 minutes is the
 * median length of the published workouts. Marked „Példa" in the chrome so
 * nobody reads it as a plan that already exists for them.
 */
export const HERO_WEEK = {
  eyebrow: "Példa egy hétre",
  sampleTag: "Példa",
  note: "Heti 3 nap, pihenőnapokkal. A tiéd a válaszaidból készül.",
  days: [
    { d: "H", on: true }, { d: "K", on: false }, { d: "Sze", on: true },
    { d: "Cs", on: false }, { d: "P", on: true }, { d: "Szo", on: false },
    { d: "V", on: false },
  ],
  train: "edzés",
  rest: "pihenő",
  /** The plan's own numbers, as the mail states them. */
  stats: [
    { k: "nap / hét", v: "3" },
    { k: "perc", v: "30" },
    { k: "eszköz", v: "0" },
  ],
  /** The answers the plan was built from, echoed exactly as the quiz's own tray
   *  echoes them - these are real TRAY labels, not invented ones. */
  answersLead: "A válaszaidból:",
  answers: ["újrakezdés", "heti 3 nap", "este", "nappali", "térdkímélő"],
} as const;

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

export const REVEAL = {
  /** The band eyebrows. The reveal borrowed SECTION_LABEL.close for its first
   *  band, which meant „Az első lépés" appeared twice on the same screen -
   *  once over the plan and once over the day picker. */
  eyebrow: "A terved",
  startEyebrow: "Az első lépés",
  hd: "A heted, készen",

  /**
   * The artifact's own chrome (S1, master plan Part IV).
   *
   * The plan renders as a document with an issuer, a date and a provenance
   * line - the wallet-pass convention: ownership cues once, at the header.
   * We hold no name (email only), so the possessive and the provenance carry
   * the ownership: „a hét válaszodból készült" is the trace-line the IKEA
   * effect needs - perceived own contribution is what turns a generated
   * artifact into „mine" (>100% WTP premium, docs/reveal-redesign/01 §2).
   */
  art: {
    title: "A heti terved",
    meta: (date: string) => `${date} · a hét válaszodból készült`,
    /** aria for the chip row; sighted users get the chips themselves. */
    chipsAria: "Amikből a terv készült",
    /** The document's last line item: the concrete thing they would do first.
     *  A plan with a named first workout is an itinerary; without one it is a
     *  calendar (owner addition, 2026-09-08). */
    firstLabel: "Az első edzésed",
  },
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
  //
  // REWRITTEN 2026-09-08 into an implementation intention. The panel used to
  // DESCRIBE the first workout; now it asks somebody to name the day they will
  // do it. Implementation intentions carry a meta-analytic effect of d = 0.65
  // (docs/funnel-research/02-results-page-offer.md) and are the strongest
  // measured substitute for the countdown timer this brand refuses to use.
  firstWorkout: {
    lead: "Melyik nap kezded?",
    body: (minutes: number) =>
      `${minutes} perc, eszköz nélkül. Válaszd ki a napot — az lesz az első edzésed.`,
    /** Verbatim the advice D0 gives, so the email and the page agree. */
    hint: "Ne a legjobb napodra időzítsd. Egy átlagosra.",
    /** `day` is a weekday name, which Hungarian writes lower-case mid-sentence -
     *  so it arrives as „csütörtök" and has to be lifted here rather than
     *  starting the sentence in lower case. */
    picked: (day: string) =>
      `${day.charAt(0).toUpperCase()}${day.slice(1)} az első edzésed napja.`,
    /** Nothing is stored server-side from this - it is a commitment device, not
     *  a booking, and pretending to schedule something we cannot schedule would
     *  be the same broken promise as the guest workout. */
    note: "Ezt csak magadnak jelölöd be. Emlékeztetőt nem küldünk rá.",
  },

  footer: "A tervet elküldtük e-mailben is, hogy TV-n vagy laptopon is megnyithasd.",

  /**
   * The decision rail.
   *
   * This page is the last one before somebody either leaves or pays, and until
   * now the offer sat ~4,600px below the fold at the end of a centred column -
   * so the decision was only ever visible to the people who scrolled the whole
   * plan. The rail travels with the content instead: what the membership
   * contains, the guarantee, one action, and the honest way out.
   *
   * The way out is not a concession. „If not now, the plan is still yours" is
   * what makes the ask safe to consider, and it is already true - the plan was
   * emailed before this screen rendered.
   */
  rail: {
    eyebrow: "A döntés",
    /** Reworked per the language track (docs/reveal-redesign/03): the old
     *  „Ha rendszert csinálnál belőle" was conditional mood - distance exactly
     *  where continuity is wanted. Indicative, and the same „viszed tovább"
     *  vocabulary as the lead, so heading and lead speak with one voice. */
    heading: "Így viszed tovább",
    lead: "A heti terved a tiéd. A LEXFIT tagság az, ami utána is viszi tovább.",
    /** The condensed includes list - the rail's own, NOT the shared 10-item
     *  PRICING_BAND.included: an order summary carries ~6 lines, and the six
     *  side programmes collapse honestly into one. Every claim here must stay
     *  a strict subset of what PRICING_BAND.included states. */
    includes: [
      "LEXFIT Start — 30 vezetett edzés",
      "Minden további program (reggeli, esti, kezdő, törzs, láb, tartás)",
      "16+ heti kihívás, minden héten 5 új videóval",
      "Mérföldkövek és visszamérés",
      "Szüneteltetés 1–3 hónapra",
    ],
    /** Around the interpolated amounts (rendered in PlanWizard from PRICES -
     *  no forint may live in this module). */
    priceMonthSuffix: "/ hó",
    priceIntroLead: "az első hét",
    cta: "Megnézem a tagságot",
    /** Shown under the CTA, in the same slot the pay step uses. */
    trust: "Bármikor lemondható · 14 napos elállási jog",
    out: "Ha most nem időszerű: a heti terved akkor is a tiéd marad.",
  },
} as const;

/**
 * The guarantee, restated on the reveal as a ROADMAP rather than as a refund.
 *
 * The wording of the guarantee itself is not duplicated here - it comes from
 * GARANCIA in src/components/landing/offer-copy.ts, which is the single source
 * for every surface. What lives here is the reveal's framing around it and the
 * miss-path, which nothing else on the site says yet.
 *
 * WHY A MISS-PATH EXISTS AT ALL. StepBet (N = 72,974): people who completed
 * their challenge raised activity 44%, but people who FAILED it fell 5.3% below
 * their own baseline. The refund is cheap - GMB sees ~3% across 125k clients -
 * and the undesigned failure is what actually costs. Objection #30 in offer_v2
 * §2 („A garancia feltétele stresszel") has been logged since v2 and has never
 * had an answer on any surface.
 */
export const GUARANTEE_BLOCK = {
  eyebrow: "Mielőtt bármit fizetnél",
  /** Reads as permission to start, never as a bet against yourself. Second in
   *  the order since 2026-09-08: every strong live guarantee found in the
   *  language research states the MECHANISM first and the philosophy after -
   *  a frame with no numbers in front of it reads as a slogan
   *  (docs/reveal-redesign/03 §3). */
  frame: "Nem fogadás. Egy útvonal, aminek a végén te döntesz.",
  missPath:
    "És ha nem jön össze a tíz edzés öt hét alatt? Akkor sem történik semmi. Szólunk, mielőtt lejár, és újratervezzük együtt — a programod megvár.",
  /** Named accountability: a guarantee gains weight when an identified person
   *  stands behind it, not a logo (docs/reveal-redesign/01 §8). The brand
   *  speaks as „mi"; the founder signs personally. */
  signedLead: "Ezt személyesen vállalom.",
  signedName: "Alexa",
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
 * The reveal's week, workout by workout.
 *
 * The plan card above it answers „mikor"; this answers „mit". The first
 * training day is expanded with its actual exercise list because that is the
 * one somebody is deciding about right now - the rest can stay closed without
 * losing anything.
 */
export const WEEK_WORKOUTS = {
  /** Same section anatomy as every other block: eyebrow + heading + lead. The
   *  label reuses the quiz's own section vocabulary („Az edzéseid"). */
  eyebrow: "Az edzéseid",
  heading: "A heted, edzésről edzésre",
  lead: (n: number) =>
    `Ez a ${n} edzés vár rád az első héten, ebben a sorrendben. Az elsőt kibontottuk, hogy lásd, mi van benne.`,
  firstTag: "Az első edzésed",
  exercisesLead: "Ebben az edzésben:",
  /** Shown when the catalogue has fewer sessions than the plan has days. */
  short: "A hét további napjaira a program következő edzései kerülnek.",
} as const;

export const PROGRAM_PREVIEW = {
  eyebrow: "A folytatás",
  heading: "Ez vár rád",
  /** Both counts come from the live catalogue, never from a literal - the
   *  programme is authored in /admin and a hardcoded number would go stale the
   *  first time somebody adds a session. */
  lead: (shown: number, total: number) =>
    `A heted után ez jön: a következő ${shown} edzés a LEXFIT Startból — összesen ${total} van belőle. Nyisd meg bármelyiket, és megnézheted, mi van benne, mielőtt bármit fizetnél.`,
  /** Owner decision 2026-09-08: preview the opening of the programme rather
   *  than its entire contents. The reveal is already long, and the first
   *  workouts are the ones that answer „mivel kezdem" - the other two dozen
   *  answer a question nobody is asking yet. */
  more: (n: number) => `+ még ${n} edzés a tagságban`,
  foot: "Az edzések a tagsággal indíthatók. A heti terved enélkül is a tiéd marad.",
  modalCta: "Ezzel kezdenék",
} as const;

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
