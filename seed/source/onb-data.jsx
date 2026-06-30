// LEXFIT onboarding — content model + tone-keyed copy (Hungarian)
// Tone variants: "meleg" (warm), "oszinte" (honest), "vegyes" (mix — default, brand voice)

const ONB_NAME = "Réka"; // returned from social login in the demo

// ── the four setup steps (id + question content). Order is set by a tweak. ──
const ONB_STEPS = {
  goal: {
    id: "goal", key: "goal", multi: false,
    options: [
      { v: "ero",     ic: "💪", b: "Erősebb, energikusabb test", s: "Hogy bírjam a napot, és jó legyen a tükörben." },
      { v: "forma",   ic: "🔥", b: "Lefogyni, formálódni", s: "Égessünk, formáljunk — fokozatosan, fenntarthatóan." },
      { v: "vissza",  ic: "🌱", b: "Visszatérni a mozgáshoz", s: "Régen volt — most újrakezdem, nulláról, szépen." },
      { v: "tartas",  ic: "🧘", b: "Jobb tartás, kevesebb fájdalom", s: "Sok ülés, fáradt hát — mozduljunk ki belőle." },
      { v: "szokas",  ic: "📅", b: "Napi mozgás-szokás", s: "Nem a csoda kell, hanem hogy végre rendszer legyen." },
    ],
  },
  level: {
    id: "level", key: "level", multi: false,
    options: [
      { v: 1, flames: 1, b: "Kezdő", s: "Most kezdem, vagy rég mozogtam — vezess végig." },
      { v: 2, flames: 2, b: "Közepes", s: "Szoktam mozogni, az alapok mennek." },
      { v: 3, flames: 3, b: "Haladó", s: "Edzett vagyok — jöhet a kihívás." },
    ],
  },
  time: {
    id: "time", key: "time", multi: false,
    options: [
      { v: "reggel",  ic: "🌅", b: "Reggel", s: "Indítsuk a nappal a mozgást." },
      { v: "napkozben", ic: "☀️", b: "Napközben", s: "Ebédszünet, vagy két meló közt." },
      { v: "este",    ic: "🌙", b: "Este", s: "A nap végén vezetem le a feszültséget." },
    ],
  },
  env: {
    id: "env", key: "env", multi: true,
    options: [
      { v: "csendes", ic: "🔇", b: "Csendben kell", s: "Szomszéd-barát, ugrálás nélkül." },
      { v: "fal",     ic: "🪑", b: "Van falam / székem", s: "Tudok hozzá támaszkodni." },
      { v: "terd",    ic: "🦵", b: "Kíméld a térdem", s: "Adj alternatívát a térdelős részekre." },
      { v: "hat",     ic: "🔙", b: "Vigyázz a hátamra", s: "Óvatosan a gerinc-terheléssel." },
      { v: "none",    ic: "👍", b: "Nincs külön kérésem", s: "Jöhet bármi, bírom." },
    ],
  },
  obstacle: {
    id: "obstacle", key: "obstacle", multi: false,
    options: [
      { v: "ido",     ic: "⏳", b: "Nem volt rá időm", s: "Hosszú edzések, tele naptár." },
      { v: "motiv",   ic: "🌧️", b: "Elfogyott a motiváció", s: "Lelkesen kezdtem, aztán abbamaradt." },
      { v: "hogyan",  ic: "❓", b: "Nem tudtam, hogyan", s: "Mit, mennyit, milyen sorrendben?" },
      { v: "egyedul", ic: "🤍", b: "Egyedül feladtam", s: "Nem volt, aki számon kérjen." },
      { v: "faradt",  ic: "🔋", b: "Túl fáradt voltam", s: "A nap végére semmi energiám." },
    ],
  },
  focus: {
    id: "focus", key: "focus", multi: true,
    options: [
      { v: "has",      ic: "🎯", b: "Has" },
      { v: "feneck",   ic: "🍑", b: "Fenék" },
      { v: "comb",     ic: "🦵", b: "Combok" },
      { v: "kar",      ic: "💪", b: "Karok" },
      { v: "hat",      ic: "🔙", b: "Hát" },
      { v: "vallnyak", ic: "🧣", b: "Váll / nyak" },
      { v: "egesz",    ic: "✨", b: "Egész test" },
    ],
  },
};

// age brackets (single) + life-stage (single, optional)
const ONB_AGES = ["18–29", "30–39", "40–49", "50–59", "60+"];
const ONB_LIFESTAGE = [
  { v: "nincs",    ic: "🙂", b: "Most nincs ilyen", s: "Semmi különös — mehetünk bátran." },
  { v: "varandos", ic: "🤰", b: "Várandós vagyok", s: "Várandós-barát, óvatos variációk." },
  { v: "friss",    ic: "🍼", b: "Friss szülés után (0–6 hó)", s: "Kíméletes újrakezdés, hasizom-tudatosan." },
  { v: "poszt",    ic: "🧷", b: "Szülés után (6–12 hó)", s: "Fokozatos visszaépítés." },
  { v: "meno",     ic: "🌿", b: "Menopauza idején", s: "Ízület-barát, erő-fókuszú terhelés." },
];

// subscription (single plan)
const ONB_PRICE = { amount: "19 990", perDay: "~666", cur: "Ft", period: "hó" };
const ONB_FEATURES = [
  "8 hetes Foundation program — 40 vezetett edzés",
  "Teljes videótár · F·B·R·T·N·M kódrendszer",
  "Alexa végig veled — follow-along minden edzésen",
  "Heti visszamérés — Hét 5 és Hét 8",
  "Csendes és ízület-kímélő variációk",
  "Új edzések és kihívások havonta",
];
const ONB_TESTIMONIAL = {
  quote: "Három gyerek után ez az első, amit fél év után is csinálok. A visszamérésnél láttam, hogy tényleg erősödöm — azóta nincs kérdés.",
  name: "Tímea", meta: "38 · 6 hónapja tag",
};

// days-per-week segmented choice
const ONB_DAYS = [
  { v: 3, label: "kényelmes" },
  { v: 4, label: "haladós" },
  { v: 5, label: "ajánlott" },
  { v: 6, label: "intenzív" },
];

// ── tone-keyed copy: each step → { meleg, oszinte, vegyes } { hd, sub, alexa } ──
// {n} = name. The reveal + welcome have their own entries.
const ONB_COPY = {
  welcome: {
    eyebrow: "LEXFIT · OTTHONI EDZÉS",
    line1: "Egyedül nehéz.",
    line2: "Együtt muszáj.",
    meleg:  { sub: "Szia! Alexa vagyok — innentől együtt csináljuk. Pár kérdés, és összerakom a heted.", cta: "Kezdjük együtt" },
    oszinte:{ sub: "Nem ígérek csodát. 30 perc naponta, eszköz nélkül — és egy csapat, ami nem hagy kihátrálni.", cta: "Vágjunk bele" },
    vegyes: { sub: "Alexa vagyok. 30 perc, csak egy matrac, és egy közösség mögötted. Pár kérdés, és kész a heted.", cta: "Kezdjük" },
  },
  goal: {
    hd: "Mi hozott ide?",
    sub: "Egyet válassz — ez adja az edzéseid fókuszát. Később bármikor módosítható.",
    meleg:  "Bármit választasz, melletted leszek. Mondd, mire vágysz a legjobban?",
    oszinte:"Legyünk őszinték magunkkal: miért vagy itt? Ezt nem nekem mondod — magadnak.",
    vegyes: "Mondd ki, mit szeretnél — ettől lesz a tiéd a program, nem egy random edzésterv.",
  },
  level: {
    hd: "Hol tartasz most?",
    sub: "Ne becsüld túl és ne is alá — ehhez igazítjuk a tempót és a módosításokat.",
    meleg:  "Nincs rossz válasz. Ahonnan indulsz, az tökéletes kiindulópont.",
    oszinte:"Őszintén, ne a vágyaidat jelöld be. A pontos szint hozza a valódi fejlődést.",
    vegyes: "Mondd meg, hol állsz tényleg — onnan építkezünk, nem máshonnan.",
  },
  about: {
    hd: "Mesélj magadról",
    sub: "Pár alap adat — ezt vesszük kiindulásnak, és a 8. héten újra megnézzük. Bármit kihagyhatsz.",
    meleg:  "Csak hogy ismerjelek — semmi ítélkezés, ez kettőnk közt marad.",
    oszinte:"Ezek nem a tökéletes számok, hanem a kiindulásod. Ahhoz mérünk majd.",
    vegyes: "Pár adat rólad, hogy legyen mihez mérni a fejlődésed.",
  },
  focus: {
    hd: "Hol szeretnél a legtöbbet változni?",
    sub: "Több is lehet — ezekre teszek extra hangsúlyt a heteidben.",
    meleg:  "Mondd meg, mi a szívügyed — oda teszek egy kis pluszt.",
    oszinte:"A fókusz nem azt jelenti, hogy a többit elhanyagoljuk — csak ide jut több.",
    vegyes: "Jelöld, mi fontos — a teljes test megy, de ezekre figyelek külön.",
  },
  motiv: {
    hd: "Miért épp most?",
    sub: "Írd le pár szóban — ez lesz az, amivel emlékeztetlek egy nehéz napon.",
    meleg:  "Nincs jó vagy rossz válasz. Amit ideírsz, azt megőrzöm neked.",
    oszinte:"Az igazi ok. Ezt látod majd a gyenge napokon — legyen őszinte.",
    vegyes: "A te „miért”-ed visz át a nehéz napokon. Mondd ki — én emlékeztetlek rá.",
  },
  time: {
    hd: "Mikor mozogsz a legszívesebben?",
    sub: "Erre az időpontra teszem majd az emlékeztetőt.",
    meleg:  "Akkor mozdulj, amikor neked jó — abból lesz szokás, amit szeretsz.",
    oszinte:"Amikor reálisan meg is csinálod. Ne a tökéleteset jelöld, a valósat.",
    vegyes: "Amikor tényleg menni fog — oda igazítom a napod ritmusát.",
  },
  schedule: {
    hd: "Hány nap egy héten?",
    sub: "A Foundation program 5 napra épül + 2 pihenő, de a tiéd is lehet kevesebb.",
    meleg:  "Inkább kevesebb, de tartható. A rendszer többet ér, mint a hősködés.",
    oszinte:"Annyit jelölj, amit tényleg betartasz. A 3 megtartott nap veri az 5 elhagyottat.",
    vegyes: "Válaszd a tarthatót — a heti ritmus visz előre, nem az egyszeri hajtás.",
  },
  env: {
    hd: "Mire figyeljünk?",
    sub: "Több is lehet. Ezek alapján ajánlom a halk és kíméletes variációkat.",
    meleg:  "Szólj, mi a helyzet otthon — és figyelek rá minden edzésnél.",
    oszinte:"A kifogások fele a körülmény. Mondd el őket előre, és nincs több kifogás.",
    vegyes: "Mondd el a kereteidet — a lakás, a szomszéd, a tested. Ehhez igazítom az edzést.",
  },
  reveal: {
    eyebrow: "KÉSZ — ITT A HETED",
    meleg:  { hd: "Itt a heted, {n}. 💗", sub: "Összeraktam neked. Holnap reggel kezdünk — ott leszek veled végig." },
    oszinte:{ hd: "Itt a heted, {n}.", sub: "Nincs több tervezgetés. Egy dolgod van: az 1. nap. A többit hozza a rendszer." },
    vegyes: { hd: "Itt a heted, {n}.", sub: "Ez az 1. heted a Foundation programban. Nem kell kitalálnod semmit — csak kezdd el." },
    cta: "Aktiválom a programom",
  },
  pay: {
    eyebrow: "AKTIVÁLD A PROGRAMOD",
    hd: "Készen állsz. Indítsuk élesben.",
    sub: "A heted összeállt. Az előfizetés nyitja meg a teljes Foundation programot és a videótárat.",
    cta: "Előfizetek",
    note: "Bármikor lemondható · A Facebook-közösség ingyenes marad",
    meleg:  "Ez a döntés magadról szól. Itt vagyok, és végigkísérlek — nem maradsz egyedül.",
    oszinte:"Ez nem költség, hanem keret. Amit fizetsz, azt jobban betartod — tudom magamról is.",
    vegyes: "A közösség ingyenes marad. Ez az előfizetés a programot nyitja meg — és engem, végig melletted.",
  },
  checkout: {
    hd: "Fizetés",
    sub: "Biztonságos fizetés a SimplePay-jel — titkosítva.",
    meleg:  "Egy kattintás, és kezdjük. Holnap reggel már együtt mozgunk.",
    oszinte:"Átlátható ár, rejtett tételek nélkül. Bármikor lemondhatod.",
    vegyes: "A fizetést a SimplePay intézi, titkosítva. Bármikor lemondható.",
  },
};

// canonical Foundation week split (theme per day) — adapts to days/week
const ONB_WEEK = [
  { d: "Hétfő",     dd: "H",   theme: "Alsótest",      code: "F001", work: true },
  { d: "Kedd",      dd: "K",   theme: "Felsőtest",     code: "F002", work: true },
  { d: "Szerda",    dd: "Sze", theme: "Pihenőnap",     code: null,   work: false },
  { d: "Csütörtök", dd: "Cs",  theme: "Cardio + has",  code: "F003", work: true },
  { d: "Péntek",    dd: "P",   theme: "Teljes test",   code: "F004", work: true },
  { d: "Szombat",   dd: "Szo", theme: "Mobility",      code: "F005", work: true },
  { d: "Vasárnap",  dd: "V",   theme: "Pihenőnap",     code: null,   work: false },
];

const ONB_PHASES = [
  { ic: "🌱", n: "Alap",        w: "Hét 1–2", now: true },
  { ic: "🔨", n: "Építés",      w: "Hét 3–4" },
  { ic: "🔥", n: "Elmélyítés",  w: "Hét 5–6" },
  { ic: "🏆", n: "Kifejezés",   w: "Hét 7–8" },
];

const onbTone = (t) => (t === "Meleg" ? "meleg" : t === "Őszinte" ? "oszinte" : "vegyes");
const onbName = (s, n) => s.replace("{n}", n);

Object.assign(window, {
  ONB_NAME, ONB_STEPS, ONB_DAYS, ONB_AGES, ONB_LIFESTAGE, ONB_PRICE, ONB_FEATURES, ONB_TESTIMONIAL,
  ONB_COPY, ONB_WEEK, ONB_PHASES, onbTone, onbName,
});
