# Claude Code — Task Prompt

Paste everything below into Claude Code as your opening message.

---

## Context

You are implementing the redesigned UI of **LEXFIT** — a Hungarian, women-first home fitness web app built around one trainer, Alexa, and an 8-week Foundation programme.

Repo: `markelira/lexfit-app`, branch `main`. Next.js App Router, React + TypeScript, no Tailwind. Firebase, Mux, Stripe.

**Most of this is redesigning routes that already exist and work.** You are not starting from zero and you are not free-styling: each change traces to a usability finding.

The redesign's whole premise is **familiarity** — the layout, controls and card anatomy are deliberately borrowed from apps this audience uses daily (Netflix's billboard-over-rows, YouTube's card and duration badge, Apple Fitness's week ring, the bottom tab bar every phone app has). Where the spec looks conventional, that is the point. Do not make it more original.

## How this bundle is organised

**It is global-first. Read in order.**

| File | Scope |
|---|---|
| `00-FOUNDATIONS.md` | **Read this first and fully.** Every numeric value in the product — colour, spacing, type, radius, breakpoints, targets, motion, states, a11y, copy, data. |
| `01-SHELL.md` | The navigation shell. Applies to every route. |
| `02-BUTTONS.md` | The button and control system. |
| `10-KEZDOLAP.md` | Screen — desktop home. |
| `11-MOBILE.md` | Screen — mobile, all routes. |
| `20-VIDEOTAR.md` | Screen — Videótár. |
| `30-PROFIL.md` | Screen — Profil & Beállítások. |
| `31-PROFIL-DEV-PLAN.md` | **Build plan for the profile area** — nine phases, step by step. Read `30` first, build from `31`. |
| `reference/*.html` | Visual references. Open in a browser. |

**The rule that makes this work: a value appears in exactly one place.** Screen specs describe only what is unique to that screen. If you find a px value in a screen file that should be global, it is a bug in the spec — tell me rather than duplicating it.

The reference documents are **greyscale wireframes on purpose**. They specify structure, hierarchy, geometry and copy. They do **not** specify colour — that comes from the repo's token file.

## Before you write any code

**There is a blocking palette conflict — `00-FOUNDATIONS.md §0.1`.** The repo's tokens are rose (from szavazzmagadra.hu); the wireframes and `/login` are Eukaliptusz green. Two visually different products.

Ask me which is canonical. Everything else is palette-independent.

## Four hard constraints

Each has a reason. None is a style preference.

**1. Navigation is never icon-only, at any breakpoint.**
Icon plus a permanently visible label, including the mobile tab bar. Hidden desktop navigation measured 27% usage vs 48% visible, with ≥39% slower tasks. Dropping labels on small screens is exactly where the familiarity is lost.

**2. Exactly one filled button per viewport.**
Fill is a budget, not a style. Users overlook a quiet primary CTA — but three loud ones is the same failure, because then nothing is primary.

**3. Completed workouts are never dimmed.**
YouTube greys out watched videos: correct for consumption, actively demotivating for achievement. A finished workout keeps full opacity, gains a check and a timestamp, and reports what it added to the streak.

**4. Nothing essential behind hover, and no sub-14px text under `opacity: .78`.**
Hover fails outright on touch. For small text use solid `--ink-2` / `--ink-3` rather than dimming.

## Build order

1. **Tokens** — add the scales from `00` to `lexfit-tokens.css`. Nothing renders differently yet.
2. **The card save `+` hit area** — the one real accessibility defect (26px, under Apple's 44pt floor). Ships alone, no visual change. `00 §0.6`.
3. **Shell** — top bar, four labelled destinations, avatar top-right, `Foundation` → `Kezdőlap`, bottom tab bar below 840px. `01`.
4. **`Button.tsx`** and the icon-button variant. `02`.
5. **Kezdőlap** — new card, re-ordered rows. `10`.
6. **Videótár** — visible filter chips, row budget, empty state. `20`. **Read §20.1 first — several things there are already right.**
7. **Mobile pass** across every route. `11`.
7b. **Profil & Beállítások** — its own nine-phase plan, `31-PROFIL-DEV-PLAN.md`. It replaces `/app/profile`, whose settings currently do not persist at all.
8. **Delete the ad-hoc CSS** left behind in `foundation.css`, `library.css`, `haladasom.css`.

## Notes

- All UI copy is Hungarian and verbatim in the specs. Do not translate or reword.
- Build the new card as a **new component** (`WorkoutCard.tsx`). Do not edit `NCard` — `/app/library` and `NcardModal` still use it.
- `Video.thumb` already exists in the data model and the current card ignores it. The new card needs it.
- `Journey`, `ProgSplit`, `ProgRetest` and `Stats` come off Kezdőlap but are **not deleted** — they move to a programme detail route.
- Four icon paths are missing from `src/lib/icons.ts`: `house`, `trophy`, `user`, `chevronDown`.
- Screens read Firestore at runtime. Keep it that way. Content is emulator-only — do not seed production.

## Definition of done

Per-file, in each spec's own section. Globally: four button heights, one filled button per viewport, every radius a token, 44px floor on touch, focus rings everywhere, all four universal screen states implemented, Hungarian verbatim, clean build, no console errors.

Ask me before making any decision the specs do not cover. Each file ends with its open questions.
