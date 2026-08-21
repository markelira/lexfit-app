# TERVEZET — az adatkezelési tájékoztató módosítása a lead magnet kvízhez

> # ✅ ÁTVEZETVE — 2026-08-21
>
> **Az ügyvéd a tervezetet változtatás nélkül jóváhagyta**, és a módosítás
> beépült a hatályos `adatkezelesi-tajekoztato.md`-be (hatályos 2026. augusztus
> 21-től, verzióazonosító `2026-08-21`). **Ez a fájl ettől kezdve csak
> munkanapló** — a hatályos szöveg a másik fájlban van, azt kell olvasni.
>
> A 11. pont nyolc kérdésének elfogadott válasza a tervezet minden
> alapértelmezése: **a 9. cikk alkalmazandó (A változat)**, 12/24 hónapos
> megőrzés, dátum-alapú verziószámozás, a kvíz localStorage-a feltétlenül
> szükséges tárolás, a hozzájáruló szöveg elegendő, a `life_stage` kérdés marad.
>
> ---
>
> **⚠️ EZ NEM HATÁLYOS SZÖVEG.** Ez egy **ügyvédi felülvizsgálatra szánt szövegtervezet**,
> amelyet fejlesztői oldalról állítottunk össze abból, amit a rendszer ténylegesen csinálni
> fog. Nem jogi tanács. **Élesítés előtt ügyvédi jóváhagyás kötelező.**
>
> **Készült:** 2026-08-21 · **Alapdokumentum:** `docs/legal/adatkezelesi-tajekoztato.md`
> (hatályos 2026. augusztus 11-től) · **Kiváltó ok:** `docs/kviz-helyzetjelentes.md` 7.3 pont
>
> **Célja:** az ügyvédnek ne kelljen a rendszert felderítenie. Minden alábbi pont megmondja,
> **hova** kerül be, **mit** ír, és **miért** — a tényleges műszaki működésre hivatkozva.

---

## 0. Miért kell módosítani

A LEXFIT egy Meta Ads kampányhoz **lead magnet kvízt** indít a `lexfit.hu/terv` címen.
Ez három ponton lép túl a hatályos tájékoztatón:

| # | Új elem | Miért nem fedi a hatályos szöveg |
|---|---|---|
| 1 | **Fiók nélküli érintett** (lead) | A hatályos tájékoztató végig fiókkal rendelkező felhasználót feltételez. A megőrzési idők „a fiók fennállásáig" szólnak, a törlési folyamat (6.3) a fiók törlésére épül — leadre egyik sem értelmezhető. |
| 2 | **Egészséggel összefüggő adatok** (testmagasság, testsúly, cél-testsúly, élethelyzet, mozgási és edzési szokások) + ezekből képzett **kalóriaajánlás** | A hatályos szöveg a GDPR 9. cikkét **egyetlen helyen** említi (3.2 pont), ott is kizáró értelemben: a haladási fotókból az Adatkezelő „különleges adatot nem képez". A kvíz ezzel szemben kifejezetten testadatot **kér be** és abból **egyéni ajánlást képez**. |
| 3 | **Marketing- (hírlevél-) levelezés** | A hatályos 3.1 táblázat csak tranzakciós (g) és edzés-emlékeztető (h) e-mailt ismer. Reklámlevél önálló célként nem szerepel. Magyarországon a Grtv. (2008. évi XLVIII. tv.) 6. §-a alapján **nincs soft opt-in** — minden reklámlevélhez kifejezett, előzetes hozzájárulás kell. |

**Amire NINCS szükség:** új adatfeldolgozóra. A leadek ugyanabban a Firestore-ban
(europe-west3), ugyanazzal a SendGrid-fiókkal kerülnek kezelésre, mint a meglévő
levelezés — az 5. pont táblázata tehát nem bővül új sorral, csak a SendGrid szerepe pontosul.

---

## 1. ⚖️ ELSŐ KÉRDÉS AZ ÜGYVÉDHEZ — a 9. cikk alkalmazandó-e?

**Ez a tervezet a konzervatív választ feltételezi (igen, 9. cikk), de a döntés jogi.**
Kérjük ennek megerősítését vagy cáfolatát, mert a teljes további szövegezés ezen áll.

| Álláspont | Érv | Következmény, ha ez nyer |
|---|---|---|
| **(A) 9. cikk alá esik** *(a tervezet ezt feltételezi)* | A testmagasság + testsúly + cél-testsúly + élethelyzet (szülés utáni állapot, változókor) + ezekből képzett **egyéni kalóriaajánlás** együttese már „egészségi állapotra vonatkozó adat". A `life_stage` opciók (`postpartum`, `menopause`) önmagukban is egészségi állapotra utalnak. | **Kifejezett** hozzájárulás kell (9. cikk (2) a)), külön checkboxban, összevonás nélkül. Szigorúbb megőrzés és biztonsági intézkedések. |
| **(B) Nem esik a 9. cikk alá** | Önmagában a testmagasság és testsúly nem feltétlenül „egészségügyi adat"; wellness-kontextusban rögzített adat nem automatikusan különleges adat. | Elég a 6. cikk (1) a) hozzájárulás. A checkbox-szerkezet egyszerűsödhet, a megőrzés enyhébb lehet. |

**Fejlesztői megjegyzés a döntéshez:** a `life_stage` kérdés (szülés utáni időszak /
változókor) az, ami a mérleget leginkább az (A) felé billenti. **Ha az ügyvéd a (B)-t
választaná, de a `life_stage` miatt aggálya van, műszakilag bármikor elhagyható ez az
egy kérdés** — ez terméktervezési, nem fejlesztési döntés, és a tulajdonosnak kell
meghoznia. Kérjük ezt külön jelezni.

---

## 2. Beszúrás a 2. pontba (Alapelvek)

**Hova:** a 2.4. pont után, új **2.5.** pontként.

> 2.5. Az Adatkezelő a Weboldalon **kitöltési kötelezettség nélküli, ingyenes kérdőívet
> („kvíz")** tesz elérhetővé, amely a kitöltő válaszai alapján tájékoztató jellegű
> becslést és programajánlást ad. A kvíz kitöltéséhez regisztráció nem szükséges. **A
> kérdőívre adott válaszok a kitöltés ideje alatt kizárólag a látogató saját böngészőjében
> tárolódnak; az Adatkezelő szervereire semmilyen adat nem kerül mindaddig, amíg a kitöltő
> az utolsó lépésben az e-mail-címét meg nem adja és a hozzájárulást kifejezetten meg nem
> adja.** A kvíz eredménye tájékoztató jellegű, **nem minősül orvosi tanácsnak vagy
> diagnózisnak**, és nem helyettesíti egészségügyi szakember véleményét.

**Miért:** ez rögzíti a beépített adatvédelmet (adattakarékosság + hozzájárulás előtti
adatmentesség), ami a rendszer tényleges működése (`docs/kviz-helyzetjelentes.md` 5. fejezet),
és egyben az egészségügyi felelősségkizárást is.

**Módosítás a meglévő 2.4. pontban** — a jelenlegi mondat végéhez fűzendő:

> …és nem jár az érintettre nézve joghatással vagy hasonlóan jelentős hatással. **Ugyanez
> irányadó a kvíz automatikusan előálló eredményére (kalóriabecslés, programajánlás,
> lépéscél) is: az kizárólag tájékoztató jellegű iránymutatás, amelyhez semmilyen
> joghatás vagy az érintettre nézve hasonlóan jelentős következmény nem kapcsolódik.**

---

## 3. Új sorok a 3.1. áttekintő táblázatba

A meglévő **m)** sor után, **n)** és **o)** jelöléssel:

| Cél | Jogalap (GDPR 6. cikk) | Kezelt adatok köre | Megőrzési idő |
|---|---|---|---|
| **n) Lead-kérdőív („kvíz") kitöltése és a személyes eredmény elkészítése, elküldése** | (1) **a) — kifejezett hozzájárulás**, egészségi állapottal összefüggő adatok tekintetében **a 9. cikk (2) a) pontja szerinti kifejezett hozzájárulás** | Keresztnév, e-mail-cím; a kérdőívre adott válaszok: cél, biológiai nem, korsáv, **testmagasság, testsúly, cél-testsúly**, napközbeni mozgás, becsült napi lépésszám, edzési gyakoriság, **élethelyzet**, vállalható edzésidő, fő akadály; a válaszokból számított eredmény (becsült napi energiaigény, ajánlott program, napi lépéscél); a hozzájárulás időbélyege, a tájékoztató elfogadott változatának azonosítója, a kitöltés technikai adatai (IP-cím, böngészőazonosító a visszaélés-védelemhez), a kampányazonosítók (UTM-paraméterek) | **A hozzájárulás visszavonásáig, ennek hiányában a kitöltéstől számított 24 hónapig.** Az egészségi állapottal összefüggő adatok (testadatok, élethelyzet) **12 hónap** után automatikusan törlésre kerülnek, akkor is, ha a lead egyébként aktív marad. Regisztráció esetén az adatok a fiókhoz kapcsolódnak, és a továbbiakban az a) sor szerint kezelendők. |
| **o) Marketing- (hírlevél-) e-mailek** | (1) a) — hozzájárulás; **Grtv. 6. § szerinti kifejezett, előzetes hozzájárulás** | E-mail-cím, keresztnév; a szegmentáláshoz a kérdőív **nem egészségügyi** válaszai (cél, fő akadály, ajánlott program); a küldés és a leiratkozás technikai adatai | A hozzájárulás visszavonásáig (leiratkozás), ennek hiányában legfeljebb az n) sor szerinti megőrzési időig |

**⚖️ Kérdés az ügyvédhez:** a **24 / 12 hónapos** megőrzési idők fejlesztői javaslatok
(az adattakarékosság elve alapján, a különleges adatra rövidebb idővel). Kérjük ezek
megerősítését vagy módosítását — a rendszer bármely értéket automatikusan érvényesíti.

**Módosítandó meglévő sor — l) Meta Pixel.** A „tölcsér eseményei" felsorolás pontosítandó,
és kiegészítendő egy kizáró mondattal:

> …valamint a tölcsér eseményei (**a kérdőív indítása, lépésenkénti előrehaladása
> — a válaszok tartalma nélkül —, a lead-adatok megadása,** regisztráció, fizetési lépés
> elérése). **A kérdőívre adott válaszok, így különösen a testadatok és az élethelyzetre
> vonatkozó válasz, a hirdetési rendszerek felé semmilyen formában nem kerülnek
> továbbításra.**

**Miért:** ez nem csak jogi vállalás, hanem a kódban kikényszerített szabály
(`src/lib/track.ts:13` — „NEVER carry personal data … no answers"), és vélhetően a Meta
Business Tools feltételeinek is előfeltétele.

**Módosítandó meglévő sor — m) Meta Conversions API.** Ha a lead-esemény is CAPI-n megy:

> …| A sikeres fizetés **, illetve a kérdőív kitöltésének** ténye, összege és időpontja,
> valamint a párosításhoz a **felhasználó** e-mail-címének egyirányú kivonata (SHA-256 hash)…
> **A kérdőív esetében kizárólag az esemény ténye és az e-mail-cím kivonata kerül
> továbbításra — a kérdőív válaszai és az azokból számított eredmény nem.**

---

## 4. Új alpont: 3.4. — a kvíz egészségügyi jellegű adatai

**Hova:** a 3.3. („Finish Share") pont után, a 3.2. ponttal párhuzamos szerkezetben.

> ### 3.4. Külön figyelmet érdemlő adatkör: a kérdőív egészséggel összefüggő adatai
>
> A kérdőív olyan adatokat is bekér (testmagasság, testsúly, cél-testsúly, élethelyzet,
> mozgási és edzési szokások), amelyek a GDPR 9. cikke szerinti, egészségi állapottal
> összefüggő különleges adatnak minősülhetnek. Az Adatkezelő ezeket kiemelt védelemmel kezeli:
>
> - a kitöltés **teljesen önkéntes**, és a Weboldal, valamint a szolgáltatás a kérdőív
>   kitöltése nélkül is teljes értékűen használható;
> - az adatkezelés jogalapja **kizárólag az érintett kifejezett hozzájárulása**
>   (GDPR 9. cikk (2) a)), amelyet a kitöltő **külön, előre be nem jelölt jelölőnégyzetben**
>   ad meg; ez a hozzájárulás **nem vonható össze** a marketingcélú hozzájárulással, és
>   annak megadása nem feltétele a marketing-hozzájárulásnak (és fordítva);
> - **az adatok az Adatkezelő szervereire kizárólag a hozzájárulás megadásával egyidejűleg
>   kerülnek** — a kérdőív kitöltése közben minden válasz a látogató saját böngészőjében marad;
> - az adatokhoz kizárólag az Adatkezelő erre feljogosított munkatársa fér hozzá; az
>   adatbázis hozzáférési szabályai a lead-adatokat a Weboldal felől **olvashatatlanná** teszik;
> - az egészséggel összefüggő adatok **12 hónap** után automatikusan törlésre kerülnek (3.1 n));
> - **az Adatkezelő ezeket az adatokat harmadik félnek nem adja át, és hirdetési célra —
>   így a hirdetési rendszerek (Google, Meta) felé — semmilyen formában nem továbbítja**;
> - az adatokból képzett eredmény **tájékoztató jellegű becslés**, nem orvosi tanács;
>   krónikus betegség, szülés utáni időszak vagy egyéb egészségi kockázat esetén az
>   Adatkezelő orvosi konzultációt javasol, amire a kérdőív eredményoldala figyelmeztet.
>
> A hozzájárulás bármikor, indokolás nélkül visszavonható (6.8. pont).

---

## 5. Kiegészítés a 4. ponthoz (Az adatok forrása)

A meglévő mondat végéhez:

> …valamint a szolgáltatás használata során technikailag keletkező adatok (pl.
> videomegtekintési események). **A lead-kérdőívet kitöltő, fiókkal nem rendelkező
> érintettek esetében az adatok forrása kizárólag maga az érintett (a kérdőívre adott
> válaszok és a megadott elérhetőség), valamint a hirdetési kampányazonosítók, amelyek
> arról tájékoztatnak, hogy a látogató melyik hirdetésről érkezett.**

---

## 6. Kiegészítés az 5. ponthoz (Adatfeldolgozók)

**Új sor NEM kell.** A meglévő **SendGrid** sor „Szerep" oszlopa pontosítandó:

> tranzakciós **,** emlékeztető **és — kizárólag hozzájárulás alapján — marketingcélú**
> e-mailek kiküldése

**⚖️ Kérdés az ügyvédhez:** szükséges-e a Firebase/Google sor „Kezelt adatok" oszlopát is
kiegészíteni a lead-adatokkal (`fiókadatok, haladási adatok, fotók` → `+ lead-kérdőív adatai`)?
Fejlesztői oldalról ugyanabban az adatbázisban, ugyanabban a régióban tárolódnak.

---

## 7. Új alpont a 6. ponthoz: a fiók nélküli érintettek jogai

**Hova:** új **6.8.** pontként, a 6.7. után.

> 6.8. **Fiókkal nem rendelkező érintettek (lead-kérdőív kitöltői).** A kérdőívet kitöltő,
> de fiókot nem regisztráló érintettek ugyanazokkal a jogokkal rendelkeznek, mint a
> felhasználók; mivel esetükben az alkalmazás önkiszolgáló felületei (6.1–6.3) nem
> elérhetők, a jogok gyakorlásának módja a következő:
>
> - **Leiratkozás / a marketing-hozzájárulás visszavonása:** minden marketingcélú e-mail
>   alján egyetlen kattintással elérhető leiratkozási hivatkozás található, amely azonnal
>   és automatikusan hatályosul. A leiratkozás nem igényel bejelentkezést vagy azonosítást.
> - **Törlés, hozzáférés, helyesbítés, adathordozhatóság:** az **info@amstudios.hu** címre
>   küldött kérelemmel, **a kérdőívben megadott e-mail-címről**. Az Adatkezelő a kérelmet
>   indokolatlan késedelem nélkül, **legkésőbb egy hónapon belül** teljesíti. A törlés
>   ebben az esetben **a személyes adatok végleges és helyreállíthatatlan törlését jelenti**;
>   a 6.3. pont szerinti 30 napos visszavonhatósági időszak fiók hiányában nem alkalmazandó.
> - **Az egészséggel összefüggő adatokra vonatkozó hozzájárulás visszavonása** ugyanezen a
>   címen kérhető; a visszavonás esetén az Adatkezelő ezeket az adatokat haladéktalanul törli,
>   és a korábban elkészített eredményt nem használja fel újra.
>
> Az azonosítás módja: a kérelem elfogadott azonosításnak minősül, ha az a kérdőívben
> megadott e-mail-címről érkezik.

**⚠️ Fejlesztői megjegyzés — ez a pont műszaki előfeltételt teremt.** A jelenlegi
GDPR-gépezet (`/api/account/delete`, `/api/account/export`, `purge-accounts` napi feladat)
**kizárólag fiókazonosító alapján működik**. A fenti szöveg csak akkor lesz igaz, ha a
lead-kollekcióval **egyidejűleg** megépül az e-mail alapú törlési és exportálási út is.
Ez a `docs/kviz-helyzetjelentes.md` 7.3/4. pontja, és élesítési előfeltétel.

---

## 8. Kiegészítés a 7.2. táblázathoz (feltétlenül szükséges tárolás)

Új sor:

| Elem | Típus | Cél | Élettartam |
|---|---|---|---|
| A kérdőív kitöltés közbeni állapota | localStorage | a megkezdett kérdőív válaszainak megőrzése, hogy az oldal frissítésekor ne vesszenek el; **az Adatkezelő szerveréhez nem továbbítódik** | a kitöltés befejezéséig, illetve a böngészőben történő törlésig |

**Miért „feltétlenül szükséges":** az érintett által kifejezetten kért szolgáltatás
(a kérdőív kitöltése) működéséhez nélkülözhetetlen, nyomon követésre nem alkalmas, és az
adatot nem hagyja el a böngészőt — így az ePrivacy szabályok szerint hozzájárulás nélkül
alkalmazható. **⚖️ Kérjük ennek megerősítését.**

---

## 9. A tájékoztató verziószámozása

**Hova:** a 10. pont végéhez.

> Az Adatkezelő a tájékoztató mindenkori változatát **verzióazonosítóval** látja el
> (a hatálybalépés dátuma, `ÉÉÉÉ-HH-NN` formátumban). A hozzájárulás megadásakor a
> rendszer rögzíti, hogy az érintett a tájékoztató **melyik változatát** fogadta el —
> ez az elszámoltathatóság (GDPR 5. cikk (2)) igazolását szolgálja.

**Fejlesztői megjegyzés:** ehhez a jelen módosítás hatálybalépési dátuma lesz az első
verzióazonosító. Ez a `consent_policy_version` mező forrása — a
`docs/kviz-helyzetjelentes.md` 6.8/7.3-3. nyitott kérdésére ez a javasolt válasz:
**külön verziószám helyett a hatálybalépés dátuma legyen a verzió.** Egyszerűbb, és
a hatályos szöveg amúgy is dátummal azonosítja magát.

---

## 10. A kvíz felületén megjelenő szövegek (a tájékoztatón kívül, de jóváhagyandó)

Ezek nem a tájékoztató részei, de jogi jóváhagyást igényelnek, mert a hozzájárulás
érvényessége múlik rajtuk.

**A) A két jelölőnégyzet szövege** — külön, előre **nem** bejelölve:

1. *(kötelező)* „Hozzájárulok, hogy a megadott adataimat — a keresztnevem, az e-mail
   címem és a kérdőívben adott válaszaim, köztük az egészséggel összefüggő adatok
   (testadatok, mozgási szokások) — a LexFit a személyes eredményem elkészítéséhez és
   elküldéséhez kezelje. [Adatkezelési tájékoztató]"
2. *(opcionális)* „Kérem a LexFit e-mailes tippjeit és ajánlatait. Bármikor leiratkozhatok."

**⚖️ Kérdés:** az 1. pont szövege elég-e a 9. cikk (2) a) szerinti „kifejezett"
hozzájáruláshoz, vagy nevesíteni kell benne a testmagasságot, testsúlyt és a cél-testsúlyt
tételesen?

**B) Az eredményoldal kötelező apró betűs szövege:**

> „A kérdőív eredménye tájékoztató jellegű becslés, nem minősül orvosi tanácsnak. Ha
> krónikus betegséged van, edzés előtt konzultálj orvosoddal."
>
> *(ha az élethelyzet szülés utáni időszak):* „Szülés után az újrakezdés előtt kérd ki
> orvosod véleményét."

**C) 18 éves korhatár.** A hatályos tájékoztató 2.1. pontja szerint a szolgáltatás
18 év feletti fogyasztóknak szól. **⚖️ Kérdés:** szükséges-e a kvíz felületén is
kifejezetten feltüntetni a korhatárt, tekintettel arra, hogy a kvíz hirdetésből érkező,
még nem szerződött látogatókat is elér, és testadatot kér?

---

## 11. Összefoglaló ellenőrzőlista az ügyvédnek

| # | Kérdés | Hol |
|---|---|---|
| 1 | A 9. cikk alkalmazandó-e a kvíz testadataira? | 1. pont |
| 2 | Ha igen: a `life_stage` kérdés megtartható-e, vagy elhagyandó? | 1. pont |
| 3 | A 24 / 12 hónapos megőrzési idők megfelelőek-e? | 3. pont |
| 4 | A Firebase-sor kiegészítendő-e a lead-adatokkal? | 6. pont |
| 5 | A kvíz localStorage-tárolása „feltétlenül szükséges"-nek minősül-e? | 8. pont |
| 6 | A hozzájáruló szöveg elég „kifejezett"-e a 9. cikkhez? | 10/A |
| 7 | Kell-e korhatár-jelzés a kvíz felületén? | 10/C |
| 8 | A dátum-alapú verziószámozás elfogadható-e? | 9. pont |

---

## 12. Mi történik a jóváhagyás után (fejlesztői oldal)

1. A jóváhagyott szöveg beépül a `docs/legal/adatkezelesi-tajekoztato.md`-be, új
   hatálybalépési dátummal; a `/adatvedelem` oldal automatikusan ezt rendereli.
2. A hatálybalépési dátum bekerül a kódba mint `consent_policy_version` — ezt küldi a
   kliens minden lead-mentéskor, és ez tárolódik a hozzájárulási naplóban.
3. A 10. pont szerinti értesítés a meglévő felhasználóknak — **⚖️ kérdés:** szükséges-e,
   tekintettel arra, hogy a módosítás kizárólag új, önkéntes adatkezelést vezet be, és a
   meglévő felhasználók adatkezelését nem érinti?
4. Megépül az e-mail alapú lead-törlési és -exportálási út (7. pont fejlesztői megjegyzése).
