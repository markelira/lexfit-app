# LEXFIT · Eukaliptusz Migration
### The complete handbook for replacing the rose-pink brand system, product-wide

**Version 1.0 · Scope: the whole product — app, onboarding, community, sales, landing**

---

## Table of contents

1. [Why this change](#1-why-this-change)
2. [The decision in one page](#2-the-decision-in-one-page)
3. [Scope: what you are actually touching](#3-scope)
4. [The Eukaliptusz palette](#4-the-eukaliptusz-palette)
5. [The inversion rule](#5-the-inversion-rule)
6. [The hardcoded-literal problem — 321 of them](#6-the-hardcoded-literal-problem)
7. [The two-token-system problem](#7-the-two-token-system-problem)
8. [File-by-file migration](#8-file-by-file-migration)
9. [Component specifications](#9-component-specifications)
10. [Brand mark & icon assets](#10-brand-mark--icon-assets)
11. [Accessibility requirements](#11-accessibility-requirements)
12. [What must NOT change](#12-what-must-not-change)
13. [Execution plan](#13-execution-plan)
14. [Verification checklist](#14-verification-checklist)

---

## 1. Why this change

LEXFIT is built around one trainer, Alexa, but the *service* — guided 30-minute equipment-free home workouts, progress tracking, a community — is not gender-specific. The rose-pink brand colour (`#e5719b`) signals otherwise and narrows the audience before anyone reads a word.

This migration was informed by a research review (see `reference/LEXFIT Color Psychology Research.html`). Three findings shaped the palette:

**The de-gendering premise is well supported, and asymmetrically favourable.** Pink→feminine is learned, not innate — it is absent in infants, emerges around age two, and does not appear in cultures without gendered marketing. Critically, women have increasingly adopted traditionally masculine-coded choices while men avoid feminine-coded ones. So dropping pink risks little with the existing female audience and removes a wall for everyone else.

**Chroma matters more than hue.** Colour–emotion associations are driven primarily by lightness and chroma, with only partial systematic effects of hue. The old pink had chroma `.155`; Eukaliptusz has `.042` — **a bigger emotional shift than the hue change**. This is what makes the surface structurally calm, matching the brand's no-pressure positioning.

**Hue is therefore free to move.** The first attempt (Olíva, hue 118) was rejected as too military — hue 100–125 at mid lightness and low chroma is precisely the khaki band. Eukaliptusz sits at **hue 168**, fifty degrees toward blue: still natural and calm, but reading as eucalyptus rather than field uniform.

> **One thing this migration does NOT claim.** Colour does not change how users feel. The research is explicit: consistent colour–emotion associations do not mean colours cause those emotions. Colour signals *who the product is for*. Do not justify this work on "green makes exercise feel easier" — that finding did not replicate.

---

## 2. The decision in one page

| | |
|---|---|
| **Brand accent** | `#7a9b8d` — Eukaliptusz, `oklch(0.660 0.042 168)` |
| **Deep accent** | `#496c5e` |
| **Ink** | `#18201d` |
| **Base surface** | `#f1f6f4` |
| **Text on accent** | **Dark ink** — white fails (3.04:1) |
| **Categories** | 6, retuned, all separated |
| **Dark theme** | Retuned from plum to green-black |
| **Typography, layout, motion, copy** | Unchanged |
| **Scope** | ~20 CSS files, 321 colour literals, 2 token systems, 7 asset families |

This is a **token and asset migration, not a redesign.** If you are changing spacing, type, or component structure, stop.

---

## 3. Scope

This is not just the landing page. An audit of the project found:

| Surface | File | Pink literals |
|---|---|---|
| App shell | `app/lexfit-app.css` | 37 |
| Landing | `lexfit-landing.css` | 35 + 7 hex |
| Community (Szavazz Magadra) | `community/szm.css` | 35 |
| Program | `program/prog.css` | 33 |
| Tokens (app) | `lexfit-tokens.css` | 22 + 3 hex |
| Program guide | `program/prog-guide.css` | 21 |
| Progress (Haladásom) | `haladas/hal.css` | 17 |
| Explore hero | `explore/prog-hero.css` | 16 |
| Sales home2 | `sales/home2.css` | 15 |
| Cards | `cards/cards.css` | 14 |
| Explore thumbs | `explore/prog-thumbs.css` | 13 |
| Profile | `app/screen-profile.css` | 11 |
| Sales ATV | `sales/atv.css` | 10 |
| Onboarding | `onboarding/onb.css` | 9 |
| Sales ATV MadFit | `sales/atv-madfit.css` | 9 |
| Heroes | `heroes/heroes.css` | 8 |
| Progress screen | `app/screen-progress.css` | 5 |
| Dashboard | `dashboard/dash.css` | 4 |
| Program simple | `program/prog-simple.css` | 4 |
| Library | `app/screen-library.css` | 3 |
| **Total** | **20 files** | **321 + 10 hex** |

Clean already (token-only, no literals): `sales/atv-light.css`, `sales/atv-audit.css`, `sales/atv-devplan.css`.

JSX files consume tokens via `var(--cat-*)` and should need no changes — verify, don't assume. Key consumers: `lexfit-shared.jsx` (`LX_CAT_STYLE`), `sales/home2-data.jsx`, `onboarding/onb-steps.jsx`, `haladas/hal-variants.jsx`.

---

## 4. The Eukaliptusz palette

Full drop-in file: **`eukaliptusz-tokens.css`**. Summary below.

### Brand
| Token | Hex | Role |
|---|---|---|
| `--accent` | `#7a9b8d` | Hero, pricing band, app icon ground, active states |
| `--accent-2` | `#496c5e` | Hover, gradient ends |
| `--accent-soft` | `#e1f1ea` | Chips, icon wells, tinted panels |
| `--accent-ink` | `#355c4d` | Accent-coloured **text** on white (7.53:1) |

> `--accent-ink` exists because `--accent` itself is too light for text on white. Use it for links and accent-coloured labels; never use `--accent` for body text.

### Ink & surfaces
`--ink #18201d` · `--ink-2 #44544d` · `--ink-3 #5c6e66` · `--bg #f1f6f4` · `--surface #ffffff` · `--surface-2 #e8efec` · `--line #d8e0dd` · `--line-2 #c5cfca`

### Semantic
`--ok #007f37` · `--warn #925b00` · `--danger #b13a38`

> **Why `--ok` is a saturated blue-green.** With a green brand colour, a green success state risks collapsing into the accent. `--ok` sits at 1.69:1 against `--accent` — distinct enough to read as a separate signal. **Never rely on it alone**; always pair with a checkmark or label.

### Categories (6)
| Token | Hex | Category | Cover word |
|---|---|---|---|
| `--cat-also` | `#7a9b8d` | Alsótest | `ALSÓ` |
| `--cat-felso` | `#4a5a4d` | Felsőtest | `FELSŐ` |
| `--cat-cardio` | `#936c38` | Cardio + has | `CARDIO` |
| `--cat-teljes` | `#865e4f` | Teljes test | `TELJES` |
| `--cat-mobility` | `#9bb4bf` | Mobility | `MOBILITY` |
| `--cat-tartas` | `#7e7590` | Tartás | `TARTÁS` |

All six are separated on **both hue and lightness** (minimum pairwise contrast 1.55) so they stay distinguishable in a scrolling grid, at thumbnail size, and under common colour-vision deficiencies. `--cat-also` equals `--accent` — lower body is the signature category, as it was under pink.

> `--cat-cardio` was deliberately darkened to `L .56`. At its natural `L .70` it measured 1.13 against `--cat-also` — visually indistinguishable. Do not lighten it back.

### Dark theme
Retuned from plum-black to **green-black** so it belongs to the same family:
`--d-bg #18201d` · `--d-surface #232d29` · `--d-surface-2 #2d3834` · `--d-line #3b4943` · `--d-ink #f0f4f3` · `--d-ink-2 #9baca5` · `--d-accent #80b19d`

`--d-accent` is lifted to `L .72` because `--accent` at `L .66` reads muddy on a dark ground.

---

## 5. The inversion rule

**The single most consequential difference from the pink system.**

The old pink was dark enough to carry white text at 4.51:1 — barely passing. Eukaliptusz is lighter: **white on `--accent` is 3.04:1 and fails AA.** Dark ink on it is **5.46:1**.

> ### On any Eukaliptusz surface, text is `--ink` — never white.

| Surface | Pink (old) | Eukaliptusz (new) |
|---|---|---|
| Hero band | white heading/body | **ink** heading/body |
| Hero eyebrow / trust line | white at 85% / 62% | **ink, full opacity** |
| Pricing band | white | **ink** |
| Hero primary CTA | dark ink pill | **unchanged** — still highest contrast |
| `.pill-sage` | pink bg, ink text | accent bg, ink text — pattern now consistent |
| App icon | pink ground, white mark | accent ground, **white mark** — see below |

**Two deliberate exceptions:**

1. **The app icon mark stays white.** A logo is a graphic, not body text; WCAG text contrast does not apply. White-on-eucalyptus at 3.04:1 is legible for a thick-stroke mark, and a dark mark loses the silhouette that makes it recognisable at 29px.
2. **Course-cover metadata stays white** — but only because the shipped `LxCover` puts `cv-code` on a `oklch(0 0 0/.18)` scrim. **Keep that scrim.** Without it the white 11px metadata fails on the lighter categories.

### ⚠ Opacity is part of this rule

Do not reintroduce contrast failures through `opacity`. Dimming ink toward a mid-tone accent is exactly how the previous drafts failed review — three times.

> **Hard rule: no text below 14px may carry `opacity` under `.78`.**
> The WCAG large-text exemption starts at 18.66px bold / 24px regular. Everything smaller needs 4.5:1. Express muted tone with `--ink-2` / `--ink-3`, not opacity.

---

## 6. The hardcoded-literal problem

**⚠ This is where a naive migration fails. 321 pink `oklch()` literals bypass the token system across 20 files.** Changing `:root` will not touch them; the product will render half eucalyptus, half pink.

They are pink-hue literals — `oklch()` with hue 335–360 or 0–25 and chroma > .02 — written inline in gradients, shadows, glows, and tint classes.

### Detection

```bash
# pink-hue oklch literals (the main body of work)
grep -rnE 'oklch\([^)]*\b(3[4-9][0-9]|2[0-5]|1?[0-9])\s*[/)]' --include=*.css .

# specific brand hex, any notation
grep -rniE '#e5719b|#d5638a|#d56487|#f4dde6|#2a1f2[34]|#181821' --include=*.css --include=*.jsx .

# the old plum dark theme
grep -rn '0.022 350\|0.025 350\|0.027 350\|0.028 350' --include=*.css .
```

All three must return zero when you are done.

### Worked examples from `lexfit-landing.css`

These 14 are documented precisely because they are representative of the other ~307. Use them as the pattern.

| Selector | Current | Replace with |
|---|---|---|
| `.panel` radial | `oklch(.66 .155 0/.28)` | `oklch(from var(--accent) l c h / .28)` |
| `.panel` linear | `oklch(.92 .05 350/.85)`, `oklch(.86 .07 355/.7)` | `oklch(0.94 .02 168/.85)`, `oklch(0.90 .03 168/.7)` |
| `.panel` shadow | `oklch(.66 .155 0/.35)`, `oklch(.4 .1 355/.5)` | `oklch(from var(--accent) l c h / .35)`, `oklch(0.35 .03 168/.5)` |
| `.t-sage` | `oklch(.72 .11 5)`, `oklch(.62 .13 358)` | `oklch(0.70 .04 168)`, `oklch(0.60 .045 168)` |
| `.t-coral` | `oklch(.6 .14 40)` | `oklch(0.50 .08 72)` |
| `.t-teal` / `.t-plum` | `oklch(.4 .09 315)` | `oklch(0.40 .028 150)` |
| `.t-rose` | `oklch(.46 .15 353)` | `oklch(0.44 .05 42)` |
| `.t-blue` | `oklch(.6 .11 350)`, `oklch(.5 .13 352)` | `oklch(0.70 .03 225)`, `oklch(0.60 .035 225)` |
| `.t-green` | `oklch(.7 .12 8)`, `oklch(.6 .14 2)` | `oklch(0.68 .04 168)`, `oklch(0.58 .045 168)` |
| `.journey .jbg.ph-alap` | `oklch(.5 .09 320)`, `oklch(.32 .08 318)` | `oklch(0.44 .030 168)`, `oklch(0.29 .022 168)` |
| `.sc-glow` | `oklch(.66 .155 0/.6)` | `oklch(from var(--accent) l c h / .6)` |
| `.cast-beam` | `oklch(.66 .155 0/.5)` | `oklch(from var(--accent) l c h / .5)` |
| grey text (≈20×) | `oklch(.245 .022 350/.6)` | `var(--ink-2)` or `var(--ink-3)` |

### Strategy for the remaining ~307

Work file by file, largest first. For each literal ask: **is it brand, neutral, or category?**

- **Brand tint** (a pink derived from `--accent`) → `oklch(from var(--accent) l c h / α)`
- **Neutral grey** (pink-tinted grey, chroma < .04) → `--ink-2` / `--ink-3` / `--line`
- **Category colour** → the matching `--cat-*` token
- **Dark theme plum** (`hue 350`, L .24–.40) → the matching `--d-*` token

> **On `oklch(from …)`.** Relative colour syntax is supported in current evergreen browsers but not Safari < 16.4. If your support matrix includes it, precompute literals instead. Pick one approach and apply it consistently.

---

## 7. The two-token-system problem

The project has **two competing `:root` blocks**:

| File | Contents | Used by |
|---|---|---|
| `lexfit-tokens.css` | Canonical. Full ink ramp, surfaces, semantic colours, **6 categories**, **dark theme**, `--grad-hero`, `--shadow-card`, plus `.lx` base classes | App, onboarding, program, community, sales |
| `lexfit-landing.css` | Duplicate, thinner. **5 categories** (missing `--cat-tartas`), no dark theme, no semantic colours, legacy `--sage`/`--sage-2`/`--panel`/`--navy` | Landing only |

Apply `eukaliptusz-tokens.css` to **both**. They must not drift — a workout cover that is eucalyptus in the app and pink on the landing page is a visible defect.

**Legacy names to keep for now:** `--sage`, `--sage-2`, `--panel`, `--navy`, `--cream` in the landing file are historical, and currently hold pink values. Point them at the new palette but **do not rename in this pass** — renaming touches every consumer and inflates the diff. Schedule it separately.

**Recommended follow-up (not now):** collapse the landing block into an import of `lexfit-tokens.css`. That removes the drift risk permanently.

---

## 8. File-by-file migration

**Order matters** — tokens first, then the biggest literal offenders, then leaves.

1. **`lexfit-tokens.css`** — replace `:root` with the new file. Also fix its own 22 literals: the `.ph` striped placeholder (`oklch(0.93 0.020 0)` etc.), `.ph.dark`, `--grad-hero`, `--shadow-card`.
2. **`lexfit-landing.css`** — replace `:root`, then the 14 literals in §6.
3. **`app/lexfit-app.css`** (37) — the app shell; highest visual impact after tokens.
4. **`community/szm.css`** (35) — largest single file, 578 lines.
5. **`program/prog.css`** (33) + **`program/prog-guide.css`** (21).
6. **`haladas/hal.css`** (17), **`explore/prog-hero.css`** (16), **`sales/home2.css`** (15), **`cards/cards.css`** (14), **`explore/prog-thumbs.css`** (13).
7. **Remainder** — profile, atv, onboarding, atv-madfit, heroes, progress, dash, prog-simple, library.
8. **JSX sweep** — confirm no hex leaked into `LX_CAT_STYLE`, `H2_CATS`, or inline `style={{}}`.

---

## 9. Component specifications

### Hero
```css
.hero{background:var(--accent);border-radius:28px;margin:16px 16px 0;padding:34px 0 96px;overflow:hidden;position:relative}
.hero-aura{background:radial-gradient(circle, oklch(1 0 0/.34), transparent 60%)}
.hero-nav,.hero-copy,.hero-copy h1,.hero-copy h1 b{color:var(--ink)}
.hero-nav .links a{color:var(--ink-2)}
.hero-nav .links a:hover{color:var(--ink)}
.hero-eyebrow,.hero-trust,.hero-cta2{color:var(--ink)}   /* no opacity — see §5 */
.hero-copy .body{color:var(--ink-2)}
```
`.pill-dark` unchanged.

### Glass panel
```css
.panel{
  background:
    radial-gradient(120% 90% at 12% 8%, oklch(1 0 0/.55), transparent 55%),
    radial-gradient(90% 80% at 88% 100%, oklch(from var(--accent) l c h / .28), transparent 60%),
    linear-gradient(150deg, oklch(0.94 .02 168/.85), oklch(0.90 .03 168/.7));
  border:1px solid oklch(1 0 0/.5);
  box-shadow:inset 0 1px 0 oklch(1 0 0/.7),
             inset 0 -30px 60px -30px oklch(from var(--accent) l c h / .35),
             0 30px 60px -34px oklch(0.35 .03 168/.5);
  backdrop-filter:blur(14px);
}
```
The `::before` specular sweep is colourless — no change.

### CourseCover / LxCover
Formula unchanged; only inputs change:
```css
background:linear-gradient(125deg,
  oklch(from {cat} calc(l - 0.16) calc(c * 0.85) h) 0%,
  {cat} 65%,
  oklch(from {cat} calc(l + 0.07) c h) 100%);
```
Ring, 900-weight category word, meta stack, bloom, and the `cv-code` dark scrim all unchanged. **Keep the scrim** (§5).

Eucalyptus categories are less saturated than the pink set, so the gradient is subtler. If covers read flat, increase the lightness delta to `calc(l - 0.20)` — **do not raise chroma**, that is what makes it look artificial.

### Journey
```css
.journey .jbg.ph-alap  {background:linear-gradient(135deg, oklch(0.44 .030 168), oklch(0.29 .022 168))}
.journey .jbg.ph-epites{background:linear-gradient(135deg, var(--accent-2), oklch(0.40 .04 168))}
```
Phase 1 muted → phase 2 blooming is intentional; preserve it. Journey text is white on these dark grounds — correct. **`ph-epites` must not end at raw `--accent`**; white over it would be 3.04:1.

### Small accent consumers
Straight token swaps: `.castrow .wave`, `.sc-chap .fill`, `.dots i.on`, `.stars` → `--cat-cardio`, `.award .laurel`, `.alexa-pull-big`, `.starter-badge`, `.trainer-card .grad`, `a`/`a:hover` → `--accent-ink`.

---

## 10. Brand mark & icon assets

**Az Ív geometry does not change.** Only fills.

| Asset | New |
|---|---|
| `lexfit-mark-accent.svg` | `#7a9b8d` |
| `lexfit-mark-ink.svg` | `#18201d` |
| `lexfit-mark-white.svg` | unchanged |
| `lexfit-appicon-accent.svg` | eucalyptus ground, **white** mark |
| `lexfit-appicon-dark.svg` | `#18201d` ground, `#7a9b8d` mark |
| `lexfit-appicon-mono.svg` | `#18201d` mark |
| `lexfit-badge-accent.svg` | eucalyptus circle, white mark |
| `lexfit-badge-ink.svg` | `#18201d` circle, `#f0f4f3` mark |
| `lexfit-lockup-*.svg` | accent / ink / white |

Re-render the full PNG matrix: app icon 29–1024, mark 64–1024 ×3, badge 128–1024 ×2, lockups horizontal + vertical ×3, favicon 16–512.

Carried-over constraints: app icons ship **square, no baked rounding, no transparency** (iOS masks them); lockup SVGs contain **live Poppins 800 text** — outline before print or embroidery.

**Merch:** `#7a9b8d` is a common thread colour and embroiders well. The mono mark remains the merch workhorse.

---

## 11. Accessibility requirements

Verified values for this palette — treat as requirements.

| Foreground | Background | Result |
|---|---|---|
| `--ink` | `--accent` | **5.46:1** ✓ |
| white | `--accent` | 3.04:1 ✗ **prohibited for text** |
| `--ink` | `--bg` | 15.22:1 ✓ |
| `--ink-2` | `--bg` | 7.34:1 ✓ |
| `--ink-3` | `--bg` | 4.96:1 ✓ |
| `--ink` | `--accent-soft` | 14.23:1 ✓ |
| white | `--accent-2` | 5.85:1 ✓ |
| `--accent-ink` | white | 7.53:1 ✓ |
| `--ok` / `--warn` / `--danger` | white | 5.13 / 5.65 / 5.95:1 ✓ |
| `--d-ink` | `--d-bg` | 14.99:1 ✓ |
| `--d-ink-2` | `--d-bg` | 7.00:1 ✓ |
| `--d-accent` | `--d-bg` | 6.88:1 ✓ |
| `--ink` | `--cat-mobility` | 7.66:1 ✓ |

**Also required:**
- **No sub-14px text with `opacity < .78`** (§5). This is the failure that recurred three times in review.
- Category colour is never the sole carrier of meaning — every cover has a text label. Keep it.
- `--ok` must always pair with an icon or label, not stand alone as green.
- Re-verify focus rings against the eucalyptus ground; the browser default may be too low-contrast.
- Check the six categories under deuteranopia and protanopia simulation. They separate on lightness by design — verify rather than assume.

---

## 12. What must NOT change

- **Mark geometry** — Az Ív: arc, dot, stroke weight, proportion
- **Typography** — Poppins + IBM Plex Mono, all scales and weights
- **Layout** — 1200px column, 96/64px section rhythm, all grids
- **Radii and shadow structure** — shadow *hue* shifts, geometry does not
- **Motion** — coverflow 2800ms, journey day 2600ms, showcase 5000ms, `cubic-bezier(.22,1,.36,1)`
- **Copy** — every Hungarian string verbatim
- **Component anatomy** — LxCover keeps ring, word, meta stack, bloom, scrim
- **The six-category system** — same names, same cover words

---

## 13. Execution plan

**Phase 1 — Tokens (1 h).** Apply `eukaliptusz-tokens.css` to both token files. The product will look partly broken; expected.

**Phase 2 — Literals (1–2 days).** Work §8's order. Run the §6 greps after each file. This is the bulk of the work.

**Phase 3 — Inversion (2 h).** Hero, pricing band, journey `ph-epites`. Sweep every sub-14px `opacity < .78`.

**Phase 4 — Dark theme (2 h).** Retune the `--d-*` consumers; verify the player, cast band, showcase, and founder finale still feel intentional.

**Phase 5 — Assets (1 h).** Regenerate SVG masters and the PNG matrix.

**Phase 6 — Verification (2 h).** Work §14. Run automated contrast checks on every pair in §11.

---

## 14. Verification checklist

**Colour integrity**
- [ ] All three §6 greps return zero
- [ ] No `#e5719b`, `#d5638a`, `#f4dde6`, `#181821`, `#2a1f24` anywhere
- [ ] Six categories visibly distinct in a scrolled grid
- [ ] Dark bands read as the same family as the accent
- [ ] Both token files identical in shared tokens

**Contrast**
- [ ] Every pair in §11 verified
- [ ] **No white text on `--accent` anywhere**
- [ ] **No sub-14px text with `opacity < .78`** — sweep all 20 CSS files
- [ ] Journey `ph-epites` passes with white text
- [ ] `--ok` never the sole signal

**Components**
- [ ] Hero renders ink-on-eucalyptus, aura visible, dark CTA
- [ ] Glass panels frosted, not muddy
- [ ] Course covers show visible gradient; `cv-code` scrim intact
- [ ] Coverflow, journey, showcase animate unchanged
- [ ] Player and all dark surfaces legible

**Assets**
- [ ] App icon legible at 29px; mark at 20px
- [ ] All three lockup colourways correct
- [ ] Favicons regenerated
- [ ] No asset still pink

**Regression**
- [ ] No layout shift, no copy change
- [ ] No console errors
- [ ] No horizontal overflow at 1440 / 1024 / 768 / 390

---

## Closing note

The riskiest parts are **not** the token swap. They are:

1. **The 321 literals** (§6) — a developer who only changes `:root` ships a half-pink product.
2. **The inversion** (§5) — white-on-eucalyptus renders, so it can pass a casual review while failing accessibility.
3. **Opacity on small text** — this specific failure recurred three times during design review. Treat the `.78` floor as non-negotiable.

Work §5 and §6 deliberately and run the greps. Everything else is mechanical.
