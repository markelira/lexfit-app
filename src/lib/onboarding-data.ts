// LEXFIT onboarding content (Hungarian) - ported from the prototype's default
// configuration: flow "Cél előbb", tone "Vegyes" (brand voice). The prototype's
// tweak variants (alternate flows/tones/paywall styles) are intentionally dropped.

export interface ChoiceOption {
  v: string | number;
  ic?: string;
  flames?: number;
  b: string;        // bold label
  s?: string;       // sub label
}

export const STEP_OPTIONS = {
  goal: [
    { v: "ero", ic: "💪", b: "Erősebb, energikusabb test", s: "Hogy bírjam a napot, és jó legyen a tükörben." },
    { v: "forma", ic: "🔥", b: "Lefogyni, formálódni", s: "Égessünk, formáljunk - fokozatosan, fenntarthatóan." },
    { v: "vissza", ic: "🌱", b: "Visszatérni a mozgáshoz", s: "Régen volt - most újrakezdem, nulláról, szépen." },
    { v: "tartas", ic: "🧘", b: "Jobb tartás, kevesebb fájdalom", s: "Sok ülés, fáradt hát - mozduljunk ki belőle." },
    { v: "szokas", ic: "📅", b: "Napi mozgás-szokás", s: "Nem a csoda kell, hanem hogy végre rendszer legyen." },
  ],
  level: [
    { v: 1, flames: 1, b: "Kezdő", s: "Most kezdem, vagy rég mozogtam - vezess végig." },
    { v: 2, flames: 2, b: "Közepes", s: "Szoktam mozogni, az alapok mennek." },
    { v: 3, flames: 3, b: "Haladó", s: "Edzett vagyok - jöhet a kihívás." },
  ],
  focus: [
    { v: "has", ic: "🎯", b: "Has" },
    { v: "feneck", ic: "🍑", b: "Fenék" },
    { v: "comb", ic: "🦵", b: "Combok" },
    { v: "kar", ic: "💪", b: "Karok" },
    { v: "hat", ic: "🔙", b: "Hát" },
    { v: "vallnyak", ic: "🧣", b: "Váll / nyak" },
    { v: "egesz", ic: "✨", b: "Egész test" },
  ],
  env: [
    { v: "csendes", ic: "🔇", b: "Csendben kell", s: "Szomszéd-barát, ugrálás nélkül." },
    { v: "fal", ic: "🪑", b: "Van falam / székem", s: "Tudok hozzá támaszkodni." },
    { v: "terd", ic: "🦵", b: "Kíméld a térdem", s: "Adj alternatívát a térdelős részekre." },
    { v: "hat", ic: "🔙", b: "Vigyázz a hátamra", s: "Óvatosan a gerinc-terheléssel." },
    { v: "none", ic: "👍", b: "Nincs külön kérésem", s: "Jöhet bármi, bírom." },
  ],
  time: [
    { v: "reggel", ic: "🌅", b: "Reggel", s: "Indítsuk a nappal a mozgást." },
    { v: "napkozben", ic: "☀️", b: "Napközben", s: "Ebédszünet, vagy két meló közt." },
    { v: "este", ic: "🌙", b: "Este", s: "A nap végén vezetem le a feszültséget." },
  ],
  obstacle: [
    { v: "ido", ic: "⏳", b: "Nem volt rá időm", s: "Hosszú edzések, tele naptár." },
    { v: "motiv", ic: "🌧️", b: "Elfogyott a motiváció", s: "Lelkesen kezdtem, aztán abbamaradt." },
    { v: "hogyan", ic: "❓", b: "Nem tudtam, hogyan", s: "Mit, mennyit, milyen sorrendben?" },
    { v: "egyedul", ic: "🤍", b: "Egyedül feladtam", s: "Nem volt, aki számon kérjen." },
    { v: "faradt", ic: "🔋", b: "Túl fáradt voltam", s: "A nap végére semmi energiám." },
  ],
} satisfies Record<string, ChoiceOption[]>;

export const AGES = ["18–29", "30–39", "40–49", "50–59", "60+"];

export const LIFESTAGE: ChoiceOption[] = [
  { v: "nincs", ic: "🙂", b: "Most nincs ilyen", s: "Semmi különös - mehetünk bátran." },
  { v: "varandos", ic: "🤰", b: "Várandós vagyok", s: "Várandós-barát, óvatos variációk." },
  { v: "friss", ic: "🍼", b: "Friss szülés után (0–6 hó)", s: "Kíméletes újrakezdés, hasizom-tudatosan." },
  { v: "poszt", ic: "🧷", b: "Szülés után (6–12 hó)", s: "Fokozatos visszaépítés." },
  { v: "meno", ic: "🌿", b: "Menopauza idején", s: "Ízület-barát, erő-fókuszú terhelés." },
];

export const DAYS = [
  { v: 3, label: "kényelmes" },
  { v: 4, label: "haladós" },
  { v: 5, label: "ajánlott" },
  { v: 6, label: "intenzív" },
];

// Per-step copy (heading, sub, Alexa line - "vegyes" tone), keyed by step id.
export const STEP_COPY: Record<string, { hd: string; sub: string; alexa: string }> = {
  goal: {
    hd: "Mi hozott ide?",
    sub: "Egyet válassz - ez adja az edzéseid fókuszát. Később bármikor módosítható.",
    alexa: "Mondd ki, mit szeretnél - ettől lesz a tiéd a program, nem egy random edzésterv.",
  },
  about: {
    hd: "Mesélj magadról",
    sub: "Pár alap adat - ezt vesszük kiindulásnak, és a program végén újra megnézzük. Bármit kihagyhatsz.",
    alexa: "Pár adat rólad, hogy legyen mihez mérni a fejlődésed.",
  },
  level: {
    hd: "Hol tartasz most?",
    sub: "Ne becsüld túl és ne is alá - ehhez igazítjuk a tempót és a módosításokat.",
    alexa: "Mondd meg, hol állsz tényleg - onnan építkezünk, nem máshonnan.",
  },
  focus: {
    hd: "Hol szeretnél a legtöbbet változni?",
    sub: "Több is lehet - ezekre teszek extra hangsúlyt a heteidben.",
    alexa: "Jelöld, mi fontos - a teljes test megy, de ezekre figyelek külön.",
  },
  motiv: {
    hd: "Miért épp most?",
    sub: "Írd le pár szóban - ez lesz az, amivel emlékeztetlek egy nehéz napon.",
    alexa: "A te „miért”-ed visz át a nehéz napokon. Mondd ki - én emlékeztetlek rá.",
  },
  schedule: {
    hd: "Hány nap egy héten?",
    sub: "A Lexfit Start program 5 napra épül + 2 pihenő, de a tiéd is lehet kevesebb.",
    alexa: "Válaszd a tarthatót - a heti ritmus visz előre, nem az egyszeri hajtás.",
  },
  env: {
    hd: "Mire figyeljünk?",
    sub: "Több is lehet. Ezek alapján ajánlom a halk és kíméletes variációkat.",
    alexa: "Mondd el a kereteidet - a lakás, a szomszéd, a tested. Ehhez igazítom az edzést.",
  },
};

export const WELCOME = {
  eyebrow: "LEXFIT · OTTHONI EDZÉS",
  line1: "Egyedül nehéz.",
  line2: "Együtt muszáj.",
  sub: "Alexa vagyok. 30 perc, csak egy matrac, és egy közösség mögötted. Pár kérdés, és kész a heted.",
  cta: "Kezdjük",
};

export const REVEAL = {
  eyebrow: "KÉSZ - ITT A HETED",
  hd: "Itt a heted, {n}.",
  sub: "Ez az 1. heted a Lexfit Start programban. Nem kell kitalálnod semmit - csak kezdd el.",
  cta: "Aktiválom a programom",
  alexa: "Összeraktam az első heted. Most már csak el kell kezdened - ott leszek végig.",
};

// Canonical Foundation week split shown on the reveal.
export const WEEK = [
  { d: "Hétfő", dd: "H", theme: "Alsótest", work: true },
  { d: "Kedd", dd: "K", theme: "Felsőtest", work: true },
  { d: "Szerda", dd: "Sze", theme: "Pihenőnap", work: false },
  { d: "Csütörtök", dd: "Cs", theme: "Kardió + has", work: true },
  { d: "Péntek", dd: "P", theme: "Teljes test", work: true },
  { d: "Szombat", dd: "Szo", theme: "Mobilitás", work: true },
  { d: "Vasárnap", dd: "V", theme: "Pihenőnap", work: false },
];

// The setup-step order (the prototype default "Cél előbb").
export const FLOW = ["goal", "about", "level", "focus", "motiv", "schedule", "env"] as const;
export const REQUIRED: Record<string, boolean> = {
  goal: true, level: true, about: false, focus: false, motiv: false, schedule: false, env: false,
};
