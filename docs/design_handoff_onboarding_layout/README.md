# Handoff: LEXFIT Onboarding — layout & sizing (desktop + mobile)

## Overview

The LEXFIT onboarding flow (10 steps: welcome → 5 questions → free-text "why" → plan reveal → auth → subscription) already exists in the dev build with the correct copy, question order and split-screen concept. **This handoff is not about the flow — it is about the geometry.** The implemented shell has no fixed layout contract, so every step lays itself out differently: the body column and the action bar sit on two different alignment axes, content is top-aligned inside a full-height pane leaving ~540px of dead space, and the type scale renders ~130% of the intended size.

This package specifies exactly how big everything is and where it sits, for desktop and mobile, so the existing implementation can be corrected.

**Scope of the fix:** CSS layout and sizing only. No question, option, copy string or step order changes.

## About the Design Files

The files in this bundle are **design references created in HTML** — wireframe/spec documents and prototypes showing intended layout, sizing and behavior. They are **not production code to copy directly**.

The task is to **apply the specified geometry to the onboarding in the target codebase**, using its existing environment (React, Vue, SwiftUI, native, etc.) and established patterns. Where this document gives CSS, treat it as the *normative contract* — the values and the structural relationships are what matter, not the literal class names. Map `.onb`, `.onb__brand`, `.onb__pane`, `.onb__col`, `.onb__head`, `.onb__body`, `.onb__act` onto whatever the codebase already calls these regions.

If no frontend environment exists yet, choose the most appropriate framework and implement there.

## Fidelity

**Mixed — and the distinction matters:**

- **The layout & sizing spec is high-fidelity and normative.** Every measurement in `LEXFIT Onboarding Layout Spec.html` (W2, W4, W5, W6) is an exact value to implement: px sizes, paddings, gaps, breakpoints, type scale, radii. Implement these precisely.
- **The wireframe frames are low-fidelity and schematic.** The drawn frames in both HTML documents are greyscale skeletons at roughly 1:2 scale, using a wireframe kit (dashed placeholders, single accent colour). **Do not take colours, gradients or the greyscale palette from them.** They communicate structure, position and proportion only.
- **Colour, brand and visual styling come from the existing app**, not from these documents. The dev build's current visual treatment (green/sage brand panel gradient, dark ink CTA, white cards) is correct and should be preserved — see Design Tokens below.

In short: **fix the geometry, keep the look.**

## Screens / Views

The whole flow is **one shell** with two panes. Steps do not each get their own layout.

### Shell (all steps, desktop ≥1024px)

**Purpose:** Hold every onboarding step without anything moving between steps.

**Layout:**
- Root: `height: 100dvh; display: grid; grid-template-columns: 1fr 1fr; overflow: hidden`
- Two panes, each exactly 50% of viewport width. They meet on a single line — **no gutter, no margin, no gap.**
- The page never scrolls. Only the body row inside the right pane scrolls, and only when its content exceeds the available height.

### Left pane — brand panel (identical on every step)

**Purpose:** Constant brand presence and social proof; never changes between steps 1–10.

**Layout:** `padding: 44px 52px 40px; display: flex; flex-direction: column; overflow: hidden`

Three vertical zones:
1. **Mark row** — top (natural flow position)
2. **Hero block** — `margin-block: auto` (this is what vertically centres it between the mark and the founder row)
3. **Founder row** — last flex child, sits at the bottom

**Components:**

| Component | Size / type | Position | Notes |
|---|---|---|---|
| Logo mark tile | 44 × 44, radius 12 | Top-left, row 1 | Wordmark 20px / weight 800 beside it, gap 12 |
| Eyebrow | 11px mono, letter-spacing .08em, uppercase | Above hero h1 | e.g. "OTTHONI EDZÉS" |
| Hero h1 | **48px** / line-height 1.05 / letter-spacing −.035em | In hero block | Two lines: first weight 300, second weight 700. Drops to 40px below 1280px. **Fixed size — no `vw`/`clamp()`** |
| Hero lede | 17px / line-height 1.5, max-width 34ch | margin-top 16 | Secondary ink colour |
| Stat row | Value 22px / weight 800; key 10px mono uppercase | margin-top 32, gap 40 | Three items. **Must never wrap** — drop to two stats before allowing a break |
| Founder row | Avatar 44px circle; name 14px / 700; role 10px mono uppercase | Last child, `padding-top: 24` | `border-top: 1px solid rgba(24,32,29,.14)` |

**Hidden entirely below 1024px** (see Responsive).

### Right pane — question pane (content swaps per step)

**Purpose:** Present one step at a time. The pane's chrome (header position, action bar position, content axis) is identical across all 10 steps.

**Layout:**
- Pane: `display: flex; flex-direction: column; padding: 44px 0 40px; min-width: 0`
- **One content column** holding all three rows:
  ```
  width: min(480px, 100% - 96px);   /* the ONLY width declaration */
  margin-inline: auto;
  max-height: 760px;
  margin-block: auto;               /* centres the column as a unit */
  display: flex; flex-direction: column; height: 100%;
  ```
- Three rows inside that column:
  - **Header** — `flex: none; height: 40px; display: flex; align-items: center; gap: 16px`
  - **Body** — `flex: 1; min-height: 0; overflow-y: auto; padding-top: 32px; display: flex; flex-direction: column; gap: 12px`
  - **Action bar** — `flex: none; margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e2e2; display: flex; flex-direction: column; gap: 12px`

**Critical:** no descendant of the column sets its own width or `margin-inline`. The header, the body and the action bar all inherit the 480px axis. This is the single most important rule in the handoff.

**Header row contents:** back button (40 × 40) · progress bar (`flex: 1`) · step counter (11px mono, e.g. "3 / 5"). The row is **40px tall on every step**, including steps 8–10 which have no progress bar (there the row holds only the back button). This is what keeps the question title on the same y throughout.

**Progress bar:** 5 segments, `height: 4px; border-radius: 2px; gap: 6px`, each `flex: 1`. Filled segments use the accent colour.

### Step body contents (what fills the body row)

| Step | Contents |
|---|---|
| 1 · Welcome | Eyebrow, hero-style title, lede, stat row. Action: primary CTA "Kezdjük" + "Van már fiókod? Lépj be" link |
| 2 · Cél | Question h1 + sub, 5 single-choice option rows |
| 3 · Szint | Question h1 + sub, 3 single-choice option rows |
| 4 · Napok | Question h1 + sub, segmented control (3/4/5/6), recommendation line, week-strip preview card |
| 5 · Napszak | Question h1 + sub, 3 single-choice option rows |
| 6 · Környezet | Question h1 + sub, 5 **multi-select** option rows |
| 7 · Miért (new) | Question h1 + sub, textarea (min-height 104), 0/160 counter, Alexa whisper note. Action: CTA "Mehet" + "Most kihagyom" text link |
| 8 · A heted | Eyebrow, title, week-strip card with summary line, first-workout card (16:9), whisper note. Action: "Mentsük el a tervedet" |
| 9 · Auth | Existing auth register pane — form used as built, but **must adopt this column**, not bring its own width |
| 10 · Előfizetés | Title + sub, 3 plan cards (radio-style selection), CTA repeating the exact amount, meta line |

### Mobile (<768px)

**Purpose:** Same flow, single column, brand panel dropped.

**Layout:** three-row stack filling `100dvh`:
- Root: `height: 100dvh; grid-template-columns: 1fr; overflow: hidden`
- Brand panel: `display: none` — **dropped, not stacked.** The logo mark moves into the header.
- Column: `width: 100%; max-width: none; max-height: none; margin: 0; flex: 1; min-height: 0`
- **Header** — `height: 56px; padding: 0 20px; flex: none; border-bottom: 1px solid #e2e2e2;` opaque white background. Back 40×40 · progress bar · counter. On step 1 the mark replaces the back button.
- **Body** — `flex: 1; min-height: 0; overflow-y: auto; padding: 20px 20px 0; gap: 10px; -webkit-overflow-scrolling: touch; overscroll-behavior: contain`. The only scrolling region. **Never** `height: 100%`.
- **Action bar** — `flex: none; margin: 0; border-top: 1px solid #e2e2e2;` opaque white background, `padding: 12px 20px calc(12px + env(safe-area-inset-bottom)); gap: 10px`. Sticky at the bottom.

Side margins 20px, plus `env(safe-area-inset-left/right)` in landscape.

## Interactions & Behavior

- **Navigation:** back button present from step 2 onward, always non-destructive (answers preserved). Primary CTA advances. Steps 7 and (optionally) 10 offer a skip text link.
- **Selection:** single-choice steps (2, 3, 5) select-and-advance is *not* used — the user selects, then presses the CTA. Multi-select step (6) toggles.
- **Tick semantics carry meaning:** circle tick = single choice; rounded-square tick = multi-select. Step 6 is the only multi-select and must look different from the others.
- **Show the consequence on the same screen:** choosing 5 days on step 4 draws the week strip immediately, on that screen.
- **The reveal restates the answers:** step 8 quotes the inputs back ("Heti 5 edzés · reggelente · csendes variációkkal").
- **Scrolling:** shell is `overflow: hidden`. Header and action bar never scroll away. Steps that exceed 760px (auth form, plan detail) scroll inside the body row only.
- **The action bar may grow** (adding a meta line or a ghost button) — it grows downward from its `border-top`, and the body row absorbs the difference, so the title still does not move.
- **Answers persist across a bounce at auth** — held locally, attached on registration. A returning user is never re-interrogated.

### Responsive behavior

| Range | Structure | Content measure | Brand panel | Action bar |
|---|---|---|---|---|
| < 768 | Single column | 100% − 40 | Hidden | Sticky bottom, safe-area inset |
| 768 – 1023 | Single column, centred | max 440 | Hidden | Sticky bottom |
| 1024 – 1599 | Split 50 / 50 | `min(480, 100% − 96)` | Visible, hero 40–48 | In-column, border-top |
| ≥ 1600 | Split 50 / 50 | 480 fixed | Visible, hero 48 | In-column, border-top |

```css
@media (max-width: 767.98px)  { /* single column, safe areas */ }
@media (min-width: 768px) and (max-width: 1023.98px) {
  /* centred 440 measure: header, body and action children get max-width:440px; margin-inline:auto; width:100% */
  /* body padding-top: 28px; question h1: 27px */
}
@media (min-width: 1024px)    { /* split shell, 480 axis, 760 column cap */ }
/* No breakpoint above 1600 — the axis is already fixed at 480 */
```

**Why 1024 is the split threshold:** at 1024 each pane is 512px — just enough for the 480 axis minus padding. Below that the form would be narrower than the phone layout it replaced.

**Why tablet is not a small desktop:** 768–1023 keeps the mobile stack and only adds a 440px measure. Two panes at 900px would give the form a ~450px pane.

## The eight defects being fixed

Measured from the dev build at a 2560 × 1440 viewport. Each maps to a rule above.

| # | Defect | Measured in build | Spec | Fix |
|---|---|---|---|---|
| 01 | **Two alignment axes in the right pane** | Body starts x≈1341, CTA starts x≈1615 — 274px apart | One axis, both 480px | Header, body and action bar are children of a single column. Nothing sets its own width. |
| 02 | **Dead vertical space** | Content ends y≈840, CTA at y≈1380 — 540px void | Max column height 760, centred as one unit | `max-height: 760px; margin-block: auto` on the column |
| 03 | **Brand hero unanchored** | Hero at y≈530–890, ~400px void above | Three zones: mark top / hero centred / founder bottom | `margin-block: auto` on the hero block only; founder is the last flex child |
| 04 | **Panel seam and gutter** | Panel ends x≈1293, content starts x≈1341 — 48px unclaimed white | Panels meet at exactly 50% | Grid `1fr 1fr`, no margins between panes; padding lives inside the pane |
| 05 | **Step header detached** | Progress bar ≈60px above the question, on its own width | 32px below the header row, same axis | Header is row 1 of the column; the gap is a token, not a margin |
| 06 | **Type scale ≈130%** | Brand h1 ≈64px, question h1 ≈40px | 48px, 30px | Fixed scale. No `vw`/`clamp()` on the question column |
| 07 | **Option rows over-wide** | ≈600px wide, descriptions wrap to 3 lines | 480px, 2 lines max | Rows inherit the axis; description clamped to 2 lines |
| 08 | **No viewport lock** | Shell height follows content; page scrolls | 100dvh, no page scroll | `height: 100dvh; overflow: hidden` on the shell; only the body scrolls |

The screenshots were taken at a 1440px-tall viewport, which exaggerates the voids — **but they exist at 900px too, just smaller.** This is not a large-monitor-only bug.

## State Management

State variables needed:

- `step` — current step index (1–10). Drives progress bar fill, counter text, back-button visibility.
- `answers` — `{ goal, level, days, time, env[] }`. `env` is an array (multi-select); the rest are single values.
- `why` — free text, max 160 chars, skippable (nullable).
- `plan` — selected subscription plan; **defaults to the annual plan pre-selected.**
- `account` — name / email / password (step 9). On successful registration, `answers` + `why` are attached to the created account.

Transitions: CTA advances `step`; back decrements it non-destructively. Answers are held locally (localStorage or equivalent) so a bounce at step 9 does not lose them.

Data fetching: none required for steps 1–8. Step 9 posts registration; step 10 posts the subscription selection.

## Design Tokens

**Colour comes from the existing app — do not take it from the wireframe documents.** These are the values the dev build already uses correctly and should keep:

| Token | Value | Use |
|---|---|---|
| Brand panel background | Sage/green gradient, ~158°, light mint → pale green | Left pane only |
| Primary CTA background | Near-black ink `#19211e` (or the app's existing ink) | Primary buttons |
| Primary CTA text | `#ffffff` | — |
| Accent (selected state) | Sage green — selected option border + fill, filled progress segments, accent text | Selection, progress |
| Accent soft background | Pale mint — selected option row fill | Selected rows |
| Surface | `#ffffff` | Right pane, cards, action bar |
| Hairline | `#e2e2e2` | Header border-bottom, action bar border-top |
| Option border (rest) | 1.5px, light grey | Unselected option rows |
| Brand panel hairline | `rgba(24,32,29,.14)` | Founder row border-top |
| Ink secondary | Muted green-grey | Question sub, lede |
| Ink tertiary | Lighter green-grey | Option descriptions, meta text |

**Typography.** Two sizes per role — one desktop, one mobile. Tablet interpolates the h1 only. **No `vw` units, no `clamp()` on text.**

| Role | Desktop ≥1024 | Mobile <768 | Weight / tracking |
|---|---|---|---|
| Brand hero h1 | 48 / 1.05 | — (hidden) | 300 line + 700 line, −.035em |
| Question h1 | **30 / 1.15** | **24 / 1.2** | 800, −.03em. Tablet 27 |
| Question sub | 15 / 1.5 | 14 / 1.5 | Regular, ink2, max-width 40ch |
| Option title | 16 / 700 | 15 / 700 | −.01em |
| Option description | 13.5 / 1.4 | 13 / 1.4 | ink3, clamp to 2 lines |
| Eyebrow / counter | 11 mono, .08em | 11 mono | Uppercase |
| Meta under CTA | 12.5 | 12 | ink3, centred |

**Controls.**

| Control | Desktop | Mobile | Notes |
|---|---|---|---|
| Primary CTA | 56 tall, radius 12 | 52, radius 12 | Full axis width, 16 / 700. **One per screen** |
| Secondary / ghost | 48, radius 12 | 46, radius 12 | 1.5px border, no fill |
| Back button | 40 × 40, radius 10 | 40 × 40 | Hit target 44 via padding |
| Option row | min 68, padding 14 16, radius 14 | min 64, padding 12 14, radius 12 | 56 / 60 when single-line |
| Option icon tile | 40, radius 10 | 36, radius 9 | Icon 18 / 17, stroke 2 |
| Option tick | 24 | 22 | Circle = single, rounded square = multi |
| Option list gap | 10 | 8 | — |
| Segmented control | 52, radius 999, padding 4 | 48, radius 999 | Selected pill white + shadow |
| Textarea | min 104, radius 12 | min 96 | Counter below, right-aligned |
| Input field | 52, radius 12 | 50, radius 12 | Label 11 mono above, gap 6 |
| OAuth button | 52, radius 12 | 50, radius 12 | Icon 18, gap 10, centred |

**Spacing rhythm.**

| Gap | Desktop | Mobile |
|---|---|---|
| Header → title | 32 | 20 |
| Title → first control | 24 | 18 |
| Body block gap | 12 | 10 |
| Body → action bar | 28 margin + 20 padding | 0 + 12 padding |

**Radius scale:** 10 / 12 / 14 / 999 (desktop) — icon tiles / buttons + fields / cards / pills. Mobile: 9 / 12 / 999.

**Hit targets:** 44px is a floor, not a target. Every row and button here clears it — the audience is 35+ and often mid-movement, which is why rows are 64–68px.

## Layout rules (the seven that matter)

1. **One axis per pane.** Header, body and action bar are children of the same measured column. No descendant sets its own width or `margin-inline`. → fixes defect 01.
2. **The pane fills the viewport; the column does not.** Panes are `100dvh`; the column is capped at 760px and centred with `margin-block: auto`. → fixes defect 02.
3. **The title lands on the same y on every step.** Header row is 40px whether or not it holds a progress bar; body `padding-top` is always 32.
4. **Only the body scrolls.** Shell is `overflow: hidden`; header and action bar are never scrolled off. → fixes defect 08.
5. **Fixed type scale. No viewport units on text.** Two values per role, h1 interpolated once for tablet. → fixes defect 06.
6. **Below 1024 the brand panel is dropped, not stacked.** The mark moves into the 56px header; nothing else survives.
7. **The action bar owns the bottom inset.** `padding-bottom: calc(12px + env(safe-area-inset-bottom))`, opaque background, 1px border-top.

## What not to do

- ✕ Centring the CTA in the pane while the body is left-aligned — the most visible defect in the current build.
- ✕ Letting the content column stretch to `100dvh` — it produces the dead space. Cap at 760 and centre.
- ✕ `clamp()` or `vw` on question type — fluid text is what made the h1 40px.
- ✕ Stacking the brand panel above the form under 1024px. Drop it.
- ✕ A translucent or blurred mobile action bar — it sits over scrolling rows. Keep it solid.
- ✕ Option rows wider than 480px — descriptions wrap to three lines.
- ✕ `100vh` on mobile — use `100dvh`, or the action bar hides under the URL bar.
- ✕ A second loud button in the action bar. One primary; "Most kihagyom" is a text link.
- ✕ Re-asking the questions after a bounce at auth.
- ✕ Pricing on the auth page (step 9) — deliberately removed; checkout is step 10.

## Assets

- **Logo mark ("Az Ív")** — inline SVG, `viewBox="0 0 680 616"`: an arc stroke plus a circle, white glyph on an accent tile. Present in both HTML files; lift the SVG from there. Sizes used: 22 (small), 32 (large), 44 (xl, brand panel).
- **Icons** — Lucide (`chevron-left`, `check`, `flame`, `moon`, `user-round`, `calendar-check`, `chart-column`, `dumbbell`, `message-circle`, `shield`, `eye`, `clock`, `play`). Loaded via `lucide@latest` in the reference files; use the codebase's existing icon library at the same sizes (18 desktop / 17 mobile, stroke 2).
- **Google / Apple OAuth marks** — inline multi-colour SVGs, 16–18px, in the auth step of both reference files.
- **Founder avatar (Alexa)** — 44px circle, photographic. Supplied by the app, not this bundle.
- No other imagery. Workout card previews are 16:9 placeholders in the wireframes; real thumbnails come from the content system.

## Open questions (deliberately not decided)

1. **Desktop action bar position on short steps.** Pinned to the column's bottom edge is specified here, for step-to-step stability — but it leaves a visible gap on step 4. The alternative is placing it immediately below the content. Pick one and apply it to all steps.
2. **Whether the left panel's hero copy changes per step.** Fixed is specified, because a changing panel breaks the "one screen" illusion the split exists to create.
3. **Life stage (pregnancy / postpartum / menopause)** — currently deferred out of onboarding. If the programme adapts materially for safety, it must be asked up front instead. Trainer question, not a design one.
4. **Option icons: Lucide vs the existing emoji.** Drawn with Lucide for consistency and legibility for a 35+ audience; this is a brand-voice call.
5. **A free first workout** between the reveal (step 8) and registration (step 9) — depends on a business decision.

## Known data issue

`onboarding/onb-data.jsx` hard-codes **19 990 Ft / hó**, which is stale. The live pricing model is:

- **Heti** — 490 Ft first 7 days, then 1990 Ft / week
- **Havi** — 5990 Ft / month
- **Éves** — 39 900 Ft / year (767 Ft / week, −44%) — **pre-selected**

The CTA must repeat the exact amount being charged, e.g. "Előfizetek — 39 900 Ft / év". Price clarity was flagged as a P1 in the sales-page audit; do not regress it.

## Files

In this bundle:

| File | What it is |
|---|---|
| `LEXFIT Onboarding Layout Spec.html` | **The normative document.** W1 diagnosis (8 defects, measured), W2 desktop geometry + CSS contract + measurement table, W3 stability proof across three step types, W4 mobile geometry + CSS contract, W5 shared atoms table, W6 breakpoints, W7 layout rules and don'ts |
| `LEXFIT Onboarding Wireframe.html` | The flow document — dependency map (which answers the product actually consumes), step sequence, per-step mobile screens, desktop split-screen frames, onboarding rules |
| `wireframe-kit.css` | Shared wireframe vocabulary for both documents (greyscale, dashed placeholders) |
| `onb-spec.css` | Dimension-annotation and spec-table styles for the layout spec |
| `lexfit-icons.js` | Icon initialiser used by the reference documents |

Open both HTML files in a browser to read them. `LEXFIT Onboarding Layout Spec.html` is the one to implement from; the wireframe is context for *why* the steps are what they are.

### Screenshots

`screenshots/` contains flat captures of both documents, for reference without a browser. **They are lower fidelity than the HTML — read the HTML for anything you are measuring from.**

| File | Section |
|---|---|
| `01-layout-spec.png` | Title + W1 — the eight defects, measured |
| `02-layout-spec.png` | W2 — desktop geometry, annotated shell, CSS contract |
| `03-layout-spec.png` | W3 — stability proof across three step types |
| `04-layout-spec.png` | W4 — mobile geometry, annotated phone, CSS contract |
| `05-layout-spec.png` | W5 — shared atoms table |
| `06-layout-spec.png` | W7 — layout rules and don'ts |
| `01-wireframe.png` | Title + O1 — dependency map (which answers the product consumes) |
| `02-wireframe.png` | O2 — the 10-step sequence and where auth sits |
| `03-wireframe.png` | O3 — question screens, mobile |
| `04-wireframe.png` | O4 — reveal, auth, subscription, first entry |
| `05-wireframe.png` | O5 — desktop split-screen frames |

**Not included:** captures of the current dev build. The defect measurements taken from them are transcribed in full in the *eight defects* table above, with exact x/y coordinates — reproduce them by loading the current build at a 2560 × 1440 viewport if you want to see them first-hand.
