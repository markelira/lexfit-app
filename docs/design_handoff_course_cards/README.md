# Handoff: LEXFIT Course Cards + Program-Level Thumbnail System

## Overview
This package specifies LEXFIT's **course-card / workout-thumbnail system** and the new **program-level differentiation** layer built on top of it.

Two things are covered:
1. **The course card system** — the generated, typographic "cover" used to represent every workout video across the app (grid cards, list rows, TV-style key art, dense shelves).
2. **Program differentiation** — how a video visually signals which *program* it belongs to (Foundation, Kickstart, Stretch, Gymnastics, Competition…), layered on top of the existing category color-coding.

The central design rule that ties it together:

> **Color + big centered word = workout CATEGORY (body part). Icon + name = PROGRAM.**
> Category owns color; program owns a consistent, colorless lockup (geometric icon + wordmark). Programs differ **only by name + icon** — never by color.

---

## About the Design Files
The files in this bundle are **design references authored in HTML/CSS + React (Babel-in-browser)**. They are prototypes that show the intended look and behavior — **not** production code to ship as-is.

The task is to **recreate these designs in the target codebase** (per the LEXFIT build plan the stack is a React/Next.js web app + Firebase + Mux) using its established component patterns, styling approach, and data models. If a styling system already exists, map the tokens below onto it rather than copy-pasting CSS. The React shown here uses plain className + a global CSS file; adapt to whatever the app uses (CSS Modules, Tailwind, styled-components, etc.).

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and layout are final and intended to be matched closely. Exact values are in **Design Tokens** below. The trainer underlayer, gradients, and blend modes are deliberate — reproduce them faithfully.

---

## Core Concept (read this first)

Every workout cover is **generated from data** — there is no per-video artwork to design or upload. A cover is fully determined by:

| Input | Drives | Example |
|---|---|---|
| `theme` (category) | Background **gradient color** + the **big centered word** | `"Cardio + has"` → coral gradient, word `CARDIO + HAS` |
| `program` | The **icon shape** + **program name** in the lockup | `foundation` → ● + `FOUNDATION` |
| `code`, `title`, `mins`, `level`, `format`, `types` | Overlay text (eyebrow, title, duration chip, tag pills) | `F018`, `"Cardio combo + ferde has"`, `30`, `2`, `EMOM` |

This means: **admin picks a program's look once (its icon + name); every video added to that program inherits it automatically.** No per-video thumbnail work.

### The two axes, kept separate
- **Category → color.** There are 6 categories, each with a fixed hue token (`--cat-*`). This coding is *pre-existing and must be preserved* — users already read color as "which body part."
- **Program → icon + name only.** Because color is already "spoken for" by category, program identity must NOT use color. It rides a consistent dark/glass lockup: a simple geometric **icon** (the non-color, accessible cue) plus the **program wordmark**. The lockup looks identical on every program; only the icon shape and the text change.

---

## Categories (6) — the color axis

Full display names (shown centered, UPPERCASED, on the cover) and their color tokens:

| `theme` value (data) | Centered word (display) | Color token | oklch |
|---|---|---|---|
| `Alsótest` | ALSÓTEST | `--cat-also` | `oklch(0.66 0.155 0)` (rose) |
| `Felsőtest` | FELSŐTEST | `--cat-felso` | `oklch(0.45 0.085 320)` (plum) |
| `Cardio + has` | CARDIO + HAS | `--cat-cardio` | `oklch(0.68 0.140 45)` (coral) |
| `Teljes test` | TELJES TEST | `--cat-teljes` | `oklch(0.52 0.150 355)` (deep rose) |
| `Mobility / nyújtás` | MOBILITY / NYÚJTÁS | `--cat-mobility` | `oklch(0.66 0.090 155)` (sage) |
| `Tartás-fókusz` | TARTÁS-FÓKUSZ | `--cat-tartas` | `oklch(0.62 0.105 295)` (lavender) |

> Display word = `theme.toUpperCase()` (full name). Earlier drafts used abbreviations (`ALSÓ`, `CARDIO`); the final spec is the **full category name**, centered.

The cover background is a 135° gradient from a lightened tint of the token to the token itself:
```
linear-gradient(135deg, oklch(from <token> calc(l + 0.07) c h) 0%, <token> 100%)
```

---

## Programs — the icon + name axis

Registry (the ONLY per-program values):

| key | name (wordmark) | icon shape | notes |
|---|---|---|---|
| `foundation` | FOUNDATION | `dot` (●) | 8-week beginner — the only program with real data today |
| `kickstart` | KICKSTART | `square` (■) | 4-week |
| `stretch` | STRETCH | `bar` (▬) | stretching / mobility |
| `gym` | GYMNASTICS | `triangle` (▲) | gymnastics |
| `comp` | COMPETITION | `diamond` (◆) | competition prep |

Icon geometry (24×24 viewBox, `fill=currentColor`):
- `dot`: `<circle cx=12 cy=12 r=6/>`
- `square`: `<rect x=6 y=6 width=12 height=12 rx=2.5/>`
- `bar`: `<rect x=3 y=10 width=18 height=4 rx=2/>`
- `triangle`: `<path d="M12 4.5 L19.8 18 L4.2 18 Z"/>`
- `diamond`: `<path d="M12 3.5 L20.5 12 L12 20.5 L3.5 12 Z"/>`

The icon shape is the **accessible, colorblind-safe** program cue — programs remain distinguishable with color removed. Program names shown in mono, uppercased, `letter-spacing` ~0.12–0.14em.

> **Names above are placeholders/working English labels.** Confirm the real program list and localized names before finalizing. Adding a program = one registry entry (name + a new simple geometric icon). Keep icons to basic geometric primitives so they read at small sizes and stay colorless.

---

## Screens / Views (the card variants)

All variants share the same "cover" language. The prototype `LEXFIT Course Cards.html` shows four; `LEXFIT Program-borítók.html` shows the finalized **TV key art** carrying the program lockup.

### 1. TV key art (`PtTV` — the chosen program-thumbnail execution)
- **Purpose:** the primary workout thumbnail; cinematic, browsable.
- **Layout:** a `16/9` art block, `border-radius: 14px`, `overflow: hidden`, plus (no meta line below — removed per final spec).
- **Layers, bottom → top:**
  1. **Category gradient** background (see formula).
  2. **Trainer underlayer** (`.pt-tv-photo`): the trainer photo, `background-size: cover`, `background-position: 64% 18%`, `mix-blend-mode: luminosity`, `opacity: 0.42`, faded at the edges with a radial mask `radial-gradient(125% 105% at 66% 34%, #000 40%, transparent 82%)`. Effect: her *form* tints into the category color; the room dissolves — she is present with **no background**.
  3. **Decorative ring** (`.cc-ring`): a large faint white circle, `border: 22px solid oklch(1 0 0 / 0.13)`, positioned off the top-left.
  4. **Program lockup — TOP LEFT** (`.pt-tv-tl`): glass pill (`background: oklch(0.18 0.03 350/0.5)`, `backdrop-filter: blur(9px)`, `border: 1px solid oklch(1 0 0/0.16)`, `border-radius: 999px`) containing the **icon** (white, in a `oklch(1 0 0/0.16)` round chip) + **program name** (white, mono).
  5. **Duration chip — TOP RIGHT** (`.cca-chip`): glass pill, mono, `"<mins> PERC"`.
  6. **Centered category lockup** (`.cca-lockup`): eyebrow `LEXFIT · <code>` (mono, 9.5px) → big word `theme.toUpperCase()` (weight 900, ~26px, wraps/balances, `max-width: 230px`, centered) → a short underline rule. Nudged up `translateY(-6px)`.
  7. **Bottom gradient band** (`.pt-tv-foot`): `linear-gradient(to top, oklch(0.15 0.03 350/0.94), oklch(0.15 0.03 350/0.55) 62%, transparent)`, holding the **workout title** (`.pt-tv-name`, white, weight 800, ~15px, balanced wrap).
- **Content order recap:** program (top-left) · duration (top-right) · category word (center) · workout title (bottom band).

### 2. Grid card (`CardV2` in cards-variants.jsx)
- Full-bleed cover, height 250px, `border-radius: 20px`. Top row = code pill + duration pill. Bottom **light-on-dark scrim** carries tag pills (difficulty flames + level, plus a type tag) then the workout title (17.5px/800) and a sub line (`theme · format`). Play veil appears on hover.
- To carry program identity here, apply the same program lockup — either as the **footer band** treatment or the **top-left glass tab** (both prototyped in an earlier `PtGrid`). The **TV key art** is the chosen hero, but the grid card should reuse the identical icon+name lockup for consistency.

### 3. List row (`CardV3` / `PtRow`)
- Horizontal, height ~112px, `border-radius: 18px`. Same cover gradient full-bleed with a **left→right dark scrim**. Left: eyebrow (`<program icon> <PROGRAM> · <code>`), workout title, tag row (level + format). Right: big duration number.
- Program shows as the **eyebrow lockup + a thin left keyline** (a program-colorless vertical edge) — there's no room for a band on a row.

### 4. Dense shelf / small card (`CardN`, `CardA`, `PtShelf`)
- Netflix-style dense art (`aspect-ratio: 16/9`, small radius). Title lives *in* the art; program shows as a small **corner tab** (icon + short name). `CardN` also demonstrates an expand-on-focus info panel (actions, match %, meta, type pills) — that's an optional streaming pattern, not required for v1.

---

## Interactions & Behavior
- **Hover (pointer):** cards lift (`translateY(-3px)` or `scale(1.025–1.035)`) with a deepened shadow; a dark veil + white glass play button fades in over the cover (`.cc-play`, opacity 0→1, 0.16s ease).
- **Difficulty flames:** 3 flame glyphs; `level` (1–3) sets how many are full opacity vs. dimmed (`opacity: 0.3`).
- **Type tags:** small translucent pills (e.g. `🔇 Csendes`, `⚡ Intenzív`, `🌙 Esti`) from `types[]`. Emoji are part of the tag data.
- **States to support:** `preview` (not joined), `done`, `today`, `todo` for program-day context; `new` and `resume` (progress bar on the art) for shelves. See `program/prog-data.jsx` in the project for the state model (`progDayState`, `progPhaseState`).
- **Transitions:** 0.16s ease for card lift/veil; 0.18s ease for shelf art scale.

## State Management
Card components are **presentational/pure** — they take a workout object + a `program` key and render. State lives above them:
- `joined` (has the user started the program) → drives day state.
- Per-workout progress (`done`/`today`/`todo`), streak, current index — see the project's `prog-data.jsx` for the canonical shape.
- No data fetching inside the card. Feed it from Firestore-backed workout + program records.

### Suggested data shape
```ts
type Category =
  | "Alsótest" | "Felsőtest" | "Cardio + has"
  | "Teljes test" | "Mobility / nyújtás" | "Tartás-fókusz";

type ProgramKey = "foundation" | "kickstart" | "stretch" | "gym" | "comp";

interface Program {           // one record per program (admin-managed)
  key: ProgramKey;
  name: string;               // wordmark, e.g. "FOUNDATION"
  icon: "dot"|"square"|"bar"|"triangle"|"diamond";
}

interface Workout {
  code: string;               // "F018"
  title: string;              // "Cardio combo + ferde has"
  theme: Category;            // drives color + centered word
  program: ProgramKey;        // drives icon + name (auto-inherited)
  mins: number;               // 30
  level: 1 | 2 | 3;           // Kezdő | Közepes | Haladó
  format: string;             // "EMOM"
  types: string[];            // ["🔇 Csendes"]
}
```

---

## Design Tokens
From `lexfit-tokens.css` (source of truth — copy it in). Palette derives from szavazzmagadra.hu.

**Fonts:** `--font: "Poppins", "Helvetica Neue", sans-serif;` (UI + display) · `--mono: "IBM Plex Mono", monospace;` (codes, chips, eyebrows). Load: Poppins 400–900, IBM Plex Mono 400/500.

**Neutrals / surfaces:** `--bg: oklch(0.955 0.015 0)` · `--surface: #fff` · `--surface-2: oklch(0.952 0.014 0)` · `--line: oklch(0.91 0.018 0)`.
**Ink:** `--ink: oklch(0.245 0.022 350)` (warm plum-black) · `--ink-2: oklch(0.49 0.030 355)` · `--ink-3: oklch(0.63 0.030 355)`.
**Accents:** `--accent: oklch(0.66 0.155 0)` · `--accent-2: oklch(0.58 0.165 358)`.
**Category hues:** see the Categories table above (`--cat-also/felso/cardio/teljes/mobility/tartas`).
**Radii:** `--r-sm: 8px` · `--r-md: 14px` · `--r-lg: 20px`. Card radii used: TV art 14, grid 20, list 18, shelf 6–9.
**Card shadow:** `--shadow-card: 0 1px 2px oklch(0.3 0.03 350/0.05), 0 6px 24px -8px oklch(0.45 0.08 0/0.13)`; hover shadows deepen (see cards.css).

**Program lockup specifics:**
- Glass pill bg `oklch(0.18 0.03 350/0.5)` + `blur(9px)` + `1px solid oklch(1 0 0/0.16)`, radius `999px`.
- Icon chip: `oklch(1 0 0/0.16)` bg, white icon, 22×22, round.
- Bottom foot gradient: `oklch(0.15 0.03 350/…)` stops (see TV key art layer 7).
- Trainer underlayer: `mix-blend-mode: luminosity; opacity: 0.42;` + radial edge mask.

---

## Assets
- **Trainer photo:** `uploads/645406172_122099815329230342_5248551207032804718_n.jpg` (2048² square). Used only as the blended underlayer. In production this should be a per-trainer or per-program hero image field; the blend + mask make almost any portrait work. Provide a way to set focal point (`background-position`) per image.
- **Icons:** all inline SVG (play, clock, flame, etc. in `lexfit-shared.jsx` `lxPaths`, and the 5 program marks). No icon font needed.
- **No external images** otherwise — covers are 100% generated.

## Files in this bundle
- `lexfit-tokens.css` — design tokens + shared atoms (`.cover`, `.ph`, `.chip`). **Copy the tokens.**
- `lexfit-shared.jsx` — `LxIcon`, `lxPaths`, `LxCover`, `LX_CAT_STYLE`, `LxFlames`, `lxData`.
- `cards/cards.css` — full styling for grid/list/shelf/TV card variants.
- `cards/cards-variants.jsx` — `CardV2` (grid), `CardV3` (list), `CardN` (dense shelf), `CardA` (TV) reference implementations.
- `explore/prog-thumbs.css` + `explore/prog-thumbs.jsx` — **the finalized program-thumbnail system** (`PtTV`, `PROGRAMS`, `MSHAPE`/`PMark`, category helpers). This is the primary reference for the new logic.
- `LEXFIT Program-borítók.html` — runnable prototype of the program system (open in a browser).
- `LEXFIT Course Cards.html` — runnable prototype of all four card variants.
- `cards/design-canvas.jsx` — presentation-only scaffold used by the prototypes (Figma-ish canvas). **Do not port** — it's just for viewing options side by side.
- `IMPLEMENTATION_PLAN.md` — the phase-by-phase build guide. **Start there.**

---
See **IMPLEMENTATION_PLAN.md** for the step-by-step implementation plan.
