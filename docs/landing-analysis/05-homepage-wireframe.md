# LEXFIT homepage — wireframe spec v1

**Phase 1 of 2. Skeleton only — copy is written after this is approved.**

Date: 2026-08-11. Scope: `/` (`src/app/page.tsx` → `src/components/landing/LandingPage.tsx`).
Interactive wireframe: published artifact "LEXFIT homepage — wireframe v1".

Inputs: `04-product-feature-gaps.md` (what the app has that `/` never says), the four
strategy docs in `~/Downloads/LEXFIT_*.md` (reference, not copied 1:1), the `apple-design`
skill, and the existing design system in `src/app/landing.css`.

---

## The brief, as locked

| Decision | Answer |
|---|---|
| Relationship to the ads launch | **None.** This is the permanent homepage. LP-A/LP-B are separate, campaign-driven pages |
| Audience | **Cold and wide.** Inform, don't segment. No persona targeting, no obstacle-mirroring |
| Deliverable order | Wireframe → **pause for approval** → copy |
| Structural freedom | Reorder, merge and cut. Keep every visual pattern |
| Length budget | ~15 bands; new sections must displace existing ones |
| CTA model | **Quiz-only, repeated.** Every CTA → `/onboarding` |
| Vocabulary | In-app language is fine on `/` (strict ads rules stay with the ads) |
| Adaptation angle | **Show the capability, don't mirror the person** |
| Foundation framing | Re-base on the real pool model |
| Alexa | **She is the brand** — threaded through the page, plus one big block |
| Data | Server shell + ISR via Admin SDK |
| Assets | Real app screenshots (I capture) + new photography (you shoot) |

---

## Result

**15 bands → 14 bands + 1 overlay.** Four blocks of fabricated data deleted.

Narrative spine:

> **what is it** (1–3) → **is it real** (4–5) → **what does it cost** (6) →
> **does it fit my life** (7–8) → **who else does it** (9–11) → **who is she** (12) →
> **what does it cost, in full** (13–14)

*Revised 2026-08-11:* the price is now stated twice — once early, as a single number
attached to the catalog, and once at the end with the full plan comparison. A cold
visitor who wants the price before the story no longer has to scroll nine bands to
find it, and the ones who do read on still land on the plans at the close.

The current page opens with a founder biography before a stranger knows what the product
is, then spends its middle on placeholder imagery, and states its two strongest claims
(pause, Csendes) nowhere at all. This order fixes the sequence without inventing a new
visual language.

### Band rhythm

```
1    2    3    4    5    6    7    8    9   10   11   12   13   14
──── ──── ──── ▓▓▓▓ ──── ▓▓▓▓ ──── ▓▓▓▓ ──── ▓▓▓▓ ──── ████ ──── ░░░░
cream          navy      navy      navy      navy      PHOTO      sage
                         ↑ price
```

The dark bands are the page's four *moments*: the TV claim, the price, the flexibility
claim, the finish payoff. Section 12 gets a treatment belonging to no other section,
because Alexa is the brand rather than a section.

**Revised 2026-08-11** — the price anchor moved from 12 to 6, directly under Programok.
Bands 4–11 now alternate strictly cream/navy. That is more regular than the original
rhythm, but the alternation is what keeps the anchor from clumping against the two navy
bands that used to sit near it at 9 and 12.

---

## Section by section

### 1 · Hero — KEPT

Untouched structurally. It already does the job: promise, her face, the price, one button.

- **Changes:** nav anchors rewired to the new section ids. Nothing else.
- **Motion:** **no reveal.** Above the fold must be instant — a `.rise` here animates
  content the user is already looking at.
- **Assets:** ★ refreshed portrait from the founder shoot.

### 2 · Hogyan működik — NEW

The single biggest miss on the current page: every CTA says "Összeállítom a tervem" and
nothing ever explains what that means.

- **Learns:** seven questions, about a minute, no card — and a built week comes out.
- Three steps, three real screens: onboarding question → week-plan reveal → press play.
- **Numbering is legitimate here** — it *is* a sequence, so 1/2/3 carries real information.
- **Reuse:** `.panel`, `.frame`, `.rise.seq` (80ms stagger, left to right).
- **Assets: LANDED 2026-08-11.** `/step-1-question.png` (the adaptation question),
  `/step-2-plan.png` (the finished week), `/step-3-player.png` (the player mid-workout) —
  all 772×1664 from the same capture, so the row reads as one journey.
- **Mobile became a snap rail.** 3-up was correct for placeholders; with real 772px
  screenshots it rendered each at 109px (14% scale). Now 68vw ≈ 265px.

### 3 · Edzés Alexával — MERGED (follow-along + adaptation)

One section now answers both "what is a session?" and "will it work in my flat?"

- **Rule: capability, not mirror.** The chips show what the product does — never
  "Fáj a térded?". Nobody is excluded and the differentiator still lands.
- Chip row: `🔇 Csendes · 🪑 Falra fogva · 🧘 Lazító · 🌅 Reggeli · 🌙 Esti`.
- **Why it matters:** Csendes is the one thing no Hungarian competitor communicates, and
  it is currently absent from `/` entirely.
- **Data:** chip labels from `filters/type` via ISR so the page can't drift from the taxonomy.
- **Assets: LANDED 2026-08-11** — not a screenshot but a **silent looping screen
  recording** of the mobile player (`/player-demo.mp4`, 22s, 496KB). A still cannot show
  the countdown ticking or the Mai menü checking itself off, which is the whole claim.
- **Superseded:** the plan to embed the live `/player/F007` (see `09-player-embed-analysis.md`)
  was dropped in favour of the recording — same evidence, none of the security surface.

### 4 · Nagy képernyő — KEPT, moved up

Moved up two slots to break a four-cream run and because it belongs with the session
story: you follow along — and you can do it on the TV.

- **Changes:** structure untouched; only the two placeholders get filled.
- **Assets:** ★ living room with a workout on the TV · phone in hand mid-workout.

### 5 · Programok — REBUILT

The page currently implies there is one program and sells it with nine invented titles.

- **Learns:** how many programs exist, that **all** of them are in one subscription, and
  that new ones keep arriving.
- **Data:** ISR — published `programs/` + session counts + a curated workout set.
- **Reuse — updated 2026-08-11:** the section renders the **real app components**, not
  landing lookalikes. `ProgramBanner` (extracted from `/app/programs` so both surfaces
  share one implementation) for each published program, and the dashboard's
  `WorkoutCard` in an `.hrow` for the workout sample. The landing-only `Coverflow` and
  `.progcard` were deleted.
- **How:** the components are `.lx`-scoped, so they sit in a `.lx.lx-embed` wrapper that
  neutralises only the app shell background; `home.css` + `programs.css` are imported on
  the route. Logged-out differences are CSS-only (the save "+" is hidden — no list exists).
- **Tap:** opens the detail overlay.

### 6 · Ár-horgony — MOVED + RE-POINTED (2026-08-11)

- **Was band 12.** Now sits directly under Programok. An anchor needs the thing it anchors
  against still on screen; nine bands later, "N program, N edzés" was long gone.
- **Was the annual per-week.** Now the weekly entry price. At this point in the page the
  decision is *start / don't start* — asking for a year before the founder, the proof and
  the story have been shown was the wrong ask. Annual per-week stays in the fact row.
- **One add:** "szüneteltethető" joins the fact row. Pause for 1–3 months is built, wired
  end-to-end, and mentioned nowhere on the page.

### 7 · Foundation — RE-BASED

The best-built thing on the current page, describing a product that no longer exists.

- **Problem:** it claims "4 hét, heti 5 nap, fix 30 perc". The shipped model is an ordered
  **pool** — the user's cadence schedules it — and sessions run 5–30 perc.
- **Fix:** same component, re-framed as *your first sessions in order, paced by you*.
  Turns a false claim into the flexibility proof.
- **Data:** ISR — real Foundation sessions, replacing hardcoded `starterWeeks`.
- **Motion:** keep everything — 2.6s per day, chapter dots, click-to-jump, pause off-screen.

### 8 · A heted — NEW

The structural advantage over every fixed PDF plan, currently stated in half a sentence
below the fold inside another section.

- **Learns:** you choose 3–6 days **and which ones**; the rest day is part of the plan and
  doesn't break the streak; missing a day restarts nothing.
- **Live demo.** The one place worth a real interactive moment — tapping days re-flows the
  week. A demo you can touch beats a screenshot of a demo.
- **Assets: none.** Pure UI, so it can ship ahead of the photo shoot.
- **Motion:** press feedback on pointer-*down*; week re-flows on a critically damped
  spring (damping 1.0, ~0.35s) — no bounce, nothing was flicked. Reduced motion → cross-fade.
- **Verified:** arbitrary weekday sets are real (`prefs.plan.weekdays`), so the demo
  promises nothing the app won't do.

### 9 · Haladás — **CUT 2026-08-11**

Removed at the owner's request. It was 34% striped placeholder and its two claims
(automatic completion, the 1/5/8-week photo comparison) are both made elsewhere —
completion in §2 step 3, the photo flow only here. If the photo-comparison argument
is wanted back it needs real imagery, not a re-instated placeholder.

**Side effect on the band rhythm:** §8 A heted (navy) and §9 Amikor kész vagy (navy)
are now adjacent — a 1,462px unbroken dark run. Noted, not fixed.

### 10 · Amikor kész vagy — NEW

The workout narrative currently ends at "press play". This is the payoff, and the page's
first real human proof.

- **Reuse:** `FinishExamples` **as-is** — already dark, already a marquee, already
  data-driven. Needs a `.lxl` style bridge and nothing else.
- **Assets: already done** — 7 consented photos incl. Alexa's new home shot and Ákos.
- **Honesty:** the `· minta` labels **stay**. The photos are real people; the overlay
  numbers are sample values. Real member cards replace them one at a time.
- **Motion:** marquee pauses on hover; must fully stop under reduced motion — verify
  `FinishComplete.css` covers it.

### 11 · Kihívások + közösség — REBUILT (again, 2026-08-11)

The copy always said "amit a **csoportban** kitalálunk" while the page never established
that a group exists. A definite article pointing at nothing.

- **The group now shows itself, not a description of itself.** A group card: the real
  cover art, the name, `Facebook-csoport · 1 200+ tag · ingyenes`, and a join button in
  Facebook's own action colour because that is where it goes.
- **Not a Facebook mock-up.** No invented posts, comments, member names or faces. It is a
  link wearing the group's furniture — what a share card is.
- **Real `ChallengeCard`s.** The archive renders the app's own component, matching the
  §5 decision to stop maintaining landing lookalikes. The landing-only `.unlim-card` and
  `.carousel` are deleted.
- **The whole archive, uncapped.** The reader was capped at 8; a section whose point is
  "eddig ezeket találtuk ki" must not make a growing library look like a fixed set. The
  count is stated next to the heading rather than left to be inferred from a rail.
- **The loop:** the group votes on next week's challenge; every past one lives here,
  filterable, with progress and a shared streak. That is the argument for why a
  free-group member should pay.
- **Number: 1 200+ tag.** The "17 000+ fős ingyenes közösség" claim dies here — that's
  cross-platform followers.
- **Data:** ISR — real `challenges/` and `settings/challenges → fbGroupUrl`, with the
  group URL falling back to a constant so the card can't vanish on a missing settings doc.
- **Height:** 909px at 390×844 against 867px before — the band pays for the group card by
  cutting copy the cover art and the cards already state.

### 12 · Alexa — NEW TREATMENT ★

She's the brand, so she gets the page's visual peak: a full-bleed photographic band
belonging to no other section.

- **Absorbs** the five placeholder chapter cards near the top **and** the "Egyedül nem
  megy" finale. Two half-sections become one strong one.
- **Contains:** her story in three short paragraphs · the credibility frame · the
  three-promise stack · „Egyedül nehéz. Együtt muszáj." · signature · CTA.
- **Thread:** she isn't only here. Her face is in the hero and on the covers; her voice is
  first-person in 2, 3, 6, 7 and 10. The block is the peak, not the only appearance.
- **Assets:** ★★ **the single most important photograph** — full-bleed portrait, at home,
  copy space on one side, landscape-safe, 3:2 at 3000px+.
- **Motion:** portrait stays **still**. A full-viewport moving background is exactly what
  reduced-motion guidance warns against. Text uses the house stagger.

### 13 · GYIK — EXPANDED

- **Edit:** "Hogyan mondhatom le?" gains pause 1–3 hó and downgrade.
- **Add:** "Mennyi időm kell rá?" (5–30 perc) · "Mi van, ha kimaradok?" · "Kapok számlát?"
  · "Mi lesz a fotóimmal?"
- **Motion:** native `<details>`, no height animation.

### 14 · Előfizetés + footer — KEPT

Annual centred and pre-recommended, every card states renewal terms, no fake
strikethroughs. Already above market — don't touch the structure.

- **One add:** "számla" in the trust row. Billingo is already wired into the Stripe webhook.
- Prices stay derived from `PRICES` so the page can't drift from what Stripe charges.

---

## The overlay — workout detail

Not a band. `WorkoutDetail.tsx` is the best sales asset in the repo and currently exists
only behind a login.

- **No preview clip.** Signed Mux tokens need auth + entitlement. The component already
  falls back to cover art when `pb` is null — **the hero slot keeps its place**: same
  aspect ratio, lockup, title and action row. Only the moving image is missing.
- **Remove:** the `ELŐNÉZET · 0:59` badge, preview progress bar, unmute, replay.
- **Remove:** the `84% — neked ajánlott` match score — personalized, meaningless before
  onboarding, and an invented percentage shown to a stranger.
- **Keeps:** description, "Az edzés felépítése" with per-block minutes, facts column,
  "Hasonló edzések".
- **Motion:** scales from the card that opened it (`transform-origin` on the trigger's
  rect), blur and scale animating together so it reads as a surface arriving rather than
  an opacity fade. Damping 1.0, ~0.35s. Escape + backdrop close; scroll lock already handled.
- **Mobile:** full-screen sheet with a drag handle. Dismiss decided by *projected*
  momentum, not release position, rubber-banded at the top — the same constants Coverflow
  already uses.

---

## Cut list

| Removed | Why |
|---|---|
| Cinematic showcase | Five captioned "scenes" that are striped grey boxes, plus a play/pause control for a slideshow of placeholders |
| Programok panel | Generic copy over a placeholder image — replaced by the real catalog |
| App intro band | Three lines of abstraction; §2 does this concretely |
| Founder carousel | Five gradient chapter cards, all placeholders — absorbed into §11 |
| Founder finale | Absorbed into §11, where it lands harder next to her face |
| `coverflowCards` | Nine invented workout titles — the last fabricated content after the truth-purge |
| `starterWeeks` | Hardcoded 4×5 schedule describing a program model that no longer exists |

---

## Build notes

### Data path — the one architectural change

`firestore.rules` gates all content on `isSignedIn()`, so a logged-out visitor cannot read
`programs/`, `videos/` or `challenges/` from the client. Sections 5, 6 and 10 need it.

- `src/app/page.tsx` becomes a **server component** reading published content via the
  Admin SDK, passing a serializable `catalog` prop into `LandingPage.tsx`, which stays
  `"use client"`.
- `export const revalidate` — hourly. Content changes when you publish in `/admin`.
- No rules change, no public endpoint, no scraping surface.
- **Free win:** the homepage becomes server-rendered, unlocking real metadata and
  structured data. Today the entire page is client-side — a cold organic-traffic page
  that renders nothing to a crawler.
- **Handle empty:** if nothing is published, these sections degrade to honest copy, never
  a broken grid.

### Motion — one language, already established

- **Reveal:** keep `.rise` / `.rise.seq` — 0.62s, `cubic-bezier(.22,1,.36,1)`, 80ms
  stagger. **Do not introduce a second reveal language.** Consistency here is most of what
  makes new sections feel native.
- **Press:** feedback on pointer-*down*, not click. `.pill:active` already does this;
  extend to cards.
- **Drag:** Coverflow is the house standard — 1:1 with grab offset, 6px hysteresis,
  momentum projected at `d=0.998`. Any new draggable reuses those constants.
- **Springs:** damping 1.0 / ~0.35s by default. Bounce only after a flick.
- **Reduced motion:** coverflow, journey and CountUp already comply. New: WeekPicker
  cross-fades; verify the finish marquee stops.
- **Sticky nav:** make it a translucent `backdrop-filter` layer with content scrolling
  under, rather than an opaque strip.

### Assets — the critical path

Sections 7 and 10 need nothing and can ship first. Section 11 is blocked on one photograph.

**I capture (7 screenshots):** onboarding question · week-plan reveal · player with the
fullscreen HUD · library filters · progress comparison · weekly ring · finish card.

**You shoot (4):**
1. ★★ Alexa full-bleed portrait for §11 — at home, copy space on one side, landscape-safe, 3:2, 3000px+
2. Hero portrait refresh — 9:16, home setting
3. Living room with a workout running on the TV
4. Phone in hand, workout running

**Done:** the 7 finish-filter photos, converted, oriented, EXIF-stripped. One carried GPS
coordinates — strip every future addition:
`magick <src> -auto-orient -resize x900 -strip -quality 82 public/finish-examples/<name>.jpg`

---

## Carried into the copy phase

- **"Napi 30 perc"** is anchored in three places while the library ships 5–15 minute
  sessions and the app has a dedicated short-workout row. The anchor excludes the
  time-poor buyer those sessions were built for.
- **"17 000+ fős ingyenes közösség"** is followers across platforms, not members.
- Real workout and program counts come from the ISR payload, never typed into copy.
- Voice rules from the strategy docs that transfer cleanly to a wide homepage: short
  sentences, dashes not commas, "Nem X. Hanem Y.", no exclamation marks, no emoji in body
  text, admission over promise. The persona-specific hooks do **not** transfer — they
  belong to the ad landing pages.
