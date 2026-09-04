# LEXFIT — Lead Magnet v2 (final copy, 2026-09-04)

Supersedes `lead_magnet.md` for copy; mechanics/targets/instrumentation from v1 remain valid except: **no founder price anywhere**, dates shifted (ads Sep 7). Every block below is paste-ready Hungarian. Voice: tegeződő, quiet, no exclamation marks, no weight-loss vocabulary, no second-person health assumptions.

---

## 1. Landing page `/ujrakezdes` — full copy

**Hero**
> **Szeptemberi újrakezdés**
> 7 kérdés, és kész a heti edzésterved. Otthonra, eszköz nélkül, pihenőnapokkal — Alexával.
> Azoknak, akik már többször újrakezdték.
>
> [Kérem a tervem]
>
> 20–30 perces edzések · elég egy matrac · 1 200+ fős közösség

**Below the fold (scrollers only)**

> **Ismerős?**
> Hétfőn még megvolt a lendület. Csütörtökön közbejött valami. A jövő héten majd újra — aztán a jövő hétből hónap lett. Nem az akaraterővel van baj. Azzal, hogy minden kihagyás után nulláról kell kezdeni.
>
> **Ezért másképp működik**
> A LEXFIT-ben a pihenőnap nem töri meg a sorozatot, és a kihagyott hét nem nulláz — ott folytatod, ahol abbahagytad. A tervedet nem neked kell kitalálnod: hét kérdésből elkészül, és minden edzést Alexa vezet végig.
>
> **Így néz ki**
> 1. Válaszolsz 7 kérdésre — nagyjából egy perc.
> 2. Megkapod a heti tervedet, pihenőnapokkal.
> 3. Az első edzést azonnal elindíthatod — 20–30 perc, eszköz nélkül.
>
> *(2 member finish-card photos, one male — real ones from the existing set)*
>
> **Ki az az Alexa?**
> Tíz évig versenyszerűen tornáztam, aztán évekig semmit. Nulláról, egy matracon kezdtem újra — ebből lett a LEXFIT. Nem vagyok orvos és nem ígérek csodát. Egy rendszert ígérek, ami kibírja az életet.
>
> [Kérem a tervem]

---

## 2. Quiz — all screens, final

Progress dots 1/7…7/7 throughout. One question per screen, tap advances.

**Q1 — anchor (segment tag)**
> **Mi hozott ide?**
> · Újra rendszeresen mozognék
> · A hátam, ízületeim miatt óvatosan mozognék
> · A nap végén nincs energiám elkezdeni
> · Erősödnék, formálódnék
> · Csak körülnézek

**Q2**
> **Mennyire mozogsz mostanában?**
> · Szinte semennyit
> · Néha, rendszertelenül
> · Hetente egyszer-kétszer
> · Rendszeresen, csak keretet keresek

**Q3**
> **Hány nap férne bele egy hetedbe?**
> · 2 nap
> · 3 nap
> · 4 nap
> · Ahogy jön — legyen rugalmas

**Q4**
> **Mennyi idő jut egy alkalomra?**
> · 10–15 perc
> · 20–30 perc
> · Fél óránál több is

**Interstitial (after Q4, auto-advance ~2 s)**
> A terved pihenőnapokkal készül.
> A kihagyott hét nálunk nem nulláz.

**Q5**
> **Mire figyeljünk a testednél?** *(többet is jelölhetsz)*
> · Térd — ugrálás nélkül szeretném
> · Derék, hát — kímélettel
> · Csendben kell edzenem (alvó gyerek, szomszédok)
> · Semmi különös

**Q6**
> **Hol fogsz mozogni?**
> · Nappaliban, matracon
> · Kisebb helyen — 2×2 méter is elég?
> · Változó helyeken

**Q7**
> **Napszak, ami reális nálad?**
> · Reggel, munka előtt
> · Napközben
> · Este, a nap végén
> · Mindig máskor

---

## 3. Gate — final

> **Kész a terved.**
> Hova küldjük, hogy meg is maradjon?
>
> [ e-mail címed ]
>
> ☐ Kérem mellé Alexa 6 napos induló sorozatát és a LEXFIT híreit e-mailben. Bármikor, egy kattintással leiratkozhatsz.
>
> [Mutasd a tervem]
>
> A tervet enélkül is elküldjük erre a címre. — [Adatkezelési tájékoztató]

Consent record: checkbox state + timestamp + text version `consent_lm_v1`. Unchecked → D0 only.

---

## 4. Plan reveal — final

**Header**
> **A heted, készen**
> 3 nap mozgás, 20–30 perc, a te szintedhez igazítva. A pihenőnap is a terv része.

*(plan grid renders here)*

**First workout block**
> ▶ **Kezdd el az első edzést** — most, vendégként is. 22 perc, eszköz nélkül.

**Alexa video (30 s) — script, final**
> „Szia, Alexa vagyok. Ez a terv mostantól a tiéd — és igen, direkt van benne pihenőnap. Nem az a kérdés, hogy bírod-e egyben a tíz hetet. Az a kérdés, mi történik, amikor jön egy rossz hét. Nálunk annyi: ott folytatod, ahol abbahagytad. Az első edzés húsz perc. Nem kell ma elkezdened — de ha ma kezded, holnap már könnyebb lesz. Ott találkozunk."

**Offer module** — copy in `offer_v2.md` §5.

**Footer**
> A tervet elküldtük e-mailben is, hogy TV-n vagy laptopon is megnyithasd.

---

## 5. Email sequence — final (SendGrid, sender `Alexa <alexa@lexfit.hu>`, plain text, one CTA each)

### D0 — delivery (transactional; everyone)
**Tárgy:** A heti terved
**Preheader:** Bent van minden, az első edzéssel együtt.
> Szia,
>
> itt a terved: **[Megnyitom a tervem]**
>
> Három dolog van benne: a heti beosztásod pihenőnapokkal, az első edzés (20–30 perc, eszköz nélkül — elég egy matrac és 2×2 méter), és a folytatás.
>
> Egy tanács az első hétre: ne a legjobb napodra időzítsd az első edzést. Időzítsd egy átlagosra. Ha az megvan, a többi könnyebb.
>
> *(consented only:)* Holnaptól hat napon át küldök egy-egy rövid levelet arról, hogyan szokott szétesni az első hét — és mit lehet ellene tenni.
>
> Alexa
>
> Ui. TV-n néznéd? Itt a leírás: [TV-re kötés]

### D3 — belief (consented only)
**Tárgy:** Mi esik szét a 9. napon
**Preheader:** Nem az akaraterő. A terv.
> Szia,
>
> a legtöbb újrakezdés nem az első napokban esik szét, hanem amikor jön egy rossz hét. Túlóra, betegség, vendégek — és a sorozat nulláról indul. Onnan pedig ritkán indul újra.
>
> Ezért van a LEXFIT-ben két szabály. A pihenőnap nem töri meg a sorozatot. A kihagyott hét pedig nem nulláz — ott folytatod, ahol abbahagytad.
>
> Én tíz évig versenyszerűen tornáztam, aztán évekig semmit. Nem az edzés hiányzott, hanem egy rendszer, ami kibírja az életet. Ezt építettem meg.
>
> A heti terved itt van, ha ezen a héten még nem nyitottad meg: [A tervem]
>
> Alexa

**Segment P.S. variants (by Q1 tag, append one):**
- *óvatos:* „Ui. Ha az ízületeid miatt vagy óvatos: minden edzésnek van csendes, fal mellett végezhető változata — és az is teljes értékű."
- *napvégi:* „Ui. Ha estére semmi nem marad: a Napzáró rutinok 6–8 percesek. Az is mozgás."
- *erősödnék:* „Ui. A terv fokozatosan nehezedik — a 30 edzés alatt észre fogod venni, csak nem az első héten."
- *körülnézek:* „Ui. Nyugodtan nézelődj. A terved addig is megvár."

### D6 — the offer (consented only; suppressed on purchase)
**Tárgy:** 30 edzés, és visszakapod a pénzed, ha nem vált be
**Preheader:** A 10 edzés garancia — a te tempódban.
> Szia,
>
> a heti terv egy hét. Ha rendszert szeretnél belőle, arra való a **LEXFIT Start**: 30 edzés a te tempódban, mindet én vezetem, és úgy épül, hogy egy rossz hét ne döntse el.
>
> Van hozzá egy vállalásom. **Csináld végig az első 10 edzést öt héten belül — a könnyített változat is számít. Ha utána úgy érzed, ez nem a tiéd, egy e-mail elég, és visszautaljuk, amit fizettél.** Nem kérdezünk, nem győzködünk.
>
> Egy tagság, minden benne: a Start program, az összes többi program, és minden héten 5 új kihívás-videó. Az első hét 490 Ft — utána 1 990 Ft/hét, vagy 5 990 Ft/hó.
>
> Ha most nem időszerű, a heti terved akkor is a tiéd marad.
>
> [Megnézem a Start programot]
>
> Alexa
>
> Ui. A 14 napos elállási jog a garanciától függetlenül megillet.

### D10 — ~~wrapper close~~ **CUT (offer v3 §0)**
No deadline exists in offer v3 — „Szeptemberi Újrakezdés" is seasonal framing, never a date. A
close email would be a fabricated deadline, so this send is removed. **WB2 stays** (October is a new
kör, not a deadline).
---

## 6. Deliverability & ops (unchanged from v1, restated)
- SPF/DKIM/DMARC verified · one-click unsubscribe header · suppression group per sequence · purchase webhook removes from D3/D6/D10.
- Q1 tag → SendGrid custom field `q1_segment` → drives the D3 P.S.
- In-app-browser QA (FB + IG) on the gate's email field before Saturday.
