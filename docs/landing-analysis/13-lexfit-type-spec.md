# LEXFIT type system — the specification

Date: 2026-08-11. The deliverable the previous three documents were building toward.

| Doc | Role |
|---|---|
| `10-typography-spacing-spec.md` | measured what LEXFIT renders today |
| `11-typography-analysis.md` | diagnosed why |
| `12-apple-type-consistency-research.md` | measured how Apple solves it |
| **`13` (this)** | **the spec: derived for Poppins, mapped to every class** |

> ## ⬛ IMPLEMENTATION STATUS — 2026-08-11
>
> **Phases 1–5 are SHIPPED and verified.** Phase 6 (band tiers) is held because §5
> is a positioning decision, not a typographic one. Phases 7–8 untouched.
>
> **Phase 3 was revised by the specimen pass §6 asked for.** Poppins was rendered at
> 54/46/34/23px across every tracking value from 0 to −0.035 and looked at. The
> proposed table in §4 was wrong in one direction: LEXFIT is **over**-tracked at
> small display sizes, not under. At 23px/500 the shipped −0.020 already crowds
> "program"; at 34px/600 the shipped −0.028 crowds "kérdés". Fitted curve:
> `tracking(em) ≈ −(0.0003 × size + 0.005)`, banded as
> **≥70 −.028 | 50–69 −.022 | 36–49 −.018 | 26–35 −.015 | 20–25 −.012 | <20 0**.
> Net effect: the 80px hero got *tighter* (−.020 → −.028) and everything from 34px
> down got *looser*. Six display values → five tiers.
>
> **Mono tracking (13 values → 3) is deliberately NOT shipped.** `11-typography-
> analysis.md` §7 ranks it "invisible individually — fix last, or never", and
> retracking every chip and pill changes their widths, which is exactly how the
> two wrap regressions in `08-section-by-section-audit.md` happened. Low payoff,
> real risk; it should ride along with phase 6 when the pills get re-laid-out.
>
> Verified at 1440 / 1180 / 390 / 320: every landing element ≥14px now sits on the
> derived curve within 2px, all 14 bands share one 14px headline→body slot, and
> there is no horizontal overflow. The only off-curve elements left are the two
> deliberate display numerals (`.j-weeknum` 168px, `.pa-num b` 132px) and the app
> components, both explicitly out of scope (§8).

---

## 1 · The measurement that makes this spec possible

Doc 12 ended on a caveat: *"don't copy Apple's constants — Poppins has different
metrics."* That was a warning, not a number. So I measured both fonts through Canvas
`TextMetrics` at 100px em, weight 600, glyph set `Hxdpgy` (caps, x-height, ascender,
two descenders):

| | Poppins | SF Pro Display | Poppins is |
|---|---|---|---|
| Cap height | 69.7 | 66.2 | +5.3% |
| **x-height** | **54.8** | **44.9** | **+22.0%** |
| Ink height (asc + desc) | **101.3** | **88.3** | **+14.7%** |
| Natural line box | **140** | **115** | **+21.7%** |
| Width of `Hxdp` | 252.3 | 222.2 | +13.5% |

> **Apple's `leading = size + 4px` applied to Poppins leaves a 3px gap between lines
> where SF gets 13.3px.** At 80px, Poppins' ink is 81px tall in an 84px line. Not a
> style difference — descenders and caps would nearly touch.

This is the empirical confirmation of the caveat, and it gives us the correction factor.

## 2 · Deriving LEXFIT's leading rule

Apple's ramp, converted from "leading" to **optical gap** (leading − ink):

| Size | Apple leading | SF ink | **Gap** |
|---|---|---|---|
| 80 | 84 | 70.6 | 13.3 |
| 64 | 68 | 56.5 | 11.5 |
| 56 | 60 | 49.4 | 10.5 |
| 48 | 52 | 42.4 | 9.6 |
| 40 | 44 | 35.3 | 8.7 |
| 32 | 36 | 28.3 | 7.7 |
| 28 | 32 | 24.7 | 7.3 |
| 24 | 28 | 21.2 | 6.8 |
| 21 | 25 | 18.5 | 6.5 |

That gap column is almost perfectly linear: **gap ≈ 3.9 + 0.118 × size** (fits every
row to within 0.2px). Combine it with Poppins' ink of **1.013em**:

> ### Display / heading leading
> ```
> line-height = round(size × 1.131 + 3.9)
> ```
> ### Running-text leading (multi-line paragraphs, 14–17px)
> ```
> line-height = round(size × 1.013 + 10)
> ```

The second curve exists because Apple's body ramp keeps a **~10px** gap regardless of
size (17→25, 21→29), roughly double the display gap. Reading and scanning want
different air; that's a deliberate two-table system, not an inconsistency.

Below 14px, use the **display** curve — fine print is rarely more than two lines.

## 3 · Validating the rule against what LEXFIT ships today

This is the part that tells you the rule is real: it explains the existing errors, in
both directions.

| Class | Size | Renders | Spec | Delta |
|---|---|---|---|---|
| `.aq-close` | 60 | 61.2 (1.02) | **72** | **−11 too tight** |
| `.starter-title` | 54 | 55.1 (1.02) | **65** | **−10 too tight** |
| `.alexa-pull-big` | 52 | 54.6 (1.05) | **63** | **−8 too tight** |
| `.h-thin` | 46 | 47.8 (1.04) | **56** | **−8 too tight** |
| `.h-bold` | 34 | 36.7 (1.08) | **42** | **−5 too tight** |
| `.cap-title` | 23 | 34.5 (**1.50**) | **30** | **+4.5 too loose** |
| `.j-week` | 34 | 51.0 (**1.50**) | **42** | **+9 too loose** |
| `.amt` | 38 | 57.0 (**1.50**) | **47** | **+10 too loose** |
| `.body` | 16 | 25.3 (1.58) | **26** | **−0.7 ✓** |
| `.cap-body` | 15 | 23.3 (1.55) | **25** | −1.7 ✓ |
| `.step-b` | 14.5 | 22.5 (1.55) | 25 | −2.2 ✓ |

Two clean populations, and the reason for each:

1. **Every declared heading is 8–11px too tight.** Their ratios (1.02–1.08) were
   borrowed from a font carrying **15% less ink**. Correct for SF, wrong for Poppins.
2. **Every undeclared heading is 4–10px too loose** — the inherited `1.5` from §3 of
   the analysis.
3. **Body copy is already right.** It was set by eye and lands within 2px of the
   derived value everywhere. Nothing to fix.

> The headline finding of this whole exercise: **LEXFIT's body typography is correct
> and its heading typography is systematically wrong**, because body was tuned by
> looking and headings were tuned by copying ratios from a different typeface.

## 4 · The ramp

Seven roles. Every step carries exactly one size, weight, leading and tracking — the
size is the only decision.

| Token | Desktop | Mobile | Weight | LH desk | LH mob | Tracking |
|---|---|---|---|---|---|---|
| `--t-hero` | 72 | 44 | 300 | **85** | **54** | −0.030 |
| `--t-peak` | 56 | 36 | 300 | **67** | **45** | −0.028 |
| `--t-band-1` | 44 | 30 | 300 *or* 600 | **54** | **38** | −0.025 |
| `--t-band-2` | 32 | 24 | 300 *or* 600 | **40** | **31** | −0.020 |
| `--t-row` | 22 | 20 | 600 | **29** | **27** | −0.015 |
| `--t-card` | 15 | 14 | 700 | **21** | **20** | −0.010 |
| `--t-body` | 16 | 15 | 400 | **26** | **25** | 0 |
| `--t-body-sm` | 14 | 13 | 400 | **24** | **19** | 0 |
| `--t-fine` | 12 | 12 | 400 | **18** | **18** | 0 |

**Weights: 300, 400, 600, 700.** Down from seven. `500`, `800` and `900` survive only
inside embedded app components (§8) and the two display numerals (§7).

### Mono labels (IBM Plex Mono)

Three tiers instead of thirteen tracking values:

| Token | Size | Weight | LH | Tracking | Use |
|---|---|---|---|---|---|
| `--t-eyebrow` | 12 | 400 | 17 | **+0.140** | section eyebrows, badges |
| `--t-meta` | 11 | 400 | 16 | **+0.100** | chips, meta rows, fact pills |
| `--t-data` | 10 | 500 | 14 | **+0.050** | dense in-card data |

## 5 · Which band gets which tier — the open decision

This is the positioning call flagged in doc 11 §10. My proposal, based on what each
band is doing in the funnel:

| Tier | Bands | Why |
|---|---|---|
| **`t-band-1`** (44/30) | §1 Hogyan működik · §2 Edzés Alexával · §4 Programok · §6 Foundation · §7 A heted | *what it is, what you get, what makes it different* — the argument |
| **`t-band-2`** (32/24) | §3 Nagy képernyő · §8 Haladás · §9 Amikor kész vagy · §10 Kihívások · §12 GYIK | features, proof and support — real, but not the case |

Five and five. **This table is yours to overrule** — it encodes what you think matters,
not a typographic fact.

### Voice, decoupled from tier

The lowercase-300 voice (`.h-thin`) currently applies to whichever bands use
`FeaturePanel`. Under this spec it becomes a **property of the tier**, so it stops
tracking layout:

- **Option A** — `t-band-1` = 300 lowercase, `t-band-2` = 600 sentence case. The
  argument bands share one voice, support bands another. Legible rule.
- **Option B** — all band headlines 600 sentence case; retire the lowercase voice.
  Simplest, loses a distinctive brand mark.

I lean **A**: it keeps what's distinctive and makes the rule explainable in a sentence.

## 6 · Tracking

Four display tiers, from the table in §4. Rationale, since these are *not* Apple's
numbers: Poppins runs **13.5% wider** than SF and is geometric, so it wants more
negative tracking than SF at display sizes — Apple uses −0.015 at 80px; this spec uses
−0.030 at 72px. LEXFIT's existing display tracking (−0.020 to −0.030) is already in
the right zone; what it lacks is a rule.

**These four values need one eyeball pass at real size before they're locked.** They
are derived by reasoning from width metrics, not by looking — the one part of this
spec I would not ship unreviewed.

## 7 · Colour — use the ramp that already exists

Doc 10 found 24 alpha steps. `lexfit-tokens.css` **already defines a solid three-step
ink ramp** which the landing never uses:

```css
--ink:    oklch(0.235 0.014 168)   /* #18201d */
--ink-2:  oklch(0.430 0.022 168)
--ink-3:  oklch(0.520 0.024 168)
--d-ink:   oklch(0.965 0.008 168)  /* dark grounds */
--d-ink-2: oklch(0.730 0.030 168)
```

`.lxl` redefines `--ink` and then reaches for `opacity` and inline `oklch(… / .82)`
instead of `--ink-2` / `--ink-3`. That is the whole origin of the 24 steps.

| Role | Cream ground | Dark ground |
|---|---|---|
| Primary — headings | `--ink` | `--d-ink` |
| Secondary — body | `--ink-2` | `--d-ink-2` |
| Tertiary — meta, labels | `--ink-3` | `--d-ink-2` at 0.72 |
| Quaternary — fine print | `--ink-3` at 0.75 | `--d-ink-2` at 0.55 |

Per doc 12: secondary text should be a **different colour**, not the primary knocked
back — which is exactly what `--ink-2` already is. A dark ground still needs one or two
alpha steps because there is no `--d-ink-3`; that's a small token gap worth filling.

## 8 · The embedded-component boundary

`WorkoutCard`, `ChallengeCard` and `ProgramBanner` keep **their own** scale — they are
app components and must stay correct in the app. The landing adapts them at the
boundary only, through the tokens they already consume, rather than the current
per-property overrides.

Their weights (700/800/900) are **out of scope** for this spec. They are internally
coherent and the seam is what needs managing, not the components.

## 9 · Spacing

| Slot | Value |
|---|---|
| Band padding — standard | 96 / 96 |
| Band padding — dense (collection bands) | 64 / 64 |
| Band padding — peak (§11 Alexa, §13 Előfizetés) | 120 / 90 |
| Hero | 34 / 96 *(unchanged)* |
| eyebrow → headline | 10 |
| **headline → body** | **14** — the current mode; removes 12 / 16 / 24 / 28 |
| body → CTA | 26 |
| Body measure | 660px centred · 440px in panels |

## 10 · Retire `clamp()` for headings

Doc 12's structural finding: a `clamp()`ed size with a fixed `line-height` *ratio*
drifts out of pairing at every viewport between the bounds.

`.h-thin` is `clamp(30px, 3.4vw, 46px)` at `line-height: 1.04`:

| Rendered | Leading now | Spec | Error |
|---|---|---|---|
| 46px | 47.8 | 56 | −8.2 |
| 38px (≈1120px viewport) | 39.5 | 47 | −7.5 |
| 30px | 31.2 | 38 | −6.8 |

**Every clamped heading is wrong at every width, and the error changes continuously.**
Two literal steps at the existing `900px` breakpoint fix it, and match Apple's
observed behaviour (identical ramp; elements move *down* it at breakpoints).

Body copy may keep `clamp()` — its 15↔16px range is too small to matter.

## 11 · Migration map

Every current class → spec. **Bold = visible change.**

| Current | Now | Spec | Note |
|---|---|---|---|
| `.hero-copy h1` | 80.64/300/1.00 | **72**/300/85px | drops clamp |
| `.h-bold` (§1) | 34/600/1.08 | **44**/·/54px | → `t-band-1` |
| `.h-thin` (§2) | 46/300/1.04 | **44**/300/54px | → `t-band-1`, voice A |
| `.h-thin` (§3) | 46/300/1.04 | **32**/300/40px | → `t-band-2` |
| `.h-thin` (§8) | 46/300/1.04 | **32**/300/40px | → `t-band-2` |
| `.cap-title` (§4) | 23/500/1.50 | **44**/600/54px | **the big one** |
| `.cap-title` (§9, §10, §12) | 23/500/1.50 | **32**/600/40px | → `t-band-2` |
| `.starter-title` (§6, §7) | 54/600/1.02 | **44**/600/54px | down a step |
| `.alexa-pull-big` (§11) | 52/300/1.05 | **56**/300/67px | → `t-peak` |
| `.aq-close` (§11) | 60/300/1.02 | **56**/300/67px | → `t-peak`, becomes a heading |
| `.hrow-head h3` | 16/800/1.50 | **22**/600/29px | → `t-row` |
| `.fbg-name` | 16/600/1.50 | 16/600/**22px** | leading only |
| `.step-h` | 17/600/1.50 | **15**/700/21px | → `t-card` |
| `.amt` | 38/700/1.50 | 38/700/**47px** | leading only |
| `.j-week` | 34/300/1.50 | 34/300/**42px** | leading only |
| `.wordmark` ×3 | 19 / 24 / 26 | **24** everywhere | one size |
| `.body` | 16/1.58 | 16/**26px** | ≈ no change |
| `.cap-body` | 15/1.55 | 15/**25px** | ≈ no change |
| `.j-weeknum` · `.pa-num b` | 168 · 132 | **unchanged** | deliberate display numerals |

## 12 · Sequence

| Phase | Change | Risk | Visible |
|---|---|---|---|
| 1 | `line-height` on `.lxl` + explicit leading per §2 | **low** | yes — headings resolve |
| 2 | Ink ramp → existing `--ink-*` tokens | low | barely |
| 3 | Tracking → four tiers | low | no |
| 4 | Spacing slots | low | slightly |
| 5 | Retire `clamp()` on headings | medium | no (fixes drift) |
| 6 | **Band tiers — the §11 map** | **high** | **yes, changes the page** |
| 7 | Heading outline / H-levels | medium (SEO) | no |
| 8 | Embed token map | medium | no |

Phases 1–5 are defect fixes and can ship together. **Phase 6 is the design decision.**

## 13 · Open

1. **§5 tier map** — my five/five split, or yours?
2. **§5 voice** — Option A (voice per tier) or B (retire lowercase)?
3. **§6 tracking** — needs one look at real size before locking.
4. **`--d-ink-3`** — add a third dark-ground ink token, or keep two alpha steps there?
5. **§7 heading outline** — how far to push H-level correctness against current SEO.
