# 01 · Shell

**Global. Applies to every `/app/*` route.** Numeric values come from `00-FOUNDATIONS.md`.

The shell is the only thing on screen at every moment, so it carries four answers: *where am I, where else can I go, how do I search, who am I.* The current build hides two of them.

---

## 1.1 Four destinations, one label each

```ts
const NAV = [
  ["/app",            "house",  "Kezdőlap"],   // was "flame" / "Foundation"
  ["/app/library",    "grid",   "Videótár"],
  ["/app/progress",   "chart",  "Haladásom"],
  ["/app/challenges", "trophy", "Kihívások"],  // new route
];
```

**`Kezdőlap`, not `Foundation`.** Foundation is a programme living inside the home screen — a product, not a place. Destinations are named in the user's words.

**Icon plus a permanently visible label. Never icon-only, at any breakpoint.** No collapse control — the rail is permanent.

---

## 1.2 Desktop — top bar + rail

```
┌──────────────────────────────────────────────────────────┐
│ [mark] LEXFIT │  [🔍 Keresés…]        │ [🔥 12 NAP] [av] │  58px, sticky
├───────────────┼──────────────────────────────────────────┤
│ Menü          │                                          │
│ ● Kezdőlap    │                                          │
│   Videótár    │              route content               │
│   Haladásom   │                                          │
│   Kihívások   │                                          │
│               │                                          │
│ Alexa · segítség                                         │
└───────────────┴──────────────────────────────────────────┘
```

**Top bar** — new element. Height 58px, `position: sticky; top: 0; z-index: 20`, full width above the sidebar.

| Slot | Content | Behaviour |
|---|---|---|
| Left | Az Ív mark + `LEXFIT` wordmark | Links to `/app` |
| Centre | Search, max-width 420px, radius `999px`, height 34px | Placeholder `Keresés edzés, kategória, hossz…` · submits to `/app/library?q=` |
| Right | Streak pill `🔥 12 NAP`, then 34px circular avatar | Avatar opens **Profil · Beállítások · Segítség · Kijelentkezés** |

The mark is the existing LEXFIT glyph — take the exact SVG from `reference/LEXFIT Auth.html` (`.bmark-ico`). White on an accent tile; keep it white (0.2 exception).

**Sidebar** — keep the existing 244px glass panel in `shell.css`. Changes: the NAV array above; remove `.lx-prof` (the avatar is now top-right, though `/app/profile` stays a route); add a quiet `Alexa · segítség` block pinned to the bottom.

**Search lives in the shell, not inside Videótár.** An open text box at the top toward the right is the canonical Jakob's Law pattern — YouTube, Netflix and Spotify all keep search globally reachable.

**Streak in the header on every route.** One daily behaviour, reinforced everywhere. A planned rest day protects the streak rather than breaking it.

---

## 1.3 Mobile — bottom tab bar

Below `--bp-mobile` (840px) the rail becomes a fixed bottom tab bar. **This replaces the current `shell.css` behaviour**, which stacks the sidebar horizontally at 760px.

- Fixed to the bottom, four destinations, equal width.
- Icon **plus permanent label**. Filled icon for the active tab.
- Minimum 44×44px targets; height 60px plus `env(safe-area-inset-bottom)`.
- Slim 48px top bar keeps the mark, search and avatar.

Apple HIG has long recommended the tab bar and Material moved to bottom navigation for primary destinations. **Dropping the labels on small screens is exactly where the familiarity is lost** — do not do it.

**Search stays reachable in one tap from the top bar of every screen.** It does not retreat into Videótár on mobile.

---

## 1.4 Thumb zone

On a phone the bottom third of the screen is comfortable, the top third is a stretch.

| Zone | Contents |
|---|---|
| Bottom (comfortable) | Tab bar, primary CTA, sheet confirm buttons |
| Middle (reachable) | Content, cards, rows |
| Top (stretch) | Brand, search, avatar — **things you look at, not things you press repeatedly** |

Primary actions are full-width and bottom-anchored. Destructive actions are never in the thumb zone.

---

## 1.5 Sheets

Bottom sheets are the mobile modal. Global behaviour:

- Radius `var(--r-lg)` on the top corners only; grab handle 36×4px, centred.
- Scrim `oklch(0.2 0.02 350 / .34)`; tapping it dismisses.
- Present at `--dur-base` with the `--ease` curve; slide `transform`, never `height`.
- **The confirm button reports the outcome before committing** — „24 találat megnézése", counting live as options change. Nobody applies a filter blind.
- Escape / back closes; focus trapped while open, returned to the trigger on close.
- Content edits are **not applied live** — the count updates, the results do not, so the page never moves under the thumb.

---

## 1.6 Rows

Horizontally scrolling rows are the primary browse pattern on both platforms.

| | Desktop | Mobile |
|---|---|---|
| Cards visible | 4 (3 below 1080px) | ~1.4 |
| Card width | grid `1fr` | 72% of viewport |
| Gap | `--sp-4` | `--sp-3` |
| Next-card peek | 4th partly cut | **required** — signals the row scrolls |

**Row headings are a bonus, not the mechanism.** Eye-tracking across 2,375 screens found the top-left item examined by **90.82%** of users and its heading by **25.77%**. Duration, intensity and body area must be legible in the artwork itself.

**Empty rows are hidden entirely.** Never rendered with placeholder cards.

---

## 1.7 Route map

| Route | Screen spec |
|---|---|
| `/app` | `10-KEZDOLAP.md` |
| `/app/library` | `20-VIDEOTAR.md` |
| `/app/progress` | *(not yet specced)* |
| `/app/challenges` | **New route.** Confirm the slug — ships as a stub or a full screen? |
| `/app/profile` | *(not yet specced)* |
| `/player/[code]` | *(not yet specced)* |

Mobile behaviour for every route is in `11-MOBILE.md`.
