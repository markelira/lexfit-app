// LEXFIT Offer v3 — the copy that appears on more than one surface.
//
// SINGLE-SOURCE RULE: a string that shows up on two or more surfaces (the
// guarantee, the plan names/badges/CTAs, the renewal disclosure, the FAQ) is
// defined HERE and imported. A string that appears on exactly one surface stays
// inline next to its markup, which is how the rest of LandingPage.tsx reads.
//
// NO AMOUNTS LIVE HERE. Every forint is interpolated at render from
// `PRICES` via `@/lib/pricing/display` (offer v3 hard rule 6), so this module
// can never drift from what Stripe actually charges. Where a sentence needs a
// number, it is a function of that number - never a literal.
//
// Copy is verbatim from the offer v3 handoff (§4.1-§4.6). Do not "improve" it:
// the register is deliberate (no exclamation marks, no weight-loss vocabulary,
// no second-person health assumptions). Anything written here that the handoff
// did not supply is marked // COPY-REVIEW.

/** §4.1 — homepage hero. */
export const HERO = {
  headline: ["A változás", "otthon kezdődik"] as const,
  sub: "30 vezetett edzés a te tempódban — heti 2, 3 vagy 4 nap, ahogy az életedbe fér. Max 30 perc, elég egy matrac.",
  cta: "7 kérdés, és kész a heted",
  chips: ["max 30 perc", "elég egy matrac", "heti 2–4 nap — te választod"],
} as const;

/** §4.2 — the "Ismerős?" section (new, above #hogyan). */
export const ISMEROS = {
  heading: "Ismerős?",
  body: "Hétfőn még megvolt a lendület. Csütörtökön közbejött valami. A jövő héten majd újra — aztán a jövő hétből hónap lett. Nem az akaraterővel van baj: azzal, hogy minden kihagyás után nulláról kell kezdeni.",
  ruleLead: "Ezért nálunk két szabály van.",
  rules: [
    "A pihenőnap nem töri meg a sorozatot.",
    "A kihagyott hét nem nulláz — ott folytatod, ahol abbahagytad.",
  ],
} as const;

/** §5 — the #hogyan three steps. */
export const HOGYAN_STEPS = [
  "Válaszolsz 7 kérdésre",
  "Megkapod a heti terved",
  "Elindítod az elsőt — ma vagy hétfőn, mindegy",
] as const;

/** §4.3 — the guarantee. Rendered in full on the landing and /arak, and in the
 *  short form above the plan selector at the pay step. */
export const GARANCIA = {
  heading: "10 edzés garancia",
  body: "Csináld végig az első 10 edzést öt héten belül — a könnyített változat is számít. Ha utána úgy érzed, ez nem a tiéd, egy e-mail elég, és visszautaljuk az addig befizetett tagsági díjad. Nem kérdezünk, nem győzködünk.",
  /** The sentence above carries one bolded clause; split so the markup can
   *  emphasise it without a dangerouslySetInnerHTML. */
  bodyLead: "Csináld végig az első 10 edzést öt héten belül — a könnyített változat is számít. Ha utána úgy érzed, ez nem a tiéd, egy e-mail elég, és ",
  bodyStrong: "visszautaljuk az addig befizetett tagsági díjad",
  bodyTail: ". Nem kérdezünk, nem győzködünk.",
  statutory: "A 14 napos elállási jogod ettől függetlenül megillet. A lemondás bármikor egy kattintás.",
  trust: ["Stripe-fizetés", "e-számla", "14 napos elállás"],
  /** §4.6 — the short form that sits above the plan selector. */
  shortLead: "10 edzés garancia",
  shortBody: " — ha az első 10 edzés után (max 5 hét) úgy érzed, nem a tiéd, visszakapod, amit befizettél.",
} as const;

/** §4.4 — the pricing band. Shared by #elofizetes and /arak. */
export const PRICING_BAND = {
  banner: "Szeptemberi Újrakezdés — a szeptemberi kör most indul.",
  intro: "Egy tagság, minden benne: a Start program, az összes többi program, és minden héten 5 új kihívás-videó.",
  shared: "Mindhárom tagságban ugyanaz van: minden program, minden edzés, minden új heti tartalom. Csak a ritmus más.",
  /** P1 / P36 — the "YouTube is free" objection, answered at the price. */
  value: "A videó ingyen is megvan. A sorrend, a terv és a vezetés — az a tagság. Egy edzőóra ára ≈ egy hónap LEXFIT.",
  /** P13 / P14 — procrastination, answered at the moment of choosing. */
  hesitation: "Nem kell ma biztosnak lenned: az első 10 edzésre garancia van, és bármikor lemondhatod.",
  /** Per-card copy. The price SENTENCES are built in PricingBand.tsx from
   *  PRICES/display so no forint is ever a literal; what lives here is the
   *  wording around them. Order and badges are §4.4's, which deliberately
   *  centres Havi rather than Éves. */
  cards: {
    week: {
      plan: "Heti",
      badge: "Kipróbálom",
      body: "Teljes hozzáférés az első naptól. Automatikusan megújul — a dátumát előre megmutatjuk. Bármikor lemondható.",
      cta: (intro: string) => `Kezdem ${intro}-tal`,
    },
    month: {
      plan: "Havi",
      badge: "Legnépszerűbb",
      tagline: "kevesebb, mint egy edzőóra",
      /** The middle bullet is the guarantee, so it is dropped while the
       *  guarantee is dark (see GUARANTEE_LIVE). */
      bullets: ["Teljes hozzáférés", "10 edzés garancia", "bármikor lemondható, szüneteltethető"],
      cta: "Havi tagságot kérek",
    },
    annual: {
      plan: "Éves",
      badge: "Legjobb ár",
      body: "Egy döntés egy évre — pont az, ami az újrakezdésekből hiányzott.",
      cta: "Éves tagságot kérek",
    },
  },
  /** offer_v2 §4.5, unchanged - the honest disqualifier. */
  notFor: {
    heading: "Kinek nem való a LEXFIT?",
    body: "Nem edzőterem-pótlék versenyzőknek, nem gyógytorna és nem orvosi kezelés. Ha kezelés alatt állsz vagy friss sérülésed van, előbb kérdezd meg az orvosod. Mindenki másnak: a nulláról is el lehet kezdeni.",
  },
  trust: [
    "14 napos elállási jog",
    "Bármikor lemondható vagy szüneteltethető",
    "Elektronikus számla",
    "Biztonságos bankkártyás fizetés · Visa · Mastercard",
  ],
  includedHeading: "Ez van benne",
  included: [
    "LEXFIT Start (30 vezetett edzés)",
    "Reggeli rutinok",
    "7 napos kezdő",
    "Has & Mély Törzs",
    "Láb & Fenék",
    "Esti rutinok",
    "Tartásjavító",
    "16+ heti kihívás — minden héten 5 új videóval",
    "mérföldkövek és visszamérés",
    "szünet 1–3 hónap",
  ],
} as const;

/** §4.5 — the FAQ entries offer v3 adds. Appended to the landing's existing FAQ
 *  array, and the source of the FAQPage JSON-LD (verbatim, so the rich result
 *  and the page can never diverge). */
export const FAQ_NEW: [string, string][] = [
  [
    "Mi van, ha kihagyok egy hetet?",
    "Ott folytatod, ahol abbahagytad. A sorozatod nem nullázódik, a program megvár — nálunk nincs „lemaradás”.",
  ],
  [
    "Meddig tart a Start program?",
    "30 edzés — a te tempódban. Heti 3 nappal nagyjából 10 hét, heti 2-vel több, heti 4-gyel kevesebb. Nem az idő számít, hanem hogy a 30 meglegyen.",
  ],
  [
    "Hogyan működik a 10 edzés garancia?",
    "Ha az első 10 edzést öt héten belül végigcsinálod, és mégsem érzed a tiédnek, írsz egy e-mailt a hi@lexfit.hu-ra, és visszautaljuk az addig befizetett díjaidat. A könnyített változat is számít.",
  ],
  [
    "Szüneteltethetem?",
    "Igen, 1–3 hónapra, egy kattintással — a haladásod megmarad.",
  ],
  [
    "Mi történik, ha hónapokra kimaradok?",
    "Semmi ciki: visszajössz, és ott folytatod. Friss hétfő mindig van.",
  ],
];

/** The landing FAQ, in page order. Lives here rather than in LandingPage so
 *  that #gyik, the /arak subset and the FAQPage JSON-LD all walk ONE array -
 *  a hand-maintained schema block drifts from the visible page, and a rich
 *  result that does not match the page is a violation, not a mistake. */
export const FAQ_BASE: [string, string][] = [
  [
    "Miért fizessek, ha a YouTube-on ingyen is van edzésvideó?",
    "A videó ingyen van - a sorrend nem. A LEXFIT egy felépített program: minden edzés tudja, mi jött előtte és mi jön utána, a haladásod magától követődik, és nem neked kell minden nap kitalálnod, mit csinálj. A lejátszóban ott a gyakorlatok listája időbélyeggel, teljes képernyőn látod, mi jön és mennyi van hátra, és ott folytatod, ahol abbahagytad.",
  ],
  [
    "Teljesen kezdő vagyok. Nekem való?",
    "Igen - a Lexfit Start pontosan ide készült: lassú tempó, alapgyakorlatok, bőséges módosításokkal. A saját tempódban haladsz, és a pihenőnap nálunk a terv része.",
  ],
  [
    "Férfiként is használhatom?",
    "Igen. A LEXFIT nőknek és férfiaknak készült - a gyakorlatok saját testsúlyra épülnek, te pedig a saját szinteden és tempódban követed őket.",
  ],
  [
    "Milyen eszköz kell hozzá?",
    "Semmi - elég egy matrac.",
  ],
  [
    "Mennyi időm kell rá naponta?",
    "A program edzései jellemzően 20–30 percesek. Az edzéstárban van 5–15 perces is - azokra való a „ha csak tíz perced van” kategória. Nem a hossz visz előre, hanem hogy hétből hetet megcsinálj.",
  ],
  [
    "Mi van, ha kimaradok?",
    "Semmi. Nem kezdődik elölről, nem veszítesz el semmit, és nem kapsz érte bűntudatkeltő üzenetet. A pihenőnap eleve a terv része - az nem töri meg a sorozatot. Ha egy hetet hagysz ki, ott veszed fel, ahol abbahagytad.",
  ],
  [
    "Hogyan mondhatom le?",
    "Bármikor, egy kattintással, a profilodból. Nincs hűségidő - a lemondás után a már kifizetett időszak végéig még minden elérhető. És ha csak most nincs rá időd, nem kell lemondanod: szüneteltetheted 1–3 hónapra, vagy válthatsz olcsóbb csomagra.",
  ],
  [
    "Megy TV-n vagy laptopon is?",
    "Igen. A LEXFIT a böngészőben fut - nem kell letölteni semmit. Telefonon, laptopon és asztali gépen működik, az edzést pedig AirPlay-jel vagy Chromecasttal a TV-re is kiküldheted.",
  ],
  [
    "Kapok számlát?",
    "Igen, minden fizetésről automatikusan kapsz elektronikus számlát e-mailben.",
  ],
  [
    "Mi lesz a fotóimmal?",
    "A haladásfotóid csak a tieid. Nem látja őket más tag, nem kerülnek a közösségbe, és bármikor törölheted őket - ahogy a fiókodat és minden adatodat is, egy gombbal, a beállításokban.",
  ],
];

/** Everything #gyik renders: the pre-existing questions plus §4.5's additions. */
export const FAQ_ALL: [string, string][] = [...FAQ_BASE, ...FAQ_NEW];

/** The three FAQ questions /arak repeats (garancia · lemondás · szünet). Keyed
 *  by question text so the subset can never drift from the array above. */
export const ARAK_FAQ_KEYS = [
  "Hogyan működik a 10 edzés garancia?",
  "Szüneteltethetem?",
  "Hogyan mondhatom le?",
];

/** §4.6 — funnel strings that must read identically at the paywall and on the
 *  page. The rest of the funnel's copy stays in src/app/onboarding/_mock.ts. */
export const PAY_STEP = {
  /** Renewal disclosure, per plan (hard rule 7). Only the weekly line is given
   *  verbatim in §4.6; the monthly and annual lines are its stated "analogue"
   *  and follow the same shape. // COPY-REVIEW (Havi + Éves wording)
   *  Amounts are injected by the caller from PRICES - never literals. */
  renewal: {
    week_intro: (intro: string, std: string, date: string) =>
      `Az első hét ${intro}, utána ${std}/hét — a következő terhelés: ${date}.`,
    month_std: (amount: string, date: string) =>
      `${amount}/hó — a következő terhelés: ${date}.`,
    annual_std: (amount: string, date: string) =>
      `${amount}/év — a következő terhelés: ${date}.`,
  },
  /** Shown while the date is still being resolved on the client (see
   *  renewal.ts - /register is prerendered, so the date cannot come from the
   *  render pass). Never shows a wrong date, only a shorter sentence. */
  renewalPending: {
    week_intro: (intro: string, std: string) => `Az első hét ${intro}, utána ${std}/hét.`,
    month_std: (amount: string) => `${amount}/hó, havonta megújul.`,
    annual_std: (amount: string) => `${amount}/év, évente megújul.`,
  },
  /** Under the CTA (P11). */
  cancelLine: "Bármikor lemondható egy kattintással — a lemondás nem büntet.",
  /** Trust row (P12). */
  trust: ["Stripe-fizetés", "e-számla", "14 napos elállás"],
} as const;

/** The milestone strip (1 · 5 · 10 · 15 · 30). Rendered on the landing Journey
 *  band and on the funnel's `reveal` step. `note` is null where the number is
 *  just a beat rather than a named milestone. */
export const MILESTONES: { n: number; note: string | null }[] = [
  { n: 1, note: null },
  { n: 5, note: null },
  { n: 10, note: "garancia" },
  { n: 15, note: "visszamérés" },
  { n: 30, note: "visszamérés" },
];

/** The guarantee is a contractual promise, so it stays dark until the ÁSZF
 *  clause that describes it is published (dev plan Q3/Q3b). Flipping
 *  NEXT_PUBLIC_GUARANTEE_LIVE=1 in Vercel is the whole release step - no code
 *  change, no rebuild of anything else. */
export const GUARANTEE_LIVE = process.env.NEXT_PUBLIC_GUARANTEE_LIVE === "1";
