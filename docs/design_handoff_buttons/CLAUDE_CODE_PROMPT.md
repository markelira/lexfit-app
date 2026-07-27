# Claude Code — Task Prompt

Paste everything below into Claude Code as your opening message.

---

## Context

You are consolidating the button system of **LEXFIT** — a Hungarian, women-first home fitness web app built around one trainer, Alexa, and an 8-week Foundation programme.

Repo: `markelira/lexfit-app`, branch `main`. Next.js App Router, React + TypeScript, no Tailwind.

**This is a consolidation task, not a redesign.** No button in the product needs to look different when you are finished. What changes is how many *kinds* of button exist — roughly fifteen today, eight after. The audit that motivated it found **eight distinct heights** (26–56px) and **twelve corner radii** (4–999px) doing the work of a system.

## Files in this bundle

| Path | What it is |
|---|---|
| `README.md` | **The specification. Read it fully before starting.** |
| `LEXFIT Button Library.html` | The visual reference — the audit, the ladder, anatomy, states, and the mapping back onto screens. Open it in a browser. |
| `wireframe-kit.css`, `lexfit-icons.js` | Support files for the reference document only. **Do not port either.** |

The reference is a **greyscale wireframe on purpose**. It specifies sizing, spacing, hierarchy and behaviour. It does **not** specify colour — take that from the repo's token file.

## Your task

Implement §8 "Implementation" from `README.md`: one `Button.tsx`, tokens in `lexfit-tokens.css`, styles in `lx-atoms.css`, then migrate call sites screen by screen and delete the ad-hoc button CSS left behind in `foundation.css`, `library.css` and `haladasom.css`.

## Start here — one real defect

**The card save `+` is 26px.** It is the most-used control on the busiest screen and sits 18px under Apple's 44pt minimum. On a phone it is a mis-tap generator.

Fix it first, on its own, before any refactor: WCAG measures the *target*, not the drawn shape, and padding counts toward it. A 26px circle inside a 44px flex box with `margin: -9px` is compliant and pixel-identical on screen. See README §4 for the exact CSS.

## Three hard constraints

**1. Radius comes from the repo, not from the design.**
`src/app/lexfit-tokens.css` already ships `--r-sm: 8px`, `--r-md: 14px`, `--r-lg: 20px`. The wireframes drifted onto a `7px` radius that exists nowhere in the codebase. **The code is upstream here.** A button is always `var(--r-sm)` unless it is a pill (`999px`) or a circle (`50%`). No literals.

**2. Exactly one filled button per viewport.**
Fill is a budget, not a style. On Kezdőlap the hero's `Edzés indítása` spends it, so nothing else on that page may be filled. Users overlook a quiet primary CTA — but three loud ones is the same failure, because then nothing is primary.

**3. Nothing resizes on hover or while loading.**
A button that grows on hover moves the target the user is already aiming at. A button that shrinks to a spinner moves everything after it. Colour changes, a 1px press shift, and a spinner replacing the icon while the label stays — that is the entire vocabulary. And the focus ring is never removed, at any variant, including ghost.

## Notes

- Padding, type size and icon size are **derived from the height**, not chosen. Derived values cannot drift; chosen ones always do — that is what produced the current state.
- Below 840px every step promotes to a **44px floor**. Define this once in the tokens; do not write per-component mobile variants.
- Two exceptions are **documented and intentional**: the player's 56px transport button and the card's 38px play affordance (which is not a button — the card is the target, and it must stay out of the tab order).
- The save `+` is nested inside a card that is itself a button. It needs `stopPropagation` and independent keyboard reachability.
- Reuse `LxIcon` and `lxPaths`. The reference document uses Lucide; production uses the repo's own icon paths.
- All UI copy is Hungarian. Do not translate or reword.

## Definition of done

See README §9. In short: four heights, one filled button per viewport, every radius a token, the save button at a 44px target with unchanged appearance, focus rings everywhere, no ad-hoc button CSS left in the per-screen stylesheets, clean build.

Ask me before making any decision the README does not cover. README §10 flags one that is already open — whether the 28px XS step should exist at all.
