# Dev Plan — Per-exercise timestamps (Gyakorlat szintű időbélyegek)

**Status:** planned · **Author:** research + plan by Claude Code · **Date:** 2026-07-18

## 1. Problem

The content hierarchy is **Blokk → Blokk neve → Gyakorlat** (Block → Block name →
Exercise). Today a timestamp exists **only at the block level** (`VideoBlock.start`,
seconds). Exercises are plain strings inside `VideoBlock.items: string[]` with no time
data. So the player can seek to a block boundary and shows the block's exercise list, but
it cannot track *which* exercise is playing, cannot seek to an exercise, and always shows
`items[0]` as the "current" move.

**Goal:** let admins optionally stamp each exercise with a start time, and surface those
stamps in the player (highlight the active exercise, click-to-seek, countdown to next,
desktop-only tick marks on the timeline).

## 2. Confirmed product decisions

| Decision | Choice |
|---|---|
| Admin input | **Structured rows** — each exercise = name field + `m:ss` time field + add/remove |
| Stamping requirement | **Fully optional** — any mix; unstamped exercises render as plain items (today's behavior) |
| Player features | Highlight active exercise · click-to-seek · countdown to next · **tick marks (desktop only)** |
| Time basis | **Absolute seconds** into the video; `VideoBlock.start` stays a separately-authored field |
| Legacy data | **Support both shapes** — an exercise is `string` OR `{ name, start? }`; no migration |

### Implementation-level defaults (decided, low-stakes)
- **Type:** `items: VideoExerciseItem[]` where `VideoExerciseItem = string | VideoExercise`
  and `VideoExercise = { name: string; start?: number }`. A `normalizeItem()` helper
  collapses both to `{ name, start? }` at every read site so downstream code sees one shape.
- **"Current exercise" rule:** within the active block, the current exercise = the *last*
  exercise whose `start <= currentTime`. If no exercise in the block is stamped (or none has
  started yet), fall back to today's behavior (`items[0]`).
- **Validation:** non-blocking. The admin form shows a soft warning if an exercise time is
  outside its block's `[start, nextBlockStart)` range or not ascending, but never blocks save
  (stamping is optional by design). The API sanitizer clamps/keeps values but does not reject.
- **Row order:** exercises stay in author-defined row order (matches how `items` order already
  drives "next"). No auto-sort; a small ▲/▼ reorder affordance is optional polish, not required.

## 3. The four layers to change

```
types.ts  ──►  VideoForm.tsx (admin UI)  ──►  api/admin/videos/[code] (sanitizer)  ──►  player/[code]/page.tsx (render + seek)
   (1)                    (2)                             (3)                                        (4)
```
Plus a shared normalizer helper and the emulator seed for manual testing.

---

### Layer 1 — Data model (`src/lib/types.ts`)

Add the exercise type and widen `items`. Keep backward-compatible union.

```ts
/** One exercise (Gyakorlat) inside a block. */
export interface VideoExercise {
  name: string;
  start?: number;      // seconds into the video where this exercise begins (optional; absolute, same basis as block.start)
}

/** An exercise may be a bare name (legacy) or a stamped object. */
export type VideoExerciseItem = string | VideoExercise;

/** One block of a session (warm-up, circuit, cool-down). */
export interface VideoBlock {
  name: string;
  mins: number;
  items: VideoExerciseItem[];   // was string[]; strings still valid (legacy / unstamped)
  start?: number;
}
```

Add a normalizer (new `src/lib/blocks.ts`, or extend `src/lib/time.ts`):

```ts
export function normalizeExercise(it: VideoExerciseItem): VideoExercise {
  return typeof it === "string" ? { name: it } : it;
}
export function exerciseName(it: VideoExerciseItem): string {
  return typeof it === "string" ? it : it.name;
}
```

> **Why a union, not a migration:** prod Firestore is empty; only the F023 emulator mock has
> string items. A union keeps every existing read (`b.items.map(...)`, `items[0]`, `items.join`)
> working during the transition and future-proofs any hand-written data.

---

### Layer 2 — Admin authoring UI (`src/components/admin/VideoForm.tsx`)

Currently each block renders a single `<textarea>` (newline = exercise). Replace the exercise
textarea with a **structured row editor**, mirroring the existing block-row pattern
(name + `m:ss` + delete + add-row).

**Draft state change** (`BlockDraft`, currently lines 13–18):
```ts
interface ExerciseDraft { name: string; startText: string; } // startText = typed "m:ss"
interface BlockDraft {
  name: string;
  startText: string;
  items: ExerciseDraft[];   // was string[]
}
```

**Load existing** (currently lines 66–70): map each `items` entry through
`normalizeExercise`, then `startText = secToClock(ex.start)` (empty string when unset),
`name = ex.name`. Works for both string and object legacy items.

**UI per exercise row** (replaces the textarea, currently lines 295–299):
- text input for `name` (placeholder e.g. `"Guggolás"`)
- small text input for `startText` (class `mins`, placeholder `"0:00"`, title "Kezdés (perc:mp)")
  — reuse the exact styling of the block start input for visual consistency
- ✕ remove-row button
- a "+ Gyakorlat hozzáadása" button under the list

Add helpers alongside `addBlock/setBlock/removeBlock`: `addItem(bi)`, `setItem(bi, ii, patch)`,
`removeItem(bi, ii)`.

**Soft validation (display-only):** for each stamped exercise, if `clockToSec(startText)` is
outside the block's `[blockStart, nextBlockStart)` window or breaks ascending order within the
block, show a subtle inline warning (reuse the existing computed-duration span styling). Never
disables Save.

**Save serialization** (currently lines 143–146): map items to the object shape, only
attaching `start` when parseable, and drop empty-name rows:
```ts
items: b.items
  .map((ex) => {
    const s = clockToSec(ex.startText);
    const name = ex.name.trim();
    return { name, ...(s != null ? { start: s } : {}) };
  })
  .filter((ex) => ex.name.length > 0),
```

> **Hint text update:** the block-level help text (currently lines 280–285) should mention that
> each exercise can *optionally* get its own start time, and that leaving it blank keeps the
> exercise as a non-seekable list item.

---

### Layer 3 — API sanitizer (`src/app/api/admin/videos/[code]/route.ts`)

`buildBlocks` (currently lines 39–64) maps `items` to trimmed strings. Update `CleanBlock`
(lines 26–31) and the mapping so items are sanitized objects:

```ts
interface CleanExercise { name: string; start?: number; }
// ...
items: Array.isArray(bl.items)
  ? bl.items
      .map((raw: unknown) => {
        const ex = typeof raw === "string" ? { name: raw } : (raw ?? {});
        const name = String((ex as any).name ?? "").trim();
        const s = Number((ex as any).start);
        const start = Number.isFinite(s) && s >= 0
          ? (dur ? Math.min(s, dur) : s)   // clamp to duration when known, mirrors block.start handling
          : undefined;
        return { name, ...(start != null ? { start } : {}) };
      })
      .filter((ex) => ex.name.length > 0)
  : [],
```

Notes:
- Accepts both legacy strings and objects on input (defensive; the new form always sends
  objects).
- **Block-level `start` logic is unchanged** (decision: block.start independent). The
  "every block has `start` → derive block `mins`" pipeline stays exactly as-is.
- No hard rejection of out-of-range exercise times — clamp to `dur` like block start, keep
  otherwise. (Stamping is optional; strictness lives only in the admin soft-warning.)

---

### Layer 4 — Player (`src/app/player/[code]/page.tsx` + `player.css`)

All four player features derive from a per-block list of normalized exercises with absolute
`start`. Add a memo that computes, for the active block, the exercise bounds (same
start→next-start→blockEnd pattern already used for blocks).

**4a. Active-exercise + "now" panel** (currently shows `blocks[active].items[0]`, lines 271–272):
- Normalize the active block's items. Compute `activeEx = last index where start <= cur`
  (using only stamped items; unstamped items are skipped for "current" detection).
- If an active exercise is found, show its `name` as the current move (replacing the hardcoded
  `items[0]`); otherwise keep `items[0]` fallback.

**4b. Countdown to next exercise** (new, alongside the existing block countdown `blockLeft`,
lines ~113):
- `nextExStart` = the smallest stamped exercise start `> cur` within the active block (or the
  block end if none). `exLeft = Math.max(0, Math.ceil(nextExStart - cur))`, rendered with the
  existing `fmt()` helper. Only shown when the block actually has stamped exercises.

**4c. Click-to-seek in the schedule list** (currently a static `<ul>` of `b.items`, lines
365–390): render each exercise as a button when it has a `start`:
```tsx
{normItems.map((ex, k) => ex.start != null ? (
  <li key={k}>
    <button className={`exseek${k === activeEx ? " on" : ""}`}
      onClick={() => { const el = playerRef.current; if (el && dur) el.currentTime = ex.start!; }}>
      <span className="t">{secToClock(ex.start)}</span> {ex.name}
    </button>
  </li>
) : (
  <li key={k}><span className="bul">·</span>{ex.name}</li>   // unstamped: plain, non-clickable
))}
```
Highlight the active exercise row (`.on`). This reuses the block-seek mechanism
(`el.currentTime = …`) that already exists at lines 341–352.

**4d. Timeline tick marks — desktop only** (timeline block buttons, currently lines 341–352):
Inside each block segment `<button className="tl">`, render an absolutely-positioned notch per
stamped exercise at `left: ((ex.start - blockStartSec) / blockDurationSec) * 100%`.
- Guard with a `useIsDesktop()` check (matchMedia `min-width` breakpoint) OR pure CSS
  (`@media (min-width: …) { .tl .extick { display:block } }` + `display:none` default) — CSS is
  simpler and SSR-safe, prefer it.
- Ticks are `pointer-events: none` decorative marks; the click target stays the whole block
  segment (exercise seeking lives in the schedule list per 4c).

**CSS additions (`player.css`):**
- `.exseek` — button reset matching the schedule `<li>` look; `.exseek.on` highlight (reuse the
  accent `#e5719b`); `.exseek .t` monospace time chip.
- `.extick` — 1px tall notch inside `.tl .bar`, hidden below the desktop breakpoint.

> **Fallback safety:** every new feature is gated on a stamped exercise existing. A video with
> zero exercise stamps (all of prod today, F023) renders **exactly as it does now** — no
> regression. The block-level "stamped" seek behavior is untouched.

---

## 4. Files touched

| File | Change |
|---|---|
| `src/lib/types.ts` | Add `VideoExercise`, `VideoExerciseItem`; widen `VideoBlock.items` |
| `src/lib/blocks.ts` (new) or `src/lib/time.ts` | `normalizeExercise` / `exerciseName` helpers |
| `src/components/admin/VideoForm.tsx` | Exercise textarea → structured row editor; draft state; load/save mapping; soft validation; hint text |
| `src/app/api/admin/videos/[code]/route.ts` | `buildBlocks` items sanitize → objects with optional `start` |
| `src/app/player/[code]/page.tsx` | Active-exercise memo; now-panel active exercise; exercise countdown; click-to-seek list; desktop tick marks |
| `src/app/player/[code]/player.css` | `.exseek`, `.exseek.on`, `.extick` (desktop-only) styles |
| `src/components/NcardModal.tsx` | Audit only — its `blocksOf` uses `name`+`mins`, ignores `items`; likely no change, verify it doesn't `.join` items assuming strings |
| `seed/source/lexfit-data.jsx` (optional) | Add `start` to a couple of F023 exercises for manual QA in the emulator |

## 5. Backward-compatibility & read-site audit

Any code that reads `block.items` must tolerate both `string` and `{name,start?}`. Grep for
`.items` across the repo and route each through `exerciseName`/`normalizeExercise`:
- Player now-panel (`items[0]`) and schedule `<ul>` — updated in Layer 4.
- `NcardModal.tsx` — verify (it renders `name`+`mins` blocks; check it never renders `items`).
- Any `items.join("\n")` (admin load) — replaced by the row mapper.

## 6. Testing plan

1. **Emulator author round-trip:** `npm run dev:local`, sign in as owner, `/admin`, open F023,
   add exercise times to one block, save. Confirm Firestore (emulator) doc shows
   `items: [{name, start}, …]`.
2. **Legacy read:** confirm a block whose `items` are still plain strings renders unchanged in
   both admin (loads as unstamped rows) and player (plain list).
3. **Player active-exercise:** play a stamped video; verify the "now" name changes as each
   exercise start passes, the countdown ticks toward the next exercise, and the active row
   highlights in the schedule.
4. **Click-to-seek:** click a stamped exercise → video jumps to its second; unstamped rows are
   not clickable.
5. **Tick marks:** visible on desktop width, hidden on mobile width; positioned within the
   correct block segment.
6. **No-stamp regression:** a video with zero exercise stamps looks/behaves identically to
   before.
7. **Mixed/partial:** a block with some stamped + some unstamped exercises — stamped ones
   seek/highlight, unstamped ones stay plain.
8. `npm run build` / typecheck clean (union type touches several read sites).

## 7. Scope guardrails (explicitly out)

- No reps/sets/duration-per-exercise metadata — timestamps only.
- No native Mux chapters/cuePoints API — the bespoke overlay stays.
- No changes to block-level stamping, `mins` derivation, signed playback, or program/session model.
- No data migration; the union type carries legacy strings indefinitely.
