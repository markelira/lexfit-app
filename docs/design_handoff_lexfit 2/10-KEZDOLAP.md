# 10 · Kezdőlap

**Screen spec — desktop `/app`.** The shell is in `01-SHELL.md`; all numeric values, states and accessibility are in `00-FOUNDATIONS.md`. This file covers only what is unique to the home screen.

This is a **redesign of a working route.** `src/app/app/page.tsx` already renders a Foundation programme page. Keep the billboard-over-rows chassis; change the row order and the card.

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
