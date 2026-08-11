# LEXFIT homepage — typography & spacing analysis

Date: 2026-08-11. Built entirely on the measurements in
`10-typography-spacing-spec.md`. Every claim here traces to a number there.

**Analysis and proposal. Nothing implemented.**

---

## 0 · The one-paragraph version

The page is not suffering from random drift. It has **three coherent heading voices**
that are correctly and consistently applied — but the rule that picks between them is
*layout pattern*, not *importance*. So a section's headline size is decided by whether
it happens to contain a two-column panel, a rail, or a full-width statement. Four of
the most commercially important bands got the smallest headline on the page, at 23px,
from a class literally named `.cap-title` — a **caption** class. On top of that sits
one mechanical defect (a missing root `line-height`) that puts eight display-size
elements at body leading, and an inventory problem (13 tracking values, 24 alpha
steps) that nobody chose deliberately.

---

## 1 · What is actually right — read this before changing anything

Over-correcting would cost more than the current state. These are working:

- **Two font families, loaded properly.** Poppins + IBM Plex Mono, no fallback
  flashes, no third face. *The "font feels different" impression is not a font
  problem* — it is weight, size and leading varying within one role (§2).
- **CTA pills are perfectly consistent** — 13/600/0.10em across all three variants,
  identical padding, one height difference of 2px caused by a border. This is the
  proof that a named role produces consistency; pills have one.
- **The band rhythm is nearly a system already:** 96/96 (×6) and 64/64 (×4) cover 10
  of 14 bands. Only three exceptions exist, and two are defensible (hero, and the
  Alexa peak at 120/90).
- **The app-embedded scale is internally coherent.** `WorkoutCard`, `ChallengeCard`
  and `ProgramBanner` were designed as a set and are consistent *with each other*.
  They are not the inconsistency; the **seam** between them and the landing is (§6).
- **Body copy is 88% consistent** — `.cap-body` 15/1.55 and `.body` 16/1.58 cover
  almost everything. The five outliers are genuinely small.

## 2 · Root cause 1 — three heading voices, selected by layout instead of hierarchy

This is the finding that explains most of the perceived inconsistency.

| Band | Headline class | px | wt | lh | Layout pattern |
|---|---|---|---|---|---|
| 1 Hogyan működik | `.h-bold` | 34 | 600 | 1.08 | 3-step row |
| 2 Edzés Alexával | `.h-thin` | **46** | 300 | 1.04 | FeaturePanel |
| 3 Nagy képernyő | `.h-thin` | **46** | 300 | 1.04 | FeaturePanel |
| 8 Haladás | `.h-thin` | **46** | 300 | 1.04 | FeaturePanel |
| 6 Foundation | `.starter-title` | **54** | 600 | 1.02 | full-width statement |
| 7 A heted | `.starter-title` | **54** | 600 | 1.02 | full-width statement |
| 11 Alexa | `.alexa-pull-big` | 52 | 300 | 1.05 | peak band |
| 4 **Programok** | `.cap-title` | **23** | 500 | **1.50** | collection + rail |
| 9 Amikor kész vagy | `.cap-title` | **23** | 500 | **1.50** | collection + marquee |
| 10 Kihívások | `.cap-title` | **23** | 500 | **1.50** | collection + rail |
| 12 GYIK | `.cap-title` | **23** | 500 | **1.50** | collection + list |

The pattern is real and consistent: **every** FeaturePanel gets 46/300 lowercase,
**every** statement band gets 54/600, **every** collection band gets 23/500. Nobody
was careless. But the consequence is:

> **"Nem egy program. Az összes."** — the headline over the entire product catalog,
> 7 programs and 47 workouts — renders at **23px/500**, while **"Innen indulsz."** over
> a single starter program renders at **54px/600**. Same role. **2.35× apart.**

A visitor reads size as importance. The current page tells them the catalog matters
less than one program, and that the FAQ and the challenge archive matter less than the
week picker. That is the "no consistent headers and subheaders" feeling, precisely
located.

**Why it happened:** the classes are named after the *section that first needed them*
(`starter-title` = the starter program; `cap-title` = a caption) rather than after a
role in a hierarchy. New sections picked whichever class matched their layout.

## 3 · Root cause 2 — a missing root `line-height` (mechanical, not aesthetic)

`.lxl` sets `font-family`, `background` and `color` but **no `line-height`**. Anything
that does not declare one therefore inherits the browser default (~1.5). At body sizes
that is invisible. At display sizes it is a broken heading.

Eight elements are affected:

| Element | px | rendered lh | what a sized heading should be |
|---|---|---|---|
| `.amt` (pricing) | 38 | **1.50** | ~1.05 |
| `.j-week` | 34 | **1.50** | ~1.08 |
| `.wordmark` | 24 / 26 | **1.50** | ~1.10 |
| `.cap-title` | 23 | **1.50** | ~1.15 |
| `.step-h` (desktop) | 17 | **1.50** | ~1.30 |
| `.hrow-head h3` | 16 | **1.50** | ~1.30 |
| `.fbg-name` | 16 | **1.50** | ~1.30 |
| `.chc-word` | 15 | **1.50** | ~1.35 |

Every heading that *does* declare a line-height sits at **0.98–1.08**. So the page
contains two populations: headings that were given leading, and headings that were
forgotten. There is no middle.

This is the same defect already found and fixed once on `.alexa-pull-big` (it was at
1.5 before being set to 1.05). **It was never one element — it is a category**, and it
will keep recurring for every new heading until the root declares a default.

`.step-h` is the proof: it declares `line-height: 1.25` **only inside the mobile media
query**, so it is correct at 390px and wrong at 1440px.

## 4 · Root cause 3 — tracking and leading are hand-set per class

Apple's rule (and standard type practice): **tracking is size-specific, and leading
tracks size inversely.** Neither is derived here; both are typed per class.

Result — **13 letter-spacing values across 31 mono labels**, six across nine display
headings:

```
mono:     .030 .040 .050 .060 .070 .080 .090 .100 .110 .120 .130 .140 .160
display:  −.015 −.020 −.022 −.025 −.028 −.030
```

Two labels of the *same size* get different tracking (`.eyebrow` 11px/.140 vs
`.hero-nav .links` 11px/.130 vs `.starter-facts` 11px/.050), and two headings of
almost the same size get different tracking (`.h-thin` 46/−.022 vs `.alexa-pull-big`
52/−.030). None of these differences is perceptible individually; collectively they
are why nothing feels locked to a grid.

## 5 · Root cause 4 — alpha is being used as a colour scale

**24 alpha steps** over two base colours: 10 on cream, 14 on dark.

```
cream:  1 .95 .90 .82 .78 .75 .72 .70 .66 .60
dark:   1 .96 .94 .82 .80 .78 .74 .72 .70 .68 .66 .62 .60 .50
```

Nobody can distinguish `.70` from `.72`, or `.94` from `.96`. These are not decisions,
they are accumulated one-offs. The functional distinctions the page actually makes are
about four: **heading / body / meta / fine print**. §3's two adjacent `.body`
paragraphs at α.80 and α.62 are the clearest symptom — same class, same band,
consecutive, two different colours.

## 6 · Root cause 5 — the `.lxl` / `.lx-embed` seam is unmanaged

Bands 4, 6 and 10 render real app components. Two internally-coherent scales meet with
no rule for the join:

| | Landing scale | App scale (embedded) |
|---|---|---|
| Heading weights | 300 / 500 / 600 | **700 / 800 / 900** |
| Smallest text | 12px | **8.5px** |
| Card title leading | — | 1.22 / 1.30 |

Reusing the real components is the **right** decision (it is what stopped the landing
advertising a product that no longer exists). But the landing currently adapts them
with per-property overrides — `.lx-embed .chc-name { font-size: 14px }` and so on —
rather than mapping the app's tokens to landing values once at the boundary.

Also from the data: `.wc-name` renders `#18201d` in band 4 and `#ffffff` in band 6 —
correct, since the card sits on different grounds — but it is achieved by two separate
rules, not one token.

## 7 · Severity — what a visitor perceives vs. what only a spreadsheet sees

Not all 34 font sizes are a problem. Ranking honestly:

**Perceptible, affects how the page reads (fix first)**
1. §2 — collection bands at 23px vs statement bands at 54px. *The* issue.
2. §3 — eight display elements at 1.5 leading. Visible as loose, unresolved headings.
3. §5 — the α.80/α.62 pair in band 3 and similar near-duplicates.
4. Heading→body gap: 12 / 14 / 16 / 24 / 28 where 14 is the mode.

**Structural, affects SEO/accessibility not looks (fix second)**
5. Heading outline (§A8 of the spec): H3 for four top-level sections while seven
   program-banner titles are H2 *nested inside one of them*; two bands have no heading
   element; the 60px `.aq-close` is a `<p>`.

**Inventory, invisible individually (fix last, or never)**
6. 13 mono tracking values, 6 display tracking values.
7. 34 font sizes — but note **~12 of these are inside self-contained components**
   (`.fs-v` at five sizes is one component scaling itself; that is correct behaviour,
   not drift). The landing's *own* scale is closer to 20 sizes.
8. Five band-padding rhythms — two are deliberate.

---

## 8 · Proposed system

### 8.1 Heading roles — named by hierarchy, not by section

Five roles replace nine treatments. **The three voices survive** — they are brand
assets — but they stop encoding importance.

| Role | Desktop | Mobile | Weight | LH | Tracking | Case | Where |
|---|---|---|---|---|---|---|---|
| `t-display` | 80 | 44 | 300 | 1.00 | −0.020 | upper | hero h1 only |
| `t-peak` | 56 | 34 | 300 | 1.04 | −0.030 | sentence | §11 pull quote + `.aq-close` |
| `t-band` | **42** | **30** | 300 *or* 600 | 1.06 | −0.025 | lowercase *or* sentence | **every band headline** |
| `t-row` | 20 | 18 | 600 | 1.20 | −0.015 | sentence | in-band row headings |
| `t-card` | 15 | 14 | 700 | 1.28 | −0.010 | sentence | card titles |

**The key move:** `t-band` is one size for every section headline. The *voice*
(300 lowercase vs 600 sentence-case) still varies by layout pattern — that keeps the
page's character — but **size no longer lies about importance**.

Consequences to accept, stated plainly:
- `.starter-title` drops **54 → 42** ("Innen indulsz.", "Te mondod meg, hány nap.")
- `.h-thin` drops **46 → 42** (three FeaturePanels)
- `.cap-title` rises **23 → 42** (Programok, Finish, Kihívások, GYIK) — the big change
- `.h-bold` rises **34 → 42** (Hogyan működik)

### 8.2 Leading, derived from size

Set `line-height: 1.5` on `.lxl` as the inherited default, then:

| Size band | Leading |
|---|---|
| ≥ 48px | 1.00 – 1.04 |
| 32 – 47px | 1.06 |
| 20 – 31px | 1.15 – 1.20 |
| 15 – 19px | 1.28 – 1.35 |
| body 14 – 16px | 1.55 |
| ≤ 13px | 1.45 |

This alone fixes all eight elements in §3 and stops the defect recurring.

### 8.3 Tracking, derived from size

| Size band | Tracking |
|---|---|
| ≥ 48px | −0.030 |
| 32 – 47px | −0.025 |
| 20 – 31px | −0.020 |
| 15 – 19px | −0.015 |
| body | 0 |
| **mono ≥ 12px** | **+0.14** (eyebrow / label) |
| **mono 10 – 11.5px** | **+0.10** (meta / chip) |
| **mono ≤ 9px** | **+0.05** (dense data) |

13 mono values → **3**. 6 display values → **4**.

### 8.4 Ink ramp — 24 steps → 8

| Token | Cream ground | Dark ground | Use |
|---|---|---|---|
| `--ink-1` | `#18201d` α1 | `#fff` α1 | headings, emphasis |
| `--ink-2` | α **.82** | α **.82** | body copy |
| `--ink-3` | α **.66** | α **.66** | meta, labels, chips |
| `--ink-4` | α **.50** | α **.50** | fine print, disabled |

Everything currently at .95/.90/.78/.75/.72/.70 collapses to .82 or .66.

### 8.5 Spacing

| Slot | Value |
|---|---|
| Band padding — standard | 96 / 96 |
| Band padding — dense (collection bands) | 64 / 64 |
| Band padding — peak (§11, §13) | 120 / 90 |
| Hero | 34 / 96 (unchanged) |
| eyebrow → headline | 10 |
| **headline → body** | **14** (the current mode; removes 12/16/24/28) |
| body → CTA | 26 |
| body max-width | 660px centred / 440px in panels |

### 8.6 The embed boundary

Replace per-property overrides with one token map at `.lx-embed`, so the app's
components inherit landing values through the variables they already use, rather than
being patched class by class. Cards keep their own internal proportions — that is
correct — but their type sizes and ink come from the landing ramp on this page.

---

## 9 · Migration, in risk order

| Phase | Change | Risk | Visible? |
|---|---|---|---|
| 1 | Root `line-height: 1.5` + explicit leading on the 8 affected elements | **low** — pure fix | yes, headings tighten |
| 2 | Ink ramp → 4 steps per ground | low | barely |
| 3 | Tracking → derived tiers | low | no |
| 4 | Spacing slots (gap → 14 everywhere) | low | slightly |
| 5 | **Heading roles → `t-band` at one size** | **high** | **yes — this changes the page** |
| 6 | Heading outline / semantics (H2/H3 levels) | medium (SEO) | no |
| 7 | Embed token map | medium | no |

Phases 1–4 are safe and can ship together. **Phase 5 is a design decision, not a
cleanup** — it is the one that needs your sign-off before I touch it.

---

## 10 · Decisions I need

1. **Phase 5 — one band-headline size?** The recommendation is 42/30 for all eleven.
   The alternative is a deliberate two-tier ladder (e.g. 48 for the four "argument"
   bands, 36 for the four "collection" bands) — more nuanced, but it needs an explicit
   rule for which band is which, and that rule is a positioning decision.
2. **Does `.h-thin`'s lowercase voice stay?** It is currently on 3 of 11 bands. Keeping
   it at the same size as the bold voice is coherent; dropping it is simpler.
3. **`.aq-close` (60px "Egyedül nehéz. Együtt muszáj.")** — keep at peak size as the
   page's emotional close, or bring into `t-peak` at 56?
4. **How far to push the outline fix?** Making every band headline an H2 is correct
   semantically but changes the document structure Google currently sees.

I'd suggest shipping phases 1–4 now — they are unambiguous defects — and treating
phase 5 separately once you've answered #1.
