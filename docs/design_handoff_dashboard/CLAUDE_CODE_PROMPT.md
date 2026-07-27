# Claude Code — Task Prompt

Paste everything below into Claude Code as your opening message.

---

## Context

You are redesigning the **Kezdőlap** (home) route of **LEXFIT** — a Hungarian, women-first home fitness web app built around one trainer, Alexa, and an 8-week Foundation programme.

Repo: `markelira/lexfit-app`, branch `main`. Next.js App Router, React + TypeScript, no Tailwind. Firebase (Firestore/Auth/Storage), Mux for video, Stripe later.

**This route already exists and works.** `src/app/app/page.tsx` renders a Foundation programme page today. You are not starting from zero and you are not free-styling: the redesign is a specific set of structural changes, each traceable to a usability finding.

The redesign's whole premise is **familiarity** — the layout, controls and card anatomy are deliberately borrowed from apps this audience already uses daily (Netflix's billboard-over-rows, YouTube's card and duration badge, Apple Fitness's week ring). Where the spec looks conventional, that is the point. Do not make it more original.

## Files in this bundle

| Path | What it is |
|---|---|
| `README.md` | **The specification. Read it fully before starting.** |
| `LEXFIT Dashboard Wireframe.html` | The design reference — shell, rows, card anatomy, mobile, with the reasoning for each decision. Open it in a browser. |
| `wireframe-kit.css`, `lexfit-icons.js` | Support files for the reference document only. **Do not port either.** |

The wireframe is a **greyscale skeleton on purpose** — dashed placeholders, grey fills. It specifies structure, hierarchy, geometry and copy. It does **not** specify colour, photography or final typography. Take layout from it; take colour from the repo's token file.

## Your task

Implement §9 "Build order" from `README.md` against the real codebase, reusing the existing shell, auth context, Firestore helpers (`src/lib/program.ts`, `progress.ts`, `mylist.ts`) and icon system.

## Before you write any code

**There is a blocking palette conflict — see README §0.** The repo's tokens are rose pink (`--accent: oklch(0.66 0.155 0)`, from szavazzmagadra.hu). The wireframes and the redesigned `/login` page are Eukaliptusz green (`#7a9b8d`). These are two different visual products.

Ask me which is canonical before starting. Everything else in the spec is palette-independent — it is layout, hierarchy, component anatomy and copy, and it is 1:1 either way.

## Three hard constraints

Each has a reason; none is a style preference.

**1. Nav is never icon-only, at any breakpoint.**
Icon plus a permanently visible label, including in the mobile bottom tab bar. Hidden desktop navigation measured 27% usage vs 48% visible, with ≥39% slower tasks. Dropping labels on small screens is exactly where the familiarity is lost.

**2. Completed workouts are never dimmed.**
YouTube greys out watched videos — correct for consumption, actively demotivating for achievement. A finished workout keeps full opacity, gains a check and a timestamp, and reports what it added to the streak.

**3. No metadata behind hover, and no text below 14px with `opacity < .78`.**
Hover-only text fails outright on touch and raises interaction cost everywhere else. For small text use solid `--ink-2` / `--ink-3` rather than dimming — several mono labels on this screen are 10–13px.

## Notes

- All UI copy is Hungarian and reproduced verbatim in README §7. Do not translate or reword.
- Build **Variant B as a new component** (`src/components/WorkoutCard.tsx`). Do not edit `NCard` — `/app/library` and `NcardModal` still use it.
- `Video.thumb` already exists in the data model and the current card ignores it. Variant B needs it. Until real content is uploaded, fall back to `cardGrad(v.theme)` at 16:9 — not to the typographic cover.
- `Journey`, `ProgSplit`, `ProgRetest` and `Stats` come off Kezdőlap but are **not deleted** — they move to a programme detail route.
- Screens read Firestore at runtime. Keep it that way; nothing hardcoded.
- Content is mock/preview and lives only in the Firebase Local Emulator. Do not seed production.

## Definition of done

See README §10. In short: shell with top bar and four labelled destinations, rows in the specified order, Variant B card matching the reference, bottom tab bar under 840px, Hungarian copy verbatim, Firestore at runtime, clean build.

Ask me before making any decision the README does not cover. README §11 lists four that are already known to be open.
