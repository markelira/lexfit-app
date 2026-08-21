# LexFit lead magnet kvíz — MASTER fejlesztői specifikáció
## „A személyes LexFit tervem" — teljes, önálló fejlesztési dokumentum

**Verzió:** 3.0 MASTER · **Dátum:** 2026-08-19
**Ez a dokumentum önmagában teljes:** egyesíti a v1 (flow, UI-viselkedés, GDPR, analytics, e-mail szekvencia) és a v2.3 (háromkimenetes logika, záró-auditált számítások) tartalmát, kiegészítve a backend- és integrációs fejezettel. Külső dokumentumra nem hivatkozik. A számítási és döntési logika gépi referencia-implementációval ellenőrzött (14.1 audit-melléklet). **A fejlesztőre kizárólag a UI/UX kivitelezés marad** — minden viselkedés, szöveg, számítás, adatkezelés és integráció itt van specifikálva.

---

# 1. Áttekintés

**Cél:** a lexfit.hu látogatóiból e-mail lead-et generálni egy 60–90 másodperces, feleletválasztós kvízzel, amely három személyre szabott outputot ad, és átvezet az előfizetésre (ingyenes próbával).

**A 3 output:**

| # | Output | Példa megjelenés |
|---|---|---|
| **O1** | Szinten tartó kalória (kb.) + célhoz igazított kalória (kb.) | „Szinten tartó: kb. 1 850 kcal → A célodhoz: kb. 1 600 kcal/nap" |
| **O2** | Ajánlott LexFit program (fő program + bónusz mini-program) | „A te programod: Lexfit Start · Bónusz: 5 napos Láb & Fenék-Challenge" |
| **O3** | Napi lépéscél a célhoz igazítva | „Napi lépéscélod: 8 000 — először célozd meg az 5 000-et, onnan emelünk" |

**Hangnem-elv:** ajánlás és iránymutatás, nem szakértői előírás. Mindig „kb.", „ajánlott", „jó kiindulópont". Soha nem szégyenítő, nem ijesztgető. A kitöltő érezze: kapott egy világos kiindulópontot, a LexFit érti, hol tart, és van kedve elkezdeni — velünk.

**Valóság-szabály (kötelező, rendszerszintű):** az eredményoldal és az e-mailek KIZÁRÓLAG `active:true` programot nevezhetnek meg. Ha egy mapping-ág inaktív programra mutatna, a fallback lép életbe; ha a `next_step` inaktív, a folytatás-blokk nem jelenik meg. Kézi copy sem hivatkozhat nem élő programra.

**KPI-k és riasztási küszöbök:**

| Metrika | Cél | Riasztási küszöb |
|---|---|---|
| Start-to-lead (indítók → e-mailt megadók) | 40% | < 25% |
| Befejezési arány (indítók → utolsó kérdésig) | 65% | < 50% |
| Képernyőnkénti drop-off | < 10% | > 15% bármely képernyőn |
| S14 (adat-bekérő) elhagyás | < 10% | > 15% → first_name opcionálisra állítása (11.2) |

---

# 2. Teljes flow és képernyő-sorrend

**MEGJELENÍTÉSI SORREND (ezt kell implementálni):**

```
S0  Intro
S1  Q1  goal            (cél)
S2  Q2  sex             (nem)
S3  Q3  age_band        (korsáv)
S4  Q6  daily_move      (napközbeni mozgás)
S5  Q7  steps_now       (lépésbecslés)
S6  Q8  training_now    (edzés-rendszeresség)
S7  INTERSTITIAL        („Tudtad?" — a daily_move válasz alapján)
S8  Q4  body            (magasság + testsúly)
S9  Q5  target_weight_kg (cél-testsúly — CSAK ha goal = fat_loss)
S10 Q9  life_stage      (élethelyzet — CSAK nőknek, korsáv-szűréssel)
S11 Q10 session_min     (időkeret)
S12 Q11 obstacle        (fő akadály)
S13 BETÖLTŐ             („készítjük a terved")
S14 ADAT-BEKÉRŐ         (keresztnév + e-mail + hozzájárulások)
S15 EREDMÉNYOLDAL       (O1 + O2 + O3 + CTA)
```

*A Q-számok logikai azonosítók (a 4. fejezet így hivatkozik rájuk), az S-számok a megjelenítési sorrend. A sorrend oka: az interstitial a testadat-kérdés előtt oldja a feszültséget, és a feltételéhez szükséges `daily_move` válasz addigra már megvan.*

**Kérdés → output mapping (csak az van a kvízben, ami valamelyik outputhoz kell):**

| Kérdés | Táplálja |
|---|---|
| Q1 goal | O1, O2, O3 |
| Q2 sex | O1, O2 |
| Q3 age_band | O1, O2 |
| Q4 body | O1 |
| Q5 target_weight_kg | O1 (copy + felülírási szabály) |
| Q6 daily_move | O1, O2, interstitial-változat |
| Q7 steps_now | O1, O3 |
| Q8 training_now | O1, O2 |
| Q9 life_stage | O2 |
| Q10 session_min | O2 (copy) |
| Q11 obstacle | O2 (copy), e-mail szegmentálás |

11 kérdés, ebből 2 feltételes (Q5, Q9) — a tipikus kitöltő 9–11 kérdést lát.

---

# 3. Globális UI-viselkedési szabályok

- **Mobil-first** (a forgalom többsége hirdetésből, mobilon érkezik). Egy kérdés / képernyő.
- **Progress bar** minden képernyő tetején: S1-től S12-ig lineárisan töltődik, S13–S15 már 100%. A feltételes képernyők kihagyása nem „ugratja" hátra a sávot (a kihagyott lépés beleszámít a haladásba).
- **Válasz = továbblépés:** single-select kérdésnél a válaszra kattintás automatikusan léptet (nincs külön „Tovább" gomb). Input-mezős képernyőn (S8, S9, S14) van „Tovább"/CTA gomb.
- **Vissza gomb** minden képernyőn (kis nyíl, bal felül), a válaszok megőrzésével. Az S14-ről visszalépve a beírt név/e-mail a mezőben marad.
- **Állapotmentés:** a válaszok kliensoldalon tárolódnak (localStorage vagy session), oldalfrissítésnél nem vesznek el. **Szerverre semmilyen adat nem kerül az S14 sikeres submitja előtt.**
- **Betöltési idő:** képernyőváltás < 200 ms (SPA-jellegű működés, előtöltött lépések).
- **Nyelv:** minden szöveg magyar, tegező. A copy-t szó szerint ebből a dokumentumból kell átvenni.
- **Billentyűzet:** számmezőknél mobilon numerikus (`inputmode="numeric"` / `"decimal"`).

---

# 4. Képernyő-specifikáció (teljes copy-val)

## S0 — Intro
- **Headline:** „Készítsd el a személyes otthoni edzésterved 60 másodperc alatt"
- **Alcím:** „10–20 perc naponta, eszköz nélkül is. Válaszolj pár kérdésre, és megkapod a napi kalória-célod, a rád szabott LexFit programot és a napi lépéscélod — ingyen."
- **CTA:** „Kezdjük" → S1
- **Mikroszöveg:** „Kb. 1 perc · Nem kell regisztrálni a kitöltéshez"

## S1 — Q1 `goal` (single-select)
**Kérdés:** „Mi a fő célod?"

| Érték | Címke |
|---|---|
| `fat_loss` | Fogyás, zsírégetés |
| `tone` | Feszesedés, formásabb alak |
| `strength` | Erő és izom építése |
| `posture_energy` | Jobb tartás, több energia, kevesebb ülés-fájdalom |
| `restart` | Csak el akarok végre indulni |

## S2 — Q2 `sex` (single-select)
**Kérdés:** „Mi a biológiai nemed?" · Opciók: `male` — Férfi · `female` — Nő
**Mikroszöveg:** „A kalória-számításhoz kell — a férfi és női szervezet energiaigénye eltér."

## S3 — Q3 `age_band` (single-select)
**Kérdés:** „Hány éves vagy?"

| Érték | Címke | Számítási kor |
|---|---|---|
| `18_29` | 18–29 | 24 |
| `30_39` | 30–39 | 35 |
| `40_49` | 40–49 | 45 |
| `50_59` | 50–59 | 55 |
| `60_plus` | 60+ | 63 |

## S4 — Q6 `daily_move` (single-select)
**Kérdés:** „Milyen egy átlagos napod?"
`desk` — Főleg ülök (iroda, autó, képernyő) · `mixed` — Vegyes: ülök is, mozgok is · `active` — Sokat vagyok talpon (fizikai munka, pörgős napok)

## S5 — Q7 `steps_now` (single-select)
**Kérdés:** „Mit gondolsz, mennyit sétálsz egy átlagos napon?"
**Mikroszöveg:** „Tipp: a telefonod egészségalkalmazása megmondja. Ha nem tudod, tippelj nyugodtan."

| Érték | Címke | `steps_mid` |
|---|---|---|
| `lt4k` | Keveset — pár rövid séta (kb. 4 000 alatt) | 3 000 |
| `4_7k` | Közepeset (kb. 4–7 ezer lépés) | 5 500 |
| `7_10k` | Elég sokat (kb. 7–10 ezer lépés) | 8 500 |
| `10k_plus` | Nagyon sokat (10 ezer felett) | 11 000 |

## S6 — Q8 `training_now` (single-select)
**Kérdés:** „És edzeni szoktál mostanában?"
`none` — Nem, most kezdeném (újra) · `sometimes` — Néha igen, de nem rendszeresen · `regular` — Hetente többször
**Mikroszöveg:** „Nincs rossz válasz — a programod pontosan innen indul majd."

## S7 — Interstitial („Tudtad?") — NEM kérdés
Teljes képernyős tény-kártya, egyetlen „Tovább" gombbal. Nem gyűjt adatot, nem átugorható.
- **Változat A (ha `daily_move == desk`):** „**Tudtad?** A magyar felnőttek 41%-a napi 7 óránál többet ül — ez önmagában egészségügyi rizikófaktor. A jó hír: már napi 15 perc célzott mozgás is mérhetően ellensúlyozza. *(Forrás: KSH ELEF 2019)*"
- **Változat B (minden más eset):** „**Tudtad?** Csak minden 6. magyar felnőtt mozog annyit, amennyit a WHO ajánl. Akik igen, azok 81,5%-a érzi jónak az egészségét — a teljes lakosságnál ez csak 60%. *(Forrás: KSH ELEF 2019)*"

## S8 — Q4 `body` (két input + „Tovább" gomb)
**Kérdés:** „Add meg a magasságod és a testsúlyod"
**Mikroszöveg:** „Ebből becsüljük a napi kalória-igényed. Az adataid csak az eredményedhez kellenek."
- `height_cm`: egész, 120–230. Hiba: „Kérlek, cm-ben add meg (pl. 172)."
- `weight_kg`: szám, 35–250, tizedes engedett. Hiba: „Kérlek, kg-ban add meg (pl. 78)."

## S9 — Q5 `target_weight_kg` *(CSAK ha `goal == fat_loss`, különben kimarad)*
**Kérdés:** „Mi a cél-testsúlyod?" · Input + „Tovább" gomb. Validáció: 35–250.
- Ha `target >= weight`: nem hiba — a cél-kalória szinten tartóra vált (5.1 felülírási szabály), a szám ÉS a szöveg is karbantartást mutat.
- Ha `target < weight × 0.6`: puha figyelmeztetés: „Ez nagyon ambiciózus cél — a terved biztonságos, fenntartható ütemre készül." (blokkolás nélkül)

## S10 — Q9 `life_stage` *(CSAK ha `sex == female`; single-select)*
**Kérdés:** „Van olyan élethelyzet, amire figyeljünk a programodnál?"

| Érték | Címke | Megjelenítés |
|---|---|---|
| `postpartum` | Az elmúlt kb. 1 évben szültem | csak ha `age_band` ∈ {18_29, 30_39, 40_49} |
| `menopause` | A változókor környékén járok | csak ha `age_band` ∈ {40_49, 50_59} |
| `none` | Nincs ilyen | mindig |

Szabályok: ha a szűrés után csak a `none` maradna, a képernyő kimarad, `life_stage = none`. Férfiaknál soha nem jelenik meg, `life_stage = none`.

## S11 — Q10 `session_min` (single-select)
**Kérdés:** „Reálisan mennyi időd van egy edzésre?"
`10_15` — 10–15 perc (számítási érték: 15) · `20_30` — 20–30 perc (30) · `30_45` — 30–45 perc (45)
**Mikroszöveg:** „A jó terv nem az, ami sok időt kér — hanem amit tényleg megcsinálsz."

## S12 — Q11 `obstacle` (single-select)
**Kérdés:** „Eddig mi tartott vissza leginkább?"
`no_time` — Nincs időm · `no_motivation` — Nincs kedvem / nem köt le · `dont_know_how` — Nem tudom, hol kezdjem · `gave_up` — Elkezdtem már, de feladtam · `bad_experience` — Rossz élmények (tesióra, edzőterem)

## S13 — Betöltő („készítjük a terved")
Animált, 8–12 másodperces szekvenciális betöltő, nem átugorható. Három, egymás után kipipálódó sor (~3 mp/sor):
1. „Kalória-igényed becslése…" ✓
2. „A programjaink átnézése…" ✓
3. „A napi lépéscélod beállítása…" ✓
A tényleges számítás kliensoldalon azonnali — a késleltetés szándékos UX-elem (a személyre szabottság érzetét erősíti az adat-bekérés előtt). Automatikus továbblépés S14-re.

## S14 — Adat-bekérő (keresztnév + e-mail + hozzájárulások)
- **Headline:** „Kész a személyes terved! 🎉"
- **Alszöveg:** „Add meg a keresztneved és az e-mail címed — azonnal mutatjuk a kalória-célod, a LexFit programod és a napi lépéscélod, és e-mailben is elküldjük, hogy meglegyen."

**Mezők (ebben a sorrendben):**

| Mező | Típus | Kötelező | Validáció |
|---|---|---|---|
| `first_name` | szöveg, placeholder „Keresztneved" | igen | trim után 2–30 karakter; betűk (magyar ékezetek engedve), kötőjel és szóköz engedett; szám és speciális karakter nem. Hiba: „Kérlek, a keresztneved add meg (pl. Anna)." Megjelenítéskor az első betű nagybetűsítve. |
| `email` | e-mail, placeholder „E-mail címed" | igen | szintaktikai + domain-formátum ellenőrzés. Hiba: „Kérlek, ellenőrizd az e-mail címed." |

**Hozzájárulások — KÉT KÜLÖN, alapértelmezetten ÜRES checkbox (nem összevonható, nem előre pipálható):**
1. `consent_health` *(kötelező)*: „Hozzájárulok, hogy a megadott adataimat — a keresztnevem, az e-mail címem és a kvízben adott válaszaim, köztük az egészséggel összefüggő adatok (testadatok, mozgási szokások) — a LexFit a személyes eredményem elkészítéséhez és elküldéséhez kezelje. [Adatkezelési tájékoztató]"
2. `consent_marketing` *(opcionális)*: „Kérem a LexFit e-mailes tippjeit és ajánlatait. Bármikor leiratkozhatok."

**CTA:** „Kérem a tervem" — csak akkor aktív, ha a HÁROM feltétel együtt teljesül: first_name valid + email valid + consent_health bepipálva.
**Mikroszöveg a gomb alatt:** „Az adataidat bizalmasan kezeljük, harmadik félnek nem adjuk át."

**Logika:** szerveroldali mentés és e-mail-rendszer felé továbbítás KIZÁRÓLAG sikeres submit után (8. fejezet). Ha `consent_marketing = false`: csak az E1 eredmény-e-mail (tranzakciós) megy ki, a nurture-szekvencia (12. fejezet) nem.

## S15 — Eredményoldal
Lásd 7. fejezet.

---

# 5. Számítási logika (gépileg ellenőrzött)

**Kerekítési szabály (globális):** minden köztes számítás kerekítetlen értékkel megy; kerekítés kizárólag a megjelenített számokon. `round50(x)` = a legközelebbi 50-re · `round500(x)` = a legközelebbi 500-ra · **pontos felezőpontnál mindig FELFELÉ** (pl. 1 875 → 1 900). Ezt explicit implementálni kell — több nyelv beépített kerekítése (pl. Python) felezőpontnál párosra kerekít, ami platformonként eltérő eredményt adna. Referencia: `round50(x) = floor(x/50 + 0.5) × 50`.

## 5.1 O1 — Szinten tartó és cél-kalória

**1. BMR (Mifflin–St Jeor):**
```
férfi:  BMR = 10 × weight_kg + 6.25 × height_cm − 5 × kor + 5
nő:     BMR = 10 × weight_kg + 6.25 × height_cm − 5 × kor − 161
```
(`kor` = a korsáv számítási értéke, S3 táblázat.)

**2. Aktivitási szorzó (additív):** `szorzó = 1.2 + daily_move_adj + steps_adj + training_adj`

| Komponens | Korrekciók |
|---|---|
| `daily_move` | desk +0.00 · mixed +0.05 · active +0.10 |
| `steps_now` | lt4k +0.00 · 4_7k +0.05 · 7_10k +0.10 · 10k_plus +0.15 |
| `training_now` | none +0.00 · sometimes +0.05 · regular +0.12 |

Elméleti maximum 1,57 — külön felső korlát nem kell.

**3. Szinten tartó (kerekítetlen):** `maintenance_raw = BMR × szorzó`

**4. Cél-kalória (kerekítetlen):**

| `goal` | Képlet |
|---|---|
| `fat_loss` | maintenance_raw × 0.85 |
| `tone` | maintenance_raw × 0.93 |
| `strength` | maintenance_raw × 1.08 |
| `posture_energy`, `restart` | maintenance_raw × 1.00 |

**Felülírási szabály:** ha `goal = fat_loss` ÉS `target_weight_kg >= weight_kg` → a szorzó ×1.00, és az ütem-mondat helyett: „A megadott célod alapján nem fogyásra, hanem szinten tartásra állítottuk a kalóriád — a hangsúly nálad a formálódáson lesz."

**5. Biztonsági alsó korlát:** nő 1 200 · férfi 1 500 kcal. Két ág:
- **(a)** `goal_raw < korlát` DE `maintenance_raw > korlát` → `goal_raw = korlát` + korlát-copy: „A célodhoz nem kell ennél kevesebbet enned — a hangsúly nálad a mozgáson lesz."
- **(b)** `maintenance_raw <= korlát` (nagyon kis testalkat) → `goal_raw = maintenance_raw` (NINCS deficit) + ugyanez a korlát-copy. *(Enélkül a cél-kalória magasabb lenne a szinten tartónál — fogyás-célnál értelmetlen. Gépi edge-teszt tárta fel.)*
- Mindkét ágban: az ütem-mondat és a kontrollpont-sor NEM jelenik meg.

**6. Megjelenítés:** `maintenance_kcal = round50(maintenance_raw)`, `goal_kcal = round50(goal_raw)`, mindkettő „kb." előtaggal.

**7. Fogyási ütem (csak `fat_loss`, dinamikusan — fix szám TILOS):**
```
weekly_loss_kg = (maintenance_raw − goal_raw) × 7 / 7700     // 7700 kcal ≈ 1 kg zsír
megjelenítés 0,05-re kerekítve, „kb." előtaggal
```
Copy: „Ezzel az értékkel heti kb. {weekly_loss_kg} kg a reális, fenntartható ütem." Ha van érvényes cél-testsúly (`target < weight`): opcionális kontrollpont-sor: „Az első kontrollpont: 4 hét múlva kb. −{round1(4 × weekly_loss_kg)} kg." Hosszú távú végdátumot NEM ígérünk.

## 5.2 O3 — Napi lépéscél

**Cél-sávok:**

| `goal` | Min | Max |
|---|---|---|
| `fat_loss` | 8 000 | 10 000 |
| `tone` | 7 000 | 9 000 |
| `strength` | 6 000 | 8 000 |
| `posture_energy` | 7 000 | 9 000 |
| `restart` | 6 000 | 8 000 |

**Számítás:**
```
ha steps_mid >= goal_max:
    target = round500(steps_mid); already_walker = true
különben:
    target = round500( clamp(steps_mid + 2000, goal_min, goal_max) )
```

**Megjelenítési ág (pontosan egy fut le, ebben a sorrendben):**

| Feltétel | Copy |
|---|---|
| `already_walker` | „A lépéseid már most rendben vannak ({target}) — tartsd, a többit bízd a programodra. 👏" |
| `target − steps_mid >= 4000` | „Végcélod: {target}. De ne egyszerre — az első két hétben célozd meg a {round500(steps_mid + 2000)}-t (ez kb. egy 20 perces séta pluszban), onnan emelünk." |
| `target − steps_mid >= 2000` | „Ne egyszerre — az első héten csak +1 000 lépést tegyél hozzá (kb. egy 10 perces séta), utána emelj {target}-ig." |
| egyébként | „Ez kb. egy plusz rövid séta naponta — simán benne van." |

## 5.3 O2 — Program-ajánló

**Architektúra:** a katalógus (6. fejezet) konfigurációként él, `active` flag-gel; a mapping csak aktív programot ajánlhat, minden ág fallback-kel. Program élesítése = flag átállítása, kódmódosítás nélkül.

**Döntési sorrend (először illeszkedő szabály nyer):**
```
1. ÉLETHELYZET (felülír mindent):
   life_stage == postpartum   → P_ANYA [most inaktív] ⇒ P_ELSO_LEPES, kíméletes
                                 copy-móddal + orvosi jóváhagyás-ajánlással
   life_stage == menopause ÉS goal ∈ {strength, tone, fat_loss}
                              → P_VALTOZOKOR [most inaktív] ⇒ tovább a 2–3. szabályra
                                 (a menopause flag a copy-t hangolja, 7. fejezet R3)

2. SZUPER-KEZDŐ:
   training_now == none VAGY goal == restart → P_ELSO_LEPES · next_step: P_START

3. CÉL-ALAPÚ ÁG (training_now ∈ {sometimes, regular}):
   goal == fat_loss           → P_START
   goal == tone               → P_START
   goal == strength, male     → P_OTTHONI_ERO [most inaktív] ⇒ P_START (erő-hangsúlyú copy)
   goal == strength, female   → P_START (erő-hangsúlyú copy)
   goal == posture_energy     → P_IROASZTAL [most inaktív, desk-ág] ⇒ P_TARTAS
```

**Bónusz mini-program (első találat nyer):**
```
1. obstacle == no_motivation                → B_NAPINDITO
2. goal == restart                          → B_NAPZARO
3. goal ∈ {fat_loss, tone}, sex == female   → B_LAB_FENEK
4. goal ∈ {fat_loss, tone}, sex == male     → B_HAS_TORZS
5. goal == strength                         → B_HAS_TORZS
6. goal == posture_energy                   → B_NAPINDITO
```

**Időkeret-illesztés:** a `session_min` nem választ programot, a copy-t hangolja: ha a program tipikus edzéshossza meghaladja a kitöltő keretét, a leírásba bekerül: „Az edzések rövidíthetők — az első hetekben a rövidebb verzió is teljes értékű."

---

# 6. Program-katalógus konfiguráció

**Forrás-hierarchia:** a kész-státusz forrása a megrendelői közlés (2026-08-19): kész a Foundation F001–F020 (= Lexfit Start első 4 hete) és a lenti `active:true` mini-programok. Egy Notion-oldal léte NEM jelent kész programot. **Élesítés előtt a csapat a teljes listát véglegesíti.**

```json
{
  "programs": [
    {"code": "P_ELSO_LEPES", "name": "7 napos Első Lépés", "active": true,
     "length": "7 nap · 8–10 perc/nap", "next_step": "P_START",
     "pitch": "Szuper-kezdő program: semmi ugrás, semmi bonyolult — a cél, hogy 7 napból 7-et teljesíts. A szokás megszületése maga a győzelem."},

    {"code": "P_START", "name": "Lexfit Start", "active": true,
     "length": "az első 4 heted már vár", "next_step": null,
     "pitch": "A fő programunk: barátságos stílus, valódi fejlődési ívvel — erősödsz és formálódsz otthon, a saját tempódban.",
     "note_dev": "F001–F020 kész (4 hét). A copy SEHOL nem ígérhet 8 hetet, amíg az F021–F040 nem él. Élesítéskor: length → '8 hét'."},

    {"code": "P_TARTAS", "name": "A görnyedés vége — 4 hetes Tartásjavító", "active": true,
     "length": "4 hét", "next_step": "P_START",
     "pitch": "Study-alapú tartásjavító — a görnyedés fő ellenszereire építve, ülő életmód mellé tervezve."},

    {"code": "P_ELINDULOK",   "name": "Lexfit Elindulok — 2 hetes belépő",       "active": false, "next_step": "P_START"},
    {"code": "P_OTTHONI_ERO", "name": "Lexfit Otthoni erő — 6 hetes erőprogram", "active": false, "fallback": "P_START"},
    {"code": "P_VALTOZOKOR",  "name": "Lexfit Változókor-erő — 6 hetes program", "active": false, "fallback": "cél-alapú ág"},
    {"code": "P_IROASZTAL",   "name": "Lexfit Íróasztal-ellenszer — 4 hét",      "active": false, "fallback": "P_TARTAS"},
    {"code": "P_ANYA",        "name": "Lexfit Anya-újrakezdés — 4 hét",          "active": false, "fallback": "P_ELSO_LEPES",
     "note_dev": "Élesítéskor kötelező disclaimer: 'Szülés után az újrakezdés előtt kérd ki orvosod véleményét.' Addig a postpartum-ág az Első Lépést ajánlja ugyanezzel a disclaimerrel."}
  ],
  "bonus_programs": [
    {"code": "B_LAB_FENEK", "name": "5 napos Láb & Fenék-Challenge", "active": true},
    {"code": "B_HAS_TORZS", "name": "5 napos Has & Mély Törzs",      "active": true},
    {"code": "B_NAPINDITO", "name": "Napindító — 3 reggeli rutin",   "active": true},
    {"code": "B_NAPZARO",   "name": "Napzáró — 3 esti rutin",        "active": true},
    {"code": "B_HAS_7",     "name": "Lexfit 7 napos Has-kihívás",    "active": false,
     "note_dev": "NEM KÉSZ. Élesítésekor a bónusz-szabályok 4–5. sora átállítható erre."}
  ]
}
```

---

# 7. Eredményoldal (S15)

Íve: **szám → tükör → terv → cselekvés.** Egy görgethető oldal, öt modul.

**R0 — Nyitósor:** „Kész a terved, **{first_name}**! Íme, mit mutatnak a válaszaid:" *(Fallback, kizárólag ha a first_name konfigurációval opcionálisra kerül és üres: „Kész a terved! Íme, mit mutatnak a válaszaid:")*

**R1 — A kalóriáid (O1):** két szám, nyíllal összekötve:
- „Szinten tartó kalóriád: **kb. {maintenance_kcal} kcal/nap**"
- „A célodhoz ajánlott: **kb. {goal_kcal} kcal/nap**"
- Cél szerinti egysoros: `fat_loss` → dinamikus ütem-mondat (5.1/7) · `tone` → „Enyhe deficit — a feszesedéshez pont ennyi kell." · `strength` → „Enyhe többlet — ebből épül az izom." · `posture_energy`/`restart` → „Nem kell kevesebbet enned — a hangsúly nálad a mozgáson lesz."
- Ha az alsó korlát vagy a felülírási szabály lépett életbe: a hozzá tartozó copy jelenik meg az ütem-mondat HELYETT.
- Apró betű: „Becslés a megadott adataid alapján — iránymutatásnak tökéletes, nem kell grammra követni."

**R2 — Hol állsz? (motivációs tükör):** egyszerű vizuális sáv/skála a kitöltő pozíciójával, a `training_now` szerinti copy-val:
- `none`: „A magyar felnőttek 59%-a szabadidejében egyáltalán nem sportol. Azzal, hogy idáig eljutottál, már többet tettél, mint a többség — és a terved pontosan nulláról indul."
- `sometimes`: „Csak minden 6. magyar teljesíti a WHO mozgásajánlását. Te már félúton vagy — a terved abban segít, hogy a rendszeresség is meglegyen."
- `regular`: „A rendszeresen mozgók a magyar felnőttek kisebbségében vannak — te köztük vagy. A terved abban segít, hogy a következő szintre lépj."
- Forrásmegjelölés apró betűvel: „Forrás: KSH ELEF 2019"

**R3 — A te LexFit programod (O2):**
- Fő program: `name` + `length` + `pitch` + az akadályra reflektáló mondat:
  - `no_time`: „…és minden edzés belefér {session_min} percbe."
  - `no_motivation`: „…változatos, rövid blokkokkal, hogy ne unj rá."
  - `dont_know_how`: „…lépésről lépésre, videós vezetéssel — sosem kell kitalálnod, mi jön."
  - `gave_up`: „…fokozatos terheléssel, hogy ezúttal ne égj ki az elején."
  - `bad_experience`: „…otthon, a saját tempódban. Senki nem néz, senki nem értékel."
- Élethelyzet-hangolás: `postpartum` → „kíméletes, szülés utáni testre figyelő tempóban" + orvosi jóváhagyás-ajánlás · `menopause` → „az erős izomzat 45 felett a legjobb befektetés — a program erre külön figyel".
- Ha a program `next_step`-je AKTÍV: „És ha megvan? Utána rád vár: {next_step.name} — a fejlődésed következő lépcsője." Különben a blokk elmarad.
- Bónusz: „🎁 Hozzá ajándékba: {bonus.name}"

**R4 — Napi lépéscélod (O3):** „Napi lépéscélod: **{target}**" + jelenlegi szint visszatükrözése („most kb. {steps_mid}-nál jársz") + az 5.2 megjelenítési ág copy-ja. Vizuális: sáv jelenlegi → cél.

**R5 — CTA blokk:**
- Motivációs zárósor: „A tervedet megcsináltuk. A többihez ott leszünk minden edzésnél — neked már csak el kell kezdeni. 💪"
- Fő CTA: „Kezdem a programom — ingyenes próbával" → regisztráció, adatátadással (8.4).
- Másodlagos link: „Előbb körbenéznék" → landing.
- Apró betű: „A kvíz eredménye tájékoztató jellegű, nem minősül orvosi tanácsnak. Ha krónikus betegséged van, edzés előtt konzultálj orvosoddal." + ha `postpartum`: „Szülés után az újrakezdés előtt kérd ki orvosod véleményét."

---

# 8. Backend és integráció

## 8.1 Architektúra-áttekintés

```
[Kliens SPA: kérdések + számítás + eredmény]
        │  (S14 submit)
        ▼
[POST /api/quiz-lead] ── validál, ment ──▶ [DB: quiz_leads tábla]
        │                                        │
        │ (aszinkron, sorból/retry-jal)          │ (törlési folyamat, 10. fej.)
        ▼                                        
[E-mail rendszer API: MailerLite v. ActiveCampaign]
   subscriber upsert + custom fieldek + tagek → automatizmusok (12. fej.)
```

- **Minden számítás (5. fejezet) kliensoldalon fut** — az eredmény azonnali, a szerver nem számol újra a megjelenítéshez. A szerver a beérkező `computed` blokkot **újraszámolja és validálja** mentés előtt (manipulált kliens-adat kiszűrése): ha az eltérés bármely számnál > 1 kerekítési egység, a szerveroldali érték mentődik.
- **Szerverre adat kizárólag az S14 sikeres submitjával kerül.** Előtte minden kliensoldalon él.

## 8.2 POST /api/quiz-lead

**Request body (a teljes lead payload):**
```json
{
  "first_name": "Anna",
  "email": "anna@pelda.hu",
  "consent_health": true,
  "consent_marketing": true,
  "consent_policy_version": "2026-08-01",
  "quiz_version": "3.0",
  "answers": {
    "goal": "fat_loss", "sex": "female", "age_band": "30_39",
    "height_cm": 168, "weight_kg": 78, "target_weight_kg": 68,
    "daily_move": "desk", "steps_now": "4_7k", "training_now": "none",
    "life_stage": "none", "session_min": "10_15", "obstacle": "no_time"
  },
  "computed": {
    "maintenance_kcal": 1850, "goal_kcal": 1600,
    "activity_multiplier": 1.25, "weekly_loss_kg": 0.25,
    "steps_now_mid": 5500, "steps_target": 8000, "steps_two_stage": false,
    "program_code": "P_ELSO_LEPES", "program_primary": "P_ELSO_LEPES",
    "program_rule": "super_beginner", "program_fallback_used": false,
    "bonus_code": "B_LAB_FENEK", "next_step_code": "P_START"
  },
  "utm": {"source": "", "medium": "", "campaign": "", "content": "", "term": ""},
  "hp_field": ""
}
```

**Szerveroldali kötelező lépések, sorrendben:**
1. **Spam-védelem:** `hp_field` honeypot (ha nem üres → 200 OK válasz, de eldobás); rate limit IP-nként (pl. 10 submit / 10 perc).
2. **Validáció:** minden mező a 4. fejezet szabályai szerint (enum-értékek, tartományok, e-mail formátum, consent_health = true). Hibánál 422 + mezőnkénti hibaüzenet.
3. **Újraszámolás:** a `computed` blokk szerveroldali újraszámítása az 5. fejezet szerint; eltérésnél a szerveroldali érték nyer.
4. **Idempotens mentés:** upsert `email` kulcsra. Ismételt kitöltésnél a korábbi válaszok felülíródnak, a lead `quiz_retake` jelölést kap, az eredeti `created_at` megmarad.
5. **Consent-napló:** `consent_timestamp` (szerveridő) + `consent_policy_version` (az adatkezelési tájékoztató aktuális verziója — a kliens a build-be égetett verziót küldi) mentése.
6. **Válasz:** `201 { "lead_id": "...", "handoff_token": "..." }` (a handoff_token a 8.4-hez).

## 8.3 Továbbítás az e-mail rendszerbe

- **Aszinkron**, üzenetsorból vagy háttérjobból — az e-mail API hibája nem blokkolhatja a felhasználói választ.
- **Retry:** exponenciális visszavárakozás (pl. 1, 5, 25 perc, max 5 kísérlet); végleges hibánál riasztás (log + admin e-mail).
- **Művelet:** subscriber upsert e-mail alapján; MINDEN `answers` és `computed` mező custom fieldként; tagek: `quiz_lead`, `goal:{goal}`, `obstacle:{obstacle}`, `program:{program_code}`, ha releváns: `quiz_retake`, `fallback_used`.
- `consent_marketing = false` → a subscriber „tranzakciós" csoportba kerül: KIZÁRÓLAG az E1 megy ki neki, marketing-automatizmusba nem kerülhet be.
- Az E1 (eredmény-e-mail) küldését az e-mail rendszer automatizmusa triggereli a `quiz_lead` tag létrejöttére — azonnal.
- **API-kulcsok:** kizárólag szerveroldali környezeti változóban. A kliens SOHA nem hív közvetlenül e-mail API-t.

## 8.4 Átadás a lexfit.hu regisztrációnak (lead → előfizető)

- Az R5 CTA a regisztrációs oldalra visz: `lexfit.hu/regisztracio?ht={handoff_token}`
- A `handoff_token` rövid életű (30 perc), egyszer használatos, szerveroldalon a lead_id-hoz kötött véletlen token.
- A regisztrációs oldal a tokennel lekéri (`GET /api/quiz-handoff/{token}`) a lead adatait: first_name, email (előtöltéshez), program_code, goal_kcal, steps_target — így a felhasználónak semmit nem kell újra megadnia, és regisztráció után **azonnal a neki ajánlott programnál landol**.
- **TILOS** az egészségügyi jellegű adatokat (testsúly, magasság, kalória, life_stage) URL-paraméterben átadni — minden adat a tokenen keresztül, szerveroldalról jön.
- Lejárt/érvénytelen token esetén a regisztráció normál (üres) módban indul, hibaüzenet nélkül.
- Sikeres regisztrációnál a lead `converted` jelölést kap (dátummal) — ez zárja a funnel-mérést.

## 8.5 quiz_leads tábla (minimum séma)

| Mező | Típus | Megjegyzés |
|---|---|---|
| id | uuid PK | |
| email | text, unique index | upsert-kulcs |
| first_name | text | |
| consent_health / consent_marketing | bool | |
| consent_timestamp | timestamptz | szerveridő |
| consent_policy_version | text | |
| answers | jsonb | a teljes answers blokk |
| computed | jsonb | szerveroldalon validált értékek |
| utm | jsonb | |
| quiz_version | text | |
| retake_count | int, default 0 | |
| converted_at | timestamptz, nullable | 8.4 |
| created_at / updated_at | timestamptz | |
| deleted_at | timestamptz, nullable | soft delete a törlési folyamathoz (10. fej.) |

---

# 9. Analytics

Minden esemény GA4 + Meta Pixel (és ha van, szerveroldali CAPI):

| Esemény | Mikor | Paraméterek |
|---|---|---|
| `quiz_start` | S0 CTA kattintás | utm |
| `quiz_step` | minden kérdés megválaszolásakor | `step_id`, `answer` |
| `quiz_email_view` | S14 megjelenés | — |
| `quiz_lead` | S14 sikeres submit | `program_code`, `program_fallback_used`, `goal` |
| `quiz_result_view` | S15 megjelenés | `program_code` |
| `quiz_cta_click` | S15 fő CTA | `program_code`, `program_fallback_used` |
| `quiz_converted` | sikeres regisztráció (8.4) | `program_code` |

- Képernyőnkénti drop-off a `quiz_step` eseményekből; S14-elhagyás = `quiz_email_view` vs. `quiz_lead` hányados.
- A `program_primary`/`program_fallback_used` adat pár hét után megmutatja, melyik még nem élő programra van a legnagyobb kereslet — ez adja a következő program-launch prioritását.

---

# 10. GDPR / jogi követelmények (fejlesztést érintő rész)

1. **Két külön checkbox** az S14-en, alapértelmezetten üresen — nem összevonható, nem előre pipálható. A testadatok, mozgási szokások, life_stage **egészségügyi jellegű (GDPR 9. cikk) adatok**: kezelésük kizárólag a kifejezett `consent_health` hozzájárulással.
2. **Adatkezelési tájékoztató link** az S14-en és a láblécben. A tájékoztató egyedi, magyar nyelvű (nem sablon) — elkészítése jogi feladat, a fejlesztő a linket és a `consent_policy_version` verziókövetést biztosítja. **A kvíz enélkül nem mehet élesbe.**
3. **Hozzájárulás-napló:** consent_timestamp + policy_version minden leadnél (8.2/5).
4. **Szerveroldali mentés csak S14 után** (3. fejezet + 8.1).
5. **Törlés és leiratkozás:** minden marketing e-mailben leiratkozó link (e-mail rendszer natívan adja). Törlési kérelemnél: quiz_leads sor törlése/anonimizálása (deleted_at + személyes mezők nullázása) ÉS a subscriber törlése az e-mail rendszerből — dokumentált, legfeljebb 30 napos folyamat.
6. **Adatminimalizálás az átadásnál:** egészségügyi adat URL-ben soha (8.4).

---

# 11. Kiegészítő viselkedési szabályok

## 11.1 Edge case-ek
- **Ismételt kitöltés:** upsert + `quiz_retake` tag (8.2/4).
- **60+ korsáv:** a copy sehol nem tartalmaz kor-alapú riogatást; `beginner`-jellegű kitöltőnél (`training_now = none`) + `50_59`/`60_plus` korsávnál a programleírásban megjelenik az „ízületkímélő" jelző.
- **Vissza-lépés bárhonnan:** válaszok megőrzésével; feltételes képernyők újraértékelése, ha a feltételt adó válasz megváltozik (pl. goal átállítása fat_loss-ról → a target_weight_kg törlődik a state-ből és a payloadból: `null`).
- **Offline/hálózati hiba az S14 submitnál:** a gomb visszaáll, a beírt adatok megmaradnak, hibaüzenet: „Hoppá, nem sikerült elküldeni — ellenőrizd a netkapcsolatod, és próbáld újra."

## 11.2 Drop-off-őrszem (first_name)
Ha az S14-elhagyás tartósan > 15%, a `first_name` mező `required` flag-je konfigurációból opcionálisra állítható; ilyenkor az R0 és az e-mail-megszólítás automatikusan név nélküli változatra vált.

## 11.3 A/B teszt jelöltek (2. fázis — NEM az 1.0 scope-ja)
(1) gender-split funnel külön copy-val; (2) S14 pozíció tesztje; (3) interstitial-variánsok.

---

# 12. Follow-up e-mail szekvencia (logika)

Trigger: `quiz_lead` tag. `consent_marketing = true` → teljes szekvencia; `false` → csak E1.

| # | Időzítés | Tartalom | Szegmentálás |
|---|---|---|---|
| E1 | azonnal | Eredmény-összefoglaló: kalória-cél, programnév, lépéscél + CTA (handoff-link) | — (tranzakciós) |
| E2 | +1–2 nap | Az akadályra szabott tartalom (5 változat az `obstacle` tag szerint) | obstacle |
| E3 | +3 nap | Magyar sikersztori / social proof + a platform bemutatása | goal |
| E4 | +5–7 nap | Ajánlat: ingyenes próba / kedvezményes első hónap, határidővel | — |
| E5 | +10 nap | Kifogáskezelés + garancia | obstacle |
| E6 | +14 nap | Utolsó emlékeztető az ajánlatra | — |
| W1 | +30/60 nap | Win-back a nem konvertálóknak | `converted` tag nélküliek |

Minden e-mail nyitósora: „Szia {first_name}!" · Az e-mail sablonok szövege külön (marketing) feladat — a szekvencia-logika és a triggerek a fejlesztés része.

---

# 13. Élesítési checklist

**Fejlesztés (ebből a dokumentumból):**
- [ ] Kliens SPA: S0–S15, 3. fejezet UI-szabályaival
- [ ] Számítási modul az 5. fejezet szerint (kliens + szerveroldali újraszámolás)
- [ ] Program-katalógus konfigurációból (6. fejezet)
- [ ] POST /api/quiz-lead + quiz_leads tábla + e-mail-rendszer integráció retry-jal (8. fejezet)
- [ ] Handoff-token folyamat a regisztrációba (8.4)
- [ ] Analytics események (9. fejezet)
- [ ] T1–T11 automatizált unit tesztként zöld (14. fejezet) — **átvételi feltétel**

**Nem fejlesztői, de blokkoló függőségek:**
- [ ] Adatkezelési tájékoztató (jogász) — élesítés előfeltétele
- [ ] E-mail sablonok szövege (E1–E6, W1) — marketing
- [ ] Program-katalógus `active` flag-jeinek véglegesítése a launch napjára — csapat
- [ ] GA4 + Meta Pixel/CAPI hozzáférések, UTM-konvenció — marketing
- [ ] Design/UI-terv — **ez az egyetlen nyitott fejlesztési munka: minden más viselkedés ebben a dokumentumban specifikált**

---

# 14. Tesztesetek (gépileg ellenőrzött — átvételi teszt)

| # | Bemenet | Elvárt kimenet |
|---|---|---|
| T1 | nő, 30_39 (35 év), 168 cm, 78 kg, desk, 4_7k, training=none, goal=fat_loss, target=68 | BMR = 780+1050−175−161 = **1494** · szorzó 1,25 · maintenance_raw 1867,5 → **kb. 1 850** · goal_raw 1587,4 → **kb. 1 600** · weekly_loss **kb. 0,25 kg/hét** · program: **P_ELSO_LEPES** (szuper-kezdő), next: P_START · bónusz: B_LAB_FENEK · lépés: 5500+2000=7500 → clamp(8000,10000) = **8 000**, gap 2500 → „+1 000 első héten" ág |
| T2 | férfi, 40_49 (45 év), 182 cm, 95 kg, mixed, 7_10k, training=regular, goal=strength | BMR = 950+1137,5−225+5 = **1867,5** · szorzó 1,47 · maintenance 2745,2 → **kb. 2 750** · goal 2964,8 → **kb. 2 950** · program: P_OTTHONI_ERO inaktív ⇒ **P_START** (erő-copy, fallback_used) · bónusz: B_HAS_TORZS · lépés: 8500 ≥ 8000 → **already_walker, 8 500** |
| T3 | nő, 50_59, 165 cm, 70 kg, desk, lt4k, training=sometimes, life_stage=menopause, goal=tone | menopause-szabály illeszkedik → P_VALTOZOKOR inaktív ⇒ **P_START** + menopause-copy · payload: rule="life_stage", primary="P_VALTOZOKOR", code="P_START", fallback_used=true · bónusz: B_LAB_FENEK · lépés: 5000 → clamp = **7 000**, gap 4000 → **kétlépcsős**: első cél 5 000 |
| T4 | nő, 30_39, life_stage=postpartum, goal=fat_loss, training=sometimes | P_ANYA inaktív ⇒ **P_ELSO_LEPES** kíméletes copy + orvosi jóváhagyás-ajánlás (rule="life_stage", fallback_used=true) |
| T5 | férfi, 18_29, active, 10k_plus, training=regular, goal=posture_energy | szorzó **1,57** · program: **P_TARTAS** · bónusz: B_NAPINDITO · lépés: 11000 ≥ 9000 → already_walker, **11 000** |
| T6 | nő, 60_plus (63 év), 158 cm, 48 kg, desk, lt4k, none, goal=fat_loss | BMR 991,5 · maintenance_raw 1189,8 → kb. 1 200 · goal_raw 1011,3 < korlát, ÉS maintenance < korlát → **(b) ág: goal = maintenance, mindkét szám kb. 1 200** + korlát-copy · Q9 (S10) kimarad → life_stage=none |
| T7 | Konfig-teszt: T2 bemenet, `P_OTTHONI_ERO.active = true` | program: **P_OTTHONI_ERO** (fallback_used=false) — flag-átállítás önmagában átirányít, kódmódosítás nélkül |
| T8 | Valóság-szabály: bármely bemenet | `program_code`, `bonus_code`, `next_step_code` KIZÁRÓLAG aktív program lehet (`program_primary` mutathat inaktívra); next_step-blokk inaktív célpontnál nem renderelődik |
| T9 | nő, 30_39, 168 cm, 65 kg, goal=fat_loss, **target=68 (≥ jelenlegi)** | felülírási szabály: goal = maintenance (×1,00) · szinten tartó copy, ütem-mondat és kontrollpont NEM · a két szám azonos |
| T10 | S14 validáció | „ anna " → „Anna" (trim+nagybetű) · „A" → hiba · „Anna2" → hiba · „Áron-Béla" → érvényes · CTA csak a 3 feltétel együttes teljesülésekor aktív |
| T11 | Korlát-paradoxon: nő, 60_plus, 145 cm, 40 kg, desk, lt4k, none, goal=fat_loss, target=38 | BMR 830,25 · maintenance_raw 996,3 → **kb. 1 000** · korlát (1 200) > szinten tartó → **(b) ág: goal = maintenance, mindkét szám kb. 1 000** + korlát-copy · TILOS: cél-kalória > szinten tartó fogyás-célnál |

## 14.1 Audit-melléklet — gépi ellenőrzés jegyzőkönyve

A számítási és döntési logika referencia-implementációként leprogramozásra került; hibátlanul futott le:
- **mind a 11 teszteset** — a dokumentum minden száma a futtatás kimenetével egyezik;
- **mind a 75 program-ág-kombináció** (nem × cél × edzés-szint × élethelyzet): minden ág aktív programra fut, minden lead kap bónuszt;
- **mind a 20 cél×lépéssáv-kombináció**: mind a négy megjelenítési ág elérhető, ellentmondás nincs;
- **szélsőérték-tesztek**: a kalória-korlát paradoxon (T11) és a kerekítési felezőpont platformfüggősége feltárva és a specifikációban rögzítve.

**Átvételi követelmény:** az implementáció akkor kész, ha a T1–T11 automatizált unit tesztként megvalósul és zöld — a 14. fejezet táblázata közvetlenül teszt-assertökké fordítható.
