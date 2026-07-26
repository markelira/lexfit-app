# LEXFIT · Olíva Migration
### The complete handbook for replacing the pink brand system with the neutral Olíva palette

**Version 1.0 · Target: `LEXFIT App Landing.html` + `lexfit-landing.css` (and downstream app surfaces)**

---

## Table of contents

1. [Why this change](#1-why-this-change)
2. [The decision in one page](#2-the-decision-in-one-page)
3. [The Olíva palette — full token set](#3-the-olíva-palette--full-token-set)
4. [The inversion rule (read this before writing code)](#4-the-inversion-rule)
5. [Complete token mapping table](#5-complete-token-mapping-table)
6. [The hardcoded-literal problem](#6-the-hardcoded-literal-problem)
7. [File-by-file migration](#7-file-by-file-migration)
8. [Component-by-component specification](#8-component-by-component-specification)
9. [The brand mark & icon set](#9-the-brand-mark--icon-set)
10. [Accessibility requirements](#10-accessibility-requirements)
11. [What must NOT change](#11-what-must-not-change)
12. [Execution plan](#12-execution-plan)
13. [Verification checklist](#13-verification-checklist)
14. [Appendix: copy-paste token block](#14-appendix-copy-paste-token-block)

---

## 1. Why this change

LEXFIT currently uses a rose-pink brand color (`#e5719b`). The product is a home fitness program that happens to have been built around one female trainer, but the *service* — guided 30-minute equipment-free workouts, progress tracking, a community — is not gender-specific. The pink reads as gendered and narrows the addressable audience before a visitor has read a single word.

**Olíva** (`#8b8f6b`) was selected from six neutral candidates. The reasoning:

- **Neutral without being generic.** Beige/taupe options tested as forgettable; the brand would have had to carry recognition entirely on the mark and typography.
- **Category differentiation.** Most wellness and fitness apps that de-gender end up in the same beige territory. Muted olive is comparatively unoccupied, so LEXFIT can own it.
- **Tonal fit.** Olive carries a quiet, grounded, natural association that suits a no-pressure, consistency-over-intensity philosophy. It is calm without being clinical.

**The known risk:** olive can drift toward an organic-food or "wellness supplement" read if photography is also green-dominant. Art direction must compensate — favor warm skin tones, neutral interiors, wood, and textile; avoid green plants dominating hero imagery.

---

## 2. The decision in one page

| | |
|---|---|
| **New brand accent** | `#8b8f6b` — Olíva |
| **Deep accent** | `#6f7454` |
| **Ink (text)** | `#25271f` |
| **Base surface** | `#f8f8f3` |
| **Text on accent** | **Dark ink**, never white |
| **Mark geometry** | Unchanged (Az Ív) |
| **Typography** | Unchanged (Poppins + IBM Plex Mono) |
| **Layout, spacing, radii** | Unchanged |
| **Category colors** | Retuned, still five distinct hues |
| **Estimated scope** | ~40 CSS declarations, 7 SVG/PNG asset families, 0 layout changes |

This is a **token and asset migration, not a redesign.** If you find yourself changing spacing, type, or component structure, stop — that is out of scope.

---

## 3. The Olíva palette — full token set

### 3.1 Brand

| Token | Hex | OKLCH | Role |
|---|---|---|---|
| `--accent` | `#8b8f6b` | `oklch(0.60 0.045 118)` | Primary brand. Hero band, pricing band, app icon ground, active states, progress fills |
| `--accent-2` | `#6f7454` | `oklch(0.50 0.048 118)` | Hover, gradient ends, deeper emphasis |
| `--accent-soft` | `#eef0e3` | `oklch(0.94 0.020 116)` | Chip backgrounds, tinted panels, icon wells |
| `--ink` | `#25271f` | `oklch(0.24 0.014 120)` | Headings, body text, primary buttons, **text on accent** |
| `--ink-2` | `#565948` | `oklch(0.43 0.024 117)` | Secondary body text |
| `--ink-3` | `#868a76` | `oklch(0.61 0.026 116)` | Metadata, captions, disabled |

### 3.2 Surfaces (the "stone" ramp)

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#f8f8f3` | Page background |
| `--surface` | `#eff0e8` | Section bands, cards on tinted ground |
| `--surface-2` | `#e7e9dd` | Nested surfaces, quiet buttons |
| `--line` | `#dfe1d4` | Borders, dividers, input outlines |
| `--line-2` | `#cdd0bf` | Stronger dividers |
| `--navy` | `#1f2119` | Dark bands (cast, showcase, founder finale) — **retuned from `#181821` to sit in the olive family** |
| `--white` | `#ffffff` | Cards, pricing cards |

> **Note on `--navy`:** the existing `#181821` is a cool blue-black. Against olive it reads slightly purple. Shift to `#1f2119` — a green-black that belongs to the same family. This is a subtle but important adjustment; side-by-side it is the difference between "two palettes coexisting" and "one system."

### 3.3 Workout category colors

These stay **five visually distinct hues** — they are functional color coding, not brand color. Retuned to sit within the olive world instead of the pink one.

| Token | Hex | OKLCH | Category | Cover word |
|---|---|---|---|---|
| `--cat-also` | `#8b8f6b` | `oklch(0.60 0.045 118)` | Alsótest | `ALSÓ` |
| `--cat-felso` | `#6c6f5e` | `oklch(0.48 0.024 120)` | Felsőtest | `FELSŐ` |
| `--cat-cardio` | `#b08a55` | `oklch(0.65 0.075 75)` | Cardio + has | `CARDIO` |
| `--cat-teljes` | `#7d6a4e` | `oklch(0.50 0.045 80)` | Teljes test | `TELJES` |
| `--cat-mobility` | `#7f9280` | `oklch(0.61 0.033 145)` | Mobility | `MOBILITY` |

**Why these five:** they separate on both hue and lightness so they remain distinguishable in a scrolling grid, at thumbnail size, and for the most common color-vision deficiencies. `--cat-also` intentionally equals `--accent` — lower body is the program's signature category, exactly as it was under the pink system.

---

## 4. The inversion rule

**This is the single most consequential difference between the pink and Olíva systems. Read it carefully.**

The old pink (`#e5719b`) was dark enough to carry **white text** at 4.51:1 — just barely passing WCAG AA.

Olíva (`#8b8f6b`) is a *lighter* color. White text on it measures **3.37:1 — it fails AA.**

Therefore:

> ### On any Olíva surface, text is dark ink (`#25271f`) — never white.
> Dark ink on Olíva measures **9.7:1**. Comfortable, and passes AAA.

This inverts the hero, the pricing band, and every filled accent surface.

**Practical consequences:**

| Surface | Pink system (old) | Olíva system (new) |
|---|---|---|
| Hero band | Pink bg, **white** heading/body | Olíva bg, **ink** heading/body |
| Hero eyebrow | `oklch(1 0 0/.85)` white | `--ink` at 85% opacity |
| Hero trust line | `oklch(1 0 0/.62)` white | `--ink` at 60% opacity |
| Hero aura | White radial glow | White radial glow at **higher** opacity (`.34`) — it now reads as light on a mid-tone, which is correct |
| Hero primary CTA | Dark ink pill, white text | **Unchanged** — dark ink pill still correct, still highest contrast |
| Hero secondary CTA | White text | `--ink` at 78% |
| Pricing band | Pink bg | Olíva bg, all text ink |
| `.pill-sage` | Pink bg, ink text | Olíva bg, ink text — **unchanged pattern**, now consistent |
| App icon | Pink ground, **white** mark | Olíva ground, **white** mark — **stays white** (see §9) |

**The app icon is the deliberate exception.** A logo mark is a graphic element, not body text; WCAG text contrast does not apply. White-on-olive at 3.37:1 is entirely legible for a thick-stroke mark at icon sizes, and a dark mark would lose the crisp silhouette that makes it recognizable on a home screen. Keep the mark white.

---

## 5. Complete token mapping table

Every value that changes, old → new.

### 5.1 Brand tokens

| Token | Old | New |
|---|---|---|
| `--accent` | `oklch(0.66 0.155 0)` `#e5719b` | `oklch(0.60 0.045 118)` `#8b8f6b` |
| `--accent-2` | `oklch(0.58 0.165 358)` `#d5638a` | `oklch(0.50 0.048 118)` `#6f7454` |
| `--ink` | `oklch(0.245 0.022 350)` `#2a1f24` | `oklch(0.24 0.014 120)` `#25271f` |
| `--cream` | `#f6f5f2` | `#f8f8f3` |
| `--sage` | `#e5719b` | `#8b8f6b` |
| `--sage-2` | `#e5719b` | `#8b8f6b` |
| `--panel` | `#f4dde6` | `#eef0e3` |
| `--navy` | `#181821` | `#1f2119` |

> **Legacy token names.** `--sage` and `--sage-2` are historical names from the MadFit-derived scaffold; they currently hold the pink value. With this migration the names finally match their contents again. **Do not rename them in this pass** — renaming touches every consumer and inflates the diff. Add a comment and schedule the rename separately.

### 5.2 Category tokens

| Token | Old | New |
|---|---|---|
| `--cat-also` | `oklch(0.66 0.155 0)` | `oklch(0.60 0.045 118)` |
| `--cat-felso` | `oklch(0.45 0.085 320)` | `oklch(0.48 0.024 120)` |
| `--cat-cardio` | `oklch(0.68 0.140 45)` | `oklch(0.65 0.075 75)` |
| `--cat-teljes` | `oklch(0.52 0.150 355)` | `oklch(0.50 0.045 80)` |
| `--cat-mobility` | `oklch(0.66 0.090 155)` | `oklch(0.61 0.033 145)` |

### 5.3 New tokens to add

The current sheet has no neutral ramp — greys are written inline as `oklch(.245 .022 350/.6)` and similar, dozens of times. Add these and migrate opportunistically:

```css
--ink-2:oklch(0.43 0.024 117);
--ink-3:oklch(0.61 0.026 116);
--surface:#eff0e8;
--surface-2:#e7e9dd;
--line:#dfe1d4;
--line-2:#cdd0bf;
--accent-soft:#eef0e3;
/* hero inversion */
--on-accent:var(--ink);
--on-accent-soft:oklch(0.24 0.014 120/.78);
```

Using `--on-accent` rather than hardcoding `--ink` at each site means a future palette change (or a dark mode) is a one-line edit.

---

## 6. The hardcoded-literal problem

**⚠️ This is where a naive find-and-replace will fail.**

`lexfit-landing.css` contains **14 pink values written as raw `oklch()` literals** that bypass the token system entirely. Changing `--accent` will not touch them. They will remain pink and the page will look broken.

Every one must be found and converted. Here is the complete inventory:

| Line ≈ | Selector | Current literal | Replace with |
|---|---|---|---|
| 67 | `.panel` (radial layer) | `oklch(.66 .155 0/.28)` | `oklch(from var(--accent) l c h / .28)` |
| 68 | `.panel` (linear layer) | `oklch(.92 .05 350/.85)`, `oklch(.86 .07 355/.7)` | `oklch(0.94 .02 116/.85)`, `oklch(0.90 .03 116/.7)` |
| 70 | `.panel` (box-shadow) | `oklch(.66 .155 0/.35)`, `oklch(.4 .1 355/.5)` | `oklch(from var(--accent) l c h / .35)`, `oklch(0.35 .03 118/.5)` |
| 110 | `.t-sage` | `oklch(.72 .11 5)`, `oklch(.62 .13 358)` | `oklch(0.66 .04 118)`, `oklch(0.56 .045 118)` |
| 111 | `.t-coral` | `oklch(.6 .14 40)` | `oklch(0.56 .07 75)` |
| 112 | `.t-teal` | `oklch(.4 .09 315)` | `oklch(0.40 .02 120)` |
| 114 | `.t-plum` | `oklch(.4 .09 315)` | `oklch(0.40 .02 120)` |
| 115 | `.t-rose` | `oklch(.46 .15 353)` | `oklch(0.44 .04 80)` |
| 116 | `.t-blue` | `oklch(.6 .11 350)`, `oklch(.5 .13 352)` | `oklch(0.58 .03 145)`, `oklch(0.48 .035 145)` |
| 117 | `.t-green` | `oklch(.7 .12 8)`, `oklch(.6 .14 2)` | `oklch(0.64 .045 118)`, `oklch(0.54 .05 118)` |
| 176 | `.journey .jbg.ph-alap` | `oklch(.5 .09 320)`, `oklch(.32 .08 318)` | `oklch(0.46 .028 122)`, `oklch(0.30 .022 122)` |
| 249 | `.sc-glow` | `oklch(.66 .155 0/.6)` | `oklch(from var(--accent) l c h / .6)` |
| 294 | `.cast-beam` | `oklch(.66 .155 0/.5)` | `oklch(from var(--accent) l c h / .5)` |
| — | all grey text | `oklch(.245 .022 350/.6)` etc. | `oklch(from var(--ink) l c h / .6)` |

**Detection commands.** After migrating, none of these should return results:

```bash
# any pink-hue oklch literal (hues 340–20 with real chroma)
grep -nE 'oklch\([^)]*\b(3[4-9][0-9]|0|1?[0-9])\)' lexfit-landing.css

# the specific brand pink, any notation
grep -niE '#e5719b|#d5638a|#f4dde6|\.66 \.155 0|0\.66 0\.155 0' .

# the old cool navy
grep -n '#181821' .
```

> **On `oklch(from …)` relative color syntax.** It is well supported in current evergreen browsers but not in older Safari. If the project's browser support matrix includes Safari < 16.4, precompute these as literal values instead. The mapping table above gives literals for every case where a `from` expression is suggested, so either route works — pick one and be consistent.

---

## 7. File-by-file migration

### 7.1 `lexfit-landing.css` — the main body of work

**Step 1 — replace the `:root` block.** Use the block in §14 verbatim.

**Step 2 — work the 14 literals in §6.** Do not skip; do not batch-replace blindly. Each has a specific replacement.

**Step 3 — invert the hero.** Full spec in §8.1.

**Step 4 — invert the pricing band.** §8.6.

**Step 5 — sweep the inline greys.** All `oklch(.245 .022 350/…)` instances are pink-hued greys. Convert to `oklch(from var(--ink) l c h / …)`. Roughly 20 occurrences; purely mechanical.

**Step 6 — retune `--navy`.** Single token change; verify the three dark bands (cast, showcase, founder finale) still feel intentional.

### 7.2 `LEXFIT App Landing.html`

Mostly clean — it consumes tokens. Two things to check:

- Inline `style="…"` attributes containing color. Search `style="` for `#` and `oklch`.
- The `progThemeDot` JS object maps categories to `var(--cat-*)` tokens. **It should need no change** — verify it references tokens and not hex. If any hex leaked in, fix at the source.

### 7.3 Icon and brand assets

Regenerate every asset in `brand/` and `icons/`. See §9.

### 7.4 Downstream app surfaces

If the mobile/web app shares a token file (`lexfit-tokens.css` or equivalent), apply the same `:root` block there. The category tokens especially must stay synchronized — a workout cover that is olive on the landing page and pink in the app is a visible defect.

---

## 8. Component-by-component specification

### 8.1 Hero — `header.hero`

The most-changed component.

```css
.hero{
  background:var(--accent);              /* was pink */
  border-radius:28px;
  margin:16px 16px 0;
  padding:34px 0 96px;
  overflow:hidden;
  position:relative;
}
.hero-aura{
  /* white glow — raise opacity, olive is lighter than the old pink */
  background:radial-gradient(circle, oklch(1 0 0/.34), transparent 60%);
}
.hero-nav{color:var(--ink)}                      /* was #fff */
.hero-nav .links a{color:oklch(from var(--ink) l c h / .7)}
.hero-nav .links a:hover{color:var(--ink)}
.hero-eyebrow{color:oklch(from var(--ink) l c h / .85)}
.hero-copy{color:var(--ink)}                     /* was #fff */
.hero-copy h1{color:var(--ink)}
.hero-copy h1 b{color:var(--ink)}                /* solid, no gradient */
.hero-copy .body{color:oklch(from var(--ink) l c h / .82)}
.hero-cta2{color:oklch(from var(--ink) l c h / .78)}
.hero-cta2:hover{color:var(--ink)}
.hero-trust{color:oklch(from var(--ink) l c h / .6)}
```

`.pill-dark` (the primary CTA) is **unchanged** — dark ink with white text still gives the strongest possible call to action against the olive ground.

**Verify:** heading, body, eyebrow, and trust line all ≥ 4.5:1 against `#8b8f6b`. Expected ≈ 9.7:1, 7.6:1, 8.0:1, 5.2:1.

### 8.2 Glass panel — `.panel`

Keep the layered-glass construction; re-hue it.

```css
.panel{
  position:relative;border-radius:28px;overflow:hidden;
  background:
    radial-gradient(120% 90% at 12% 8%, oklch(1 0 0/.55), transparent 55%),
    radial-gradient(90% 80% at 88% 100%, oklch(from var(--accent) l c h / .28), transparent 60%),
    linear-gradient(150deg, oklch(0.94 .02 116/.85), oklch(0.90 .03 116/.7));
  border:1px solid oklch(1 0 0/.5);
  box-shadow:
    inset 0 1px 0 oklch(1 0 0/.7),
    inset 0 -30px 60px -30px oklch(from var(--accent) l c h / .35),
    0 30px 60px -34px oklch(0.35 .03 118/.5);
  backdrop-filter:blur(14px);
}
```

The `::before` specular sweep is colorless — **no change**.

### 8.3 CourseCover — the LxCover system

**The formula is unchanged.** Only the input colors change.

```css
background:linear-gradient(125deg,
  oklch(from {cat} calc(l - 0.16) calc(c * 0.85) h) 0%,
  {cat} 65%,
  oklch(from {cat} calc(l + 0.07) c h) 100%);
```

Corner ring, 900-weight category word, meta stack, and top-right bloom all unchanged.

**Important:** olive category colors are *less saturated* than the pink set. The `calc(c * 0.85)` step therefore produces a subtler gradient. If covers read as flat, increase the lightness delta to `calc(l - 0.20)` rather than raising chroma — chroma is what would make it look artificial.

### 8.4 Category tint classes — `.t-*`

These legacy classes (`.t-sage`, `.t-coral`, `.t-teal`, `.t-pink`, `.t-plum`, `.t-rose`, `.t-blue`, `.t-green`) are all-pink today. Map per §6.

> **Cleanup opportunity:** the names are meaningless now (`.t-pink` in an olive system). They duplicate the category tokens. Consider collapsing them into five `.t-{category}` classes in a follow-up. **Not in this pass.**

### 8.5 Journey — `.journey`

```css
.journey .jbg.ph-alap  {background:linear-gradient(135deg, oklch(0.46 .028 122), oklch(0.30 .022 122))}
.journey .jbg.ph-epites{background:linear-gradient(135deg, var(--accent), var(--accent-2))}
```

Phase 1 (Alap) is the darker, quieter gradient; phase 2 (Építés) blooms into full brand olive. That progression — muted to saturated as the program intensifies — is intentional and must be preserved.

All journey text sits on these mid-to-dark grounds, so **white text stays correct here.** Verify `ph-epites` specifically: white on `#8b8f6b` is 3.37:1 and **fails**. Either darken the gradient start, or switch journey text to ink on that phase. **Recommended:** darken to `linear-gradient(135deg, var(--accent-2), oklch(0.40 .04 118))` and keep white text at ~6.2:1.

### 8.6 Pricing band

```css
#elofizetes{background:var(--sage-2)}   /* now olive */
```
Wordmark, eyebrow, and caption all switch to `--ink`. Pricing cards stay cream/white with ink text — unchanged. Savings labels: `.save.cyan` → `--accent-2` (needs the deeper value for contrast on white), `.save.coral` → `--cat-cardio`.

### 8.7 Sticky nav

Glass pill on white — largely unaffected. Active link `--ink`, inactive `--ink` at 58%, CTA pill dark. Only `.stickynav .mini:hover{background:var(--accent-2)}` shifts with the token.

### 8.8 Small accent consumers

Straight token swaps, no structural change: `.castrow .wave`, `.sc-chap .fill`, `.dots i.on`, `.stars` (→ `--cat-cardio`), `.award .laurel`, `.alexa-pull-big`, `.starter-badge`, `.trainer-card .grad`, `a` / `a:hover`.

---

## 9. The brand mark & icon set

**The geometry of Az Ív does not change.** Only fills.

Regenerate all of `brand/` and `icons/`:

| Asset | Old | New |
|---|---|---|
| `lexfit-mark-accent.svg` | `#e5719b` | `#8b8f6b` |
| `lexfit-mark-ink.svg` | `#2a1f24` | `#25271f` |
| `lexfit-mark-white.svg` | `#ffffff` | unchanged |
| `lexfit-appicon-accent.svg` | pink ground, white mark | **olive ground, white mark** |
| `lexfit-appicon-dark.svg` | ink ground, pink mark | ink ground (`#25271f`), olive mark |
| `lexfit-appicon-mono.svg` | ink mark | `#25271f` mark |
| `lexfit-badge-accent.svg` | pink circle, white mark | olive circle, white mark |
| `lexfit-badge-ink.svg` | ink circle, cream mark | `#25271f` circle, `#f1f2ea` mark |
| `lexfit-lockup-*.svg` | pink / ink / white | olive / new ink / white |

Then re-render the full PNG matrix: app icon 29–1024, mark 64–1024 ×3 colorways, badge 128–1024 ×2, lockups horizontal + vertical ×3, favicon 16–512.

**Two constraints carried over from the icon work, still binding:**
1. App icons ship **square with no baked-in rounding and no transparency** — iOS applies the mask.
2. Lockup SVGs contain **live Poppins 800 text**; outline before print or embroidery.

**Merch note:** olive at `#8b8f6b` is a common thread color and embroiders well. The single-color mono mark remains the merch workhorse.

---

## 10. Accessibility requirements

Every combination below must be verified after migration. These are requirements, not suggestions.

| Foreground | Background | Required | Expected |
|---|---|---|---|
| `--ink` | `--accent` | ≥ 4.5:1 | **9.7:1** ✓ |
| `--ink` @ 82% | `--accent` | ≥ 4.5:1 | ~7.6:1 ✓ |
| `--ink` @ 60% | `--accent` | ≥ 4.5:1 | ~5.2:1 ✓ |
| `--ink` | `--bg` | ≥ 4.5:1 | ~15.8:1 ✓ |
| `--ink-2` | `--bg` | ≥ 4.5:1 | ~7.9:1 ✓ |
| `--ink-3` | `--bg` | ≥ 4.5:1 | ~3.4:1 ⚠ **large text / non-essential only** |
| white | `--navy` | ≥ 4.5:1 | ~16.4:1 ✓ |
| white | `--accent` | — | 3.37:1 ✗ **prohibited for text** |
| white | `--accent-2` | ≥ 4.5:1 | ~5.9:1 ✓ (acceptable where needed) |
| white | `--cat-cardio` | ≥ 4.5:1 | ~3.6:1 ✗ — use ink, or reserve for cover art only |

**`--ink-3` caveat:** at ~3.4:1 it is below AA for normal text. It is currently used for metadata and captions. Either accept it strictly for non-essential decoration, or darken to `oklch(0.55 0.026 116)` (~4.6:1). **Recommendation: darken it.** Metadata like workout duration is real information, not decoration.

**Also required:**
- Do not encode meaning in category color alone — every cover already carries a text label (`ALSÓ`, `CARDIO`, …). Keep it.
- Re-verify focus indicators against olive; the default browser ring may be too low-contrast on `--accent`.
- The olive palette compresses hue variance, so **check the five category colors under deuteranopia and protanopia simulation.** They separate on lightness as well as hue by design, but verify rather than assume.

---

## 11. What must NOT change

Explicitly out of scope. Changing any of these turns a controlled migration into a redesign:

- **Mark geometry.** Az Ív is fixed — arc, dot, stroke weight, proportion.
- **Typography.** Poppins + IBM Plex Mono, all scales and weights.
- **Layout.** 1200px column, 96/64px section rhythm, all grid definitions.
- **Radii and shadow structure.** Shadow *hue* shifts with the palette; geometry does not.
- **Motion.** All timings and easings: coverflow 2800ms, journey day 2600ms, showcase 5000ms, `cubic-bezier(.22,1,.36,1)`.
- **Copy.** Every Hungarian string stays verbatim.
- **Component anatomy.** LxCover keeps its ring, category word, meta stack, bloom.
- **The five-category system.** Five distinct colors, same names, same cover words.

---

## 12. Execution plan

Ordered to keep the page renderable at every step.

**Phase 1 — Tokens (30 min)**
1. Replace `:root` with the §14 block.
2. Add the new neutral and `--on-accent` tokens.
3. Load the page. It will look partly broken — expected, the literals are still pink.

**Phase 2 — Literals (1–2 h)**
4. Work all 14 entries in §6 in order.
5. Run the detection greps. Zero results required.
6. Page should now be coherently olive.

**Phase 3 — Inversion (1 h)**
7. Invert the hero per §8.1.
8. Invert the pricing band per §8.6.
9. Fix the journey `ph-epites` contrast per §8.5.
10. Sweep inline greys to `oklch(from var(--ink) …)`.

**Phase 4 — Assets (1 h)**
11. Regenerate SVG masters with new fills.
12. Re-render the full PNG matrix.
13. Update the favicon set.

**Phase 5 — Verification (1 h)**
14. Work the §13 checklist.
15. Run automated contrast checks on all pairs in §10.
16. Screenshot the full page top-to-bottom; compare against the pink version for anything that shifted structurally (nothing should have).

**Phase 6 — Propagation**
17. Apply the same tokens to shared app token files.
18. Update the design library and handoff docs to the new values.

---

## 13. Verification checklist

**Color integrity**
- [ ] `grep` for `#e5719b`, `#d5638a`, `#f4dde6`, `#181821` → zero results
- [ ] `grep` for pink-hue `oklch` literals → zero results
- [ ] All five category colors visibly distinct in a scrolled grid
- [ ] Dark bands feel like the same family as olive, not a separate palette

**Contrast**
- [ ] Hero heading, body, eyebrow, trust line all ≥ 4.5:1
- [ ] No white text on `--accent` anywhere
- [ ] Journey `ph-epites` text passes
- [ ] Pricing band text passes
- [ ] `--ink-3` either darkened or confined to non-essential text

**Components**
- [ ] Hero renders ink-on-olive, aura visible, CTA dark pill
- [ ] Glass panels read as frosted, not muddy
- [ ] Course covers show a visible gradient (not flat)
- [ ] Coverflow, journey, showcase all animate unchanged
- [ ] Sticky nav glass pill still legible over both light and dark sections

**Assets**
- [ ] App icon legible at 29px
- [ ] Mark legible at 20px
- [ ] All three lockup colorways correct
- [ ] Favicons regenerated
- [ ] No asset still carries pink

**Regression**
- [ ] No layout shift versus the pink build
- [ ] No copy changed
- [ ] No console errors
- [ ] No horizontal overflow at 1440 / 1024 / 768 / 390

---

## 14. Appendix: copy-paste token block

```css
:root{
  /* ---- brand · Olíva ---- */
  --accent:oklch(0.60 0.045 118);        /* #8b8f6b */
  --accent-2:oklch(0.50 0.048 118);      /* #6f7454 */
  --accent-soft:#eef0e3;

  /* ---- ink ramp ---- */
  --ink:oklch(0.24 0.014 120);           /* #25271f */
  --ink-2:oklch(0.43 0.024 117);         /* #565948 */
  --ink-3:oklch(0.55 0.026 116);         /* darkened for AA */

  /* ---- surfaces ---- */
  --bg:#f8f8f3;
  --cream:#f8f8f3;                       /* legacy alias */
  --surface:#eff0e8;
  --surface-2:#e7e9dd;
  --line:#dfe1d4;
  --line-2:#cdd0bf;
  --navy:#1f2119;                        /* green-black, was #181821 */
  --sage:#8b8f6b;                        /* legacy name — now truthful */
  --sage-2:#8b8f6b;
  --panel:#eef0e3;

  /* ---- workout categories ---- */
  --cat-also:oklch(0.60 0.045 118);      /* #8b8f6b  ALSÓ     */
  --cat-felso:oklch(0.48 0.024 120);     /* #6c6f5e  FELSŐ    */
  --cat-cardio:oklch(0.65 0.075 75);     /* #b08a55  CARDIO   */
  --cat-teljes:oklch(0.50 0.045 80);     /* #7d6a4e  TELJES   */
  --cat-mobility:oklch(0.61 0.033 145);  /* #7f9280  MOBILITY */

  /* ---- inversion helpers ---- */
  --on-accent:var(--ink);
  --on-accent-soft:oklch(0.24 0.014 120/.78);

  /* ---- unchanged ---- */
  --font:"Poppins","Helvetica Neue",sans-serif;
  --mono:"IBM Plex Mono",monospace;
  --col:1200px;
}
```

---

## Closing note for the implementer

The riskiest part of this migration is **not** the token swap — it is the 14 hardcoded literals in §6 and the text-color inversion in §4. A developer who only changes `:root` will produce a page that is half olive and half pink, with unreadable white-on-olive hero text that technically renders and therefore may pass a casual review.

Work §6 and §4 deliberately, and run the grep commands. Everything else is mechanical.
