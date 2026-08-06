# 00 · Foundations

**The single source of truth. Every other file in this bundle references this one and must not restate it.**

If a value appears here, it does not appear anywhere else. If you find yourself writing a px value into a screen spec, it belongs in this file instead.

---

## 0.1 The one blocking decision

**The repo's palette and the design set disagree. Ask before writing any code.**

`src/app/lexfit-tokens.css` is **rose**, ported from szavazzmagadra.hu:
```
--accent: oklch(0.66 0.155 0)     /* ~#e5719b */
--ink:    oklch(0.245 0.022 350)  /* #2a1f23 warm plum-black */
```

The wireframes and the redesigned `/login` are **Eukaliptusz green**:
```
--accent: #7a9b8d  --accent-2: #496c5e  --accent-ink: #355c4d
--ink: #18201d  --ink-2: #44544d  --ink-3: #5c6e66  --soft: #e1f1ea
```

These are two visually different products. **Do not choose.** Everything else in this bundle is palette-independent — it is structure, hierarchy, sizing and behaviour, and it is identical either way.

---

## 0.2 Colour tokens

Use tokens, never literals. Source of truth is `src/app/lexfit-tokens.css`.

| Token | Role |
|---|---|
| `--bg` | Page background |
| `--surface` / `--surface-2` | Cards, panels / recessed fills |
| `--line` | Borders, dividers |
| `--ink` / `--ink-2` / `--ink-3` | Primary text / secondary / tertiary |
| `--accent` / `--accent-2` / `--accent-ink` | Brand fill / deeper / **text-safe accent** |
| `--accent-soft` | Tinted panels |
| `--ok` / `--ok-soft` | Completion, streaks |
| `--cat-*` (6) | Category coding — see 0.10 |
| `--d-*` | Dark surfaces — player only |

**Contrast rules, non-negotiable:**
- Never put non-`--ink` text directly on a light `--accent`. On Eukaliptusz only `--ink` passes (5.46:1); `--ink-2`, `--ink-3` and white all fail.
- **The one exception is the white LEXFIT mark inside the accent logo tile.** A logo is a graphic, not text.
- **No text below 14px may carry `opacity` under `.78`.** Use solid `--ink-2` / `--ink-3` instead. Many mono labels in this product are 10–13px.

---

## 0.3 Spacing scale

4px base. **These eight values only.**

```
--sp-1: 4px    --sp-2: 8px    --sp-3: 12px   --sp-4: 16px
--sp-5: 20px   --sp-6: 24px   --sp-8: 32px   --sp-10: 40px
```

| Context | Value |
|---|---|
| Icon → label inside a control | `--sp-2` (8) |
| Between buttons in a row | `--sp-3` (12) |
| Card internal padding | `--sp-4` desktop · `--sp-3` mobile |
| Between cards in a row | `--sp-4` desktop · `--sp-3` mobile |
| Between stacked rows / sections | `--sp-6` desktop · `--sp-5` mobile |
| Screen edge padding | `--sp-6` desktop · `--sp-3` mobile |

**Always flex/grid `gap`, never per-element margins.** Gap survives reorder and delete; margins do not.

---

## 0.4 Type scale

Poppins (`--font`) for UI, IBM Plex Mono (`--mono`) for labels, codes, durations and numerals.

| Role | Desktop | Mobile | Weight |
|---|---|---|---|
| Page title | 23px | 19px | 800 |
| Section / row heading | 15px | 13px | 700 |
| Card title | 13px | 12px | 700 |
| Body | 14px | 13px | 400 |
| Secondary line | 12.5px | 11.5px | 400 |
| Mono label | 10px | 9px | 500, `.08em`, uppercase |
| Big numeral | 30px | 23px | 800, `tabular-nums` |

- Letter-spacing `-0.02em` on anything 19px and above; `0` below.
- **Every numeral that can change uses `font-variant-numeric: tabular-nums`** — timers, counts, streaks, durations. Otherwise the layout jitters as digits change.
- Never below **11px** for anything a user must read.

---

## 0.5 Radius

Five values. Three already tokenised.

| Value | Use |
|---|---|
| `var(--r-sm)` 8px | Buttons, inputs, chips-as-rects, small controls |
| `var(--r-md)` 14px | Cards, panels |
| `var(--r-lg)` 20px | Large surfaces, bottom sheets (top corners only) |
| `999px` | Pills, filter chips, search field |
| `50%` | Circular icon buttons, avatars |

**No literals, no in-between values.** The design set drifted onto a `7px` radius that exists nowhere in the codebase — it is a bug, not a decision.

---

## 0.6 Breakpoints and targets

```
--bp-mobile:  840px   /* below: bottom tab bar, single column */
--bp-compact: 1080px  /* below: 3 cards per row, sidebar persists */
```

**Touch target floor: 44×44px below 840px. No exceptions.**

WCAG 2.2 SC 2.5.8 (AA) requires 24×24 CSS px *or* a 24px spacing offset. SC 2.5.5 (AAA) asks 44. Apple HIG says 44pt; Material says 48dp. NN/g measured users over 65 as **43% slower** at identical tasks — for a 35+ audience skewing older this is the product working, not a compliance box.

**Visual size and target size are separate numbers.** Padding counts toward the target, so a 26px glyph inside a 44px flex box is compliant and looks unchanged:

```css
.hit44{
  min-width:44px; min-height:44px;
  display:inline-flex; align-items:center; justify-content:center;
  background:none; border:none; padding:0;
  margin:-9px;              /* absorb the extra box; nothing shifts */
}
```

Minimum 8px between any two targets, 12px default, **24px around any target under 44px**.

---

## 0.7 Interaction states — global

Every interactive element, every screen. Do not re-specify these per component.

| State | Treatment |
|---|---|
| Hover | Darken or tint. **Never resize.** |
| Focus | 2px `--accent-ink` ring at 2px offset. **Never removed, anywhere.** |
| Active | 1px downward shift. The only transform permitted. |
| Disabled | 42% opacity **and a nearby reason**. A dead control with no explanation is a dead end. |
| Loading | Spinner replaces the icon, label stays, **width does not change**. |
| Selected | Accent fill or accent border — consistent per component family. |

A control that grows on hover moves the target the user is aiming at. A control that shrinks to a spinner moves everything after it.

---

## 0.8 Motion

```
--dur-fast: 120ms   /* hover, focus, colour */
--dur-base: 200ms   /* sheets, expand/collapse, tab change */
--dur-slow: 320ms   /* page transition, sheet present */
--ease: cubic-bezier(.2,0,.2,1)
```

- Animate `opacity` and `transform` only. Never `height`, `width`, `top` or `left`.
- **Honour `prefers-reduced-motion: reduce`** — drop to opacity-only at `--dur-fast`. This includes the workout completion celebration and the rest countdown.

---

## 0.9 Universal screen states

**Every data-backed surface implements all four.** These are global patterns; a screen spec says only what fills the slots.

**Loading** — skeletons matching the real layout's shape and count, never a centred spinner. No layout shift when data lands.

**Empty** — icon, one-line reason, and **a way out**. Empty rows are hidden entirely, never rendered with placeholder cards.

**No results** — states *which* filter caused it and offers the exact result of removing it:
> „Ehhez a hármashoz még nincs edzés. A »nehéz« szűrő nélkül **7 hát-edzés** van 10 perc alatt."
> `[A 7 edzés megnézése]` `[Összes szűrő törlése]`

**Error** — what failed, and a retry. Never a raw error code.

---

## 0.10 Category system

Six categories, colour-coded from `--cat-*` in the token file, mapped in `src/lib/categories.ts`.

Alsótest · Felsőtest · Cardio + has · Teljes test · Mobility / nyújtás · Tartás-fókusz

**Category is always coded twice — hue *and* a second cue** (word, glyph, or silhouette). Six hues with two adjacent in the same family is not enough on its own, and dual coding also covers colour-vision difference and greyscale.

---

## 0.11 Icons

`LxIcon` + `lxPaths` (`src/lib/icons.ts`). Stroke-based, 24×24, `stroke-width: 2`.

- Size derives from the control: `icon ≈ height × 0.38`.
- **Icon left by default** — it is read before the label and should preview the action. Icon right only for directional meaning.
- **Icon-only is a last resort**, limited to `+ ✓ ▶ × ⋯`, always with an `aria-label`.
- **Navigation is never icon-only, at any breakpoint** — icon plus a permanently visible label, including in the mobile tab bar. Hidden desktop navigation measured 27% usage vs 48% visible, with ≥39% slower tasks.

The reference documents use Lucide. **Production uses `lxPaths`.** Four paths are missing and must be added: `house`, `trophy`, `user`, `chevronDown`.

---

## 0.12 Copy

- **Hungarian only.** All strings in the screen specs are verbatim. Do not translate, reword, or "improve".
- Sentence case for labels; mono labels uppercase with `.08em` tracking.
- Durations in words on cards — **"28 PERC", never "28:14"**. A user is budgeting time, not scrubbing a timeline.
- Alexa's voice appears in first person and is **rationed** — a minority of cards, one line at a time. If it is everywhere it stops reading as a person.
- Keep strings ready to centralise later; do not concatenate sentence fragments in JSX.

---

## 0.13 Data

Firestore at runtime, never hardcoded. Types in `src/lib/types.ts` — no schema changes are required by anything in this bundle.

| Need | Source |
|---|---|
| Programme, weeks, today's workout | `loadFoundation()` — `src/lib/program.ts` |
| Streak, done count, resume map | `src/lib/progress.ts` |
| Saved items | `src/lib/mylist.ts` |
| Category colour + word | `src/lib/categories.ts` |
| Signed playback | `src/lib/mux.ts` |

`Video.thumb` already exists and is currently unused by the UI. It is load-bearing in the new card.

Content is mock/preview and lives **only in the Firebase Local Emulator**. Do not seed production.

---

## 0.14 Accessibility floor

Applies to every screen; screen specs list only additions.

- Landmarks: one `<main>`, `<nav>` for navigation, `<header>` for the shell bar.
- `aria-current="page"` on the active destination.
- Cards are `<a>` or `<button>`; nested actions use `stopPropagation` and are independently keyboard-reachable.
- Icon-only controls carry `aria-label`.
- Progress bars: `role="progressbar"` with `aria-valuenow`.
- Focus visible everywhere; never clipped by `overflow: hidden`.
- Menus and sheets: Escape closes, focus returns to the trigger, focus trapped while open.
- Respect `prefers-reduced-motion`.

---

## 0.15 How to use this bundle

| File | Scope |
|---|---|
| `00-FOUNDATIONS.md` | **This file.** Global. Everything numeric lives here. |
| `01-SHELL.md` | Global navigation shell — desktop and mobile. Applies to every route. |
| `02-BUTTONS.md` | Global button and control system. |
| `10-KEZDOLAP.md` | Screen — desktop home. |
| `11-MOBILE.md` | Screen — mobile, all routes. |
| `reference/` | Visual references. Greyscale on purpose — structure, not colour. |

**Rule for future work:** a new screen spec may only describe what is unique to that screen. Anything reusable is promoted into `00`, `01` or `02` first.
