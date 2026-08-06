# 11 · Mobile

**Screen spec.** Numeric values are in `00-FOUNDATIONS.md`; the tab bar, thumb zone, sheets and rows are in `01-SHELL.md`. This file covers only what is unique to the phone.

Mobile is the majority surface. Everything here assumes a person holding a phone in one hand, often already on a mat.

---

## 11.1 What changes from desktop

| | Desktop | Mobile |
|---|---|---|
| Navigation | 244px rail | Fixed bottom tab bar |
| Top bar | 58px, search centred | 48px, mark + search + avatar |
| Rows | 4 cards | ~1.4 cards, peek required |
| Results | 4-col grid | **1-col list** — 104px thumb, title, state |
| Filters | Chip row + dropdown | Scrolling chip strip + bottom sheet |
| Menus | Dropdown | Bottom sheet |
| Buttons | 40px, auto width | 48px, full width, bottom-anchored |

Everything promotes to the 44px floor automatically via the tokens in `00`. **Do not write per-component mobile variants.**

---

## 11.2 Kezdőlap

Same vertical order as desktop (`10-KEZDOLAP.md`), one column.

1. **Hero** — today's workout. Full-bleed 16:9 artwork, eyebrow, title, chips, one full-width primary `Edzés indítása` in the thumb zone.
2. **Week strip** — seven day dots plus the ring. Dots 22px, whole strip one row.
3. **Rows** — `Folytatod`, `A Foundation heted`, `Listám`, `Ha csak 15 perced van`, `Szavazz Magadra · a heti kihívás`.

The hero is the only place the filled button appears on this screen.

---

## 11.3 Videótár

**Two modes, one switch — identical logic to desktop.** Any query text or any active filter switches to results; clearing everything returns to browse. No toggle, nothing to learn.

**Browse:** category tiles 2-up, then rows.

**Results: one column.** Full-width list rows — 104px 16:9 thumbnail, title, state line. Legibility beats density once intent exists.

**Filter strip:** horizontally scrolling chips at 44px. **They scroll, they do not collapse** — hiding them behind one icon repeats the hamburger mistake at component scale.

**Filter sheet:** opens from a chip. Sections of pill options, and the confirm button reads `24 találat megnézése`, counting live. See `01-SHELL.md §1.5`.

---

## 11.4 Player

The one screen where the user is 2–3 metres away, mid-movement, reading in glances.

- **Exercise name and countdown dominate.** They are content, not chrome, and never fade.
- Transport controls may fade after a few seconds of no input; the two numbers do not.
- Exit is labelled, top-left, never hover-only, and reachable with the back gesture.
- Rest is full-bleed with one enormous number.
- Pause states where you are, what is next, and **that leaving does not lose progress**.
- Completion: check, what you did, streak contribution, three-option effort rating.

**A finished workout is never dimmed.** YouTube greys out watched videos — correct for consumption, actively demotivating for achievement.

---

## 11.5 Mobile-only rules

**M-RULE 01 · The tab bar never disappears.** Not on scroll, not in a sheet, not on the completion screen. The only exception is the fullscreen player.

**M-RULE 02 · One primary action per screen, full width, bottom-anchored.** In the thumb zone, 48px, never side by side with another primary.

**M-RULE 03 · Rows peek.** The next card is always partly visible. A row that ends flush at the edge looks like it has no more content.

**M-RULE 04 · Sheets, not screens, for anything the user might abandon.** A half-written sentence or a half-set filter survives a mis-tap. Full-screen composers lose text and confidence in equal measure.

**M-RULE 05 · Nothing essential behind hover or long-press.** There is no hover on touch, and long-press is undiscoverable.

**M-RULE 06 · Safe areas respected.** `env(safe-area-inset-bottom)` on the tab bar and on any bottom-anchored button.

---

## 11.6 What we are deliberately not doing

- **A hamburger menu.** Four destinations fit in a tab bar; NN/g recommends showing up to four and hiding only beyond that.
- **Dropping tab labels on small screens.** Exactly where familiarity is lost.
- **Collapsing the filter chips behind one icon.** The hamburger mistake, one level down.
- **Auto-applying filters as the sheet is edited.** The count updates live; the results change on confirm, so the page never moves under the thumb.
- **A separate mobile search screen.** Search lives in the shell; results render in Videótár.
- **Music controls in the player.** The phone and the OS already own audio.

---

## 11.7 Definition of done — mobile

- Bottom tab bar below 840px, four labelled destinations, 44px targets, safe-area inset
- Every interactive element ≥44px; the card save `+` has a 44px target at 26px appearance
- Rows peek; empty rows hidden
- Results are one column; filter chips scroll and do not collapse
- Filter sheet reports the count live and applies on confirm
- Player: exercise name and countdown never fade; exit always visible
- All four universal screen states implemented (`00 §0.9`)
- No hover-dependent content anywhere
- Hungarian copy verbatim

---

## 11.8 Open questions

1. **Week strip position** — above or below the first row. Not settled by research; a five-user question.
2. **`/app/challenges`** — route does not exist. Stub or full screen in this pass?
3. **Player rest state** — does the video keep playing (Alexa demonstrating the next move) or is it replaced by the countdown field? Changes how footage is shot.
