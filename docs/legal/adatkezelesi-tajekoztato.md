# Adatkezelési tájékoztató

**LEXFIT — online otthoni edzésprogram-szolgáltatás**

Hatályos: 2026. augusztus 11. napjától.

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

2.3. Az Adatkezelő a Weboldalon webanalitikai és hirdetésmérési célú mérést végez (Google Analytics 4, Google Tag Manager, Meta Pixel), **kizárólag a látogató előzetes, önkéntes hozzájárulása alapján**: hozzájárulás hiányában egyetlen mérőkód sem töltődik be és analitikai vagy hirdetési süti nem kerül elhelyezésre (részletesen a 7. pont). Az Adatkezelő a személyes adatokat nem értékesíti.

2.4. Az Adatkezelő nem hoz a GDPR 22. cikke szerinti, kizárólag automatizált adatkezelésen alapuló, joghatással járó döntést. A szolgáltatáson belüli személyre szabás (pl. a regisztrációs kérdőív válaszai alapján ajánlott edzésbeosztás, aktivitásalapú kedvezményajánlatok) a szerződés teljesítésének része, és nem jár az érintettre nézve joghatással vagy hasonlóan jelentős hatással.

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
| **l) Hirdetésmérés és -optimalizálás (Meta Pixel)** | (1) a) — hozzájárulás (süti-sáv) | Álnevesített hirdetési azonosító (süti), IP-cím, eszköz- és böngészőadatok, a megtekintett oldal címe és tartalmi jellemzői, valamint a tölcsér eseményei (kérdőív indítása, regisztráció, fizetési lépés elérése). **Kizárólag a hozzájáruló látogatókra terjed ki.** A Meta „automatikus haladó párosítás" (hashelt e-mail/telefonszám küldése) funkciója **kikapcsolva**. | A Meta adatmegőrzési szabályai szerint, illetve a hozzájárulás visszavonásáig |
| **m) Vásárlás visszajelzése a hirdetési rendszernek (Meta Conversions API)** | (1) a) — hozzájárulás (süti-sáv) | A sikeres fizetés ténye, összege és időpontja, valamint a párosításhoz a vásárló e-mail-címének **egyirányú kivonata (SHA-256 hash)** és a Meta saját sütiazonosítói. Az e-mail-cím maga **nem** kerül továbbításra. A továbbítás szerveroldalon történik, és **kizárólag akkor, ha a vásárló a sütikhez hozzájárult** — a hozzájárulás hiánya esetén elmarad. | A Meta adatmegőrzési szabályai szerint |

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

## 4. Az adatok forrása

Az adatok forrása minden esetben az érintett (regisztráció, kérdőív, használat), illetve a választott bejelentkezési szolgáltató (Google / Apple) által a bejelentkezéskor átadott alapadatok (név, e-mail-cím), valamint a szolgáltatás használata során technikailag keletkező adatok (pl. videomegtekintési események).

## 5. Adatfeldolgozók, címzettek, adattovábbítás harmadik országba

Az Adatkezelő az alábbi adatfeldolgozókat, illetve önálló adatkezelőként eljáró szolgáltatókat veszi igénybe:

| Szolgáltató | Szerep | Kezelt adatok | Adattovábbítás / garanciák |
|---|---|---|---|
| **Google Ireland Ltd. / Google LLC — Firebase** (Firestore, Authentication, Cloud Storage) | adatbázis, bejelentkezés, fájltárolás | fiókadatok, haladási adatok, fotók | Tárolás: **EU (Frankfurt, europe-west3)**. A Google LLC az EU–USA adatvédelmi keret (EU–U.S. Data Privacy Framework, DPF) tanúsított résztvevője; kiegészítésként általános szerződési feltételek (SCC) |
| **Mux, Inc.** (USA) | videó-streaming és lejátszási statisztika | lejátszási események; néző-azonosítóként a Firebase uid (álnevesített azonosító), megtekintett videó, lejátszási idő, technikai adatok (böngésző, IP-cím a szolgáltatásnyújtáshoz) | Harmadik országbeli (USA) szolgáltató; DPF-tanúsítás, illetve SCC |
| **Stripe Payments Europe, Ltd. / Stripe, Inc.** | fizetések lebonyolítása | fizetési és kártyaadatok (kizárólag a Stripe-nál), tranzakcióadatok, e-mail | EU-s szerződő fél; USA-ba történő továbbításra DPF/SCC. A kártyaadatok tekintetében a Stripe önálló adatkezelőként is eljár |
| **Billingo Technologies Zrt.** (Magyarország) | NAV-kompatibilis e-számla kiállítása és megküldése | számlázási név, cím, e-mail, vásárlási adatok | EU-n (Magyarországon) belül; a számlaadatok jogszabály alapján a NAV részére továbbításra kerülnek |
| **Twilio Inc. — SendGrid** (USA) | tranzakciós és emlékeztető e-mailek kiküldése | e-mail-cím, név, az üzenet tartalma | Harmadik országbeli (USA) szolgáltató; DPF-tanúsítás, illetve SCC |
| **Vercel Inc.** (USA) | webalkalmazás-tárhely és -kiszolgálás | a kiszolgáláshoz szükséges technikai adatok (IP-cím, kérésnaplók) | Harmadik országbeli (USA) szolgáltató; DPF-tanúsítás, illetve SCC |
| **Google LLC — reCAPTCHA (Firebase App Check)** | visszaélés- és botvédelem (a kérések valódi alkalmazásból való származásának ellenőrzése) | eszköz- és böngészőadatok, IP-cím, felhasználói interakciós jelek; a feldolgozás a Google reCAPTCHA feltételei szerint történik | Harmadik országbeli (USA) szolgáltató; DPF-tanúsítás, illetve SCC. A reCAPTCHA használatára a Google [Adatvédelmi irányelvei](https://policies.google.com/privacy) és [Szolgáltatási feltételei](https://policies.google.com/terms) irányadók |
| **Google Ireland Ltd. / Google LLC — Google Analytics 4, Google Tag Manager** | webanalitika (látogatottságmérés), mérőkód-kezelés | álnevesített ügyfél-azonosító, IP-cím, eszköz- és böngészőadatok, oldalmegtekintési és eseményadatok | **Kizárólag a látogató hozzájárulása esetén.** A Google LLC az EU–USA adatvédelmi keret (DPF) tanúsított résztvevője; kiegészítésként SCC |
| **Meta Platforms Ireland Ltd. / Meta Platforms, Inc. — Meta Pixel és Conversions API** | hirdetésmérés és hirdetésoptimalizálás | álnevesített hirdetési azonosító, IP-cím, eszköz- és böngészőadatok, az oldal címe és tartalmi jellemzői, tölcséresemények; a vásárlás visszajelzésénél az e-mail-cím **kivonata (hash)**, a vásárlás összege és időpontja | **Kizárólag a látogató hozzájárulása esetén.** EU-s szerződő fél; USA-ba történő továbbításra a Meta Platforms, Inc. DPF-tanúsítása, illetve SCC. A Meta a hirdetésmérés tekintetében **közös adatkezelőként** jár el (Meta Business Tools feltételek) |

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

7.3. Hozzájárulás alapján működő analitikai és hirdetésmérési eszközök (GDPR 6. cikk (1) a)):

| Eszköz | Szolgáltató | Cél | Elhelyezett tárolás |
|---|---|---|---|
| **Google Analytics 4** (gtag.js) | Google Ireland Ltd. / Google LLC | látogatottság- és használatmérés a szolgáltatás fejlesztéséhez | `_ga` előtagú analitikai sütik |
| **Google Tag Manager** | Google Ireland Ltd. / Google LLC | a mérőkódok kezelése (önmagában nem gyűjt adatot, a benne elhelyezett mérőkódokat tölti be) | a betöltött mérőkód szerint |
| **Meta Pixel** | Meta Platforms Ireland Ltd. | a hirdetések eredményességének mérése és optimalizálása | `_fbp` (és hirdetésre érkezéskor `_fbc`) hirdetési sütik |

A hozzájárulás alapján kezelt adatok körét és megőrzési idejét a 3.1. táblázat **k)** és **l)** sora, a Google és a Meta mint címzett szerepét az 5. pont tartalmazza.

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
