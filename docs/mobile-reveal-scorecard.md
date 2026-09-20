# The Mobile Reveal Scorecard — checklist + evaluation

> Council takes below are **simulation** — built from each advisor's published frameworks, not
> their actual review.

**Date:** 2026-09-13 · **Subject:** the mobile results screen at `/ujrakezdes/terv` (post
R1–R12 + v2 + rail v3 + mobile pass, commit `865d159`) · **Lenses:** marketing-council
(Schwartz · Brunson · Hormozi · Sutherland · Godin), site-architecture (section order as
one-page IA), copywriting.

**The mobile page as shipped (section order):**
`88% bar + endowed caption → B1 plan card (echo chips · week · milestones · stats) →
B2 fold offer (proof · CTA · dated timeline · calm) → R3 curve → R4 start-day →
FREE first workout (real player) → B3 „Ismerős?" → B8 Alexa + cohort → shelf (real cards) →
B6 full offer (stack · sum · rhythm · honesty) → B9 anti-avatar → B10 FAQ (billing first) →
B11 close → sticky bar`

---

## The checklist — 26 crucial elements of a converting mobile quiz-reveal

Sources: the funnel research corpus (Noom/MadMuscles/Reverse Health teardowns, RevenueCat,
Adapty, Funnelfox), the behavioral primaries (labor illusion, endowed progress, Fresh Start,
implementation intentions), and the three skills' frameworks. ✅ pass · 🟡 partial · 🔴 miss.

### A · Arrival — the first three seconds
| # | Element | Verdict | Evidence |
|---|---|---|---|
| A1 | The quiz's payoff (the plan) fills the first viewport — no scroll to see what she came for | ✅ | B1 plan card is the fold |
| A2 | Personalization visibly echoed — her answers named back, not generic praise | ✅ | answer chips + "3 nap, 20 perc, a te szintedhez" |
| A3 | Endowed-progress frame: payment reads as completing, not starting | ✅ | 88% bar + "már csak az indulást válaszd" |
| A4 | The plan is *watched being built* (labor illusion) before it appears | ✅ | PlanBuild beat, her chips echoed (fresh quiz only — correct) |
| A5 | Fast first paint in the FB webview — text-first LCP, media lazy | ✅ | LCP is the plan card (text); posters `loading=lazy`; no player until tapped |

### B · The offer
| # | Element | Verdict | Evidence |
|---|---|---|---|
| B1 | Price flagged inside the first two viewports — earned later, never hidden | ✅ | B2 fold offer directly under the plan card |
| B2 | One benefit-worded CTA, identical everywhere | ✅ | "Kezdem — az első hét 490 Ft" ×4 |
| B3 | Full cost transparency: intro → renewal **amount and date** | ✅ | "Ma: 490 Ft → szept 20-tól 1 990 Ft/hét" |
| B4 | Cancel-anxiety killer touching the CTA | ✅ | "A megújulás előtt e-mailben szólunk…" under every CTA |
| B5 | Anchor + per-day reframe for the upgrade path | ✅ | rhythm cards, 109 Ft/nap beside the full annual price |
| B6 | **Risk reversal beside the price** | 🔴 | guarantee built but DARK — blocked on the ÁSZF signature (owner). The single biggest known conversion asset sitting off |
| B7 | The value stack lands on one number | ✅ | "Mindez az első héten: 490 Ft." |
| B8 | Zero dark patterns (no countdowns, fake badges, dishonest preselection) | ✅ | by design; also the GVH/DFA line |

### C · Certainty & proof — the audience's real objection ("will I stick with it")
| # | Element | Verdict | Evidence |
|---|---|---|---|
| C1 | Try the actual product before paying | ✅ | first workout free, in the real player with the full HUD — category-exceptional |
| C2 | The product shown as itself (real footage, not abstractions) | ✅ | hero card + shelf posters/animated previews |
| C3 | The mechanism made visible — why THIS survives where past attempts failed | ✅ | the curve with the „kihagyott hét — nem nulláz" dip |
| C4 | Coach presence + story before the ask | ✅ | Alexa (epiphany-bridge order) above the offer, cohort line |
| C5 | Social proof with faces / member stories | 🟡 | only the "1 200+" count — no consented member photos exist (B5 asset constraint, owner) |
| C6 | Money objections answered within a thumb-flick of the offer | ✅ | FAQ leads with "Mikor és mennyit vonnak le?" |
| C7 | **Beginner self-efficacy lines at the point of sale** | 🟡 | the 4 personalized certainty lines ("Kezdőknek tervezve", "térdkímélő párja"…) exist **only in the desktop rail** — mobile B6 still sells with the generic 9-row list. The primary surface is missing the page's best certainty device |

### D · Flow — section order as one-page architecture
| # | Element | Verdict | Evidence |
|---|---|---|---|
| D1 | Narrative order: payoff → price flag → belief → try → story → catalogue → full offer → objections → close | ✅ | matches the winning "flag price early, earn it, ask fully later" shape |
| D2 | A path to yes at every scroll position | ✅ | sticky bar (yields to the close CTA), fold offer, B6, close |
| D3 | No dead ends — locked content routes to the offer | ✅ | locked shelf cards scroll to B2 |
| D4 | Single-purpose page: no nav, no exits | ✅ | logo-only chrome |
| D5 | Page length earns itself | 🟡 | ~11 beats is long even by category standards; the education is evidence-backed (2%→15% pre-paywall test) but unproven HERE — `lx_ujrakezdes_section` now measures exactly this. Judge with data, not taste |
| D6 | No redundant beats | 🟡 | B3 „Ismerős?" now partially duplicates the curve's caption (both carry the two-rules idea). Merge candidate once section data confirms low engagement |

### E · Copy
| # | Element | Verdict | Evidence |
|---|---|---|---|
| E1 | Headline is her outcome, in her register | ✅ | "A heted, készen." — not a product name |
| E2 | Specific numbers over adjectives | ✅ | 20 perc · 0 Ft eszköz · heti 3 · 490 Ft |
| E3 | Voice-of-customer language | ✅ | "majd hétfőn", "Nem az akaraterővel van baj" — the market's own words |
| E4 | One idea per section | 🟡 | B6 carries five jobs (list + sum + rhythm + honesty + youtube line) — densest block on the page |
| E5 | CTA = action + what she gets | ✅ | verb + outcome + price |
| E6 | Honesty as differentiation preserved | ✅ | "havi olcsóbb", no deadlines, "a terved így is a tiéd" (selftest-guarded) |
| E7 | No hype register (exclamation marks, buzzwords) | ✅ | deliberate throughout |

### F · Mobile mechanics
| # | Element | Verdict | Evidence |
|---|---|---|---|
| F1 | ≥44px touch targets, ≥12.5px informational type, zero horizontal overflow | ✅ | verified this session (46px chips; dip 14.5px effective) |
| F2 | Sticky CTA appears after the fold offer, yields to the close | ✅ | dual IntersectionObserver |
| F3 | Edge-to-edge snapping media carousel | ✅ | shelf bleeds into the grid gutter |
| F4 | Webview-safe path to payment | ✅ | Android intent:// breakout + hosted-checkout fallback (upstream, intact) |
| F5 | Reduced-motion / a11y equivalents everywhere | ✅ | loader, curve, cards, focus states |

**Score: 21 ✅ · 4 🟡 · 1 🔴** — and the one 🔴 (guarantee) plus one 🟡 (member photos)
are owner-blocked, not design gaps. The one *code-fixable* gap is **C7**.

---

## Council takes (short session — the bench reconvened on the scorecard)

**Schwartz** — the mobile page now meets a Problem-Aware prospect correctly at every stage:
payoff, mechanism, proof, offer. His remaining note is C7: the certainty lines are the page
speaking the prospect's own words back to her, and they exist only where 0% of the traffic is.
Put the market's language where the market actually stands. **Bottom line:** ship the fit-lines
to mobile; the rest is measurement.

**Brunson** — the funnel spine is right: hook (plan) → story (Alexa) → offer (stack → one
number). D5/D6 are his itch: eleven beats before the full close is a long walk on a phone, and
B3 now restates what the curve already proved. He'd cut B3 tomorrow. **Bottom line:** let the
section analytics run two weeks, then delete the beat nobody reads.

**Hormozi** — the value equation on mobile: outcome ✅, time ✅, effort ✅, certainty still the
weak variable — and the two strongest certainty devices are the two gaps: the dark guarantee
(owner's signature away) and the missing fit-lines (one component away). He'd also note the
free workout IS the certainty play and it's live — "you built try-before-you-buy for a
subscription; now put the guarantee next to the price and stop leaving money on the table."
**Bottom line:** the ÁSZF signature is worth more than any further design work.

**Sutherland** — the psycho-logic reads correctly now: watched labor, owned plan, honest
renewal math, a dip drawn on purpose. His warning is against fixing D5 by amputation: the
page's length is partly its *costly signal* of seriousness in a category of one-screen
squeeze pages. Cut only what the data says is skipped, keep what makes it feel considered.
**Bottom line:** prune with the scroll map, not with taste.

**Godin (dissenter)** — nothing on this page now sells harder than it serves; the locked cards
tell the truth, the price tells its own future, the free workout is a genuine gift. His
challenge stands where it did: C5 — real member faces will only ever come from delighted
members telling the truth on camera, which is a product problem, not a page problem.
**Bottom line:** the page has earned permission; go make members worth photographing.

## The verdict, in order of leverage

1. **Owner:** sign the ÁSZF guarantee clause → flips B6 🔴 to ✅ everywhere (reveal band, rail
   trust row, D6 email subject) in one deploy of an env flag.
2. **Code (small):** render the 4 personalized fit-lines in the mobile offer block (C7) —
   the audience's certainty device on the audience's surface.
3. **Measure (running):** section-view data decides D5/D6 (page length, B3 merge) in ~2 weeks —
   both councils' disagreements are now empirical questions.
4. **Assets (owner, slow):** consented member photos/stories for C5.
