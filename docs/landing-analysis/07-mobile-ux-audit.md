# LEXFIT homepage — mobile responsiveness & deep UX/UI audit

> **STATUS: fixes applied 2026-08-11.** Every P0/P1/P2 item below was implemented and
> re-measured with the same harness. Results in [§9 After](#9--after-verified).

Date: 2026-08-11. Target: `/` as shipped today (14 bands, real Firestore catalog).
Lens: `apple-design` (fluidity, materials, typography, the eight principles) + Nielsen's
10 heuristics + hedonic quality (Hassenzahl's pragmatic/hedonic split).

**Everything below is measured, not estimated.** Method in §0.

---

## 0 · Method

Chrome cannot resize below ~500px on macOS, so the page was loaded in **same-origin
iframes at true device widths** — media queries evaluate against the iframe's layout
viewport, so 360px behaves as a real 360px phone. `X-Frame-Options: DENY` (correct, kept)
was bypassed by a throwaway local proxy; **no product code or header was weakened**, and
the proxy is deleted.

Widths tested: **320 · 360 · 390 · 393 · 430**, at heights 568 / 640 / 800 / 844 / 852 / 932.
These cover the 2026 market: 360×800, 390×844 and 393×852 alone are ~60% of mobile traffic.

**One correction worth stating:** my first contrast pass parsed `oklch()` values as if they
were RGB and produced nonsense. The figures in §4 come from a second pass that resolves
every colour through a canvas (so `oklch` composites correctly) and **refuses to report a
ratio where the text sits on a gradient** rather than guessing. Only solid-background
results are quoted.

---

## 1 · Mobile responsiveness

### 1.1 Verdict on the fundamentals — these are genuinely clean

| Check | 320 | 360 | 390 | 393 | 430 |
|---|---|---|---|---|---|
| Horizontal overflow | none | none | none | none | none |
| `scrollWidth` = viewport | ✅ | ✅ | ✅ | ✅ | ✅ |
| Elements escaping the viewport | 0 | 0 | 0 | 0 | 0 |
| Median line length (chars) | 37 | 42 | 43 | 44 | 46 |
| Max line length | 46 | 53 | 58 | 58 | 61 |

No horizontal scroll at any width, and line lengths sit inside the comfortable band at
every size. Pinch-zoom is **not** disabled (no `user-scalable=no`) — that's an
accessibility win most marketing pages get wrong.

### 1.2 The fold — the hero doesn't fit small phones

The hero is **1,304–1,362px tall**: 1.6 screens on a 844px phone, **2.4 screens on a
568px phone**.

| Device | CTA visible | Price line | Trust line | Alexa's photo |
|---|---|---|---|---|
| 320×568 (SE 1st gen) | edge — bottom lands exactly on the fold | ❌ below | ❌ below | ❌ below |
| 360×640 (small Android) | ✅ | ✅ | ❌ below | ❌ below |
| 360×800 (Galaxy A/S) | ✅ | ✅ | ✅ | ✅ |
| 390×844 (iPhone 14–16) | ✅ | ✅ | ✅ | ✅ |
| 430×932 (Pro Max) | ✅ | ✅ | ✅ | ✅ |

**On the two smallest classes the brand's own face is below the fold** — on a page whose
entire premise is "Alexa is the brand". The price (`490 Ft`), the one commercial fact
worth putting above the fold, is also lost at 320.

The cause is the stacked order: eyebrow → 3-line H1 → 3-line body → CTA row → price →
trust → *then* the photo. Nothing is wrong with any single element; the sum is too tall.

### 1.3 Scroll economy — the headline problem

At 360×800 the page is **17,884px ≈ 22.4 screens**. At 320×568, **32 screens**.

Section heights at 360px:

| Section | Height | Screens |
|---|---|---|
| §5 Programok | 2,245px | 2.8 |
| §2 Hogyan működik | 2,199px | 2.7 |
| §14 Előfizetés | 1,763px | 2.2 |
| §3 Edzés Alexával | 1,534px | 1.9 |
| §6 Foundation | 1,439px | 1.8 |
| §11 Alexa | 1,423px | 1.8 |
| §1 Hero | 1,362px | 1.7 |

Seven sections are ≥1.7 screens each. For a **cold** visitor — someone with no reason yet
to invest — 22 screens is a long contract to sign before the price. This is the single
biggest mobile issue on the page and it is a *layout* problem, not a content problem: the
same information could occupy roughly half the height.

The three worst offenders and why:

- **§2 (2,199px)** — three phone mockups at 9:19.5 stacked vertically. Three portrait
  frames is ~1,150px of striped placeholder before a word of value is read.
- **§5 (2,245px)** — 7 banners in one column + a card rail. Already halved once; still the
  tallest.
- **§14 (1,763px)** — three price cards stacked full-width.

### 1.4 Viewport units — one real iOS bug

- **`landing.css:558`** — `.alexa-hero { min-height: min(860px, 100vh) }`. Legacy `vh` is
  measured against the **large** viewport, so on iOS the section is taller than the visible
  area while the address bar is shown, and the layout **jumps** when the bar collapses.
  Current guidance is `svh` for ~90% of layout work — `dvh` re-evaluates during scroll and
  causes jitter. **Fix: `min(860px, 100svh)`.**
- **0 uses of `dvh`/`svh`/`lvh`** anywhere. All three have been Baseline Widely Available
  since June 2025 (~95% of users), so there is no support argument left.

### 1.5 Safe areas — silently dead across the whole app

There are **5 `env(safe-area-inset-*)` declarations** in the codebase
(`lexfit-tokens.css:76`, `app/shell.css:428,447`, …) — but there is **no
`viewport-fit=cover`** anywhere. Next's default viewport tag omits it.

`env(safe-area-inset-*)` only returns non-zero when `viewport-fit=cover` is set. So on
every notched iPhone, `calc(74px + env(safe-area-inset-bottom))` silently evaluates to
`74px + 0px`, and the app's bottom tab bar sits under the home indicator.

**This is an app-wide bug, not a landing bug**, and it's the highest value-per-character
fix in this document: add a `viewport` export with `viewportFit: "cover"` in
`src/app/layout.tsx` and five existing declarations start working.

### 1.6 Horizontal rails — content hidden with no affordance

Two scrollers at 360px:

| Rail | Visible | Total | Hidden | Snap |
|---|---|---|---|---|
| `.hrow` (workout cards) | 316px | 2,105px | **1,789px** | ✅ x |
| `.carousel` (challenges) | 360px | 1,964px | **1,604px** | ✅ x |

85% of each rail is off-screen. Scroll-snap is correctly set, but there is **no visual
signal that the rail scrolls** — no peeking next card at the right edge, no gradient mask,
no counter. The workout rail happens to clip its 4th card, which accidentally hints; the
challenge rail does not.

Apple's framing applies directly: *hint in the direction of the gesture.* A rail that
looks like a finished row invites no swipe.

### 1.7 Sticky chrome

- `.stickynav` — 73px fixed, appears after 640px of scroll. Reasonable.
- It is **opaque**, not a translucent material. `apple-design §12` argues for
  `backdrop-filter` chrome with content scrolling under; on a 640px phone a 73px opaque bar
  is 11% of the viewport permanently spent.
- The mobile bottom CTA bar was removed at your request, so the bottom is now clean —
  but that also means **between the hero and the pricing section, ~20 screens have no
  persistent CTA.** Every CTA is inline. That is a deliberate trade (less chrome, more
  scroll before an action is reachable) and worth a conscious decision rather than a
  side effect of the deletion.

---

## 2 · Touch & targets

**82 interactive elements** at 360px.

| Standard | Threshold | Failures |
|---|---|---|
| WCAG 2.5.8 Target Size (Minimum), **AA** | 24×24 | **8** |
| WCAG 2.5.5 / Apple HIG | 44×44 | **18** |

### The specific failures

| Element | Size | Severity |
|---|---|---|
| `.j-chap` — Foundation chapter dots (×4) | **57×4px** | **Critical.** 4px tall. Below AA by 6×, and they *are* interactive (click-to-jump). |
| Footer legal links (×4) | 149×18, 88×18, 79×18, 74×18 | **AA fail.** 18px tall. |
| Footer legal links, spacing | `Felhasználási feltételek` / `Impresszum` — **0px horizontal, 2px vertical gap** | The only tight pair on the page; guarantees mis-taps. |
| Hero + sticky nav links (×5) | ~33px tall | Under 44, above 24 — passes AA, fails HIG. |
| `.hero-cta2` "Hogyan működik →" | 93×36 | Secondary CTA, under 44. |
| `.mini` sticky nav CTA | 222×37 | Under 44. |
| Consent buttons | 142×40 | Under 44, marginal. |

The `.j-chap` dots are the clear defect: a 4px-tall control on a touch screen is not
operable by any finger. They were designed as *progress indicators* that happen to be
clickable — the fix is to keep the 4px visual and give the button an invisible ~44px tap
area (padding + a negative-margin container), which satisfies both the design and 2.5.8's
allowance for spacing-based compliance.

### Press feedback

`.pill:active`, `.wkp-day:active`, `.wc-cover:active`, `.fex-card:active` all respond on
pointer-down. That's the `apple-design §1` rule respected — feedback lands on the press,
not the release. **This is done well and consistently.**

---

## 3 · Typography & legibility

**104 text nodes render below 12px** at 360px.

| Size | Where | Count |
|---|---|---|
| **8.5px** | `.ey` — workout card eyebrow (`LEXFIT · E001`) | 9 |
| **9px** | misc spans | 9 |
| **9.5px** | `.fex-name` — the `· minta` labels | 14 |
| **10px** | `.pgs-chip`, `.wc-dur`, `.lab` | 27 |
| 10.5px | `.pgs-eyebrow`, `.nm` | 14 |
| 11–11.5px | eyebrows, `.wc-sub`, `.wkp-d` | 31 |

Most of these arrive with the **app components** (`wc-*`, `pgs-*`, `fex-*`), where they
sit inside a focused, task-oriented UI at arm's length. On a marketing page read by a cold
35–50-year-old — the audience the strategy docs describe as *diplomás*, 35–54 — 8.5px and
9.5px are decoration, not information.

**The `· minta` label is the sharpest case.** It is 9.5px, and it is the *honesty
disclaimer* that stops the finish-filter photos reading as member testimonials. A legal-
grade qualifier set at 9.5px in 50% white is not a disclaimer anyone reads.

Line length is fine everywhere (median 42, max 61) — no action needed.

---

## 4 · Colour & contrast

Solid-background text only (gradient-backed text can't be machine-checked; it reads
correctly in review).

| Element | Size | Ratio | Needs | |
|---|---|---|---|---|
| `.price-trust span` | 11px | **2.77** | 4.5 | ❌ worst on the page |
| `.hero-trust` | 12.5px | **3.85** | 4.5 | ❌ |
| `.hero-eyebrow` | 11px | **4.35** | 4.5 | ❌ marginal |
| `.hero-price` | 12.5px | 4.73 | 4.5 | ✅ |
| `.wkp-hint` | 14px | 5.13 | 4.5 | ✅ |
| `.cap-body` / `.step-b` | 15 / 14.5px | 5.98 | 4.5 | ✅ |
| `.faq-item p` | 14.5px | 6.61 | 4.5 | ✅ |
| `.wkp-rest` | 12px | 6.75 | 4.5 | ✅ |
| `.aq-promise span` | 13px | 8.26 | 4.5 | ✅ |
| `.ax-story p` | 16px | 11.0 | 4.5 | ✅ |

Three failures, and **the two that matter most are both trust copy**:

- `.price-trust span` at **2.77:1** carries *14 napos elállási jog · Bármikor lemondható
  vagy szüneteltethető · Elektronikus számla · Visa · Mastercard* — every risk-reversal
  fact, at the moment of decision, at 11px and barely legible on the sage band.
- `.hero-trust` at **3.85:1** carries *10 év versenysport · 1 200+ fős közösség · 14 napos
  elállási jog* — the credibility line.

Both are small, low-opacity mono set on a mid-tone ground. The body copy is comfortably
above threshold, so this is a systematic issue with **one treatment** (`--mono`,
small, `opacity < .7`), not scattered.

---

## 5 · Heuristic evaluation (Nielsen)

| # | Heuristic | Verdict |
|---|---|---|
| 1 | **Visibility of system status** | **Good.** Scroll-spy marks the active nav section; the week picker reports its state in words *and* a live region; the journey chapter dots fill in real time. |
| 2 | **Match with the real world** | **Strong.** Hungarian throughout, first-person from Alexa, no system vocabulary. "A pihenőnap is a terv része" is domain language, not UI language. |
| 3 | **User control & freedom** | **Weak spot.** The coverflow was removed, so nothing auto-advances against the user *except* the Foundation journey, which advances every 2.6s. It pauses off-screen and is click-to-jump — but there is no pause control, and 2.6s is faster than reading a Hungarian workout title plus its metadata. |
| 4 | **Consistency & standards** | **Excellent, and now literally enforced.** The landing renders the same `ProgramBanner` and `WorkoutCard` as the app, so a visitor who converts sees the exact objects they were shown. That is rare. |
| 5 | **Error prevention** | **Good.** The week picker clamps at 3–6 and disables the controls that would break the rule rather than letting you fail. The public detail modal removes the play button that could not work. |
| 6 | **Recognition over recall** | **Good.** Every claim is adjacent to its evidence; the 3-step section shows the actual screens rather than describing them. |
| 7 | **Flexibility & efficiency** | **Mixed.** The sticky nav gives jump-to-section for a returning visitor — but only after 640px of scroll, and there is no way back to the top other than scrolling. On a 22-screen page that is a real omission. |
| 8 | **Aesthetic & minimalist design** | **Mixed.** Individually restrained; cumulatively heavy. 22 screens is not minimalist regardless of how clean each band is. |
| 9 | **Help users recover from errors** | **N/A** on this page — no forms, no failure states. Correctly so. |
| 10 | **Help & documentation** | **Good.** A 10-item FAQ answering real objections, plus a support email. |

### The empty-state hole (heuristic 1 + 5)

`loadLandingCatalog` returns `EMPTY_CATALOG` on any Firestore failure, and the sections
render fallback copy — but §5 and §6 **disappear entirely** when empty. A visitor during
an outage sees a page with no programs and no Foundation, with no acknowledgement that
anything is missing. It fails silently rather than gracefully.

---

## 6 · Hedonic evaluation

Pragmatic quality answers *can I do the thing*; hedonic quality answers *who does this
make me while I do it*. The strategy docs make this unusually concrete: the audience has
been let down five times by fitness marketing, so the page's hedonic job is **to not feel
like fitness marketing**.

### Identification — "does this speak for me?" · **Strongest dimension**

The refusals are the identity: *Nem mondom meg, mit csinálj. Nem ítéllek el, ha kimaradsz.
Nem játszom, hogy tökéletes vagyok.* No exclamation marks anywhere. No before/after. The
finish photos are real people in real Hungarian flats with radiators and wardrobe doors.
Against a category of retouched studio bodies this reads as a different species of product,
which is exactly the positioning.

**The one thing undercutting it:** the workout cards render `Feszes comb, kerek fenék` and
`Lapos has, stabil törzs`. Those are body-goal phrases from `benefit.ts`, and they now sit
on the public page in the middle of a section whose whole argument is *we don't do that*.
You decided in-app language is acceptable on `/`, so this is a known trade — but it is the
one place where the page contradicts its own voice.

### Stimulation — "does this show me something new?"

- **The week picker is the best moment on the page.** It's the only thing you can touch
  that answers a question, and it answers the objection ("I can't commit to 5 days") by
  letting you *disprove it yourself*. Interactive demo over static claim.
- **The finish marquee** is the second: motion that is content, not decoration.
- The Foundation journey is visually the richest thing on the page but the least
  controllable (see heuristic 3).

### Novelty vs. familiarity

The band rhythm (cream / navy / photo / sage) and the `.rise` reveal are conventional and
should stay conventional — the novelty budget is correctly spent on the week picker and
the finish overlay, not on the scroll mechanics. `apple-design §16.4`: break a familiar
pattern only where you can prove it's better.

### Where the page loses feeling

**Nine `<Ph>` placeholders remain.** On desktop they read as "unfinished". On a 360px
phone, §2's three striped rectangles are ~1,150px — **1.4 full screens of grey stripes**
in the section that is supposed to make the product feel real. No amount of copy quality
survives that. This is now the biggest hedonic liability on the page, and it is an asset
problem, not a design problem.

---

## 7 · Motion audit (apple-design)

| Principle | Status |
|---|---|
| §1 Respond on pointer-down | ✅ consistent across pills, week days, cards, finish cards |
| §4 One motion language | ✅ `.rise` / `.rise.seq` everywhere — 0.62s, `cubic-bezier(.22,1,.36,1)`, 80ms stagger. No second language was introduced. |
| §6 Momentum projection | ✅ the rails use native scroll-snap; the drag physics that had `d=0.998` left with the coverflow |
| §12 Translucent chrome | ❌ sticky nav is opaque; no `backdrop-filter` |
| §14 Reduced motion | ✅ marquee stops, journey stops, CountUp static, week picker cross-fades. Verified in CSS. |
| §7 Spatial consistency | ⚠️ the detail modal does **not** scale from the card that opened it — no `transform-origin` on the trigger. It was specced; it wasn't built. |

---

## 8 · Prioritised fixes

**P0 — correctness, cheap**

1. Add `viewportFit: "cover"` to `layout.tsx` — **activates 5 dead `env(safe-area-inset-*)`
   declarations across the whole app**, not just this page. (§1.5)
2. `.j-chap` 57×**4px** → keep the visual, add a ~44px invisible tap area. (§2)
3. `landing.css:558` — `100vh` → `100svh`, kills the iOS address-bar jump. (§1.4)
4. Footer legal links: 18px tall with a 0px gap → pad to ≥24px and separate. (§2)
5. Contrast: raise `.price-trust span` (2.77), `.hero-trust` (3.85), `.hero-eyebrow`
   (4.35) past 4.5. One shared treatment, three selectors. (§4)

**P1 — mobile scroll economy**

6. Halve §2: three phone frames side-by-side or a squarer crop instead of 3× 9:19.5
   stacked. Saves ~1.1 screens. (§1.3)
7. Reorder the hero so the price sits above the fold at 568px, and get Alexa's photo
   above it or accept it as a scroll reward deliberately. (§1.2)
8. Rail affordance: let the next card peek, or add an edge mask. 85% of both rails is
   invisible with no hint. (§1.6)
9. Raise the smallest type: `.ey` 8.5px and `.fex-name` 9.5px → ≥11px. The `minta` label
   in particular is doing legal work at a size nobody reads. (§3)

**P2 — polish**

10. Journey: add a pause control, or slow 2.6s → ~4s. (§5, heuristic 3)
11. Sticky nav → translucent `backdrop-filter` layer. (§7)
12. Detail modal: scale from the trigger card. (§7)
13. Back-to-top affordance on a 22-screen page. (§5, heuristic 7)
14. §5/§6 empty states: say something rather than vanishing. (§5)

**Not a code fix, but the biggest single win:** the nine remaining placeholders. §2's three
grey rectangles are 1.4 screens of nothing on the most common phone in the market.

---

## Sources

- [Viewport units `dvh`/`svh`/`lvh` — 2026 guidance](https://thelinuxcode.com/viewport-units-in-css-mastering-vh-vw-and-the-modern-dvhsvhlvh-family-2026/) · [DEV: CSS vh/dvh/lvh/svh units](https://dev.to/frehner/css-vh-dvh-lvh-svh-and-vw-units-27k4) · [Sizzy: CSS viewport units](https://sizzy.co/blog/css-viewport-units/)
- [WCAG 2.5.8 Target Size (Minimum) implementation guide](https://www.allaccessible.org/blog/wcag-258-target-size-minimum-implementation-guide) · [Mobile touch target size — 2026](https://www.accessitool.com/blog/mobile-touch-target-size-complete-guide-fixes-accessibility-2026) · [LogRocket: accessible touch target sizes](https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/)
- [Common screen resolutions 2026 — BrowserStack](https://www.browserstack.com/guide/common-screen-resolutions) · [Most popular mobile screen resolutions 2026](https://phone-simulator.com/blog/most-popular-mobile-screen-resolutions-in-2026) · [Kobiton: screen resolutions for mobile testing 2026](https://kobiton.com/blog/common-screen-resolutions-for-mobile-testing-in-2026/)
- [iOS 26 Safari viewport changes](https://stripearmy.medium.com/ios-26-0-be-prepared-for-viewport-changes-in-safari-e867d7eace43) · [Designing for Safari's floating address bar](https://www.amitmerchant.com/designing-websites-keeping-floating-address-bar-safari-15-ios/)
- [Nielsen's 10 usability heuristics](https://ux247.com/usability-principles/) · [Heuristic principles for mobile interfaces — Toptal](https://www.toptal.com/designers/usability-testing/mobile-heuristic-principles) · [Pragmatic vs. hedonic UX quality](https://www.researchgate.net/publication/316884530_Heuristics_Considering_UX_and_Quality_Criteria_for_Heuristics)
- `apple-design` skill (WWDC *Designing Fluid Interfaces*, *The Details of UI Typography*, *Principles of Great Design*)

---

## 9 · After (verified)

Same harness, same viewports, after the fixes.

| Metric | Before | After |
|---|---|---|
| **WCAG 2.5.8 failures (<24px)** | **8** | **0** at 320 / 360 / 390 / 430 |
| Targets under 44px tall | 18 | 4 (footer legal at 32px — passes AA; nav links now 44) |
| Smallest type | 8.5px | **nothing under 10px** (8.5px and 9px eliminated) |
| `.price-trust` contrast | 2.77 ❌ | **5.46** ✅ |
| `.hero-trust` contrast | 3.85 ❌ | **5.08** ✅ |
| `.hero-eyebrow` contrast | 4.35 ❌ | **5.46** ✅ |
| Price above the fold @320×568 | ❌ | ✅ |
| Page height @360×800 | 17,884px | 16,679px (**−1,205**) |
| §2 Hogyan működik | 2,199px | out of the top 5 tallest |
| Horizontal overflow | none | none |

### What was changed

**P0**
- `layout.tsx` — added a `viewport` export with `viewportFit: "cover"`. **Activates the
  five existing `env(safe-area-inset-*)` declarations app-wide.** Zoom deliberately left
  unlocked. `.stickynav` now pads for `safe-area-inset-top/left/right`.
- `.j-chap` — markup split into a 44px button wrapping a 4px `.j-track`; the fill keeps
  its own transform so the animation is untouched. `.j-chapters` bottom 30 → 10px to keep
  the bar in the same visual place.
- `landing.css` — `100vh` → `100svh` on `.alexa-hero` (kills the iOS address-bar jump).
- Footer legal links — flex row, `min-height: 32px`, real gaps. The 0px-gap pair is gone.
- Contrast — `.price-trust`, `.hero-trust`, `.hero-eyebrow` moved to solid ink and up
  half a step in size.

**P1**
- §2 on mobile — three steps now side-by-side with proportional type instead of three
  stacked 9:19.5 frames.
- Hero — tightened mobile spacing, plus a new `@media (max-height: 640px)` block. The
  problem was viewport *height*, not width, so it's a height query.
- Rails — edge mask on `.hrow` / `.carousel` so the 85% of hidden content reads as
  continuing rather than ending.
- Type — `.ey` 8.5→11px, `.wc-dur`/`.pgs-chip` 10→11px, `.wc-sub` 11.5→12.5px,
  `.fex-name` 9.5→11px (the `· minta` honesty label, now actually readable).

**P2**
- `BackToTop` — appears after 1,600px, 48px target, clears the home indicator, respects
  reduced motion.
- Journey pacing 2.6s → 4.2s (2.6s was faster than reading a Hungarian title + metadata).
- Detail modal — `--nmod-ox/--nmod-oy` let it scale from the card that opened it; the
  landing captures the rect from a wrapper so `WorkoutCard`'s signature is unchanged.
- §5 empty state — says something instead of vanishing.

### Still open

- **Scroll depth: 17–30 screens.** Down ~7%, still the defining mobile characteristic.
  The remaining levers are §5 (2,311px) and §14 (1,825px), both of which are content
  decisions rather than defects.
- **Nine `<Ph>` placeholders.** Unchanged — an asset problem. Still the biggest hedonic
  liability.
- **`Feszes comb, kerek fenék`** on the public workout cards, per the locked vocabulary
  decision.
- Sticky nav is translucent already (`.row1` carries `backdrop-filter`); the outer
  wrapper is transparent, so §7's item was already satisfied.

### Test infrastructure

The header-stripping proxy used to load the page in iframes was deleted after the run.
`X-Frame-Options: DENY` in `next.config.ts` was never modified.
