# Claude Code — Task Prompt

Paste everything below into Claude Code as your opening message.

---

## Context

You are migrating **LEXFIT** — a Hungarian-language home fitness product — from its rose-pink brand system to a new neutral **Eukaliptusz** (blue-green) palette. This is **product-wide**: the app, onboarding, community, program, sales pages, and landing page.

LEXFIT is built around one trainer, Alexa: an 8-week guided program (Foundation), a 200+ workout library, progress tracking, and a community. The pink reads as gendered and narrows the audience. The replacement was chosen from a research review and a two-round palette exploration — an earlier olive candidate was rejected as too military.

**This is a token and asset migration, not a redesign.** Layout, typography, spacing, motion, component anatomy, and all Hungarian copy stay exactly as they are. If you find yourself changing structure, stop.

## Files in this bundle

| Path | What it is |
|---|---|
| `README.md` | **The specification. Read this first, in full.** 14 chapters: rationale, full token set, the literal inventory, per-component specs, a11y requirements, phased plan. |
| `eukaliptusz-tokens.css` | Drop-in `:root` for **both** token files. Necessary but **not sufficient**. |
| `current/` | Live source: the two token files, the landing page + CSS, and `lexfit-shared.jsx` (LxCover). |
| `reference/` | The colour-psychology research report and the palette exploration these decisions came from. Context only — do not modify. |

## Your task

Migrate the product to Eukaliptusz following `README.md`. Work the phases in §13, in order.

## Three things that will break a naive migration

Read these before writing any code.

**1. There are 321 hardcoded pink `oklch()` literals across 20 CSS files.**
They bypass the token system entirely — inside gradients, shadows, glows, and tint classes. Changing `:root` will not touch them, and you will ship a product that is half eucalyptus and half pink. README §6 gives detection greps and 14 fully worked examples to use as the pattern for the rest; §3 lists every file with its count. **The greps must return zero before you are done.**

**2. Eukaliptusz is lighter than the old pink, so text on it must invert.**
Old pink carried white text at 4.51:1. Eukaliptusz (`#7a9b8d`) with white is **3.04:1 — fails**. Dark ink on it is 5.46:1. Hero, pricing band, and every filled accent surface flip to dark ink. README §5.

Two deliberate exceptions, both explained there: the **app icon mark stays white** (a logo is a graphic, not text), and **course-cover metadata stays white** because the shipped `LxCover` has a dark scrim behind it — keep that scrim.

**3. Do not reintroduce contrast failures through `opacity`.**
Dimming ink toward a mid-tone accent is how three consecutive design reviews failed. **Hard rule: no text below 14px may carry `opacity` under `.78`.** The WCAG large-text exemption starts at 18.66px bold / 24px regular — everything smaller needs 4.5:1. Use `--ink-2` / `--ink-3` for muted tone, not opacity.

## Also worth knowing

- **There are two competing `:root` blocks** (`lexfit-tokens.css` for the app, `lexfit-landing.css` for the landing). Apply the new tokens to both; they must not drift. README §7.
- The app has **six** categories including `--cat-tartas`; the landing block only defines five. The new token file has all six.
- `--cat-cardio` is deliberately darkened to `L .56` — at its natural lightness it was visually indistinguishable from `--cat-also`. Do not lighten it.
- The **dark theme** moves from plum-black to green-black so it belongs to the same family.
- `--accent` is too light for text on white — use `--accent-ink` for links and accent-coloured labels.

## Definition of done

- Every check in README §14 passes.
- All three greps in §6 return zero.
- No white text on `--accent` anywhere.
- No sub-14px text with `opacity < .78`, across all 20 CSS files.
- Every contrast pair in §11 verified.
- Brand assets regenerated per §10.
- Zero layout shift, zero copy changes, no console errors.

Ask me before making any decision the README does not cover.
