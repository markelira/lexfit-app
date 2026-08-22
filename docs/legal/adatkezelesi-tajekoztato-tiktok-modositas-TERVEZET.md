# TERVEZET — az adatkezelési tájékoztató módosítása a TikTok Pixelhez

> **⚠️ EZ NEM HATÁLYOS SZÖVEG.** Ügyvédi felülvizsgálatra szánt szövegtervezet, amelyet
> fejlesztői oldalról állítottunk össze abból, amit a rendszer ténylegesen csinálni fog.
> Nem jogi tanács. **Élesítés előtt ügyvédi jóváhagyás kötelező.**
>
> **Készült:** 2026-08-22 · **Alapdokumentum:** `docs/legal/adatkezelesi-tajekoztato.md`
> (hatályos 2026. augusztus 21-től, verzióazonosító `2026-08-21`)
>
> **Kiváltó ok:** a hatályos tájékoztató **7.5. pontja** kimondja: *„Ha az Adatkezelő a
> jövőben további analitikai vagy marketingcélú mérőkódot vezet be, azt kizárólag a fenti
> hozzájárulási mechanizmus mellett teszi, és e tájékoztatót — a 10. pont szerinti
> értesítés mellett — ennek megfelelően módosítja."* A TikTok Pixel bevezetése pontosan
> ez az eset.

---

## 0. Mi változik, és mi NEM

A LEXFIT a Meta mellett **TikTok-hirdetéseket** is indít, ezért a meglévő Google Tag
Manager-konténerbe bekerül a **TikTok Pixel** (pixel-azonosító: `DA4PL4JC77U208UL7D60`).

**Amit ez NEM változtat meg — és ez a jó hír:**

| Elem | Miért marad érintetlen |
|---|---|
| A hozzájárulási mechanizmus | A GTM-konténer **csak hozzájárulás esetén töltődik be**; a TikTok Pixel a konténerben ül, tehát a kaput automatikusan örökli. Elutasításnál a pixel kódja **le sem töltődik**, süti nem kerül elhelyezésre. |
| A kvíz adatainak védelme | A 3.4. pont kizárása (*„hirdetési célra … semmilyen formában nem továbbítja"*) változatlanul érvényes, és a TikTokra is vonatkozik. A mérési réteg technikailag is kizárja: a kérdőív-eseményekhez csak a képernyő azonosítója tartozik, a válasz soha. |
| Az adattárolás helye | A leadek és a felhasználói adatok továbbra is a Firebase-ben (EU, Frankfurt) vannak. A TikTok felé csak a mérési események mennek. |
| Új adatkezelési **cél** | Nem keletkezik: a hirdetésmérés mint cél már szerepel (3.1. l) sor). Csak **új címzett** lép be. |

**Amit módosítani kell:** a 2.3., a 3.1. l) sor, az 5. pont (adatfeldolgozók), és a 7.3.
süti-tábla.

---

## 1. ⚖️ A LEGFONTOSABB KÉRDÉS AZ ÜGYVÉDHEZ — a harmadik országba történő adattovábbítás

**Ez a TikTok esetében nem formalitás, hanem az érdemi kockázat**, és lényegesen súlyosabb,
mint a Google/Meta esetében. Kérjük az álláspont kialakítását, mert a tájékoztató 5. pontjának
„garanciák" oszlopa ezen múlik.

**A tények, amelyeket ismerünk:**

- **Az ír adatvédelmi hatóság (DPC) 2025. május 2-án 530 millió eurós bírságot szabott ki
  a TikTokra** az EGT-s felhasználói adatok Kínába történő továbbítása miatt, és korrekciós
  intézkedéseket rendelt el.
- A TikTok az EGT-s adatok tárolására európai adatközpontokat épít („**Project Clover**",
  Írország és Norvégia); a bevezetés **fokozatos**.
- A szakirodalom visszatérő aggálya, hogy a kínai nemzetbiztonsági jogszabályok alapján a
  ByteDance-t adatszolgáltatásra kötelezhetik, ami **az általános szerződési feltételek
  (SCC) mellett is** kockázatot jelenthet.

**⚖️ Kérdések:**

1. A fentiek mellett a TikTok Pixel bevezetése vállalható-e, és ha igen, milyen
   garanciákra hivatkozzunk az 5. pont táblázatában (SCC? Project Clover? mindkettő?)
2. Szükséges-e **érdekmérlegelés vagy hatásvizsgálat** (DPIA) a bevezetés előtt,
   tekintettel arra, hogy a Weboldalon **9. cikkes adatokat is kezelünk** (kvíz)?
   *(Fejlesztői megjegyzés: a kvíz adatai a TikTok felé technikailag nem juthatnak el —
   de a hatásvizsgálati kötelezettséget ez nem feltétlenül zárja ki.)*
3. A süti-sávon **külön** kell-e nevesíteni a TikTokot, vagy elegendő a 7.3. tábla
   bővítése és a részletes tájékoztatóra mutató link?

> **Ha az ügyvéd álláspontja az, hogy a továbbítás jelenleg nem vállalható**, a TikTok Pixel
> **nem élesíthető**. Ez terméktulajdonosi és jogi döntés, nem fejlesztői — műszakilag a
> pixel bármikor szüneteltethető a GTM-ben, egyetlen kapcsolóval, deploy nélkül.

---

## 2. Módosítás a 2.3. pontban

A felsorolás bővítendő:

> 2.3. Az Adatkezelő a Weboldalon webanalitikai és hirdetésmérési célú mérést végez (Google
> Analytics 4, Google Tag Manager, Meta Pixel**, TikTok Pixel**), **kizárólag a látogató
> előzetes, önkéntes hozzájárulása alapján**…

*(A mondat többi része változatlan.)*

---

## 3. Módosítás a 3.1. táblázat l) sorában

**Javaslat: a meglévő l) sor kiterjesztése**, mert az adatkezelési **cél azonos**
(hirdetésmérés és -optimalizálás) — csak a címzett bővül. Új sor nyitása azt sugallná,
hogy új célról van szó.

| Cél | Jogalap | Kezelt adatok köre | Megőrzési idő |
|---|---|---|---|
| **l) Hirdetésmérés és -optimalizálás (Meta Pixel, TikTok Pixel)** | (1) a) — hozzájárulás (süti-sáv) | Álnevesített hirdetési azonosító (süti), IP-cím, eszköz- és böngészőadatok, az oldal címe és tartalmi jellemzői, valamint a tölcsér eseményei (a lead-kérdőív indítása, lépésenkénti előrehaladása — a válaszok tartalma nélkül —, a lead-adatok megadása, regisztráció, fizetési lépés elérése). **Kizárólag a hozzájáruló látogatókra terjed ki. A kérdőívre adott válaszok, így különösen a testadatok és az élethelyzetre vonatkozó válasz, a hirdetési rendszerek felé semmilyen formában nem kerülnek továbbításra.** A Meta „automatikus haladó párosítás" funkciója **kikapcsolva**. | A Meta, illetve a TikTok adatmegőrzési szabályai szerint, illetve a hozzájárulás visszavonásáig |

**⚖️ Kérdés:** elfogadható-e a sor kiterjesztése, vagy jogi okból külön sort kér?

---

## 4. Új sor az 5. pont (Adatfeldolgozók) táblázatába

| Szolgáltató | Szerep | Kezelt adatok | Adattovábbítás / garanciák |
|---|---|---|---|
| **TikTok Technology Limited** (Írország, 10 Earlsfort Terrace, Dublin, D02 T380) és **TikTok Information Technologies UK Limited** — TikTok Pixel | hirdetésmérés és hirdetésoptimalizálás | álnevesített hirdetési azonosító (süti), IP-cím, eszköz- és böngészőadatok, az oldal címe, tölcséresemények | **Kizárólag a látogató hozzájárulása esetén.** Az EGT-s felhasználók tekintetében a TikTok Technology Limited (Írország) és a TikTok Information Technologies UK Limited **közös adatkezelőként** járnak el. Harmadik országba történő továbbításra …**⚖️ [az 1. pont szerinti ügyvédi állásfoglalás alapján kitöltendő]**… |

**⚖️ Kérdés:** a „garanciák" oszlop szövegezését kérjük az ügyvédtől — ez az a mező, amit
fejlesztői oldalról nem tudunk és nem is szabad megfogalmaznunk.

---

## 5. Új sorok a 7.3. süti-táblába

| Eszköz | Szolgáltató | Cél | Elhelyezett tárolás |
|---|---|---|---|
| **TikTok Pixel** | TikTok Technology Limited (Írország) | a TikTok-hirdetések eredményességének mérése és optimalizálása | `_ttp` (**saját domainen elhelyezett, kb. 13 hónapos** hirdetési süti), `_tt_enable_cookie` (munkamenet), valamint hirdetésre érkezéskor a kattintás-azonosítót tároló `ttclid`/`_ttclid` |

**Fejlesztői megjegyzés a pontosság kedvéért:** a `_ttp` **first-party** süti, tehát a
`lexfit.hu` domainen jön létre — nem harmadik feles sütiként. Ez a besorolást nem
befolyásolja (hirdetési célú, hozzájáruláshoz kötött), de a tábla „Elhelyezett tárolás"
oszlopában érdemes pontosan szerepelnie, mert eltér a Meta `_fbp`-jétől abban, hogy
hosszabb élettartamú.

**⚖️ Kérdés:** a 13 hónapos élettartam feltüntetése kötelező-e, vagy elegendő a „hirdetési
süti" megjelölés? *(A hatályos tábla a Meta sütijeinél nem tünteti fel az élettartamot.)*

---

## 6. A 10. pont szerinti értesítési kötelezettség

**⚖️ Kérdés:** a jelen módosítás **„lényeges módosításnak"** minősül-e, amelyről a
felhasználókat a 10. pont szerint e-mailben vagy az alkalmazásban értesíteni kell?

**Fejlesztői szempontok a döntéshez:**

- A módosítás **nem érinti** a meglévő felhasználók adatkezelését: új célt nem vezet be,
  a fiókadatokkal semmit nem tesz, és kizárólag a **hozzájáruló látogatókra** hat.
- Ugyanakkor **új címzett (adatfeldolgozó) lép be**, ráadásul olyan, amelynél a harmadik
  országba történő továbbítás önálló kérdés (1. pont).
- A 2026-08-21-i kvíz-módosításnál ugyanez a kérdés felmerült, és az volt az álláspont,
  hogy értesítés nem szükséges, mert a módosítás csak új, önkéntes adatkezelést vezetett be.
  **Itt viszont a mérlegelés más lehet**, mert a TikTok minden hozzájáruló látogatót érint,
  nem csak azt, aki önként kitölt valamit.

---

## 7. Összefoglaló ellenőrzőlista az ügyvédnek

| # | Kérdés | Hol |
|---|---|---|
| 1 | **Vállalható-e a TikTok felé történő adattovábbítás, és milyen garanciákkal?** | 1. pont |
| 2 | Kell-e DPIA / érdekmérlegelés a bevezetés előtt? | 1. pont |
| 3 | Nevesítendő-e a TikTok a süti-sávon, vagy elég a 7.3. tábla? | 1. pont |
| 4 | A 3.1. l) sor kiterjeszthető, vagy külön sor kell? | 3. pont |
| 5 | Az 5. pont „garanciák" oszlopának pontos szövege | 4. pont |
| 6 | A `_ttp` 13 hónapos élettartamának feltüntetése kötelező-e? | 5. pont |
| 7 | „Lényeges módosítás"-e, kell-e felhasználói értesítés? | 6. pont |

---

## 8. Mi történik a jóváhagyás után (fejlesztői oldal)

1. A jóváhagyott szöveg beépül a `docs/legal/adatkezelesi-tajekoztato.md`-be, **új
   hatálybalépési dátummal és verzióazonosítóval**.
2. **A `QUIZ_POLICY_VERSION` env-változót is át kell állítani** az új dátumra, mert a
   kvíz-leadek hozzájárulási naplója ezt rögzíti. *(Ha ezt elfelejtjük, a napló egy olyan
   verziót nevez meg, ami már nem a hatályos — az elszámoltathatóság sérül.)*
3. Deploy → a `/adatvedelem` oldal a hatályos szöveget mutatja.
4. **Csak ezután**: a TikTok-varázsló „Publish" gombja, illetve a GTM-ben a
   `TT-DA4PL4JC77U208UL7D60-Web-Tag-Pixel_Setup` és `…-Pixel_Event` tagek aktiválása.

**A sorrend kötött**, ugyanazon okból, mint a kvíznél: a mérőkód nem futhat olyan címzett
felé, akiről a hatályos tájékoztató nem szól.

---

## 9. Források a tényállításokhoz

- Ír adatvédelmi hatóság (DPC) / EDPB — a 2025. május 2-i, 530 millió eurós határozat az
  EGT-s adatok Kínába továbbításáról:
  https://www.dataprotection.ie/en/news-media/latest-news/irish-data-protection-commission-fines-tiktok-eu530-million-and-orders-corrective-measures-following
- EDPB hírközlemény ugyanerről:
  https://www.edpb.europa.eu/news/news/2025/irish-supervisory-authority-fines-tiktok-eu530-million-and-orders-corrective_en
- TikTok EGT-s adatvédelmi tájékoztató (közös adatkezelők, ír székhely):
  https://www.tiktok.com/legal/page/eea/privacy-policy/en
- TikTok hirdetési hálózat adatvédelmi tájékoztatója:
  https://www.tiktok.com/legal/page/global/tiktok-ad-network-privacy-policy/en

*A süti-nevekre és élettartamokra vonatkozó adatok (`_ttp`, `_tt_enable_cookie`, `ttclid`)
nyilvános szakmai összefoglalókból származnak; élesítés előtt a tényleges süti-készletet
a böngészőben is ellenőrizzük, és a táblát ahhoz igazítjuk.*
