import { PRICES, PROGRAM_PURCHASE_ROLES, WITHDRAWAL_DAYS } from "@/lib/pricing/config";
import { formatHuf } from "@/lib/pricing/display";

// /start - the copy for the one-time programme purchase (P1).
//
// Every number here is DERIVED, never typed: prices come from the pricing
// config (the F0.5 hard rule) and the session count from the programme's own
// playlist, passed in at render. A page that promises "35 edzés" in a string
// literal starts lying the day someone adds a thirty-sixth.
//
// What is deliberately absent:
//   - any deadline, countdown or "most" - offer v3 §2/§10, and the GVH's
//     AboutYou decision is about exactly this pattern;
//   - any inflated "X Ft értékben" bonus stack - the buyer can count;
//   - any body measurement, weight or calorie claim - Art. 9 data and the
//     body-positive guardrail both rule it out.
//
// What the page is FOR: the single objection that killed the subscription
// funnel. 518 leads, 0 registrations - not because the product was wrong, but
// because the first "yes" asked for an account, a password, a card AND a
// recurring charge at once. This page asks for one payment and nothing else.

const ROLE = "program_foundation" as const;

export const START = {
  role: ROLE,
  slug: PROGRAM_PURCHASE_ROLES[ROLE],
  priceHuf: PRICES[ROLE].amountHuf,
  price: formatHuf(PRICES[ROLE].amountHuf),
  guaranteeDays: WITHDRAWAL_DAYS,

  // The programme's length in weeks. LEXFIT has positioned Lexfit Start as a
  // guided 8-week programme since the start, and the ad leads with it - the
  // landing page has to say the same thing or the click lands on a different
  // product. It stays a SINGLE constant here, paired with the honest cadence
  // (35 sessions over 8 weeks = 4-5 a week) and with the FAQ answer that says
  // outright what happens when someone trains less often: it takes longer, and
  // that is fine. The promise is the programme, not the calendar.
  weeks: 8,

  meta: {
    title: "Lexfit Start - 8 hetes otthoni edzésprogram, egyszeri fizetéssel",
    description:
      "Egy teljes otthoni edzésprogram, eszköz nélkül, Alexával. Egyszer fizetsz, örökre a tiéd - nem előfizetés.",
  },

  hero: {
    eyebrow: "Nem előfizetés",
    // The whole offer in three beats. Clarity over cleverness: a cold visitor
    // from a Meta feed has about five seconds, and every one of the three
    // facts here is one they would otherwise have to hunt for.
    h1: "8 hetes edzésprogram. Egyszer fizetsz. Örökre a tiéd.",
    sub: "Otthonra, eszköz nélkül, Alexával. Megmondja, mikor mit csinálj - neked csak el kell indítanod.",
    cta: "Megveszem a programot",
    // Sits directly under the button, where price anxiety peaks.
    reassure: (price: string) => `${price}, egyetlen alkalommal. Nem újul meg, nem vonunk le többet.`,
    trust: ["Otthon, eszköz nélkül", "Bármikor, bármelyik napon", "Telefonon, tableten, tévén"],
  },

  // The four things the price actually buys. No invented bonuses: each one is
  // a shipped feature the buyer will meet on their first day.
  gets: [
    {
      icon: "dumbbell",
      k: "A teljes 8 hét",
      d: "Videós edzések sorrendbe rakva - az elsőtől az utolsóig. Nem kell kitalálnod, mi jön.",
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

  how: {
    h: "Így működik",
    steps: [
      { n: "1", k: "Fizetsz egyszer", d: "Kártyával, két percben. Nem kell regisztrálnod előtte." },
      { n: "2", k: "Megérkezik a belépőd", d: "Emailben, azonnal. Beállítasz egy jelszót, és bent vagy." },
      { n: "3", k: "Elindítod az elsőt", d: "Még ma. Az első edzés ott van, ahol belépsz." },
    ],
  },

  // Pratfall: saying plainly who this is NOT for buys more trust than another
  // benefit bullet, and it keeps the refund rate down.
  fit: {
    h: "Kinek jó, és kinek nem",
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

  guarantee: {
    k: (days: number) => `${days} nap, feltétel nélkül`,
    d: (days: number) =>
      `Nézd meg belülről. Ha ${days} napon belül úgy érzed, nem a tiéd, írsz egy sort és visszautaljuk - nem kérdezünk semmit, nem kell indokolnod.`,
  },

  faq: {
    h: "Amit ilyenkor kérdezni szoktak",
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
        q: "Kell hozzá bármilyen eszköz?",
        a: "Nem. A program végig eszköz nélküli, a saját testsúlyoddal. Egy szőnyeg kényelmesebbé teszi, de nem feltétel.",
      },
      {
        q: "Mennyi időt vesz el?",
        a: "Edzésenként nagyjából fél órát, és te döntöd el, mely napokon. A 8 hét heti 4-5 edzéssel jön ki - ha ritkábban edzel, egyszerűen tovább tart, és ez rendben van. A program a tiéd, nem szalad el.",
      },
      {
        q: "Mi van, ha most kezdem?",
        a: "Pont arra való. Az első edzések a legegyszerűbbek, és Alexa minden gyakorlatot megmutat - nincs olyan mozdulat, amit magadtól kellene kitalálnod.",
      },
      {
        q: "Számlát kapok?",
        a: "Igen, a vásárlás után automatikusan, emailben.",
      },
    ],
  },

  finale: {
    h: "Kezdjük el ma.",
    d: "Egy fizetés, és a program a tiéd marad - akkor is, ha jövő héten kezded el, és akkor is, ha jövőre veszed elő újra.",
  },

  // The J2 consent. Mandatory for digital content delivered at once, and the
  // wording has to say what the buyer is giving up, not just ask for a tick.
  consent: (days: number) =>
    `Kérem, hogy a hozzáférés azonnal induljon. Tudomásul veszem, hogy a teljesítés megkezdése után a törvényi elállási jogom megszűnik - a ${days} napos pénzvisszafizetést a LEXFIT ettől függetlenül vállalja.`,
} as const;
