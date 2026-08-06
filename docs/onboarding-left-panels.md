# Step-aware onboarding left column — spec + collected data

The `/register` wizard's left column is currently a static `AuthBrand` (logo · "Egyedül
nehéz / Együtt muszáj" · 3 stats · Alexa foot). Goal: make it **step-aware** — each
question's left panel sells the specific feature that question is about. Frame stays
constant (LEXFIT mark top, Alexa foot bottom); the **middle body swaps per step**,
cross-fading in sync with the right-column step transition.

Architecture: replace `<AuthBrand/>` in `OnboardingV2.tsx` with `<BrandPanel step/>`
(mirrors the existing step-aware `OnbAside`). Reuse `.authx-brand` frame + onbv2.css; green
brand, Poppins.

## RESOLVED DECISIONS (2026-08, from the product owner)
1. **Community number → ~1 200 active** (the real weekly-challenge group, `szm.ts:80` = 1 248).
   NOT 17 000+. ⚠️ Consequence: the existing "17 000+" literals (AuthBrand, reveal `social`,
   landing, OnbAside — 5 places) now conflict with this panel; reconcile them in the copy pass.
2. **Cast-to-TV → wire Remote Playback FIRST.** Prerequisite task before the time panel:
   add real AirPlay/Chromecast via the browser Remote Playback API to `player/[code]/page.tsx`
   (wire the existing inert cast buttons), THEN feature "cast to TV" truthfully.
3. **Panels are STATIC per-step** — no answer-reactivity. Each step = one fixed panel.
4. **Scope: spec approved only** — do not build until the owner reviews copy/gaps.

---

## TRUTH CONSTRAINTS (from research — do not violate)

1. **Cast-to-TV / AirPlay is NOT wired** (`player/[code]/page.tsx` — inert buttons, static
   "AIRPLAY"/"Felirat MAGYAR" labels). Don't claim it works until engineering wires
   Remote Playback. Same for captions.
2. **No rep counts exist.** Player shows exercise **name + timestamp + live countdown**
   ("HÁTRA VAN 00:42") + "Következik: …" up-next + "3 / 12 · FŐ RÉSZ" progress. Sell the
   no-audio benefit as name+countdown+next, never "× 10 reps".
3. **Community numbers:** 17 000+ = broad free FB community (site-confirmed); 1 248 =
   in-app active group model (`szm.ts:80`); 397 votes / ~12 daily ✅. Free community ≠ paid
   app — never imply the app is free (`subscribe/page.tsx`: "A Facebook-közösség ingyenes
   marad — ez az előfizetés a programot nyitja meg").
4. **Core is the thin focus** — F001–F007 have no standalone core day (only sub-blocks).
   fenék & hát/tartás well-covered; kar & teljes moderate. F008–F020 not in repo.

---

## PER-STEP SPEC (left panel per step)

### welcome — Alexa intro (keep)
The current brand hero, or Alexa's "Alexa vagyok. 30 perc, csak egy matrac, és egy közösség
mögötted." Establishes her voice before the questions.

### goal · "Mi hozott ide?" — THE COMMUNITY (belonging)
Answers "what brought you here" with belonging. Show: a faces cluster (SZM `faces`
initials/avatars), the weekly-challenge mechanic **"Pénteken szavazunk. Hétfőn rajt.
Együtt."**, and proof. Number: **~1 200 aktív tag** (the weekly group) + **52 heti kihívás**
done; the 4 vote archetypes (🌱 Gyengéd ébresztő · 🔥 Erősítés · ⚡ Kardió · 🧘 Nyújtás).
Message: you're not starting alone.

### focus · "Hol szeretnél erősödni?" — PROGRAM COVERS EVERY AREA (static)
Show all **6 theme categories** (Alsótest · Felsőtest · Cardio + has · Teljes test ·
Mobility/nyújtás · Tartás-fókusz) — every focus answer maps onto one — with a few concrete
exercises as texture (Csípőemelés · Térdelt evezés · Halott bogár · Guggolás). Message:
"Van edzés arra, ahol erősödni akarsz." (Static — same panel regardless of pick.)

### level · "Hol tartasz most?" — EVERY LEVEL, WITH MODIFICATIONS (static)
Show the 3 levels (🔥 Kezdő · 🔥🔥 Közepes · 🔥🔥🔥 Haladó — all populated). Real hook =
**modifications**: every move has an easier/harder variant (F002: "Fal-fekvőtámasz VAGY
térdelt fekvőtámasz"). Message: "Nem kell megfelelned a szintnek — a szint igazodik hozzád.
Minden mozdulathoz van könnyített és nehezített változat."

### days · "Hány nap fér bele?" — THE WEEKLY RHYTHM (static)  [was: idk]
Show the **weekly split** as a rhythm — H Alsótest · K Felsőtest · Sze pihenő · Cs Cardio+has ·
P Teljes test · Szo Mobility · V pihenő (5 edzés + 2 pihenő), **napi fix 30 perc**. Message:
"Nem kell mindennap. Napi 30 perc a kiválasztott napokon — a pihenő is a terv része. Kevesebb
nap = nyugodtabb tempó, ugyanaz az út." (Ties to the reveal's honest days→pace story.)

### time · "Mikor a legjobb?" — THE PLAYER (follow without audio)
The strongest feature panel. Show a mini player mock: current exercise name (big) + **"HÁTRA
VAN 00:42"** countdown + **"Következik: Guggolás"** + "3 / 12 · FŐ RÉSZ". Message: "Reggel,
délben vagy este — a videó végigvezet. Hang nélkül is: mindig látod, mit csinálsz most, mi jön,
és mennyi van hátra." Also real: 0.75–1.25× tempo, "Folytatás" resume, csak matrac.
**Cast-to-TV: feature it — but only AFTER the Remote Playback prerequisite task wires the
player's cast buttons (decision #2).**

### env · "Van bármi, amire figyeljek?" — A VARIANT FOR EVERY SITUATION (static)
Show the **type tags**: 🔇 Csendes (szomszéd-barát) · 🪑 Falra fogva · térdkímélő · hátkímélő ·
🌅 Reggeli · 🌙 Esti. Message: "Bármi is az — van rá változat. 30+ videó, minden helyzetre."

### obstacle · "Mi állított meg eddig?" — YOU'RE NOT ALONE (static)  [was: idk]
The motivation pivot. Alexa's real, non-judgmental line: **"Nem azért, mert lusta vagy.
Hanem mert egyedül tényleg nehéz."** + belonging (the weekly team). Bridges into her story
next. (No fake testimonials — the site ones are seed data.)

### why · "És miért most?" — ALEXA'S STORY (emotional peak)
Her real arc (from szavazzmagadra.hu + landing `alexaChapters`), with `alexa-av.jpg`:
- **A VERSENYZŐ** — 10 év a szőnyegen (ritmikus gimnasztika 9 évesen → válogatott, Junior EB 6.)
- **A FORDULAT** — 2023 — abbahagytam ("az eddigi legnehezebb döntésem")
- **A FELISMERÉS** — "Egyedül nem megy" (elveszett év, meghízott, 18 hónapig nem állt mérlegre)
- **A KÖZÖSSÉG** — 17 000+ ember
- **AZ ÍGÉRET** — Együtt muszáj
Condense to a photo + 1–2 chapters + the pull quote. Message: she built this because she
lived exactly the drop-off the user just described.

### reveal — THE TEAM PROMISE (trust close)  [was: idk]
Right column shows the personalized plan (ring); left goes to Alexa's signature promise so
they feel they're joining a team, not buying software: **"Nem mondom meg, mit csinálj. / Nem
ítéllek el, ha kimaradsz. / Együtt muszáj." — Alexa** + community proof.

### plan / account / pay — REASSURANCE
Trust panel: 14-napos garancia, "a közösség ingyenes marad — ez az előfizetés a *programot*
nyitja meg", secure checkout. Keeps the free-community/paid-app line honest.

---

## COLLECTED DATA (reference for building)

### Library — 6 theme categories (= body-area coverage)
`Alsótest` · `Felsőtest` · `Cardio + has` · `Teljes test` · `Mobility / nyújtás` ·
`Tartás-fókusz`. ~32 videos. Levels: `🔥 Kezdő` / `🔥🔥 Közepes` / `🔥🔥🔥 Haladó` (all populated).
Type tags: `🔇 Csendes` · `🪑 Falra fogva` · `🧘 Lazító` · `⚡ Intenzív` · `🌅 Reggeli` · `🌙 Esti`.
10 formats (circuit · EMOM · Tabata · AMRAP · Pyramid · Ladder · 50/50 · flow · steady · timed).

### Foundation program
4 hét × 5 edzés = 20 session, fix 30 perc, eszköz nélkül (matrac). 4 phases:
🌱 Alap (Hét 1 · Forma + szokás) → 🔨 Építés (Hét 2 · Variációk + cardio) → 🔥 Elmélyítés
(Hét 3 · Komplexitás + intenzitás) → 🏆 Kifejezés (Hét 4 · Flow-k + záró mérés). Weekly split:
H Alsótest · K Felsőtest · Sze pihenő · Cs Cardio+has · P Teljes test · Szo Mobility · V pihenő.
Fixed ordered queue; fewer days = slower progression.

### Player — real, sellable
Current-exercise name (huge) · countdown "HÁTRA VAN 00:42" · "Következik: X" · "3/12 · FŐ RÉSZ"
progress · tappable timeline "Az edzés menete" / "Mai menü" · click-to-seek by exercise ·
0.75–1.25× tempo · "Folytatás" resume · fullscreen · mute · auto-advance to next session ·
streaks · "csak matrac kell". NOT wired: cast/AirPlay, captions. No rep counts.

### Community (szavazzmagadra.hu + szm.ts)
Free closed FB group. Weekly: Friday → 4 vote options (🌱🔥⚡🧘) → members vote → Mon–Fri
challenge, 10–15 min/day → ✅ check-in ("Egy ✅ is elég"). 52 heti kihívás done. Numbers:
17 000+ (reach), 1 248 (active model), 397 votes, ~12/day ✅. Taglines: "Egyedül nehéz. Együtt
muszáj." · "Szavazz magadra" · "Pénteken szavazunk. Hétfőn rajt. Együtt."

### Alexa story — verbatim quotes (verify vs live site before publishing)
- "9 évesen kezdtem a ritmikus gimnasztikát. Aminek hobbinak kellett volna lennie, az lett az életem."
- "2023 januárjában abbahagytam. Az eddigi legnehezebb döntésem volt."
- "Egy teljes év kellett, hogy összeszedjem magam. Meghíztam. Másfél évig nem álltam mérlegre."
- "Egyedül nem megy. A csapatban, ha volt bajom, volt kinek elmondanom."
- "Nem azért, mert lusta vagy. Hanem mert egyedül tényleg nehéz."
- "Nem fogom megmondani, mit csinálj. Nem fogom megítélni, ha kimaradsz."

### Full exercise inventory by focus (F001–F007)
- **fenék:** Guggolás · Széles guggolás · Hátrafelé kitörés · Mély lunge tartás · Csípőemelés ·
  Csípőemelés pulzussal · Béka csípőemelés · Egylábú csípőemelés · Szamárrúgás (± pulzus)
- **core:** Halott bogár · Térdelt plank (± vállérintés) · Fordított felülés · Madárkutya
- **kar:** Fal-fekvőtámasz · Térdelt fekvőtámasz · Kobra tartás · W tartás · Tricepsz nyújtás
- **tartás:** Térdelt evezés · Superman · Y/T/W-pozíció hason · Reverse fly térdelve · Falra simulás
- **teljes/cardio:** Helyben menetelés · Bokszütés · Lépéses jumping jack · Korcsolyázó lépés

---

## NEXT STEPS (when the owner greenlights the build)
1. **Copy pass** — owner reviews/edits panel copy + fills any gaps; reconcile the "17 000+"
   literals against the ~1 200 decision (see RESOLVED #1).
2. **Prerequisite eng task** — wire Remote Playback (AirPlay/Chromecast) in the player so the
   time panel's cast claim is true (RESOLVED #2).
3. **Build** `<BrandPanel step/>` — 9 static variants in the `.authx-brand` frame, cross-fading
   with the step transition; swap it in for `<AuthBrand/>` in `OnboardingV2.tsx`.
