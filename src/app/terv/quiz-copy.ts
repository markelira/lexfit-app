// Lead magnet quiz - every user-visible string, in one place.
//
// Centralised on purpose: the copy is the product here, marketing iterates on
// it, and a claim buried in JSX is a claim nobody re-reads. Two rules that are
// NOT stylistic preferences:
//
//  - No number appears without a verified source. The statistics below were
//    checked against KSH "Testmozgás, 2019" on 2026-08-21; the spec's original
//    "15 minutes a day offsets it" line was dropped because it was attributed
//    to that survey but is not in it (docs/kviz-helyzetjelentes.md §10.2).
//  - No promise the product does not keep. There is no free trial - the entry
//    offer is 490 Ft for the first week - so the CTA says exactly that.

import type {
  Goal, Sex, AgeBand, DailyMove, StepsNow, TrainingNow,
  LifeStage, SessionMin, Obstacle,
} from "@/lib/quiz/types";

export interface Choice<T extends string> {
  value: T;
  label: string;
}

export const INTRO = {
  eyebrow: "INGYENES · KB. 1 PERC",
  headline: "Készítsd el a személyes otthoni edzésterved 60 másodperc alatt",
  sub: "10–20 perc naponta, eszköz nélkül is. Válaszolj pár kérdésre, és megkapod a napi kalória-célod, a rád szabott LexFit programot és a napi lépéscélod — ingyen.",
  cta: "Kezdjük",
  micro: "Kb. 1 perc · Nem kell regisztrálni a kitöltéshez",
};

export const Q_GOAL = {
  hd: "Mi a fő célod?",
  options: [
    { value: "fat_loss", label: "Fogyás, zsírégetés" },
    { value: "tone", label: "Feszesedés, formásabb alak" },
    { value: "strength", label: "Erő és izom építése" },
    { value: "posture_energy", label: "Jobb tartás, több energia, kevesebb ülés-fájdalom" },
    { value: "restart", label: "Csak el akarok végre indulni" },
  ] as Choice<Goal>[],
};

export const Q_SEX = {
  hd: "Mi a biológiai nemed?",
  micro: "A kalória-számításhoz kell — a férfi és női szervezet energiaigénye eltér.",
  options: [
    { value: "male", label: "Férfi" },
    { value: "female", label: "Nő" },
  ] as Choice<Sex>[],
};

export const Q_AGE = {
  hd: "Hány éves vagy?",
  options: [
    { value: "18_29", label: "18–29" },
    { value: "30_39", label: "30–39" },
    { value: "40_49", label: "40–49" },
    { value: "50_59", label: "50–59" },
    { value: "60_plus", label: "60+" },
  ] as Choice<AgeBand>[],
};

export const Q_MOVE = {
  hd: "Milyen egy átlagos napod?",
  options: [
    { value: "desk", label: "Főleg ülök (iroda, autó, képernyő)" },
    { value: "mixed", label: "Vegyes: ülök is, mozgok is" },
    { value: "active", label: "Sokat vagyok talpon (fizikai munka, pörgős napok)" },
  ] as Choice<DailyMove>[],
};

export const Q_STEPS = {
  hd: "Mit gondolsz, mennyit sétálsz egy átlagos napon?",
  micro: "Tipp: a telefonod egészségalkalmazása megmondja. Ha nem tudod, tippelj nyugodtan.",
  options: [
    { value: "lt4k", label: "Keveset — pár rövid séta (kb. 4 000 alatt)" },
    { value: "4_7k", label: "Közepeset (kb. 4–7 ezer lépés)" },
    { value: "7_10k", label: "Elég sokat (kb. 7–10 ezer lépés)" },
    { value: "10k_plus", label: "Nagyon sokat (10 ezer felett)" },
  ] as Choice<StepsNow>[],
};

export const Q_TRAINING = {
  hd: "És edzeni szoktál mostanában?",
  micro: "Nincs rossz válasz — a programod pontosan innen indul majd.",
  options: [
    { value: "none", label: "Nem, most kezdeném (újra)" },
    { value: "sometimes", label: "Néha igen, de nem rendszeresen" },
    { value: "regular", label: "Hetente többször" },
  ] as Choice<TrainingNow>[],
};

// Verified against KSH "Testmozgás, 2019". The wording follows the source
// exactly - "lakosság" not "felnőttek", "legalább hét óra" not "több mint 7",
// and sitting OR lying beyond sleep - because the spec's paraphrase quietly
// overstated all three.
export const INTERSTITIAL = {
  A: {
    hd: "Tudtad?",
    body: "A magyar lakosság 41%-a naponta legalább hét órát tölt üléssel vagy fekvéssel — az alvásidőn túl.",
    tail: "A jó hír: már napi néhány perc célzott mozgás is számít — és a terved pontosan ilyen lesz.",
    source: "Forrás: KSH, Testmozgás 2019",
  },
  B: {
    hd: "Tudtad?",
    body: "Csak minden 6. magyar felnőtt mozog annyit, amennyit a WHO ajánl. Akik igen, azok 81,5%-a érzi jónak az egészségét — a teljes lakosságnál ez 60%.",
    tail: "A különbség nem a tehetség. A rendszeresség.",
    source: "Forrás: KSH, Testmozgás 2019",
  },
  cta: "Tovább",
};

export const Q_BODY = {
  hd: "Add meg a magasságod és a testsúlyod",
  micro: "Ebből becsüljük a napi kalória-igényed. Az adataid csak az eredményedhez kellenek.",
  heightLabel: "Magasság (cm)",
  weightLabel: "Testsúly (kg)",
  heightError: "Kérlek, cm-ben add meg (pl. 172).",
  weightError: "Kérlek, kg-ban add meg (pl. 78).",
  cta: "Tovább",
};

export const Q_TARGET = {
  hd: "Mi a cél-testsúlyod?",
  label: "Cél-testsúly (kg)",
  error: "Kérlek, kg-ban add meg (pl. 68).",
  ambitious: "Ez nagyon ambiciózus cél — a terved biztonságos, fenntartható ütemre készül.",
  cta: "Tovább",
};

// D5: this screen is no longer women-only. Everyone sees it; the options are
// filtered to the ones that can actually apply, so a man gets a real question
// (desk strain) rather than a screen that skips itself.
export const Q_LIFESTAGE = {
  hd: "Van olyan élethelyzet, amire figyeljünk a programodnál?",
  options: {
    postpartum: "Az elmúlt kb. 1 évben szültem",
    menopause: "A változókor környékén járok",
    desk_strain: "Sokat ülök, és megérzi a hátam / a nyakam",
    none: "Nincs ilyen",
  } as Record<LifeStage, string>,
};

export const Q_SESSION = {
  hd: "Reálisan mennyi időd van egy edzésre?",
  micro: "A jó terv nem az, ami sok időt kér — hanem amit tényleg megcsinálsz.",
  options: [
    { value: "10_15", label: "10–15 perc" },
    { value: "20_30", label: "20–30 perc" },
    { value: "30_45", label: "30–45 perc" },
  ] as Choice<SessionMin>[],
};

export const Q_OBSTACLE = {
  hd: "Eddig mi tartott vissza leginkább?",
  options: [
    { value: "no_time", label: "Nincs időm" },
    { value: "no_motivation", label: "Nincs kedvem / nem köt le" },
    { value: "dont_know_how", label: "Nem tudom, hol kezdjem" },
    { value: "gave_up", label: "Elkezdtem már, de feladtam" },
    { value: "bad_experience", label: "Rossz élmények (tesióra, edzőterem)" },
  ] as Choice<Obstacle>[],
};

// 3-5s, not the spec's 8-12. Our own research says never fake-long: the beat
// exists to make the personalisation legible, and past a few seconds it just
// costs completions.
export const LOADER = {
  steps: [
    "Kalória-igényed becslése…",
    "A programjaink átnézése…",
    "A napi lépéscélod beállítása…",
  ],
};

export const CAPTURE = {
  hd: "Kész a személyes terved! 🎉",
  sub: "Add meg a keresztneved és az e-mail címed — azonnal mutatjuk a kalória-célod, a LexFit programod és a napi lépéscélod, és e-mailben is elküldjük, hogy meglegyen.",
  namePlaceholder: "Keresztneved",
  emailPlaceholder: "E-mail címed",
  nameError: "Kérlek, a keresztneved add meg (pl. Anna).",
  emailError: "Kérlek, ellenőrizd az e-mail címed.",
  consentHealth:
    "Hozzájárulok, hogy a megadott adataimat — a keresztnevem, az e-mail címem és a kvízben adott válaszaim, köztük az egészséggel összefüggő adatok (testadatok, mozgási szokások) — a LexFit a személyes eredményem elkészítéséhez és elküldéséhez kezelje.",
  consentHealthLink: "Adatkezelési tájékoztató",
  consentMarketing: "Kérem a LexFit e-mailes tippjeit és ajánlatait. Bármikor leiratkozhatok.",
  cta: "Kérem a tervem",
  ctaBusy: "Küldés…",
  micro: "Az adataidat bizalmasan kezeljük, harmadik félnek nem adjuk át.",
  networkError: "Hoppá, nem sikerült elküldeni — ellenőrizd a netkapcsolatod, és próbáld újra.",
};

export const RESULT = {
  lead: (name: string) => `Kész a terved, ${name}! Íme, mit mutatnak a válaszaid:`,
  leadNoName: "Kész a terved! Íme, mit mutatnak a válaszaid:",

  kcalHd: "A kalóriáid",
  maintenanceLabel: "Szinten tartó kalóriád",
  goalLabel: "A célodhoz ajánlott",
  kcalFine: "Becslés a megadott adataid alapján — iránymutatásnak tökéletes, nem kell grammra követni.",

  // Exactly one of these renders, decided by CalorieResult.note + goal.
  paceLine: (kg: number) =>
    `Ezzel az értékkel heti kb. ${kg.toString().replace(".", ",")} kg a reális, fenntartható ütem.`,
  checkpointLine: (kg: number) =>
    `Az első kontrollpont: 4 hét múlva kb. −${kg.toString().replace(".", ",")} kg.`,
  maintainLine:
    "A megadott célod alapján nem fogyásra, hanem szinten tartásra állítottuk a kalóriád — a hangsúly nálad a formálódáson lesz.",
  floorLine:
    "A célodhoz nem kell ennél kevesebbet enned — a hangsúly nálad a mozgáson lesz.",
  goalLine: {
    tone: "Enyhe deficit — a feszesedéshez pont ennyi kell.",
    strength: "Enyhe többlet — ebből épül az izom.",
    posture_energy: "Nem kell kevesebbet enned — a hangsúly nálad a mozgáson lesz.",
    restart: "Nem kell kevesebbet enned — a hangsúly nálad a mozgáson lesz.",
  } as Partial<Record<Goal, string>>,

  mirrorHd: "Hol állsz?",
  mirror: {
    none: "A magyar felnőttek 59%-a szabadidejében egyáltalán nem sportol. Azzal, hogy idáig eljutottál, már többet tettél, mint a többség — és a terved pontosan nulláról indul.",
    sometimes: "Csak minden 6. magyar teljesíti a WHO mozgásajánlását. Te már félúton vagy — a terved abban segít, hogy a rendszeresség is meglegyen.",
    regular: "A rendszeresen mozgók a magyar felnőttek kisebbségében vannak — te köztük vagy. A terved abban segít, hogy a következő szintre lépj.",
  } as Record<TrainingNow, string>,
  mirrorSource: "Forrás: KSH, Testmozgás 2019",

  programHd: "A te LexFit programod",
  obstacleLine: {
    no_time: "…és minden edzés belefér a keretedbe.",
    no_motivation: "…változatos, rövid blokkokkal, hogy ne unj rá.",
    dont_know_how: "…lépésről lépésre, videós vezetéssel — sosem kell kitalálnod, mi jön.",
    gave_up: "…fokozatos terheléssel, hogy ezúttal ne égj ki az elején.",
    bad_experience: "…otthon, a saját tempódban. Senki nem néz, senki nem értékel.",
  } as Record<Obstacle, string>,
  copyMode: {
    gentle_postpartum: "Kíméletes, a szülés utáni testre figyelő tempóban indul.",
    menopause: "Az erős izomzat 45 felett a legjobb befektetés — a program erre külön figyel.",
    strength: "Erő-hangsúllyal: a fejlődés az ismétlésekben és a terhelésben lesz mérhető.",
    desk: "Az ülőmunka két fő következményére épül: a feszes mellkasra és a gyenge felső hátra.",
    none: "",
  } as Record<string, string>,
  jointFriendly: "Ízületkímélő felépítés, alacsony becsapódással.",
  shortenNote: "Az edzések rövidíthetők — az első hetekben a rövidebb verzió is teljes értékű.",
  nextStep: (name: string) => `És ha megvan? Utána rád vár: ${name} — a fejlődésed következő lépcsője.`,
  bonus: (name: string) => `🎁 Hozzá ajándékba: ${name}`,

  stepsHd: "Napi lépéscélod",
  stepsNow: (n: number) => `Most kb. ${n.toLocaleString("hu-HU")} lépésnél jársz.`,
  stepCopy: {
    already_walker: (t: number) =>
      `A lépéseid már most rendben vannak (${t.toLocaleString("hu-HU")}) — tartsd, a többit bízd a programodra. 👏`,
    two_stage: (t: number, first: number) =>
      `Végcélod: ${t.toLocaleString("hu-HU")}. De ne egyszerre — az első két hétben célozd meg a ${first.toLocaleString("hu-HU")}-t (ez kb. egy 20 perces séta pluszban), onnan emelünk.`,
    plus_1000: (t: number) =>
      `Ne egyszerre — az első héten csak +1 000 lépést tegyél hozzá (kb. egy 10 perces séta), utána emelj ${t.toLocaleString("hu-HU")}-ig.`,
    easy: () => "Ez kb. egy plusz rövid séta naponta — simán benne van.",
  },

  closer: "A tervedet megcsináltuk. A többihez ott leszünk minden edzésnél — neked már csak el kell kezdened. 💪",
  // There is no free trial. This is the real entry offer.
  cta: "Kezdem a programom — az első hét 490 Ft",
  secondary: "Előbb körbenéznék",
  disclaimer:
    "A kvíz eredménye tájékoztató jellegű, nem minősül orvosi tanácsnak. Ha krónikus betegséged van, edzés előtt konzultálj orvosoddal.",
  postpartumDisclaimer: "Szülés után az újrakezdés előtt kérd ki orvosod véleményét.",
};

export const NAV = { back: "Vissza", of: (a: number, b: number) => `${a}/${b}` };
