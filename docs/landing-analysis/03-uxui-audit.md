# Landing UX/UI audit — Phase 3: heuristics + hedonics

Scope: `src/components/landing/LandingPage.tsx`, `src/app/landing.css`, live
render (desktop 1440px). Framework: Nielsen heuristics × Apple design
principles (response, direct manipulation, interruptibility, spatial
consistency, materials, typography, reduced motion) × hedonic quality
(stimulation / identification / pragmatic balance). Copy/trust issues live in
01; market gaps in 02. This doc is about how the page *feels and behaves*.

## 0. Verdict

The page's interaction craft is well above template grade: one unified reveal
system, three self-playing product tours with real pause/scrub affordances,
honest pricing cards, and a thorough `prefers-reduced-motion` story. Its
weaknesses are the inverse of its strength: almost all motion is *autonomous*
(timers performing at the user) rather than *responsive* (motion answering the
user's hand), several signifiers promise interactions that don't exist, and a
handful of legibility floors (8.5–11px mono at low opacity) undercut the
premium feel. Fixing the five signifier/legibility items and adding two
gesture-driven moments would move it from "polished" to "alive".

---

## 1. What's genuinely good (keep, and don't regress)

- **One motion system.** `--ease-out / --rise-y / --rise-dur / --rise-step`
  shared by every section; block-level and staggered variants of the same
  move. This is exactly the "every timing value is a deliberate choice"
  discipline — rare on marketing pages.
- **Showcase player agency.** Play/pause button with correct state, per-chapter
  scrub buttons with `aria-label`, viewport-pause via IntersectionObserver,
  user-pause as separate explicit state, caption crossfade timed to scene
  swap. This is the best interaction on the page.
- **Reduced motion is a real design, not a kill switch.** Auto-players freeze
  to sensible static frames, reveals become visible-by-default, hover lifts
  disabled, scene swaps degrade to opacity. (§14 of the apple-design skill,
  done right.)
- **Pricing cards.** Whole-card link targets, focus-visible rings, featured
  outline without fake discounts, hover lift consistent with every other card.
- **Consistent visual language with the product.** The category cover gradient
  formula is literally the app's `LxCover` — the marketing page shows the real
  product's skin, which quietly builds trust.
- **Press feedback** on `.pill:active` (1px translate) is instant — correct
  response-on-pointer-down instinct.

## 2. Heuristic findings (ranked by severity)

### A. Signifier mismatches — things that look interactive but aren't
1. **Coverflow cards look swipeable but can't be dragged.** A carousel of
   overlapping cards is the strongest swipe affordance on the web; here the
   only interaction is click-to-center (`cursor: pointer` on every card, no
   drag, no wheel, no keyboard). On the eventual mobile pass this becomes a
   broken expectation on the page's most tactile-looking element. Fix
   options (ranked): (a) pointer-drag with 1:1 tracking, velocity handoff and
   snap-to-card (apple-design §2/5/6 — `setPointerCapture`, project momentum,
   spring to nearest index); (b) at minimum, arrow buttons + keyboard support.
   Note: cards are `div onClick` — not reachable by keyboard at all today.
2. **Journey day rows read as an accordion but only the tiny chapter bars are
   interactive.** Rows highlight, expand, and dim like controls; clicking them
   does nothing (only the 4 progress bars at the bottom are buttons). Making
   each row a button that sets the tick is a ~5-line change and turns the
   page's best section into an explorable one.
3. **Hero "Bemutató →" implies video; delivers an auto-tour of placeholders.**
   Covered in 01, but it's also a UX contract: if it stays, it should scroll
   to a *click-to-play* artifact (02 C7), not an ambient loop.

### B. Legibility floors (contrast/size)
4. **Badge labels at 8.5px** (`.badge .lab`) with letter-spacing — below any
   reasonable floor; combined with 12 identical clock glyphs the section reads
   as lorem ipsum. (Section is being replaced per 01 §3.11 — whatever replaces
   it must not inherit the type size.)
5. **The two strongest trust facts render at the page's lowest visual
   priority:** hero trust line and `hero-price` are 11–12.5px mono at 60–90%
   opacity on sage. On the claim hierarchy these deserve body-size treatment;
   at minimum raise to ≥12px at ≥80% opacity and drop the tracking.
6. **Sticky-nav vibrancy fails over dark bands.** `oklch(...)/.58` ink links on
   a 60%-white blurred pill are fine over cream, muddy over `--navy` sections
   (observed live). Apple's rule: over changing backgrounds use
   higher-contrast, slightly heavier text — or make the material adaptive
   (raise background opacity when over dark bands, e.g. via
   `animation-timeline: scroll()` or an IO toggling a `.on-dark` class).
7. **Placeholder-dependent text.** Trainer-card `role`/`name` (white) are
   unreadable on light striped placeholders; fine once real (dark) photos
   exist — add a scrim/gradient guard anyway so the design doesn't depend on
   photo luminance.

### C. Wayfinding & spatial consistency
8. **Anchor jumps are instant** (`scroll-behavior: auto`) — sticky-nav clicks
   teleport, which breaks spatial continuity on a 12,000px narrative page and
   can land mid-stagger (observed: navy void on price-anchor/founder-finale).
   Add `html { scroll-behavior: smooth }` scoped to the landing (with the
   reduced-motion override), or a JS eased scroll. Also consider
   `scroll-margin-top` on section ids so the sticky pill doesn't overlap
   headings.
9. **Nav labels are app-internal jargon for a stranger** (VALÓS IDEJŰ,
   HALADÁSOM, RECEPTEK, FOUNDATION). Nielsen "match the real world": a cold
   visitor needs benefit words (Edzések · Program · Bemutató · Eredmények ·
   Árak). RECEPTEK must go regardless (01 §3.13).
10. **One-shot reveals under-serve fast scrollers.** `Rise` unobserves after
    firing; a user who scrolls fast then back up sees static content — fine —
    but a user who *jumps* (nav click) may watch the tail of a stagger. Lower
    `--rise-dur`/`--rise-step` cost by triggering at higher rootMargin
    (e.g. `rootMargin: "0px 0px -10%"`) so reveals largely finish before the
    content is centered.

### D. Motion & performance
11. **Journey animates `max-height` every 2.6s forever.** The expanding day
    card transitions `max-height` (layout + paint, not compositor) on a timer
    for as long as the section is visible. Swap to `grid-template-rows: 0fr/1fr`
    (still layout but cheaper and modern) or transform/clip-path; or at least
    pause when tab is hidden (IO already pauses off-viewport ✅).
12. **Ambient loops sit near the vestibular caution band.** Hero aura breathes
    at 7s (~0.14Hz) *and* the phone floats at 6s (~0.17Hz), overlapping in the
    hero; the skill warns about slow full-surface oscillations near 0.2Hz.
    PRM disables both ✅, but consider: one ambient motion per viewport, not
    two stacked.
13. **Three autonomous players can be co-visible** (coverflow 2.8s, journey
    2.6s, showcase 5s ticks) on tall viewports — competing rhythms with no
    shared cadence. Cheap fix: only the most-visible auto-player runs (single
    "active tour" arbiter), others hold their first frame.
14. **Coverflow transform transition is 0.6s CSS** — on click-to-center it
    can't be redirected mid-flight (interruptibility). Acceptable today;
    becomes the natural spring-migration candidate if drag (A1) is built.

### E. Small correctness/craft items
15. `Rise` on the pricing grid staggers cards nicely, but `price-badge`
    ("Legnépszerűbb") is inside the card and pops with it — fine; however the
    badge overflows the card top and can clip against the band edge on short
    viewports (observed at 11,100px scroll) — give the grid `padding-top`.
16. Footer legal links `href="#"` are also a keyboard/screen-reader trap
    (focusable no-ops) — independent of the legal-content fix in 01.
17. `hero-cta2` is an `<a href="#youtube">` styled as quiet text — fine — but
    inconsistent with `hero-cta2:focus-visible` being defined while carousel
    cards have no focus treatment at all: do one keyboard pass over the page.
18. Duplicate CTA taxonomy: "Kezdd el a programot" (hero/nav/foot),
    "Válaszd ki a csomagod" (4 panels), "Csatlakozz a csapathoz" (finale),
    "Kezdd el még ma" (pricing), "Ezt választom" (cards). Five verb frames
    for two destinations. Reduce to two: one *start/quiz* frame, one *choose
    plan* frame (02 C2 for wording).

## 3. Hedonic assessment (what makes it feel good — and what's missing)

**Stimulation — present, machine-driven.** The page performs for you:
coverflow rotates, journey tours a week, showcase flips scenes. As theatre
it's good (it demos a *living* product), but the user's hand is never in it.
The three highest-value hedonic additions are all *participation*:

- **Draggable coverflow with momentum + snap** (A1). The flick-throw-settle
  loop is the single most "alive" gesture pattern; the cards are already
  sized/spaced for it.
- **Clickable journey rows** (A2) — explore-a-week-by-hand beats
  watch-a-week-play.
- **Price-anchor count-up.** The "767 Ft" reveal is the page's emotional
  pivot; a 0.6s count-up (or per-digit roll) on first reveal, PRM-guarded,
  makes the number land as an *event*. Cheap, high-yield.

**Identification — currently absent.** Hedonic identification ("this product
is for people like me, made by someone I like") is carried by the founder's
face, member faces, and audience cues — all missing (placeholders, no
audience statement, no human). No amount of motion polish substitutes; this
is the same finding as 01 §1.2 seen from the feel side.

**Evocation/coherence — strong.** Category gradients, ring + word cover motif,
mono eyebrow system, sage/navy/cream banding: the page has a recognizable
visual voice that matches the app. Guard it during the claim-purge rewrite.

**Micro-feel gaps (cheap wins):**
- Card hover lifts exist; card *press* states don't (only `.pill` has
  `:active`). Add the same 1px press or scale(0.98) to unlim/trainer/price
  cards.
- `sc-play` hover scales 1.05 with a 0.2s transition — the only hover-scale
  on the page; either adopt it for the chapter bars (grow tap target on
  hover) or drop to match the flat system.
- The `panel` glass sheen (`::before` diagonal light) is static; a one-time
  4s sheen sweep on first reveal (PRM-guarded) would sell the material as
  material — apple-design's "materialize, don't just fade".

## 4. Typography notes (apple-design §15 lens)

- Display tracking is correctly negative and size-scaled (`-.02` → `-.03em`);
  body at 1.58 leading is comfortable; `text-wrap: pretty/balance` used
  throughout — good.
- The mono-uppercase-tracked label system is the brand's texture but is used
  at 5 distinct sizes from 8.5px to 13px; consolidate to a floor of 11px and
  two sizes. Wide tracking (`.14em+`) below 11px is where legibility dies.
- `h-thin` lowercase headings ("edzés, amikor neked jó") are a distinctive
  voice; ensure the pattern survives copy rewrites (mixed-case replacements
  would flatten the system).
- Poppins over system font is a deliberate brand call — fine; keep loading via
  `next/font` (already done) and check `font-display` swap behavior when real
  LCP images land.

## 5. Mobile follow-ups (needs on-device pass — not verifiable this session)

1. Sticky pill with 5 links + CTA at ≤560px — likely overflows; design a
   mobile variant (wordmark + CTA only, or CTA-only bottom bar per 02 C3).
2. Coverflow at 320px height with 214px cards — verify adjacent-card peek and
   tap targets.
3. Journey `journey-inner` single-column: the week text stacks above 5 day
   rows — verify the auto-play cadence doesn't scroll-jump when the card
   expands (`max-height` change above the fold shifts layout).
4. 12k-px page on mobile ≈ very long thumb distance with no shortcut back to
   pricing — the sticky CTA solves this.
5. Hero `clamp(44px…84px)` headline + 490 Ft line + CTA row must all fit the
   first screen at 390×844 — verify nothing pushes the CTA below the fold.
