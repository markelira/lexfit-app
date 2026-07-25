# Handoff: LEXFIT App Landing Page

## Overview

A single-page marketing/landing site for **LEXFIT** — a Hungarian-language, women-first, equipment-free home fitness app built around **Alexa**, its sole trainer and founder. The page sells one thing: the **Foundation** program (8 weeks, 40 guided workouts) plus a 200+ workout library, progress tracking, and the *Szavazz Magadra* community.

The page is a long-scroll narrative: hero → app intro → feature panels (interleaved with cinematic auto-playing showcases) → founder story → pricing → footer. Structure and layout are modeled on the MadFit app landing page; palette, typography, and all content are LEXFIT's own.

**Language:** all UI copy is Hungarian (`<html lang="hu">`). Keep it verbatim.

---

## About the Design Files

The files in this bundle are **design references created in HTML/CSS/JS** — prototypes that demonstrate the intended look, motion, and behavior. They are **not production code to copy directly**.

Your task is to **recreate these designs in the target codebase's existing environment** (React, Next.js, Vue, Astro, SwiftUI, etc.), using its established component patterns, styling solution, and asset pipeline. If no environment exists yet, choose the framework most appropriate for a marketing landing page (Next.js or Astro are strong defaults for this kind of static, animation-heavy page) and implement there.

Notes on the prototype's own conventions:
- `<image-slot>` is a **prototype-only** web component acting as a drag-and-drop image placeholder. In production, replace every `<image-slot>` with a real `<img>` / `<Image>` element. Each one is annotated below with what belongs there.
- Several carousels/grids are populated by inline JS from data arrays. In production these should be **data-driven components** fed from a CMS or a typed constants file.
- All animation is CSS transitions/keyframes plus `IntersectionObserver` — no animation library required.

---

## Fidelity

**High-fidelity (hifi).** Colors, typography, spacing, radii, shadows, easing curves, and timings are final and specified exactly below. Recreate pixel-faithfully using the codebase's existing primitives. The only unfinished elements are photography/screenshots, which are placeholders.

---

## Design Tokens

Defined on `:root` in `lexfit-landing.css`. Colors are authored in **OKLCH** — preserve that (with hex fallbacks if the codebase requires broader support).

### Brand colors
| Token | OKLCH | ≈ Hex | Use |
|---|---|---|---|
| `--accent` | `oklch(0.66 0.155 0)` | `#e5719b` | Primary pink. Hero/pricing background, links, active states, progress fills |
| `--accent-2` | `oklch(0.58 0.165 358)` | `#d5638a` | Deeper pink. Hovers, gradient ends |
| `--ink` | `oklch(0.245 0.022 350)` | `#2a1f24` | All body/heading text, dark buttons |

### Workout category colors
Used for course-card covers, day dots, and category words. **Never substitute** — these map 1:1 to the app's own category system.

| Token | OKLCH | Category | Cover word |
|---|---|---|---|
| `--cat-also` | `oklch(0.66 0.155 0)` | Alsótest (lower body) | `ALSÓ` |
| `--cat-felso` | `oklch(0.45 0.085 320)` | Felsőtest (upper body) | `FELSŐ` |
| `--cat-cardio` | `oklch(0.68 0.140 45)` | Cardio + has | `CARDIO` |
| `--cat-teljes` | `oklch(0.52 0.150 355)` | Teljes test (full body) | `TELJES` |
| `--cat-mobility` | `oklch(0.66 0.090 155)` | Mobility | `MOBILITY` |

### Surfaces
| Token | Value | Use |
|---|---|---|
| `--cream` | `#f6f5f2` | Page background, most sections, pricing cards |
| `--sage` / `--sage-2` | `#e5719b` | Hero band + pricing band (brand pink; token name is legacy) |
| `--panel` | `#f4dde6` | Legacy; panels now use a layered glass gradient (below) |
| `--navy` | `#181821` | Dark bands: cast, cinematic showcase, founder finale |

### Typography
- `--font`: **Poppins** (300, 400, 500, 600, 700, 800, 900) — display + UI
- `--mono`: **IBM Plex Mono** (400, 500) — eyebrows, labels, buttons, metadata

Loaded from Google Fonts. In production, self-host with `font-display: swap`.

**The signature contrast:** big headlines are **thin (300) and lowercase**; eyebrows, buttons, and metadata are **tracked uppercase mono**. This carries the entire editorial tone — preserve it.

| Role | Spec |
|---|---|
| `.eyebrow` | mono, 11px, `.14em` tracking, uppercase, `--ink` @ 75% |
| `.h-thin` (panel headings) | Poppins 300, `clamp(30px, 3.4vw, 46px)`, `line-height 1.04`, `-.022em`, **lowercase** |
| `.h-bold` (section titles) | Poppins 600, `clamp(26px, 2.6vw, 34px)`, `line-height 1.08`, `-.028em` |
| `.body` | 16px, `line-height 1.58`, `--ink` @ 82%, `text-wrap: pretty` |
| `.cap-title` (carousel captions) | Poppins 500, `clamp(20px, 2vw, 23px)`, `-.02em`, centered |
| `.cap-body` | 15px, `line-height 1.55`, `--ink` @ 70%, centered, `max-width 660px` |
| Hero `h1` | Poppins 300 (bold span 700), `clamp(44px, 5.6vw, 84px)`, `line-height 1`, `-.02em`, **uppercase** |
| `.starter-title` | Poppins 600, `clamp(32px, 4.4vw, 54px)`, `-.03em` |
| `.aq-close` (finale) | Poppins 300, `clamp(40px, 6vw, 76px)`, `-.03em`, white |

### Layout & spacing
- Content column: `--col: 1200px`, `.wrap` = `max-width 1200px; margin 0 auto; padding 0 40px`
- Section rhythm: `.sec` = `96px 0`; `.sec-sm` = `64px 0`; `#funkciok` = `116px 0 28px`
- Two-column feature panels: `grid-template-columns: 1fr 1fr; gap: 40px; align-items: center`
- Panel inner padding: `.panel-pad` = `64px` (→ `36px` under 900px)

### Radii
`999px` pills · `28px` panels/hero/journey/showcase bands · `24px` hero image · `22px` coverflow cards · `18px` unlim cards, trainer cards · `16px` category tiles, food tiles, pricing cards, journey covers · `14px` journey day rows

### Shadows
- Dark pill: `0 12px 28px -14px oklch(0 0 0/.6)`; hover `0 18px 34px -14px`
- Panel: `inset 0 1px 0 oklch(1 0 0/.7), inset 0 -30px 60px -30px oklch(.66 .155 0/.35), 0 30px 60px -34px oklch(.4 .1 355/.5)`
- Sticky nav: `0 20px 44px -26px oklch(.4 .1 355/.6), inset 0 1px 0 oklch(1 0 0/.85)`
- Coverflow card: `0 34px 66px -30px oklch(0 0 0/.5)`
- Course cover: `0 20px 40px -22px oklch(0 0 0/.55)`

### Motion
- Standard reveal/transform easing: `cubic-bezier(.22, 1, .36, 1)`
- Scroll reveal `.rise`: `opacity 0 → 1`, `translateY(24px) → 0`, `.7s`, triggered by IntersectionObserver at `threshold: .12` (unobserve after firing — one-shot)
- Coverflow advance: 2800ms · Journey day: 2600ms · Showcase scene: 5000ms

---

## Reusable Components

Build these once; they account for most of the page.

### 1. `Panel` — glass feature container
Rounded `28px` container with a layered "liquid glass" surface and a diagonal specular sweep.

```css
background:
  radial-gradient(120% 90% at 12% 8%, oklch(1 0 0/.55), transparent 55%),
  radial-gradient(90% 80% at 88% 100%, oklch(.66 .155 0/.28), transparent 60%),
  linear-gradient(150deg, oklch(.92 .05 350/.85), oklch(.86 .07 355/.7));
border: 1px solid oklch(1 0 0/.5);
backdrop-filter: blur(14px);
```
Plus a `::before` sheen: `linear-gradient(115deg, transparent, oklch(1 0 0/.35), transparent)`, `rotate(8deg)`, positioned `top:-40% left:-10% w:70% h:120%`, `pointer-events:none`.

### 2. `TextIconBlock` (`.ticon`)
Vertical stack: 40×40 line icon → `.h-thin` lowercase heading → `.body` (max-width 380px) → optional pill CTA (margin-top 22px). `.center` modifier centers everything. Used in every feature panel.

### 3. Buttons (`.pill`)
Base: inline-flex, `gap 9px`, Poppins 600, 13px, `.1em` tracking, uppercase, `border-radius 999px`, `padding 15px 30px`, `transition .22s`.
- `.pill-dark` — `--ink` bg, white text; hover `translateY(-2px)` + deeper shadow
- `.pill-outline` — transparent, `1.4px solid currentColor`, `padding 13px 28px`; hover fills `--ink`/white
- `.pill-sage` — `--sage` bg, `--ink` text; hover `brightness(1.05)`

### 4. `CourseCover` — the app's LxCover system ⚠️ critical
The single most important brand component. Appears in three sizes (coverflow, journey, unlim carousel), always with the same anatomy:

- **Background:** `linear-gradient(125deg, oklch(from {cat} calc(l - 0.16) calc(c * 0.85) h) 0%, {cat} 65%, oklch(from {cat} calc(l + 0.07) c h) 100%)` where `{cat}` is the category token. *(Uses relative-color syntax; precompute per-category stops if the target needs wider browser support.)*
- **Ring:** oversized circle bleeding off the top-right — `border: 2px solid oklch(1 0 0/.28)`, positioned negative top/right, `z-index 0`
- **Category word:** absolute top-right, Poppins **900**, `oklch(1 0 0/.34)`, sizes 32–38px
- **Meta stack** (bottom-left, white, `z-index 1`): optional mono category label → title (600, 16–18px) → mono duration line
- **Highlight:** `::after` with `radial-gradient(120% 90% at 85% 10%, oklch(1 0 0/.18), transparent 55%)`

### 5. `Carousel` (`.carousel`)
`display:flex; gap:12px; overflow-x:auto; scroll-snap-type: x proximity; padding: 6px 40px;` scrollbars hidden. Children `flex: 0 0 auto; scroll-snap-align: center`. Bleeds full-width (outside `.wrap`) so items peek at both edges.

### 6. `StickyNav` — floating glass pill
Fixed, `z-index 60`, `padding 16px 20px 0`, hidden via `translateY(-130%)`, revealed with `.show` at `scrollY > 640`, transition `.34s cubic-bezier(.22,1,.36,1)`.

Inner pill: `max-width 1200px`, `background oklch(1 0 0/.6)`, `border 1px solid oklch(1 0 0/.7)`, `backdrop-filter blur(16px)`, `border-radius 999px`, `padding 11px 12px 11px 24px`.
Contents: wordmark (19px) · mono 11px uppercase links · dark mini-CTA pill.
Active link (scroll-spy): `--ink` + weight 600; inactive `--ink` @ 58%.

### 7. `ChapterBar` — segmented progress
Shared by the journey and the showcase. Flex row of equal-width 4px tracks (`border-radius 99px`, translucent bg). Active track's `.fill` runs `scaleX(0 → 1)` over `--dur` (linear); completed tracks stay at `scaleX(1)`; `.paused` sets `animation-play-state: paused`. Tracks are clickable to jump.

---

## Sections (top → bottom)

### 1. Sticky Nav
Links (Hungarian): `Valós idejű` `Foundation` `Bemutató` `Haladásom` `Receptek` → anchors `#valos #programok #youtube #profil #receptek`. CTA: **"Kezdd el a programot →"** → `#elofizetes`.

### 2. Hero — `header.hero`
- Band: `--sage` (`#e5719b`), `border-radius 28px`, `margin 16px 16px 0`, `padding 34px 0 96px`, `overflow hidden`
- **Aura:** 900×900 radial `oklch(1 0 0/.28)` blurred 40px, centered at `50%/62%`, `heroBreathe` 7s (opacity .7→1, scale 1→1.08)
- **Nav row:** wordmark (Poppins 800, 24px) + mono links `Funkciók · Alexa · Előfizetés`, white @ 82%
- **Body grid:** `1.05fr .95fr`, `gap 30px`, `margin-top 70px`
  - Eyebrow: `A teljes otthoni edzésprogram · nőknek`
  - H1: `A változás` / **`otthon kezdődik`** (second line `<b>` 700, both white, uppercase)
  - Body: `Napi 30 perc, eszköz nélkül. Egy program, ami tudja, hol tartasz — és egy edző, aki végig veled marad.`
  - Row: `.pill-dark` **"Kezdd el a programot"** + text button **"Bemutató →"**
  - Trust: `10 év versenysport mögötte · 14 napos garancia` (mono 11px, white @ 62%)
  - **Image:** 320×566, `radius 24px`, `heroFloat` 6s (translateY 0 → -14px). → *Hero app screenshot / lifestyle shot.*

### 3. App intro — `#funkciok`
Left-aligned, `max-width 470px`. Eyebrow `Az app` → h2 **"Minden, ami az edzéshez kell — egy appban."** → body about program + library + tracking in one place.

### 4. Follow-along panel — `#valos`
Panel, image left / text right.
- Image: 280px wide, `aspect-ratio 9/19.5`, `radius 34px` → *phone mockup, real-time workout.*
- Icon: video camera. Heading **"edzés, amikor / neked jó"**. CTA `.pill-outline` "Válaszd ki a csomagod".

### 5. Coverflow — "Minden nap új edzés. Egy sem unalmas."
Caption + a **3D-ish coverflow** (`.coverflow`, height 360px, centered, overflow hidden).

Behavior — cards absolutely positioned, laid out relative to `center` index with wraparound:
```
offset o = i - center, wrapped into [-N/2, N/2]
transform: translateX(o * 118px) scale(max(.52, 1 - |o| * .14))
opacity: |o| >= 4 ? 0 : 1
z-index: 20 - round(|o|)
.cf-glass opacity: min(.85, |o| * .3)   /* frosted glass grows with distance */
transition: transform .6s cubic-bezier(.22,1,.36,1), opacity .6s
```
Auto-advances every **2800ms** while in view (IntersectionObserver `threshold .3`, pauses when out). Clicking a card centers it and restarts the timer. Card = `CourseCover` at 214×290, plus `.cf-glass` overlay (`backdrop-filter blur(3px)`).

9 cards: Fenék & comb égő (24p, Alsó) · Zsírégető cardio (22p, Cardio) · Tónusos kar & váll (21p, Felső) · Teljes test égő (28p, Teljes) · Reggeli mobilitás (14p, Mobility) · Lépcsőző comb-sorozat (19p, Alsó) · Tabata core (10p, Cardio) · Tartás-reset (17p, Felső) · Multi-mozgás mindenre (26p, Teljes). Meta line: `{perc} · Alexa`.

### 6. Cast — navy band
Vertical composition: text+icons top-left, phone top-right, light beam converging down into a centered TV, device chain below.
- `.cast-beam`: absolute, `top 58%`, `width 200%`, `height 360px`, `translateX(-46%)`, `linear-gradient(180deg, oklch(.66 .155 0/.5), transparent 88%)`, `clip-path: polygon(46% 0, 56% 0, 34% 100%, 20% 100%)`, `blur(8px)`, behind the TV
- Phone shot 340×212 → *workout playing on phone*; TV `min(680px, 90%)` @ 16/10, `margin-top -60px` → *living room, workout on TV*
- Heading **"vidd a / nagy képernyőre"**, body about Chromecast + AirPlay
- Device chain: `TELEFON` → 7 dots → rotated WiFi glyph (`rotate(90deg) scaleX(-1)`, `--accent`) → `ASZTALI GÉP` · `LAPTOP` · `OKOS TV`

### 7. Programs panel — `#programok`
Panel, text left / image right. Icon: trail/flag. Heading **"programok, / amik célba / érnek"**. Image `max-width 340px`, 4/5 → *program list screen.*

### 8. Foundation Journey ⚠️ signature component
Introduced by a centered head: gradient pill badge `A kezdő program` → title **"4 hét, ami elindít."** → cap-body → facts row (`20 edzés · 5 nap / hét · fix 30 perc · eszköz nélkül · 2 fázis`).

**`.journey`**: `height 600px` (fixed — must not resize as content changes), `radius 28px`, white text, `isolation: isolate`.
- `.jbg` — full-bleed phase gradient, crossfades `.9s`:
  - `ph-alap` (weeks 1–2): `linear-gradient(135deg, oklch(.5 .09 320), oklch(.32 .08 318))`
  - `ph-epites` (weeks 3–4): `linear-gradient(135deg, var(--accent), var(--accent-2))`
- `.jglow` — soft white radial, `scPulse` 7s
- `.journey-inner` — grid `.92fr 1.08fr`, `gap 44px`, `align-items: start`, `padding 56px 58px 74px`

**Left column** (`.j-left`, re-animates on week change via `jSwap`: opacity 0 + translateY(14px) → 0, `.8s`): phase eyebrow (with emoji) → week number `01`–`04` (Poppins 800, `clamp(92px, 13vw, 168px)`, `line-height .82`) → `{n}. hét · 5 edzés` → description (`min-height 68px` to prevent reflow) → `Napi 30 perc · eszköz nélkül`.

**Right column** (`.j-days`) — the day-by-day cinematic:
- 5 rows, each: header pill (category dot · day letter · title) + a collapsed `CourseCover`
- Active row: header brightens (`oklch(1 0 0/.22)`, border 45%), title → weight 700, and its cover **expands** (`max-height 0 → 170px`, opacity 0 → 1, `margin-top 9px`, `.6s cubic-bezier(.22,1,.36,1)`) pushing later rows down
- Opacity ramp: past rows `.34`; upcoming rows `max(.24, 1 - .2 * distance)` — a gradual fade toward the last

**Timing:** one day every **2600ms**; after the 5th day the week advances (and wraps 4 → 1). Chapter bar (4 segments) shows week progress, `--dur = 2600 × 5 = 13000ms`. Plays only while in view (`threshold .4`); clicking a chapter jumps to that week at day 0.

**Data** (`starterWeeks`) — the real Foundation first half, F001–F020, fixed weekly split H=Alsótest, K=Felsőtest, Sze=Cardio+has, Cs=Teljes test, P=Mobility:

| Week | Phase | Mon | Tue | Wed | Thu | Fri |
|---|---|---|---|---|---|---|
| 1 | 🌱 Alap | Láb alapokról | Felsőtest indító | Csendes cardio | Mindent egy edzésben | Reset — alap flow |
| 2 | 🌱 Alap | Fenék-fókusz, első réteg | Egyenes hát, nyitott mell | Lépés-alapú cardio + has | Egész test flow, könnyedén | Csípő + váll mobility |
| 3 | 🔨 Építés | Combé az erő — pulzusok | Felsőtest variációkkal | Step it up — cardio építés | Teljes test fél órában | Lazító flow + mély nyújtás |
| 4 | 🔨 Építés | Lábmunka oldalra, átlósan | Lapockák erősítése | Cardio combo + ferde has | Multi-mozgás mindenre | Mély nyújtás — egész test |

Phase descriptions: W1 *"Forma és szokás. Lassú tempó, alapgyakorlatok, bőséges modifikációkkal."* · W2 *"Beépül a rutin. Ugyanaz a ritmus, kicsit mélyebben, magabiztosabban."* · W3 *"Új variációk és cardio-alapozás. Belép a tempó és az új formátumok."* · W4 *"Erősebb terhelés. Pyramid, EMOM, AMRAP — és érzed, hogy bírod."*
Cover meta line: `{kód} · Foundation · 30 perc`.

### 9. "korlátlan lehetőség" carousel
Caption + a `Carousel` of 12 `CourseCover` cards at 230×290, spanning all five categories, meta `{perc} · Alexa`.

### 10. Cinematic Showcase — `#youtube`, navy band
`margin 16px 16px 0`, `radius 28px`, `padding 96px 0 104px`.
- Head: play/pause circle button (44px, toggles `.playing`) + mono eyebrow `Nézd meg egy perc alatt`
- Stage: pulsing pink glow (`scPulse` 6s) behind a `.device` phone mockup at `scale(1.06)`
- 5 scenes cross-fade (`opacity 1s`, plus a slow `scale(1.12 → 1)` Ken-Burns over 6s). Slots: *home screen · live workout · programs · recipes · profile*
- Caption below (Poppins 300, `clamp(22px, 2.6vw, 32px)`) fades out/in 250ms on change:
  1. `A mai edzésed egy koppintásra`
  2. `Mozogj együtt az edzőkkel, valós időben`
  3. `A heted, felépítve — programok és kihívások`
  4. `Friss receptek, hogy feltöltődj`
  5. `Lásd, milyen messzire jutottál`
- Chapter bar (5 segments, `--dur 5000ms`, fill `--accent`). Auto-plays in view, pauses out; button toggles; chapters jump.

### 11. Progress panel — `#profil`
Panel, text left / two images right (each `max-width 200px`, 4/5) → *profile & progress screens.* Heading **"lásd, milyen / messzire jutottál"**.

### 12. Achievements
Caption **"gyűjtsd a jelvényeket"** + 12 hexagon badges (`clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)`, 64×72, gradient fills, mono 8.5px labels): 24 HÉT · 500 PERC · 50 EDZÉS · 15 EDZÉS · 6 HÉT · 100 PERC · 50 VÍZNAPLÓ · 30 NAPLÓBEJEGYZÉS · 30 ALVÁSNAPLÓ · 90 NAPLÓBEJEGYZÉS · 500 VÍZNAPLÓ · 365 ALVÁSNAPLÓ.

### 13. Recipes panel — `#receptek`
Panel, text left / image right (`max-width 340px`, 4/5) → *recipes screen.* Heading **"minden héten / friss recept"**.

### 14. Recipes carousel
Caption **"200+ recept minden ízléshez"** + 14 square 150×150 tiles → *food photography.*

### 15. Founder — `#alexa`
Eyebrow `Az alapító` → h2 **"Ismerd meg Alexát."** → intro body → full-bleed carousel of 5 chapter cards (`.trainer-card`, 326×420) telling her story. Each: gradient layer + image slot (`mix-blend-mode: luminosity`, opacity .92) + mono role label top-left + name bottom-left (22px).

| Role label | Name line | Gradient |
|---|---|---|
| A VERSENYZŐ | 10 év a szőnyegen | `--cat-felso` → `oklch(.34 .08 318)` |
| A FORDULAT | 2023 — abbahagytam | `--cat-teljes` → `oklch(.34 .1 353)` |
| A FELISMERÉS | „Egyedül nem megy” | `--accent` → `--accent-2` |
| A KÖZÖSSÉG | 17 000+ ember | `--cat-cardio` → `oklch(.56 .13 40)` |
| AZ ÍGÉRET | Együtt muszáj | `--accent-2` → `--cat-felso` |

### 16. Founder finale — navy band, centered
Pull quote **„Egyedül nem megy.”** (Poppins 300, `clamp(30px, 4vw, 52px)`, `--accent`) → three mono promise lines (*Nem mondom meg, mit csinálj. / Nem ítéllek el, ha kimaradsz. / Nem játszom, hogy tökéletes vagyok.*) → **"Egyedül nehéz. / Együtt muszáj."** (`clamp(40px, 6vw, 76px)`) → `— Alexa` → `.pill-sage` **"Csatlakozz a csapathoz"**.

### 17. Pricing — `#elofizetes`
`--sage-2` band, `padding 120px 0 90px`. Centered wordmark (26px, `--ink`) → eyebrow `Előfizetés` → `Egy előfizetés. Minden funkció. Bármikor lemondhatod.`

4 cream cards (`radius 16px`, `padding 34px 20px 30px`, centered): plan name (mono, `.14em`) → 34×2 rule → struck original → amount (700, 38px) → `USD` → savings label → fine print.

| Plan | Was | Now | Label | Fine print |
|---|---|---|---|---|
| Havi | — | $29.99 | — | $29.99 usd / hó · havi számlázás |
| Féléves | $179.94 usd | $99.99 | Spórolj 80$ (`--accent`) | $16.67 usd / hó · féléves számlázás |
| Éves | $359.88 usd | $149.99 | Spórolj 210$ (`--accent`) | $12.50 usd / hó · éves számlázás |
| Örökös | — | $299.99 | Egyszer fizetsz, örökre a tiéd (`--cat-cardio`) | $299.99 usd · egyszeri számlázás |

Then centered `.pill-dark` **"Kezdd el még ma"**.

> ⚠️ **Prices are placeholders inherited from the reference and are in USD.** Confirm real HUF pricing before launch.

### 18. Footer
Two columns on the sage band: help text with `team@lexfit.hu` (chat icon) | `Felhasználási feltételek | Adatvédelem`.

---

## Interactions & Behavior

| Behavior | Trigger | Detail |
|---|---|---|
| Sticky nav reveal | `scrollY > 640` | toggle `.show`, `.34s` slide |
| Scroll-spy | scroll | last section whose `getBoundingClientRect().top < 220` wins; sets `.active` on matching nav link |
| Scroll reveal | IO `threshold .12` | `.rise` → `.in`; one-shot (unobserve) |
| Coverflow | IO `threshold .3` | auto-advance 2800ms; click to center; pauses off-screen |
| Journey | IO `threshold .4` | day every 2600ms, wraps to next week after day 5; chapter click jumps |
| Showcase | IO `threshold .4` | scene every 5000ms; play/pause button; chapter click jumps |
| Pill hover | hover | dark lifts 2px; outline inverts to `--ink`/white |
| Nav link hover | hover | 58% → 100% `--ink` |

All scroll listeners use `{ passive: true }`.

**Reduced motion:** the prototype does not yet implement it. In production, wrap the auto-advancing carousels, floats, and pulses in `@media (prefers-reduced-motion: reduce)` — show static first frames and disable infinite keyframes.

---

## State Management

Local UI state only; no server data.

- `stickyVisible: boolean`, `activeSection: string`
- Coverflow: `centerIndex: number`, `playing: boolean`
- Journey: `weekIndex: 0–3`, `dayIndex: 0–4`, `playing: boolean`
- Showcase: `sceneIndex: 0–4`, `playing: boolean`

Each auto-player owns an interval, started/stopped by an IntersectionObserver, and cleared on unmount. In React, prefer `useReducer` per player plus a `useInView` hook; **always clear intervals in cleanup**.

Content that should become data (CMS or typed constants): `starterWeeks`, the coverflow/unlim card lists, badge list, founder chapters, pricing tiers, nav items.

---

## Responsive

Current breakpoints:
- **≤900px** — hero body, testimonials → 1 column; hero copy centers; equipment/pricing → 2 columns; `.panel-pad` → 36px
- **≤840px** — founder block → 1 column
- **≤760px** — journey height auto (`min-height 540px`), inner → 1 column, padding `40px 30px 66px`

> ⚠️ **Mobile is not fully designed.** The two-column feature panels still need explicit stacking rules (image above text), carousel padding needs reducing from 40px, and the coverflow's 118px step is too wide for small screens. Treat mobile as work to be designed/confirmed, not inferred.

---

## Accessibility notes

Address these during implementation — the prototype is incomplete here:
- Auto-advancing carousels need pause controls and `aria-live="off"`; the showcase has a play/pause button, the coverflow and journey do not
- Chapter bars are `<button>`s but need `aria-label`s (e.g. "2. hét")
- Decorative SVGs need `aria-hidden="true"`; meaningful ones need titles
- Every production `<img>` needs real alt text (Hungarian)
- Verify contrast of white-on-pink at small mono sizes (hero trust line, ~62% white on `#e5719b`) — likely needs raising
- CTAs are `<button>`s that navigate; they should be links (`<a>`) in production

---

## Assets

**No production imagery exists yet.** Every image is a placeholder. Required:

| Slot(s) | Content |
|---|---|
| `hero-screen` | Hero visual — app screen or lifestyle shot (320×566, portrait) |
| `fa-screen` | Phone mockup, real-time workout (9/19.5) |
| `cast-phone`, `cast-tv` | Workout on phone (340×212); living room TV (16/10) |
| `gf-screen`, `rec-screen` | Program list; recipes screen (4/5) |
| `tr1`, `tr2` | Profile + progress screens (4/5) |
| `sc0`–`sc4` | 5 app screens: home · live workout · programs · recipes · profile |
| `food0`–`food13` | 14 square food photos |
| `alexa-ch0`–`4` | 5 Alexa portraits, one per story chapter |

Icons are inline SVG (stroke 1.5–1.8, `currentColor`) — swap for the codebase's icon set if one exists. Fonts: Poppins + IBM Plex Mono (Google Fonts; self-host in production).

---

## Files

| File | Contents |
|---|---|
| `LEXFIT App Landing.html` | Full page markup + all inline JS (carousels, journey, showcase, nav, reveal) |
| `lexfit-landing.css` | All styling: tokens, components, sections, responsive |
| `image-slot.js` | Prototype-only placeholder web component — **do not port** |

## Suggested implementation order

1. Tokens, fonts, `.wrap`, section rhythm
2. Primitives: pills, eyebrow/heading/body type, `Panel`, `TextIconBlock`
3. **`CourseCover`** — used by three sections; get the gradient/ring/word exactly right first
4. Static sections: hero, app intro, four feature panels, achievements, pricing, footer
5. `Carousel` + the three carousel instances
6. Sticky nav + scroll-spy + `.rise` reveal
7. Auto-players: coverflow → showcase → **journey** (most complex; build last)
8. Responsive + reduced-motion + a11y pass
9. Replace placeholders with real assets
