# Adatkezelési tájékoztató

**LEXFIT — online otthoni edzésprogram-szolgáltatás**

Hatályos: 2026. augusztus 22. napjától. · Verzióazonosító: **2026-08-22**

*(Korábbi hatályos változatok: 2026. augusztus 11., 2026. augusztus 21. — a jelen
módosítás a TikTok Pixel mint hirdetésmérési eszköz bevezetését vezeti át. Új
adatkezelési célt nem hoz létre, és kizárólag azokra a látogatókra hat, akik a
süti-sávon hozzájárultak a hirdetésméréshez. A meglévő felhasználók fiókjához
kapcsolódó adatkezelést a módosítás nem érinti.)*

A jelen tájékoztató az Európai Parlament és a Tanács (EU) 2016/679 rendelete (általános adatvédelmi rendelet, **GDPR**) 13–14. cikke, valamint az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény (**Infotv.**) alapján készült.

---

## 1. Az Adatkezelő

- **Név:** AM Studios Group Korlátolt Felelősségű Társaság (AM Studios Group Kft.) (a továbbiakban: **Adatkezelő**)
- **Székhely:** 3532 Miskolc, Miklós utca 17. 2. em. 26. ajtó
- **Cégjegyzékszám:** 05 09 039717 (Miskolci Törvényszék Cégbírósága) · **Adószám:** 33004312-1-05
- **Képviselő:** Kecskeméti Ádám
- **E-mail (adatvédelmi megkeresések):** info@amstudios.hu
- **Weboldal:** https://lexfit.hu
- **Adatvédelmi tisztviselő:** nincs (a GDPR 37. cikk szerinti kijelölési kötelezettség nem áll fenn)

## 2. Alapelvek, az adatkezelés környezete

2.1. A LEXFIT magyar nyelvű, előfizetéses fitnesz-webalkalmazás 18 év feletti fogyasztók részére. Az Adatkezelő a személyes adatokat a célhoz kötöttség, az adattakarékosság és a beépített adatvédelem elve szerint kezeli.

2.2. A felhasználói adatok elsődleges tárolási helye a Google Firebase platform (Firestore adatbázis, Authentication, Cloud Storage), amelynek régiója **europe-west3 (Frankfurt, Németország)** — az adatok tehát alapértelmezetten az Európai Unióban tárolódnak.

2.3. Az Adatkezelő a Weboldalon webanalitikai és hirdetésmérési célú mérést végez (Google Analytics 4, Google Tag Manager, Meta Pixel, TikTok Pixel), **kizárólag a látogató előzetes, önkéntes hozzájárulása alapján**: hozzájárulás hiányában egyetlen mérőkód sem töltődik be és analitikai vagy hirdetési süti nem kerül elhelyezésre (részletesen a 7. pont). Az Adatkezelő a személyes adatokat nem értékesíti.

2.4. Az Adatkezelő nem hoz a GDPR 22. cikke szerinti, kizárólag automatizált adatkezelésen alapuló, joghatással járó döntést. A szolgáltatáson belüli személyre szabás (pl. a regisztrációs kérdőív válaszai alapján ajánlott edzésbeosztás, aktivitásalapú kedvezményajánlatok) a szerződés teljesítésének része, és nem jár az érintettre nézve joghatással vagy hasonlóan jelentős hatással. **Ugyanez irányadó a lead-kérdőív automatikusan előálló eredményére (kalóriabecslés, programajánlás, lépéscél) is: az kizárólag tájékoztató jellegű iránymutatás, amelyhez semmilyen joghatás vagy az érintettre nézve hasonlóan jelentős következmény nem kapcsolódik.**

2.5. Az Adatkezelő a Weboldalon **kitöltési kötelezettség nélküli, ingyenes kérdőívet („kvíz")** tesz elérhetővé, amely a kitöltő válaszai alapján tájékoztató jellegű becslést és programajánlást ad. A kvíz kitöltéséhez regisztráció nem szükséges. **A kérdőívre adott válaszok a kitöltés ideje alatt kizárólag a látogató saját böngészőjében tárolódnak; az Adatkezelő szervereire semmilyen adat nem kerül mindaddig, amíg a kitöltő az utolsó lépésben az e-mail címét meg nem adja és a hozzájárulást kifejezetten meg nem adja.** A kvíz eredménye tájékoztató jellegű, **nem minősül orvosi tanácsnak vagy diagnózisnak**, és nem helyettesíti egészségügyi szakember véleményét.

## 3. Az egyes adatkezelési célok

### 3.1. Áttekintő táblázat

| Cél | Jogalap (GDPR 6. cikk) | Kezelt adatok köre | Megőrzési idő |
|---|---|---|---|
| **a) Fiók és bejelentkezés** | (1) b) — szerződés teljesítése | E-mail-cím, név (ha a bejelentkezési szolgáltató átadja), Firebase felhasználó-azonosító (uid), bejelentkezési mód (Google / Apple / e-mail+jelszó; a jelszót kizárólag a Firebase Auth tárolja, kivonatolva), fiók-időbélyegek | A fiók fennállásáig; a törlési kérelmet követő 30. napon végleges törlés (6.3. pont) |
| **b) Személyre szabás (regisztrációs kérdőív)** | (1) b) — szerződés teljesítése | A bevezető kérdőívre adott válaszok (cél, fókusz, heti edzésszám, edzésnapok, akadályok stb.) | A fiók fennállásáig (a) szerint |
| **c) Előfizetés-kezelés és fizetés** | (1) b) — szerződés teljesítése; c) — jogi kötelezettség | Előfizetési csomag, státusz, időszakok, Stripe-ügyfél- és tranzakcióazonosítók, fizetési események; a checkout előtt rögzített hozzájárulási nyilatkozatok (automatikus megújulás és azonnali teljesítés elfogadása, időbélyeggel). **Bankkártyaadat az Adatkezelőhöz nem kerül** — azt kizárólag a Stripe kezeli. | Az előfizetéssel kapcsolatos polgári jogi igények elévüléséig (5 év); a hozzájárulási nyilatkozatok az elszámoltathatóság igazolására ugyanennyi ideig |
| **d) Számlázás** | (1) c) — jogi kötelezettség (Áfa tv., Számv. tv.) | Számlázási név, cím, e-mail-cím, a vásárlás adatai; NAV-adatszolgáltatással kiállított e-számla a Billingo rendszerében | **A Számv. tv. 169. §-a szerint 8 év** — a számlázási bizonylatok a fiók törlése után is megőrzésre kerülnek |
| **e) Edzésnaplózás, haladáskövetés** | (1) b) — szerződés teljesítése | Elvégzett edzések (videóazonosító, dátum), heti haladás, edzéssorozat („streak"), mérföldkövek; a videomegtekintési adatok forrása a Mux lejátszási statisztikája, ahol a néző-azonosító a Firebase uid | A fiók fennállásáig (a) szerint |
| **f) Haladási fotók** | (1) a) — hozzájárulás (a feltöltés önkéntes) | A felhasználó által a program 1., 5. és 8. hetében önkéntesen feltöltött fotók + metaadatok (időpont, tárolási útvonal) | A fiók fennállásáig, illetve a fotó felhasználó általi törléséig; a fiók törlésekor a fotófájlok is véglegesen törlődnek |
| **g) Tranzakciós és szolgáltatási e-mailek** (pl. fizetési visszaigazolás, megújulási emlékeztető, sikertelen fizetés, fióktörlés megerősítése) | (1) b) — szerződés teljesítése; f) — jogos érdek (a fogyasztó előzetes tájékoztatása a terhelésekről) | E-mail-cím, név, az üzenet tárgya szerinti előfizetési adat | A fiók fennállásáig |
| **h) Edzés-emlékeztető e-mailek** | (1) a) — hozzájárulás | E-mail-cím, a választott edzésnapok/beállítások | A hozzájárulás visszavonásáig (leiratkozás), legfeljebb a fiók fennállásáig |
| **i) „Finish Share" — edzés utáni megosztókép** | (1) b) — szerződés teljesítése (kizárólag a statisztikákra) | Lásd 3.3. pont — **a szelfi nem kerül feltöltésre** | A telefon–számítógép átadási munkamenet adatai (kizárólag edzésstatisztika) **15 perc** után lejárnak és törlődnek |
| **j) Panaszkezelés, érintetti kérelmek** | (1) c) — jogi kötelezettség; f) — jogos érdek (igényérvényesítés) | A panasz/kérelem tartalma, a válasz, azonosító adatok; az adatexport-kérések napi darabszámát rögzítő technikai napló | Fgytv. szerinti panasznyilvántartás: 5 év; érintetti kérelmek dokumentálása: 5 év |
| **k) Webanalitika (látogatottságmérés)** | (1) a) — hozzájárulás (süti-sáv) | A Google Analytics 4 által kezelt adatok: álnevesített ügyfél-azonosító (süti), IP-cím, eszköz- és böngészőadatok, megtekintett oldalak és események. **Kizárólag a hozzájáruló látogatókra terjed ki.** | A Google Analytics tulajdonban beállított adatmegőrzési idő szerint, illetve a hozzájárulás visszavonásáig |
| **l) Hirdetésmérés és -optimalizálás (Meta Pixel, TikTok Pixel)** | (1) a) — hozzájárulás (süti-sáv) | Álnevesített hirdetési azonosító (süti), IP-cím, eszköz- és böngészőadatok, a megtekintett oldal címe és tartalmi jellemzői, valamint a tölcsér eseményei (**a lead-kérdőív indítása, lépésenkénti előrehaladása — a válaszok tartalma nélkül —, a lead-adatok megadása,** regisztráció, fizetési lépés elérése). **Kizárólag a hozzájáruló látogatókra terjed ki. A kérdőívre adott válaszok, így különösen a testadatok és az élethelyzetre vonatkozó válasz, a hirdetési rendszerek felé semmilyen formában nem kerülnek továbbításra.** A Meta „automatikus haladó párosítás" (hashelt e-mail/telefonszám küldése) funkciója **kikapcsolva**. | A Meta, illetve a TikTok adatmegőrzési szabályai szerint, illetve a hozzájárulás visszavonásáig |
| **m) Konverzió visszajelzése a hirdetési rendszernek (Meta Conversions API)** | (1) a) — hozzájárulás (süti-sáv) | A sikeres fizetés **, illetve a lead-kérdőív kitöltésének** ténye, összege és időpontja, valamint a párosításhoz a felhasználó e-mail-címének **egyirányú kivonata (SHA-256 hash)** és a Meta saját sütiazonosítói. **A kérdőív esetében kizárólag az esemény ténye, az ajánlott program azonosítója és az e-mail-cím kivonata kerül továbbításra — a kérdőív válaszai és az azokból számított eredmény nem.** Az e-mail-cím maga **nem** kerül továbbításra. A továbbítás szerveroldalon történik, és **kizárólag akkor, ha a vásárló a sütikhez hozzájárult** — a hozzájárulás hiánya esetén elmarad. | A Meta adatmegőrzési szabályai szerint |
| **n) Lead-kérdőív („kvíz") kitöltése és a személyes eredmény elkészítése, elküldése** | (1) **a) — kifejezett hozzájárulás**; az egészségi állapottal összefüggő adatok tekintetében a **9. cikk (2) a) pontja szerinti kifejezett hozzájárulás** | Keresztnév, e-mail-cím; a kérdőívre adott válaszok: cél, biológiai nem, korsáv, **testmagasság, testsúly, cél-testsúly**, napközbeni mozgás, becsült napi lépésszám, edzési gyakoriság, **élethelyzet**, vállalható edzésidő, fő akadály; a válaszokból számított eredmény (becsült napi energiaigény, ajánlott program, napi lépéscél); a hozzájárulás időbélyege, a tájékoztató elfogadott változatának azonosítója, a kitöltés technikai adatai (IP-cím, böngészőazonosító a visszaélés-védelemhez), valamint a kampányazonosítók (UTM-paraméterek) | **A hozzájárulás visszavonásáig, ennek hiányában a kitöltéstől számított 24 hónapig.** Az egészségi állapottal összefüggő adatok (testadatok, élethelyzet) és az azokból számított kalóriaértékek **12 hónap** után automatikusan törlésre kerülnek, akkor is, ha a lead egyébként aktív marad. Regisztráció esetén az adatok a fiókhoz kapcsolódnak, és a továbbiakban az a) sor szerint kezelendők |
| **o) Marketing- (hírlevél-) e-mailek** | (1) a) — hozzájárulás; a gazdasági reklámtevékenységről szóló 2008. évi XLVIII. tv. (Grtv.) 6. §-a szerinti **kifejezett, előzetes hozzájárulás** | E-mail-cím, keresztnév; a szegmentáláshoz a kérdőív **nem egészségügyi** válaszai (cél, fő akadály, ajánlott program); a küldés és a leiratkozás technikai adatai | A hozzájárulás visszavonásáig (leiratkozás), ennek hiányában legfeljebb az n) sor szerinti megőrzési időig |

### 3.2. Külön figyelmet érdemlő adatkör: haladási fotók

A haladási fotók testképet érintő, érzékeny jellegű felvételek lehetnek, ezért az Adatkezelő azokat kiemelt védelemmel kezeli:

- a feltöltés **teljesen önkéntes**, a szolgáltatás fotók nélkül is teljes értékűen használható;
- a fotók a Firebase Storage-ban, a felhasználó saját, privát tárhelyén tárolódnak; a hozzáférési szabályok szerint **kizárólag a tulajdonos fiók férhet hozzájuk** — a fotók **soha nem nyilvánosak**, más felhasználók számára nem láthatók, és az Adatkezelő azokat marketingcélra nem használja;
- kizárólag képfájl tölthető fel (max. 10 MB);
- a fotókat a felhasználó bármikor törölheti, a fiók törlésekor pedig véglegesen törlődnek.

Az Adatkezelő a fotókat nem elemzi és azokból a GDPR 9. cikke szerinti különleges adatot (pl. egészségügyi adatot) nem képez.

### 3.3. „Finish Share" — kliensoldali képfeldolgozás

Az edzés befejezése után a felhasználó opcionálisan megosztóképet (szelfi + edzésstatisztika-réteg) készíthet. Ennek működése adatvédelmi szempontból lényeges:

- **a szelfi kizárólag a felhasználó saját eszközén, a böngészőben kerül feldolgozásra; a Szolgáltató szervereire soha nem kerül feltöltésre és ott nem tárolódik**;
- a számítógép→telefon átadáshoz (QR-kód) a szerver egy egyszer használatos, véletlenszerű tokent és **kizárólag szűrt edzésstatisztikát** (pl. perc, sorozat, ismétlés, hét sorszáma, edzés címe) tárol — személyazonosító adatot, szabad szöveget vagy képet nem;
- ez a munkamenet-bejegyzés **15 perc elteltével lejár** és törlődik;
- az elkészült kép megosztása (pl. közösségi médiában) a felhasználó saját döntése és felelőssége.

### 3.4. Külön figyelmet érdemlő adatkör: a lead-kérdőív egészséggel összefüggő adatai

A kérdőív olyan adatokat is bekér (testmagasság, testsúly, cél-testsúly, élethelyzet, mozgási és edzési szokások), amelyek a GDPR 9. cikke szerinti, egészségi állapottal összefüggő különleges adatnak minősülhetnek. Az Adatkezelő ezeket kiemelt védelemmel kezeli:

- a kitöltés **teljesen önkéntes**, és a Weboldal, valamint a szolgáltatás a kérdőív kitöltése nélkül is teljes értékűen használható;
- az adatkezelés jogalapja **kizárólag az érintett kifejezett hozzájárulása** (GDPR 9. cikk (2) a)), amelyet a kitöltő **külön, előre be nem jelölt jelölőnégyzetben** ad meg; ez a hozzájárulás **nem vonható össze** a marketingcélú hozzájárulással, és annak megadása nem feltétele a marketing-hozzájárulásnak (és fordítva);
- **az adatok az Adatkezelő szervereire kizárólag a hozzájárulás megadásával egyidejűleg kerülnek** — a kérdőív kitöltése közben minden válasz a látogató saját böngészőjében marad;
- az adatokhoz kizárólag az Adatkezelő erre feljogosított munkatársa fér hozzá; az adatbázis hozzáférési szabályai a lead-adatokat a Weboldal felől **olvashatatlanná** teszik;
- az egészséggel összefüggő adatok és az azokból számított kalóriaértékek **12 hónap** után automatikusan törlésre kerülnek (3.1. n) pont);
- **az Adatkezelő ezeket az adatokat harmadik félnek nem adja át, és hirdetési célra — így a hirdetési rendszerek (Google, Meta) felé — semmilyen formában nem továbbítja**;
- az adatokból képzett eredmény **tájékoztató jellegű becslés**, nem orvosi tanács; krónikus betegség, szülés utáni időszak vagy egyéb egészségi kockázat esetén az Adatkezelő orvosi konzultációt javasol, amire a kérdőív eredményoldala figyelmeztet.

A hozzájárulás bármikor, indokolás nélkül visszavonható (6.8. pont).

## 4. Az adatok forrása

Az adatok forrása minden esetben az érintett (regisztráció, kérdőív, használat), illetve a választott bejelentkezési szolgáltató (Google / Apple) által a bejelentkezéskor átadott alapadatok (név, e-mail-cím), valamint a szolgáltatás használata során technikailag keletkező adatok (pl. videomegtekintési események). **A lead-kérdőívet kitöltő, fiókkal nem rendelkező érintettek esetében az adatok forrása kizárólag maga az érintett (a kérdőívre adott válaszok és a megadott elérhetőség), valamint a hirdetési kampányazonosítók, amelyek arról tájékoztatnak, hogy a látogató melyik hirdetésről érkezett.**

## 5. Adatfeldolgozók, címzettek, adattovábbítás harmadik országba

Az Adatkezelő az alábbi adatfeldolgozókat, illetve önálló adatkezelőként eljáró szolgáltatókat veszi igénybe:

| Szolgáltató | Szerep | Kezelt adatok | Adattovábbítás / garanciák |
|---|---|---|---|
| **Google Ireland Ltd. / Google LLC — Firebase** (Firestore, Authentication, Cloud Storage) | adatbázis, bejelentkezés, fájltárolás | fiókadatok, haladási adatok, fotók, **a lead-kérdőív adatai** | Tárolás: **EU (Frankfurt, europe-west3)**. A Google LLC az EU–USA adatvédelmi keret (EU–U.S. Data Privacy Framework, DPF) tanúsított résztvevője; kiegészítésként általános szerződési feltételek (SCC) |
| **Mux, Inc.** (USA) | videó-streaming és lejátszási statisztika | lejátszási események; néző-azonosítóként a Firebase uid (álnevesített azonosító), megtekintett videó, lejátszási idő, technikai adatok (böngésző, IP-cím a szolgáltatásnyújtáshoz) | Harmadik országbeli (USA) szolgáltató; DPF-tanúsítás, illetve SCC |
| **Stripe Payments Europe, Ltd. / Stripe, Inc.** | fizetések lebonyolítása | fizetési és kártyaadatok (kizárólag a Stripe-nál), tranzakcióadatok, e-mail | EU-s szerződő fél; USA-ba történő továbbításra DPF/SCC. A kártyaadatok tekintetében a Stripe önálló adatkezelőként is eljár |
| **Billingo Technologies Zrt.** (Magyarország) | NAV-kompatibilis e-számla kiállítása és megküldése | számlázási név, cím, e-mail, vásárlási adatok | EU-n (Magyarországon) belül; a számlaadatok jogszabály alapján a NAV részére továbbításra kerülnek |
| **Twilio Inc. — SendGrid** (USA) | tranzakciós, emlékeztető **és — kizárólag hozzájárulás alapján — marketingcélú** e-mailek kiküldése | e-mail-cím, név, az üzenet tartalma | Harmadik országbeli (USA) szolgáltató; DPF-tanúsítás, illetve SCC |
| **Vercel Inc.** (USA) | webalkalmazás-tárhely és -kiszolgálás | a kiszolgáláshoz szükséges technikai adatok (IP-cím, kérésnaplók) | Harmadik országbeli (USA) szolgáltató; DPF-tanúsítás, illetve SCC |
| **Google LLC — reCAPTCHA (Firebase App Check)** | visszaélés- és botvédelem (a kérések valódi alkalmazásból való származásának ellenőrzése) | eszköz- és böngészőadatok, IP-cím, felhasználói interakciós jelek; a feldolgozás a Google reCAPTCHA feltételei szerint történik | Harmadik országbeli (USA) szolgáltató; DPF-tanúsítás, illetve SCC. A reCAPTCHA használatára a Google [Adatvédelmi irányelvei](https://policies.google.com/privacy) és [Szolgáltatási feltételei](https://policies.google.com/terms) irányadók |
| **Google Ireland Ltd. / Google LLC — Google Analytics 4, Google Tag Manager** | webanalitika (látogatottságmérés), mérőkód-kezelés | álnevesített ügyfél-azonosító, IP-cím, eszköz- és böngészőadatok, oldalmegtekintési és eseményadatok | **Kizárólag a látogató hozzájárulása esetén.** A Google LLC az EU–USA adatvédelmi keret (DPF) tanúsított résztvevője; kiegészítésként SCC |
| **Meta Platforms Ireland Ltd. / Meta Platforms, Inc. — Meta Pixel és Conversions API** | hirdetésmérés és hirdetésoptimalizálás | álnevesített hirdetési azonosító, IP-cím, eszköz- és böngészőadatok, az oldal címe és tartalmi jellemzői, tölcséresemények; a vásárlás visszajelzésénél az e-mail-cím **kivonata (hash)**, a vásárlás összege és időpontja | **Kizárólag a látogató hozzájárulása esetén.** EU-s szerződő fél; USA-ba történő továbbításra a Meta Platforms, Inc. DPF-tanúsítása, illetve SCC. A Meta a hirdetésmérés tekintetében **közös adatkezelőként** jár el (Meta Business Tools feltételek) |
| **TikTok Technology Limited** (Írország, 10 Earlsfort Terrace, Dublin, D02 T380) és **TikTok Information Technologies UK Limited** — TikTok Pixel | hirdetésmérés és hirdetésoptimalizálás | álnevesített hirdetési azonosító (süti), IP-cím, eszköz- és böngészőadatok, az oldal címe, tölcséresemények | **Kizárólag a látogató hozzájárulása esetén.** Az EGT-s felhasználók tekintetében a TikTok Technology Limited (Írország) és a TikTok Information Technologies UK Limited **közös adatkezelőként** járnak el. A TikTok az EGT-n kívülre irányuló továbbításokhoz az Európai Bizottság **általános szerződési feltételeit (SCC)** és kiegészítő intézkedéseket alkalmaz, az EGT-s felhasználói adatok tárolására pedig **európai adatközpontokat** épített ki („Project Clover", Írország és Norvégia). **Az érintett tájékoztatása:** az ír adatvédelmi hatóság (DPC) 2025. május 2-i határozatában megállapította, hogy a TikTok Kínába irányuló adattovábbításai nem feleltek meg a GDPR 46. cikk (1) bekezdésének, és a szolgáltatót az adatkezelés hat hónapon belüli jogszerűvé tételére, ennek elmaradása esetén a Kínába irányuló továbbítások felfüggesztésére kötelezte. Erre tekintettel **nem zárható ki, hogy az adatokhoz harmadik országban az uniós joggal azonos szintű védelem nem biztosított.** A látogató a hirdetésmérést a süti-sávon **bármikor elutasíthatja vagy visszavonhatja**; elutasítás esetén a TikTok mérőkódja **le sem töltődik**, és semmilyen adat nem kerül továbbításra |

Az Adatkezelő személyes adatot a fentieken túl kizárólag jogszabályi kötelezettség alapján (pl. NAV, hatóság, bíróság megkeresésére) továbbít. Az Adatkezelő személyes adatot nem értékesít; hirdetési célú adattovábbítás kizárólag a fenti táblázat szerinti, **hozzájáruláshoz kötött** hirdetésmérés keretében történik.

## 6. Az érintettek jogai

Az érintettet a GDPR 15–21. cikke alapján az alábbi jogok illetik meg; a kérelmeket az Adatkezelő indokolatlan késedelem nélkül, legkésőbb **egy hónapon belül** teljesíti (ez a határidő indokolt esetben két hónappal meghosszabbítható, erről az érintett tájékoztatást kap).

6.1. **Hozzáférés és adathordozhatóság.** Az érintett tájékoztatást kérhet kezelt adatairól. Az alkalmazás **„Adataim letöltése"** funkciója a fiók-, kérdőív-, haladási, beállítási és fotó-metaadatokat, valamint az előfizetés összefoglalóját géppel olvasható (JSON) formátumban azonnal letölthetővé teszi — ez egyben a GDPR 20. cikke szerinti hordozhatósági jog gyakorlásának elsődleges módja.

6.2. **Helyesbítés.** Az érintett kérheti pontatlan adatai helyesbítését; a fiókadatok és beállítások jelentős része az alkalmazásban közvetlenül is módosítható.

6.3. **Törlés („elfeledtetéshez való jog").** A fiók az alkalmazásból bármikor törölhető (friss bejelentkezéshez és kifejezett megerősítéshez kötött művelet). A folyamat:

1. a törlési kérelemmel a megújuló előfizetés a folyó időszak végére lemondásra kerül, és a fiók azonnal zárolásra kerül (bejelentkezés nem lehetséges);
2. az érintett e-mailben megerősítést kap; a törlés a kérelemtől számított **30 napon belül az ügyfélszolgálaton keresztül visszavonható**;
3. a 30. nap elteltével a felhasználói adatok — fiók, kérdőív, haladási adatok, fotók, beállítások — **véglegesen és helyreállíthatatlanul törlődnek** a Firestore-ból, a Storage-ból és a Firebase Authenticationből.

**Kivétel:** a kiállított számlák és a kapcsolódó számviteli bizonylatok a Számv. tv. alapján **8 évig** megőrzésre kerülnek; a fizetési tranzakciók adatait a Stripe a saját jogszabályi kötelezettségei szerint őrzi.

6.4. **Korlátozás.** Az érintett a GDPR 18. cikke szerinti esetekben kérheti az adatkezelés korlátozását.

6.5. **Tiltakozás.** A jogos érdeken alapuló adatkezelések ellen az érintett tiltakozhat; ilyenkor az Adatkezelő az adatot csak akkor kezeli tovább, ha azt kényszerítő erejű jogos okok indokolják.

6.6. **Hozzájárulás visszavonása.** A hozzájáruláson alapuló adatkezelések (haladási fotók, edzés-emlékeztető e-mailek) esetén a hozzájárulás bármikor visszavonható — az emlékeztetők az e-mailben található leiratkozási lehetőséggel, illetve a beállításokban kapcsolhatók ki; a fotók a felületen törölhetők. A visszavonás a korábbi adatkezelés jogszerűségét nem érinti.

6.7. A kérelmek benyújthatók az alkalmazáson belül, illetve az info@amstudios.hu címen. Az Adatkezelő a kérelmezőt szükség esetén azonosítja (a fiókhoz tartozó e-mail-címről érkező, illetve bejelentkezett kérelem elfogadott azonosítás).

6.8. **Fiókkal nem rendelkező érintettek (a lead-kérdőív kitöltői).** A kérdőívet kitöltő, de fiókot nem regisztráló érintettek ugyanazokkal a jogokkal rendelkeznek, mint a felhasználók; mivel esetükben az alkalmazás önkiszolgáló felületei (6.1–6.3.) nem elérhetők, a jogok gyakorlásának módja a következő:

- **Leiratkozás / a marketing-hozzájárulás visszavonása:** minden marketingcélú e-mail alján egyetlen kattintással elérhető leiratkozási hivatkozás található, amely azonnal és automatikusan hatályosul. A leiratkozás nem igényel bejelentkezést vagy azonosítást.
- **Törlés, hozzáférés, helyesbítés, adathordozhatóság:** az **info@amstudios.hu** címre küldött kérelemmel, **a kérdőívben megadott e-mail-címről**. Az Adatkezelő a kérelmet indokolatlan késedelem nélkül, **legkésőbb egy hónapon belül** teljesíti. A törlés ebben az esetben **a személyes adatok végleges és helyreállíthatatlan törlését jelenti**; a 6.3. pont szerinti 30 napos visszavonhatósági időszak fiók hiányában nem alkalmazandó.
- **Az egészséggel összefüggő adatokra vonatkozó hozzájárulás visszavonása** ugyanezen a címen kérhető; a visszavonás esetén az Adatkezelő ezeket az adatokat haladéktalanul törli, és a korábban elkészített eredményt nem használja fel újra.

Az azonosítás módja: a kérelem elfogadott azonosításnak minősül, ha az a kérdőívben megadott e-mail-címről érkezik.

## 7. Sütik (cookie-k) és helyi tárolás

7.1. A LEXFIT kétféle tárolást alkalmaz: a szolgáltatás működéséhez **feltétlenül szükséges** technikai tárolást (7.2. pont), amelyhez az ePrivacy szabályok szerint nem szükséges hozzájárulás, valamint **kizárólag hozzájárulás alapján** működő analitikai mérést (7.3. pont).

A Weboldal első látogatásakor süti-sáv jelenik meg. **A látogató döntéséig, illetve elutasítás esetén semmilyen analitikai mérőkód nem töltődik be és analitikai süti nem kerül elhelyezésre** — a mérőkódok betöltése technikailag is a hozzájáruláshoz van kötve. A döntést a böngésző helyi tárolója őrzi (`lx-consent` kulcs), így a sáv a döntés után nem jelenik meg újra. A hozzájárulás visszavonásáról a 7.4. pont rendelkezik.

7.2. A feltétlenül szükséges tárolás elemei:

| Elem | Típus | Cél | Élettartam |
|---|---|---|---|
| Firebase Auth munkamenet (IndexedDB / helyi tárolás) | helyi tárolás a böngészőben | a bejelentkezett állapot fenntartása | a kijelentkezésig, ill. a munkamenet lejártáig |
| Alkalmazásbeállítások (pl. felület-preferenciák, folyamatállapotok) | localStorage | a felhasználói élmény működéséhez szükséges állapot | a böngészőben történő törlésig |
| Süti-hozzájárulási döntés (`lx-consent`) | localStorage | a látogató süti-döntésének megőrzése (elfogadás vagy elutasítás), hogy a sáv ne jelenjen meg újra | a böngészőben történő törlésig |
| A Stripe fizetési oldal saját sütijei | süti (a Stripe domainjén) | biztonságos fizetés, csalásmegelőzés | a Stripe tájékoztatója szerint |
| A Mux videolejátszó technikai tárolása | helyi tárolás | a lejátszás működése és minősége | munkamenethez kötött |
| A lead-kérdőív kitöltés közbeni állapota | localStorage | a megkezdett kérdőív válaszainak megőrzése, hogy az oldal frissítésekor ne vesszenek el; **az Adatkezelő szerveréhez nem továbbítódik** | a kitöltés befejezéséig, illetve a böngészőben történő törlésig |

7.3. Hozzájárulás alapján működő analitikai és hirdetésmérési eszközök (GDPR 6. cikk (1) a)):

| Eszköz | Szolgáltató | Cél | Elhelyezett tárolás |
|---|---|---|---|
| **Google Analytics 4** (gtag.js) | Google Ireland Ltd. / Google LLC | látogatottság- és használatmérés a szolgáltatás fejlesztéséhez | `_ga` előtagú analitikai sütik |
| **Google Tag Manager** | Google Ireland Ltd. / Google LLC | a mérőkódok kezelése (önmagában nem gyűjt adatot, a benne elhelyezett mérőkódokat tölti be) | a betöltött mérőkód szerint |
| **Meta Pixel** | Meta Platforms Ireland Ltd. | a hirdetések eredményességének mérése és optimalizálása | `_fbp` (és hirdetésre érkezéskor `_fbc`) hirdetési sütik |
| **TikTok Pixel** | TikTok Technology Limited (Írország) | a TikTok-hirdetések eredményességének mérése és optimalizálása | `_ttp` (saját domainen elhelyezett hirdetési süti), `_tt_enable_cookie` (munkamenet), valamint hirdetésre érkezéskor a kattintás-azonosítót tároló `ttclid` |

A hozzájárulás alapján kezelt adatok körét és megőrzési idejét a 3.1. táblázat **k)** és **l)** sora, a Google, a Meta és a TikTok mint címzett szerepét az 5. pont tartalmazza.

A Meta Pixel a beállítása szerint az oldal tartalmi jellemzőit (pl. oldalcím, a
látogatott oldalon szereplő médiaelemek címe és hivatkozása, ár) is továbbítja a
Metának. A Weboldalon szereplő tagfotók közzététele az érintett tagok kifejezett
engedélyével történik; a felhasználók saját haladási fotói **soha nem nyilvánosak**,
így a hirdetésmérésbe sem kerülnek be (3.2. pont).

7.4. **A hozzájárulás visszavonása.** A hozzájárulás bármikor, korlátozás nélkül visszavonható: a Weboldal láblécében található **„Süti-beállítások"** gombra kattintva a süti-sáv ismét megjelenik, és a látogató új döntést hozhat. A visszavonás így ugyanolyan egyszerű, mint a hozzájárulás megadása (GDPR 7. cikk (3)). Elutasítás esetén a mérőkódok a továbbiakban nem töltődnek be. A visszavonás a korábbi adatkezelés jogszerűségét nem érinti.

7.5. Ha az Adatkezelő a jövőben további analitikai vagy marketingcélú mérőkódot vezet be, azt kizárólag a fenti hozzájárulási mechanizmus mellett teszi, és e tájékoztatót — a 10. pont szerinti értesítés mellett — ennek megfelelően módosítja.

## 8. Adatbiztonság

Az Adatkezelő a GDPR 32. cikke szerinti technikai és szervezési intézkedéseket alkalmaz, különösen: titkosított adatátvitel (HTTPS/TLS); szerveroldali hozzáférés-ellenőrzés minden adatműveletnél; Firestore- és Storage-hozzáférési szabályok, amelyek alapján minden felhasználó kizárólag a saját adataihoz fér hozzá; a videók aláírt (signed) lejátszási tokenekkel védettek; a fióktörlés friss újra-bejelentkezéshez kötött; a kártyaadatokat kizárólag a PCI DSS-tanúsított Stripe kezeli; az adminisztrációs felület kizárólag engedélyezett fiókkal érhető el.

## 9. Jogorvoslat

9.1. Az érintett a személyes adatai kezelésével kapcsolatos panaszával a **Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH)** fordulhat:

- Cím: 1055 Budapest, Falk Miksa utca 9–11.
- Postacím: 1363 Budapest, Pf. 9.
- Telefon: +36 (1) 391-1400
- E-mail: ugyfelszolgalat@naih.hu
- Web: https://www.naih.hu

9.2. Az érintett jogai megsértése esetén bírósághoz is fordulhat (a per — az érintett választása szerint — az érintett lakóhelye vagy tartózkodási helye szerinti törvényszék előtt is megindítható).

9.3. Javasoljuk, hogy az érintett a hatósági vagy bírósági eljárás megindítása előtt panaszával először az Adatkezelőhöz forduljon.

## 10. A tájékoztató módosítása

Az Adatkezelő a jelen tájékoztatót jogosult módosítani (pl. új funkció vagy szolgáltató bevezetésekor). A lényeges módosításokról a felhasználók e-mailben vagy az alkalmazásban kapnak értesítést; a mindenkor hatályos változat a Weboldalon érhető el.

Az Adatkezelő a tájékoztató mindenkori változatát **verzióazonosítóval** látja el (a hatálybalépés dátuma, `ÉÉÉÉ-HH-NN` formátumban, lásd a dokumentum fejlécében). A hozzájárulás megadásakor a rendszer rögzíti, hogy az érintett a tájékoztató **melyik változatát** fogadta el — ez az elszámoltathatóság (GDPR 5. cikk (2)) igazolását szolgálja.
