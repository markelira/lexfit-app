# LEXFIT homepage — copy deck v1

> ## Heading pass — 2026-08-11 (after the reorder)
>
> The reorder moved sections but left every heading doing its **old** job. Four
> changed; nine were already right and were left alone.
>
> | # | Was | Now | Why |
> |---|---|---|---|
> | 1 | A változás otthon kezdődik | *unchanged* | **locked by the owner** |
> | 6 | vidd a nagy képernyőre | **a nappali a legnagyobb képernyőd** | an instruction, not a claim. The best line in the band was buried in the body — promoted, and the duplicate removed. Keeps the `lakás` stutter that catches §5, now where it lands harder. |
> | 11 | Gyakori kérdések | **Mielőtt belevágsz.** | a label, not a claim — the weakest heading on the page. At 11 this band is the last practical hurdle before the close, so the heading says *where you are* and hands to Alexa. |
> | 13 | *(none — wordmark + "Előfizetés")* | **Kezdjük.** | the closing band had no heading at all. "Kezdjük." repeats Alexa's `Kezdjük együtt →` one seam earlier — the stutter technique, used deliberately at the most important seam. |
> | 4 | *(none — the number was a `<div>`)* | number wrapped in `<h3>` | no copy change: the price **is** this band's headline, so it should be in the outline rather than have a heading invented above it. |
>
> **Every band now has a heading element** — was 11 of 13.
>
> **One regression this caused, found by measuring after:** wrapping `.pa-num` in an
> `<h3>` leaked the UA's `font-weight: 700` into the unit span (`/ első hét`), which
> has no 700 face in IBM Plex Mono — so the browser faux-bolded it. Exactly the defect
> fixed earlier the same day. Root cause neutralised on `.pa-num` rather than patched
> on the child.
>
> **Second heading pass (same day, owner-selected from alternatives):**
>
> | # | Was | Now | Why |
> |---|---|---|---|
> | 8 | Te mondod meg, hány nap. | **Három nap is elég.** | the old line hands the reader a *decision*; someone who has abandoned a plan before does not want another decision to get wrong. They want **permission** that the small number is allowed. |
> | 12 | „Tíz évig azt tanultam, hogy abbahagyni árulás." | **„Amikor újrakezdtem, otthon kezdtem."** | closes the loop on the locked hero — *A változás **otthon** kezdődik* (§1) is answered by *otthon kezdtem* at the emotional peak, ~11,000px later. |
>
> **Two things to know about these:**
>
> 1. **The week picker still defaults to 5 days**, so §8's headline says "three is
>    enough" above a picker showing five. That is deliberate: the default mirrors the
>    app's real `DEFAULT_PREFS.plan.weekdays` and changing it on the landing would make
>    the demo lie. It also reads as an invitation — tap down to three and the section
>    demonstrates its own headline. Worth a look in use; if it feels like a
>    contradiction rather than an invitation, the fix is the copy, not the default.
> 2. **The §12 quote now repeats story paragraph 4 verbatim.** That is the pull-quote
>    convention — a pull quote *is* a line lifted from the body — and here it is also
>    the stutter technique: you meet the line, then meet it again in context four
>    paragraphs down. If it reads as an editing slip rather than an echo, the fix is to
>    reword the paragraph's opening, not the quote.
>
> **Left unchanged, and why:** §2 *Hét kérdés, és kész a heted.* · §3 *Nem egy program.
> Az összes.* · §5 *edzés, ahogy neked jó* · §7 *Innen indulsz.* · §8 *Te mondod meg,
> hány nap.* · §9 *Megcsináltad. Mutasd meg.* · §10 *Amit a csoportban kitaláltunk —
> mind megvan.* · §12 the pull quote. All are claims rather than labels, all serve
> their new stage, and several use the house *"Nem X. Hanem Y."* figure. Changing them
> would have been change for its own sake.


**Phase 2 of 2.** Written against the approved skeleton in `05-homepage-wireframe.md`.
Every string for all 14 bands + the overlay. Hungarian, Alexa's voice, cold-and-wide.

`{...}` = rendered from data, never typed. `{week_intro}` etc. come from `PRICES`;
`{programCount}` / `{workoutCount}` / `{sessionCount}` come from the ISR payload.

---

## Voice rules applied

From the strategy docs, reduced to what actually transfers to a wide homepage:

- Short sentences. Fragments are fine.
- Em dash for the breath — not a comma.
- **"Nem X. Hanem Y."** is the house figure. It builds trust by saying what you *don't* get.
- Admission over promise. The rest day, the missed week and the restart are named openly.
- Tegezés, warm, not saccharine. No exclamation marks. No emoji in body copy.
- She says "megmutatom" and "végigcsinálom veled" — never "edződ leszek". She has ten years
  of competitive sport, not a physiotherapy qualification, so nothing therapeutic is promised.

**What does not transfer:** the persona hooks ("Hétfőn elkezded. Szerdára elmarad.",
"Este tízkor nem lehet ugrálni."). Those mirror one reader and narrow the page. They belong
to LP-A/LP-B. Here the same truth is stated as capability instead of accusation.

---

## Metadata (new — the page is server-rendered now)

| Field | Value |
|---|---|
| `<title>` | `LEXFIT — otthoni edzésprogram, ami hozzád igazodik` |
| description | `Vezetett otthoni edzések magyarul, eszköz nélkül. Hét kérdés, és kész a heted — annyi nappal, amennyi belefér. Az első hét {week_intro}.` |
| OG title | `A változás otthon kezdődik — LEXFIT` |
| OG description | `Napi 20–30 perc, elég egy matrac. {programCount} program, {workoutCount} edzés, és egy heti terv, ami a te napjaidhoz igazodik.` |

## Navigation

**Hero nav:** `Hogyan működik` · `Programok` · `Alexa` · `Árak` · `Belépés`
**Sticky nav:** `Hogyan működik` · `Programok` · `A heted` · `Kihívások` · `Árak`
**Sticky mini-CTA:** `Összeállítom a tervem`
**Mobile sticky bar:** `Az első heted {week_intro}` + `Összeállítom a tervem`

---

## 1 · Hero

> **eyebrow** — Otthoni edzésprogram, magyarul
>
> **h1** — A változás
> **h1 b** — otthon kezdődik
>
> **body** — Napi 20–30 perc, eszköz nélkül — elég egy matrac. Egy program, ami tudja, hol
> tartasz, és valaki, aki végigcsinálja veled. Nőknek és férfiaknak, minden szinten.
>
> **cta** — Összeállítom a tervem
> **link** — Hogyan működik →
>
> **price** — Az első heted **{week_intro}** — utána {week_std}/hét. Bármikor lemondható.
>
> **trust** — Alexa — 10 év versenysport · 1 200+ fős közösség · 14 napos elállási jog

**Changed:** "Napi 30 perc" → "Napi 20–30 perc"; "egy edző, aki végig veled marad" →
"valaki, aki végigcsinálja veled" (no qualification implied); the secondary link now points
at section 2 instead of the cut showcase; the community number joins the trust line.

---

## 2 · Hogyan működik

> **eyebrow** — Hogyan működik
>
> **h** — Hét kérdés, és kész a heted.
>
> **body** — Nem kell tudnod, hol kezdd. Megkérdezem, mennyi idő fér bele, mikor a legjobb
> neked, és mire figyeljek — a többit bízd rám.

**Step 1 — Válaszolsz hét kérdésre**
Mi hozott ide, hol tartasz most, hány nap fér bele, mire figyeljek. Nagyjából egy perc.

**Step 2 — Összeáll a heted**
Annyi nappal, amennyi tényleg belefér. A pihenőnap is benne van — az is a terv része.

**Step 3 — Megnyomod a playt**
Onnantól minden nap ott van, mi következik. Nem neked kell kitalálnod.

> **kicker** — A heted azelőtt látod, hogy fiókot csinálnál.
>
> **cta** — Összeállítom a tervem

**Verified:** the funnel is `welcome → 7 kérdés → reveal → plan → account → pay`, and the
progress bar literally reads "N. kérdés a 7-ből". The kicker is checkable — the reveal and
the plan both render before the account step.

**Assets landed 2026-08-11 — the three placeholders are gone.** All three are real
screens, all 772×1664, captured the same way, so the row reads as one journey:

| Step | Screen | File |
|---|---|---|
| 1 | The 6th onboarding question — „Van bármi, amire figyeljek?" | `/step-1-question.png` |
| 2 | The finished plan — 3 nap/hét, days, fókusz, tempó | `/step-2-plan.png` |
| 3 | The player mid-workout — countdown, current exercise, mai menü | `/step-3-player.png` |

Step 1 deliberately shows the *adaptation* question rather than the first one: "Csendben
kell / Van falam / Kíméld a térdem" is the single most differentiating thing in the funnel,
and it proves the §3 claim two bands early.

**Mobile layout changed with them.** The 3-up row was right for striped placeholders;
with real screenshots in it each rendered at 109px — 14% scale, where the app's body text
is 4px. A screenshot nobody can read is decoration pretending to be evidence. The steps
are now a snap rail below 900px (68vw ≈ 265px, 34% scale), the same pattern the programs
and challenges rows use. Cost: §2 goes 880px → 1,143px at 390×844.

---

## 3 · Edzés Alexával

> **h-thin** — edzés, ahogy
> **h-thin** — neked jó
>
> **body** — Vezetett edzések velem — alsótest, felsőtest, kardió és has, teljes test,
> mobilitás. Megnyomod a playt, és csinálod velem, mintha ott lennék a szobában.
>
> **body 2** — És ha a lakás nem engedi, van rá változat. Csendes edzések ugrálás nélkül,
> falra vagy székre támaszkodva, kíméletes variációkkal. Nem ugyanaz halkabban. Külön
> kategória.
>
> **chips** — 🔇 Csendes · 🪑 Falra fogva · 🧘 Lazító · 🌅 Reggeli · 🌙 Esti
>
> **cta** — Összeállítom a tervem

**The rule holds:** every sentence describes the product. Nothing addresses the reader's
flat, knees or neighbours. "Ha a lakás nem engedi" is a condition on the world, not an
assumption about them.

**Asset landed 2026-08-11 — a recording, not a screenshot.** `/player-demo.mp4`: a silent
22-second capture of the mobile player mid-workout, 774×1658 h264, 496KB, looping inside
the phone frame. A still cannot show the countdown ticking down, "Következik: 30 mp
pihenő" arriving, or the Mai menü checking itself off — which is precisely the claim
"megnyomod a playt, és csinálod velem" is making.

Behaviour: autoplays muted (no audio track exists), loops, `playsInline`, pauses when
scrolled out of view, and under `prefers-reduced-motion` never autoplays at all — the
poster stands in with a play control, because reduced motion means "not without my say-so",
not "you can't see this".

---

## 4 · Nagy képernyő

> **h-thin** — vidd a
> **h-thin** — nagy képernyőre
>
> **body** — A LEXFIT a böngészőben fut — nem kell letöltened semmit. Egy koppintás, és az
> edzésed a TV-n vagy a laptopon megy tovább, Chromecasttal és AirPlay-jel.
>
> **body 2** — Telefonon kezded, a nappaliban fejezed be.
>
> **device labels** — TELEFON · ASZTALI GÉP · LAPTOP · OKOS TV

Unchanged apart from the second line. It was already the most concrete section on the page.

---

## 5 · Programok

> **cap-title** — Nem egy program. Az összes.
>
> **cap-body** — {programCount} program, {workoutCount} edzés — és egy előfizetés, amiben
> mind benne van. Kezdd az elején, vagy válaszd azt, ami most kell. Ami új jön, azt is
> megkapod.
>
> **banner CTA** (per program) — Kezdd el ezzel →
> **row heading** — Néhány edzés a tárból
> **rail label** — Koppints egy edzésre, és megnézheted, mi van benne.

Program eyebrow, title, synopsis and chips are **authored content** from `/admin` — the
banner renders whatever the program doc says. Nothing here is written on the landing.

**Replaces** the nine invented titles and the generic programs panel. Counts come from the
ISR payload so they can't go stale.

---

## 6 · Ár-horgony

*Moved (2026-08-11) from position 12 to directly under §5 Programok, and re-pointed from
the annual plan to the weekly one.*

**Why here.** An anchor only works while the visitor still holds the thing being anchored
against. At position 12 the number arrived nine bands after the catalog — by then "N
program, N edzés" was long gone and the price had nothing to sit against. Directly under
§5 it does: the sentence one band up is the size of the offer, this band is what it costs.

**Why weekly.** The decision being made at this point in the page is *start / don't
start*, not *commit for a year*. Leading with the annual per-week (767 Ft) asked for a
year of trust before the story, the founder, or the proof had been shown. The weekly
entry matches the decision that is actually on the table. The annual per-week stays in
the fact row, so the cheaper long game is still visible — it is no longer the ask.

> **eyebrow** — A te árad
>
> **number** — {week_intro} **/ első hét**
>
> **lead** — Ennyiért nyílik ki az egész: minden program, minden edzés. Utána {week_std}
> hetente — és ha nem neked való, egy kattintás a lemondás.
>
> **row** — Utána **{week_std}** / hét · Évesen **{annualPerWeek}** / hét · Szüneteltethető ·
> Bármikor lemondható
>
> **cta** — Válaszd ki a csomagod →

**Honesty guard.** {week_intro} is an introductory price, so the unit says *első hét* and
the very next sentence states the standing weekly rate. A big intro number with the
follow-on rate buried would be exactly the kind of claim the truth-purge removed. §14
still carries the full terms per plan.

---

## 7 · Foundation

> **badge** — A kezdő program
>
> **title** — Innen indulsz.
>
> **cap-body** — A Foundation az alapoktól épít: lassú tempó, alapgyakorlatok, bőséges
> módosításokkal. {sessionCount} edzés, sorrendben — de te döntöd el, mely napokon és
> milyen ütemben mész végig rajta.
>
> **facts** — {sessionCount} edzés · 20–30 perc · eszköz nélkül · 2 fázis · a te napjaidon

**Journey labels — re-based off weeks:**

| Was | Now |
|---|---|
| `1. hét · 5 edzés` | `1–5. edzés` |
| `Napi 30 perc · eszköz nélkül` | `20–30 perc · eszköz nélkül` |
| `F001 · Foundation · 30 perc` | `{code} · Foundation · {mins} perc` |

Phase eyebrows unchanged (`🌱 Alap fázis`, `🔨 Építés fázis`). Phase descriptions unchanged —
they describe content, not schedule, so they were never wrong.

**Why:** the section claimed a fixed 4×5 week schedule the app does not impose. Numbering by
session instead of week is honest, and it sets up section 7 rather than contradicting it.

---

## 8 · A heted

> **eyebrow** — A heted
>
> **title** — Te mondod meg, hány nap.
>
> **cap-body** — A legtöbb terv heti ötöt ír elő, aztán a második héten megbukik rajta. Itt
> te választod ki, hány nap fér bele és melyek azok — a terv ehhez igazodik, nem fordítva.
>
> **demo label** — Koppints egy napra.
>
> **chips** — 3–6 nap · a te napjaid · a pihenőnap véd
>
> **body** — És ha kimaradsz, nem kezdődik elölről. A pihenőnap nem töri meg a sorozatot —
> az is a terv része.
>
> **cta** — Összeállítom a tervem

---

## 9 · Haladás

> **h-thin** — lásd, milyen
> **h-thin** — messzire jutottál
>
> **body** — Minden befejezett edzés automatikusan beszámít — nálunk a pipát nem lehet
> átpörgetéssel megszerezni. Látod a heti köröd, a sorozatod, és azt is, ami a tükörben
> lassabban látszik.
>
> **body 2** — Az 1., az 5. és a 8. hétnél kérek egy fotót. Csak a tiéd — senki más nem
> látja. Aztán egymás mellé teszem őket, és megmutatom a különbséget.
>
> **cta** — Összeállítom a tervem

The anti-cheat sentence stays verbatim. It is the strongest specific claim on the page and
nothing in the rewrite should dilute it.

---

## 10 · Amikor kész vagy — REWRITTEN 2026-08-11

*Owner note: "this section needs more attention — it's the share-your-success,
take-a-selfie-after-your-workout thing."* It was right: the band sold **Finish Share**
from the smallest heading tier on the page (`.cap-title`, 23px), in one sentence,
followed by an empty `<p>` left over from an earlier edit.

**Promoted to `.h-bold` (34px)** — an existing ramp step, so no new size was invented
and the type system is untouched.

> **eyebrow** — Amikor kész vagy
>
> **h** — Megcsináltad. Mutasd meg.
>
> **body** — Az edzés végén ott a kártyád: hány gyakorlat, mennyi idő, hányadik nap a
> sorozatban. Készíts hozzá egy szelfit — a számok rákerülnek a képre, te mozgatod
> őket, és te döntöd el, melyik szám legyen a főszereplő.
>
> **body 2** — A kép a telefonodon marad. Nem töltjük fel, nem tároljuk — csak az megy
> tovább, amit te küldesz el. És ha nincs kedved szelfizni, kihagyod: az edzés
> ugyanannyit ér.
>
> **chips** — 5 kártyadesign · te mozgatod · sosem töltjük fel · kihagyható
>
> **honesty** — A fotók valódi tagoké, az ő engedélyükkel — a kártyákon lévő számok
> mintaadatok.
>
> **detail** — Laptopon fejezted be? QR-kóddal átviszed a telefonra, és ott csinálod meg.
>
> **cta** — Összeállítom a tervem

**Every claim checked against `docs/finish-share-plan.md`:** 5 overlay directions
(A/F/B/C/E) ✓ · drag-to-nudge ✓ · the "Kiemelt:" metric swap ✓ · locked decision #4
"Ephemeral — never uploaded. Face images never touch the server" ✓ · #10 "a step
everyone sees, skippable" ✓ · #2 desktop→phone QR handoff ✓.

**The two strongest lines are the ones nobody else can copy:** *"sosem töltjük fel"* and
*"kihagyod: az edzés ugyanannyit ér."* One is a real architectural guarantee, the other
is the house voice admitting the feature is optional.

**Honesty line restored and made precise.** `FinishExamples.tsx` states the photos are
consented members but the overlay **stats are illustrative** — so the copy now says
exactly that, rather than the previous empty paragraph. The per-card `· minta` label
is 11px and cannot carry that qualifier alone.

## 11 · Kihívások + közösség

*Rebuilt 2026-08-11 — the band now shows the group instead of describing it.*

**The problem.** Every version of this copy said "amit a **csoportban** kitalálunk" while
the page never established that a group exists, what it is, or that it's free. A cold
visitor met a definite article pointing at nothing.

**The fix.** The group identifies itself the way a group card does — real cover, name,
"Facebook-csoport · 1 200+ tag · ingyenes", join button — and the archive below renders
the app's own `ChallengeCard`, not a landing lookalike.

> **cap-title** — Amit a csoportban kitalálunk.
>
> **cap-body** — Van egy Facebook-csoportunk, ahol minden héten együtt szavazzuk meg a
> következő kihívást — aztán bekerül a LEXFIT-be, és bármikor újra elővehető.
>
> **group card** — cover: the group's real banner (`/fb-group-cover.jpg`) ·
> name: Szavazz Magadra · meta: Facebook-csoport · 1 200+ tag · ingyenes ·
> cta: **Csatlakozom** (accessible name carries the full phrase)
>
> **row heading** — Eddig ezeket találtuk ki · **count** — {challengeCount} kihívás

**Why the body copy is short.** The cover already reads "HETI KIHÍVÁS. EGYÜTT DÖNTÜNK.
EGYÜTT CSINÁLJUK" — spelling the mechanic out again underneath only cost height.

**Cut:** the chip row, and "5–14 napos mini-programok, szűrhetően, a saját tempódban. A
napjaid ugyanabba a sorozatba számítanak." The cards now state the day counts and part
counts themselves, so the sentence was describing what was on screen.

**"17 000+ fős ingyenes közösség" stays deleted.** That figure is followers across
platforms. Saying the group is free and open is stronger than an inflated number, and it's true.

**Not a Facebook mock-up.** The card carries Facebook's mark and action colour because it
links to Facebook, but invents no posts, comments, member names or faces. Nothing on it
claims to be content that exists.

---

## 12 · Alexa — v2, distilled (2026-08-11)

> **eyebrow** — Az alapító
>
> **pull** — „Tíz évig azt tanultam, hogy abbahagyni árulás.”

> Ritmikus gimnasztika, heti hat edzés, tíz éven át. Szerettem. Aztán egyszer csak nem.
>
> Nem sérülés volt. Nem is lustaság. Egyszerűen elfogyott — és amikor kimondtam,
> kiderült, hogy ott a kilépés nem döntés. Hálátlanság.
>
> Tíz év kellett hozzá, hogy megértsem: nem a mozgással volt bajom. Azzal, hogy soha nem
> az enyém volt.
>
> Amikor újrakezdtem, otthon kezdtem. Nulláról, egy matracon. Senki nem nézte, senki nem
> mérte, senki nem kérte számon. És ott jöttem rá, mi hiányzott végig. Nem a fegyelem —
> abból volt bőven. Hanem hogy a mozgás az enyém legyen.
>
> Ezért van ez az app. Nem azért, hogy még valaki számonkérjen egy kihagyott napot —
> hanem azért, hogy ne kelljen megmagyaráznod. A pihenőnap itt nem engedmény. A terv része.
>
> Nem vagyok orvos, és nem vagyok gyógytornász — csodát nem ígérek. Azt viszont igen,
> hogy végig ott leszek veled, és olyan tempót tartunk, amihez holnap is lesz kedved.

> **chips** — 10 év versenysport · minden edzést én vezetek · 1 200+ fős közösség
>
> **promise stack** — Nem mondom meg, mit csinálj. / Nem ítéllek el, ha kimaradsz. /
> Nem játszom, hogy tökéletes vagyok.
>
> **close** — Egyedül nehéz. / Együtt muszáj. · **sign** — — Alexa · **cta** — Kezdjük együtt →

### What changed from v1, and why

v1 retold the incident — the changing room, the six hours, the confidential conversation.
**Her account is the source of this copy, not its content.** Nothing is reported now; only
what it taught her survives, in one line: *"ott a kilépés nem döntés. Hálátlanság."*

Three things improve at once:

1. **It reads as hers, not as evidence.** A retold grievance invites the reader to judge
   who was right. A distilled lesson invites them to recognise themselves. The research
   flagged the failure mode directly — the author of *Chalked Up* was dismissed as "a
   bitter ex-gymnast trying to cash in."
2. **Every identifying detail is gone**, which closes the legal exposure v1 carried. No
   roles, no schedule, no staffing, no team.
3. **It is shorter and hits harder.** Six paragraphs instead of seven, and the emotional
   weight now sits on the epiphany rather than the injury.

### The three paragraphs that were already working, sharpened

| Was | Now | Why |
|---|---|---|
| "…mi hiányzott végig: nem a fegyelem. Az, hogy a mozgás az enyém legyen." | "…mi hiányzott végig. **Nem a fegyelem — abból volt bőven.** Hanem hogy a mozgás az enyém legyen." | Uses the house "Nem X. Hanem Y." figure, and the aside is credible and faintly wry — she is not claiming she lacked discipline |
| "…hogy ne kelljen megmagyaráznod." | "…hogy ne kelljen megmagyaráznod. **A pihenőnap itt nem engedmény. A terv része.**" | Converts the feeling into a **verifiable product behaviour**. Without it the paragraph is a sentiment; with it, it is a claim the rest of the page backs up |
| "Nem vagyok gyógytornász, és nem ígérem, hogy meggyógyítom a hátad. Azt viszont megmutatom, hogyan mozogj úgy, hogy holnap is meg tudd csinálni." | "Nem vagyok orvos, és nem vagyok gyógytornász — **csodát nem ígérek. Azt viszont igen, hogy végig ott leszek veled**, és olyan tempót tartunk, **amihez holnap is lesz kedved**." | See below — warmth, plain language, and it stops assuming the reader has a bad back |

### The closing paragraph, rewritten for warmth

Three problems with the previous version:

1. **It assumed something about the reader.** *"…meggyógyítom a hátad"* is a `te` + body-part
   construction — the exact form the strategy docs rule out (*"«Fáj a hátad?»"* → talk about
   the function, not the person). It told someone with a perfectly fine back that this
   product is for people with bad backs.
2. **"Gyógytornász" alone is a clinical word** doing legal work. Pairing it with "orvos"
   makes the limit land in plain language, and *"csodát nem ígérek"* says the real thing
   the reader is testing for.
3. **It ended on a mechanism, not on her.** *"…hogyan mozogj úgy, hogy holnap is meg tudd
   csinálni"* needs a second read to parse, and it closes on technique.

The new version ends on **presence and desire** — *"végig ott leszek veled"* and *"amihez
holnap is lesz kedved."* That is warmer, it is the natural hand-off into „Egyedül nehéz.
Együtt muszáj.", and it closes the loop on her own story: what she lost was not the
ability to train, it was wanting to.

The qualification limit is fully intact — no therapeutic claim is made.

### The hinge, unchanged

„Abbahagyni árulás” is what ten years of elite sport taught her — and it is exactly what
the audience feels about a missed Wednesday (*"Péntekre bűntudatom van"*). That shared
sentence is why an elite athlete's story lands on someone who has never competed at
anything, and it is what makes the three refusals below read as earned rather than claimed.

### Still needs

- **Alexa's approval on every line.** It is her experience, however distilled.
- No date is given. "Karácsonyi szünet" is gone with the rest of the reportage; the arc
  no longer needs a timeline.

---

## 13 · GYIK

**1. Miért fizessek, ha a YouTube-on ingyen is van edzésvideó?**
A videó ingyen van — a sorrend nem. A LEXFIT egy felépített program: minden edzés tudja, mi
jött előtte és mi jön utána, a haladásod magától követődik, és nem neked kell minden nap
kitalálnod, mit csinálj. A lejátszóban ott a gyakorlatok listája időbélyeggel, teljes
képernyőn látod, mi jön és mennyi van hátra, és ott folytatod, ahol abbahagytad.

**2. Teljesen kezdő vagyok. Nekem való?**
Igen — a Foundation pontosan ide készült: lassú tempó, alapgyakorlatok, bőséges
módosításokkal. A saját tempódban haladsz, és a pihenőnap nálunk a terv része.

**3. Férfiként is használhatom?**
Igen. A LEXFIT nőknek és férfiaknak készült — a gyakorlatok saját testsúlyra épülnek, te
pedig a saját szinteden és tempódban követed őket.

**4. Milyen eszköz kell hozzá?**
Semmi — elég egy matrac.

**5. Mennyi időm kell rá naponta?**
A program edzései jellemzően 20–30 percesek. Az edzéstárban van 5–15 perces is — azokra való
a „ha csak tíz perced van" kategória. Nem a hossz visz előre, hanem hogy hétből hetet
megcsinálj.

**6. Mi van, ha kimaradok?**
Semmi. Nem kezdődik elölről, nem veszítesz el semmit, és nem kapsz érte bűntudatkeltő
üzenetet. A pihenőnap eleve a terv része — az nem töri meg a sorozatot. Ha egy hetet hagysz
ki, ott veszed fel, ahol abbahagytad.

**7. Hogyan mondhatom le?**
Bármikor, egy kattintással, a profilodból. Nincs hűségidő — a lemondás után a már kifizetett
időszak végéig még minden elérhető. És ha csak most nincs rá időd, nem kell lemondanod:
szüneteltetheted 1–3 hónapra, vagy válthatsz olcsóbb csomagra.

**8. Megy TV-n vagy laptopon is?**
Igen. A LEXFIT a böngészőben fut — nem kell letölteni semmit. Telefonon, laptopon és asztali
gépen működik, az edzést pedig AirPlay-jel vagy Chromecasttal a TV-re is kiküldheted.

**9. Kapok számlát?**
Igen, minden fizetésről automatikusan kapsz elektronikus számlát e-mailben.

**10. Mi lesz a fotóimmal?**
A haladásfotóid csak a tieid. Nem látja őket más tag, nem kerülnek a közösségbe, és bármikor
törölheted őket — ahogy a fiókodat és minden adatodat is, egy gombbal, a beállításokban.

---

## 14 · Előfizetés + footer

> **eyebrow** — Előfizetés
>
> **cap-body** — Egy előfizetés. Minden program, minden edzés, minden kihívás. Bármikor
> lemondhatod.

Plan cards unchanged — `Heti` / `Éves` (badge `Legnépszerűbb`, `Spórolj {n}%`) / `Havi`, with
their existing renewal fine print. Card action stays `Ezt választom →`.

> **trust row** — 14 napos elállási jog · Bármikor lemondható vagy szüneteltethető ·
> Elektronikus számla · Biztonságos bankkártyás fizetés · Visa · Mastercard
>
> **foot cta** — Összeállítom a tervem
>
> **help** — Kérdésed van? Írj nekünk, és segítünk — hi@lexfit.hu
>
> **legal** — Felhasználási feltételek | Adatvédelem | Impresszum

---

## The overlay — workout detail

Content comes from the workout's own data (in-app strings are allowed here, per the locked
vocabulary decision). Three copy changes for the public context:

| Element | In app | On the landing |
|---|---|---|
| Primary button | `Edzés indítása` | **`Ezzel kezdenék →`** → `/onboarding` |
| Meta row | `84% — neked ajánlott · 20 perc · KEZDŐ · F002 · ✦ Bónusz` | `20 perc · KEZDŐ · F002 · ✦ Bónusz` |
| Save / favourite | shown | **removed** — both need an account |

Section headings stay `Az edzés felépítése` and `Hasonló edzések`. The preview badge, progress
bar, unmute and replay come out with the clip.

**Why the button changes:** "Edzés indítása" cannot work for a logged-out visitor — playback
needs auth and entitlement. A primary action that fails is worse than no primary action, and
the quiz is the page's single CTA anyway.

---

## Lines carried over from the strategy docs

Flagged for transparency, since you asked for reference rather than reuse. Three phrases
earned their place and are used close to verbatim; everything else is written fresh.

| Line | Source | Why kept |
|---|---|---|
| „Egyedül nehéz. Együtt muszáj." | existing brand line, in the app's welcome screen | Already the brand's own sentence — the page should not invent a second one |
| „A pihenőnap is a terv része." | positioning doc, §5 brand sentences | It is literally how the product behaves, and no competitor says it |
| „Nem ugyanaz halkabban. Külön kategória." | copywriting doc, ad B | Rewritten from "Nem halkabb változat ugyanabból" — the clearest way to say Csendes is a category, not a compromise |

**Deliberately left in the ads:** every persona hook, the „Hétfőn elkezded. Szerdára elmarad."
family, the obstacle mirror, and „490 forint. Ennyi az első hét." as an opener. All of them
narrow the reader, which is the opposite of this page's job.

---

## Open items before build

1. **Confirm Alexa's story with her** — sport, year, and the word for why she stopped (§11).
2. **`{programCount}` / `{workoutCount}`** must come from the ISR payload, never typed. The
   strategy docs say 7 and 47; the page should render whatever is actually published.
3. **The in-app funnel says "30 perc"** too (`WELCOME.sub`, `STEP_COPY.schedule`). If the
   landing softens to 20–30, the funnel should follow or the two will disagree at the exact
   moment a visitor crosses between them. Out of scope here — worth a separate pass.
4. **`STEP_COPY.schedule`** still says "A Foundation program 5 napra épül + 2 pihenő", the
   same week-based claim being removed from §6. Same separate pass.
