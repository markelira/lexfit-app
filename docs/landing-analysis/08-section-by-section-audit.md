# LEXFIT homepage — section-by-section audit

Date: 2026-08-11. A fresh pass over my own work, one band at a time, at 390×844
(the iPhone 14–16 class) with spot checks at 320 / 360 / 430.

The earlier audit (`07-mobile-ux-audit.md`) was **metric-driven** — overflow, target
sizes, contrast, scroll depth. This one is **look-at-it-driven**, and it found six
defects the metrics could not see. That gap is the most useful thing in this document.

---

## 0 · Two process failures worth recording

**1. My overflow detector was blind to clipping.**
`.lxl` sets `overflow-x: hidden`. So when the hero nav ran 82px past the viewport, the
document's `scrollWidth` still equalled the viewport and my check reported *"no
horizontal overflow at any width"* — five times, across two audits. It was true and
useless: the content wasn't overflowing, it was being **cut off**. A screenshot found it
in three seconds.

Any future check must compare each element's `right` against the viewport
independently of document scroll width.

**2. A stale server invalidated one verification round.**
A `next start` process kept port 3123 while my `pkill` matched a different PID, so
restarts silently failed to bind and the old build kept serving. One round of "verified"
results was measured against stale CSS. Caught it because a fix that was definitely in
the source had no effect; re-checked by diffing the served CSS chunk against the source.
**Everything in §2 below was re-verified against a confirmed-fresh build** (buildId and
CSS chunk contents checked before measuring).

---

## 1 · Section-by-section

Heights are at 390×844 after fixes.

> **Placeholder note (added 2026-08-11, after this audit ran).** §2's three placeholders
> and §11's are now real assets, so the "2,493px of striped grey / 15.2% of the page"
> finding below is out of date — 3 of the 9 placeholders remain (§3, §4, §8).
>
> **Numbering note (added 2026-08-11, after this audit ran).** The price anchor has since
> moved from band 12 to band 6, directly under Programok, and now leads with the weekly
> entry price instead of the annual per-week. Bands 6–11 below each shifted down one.
> The findings are unchanged; only the numbers they hang on moved. See
> `05-homepage-wireframe.md` §6 for the reasoning.

### §1 · Hero — 1,343px

| | |
|---|---|
| **Defect** | Nav links row extended to **472px in a 390px viewport**. "Belépés" was **entirely off-screen**; "Árak" ended exactly on the edge; the LEXFIT wordmark and the first link had a **0px gap** and visually collided. |
| **Impact** | A returning member had no way to log in from the hero. On the highest-traffic viewport class. |
| **Fixed** | Section links hidden below 900px, `Belépés` kept, `gap: 16px` on the nav. |

**Also found:** the sticky nav's links are `display: none` on mobile. Combined with the
hero nav, that meant **the page had no section navigation at all on mobile** — the five
anchors were desktop-only. The sticky bar still carries the wordmark and the CTA, which
is the right call for a 20-screen page; worth knowing it's a deliberate state rather than
an accident.

**False alarm I chased:** a screenshot showed the sticky nav covering section headings. It
was my harness (`scrollIntoView` + manual offset), not the page — `scroll-margin-top: 92px`
is already set on every section and real anchor jumps clear the nav correctly.

### §2 · Hogyan működik — 880px

Down from 2,199px after the side-by-side rebuild. But the ratio got *worse*:

> **706px of this 880px section is striped placeholder — 80%.**

The section explaining how the product works is four-fifths grey stripes. Shortening it
improved the scroll and sharpened the problem: this is now the clearest illustration that
the placeholders, not the layout, are the limiting factor.

No layout defect. Three steps, numbered, legible, correct.

### §3 · Edzés Alexával — 1,534px · *tallest real-content section*

| | |
|---|---|
| **Defect** | `FeaturePanel` is called with `mediaFirst`, which on desktop puts the mockup left. When the grid stacks on mobile, DOM order wins — so a **607px striped placeholder rendered above the copy.** Jumping to this section landed on a full screen of stripes. |
| **Impact** | The section that answers "what is a session?" led with nothing, on the section a nav anchor points at. |
| **Fixed** | `.panel-grid .ticon { order: -1 }` below 900px — text first, mockup after. |

Still 40% placeholder. Once the phone screenshot lands, this section is fine.

### §4 · Nagy képernyő — 1,013px

No layout defect. **61% placeholder** (619px across the phone shot and the TV shot). The
device-icon row, the beam, and the copy all behave.

This section is entirely dependent on two photographs that don't exist yet — it is the
purest "blocked on assets" band on the page.

### §5 · Programok — 2,258px · *tallest section*

| | |
|---|---|
| **Defect** | On long program names the lockup pill **wrapped onto two lines** (`REGGELI RUTINOK - NAPINDÍTÓ / PROGRAM`), breaking a component designed as a single pill. Measured: lockup heights of 31px and 39px in the same row. |
| **Fixed** | `nowrap` + ellipsis on `.pgs-lock .nm` below 900px. All lockups now 31px. |

**Watermark:** `REGGELI RUTINOK…` renders **864px wide on a 346px card** — 2.5× the card.
At 10% opacity this reads as texture rather than a broken label, and `FOUNDATION` (285px)
fits properly, so I'm leaving it. Worth knowing it's a function of how long the owner
names a program, not a fixed bug.

**Rail:** 346px visible of 2,061px total — 83% hidden, now with the edge mask added in
the previous pass.

Seven banners at 210–238px is ~1,500px. That's the section's floor unless the count is
capped, which is a content decision.

### §6 · Foundation — 1,370px

No defects found. The journey animates, chapter dots are now 44px tappable, block
labelling reads `1–5. edzés`, pacing is 4.2s.

### §7 · A heted — 803px

| | |
|---|---|
| **Defect** | **The week rendered 6 + 1.** Seven 44px days plus gaps needed 356px in a 350px row, so **Sunday wrapped to its own line**, centred and orphaned. |
| **Impact** | The page's single best interactive moment — the one that proves "you choose your days" — displayed a week that isn't a week. On the most common phone. |
| **Fixed** | `nowrap` + `flex: 1 1 0` with a 48px cap. All seven now 45px on one row at 320, 360, 390 and 430. |

This one also exposed a **cascade collision**: my first fix was placed in an earlier
`@media (max-width: 900px)` block and was silently overridden by a later block in the
same file setting `.wkp-day { min-width: 44px }`. Moved to the end of the file with a
comment explaining why. Worth watching — `landing.css` now has three mobile blocks.

### §8 · Haladás — 932px

No layout defect. 34% placeholder (two 4:5 frames). The anti-cheat line and the photo-
comparison copy both land.

### §9 · Amikor kész vagy — 811px

No defects. The marquee works, `· minta` labels now readable at 11px, and the honesty
sentence sits directly under the row. **The only band on the page with real photography**
— and it shows: it's the most finished-looking section on mobile.

### §10 · Kihívások — 867px

No defects. Cards, chips, and the group link all behave.

### §11 · Alexa — 1,390px

| | |
|---|---|
| **Defect** | My mobile rule set the portrait to `height: 62vw`, which at 390px is a **390×242 landscape box** — a landscape crop for a portrait subject, and only **17% of the section** on the band designated as the page's visual peak. |
| **Fixed** | `aspect-ratio: 4/5`, capped at `62vh`. Now 350×438 portrait. |

**Noted, not fixed:** the back-to-top button overlaps body text here (light circle over
dark text). That's normal FAB behaviour and it's `backdrop-filter`-backed, but it is the
one place on the page where two elements visually fight.

### §12 · Ár-horgony — 521px

No defects. Shortest band on the page and it earns its place.

### §13 · GYIK — 862px

No defects. Native `<details>`, ten items, all tappable.

### §14 · Előfizetés — 1,808px · *2nd tallest*

| | |
|---|---|
| **Defect** | The **"Legnépszerűbb" annual card rendered second** on mobile. On desktop the centre position reads as recommended; the moment the grid stacks, **first** reads as recommended — so the plan the whole pricing strategy steers toward was buried below the weekly plan. |
| **Impact** | Direct conversion cost on the section where the decision happens. |
| **Fixed** | `order: -1` on `.featured` below 900px. Order is now Éves → Heti → Havi. |

Three 291px cards stacked is 873px; the rest is the heading, trust row, footer CTA and
legal. Reasonable for the closing section.

---

## 2 · Verified after fixes

Confirmed against a freshly-restarted server with the served CSS chunk checked first.

| Check | 320×568 | 360×800 | 390×844 | 430×932 |
|---|---|---|---|---|
| Horizontal overflow | none | none | none | none |
| **Hero nav clipped** | ✅ no | ✅ no | ✅ no | ✅ no |
| **Week on one line** | ✅ | ✅ | ✅ | ✅ |
| WCAG 2.5.8 failures | **0** | **0** | **0** | **0** |
| Screens of scroll | 29.8 | 21.0 | 19.6 | 17.5 |

Plus: §3 text now precedes its media · §5 lockups all 31px · §11 photo 350×438 portrait ·
§14 order Éves → Heti → Havi.

---

## 3 · What this pass changed my mind about

**The placeholders aren't a "P2 asset item". They're the page's defining characteristic
on mobile.** 2,493px of striped grey — **15.2% of the entire page**, roughly three full
screens. §2 is 80% placeholder, §4 is 61%, §3 is 40%. No copy or layout work moves the
needle until those land, and §9 proves it: the one band with real photographs is
visibly the most convincing section on the page.

**Metrics found the accessibility problems; looking found the layout problems.** Every
defect in this document — the clipped nav, the orphaned Sunday, the buried annual card,
the landscape portrait, the media-first stack, the wrapped lockup — was invisible to
overflow/contrast/target-size checks and obvious in a screenshot. Both passes were
necessary; neither was sufficient.

---

## 4 · Still open

- **Scroll depth 17.5–29.8 screens.** The remaining levers are §5's seven banners and
  §14's stacked cards — both content decisions, not defects.
- **Nine placeholders** (§3 · §4 · §8 · §11 and §2's three).
- **`Feszes comb, kerek fenék`** on public workout cards, per the locked vocabulary call.
- **No section navigation on mobile** — deliberate, but if the page stays 20 screens it
  may deserve reconsidering.
- **`landing.css` now has three `@media (max-width: 900px)` blocks.** They should be
  consolidated before the next change; the §7 collision was a direct symptom.
