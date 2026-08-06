# 20 · Videótár

**Screen spec — `/app/library`.** Shell and search live in `01-SHELL.md`; all numeric values, states and accessibility in `00-FOUNDATIONS.md`. This file covers only what is unique to the library.

This route is **further along than the rest of the app.** Read §20.1 before changing anything — several decisions in `src/app/app/library/page.tsx` are already exactly right and must survive.

---

## 20.1 Already correct — protect it

| What | Where | Why it stays |
|---|---|---|
| **The two-mode switch** | `const resultsMode = searching \|\| activeCount > 0` | This is the whole architecture of the page and it is **already implemented**. Any query or any active filter → results; clearing everything → browse. No toggle, nothing to learn. Do not refactor it. |
| **Count before grid** | `{results.length} találat` | Cheapest possible orientation. |
| **Active filters restated with ✕** | `lib-resmeta` | Users must never wonder why a workout they know exists is missing. |
| **`Törlés mind`** | `clearAll()` | Keep, including clearing the query. |
| **Empty rails hidden** | `rails.filter(r => r.v.length > 0)` | Correct — never placeholder a row. |
| **Rail arrows with disabled ends** | `NxRail` · `atStart` / `atEnd` | Netflix behaviour, correctly done. |
| **`Mind (n)` per rail** | `RAIL_FILTER` → `browseFrom()` | A row heading link that applies the equivalent filter. Genuinely good. |

---

## 20.2 The four changes

### C1 · Filters become visible chips

**The main finding.** Filters currently live behind a `Szűrők` toggle that reveals `lib-refinepanel` — a hidden panel of checkbox lists.

NN/g measured hidden desktop navigation at 27% usage vs 48% visible, with ≥39% slower tasks. **The same penalty applies to filters**, and filters are the most-used control on a library page.

Replace with **combo navigation** — partly visible, partly hidden, which measured close to fully visible:

- **Four dimensions permanently on the bar as chips:** `HOSSZ` · `TESTRÉSZ` · `INTENZITÁS` · `ESZKÖZ`. These are the four facts that decide whether a workout is possible right now — the same four the card carries.
- Everything rarer stays behind **one labelled `Szűrők` button** with a count badge. The existing `lib-refinepanel` is fine as that overflow; it just stops being the primary route.
- Opening a chip shows its options **directly beneath the chip**, not in a side panel.
- **An active chip shows its value, not its name** — `10–20 PERC`, never `Hossz (1)`. Information scent: nobody should open a control to see what it is doing.
- Sort sits alone at the right: `LEGNÉPSZERŰBB` default, `LEGRÖVIDEBB`, `LEGÚJABB`.

Chips are 34px desktop, 44px on touch (`02-BUTTONS.md`).

### C2 · Search moves to the shell

`lib-search` in the page's `lib-bar` moves into the global top bar (`01-SHELL.md §1.2`). The page reads `?q=` from the URL.

**Keep the URL meaningful** — `/app/library?q=has&theme=has` — so results are linkable and analytics can distinguish states. The current implementation holds `q` in local state only.

### C3 · Row budget: 14 → 4, plus category tiles

`rails` currently defines **fourteen** rows. That is longer than the archive is deep, and it pushes everything below the fold.

**Browse mode becomes:**

1. **Kategóriák** — six tiles, counts visible, colour band per `--cat-*`. **The only element on the page that navigates rather than plays.** Currently missing entirely.
2. **`A te fázisod`** — keep, it is personal and earns the top slot.
3. **`15 perc, ami belefér`** — keep, lowest-commitment row.
4. **`Csendben is megy`** — keep, the most distinctive thing the library offers.

Everything else the fourteen rows expressed is reachable through the category tiles and the filter chips. **Keep the `rails` array and `RAIL_FILTER` map** — they become the source for the category tiles and for an editorial row that can be rotated later.

### C4 · The empty state names the culprit

Current copy is generic:
> „Ilyen kombináció még nincs. Vegyél ki egy szűrőt."

That makes the user redo the work. State **which** filter is responsible and offer the exact result of removing it:

> **„Ehhez a hármashoz még nincs edzés."**
> „A »nehéz« szűrő nélkül **7 hát-edzés** van 10 perc alatt. Alexa szerint egy rövid hát-gyakorlat úgyis inkább könnyű legyen."
> `[A 7 edzés megnézése]` `[Összes szűrő törlése]`

Compute it by re-running `filterVideos` with each active filter dropped in turn and reporting the largest recovery. Pattern is global — `00-FOUNDATIONS.md §0.9`.

---

## 20.3 Category page — a filter, not a template

Clicking a category tile does **not** open a different template. It applies one filter, adds a banner, and stays in results mode.

- Breadcrumb `‹ Videótár` top-left.
- Banner: category name, one line of description, count. Colour band ties it to the tile that was clicked.
- The category chip is **present and removable** on the filter bar, so the user can widen without going back.
- Same grid, same rules.

**Do not add editorial rows inside a category page.** That would recreate browse mode inside results mode and break the one rule the page has.

Route: `/app/library/[theme]` — or keep it as `?theme=` on the existing route if that is simpler. Either is fine; **ask which you prefer before building.**

---

## 20.4 The card

Results and rows both use **`WorkoutCard`** (Variant B — see `10-KEZDOLAP.md §4`), not `NCard`.

`NCard` stays in the codebase during the migration because `NcardModal` uses it as a pool renderer. Once both routes are migrated, `NCard` and its `browse` prop can be deleted.

Completed workouts keep full opacity and gain a check plus `Megcsináltad · kedden`. **Never dimmed.**

---

## 20.5 Mobile

Full behaviour in `11-MOBILE.md §11.3`. In summary: browse rows with peek, **one-column results list**, filter chips as a horizontally scrolling strip that does **not** collapse, and a bottom sheet whose confirm button reads `24 találat megnézése`, counting live.

---

## 20.6 What we are deliberately not doing

- **A left filter sidebar.** Standard in e-commerce, foreign in video. Netflix, YouTube and Spotify all use a top bar, and it would collide with the nav rail.
- **Infinite scroll without a count.** Users need to know the size of what they are in.
- **Rows inside a category page.** Breaks the one rule the page has.
- **Dimming completed workouts.**
- **A separate search page.** Search lives in the shell; results render here.
- **Auto-advancing the spotlight.** `LibSpotlight` currently rotates every 7s. Carousels that move on their own are a known usability problem — users lose their place and cannot re-find an item. **Keep the dots, drop the `setInterval`.**

---

## 20.7 Definition of done

- Four filter dimensions visible as chips; `Szűrők` holds the rest with a count
- An active chip displays its value, not its dimension name
- Search reads from the shell via `?q=`; URL reflects filter state
- Browse mode: category tiles plus at most three rows
- Results mode: count, restated filters, uniform grid, `WorkoutCard`
- Empty state names the responsible filter and offers the recovered count
- Category tiles route to a filtered results view with a removable chip
- Spotlight does not auto-advance
- `resultsMode` switch unchanged
- Hungarian copy verbatim

---

## 20.8 Open questions

1. **The fourth chip.** `ESZKÖZ` or `TÍPUS` (EMOM, HIIT, tabata)? The first three are settled; the fourth is contested. A five-user question.
2. **Category route shape** — `/app/library/[theme]` or `?theme=`.
3. **Emoji in filter values.** `filters/type` options are stored as `🔇 Csendes`, `🌅 Reggeli`. That is data, not presentation, and it makes the values hard to sort, search and localise. Worth migrating to a `{ key, label, icon }` shape — but it touches the Phase 7 admin, so **ask before doing it**.
