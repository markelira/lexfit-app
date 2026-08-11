# Landing gap map — what the app does that `/` never says

Analysis date: 2026-08-11. Scope: `src/components/landing/LandingPage.tsx` (the whole
of `/`) compared against the shipped app (`src/app/app/**`, `src/app/player/**`,
`src/app/api/**`, `src/lib/**`).

This is **not** the competitor benchmark (that's `02-gap-analysis.md`). This is the
inventory gap: features that exist, work, and are wired end-to-end, but that a stranger
reading the landing page would never learn about.

Every claim below is checked against code, not against the roadmap. Where something is
only half-said on the landing, I quote the exact line.

---

## TL;DR — the seven biggest misses

| # | Shipped feature | Landing says | Why it matters |
|---|---|---|---|
| 1 | 7-question personalization quiz that builds your plan | CTA text only: "Összeállítom a tervem" | The primary conversion path is invisible; quiz-first is the standard for this cluster |
| 2 | You pick 3–6 days/week and *which* weekdays; rest day protects the streak | half a sentence inside the Foundation block | Kills the #1 objection ("I can't commit to 5 days") |
| 3 | 🔇 Csendes / 🪑 Falra fogva workouts + quiet playback default | nothing | Kills the apartment/neighbours/sleeping-kid objection outright |
| 4 | **Workout-finish filter** — "Megcsináltad." screen → selfie with a LEXFIT data overlay (5 designs), desktop→phone QR handoff | nothing | The only feature that markets itself once used, and the missing "what happens when you finish?" beat |
| 5 | Pause your subscription 1–3 months (and downgrade instead of cancel) | "Bármikor lemondható" only | Strongest risk-reversal available, and it's already built |
| 6 | Progress photos with slider + side-by-side comparison at week 1/5/8 | two "Kép helye" placeholders + generic copy | The single most emotional proof-of-progress feature, unnamed |
| 7 | In-player exercise chapters, click-to-seek, fullscreen HUD with live exercise name + countdown | nothing | The genuine "this is not YouTube" answer — and the FAQ asks that exact question |

---

## 1. Onboarding & personalization — the whole funnel is unexplained

**Shipped:** `src/app/onboarding/page.tsx` + `src/lib/onboarding-data.ts:140` — a
7-step flow (`goal → about → level → focus → motiv → schedule → env`) ending in a
personalized reveal (`REVEAL`, `onboarding-data.ts:120`). It seeds the training-day
plan, the reminder hour, and the equipment list into `prefs`
(`src/lib/prefs.ts:21-45`).

**Landing:** `CTA_START = "/onboarding"` (`LandingPage.tsx:323`) and button copy
"Összeállítom a tervem". The page never shows a single question, never says it takes
~1 minute, never says the plan is built from your answers.

**Gap:** the highest-intent moment on the page is an unlabeled door. There is no
"how it works in 3 steps" section anywhere on `/`.

**Also missing:** the in-app guided welcome tour (`src/components/GuidedTour.tsx`),
the first-entry coaching cards (`src/components/FirstEntry.tsx`), and the join
cinematic (`src/components/JoinCinematic.tsx`) — i.e. nobody is left to figure the app
out alone.

---

## 2. Scheduling & cadence — the flexibility story is buried

**Shipped:**
- Days per week is user-chosen 3–6, labelled *kényelmes / haladós / ajánlott / intenzív*
  (`onboarding-data.ts:66-71`), clamped in `prefs.ts` (`clampDays`, 3–6).
- The user picks the actual weekdays (`prefs.plan.weekdays`, editable in
  `/app/profile/settings` via `DayPills`).
- **Rest day does not break the streak** — `restDayKeepsStreak: true`
  (`prefs.ts:29`), surfaced in-app as "A pihenőnap nem töri meg a sorozatot."
  (`src/app/app/progress/page.tsx:126`).
- The program is an **ordered pool**, not fixed authored weeks — "this week" is
  derived from the user's own cadence (`src/app/app/page.tsx:127`,
  `src/lib/week-progress.ts`).

**Landing:** one clause inside the Foundation section — "Heti 5 napra tervezve, de te
választod meg, mely napokon és milyen tempóban haladsz" (`LandingPage.tsx:889`) — plus
the FAQ line "a pihenőnap nálunk a terv része".

**Gap:** the flexibility is the product's structural advantage over a fixed 8-week PDF
plan, and it's stated once, in a paragraph, below the fold. It deserves its own beat.

---

## 3. "Csendes" / apartment-friendly training — completely absent

**Shipped:** the `type` filter dimension ships `🔇 Csendes`, `🪑 Falra fogva`,
`🧘 Lazító`, `⚡ Intenzív`, `🌅 Reggeli`, `🌙 Esti`
(`src/lib/filter-defaults.ts:15`), and playback defaults to
`quietDefault: true` (`prefs.ts:41`).

**Landing:** zero mentions of noise, neighbours, jumping, or evening training.

**Gap:** this is the objection that stops flat-dwellers and parents of small children
from buying a home program, and LEXFIT has a literal filter for it. Free YouTube
doesn't. Highest value-per-word addition on the page.

---

## 4. Library depth — "edzéstár" is named, never shown

**Shipped:** `/app/library` with 6 filter dimensions, sort, category tiles, URL-encoded
filter state (`src/app/app/library/page.tsx`, 569 lines):

| Dimension | Options |
|---|---|
| Fázis | Alap · Építés · Elmélyítés · Kifejezés (**4**) |
| Testrész / Téma | 6 |
| Időtartam | 5–15 · 16–25 · 26–35 · 36+ perc |
| Nehézség | Kezdő · Közepes · Haladó |
| Formátum | circuit · EMOM · Tabata · AMRAP · Pyramid · Ladder · 50/50 · flow · steady-state · időzített tartások (**10**) |
| Típus | 6 (see §3) |

**Landing:** the word "videótár"/"edzéstár" appears twice
(`LandingPage.tsx:791`, `:862`); the coverflow shows 5 category words and nine
made-up titles (`coverflowCards`, `:173`). Formats appear once, as flavour text inside
a week description ("Pyramid, EMOM, AMRAP", `:228`).

**Gaps:**
- No workout count anywhere on the page. Every benchmark page leads with one.
- Only **2 of 4 phases** are ever shown (Alap + Építés). Elmélyítés and Kifejezés
  don't exist on `/`.
- The filtering/sorting itself — the "I can always find the right session" promise —
  is never demonstrated.
- **Copy risk:** the page hard-anchors "napi 30 perc" / "fix 30 perc"
  (`:513`, `:731`, `:889`) while the app ships a 5–15 perc bucket and a dedicated
  home row "Ha csak 15 perced van" (`src/app/app/page.tsx:247`). The 30-minute anchor
  *excludes* the time-poor buyer the short sessions were built for.

---

## 5. The player — the actual answer to "why not YouTube?"

**Shipped** (`src/app/player/[code]/page.tsx`, 972 lines):
- **Exercise-level chapters**: per-exercise timestamps, a click-to-seek playlist
  accordion, and hover-preview of exercise + timestamp on the chapter bar (`:102`,
  `:204`, `:245`; `src/lib/blocks.ts`).
- **Fullscreen HUD**: exercise name + countdown mirrored over native fullscreen via a
  live WebVTT track (`:97`, commit `630b2ce`).
- **Fullscreen ladder**: element fullscreen → native video fullscreen → CSS
  pseudo-fullscreen, plus rotate-to-fullscreen, YouTube-style (`:409-429`).
- **Resume**: `saveResume`/`clearResume` + a "Folytatod" home row
  (`src/lib/progress.ts:84`, `src/app/app/page.tsx:245`).
- **Auto-next**, **captions**, **quiet default** toggles (`prefs.ts:41`).
- **Cast gating**: AirPlay + Remote Playback, and the cast button only appears when a
  real target exists (`:365-380`).
- **Signed playback** — Mux tokens per session (`src/lib/playback.ts`,
  `/api/mux/token`), so content isn't scrapeable.

**Landing:** the CAST section (`:820-856`) is good and covers TV/AirPlay/Chromecast.
Everything else above is absent.

**Gap:** the FAQ literally poses "Miért fizessek, ha a YouTube-on ingyen is van
edzésvideó?" and answers it with *sequencing* only (`:256`). The player itself is a
second, concrete answer — YouTube has no exercise chapters, no countdown HUD, no
resume across devices — and it isn't used.

---

## 6. Progress & habit system — undersold to near-invisibility

**Shipped** (`/app/progress`, 484 lines):
- Weekly ring driven by real completions + pending (`src/lib/week-progress.ts`).
- **Streak** with rest-day protection (`src/lib/streak.ts`) and a streak-risk email.
- **Progress photos** at milestone weeks **1 / 5 / 8** (`src/lib/photos.ts:11`),
  owner-private, with a **slider ("Csúszka") and side-by-side ("Egymás mellett")
  comparison** between INDULÁS and MOST (`progress/page.tsx:385-475`).
- **Visszamérés / observations** — written check-ins per week (`addObservation`,
  `progress.ts:51`) and benchmark rounds (`saveBenchmark`, `:44`).
- Completion is verified against Mux watch data — you cannot scrub to the end
  (`/api/progress/sync`, 90% rule).

**Landing:** one panel (`:928-949`) with the copy "Minden befejezett edzés
automatikusan beszámít — nálunk a pipát nem lehet átpörgetéssel megszerezni" and two
`Ph` placeholders labelled "Kép helye".

**Gaps:**
- The anti-cheat line is the *only* specific claim; it's good, keep it.
- **Progress photos are never named.** The panel has two image slots that are literally
  where a before/after comparison screenshot should go.
- The streak — the app's core habit mechanic — appears once on the whole page, in a
  subordinate clause about challenges ("közben a sorozatod is épül", `:902`).
- Observations / visszamérés: absent.

---

## 7. Programs — the page implies there is one

**Shipped:** a data-driven multi-program catalog. `/app/programs` renders every
published program from Firestore; `src/lib/program-index.ts` resolves
"which programs exist" and video→program membership; `src/lib/programs.ts` assigns each
slug a distinct mark and hue (8 hues, named slugs incl. `foundation`, `elsolepes`), and
`/app/program/[slug]` is fully generic.

**Landing:** the "programok, amik célba érnek" panel (`:870-881`) is generic and
placeholder-only; the only concrete program is Foundation's first 4 weeks
(`:884-896`). The catalog, and the fact that a subscription includes *all* programs,
is never stated.

**Gap:** a buyer can't tell whether they're buying one 4-week plan or a growing
library of programs. The pricing section says "Egy előfizetés. Minden funkció."
(`:1007`) — that's the closest it gets, and it's about features, not content.

**→ Recommendation: mirror `/app/programs` on the landing page.** Render the real
published program catalog (`program-index.ts` → published programs, sorted by order),
with each program's real lockup, mark and hue (`programVisual`) and its real session
count. Two things fall out of this for free:

1. The "which programs do I get?" question is answered with data instead of a
   placeholder panel — and it stays answered, because new programs published in
   `/admin` appear on the landing with no code change.
2. It replaces the nine **invented** coverflow titles (`coverflowCards`,
   `LandingPage.tsx:173` — "Fenék & comb égő", "Zsírégető kardió" …) with the actual
   catalog. Those nine titles are the last block of fabricated content on the page
   after the `d0d3683` truth-purge; the challenge cards below them are already real
   (`:239-250`), which makes the inconsistency worse, not better.

See §14 for what should happen when one of those cards is clicked.

---

## 8. Kihívások — shown as art, not as a product

**Shipped:** `/app/challenges` archive with its own filter taxonomy
(`filter-defaults.ts:20`), per-day progress and resume
(`src/lib/challengeProgress.ts`), a **dedicated vertical (9:16) challenge player**
(`src/app/challenge/[slug]/[code]/page.tsx`), and a Facebook-group link surfaced from
settings (`ChallengesData.fbGroupUrl`).

**Landing:** eight real challenge cards (`challengeCards`, `:241`) plus two sentences.

**Gaps:** never says challenges are **included in the same subscription**, never says
they share the streak (only obliquely), never says new ones are added, and the
community group they connect to is not presented as something you join. Expanded in
**§15**, which also flags a copy-accuracy problem with the "17 000+" figure.

---

## 9. Billing & risk reversal — the built retention tools are hidden

**Shipped** (`/app/membership`, `src/lib/billing.ts`, `/api/subscription/manage`):

| Action | Code | On landing? |
|---|---|---|
| **Pause 1–3 months** (billing + access paused, remaining time banked) | `billing.ts:74`, `manage/route.ts:38` | ❌ never mentioned |
| **Downgrade** monthly → weekly at period end | `billing.ts:79`, `:46` | ❌ never mentioned |
| Cancel at period end, self-serve, keeps access until paid-through | `billing.ts:85` | ✅ said 4× |
| 14-day withdrawal / refund flow | `/api/withdrawal` | ✅ named, ⚠️ not explained |
| Daily check-in → **earned annual price** ("Kiérdemelt Ár") | `/api/checkin`, `/app/grandslam` | ❌ never mentioned |

**Gap:** "pause instead of cancel" is the single strongest answer to *"what if I get
busy / go on holiday / get injured?"* — and it exists. The FAQ answer "Hogyan mondhatom
le?" (`:271`) is the natural place to say **"vagy szüneteltetheted 1–3 hónapra."**

The Grand Slam / earned-price mechanic is arguably deliberate as an in-app-only
surprise — but the *daily check-in* itself works for every signed-in user
(`checkin/route.ts:11-15`) and is a habit feature the page could claim.

---

## 10. Reminders & the email program — a whole retention layer, unmentioned

**Shipped:** 18 transactional/lifecycle templates in `emails/` — `workout-reminder`,
`streak-risk`, `weekly-recap`, `weekly-day5-reminder`, `day2-nudge`, `first-workout`,
`annual-renewal-reminder`, dunning, pause-resuming, cancel/withdrawal confirmations —
driven by crons (`/api/cron/workout-reminders`, `/api/cron/reminders`) and the user's
own chosen hour and weekdays (`prefs.reminders.workout`).

**Landing:** nothing.

**Gap:** "we'll nudge you at 07:15 on the days *you* picked, and you can turn it off"
is both a feature and a GDPR-clean trust signal (reminders ship **opt-in, seeded OFF** —
`prefs.ts:33`). Also worth noting: renewal reminders before an annual charge are exactly
what a cautious buyer wants to hear before committing to a yearly plan.

---

## 11. Trust, privacy & account control — the HU trust wall

**Shipped:** data export (`/api/account/export`, rate-limited), account deletion with
soft-delete + purge cron (`/api/account/delete`, `/api/cron/purge-accounts`), privacy
toggles for name/streak visibility (`prefs.ts:39`), owner-private progress photos,
Firebase App Check (reCAPTCHA v3), signed Mux playback, Billingo invoicing wired into
the Stripe webhook, and three sign-in methods (Google, Apple, email+password) with
password reset.

**Landing:** the price-trust row (`:1028-1032`) covers 14-day withdrawal, cancel-anytime,
and "Biztonságos bankkártyás fizetés · Visa · Mastercard". Legal links are in the footer.

**Gaps:** no mention of **számla** (Hungarian buyers expect it), no mention that progress
photos are private to you, no mention of data export/deletion, and the login options are
invisible until you reach `/login` — "belépés Google-fiókkal, letöltés nélkül" removes
friction if said earlier.

---

## 12. Absent because it doesn't exist yet — do NOT add

For completeness, so nobody "fills these gaps" by inventing them:

- **Real photography.** 12 `<Ph>` placeholders remain on `/` (`Ph`, `:152`), including
  every founder card, the phone mockup, the TV shot, the whole cinematic showcase
  (`scSlots`, `:581`) and both progress images. The showcase is the worst offender: five
  captioned "scenes" that are striped grey boxes.
- **Social proof.** No testimonials, no ratings, no member count. Note that the existing
  "17 000+" is cross-platform followers, not community members, and is a copy-accuracy
  problem rather than social proof — see §15. **Partially addressable now:** §16 puts
  the finish-filter photos on the page as a product demonstration, and sources real
  member cards from the group to replace them over time.
- **Reps data** in the finish overlay is authored-only and not yet populated
  (`finish-overlays.ts` — `reps?: number | null`).

---

## 13. The workout-finish filter — built, viral, and invisible

**Shipped:** the completion screen that fires the moment a workout ends
(`src/components/finish/**` + `/api/finish-share/*` + `/finish/[token]`):

- **"Megcsináltad."** completion card with the session line — workout title · minutes ·
  **N. napos sorozat** (`FinishComplete.tsx:27`).
- A **selfie filter**: your photo with a LEXFIT data overlay burned in, in **5 overlay
  designs** — Bal felső / Középre / Vágójelek / Egy szám / Gerinc
  (`OVERLAY_DIRS`, `finish-overlays.ts:9`), rasterized client-side to a 9:16 image.
- The overlay is **personalized from real session data**, not decoration: `Gyakorlat`
  (exercise count derived from the video's blocks), `Idő` (`{mins} perc`), `Sorozat`
  (`{streak}. nap`) — `finish-overlays.ts:43-65`. The hero metric adapts to whatever
  data exists, so it degrades cleanly instead of showing an empty slot.
- An **examples carousel** so a first-timer sees the format before shooting — and every
  card is explicitly labelled `· minta` (`FinishExamples.tsx:8,47`), i.e. samples, not
  fake testimonials.
- **Desktop → phone QR handoff** (`DesktopHandoff.tsx` + the public `/finish/[token]`
  route): the laptop user scans a code and shoots the selfie on their phone, where the
  camera and the share sheet actually are.
- Fully **skippable** — "Most nem · kihagyom" (`FinishComplete.tsx:38`); nothing is
  uploaded, the image is created and shared on-device.

**Landing:** nothing. Not a word, not a screenshot, not a caption in the cinematic
showcase.

**Gaps:**
- It's the only feature in this document that **markets itself once used** — a shared
  overlay image is a branded impression from an existing member. Every comparable
  creator app leads with its share artifact.
- The landing's workout narrative currently **ends at "press play"** (§5). There is no
  finish beat, no payoff, no "and then you get this".
- The overlay is also **social proof the page is missing** (§12): real member photos
  with real numbers are exactly the asset `02-gap-analysis.md` M4 says is absent — and
  this feature generates them.
- Also unmentioned: the *streak* appears here as a headline number ("9. nap",
  "34. nap"), which is a second place the habit system is doing visible work while the
  page stays silent about it (§6).

---

## 14. The workout detail modal — the best sales asset in the codebase, locked behind auth

**Shipped:** `src/components/WorkoutDetail.tsx` (rendered in a shell by
`NcardModal.tsx`) — opened by clicking any workout card in `/app`, `/app/library`,
`/app/programs` and `/app/program/[slug]`. It contains, per workout:

- A **cinematic hero: a 60-second muted autoplaying preview of the real video**, with a
  live `ELŐNÉZET · 0:59` countdown, a progress bar, an unmute toggle and a replay
  (`use-preview-clip.ts`, `WorkoutDetail.tsx:87`). Falls back to cover art on any
  playback error.
- Program lockup + `LEXFIT · F002` code + title.
- **Edzés indítása** primary action, plus save-to-list and favourite.
- A meta row: **`84% — neked ajánlott`** match score, minutes, level chip, code, phase
  (`:121`).
- A written description generated from the workout's own attributes
  (`workoutDesc`) — e.g. *"Kar-, váll- és hátfókuszú edzés, eszköz nélkül — elég egy
  matrac. … Csendes, szomszédbarát változat, ugrálás nélkül. Alexa végig veled csinálja."*
- **"Az edzés felépítése"** — the real block breakdown with proportional bars and
  per-block minutes (Bemelegítés 5′ · Mell és kar nyitás 4′ · Hát és lapocka aktiválás 5′
  · Tartás-aktiváció finisher 4′ · Levezetés 4′).
- A facts column: Fókusz · Formátum · Fázis · Nehézség · Időtartam · **Címkék**
  (where `Csendes` surfaces — see §3).
- **"Hasonló edzések"** — three related workouts, each of which swaps the modal in place.

**Landing:** the coverflow cards (`Coverflow`, `:383`) are decorative. Clicking one only
re-centres it (`onClick={() => setCenter(i)}`, `:465`). There is no detail view, no
preview, no structure, nothing.

**Gap — this is the single biggest under-use of existing work on the page.** Everything
a skeptical buyer wants before paying is already built and already written: *what is
actually in a session, how long each part takes, how hard it is, whether it's quiet,
and what it looks like on video.* The landing instead asks them to buy on nine invented
titles and a striped placeholder.

**→ Recommendation:** make landing workout cards open this exact modal.
`WorkoutDetail` is already parameterized for reuse — `showClose` and `showSimilar` are
props (`:32`), and it takes a plain `CardVideo` + `pool`, not app state.

**DECIDED — no video preview on the landing, but keep its place.** The 60s preview needs
signed Mux tokens, and `/api/mux/token` requires auth **and** entitlement
(`verifyRequest` → `hasAccess`, `token/route.ts:13`), so a logged-out visitor can't
stream it. We are **not** building a public preview endpoint for launch.

Instead: render the modal with the **cover-art fallback**, which the component already
does natively when `pb` is null — no backend change, no new endpoint, no clip-publishing
decision. What matters is that **the hero slot stays**: same aspect ratio, same
program lockup, same title and `LEXFIT · F002` eyebrow, same action row underneath. The
layout is identical to the in-app modal; only the moving image is missing.

Two consequences to handle in the implementation:

- Drop the `ELŐNÉZET · 0:59` badge and the preview progress bar — with no clip they'd
  be counting down nothing. The unmute and replay buttons go with them.
- Everything below the hero — description, "Az edzés felépítése", the facts column,
  "Hasonló edzések" — renders unchanged. That's the substance, and it's the part doing
  the selling anyway.

**Note:** the `84% — neked ajánlott` match score is personalized and should be
suppressed on the public page — it's meaningless before onboarding, and showing an
invented percentage to a stranger would re-introduce exactly the kind of claim the
truth-purge removed.

---

## 15. Kihívások as the Facebook group's permanent home

This expands §8 with the angle that actually sells: **the app is where the free
Facebook group's challenges finally become findable.**

**The mechanic, as shipped** (`src/app/app/challenges/page.tsx:235`):

> **A szavazás a Facebook-csoportban zajlik.** Ott döntjük el, mi legyen a következő
> heti kihívás — itt pedig bármikor újra elővehető az összes eddigi.

That single sentence is the entire "Szavazz Magadra" loop, and it's the honest version
of the community claim: the group votes on next week's challenge, the app keeps every
past one. `fbGroupUrl` is authored in `/admin` (`settings/challenges`), read at load
(`challenges.ts:141`), and rendered as a real "Ugrás a csoportba" button
(`challenges/page.tsx:237`).

**What the group can't do, and the app does:**

| In the Facebook group | In `/app/challenges` |
|---|---|
| Challenges live in the feed and sink | A permanent archive, newest-first |
| Finding a challenge from 8 months ago means scrolling | Filter by **HOSSZ**, **TESTRÉSZ**, **ÁLLAPOT**; sort by legújabb / legrövidebb (`page.tsx:168-170`, `:23-24`) |
| No memory of what you did | Per-day progress, `elkezdetlen / folyamatban / kész` state, a progress bar per card (`challengeProgress.ts`) |
| Lost your place mid-challenge | **"Folytatod — ott veszed fel, ahol abbahagytad"** rail (`:285`) |
| No browsing | Curated rails: "A legutóbbi hetek", **"Ha csak egy hetet vállalsz"** (max 7 nap, `:294`) |
| Video quality/format varies | A dedicated **vertical 9:16 player** built for these (`/challenge/[slug]/[code]`) |
| Streak? none | Days count toward the **same streak** as the main program |

**Landing:** the Kihívások band (`:899-916`) shows eight real challenge cards and two
sentences. The Facebook group is never named on the page at all.

### ⚠️ Copy-accuracy issue: the "17 000+" number is not the community

The landing currently claims a **"17 000+ fős ingyenes közösség"** in the founder facts
(`LandingPage.tsx:766`) and **"A KÖZÖSSÉG · 17 000+ ember"** as a founder chapter card
(`:284`).

**That number is followers across platforms, not community members.** The actual
Facebook group — the one that votes on the challenges and that `fbGroupUrl` links to —
has **~1 200 members**. Calling 17 000 cross-platform followers a "közösség" conflates
reach with membership, and it is precisely the class of claim the `d0d3683` truth-purge
existed to remove. It should be corrected regardless of anything else in this document.

- `:766` — replace "17 000+ fős ingyenes közösség" with the group figure, or reframe
  as reach ("17 000+ követő") and keep it clearly separate from the group.
- `:284` — the "A KÖZÖSSÉG" chapter should point at the group, not the follower count.

**Use 1 200 and make the stronger argument.** A smaller honest number is the better
asset here: 1 200 people who *vote every week on what the next challenge will be* is
evidence of an active community. 17 000 passive followers is evidence of a big
audience — which nobody doubts and which proves nothing about whether the product is
alive. The vote is the proof; the headcount is context.

**Gaps:**
- The **voting loop is never mentioned.** "1 200 members vote on next week's challenge,
  and you get to do it" is a live, recurring reason to be a member — the page presents
  challenges as static archive content instead.
- It's never said that challenges are **included in the same subscription**.
- The group is free; the page never makes the argument for why a free-group member
  should pay — which is exactly the browsability table above. This is the warmest
  audience LEXFIT has and the page has nothing addressed to them.
- **It is still the cheapest social-proof fix available** (§12,
  `02-gap-analysis.md` M4) — a named group with a recurring weekly ritual beats a
  follower count, and it costs one sentence.

**→ Recommendation:** turn the Kihívások band into the community beat. Keep the eight
real cards, name the group, state the vote loop in one sentence, add the
filter/archive/streak framing, and end on the "Ugrás a csoportba" link. Verify the 1 200
figure against the live group before it ships, and write it so it doesn't need editing
as the group grows ("1 200+" ages better than an exact count).

---

## 16. Finish-filter photos as the landing's social proof

**Decision (2026-08-11):** use the finish-filter example photos on `/` to show real
people using the app — the first real answer to the social-proof gap (§12,
`02-gap-analysis.md` M4).

**The asset already exists.** `FinishExamples.tsx` is an auto-scrolling marquee of
9:16 cards, each a real photo with a real `FinishOverlay` composited on top — a
different overlay direction per card, scrim where the shot is bright. It's data-driven
(`EXAMPLES[]`, `:14-21`), so adding, replacing or reordering cards is a one-line change,
and the same component can be dropped onto the landing as-is.

**Assets updated this session:**

| Card | Photo | Notes |
|---|---|---|
| Alexa | `IMG_9893` → `public/finish-examples/alexa.jpg` (506×900) | **Replaces the studio shot.** The new one is shot at home in a hallway — it matches "A változás **otthon** kezdődik" far better than a gym backdrop, which quietly contradicted the whole positioning |
| *(new, unnamed)* | `IMG_0172` → 675×900, staged | New male sample; needs a name before it can be labelled and committed |

Both were converted with orientation baked in and **EXIF stripped**. Worth noting:
`IMG_9893` carried **GPS coordinates** (Budapest, ~47.537 / 19.078). Phone photos
routinely do. Any photo added to this set must be stripped before it ships — a
marketing page that leaks a trainer's home location is a different kind of problem than
a bad headline. Command used:

```
magick <src> -auto-orient -resize x900 -strip -quality 82 public/finish-examples/<name>.jpg
```

### ⚠️ The constraint that decides how this can be worded

`FinishExamples.tsx:6-9` states it plainly:

> The photos are consented (owner-confirmed 2026-08-08); the overlay **STATS are
> illustrative sample values**, so every card is explicitly labelled "minta" — never
> present these numbers as real member results.

So the photos are real people, but **`Sorozat 9. nap` / `31 perc` / `11 gyakorlat` are
invented**. In-app that's fine — it's a "here's what yours will look like" preview
sitting behind a login. On a public sales page, a wall of faces with numbers on them
reads as *members reporting results*, which is the exact class of claim `d0d3683` and
`a83a97d` were written to remove. Two separate things are being asked of one asset:

**(a) Product demonstration — truthful today, ship now.**
Frame the band as *what the finish image looks like*, e.g. **"Így néz ki, amikor kész
vagy"**, keep the `· minta` labels visible, and let the photos do the work of showing
real bodies in real Hungarian homes. That alone fixes the "is this app actually used by
people who look like me?" problem, which is most of what social proof buys you.

**(b) Real social proof — needs sourcing, not code.**
Actual finish images from actual completions, with each person's real minutes, exercise
count and streak. Then the `minta` label comes off and the band becomes a genuine proof
wall.

**→ Recommendation: ship (a) now, run (b) as a campaign in the Facebook group** (§15).
The 1 200-member group is exactly the channel for it — "post your finish image, we'll
feature it" is a natural ask for a community that already votes weekly, and it feeds
§15 and §16 at once. Each real card that comes back replaces a `minta` card, one line
at a time, with no rebuild.

**Two consent notes before this ships:**
- Consent was confirmed on 2026-08-08 for **in-app** use. A public marketing page is a
  materially wider scope — re-confirm with each person, ideally in writing.
- The new photo can't be labelled until it has a name; `EXAMPLES[].name` is what renders
  under the card.

---

## Recommended priority (impact ÷ effort)

**P0 — copy-only, no new assets needed**
1. Add pause (1–3 hó) to the cancel FAQ answer and the price-trust row. (§9)
2. Add a "Csendes edzések" line to the follow-along panel. (§3)
3. Name progress photos + before/after comparison in the progress panel. (§6)
4. Soften the "napi 30 perc" absolutism → "napi 15–30 perc, ahogy belefér". (§4)
5. Add "számla" + "a fotóid csak a tieid" to the trust row. (§11)
6. **Fix the "17 000+ fős ingyenes közösség" claim** (`:766`, `:284`) — that's
   cross-platform followers; the group is ~1 200. Truth fix, ship independently. (§15)

**P1 — one new section each**
7. "Hogyan működik" 3-step block that opens with the quiz. (§1)
8. **The finish filter as the closing beat of the workout narrative** — the overlay
   examples already exist as rendered assets, so this needs copy + the existing
   `minta` cards, not new photography. (§13)
9. A cadence/flexibility beat: 3–6 nap, a te napjaidon, a pihenőnap véd. (§2)
10. A streak/habit beat — the app's core loop is currently unrepresented. (§6)

**P1.5 — reuse what's built instead of writing new copy**
11. **Mirror `/app/programs`**: render the real published catalog, killing the nine
    invented coverflow titles. (§7)
12. **Make those cards open the real `WorkoutDetail` modal**, cover-art hero, no
    preview clip, no new endpoint. (§14)
13. **Rebuild the Kihívások band as the community beat** — the FB vote loop plus the
    archive/filter/streak argument aimed at the free group. (§15)
14. **Drop the `FinishExamples` marquee onto the landing** as "Így néz ki, amikor kész
    vagy" — real people, real homes, `minta` labels kept until real cards replace
    them. Pairs with item 8. (§16)

**P2 — needs a screenshot or a real asset**
15. Player chapters + fullscreen HUD as the second "why not YouTube" answer. (§5)
16. Library filter demo + real workout count + all 4 phases. (§4)
