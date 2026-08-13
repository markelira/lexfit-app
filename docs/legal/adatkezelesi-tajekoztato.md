# Adatkezelési tájékoztató

**LEXFIT — online otthoni edzésprogram-szolgáltatás**

Hatályos: 2026. [hónap] [nap] napjától.

A jelen tájékoztató az Európai Parlament és a Tanács (EU) 2016/679 rendelete (általános adatvédelmi rendelet, **GDPR**) 13–14. cikke, valamint az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény (**Infotv.**) alapján készült.

---

## **[KITÖLTENDŐ]** — a tulajdonos által megadandó, még hiányzó adatok

| # | Mező | Helye a dokumentumban |
|---|------|----------------------|
| 1 | Hatálybalépés dátuma: 2026. [hónap] [nap] — az éles indulás napján töltendő ki | fejléc |
| 2 | Ügyvédi ellenőrzés (a dokumentum végén lévő megjegyzések szerint) | teljes dokumentum |
| 3 | A hozzájárulás visszavonását szolgáló felület (süti-beállítások újranyitása) — lásd a záró megjegyzések 10. pontját | 7.4. pont |

*Kitöltve 2026-08-08: adatkezelő képviselője (Kecskeméti Ádám), weboldal (https://lexfit.hu), adatvédelmi tisztviselő: nincs (a GDPR 37. cikk szerinti kijelölési kötelezettség nem áll fenn — ügyvédi ellenőrzés alatt).*

---

## 1. Az Adatkezelő

- **Név:** AM Studios Group Korlátolt Felelősségű Társaság (AM Studios Group Kft.) (a továbbiakban: **Adatkezelő**)
- **Székhely:** 3532 Miskolc, Miklós utca 17. 2. em. 26. ajtó
- **Cégjegyzékszám:** 05 09 039717 (Miskolci Törvényszék Cégbírósága) · **Adószám:** 33004312-1-05
- **Képviselő:** Kecskeméti Ádám
- **E-mail (adatvédelmi megkeresések):** info@amstudios.hu
- **Weboldal:** https://lexfit.hu
- **Adatvédelmi tisztviselő:** nincs (a GDPR 37. cikk szerinti kijelölési kötelezettség nem áll fenn — ügyvédi ellenőrzés alatt)

## 2. Alapelvek, az adatkezelés környezete

2.1. A LEXFIT magyar nyelvű, előfizetéses fitnesz-webalkalmazás 18 év feletti fogyasztók részére. Az Adatkezelő a személyes adatokat a célhoz kötöttség, az adattakarékosság és a beépített adatvédelem elve szerint kezeli.

2.2. A felhasználói adatok elsődleges tárolási helye a Google Firebase platform (Firestore adatbázis, Authentication, Cloud Storage), amelynek régiója **europe-west3 (Frankfurt, Németország)** — az adatok tehát alapértelmezetten az Európai Unióban tárolódnak.

2.3. Az Adatkezelő a Weboldalon webanalitikai célú mérést végez (Google Analytics 4, Google Tag Manager), **kizárólag a látogató előzetes, önkéntes hozzájárulása alapján**: hozzájárulás hiányában egyetlen mérőkód sem töltődik be és analitikai süti nem kerül elhelyezésre (részletesen a 7. pont). Az Adatkezelő a személyes adatokat nem értékesíti.

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

Az Adatkezelő személyes adatot a fentieken túl kizárólag jogszabályi kötelezettség alapján (pl. NAV, hatóság, bíróság megkeresésére) továbbít. Az Adatkezelő személyes adatot hirdetési célra nem ad át és nem értékesít.

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

7.3. Hozzájárulás alapján működő analitikai eszközök (GDPR 6. cikk (1) a)):

| Eszköz | Szolgáltató | Cél | Elhelyezett tárolás |
|---|---|---|---|
| **Google Analytics 4** (gtag.js) | Google Ireland Ltd. / Google LLC | látogatottság- és használatmérés a szolgáltatás fejlesztéséhez | `_ga` előtagú analitikai sütik |
| **Google Tag Manager** | Google Ireland Ltd. / Google LLC | a mérőkódok kezelése (önmagában nem gyűjt adatot, a benne elhelyezett mérőkódokat tölti be) | a betöltött mérőkód szerint |

A hozzájárulás alapján kezelt adatok körét és megőrzési idejét a 3.1. táblázat **k)** sora, a Google mint címzett szerepét az 5. pont tartalmazza.

7.4. **A hozzájárulás visszavonása.** A hozzájárulás bármikor, korlátozás nélkül visszavonható a böngésző helyi tárolójának (localStorage) törlésével, amely a `lx-consent` bejegyzést is eltávolítja; ezt követően a süti-sáv ismét megjelenik, és a látogató új döntést hozhat. A visszavonás a korábbi adatkezelés jogszerűségét nem érinti.

7.5. Ha az Adatkezelő a jövőben további analitikai vagy marketingcélú mérőkódot (pl. közösségi média hirdetési pixelt) vezet be, azt kizárólag a fenti hozzájárulási mechanizmus mellett teszi, és e tájékoztatót — a 10. pont szerinti értesítés mellett — ennek megfelelően módosítja.

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

<!--
LAWYER REVIEW NOTES (nem publikálandó — a magyar jogász figyelmébe):

1. Haladási fotók jogalapja (3.1 f / 3.2): a tájékoztató hozzájárulásra (6. cikk (1) a)) épít. Ellenőrizendő, hogy a fotók — mivel testalkat-változás követésére szolgálnak — minősülhetnek-e egészségügyi (9. cikk) adatnak; ha igen, 9. cikk (2) a) szerinti KIFEJEZETT hozzájárulás szükséges a feltöltési felületen (checkbox-szövegezés).
2. Edzésnapló / haladási adatok: hasonló 9. cikk-kockázat („fitness adat" mint egészségadat) — a jelenlegi minősítés (szerződés teljesítése, nem különleges adat) megerősítendő.
3. Mux mint címzett: az IP-cím és lejátszási adatok USA-ba továbbítása — ellenőrizendő a Mux aktuális DPF-tanúsítási státusza és DPA-ja; ha nincs DPF, SCC + transzfer-hatásvizsgálat (TIA) szükséges. Ugyanez Twilio SendGrid és Vercel esetén.
4. Megőrzési idők: a c) sor 5 éves (Ptk. elévülés) és a j) sor Fgytv. 17/A. § szerinti 5 éves ideje megerősítendő; az exportnapló és a consent-rekordok megőrzése arányosítandó.
5. Cookie-szakasz (7. pont): a feltétlenül szükséges tárolás (7.2) hozzájárulás-mentessége ellenőrizendő az Eht. 155. § (4) és a NAIH gyakorlata szerint, különös tekintettel a Mux-lejátszó és a Stripe technikai tárolására.
6. A 30 napos törlési türelmi idő (6.3): a GDPR 17. cikkével való összhang (indokolatlan késedelem nélküli törlés vs. visszavonási ablak) — a jelenlegi gyakorlatban a fiók azonnal zárolásra kerül, ez rögzítve; megerősítendő, hogy ez elegendő.
7. Adatvédelmi tisztviselő kijelölésének szükségessége (37. cikk) — a rendszeres, nagymértékű nyomon követés kérdése a haladáskövetés fényében.
8. Az e-mail-emlékeztetők Grtv. (2008. évi XLVIII. tv.) 6. § szerinti minősítése: a megújulási/fizetési e-mailek tranzakciósak, de a motivációs/edzés-emlékeztetők reklámnak minősülhetnek → a hozzájárulás szövegezése a beállítási felületen ellenőrizendő.

--- A 2026-08-13-i analitikai frissítéssel bekerült pontok ---

9. **ELŐZMÉNY, AMIT JOGÁSZNAK ÉRTÉKELNIE KELL:** a Google Analytics 4 és a Google Tag
   Manager 2026-08-09 óta (a `4eaf2b7` deploy óta) él a Weboldalon, hozzájárulás-alapú
   sávval együtt. E tájékoztató **2026-08-13-ig ezzel ellentétesen** azt állította, hogy
   az Adatkezelő nem végez analitikai követést és hogy „a weboldalon nincs
   süti-hozzájárulási sáv". A jelen módosítás ezt az ellentmondást szünteti meg.
   Értékelendő, hogy a ~4 napos időszak igényel-e bármilyen további lépést
   (a mérés maga végig hozzájáruláshoz volt kötve, tehát az érintettektől hozzájárulás
   nélkül adat nem került a Google-höz — a hiba a tájékoztatás, nem a gyakorlat oldalán
   állt fenn).
10. **A hozzájárulás visszavonásának módja (7.4) — a legfontosabb nyitott pont.** A
    hozzájárulás megadása egy kattintás, a visszavonás viszont jelenleg a böngésző helyi
    tárolójának manuális törlését igényli. A GDPR 7. cikk (3) bekezdése szerint a
    visszavonásnak **ugyanolyan egyszerűnek kell lennie**, mint a megadásnak.
    Javasolt fejlesztés: a süti-beállítások újranyitására szolgáló link az oldal
    láblécében vagy az adatvédelmi oldalon. Amíg ez nincs meg, a 7.4. pont szövegezése
    megfelelőségi kockázatot hordoz.
11. GA4 adatmegőrzési idő (3.1 k) sor): a Google Analytics tulajdonban ténylegesen
    beállított érték (2 vagy 14 hónap) ellenőrizendő és a táblázatba konkrétan
    beírandó.
12. A 7.3. táblázat sütilistája a jelenlegi tag-készletet tükrözi. Ha a GTM
    konténerbe további mérőkód kerül (tervezett: Meta Pixel), a lista és a 2.3., 5. és
    7.5. pont **a bevezetés előtt** frissítendő; ekkor a hirdetési célú adatkezelés
    jogalapja és az 5. pont „hirdetési célra nem ad át" fordulata is felülvizsgálandó.
13. Mérlegelendő a Google Consent Mode és az IP-anonimizálás beállítása, valamint hogy
    a süti-sáv jelenlegi szövege („Sütiket használunk a látogatottság méréséhez (Google
    Analytics)") a tag-készlet bővülésekor pontatlanná válik.
-->
