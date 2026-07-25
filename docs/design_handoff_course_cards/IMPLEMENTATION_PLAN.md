# Implementation Plan — LEXFIT Course Cards + Program Thumbnails

A phase-by-phase build guide for Claude Code. Read `README.md` first for the full spec and tokens. Each phase has a **goal**, **steps**, and a **done-when** check. Build in order — later phases depend on earlier foundations.

---

## Guiding principle (never violate)
**Category → color + centered word. Program → icon + name (never color).**
A cover is *generated from data*; there is no per-video artwork. Program look is chosen once per program and auto-inherited by every video in it.

---

## Phase 0 — Foundations: tokens, fonts, primitives
**Goal:** the design system exists in the codebase before any card is built.

**Steps**
1. Port the design tokens from `lexfit-tokens.css` into the app's styling layer (CSS variables, Tailwind theme, or your token file). Include: neutrals/surfaces, ink scale, accent, the **6 `--cat-*` category hues**, radii, and `--shadow-card`.
2. Load fonts: **Poppins** (400–900) and **IBM Plex Mono** (400/500).
3. Create a tiny **`<Icon>`** primitive (24×24 viewBox, `stroke`/`fill` via `currentColor`) and port the needed glyphs from `lxPaths` (play, clock, flame). Keep them as data, not an icon font.
4. Add a **gradient helper** used everywhere:
   ```
   categoryGradient(token) =>
     `linear-gradient(135deg, oklch(from ${token} calc(l + 0.07) c h) 0%, ${token} 100%)`
   ```
   (If the target CSS engine lacks `oklch(from …)` relative-color support, precompute the lighter stop per category and store both stops as tokens.)

**Done when:** you can render a `div` with a category gradient background and both fonts apply.

---

## Phase 1 — The category model (the color axis)
**Goal:** a single source of truth mapping category → color + display word.

**Steps**
1. Define the `Category` union and a `CATEGORY` map:
   ```ts
   const CATEGORY = {
     "Alsótest":           { token: "--cat-also",     word: "ALSÓTEST" },
     "Felsőtest":          { token: "--cat-felso",    word: "FELSŐTEST" },
     "Cardio + has":       { token: "--cat-cardio",   word: "CARDIO + HAS" },
     "Teljes test":        { token: "--cat-teljes",   word: "TELJES TEST" },
     "Mobility / nyújtás": { token: "--cat-mobility", word: "MOBILITY / NYÚJTÁS" },
     "Tartás-fókusz":      { token: "--cat-tartas",   word: "TARTÁS-FÓKUSZ" },
   };
   ```
   The display word is the **full** category name, UPPERCASED and centered (not the old abbreviations).
2. Helper `categoryOf(theme)` with a safe fallback to `Teljes test`.

**Done when:** given any `theme`, you can get its gradient and centered word.

---

## Phase 2 — The program model (the icon + name axis)
**Goal:** program identity as data, colorless, admin-configurable.

**Steps**
1. Define the `PROGRAMS` registry — **the only per-program values are `name` + `icon`** (see README table). Ship the 5 known programs; confirm real names/localization with the product owner.
2. Build a **`<ProgramMark shape size>`** component rendering the 5 geometric SVGs (`dot/square/bar/triangle/diamond`) from README, `fill: currentColor`.
3. Model programs so admin sets a program's `name` + `icon` **once**; every workout stores a `program` key and inherits the look. No per-video thumbnail fields.
4. Adding a program later = one registry row + one new simple geometric icon. Enforce "geometric primitive, colorless" in review.

**Done when:** `<ProgramMark shape="triangle"/>` renders and you can list all programs with distinct shapes.

---

## Phase 3 — The base Cover (shared visual language)
**Goal:** one reusable `<Cover>` that all card variants sit on. This is the heart of the system.

**Steps** — compose these layers, bottom → top (see README "TV key art" layer list for exact values):
1. **Gradient** background from `categoryGradient(token)`.
2. **Trainer underlayer** (`.pt-tv-photo` equivalent): image, `cover`, focal `background-position`, `mix-blend-mode: luminosity`, `opacity: 0.42`, radial edge mask so the room dissolves. Make the image source + focal point props (fall back to no underlayer if absent).
3. **Decorative ring** — large faint white circle, off the top-left.
4. **Centered category lockup** — eyebrow `LEXFIT · <code>` → big `word` (weight 900, wraps/balances, centered, `max-width ~230px`) → underline rule.
5. Slots/props for overlays the variants add (program lockup, duration chip, title band, tags).

**Done when:** `<Cover theme="Cardio + has" code="F018" trainer=…/>` renders a coral cover with the trainer subtly blended and `CARDIO + HAS` centered.

---

## Phase 4 — The Program lockup (applied on the Cover)
**Goal:** the consistent, colorless program badge, placed per-surface.

**Steps**
1. Build **`<ProgramLockup variant program>`** = glass pill with `<ProgramMark>` (white in a round chip) + program `name` (mono, white, letterspaced). Styling identical for every program.
2. Placement variants:
   - **`top-left`** (TV key art, grid): glass pill, top-left corner.
   - **`eyebrow`** (list row): inline `icon + NAME · code`, paired with a thin colorless left keyline.
   - **`corner-tab`** (dense shelf): smaller pill, top-left.
3. Verify it reads on light (coral/sage) and dark (plum) covers — the glass backdrop + white content must hold contrast on all 6 categories.

**Done when:** the same program shows an identical-looking lockup across every category color, and 5 programs are told apart by shape + name with **no color difference**.

---

## Phase 5 — Card variant: TV key art (primary thumbnail)
**Goal:** ship the chosen hero thumbnail (`PtTV`).

**Steps**
1. Compose `Cover` + `ProgramLockup variant="top-left"` + duration chip (top-right, mono `"<mins> PERC"`) + bottom gradient **foot band** carrying the **workout title**.
2. Nudge the centered category lockup up `translateY(-6px)` so it clears the title band.
3. **No meta line under the card** (removed per final spec — title is the last element).
4. Hover: art `scale(1.025)`, deepen shadow, fade in play veil.

**Done when:** it matches `LEXFIT Program-borítók.html` — program top-left, duration top-right, category word center, title in the bottom band, trainer blended behind.

---

## Phase 6 — Remaining card variants (reuse the Cover + lockup)
**Goal:** grid, list, and shelf variants sharing the exact same language.

**Steps**
1. **Grid card** (`CardV2`): 250px, radius 20; top row code + duration; bottom scrim with tag pills (flames+level, type), title, `theme · format` sub; program via `top-left` lockup or footer band.
2. **List row** (`CardV3`): ~112px, radius 18; left→right scrim; `eyebrow` program lockup + left keyline; title; tag row; big duration on the right.
3. **Dense shelf** (`CardN`/`CardA`): 16/9 small art; title in-art; `corner-tab` lockup. Expand-on-focus panel is optional (v2).
4. Add a **view toggle** (grid ↔ list) where libraries are browsed.

**Done when:** all variants render from the same `Workout` object and program lockups are visually consistent across them (matches `LEXFIT Course Cards.html`).

---

## Phase 7 — Shared behaviors & states
**Goal:** interaction parity with the prototype.

**Steps**
1. Hover: card lift/scale + play veil (0.16–0.18s ease).
2. `<Flames level>` (1–3, dim the rest at `opacity 0.3`).
3. Type tags from `types[]` (emoji included).
4. Day/phase states: `preview`/`done`/`today`/`todo`, plus `new`/`resume` (progress bar on art). Wire to the project's `prog-data.jsx` state model.
5. Accessibility: cards are buttons/links with an accessible name (`"<title> — <category>, <program>"`); program is conveyed by **shape + text**, not color alone (already satisfied by design).

**Done when:** keyboard-focusable, screen-reader-labeled, states render correctly, colorblind users can still tell programs apart.

---

## Phase 8 — Admin & data wiring
**Goal:** the "pick once → inherit" model works end to end.

**Steps**
1. Program record (Firestore): `{ key, name, icon }` — admin sets name + picks an icon from the 5 (extensible).
2. Workout record stores `program` + `theme` (+ code/title/mins/level/format/types). Cover is derived — **no thumbnail upload**.
3. Optional per-program/per-trainer hero image + focal point for the underlayer.
4. Backfill Foundation's 40 workouts (`F001–F040`) from the existing `prog-data.jsx` dataset.

**Done when:** creating a program and adding videos to it produces correctly-branded covers automatically, with zero per-video art work.

---

## Phase 9 — QA & polish
**Steps**
1. Render every category × a few programs; confirm color=category, icon+name=program, always.
2. Long category words (`MOBILITY / NYÚJTÁS`) and long titles wrap/balance without overflow at all card sizes.
3. Contrast check the glass lockup + text on all 6 gradients.
4. Verify the trainer underlayer stays subtle (never competes with text) across images; expose opacity/position as tunables.
5. Compare side-by-side against the two prototype HTML files.

**Done when:** output is visually indistinguishable from the prototypes and the category/program rule holds in every combination.

---

## Quick reference — build order
`Phase 0 tokens/fonts` → `1 category model` → `2 program model` → `3 base Cover` → `4 program lockup` → `5 TV key art` → `6 other variants` → `7 behaviors/states` → `8 admin/data` → `9 QA`.
