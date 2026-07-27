# Handoff: LEXFIT Kezdőlap (`/app`)

**Target:** `markelira/lexfit-app` · branch `main` · Next.js App Router, React + TypeScript, no Tailwind.

This is a **redesign of an existing, working route**, not a new build. `src/app/app/page.tsx` (18KB) already renders a Foundation programme page. The wireframe changes the shell, the row order, and the card — and keeps the billboard-over-rows chassis that is already there.

Read this file fully before writing code. `LEXFIT Dashboard Wireframe.html` in this folder is the visual reference; open it in a browser.

---

## 0. One blocking decision — ask before you start

**The repo's palette and the design system disagree.**

`src/app/lexfit-tokens.css` is **rose pink**, ported from szavazzmagadra.hu:
```
--accent: oklch(0.66 0.155 0)      /* ~#e5719b brand rose */
--ink:    oklch(0.245 0.022 350)   /* #2a1f23 warm plum-black */
```

The wireframes, the redesigned `/login` page and `LEXFIT Color Schemes v2` are **Eukaliptusz green**:
```
--accent: #7a9b8d   --accent-2: #496c5e   --accent-ink: #355c4d
--ink:    #18201d   --ink-2: #44544d      --ink-3: #5c6e66
--soft:   #e1f1ea
```

These are two different products visually. **Do not pick one yourself.** Ask which is canonical:

- **If Eukaliptusz wins** — `lexfit-tokens.css` gets rewritten and every screen re-skins. That is a separate task from this one; agree the token file first, then build this route against it.
- **If rose wins** — build this route against the existing tokens exactly as they are, and `/login` becomes the outlier to fix later.

Everything else in this spec is palette-independent: it is layout, hierarchy, component anatomy and copy. **Structure is 1:1 regardless of which palette is chosen.**

---

## 1. What changes, and what must not

The wireframe is an audit with findings (`F-01…F-10`) and rules (`RULE 01…08`). Each change below traces to one. **These are the point of the redesign — do not "improve" past them.**

| # | Change | Current state in repo | Rule |
|---|---|---|---|
| 1 | **Add a global top bar** — logo, search, streak, avatar | No top bar exists at all | RULE 03 |
| 2 | **Search lives in the shell** | Only inside `/app/library` | F-02 |
| 3 | **Rename `Foundation` → `Kezdőlap`** in nav | `NAV` in `layout.tsx` says "Foundation" | RULE 02 / F-03 |
| 4 | **Four destinations, not three** — add `Kihívások` | 3 nav items | RULE 02 |
| 5 | **Avatar moves to top-right** | Bottom of the sidebar (`.lx-prof`) | F-04 |
| 6 | **Streak in the header, every route** | Only inside the billboard, `/app` only | F-08 |
| 7 | **Replace the card with Variant B** | `NCard` — typographic gradient cover | §4 |
| 8 | **Re-order the rows** | Billboard → Journey → PreviewDeck → ThisWeek → Split → Retest → Stats | §3 |
| 9 | **Bottom tab bar under 840px** | Sidebar goes horizontal at 760px | RULE 06 / F-07 |

### KEEP — already correct, protect it

- **Billboard hero over stacked horizontal rows.** The chassis is right; only row order and card content change.
- **Icon + permanently visible label** on every nav item. Never icon-only, at any breakpoint (F-10).
- **The glass sidebar treatment** in `shell.css` — the visual language survives; only its contents change.
- **`Protected` wrapper and the auth context.** Untouched.
- **Firestore-at-runtime.** Screens are not hardcoded. Keep it that way.

---

## 2. Shell — `src/app/app/layout.tsx` + `shell.css`

```
┌──────────────────────────────────────────────────────────┐
│ [mark] LEXFIT │  [🔍 Keresés…]        │ [🔥 12 NAP] [av] │  ← 58px, new
├───────────────┼──────────────────────────────────────────┤
│ Menü          │                                          │
│ ● Kezdőlap    │                                          │
│   Videótár    │              route content               │
│   Haladásom   │                                          │
│   Kihívások   │                                          │
│               │                                          │
│ Alexa · segítség (secondary, bottom)                     │
└───────────────┴──────────────────────────────────────────┘
```

**Top bar** — new element, `position: sticky; top: 0; z-index: 20`, height 58px, spans full width above the sidebar.

| Slot | Content | Behaviour |
|---|---|---|
| Left | Az Ív mark + `LEXFIT` wordmark | Links to `/app` |
| Centre | Search field, max-width 420px, radius 999px | Placeholder `Keresés edzés, kategória, hossz…`. Submitting routes to `/app/library?q=` |
| Right | Streak pill `🔥 12 NAP`, then 34px circular avatar | Avatar opens a menu: **Profil · Beállítások · Segítség · Kijelentkezés** |

The mark is the existing LEXFIT glyph — take the exact SVG from `LEXFIT Auth.html` (`.bmark-ico`), white on an accent tile. It is a graphic, so the white-on-accent contrast exception applies; keep it white.

**Sidebar** — keep the 244px glass panel. Changes:

```ts
const NAV: [string, keyof typeof lxPaths, string][] = [
  ["/app",            "house",  "Kezdőlap"],   // was "flame", "Foundation"
  ["/app/library",    "grid",   "Videótár"],
  ["/app/progress",   "chart",  "Haladásom"],
  ["/app/challenges", "trophy", "Kihívások"],  // new route
];
```

- Remove `.lx-prof` from the sidebar — the avatar is now top-right. Keep `/app/profile` as a route.
- Add a secondary, quiet **`Alexa · segítség`** block pinned to the bottom of the rail.
- **No collapse control.** The rail is permanent. NN/g measured hidden desktop nav at 27% usage vs 48% visible, ≥39% slower tasks (F-01 / RULE 01).

**Icons.** `src/lib/icons.ts` is missing four paths this screen needs. Add them in the same 24×24 stroke style:

```ts
house:  ["M4 11 L12 4 L20 11", "M6 10 V20 H18 V10"],
trophy: ["M7 4 H17 V9 a5 5 0 0 1-10 0 Z", "M7 6 H4 a3 3 0 0 0 3 3", "M17 6 H20 a3 3 0 0 1-3 3", "M12 14 V18", "M8 20 H16"],
user:   ["M12 12 a4 4 0 1 0 0-8 a4 4 0 0 0 0 8 Z", "M4 20 c0-4 3.6-6 8-6 s8 2 8 6"],
chevD:  "M6 9 L12 15 L18 9",
```
`arrowR` rotated 90° already serves as a chevron where one is needed.

---

## 3. Kezdőlap — `src/app/app/page.tsx`

Vertical order, top to bottom. **This order is the redesign.** It answers the user's questions in the order they actually ask them.

### 3.1 Billboard hero

Keep the existing `Billboard` component's geometry and the `--grad-hero` art. Change its content to **today's workout**, not the programme:

```
FOUNDATION · 4. HÉT · MAI EDZÉS        ← eyebrow, mono, uppercase
Teljes test — EMOM                     ← h1
[28 PERC] [KÖZEPES] [ESZKÖZ NÉLKÜL]    ← chips
[▶ Edzés indítása]  [Mit fogok ma csinálni?]
```

- **`Edzés indítása` is the only solid-fill button in the viewport** (RULE 05). Everything else is outline or ghost. A quiet primary CTA gets overlooked.
- Primary click → `/player/{todayCode}`. Secondary opens the existing `NcardModal` for that video.
- **Not joined yet:** eyebrow becomes `LEXFIT · 8 HETES PROGRAM`, primary becomes `Csatlakozz a programhoz`, secondary `Előzetes · 1. nap`. Same geometry.

### 3.2 Week strip

A single row directly under the hero — progress ring plus seven day dots (`H K SZE CS P SZO V`).

- States: `done` (filled), `today` (ring outline), `todo` (empty), `rest` (muted, moon).
- **A rest day does not break the streak.** Say so in a small line under the strip.
- Ring shows `doneThisWeek / perWeek`.
- RULE 07: this is the Apple-Fitness "am I on track" model. Reuse it; do not invent a visualisation.

### 3.3 Rows — exact order and headings

| # | Heading (verbatim) | Right link | Source | Show when |
|---|---|---|---|---|
| 1 | `Folytatod` | `Összes ›` | `progress.resume` keys, most recent first | any resume entry exists |
| 2 | `A Foundation heted` | `Program ›` | current week's `ProgramSession[]` | joined |
| 3 | `Listám` | `Összes ›` | `users/{uid}/mylist` | list non-empty |
| 4 | `Ha csak 15 perced van` | `Összes ›` | `videos` where `mins <= 15` | always |
| 5 | `Szavazz Magadra · a heti kihívás` | `Kihívások ›` | challenge series | always |

- 4 cards per row on desktop, horizontally scrollable, the 4th partly cut to signal scroll.
- **Row headings are demoted, not deleted.** SIGIR '26 eye-tracking: the top-left item of a row is examined by 90.82% of users, its heading by 25.77%. The heading is small; the artwork and duration badge carry the row.
- Empty rows are **hidden entirely**, never rendered with a placeholder.

### 3.4 What is removed from the current page

`Journey`, `ProgSplit`, `ProgRetest` and `Stats` come **off** Kezdőlap. They are programme-detail content, not home content. Move them to a Foundation programme detail route (`/app/program/foundation`) reachable from row 2's `Program ›` link. Do not delete the components.

---

## 4. The card — Variant B

**This is the highest-leverage change in the document.** It replaces `NCard` on this route. Geometry is borrowed wholesale from YouTube; only the *content of each slot* is LEXFIT's.

```
┌─────────────────────────┐
│ ▌MAI EDZÉSED        [3] │  ← ribbon, left, top:8px
│                         │
│          ( ▶ )      [2] │  ← play, centre, on hover
│                         │
│              [28 PERC]  │  ← badge, bottom-right  [1]
│ ▬▬▬▬▬▬▬───────────────  │  ← progress, bottom edge [6]
└─────────────────────────┘
 (A)  Fenék & comb — EMOM      (+)
  ↑   ↑                         ↑
 [4] [5] title only            save
```

| # | Element | Spec |
|---|---|---|
| 1 | **Duration badge** | Bottom-right of the 16:9 thumbnail. **In words: `28 PERC`, not `28:14`.** Position never moves — it is an engraved convention. |
| 2 | **Play affordance** | Filled triangle in a circle, centred, on hover/focus. The whole card is the click target. |
| 3 | **`MAI EDZÉSED` ribbon** | Top-left, flush to the edge. **Exactly one card per day may wear it.** Streaming platforms recommend; LEXFIT schedules. |
| 4 | **Avatar** | Always Alexa. A ring around it encodes the user's Foundation week; plain if the workout is outside the programme. |
| 5 | **Title only** | Nothing under it. A second line renders **only** when there is state to report: `5 perc van hátra`, `Megcsináltad · ma 07:40`. |
| 6 | **Progress bar** | 4px, hugging the bottom edge of the thumbnail, accent fill. |
| — | **Save** | `+` button right of the text block → adds to Listám. One click, no dialog, visible state change `+ → ✓`. |

### Hard rules for this card

- **Completed workouts are NOT dimmed.** YouTube greys out watched videos — correct for consumption, actively demotivating for achievement. A finished workout keeps full opacity, gains a check and a timestamp, and reports its streak contribution.
- **No metadata behind hover.** NN/g is explicit: don't rely on hover for text. Higher interaction cost, and it fails outright on touch.
- **`thumb` is now load-bearing.** `Video.thumb` already exists in `src/lib/types.ts` and the current `NCard` ignores it in favour of a gradient. Variant B needs a real 16:9 image. Until content is uploaded, fall back to the existing `cardGrad(v.theme)` treatment at 16:9 — **do not** fall back to the typographic cover, which is a different card.

### Migration

Build Variant B as a **new component** (`src/components/WorkoutCard.tsx`). Do not edit `NCard` — it is still used by `/app/library` and `NcardModal`'s pool. Migrating those routes is a later task in this series.

---

## 5. Data mapping

Everything the screen needs already exists in `src/lib/types.ts`. No schema changes.

| UI element | Source |
|---|---|
| Hero title, mins, level, format | `Video` via `data.byCode[todayCode]` |
| Hero eyebrow week number | `Math.floor(currentIndex / program.perWeek) + 1` |
| `MAI EDZÉSED` ribbon | `video.code === data.todayCode` |
| Week strip day states | `ProgramSession.day` + `Progress.doneCount` / `currentIndex` |
| Streak pill | `Progress.streak` |
| Row 1 `Folytatod` | `Progress.resume` → `{ videoCode: seconds }` |
| Card progress bar | `resume[code] / (muxDuration ?? mins*60)` |
| Row 3 `Listám` | `getMyList(uid)` — `src/lib/mylist.ts` |
| Save `+` toggle | `setSaved(uid, code, bool)` |
| Card avatar ring | `Progress` week vs `ProgramSession.week` |

`loadFoundation()` in `src/lib/program.ts` already returns everything for the hero, week strip and row 2. Rows 1, 3 and 4 need additional queries.

---

## 6. Responsive

| Breakpoint | Layout |
|---|---|
| ≥ 1080px | Sidebar 244px + top bar. 4 cards per row. |
| 840–1080px | Sidebar persists. 3 cards per row. |
| **< 840px** | **Sidebar → fixed bottom tab bar.** Slim top bar keeps search + avatar. |

The existing `shell.css` stacks the sidebar horizontally at 760px. **Replace that behaviour**, and move the breakpoint to 840px.

**Bottom tab bar:** fixed, four destinations, icon **plus permanent label**, filled icon for the active tab, **minimum 44×44px targets**, safe-area inset at the bottom. Dropping labels on small screens is exactly where familiarity is lost (F-10).

Mobile rows scroll horizontally with the next card peeking. Cards are ~72% viewport width.

---

## 7. Copy — Hungarian, verbatim

Do not translate or reword.

```
Menü · Kezdőlap · Videótár · Haladásom · Kihívások
Keresés edzés, kategória, hossz…
12 NAP
Profil · Beállítások · Segítség · Kijelentkezés
Alexa · segítség

FOUNDATION · 4. HÉT · MAI EDZÉS
Edzés indítása
Mit fogok ma csinálni?
Csatlakozz a programhoz
Előzetes · 1. nap

Folytatod
A Foundation heted
Listám
Ha csak 15 perced van
Szavazz Magadra · a heti kihívás
Összes
Program
Kihívások

MAI EDZÉSED
28 PERC
5 perc van hátra
Megcsináltad · ma 07:40
A pihenőnap nem töri meg a sorozatot.
```

---

## 8. Accessibility

- Nav items: `aria-current="page"` on the active destination.
- Avatar menu: real menu semantics, Escape closes, focus returns to the trigger.
- Cards are `<button>` or `<a>`; the save `+` is a nested button with `aria-pressed` and an `aria-label` (`Mentés a Listámra` / `Eltávolítás a Listámról`) — stop propagation on click.
- Week strip: each day needs an accessible name (`Csütörtök · mai nap · nincs kész`).
- Progress bars: `role="progressbar"` with `aria-valuenow`.
- Search: a real `<form>` with a labelled input, submits on Enter.
- Focus rings visible on every interactive element; the card's ring must not be clipped by `overflow: hidden`.
- Respect `prefers-reduced-motion` on hover scale and row scroll.
- **No text below 14px may carry `opacity` under `.78`.** Use solid `--ink-2` / `--ink-3` instead. Several mono labels here are 10–13px.

---

## 9. Build order

Matches Step 06 of the wireframe. **The first three ship before any visual design and decide whether a first-time user feels lost.**

1. **Un-hide the shell** — add the top bar, move search in, move the avatar top-right, rename Foundation → Kezdőlap, add the Kihívások nav item, delete any collapse control.
2. **Rebuild the card** — `WorkoutCard.tsx` (Variant B) and swap it into Kezdőlap only.
3. **Re-order the rows** — Folytatod, Foundation heted, Listám, short workouts, challenge. Move Journey / Split / Retest / Stats to the programme detail route.
4. **Mobile tab bar** — bottom tabs below 840px, labels kept, 44px targets.
5. **Streak & forgiveness** — flame in the header on every route; a rest day protects the streak instead of breaking it.

---

## 10. Definition of done

- Top bar present on every `/app/*` route with working search, streak and avatar menu
- Four nav destinations, labelled, `Kezdőlap` active on `/app`
- Rows render in the specified order; empty rows hidden, not placeholdered
- Variant B card matches the reference: word-duration badge bottom-right, ribbon on exactly one card, title only, `+` save with visible state, progress bar on resumable items
- Completed workouts are not dimmed
- Bottom tab bar below 840px with labels and 44px targets
- Hungarian copy verbatim
- No sub-14px text with `opacity < .78`
- Reads Firestore at runtime — nothing hardcoded
- No console errors; `npm run build` clean

---

## 11. Open questions — ask, do not decide

1. **Palette** — rose or Eukaliptusz (§0). Blocking.
2. **Week strip position** — above or below the first row. Not settled by research; worth a five-user test.
3. **`/app/challenges`** — route does not exist yet. Confirm the slug and whether it ships in this pass or is a nav item pointing at a stub.
4. **Search behaviour** — does submitting route to `/app/library?q=`, or does the top bar own a results overlay?

Ask before making any decision this file does not cover.
