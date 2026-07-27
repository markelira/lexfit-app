# Gap analysis — Kezdőlap redesign vs. handout

**Scope:** does the produced `/app` (Kezdőlap) implementation correctly realise `README.md` (the handout) and `LEXFIT Dashboard Wireframe.html`?
**Method:** requirement-by-requirement, each verdict backed by the actual source (not comments). Verdicts: ✅ Met · 🟡 Partial · 🔴 Gap · ↔️ Intentional deviation (approved) · ⏸ Unverified.
**Verdict in one line:** structurally faithful — shell, card anatomy, row order, copy and accessibility are essentially 1:1. The misses were a handful of **data-model limitations** and **two fidelity slips**, plus the one **approved** background deviation. No blocking (high-severity) gap.

> **Status (fixes applied):** the audit below records the as-first-built state. All medium items and the low a11y items have since been **closed** — see *"Prioritised gap list — with resolution status"* at the end. Two items remain deferred with reasons (row-5 challenge model; ribbon single-instance) and CheckinWeek awaits a keep/delete decision.

Implementation files audited: `src/app/app/layout.tsx`, `src/components/AppTopBar.tsx`, `src/components/WorkoutCard.tsx`, `src/app/app/page.tsx`, `src/app/app/shell.css`, `src/app/app/home.css`, `src/app/app/challenges/page.tsx`, `src/app/app/program/foundation/page.tsx`, `src/lib/icons.ts`.

---

## Scoreboard

| Section | Met | Partial | Gap | Deviation |
|---|---|---|---|---|
| §1 Change table (9) | 9 | – | – | – |
| §1 KEEP (5) | 4 | – | – | 1 (glass) |
| §2 Shell | ~11 | 2 | – | 1 |
| §3.1 Billboard | 8 | 1 | – | – |
| §3.2 Week strip | 6 | 1 | – | – |
| §3.3 Rows | 3 | 2 | 1 | – |
| §4 Card Variant B | 8 | 1 | 1 | – |
| §6 Responsive | 4 | 2 | – | – |
| §7 Copy | verbatim | 2 minor | 1 (data) | – |
| §8 Accessibility | 9 | 2 | – | – |
| §9 Build order | 5/5 | – | – | – |
| §10 DoD | 9/10 | – | – | ⏸ console |

---

## §1 — The nine changes + KEEP

| # | Requirement | Verdict | Evidence |
|---|---|---|---|
| 1 | Global top bar (logo/search/streak/avatar) | ✅ | `AppTopBar.tsx`; mounted in `layout.tsx` |
| 2 | Search in the shell → `/app/library?q=` | ✅ | `AppTopBar.submitSearch`; library seeds `q` from URL (`library/page.tsx`) |
| 3 | Rename Foundation → Kezdőlap | ✅ | `NAV` in `layout.tsx` |
| 4 | Four destinations incl. Kihívások | ✅ | `NAV` (house/grid/chart/trophy) |
| 5 | Avatar top-right | ✅ | `AppTopBar`; `.lx-prof` removed from sidebar |
| 6 | Streak in header on every route | ✅ | `layout.tsx` fetches `getProgress().streak`, passes to `AppTopBar`; top bar is in the shared shell |
| 7 | Replace card with Variant B | ✅ | new `WorkoutCard.tsx`; `NCard` untouched |
| 8 | Re-order rows | ✅ | `page.tsx` five `HomeRow`s in spec order |
| 9 | Bottom tab bar < 840px | ✅ | `shell.css` `@media (max-width:840px)`; old 760px behaviour deleted |

**KEEP:** Billboard-over-rows ✅ · icon+label every nav ✅ · `Protected`/auth untouched ✅ · Firestore-at-runtime ✅ · **glass sidebar ↔️ removed** (user requested flat wireframe backgrounds — this overrode the KEEP note; see Deviations).

---

## §2 — Shell

- Top bar 58px, `sticky; top:0; z-index:20`, full width ✅ (`shell.css .lxtb`).
- Left: mark + `LEXFIT`, links `/app` ✅; mark is the **exact** auth-page SVG, white on accent tile ✅ (`AppTopBar.LexMark`).
- Centre: search, max-width 420, radius 999, placeholder `Keresés edzés, kategória, hossz…`, submit→`/app/library?q=` ✅.
- Right: streak pill then 34px avatar; menu **Profil · Beállítások · Segítség · Kijelentkezés** ✅.
  - 🟡 **All three of Profil/Beállítások/Segítség route to `/app/profile`** — no dedicated settings/help routes exist, so the items share a destination. Functionally harmless, not literally distinct.
- Sidebar 244px ✅; NAV array matches spec exactly ✅; `.lx-prof` removed, `/app/profile` kept as a route ✅.
- **Alexa · segítség** quiet block pinned bottom ✅ — 🟡 rendered as two lines (`Alexa` / `segítség`), not the literal middot string `Alexa · segítség`.
- No collapse control ✅.
- Icons `house/trophy/user/chevD` added in the 24×24 stroke style ✅ (`icons.ts`). 🟢 `chevD` is added but currently unused.

---

## §3.1 — Billboard (today's workout)

✅ Geometry/art reused · eyebrow (mono, uppercase) · h1 = today's title · chips `[N PERC][KÖZEPES][ESZKÖZ NÉLKÜL]` · CTAs · `Edzés indítása` is the only solid-fill button in the viewport (RULE 05) · primary→`/player/{todayCode}` · secondary opens `NcardModal` · not-joined variant (`LEXFIT · 8 HETES PROGRAM`, `Csatlakozz a programhoz`, `Előzetes · 1. nap`).

- 🟢 **Week-number formula differs from §5.** Handout: `Math.floor(currentIndex / perWeek) + 1`. Implementation reuses the page's existing `Math.ceil(doneCount / perWeek)` (`page.tsx`). Both approximate "current week"; results can differ by one at week boundaries.

---

## §3.2 — Week strip

✅ Row directly under hero · ring + 7 dots (`H K SZE CS P SZO V`) · states done/today/todo/rest(moon `☾`) · ring shows `doneThisWeek/perWeek` · Apple-Fitness model reused · rest-day line **"A pihenőnap nem töri meg a sorozatot."**

- 🟢 The ring itself is `aria-hidden` (decorative) with the count exposed via the group's `aria-label`; §8's "progress bars need `role="progressbar"`" is satisfied on the card bars but not on the ring. Low impact.

---

## §3.3 — Rows

✅ Exact order and verbatim headings + right-links (`Összes`/`Program`/`Kihívások`) · empty rows hidden (`HomeRow` returns null).

- 🟡 **"4 cards per row, 4th partly cut."** `home.css .hrow > .wc { flex: 0 0 clamp(220px, 26.5%, 288px) }` yields roughly **3.5–3.7 cards visible with the 4th peeking** — the intent (peek to signal scroll) is met, but it is not pinned to the literal §6 counts (exactly 4 at ≥1080, exactly 3 at 840–1080).
- 🟡 **Row 1 "Folytatod … most recent first."** Ordered by `Object.keys(resumeMap).reverse()` (`page.tsx`) — a heuristic, **not true recency**, because `Progress.resume` is a `code→seconds` map with no per-entry timestamp (`types.ts`). Correct recency would need a schema addition.
- 🔴 **Row 5 challenge cards.** The wireframe renders challenge cards with a **day-count badge (`7 NAP`/`14 NAP`)** and a **participant line (`324-en csinálják`)**. The implementation maps `libVideos.filter(kind==="bonus")` through the generic `WorkoutCard`, so they render as ordinary workout cards (`N PERC`, no participant count). Neither day-count-as-badge nor participant counts exist in the data model; the Kihívások screen is a stub this pass, so this row is an **approximation**.

---

## §3.4 — Removals / moves

- 🟡 **Journey / ProgSplit / ProgRetest / Stats "move to a detail route."** These components **do not exist** as mounted components — the page had already been rebuilt without them, so the handout's "current state" column was written against an older page. A fresh `/app/program/foundation` detail page was built instead (facts + phases + weeks). Net effect matches intent (programme content lives off Kezdőlap, reachable from row 2's `Program ›`), but it is not a literal 1:1 relocation.
- ↔️ **CheckinWeek and the previous 8 content rails were removed** from Kezdőlap. The handout specifies an exact 5-row set and says nothing about CheckinWeek; removing them honours the spec's ordering, but it **is a functional removal** worth an explicit sign-off (the weekly check-in prompt no longer appears on the home route).

---

## §4 — Card, Variant B

| # | Element | Verdict | Note |
|---|---|---|---|
| 1 | Duration badge, bottom-right, **words** `N PERC` | ✅ | `wc-dur` |
| 2 | Play affordance centred on hover; whole card is the click target | ✅ | full-card `wc-cover` `<button>`; play icon `pointer-events:none` |
| 3 | `MAI EDZÉSED` ribbon, top-left, **exactly one per day** | 🟡 | shown wherever `code === todayCode`; the same today-workout can appear ribboned in >1 row (the wireframe itself shows it in rows 1 and 2, so this is defensible, but "exactly one card" is not literally enforced) |
| 4 | Avatar ring **encodes the user's Foundation week** | 🔴 | ring is **binary** (`isProgram \|\| done`) — it does **not** encode the week number, only in-programme vs not |
| 5 | Title only; second line only for state | ✅ | `wc-state` rendered only for resume/completed |
| 6 | Progress bar 4px accent bottom edge; save `+ → ✓` | ✅ | `wc-prog`, `wc-save` with `aria-pressed` |
| — | Completed **not dimmed** | ✅ | no opacity applied to completed; check + timestamp added |
| — | No metadata behind hover | ✅ | all text always visible; only the play glyph is hover-revealed |
| — | `thumb` load-bearing; fallback `cardGrad` at 16:9, **not** the typographic cover | ✅ | `thumbStyle` |
| — | New component; don't edit `NCard` | ✅ | `NCard` unchanged |

---

## §5 — Data mapping

✅ hero title/mins/level/format from `Video` · ribbon `code===todayCode` · week-strip states from `ProgramSession.day` + `dayState(order,joined,doneCount,currentIndex)` · streak from `Progress.streak` · Folytatod from `resume` · card progress `resume/(muxDuration ?? mins*60)` · Listám `getMyList` · save `setSaved`.
Deviations already listed: eyebrow week formula (§3.1, 🟢) and avatar ring week (§4 #4, 🔴).

---

## §6 — Responsive

- ↔️/✅ Tab-bar breakpoint moved to 840px; old 760px stack replaced ✅.
- 🟡 Exact per-row card counts (4 / 3) are approximate (see §3.3).
- ✅ Bottom tab bar: fixed, 4 destinations, icon **+ permanent label**, ≥44px targets, safe-area inset. 🟢 "Filled icon for the active tab" is realised as a **filled accent tile behind the stroke icon**, not a filled glyph.
- ✅ Mobile rows ~72% width, next card peeks (`@media (max-width:840px){ .wc flex-basis:72% }`).

---

## §7 — Copy (Hungarian, verbatim)

All strings reproduced exactly — `Menü`, the four nav labels, the search placeholder, the avatar-menu items, the eyebrow, `Edzés indítása`, `Mit fogok ma csinálni?`, `Csatlakozz a programhoz`, `Előzetes · 1. nap`, all five row headings, `Összes`/`Program`/`Kihívások`, `MAI EDZÉSED`, `N PERC`, `5 perc van hátra`, `A pihenőnap nem töri meg a sorozatot.` — **except:**

- 🔴 **`Megcsináltad · ma 07:40`** → renders **`Megcsináltad · ma`** (or a date). `Progress.completed[].at` stores a **date only** (`markComplete` in `progress.ts` writes `YYYY-MM-DD`), so there is no `HH:MM` to show. Data-model limitation.
- 🟢 `Alexa · segítség` rendered as two lines rather than the literal middot string.
- ✅ `12 NAP` implemented as the live `{streak} NAP`.

---

## §8 — Accessibility

✅ `aria-current="page"` on active nav (sidebar **and** tab bar) · avatar menu `role="menu"`/`menuitem`, Escape closes + returns focus to trigger, outside-click closes · cards are `<button>`, save is a separate `<button>` with `aria-pressed` + `aria-label` + `stopPropagation` · week-strip days have accessible names (`{Nap} · {állapot}`) · progress bars `role="progressbar"` with `aria-valuenow` · search is a real labelled `<form>` submitting on Enter · card focus ring on `wc-cover`, `.hrow` padding widened so it isn't clipped · **no sub-14px text carries `opacity < .78`** — every small mono/label uses solid `--ink-2`/`--ink-3`/`#fff`.

- 🟢 The week-strip **ring** is decorative (`aria-hidden`) rather than a `progressbar`.
- 🟢 `prefers-reduced-motion` guards the card hover scale; the pre-existing `.fade-in` page-mount animation is not guarded.

---

## §9 — Build order — 5/5 shipped
Un-hide shell ✅ · rebuild card ✅ · re-order rows ✅ · mobile tab bar ✅ · streak in header + rest-day forgiveness message ✅.

## §10 — Definition of done
All met **except** ⏸ **"No console errors"** — not verified in a browser (the `/app` shell is behind `Protected`; content lives only in the emulator, so it needs a real Google sign-in). `npx tsc --noEmit` and `npm run build` are clean.

## §11 — Open questions — all four answered and applied
Palette = Eukaliptusz green (and the repo tokens were already green — README §0 described a stale rose state) · week strip below the billboard · Kihívások = new stub route · search → `/app/library?q=`.

---

## Prioritised gap list — with resolution status (fixes applied this pass)

**High (blocking):** none.

**Medium — RESOLVED this pass:**
1. ✅ **Avatar ring now encodes the Foundation week.** `WorkoutCard` takes `programWeek`/`programWeeks` and draws a conic ring filling `week / totalWeeks`; plain outside the programme (`WorkoutCard.tsx`, `home.css .wc-ava.ring`). — §4 #4.
2. ✅ **Completion line shows `HH:MM`.** `markComplete` now records a local `atTime` (`progress.ts`); the card renders `Megcsináltad · ma 07:40` when the time is present (`completedTime` prop). Older date-only entries still render `Megcsináltad · ma`. — §7.
3. ✅ **Week number uses the handout formula** `Math.floor(currentIndex / perWeek) + 1` for the eyebrow **and** the week strip (`page.tsx`). — §5.
4. ✅ **`Folytatod` is now truly most-recent-first.** `saveResume` writes a `resumeAt` epoch stamp; the row sorts by it descending (`progress.ts`, `page.tsx`). Pre-existing resume entries without a stamp sort last. — §3.3.
5. ✅ **Streak flame is warm** (`#b4652a`) on a neutral pill, matching the wireframe's `--warn` (`shell.css .lxtb-streak`). — wireframe.

**Low — RESOLVED this pass:**
- ✅ Week-strip ring now has `role="progressbar"` + `aria-valuenow/min/max` (`page.tsx`). — §8.
- ✅ `prefers-reduced-motion` now also disables the avatar-menu slide-in and the page `.fade-in` (`shell.css`, `home.css`). — §8.
- ✅ **Bug fix (from the independent review):** a joined user with no resolvable `todayCode` no longer falls through to the *join* CTA — the billboard shows the workout branch with a title fallback (`page.tsx`).

**Still open / deferred (with reason):**
- 🔴 **Row 5 challenge cards** remain generic workout cards. Deferred: the wireframe's day-count badge (`7 NAP`) and participant line (`324-en csinálják`) have **no fields in the data model**, and the Kihívások screen is a stub this pass (§11.3). Closing this needs the challenge data model — a later task.
- 🟡 **`MAI EDZÉSED` ribbon** can still appear on the same today-workout in more than one row. Left as-is: the wireframe itself shows it in rows 1 **and** 2, so "exactly one *workout* per day" is enforced (`code === todayCode`) even though "exactly one *card*" is not. Flag if a single instance is required.
- 🟡 **CheckinWeek** is now orphaned (unimported dead code, not deleted). Decision needed: reinstate the weekly check-in on the home route, or delete the component.
- 🟢 Cosmetic, left as-is: `Alexa · segítség` renders on two lines; Profil/Beállítások/Segítség share `/app/profile` (no settings/help route exists); `chevD` added but unused.

**Approved deviations:** flat wireframe backgrounds (glass sidebar removed) · CheckinWeek + old 8 rails removed to match the spec's exact row set.

**Unverified:** live render / console-error check (needs emulator + Google login). `npx tsc --noEmit` and `npm run build` are clean after the fixes.
