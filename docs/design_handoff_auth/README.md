# Handoff: LEXFIT Auth Page (`/login`)

## Overview

The sign-in / sign-up page for **LEXFIT** — a Hungarian-language home fitness product built around one trainer, Alexa. Split-screen layout: a light eucalyptus brand panel on the left, a white authentication column on the right with a segmented Login / Register toggle.

**Language:** all UI copy is Hungarian (`<html lang="hu">`). Reproduce it verbatim.

---

## Why this design — four structural fixes

The previous `/login` had problems that were structural, not cosmetic. Preserve these fixes; they are the point of the redesign.

1. **One primary action, not two.** The old page had two competing equal-weight headlines side by side. Now: brand panel left, single form right — the split-screen pattern used by Notion, Linear, Duolingo, so it reads as familiar.
2. **Returning users have a way in.** The old page was registration-only with no login path. There is now a segmented toggle plus a contextual link line above it.
3. **Pricing is removed from auth.** Asking for a payment decision before an account exists interrupts the flow. The register pane says *"a csomagot a következő lépésben választod ki"* — plan selection belongs to a later checkout step. **Do not add pricing cards back to this page.**
4. **Real form fields.** "Or continue with email" used to be inert text. Now: OAuth buttons → divider → visible inputs with password reveal, inline validation, forgot-password link, and a loading state.

---

## About the design file

`LEXFIT Auth.html` is a **design reference in HTML/CSS/JS** — a prototype demonstrating layout, states, and behaviour. It is **not production code to copy**.

Recreate it in the target codebase's environment (React/Next, Vue, etc.) using its existing form primitives, validation library, and auth SDK. Notes on prototype-only conventions:

- `<image-slot>` is a placeholder web component. Replace with a real `<img>` / `<Image>`.
- Validation and the loading state are simulated in vanilla JS. Wire to the real auth provider.
- The two panes are `display:none` toggles. In production use routes (`/login`, `/register`) or a controlled tab state — **keep the URL meaningful** so the two states are linkable and analytics can distinguish them.

## Fidelity

**High-fidelity.** Colours, type, spacing, radii, and states are final. The only unfinished asset is Alexa's portrait.

---

## Design tokens

Taken from the LEXFIT Eukaliptusz system — do not invent values.

| Token | Hex | Use |
|---|---|---|
| `--accent` | `#7a9b8d` | Logo tile background |
| `--accent-2` | `#496c5e` | Input focus ring/border, checkbox |
| `--accent-ink` | `#355c4d` | Links (accent-coloured text on white) |
| `--soft` | `#e1f1ea` | Brand panel mid gradient stop |
| `--ink` | `#18201d` | Headings, body, primary button fill |
| `--ink-2` | `#44544d` | Secondary text, lede, stat labels |
| `--ink-3` | `#5c6e66` | Placeholders, hints, divider, trust line |
| `--bg` | `#f1f6f4` | Segmented control track, eye-button hover |
| `--surface` | `#ffffff` | Right column, inputs, OAuth buttons |
| `--line` | `#d8e0dd` | Borders |
| `--line-2` | `#c5cfca` | Border hover |
| `--danger` | `#b13a38` | Validation errors |

**Fonts:** Poppins (UI) + IBM Plex Mono (labels, stat keys, divider, trust line). Self-host in production.

### ⚠ Two contrast rules that constrain this page

Both were arrived at by measurement and have already caused rework — treat as hard constraints.

**1. Never put non-`--ink` text directly on `--accent`.** Eucalyptus is light. Measured against `#7a9b8d`:

| Foreground | Ratio | |
|---|---|---|
| `--ink` `#18201d` | **5.46:1** | ✅ only passing option |
| `--ink-2` | 2.63:1 | ❌ |
| `--ink-3` | 1.78:1 | ❌ |
| `--accent-ink` | 2.47:1 | ❌ |
| white | 3.04:1 | ❌ |

This is exactly why the brand panel is the lighter `#e1f1ea` gradient and not solid accent — on the tint the full ink ramp works (`--ink` 14.2:1, `--ink-2` ~7:1).

**The one exception:** the white LEXFIT mark inside the `--accent` logo tile. A logo is a graphic, not text; WCAG text contrast does not apply, and a dark mark loses the silhouette. Keep it white.

**2. No text below 14px may carry `opacity` under `.78`.** The WCAG large-text exemption starts at 18.66px bold / 24px regular; everything smaller needs 4.5:1. Express muted tone with `--ink-2` / `--ink-3`, never by dimming. This page has several 10–13px mono labels — they use solid colours for this reason.

---

## Layout

```
.shell  display:grid; grid-template-columns:1.02fr .98fr; min-height:100vh
```

### Left — brand panel
`padding:44px 56px`, flex column, `overflow:hidden`.
- Background: `linear-gradient(160deg, #eaf4ef 0%, var(--soft) 46%, #d3e8de 100%)`
- `::before` — 820px radial glow `rgba(122,155,141,.34)`, `blur(30px)`, positioned `left:-18% bottom:-34%`
- `::after` — diagonal hairlines: `repeating-linear-gradient(115deg, transparent 0 118px, rgba(24,32,29,.028) 118px 119px)`

Three vertical zones:
1. **Mark (top)** — 44px `--accent` tile, `radius 12px`, shadow `0 6px 16px -8px rgba(24,32,29,.45)`, white Az Ív glyph inside at 24×22, then "LEXFIT" (Poppins 800, 20px).
2. **Body (centred, `margin:auto`)** — headline `„Egyedül nehéz. / **Együtt muszáj.**"` (Poppins 300 with 700 second line, `clamp(30px,3.2vw,46px)`), sub-paragraph, then three stats: **4 hét** / Foundation · **100+** / edzés · **17 000+** / a közösségben.
3. **Footer** — 1px top rule, 44px circular avatar (Alexa), name + role.

### Right — auth column
`display:flex; align-items:center; justify-content:center; padding:44px 40px; background:var(--surface)`. Inner `.card` is `max-width:432px`.

Order: contextual link line (right-aligned) → segmented toggle → `h1` → lede → OAuth stack → divider → fields → checkbox → submit → legal/trust.

---

## Components

**Segmented toggle** — 2-col grid, `gap:4px`, track `--bg` with `--line` border, `radius:999px`, `padding:4px`. Active button: white fill, `--ink` text, `0 1px 3px rgba(24,32,29,.12)`. `role="tablist"` + `aria-selected`.

**OAuth button** — full width, `height:50px`, `1.5px solid var(--line)`, `radius:12px`, 14.5px/600, brand SVG at 19px. Hover: border `--line-2`, background `#fbfdfc`. Google (4-colour) and Apple provided.

**Divider** — flex with `::before`/`::after` 1px rules, mono 11px `.1em` uppercase "vagy".

**Input** — `height:50px`, `1.5px solid var(--line)`, `radius:12px`, `padding:0 15px`, 15px text. Focus: `border-color:var(--accent-2)` + `box-shadow:0 0 0 3px rgba(73,108,94,.16)`. With a trailing button add `padding-right:52px`.

**Password reveal** — 40px button inset `right:6px`, `--ink-3`, hover `--bg`. Toggles `type`, updates `aria-label`, tints `--accent-ink` when revealed.

**Validation** — `.field.bad` reddens the border and reveals `.err`. Errors clear on `input`. On submit, focus the first bad field.

**Submit** — full width, `height:52px`, `--ink` fill, white text, `radius:12px`. Hover lifts 1px with shadow. `.loading` shows a spinner and dims the label.

**Trust line** — mono 10.5px uppercase, lock icon + *"Titkosított kapcsolat"* (login) / shield + *"14 napos pénzvisszafizetési garancia"* (register).

---

## Copy (verbatim)

**Login** — h1 `Üdv újra itt.` · lede `Lépj be, és folytasd ott, ahol abbahagytad.` · `Folytatás Google-lel` / `Folytatás Apple-lel` · labels `E-mail cím`, `Jelszó` · `Elfelejtetted?` · `Maradjak bejelentkezve ezen az eszközön` · submit `Belépés` · link line `Még nincs fiókod? / Regisztrálj`

**Register** — h1 `Kezdjük el.` · lede `Hozz létre egy fiókot — a csomagot a következő lépésben választod ki.` · `Regisztráció Google-lel` / `Regisztráció Apple-lel` · labels `Keresztneved`, `E-mail cím`, `Jelszó` · hint `Legalább 8 karakter, egy számmal.` · opt-in `Kérek heti emlékeztetőt és új edzés-értesítőt. Bármikor leiratkozhatsz.` · submit `Fiók létrehozása` · legal `A folytatással elfogadod az ÁSZF-et és az Adatkezelési tájékoztatót.` · link line `Van már fiókod? / Lépj be`

**Errors** — email `Adj meg egy érvényes e-mail címet.` · login password `Add meg a jelszavad.` · register password `A jelszó legyen legalább 8 karakter, és tartalmazzon számot.` · name `Add meg a keresztneved.`

> The marketing opt-in checkbox is **unchecked by default** and the "stay signed in" checkbox is **checked**. Keep both defaults — the opt-in must remain opt-in (GDPR).

---

## Behaviour

| Trigger | Result |
|---|---|
| Toggle / link click | Swap pane, update link line, autofocus first field after 60ms |
| Pane enter | `fade` 0.28s — opacity + 6px rise |
| Eye click | Toggle input type, update `aria-label`, tint icon |
| Submit | Validate; if bad, focus first bad field; else loading ~1.4s |
| Input | Clear that field's error |

Validation rules: email `/^[^@\s]+@[^@\s]+\.[^@\s]+$/` · register password ≥8 chars **and** contains a digit · login password non-empty · name non-empty. Client-side only in the prototype — **always re-validate server-side**.

---

## Responsive

Single breakpoint at **940px**: `.shell` collapses to one column (brand panel stacks above), brand padding → `32px 30px`, headline → 28px, auth padding → `36px 24px`.

> ⚠ **Mobile needs a decision.** Stacking puts the full brand panel above the form, so the form is below the fold on small screens. Recommended: collapse the brand panel to just the mark + headline under ~640px, or move it below the form. Confirm before building.

---

## Accessibility

Already handled: `role="tablist"` / `aria-selected`, labelled inputs, `aria-label` on icon buttons, `aria-hidden` on decorative SVGs, visible focus ring, correct `autocomplete` (`email`, `current-password`, `new-password`, `given-name`).

Still to do in production:
- Add `aria-invalid` and `aria-describedby` linking inputs to their error nodes
- Announce errors via a live region
- Verify keyboard tab order through the toggle
- Honour `prefers-reduced-motion` for the pane fade and spinner
- Give the avatar real alt text

## Assets

| Slot | Content |
|---|---|
| `auth-alexa` | Alexa portrait, 44px circular |

Az Ív mark is inline SVG (white on the accent tile). Full brand set: `design_handoff_eukaliptusz/brand/`.

---

## Files

| File | Contents |
|---|---|
| `LEXFIT Auth.html` | Full page — markup, styles, and behaviour |
| `image-slot.js` | Prototype-only placeholder — **do not port** |

## Build order

1. Tokens + fonts + the two-column shell
2. Brand panel (static)
3. Form primitives: input, OAuth button, divider, checkbox, submit
4. The two panes with real copy
5. Toggle + routing
6. Validation + loading, wired to the auth provider
7. Responsive decision (see warning) + a11y pass
8. Real portrait
