# 05 — Master plan: the reveal, section by section

**Date:** 2026-09-08 · **Sources:** `00-current-state.md` (measured live) +
research tracks `01-psychology`, `02-decision-mechanics`, `03-language`,
`04-design-heuristics`. Evidence grades: **[A]** peer-reviewed / large-N ·
**[B]** platform data at scale · **[C]** vendor case / single case · **[D]**
canonical guidance or convention.

**The page's one metric: same-session checkout.** Constraints that outrank
everything below: no urgency, no counters, no exclamation marks, no weight-loss
vocabulary, no invented proof, prices fixed, monthly stays the centred plan
(owner decision), quiet register throughout.

---

## Part I · The ten principles

1. **The plan must read as *finished* and *made by them*.** IKEA effect d=0.57
   across 55 studies — but only when the build is visibly completed [A].
   Self-designed products carry >100% WTP premium, mediated by *perceived own
   contribution* [A]. The reveal currently shows no trace of their answers
   (00 §3.2) — the single largest gap on the page.
2. **Manufacture ownership deliberately.** Digital goods are valued below
   physical ones unless ownership is constructed [A]. Ownership cues once, at
   the artifact's header: possessive framing, date, their answers [D].
3. **The plan is already in progress, not a zero-point offer.** Endowed
   progress nearly doubles completion (34% vs 19%) [A]. Frame membership as
   *continuing* something that exists, never as *starting* something new.
4. **Give first, unconditionally, and say so.** Reciprocity from genuine
   no-strings gifts is real and durable [A]. The full plan renders before any
   price, and the exit line („a heti terved akkor is a tiéd marad") is
   load-bearing — it *creates* the safety that makes the ask considerable.
5. **The price is not hidden.** 21% of checkout abandonment ties to totals not
   visible; 64% hunt for a hidden number [B, adjacent-domain]. The rail gets a
   real price line. Two hops maximum, no bridge screens [A/D].
6. **The decision is visible from the first frame.** 57% of viewing time is
   above the fold; content 100px above the fold gets 102% more fixations [B].
   Viewport 1 = artifact + rail with price. (Already true; must survive.)
7. **Choreograph the real work.** Labor illusion: visible "building" raises
   perceived value and patience ~3× [A] — and we genuinely compute the plan, so
   an assembling reveal is honest. Critically damped, 0.3–0.4s, 80–120ms
   stagger; reduced-motion gets the same order as cross-fades [D].
8. **Separate the commitment from the ask.** Implementation intentions double
   follow-through [A], but a commitment prompt that reads as a setup for the
   pitch triggers reactance [A]. „Melyik nap kezded?" keeps its own beat and
   its „csak magadnak jelölöd be" honesty line.
9. **One saturated element per screen: the CTA.** Von Restorff / isolation [D];
   value stack outweighs the price number visually in the rail [D]; layer-cake
   headings, front-loaded first words [B].
10. **Trust is craft plus named accountability.** Aesthetics tracks perceived
    trustworthiness [A]. Recognized payment marks beat custom badges — which can
    *hurt* an unknown brand [B]. The guarantee gains weight when a named person
    (Alexa) stands behind it [B/D].

## Part II · The language register

Rules: informal Hungarian, first-person CTAs (conjugation gives us this for
free), process-framing over outcome-framing for a repeat-failure audience
(Bandura/Dweck [A]), condition-first numeric guarantees (every strong live
example found states the mechanism early), continuation vocabulary („viszed
tovább") over joining vocabulary.

Verdicts on current lines (track 03):

| Line | Verdict |
|---|---|
| „A heted, készen" | **Keep** |
| Rail lead („A heti terved a tiéd. A LEXFIT tagság az, ami utána is viszi tovább.") | **Keep** — cleanest continuation line on the page |
| Exit line | **Keep** |
| Commitment hint („Ne a legjobb napodra…") | **Keep** — strongest line on the page; upgrade: echo their chosen days |
| Rail heading („Ha rendszert csinálnál belőle") | **Rework** — conditional mood adds distance; use „viszed tovább" vocabulary |
| CTA „Megnézem a tagságot" | **Test** — correct first person, but an inspection verb past the explore stage; candidate: „Viszem tovább" / continuation verb |
| Guarantee frame („Nem fogadás…") | **Keep the frame, add the mechanism** — condition-first numeric sentence beside it |

## Part III · The architecture

New section order (restructuring approved 2026-09-08):

```
S1 the arrival: the plan as a made, owned artifact   (cream · peak)
S2 the commitment: which day do you start            (cream · own beat)
S3 the first week, workout by workout                (cream · proof of product)
S4 the guarantee                                     (navy · the turn)
S5 the pricing band                                  (sage · the decision)
S6 the programme preview: what comes after           (cream · MOVED below price)
S7 footer note                                       (cream)
+ R the decision rail (desktop sticky / mobile docked bar) spanning S1–S3
```

The one structural change vs today: **the programme preview moves below the
pricing band** (02: it answers a retention question, not a purchase question;
no evidence it aids same-session conversion at its old position; A/B candidate
for removal). The guarantee stops repeating identically three times — each
placement now does different work (S4 = full mechanics + miss-path; rail = one
line; pricing band = short reassurance near the cards).

## Part IV · Per-section briefs

### S1 · The arrival (the peak) — replaces the 121px plan card
**One job:** make seven answers feel like they produced something finished,
personal and worth keeping.
- **Layout:** one document-like card, the page's largest element. Header row:
  possessive title + date + „a válaszaidból" · their answer chips (via the
  existing shared `trayChips` — the same labels the quiz's tray taught them).
  Week grid below; calorie block inside the same card when present; care notes
  as card footnotes, not orphaned lines.
- **Motion:** the assembling reveal — chips land first, days draw in staggered
  (80–120ms), numbers count-settle; total under ~1.2s; cross-fade equivalents
  under reduced motion; ends visibly COMPLETE (IKEA boundary condition).
- **Copy:** keep „A heted, készen"; sub gains one trace-line back to answers.
- **Acceptance:** artifact ≥ the commitment block's height in its weakest state
  (no calculator); every visible plan parameter traceable to a quiz answer.

### S2 · The commitment
**One job:** convert intention into a named day — and never read as a sales setup.
- Keep structure and hint; upgrade: the picker echoes their chosen weekdays by
  full name; picked-state line stays personal. Visually its own beat (rule
  above/whitespace), never adjacent to a price element. `.pill` controls stay.

### S3 · The first week, workout by workout
**One job:** prove the product is real — actual cards, actual exercises.
- Keep first-day expansion. Add per-day weekday labels tied to S2's picked day
  (if they picked Wednesday, Wednesday's card carries „itt kezded" instead of
  the generic first-day tag). Front-load block names [B].

### S4 · The guarantee (navy band)
**One job:** remove the last fear („és ha megint nem megy?").
- Condition-first numeric sentence FIRST („Csináld végig az első 10 edzést öt
  héten belül — ha nem érzed a tiédnek, minden befizetett díjat visszautalunk."),
  THEN the frame („Nem fogadás…"), then the miss-path. Signed by Alexa by name
  [B/D]. Statutory line stays. Gated on `GUARANTEE_LIVE` as today.

### S5 · The pricing band (sage)
**One job:** let a decided person pay without a single surprise.
- Monthly stays centred/badged (owner decision). 490 Ft intro stays folded into
  the weekly card. Real payment marks (Visa/Mastercard/Stripe line exists in
  trust row — keep, no custom badges). Short guarantee reassurance near the
  cards (differentiated wording, not the S4 text again). No preselected
  extras, price fully visible before any click — the anti-dark-pattern
  checklist [A] is an acceptance criterion.

### S6 · The programme preview (moved below price)
**One job:** answer „mi jön a hét után?" for people still deciding after the
band — without delaying anyone who already decided.
- Content unchanged (skip logic stays); position after S5. A/B candidate for
  removal once analytics exist.

### R · The decision rail
**One job:** keep both halves of the decision on screen from first frame to the band.
- Adds a **price line** („Havi 5 990 Ft · az első hét 490 Ft" — interpolated
  from PRICES, never literal). Styled as an order summary, not an ad
  (banner-blindness guard [B]): document typography, mono for numbers only.
  Order: heading (reworked, continuation mood) → price line → includes list
  (trimmed to ~6; value stack visually outweighs the number) → one-line
  guarantee → CTA (verb per Part II test) → trust line → exit line.
- Mobile: docked bar gains the price next to the CTA, visible from first paint,
  safe-area aware.

### S7 · Footer note
Keep („A tervet elküldtük e-mailben is…") — it is the ownership echo at the end
[peak-end]. One line, nothing added.

## Part V · What this page will never do
No countdowns, fake scarcity, preselected upsells, hidden totals, hard-to-find
refund path, invented testimonials, outcome-with-timeframe promises, or hype
punctuation. (Mathur et al. 2019; FTC 2022; house rules.) These are acceptance
criteria, not aspirations.

## Part VI · Open questions (test when analytics exist)
1. CTA verb: „Megnézem a tagságot" vs continuation verb — the highest-value
   copy test on the page (03).
2. Programme preview: below price vs removed (02).
3. Rail price line: monthly-first vs intro-first phrasing.
4. Proof element: the page has none (00 §3.3); we own no testimonials, so the
   only honest candidates are the community count and Alexa's presence in S4.
   Decide during S4/S5 build, never invent.

## Build order
S1 (the peak — biggest gap, biggest evidence) → R (price line + order-summary
restyle) → S4 (guarantee rewrite) → S2/S3 upgrades → S5 checklist pass → S6
move → S7. One section per turn, verified in the browser before the next.
