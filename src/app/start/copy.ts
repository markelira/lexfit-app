import { PRICES, PROGRAM_PURCHASE_ROLES, WITHDRAWAL_DAYS } from "@/lib/pricing/config";
import { formatHuf } from "@/lib/pricing/display";

// /start - the copy for the one-time programme purchase (P1).
//
// Voice and structure follow /ujrakezdes: short sentences, second person, no
// hype, one idea per band. The visual system is literally the same one - the
// page renders inside `.lxu lp`, so a change to the lead magnet's look carries
// here rather than two designs drifting apart.
//
// Every number is DERIVED, never typed: prices from the pricing config (the
// F0.5 hard rule), the session count from the programme's own playlist at
// render, the programme length from ONE constant below.
//
// What is deliberately absent:
//   - any deadline, countdown or manufactured urgency - offer v3 §2/§10, and
//     the GVH's AboutYou decision is about exactly this pattern;
//   - any inflated "X Ft értékben" bonus stack - the buyer can count;
//   - any body measurement, weight or calorie claim - Art. 9 data and the
//     body-positive guardrail both rule it out.
//
// What the page is FOR: the objection that killed the subscription funnel. 518
// leads, 0 registrations - not because the product was wrong, but because the
// first "yes" asked for an account, a password, a card AND a recurring charge
// at once. Here the only thing asked before the money is a card.

const ROLE = "program_foundation" as const;

export const START = {
  role: ROLE,
  slug: PROGRAM_PURCHASE_ROLES[ROLE],
  priceHuf: PRICES[ROLE].amountHuf,
  price: formatHuf(PRICES[ROLE].amountHuf),
  guaranteeDays: WITHDRAWAL_DAYS,

  // The programme's length in weeks. LEXFIT has positioned Lexfit Start as a
  // guided 8-week programme since the start, and the ad leads with it - the
  // landing has to say the same thing or the click lands on a different
  // product. It stays a SINGLE constant, paired with the honest cadence (35
  // sessions over 8 weeks = 4-5 a week) and with an FAQ answer that says
  // outright what happens when someone trains less often. The lead base says
  // most will: 43% want three days a week, 32% want four.
  weeks: 8,

  meta: {
    title: "Lexfit Start - 8 hetes otthoni edzésprogram, egyszeri fizetéssel",
    description:
      "8 hetes otthoni edzésprogram, eszköz nélkül, Alexával. Egyszer fizetsz, örökre a tiéd - nem előfizetés.",
  },

  hero: {
    // Message match with the ad badge, word for word. The click and the page
    // must say the same thing or the visitor spends their first second
    // checking whether they are in the right place.
    eyebrow: "Nincs havidíj",
    hNum: "8 hét,",
    hRest: "végig tervvel.",
    lead: "Egy kész edzésprogram otthonra, eszköz nélkül. Sorrendbe rakott edzések - megmondja, mikor mit csinálj, neked csak el kell indítanod.",
    anti: "Azoknak, akik már többször elkezdték, és mindig a tervezésnél akadtak el.",
    chips: ["Otthon", "Eszköz nélkül", "Bármelyik nap"],
    cta: "Megveszem a programot",
    ctaSub: (price: string) => `${price}, egyetlen alkalommal. Nem újul meg, nem vonunk le többet.`,
    mechanism: "Egyszer fizetsz, és örökre a tiéd.",
    mechanismSub: "Nem előfizetés. Nincs mit lemondani.",
    /** The sticky bar is one line on a narrow phone - the long version wrapped
     *  to three and crowded the button next to it. */
    stickySub: "Nem előfizetés.",
    perSession: (per: string) => `${per} egy edzés - és nem havonta, hanem összesen.`,
  },

  // The four things the price actually buys. No invented bonuses: each one is
  // a shipped feature the buyer meets on their first day.
  gets: {
    eyebrow: "Amit megveszel",
    hd: "Nem egy videótár. Egy program.",
    lead: "A különbség az, hogy ez megmondja, mi a következő. Nem neked kell kitalálnod.",
    items: [
      {
        icon: "dumbbell",
        k: "A teljes 8 hét",
        d: "Videós edzések sorrendbe rakva, az elsőtől az utolsóig. Minden nap tudod, mi jön.",
      },
      {
        icon: "house",
        k: "Otthonra, eszköz nélkül",
        d: "Egy szőnyegnyi hely elég. Nincs terem, nincs súlyzó, nincs bérlet.",
      },
      {
        icon: "chart",
        k: "Látod, hol tartasz",
        d: "Minden befejezett edzés bejelölve, a heted egy pillantásra. A haladás nem érzés, hanem adat.",
      },
      {
        icon: "calendarCheck",
        k: "A saját tempódban",
        d: "Nincs kezdés-dátum és nincs lemaradás. Ha kihagysz egy hetet, ott folytatod, ahol abbahagytad.",
      },
    ],
  },

  // The problem mirror. Says what they already believe, in their words, before
  // claiming anything - the same move the lead magnet's S3 makes.
  mirror: {
    eyebrow: "Miért akad el",
    hd: "Nem az akarat fogy el.",
    body: "A legtöbben nem azért hagyják abba, mert lusták. Hanem mert minden edzés előtt dönteni kell: mit csináljak ma, mennyit, meddig. Ez a döntés fárasztóbb, mint maga az edzés - és pár hét múlva egyszerűbb kihagyni.",
    close: "Ezt a döntést veszi le rólad a program.",
  },

  how: {
    eyebrow: "Így működik",
    hd: "Két perc, és kezdheted.",
    steps: [
      { n: "1", k: "Fizetsz egyszer", d: "Kártyával, itt az oldalon. Nem kell regisztrálnod, nem kell jelszót kitalálnod." },
      { n: "2", k: "Azonnal bent vagy", d: "A fizetés után beléptetünk. A belépőd emailben is megérkezik, ha később visszatérnél." },
      { n: "3", k: "Elindítod az elsőt", d: "Még ma. Az első edzés ott van, ahol belépsz." },
    ],
  },

  inside: {
    eyebrow: "Mi van benne",
    hd: (n: number) => `${n} edzés, sorrendben.`,
    lead: (n: number, weeks: number) =>
      `A ${n} edzés egymásra épül: az elején a mozdulatokat tanulod, a végére már össze vannak fűzve. Heti 4-5 edzéssel ${weeks} hét - ha ritkábban edzel, egyszerűen tovább tart, és ez rendben van.`,
    shelfNote: "Ez a teljes program - nincs elrejtve semmi. Minden edzést Alexa vezet, és mindegyik megy szőnyegen, eszköz nélkül.",
    facts: [
      { v: "~30", l: "perc egy edzés" },
      { v: "0", l: "eszköz" },
      { v: "∞", l: "meddig a tiéd" },
    ],
  },

  // Pratfall: saying plainly who this is NOT for buys more trust than another
  // benefit bullet, and it keeps the refund rate down.
  fit: {
    eyebrow: "Őszintén",
    hd: "Kinek jó, és kinek nem",
    yes: {
      k: "Neked való, ha",
      items: [
        "otthon edzenél, mert a terembe úgysem jutsz el",
        "már többször elkezdted, és mindig elakadtál a tervezésnél",
        "nem akarsz havidíjat, csak egy programot, ami végigvisz",
      ],
    },
    no: {
      k: "Nem neked való, ha",
      items: [
        "heti több új edzést akarsz, mindig mást - arra az előfizetés való",
        "személyre szabott, egyéni edzéstervet keresel",
        "eszközös, terembe szánt programot keresel",
      ],
    },
  },

  // Alexa, told the way the homepage tells her - the SAME story, condensed.
  // Not a fresh bio: two versions of a founder's account drift, and the one on
  // the page taking money would be the one that drifted. No incident is
  // retold, only what it taught her, which is also what keeps it free of
  // identifying detail.
  alexa: {
    eyebrow: "Aki végigvisz",
    pull: "„Amikor újrakezdtem, otthon kezdtem.”",
    story: [
      "Ritmikus gimnasztika, heti hat edzés, tíz éven át. Szerettem. Aztán egyszer csak nem.",
      "Nem sérülés volt, nem is lustaság. Egyszerűen elfogyott - és ott a kilépés nem döntés. Hálátlanság.",
      "Tíz év kellett hozzá, hogy megértsem: nem a mozgással volt bajom. Azzal, hogy soha nem az enyém volt.",
      "Amikor újrakezdtem, otthon kezdtem. Nulláról, egy matracon. Senki nem nézte, senki nem mérte, senki nem kérte számon. És ott jöttem rá, mi hiányzott végig. Nem a fegyelem - abból volt bőven. Hanem hogy a mozgás az enyém legyen.",
      "Ezért van ez a program. Nem azért, hogy még valaki számonkérjen egy kihagyott napot - hanem azért, hogy ne kelljen megmagyaráznod.",
    ],
    facts: ["10 év versenysport", "minden edzést én vezetek", "1 200+ fős közösség"],
    // The disclaimer is a separate beat from the biography on purpose: inside
    // one block it disappears, and it is the half that answers the hype
    // objection.
    promises: [
      "Nem mondom meg, mit csinálj.",
      "Nem ítéllek el, ha kimaradsz.",
      "Nem játszom, hogy tökéletes vagyok.",
    ],
    vow: "Nem vagyok orvos és nem ígérek csodát. Egy rendszert ígérek, ami kibírja az életet.",
    close: "Egyedül nehéz.",
    close2: "Együtt muszáj.",
    sign: "- Alexa",
  },

  // The finish card, shown as the FEATURE it is rather than as proof. The
  // numbers on the sample cards are illustrative, and framing the section as
  // "this is what you get after a workout" keeps that honest - a row of photos
  // headed "results" would be claiming something these numbers do not support.
  finish: {
    eyebrow: "Minden edzés után",
    hd: "A saját kártyád, ha akarod.",
    body: "Ahogy befejezed az edzést, készíthetsz egy képet magadról, és ráteszed az adatait: mennyi ideig ment, hány gyakorlat volt, hányadik napod ez sorban. Megosztod, vagy megtartod magadnak - a te dolgod.",
    note: "Így néznek ki. Koppints bármelyikre.",
  },

  guarantee: {
    eyebrow: "Semmit nem kockáztatsz",
    k: (days: number) => `${days} nap, feltétel nélkül`,
    d: (days: number) =>
      `Nézd meg belülről. Ha ${days} napon belül úgy érzed, nem a tiéd, írsz egy sort és visszautaljuk - nem kérdezünk semmit, nem kell indokolnod.`,
  },

  faq: {
    eyebrow: "Kérdések",
    hd: "Amit ilyenkor kérdezni szoktak",
    items: [
      {
        q: "Tényleg nem előfizetés?",
        a: "Tényleg. Egyetlen fizetés, utána soha nem vonunk le semmit. Nincs mit lemondani.",
      },
      {
        q: "Meddig férek hozzá?",
        a: "Örökre. Nincs lejárat. Ha fél év múlva veszed elő újra, ugyanúgy ott lesz.",
      },
      {
        q: "Kell hozzá regisztráció, jelszó?",
        a: "Nem. Fizetés után azonnal beléptetünk, és a belépőd emailben is megérkezik. Ha később kilépnél, egy koppintással visszajutsz - jelszóra soha nem lesz szükséged.",
      },
      {
        q: "Kell hozzá bármilyen eszköz?",
        a: "Nem. A program végig eszköz nélküli, a saját testsúlyoddal. Egy szőnyeg kényelmesebbé teszi, de nem feltétel.",
      },
      {
        q: "Mennyi időt vesz el?",
        a: "Edzésenként nagyjából fél órát, és te döntöd el, mely napokon. A 8 hét heti 4-5 edzéssel jön ki - ha ritkábban edzel, egyszerűen tovább tart. A program a tiéd, nem szalad el.",
      },
      {
        q: "Mi van, ha most kezdem?",
        a: "Pont arra való. Az első edzések a legegyszerűbbek, és Alexa minden gyakorlatot megmutat.",
      },
      {
        q: "Számlát kapok?",
        a: "Igen, a vásárlás után automatikusan, emailben.",
      },
    ],
  },

  close: {
    eyebrow: "Kezdjük",
    hd: "Ma is el tudod kezdeni.",
    body: "Egy fizetés, és a program a tiéd marad - akkor is, ha jövő héten kezded el, és akkor is, ha jövőre veszed elő újra.",
  },

  // The J2 consent. Mandatory for digital content delivered at once, and the
  // wording has to say what the buyer gives up, not just ask for a tick.
  consent: (days: number) =>
    `Kérem, hogy a hozzáférés azonnal induljon. Tudomásul veszem, hogy a teljesítés megkezdése után a törvényi elállási jogom megszűnik - a ${days} napos pénzvisszafizetést a LEXFIT ettől függetlenül vállalja.`,

  pay: {
    hd: "Fizetés",
    await: "Pipáld ki a fenti sort, és megnyílik a kártyás fizetés.",
    back: "Mégsem",
    // Shown instead of the embedded form inside a Meta in-app browser, where
    // embedded Stripe has failed before. The wording promises the redirect so
    // it does not look like an error when the page leaves.
    webviewCta: "Tovább a biztonságos fizetéshez",
    loading: "A fizetés betöltése…",
    redirecting: "Átirányítás a fizetéshez…",
    unavailable: "A fizetés jelenleg nem elérhető. Próbáld újra pár perc múlva.",
    failed: "A fizetést most nem tudtuk elindítani. Próbáld újra - a kártyádat nem terheltük meg.",
    trust: ["Stripe fizetés", "Nem tárolunk kártyaadatot", "Számlát küldünk"],
  },
} as const;
