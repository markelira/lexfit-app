# 00 — The reveal, as it stands (deep current-state analysis)

**Date:** 2026-09-08 · **Method:** measured live in the browser at 1710×985
(desktop) after a real quiz walk (calculator skipped, marketing consent unticked),
plus a code audit of `PlanWizard.tsx`, `WeekWorkouts.tsx`, `ProgramPreview.tsx`,
`EnergyResult.tsx` and the copy module.

**Optimization target (owner, 2026-09-08): same-session checkout.** Every
observation below is judged against that single metric.

---

## 1. The page in numbers

| Measure | Value | Reading |
|---|---|---|
| Document height | 4,508px = **4.58 screens** | Long, but not bloated by word count |
| Words: main column | 238 | Lean |
| Words: decision rail | 101 | Lean |
| Words: guarantee band | 90 | Lean |
| Words: pricing band | 265 | The wordiest thing on the page |
| **First forint on screen** | **3,170px** — 3.2 screens down | The rail deliberately withholds the price; open research question |
| Plan card (the earned artifact) | **121px tall** — 2.7% of the page | See §3.1 — the biggest single finding |
| Rail | 116px top, 761px tall, sticky, fits the viewport | Verified sticking at scroll |
| CTAs toward checkout | rail CTA (anchor to #arak) → 3 pricing cards (→ /register) | A **two-hop** decision path |

**First viewport (0–985px) contains:** the H1, the plan card, the full
„Melyik nap kezded?" commitment block, the start of the week-workouts section,
and the rail with its CTA at 706px. The decision is visible from the first
frame — the first viewport is genuinely good.

## 2. Section inventory and its conditional states

| # | Section | Height | Conditional on |
|---|---|---|---|
| 1 | Plan card (week grid + calorie numbers) | 121px *(without calculator)* | `EnergyResult` renders only if the calculator was taken **and** consented |
| 2 | Care notes | 0–3 lines | Only when a care flag was chosen |
| 3 | Start-day commitment | 295px | always |
| 4 | Week, workout by workout | 924px | catalogue non-degraded; first-day exercise list only if blocks stamped |
| 5 | Programme preview (rest of Start) | 479px | hides when the week showed everything |
| 6 | Sticky decision rail | 761px | guarantee line inside it gated on `GUARANTEE_LIVE` |
| 7 | Navy guarantee band | 534px | `GUARANTEE_LIVE` |
| 8 | Sage pricing band | 1,411px | always |
| 9 | Footer note | 149px | always |

The page therefore has **at least six materially different renderings**
(±calculator, ±care, ±guarantee). Any redesign has to be judged in its *weakest*
state, not its best one — and the weakest state is the one measured above.

## 3. Findings, ranked

### 3.1 The peak is 121 pixels
The entire funnel builds to this moment: seven questions, an interstitial that
says „Ennyi már megvan", a gate that promises the plan. What arrives is a
week-strip **thinner than the commitment block below it**. When the calculator
was skipped there are no numbers, no name, no date, nothing that marks the
artifact as *made* — the seven answers produced something that renders smaller
than the question „Melyik nap kezded?". Peak-end-wise, the page spends its peak
on its least-invested element.

### 3.2 The reveal never echoes their answers — but the gate did
The gate's mail preview showed their answer chips („kíméletes · 3 nap · este…"),
via the shared `trayChips`. **The reveal itself never does.** The one page whose
job is „this was built from what you said" contains no visible trace of what
they said, beyond the day count in the sub-line. The quiz's own tray taught them
that their answers accumulate into something; the payoff page drops that thread.

### 3.3 Zero proof anywhere on the decision page
The landing carries Alexa, the community count, the finish-card decision. The
reveal — the page where the money question is actually asked — has **no human,
no count, no name** anywhere in 4,508px. Whatever the research says about proof
placement, having literally none at the decision point is an extreme position we
took by accident, not by choice.

### 3.4 The guarantee appears three times, identically framed
Rail summary → navy band → pricing-band block (and a monthly-card bullet).
Repetition is fine; *identical* repetition at three scroll positions reads as
insistence. Nowhere does the guarantee do different WORK (e.g. short reassurance
at the CTA vs full mechanics at the price vs one-line answer to „és ha nem
megy?").

### 3.5 The two-hop CTA is unexamined
Rail CTA anchors to `#arak`; the pricing cards then go to `/register`. That is a
deliberate single-source-of-price decision, but its conversion cost has never
been evaluated (research track 02, Q3). Also: after `/register` comes account
creation + embedded Stripe — the page never says what happens after the click,
so every CTA is a door into the unknown (track 01, Q5).

### 3.6 The price is 3.2 screens from the fold
Defensible (value before price) or costly (decision-ready people made to
scroll) — this is exactly the sticky-rail-price question sent to research
track 02 Q2. Noted here as: **currently the rail sells the contents and hides
the number.**

### 3.7 The programme preview may be delaying, not selling
479px of „Ez vár rád" between the week and the guarantee. It answers „mi jön
utána" — a retention question, not a purchase question. Whether a
same-session-checkout page should carry it at this position (or at all) is
research track 02 Q8.

### 3.8 Section rhythm collapses at the end
Cream (plan+rail) → navy (guarantee) → sage (pricing) → cream (footer) is good
band grammar. But *within* the first cream band, four sections (plan,
commitment, week, preview) are separated only by hairline rules — the same flat
rhythm the previous centred design was criticized for, now inside one column.

### 3.9 What already works — do not lose it
- The decision is visible in viewport 1 (rare on results pages).
- The rail's exit line („ha most nem időszerű…") is the reciprocity keeper.
- Total copy is ~700 words — the page is not overwritten.
- The commitment picker is an evidence-backed (d=0.65) urgency substitute.
- Real workout cards, real exercise names — nothing invented anywhere.
- Left-aligned, homepage-consistent, honest. The bones are right; the *power*
  per section is what's missing.

## 4. Heuristic quick-audit (Nielsen, the five that bite here)

| Heuristic | State |
|---|---|
| Visibility of system status | ⚠ After the rail CTA the page just scrolls — no state acknowledges „you moved toward the decision". After a pricing-card click, `/register` loads with no bridge. |
| Match with the real world | ✓ Week grid = calendar; mail metaphor at gate. |
| Recognition over recall | ⚠ §3.2 — the plan doesn't show the answers it was built from. |
| Consistency | ✓ Now shares the homepage system. |
| Aesthetic & minimalist | ✓ lean copy; ⚠ triple guarantee (§3.4). |

## 5. Questions the four research tracks must settle

1. Does the rail show the price? (02-Q2) — decides the rail's whole design.
2. One-hop or two-hop CTA? (02-Q3)
3. Does the programme preview stay, move, or go? (02-Q8)
4. What is the *quiet* form of peak choreography for §3.1? (01-Q3, 04-Q4)
5. What proof element belongs on a decision page when we own no testimonials? (01-Q8, 03-Q5)
6. Is „Megnézem a tagságot" (inspection verb) the right CTA register? (03-Q1)

Everything else in the redesign follows from these six.
