# LEXFIT homepage — typography & spacing specification

Date: 2026-08-11. **Data collection only.** No fixes proposed, no changes made.
Purpose: record what every section on `/` actually renders, so the consistency
question can be argued from measurements instead of impressions.

Measured on a production build (`next build` → `next start`) at **1440×900** and
**390×844**, computed styles read from the live DOM, all `.rise` reveals forced open
and all `<details>` closed.

**Two measurement notes, because both bit me:**

1. Colours are declared in `oklch()` / `lab()` / relative-colour syntax, which
   `getComputedStyle` returns verbatim. My first pass fed those strings to a canvas
   and read back `fillStyle` — the canvas **silently rejected** them and returned the
   previous value, producing a table of fake `#000000`s. Every colour below is
   resolved by *rasterizing* the value and reading the pixel, with a sentinel to
   detect rejection.
2. `document.querySelector('.wordmark')` returns the **sticky-nav** instance, not the
   hero one. Any "one selector = one spec" assumption is wrong on this page; the
   per-band tables below are collected by walking each band separately.

Legend: `px/wt/lh/ls` = font-size px / weight / line-height as a **ratio** /
letter-spacing in **em**. `P` = Poppins, `M` = IBM Plex Mono. `α` = text alpha.
`n` = instances in that band.

---

# PART A — Page-wide picture

## A1 · Foundations

| | |
|---|---|
| Display + body face | **Poppins**, weights 300/400/500/600/700/800/900 (`next/font`) |
| Mono face | **IBM Plex Mono**, weights 400/500 |
| Declared stacks | `--font: var(--font-poppins), "Poppins", "Helvetica Neue", sans-serif` · `--mono: var(--font-plex-mono), "IBM Plex Mono", monospace` |
| Container | `--col: 1200px`; `.wrap { max-width: 1200px; padding: 0 40px }` → **0 22px** below 900px |
| Root line-height | none declared on `.lxl` → **`normal`**, so any element without an explicit `line-height` inherits the UA/browser default rather than a token |

Only two families are in play and both are loaded properly — **the "font feels
different" impression is not a font-family problem.** It is produced by weight, size
and tracking varying between elements that occupy the same role (§A3, §A4).

## A2 · Band vertical rhythm

Padding is top/bottom on the band element. Height is the rendered band.

| # | Band | Class | Pad 1440 | Pad 390 | H 1440 | H 390 |
|---|---|---|---|---|---|---|
| 0 | Hero | `.hero` | 34 / 96 | 34 / 96 | 846 | 1343 |
| 1 | Hogyan működik | `.band-cream.sec-first` | **116 / 28** | **116 / 28** | 1035 | 1143 |
| 2 | Edzés Alexával | `.band-cream.sec` | 96 / 96 | 96 / 96 | 929 | 1534 |
| 3 | Nagy képernyő | `.band-navy.sec` | 96 / 96 | 96 / 96 | 1056 | 889 |
| 4 | Programok | `.band-cream.sec-sm` | 64 / 64 | 64 / 64 | 1549 | 2260 |
| 5 | Ár-horgony | `.band-navy.sec` | 96 / 96 | 96 / 96 | 536 | 521 |
| 6 | Foundation | `.band-cream.sec-sm` | 64 / 64 | 64 / 64 | 1162 | 1430 |
| 7 | A heted | `.band-navy.sec` | 96 / 96 | 96 / 96 | 645 | 743 |
| 8 | Haladás | `.band-cream.sec` | 96 / 96 | 96 / 96 | 783 | 932 |
| 9 | Amikor kész vagy | `.band-navy.sec` | 96 / 96 | 96 / 96 | 791 | 811 |
| 10 | Kihívások | `.band-cream.sec-sm` | 64 / 64 | 64 / 64 | 868 | 933 |
| 11 | Alexa | `.alexa-hero` | **120 / 90** | **86 / 70** | 1346 | 1968 |
| 12 | GYIK | `.band-cream.sec-sm` | 64 / 64 | 64 / 64 | 844 | 862 |
| 13 | Előfizetés | `.band-sage.pricing-band` | **120 / 90** | 120 / 90 | 973 | 1808 |

**Five distinct vertical rhythms:** `96/96` (×6), `64/64` (×4), `120/90` (×2),
`116/28` (×1), `34/96` (hero). Only band 11 changes its padding between viewports.

## A3 · The section-heading system, as measured

Every element that functions as a section headline:

| Class | Tag | 1440 px/wt/lh/ls | 390 px/wt/lh | Font | Transform | Align | Used in |
|---|---|---|---|---|---|---|---|
| `.hero-copy h1` | H1 | **80.64**/300/1.00/−0.020 | 44/300/1.00 | P | uppercase | left | 0 |
| `.h-bold` | H2 | **34**/600/1.08/−0.028 | 26/600/1.08 | P | — | center | 1 |
| `.h-thin` | H3 | **46**/300/1.04/−0.022 | 30/300/1.04 | P | **lowercase** | center | 2, 3, 8 |
| `.cap-title` | H3 | **23**/500/**1.50**/−0.020 | 20/500/**1.50** | P | — | center | 4, 9, 10, 12 |
| `.starter-title` | H2 | **54**/600/1.02/−0.030 | 32/600/1.02 | P | — | center | 6, 7 |
| `.alexa-pull-big` | H2 | **52**/300/1.05/−0.030 | 30/300/1.05 | P | — | start | 11 |
| `.aq-close` | **P** | **60**/300/1.02/−0.030 | 34/300/1.02 | P | — | start | 11 |
| `.hrow-head h3` | H3 | **16**/800/**1.50**/−0.015 | 16/800/**1.50** | P | — | start | 4, 10 |
| `.pgs-title` | H2 | **23**/900/0.98/−0.025 | 19/900/0.98 | P | uppercase | start | 4 (×7) |

Recorded facts:

- **Nine treatments** for section-level headings.
- Weights in use: **300, 500, 600, 800, 900** — five of the seven loaded weights.
- Sizes at 1440 for "a section heading": **16, 23, 23, 34, 46, 52, 54, 60, 80.64** px.
- Tracking values for display type: **−0.015, −0.020, −0.022, −0.025, −0.028, −0.030** em — six.
- **`.cap-title` and `.hrow-head h3` render at `line-height: 1.50`.** Neither declares
  a `line-height`; 1.5 is inherited. Every heading that *does* declare one sits at
  0.98–1.08. (This is the same inheritance pattern already found and fixed once on
  `.alexa-pull-big`, which was at 1.5 before being set to 1.05.)
- `.h-thin` is `text-transform: lowercase`; every other heading is sentence case or
  uppercase.
- `.aq-close` (60px, the third-largest type on the page) is a `<p>`, not a heading.

## A4 · The micro-label (mono) system

Every uppercase mono label — eyebrows, chips, meta rows:

| Selector | px | wt | ls (em) | Transform |
|---|---|---|---|---|
| `.eyebrow` | 11 | 400 | **0.140** | uppercase |
| `.hero-eyebrow` | 11.5 | 400 | **0.160** | uppercase |
| `.j-eyebrow` | 12 | 400 | **0.160** | uppercase |
| `.starter-badge` | 11 | 400 | **0.160** | uppercase |
| `.pgs-eyebrow` | 11.5 | 400 | **0.110** | none |
| `.hero-nav .links` | 11 | 400 | **0.130** | uppercase |
| `.stickynav .row1 .links` | 11 | 400 | **0.110** | uppercase |
| `.aq-sign` | 12 | 400 | **0.140** | uppercase |
| `.price-badge` | 10.5 | 600 | **0.120** | uppercase |
| `.ch-count` | 11.5 | 400 | **0.050** | uppercase |
| `.step-kicker` | 12 | 400 | **0.060** | none |
| `.hero-trust` | 12.5 | 400 | **0.080** | uppercase |
| `.hero-price` | 12.5 | 400 | **0.030** | none |
| `.pa-row` | 12 | 400 | **0.100** | uppercase |
| `.starter-facts span` | 11 | 400 | **0.050** | uppercase |
| `.j-meta` | 11.5 | 400 | **0.060** | uppercase |
| `.lab` (cast row) | 10 | 400 | **0.120** | none |
| `.wkp-count` / `.wkp-rest` | 12 | 400 | **0.100** | uppercase |
| `.plan` | 13 | 500 | **0.140** | uppercase |
| `.cur` | 11 | 400 | **0.140** | none |
| `.price-pick` | 11 | 600 | **0.100** | uppercase |
| `.save.cyan` | 12 | 500 | **0.100** | uppercase |
| `.price-trust span` | 11.5 | 400 | **0.100** | uppercase |
| `.fex-name` | 11 | 400 | 0.050 | none |
| `.chc-stack` | 8.5 | 400 | 0.040 | none |
| `.chc-days` | 9 | 400 | 0.030 | none |
| `.ey` (workout card) | 8.5 | 400 | 0.070 | none |
| `.wc-dur` | 11 | 400 | 0.030 | none |
| `.nm` (program lockup) | 10.5 | 500 | 0.140 | none |
| `.pgs-chip` | 11 | 400 | 0.090 | none |
| `.aq-promise li` | 13 | 400 | 0.040 | none |

**Sizes:** 8.5, 9, 10, 10.5, 11, 11.5, 12, 12.5, 13 — **nine**.
**Tracking:** 0.030, 0.040, 0.050, 0.060, 0.070, 0.080, 0.090, 0.100, 0.110, 0.120,
0.130, 0.140, 0.160 — **thirteen** distinct values.
**Weights:** 400, 500, 600.

## A5 · The body-copy system

| Class | px | lh | ls | Colour | max-width | Used in |
|---|---|---|---|---|---|---|
| `.body` | 16 | 1.58 | 0 | ink α.82 | 440px (hero) / 420px (b3) | 0, 3 |
| `.body` (panel) | 16 | 1.58 | 0 | ink α.82 | — | 2, 8 |
| Alexa story `<p>` | 16 | **1.62** | 0 | #fff α.80 | — | 11 |
| `.cap-body` | 15 | 1.55 | 0 | ink α.70 | 660px | 1, 4, 6, 7, 9, 10, 13 |
| `.cap-body` (finish note) | **14** | 1.55 | 0 | #fff α.— | 660px | 9 |
| `.j-desc` | 15 | 1.50 | 0 | #fff α.82 | 340px | 6 |
| `.step-b` | 14.5 | 1.55 | 0 | ink α.70 | 30ch → 273px | 1 |
| `.faq-item p` | 14.5 | 1.55 | 0 | ink α.72 | — | 12 |
| `.wkp-hint` | 14 | 1.50 | 0 | #fff α.50 | — | 7 |
| `.pgs-syn` | 13 | 1.50 | 0 | #fff α.82 | 440px | 4 |
| `.fine` | 12 | **1.40** | 0 | ink α.60 | — | 13 |
| `.foot` | 13 | 1.50 | 0 | ink α.75 | — | 13 |

**Sizes:** 12, 13, 14, 14.5, 15, 16 — **six**. **Line-heights:** 1.40, 1.50, 1.55,
1.58, 1.62 — **five**.

## A6 · Text-colour inventory (resolved)

**On cream (`#f1f6f4`)** — base ink `#18201d`:
α = 1, 0.95, 0.90, 0.82, 0.78, 0.75, 0.72, 0.70, 0.66, 0.60 → **10 steps**
Plus non-ink: `#496c5e` (`.step-kicker`, `.save.cyan`), `#7a9b8d` (`.price-pick`,
footer links), `#5c6e66` (`.fbg-meta`, `.ch-count`), `#44544d` (`.wc-sub`,
`.chc-state`).

**On navy (`#18201d`) / sage** — base `#ffffff`:
α = 1, 0.96, 0.94, 0.82, 0.80, 0.78, 0.74, 0.72, 0.70, 0.68, 0.66, 0.62, 0.60, 0.50
→ **14 steps**
Plus `#7a9b8d` (`.alexa-pull-big`, `.pa-num > span`, `.pa-row b`).

## A7 · CTA pills — the one consistent system

| Variant | px | wt | ls | Height | Padding |
|---|---|---|---|---|---|
| `.pill-dark` | 13 | 600 | 0.10 | 52 | 15px 30px |
| `.pill-sage` | 13 | 600 | 0.10 | 52 | 15px 30px |
| `.pill-outline` | 13 | 600 | 0.10 | **50** | **14px 29px** |

Type is identical across all three. `.pill-outline` is 2px shorter because its 1px
border is inside a 1px-smaller padding box.

## A8 · Semantic heading outline (DOM order, 1440)

```
H1  A változás otthon kezdődik        ← hero
H2  Hét kérdés, és kész a heted       ← §1
H3  edzés, ahogy neked jó             ← §2
H3  vidd a nagy képernyőre            ← §3
H3  Nem egy program. Az összes.       ← §4
H2  TELJES EDZÉS PROGRAM              ┐
H2  Reggeli rutinok - napindító       │
H2  7 napos kezdő program             │ §4 program banners
H2  Has & Mély Törzs Challenge        │ (7 × H2, nested inside an H3 section)
H2  Láb & Fenék Challenge             │
H2  Esti rutinok                      │
H2  Tartásjavító program              ┘
H3  Így néznek ki az edzések          ← §4 row heading
H2  Innen indulsz.                    ← §6
H2  Te mondod meg, hány nap.          ← §7
H3  lásd, milyen messzire jutottál    ← §8
H3  Megcsináltad.                     ← §9
H3  Amit a csoportban kitalálunk.     ← §10
H3  Eddig ezeket találtuk ki          ← §10 row heading
H2  „Tíz évig azt tanultam…"          ← §11
H3  Gyakori kérdések                  ← §12
```

Recorded: section-level headings alternate H2/H3 with no consistent rule; the seven
program-banner titles are H2 — the same level as "Innen indulsz." — while sitting
inside a section whose own heading is an H3. §13 (Előfizetés) contributes no heading
at all. §5 (Ár-horgony) contributes none either.

## A9 · Heading → body gap (measured, first heading to the paragraph under it)

| Band | 1440 | 390 |
|---|---|---|
| 0 Hero | 24 | 18 |
| 1 Hogyan | **12** | **12** |
| 2 Alexával | 14 | 14 |
| 3 Nagy képernyő | **28** | 18 |
| 4 Programok | 14 | 14 |
| 6 Foundation | 16 | 16 |
| 7 A heted | 14 | 14 |
| 8 Haladás | 14 | 14 |
| 9 Finish | 14 | 14 |
| 10 Kihívások | 14 | 14 |
| 12 GYIK | 82 | 104 |

14px is the mode (6 of 11). Outliers: 12 (§1), 16 (§6), 24/18 (hero), 28/18 (§3).
§12's 82/104 is not comparable — the next `<p>` is inside the first `<details>`.

## A10 · Two type scales meet on this page

Bands 4, 6 and 10 render **app components** (`ProgramBanner`, `WorkoutCard`,
`ChallengeCard`) inside `.lx.lx-embed`. These carry the app's own scale:

| Component | Title | Sub | Meta |
|---|---|---|---|
| `WorkoutCard` | `.wc-name` 13/700/1.30 | `.wc-sub` 12.5/400/1.50 | `.ey` 8.5, `.wc-dur` 11 |
| `ChallengeCard` | `.chc-name` 14/700/1.22 | `.chc-state` 12/400/1.50 | `.chc-stack` 8.5, `.chc-days` 9 |
| `ProgramBanner` | `.pgs-title` 23/900/0.98 | `.pgs-syn` 13/400/1.50 | `.pgs-eyebrow` 11.5, `.pgs-chip` 11 |

Landing headings never use weight 700 or 900; these do. Landing body never goes below
12px; these reach 8.5px. Both scales are internally coherent and were designed
separately.

## A11 · Full type-size census (1440)

`8.5, 9, 10, 10.5, 11, 11.5, 12, 12.5, 13, 14, 14.5, 15, 15.5, 16, 17, 19, 20, 21,
22, 23, 24, 26, 34, 35, 38, 42, 46, 52, 54, 60, 78, 80.64, 132, 168`

**34 distinct font sizes.** Range 8.5px → 168px (19.8×).
`.wordmark` alone renders at **three** sizes: 19 (sticky nav), 24 (hero), 26 (§13).

---

# PART B — Section by section

Desktop (1440) unless noted. Rows are deduped; `n` = instances.

## B0 · Hero — `.hero`, pad 34/96, h 846

| Element | Tag | px/wt/lh/ls | Font | Colour | m-t/b | n |
|---|---|---|---|---|---|---|
| `.wordmark` | SPAN | 24/800/1.50/0.020 | P | #18201d | 0/0 | 1 |
| nav links | A | 11/400/1.50/0.130 | M upp | #181f1c α.70 | 0/0 | 5 |
| `.hero-eyebrow` | DIV | 11.5/400/1.50/0.160 | M upp | #18201d | 0/16 | 1 |
| h1 | H1 | 80.64/300/1.00/−0.020 | P upp | #18201d | 0/0 | 1 |
| h1 `<b>` | B | 80.64/**700**/1.00/−0.020 | P upp | #18201d | 0/0 | 1 |
| `.body` | P | 16/400/1.58/0 | P | ink α.82 | 24/0 | 1 |
| `.pill-dark` | A | 13/600/1.50/0.100 | P upp | #fff | 0/0 | 1 |
| `.hero-cta2` | A | 12/400/1.50/0.100 | M upp | ink α.78 | 0/0 | 1 |
| `.hero-price` | DIV | 12.5/400/1.50/0.030 | M | ink α.90 | 22/0 | 1 |
| `.hero-price b` | B | 12.5/**700**/1.50/0.030 | M | ink α.90 | 0/0 | 1 |
| `.hero-trust` | DIV | 12.5/400/1.50/0.080 | M upp | ink α.95 | 38/0 | 1 |

Notes: `.body` max-width 440px. Three mono sizes (11, 12, 12.5) and four tracking
values (0.030/0.080/0.100/0.130/0.160) inside one band.

## B1 · Hogyan működik — `.band-cream.sec-first`, pad 116/28, h 1035

| Element | Tag | px/wt/lh/ls | Font | Colour | m-t/b | n |
|---|---|---|---|---|---|---|
| `.eyebrow` | DIV | 11/400/1.50/0.140 | M upp | #18201d | 0/0 | 1 |
| `.h-bold` | H2 | 34/600/1.08/−0.028 | P | #18201d | 10/0 | 1 |
| `.cap-body` | P | 15/400/1.55/0 | P | ink α.70 | 12/0 | 1 |
| `.step-h` | B | 17/600/**1.50**/−0.015 | P | #18201d | 20/0 | 3 |
| `.step-b` | P | 14.5/400/1.55/0 | P | ink α.70 | 8/0 | 3 |
| `.step-kicker` | P | 12/400/1.50/0.060 | M | #496c5e | 0/0 | 1 |
| `.pill-outline` | A | 13/600/1.50/0.100 | P upp | #18201d | 16/0 | 1 |

Mobile: `.h-bold` 26, `.step-h` 15/**1.25**, `.step-b` 13/**1.45**.
Note `.step-h` at 17px inherits `line-height: 1.5` on desktop but declares 1.25 on mobile.

## B2 · Edzés Alexával — `.band-cream.sec`, pad 96/96, h 929

| Element | Tag | px/wt/lh/ls | Font | Colour | n |
|---|---|---|---|---|---|
| `.h-thin` | H3 | 46/300/1.04/−0.022 | P **lowercase** | #18201d | 1 |
| body `<p>` | P | 16/400/1.58/0 | P | ink α.82 | 2 |
| type chips | SPAN | 11/400/1.50/0.050 | M upp | ink α.66 | 5 |
| `.pill-outline` | A | 13/600/1.50/0.100 | P upp | #18201d | 1 |

## B3 · Nagy képernyő — `.band-navy.sec`, pad 96/96, h 1056

| Element | Tag | px/wt/lh/ls | Font | Colour | m-t/b | n |
|---|---|---|---|---|---|---|
| `.h-thin` | H3 | 46/300/1.04/−0.022 | P lowercase | #ffffff | 0/0 | 1 |
| `.body` | P | 16/400/1.58/0 | P | #fff α.80 | 28/0 | 1 |
| `.body` (2nd) | P | 16/400/1.58/0 | P | #fff **α.62** | 10/0 | 1 |
| `.lab` | SPAN | 10/400/1.50/0.120 | M | #fff α.80 | 0/0 | 4 |

Note: two consecutive paragraphs of the same class at two different alphas (.80/.62),
and a 28px heading→body gap where the page mode is 14px.

## B4 · Programok — `.band-cream.sec-sm`, pad 64/64, h 1549

| Element | Tag | px/wt/lh/ls | Font | Colour | m-t/b | n |
|---|---|---|---|---|---|---|
| `.cap-title` | H3 | 23/500/**1.50**/−0.020 | P | #18201d | 0/0 | 1 |
| `.cap-body` | P | 15/400/1.55/0 | P | ink α.70 | 14/0 | 2 |
| `.pgs-word` | SPAN | 42/900/0.80/−0.040 | P | #f5ffff α.10 | 0/0 | 7 |
| `.nm` (lockup) | SPAN | 10.5/500/1.50/0.140 | M | #fff | 0/0 | 7 |
| `.pgs-eyebrow` | DIV | 11.5/400/1.50/0.110 | M | 7 hues | 0/0 | 7 |
| `.pgs-title` | H2 | 23/900/0.98/−0.025 | P upp | #fff | 6/0 | 7 |
| `.pgs-syn` | P | 13/400/1.50/0 | P | #fff α.82 | 8/0 | 7 |
| `.pgs-chip` | SPAN | 11/400/1.50/0.090 | M | #fff | 0/0 | 14 |
| row heading | H3 | 16/800/**1.50**/−0.015 | P | #18201d | 0/0 | 1 |
| `.ey` | DIV | 8.5/400/1.50/0.070 | M | #fff α.80 | 0/0 | 20 |
| `.wd` | DIV | 20/900/1.05/−0.030 | P | #fff α.96 | 0/0 | 20 |
| `.wc-dur` | SPAN | 11/400/1.50/0.030 | M | #fff | 0/0 | 20 |
| `.wc-name` | DIV | 13/700/1.30/−0.010 | P | #18201d | 0/0 | 20 |
| `.wc-sub` | DIV | 12.5/400/1.50/0 | P | **#44544d** (solid) | 3/0 | 20 |

Two headings in this band — `.cap-title` 23/500 and the row `h3` 16/800 — differ by
400 weight units and 7px while sitting 500px apart in the same section.

## B5 · Ár-horgony — `.band-navy.sec.price-anchor`, pad 96/96, h 536

| Element | Tag | px/wt/lh/ls | Font | Colour | m-t/b | n |
|---|---|---|---|---|---|---|
| `.eyebrow` | DIV | 11/400/1.50/0.140 | M upp | #fff α.68 | 0/0 | 1 |
| `.pa-num b` | SPAN | **132**/800/0.92/−0.040 | P | #ffffff | 0/0 | 1 |
| `.pa-num > span` | SPAN | 20/400/1.50/0.100 | M | #7a9b8d | 0/0 | 1 |
| `.cap-body.pa-lead` | P | 15/400/1.55/0 | P | #fff α.74 | 18/0 | 1 |
| `.pa-row span` | SPAN | 12/400/1.50/0.100 | M upp | #fff α.58 | 0/0 | 4 |
| `.pa-row b` | B | 12/600/1.50/0.100 | M upp | #7a9b8d | 0/0 | 2 |
| `.pill-sage` | A | 13/600/1.50/0.100 | P upp | #18201d | 0/0 | 1 |

No heading element in this band (see §A8).

## B6 · Foundation — `.band-cream.sec-sm`, pad 64/64, h 1162

| Element | Tag | px/wt/lh/ls | Font | Colour | m-t/b | n |
|---|---|---|---|---|---|---|
| `.starter-badge` | SPAN | 11/400/1.50/0.160 | M upp | #fff | 0/0 | 1 |
| `.starter-title` | H2 | 54/600/1.02/−0.030 | P | #18201d | 18/0 | 1 |
| `.cap-body` | P | 15/400/1.55/0 | P | ink α.70 | 16/0 | 1 |
| `.starter-facts span` | SPAN | 11/400/1.50/0.050 | M upp | ink α.66 | 0/0 | 4 |
| `.j-eyebrow` | DIV | 12/400/1.50/0.160 | M upp | #fff α.82 | 0/0 | 1 |
| `.j-weeknum` | DIV | **168**/800/0.82/−0.050 | P | #fff | 10/2 | 1 |
| `.j-week` | DIV | 34/300/**1.50**/−0.020 | P | #fff | 0/0 | 1 |
| `.j-desc` | P | 15/400/1.50/0 | P | #fff α.82 | 16/0 | 1 |
| `.j-meta` | DIV | 11.5/400/1.50/0.060 | M upp | #fff α.70 | 16/0 | 1 |
| `.j-t` (active) | SPAN | 15/**700**/1.50/−0.010 | P | #fff | 0/0 | 1 |
| `.j-t` (rest) | SPAN | 15/**500**/1.50/−0.010 | P | #fff | 0/0 | 4 |
| WorkoutCard set | — | as B4 | — | — | — | 5 |

`.j-week` at 34px renders `line-height: 1.50` (undeclared). `.j-weeknum` at 168px is
the largest type on the page. `.wc-name` here is `#ffffff`; in B4 the same class is
`#18201d` — the card sits on a different ground in each band.

## B7 · A heted — `.band-navy.sec.heted-band`, pad 96/96, h 645

| Element | Tag | px/wt/lh/ls | Font | Colour | m-t/b | n |
|---|---|---|---|---|---|---|
| `.eyebrow` | DIV | 11/400/1.50/0.140 | M upp | #fff | 0/0 | 1 |
| `.starter-title` | H2 | 54/600/1.02/−0.030 | P | #ffffff | 18/0 | 1 |
| `.cap-body` | P | 15/400/1.55/0 | P | #fff α.74 | 14/0 | 2 |
| `.wkp-d` | SPAN | 12/600/**normal**/0.080 | M | #fff α.60 | 0/0 | 3 |
| `.wkp-count` | SPAN | 12/400/1.50/0.100 | M upp | #fff α.60 | 0/0 | 1 |
| `.wkp-rest` | SPAN | 12/400/1.50/0.100 | M upp | #fff α.60 | 0/0 | 1 |
| `.wkp-hint` | P | 14/400/1.50/0 | P | #fdffff α.50 | 12/0 | 1 |
| `.pill-sage` | A | 13/600/1.50/0.100 | P upp | #18201d | 0/0 | 1 |

`.wkp-d` is the only text on the page rendering `line-height: normal`.

## B8 · Haladás — `.band-cream.sec`, pad 96/96, h 783

| Element | Tag | px/wt/lh/ls | Font | Colour | n |
|---|---|---|---|---|---|
| `.h-thin` | H3 | 46/300/1.04/−0.022 | P lowercase | #18201d | 1 |
| body `<p>` | P | 16/400/1.58/0 | P | ink α.82 | 2 |
| `.pill-outline` | A | 13/600/1.50/0.100 | P upp | #18201d | 1 |
| `.ph` label | SPAN | 11/400/1.50/0.020 | M | ink α.70 | 2 |

## B9 · Amikor kész vagy — `.band-navy.sec.finish-band`, pad 96/96, h 791

| Element | Tag | px/wt/lh/ls | Font | Colour | m-t/b | n |
|---|---|---|---|---|---|---|
| `.eyebrow` | DIV | 11/400/1.50/0.140 | M upp | #fff | 0/0 | 1 |
| `.cap-title` | H3 | 23/500/**1.50**/−0.020 | P | #ffffff | 10/0 | 1 |
| `.cap-body` | P | 15/400/1.55/0 | P | #fff α.74 | 14/0 | 1 |
| `.fs-k` | DIV | 13/600/1.10/−0.004 | P | #fff | 0/0 | 38 |
| `.fs-v` | DIV | 35/700/1.04/−0.028 | P | #fff | 2/0 | 12 |
| `.fs-v` | DIV | 26/700/1.04/−0.028 | P | #fff | 2/0 | 18 |
| `.fs-v` | DIV | **78**/700/0.84/−0.055 | P | #fff | 0/0 | 2 |
| `.fs-v` | DIV | 21/700/1.04/−0.028 | P | #fff | 3/0 | 2 |
| `.fs-v` | DIV | 22/700/1.04/−0.028 | P | #fff | 2/0 | 4 |
| `.fs-wd` | SPAN | 17/800/1.00/0.055 | P | #fff | 0/0 | 4 |
| `.fs-wd` | SPAN | 14/800/1.00/0.055 | P | #fff | 0/0 | 10 |
| `.fex-name` | SPAN | 11/400/**normal**/0.050 | M | #fff α.66 | 0/0 | 14 |
| stat line | SPAN | 13/600/1.35/−0.004 | P | #fff | 0/0 | 4 |
| `.cap-body` (note) | P | **14**/400/1.55/0 | P | #fff | 14/0 | 1 |

The finish-card overlay contributes **five** `.fs-v` sizes and **two** `.fs-wd` sizes;
these are scaled per card size and are internal to that component. The closing
`.cap-body` is 14px where every other `.cap-body` on the page is 15px.

## B10 · Kihívások — `.band-cream.sec-sm`, pad 64/64, h 868

| Element | Tag | px/wt/lh/ls | Font | Colour | m-t/b | n |
|---|---|---|---|---|---|---|
| `.cap-title` | H3 | 23/500/**1.50**/−0.020 | P | #18201d | 0/0 | 1 |
| `.cap-body` | P | 15/400/1.55/0 | P | ink α.70 | 14/0 | 1 |
| `.fbg-name` | DIV | 16/600/**1.50**/−0.010 | P | #18201d | 0/0 | 1 |
| `.fbg-meta` | SPAN | 11.5/400/1.50/0.030 | M | #5c6e66 | 0/0 | 1 |
| `.fbg-join` | A | 14/600/1.50/0 | P | #ffffff | 0/0 | 1 |
| row heading | H3 | 16/800/**1.50**/−0.015 | P | #18201d | 0/0 | 1 |
| `.ch-count` | SPAN | 11.5/400/1.50/0.050 | M upp | #5c6e66 | 0/0 | 1 |
| `.chc-word` | SPAN | 15/800/1.50/0.020 | P | #fff α.94 | 0/0 | 15 |
| `.chc-stack` | SPAN | 8.5/400/1.50/0.040 | M | #18201d | 0/0 | 15 |
| `.chc-days` | SPAN | 9/400/1.50/0.030 | M | #fff | 0/0 | 15 |
| `.chc-name` | DIV | 14/700/1.22/−0.010 | P | #18201d | 0/0 | 15 |
| `.chc-state` | DIV | 12/400/1.50/0 | P | #44544d | 3/0 | 15 |

Three different 16px-class headings/labels here: `.fbg-name` 16/600, row `h3` 16/800,
`.cap-title` 23/500.

## B11 · Alexa — `.alexa-hero`, pad 120/90 (86/70 mobile), h 1346

| Element | Tag | px/wt/lh/ls | Font | Colour | m-t/b | n |
|---|---|---|---|---|---|---|
| `.eyebrow` | DIV | 11/400/1.50/0.140 | M upp | #ffffff | 0/0 | 1 |
| `.alexa-pull-big` | H2 | 52/300/1.05/−0.030 | P | **#7a9b8d** | 14/26 | 1 |
| story `<p>` | P | 16/400/**1.62**/0 | P | #fff α.80 | 0/0 | 6 |
| `.founder-facts span` | SPAN | 11/400/1.50/0.050 | M upp | #fff α.78 | 0/0 | 3 |
| `.aq-promise li` | LI | 13/400/1.50/0.040 | M | #fff α.68 | 0/0 | 3 |
| `.aq-close` | **P** | 60/300/1.02/−0.030 | P | #ffffff | 30/0 | 1 |
| `.aq-sign` | P | 12/400/1.50/0.140 | M upp | #fff α.60 | 20/0 | 1 |
| `.pill-sage.aq-cta` | A | 13/600/1.50/0.100 | P upp | #18201d | 30/0 | 1 |

The only band whose body copy is 1.62 (rest of page: 1.58). The only band with
left-aligned headings on desktop. The only heading rendered in the accent colour.

## B12 · GYIK — `.band-cream.sec-sm`, pad 64/64, h 844

| Element | Tag | px/wt/lh/ls | Font | Colour | n |
|---|---|---|---|---|---|
| `.cap-title` | H3 | 23/500/**1.50**/−0.020 | P | #18201d | 1 |
| `summary` | SUMMARY | 15/600/1.50/−0.010 | P | #18201d | 10 |
| `p` | P | 14.5/400/1.55/0 | P | ink α.72 | 10 |

## B13 · Előfizetés + footer — `.band-sage.pricing-band`, pad 120/90, h 973

| Element | Tag | px/wt/lh/ls | Font | Colour | m-t/b | n |
|---|---|---|---|---|---|---|
| `.wordmark` | SPAN | **26**/800/1.50/0.020 | P | #18201d | 0/0 | 1 |
| `.eyebrow` | DIV | 11/400/1.50/0.140 | M upp | #18201d | 14/0 | 1 |
| `.cap-body` | P | 15/400/1.55/0 | P | ink α.70 | 10/0 | 1 |
| `.plan` | DIV | 13/500/1.50/0.140 | M upp | #18201d | 0/0 | 3 |
| `.amt` | DIV | 38/700/**1.50**/−0.010 | P | #18201d | 0/0 | 3 |
| `.cur` | DIV | 11/400/1.50/0.140 | M | #18201d | 0/0 | 3 |
| `.fine` | DIV | 12/400/**1.40**/0 | P | ink α.60 | 6/0 | 3 |
| `.price-pick` | DIV | 11/600/1.50/0.100 | M upp | #7a9b8d | 16/0 | 3 |
| `.price-badge` | DIV | 10.5/600/1.50/0.120 | M upp | #ffffff | 0/0 | 1 |
| `.save.cyan` | DIV | 12/500/1.50/0.100 | M upp | #496c5e | 0/0 | 1 |
| `.price-trust span` | SPAN | 11.5/400/1.50/0.100 | M upp | #18201d | 0/0 | — |
| `.pill-dark` | A | 13/600/1.50/0.100 | P upp | #ffffff | 0/0 | 1 |
| footer text | SPAN | 13/400/1.50/0 | P | #18201d | 0/0 | 1 |
| footer links | A | 13/400/1.50/0 | P | #7a9b8d | 0/0 | 4 |

`.amt` at 38px renders `line-height: 1.50` (undeclared). The band has no heading
element; `.wordmark` (a SPAN) is its largest type.

---

# PART C — Observations, strictly from the data

No fixes, no priorities — these are the facts a design decision would have to answer to.

1. **Nine section-heading treatments** across 14 bands (§A3), spanning 16→80.64px and
   weights 300/500/600/800/900. Five separate classes (`.h-bold`, `.h-thin`,
   `.cap-title`, `.starter-title`, `.alexa-pull-big`) each serve 1–4 bands.
2. **Eight elements render an undeclared `line-height: 1.5`** at display sizes:
   `.cap-title` (23), `.step-h` (17, desktop only), `.hrow-head h3` (16), `.j-week`
   (34), `.amt` (38), `.fbg-name` (16), `.chc-word` (15), `.wordmark` (24/26). Every
   heading that *declares* a line-height is between 0.98 and 1.08.
3. **Thirteen letter-spacing values** across 31 mono micro-labels (§A4), and **six**
   across nine display headings (§A3).
4. **Thirty-four distinct font sizes** (§A11), including nine below 12px.
5. **Twenty-four text alpha steps** (10 on cream, 14 on dark) over two base colours,
   plus four solid non-ink colours.
6. **Six body sizes / five body line-heights** (§A5). `.cap-body` is 15px in six bands
   and 14px in one.
7. **Heading levels do not track visual hierarchy** (§A8): H3 is used for four
   top-level section headings while H2 is used for seven program-banner titles nested
   under one of them; two bands have no heading element at all; the 60px `.aq-close`
   is a `<p>`.
8. **Two type scales coexist** (§A10) — the landing's and the app's, meeting inside
   bands 4, 6 and 10. Neither is internally inconsistent; they were designed apart.
9. **Five band-padding rhythms** (§A2); one band changes padding across viewports.
10. **Heading→body gap is 14px in 6 of 11 measurable bands**, with 12/16/24/28 elsewhere
    (§A9).
11. `.wordmark` renders at three sizes; `.wc-name` renders in two colours; two adjacent
    `.body` paragraphs in §3 use different alphas.
12. `.wkp-d` and `.fex-name` are the only text on the page at `line-height: normal`.

---

# PART D — What this pass did *not* measure

Stated so the gaps aren't mistaken for clean results:

- **Optical alignment and rendered width** (measured text block widths, line counts,
  characters-per-line) — only `max-width` declarations were captured.
- **Horizontal spacing** — gaps, gutters and inline padding of chips/pills beyond the
  three pill variants.
- **Hover / focus / active type states.**
- **Tablet range (600–1024px)** — only 1440 and 390 were measured; `clamp()` behaviour
  between those points is interpolated, not observed.
- **The `@media (max-height: 560px)` branch** and landscape phone.
- **Contrast ratios** for the 24 alpha steps against their actual grounds.
- `.sc-eyebrow` is declared in CSS but renders nowhere on the current page (dead rule).
