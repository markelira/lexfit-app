# Handoff: LEXFIT Button System

**Target:** `markelira/lexfit-app` · branch `main` · Next.js App Router, React + TypeScript, no Tailwind.

This is a **consolidation task, not a redesign.** No button in the product needs to look different afterwards. What changes is how many *kinds* of button exist — roughly fifteen today, eight after.

Read this file fully before writing code. `LEXFIT Button Library.html` in this folder is the visual reference; open it in a browser.

---

## 0. Why this exists

An audit of the design set found **eight distinct button heights** (26–56px) and **twelve corner radii** (4–999px) doing the work of a system. No single value is wrong. The cost is that a developer implementing three screens invents the same button three times and gets three different buttons.

Two findings are defects rather than inconsistencies:

**The card save `+` is 26px.** It is the most-used control on the busiest screen and sits 18px under Apple's 44pt minimum. On a phone it is a mis-tap generator. Fixed in §4 without changing how it looks.

**Radius `7px` appears throughout the wireframes and exists nowhere in the repo.** `src/app/lexfit-tokens.css` already ships `--r-sm: 8px`, `--r-md: 14px`, `--r-lg: 20px`. The design drifted off tokens that were already there. **The code is upstream of the design here — align to the token file, not to the wireframes.**

---

## 1. The size ladder

Four heights. Padding, type size and icon size are **derived from the height**, not chosen — derived values cannot drift.

| Token | Height | Padding-x | Font | Icon | Radius | Use |
|---|---|---|---|---|---|---|
| `--btn-xs` | 28px | 10px | 12px | 14px | 8px | Desktop only. Dense in-card actions. **Requires 24px clear offset** (WCAG 2.5.8 spacing exception). |
| `--btn-s` | 34px | 14px | 12.5px | 15px | 8 / 999 | Filter chips, toolbars, search field. |
| `--btn-m` | 40px | 18px | 13.5px | 16px | 8px | **The default.** If unsure, this. |
| `--btn-l` | 48px | 24px | 15px | 18px | 8px | Hero primary, sheet confirm, **every mobile button**. |

```css
:root{
  --btn-xs: 28px; --btn-s: 34px; --btn-m: 40px; --btn-l: 48px;
  --btn-gap: 8px;            /* icon → label, every step */
  --btn-r: var(--r-sm);      /* 8px, from lexfit-tokens.css */
}
/* Below 840px every step promotes. Floor is 44px. */
@media (max-width: 840px){
  :root{ --btn-xs: 44px; --btn-s: 44px; --btn-m: 48px; --btn-l: 52px; }
}
```

Proportions, if a new size is ever genuinely needed: `padding-x ≈ height × 0.45`, `icon ≈ height × 0.38`, `gap` always 8.

**Standards this satisfies:** WCAG 2.2 SC 2.5.8 (AA) requires 24×24 CSS px or a 24px spacing offset. SC 2.5.5 (AAA) asks 44×44. Apple HIG says 44pt, Material says 48dp. NN/g measured users over 65 as **43% slower** at the same tasks — for a 35+ audience skewing older, generous targets are the product working, not a compliance box.

---

## 2. Four levels of emphasis

| Level | Treatment | Rule |
|---|---|---|
| **01 Primary** | Ink fill, white label | **Exactly one per viewport.** |
| **02 Secondary** | White, 1px `--line` border | A real alternative, not a lesser one. Any number. |
| **03 Ghost** | Text only, accent colour | Navigation and dismissal. Never the main action. |
| **04 Destructive** | Red text; **filled red only inside a confirm dialog** | Rationed hardest. |

**Fill is a budget.** On Kezdőlap the hero's `Edzés indítása` spends it, so nothing else on that page may be filled. Nielsen's finding is that users overlook a quiet primary CTA — but three loud ones is the same failure, because nothing is primary.

Ordering: **primary left, secondary right**, in a flex row with `gap: 12px`. Never margins — gap survives reorder and delete.

---

## 3. Anatomy

- **Icon left by default.** It is read before the label, so it should preview the action.
- **Icon right only for directional meaning** — "goes somewhere", "next", "opens". A right chevron on a save button is nonsense.
- **Icon-only is a last resort**, limited to `+ ✓ ▶ × ⋯`. Always an `aria-label`, always a tooltip on desktop.
- **Gap is 8px** between icon and label at every step.

**Radius — five values total, three already tokenised:**

| Value | Use |
|---|---|
| `var(--r-sm)` 8px | Buttons, inputs, small controls |
| `var(--r-md)` 14px | Cards, panels |
| `var(--r-lg)` 20px | Large surfaces, sheets |
| `999px` | Pills, chips |
| `50%` | Circular icon buttons |

A button is **always 8** unless it is a pill or a circle. There is no in-between case.

---

## 4. Icon buttons — visual size ≠ target size

The rule that fixes the 26px save button without redrawing anything: **WCAG measures the target, and padding counts toward it.** A small glyph in a large flex box is compliant and invisible to the design.

```css
.card-save{
  /* hit area — 44px */
  min-width: 44px; min-height: 44px;
  display: inline-flex; align-items: center; justify-content: center;
  background: none; border: none; padding: 0;
  /* pull the extra box out of the layout so nothing shifts */
  margin: -9px;
}
.card-save > span{        /* the visible 26px circle */
  width: 26px; height: 26px; border-radius: 50%;
  border: 1px solid var(--line); background: var(--surface);
}
```

Icon-button sizes: 28 / 34 / 40 / 48, circular for actions, `--r-sm` square for toolbars.

**The save `+` is nested inside a card that is itself a button.** It needs `stopPropagation` on click and must be independently reachable by keyboard.

---

## 5. States

| State | Treatment |
|---|---|
| Default | — |
| Hover | Darken or tint. **Never resize.** |
| Focus | 2px accent ring, 2px offset. **Never removed, at any level.** |
| Active | 1px downward shift. The only transform allowed. |
| Disabled | 42% opacity, and **say why nearby**. |
| Loading | Spinner replaces the icon, label stays. **Width must not change.** |

A button that grows on hover moves the target the user is already aiming at. A button that shrinks to a spinner moves everything after it.

---

## 6. Two documented exceptions

Both are deliberate. A system with no exceptions is usually wrong; a system with *documented* exceptions is a system, and undocumented ones are drift.

**Player transport, 56px circular.** Off the ladder because it is operated from two to three metres away, mid-movement, by someone out of breath. The player is the one screen where the distance rule beats the size scale.

**Card play affordance, 38px.** Not a button. It is an affordance drawn on the thumbnail — the whole card is the target. It never receives focus separately and is not in the tab order.

---

## 7. Where each one goes

| Location | Step | Level |
|---|---|---|
| Kezdőlap hero | M / L | 01 + 02 |
| Row heading "Összes ›" | S | 03 ghost |
| Card save `+` | XS icon | 02 — **44px hit area** |
| Videótár filters | S pill | 02 / selected |
| Bottom-sheet confirm | L full-width | 01 |
| Player transport | M + the 56px exception | 02 on dark |
| Profil danger zone | M | 04 destructive |
| Empty state | M | 01 + 02 |
| Onboarding "Tovább" | L full-width | 01 |

Anything not on this list does not need a new button — it needs one of these.

---

## 8. Implementation

Build **one component**, `src/components/Button.tsx`, with `size` (`xs|s|m|l`), `variant` (`primary|secondary|ghost|destructive`), `iconLeft`, `iconRight`, `loading`, `fullWidth`. Styles in `src/app/lx-atoms.css` alongside the existing `.chip` atom, scoped under `.lx`.

Then migrate, in this order:

1. **Tokens first** — add the ladder to `lexfit-tokens.css`. Nothing renders differently yet.
2. **The save button hit area** — the one real accessibility defect. Ships alone, no visual change.
3. **`Button.tsx`** plus the icon-button variant.
4. **Swap call sites** screen by screen: Kezdőlap → Videótár → Haladásom → Profil → player.
5. **Delete the ad-hoc styles** left behind in `foundation.css`, `library.css`, `haladasom.css`.

Reuse `LxIcon` and `lxPaths` for icons. The library reference uses Lucide; production uses the repo's own paths.

---

## 9. Definition of done

- Exactly four button heights in the codebase; everything promotes to a 44px floor below 840px
- One filled button per viewport on every screen
- Every button radius is `var(--r-sm)`, `999px`, or `50%` — no literals
- The card save `+` has a 44px target with its 26px appearance unchanged
- Focus ring present on every variant including ghost
- Nothing resizes on hover or while loading
- Button rows use flex `gap`, minimum 8px
- Icon-only buttons carry `aria-label`
- No ad-hoc button CSS left in the per-screen stylesheets
- `npm run build` clean, no console errors

---

## 10. Open question — ask before deciding

**Should XS (28px) exist at all?** It is only legal via the WCAG spacing exception, and its single use case — the card save `+` — is solved better by the hit-area rule in §4. Dropping it leaves a three-step ladder, which is simpler and harder to misuse. Worth settling before this reaches code.

Ask me before making any decision this file does not cover.
