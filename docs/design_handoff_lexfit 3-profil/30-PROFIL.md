# 30 · Profil & Beállítások

**Screen spec — `/app/profile` and everything it opens.** Global values live in `00-FOUNDATIONS.md`, the shell in `01-SHELL.md`, controls in `02-BUTTONS.md`. This file describes only what is unique to the profile area.

Reference wireframe: `reference/LEXFIT Profil Wireframe.html` — open it in a browser. It is greyscale on purpose: it specifies structure, geometry, hierarchy and copy, never colour.

The build order is in **`31-PROFIL-DEV-PLAN.md`**. Read this file first, build from that one.

---

## 30.0 What this area is

Profile is the least-visited and most-trusted screen in a product: people arrive when something needs changing, and they arrive slightly anxious. It is the one place where **convention matters more than character** — the settings grammar of iOS, Facebook and Google, in plain Hungarian, nothing hidden and nothing clever.

Two surfaces, never mixed:

| Surface | Purpose | Route |
|---|---|---|
| **Profil** | Read-only mirror: identity, streak, programme, numbers, the user's own "why" | `/app/profile` |
| **Beállítások** | Everything editable, grouped rows | `/app/profile/settings` (+ `?section=`) |

---

## 30.1 The current build — what exists and what is wrong

`src/app/app/profile/page.tsx` (12.8 kB) + `profile.css` (8.2 kB) already render a profile. It is **not** what this spec describes. Audit, so nothing is "fixed" twice:

| # | Finding | Where |
|---|---|---|
| **A1** | **Read and edit are on one page.** Identity, onboarding recap, settings, subscription and account actions are a single scroll. This spec splits them. | `page.tsx` whole file |
| **A2** | **Settings do not persist.** `tone`, `reminder`, `quiet`, `community`, `days` are `useState` only — the code comments say so ("local/cosmetic for now"). A toggle that forgets is worse than no toggle. | `page.tsx` ~L90 |
| **A3** | **The price is hardcoded**: `19 990 Ft / hó` as a literal string, and the plan name is hardcoded `Foundation tagság` regardless of `sub.plan`. | `page.tsx` subscription block |
| **A4** | **Emoji are used as the icon system** (🎯 🎚️ 🛡️ 🪪 🗣️ 📅 🔔 🔇 👥 👑). Production icon system is `LxIcon` + `lxPaths`. | throughout |
| **A5** | **No reminder time, no weekday selection, no privacy section, no data export (button is inert), no account deletion.** `Adataim letöltése` and `Adatvédelem` are buttons with no handler. | `prof-actions` |
| **A6** | **No avatar upload.** The avatar is a text initial only. | `prof-ava` |
| **A7** | Streak, week number and subscription **are** already read from Firestore (`loadFoundation`, `getSubscription`, `getOnboarding`). That read path is correct — keep it. | `useEffect` |
| **A8** | The avatar menu in `AppTopBar.tsx` has **three items that all navigate to `/app/profile`** (`Profil`, `Beállítások`, `Segítség`). Its open/close, Escape, outside-click and focus-return behaviour is already correct — **protect that, change only the items.** | `AppTopBar.tsx` |
| **A9** | `Kiindulás & visszamérés` (height/weight) sits on the profile. Weight as a headline number is explicitly out (see §30.10). It moves to Haladásom. | `prof-base` |

**Nothing in the current page is deleted before its replacement renders.** The old page is replaced route-by-route in Phase 1 of the dev plan, behind a flag.

---

## 30.2 Entry point — avatar, top-right, opens a menu

Profile is **not** a fifth destination. The avatar opens a menu over the current page so the user never loses their place, and the four tabs stay four.

The avatar itself is specified in `01-SHELL.md §1.2` (34px circle, top-right, after the streak pill). This section specifies only the **menu**.

### Desktop dropdown

```
┌──────────────────────────────┐  width 250px
│ (38) Réka                    │  header: 14px padding, 11px gap
│      Foundation · 4. hét     │  name 13.5/700 · sub 11px --ink-2
├──────────────────────────────┤
│ ⌾ Profil                     │  each row: 44px min-height,
│ ⌾ Az edzésterved             │  11px 14px padding, 11px gap,
│ ⌾ Emlékeztetők               │  label 12.5px, icon 16px,
│ ⌾ Beállítások                │  1px --line divider between rows
│ ⌾ Segítség                   │
│ ⌾ Kijelentkezés              │  --danger text + icon, last, no divider after
└──────────────────────────────┘
```

- Anchored under the avatar: `top: 52px; right: 14px`. Radius `var(--r-md)`. Shadow `0 12px 30px rgba(0,0,0,.16)`. `z-index: 30` (above the 20 of the sticky bar).
- **Six items, in this order, each with an icon and a permanently visible Hungarian label.**

| Item | Icon (`lxPaths`) | Goes to |
|---|---|---|
| `Profil` | `user` | `/app/profile` |
| `Az edzésterved` | `calendarCheck` * | `/app/profile/settings?section=plan` |
| `Emlékeztetők` | `bell` * | `/app/profile/settings?section=reminders` |
| `Beállítások` | `sliders` * | `/app/profile/settings` |
| `Segítség` | `messageCircle` | `/app/szm` |
| `Kijelentkezés` | `logOut` * | `signOutUser()` → `/login` |

\* not yet in `src/lib/icons.ts` — see §30.9.

- **`Kijelentkezés` is last and coloured.** Session-ending and destructive actions sit at the bottom, visually separated. Prevents mis-taps.
- Keep the existing `role="menu"` / `role="menuitem"`, `aria-haspopup`, `aria-expanded`, Escape-closes, focus-returns-to-trigger behaviour.

### Mobile

Same six items, presented as a **bottom sheet** in the thumb zone (`01-SHELL.md §1.5`), not a dropdown. Header row identical plus the streak pill (`🔥 12`) on the right. Rows 48px. The tab bar stays visible behind the scrim.

---

## 30.3 Profil — the mirror

Not a settings page. Identity, the streak, the programme, the numbers. Everything editable is one tap away in Beállítások, so this screen stays calm.

Vertical stack, `--sp-5` between blocks, inside the normal `lx-main` padding.

### 30.3.1 Identity card

```
┌────────────────────────────────────────────────────────────────────┐
│ ( 76 )   Réka                        [🔥 12 NAPOS SOROZAT] [⚙ Beállítások] │
│  ✎ 26    Foundation · 4. hét · tag 2025 márciusa óta               │
└────────────────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Card | 1px `--line`, radius `var(--r-md)`, padding `20px 22px`, `display:flex`, gap `--sp-5`, `align-items:center` |
| Avatar | 76px circle (`50%`), `--surface-2` fill, 1px `--line`; photo `object-fit: cover`, else the initial, else `user` icon at 32px |
| Edit badge | 26px circle bottom-right, offset `-2px`, `--surface` fill, 1px `--line`, `pencil` icon 12px. **Its hit area is 44px** (`.hit44`, `00 §0.6`) — the badge stays 26px visually |
| Name | 24px / 800 / `-.03em`, first name only |
| Meta | 12.5px `--ink-2` — `{programme} · {n}. hét · tag {month year} óta` |
| Streak pill | 36px tall, radius `999px`, **1px solid `--accent`**, text `--accent-ink`, mono 11.5px uppercase, `flame` icon 12px. Hidden entirely when streak is 0 |
| Button | Secondary, 40px, `sliders` icon + `Beállítások` → `/app/profile/settings` |

Mobile: the same content **centre-stacked** — 64px avatar, name 18px, meta 11px, streak pill under the meta, no Beállítások button (it is the top-bar `sliders` icon button instead).

### 30.3.2 Three numbers

`grid-template-columns: repeat(3,1fr)`, gap `--sp-3`. Each: 1px `--line`, radius `var(--r-md)`, padding `15px 17px`; number 25px/800/`-.03em`/`tabular-nums`; label 11px `--ink-3`.

| Number | Label | Source |
|---|---|---|
| `21` | `elvégzett edzés` | `progress.doneCount` |
| `412` | `perc mozgás` | summed minutes of completed workouts — see `31` Phase 3.4 |
| `12` | `napos sorozat` | `progress.streak` |

**Numbers, not charts.** The detailed view is Haladásom; duplicating it here creates two answers to one question.

Mobile: same 3-up, padding `--sp-3`, centred, number 19px, label mono 10px uppercase.

### 30.3.3 Az edzésterved — week strip

```
 H    K   SZE   CS    P   SZO   V
[✓]  [✓]  [☾]  [ ]  [ ]  [ ]  [ ]      ← 7 equal cells, gap 6px, 26px tall
Heti 5 edzés · hétfő, kedd, csütörtök, péntek, vasárnap   [Terv módosítása]
```

Card: 1px `--line`, radius `var(--r-md)`, padding `17px 19px`, gap `--sp-3`. Title 14.5px/700 with a 16px `calendarCheck` icon in `--accent-ink`.

Cell states — the whole vocabulary:

| State | Cell |
|---|---|
| `done` | `--accent` fill, `--accent` border, white `check` 12px |
| `rest` | `--surface-2` fill, 1px `--line`, `moon` 12px in `--ink-3` |
| `today` | `--surface` fill, **2px `--ink` border** |
| `todo` | `--surface-2` fill, 1px `--line`, empty |
| `missed` | `--surface-2` fill, 1px `--line`, `close` 12px in `--ink-3` — **planned but past and not done. Not in the wireframe; required in production.** No red, no scolding |

Day letters: mono 9px `--ink-3` above each cell (`H K SZE CS P SZO V`, Monday-first, Europe/Budapest).

Footer row: 12.5px `--ink-2` summary sentence, right-aligned secondary button `Terv módosítása` → `settings?section=plan`.

Mobile: cells 22px, gap 4px, no footer row (the whole card is tappable → the plan settings screen).

### 30.3.4 Two cards, side by side

`grid-template-columns: 1fr 1fr`, gap `--sp-4`; single column below `--bp-mobile`.

**`Miért kezdted`** — `messageCircle` icon. The user's own onboarding sentence, 13px `--ink-2`, italic, in Hungarian quotes `„…"`. Under it a mono label: `Az onboardingból · {month year}`. **Hidden entirely if the user skipped that step** — never a placeholder, never a prompt to fill it in.

No reference app has this. It is the one place on the page where LEXFIT gets to be itself.

**`Következő mérföldkő`** — `chartColumn` icon. 13px `--ink-2`: `8. hét — visszamérés. Ugyanaz az edzés, mint az 1. héten.` Footer: mono `{n} hét múlva` left, `Haladásom ›` link right → `/app/progress`. Hidden when the retest is already behind the user.

---

## 30.4 Beállítások — grouped rows

The grammar everyone already knows: a small-caps group label, rows of icon + label, a value or a toggle on the right, a chevron only when the row leads somewhere. **Every phone in Hungary ships with this pattern.**

### 30.4.1 Frame

```
‹ Profil
Beállítások                                   ← 22px / 800 / -.025em

┌ 196px ─────┬───────────────────────────────────────────┐
│ ● Fiók     │  SZEMÉLYES ADATOK                         │
│   Emlékez… │  ┌───────────────────────────────────────┐│
│   Adatvéd… │  │ (ic) Név                Réka        › ││
│   Előfizet…│  │ (ic) E-mail             reka@…hu    › ││
│   Lejátszás│  └───────────────────────────────────────┘│
│   Súgó     │                                           │
└────────────┴───────────────────────────────────────────┘
```

- Back affordance `‹ Profil` — mono 10px label with a `chevronLeft`, links to `/app/profile`.
- `grid-template-columns: 196px 1fr`, gap `--sp-6`, `align-items:start`.
- Sub-nav: `border-right: 1px --line`, padding-right 14px, items 44px min-height, radius `var(--r-sm)`, 12.5px, 16px icon; active = `--accent-soft` background, `--accent-ink` text at 700. **This is the Google / Facebook account pattern** — it exists so the page never becomes one endless scroll.
- Group label (`glbl`): mono 10px, `.11em`, uppercase, `--ink-3`, `18px` above / `8px` below.
- Group: 1px `--line`, radius `var(--r-md)`, `overflow:hidden`, rows divided by 1px `--line`, no divider after the last.

**Row anatomy** — one component, `SetRow`:

| Slot | Spec |
|---|---|
| Icon | 20px column, icon 17px `--ink-2` |
| Label | 13px / 600 |
| Description | 11.5px `--ink-3`, optional, 2px below the label |
| Value | 12px `--ink-2`, right-aligned, optional |
| Trailing | `chevronRight` 16px `--ink-3` **only when the row opens something**, or a toggle, or nothing |
| Box | padding `13px 17px`, gap 13px, min-height **52px** desktop / **48px** mobile |
| Danger variant | label and icon in `--danger` |

Toggle: 44×26px, radius `999px`, 20px knob, `--surface-2` off / `--accent` on, 120ms `--ease` on `transform` and `background`. `role="switch"`, `aria-checked`. **Right-aligned, always** — mixed alignment is where settings pages start feeling unfamiliar.

### 30.4.2 `Fiók` section

**SZEMÉLYES ADATOK**

| Row | Description | Control | Value from |
|---|---|---|---|
| `Név` | — | → editor | `users/{uid}.displayName` |
| `E-mail` | — | → editor | Auth `email` |
| `Profilkép` | — | → picker | `photoURL` present? `Beállítva` : `Nincs` |
| `Jelszó` | `Utoljára módosítva: {n} hónapja` | → editor | Auth metadata |

**AZ EDZÉSTERVED**

| Row | Description | Control | Value |
|---|---|---|---|
| `Heti edzésnapok` | `Ez határozza meg, mi kerül a kezdőlapra` | → editor (3–6 + weekday picker) | `{n} nap` |
| `Szokásos edzéshossz` | — | → editor | `20–30 perc` |
| `Van otthon eszközöd?` | `Szőnyeg · súlyzó nélkül` | → editor (multi) | — |
| `A pihenőnap megtartja a sorozatot` | `A tervezett pihenőnap nem töri meg a lángot` | toggle, **default on** | prefs |

**FIÓK**

| Row | Description | Control |
|---|---|---|
| `Kijelentkezés` | — | → action |
| `Fiók törlése` | `Végleges. Az adataid 30 napon belül törlődnek.` | → flow, `--danger` |

**Deletion is findable, plainly worded, and states its consequence.** Burying it is a documented dark pattern — and now illegal in some jurisdictions.

### 30.4.3 `Emlékeztetők` section

**NAPI EMLÉKEZTETŐ**

| Row | Description | Control |
|---|---|---|
| `Emlékeztess az edzésre` | `Csak az edzésnapjaidon, egyszer` | toggle, default **on** |
| `Időpont` | — | value `07:15` → picker |
| `Mely napokon` | — | inline weekday pills |

Weekday pills: 32px tall (44px on touch), radius `999px`, mono 10px, 1px `--line`; selected = **`--accent-2` fill with white text** (see the contrast note in §30.9). Labels `H K SZE CS P SZO V`.

**EGYÉB ÉRTESÍTÉSEK**

| Row | Description | Default |
|---|---|---|
| `Sorozat veszélyben` | `Este 8-kor, ha aznap még nem mozogtál` | **on** |
| `Közösségi válaszok` | — | **off** |
| `Új edzések a tárban` | `Legfeljebb hetente egyszer` | **off** |

**Exactly two notifications are on by default.** The daily reminder tied to the plan the user already set, and the one message that protects something they have already invested in. Every extra default is borrowed attention the product has not earned.

### 30.4.4 `Adatvédelem` section

| Row | Description | Control |
|---|---|---|
| `A nevem látszik a közösségben` | `Kikapcsolva „R." néven jelensz meg` | toggle, default on |
| `A sorozatom látszik másoknak` | — | toggle, default **off** |
| `Haladásfotók` | `Csak te látod. Sosem kerülnek a közösségbe.` | **value `Privát`, no control** |
| `Adataim letöltése` | — | → action, downloads a file |

**Every toggle states what happens when it is off.** Fitness apps carry real privacy anxiety; vague permission language is what breaks trust.

**Progress photos are not a toggle.** A setting implies it could be otherwise. It cannot. (`src/lib/photos.ts` already stores them owner-only.)

### 30.4.5 `Előfizetés` section

A plan panel, then rows:

| Element | Spec |
|---|---|
| Panel | 1.5px `--accent` border, `--accent-soft` background, radius `var(--r-md)`, padding `17px 19px`, gap `--sp-2` |
| Line 1 | 16px/800 `--accent-ink` — `LEXFIT — {plan label}` |
| Line 2 | 12.5px `--accent-ink` — `{status} · megújul {date} · {price}` |
| Buttons | Two secondary: `Számlázás`, `Csomag váltása` |

| Row | Description |
|---|---|
| `Fizetési előzmények` | — |
| `Előfizetés lemondása` | `A hozzáférésed a fizetett időszak végéig megmarad` |

**Renewal date, price and a cancel row that says what happens after.** Price clarity was already a P1 on the sales-page audit. Every figure comes from `PRICES` via `formatHuf()` — never a literal (fixes A3). Cancellation reuses the existing `/app/membership` flow, which is already J3-compliant; this section is the honest doorway to it, not a second implementation.

State variants: no subscription → `Nincs aktív előfizetés` + `Előfizetek` → `/subscribe`. `PAUSED` → `Szüneteltetve · {date}-ig`. `CANCELED` → `Lemondva · a hozzáférésed {accessUntil}-ig aktív`. `PAST_DUE` → `Fizetési gond — frissítsd a kártyát`.

### 30.4.6 `Lejátszás` and `Súgó`

Same grammar, minimal:

- **Lejátszás** — `Csendes variációk alapból` (`Szomszéd-barát, ugrálás nélküli verziók előnyben`, toggle), `Feliratok`, `Automatikus következő edzés`.
- **Súgó** — `Gyakori kérdések`, `Írj Alexának` → `/app/szm`, `Jogi tudnivalók`.

`Alexa hangneme` (`Meleg` / `Őszinte` / `Vegyes`) from the current build is a genuine product setting with no consumer yet. It belongs in **Lejátszás** if kept — see §30.11 Q3.

---

## 30.5 Mobile

Four tabs is the sweet spot, so profile stays off the tab bar. The avatar in the top bar opens a sheet in the thumb zone; from there it is full screens with a back chevron, exactly like the phone's own Settings app.

| Screen | Content |
|---|---|
| **P-01 · Avatar sheet** | Scrim + bottom sheet, grab handle 36×4px, header row (42px avatar, name, `Foundation · 4. hét`, streak `🔥 12`), then the six rows |
| **P-02 · Profil** | Top bar: back chevron, title `Profil`, `sliders` icon-button right. Centre-stacked identity, 3-up stats, week card, `Miért kezdted` card |
| **P-03 · Beállítások** | Top bar: back chevron + `Beállítások`. **No sub-nav** — the six sections become the page as grouped rows, each row a chevron into its own screen |
| **P-04 · Emlékeztető beállítása** | Toggle card; time card — value 34px/800/`tabular-nums` centred, four preset pills `06:30` `07:15` `18:00` `20:00`; weekday card with the note `Megegyezik az edzésterveddel. Ha módosítod, a terv nem változik.`; bottom-anchored full-width 44px primary `Mentés` |

- Rows are **48px** even with two lines. Settings rows are where mis-taps are most expensive.
- **Time presets before a picker.** Four suggested times cover most users in one tap; the full picker stays available behind `Egyéb időpont`.
- **The tab bar stays visible**, even inside settings. The user can always leave without hunting for a way out.
- Destructive rows (`Fiók törlése`) are **never** in the thumb zone — they sit at the end of a scroll, above a bottom-anchored area, never as the bottom-most tappable element.

---

## 30.6 Geometry the wireframe gets wrong

The reference HTML was drawn as a wireframe kit, not with the token set. Translate, do not copy:

| In the wireframe | In production | Why |
|---|---|---|
| `border-radius: 5px / 7px / 10px / 16px / 24px` | `--r-sm` 8 · `--r-md` 14 · `--r-lg` 20 · `999px` · `50%` | `00 §0.5`. **The `7px` radius on buttons and the `5px` on week cells exist nowhere in the codebase — they are drift, not decisions.** |
| `1px dashed var(--line)` on every card | 1px **solid** `--line` | Dashed is wireframe notation for "not styled yet" |
| `#ececec` / `#f5f5f5` / `#fbfbfa` literals | `--surface-2` / `--surface` / `--bg` | `00 §0.2` |
| Rail 200px, avatar 32px | Rail 244px, avatar 34px | `01-SHELL.md §1.2` — the shell is already built |
| Mono labels at 9px / 9.5px desktop | 10px | `00 §0.4` |
| Phone frame 320×610, radius 24px | n/a | Presentation device only. Mobile is the real viewport |
| Lucide icons | `LxIcon` + `lxPaths` | `00 §0.11` |

---

## 30.7 Copy — verbatim, Hungarian

Every string below ships exactly as written. Do not translate, reword, or "improve".

**Menu:** `Profil` · `Az edzésterved` · `Emlékeztetők` · `Beállítások` · `Segítség` · `Kijelentkezés`

**Profil:** `{n} NAPOS SOROZAT` · `elvégzett edzés` · `perc mozgás` · `napos sorozat` · `Az edzésterved` · `Terv módosítása` · `Heti {n} edzés · {days}` · `Miért kezdted` · `Az onboardingból · {month year}` · `Következő mérföldkő` · `8. hét — visszamérés. Ugyanaz az edzés, mint az 1. héten.` · `{n} hét múlva` · `Haladásom` · `tag {month year} óta`

**Beállítások, sections:** `Fiók` · `Emlékeztetők` · `Adatvédelem` · `Előfizetés` · `Lejátszás` · `Súgó`

**Group labels:** `Személyes adatok` · `Az edzésterved` · `Fiók` · `Napi emlékeztető` · `Egyéb értesítések` · `Adatvédelem` · `Előfizetés`

**Rows:** `Név` · `E-mail` · `Profilkép` (`Nincs`) · `Jelszó` (`Utoljára módosítva: {n} hónapja`) · `Heti edzésnapok` (`Ez határozza meg, mi kerül a kezdőlapra`) · `Szokásos edzéshossz` · `Van otthon eszközöd?` · `A pihenőnap megtartja a sorozatot` (`A tervezett pihenőnap nem töri meg a lángot`) · `Kijelentkezés` · `Fiók törlése` (`Végleges. Az adataid 30 napon belül törlődnek.`) · `Emlékeztess az edzésre` (`Csak az edzésnapjaidon, egyszer`) · `Időpont` · `Mely napokon` · `Sorozat veszélyben` (`Este 8-kor, ha aznap még nem mozogtál`) · `Közösségi válaszok` · `Új edzések a tárban` (`Legfeljebb hetente egyszer`) · `A nevem látszik a közösségben` (`Kikapcsolva „R." néven jelensz meg`) · `A sorozatom látszik másoknak` · `Haladásfotók` (`Csak te látod. Sosem kerülnek a közösségbe.`) — value `Privát` · `Adataim letöltése` · `Fizetési előzmények` · `Előfizetés lemondása` (`A hozzáférésed a fizetett időszak végéig megmarad`) · `Csendes variációk alapból` (`Szomszéd-barát, ugrálás nélküli verziók előnyben`)

**Mobile:** `Mentés` · `Megegyezik az edzésterveddel. Ha módosítod, a terv nem változik.` · `Egyéb időpont`

**Strings that must be written for production** (not in the wireframe — draft, then have them reviewed):

| Situation | Copy |
|---|---|
| Saved | `Mentve.` |
| Save failed | `Nem sikerült mentenünk. Próbáld újra.` + `Újra` |
| Offline toggle | `Most nincs internet — a változás nem mentődött el.` |
| Email change | `Küldtünk egy megerősítő levelet a(z) {email} címre. Amíg nem kattintasz rá, a régi cím marad érvényes.` |
| Re-auth needed | `A biztonság kedvéért írd be újra a jelszavadat.` |
| Google account | `Google-fiókkal léptél be — a jelszót ott tudod módosítani.` |
| Delete confirm | `Írd be: TÖRLÉS` · `Ezzel az edzéseid, a sorozatod és a fotóid is törlődnek. 30 napig visszavonható — írj Alexának.` |
| Export ready | `Elkészült. Letöltés indul.` |
| Empty streak | `Még nincs sorozatod — az első edzés elindítja.` |

---

## 30.8 Screen states

Per `00 §0.9` — all four, on both surfaces.

| State | Profil | Beállítások |
|---|---|---|
| **Loading** | Skeletons in the real shapes: identity card, three stat boxes, week card. No spinner, no layout shift | Group skeletons with the right row counts |
| **Empty** | New user, nothing done: stats show `0`, streak pill hidden, week strip all `todo`, `Miért kezdted` hidden, copy `Még nincs sorozatod — az első edzés elindítja.` + primary `Kezdd el a mai edzést` → `/player/{todayCode}` | n/a — settings always have values |
| **Error** | `Nem tudtuk betölteni a profilodat.` + `Újra` | Same, per section |
| **Not subscribed** | Profile renders fully (identity and history are the user's regardless) | `Előfizetés` section shows the no-plan variant |

Per-control states: toggles are **optimistic** — flip immediately, revert with a message if the write fails. Editors are **explicit** — a `Mentés` button, disabled until dirty, spinner-in-place while saving (`00 §0.7`: width does not change).

---

## 30.9 Accessibility and icon additions

Additions to the `00 §0.14` floor:

- The avatar menu: `role="menu"`, items `role="menuitem"`, focus trapped, Escape closes, focus returns to the trigger (already correct in `AppTopBar`).
- Toggles: `role="switch"` + `aria-checked`, label programmatically associated with the row title.
- Weekday pills: a `role="group"` with `aria-label="Mely napokon"`, each pill `aria-pressed`.
- The 26px avatar-edit badge and every sub-44px glyph get `.hit44`.
- Deletion and cancellation flows are keyboard-completable; the confirm input has a visible label, not a placeholder.
- Section changes in Beállítások move focus to the section heading and update the URL (`?section=`) so a section is linkable and the back button works.

**Icon paths missing from `src/lib/icons.ts`** — add in the same 24×24 stroke style: `bell`, `sliders`, `logOut`, `pencil`, `calendarCheck`, `trash`, `users`, `dumbbell`, `download`, `mail`, `shield`.

**One contrast trap:** the wireframe fills selected pills and toggles with `--accent` and puts white text on top. On Eukaliptusz, white on light accent **fails** (`00 §0.2`). Filled selected states use **`--accent-2`** with white text, or `--accent-soft` with `--accent-ink` text. The only white-on-accent exception in the product is the LEXFIT mark in the logo tile.

---

## 30.10 Profil rules

| # | Rule | Why |
|---|---|---|
| **P-RULE 01** | **Avatar top-right, opening a menu.** Same position on desktop and mobile. Never a fifth tab, never a sidebar row. | Audit F-04; the most consistently reinforced position across Google, Facebook, Netflix, Spotify. |
| **P-RULE 02** | **Profil shows, Beállítások edits.** One page to look at yourself, one to change things. Never mix. | Layered complexity — beginner-friendly surface, depth on demand. |
| **P-RULE 03** | **Grouped rows: label left, value or toggle right.** Chevron only when the row opens something. | The iOS Settings grammar every phone in Hungary ships with. |
| **P-RULE 04** | **Every setting states its consequence.** Not `Közösségi láthatóság` but `Kikapcsolva „R." néven jelensz meg`. | NN/g heuristic 2 — never assume a label carries its effect. |
| **P-RULE 05** | **Money and deletion are findable and plain.** Renewal date, price, cancel row, delete account — all present, all worded honestly. | Dark-pattern avoidance; price clarity is a standing P1. |
| **P-RULE 06** | **One daily notification, tied to the user's own plan** — plus one streak-protection message. Nothing else on by default. | Habit loop paired with forgiveness; permission language must state why. |
| **P-RULE 07** | **No number on this page is hardcoded, ever.** Every figure, date, price and label reads from Firestore, Auth, `PRICES` or the progress log. | This is where a demo becomes a product. |

### Deliberately not doing

- **A badge wall or trophy cabinet.** Achievements that mean nothing outside the app dilute the one number that does.
- **Public leaderboards on the profile.** A page about oneself should not invite comparison.
- **Weight as a headline number.** Progress is measured against week 1, not a scale. (Moves to Haladásom — A9.)
- **Hiding cancellation behind support chat.** Documented dark pattern, trust-destroying for a subscription product.
- **Notifications on by default beyond the two named.**
- **A separate "account" area outside the app shell.** Settings live inside the same rail and tab bar as everything else.
- **Emoji as the icon system.** (Fixes A4.)

---

## 30.11 Open questions — ask before building

1. **`Miért kezdted` — permanent or milestone-only?** It may land as motivating or as nagging. A five-user question.
2. **Does `Előfizetés` belong directly in the avatar menu?** For many users it is the only reason they ever open this area. Currently it is one level in.
3. **Keep `Alexa hangneme`?** It is in the current build but nothing consumes it. Either wire it to the player's copy or drop it — a setting that changes nothing is worse than no setting.
4. **Reminder delivery channel.** The repo has email (`src/lib/email.ts`) and a daily cron, but **no push infrastructure**. Email-only for v1, or add web push? This changes Phase 5 substantially — see `31` §P0.
5. **Settings route shape** — `/app/profile/settings?section=reminders` or `/app/profile/settings/[section]`. Either is fine; pick one before Phase 1.
6. **`Szokásos edzéshossz` and `Van otthon eszközöd?`** are onboarding answers (`time`, `env`). Editing them here should re-personalise the plan — does it, and how visibly? Product decision, not an implementation one.
