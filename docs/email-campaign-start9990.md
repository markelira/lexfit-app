# Email-kampány — Lexfit Start 9 990 Ft

**Állapot:** javaslat, nincs kiküldve. Három nyitott döntés a végén.
**Készült:** 2026-09-21 · a `quizLeads` teljes lekérdezéséből + Hormozi-kutatásból

---

## 0. A kampány tézise egy mondatban

A listán lévők nem a programot utasították el, hanem **az előfizetést** — és a `/start` pontosan ezt az egy kifogást szünteti meg.

Ez nem feltételezés. A meglévő sorozat D6/D9 levelei a `week_intro` előfizetésre visznek (`/register?q=plan&plan=week_intro`), és 456 leadből **4 vásárolt**. A `/start` oldal maga is ezért született: *„a first »yes« asked for an account, a password, a card AND a recurring charge at once"*. Az új ajánlat ebből hármat kivesz.

Ezért a kampány **nem ismétli** a korábbi pitch-et. Új ajtót nyit ugyanannak az embernek.

---

## 1. Amit az adat mond (2026-09-21)

### A lista valódi mérete

| | db | megjegyzés |
|---|---|---|
| összes lead | 456 | |
| van email-címe | 456 | |
| `consents.marketing === true` | **235** | a többi 221 kifejezetten `false` |
| leiratkozott | 10 | |
| már fizetett | 4 | |
| **jogszerűen levelezhető** | **223** | ez a kampány teljes univerzuma |

**A 48%-os marketing-elutasítás önmagában is tanulság.** Az űrlapon minden második ember nemet mond a marketingre. Ezt nem lehet megkerülni, és nem is szabad: a `stopReason`/`lmStopReason` mindkét ága helyesen szűr rá, tehát a meglévő program megfelelő. Aki `false`, az **soha nem kaphat** ebből a kampányból levelet.

### Kik ők

| dimenzió | eloszlás |
|---|---|
| szegmens | restart 43% · stronger 26% · no_energy 17% · careful 10% · browsing 4% |
| edzettség | **rare 33% + none 30% = 63% alig edz** |
| heti napok | 4 nap 35% · 3 nap 34% · rugalmas 22% |
| panasz | **58%-nak van térd/derék/halk-edzés igénye** (csak 42% „semmi") |
| hely | nappali 54% · vegyes 32% |
| napszak | este 40% · változó 35% |
| kor | medián **42** (p25 35, p75 47) |
| nem | 103 nő / 15 férfi (akik megadták) |
| cél | fogyás 93 · tónus 13 · tömeg 12 |

### A lista frissessége — és amiért ez megváltoztatja a stratégiát

Minden lead **2026-09-08 és 09-17 között** jött be. 305-en hét naposnál frissebbek.

Ez **nem halott lista**, tehát nem Hormozi-féle „reaktiváció". Ez egy **frissen ápolt lista, ami az első ajánlatot nem vette meg**. A különbség lényeges: nem kell újra bemutatkozni, nem kell „rég nem hallottunk egymásról" hang. Egyenesen a kifogásra lehet menni.

### Ütközés a futó sorozattal

**174 ember még a meglévő sorozatban van**, a következő levelük 2026-09-21 és 09-24 között esedékes. 272-en befejezték vagy nem futnak.

→ **A kampány leghamarabb szeptember 25-én indulhat.** Korábban a harmadik pitch lenne két hét alatt ugyanattól a feladótól, és a listát égetné.

---

## 2. Hormozi email-stratégiája — amit átveszünk, és amit nem

A kutatás forrásai a dokumentum végén. A lényeg:

**Amit átveszünk:**

| elv | nálunk így néz ki |
|---|---|
| Jóindulatot építesz a kampányok között, aztán **koncentrált ablakba sűríted a kérést** | 6 levél 5 nap alatt, utána csend |
| Nem termék, hanem **esemény** a keret | közös rajt, nem „vedd meg a programot" |
| A **PS a legerősebb hely** (Columbo-trükk) | minden levél PS-e egy önálló érv |
| A záráskor **fokozódó ritmus** | az utolsó napon két levél, reggel és este |
| Mondd ki, **mit veszít, ha vár** | a közös rajtot, nem egy kitalált kedvezményt |
| Negyedévente egy koncentrált kampány a listára | ez az első ilyen |

**Amit tudatosan NEM veszünk át, és miért:**

- **Kitalált szűkösség, visszaszámláló, „csak ma".** A `/start` copy fejlécében külön ki van mondva, hogy ez hiányzik szándékosan: *offer v3 §2/§10, és a GVH AboutYou-határozata pontosan erről a mintáról szól.* Magyarországon ez nem stílus kérdése, hanem bírságolt gyakorlat.
- **Felfújt bónuszhalom („X Ft értékben").** A vevő tud összeadni, és a saját ajánlat-dokumentumunk is tiltja.
- **Napi hét levél.** Hormozi 464 000 fős listán csinálja. 223 emberen ugyanez nem intenzitás, hanem zaklatás.
- **Test- és kalóriaállítás.** Art. 9 + a body-positive korlát. A leadjeink 78%-ánál a cél fogyás, de ezt **nem** mondjuk ki számokkal.

**A helyettesítő mechanika: a közös rajt.** Ez Hormozi „event framing"-je, csak igaz változatban. Nem kitalált határidő — ha kimondjuk, hogy hétfőn közösen indulunk, és tényleg indul egy szál a csoportban, akkor az valódi ok a mostra. Ez egyben a márkához is illik: a csoport a közösségi felületünk.

> **Ez döntést kíván tőled.** Ha nem akarsz közös rajtot tartani, a kampányból ki kell venni — és akkor marad egy határidő nélküli, gyengébb, de tisztességes verzió. Az alternatívát a 6. pont írja le.

---

## 3. A kampány

**Célcsoport:** `consents.marketing === true` ÉS nincs `unsubscribedAt` ÉS nincs `paidAt` ÉS nincs futó `nextEmailAt` → **223 fő**
**Feladó:** `Alexa <alexa@lexfit.hu>` (ugyanaz, mint a sorozaté — a felismerhetőség itt érték)
**Formátum:** sima szöveg, egy CTA levelenként, RFC 8058 leiratkozás minden levélben
**Cél:** `https://www.lexfit.hu/start?utm_source=email&utm_medium=owned&utm_campaign=start9990_szept&utm_content=e{N}`

### Ütemezés

| # | mikor | feladat |
|---|---|---|
| E1 | szept 25., csütörtök 18:10 | a kifogás átkeretezése |
| E2 | szept 26., péntek 18:10 | mi van benne — mutatni, nem állítani |
| E3 | szept 27., szombat 09:40 | a saját akadályuk (szegmentált) |
| E4 | szept 28., vasárnap 18:10 | a közös rajt |
| E5 | szept 29., hétfő 07:20 | ma indulunk |
| E6 | szept 29., hétfő 19:40 | utolsó hívás, őszintén |

Az esti időzítés nem tipp: a listánk 40%-a **este** edzene, és a nyitási szokás ezt követi.

---

### E1 — „Nem a program volt a baj"

**Tárgy:** Az előfizetés volt a baj, nem a program
**Előnézet:** Kivettük belőle. Egyszer fizetsz, és a tiéd marad.

```
Szia {{firstName}},

Pár hete kitöltötted a tervet, aztán nem lett belőle semmi. Nem vagy egyedül
vele - és most már azt is sejtem, miért.

Az volt a kérés, hogy csinálj fiókot, adj meg kártyát, és kösd le magad egy
havonta megújuló előfizetésre. Egyszerre három igen, még mielőtt egyetlen
edzést is láttál volna.

Kivettük belőle kettőt.

A Lexfit Start mostantól megvehető egyben: 9 990 Ft, egyetlen alkalommal.
Nem előfizetés, nincs mit lemondani, és örökre a tiéd marad. 8 hét, 35 edzés,
sorrendbe rakva - megmondja, mikor mit csinálj.

Megnézem: {{link}}

Alexa

PS: 14 napig indoklás nélkül visszakérheted az árát. Nem azért írom, mert
számítok rá, hanem mert így nem kell most eldöntened, hogy bejön-e.
```

---

### E2 — „Mi van benne"

**Tárgy:** 35 edzés, sorrendben
**Előnézet:** Nem videótár. Program, ami megmondja, mi a következő.

```
Szia {{firstName}},

Tegnap írtam, hogy a Start már egyben megvehető. Ma inkább megmutatom, mit
kapsz, mert egy edzésprogramról nehéz bármit elhinni szövegből.

35 edzés, nyolc hétre elosztva. Nem egy videótár, amiből neked kell
válogatnod - sorrendbe van rakva. Minden nap tudod, mi jön.

Minden edzést Alexa vezet végig. Otthon, eszköz nélkül; egy szőnyegnyi hely
elég. Bármelyik nap, bármelyik órában.

A teljes listát végignézheted, mielőtt bármit fizetsz:
{{link}}

Alexa

PS: A kihívásokat nem kell megvenned. Azok minden fióknak ingyenesek, akkor
is, ha a Startot sosem veszed meg.
```

---

### E3 — „A te akadályod" (szegmentált)

**Tárgy:** {{szegmens szerint}}
**Előnézet:** {{szegmens szerint}}

A törzs közös, az első két bekezdés szegmensenként cserélődik. A szegmens a
`computed.segment` mezőből jön, tehát nem találgatás - ők maguk adták meg.

**restart (96 fő) —** tárgy: *Nem a harmadik hét a hibás*
```
Azt írtad, hogy újra neki akarsz futni. Ez azt is jelenti, hogy volt már
legalább egy előző futás, ami elakadt.

A legtöbb elakadás nem lustaság. A harmadik hét környékén egyszerűen elfogy
az, ami eddig vitte: az újdonság. Ami utána tart, az egy terv, amit nem
neked kell fejben tartanod.
```

**no_energy (39 fő) —** tárgy: *Este hatkor már nincs mit eldönteni*
```
Azt írtad, hogy az energia a szűk keresztmetszet. Ez nem kifogás, hanem a
nap végi valóság.

Ezért van a Startban minden sorrendbe rakva. Nem kell eldöntened, mit
csinálj ma - megnyitod, elindítod, kész. A döntés az, ami fárasztó, nem a
harminc perc.
```

**careful (23 fő) —** tárgy: *Ha a térded vagy a derekad szól bele*
```
Azt jelezted, hogy óvatosan kell edzened. Ez a leggyakoribb dolog a
listánkon: tízből majdnem hatan írtak térdet, derekat vagy azt, hogy halkan
kell mozogniuk.

A Start otthoni, eszköz nélküli program - nincs benne ugrálás miatt
összedőlő lakás, és nincs teremgép, ami egy méretre van állítva.
```

**stronger (57 fő) —** tárgy: *Az erő nem a súlyokon múlik*
```
Azt írtad, erősebb akarsz lenni. Ehhez nem terem kell, hanem következetesség
- és az jön a legnehezebben, amikor minden edzés előtt újra el kell dönteni,
mi legyen.

A Start ezt a részt oldja meg: nyolc hétre kész a sorrend.
```

**Közös zárás (mind):**
```
8 hét, 35 edzés, otthonra. Egyszer fizetsz: 9 990 Ft. Nem előfizetés.

{{link}}

Alexa

PS: Ha most nem aktuális, nyugodtan hagyd. A jövő héten már nem fogok róla
írni.
```

---

### E4 — „Hétfőn közösen indulunk"

**Tárgy:** Hétfőn együtt kezdjük
**Előnézet:** Egyedül a harmadik hétnél szoktunk elakadni.

```
Szia {{firstName}},

Hétfőn elindul egy csoport a Starttal. Nem kurzus, nincs élő óra - egyszerűen
annyi, hogy egyszerre kezdünk, és a Facebook-csoportban lesz egy szál, ahol
ugyanazon a héten ugyanott tartunk.

Ez azért számít, mert az elakadás ritkán az első héten jön. A harmadik
környékén jön, amikor már nincs újdonság, és még nincs szokás. Olyankor
sokat számít, hogy más is ott tart.

Ha hétfőn velünk akarsz indulni, ma vagy holnap érdemes megvenned:
{{link}}

Alexa

PS: A program utána is ugyanúgy megvehető, és ugyanúgy a tiéd marad örökre.
A közös rajtot viszont nem tudom visszamenőleg megadni.
```

---

### E5 — „Ma indulunk"

**Tárgy:** Ma kezdünk
**Előnézet:** Első edzés ma este. Harminc perc.

```
Szia {{firstName}},

Ma van a közös rajt. Az első edzés harminc perc, otthon, eszköz nélkül.

Ha ma csatlakozol, ugyanott kezded, ahol mindenki más.

{{link}}

Alexa

PS: Ha ma nem fér bele, az sem baj - a sorrend akkor is vár rád, amikor
belefér. Ez a része nem múlik el.
```

---

### E6 — „Utolsó hívás"

**Tárgy:** Ma este zárom
**Előnézet:** Utána nem írok többet erről.

```
Szia {{firstName}},

Ma este lezárom ezt a sort. Nem azért, mert az ár változik - nem változik -,
hanem mert a közös rajt ma volt, és nem akarok még egy hétig erről írni.

Ha eddig azon gondolkodtál, a rövid változat ennyi:

8 hét, 35 edzés, otthonra, eszköz nélkül. Egyszer fizetsz 9 990 Ft-ot, és
örökre a tiéd. Nem előfizetés. 14 napig indoklás nélkül visszakérheted.

{{link}}

Ha nem aktuális, teljesen rendben - a heti kihívások ingyen maradnak,
azokhoz nem kell semmit venned.

Alexa

PS: Ez volt az utolsó levelem az ajánlatról. A következő, amit tőlem kapsz,
megint edzésről fog szólni.
```

---

## 4. Miért pont ez a hat levél

| levél | Hormozi-elv | a mi adatunk, ami alátámasztja |
|---|---|---|
| E1 | a kifogás megnevezése, nem a termék ismétlése | 456 lead → 4 vásárlás az előfizetésre |
| E2 | show, don't tell | 63% alig edz — nekik a „mi lesz velem" a kérdés, nem a funkciólista |
| E3 | személyes relevancia | `computed.segment` a saját válaszukból, nem tipp |
| E4 | event framing | 43% „restart" — nekik pont a tartás hiányzott |
| E5 | fokozódó ritmus a zárás felé | este 40%, reggeli levél az esti edzésre készít |
| E6 | mondd ki, mi vész el — de csak azt, ami tényleg | a rajt vész el, nem az ár |

Minden levél PS-e önálló érv, nem udvariaskodás — ez a Columbo-slot.

---

## 5. Várható eredmény — őszintén

223 levelezhető ember. Friss, meleg lista, releváns új ajánlattal.

| forgatókönyv | konverzió | vásárlás | bevétel |
|---|---|---|---|
| óvatos | 1,5% | 3 | ~30 000 Ft |
| reális | 3% | 7 | ~70 000 Ft |
| jó | 5% | 11 | ~110 000 Ft |

Ez **nem** fogja megváltoztatni a negyedévet, és nem is ezért érdemes megcsinálni. Két dolog miatt érdemes: a költsége nulla, és **jelet ad a Meta-kampánynak** ugyanabban az ablakban — a Purchase-események sűrűsödése pont akkor segít a tanulásban, amikor a hirdetés fut.

A számok szándékosan nincsenek felfelé kerekítve. Ha valaki 20%-ot ígér egy 223 fős listára, az nem ismeri a listát.

---

## 6. Ha nincs közös rajt

Akkor E4 és E5 kiesik, és a kampány négy levél marad (E1, E2, E3, E6), az E6-ból pedig kimarad a „ma este zárom". Határidő nélkül.

Ez gyengébb — nincs oka a mostnak —, de **tisztességes**, és nem sért semmit. A rossz harmadik út az lenne, hogy kitalálunk egy határidőt: azzal a GVH-kockázatot és a saját ajánlat-dokumentumunkat is megsértenénk egyszerre.

---

## 7. Mérés

- UTM-ből GA4: `utm_campaign=start9990_szept`, `utm_content=e1…e6`
- A `program_checkout_started` és `program_purchased` események amúgy is naplózódnak → a napi brief látja
- **Figyelendő:** leiratkozási arány. 223 fős listán **6 fölötti leiratkozás (2,7%)** azt jelenti, hogy túl sűrű volt; olyankor E5-öt ki kell hagyni a következő körben.
- Spam-panasz: bármelyik levélnél 2 fölött azonnal állj le.

---

## 8. Nyitott döntések

1. **Lesz közös rajt szeptember 29-én?** Ha igen, tartani kell: egy szál a csoportban, és Alexa ott van benne. Ha nem, a 6. pont szerinti rövid verzió megy.
2. **Szeptember 25-i indulás jó?** Korábban nem lehet — 174 ember sorozata 24-ig fut.
3. **A Facebook-csoport belépési válaszai.** Ezek a Claude.ai projektbe vannak feltöltve, onnan **nem érem el** a Claude Code-ból. Ha beteszed őket a repóba vagy bemásolod, beépítem a szegmentálásba. Fontos viszont: **email-küldési jogalapot ezek nem adnak** — a csoporttagság nem marketing-hozzájárulás, és a legtöbbjüknél email-cím sincs.

---

## Források (Hormozi-kutatás)

- [Alex Hormozi's Emails That Raked In $100 Million, Revealed — Email Marketing Heroes](https://emailmarketingheroes.com/alex-hormozis-emails-that-raked-in-100-million-revealed/)
- [Alex Hormozi $100M Webinar Funnel: The Step-by-Step Launch Playbook — Stormy AI](https://stormy.ai/blog/alex-hormozi-100m-webinar-funnel-playbook)
- [How Alex Hormozi Made $2.4 million Profit in 7 Days — Kevin Abraham, Medium](https://kevinabraham583.medium.com/how-alex-hormozi-made-2-4-million-profit-in-7-days-without-paid-ads-961488025258)
- [The Hormozi Campaign Breakdown — EmailOS](https://newsletter.theemailos.com/p/the-hormozi-campaign-breakdown)
- [$100M Cold Email Strategy by Alex Hormozi — School of SDR](https://schoolofsdr.substack.com/p/100m-cold-email-strategy-by-alex)
