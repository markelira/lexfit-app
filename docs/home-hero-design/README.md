# Handoff: Foundation Program Hero (Kezdőlap billboard)

## Overview
A cinematic, Apple-TV/Netflix-inspired **hero (billboard)** for the LEXFIT home screen, reframed so the **Foundation program** is the primary story (not just the day's workout). Editorial "Featured"-style layout: a centered program lockup with the program title, a one-line summary, and a bottom **coverflow row of the program's category key-art cards**. Derived from the "Netflix & Apple TV hero" research and dev plan in this project.

This handoff covers the chosen direction: **"Fázis-fókusz" (Apple TV / editorial)** hero — file `Foundation Hero — Fázis-fókusz.html`.

## About the Design Files
The files in this bundle are **design references created in HTML** — a prototype showing the intended look and behavior, **not production code to copy directly**. The task is to **recreate this design in the target codebase's existing environment** (the LEXFIT app is React + Babel-in-browser today; a real build would use React/JSX or the team's chosen framework), reusing its established components, tokens, and patterns. If reproducing inside the existing app, this replaces/extends the current hero in `app/home-billboard.jsx` styled by `.nhb-*` rules in `app/lexfit-app.css`.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and the coverflow depth treatment are specified below and should be reproduced closely, using the codebase's existing design tokens (`lexfit-tokens.css`) and card atoms (`cards/cards.css`, `explore/prog-thumbs.css`).

## Screens / Views

### Hero — "Foundation / Kihívás" billboard
- **Purpose**: Give the user one confident, high-conviction entry point to the Foundation program from the home screen, and preview the program's category workouts.
- **Layout**: A single full-width card, **fixed height 452px**, `border-radius: 24px`, `overflow: hidden`, on a dark base (`var(--ink)`). Design width reference: **1080px** container.
  - **Layer stack (bottom → top):**
    1. `.hb-art` — gradient fill (absolute, inset 0).
    2. `.hb-photo` — trainer photo, `mix-blend-mode: luminosity`, `opacity: .4`, radial mask so it dissolves at edges.
    3. `.hb-ring` — decorative oversized ring outline (`border: 30px solid oklch(1 0 0/.12)`), top-left, clipped.
    4. `.hb-scrim` — top-fading dark gradient for legibility.
    5. **Centered lockup** (absolute, `top: 44%`, `translateY(-50%)`, `text-align:center`): program pill → title → subtitle. This stays vertically centered.
    6. **`.hb-cards`** — the coverflow key-art row, absolutely pinned to the **bottom** (`bottom: 22px`), `display:flex; gap:11px; justify-content:center; align-items:flex-end`.

- **Components:**

  1. **Program pill (`.hb-lock`)** — centered, `margin: 0 auto 16px`.
     - Glass chip: `background: oklch(.18 .03 350/.5)`, `border: 1px solid oklch(1 0 0/.18)`, `backdrop-filter: blur(9px)`, `border-radius: 999px`, `padding: 6px 14px 6px 7px`.
     - Mark: 24px circle `background: oklch(1 0 0/.16)`, white filled ● dot glyph (circle r=6 in 24-viewBox SVG).
     - Label `.nm`: mono font, `11px`, weight 500, `letter-spacing: .16em`, white — text **"FOUNDATION"**.

  2. **Title** — `font-weight: 900; font-size: 66px; line-height: .9; letter-spacing: -.035em; color: #fff; text-transform: uppercase`. Current copy: **"kihívás"** (rendered uppercase → "KIHÍVÁS"). (Was "Foundation"; the program identity now lives in the pill above.)

  3. **Subtitle** — `margin-top: 12px; font-size: 15px; font-weight: 600; color: oklch(1 0 0/.85)`. Copy: **"8 hét · 48 edzés · kezdőtől a visszamérésig"**.

  4. **Coverflow key-art cards (`.hb-cards` → `.pt-tv`)** — 5 cards, one per category, reusing the **Program-borítók** PtTV key-art (from `explore/prog-thumbs.jsx` / `.css`). Each card:
     - Width **156px**, art `aspect-ratio: 16/9`, `border-radius: 14px`.
     - Background gradient per category: `linear-gradient(135deg, oklch(from <cat> calc(l + .07) c h) 0%, <cat> 100%)`.
     - Contains: `.hb-photo`-style trainer underlayer (`.pt-tv-photo`), a `.cc-ring` outline, and the **centered `.cca-lockup`**: eyebrow `.ey` (mono, "LEXFIT · F00x"), wordmark `.wd`, underline `.un`.
     - **Removed from the standard PtTV card in this hero**: the top-left FOUNDATION lockup (`.pt-tv-tl`), the duration chip (`.cca-chip`), and the bottom workout-name footer (`.pt-tv-foot`). Only the centered category key-art remains.
     - Wordmark size override in this context: `.hb-cards .pt-tv-art .cca-lockup .wd { font-size: 14.4px; max-width: 120px; padding: 0 6px }` (note: must out-specify the `.lx .pt-tv-art .cca-lockup .wd` rule in prog-thumbs.css).

     | # | Position | Category token | Eyebrow | Wordmark |
     |---|----------|----------------|---------|----------|
     | 1 | outer (`.r-out`) | `--cat-also` | LEXFIT · F001 | ALSÓTEST |
     | 2 | mid (`.r-mid`) | `--cat-felso` | LEXFIT · F002 | FELSŐTEST |
     | 3 | center | `--cat-cardio` | LEXFIT · F003 | CARDIO + HAS |
     | 4 | mid (`.r-mid`) | `--cat-teljes` | LEXFIT · F004 | TELJES TEST |
     | 5 | outer (`.r-out`) | `--cat-mobility` | LEXFIT · F005 | MOBILITY |

## Interactions & Behavior
- **Coverflow / "roll" depth** (the defining treatment): cards scale + fade by distance from center, aligned on a shared bottom baseline (`align-items: flex-end`, `transform-origin: bottom center`):
  - Center card: `scale(1)`, `opacity 1`.
  - `.r-mid` (positions 2 & 4): `transform: scale(.9); opacity: .78`.
  - `.r-out` (positions 1 & 5): `transform: scale(.8); opacity: .52`.
  - Transition: `transform .2s ease, opacity .2s ease`.
- Cards are `cursor: pointer` — in-app each should open the corresponding workout / program view.
- The centered lockup remains vertically centered regardless of the card row (cards are pinned to the bottom).
- **Responsive**: below ~760px reduce title (~34px), allow the card row to shrink/scroll; keep the center-weighted scale logic.
- **Accessibility** (from research/dev plan): if this hero ever autoplays motion/video, default muted with a visible, keyboard-reachable pause; honor `prefers-reduced-motion` (static poster); ensure scrim keeps text at AA contrast.

## State Management
Static in the mockup. In-app, the hero is **state-aware** (see existing `home-billboard.jsx`): Edzésnap / Kész mára / Pihenőnap / 8. hét visszamérés — all framed within the Foundation program. The 5 key-art cards map to the week/category workouts (F001–F005 = Week 1 · Alapozás). Program progress (done/total, current phase) comes from `PROG_META` / `PROG_WEEKS` in `program/prog-data.jsx`.

## Design Tokens
From `lexfit-tokens.css` (do not hardcode; use the variables):
- `--ink` (#2a1f23 warm plum-black) — hero base.
- Category colors: `--cat-also` (rose), `--cat-felso` (plum), `--cat-cardio` (warm coral), `--cat-teljes` (deep rose), `--cat-mobility` (sage).
- `--d-accent` (bright rose) — eyebrow / "now" accents.
- Fonts: `--font` = Poppins; `--mono` = IBM Plex Mono.
- Radii: card 24px (hero), 14px (key-art). Glass: `oklch(1 0 0/.16–.5)` fills, `blur(9px)`.
- Card wordmark size in hero: **14.4px** (`.wd`), eyebrow 7.5px, underline 16×2px.

## Assets
- Trainer photo underlayer: `uploads/645406172_122099815329230342_5248551207032804718_n.jpg` (referenced by `.pt-tv-photo` in `explore/prog-thumbs.css` and by `.hb-photo` in the mock).
- No icon library — the ● program mark and play glyphs are inline SVG.

## Files
- `Foundation Hero — Fázis-fókusz.html` — the chosen hero mockup (this handoff's primary reference).
- `Foundation Hero — 3 Mockup.html` — the three explored directions (billboard / editorial / continue-hybrid) on a canvas.
- `Kezdőlap Hero — Netflix & Apple TV Kutatás.html` — the UX/UI research (7 transferable principles + a11y).
- `Kezdőlap Hero — Fejlesztési Terv.html` — the sprint/task dev plan mapping the research onto the app files.
- Existing app references to reuse: `app/home-billboard.jsx`, `app/lexfit-app.css` (`.nhb-*`), `cards/cards.css`, `explore/prog-thumbs.jsx` + `.css`, `program/prog-data.jsx`, `app/lexfit-data.jsx`, `lexfit-tokens.css`.
