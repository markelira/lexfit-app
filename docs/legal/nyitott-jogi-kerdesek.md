# Nyitott jogi kérdések — belső munkaanyag

**BELSŐ DOKUMENTUM. Nem publikus, nem renderelődik weboldalra.**
A `LegalDoc` komponens kizárólag az `aszf.md`, `adatkezelesi-tajekoztato.md` és
`impresszum.md` fájlokat teszi közzé — ez a fájl nincs köztük.

Ezek a pontok korábban HTML-kommentként a tájékoztató végén álltak. A tájékoztató
2026-08-13-i véglegesítésekor (a dokumentum élesben van) kikerültek onnan, hogy a
publikálandó szöveg tiszta, végleges dokumentum legyen — a kérdések viszont **nyitva
maradtak**, ezért itt élnek tovább.

Kapcsolódó fájl: `docs/legal/adatkezelesi-tajekoztato.md`

---

## Ügyvédi ellenőrzésre váró pontok

1. **Haladási fotók jogalapja** (3.1 f / 3.2): a tájékoztató hozzájárulásra (6. cikk
   (1) a)) épít. Ellenőrizendő, hogy a fotók — mivel testalkat-változás követésére
   szolgálnak — minősülhetnek-e egészségügyi (9. cikk) adatnak; ha igen, 9. cikk (2) a)
   szerinti KIFEJEZETT hozzájárulás szükséges a feltöltési felületen
   (checkbox-szövegezés).
2. **Edzésnapló / haladási adatok:** hasonló 9. cikk-kockázat („fitness adat" mint
   egészségadat) — a jelenlegi minősítés (szerződés teljesítése, nem különleges adat)
   megerősítendő.
3. **Mux mint címzett:** az IP-cím és lejátszási adatok USA-ba továbbítása —
   ellenőrizendő a Mux aktuális DPF-tanúsítási státusza és DPA-ja; ha nincs DPF, SCC +
   transzfer-hatásvizsgálat (TIA) szükséges. Ugyanez Twilio SendGrid és Vercel esetén.
4. **Megőrzési idők:** a c) sor 5 éves (Ptk. elévülés) és a j) sor Fgytv. 17/A. §
   szerinti 5 éves ideje megerősítendő; az exportnapló és a consent-rekordok megőrzése
   arányosítandó.
5. **Cookie-szakasz** (7. pont): a feltétlenül szükséges tárolás (7.2)
   hozzájárulás-mentessége ellenőrizendő az Eht. 155. § (4) és a NAIH gyakorlata
   szerint, különös tekintettel a Mux-lejátszó és a Stripe technikai tárolására.
6. **A 30 napos törlési türelmi idő** (6.3): a GDPR 17. cikkével való összhang
   (indokolatlan késedelem nélküli törlés vs. visszavonási ablak) — a jelenlegi
   gyakorlatban a fiók azonnal zárolásra kerül, ez rögzítve; megerősítendő, hogy ez
   elegendő.
7. **Adatvédelmi tisztviselő** kijelölésének szükségessége (37. cikk) — a rendszeres,
   nagymértékű nyomon követés kérdése a haladáskövetés fényében.
8. **Az e-mail-emlékeztetők** Grtv. (2008. évi XLVIII. tv.) 6. § szerinti minősítése: a
   megújulási/fizetési e-mailek tranzakciósak, de a motivációs/edzés-emlékeztetők
   reklámnak minősülhetnek → a hozzájárulás szövegezése a beállítási felületen
   ellenőrizendő.

## A 2026-08-13-i analitikai frissítéssel bekerült pontok

9. **ELŐZMÉNY, AMIT JOGÁSZNAK ÉRTÉKELNIE KELL:** a Google Analytics 4 és a Google Tag
   Manager 2026-08-09 óta (a `4eaf2b7` deploy óta) él a Weboldalon, hozzájárulás-alapú
   sávval együtt. A tájékoztató **2026-08-13-ig ezzel ellentétesen** azt állította, hogy
   az Adatkezelő nem végez analitikai követést és hogy „a weboldalon nincs
   süti-hozzájárulási sáv". A 2026-08-13-i módosítás ezt az ellentmondást megszüntette.
   Értékelendő, hogy a ~4 napos időszak igényel-e bármilyen további lépést. **Enyhítő
   körülmény:** a mérés maga végig hozzájáruláshoz volt kötve, tehát hozzájárulás
   nélkül egyetlen érintettől sem került adat a Google-höz — a hiba a *tájékoztatás*,
   nem a *gyakorlat* oldalán állt fenn.
10. ~~A hozzájárulás visszavonásának módja~~ — **MEGOLDVA 2026-08-13.** A visszavonás
    korábban a böngésző helyi tárolójának kézi törlését igényelte, ami nem felelt meg a
    GDPR 7. cikk (3) „ugyanolyan egyszerű" követelményének. Azóta a lábléc
    **„Süti-beállítások"** gombja egy kattintással újranyitja a süti-sávot
    (`CookieSettingsButton`, `src/components/Analytics.tsx`), és elutasításkor az oldal
    újratölt, hogy a már betöltött mérőkódok is eltűnjenek. A 7.4. pont ezt írja le.
    **Nyitott részlet:** a gomb a nyilvános felületek láblécében van (landing +
    `(legal)` oldalak). A bejelentkezett app-felületen nincs lábléc, így ott a
    látogatónak a `/adatvedelem` oldalra kell navigálnia — mérlegelendő, hogy a
    profil/beállítások oldalra is kerüljön-e egy jogi link-sor.
11. **GA4 adatmegőrzési idő** (3.1 k) sor): a Google Analytics tulajdonban ténylegesen
    beállított érték (2 vagy 14 hónap) ellenőrizendő és a táblázatba konkrétan
    beírandó. Jelenleg a szöveg általánosan hivatkozik a beállításra.
12. **A 7.3. táblázat sütilistája a jelenlegi tag-készletet tükrözi.** Ha a GTM
    konténerbe további mérőkód kerül (tervezett: Meta Pixel), a lista és a 2.3., 5. és
    7.5. pont **a bevezetés előtt** frissítendő; ekkor a hirdetési célú adatkezelés
    jogalapja és az 5. pont „hirdetési célra nem ad át" fordulata is felülvizsgálandó.
13. **Consent Mode / IP-anonimizálás:** mérlegelendő a Google Consent Mode és az
    IP-anonimizálás beállítása. Továbbá a süti-sáv jelenlegi szövege („Sütiket
    használunk a látogatottság méréséhez (Google Analytics)") a tag-készlet bővülésekor
    pontatlanná válik — a Pixel bevezetésével együtt módosítandó.
14. **Hatálybalépés dátuma:** a tájékoztató fejlécében 2026. augusztus 11. szerepel
    (tulajdonosi döntés, 2026-08-13). Mivel a módosítás közzététele ennél későbbi,
    ügyvéddel egyeztetendő, hogy a visszamenőleges hatálybaléptetés megfelelő-e, vagy a
    közzététel napját kell feltüntetni. Kapcsolódik a 10. ponthoz: a 10. pont szerinti
    értesítési kötelezettség (lényeges módosítás) teljesítése is eldöntendő.
