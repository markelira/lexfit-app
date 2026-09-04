# LEXFIT — Offer v3 · Site Restructure & 38-Problem Mitigation (Claude Code handoff)

**Date:** 2026-09-04 · Supersedes offer_v2 §4–5 (pricing/product facts) — everything else in v2 (problem inventory logic, internal value math, voice rules) still applies.
**Repo ground truth:** `markelira/lexfit-app` (Next.js App Router + Firebase + Stripe). Landing = `src/components/landing/LandingPage.tsx` (sections `#hogyan #programok #valos #heted #kihivasok #gyik #alexa #elofizetes`). Onboarding = `src/app/onboarding/OnboardingV2.tsx` (steps `welcome → goal → focus → level → days → time → env → obstacle → why → reveal → plan → account → pay`, embedded pay-to-join). Pricing SoT = `src/lib/pricing/config.ts` (`week_intro 490 · week_std 1990 · month_std 5990 · annual_std 39900`) — **amounts unchanged**.

---

## 0. Decisions locked (this round)

| Topic | Decision |
|---|---|
| Start program | **30 edzés**, weeks not fixed — user picks heti 2/3/4 at `days` step; copy: „a te tempódban" |
| Guarantee | **10 edzés garancia**: first 10 workouts within **5 weeks** (2/week at the lowest cadence ⇒ achievable at every setting); gentle variants count; refund = **all membership fees paid to date**; 14-day elállás separate |
| Milestones | 1 · 5 · **10 (garancia met)** · **15 (félidő, re-measure)** · **30 (záró visszamérés)**; Alexa messages at 5 and 15 |
| Access model | **(a) all-access**: every plan includes everything; differentiation = the guided Start journey + guarantee + milestones + **weekly drops: 5 új kihívás-videó / hét + új programok** |
| Kihívás archívum | stays (16 hét, growing weekly) |
| Pricing | subscription ladder as in config: Heti **490 első hét → 1 990/hét** · Havi **5 990** · Éves **39 900**; presentation strategy changes, amounts don't |
| Urgency | **no end date**; „Szeptemberi Újrakezdés" = soft seasonal framing only — never a fake deadline. (Risk accepted: guarantee + milestones + pre-renewal email carry retention alone.) |
| Launch | live from Sep 6–7 |

Number migrations everywhere (grep list for Claude Code): `40 edzés → 30 edzés` · `10 hét → a te tempódban / heti 2-3-4 nap` · `12 edzés garancia → 10 edzés garancia` · `hat héten belül → öt héten belül` · `12 990 Ft` one-time → remove (subscription only) · `szeptember 30-ig` → remove.

---

## 1. What the offer is now (one paragraph for orientation)

One subscription (three billing rhythms), wrapped for September as **Szeptemberi Újrakezdés**. The hero product inside it is **LEXFIT Start — 30 vezetett edzés a te tempódban**, guarded by the **10 edzés garancia** (money-back on fees paid), surrounded by six named side-programs plus a weekly-growing challenge library, and carried by the forgiveness mechanics (pihenőnap nem tör sorozatot, kihagyott hét nem nulláz, szünet 1–3 hónap). The 38 problems from offer_v2 §2 are mitigated **in place** on the homepage, /arak and onboarding per the surface map below.

---

## 2. The 38-problem mitigation — surface map (implementation table)

Columns: **P#** (numbering identical to offer_v2 §2) · **Surface** (real section/component/step) · **Mitigation** (paste-ready HU where copy; otherwise component change) · **Δ** (edit existing / new).

### 2.1 Homepage (`LandingPage.tsx`)

| P# | Problem | Surface | Mitigation | Δ |
|---|---|---|---|---|
| 3 | „Mit kapok pontosan?" | Hero sub | „30 vezetett edzés a te tempódban, plusz programok minden napszakra — egy tagságban." | edit |
| 9 | „Nincs időm" | Hero chips | chip: „max 30 perc" | edit |
| 8 | „Nincs eszközöm/helyem" | Hero chips | chip: „elég egy matrac" | exists |
| 25 | „Hektikus a hetem" | Hero chips + `WeekPicker` | chip: „heti 2, 3 vagy 4 nap — te választod"; WeekPicker stays the hero interaction | edit |
| 2, 26 | „Már fizettem ilyenre…" / „rossz hét nulláz" | **NEW section `#ismeros`** above `#hogyan` | Ismerős? block (copy: §3.2) + mechanism lines: „A pihenőnap nem töri meg a sorozatot. A kihagyott hét nem nulláz." | new |
| 15, 16 | „Mikor/mivel kezdjem?" | `#hogyan` 3 steps | step copy: „1 · Válaszolsz 7 kérdésre · 2 · Megkapod a heti terved · 3 · Elindítod az elsőt — ma vagy hétfőn, mindegy" | edit |
| 6 | „Teljesen kezdő vagyok" | `#programok` grid | „7 napos kezdő program" card first in grid order | edit |
| 23 | „Este semmi energiám" | `#programok` | „Esti rutinok" card visible without scroll on mobile (grid order 2nd row max) | edit |
| 5, 7 | kor / derék-térd | `#programok` + `#gyik` | Tartásjavító card copy keeps „monitor előtti görnyedés"; FAQ entries below | exists |
| 27 | „Unalom" | `#kihivasok` | headline add: „Minden héten 5 új kihívás-videó." + weekly-drop badge on section | edit |
| 24, 31 | „Nem látom a haladást" | `#heted` (milestones/Journey) | Journey GROUP stays; add milestone strip „1 · 5 · 10 · 15 · 30" with garancia flag at 10, visszamérés at 15/30 | edit |
| 4 | „Férfiaknak is?" | `#valos` (finish cards) | at least 1 of the real cards shown = male member; alt text says so | edit |
| 29 | „Egyedül csinálom" | `FbGroupCard` | keep; sub-line: „1 200+ tag — kérdezni is van kitől" | exists |
| 10 | hype-averzió | `#alexa` | pull-quote stays; add line: „Nem ígérek csodát. Egy rendszert ígérek, ami kibírja az életet." | edit |
| 2, 30, 11, 12 | guarantee cluster | **NEW block `#garancia`** between `#alexa` and `#elofizetes` | full guarantee block (copy §3.3) + „bármikor lemondható egy kattintással" + Stripe/e-számla trust line | new |
| 1, 36 | „YouTube ingyen van" / „megéri?" | `#elofizetes` intro line | „A videó ingyen is megvan. A sorrend, a terv és a vezetés — az a tagság. Egy edzőóra ára ≈ egy hónap LEXFIT." | new |
| 13, 14 | halogatás | `#elofizetes` footer line | „Nem kell ma biztosnak lenned: az első 10 edzésre garancia van, és bármikor lemondhatod." | new |
| 34 | „10 hétből 14 lett" | `#gyik` | FAQ: „Nálunk nincs lemaradás — a program a te tempódban halad, és megvár." | new |
| 37, 38 | szünet / visszatérés | `#gyik` | FAQ entries (§3.4) | new |
| 19 | TV | `#gyik` | exists (keep) | exists |

Section order after change: Hero → `#ismeros` → `#hogyan` → `#programok` → `#valos` → `#heted` → `#kihivasok` → `#alexa` → `#garancia` → `#elofizetes` → `#gyik` → footer (elállási gomb link stays in footer). `StickyNav` gains `#garancia`.

### 2.2 Onboarding (`OnboardingV2.tsx` steps)

| P# | Step | Mitigation | Δ |
|---|---|---|---|
| 22, 26 | after `days` | `Whisper` interstitial: „A terved pihenőnapokkal készül. A kihagyott hét nem nulláz." | edit |
| 25 | `days` | option copy: „2 nap · 3 nap · 4 nap · Ahogy jön — legyen rugalmas"; helper: „Bármikor átállíthatod." | edit |
| 7, 17 | `focus`/`obstacle` | care-flag options keep „Térd — ugrálás nélkül / Derék — kímélettel / Csendben kell edzenem"; helper: „Minden gyakorlatnak van könnyített változata — az is teljes értékű." | edit |
| 20 | `env` | option „Nappaliban, mások mellett" → helper: „Van csendes változat." | edit |
| 24 | `reveal` | plan header adds milestone strip 1·5·10·15·30 | edit |
| 3, 15 | `plan` | „Az első edzésed készen áll — ma vagy hétfőn kezded, mindegy." | edit |
| 30, 2 | `pay` (paywall.tsx / EmbeddedPay) | guarantee box **above** the plan selector (copy §3.3 short form); renewal disclosure under each option: „Az első hét 490 Ft, utána 1 990 Ft/hét — a megújulás dátumát a fizetés előtt mutatjuk." | edit |
| 12 | `pay` | trust row: Stripe logo + „e-számla · 14 napos elállás" | edit |
| 11 | `pay` | line under CTA: „Bármikor lemondható egy kattintással — a lemondás nem büntet." | edit |

### 2.3 Handled elsewhere (unchanged from v2)
P18/21 (setup, izomláz) → P0/W1 emails · P28/33 (fellángolás, nehezedés) → app variants + cancel flow · P32 (plató) → 15/30 re-measures · P35–38 partly → W30 email, cancel flow, win-back. Email deltas in §6.

---

## 3. Paste-ready copy blocks (new/changed only)

### 3.1 Hero (final)
> **A változás otthon kezdődik**
> 30 vezetett edzés a te tempódban — heti 2, 3 vagy 4 nap, ahogy az életedbe fér. Max 30 perc, elég egy matrac.
> [7 kérdés, és kész a heted]
> max 30 perc · elég egy matrac · heti 2–4 nap — te választod

### 3.2 `#ismeros` (new section)
> **Ismerős?**
> Hétfőn még megvolt a lendület. Csütörtökön közbejött valami. A jövő héten majd újra — aztán a jövő hétből hónap lett. Nem az akaraterővel van baj: azzal, hogy minden kihagyás után nulláról kell kezdeni.
> **Ezért nálunk két szabály van.** A pihenőnap nem töri meg a sorozatot. A kihagyott hét nem nulláz — ott folytatod, ahol abbahagytad.

### 3.3 `#garancia` block (and short form on `pay`)
> **10 edzés garancia**
> Csináld végig az első 10 edzést öt héten belül — a könnyített változat is számít. Ha utána úgy érzed, ez nem a tiéd, egy e-mail elég, és **visszautaljuk az addig befizetett tagsági díjad**. Nem kérdezünk, nem győzködünk.
> A 14 napos elállási jogod ettől függetlenül megillet. A lemondás bármikor egy kattintás.

Short form (pay step): „**10 edzés garancia** — ha az első 10 edzés után (max 5 hét) úgy érzed, nem a tiéd, visszakapod, amit befizettél."

### 3.4 New FAQ entries (`#gyik`)
> **Mi van, ha kihagyok egy hetet?** Ott folytatod, ahol abbahagytad. A sorozatod nem nullázódik, a program megvár — nálunk nincs „lemaradás".
> **Meddig tart a Start program?** 30 edzés — a te tempódban. Heti 3 nappal nagyjából 10 hét, heti 2-vel több, heti 4-gyel kevesebb. Nem az idő számít, hanem hogy a 30 meglegyen.
> **Hogyan működik a 10 edzés garancia?** Ha az első 10 edzést öt héten belül végigcsinálod, és mégsem érzed a tiédnek, írsz egy e-mailt a hi@lexfit.hu-ra, és visszautaljuk az addig befizetett díjaidat. A könnyített változat is számít.
> **Szüneteltethetem?** Igen, 1–3 hónapra, egy kattintással — a haladásod megmarad.
> **Mi történik, ha hónapokra kimaradok?** Semmi ciki: visszajössz, és ott folytatod. Friss hétfő mindig van.

### 3.5 `#elofizetes` band / `/arak` page — full pricing copy

Banner: **„Szeptemberi Újrakezdés — a szeptemberi kör most indul."** *(no date, no counter)*

Intro line: „Egy tagság, minden benne: a Start program, az összes többi program, és minden héten 5 új kihívás-videó."

**Card 1 — Heti („Kipróbálom")**
> **Heti**
> Az első 7 nap **490 Ft**, utána 1 990 Ft / hét.
> Teljes hozzáférés az első naptól. Automatikusan megújul — a dátumát előre megmutatjuk. Bármikor lemondható.
> [Kezdem 490 Ft-tal]

**Card 2 — Havi (center, badge „Legnépszerűbb")**
> **Havi**
> **5 990 Ft / hónap** — kevesebb, mint egy edzőóra.
> Teljes hozzáférés · 10 edzés garancia · bármikor lemondható, szüneteltethető.
> [Havi tagságot kérek]

**Card 3 — Éves (badge „Legjobb ár")**
> **Éves**
> **39 900 Ft / év** — így 3 325 Ft / hónap (–44%).
> Egy döntés egy évre — pont az, ami az újrakezdésekből hiányzott.
> [Éves tagságot kérek]

Under the cards: „Mindhárom tagságban ugyanaz van: minden program, minden edzés, minden új heti tartalom. Csak a ritmus más." → then `#garancia` short link, „Kinek nem való" block (unchanged from v2), elállási gomb.

**What's included list (all cards share it, render once):** LEXFIT Start (30 vezetett edzés) · Reggeli rutinok (3) · 7 napos kezdő (7) · Has & Mély Törzs (5) · Láb & Fenék (5) · Esti rutinok (3) · Tartásjavító (4 hét) · 16+ heti kihívás — **minden héten 5 új videóval** · mérföldkövek és visszamérés · szünet 1–3 hónap.

---

## 4. `/arak` route (new)

- `src/app/arak/page.tsx`: server component, metadata title „Árak — LEXFIT", renders the **same pricing band component** extracted from `LandingPage.tsx` (`#elofizetes` → refactor into `src/components/landing/PricingBand.tsx`, reused in both places; single copy source). Includes `#garancia` block + FAQ subset (garancia, lemondás, szünet) + elállási gomb.
- Nav/StickyNav gains „Árak" link → `/arak`.
- CTA target on all cards: `/onboarding` (pay-to-join flow) with `?plan=` preselect param read at `pay` step.

## 5. Claude Code implementation checklist

1. `PricingBand.tsx` extraction + copy per §3.5; wire `?plan=` preselect into `EmbeddedPay`/`paywall.tsx`.
2. `LandingPage.tsx`: new `#ismeros` + `#garancia` sections; section order + StickyNav update; hero/chips/`#hogyan`/`#kihivasok` copy edits per §2.1.
3. `OnboardingV2.tsx` + `Whisper`/`StepFrame`: copy edits per §2.2; milestone strip on `reveal`; guarantee + renewal disclosure + trust row on `pay`.
4. Grep-migrate numbers (list in §0) across `src`, `emails/`, seed content.
5. `/arak` route per §4.
6. `refund.ts`: guarantee path = refund of all subscription invoices to date on flag `guarantee_10` (manual trigger from admin ok for v1).
7. Acceptance: every P# in §2.1–2.2 visibly present at its surface; Lighthouse mobile ≥ 90 on `/`; `/arak` indexed; no string „12 990", „40 edzés", „szeptember 30-ig" anywhere.

## 6. Email deltas (apply to lead_magnet_v2 / funnel_v2 copy)

- D6 subject → „**30 edzés, és visszakapod a pénzed, ha nem vált be**"; body: guarantee sentence swaps to 10/5 + „visszautaljuk az addig befizetett tagsági díjad"; price sentence → „Az első hét 490 Ft — utána 1 990 Ft/hét, vagy 5 990 Ft/hó."
- D10 deadline email → **cut** (no deadline exists). WB2 stays (October is a new kör, not a deadline).
- W-series: W12→**W10** („Ez már rendszer" + garancia met), W20→**W15** (félidő), W40→**W30**; M2 miss-path day 42→**day 35** with `<10` check.
- R1 (heti day 5) unchanged — now doubly critical with the 490 intro back: it fires **before** the first 1 990 charge.
