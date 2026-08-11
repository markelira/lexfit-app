# How Apple gets consistency without monotony — measured, then applied to LEXFIT

Date: 2026-08-11. Companion to `10-typography-spacing-spec.md` (LEXFIT data) and
`11-typography-analysis.md` (LEXFIT analysis). Scope is deliberately narrow: **the
heading-scale question raised in §10 of the analysis** — one size for every band
headline, or a deliberate ladder?

**Method.** Rather than recall Apple's system, I measured it. Computed styles read
live from `apple.com/macbook-pro` at **1710px** and **760px**, main content only
(global nav and footer excluded), deduped by spec signature. Plus the `apple-design`
skill's §15 (*The Details of UI Typography*, WWDC 2020) as the stated intent behind
what I measured.

**Limits, stated up front.** One product page, one brand, two viewports, one day. I
did not measure apple.com's homepage, Newsroom, or any Human Interface Guidelines
app-side ramp. Apple's marketing pages are not identical to each other. Treat the
*rules* below as well-evidenced and the *exact constants* as one page's instance.

---

## 1 · What the measurement actually found

### 1.1 The heading ramp — nine steps, and every step is fully determined

All values below are **weight 600**, SF Pro Display, measured at 1710px:

| Size | Line-height (ratio) | Line-height (px) | Tracking (em) |
|---|---|---|---|
| 80 | 1.050 | **84** | −0.0150 |
| 64 | 1.063 | **68** | −0.0090 |
| 56 | 1.071 | **60** | −0.0050 |
| 48 | 1.083 | **52** | −0.0030 |
| 40 | 1.100 | **44** | **0** |
| 32 | 1.125 | **36** | +0.0040 |
| 28 | 1.143 | **32** | +0.0070 |
| 24 | 1.167 | **28** | +0.0090 |
| 21 | 1.190 | **25** | +0.0110 |

Two things fall straight out of that table:

> **Leading = font-size + 4px.** Every step. 80→84, 64→68, 56→60, 48→52, 40→44,
> 32→36, 28→32, 24→28, 21→25. Not a ratio — a **constant offset**. The *ratio* is a
> consequence (1.05 at 80px, 1.19 at 21px), which is exactly the skill's rule that
> "leading tracks size inversely," expressed as arithmetic instead of judgement.

> **Tracking is one value per size, crossing zero at 40px.** Negative above, positive
> below. There is no per-element decision: the size picks the tracking.

### 1.2 Two weights. On the entire page.

Measured weights across every heading, paragraph and list item in main content:
**400 and 600.** That's it.

- 600 → every heading, at every size, plus inline emphasis inside body copy.
- 400 → every body paragraph.

### 1.3 The body ramp is a *separate* table, not a continuation

| Size | Line-height (px) | Ratio | Tracking |
|---|---|---|---|
| 21 | 29 | 1.381 | +0.011 |
| 17 | 25 | 1.471 | −0.022 |
| 17 | 21 | 1.235 | −0.022 |
| 14 | 20 | 1.429 | −0.016 |
| 14 | 18 | 1.286 | −0.016 |
| 12 | 16 | 1.333 | −0.010 |

Note the discontinuity: a 21px **heading** tracks **+0.011**; 17px **body** tracks
**−0.022**. Tracking is not one monotonic curve across the whole range.

The reason is visible in the font stack: **`SF Pro Display` at ≥19px, `SF Pro Text` at
≤20px.** Two optical cuts of one typeface, each with its own tracking table, crossing
over around 20px. Apple isn't applying a formula across the range — it is switching to
a font drawn for that size.

### 1.4 Colour: three values carry 96% of all text

| Colour | Instances |
|---|---|
| `#f5f5f7` (primary on dark) | 104 |
| `#1d1d1f` (primary on light) | 81 |
| `#86868b` (secondary, both grounds) | 24 |
| everything else combined | 8 |

**Three named colours**, not an alpha ramp. Secondary text is a *different colour*
(`#86868b`), not the primary colour at reduced opacity.

### 1.5 Section rhythm: essentially one number

Top-level sections, padding top/bottom at 1710px:

```
144/144   144/216   0/144   144/0   144/144   144/144   144/0   144/216   144/0
```

**144px**, with **216** (= 144 × 1.5) as the "extra breath" variant and **0** where a
section abuts a full-bleed image. One value, one modifier, one exception.

### 1.6 Responsive strategy: step down the ramp, never interpolate

At 760px the ramp is **identical** — every size keeps exactly the same leading and
tracking. What changes is *which step each element occupies*:

| | 1710px | 760px |
|---|---|---|
| Largest heading | 80 | **64** (80 step unused) |
| Most common heading | 28 (61×) | **24** (38×) |
| Sizes present | 80…21 | 64…21 |

> Apple does **not** use `clamp()`-style continuous interpolation for headings. A
> heading is always sitting on a real step of the ramp. It moves down the ladder at
> breakpoints; it never lands between rungs.

---

## 2 · So how is it not boring?

This is the actual question, and the measurement answers it by elimination. Apple's
variety budget is spent almost nowhere in the type system:

- **Not on weight** — two weights, page-wide.
- **Not on leading or tracking** — both derived from size, zero decisions.
- **Not on colour** — three values.
- **Not on section spacing** — one value.
- **Not on font** — one family, two optical cuts.

It is spent on four other things:

**1. Scale contrast, from a fixed ramp.** An 80px headline sits directly above 17px
body — a **4.7× jump** inside one section. The range is dramatic; the *inventory* is
small. Drama comes from how far apart two steps are, not from how many steps exist.

**2. Ground flipping.** Sections alternate white / near-black / `#f5f5f7`. The page's
visual rhythm is carried by the **background**, which is why the type can afford to
stay identical.

**3. Media and choreography.** Full-bleed product photography, video, scroll-linked
sequences. This is where "interesting" lives.

**4. Copy voice.** *"Happily ever faster." "Fresh faced. Timelessly Mac."* Short,
rhythmic, playful. The words do the personality work that a designer might otherwise
try to get from a typeface change.

> **The principle:** a locked type system isn't the thing that makes a page boring —
> it's the thing that *frees* the page to be interesting somewhere the reader actually
> notices. Varying the type treatment doesn't read as "expressive," it reads as
> "unresolved," because the reader can't tell whether a size change means something.

This is §16's **Craft** ("nothing is random — every value is a deliberate choice you
can defend") in service of §16's **Simplicity** ("use hierarchy — order, spacing,
contrast — so the most important thing is the most obvious"). If size is spent on
layout pattern, it can no longer signal importance.

---

## 3 · What transfers to LEXFIT — and what does not

### Transfers

| Apple rule | LEXFIT today | Gap |
|---|---|---|
| Leading derived from size | 8 elements at inherited 1.5; others 0.98–1.08, no rule | **the §3 defect** |
| One tracking per size | 13 mono values, 6 display values | inventory |
| Two weights for text | 5 heading weights (300/500/600/800/900) | inventory |
| 3 text colours | 24 alpha steps | §5 of the analysis |
| One section rhythm + modifier | 5 rhythms | mostly fine already |
| Fixed ramp, step at breakpoints | `clamp()` everywhere | **see below** |

### Does **not** transfer

**LEXFIT uses Poppins, not SF Pro.** Copy the *rule*, never the constants:

- Poppins has **no optical-size axis** — there is no Display/Text split to switch at
  20px. LEXFIT needs **one** continuous tracking curve, not Apple's two tables.
- Poppins has a large x-height and geometric, wide-set letterforms. `size + 4px`
  leading is likely too tight for Poppins at display sizes; the constant must be
  re-derived by eye, not copied.
- Apple's **positive** tracking below 40px is an SF-specific correction. Poppins at
  20–30px probably wants ~0, not +0.009.

**LEXFIT's `clamp()` breaks the size↔leading pairing.** This is a finding, not a
style preference. `.h-thin` is `clamp(30px, 3.4vw, 46px)` with a *fixed* `line-height:
1.04`:

| Rendered size | Leading at 1.04 | Apple's rule would want |
|---|---|---|
| 46px (desktop) | 47.8px (size + 1.8) | ~50px (size + 4) |
| 30px (mobile) | 31.2px (size + 1.2) | ~34px (size + 4) |

Because leading is locked as a *ratio* while size varies continuously, the heading is
too tight at both ends **and gets progressively wronger as it shrinks**. Every
`clamp()`ed heading on the page has this problem. Apple sidesteps it entirely by
stepping between fixed pairs.

---

## 4 · How this revises the proposal in `11-typography-analysis.md`

My §8.1 proposed **one size (42/30) for every band headline**. The measurement says
that is the wrong correction — it fixes the inconsistency by deleting the hierarchy.

Apple's page has **nine** heading sizes and does not read as chaotic, because:

1. Each size has exactly one leading and one tracking (no combinatorial explosion).
2. Which size an element gets is a **hierarchy** decision.
3. Only two or three steps are actually in heavy use per page — the rest are accents.

So the real diagnosis of LEXFIT's §2 problem sharpens:

> The defect was never "too many heading sizes." It is that **size is being spent on
> layout pattern instead of importance** — and that each size carries its own ad-hoc
> weight/leading/tracking, so the sizes don't read as members of one family.

**Revised recommendation:** keep a ramp, shrink the *decision space*, and re-point the
selection rule from layout → hierarchy.

| Tier | Desktop | Mobile | Used by |
|---|---|---|---|
| `t-hero` | 72 | 44 | hero h1 only |
| `t-peak` | 56 | 36 | §11 pull quote, `.aq-close` |
| **`t-band-1`** | **44** | **30** | the bands carrying the argument — Programok, Foundation, A heted, Alexával |
| **`t-band-2`** | **32** | **24** | supporting bands — Hogyan, Nagy képernyő, Haladás, Finish, Kihívások, GYIK |
| `t-row` | 22 | 20 | in-band row headings |
| `t-card` | 15 | 14 | card titles |

Two band tiers, not one size and not five. **Which tier a band gets is a positioning
decision** — that's the question I flagged in §10 and it stays yours; what changes is
that it's now a decision about importance rather than an accident of layout.

**One weight for band headlines.** Pick 600 *or* 300, not both. The current
`.h-thin` 300-lowercase voice is genuinely distinctive — if it survives, it should
apply to a *tier*, not to whichever bands happen to use `FeaturePanel`.

**Derived pairing, LEXFIT-tuned** (constants to be validated by eye in Poppins, not
copied from SF):

| Size band | Leading | Tracking |
|---|---|---|
| ≥ 56 | size + 5px | −0.030 |
| 40–55 | size + 5px | −0.025 |
| 28–39 | size + 5px | −0.020 |
| 20–27 | size + 6px | −0.015 |
| 15–19 | size + 7px | −0.010 |
| body 14–16 | size + 8px (≈1.5) | 0 |
| mono ≤ 13 | size + 5px | one of **3** values |

**Set `line-height` on `.lxl`.** The root has none, which is the mechanical source of
all eight 1.5-leading bugs. That fix is independent of every design decision above and
should ship regardless.

**Consider dropping `clamp()` for headings** in favour of two or three breakpointed
steps, so leading and tracking stay paired with the size actually rendering. This is
the largest structural change suggested here and the one I'd want to prototype before
committing.

---

## 5 · What LEXFIT already does that matches

Worth stating so the fix doesn't destroy it:

- **Ground flipping is already there** — cream / navy / sage / full-photo alternating
  across 14 bands. This is Apple's primary variety mechanism and LEXFIT has it.
- **Scale contrast is already there** — `.j-weeknum` at 168px and `.pa-num` at 132px
  are exactly the kind of dramatic single-purpose moments Apple uses an 80px headline
  for. They are not the problem.
- **Media carries interest** — the looping player recording, the finish-card marquee,
  the journey animation, the week picker.
- **The copy voice is strong** — *"Nem egy program. Az összes." "Innen indulsz."
  "Egyedül nehéz. Együtt muszáj."* This is the register Apple's copy works in.

LEXFIT is spending its variety budget in the right places already. The type system is
*also* spending it, which is the redundancy — and unlike the others, type variety
doesn't read as expressive, it reads as unresolved.

---

## 6 · Open questions this research does not answer

- **The Poppins constants.** Every offset in §4 is Apple's rule with a guessed
  adjustment. They need to be set by looking at Poppins at each size, not by arithmetic.
- **Which bands are tier 1 vs tier 2.** A positioning call, not a typographic one.
- **Whether to drop `clamp()`.** Structurally the most correct change and the most
  invasive; worth a prototype on two or three bands before a page-wide commit.
- **Apple's mobile section rhythm** — I measured 144px only at 1710px.
- **Generalisation.** One Apple page. If this is going to drive a rebuild, measuring
  a second and third page would be cheap insurance.
