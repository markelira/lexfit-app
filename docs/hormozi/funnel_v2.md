# LEXFIT — Funnel v2 (final, 2026-09-04)

Supersedes `funnel.md` for copy and dates; UTM/pixel spec, event schema, media structure and kill rules from v1 remain valid. Changes: **founder price + counter removed** (continuity = Havi 5,990), calendar shifted (ads Sep 7–17), full Lead-Gen Scrambler added, all retention/cancel/dunning copy now paste-ready Hungarian.

---

## 1. Calendar (locked)

| Day | Work |
|---|---|
| **Thu Sep 4** | Offer v3 site restructure (no Stripe rebuild — the subscription ladder in `config.ts` is unchanged: 490 intro → 1 990/hét · 5 990/hó · 39 900/év) · UTM persistence → Checkout metadata · `/arak` + `#garancia` |
| **Fri Sep 5** | Reveal (guest playback, Alexa video slot, offer module) · pricing page copy (offer_v2 §4) · events + CAPI + Test Events QA · SendGrid D-series + buyer triggers + suppressions |
| **Sat Sep 6** | Cancel flow v1 + dunning emails loaded · statics exported (matrix below) · Alexa records: reveal video + 2 milestone messages · full E2E test in FB in-app browser · **offer live (evening)** · FB group pinned post |
| **Sun Sep 7** | Email-102 broadcast (morning) · **cold ads live** · daily ops cadence starts |
| Tue Sep 9 | RTG ad set live (audience seeded) |
| Thu Sep 11 | Mid-test check-in vs targets |
| Wed Sep 17 | Ads end (10 days) |
| Sun Sep 21 | Final cohort read → October decision (formulas.md §6 gates) |

Budget, structure, optimization (Lead event), targets and kill rules: unchanged from funnel v1 §1.

---

## 2. Lead-Gen Scrambler — full component library + assembled matrix

Rules baked in silently: headline first in testing order; say who it's for and who it's not; reason-why; damaging admission; show-don't-tell; simple next steps; third-grade reading level; no exclamation marks; no body-outcome+timeframe; no second-person health assumptions.

### 2.1 Headline library (H)

| # | Type | Headline (HU) |
|---|---|---|
| H1 | avatar | Azoknak, akik már többször újrakezdték |
| H2 | curiosity/free | 7 kérdés, és kész a heti edzésterved |
| H3 | mechanism | A kihagyott hét nálunk nem nulláz |
| H4 | negative | Nem motiváció kell. Rendszer. |
| H5 | duration | A nap végén is elég 20 perc |
| H6 | óvatos | Óvatos mozgás, vezetve |
| H7 | anti-avatar | Nem versenyzőknek. Újrakezdőknek. |
| H8 | outcome-state | Rendszer, ami megmarad |
| H9 | fear-lite | A „majd hétfőn" sosem jön el magától |
| H10 | proof | 1 200+ ember mozog velünk otthon |
| H11 | reason-why | Szeptember: a legjobb hónap újrakezdeni |
| H12 | damaging admission | Csodát nem ígérünk. Tervet igen. |

### 2.2 Primary-text library (P) — each ends with the same closer

Closer line (all): *„7 kérdés, és kész a heti terved. Ingyen. — Szeptemberi Újrakezdés"*

**P1 · óvatos confession**
> Porckopás miatt vettem vissza a sportból. Nem edzeni akartam újra — mozogni. Ezért a LEXFIT-ben minden edzésnek van csendes, fal mellett végezhető változata, és mindet Alexa vezeti végig.

**P2 · restart mechanism**
> Majd holnap. Majd hétfőn. Aztán eltelik egy hónap, és megint nulláról kellene kezdeni — ez a pont, ahol a legtöbb újrakezdés elhal. A LEXFIT-ben a kihagyott hét nem nulláz: ott folytatod, ahol abbahagytad.

**P3 · napvégi**
> Fáradtan hazaérni és még kitalálni, mi legyen — ez a legnehezebb rész. Ezért nálunk a terv készen vár: 20–30 perc, eszköz nélkül, elég egy matrac. Este kilenckor is működik.

**P4 · demo/free**
> Nincs regisztráció, nincs trükk: válaszolsz hét kérdésre, és megkapod a heti edzéstervedet pihenőnapokkal. Az első edzést azonnal elindíthatod.

**P5 · proof/community**
> Több mint 1 200-an mozgunk együtt otthon — a legtöbben nem sportolók, hanem dolgozó felnőttek, akik sokadszorra kezdték újra. A különbség egy terv, ami kibírja a rossz heteket is.

**P6 · honest anti-hype**
> Nem lesz „bombaforma 30 nap alatt". Az lesz, hogy hétfőn tudod, mi a dolgod, és egy rossz hét nem dönti romba. Alexa vezeti az edzéseket; a tested diktálja a tempót.

### 2.3 Visual-concept library (V) — static, sage/dark, text-light

| # | Concept |
|---|---|
| V1 | Alexa mid-movement on a mat, real living room, evening lamp light |
| V2 | Typographic card: headline only, sage on dark |
| V3 | Paper calendar, one week crossed out, the count continuing — no reset |
| V4 | Phone screenshot: Q1 of the quiz, thumb visible |
| V5 | Living room with TV casting a workout, mat in front |
| V6 | Close-up of a real member finish card (consented) |

### 2.4 Assembled matrix — 15 ready ads

`utm_content` code = `sN` + combo. All CTA: „Több információ" → /ujrakezdes.

| Ad | H | P | V | Angle | utm_content |
|---|---|---|---|---|---|
| A1 | H1 | P2 | V2 | restart | s1_h1p2v2 |
| A2 | H3 | P2 | V3 | restart-mech | s2_h3p2v3 |
| A3 | H9 | P2 | V2 | restart-fear | s3_h9p2v2 |
| A4 | H6 | P1 | V1 | óvatos | s4_h6p1v1 |
| A5 | H12 | P1 | V1 | óvatos-honest | s5_h12p1v1 |
| A6 | H7 | P6 | V2 | anti-hype | s6_h7p6v2 |
| A7 | H5 | P3 | V5 | napvégi | s7_h5p3v5 |
| A8 | H2 | P4 | V4 | demo | s8_h2p4v4 |
| A9 | H2 | P4 | V2 | demo-typo | s9_h2p4v2 |
| A10 | H8 | P6 | V2 | outcome | s10_h8p6v2 |
| A11 | H10 | P5 | V6 | proof | s11_h10p5v6 |
| A12 | H11 | P2 | V1 | season | s12_h11p2v1 |
| A13 | H4 | P6 | V3 | negative | s13_h4p6v3 |
| A14 | H1 | P5 | V1 | avatar-proof | s14_h1p5v1 |
| A15 | H6 | P3 | V5 | óvatos-napvégi | s15_h6p3v5 |

**Launch set (Sun Sep 7): A1, A4, A7** (one per proven angle). Day-3 swap pool: same angle first (A1→A2/A3; A4→A5; A7→A15), then cross-angle (A8, A11). UGC clips U1–U4 (formulas.md §3) replace the weakest static from day 5 if ready. Never >4 live ads (budget fragmentation).

---

## 3. Member lifecycle emails — paste-ready (SendGrid triggers per funnel v1 §4.1)

**P0 · purchase (immediate, transactional)**
Tárgy: Megvan — az első edzésed készen áll
> Szia,
>
> köszönöm a bizalmat. A Start program a fiókodban vár: 30 edzés, a te heti tervedbe rendezve.
>
> Nem kell ma elkezdened — de ha ma kezded, holnap már könnyebb lesz. Ennyi kell hozzá: egy matrac és 2×2 méter. TV-n néznéd? [Itt a leírás.]
>
> És hogy le legyen írva: **csináld végig az első 10 edzést öt héten belül — a könnyített változat is számít —, és ha utána úgy érzed, ez nem a tiéd, egy e-mail elég, és visszautaljuk, amit fizettél.**
>
> [Indítom az első edzést]
>
> Alexa

**W1 · first workout completed**
Tárgy: 1/40
> Szia,
>
> az első megvan — és ez nem semmi: a legtöbb terv az első edzésig sem jut el.
>
> Amit a következő napokról tudni érdemes: a második-harmadik edzés direkt könnyebb terhelésű, mert az izomláz most jön. A pihenőnap a terv része, nem kihagyás.
>
> A kártyád a fiókodban van, ha meg akarod nézni. [Megnézem]
>
> Alexa

**M1 · missed planned day (push + email, once per miss, max 2/week)**
Push: „A holnapi 12 perces elég."
Email tárgy: A holnapi elég lesz
> Szia,
>
> kimaradt egy nap — nálunk ettől nem történik semmi. A sorozatod él, a terved megvár.
>
> Ha holnap csak 12 perced van, ez való oda: [A rövid változat]
>
> Alexa

**W5 · workout 5 (≤14 nap)**
Tárgy: Megvan az alap
> Szia,
>
> öt edzés. Innen már statisztikailag is más a történet — akik idáig eljutnak, jellemzően végig is csinálják.
>
> Két dolog nyílt ki a fiókodban: **A görnyedés vége** (4 hetes tartásjavító) és egy rövid üzenet tőlem — ezt tényleg én mondtam fel neked. [Meghallgatom]
>
> Alexa

**I1 · 0 workouts by day 5 after purchase**
Tárgy: A terved megvár
> Szia,
>
> láttam, hogy még nem indítottad el az elsőt. Semmi baj — de hadd vegyem le a nyomást: az első edzésnek nem kell jónak lennie. Csak meg kell történnie. 20 perc, és nem kell hozzá se erő, se forma.
>
> Ha ez a hét nem a tiéd volt, a jövő hétfő is jó kezdés. A 10 edzés garancia ablaka öt hét — bőven benne vagy.
>
> [Indítom az elsőt]
>
> Alexa

**W10 · workout 10 (≤5 hét)**
Tárgy: Ez már rendszer
> Szia,
>
> tíz edzés. A garancia feltételét teljesítetted — mostantól ez már nem próba, hanem a rendszered.
>
> Kinyílt a 16 heti kihívás archívuma is, ha változatosság kell. [Megnézem]
>
> A nehezén túl vagy. A 15. edzésnél visszamérünk.
>
> Alexa

**M2 · day 35, <10 workouts (miss-path)**
Tárgy: {n} edzés öt hét alatt
> Szia,
>
> {n} edzés van mögötted öt hét alatt. Ez több, mint amennyit a legtöbben elkezdenek — akkor is, ha a garancia ablaka most lezárult.
>
> A program nem zárult le: a 30 edzés megvár, és ott folytatod, ahol abbahagytad. Ha most nehéz időszak van, szüneteltethetsz 1–3 hónapot egy kattintással — a haladásod megmarad.
>
> [Folytatom] · [Szüneteltetek]
>
> Alexa

**W15 · félidő**
Tárgy: 15/30 — félidő
> Szia,
>
> félúton vagy. A fiókodban ott a félidős visszamérés — két perc, és számokban látod, honnan hova jutottál. Meg egy második üzenet tőlem. [Megnézem]
>
> Alexa

**W30 · finish + continuity (standard Havi)**
Tárgy: 30/30
> Szia,
>
> végigcsináltad. Harminc edzés, a te tempódban (amennyi nálad lett — az is számít). A záró visszamérés a fiókodban van: nézd meg, honnan indultál.
>
> Innen három út van, és mindegyik rendben van:
> **Folytatod** — havi tagsággal minden marad: az összes program, a heti kihívások, a terved. 5 990 Ft/hó, bármikor lemondható. [Folytatom havival]
> **Szünetelsz** — 1–3 hónap, a haladásod megmarad. [Szünetet kérek]
> **Itt megállsz** — a Start a tiéd volt, semmi nem újul meg magától.
>
> Bármelyiket választod: büszke lehetsz. Én az vagyok.
>
> Alexa

**R1 · Heti plan, day 5 (pre-renewal)**
Tárgy: Mielőtt megújul a heted
> Szia,
>
> pénteken újul meg a heti tagságod (1 990 Ft). Addig ennyi történt nálad: {n} edzés, {p} perc mozgás.
>
> Ha jövő hétre más ritmus kell: [szüneteltetés] vagy [lemondás] egy kattintás — és ha maradsz, a jövő heti terved már készül.
>
> Alexa

**R2 · Havi plan, day 25** — same structure, „kedden újul meg a havi tagságod (5 990 Ft)".

---

## 4. Cancel flow — paste-ready strings (B2C pattern: survey → one save → confirm)

**Screen 1 — reason (skippable)**
> Mielőtt mennél — mi a fő ok?
> · Nem használtam eleget
> · Túl drága most
> · Végigcsináltam, ennyi akart lenni
> · Testi ok — fájdalom, sérülés
> · Nem nekem való
> · [Kihagyom, csak lemondanék]

**Screen 2 — one save per reason**

*Nem használtam:*
> Ilyenkor a szünet többet segít, mint a lemondás: 1–3 hónap, nem terhelünk, és ott folytatod, ahol abbahagytad — a sorozatod és a haladásod megmarad.
> [Szüneteltetem 1 hónapra] · [Inkább lemondom]

*Túl drága:*
> Van kisebb lépcső: heti tagság 1 990 Ft-ért, ugyanazzal a teljes hozzáféréssel.
> [Váltok hetire] · [Inkább lemondom]

*Végigcsináltam:*
> Gratulálunk — a Start a tiéd. Ha később folytatnád, a fiókod és a haladásod megmarad, és bármikor visszajöhetsz havi tagsággal.
> [Rendben, lemondom]

*Testi ok:*
> Ezt tiszteletben tartjuk, és nem győzködünk. Ha segít: a szünet 1–3 hónapig megőriz mindent, és minden edzésnek van csendes, kímélő változata, ha visszatérnél. Ha kezelés alatt állsz, az orvosod szava az első.
> [Szüneteltetem] · [Lemondom]

*Nem nekem való (inside guarantee window, ≥12 workouts):*
> Rendben. Egy fontos dolog: a 10 edzés garancia rád érvényes — ha kéred, visszautaljuk, amit fizettél. [Kérem a visszatérítést] · [Csak lemondom]

**Screen 3 — confirm**
> A lemondásod megvan. A hozzáférésed {dátum}-ig él, utána nem terhelünk. A fiókod és a haladásod megmarad — ha egyszer visszajönnél, ott folytatod.

**Post-cancel email (immediate)**
Tárgy: Lemondva — minden rendben
> Szia, a lemondás sikerült, {dátum}-ig még minden elérhető, utána nem terhelünk. A haladásod megmarad. Köszönjük, hogy itt voltál — és ha egyszer újra kedved lesz, egy friss hétfő mindig lesz. — Alexa

Compliance: cancel completes even if the save screen errors; „Inkább lemondom" visible on every screen; no repeated offers.

---

## 5. Dunning — involuntary churn (new lane; Stripe Smart Retries ON)

Weekly cadence is fast → compressed sequence. Grace: full access 5 days (Heti) / 10 days (Havi), then pause (never delete).

**DN1 · payment failed (day 0)**
Tárgy: Nem ment át a fizetés — 30 másodperc rendezni
> Szia, a {kártyatípus} •••• {utolsó4} kártyádat nem tudtuk terhelni ({összeg} Ft). Ez gyakran csak átmeneti — újra próbáljuk automatikusan, de a leggyorsabb, ha frissíted a kártyát: [Kártya frissítése]. A hozzáférésed addig is él. — LEXFIT

**DN2 · day 2**
Tárgy: Még nem sikerült a terhelés
> Szia, még mindig nem ment át a {összeg} Ft-os terhelés. [Kártya frissítése] — fél perc. Ha közben inkább lemondanál, az is egy kattintás a fiókodban, és nem próbálkozunk tovább. — LEXFIT

**DN3 · day 4 (Heti) / day 8 (Havi) — final**
Tárgy: Holnap szüneteltetjük a fiókod
> Szia, ez az utolsó levél a témában: ha holnapig nem sikerül a terhelés, a fiókodat szüneteltetjük. Semmi nem vész el — a haladásod megmarad, és a kártyád frissítésével bármikor visszakapcsolod. [Kártya frissítése] Ha lemondani szerettél volna, nincs teendőd. — LEXFIT

**In-app banner (during dunning):** „A legutóbbi terhelés nem sikerült. [Kártya frissítése] — a hozzáférésed még él."

**Pre-dunning:** card-expiry email 30/7 days before (template from playbook, HU-ified at build); backup-card prompt shown once after a recovered failure.

**Pause reactivation:** day −7 „Egy hét múlva visszakapcsol a fiókod — ennyi újdonság várt rád…" · day −1 „Holnap folytatódik — a terved készen áll."

---

## 6. Win-back (weekly/monthly/Start lapsers only; max 2, fresh-start timing)

**WB1 · first Monday of next month**
Tárgy: Egy friss hétfő
> Szia, nem győzködni akarlak — csak szólni, hogy amit elkezdtél, ott van, ahol hagytad: {n} edzés, a sorozatod megőrizve. Ha ez a hétfő jó lenne rá, egy kattintás: [Folytatom]. Ha nem, ez volt az utolsó ilyen levél. — Alexa

**WB2 · October wrapper launch (single broadcast)** — announces the Októberi Kihívás (formulas.md F2), no discount, then stop.

---

## 7. Measurement — deltas from v1 only
- Remove: founder-price counter metric. Add: `module_click`/`module_dismiss` CTR · instalment take-rate (if shipped) · dunning recovery rate (target ≥50%) · cancel-flow save split (pause vs downgrade vs refund).
- Dashboard, targets, red lines, day-3/6/10 decision rules: unchanged (funnel v1 §5). Final read Sep 21.
