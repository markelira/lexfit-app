# `/` — főoldal rekonstrukciós dev plan

**Forrás:** `LEXFIT_foooldal_spec.md` (2026-08-13, külső audit) · **Készült:** 2026-08-13
**Hatókör:** kizárólag a specifikációban szereplő tételek. Minden más a dokumentum végén,
a „Hatókörön kívül" listában.

Ez a dokumentum **terv, nem végrehajtás.** Fázisonként haladunk: egy fázis végrehajtása,
STOP, tulajdonosi jóváhagyás, csak utána a következő.

---

## 0 · Ellenőrzés — mi igazolódott, mi nem

A specifikáció egy külső auditból készült, és maga is jelzi (Caveats), hogy több
állítása bizonytalan. Minden hivatkozott fájlt megnyitottam. **Hat ponton tér el a
valóság a specifikációtól**, ebből kettő megszünteti a spec egy-egy javaslatát, egy
pedig egy olyan hibát tár fel, amit a spec nem látott.

### Igazolódott

| # | Állítás | Valóság |
|---|---|---|
| 1 | A nyolc kifogásolt szöveg a `benefit.ts`-ben van | ✅ **Pontosan.** Sorok: 26, 27, 31, 32, 36, 37, 42, 52. A `benefitOf()` tényleg a 71. sorban van. |
| 2 | A `benefitOf` a videókártya alcímét adja | ✅ `WorkoutCard.tsx:140` → `.wc-sub`. A `WorkoutCard` a főoldalon a §3-ban jelenik meg, tehát a javítás **látható a `/`-on**. |
| 3 | `Analytics.tsx` env-változóhoz köti a GTM/GA betöltést | ✅ `Analytics.tsx:34` — `if (!GTM_ID && !GA_ID) return null;` |
| 4 | A `.mcta` sticky mobil CTA-sáv nincs a CSS-ben | ✅ **Sehol nincs a `src/`-ben.** Se CSS, se TSX. |
| 5 | A GYIK-ben a `Mi van, ha kimaradok?` a 6., a `Hogyan mondhatom le?` a 7. | ✅ Pontosan. `LandingPage.tsx:154` `FAQ` tömb. |
| 6 | A programkártyák szövege csonkolt | ✅ `landing.css:716` — `-webkit-line-clamp: 2` a `.lxl .lx-embed .pgs-syn`-en. |

### Eltért — ezek megváltoztatják a tervet

**A) A WeekPicker press-állapot MÁR KÉSZ. A spec P1/8. tétele tárgytalan.**
`landing.css:844`:
> `/* Feedback lands on the press, not the release. */`
> `.lxl .wkp-day:not(:disabled):active { transform: scale(.95); }`

Van hozzá `prefers-reduced-motion` kivétel is (`landing.css:1008–1009`), és a
`WeekPicker.tsx:8–11` kommentje explicit módon rögzíti a szándékot. **Ráadásul a spec
javasolt CSS-e hibás osztálynevet használ** (`.wp-day` a valódi `.wkp-day` helyett) és
más értéket (`scale(0.96)` vs. a meglévő `.95`) — ha bemásoltuk volna, egy duplikált,
nem érvényesülő szabályt kaptunk volna. **Nem csinálunk vele semmit.**

**B) A mérés NEM „ki van kapcsolva" — él.**
`NEXT_PUBLIC_GTM_ID` és `NEXT_PUBLIC_GA_ID` is be van állítva (`.env.local:44–45`), és a
`4eaf2b7` commit (2026-08-09) címe: *„Redeploy: activate GTM (NEXT_PUBLIC_GTM_ID set in
Vercel)"*. **Élő bizonyíték:** a Sentry produkciós breadcrumbjaiban valódi látogatók
kattintanak a `button.lx-consent-yes` gombra. A süti-sáv tehát megjelenik, és elfogadás
után a GA4/GTM tölt. A spec „Hiba 2"-je nagyrészt már meg van oldva; ami marad: a Meta
Pixel a GTM konténerbe, a `dataLayer` események, és — lásd C) — a jogi szöveg.

**C) 🔴 Az adatvédelmi tájékoztató jelenleg valótlant állít — ezt a spec nem látta.**
A `docs/legal/adatkezelesi-tajekoztato.md` (a `/adatvedelem` oldal ezt rendereli,
`src/app/(legal)/adatvedelem/page.tsx:12`) két helyen is ezt írja:
- `:38` — *„Az Adatkezelő **nem végez** harmadik feles hirdetési vagy analitikai célú
  követést, nem használ hirdetési sütiket…"*
- `:125` — *„A LEXFIT **nem használ** harmadik feles követő-, hirdetési vagy analitikai
  sütiket… Erre tekintettel a weboldalon **nincs süti-hozzájárulási sáv**…"*

Miközben a GA4 és a GTM él, és a süti-sáv **ott van az oldalon**. A spec szerint a
tájékoztatót „ki kell egészíteni a Meta-adatkezeléssel" — a valóság ennél sürgetőbb:
a dokumentum **már most téves** a Google Analyticsről is. Ezért ezt a tételt a P0-ba
javaslom emelni (indoklás a 2. fázisnál).

**D) A specifikáció §13 premisszája téves.**
A spec szerint *„az árkártyák »Ezt választom« gombja közvetlenül a fizetésre visz,
megkerülve az onboardingot"*. **Nem igaz.** `LandingPage.tsx:1015` — az árkártya `href`-je
`CTA_START`, ami a 228. sorban `"/onboarding"`. Az oldal **összes** CTA-ja az
onboardingra megy; egyetlen kivétel a `:727` ár-horgony gomb, ami a `#elofizetes`
oldalon belüli horgony (ezt a spec maga is rendben lévőnek mondja).

**Ez egyben a kért doksi-ütközés is:** a `05-homepage-wireframe.md` a brief-táblázatában
rögzíti: *„CTA model | **Quiz-only, repeated.** Every CTA → `/onboarding`"*. A repó ezt
követi, tehát **a repó nyer**, és a spec §13 aggálya tárgytalan. A származtatott
oldalakra nincs teendő ebből.

**E) A GYIK 10 kérdés, nem 11.**
A spec prózája 11-et ír, de a **javasolt új sorrendje 10 tételes** — és az pontosan
megfeleltethető a meglévő 10 kérdésnek, 1:1. Tehát tiszta átrendezés, nulla
szövegváltozás. (A `06-homepage-copy.md:514–` ugyanezt a 10-et listázza a jelenlegi
sorrendben — nem rögzít viszont sorrend-döntést, tehát nem ütközik.)

**F) Apró számadat-eltérés a heró ársorában.**
A spec „12,5px/0.78 opacitás"-t ír. Valóság (`landing.css:606`): a méret stimmel, az
opacitás **.9**. A szöveg olvashatósága tehát valamivel jobb a leírtnál — a javaslat
attól még érvényes, csak a kiindulási állapot nem olyan rossz.

### Egy módszertani megjegyzés a spec ellenőrző parancsához

A spec P0/2. lépése ez a grep:
`grep -ri "zsírégetés\|kalóriaégető\|fogyás\|zsírégető" src/`

Ez jelenleg **2 találatot** ad — de **hét** szöveget cserélünk. A maradék öt
(„Égeti a combot…", „Tónus a karban, égető", „Törzs-égető…", „Lapos has…",
„Feszes comb, kerek fenék") egyik keresőszót sem tartalmazza. A grep tehát szükséges,
de **nem elégséges** ellenőrzés; a fázisnál megadok egy teljeset.

---

## Fázis 1 — A benefit-szótár (P0)

**Cél:** a hét policy-kockázatos videókártya-alcím lecserélése úgy, hogy egyetlen
fájlon kívül semmi ne változzon.

### 1.1 · A hét string cseréje

- **Fájl:** `src/lib/benefit.ts`, a `BENEFIT` mátrix (24–55. sor)
- **Mi változik** (a spec 2. fejezetének táblázata; a nyolcadik sor — `Felsőtest` /
  `strength` — **marad**, tehát hét csere):

| Sor | Kulcs | Régi | Új |
|---|---|---|---|
| 37 | `Kardió + has` · burn | `Zsírégetés, felpörgő pulzus` | `Felpörgő pulzus, ugrálás nélkül` |
| 42 | `Teljes test` · burn | `Kalóriaégető, teljes test` | `Teljes test, egy körben` |
| 27 | `Alsótest` · burn | `Égeti a combot, formál` | `Comb és fenék, felpörgetve` |
| 32 | `Felsőtest` · burn | `Tónus a karban, égető` | `Kar és váll, dinamikusan` |
| 52 | `Tartás-fókusz` · burn | `Törzs-égető, tartásjavító` | `Aktív törzs, egyenes hát` |
| 36 | `Kardió + has` · strength | `Lapos has, stabil törzs` | `Stabil törzs, erős has` |
| 26 | `Alsótest` · strength | `Feszes comb, kerek fenék` | `Comb, fenék, vádli` |
| 31 | `Felsőtest` · strength | `Erős kar, feszes hát` | **marad** |

- **Ellenőrzés:**
  1. `grep -rin "zsírégetés\|kalóriaégető\|zsírégető\|fogyás" src/` → **0 találat**
  2. A teljes ellenőrzés (a grep nem fedi le mind a hetet): mind a hét régi stringre
     külön keresés, mind 0 találat; és a hét új string jelenléte a fájlban
  3. `npx tsc --noEmit` + `npm run lint` (delta 0)
  4. Vizuális: `npm run dev:local` → `/` → §3 „Így néznek ki az edzések" sor — a
     kártyák alcímei az újak, egy sorban maradnak
- **Méret:** apró
- **Kockázat:** gyakorlatilag nulla — string-csere típusváltozás nélkül. **Egy dolgot
  nézzünk meg szemmel:** a fájl 23. sorának saját szabálya *„Each phrase ≤ ~28 chars,
  one line"*, és az új `Felpörgő pulzus, ugrálás nélkül` **31 karakter**. A fájlban van
  már 34 karakteres is (`Kioldott gerinc, kevesebb merevség`), tehát nem szabálysértés,
  de a legkeskenyebb kártyán ellenőrizni kell, hogy nem törik-e két sorba.

### 1.2 · Firestore felülíró mezők ellenőrzése

- **Hol:** produkciós Firestore `videos` kollekció — a `subtitle` és `focus[]` mezők
- **Miért:** a `benefitOf()` rétegsorrendje (`benefit.ts:71–75`) szerint az adminban
  megírt `subtitle` és a `focus[]` tagek **felülírják** a mátrixot. Ha ott van
  „zsírégetés"-típusú szöveg, a kódjavítás nem látszik.
- **Mi változik:** kódban semmi. Ha van találat, az az **adminban** javítandó
  (`/admin` → Videók), és a `filters/focus` opciólistában.
- **Ellenőrzés:** egy olvasó szkript vagy az admin felület végignézése; a kifogásolt
  szavak egyike se szerepeljen egyetlen `subtitle`/`focus` értékben sem
- **Méret:** apró (ha nincs találat) / közepes (ha van, és tartalmi átírás kell)
- **Kockázat:** nincs — csak olvasás. A javítás tartalmi döntés, nem kódváltozás.

### ✅ Kész, ha…
A hét string kicserélve, mind a négy ellenőrzés zöld, a Firestore-átvizsgálás lefutott
és tudjuk, van-e felülíró szöveg.

### 🛑 STOP 1

- **Mit nézz meg:** a `/` §3 kártyasorát dev-ben (vagy egy screenshotot róla) — a hét új
  alcímet a helyükön. És döntsd el, hogy a `Felpörgő pulzus, ugrálás nélkül` hossza
  elfogadható-e a kártyán.
- **Kérdésem hozzád:**
  1. Jók így a szövegek, vagy valamelyiken igazítsunk? (Ezek a spec javaslatai, nem
     tesztelt szövegek — a márkahangot te ismered a legjobban.)
  2. Ha a Firestore-ban van felülíró `subtitle`/`focus`: te javítod az adminban, vagy
     készítsek listát a javítandó tételekről?
- **Ha nemet mondasz:** egyetlen fájl egyetlen commitja — `git revert` és minden
  visszaáll. Nincs adatmigráció, nincs séma-változás, nincs visszaút-probléma.

---

## Fázis 2 — Az adatvédelmi tájékoztató korrekciója (P0 — rangsor-módosítási javaslat)

**Cél:** a `/adatvedelem` oldal mondja azt, ami tényleg történik.

> **Miért emelem előre?** A spec ezt az 5. helyre teszi a P0-n belül, „egészítsük ki a
> Meta-adatkezeléssel" megfogalmazással. Az ellenőrzés viszont kimutatta (C pont), hogy
> a dokumentum **már ma is** az ellenkezőjét állítja annak, ami történik: azt írja, hogy
> nincs analitikai követés és nincs süti-sáv, miközben a GA4 fut és a sáv látszik. Ez
> nem „kiegészítés", hanem **élő pontatlanság egy jogi dokumentumban**, és nem függ
> attól, hogy a Meta Pixel mikor kerül be. Ezért P0, és a Pixel elé.

### 2.1 · A két téves bekezdés javítása

- **Fájl:** `docs/legal/adatkezelesi-tajekoztato.md` — `2.3.` pont (38. sor) és `7.1.`
  pont (125. sor)
- **Mi változik:** a „nem végez harmadik feles analitikai követést" és a „nincs
  süti-hozzájárulási sáv" állítások helyére a tényleges helyzet: hozzájárulás-alapú
  Google Analytics 4 + Google Tag Manager, a hozzájárulás `localStorage`-ban tárolva,
  elutasításig semmi nem tölt be. **A pontos jogi szövegezés tulajdonosi/jogi döntés** —
  a terv a tényállást rögzíti, nem a mondatokat.
- **Ellenőrzés:** a `/adatvedelem` oldal renderelt szövege és az `Analytics.tsx`
  tényleges viselkedése között ne maradjon ellentmondás
- **Méret:** közepes (rövid szöveg, de jogi tartalom)
- **Kockázat:** rossz szövegezéssel jogi kitettség — ezért kell jóváhagyás

### 2.2 · A süti-sáv szövegének felülvizsgálata

- **Fájl:** `src/components/Analytics.tsx:61–64`
- **Jelenlegi szöveg:** *„Sütiket használunk a látogatottság méréséhez (Google
  Analytics). Részletek: Adatkezelési tájékoztató."*
- **Mi változik:** ma pontos. **De ha a Meta Pixel bekerül a GTM konténerbe (3. fázis),
  ez a mondat is pontatlanná válik** — a „(Google Analytics)" zárójeles felsorolás
  akkor már nem fedi le a hirdetési célú követést. Ezt a 3. fázissal együtt kell
  módosítani, nem előtte.
- **Ellenőrzés:** a sáv szövege, a tájékoztató és a ténylegesen betöltő tagek hármasa
  fedje egymást
- **Méret:** apró
- **Kockázat:** ha a Pixel a sáv szövegének frissítése nélkül megy élesbe, a hozzájárulás
  nem terjed ki arra, amit ténylegesen betöltünk

### ✅ Kész, ha…
A `/adatvedelem` és a süti-sáv is a valóságot írja le, és a kettő nem mond ellent
egymásnak.

### 🛑 STOP 2

- **Mit nézz meg:** a `/adatvedelem` javított `2.3.` és `7.1.` pontját.
- **Kérdésem hozzád:**
  1. A jogi szöveget te véglegesíted (vagy jogásszal), vagy megírjam a tényállás-alapú
     tervezetet, amit utána átnézel? **Nem publikálok jogi szöveget jóváhagyás nélkül.**
  2. Megerősíted, hogy a GA4 **és** a GTM is él ma produkcióban? (A `.env.local` és a
     `4eaf2b7` commit ezt mutatja, de a Vercel produkciós env-jét nem látom innen.)
- **Ha nemet mondasz:** a `.md` fájl egy commit, azonnal visszavonható. Viszont ha a
  javítás **elmarad**, az ellentmondás élő marad — ezt tudni kell.

---

## Fázis 3 — Meta Pixel és események (P0, tulajdonosi feladat)

**Cél:** a hirdetési mérés a GTM konténerben álljon fel, ne a kódban.

> Ez a fázis **döntően nem kód.** Azért van benne a tervben, mert a spec P0-ba teszi, és
> mert a 2. fázis szövegezése függ tőle.

### 3.1 · Meta Pixel a GTM konténerbe

- **Hol:** a GTM webes konténer (nem a repó)
- **Mi változik:** kódban semmi. A spec indoklása helytálló: így a jövőbeli
  `/tartas` és `/csendes` automatikusan örökli, és nem kell deployolni egy tagért.
- **Ellenőrzés:** GTM Preview mód, majd élesben a Meta Events Manager — a Pixel csak
  **elfogadás után** tüzeljen (a `Analytics.tsx` hard-gatingje ezt garantálja, de a
  konténerben is ellenőrizni kell, hogy nincs „All Pages" trigger consent nélkül)
- **Méret:** közepes · **Kockázat:** rosszul beállított trigger → hozzájárulás nélküli
  követés, ami a 2. fázisban javított tájékoztatót azonnal újra valótlanná teszi

### 3.2 · `dataLayer` események a CTA-kra és a görgetési mélységre

- **Fájl(ok):** a `LandingPage.tsx` CTA-i (a `CTA_START` linkek: `:544`, `:612`, `:838`,
  `:879`, `:997`, `:1015`, `:1037`) és a `#elofizetes` horgony (`:727`)
- **Mi változik:** esemény-push a `dataLayer`-be. **Fontos megkötés:** a `dataLayer`
  létezik akkor is, ha nincs hozzájárulás — a push önmagában nem követés, de ügyelni
  kell rá, hogy személyes adat ne kerüljön bele.
- **Ellenőrzés:** GTM Preview — minden CTA-kattintás pontosan egy eseményt küld, a
  megfelelő szekció-azonosítóval
- **Méret:** közepes · **Kockázat:** a mérés kedvéért ne kerüljön be felesleges kód a
  hero környékére; a scroll-mélység figyelő legyen passzív listener, hogy ne rontsa a
  görgetés simaságát

### ✅ Kész, ha…
A Pixel a konténerből tüzel, kizárólag hozzájárulás után, és a CTA-események
megjelennek a GTM Preview-ban.

### 🛑 STOP 3

- **Mit nézz meg:** GTM Preview a `/`-on: elutasítás → semmi; elfogadás → GA4 + Pixel.
- **Kérdésem hozzád:**
  1. A Pixelt te teszed be a konténerbe, vagy kell hozzá tőlem lépésről lépésre leírás?
  2. Milyen eseményneveket akarsz? (Van-e a Meta-oldalon már bevezetett konvenció,
     amihez igazodni kell?) **Ezt nem találgatom.**
  3. Kell-e most a Conversions API (a spec említi, hogy az alulmérést részben orvosolja),
     vagy az külön kör?
- **Ha nemet mondasz:** a 3.1 nem érinti a repót, a 3.2 egy commit. A 2. fázis szövege
  viszont ilyenkor maradjon a „csak Google Analytics" állapotnál.

---

## Fázis 4 — Szekciónkénti finomítások (P1)

**Cél:** a spec §4 három érdemi javítása. **Minden lépés önállóan ellenőrizhető és
önállóan visszavonható** — kérésed szerint nem vonom őket össze.

### 4.1 · Hero: „Bármikor lemondható" önálló sorba (§1)

- **Fájl:** `src/components/landing/LandingPage.tsx:547–549` (`.hero-price`),
  CSS: `src/app/landing.css:606`
- **Jelenlegi teljes szöveg egy sorban:**
  `Az első heted {490 Ft} - utána {1990 Ft}/hét. Bármikor lemondható.`
- **Mi változik:** a harmadik mondat (`Bármikor lemondható.`) kikerül az ársorból egy
  **önálló sorba, ugyanabban a méretben és stílusban**. Az ársor maga marad.
  *Pontosítás a spechez:* a spec „a CTA gomb alá" fogalmaz — az ársor **már most is** a
  CTA-sor (`.hero-row`, `:543–546`) alatt van, tehát a tényleges változás a **mondat
  leválasztása**, nem a blokk áthelyezése.
- **Ellenőrzés:** vizuálisan 1440px-en és 390px-en; a heró magassága ne nőjön annyit,
  hogy a CTA a hajtás alá csússzon (ezt a 5. fázis méri meg eszközön)
- **Méret:** apró
- **Kockázat:** egy plusz sor a mobil heróban — a spec §6 maga is jelzi, hogy a heró ott
  már magas. Ez a lépés és az 5.4 ellenőrzés összefügg.

### 4.2 · GYIK sorrendcsere (§11)

- **Fájl:** `src/components/landing/LandingPage.tsx:154–195` (`FAQ` tömb)
- **Mi változik:** kizárólag a tömb elemeinek sorrendje. **Egyetlen karakternyi
  szövegváltozás sincs.** A jelenlegi 6. és 7. elem a 2. és 3. helyre kerül, a 2–5.
  eggyel-kettővel lejjebb csúszik; a 8–10. marad.

  | Új # | Kérdés | Jelenlegi # |
  |---|---|---|
  | 1 | Miért fizessek, ha a YouTube-on ingyen is van edzésvideó? | 1 |
  | 2 | **Mi van, ha kimaradok?** | 6 |
  | 3 | **Hogyan mondhatom le?** | 7 |
  | 4 | Teljesen kezdő vagyok. Nekem való? | 2 |
  | 5 | Férfiként is használhatom? | 3 |
  | 6 | Milyen eszköz kell hozzá? | 4 |
  | 7 | Mennyi időm kell rá naponta? | 5 |
  | 8 | Megy TV-n vagy laptopon is? | 8 |
  | 9 | Kapok számlát? | 9 |
  | 10 | Mi lesz a fotóimmal? | 10 |

- **Ellenőrzés:** a `/` `#gyik` szekcióban a fenti sorrend; a `<details>` elemek
  nyithatók; a `key={q}` a kérdésszöveg, tehát a React kulcsok stabilak maradnak
- **Méret:** apró
- **Kockázat:** minimális. Két megjegyzés: (a) a sticky nav scroll-spy szekció-szinten
  működik, a szekción **belüli** átrendezés nem érinti; (b) a `06-homepage-copy.md:514–`
  a jelenlegi sorrendben listázza a kérdéseket — a csere után az a doksi elavul (lásd
  „Tisztázandó" 5.).

### 4.3 · WeekPicker press-állapot (§8) — **NINCS TEENDŐ**

- **Fájl:** `src/app/landing.css:844`
- **Megállapítás:** a `:active` press-visszajelzés **már implementálva van**, kommenttel
  és `prefers-reduced-motion` kivétellel együtt (részletek a 0. fejezet A) pontjában).
- **Mi változik:** semmi. A spec javasolt CSS-ének bemásolása **kifejezetten káros
  lenne** (rossz osztálynév, ütköző érték).
- **Ellenőrzés:** egyszeri vizuális megerősítés valódi ujjal, az 5. fázis részeként
- **Méret:** — · **Kockázat:** —

### ✅ Kész, ha…
A heró ársora két sor, a GYIK az új sorrendben áll, és rögzítettük, hogy a WeekPicker
kész volt.

### 🛑 STOP 4

- **Mit nézz meg:** a `/` heróját (asztali + mobil szélesség) és a `#gyik` szekciót.
- **Kérdésem hozzád:**
  1. A „Bármikor lemondható." külön sorban jól néz ki, vagy inkább maradjon egyben?
  2. A GYIK új sorrendje rendben van? (Ez tulajdonosi tartalmi döntés — a spec
     indoklása, hogy ez a két kérdés a közönség két legnagyobb félelme.)
- **Ha nemet mondasz:** két különálló, apró commit — bármelyik önállóan visszavonható a
  másik érintése nélkül. Ezért nem vontam őket össze.

---

## Fázis 5 — Mobil ellenőrzés valódi eszközön (P1)

**Cél:** lefuttatni azt az ellenőrzést, ami a `FIX.md` 3.12 szerint **soha nem futott le**.

> Ez a fázis **mérés, nem fejlesztés.** A kimenete egy lista arról, mi hibás — a
> javítások köre ebből derül ki, és külön jóváhagyást igényel.

### 5.1 · `.mcta` sticky mobil CTA-sáv — valójában nem létezik

- **Megállapítás:** a `FIX.md:74` a 3.3 tételt (`.mcta`: ajánlat + CTA, ≤760px)
  **készként jelöli — de a `src/`-ben sehol nincs `mcta`.** Se CSS, se markup. A spec
  gyanúja helytálló: vagy átnevezés, vagy regresszió, vagy a `FIX.md` téves.
- **Mi változik:** ebben a fázisban **semmi** — ez döntési pont, nem lépés. Két út:
  (a) megépítjük a sávot, (b) töröljük a téves `[x]`-et a `FIX.md`-ből.
  **Az (a) új funkció**, amit a spec csak feltételezett, hogy létezik — nem építem meg
  külön jóváhagyás nélkül.
- **Ellenőrzés:** —
- **Méret:** (a) közepes / (b) apró · **Kockázat:** (a) egy sticky sáv mobilon
  elfedheti a tartalmat és ütközhet a `.stickynav`-val

### 5.2 · Sticky nav pill ≤560px

- **Fájl:** `src/app/landing.css:589–593` (`@media (max-width: 360px)`)
- **Megállapítás:** van már célzott javítás erre, a komment szerint 320px-en a CTA 48px-t
  lógott ki, és ezt orvosolták. **Eszközön viszont nem lett ellenőrizve.**
- **Ellenőrzés:** valódi telefonon 320 / 360 / 390px szélességen — a wordmark és a CTA
  együtt férjen ki, ne csorbuljon
- **Méret:** apró (ha jó) · **Kockázat:** —

### 5.3 · Coverflow touch-drag valódi ujjal

- **Ellenőrzés:** a §2 telefonképernyő-carousel húzása érintéssel; a `FIX.md` 3.4
  szerinti 1:1 drag, velocity-projekció és a drag-vs-tap elkülönítés működik-e
- **Méret:** apró · **Kockázat:** —

### 5.4 · Heró hajtás 390×844-en

- **Ellenőrzés:** iPhone-méretű kijelzőn a hero CTA a hajtás felett van-e. **Ezt a 4.1
  után kell mérni**, mert az egy sorral megnöveli a heró magasságát.
- **Méret:** apró · **Kockázat:** ha a CTA a hajtás alá kerül, az a 4.1 újragondolását
  jelenti (nem visszavonását — lehet, hogy inkább a heró más eleme szűkül)

### ✅ Kész, ha…
Mind a négy pont le van mérve valódi eszközön, és van egy listánk arról, mi hibás.

### 🛑 STOP 5

- **Mit nézz meg:** ezt a fázist **te futtatod le a telefonodon** — én nem tudom valódi
  eszközön elvégezni. Kérek róla visszajelzést vagy screenshotokat.
- **Kérdésem hozzád:**
  1. `.mcta`: megépítsük, vagy a `FIX.md`-ből töröljük a téves pipát? (Ha építjük: az
     új funkció, és külön kört érdemel.)
  2. A négy pontból melyik bukott el?
- **Ha nemet mondasz:** ez a fázis mérés — nincs mit visszavonni.

---

## Fázis 6 — GYIK nyitás-simítása (P2, opcionális)

**Cél:** a `<details>` natív ugrásának lecserélése egy visszafogott átmenetre.

- **Fájl:** `src/app/landing.css` (a `.faq-item` szabályok), markup változás
  valószínűleg nem kell
- **Mi változik:** `grid-template-rows: 0fr → 1fr` átmenet — ugyanaz a minta, amit a
  `FIX.md` 3.8 a journey-kártyáknál már használ, tehát nincs új technika és **nincs új
  könyvtár**. `prefers-reduced-motion` alatt kikapcsolva.
- **Ellenőrzés:** nyitás/zárás asztali és mobil böngészőben; reduced-motion bekapcsolva
  a natív viselkedés maradjon; a `<details>` billentyűzetes és képernyőolvasós működése
  ne sérüljön
- **Méret:** apró · **Kockázat:** a `<details>` natív szemantikáját elrontani könnyű —
  ha az akadálymentesség bármit romlik, ez a lépés nem éri meg. A spec maga is
  opcionálisnak jelöli.

### ✅ Kész, ha…
A GYIK simán nyílik, reduced-motion alatt natívan, és a billentyűzetes használat ép.

### 🛑 STOP 6

- **Mit nézz meg:** nyiss ki néhány kérdést mindkét beállítás mellett.
- **Kérdésem hozzád:** megtartjuk, vagy visszaállunk a natívra? (Ez ízlés kérdése — a
  natív is teljesen elfogadható, ahogy a spec is írja.)
- **Ha nemet mondasz:** egy CSS-commit, azonnal visszavonható.

---

## Fázis 7 — Programkártya-szövegek (P2)

**Cél:** a programkártyák leírása ne csonkolva jelenjen meg a landingen.

### 7.1 · A `pgs-syn` csonkolás feloldása vagy a forrásszöveg rövidítése

- **Fájl / hely:** `src/app/landing.css:716` —
  `.lxl .lx-embed .pgs-syn { … -webkit-line-clamp: 2; }`
  A szöveg forrása a Firestore `programs` dokumentumok `synopsis` mezője
  (`ProgramBanner.tsx:75`).
- *Pontosítás a spechez:* a spec `cap-body`-t ír, de a csonkolt elem valójában a
  `.pgs-syn`. A `cap-body` egy másik, nem csonkolt szövegosztály.
- **Mi változik — két út, tulajdonosi döntés:**
  (a) **Kód:** a landing-változatban `-webkit-line-clamp: 3` (a kártyák magassága nő)
  (b) **Tartalom:** a `synopsis` szövegek rövidülnek az adminban, hogy kiférjenek két
  sorba — a kód érintetlen marad
  A spec mindkettőt említi; a (b) az elvhűbb („a kártya adjon választ"), a (a) a
  gyorsabb.
- **Ellenőrzés:** a `/` §3 hét programkártyája — egyiken se maradjon „…"; a kártyák
  egyforma magasak maradjanak
- **Méret:** (a) apró / (b) közepes, tartalmi munkával
- **Kockázat:** (a) a hét kártya rácsa elcsúszhat, ha eltérő hosszúak a szövegek;
  (b) nincs kódkockázat

### ✅ Kész, ha…
A programkártyákon nincs csonkolt szöveg, és a rács egyenletes.

### 🛑 STOP 7

- **Mit nézz meg:** a §3 programkártya-sort asztali és mobil nézetben.
- **Kérdésem hozzád:** (a) kódból oldjuk fel, vagy (b) a szövegeket rövidítjük az
  adminban? És ha (b): te írod át, vagy készítsek listát a jelenlegi hosszakról?
- **Ha nemet mondasz:** (a) egy CSS-sor visszavonása; (b) tartalmi visszaállítás az
  adminban — a régi szövegeket előtte lementjük.

---

## Hatókörön kívül — nem csináljuk most

Ezeket az ellenőrzés közben láttam, de **nincsenek a specifikációban**, ezért nem
kerülnek be a tervbe:

1. **A `LandingPage.tsx` 1070 soros monolit szétbontása** szekció-komponensekre — a spec
   §8 „technikai javaslatként" említi, de kizárólag a *származtatott oldalak*
   előkészítéseként; a `/tartas` és `/csendes` külön dokumentum feladata.
2. **`docs/landing-analysis/` 18 elemzése** — a `FIX.md` nyitott tételei és a többi
   dokumentum javaslatai; kifejezetten kizártad őket.
3. **A `FIX.md` 3.3 téves `[x]` jelölése** — a `.mcta` ügyének melléktermékeként
   felszínre került, de a doksi karbantartása csak akkor téma, ha az 5.1-nél a (b) utat
   választod.
4. **A `06-homepage-copy.md` elavulása a GYIK-csere után** — lásd „Tisztázandó" 5.
5. **A benefit-mátrix `calm` bucket szövegei** — a spec nem kifogásolta őket, nem is
   nyúlok hozzájuk (a `Kioldott gerinc, kevesebb merevség` 34 karakter, ami a fájl saját
   ~28-as irányelvét már ma túllépi).
6. **A süti-sáv `Elutasítom` állapotának alulmérése** — a spec §3 figyelmeztetésként
   említi, de nem kér rá megoldást; a Conversions API bekötése külön kör.

---

## Tisztázandó

Ezekre a kérdésekre nem találtam egyértelmű választ a specifikációban, és nem akarok
találgatni:

1. **`.mcta`:** a spec feltételezte, hogy létezik, és csak ellenőrzést kért. Mivel nem
   létezik — **megépítendő funkció ez, vagy a `FIX.md` téves jelölése?** Ettől függ,
   hogy az 5.1 egy apró doksi-javítás vagy egy új komponens.
2. **A jogi szöveg gazdája:** az adatvédelmi tájékoztató javítását megírjam
   tényállás-alapon átnézésre, vagy te/jogász fogalmazza? Jóváhagyás nélkül nem
   publikálok jogi szöveget.
3. **Esemény-nevezéktan:** a 3.2 `dataLayer` eseményekhez van már bevezetett
   konvenciód a Meta/GA oldalon, amihez igazodni kell?
4. **Programkártyák:** kód (clamp 3 sorra) vagy tartalom (rövidebb `synopsis`)? És ha
   tartalom: mely programok érintettek — ehhez a produkciós katalógus szövegeit kell
   megnézni.
5. **Doksi-szinkron:** a GYIK átrendezése után a `06-homepage-copy.md` sorszámozása
   elavul. Frissítsük a copy-decket a csere részeként, vagy maradjon a doksi a
   „szövegek forrása, nem sorrendé" szerepben?
6. **A `Felpörgő pulzus, ugrálás nélkül` 31 karakter** — elfogadható, vagy rövidebb
   változatot keressünk? (Csak akkor válaszolj, ha a STOP 1-nél a kártyán soknak látod.)
