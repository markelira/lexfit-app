# /register — mobile redesign plan

**Scope:** `/register` (the join wizard, `src/app/onboarding/OnboardingV2.tsx`) at viewports
**< 768px only**. Desktop (≥1024px) and the tablet band (768–1023px) render byte-for-byte
what they render today. No question, answer, label or body copy changes — layout, material,
type and motion only.

**Direction:** immersive full-bleed. The step photo that today lives in the desktop left
column becomes the mobile background; the question rides above it on a dark glass sheet.

**Design source:** the `apple-design` skill. Section references below (§1, §12, §15…) point
at it, so every value here is defensible rather than taste.

**Status:** PROPOSED — nothing built yet. Approve or amend, then I implement.

---

## 0. Decisions already locked

| # | Decision | Value |
|---|---|---|
| D1 | Which page | `/register` join wizard — *not* the `/terv` kvíz |
| D2 | Visual direction | Immersive full-bleed photo + glass sheet |
| D3 | Step scope | All screens **except `pay`** (Stripe stays light) |
| D4 | Photo rhythm | A new photo every step (existing `BrandPanel` mapping, unchanged) |
| D5 | Motion | Full Apple-style: interruptible springs, swipe-back, press feedback, haptics |
| D6 | Images | Optimize properly (both mobile *and* desktop delivery) |
| D7 | Reference | None — direction defined here from `apple-design` + existing LEXFIT tokens |
| D8 | Captions | **Shown**, quiet, in their own zone — reasoning in §2.3 |
| D9 | Spring | Hand-rolled `src/lib/spring.ts` — no new dependency (§4.1) |
| D10 | Primary CTA | Solid white, ink text — 8.4:1 on the sheet (§3.1) |
| D11 | Checkpoint | Review after build step 3 (static layout + contrast audit, no motion) |
| D12 | Verification | Chrome device emulation. Real-iOS repaint cost stays **unverified** (§8.1) |

---

## 1. What is wrong today

Mobile is not a design, it is a fallback. At `max-width: 767.98px` (`onbv2.css:760`) the
funnel does exactly four things: hides `.authx-brand`, collapses the grid to one column,
sticks the footer, and shrinks the type. Consequences:

1. **All eleven brand photos are dead weight on mobile** — downloaded on desktop only,
   `display: none` on phones, where most paid traffic actually lands.
2. **No social proof anywhere in the mobile funnel.** „1 200+ csoporttag, akik már
   csinálják." exists only in the desktop `BrandPanel` caption.
3. **Seven near-identical white screens.** Nothing marks progress emotionally; the only
   difference between Q3 and Q6 is the words.
4. **Motion is one `setTimeout(onNext, 240)`** (`OnboardingV2.tsx:387`). Steps hard-cut.
   There is no back gesture, so `fnl-back` (a 40px target in the top-left corner) is the
   only way back — the worst-reachable point on a phone.
5. **Hard 1px dividers** above the footer and below the header — the "opaque strip"
   pattern §12 explicitly argues against.

---

## 2. The composition

### 2.1 Layers

Three stacked layers filling `100dvh`, no page scroll:

```
┌─────────────────────────────┐
│ L0  photo        fixed, cover, object-position 50% 32%
│ L1  scrim        gradient, guarantees text contrast
│ L2  content      grid: chrome · caption · sheet
└─────────────────────────────┘
```

L0/L1 are the existing `<BrandPanel>` — **no JSX move required**. Today `.authx-shell` is a
two-column grid; on mobile both children get assigned to the same single grid cell, brand at
`z-index: 0`, `.fnl-col` at `z-index: 1`. Pure CSS.

### 2.2 The content grid

```
grid-template-rows: auto 1fr auto;   /* chrome · caption · sheet */
```

```
┌─────────────────────────────┐
│ ‹      ▬▬▬▬▭▭▭        3 / 7 │  chrome  — floating, no border, no bar
│                             │
│                             │
│  A KÖZÖSSÉG                 │  caption — flex, absorbs slack
│  1 200+ csoporttag,         │
│  akik már csinálják.        │
│                             │
│ ╭───────────────────────────╮
│ │ Mit szeretnél elérni?     │  sheet   — dark glass, radius 28 top
│ │ Bármikor változtathatsz.  │
│ │ ┌───────────────────────┐ │
│ │ │ 🔥  Fogyás          ○ │ │
│ │ ├───────────────────────┤ │
│ │ │ 💪  Erősödés        ○ │ │
│ │ └───────────────────────┘ │
│ │ [       Tovább        ]   │
│ ╰───────────────────────────╯
└─────────────────────────────┘
```

The **caption row is elastic** (`1fr`) and the sheet sizes to its content. A 6-option
question grows the sheet and shrinks the photo band; a 3-option question lets the photo
breathe. The sheet caps at `78dvh` (`88dvh` on `reveal`/`plan`, `92dvh` on `focus-within`
so the iOS keyboard doesn't bury the textarea) and scrolls internally past that. Photo band
never drops below `18dvh` — below that the image reads as a stripe, not a scene.

### 2.3 Why captions stay (D8)

You left this to my judgement, conditional on ad performance. Showing them:

- `/register` is the **destination for cold paid traffic**. Cold traffic needs continuous
  reassurance, and the funnel currently offers zero between the ad click and the paywall.
- „1 200+ csoporttag, akik már csinálják." is the **only social proof in the entire mobile
  funnel**, and it is already written, already approved, already on desktop. Free lift.
- Without a caption, the photo band is decoration. With one, it is the answer to *"why am I
  filling this in?"* — asked silently on every step of every questionnaire.

Guardrails so it cannot hurt: the caption lives **above** the sheet, never inside it; it is
one line, `22px`, never competing with the `27px` question below it; and it is the first
thing to compress when a long question needs the room.

### 2.4 Per-step notes

| Step | Photo | Treatment |
|---|---|---|
| `welcome` | `welcome.jpg` | **No sheet.** Slogan + CTA sit directly on the scrim, bottom-anchored. The strongest ad-landing frame — an interface that looks like a magazine cover, not a form. |
| `goal`…`obstacle` | per existing map | Standard composition above. |
| `days` | `days.jpg` | `Segmented` → glass track, selected pill solid white. Day boxes → glass, selected `--accent-2`. |
| `why` | `story.jpg` | Textarea = `rgba(255,255,255,.08)` fill, white text, accent caret. Sheet expands to `92dvh` on focus. |
| `reveal` | `promise.jpg` | Sheet at `88dvh`, scrolls. The green `WeekRing` **gains** from the dark ground — this becomes the signature frame of the funnel. |
| `plan` | `reassure.jpg` | Sheet at `88dvh`. Plan rows + badge get dark variants. |
| `account` | `reassure.jpg` | Inputs → glass. **Google/Apple OAuth buttons stay white** — Google's brand guidelines require it, and they read correctly as bright chips on dark. |
| `pay` | — | Unchanged. See §5 for the dark→light handoff. |

---

## 3. Material and type

### 3.1 Materials (§12)

**The single most important detail here:** §12 forbids stacking a light translucent surface
on another. So **only the sheet carries `backdrop-filter`.** Option rows are flat tint fills
painted on the already-blurred sheet — they are *not* separately blurred. Getting this
backwards is what makes glass UIs turn to mud.

| Surface | Spec |
|---|---|
| Sheet | `background: rgba(16,22,19,.72)` · `backdrop-filter: blur(30px) saturate(140%)` · `border-top: 1px solid rgba(255,255,255,.14)` (bright edge = light catching the material) · `border-radius: 28px 28px 0 0` |
| Option row, resting | `rgba(255,255,255,.10)` fill · `1px solid rgba(255,255,255,.16)` · no blur |
| Option row, pressed | `rgba(255,255,255,.16)` · `scale(.975)` |
| Option row, selected | `--accent-2` (`#496c5e`) at 92% · border `--accent` (`#7a9b8d`) · white check |
| CTA | **Solid white, ink text** (D10) — inverted from desktop's ink-on-white. On dark glass a solid-white button is the brightest object on screen, which is exactly what the primary action should be. 8.4:1 against the sheet. Brand colour stays on the *selected* row, so CTA and selection never read as the same family. |
| Scrim | `linear-gradient(180deg, rgba(10,14,12,.55) 0%, rgba(10,14,12,.26) 34%, rgba(10,14,12,.66) 100%)` |
| Chrome | No background, no border. §12: scroll-edge fade, never a 1px divider. |

**Contrast floor.** Worst case is a blown-out white region of a photo behind the sheet:
`0.28 × 255 + 0.72 × 19 ≈ 85` luminance → white text ≈ **7.4 : 1**. Passes AA comfortably
with margin for any photo. The caption sits on scrim only, not glass — I will verify each of
the eleven photos empirically at the caption's y-band and report any that fail; a failing
photo needs a stronger local scrim or a recrop, and I will flag it rather than ship it dim.

### 3.2 Type (§15 — tracking and leading are size-specific)

| Role | Size | Weight | Tracking | Leading | Colour |
|---|---|---|---|---|---|
| Caption eyebrow | 10px mono | 500 | `+0.1em` | 1 | `rgba(255,255,255,.72)` |
| Caption line | 22px | 300 / `b` 700 | `-0.02em` | 1.15 | `#fff` |
| Question `.fnl-q` | 27px | 700 | `-0.028em` | 1.14 | `#fff` |
| Sub `.fnl-sub` | 14.5px | 400 | `0` | 1.5 | `rgba(255,255,255,.72)` |
| Option label | 16px | 600 | `0` | 1.3 | `#fff` |
| Option sub | 13.5px | 400 | `+0.005em` | 1.4 | `rgba(255,255,255,.64)` |
| Counter / mono | 11px | 500 | `+0.08em` | 1 | `rgba(255,255,255,.72)` |

Two deliberate changes from today's mobile: the question drops from `800` to `700`
(800 is a shout on a dark ground), and gains negative tracking, which today's fixed scale
does not apply at any size. Spacing moves to `rem`/`em` so Dynamic Type scaling doesn't
break the grid.

---

## 4. Motion

### 4.1 The spring

No animation library is installed (`package.json` has neither `motion` nor
`framer-motion`), and CSS transitions **cannot** be grabbed and reversed mid-flight — §3
rules them out for anything gesture-driven.

**Decided (D9): hand-roll `src/lib/spring.ts`** — ~90 lines, a `rAF` spring taking Apple's
two designer parameters (`bounce`, `duration`) rather than mass/stiffness/damping, animating
from the *presentation* value and blending velocity on re-target. Rationale: the codebase
has zero animation dependencies and hand-rolls its CSS by policy; exactly two things animate
(a step container's X, and the sheet); and a 90-line file we own beats an 18KB dependency
for that surface area.

Fallback if it proves fiddly in practice: `npm i motion` and use `animate()`. Motion's
`bounce`/`duration` spring API maps 1:1 onto Apple's damping/response, so every value in
this document carries over unchanged and no other decision is affected.

### 4.2 Step transitions — the iOS nav-stack model

Forward and back travel **the same path** (§7): the outgoing step slides one full width, the
incoming step arrives from the opposite edge, and the **photo layer parallaxes at 30% of the
sheet's travel** — the depth cue iOS uses on every push/pop.

Full-width (not a 28px nudge) specifically because the swipe gesture tracks 1:1 across a
full width. If the programmatic transition moved 28px and the finger moved 390px, gesture
and animation would describe two different interfaces.

| Event | Spring | Notes |
|---|---|---|
| Programmatic next / back | `bounce 0`, `duration 0.40` | Apple's move preset (damping 1.0 / response 0.4). No overshoot — nothing was flicked. |
| Swipe release, commit | `bounce 0`, `duration 0.35`, `velocity = release velocity` | Velocity handed off so there is no seam between finger and animation (§5). |
| Swipe release, snap back | `bounce 0.2`, `duration 0.35`, velocity handed off | Slight overshoot is *correct* here — momentum preceded it (§4). |
| Photo cross-fade | 320ms opacity, runs with the slide | |

### 4.3 Swipe-back

- **Origin:** anywhere on the sheet, not an iOS-style 24px edge zone. On a full-screen
  questionnaire an invisible edge strip is undiscoverable; the whole sheet is the handle.
- **Disambiguation (§10):** track both axes from the first move. 10px hysteresis. Horizontal
  wins → drag; vertical wins → the sheet scrolls. If the sheet is already scrolled off the
  top, vertical always wins. Losers are cancelled confidently once intent is clear.
- **Tracking:** Pointer Events + `setPointerCapture`, 1:1, respecting the grab offset (§2).
  Feedback is continuous the whole way — the photo parallaxes and the previous step's sheet
  edge appears behind, so you can see what you're going back to.
- **Leftward (forward) drag:** rubber-banded, never commits (§9). You cannot swipe past an
  unanswered question. `rubberband(overshoot, w, 0.55)`.
- **Commit rule (§6):** project the release point with
  `current + (v/1000) · 0.998/(1−0.998)`, then commit if the projection passes 50% width
  **or** rightward velocity exceeds 500 px/s. Decision uses the velocity *sign*, not the
  release position — a fast short flick commits, a slow long drag that reverses does not.
- **Interruptible throughout (§3):** grabbing a settling step re-targets from its live
  transform with velocity blended, so a reverse never hits a brick wall.

### 4.4 Micro-interactions

| What | Value |
|---|---|
| Option press | `scale(.975)` on **pointer-down** (§1 — not on click), 100ms ease-out. CSS `:active` is fine; it isn't gesture-driven. |
| Selection check | Springs in `bounce 0.2`, `duration 0.30` |
| Option entrance | `translateY(10px) → 0` + fade, 26ms stagger, `bounce 0`, `duration 0.34`, total stagger capped at 160ms |
| Progress bar | Width springs `bounce 0`, `duration 0.4`; 3px track `rgba(255,255,255,.22)`, white fill |
| Auto-advance | Stays at 240ms. Check springs at 0ms, transition starts at 200ms, so the confirmation is *seen* before the screen moves — but §1 says be vigilant about latency, so it does not grow. |
| Sheet on `reveal` | Materializes: blur radius and scale animate together (§12), rather than a flat fade |

### 4.5 Haptics (§13)

`navigator.vibrate(8)` on exactly two events: selection commit, and swipe-back commit —
fired on the **same frame** as the visual (§13 harmony), never behind a transition.
Two moments only, per §13's utility rule; over-feedback trains people to ignore all of it.

**Honest limitation:** the Vibration API is Android-only. iOS Safari ignores it and there is
no web equivalent. iPhone users get the visual and nothing else. It costs two lines, so it
is worth having for the Android half, but do not expect it on your own phone.

### 4.6 Accessibility (§14)

| Signal | Response |
|---|---|
| `prefers-reduced-motion` | 180ms opacity cross-fades. No translate, no parallax, no stagger, no overshoot. **The swipe gesture still works** — it commits without spring. Reduced motion means a gentler equivalent, not no feedback. |
| `prefers-reduced-transparency` | Sheet → solid `#141a17`, blur dropped. Option rows → solid `#1e2621`. |
| `prefers-contrast: more` | Near-solid sheet, `1.5px` defined borders on rows, caption gets a solid plate. |

Also preserved unchanged: focus management on step change (`useLayoutEffect`,
`OnboardingV2.tsx:215`), the `aria-live` step announcement, the `radiogroup` roving-tabindex
keyboard model, and every `aria-label`. The swipe gesture is **additive** — `fnl-back` stays
exactly where it is for keyboard and assistive tech.

---

## 5. The `pay` handoff

`pay` stays light per D3, which means one screen transition crosses from a dark immersive
surface to a white one. §14 warns against abrupt brightness jumps.

Entering `pay`: the photo and scrim fade out over 260ms while the sheet's background
interpolates `rgba(16,22,19,.72) → #ffffff` and its text colours invert, on the same clock.
It reads as the room lights coming up, not as a different website. Reverse on back.

---

## 6. Images (D6)

`BrandPanel` currently sets `unoptimized`, so all eleven photos ship as raw JPEG —
270KB to **1.2MB** each (`story.jpg` 1.2MB, `reassure.jpg` 838KB, `player.jpg` 724KB),
1600×2133. Under D4 a mobile visitor loads eight of them in about ninety seconds. That is
the single biggest threat to this redesign, since a full-bleed background that arrives late
shows an empty scrim.

Four changes:

1. **Static imports.** Replace the `src={`/onboarding/${k}.jpg`}` template with a static
   import map. This gives compile-time dimensions and, critically, an automatic
   `blurDataURL` — so a slow photo shows a blurred colour field, never a void.
2. **Drop `unoptimized`**, add `sizes="(max-width: 767px) 100vw, 50vw"`. Next then serves
   WebP at device width — ~1290px on a 3× phone instead of the full 1600px — for roughly a
   **6–8× reduction**, improving desktop identically (D6). Without `sizes`, a `fill` image
   is requested at the largest breakpoint on every device, which is half of why these cost
   what they cost today.

   Two Next 16 specifics, checked against `node_modules/next/dist/docs` per AGENTS.md:
   `quality` must now match an entry in `next.config` `images.qualities` (default `[75]`)
   or it silently snaps to the nearest allowed value; and `formats` defaults to WebP with
   AVIF opt-in. **Neither is worth a config change here** — the saving comes from resizing,
   not from the quality knob, and AVIF buys ~20% on top of an already 6–8× win while
   encoding ~50% slower on first request, which is the wrong trade for a background image
   on a cold-traffic landing page. So: no `next.config.ts` change at all.
3. **`placeholder="blur"`** on every step photo.
4. **Preload step N+1's photo** while the visitor reads step N. This is what makes "a new
   photo every step" viable rather than a stutter on every advance.

The one trade-off, noted in the existing code comment: without `unoptimized`, a replaced
photo file can be briefly cached in dev. `.next/cache` clear, or a query-string bump.

---

## 7. Files

| File | Change |
|---|---|
| `src/app/onboarding/onbv2.css` | Replace the `max-width: 767.98px` block (~44 lines) with the full mobile layer (~320 lines). **Every rule scoped `.fnl-wiz` + the media query**, so `/login`, `/subscribe` and the shared `RegisterForm` are untouched. |
| `src/components/onboarding/BrandPanel.tsx` | Static imports, drop `unoptimized`, `sizes`, blur placeholder, next-step preload, caption exposed on mobile |
| `src/app/onboarding/OnboardingV2.tsx` | Wrap the step body in `<StepStage>`; no logic, state, tracking or copy changes |
| `src/components/onboarding/StepFrame.tsx` | One wrapper element for the sheet + an optional caption slot |
| **new** `src/components/onboarding/StepStage.tsx` | Gesture recognition + transition host |
| **new** `src/lib/spring.ts` | The spring (unless we take `motion` instead — §4.1) |
| `src/app/login/auth.css` | **Untouched** |

Untouched by design: `MOCK` copy, `PAYWALL_PLANS`, `EmbeddedPay`, `RegisterForm` logic,
`onboarding-draft`, `trackOnboardingStart`/`trackCheckoutStart` (they keep firing at exactly
the same moments), the URL-as-source-of-truth step model, and the resume-from-draft path.

---

## 7b. Checkpoint results (build steps 1–3 — BUILT)

Measured with a CDP harness driving headless Chrome at 402×874 (`scratch/shots.mjs`),
because the browser extension could not resize its window below ~728px.

### Caption contrast — white text over photo + scrim

Sampled from the **real composited pixels** in the caption's bounding box, with the caption
glyphs hidden so the measurement is of the backdrop rather than the text against itself.
`p05` = the 5th-percentile-brightest pixel, i.e. near-worst-case for white text.

| Step | Photo | Before plate (p05) | After plate (p05) |
|---|---|---|---|
| goal | community | 3.17 ✗ | **7.31** ✓ |
| focus | focus | 2.75 ✗ | **6.34** ✓ |
| level | level | 2.75 ✗ | **6.34** ✓ |
| days | days | 2.75 ✗ | **6.34** ✓ |
| time | player | 3.96 ✗ | **8.55** ✓ |
| env | env | 2.94 ✗ | **7.42** ✓ |
| obstacle | alone | 2.94 ✗ | **7.42** ✓ |
| why | story | 4.42 ✗ | **9.61** ✓ |

**All eight failed WCAG AA on the page scrim alone** — several of these images are
near-blown-out white in exactly the band the caption occupies. Fixed with a local gradient
plate behind the caption only (`.bp-cap::before`), rather than darkening the whole top of
every photo to solve a problem that exists behind ~90px of text. Worst case is now 5.78:1
with margin for replacement photography. Re-run the harness if the caption geometry or the
photos change.

### ⚠ Imagery — the finding that matters

**Only 2 of the 11 assets are photographs.** The rest are product screenshots and device
mockups on white backgrounds:

| Asset | What it actually is | Full-bleed verdict |
|---|---|---|
| `welcome.jpg` | Woman stretching on a mat, real room | ✅ excellent |
| `story.jpg` | ~20 real people outdoors by a bridge | ✅ excellent |
| `player.jpg` | Living room with a TV — real interior | ◐ usable |
| `reassure.jpg` | Designed key art with baked-in "OTTHON" type | ◐ clashes with our own type |
| `community.jpg` | Laptop mockup of the Szavazz Magadra page | ❌ |
| `days.jpg` | Hand holding an iPhone, white background | ❌ |
| `env.jpg` | Hand holding an iPhone, white background | ❌ |
| `focus.jpg` | Laptop mockup + floating UI cards | ❌ |
| `level.jpg` | Floating UI panels on white | ❌ |
| `promise.jpg` | A workout detail card render on white | ❌ |
| `alone.jpg` | **iOS photo-picker screenshot** ("3 Photos Selected") | ❌ |

The direction assumes photography. On a white-background mockup the top ~40% is blank, and
the middle shows meaningless cropped UI fragments — the effect is "screenshot behind frosted
glass", not immersion. This is a content problem, not a CSS one: the layer is doing its job
on `welcome` and `why`.

Two content mismatches also became visible only at full-bleed:

- `community.jpg` carries „1 200+ csoporttag, akik már csinálják." but shows **a laptop**,
  while `story.jpg` — an actual photograph of ~20 real people — is captioned „Az alapító".
  **Swapping those two mappings is free and fixes both.**
- `alone.jpg` under „Egyedül nehéz. Együtt muszáj." is an iOS photo-picker UI.

### Other fixes made during the pass

- Sheet cap 78 → 82dvh; five-option questions did not fit and the last row was cut.
- Action bar made a heavier dark material with a 40px scroll-edge fade — the previous
  translucent fade let option text read straight through the button.
- `reveal`: rest-day legend pills inherited the light `--surface-2`, rendering rest days as
  bright chips that read as *selected*. Stat-grid dividers were bright scratches.
- `plan`: `PaywallOffer` is built from light tokens — its title rendered near-black on the
  dark sheet and its feature tiles were solid white blocks pasted onto glass.
- `account`: no `.fnl-foot` on that step, so the legal line ran into the home indicator.

### Desktop

Verified unchanged at 1440×900 across all steps — split screen, photo left with bottom-left
caption, white form right, ink CTA. The `display: contents` sheet wrapper and the
media-query scoping did what they were supposed to do.

---

## 7c. Motion layer (build steps 4–9 — BUILT)

`src/lib/spring.ts` + `src/components/onboarding/StepStage.tsx`, mounted only when
`isMobile && step !== "pay"`. Verified with `scripts/register-mobile-gestures.mjs`.

| Check | Result |
|---|---|
| Far drag → commit | ✅ `level` → `focus` |
| Slow short drag → snap back | ✅ stays on `level` |
| Fast short flick → commit | ✅ velocity projection overrides distance |
| Leftward (forward) drag | ✅ rubber-bands, never commits |
| Photo parallax | ✅ exactly 30.0% of the sheet's travel |
| Blur dropped mid-drag (§8.1 guard) | ✅ |
| Interrupt a settling screen | ✅ 262px −90px → 172px (continues from the on-screen value) |
| Reversal does not navigate | ✅ |
| Desktop mounts no stage | ✅ 0 `.fnl-layer` at 1440px |
| Reduced motion | ✅ single layer, cross-fade, no transform, rows use `fnlFadeIn` |
| Reduced transparency | ✅ `backdrop-filter: none`, solid `#141a17` |
| Auto-advance still fires | ✅ 6/6 across both motion modes |

### Bugs found by testing, not by reading

1. **`pointercancel` was treated as a release.** The browser cancels when it takes a gesture
   over or the touch is interrupted — the user has decided nothing. Because a cancel's
   last-known velocity projects a long way, this navigated people *backwards out of gestures
   they never finished*. Cancel now always snaps back.
2. **Grabbing a settling screen restarted the drag from zero** — a screen mid-flight at 261px
   snapped to 0 the moment it was touched. This is precisely the jump §3 forbids. A re-grab
   now continues from the presentation value, and a forward push converts seamlessly into a
   back-drag (at forward progress `p` the top layer sits at `(1−p)·w`, which is exactly where
   a back-drag at progress `1−p` puts it).
3. **Class-name collision.** The stage was called `.fnl-stage` — a name already taken by a
   legacy full-screen rule at the top of `onbv2.css` carrying `background: var(--bg)`. It
   painted a light panel straight over the step photo, which also made the white caption
   invisible (contrast collapsed to 1.09:1 across every screen). Renamed to `.fnl-nav`.

### Verification limits — read before trusting the gesture

`Input.dispatchTouchEvent` in headless Chrome fires `pointercancel` immediately after the
first `pointermove`, so a **touch**-driven drag cannot complete in this environment. This was
confirmed to be an emulation artifact rather than our code: it reproduces identically with
`touch-action: none`, `manipulation` and `pan-y`. The gesture suite therefore drives the same
handler with **mouse** pointer events, which are not cancelled.

What that means: the decision logic, the physics, the parallax ratio, the interruption
behaviour and the layering are all verified. **Real-finger behaviour on iOS Safari is not**,
and neither is the `backdrop-filter` repaint cost (§8.1). Both still need a physical device.

### Imagery

The free swap from §7b is done: `community` (caption „1 200+ csoporttag…") now shows the
crowd photograph, and `story` („Az alapító — Alexa") now shows a real photograph of someone
training at home rather than a laptop mockup.

---

## 7d. The designed ground — a stopgap for the missing photography

**This is a workaround for absent assets, not a design preference. It is meant to be
reverted one panel at a time as real photographs arrive.**

Seven of the eleven assets are product mockups or key art. On desktop they are fine — a
device shot in a device-shot-shaped slot, and that panel is unchanged. Blown up to a
full-viewport mobile background behind a glass sheet they are not: the top ~40% is blank
white and the middle is a band of cropped, unreadable UI.

So on mobile those panels drop the image and use a designed eucalyptus ground: a dark-to-light
vertical gradient with two soft light sources, varied slightly per step so the ground screens
are not seven identical walls.

The ground runs **dark at the top and lighter toward the bottom** — the opposite of the photo
scrim, deliberately. The caption sits at the top and wants a dark backdrop; the sheet is a
dark translucent panel that must read as an edge. The first attempt darkened downward and the
sheet dissolved into the ground, with the rounded corner as the only thing separating them.

| | Panels |
|---|---|
| **Photography** (4) | `welcome`, `community` (crowd), `story` (person), `player` (living room) |
| **Ground** (7) | `focus`, `level`, `days`, `env`, `alone`, `promise`, `reassure` |

Flow rhythm: photo · photo · ground · ground · ground · photo · ground · ground · photo ·
ground · ground. The photographs bookend and punctuate rather than disappearing entirely.

**To revert a panel to photography:** change its entry in `ART` in `BrandPanel.tsx` from
`"ground"` to `"photo"`. Nothing in the CSS needs touching — it is all keyed off `data-art`.

Caption contrast improved as a side effect (the ground is dark and even where the caption
sits): worst case went from 5.78:1 on photos to **8.62:1**, all eight screens passing.

### Reshoot brief — what would actually fix this

Portrait, ~1600×2133, subject in the upper-middle third (the caption occupies roughly y=74px
to y=170px on a 402×874 screen, and the sheet covers everything below ~18–22% from the top).
Avoid blown-out white at the top — that is what broke the contrast on the current set. Mixed
ages and both men and women: the positioning is no longer women-first.

| Step | Caption it must earn | Shot |
|---|---|---|
| `focus` | „Van edzés arra, ahol erősödni akarsz." | Mid-movement, a body working — not a UI |
| `level` | „A szint hozzád igazodik – kezdőtől haladóig." | Two people at visibly different levels, same movement |
| `days` | „Annyi nap, amennyi tényleg belefér." | A real week in a real life — kitchen, kids, a mat half-rolled |
| `env` | „Bármi is az – van rá változat." | A cramped, honest home space; a chair or wall used as a prop |
| `alone` | „Egyedül nehéz. Együtt muszáj." | Two or more people training together |
| `promise` | „Innentől együtt csináljuk." | The reveal moment — someone at the start, not mid-effort |
| `reassure` | „A terved kész – már csak te hiányzol." | Warm, welcoming, a person looking at camera |

`community.jpg` and `promise.jpg` are now referenced by no mobile-facing step.

---

## 7e. Real-device round — what one screenshot from a phone exposed

Shipped `5cc33a3`, then a photo from an iPhone 15 Pro showed the question title
missing entirely and the caption sliced in half. Both were invisible to every check
run before that, and for the same underlying reason: **the whole thing had been
verified at one viewport size, in one engine.**

### The two bugs

**1. The title never rendered in WebKit.** `StepFrame` used `<fieldset>` +
`<legend>`. WebKit paints a `<legend>` at the fieldset's border edge rather than as
an in-flow block, so with `overflow-y: auto` on the fieldset the title landed
outside the scrollport and the sheet clipped it away — leaving its reserved space
as an empty gap above the sub-line. Blink honours `display: block` on a legend and
rendered it correctly, which is why it survived every check here. Now a plain
`<h2>`; the options keep their own labelled radiogroup and focus still moves to
the heading, so nothing is lost.

**Not reproduced locally.** `safaridriver` needs interactive enabling and there is
no WebKit in this environment, so the fix is reasoned rather than observed. It does
remove the entire class of bug — there is no longer a `<legend>` to mis-paint.

**2. The layout was authored against a viewport that does not exist.** The sheet was
a flat `82dvh`, tuned at 402×874. A real iPhone 15 Pro in Safari gives **393×622** —
both toolbars take ~230px. At 82% of 622 the caption had 38px to draw two 22px
lines in.

### The fix: a height ladder

Vertical layout is now derived from a reserved band (`--fnl-band`) that steps down
with the viewport, and the caption is *constrained* to that band — bottom-aligned,
line-clamped, `overflow: hidden` — rather than positioned at a fixed offset and
left to overflow. Ranges come from real CSS viewport heights **with browser
chrome**, not spec sheets:

| Viewport height | Band | Caption | Real devices |
|---|---|---|---|
| ≥820 | 228px | 23px | installed PWA, chrome hidden |
| 700–819 | 200px | 22px | iPhone Plus/Max Safari (~716), Android Chrome (~730) |
| 600–699 | 176px | 20px | **iPhone 15/16 Pro Safari (~622) — the reported bug** |
| 520–599 | 148px | 18px | iPhone SE Safari (~553) |
| <520 | 46px | hidden | landscape phone — no honest way to spend space on a photo |

Plus a narrow-width band (<360px) that tightens option rows and gutters.

`scripts/register-mobile-viewports.mjs` checks 11 viewports × 4 steps and asserts
from real geometry that the title is visible, the caption finishes above the sheet,
nothing overflows, and the photo still covers at full parallax travel. **44/44.**

### A design error the matrix caught

The photo plane was parallaxing at **30% — the same rate as the under layer.** Two
consequences: the depth was flat (a background moving as fast as the midground is
not parallax), and at full travel the layer slid off its own left edge and exposed a
~120px band of shell that animated shut on every advance. Now **14%**, with the
stage oversized to 134% so it can travel without uncovering, and the caption moved
out of `.bp-stage` so it no longer rides along.

---

## 7f. Second review round (9 findings, all fixed)

| # | Finding | Fix |
|---|---|---|
| 1 | On a back nav the **incoming** screen was the `inert` layer, so focus silently went nowhere and then fell to `<body>` | Layers keyed by step id; `inert` follows "not current", never "underneath" |
| 2 | Destination **unmounted and remounted** when the transition ended — scroll, state, effects, stagger all reset | Same fix; the current step keeps its identity throughout |
| 3 | Parallax uncovered the photo (see §7e) | Rate 30%→14%, stage oversized |
| 4 | Going back from `pay` mounted a **fresh Stripe checkout** just to animate it away | `pay` excluded as an outgoing step too |
| 5 | Grabbing a *back* animation mid-flight swaps both layers' content | Known, documented; only the forward→drag conversion is seamless |
| 6 | Blur guard released on pointerup, so the 350ms settle spring — the fastest frames — ran with blur on | Released on rest instead |
| 7 | `.fnl-wiz .authx-brand` (0,2,0) lost to `.lx .authx-brand.bp-img` (0,3,0); the dark fallback never applied | Specificity matched |
| 8 | `PayStep` had no `.fnl-sheet`, so the pay handoff rules were dead | Wrapped; dead `.fnl-foot` rules removed |
| 9 | `display: none` does not stop a fetch — mobile still downloaded all 7 mockups | `sizes="(max-width: 767px) 1px"`; verified `currentSrc: ""`, 0 bytes |

Finding 5 is the one left as-is: it is a real discontinuity, but it needs a
two-step-back model the stage does not have, and the window is 400ms after tapping ‹.

---

## 8. Risks

1. **`backdrop-filter` + `transform` on iOS Safari — OPEN, will not be closed by this
   work (D12).** A large blurred surface transformed every frame is a known repaint cost.
   Mitigation is built in: during an active drag the sheet swaps its blur for a solid fill
   (`.is-dragging`) and restores on settle — the blur is imperceptible mid-motion anyway.
   But verification is Chrome device emulation only, which does **not** reproduce iOS
   Safari's compositor. Treat "smooth on real iPhone" as unproven until someone drags this
   on a physical device. If it stutters, the escape hatch is dropping `backdrop-filter` for
   a solid sheet — a small loss of depth, no layout change.
2. **Photo/text contrast varies per image.** §3.1 — I verify all eleven and report failures
   rather than shipping a dim caption.
3. **`100dvh` and the iOS URL bar.** `dvh` is correct here, but the collapsing bar during a
   drag needs checking on device.
4. **Swipe vs. sheet scroll on the long screens** (`reveal`, `plan`). The 10px-hysteresis
   rule is specified, but it is the detail most likely to need tuning by feel.
5. **`why`-step keyboard.** iOS `visualViewport` behaviour with a bottom-anchored glass
   sheet is fiddly; may need a `visualViewport` listener rather than pure CSS.

---

## 9. Build order

1. Image pipeline (§6) — standalone, benefits desktop immediately, verifiable on its own.
2. Static layout: shell layering, grid, sheet, scrim, type scale. No motion. Reviewable.
3. Contrast audit of all eleven photos; report failures.

**◆ CHECKPOINT (D11) — stop here for review.** At this point the look is fully judgeable
with zero motion investment. If the direction is wrong, little has been spent.

4. `spring.ts` + `StepStage`: transitions, then the swipe gesture.
5. Micro-interactions, haptics, progress spring.
6. Long screens: `reveal`, `plan`, `account`.
7. `pay` handoff (§5).
8. Reduced-motion / reduced-transparency / high-contrast passes.
9. Chrome emulation pass at 390×844 and 430×932 (D12); report what real-device testing
   would still be needed to settle.
