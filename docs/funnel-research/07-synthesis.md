# 07 — Synthesis: the optimization brief

**Date:** 2026-09-08 · **Scope:** `/ujrakezdes` (landing) · `/ujrakezdes/terv` (quiz,
gate, reveal) · the D0/D3/D6 sequence · the offer presentation.

**Mandate:** optimize *within* the existing funnel. Nothing below proposes
rebuilding it, changing an amount, or adding urgency. Where the evidence
contradicts a decision already taken, it is listed in §4 as an owner call, not
applied silently.

**Evidence grading used throughout:**
**[A]** peer-reviewed or large-N measured · **[B]** vendor/platform data at scale
with disclosed method · **[C]** vendor case study or single case · **[D]**
practitioner consensus / teardown observation, no measurement.

---

## 1. What the evidence says NOT to change

The most valuable output of six research tracks is how much of the current design
it validates. These are settled; re-litigating them costs time and risks a
regression.

| Current design | Verdict | Evidence |
|---|---|---|
| 7-question core | Keep. 3–7 questions is the top completion bracket (65–85%); 8–15 drops to 45–65% | [B] Outgrow/Interact |
| One question per screen, tap-to-advance | Keep. Multi-step beats single-page by ~86% once past ~5 fields | [B] HubSpot |
| Gate placed AFTER the questions | Keep. Teaser-then-gate reportedly converts 35–45% of starters vs 20–30% for pre-quiz gates | [C] vendor-reported, directional only |
| Section labels, not „4/10" | Keep | [D] + our own reasoning |
| Calculator skippable, own consent | Keep — and it is also the only lawful shape under Art. 9 | [A] legal |
| D0/D3/D6 cadence, D3 as belief-shift | Keep. Best-supported structural choice in the sequence; no data supports compressing or stretching it | [B]/[D] |
| 490 Ft paid intro over a free trial | Keep. Lower raw conversion, materially better commitment quality and LTV | [B] Adapty/RevenueCat |
| No countdown, no timer, no fake scarcity | Keep — and it is a **differentiator**. Every competitor teardown (Noom, BetterMe, Yazio, Fastic, Freeletics) escalates with timers or exit-intent discount games | [D] teardowns |
| Real member photos, no stock | Keep. Cross-source consensus that recognized-stock erodes trust | [D] |
| Per-question instrumentation | Already wired — `trackUjrakezdesStep(stepId, q)` fires per question | verified in `src/lib/track.ts:183` |

One correction to an assumption behind the current build: the fear that a
generous free plan cannibalizes the paid subscription **is not supported**. A
680,588-user, 2-year RCT found giving away more free value did not suppress
immediate paid conversion. **[A]**

---

## 2. Ranked changes — highest evidence first

### 2.1 Pre-select and centre the annual plan · **[A]**
Defaults are the strongest single lever in the entire corpus: opt-out defaults
moved consent 42% → 82% (Johnson & Goldstein). Centre-stage effect: 26.5% vs 10%
selection for centre vs edge. Annual is the only H&F billing period whose revenue
share is *growing* (51% → 61%), and it churns at 48% after year one against 79%
for monthly. We have sold **zero**.
→ **Conflicts with a prior decision. See §4.A.**

### 2.2 Break the reveal into sequential sections · **[B]**
Sequential/multi-screen paywalls convert 12.41% vs 9.07% single-page — a 37%
relative lift across 40M+ paywall opens (Superwall). Our reveal is currently one
long undifferentiated scroll.
→ Give each block a distinct visual section with its own rhythm; do not merge
them into a wall.

### 2.3 Front-load the progress bar within each section · **[A]**
Endowed progress roughly doubles completion (34% vs 19%). A fast-to-slow bar cut
survey abandonment to 11.3% vs 21.8% for an honest slow-to-fast one (Conrad et
al., 2010).
→ Make the first movement inside each labelled section visibly larger than later
movements. Never show a time estimate above ~1 minute.

### 2.4 Replace urgency with implementation intentions · **[A]**
Implementation intentions have a meta-analytic effect of **d = 0.65** — the best
measured, non-manipulative substitute for the banned countdown.
→ Reframe the reveal's „first workout" panel from a description into a
commitment: pick the day and time you will start. This also directly answers
objection #15 („Mikor kezdjem?") and gives D0's advice („schedule it on an
average day, not your best one") something to attach to.

### 2.5 Fix the guarantee's miss-path · **[A]**
StepBet (N=72,974): completers raised activity 44%, but people who **failed**
their challenge fell **5.3% below their own baseline**. Refund cost is not the
risk — GMB sees ~3% refunds across 125k clients. The undesigned failure path is.
→ Our guarantee copy currently has **no** miss-path. Add a proactive
before-the-window-closes check-in („replan together"), and make sure the copy
reads as permission to start rather than a bet against yourself. Objection #30
(„A garancia feltétele stresszel") is already logged and still unanswered.

### 2.6 Message match across three ad angles · **[B]**
Ad-to-page consistency is worth up to +212%.
→ Hero carries the common promise (already decided: „7 kérdés, és kész a heti
edzésterved"). The three angles — restart / joint-cautious / end-of-day — get
their own beats inside `Ismerős?`, so whichever ad they clicked finds itself
answered on the page.

### 2.7 Touch targets and contrast · **[A]**
44–48px targets cut mis-taps 60–80%; WCAG body-text floor is 4.5:1.
→ Option rows ≥56px. **Verified independently:** sage `#7a9b8d` on cream is
**2.79:1** — it fails even the 3:1 large-text floor. Deep sage `#496c5e` clears
body text at 5.36:1; ink is 15.22:1. Sage is an accent and selected-state colour
only; nothing that must be *read* may be set in it.

### 2.8 Present three plans as one offer · **[B]**
Multi-offer pages generate 266% fewer leads than single-offer framing (CXL).
→ Frame the band as **one membership, three payment rhythms** — which is already
literally true under the all-access decision — rather than three competing
products.

### 2.9 Email deliverability is a launch blocker, not an optimization · **[A]**
Since Nov 2025, missing SPF/DKIM/DMARC or RFC 8058 one-click unsubscribe causes
**rejection**, not spam-foldering. Complaint rate must stay under 0.30%.
→ Split the transactional D0 stream onto a separate subdomain from the D3/D6
marketing stream, so marketing-list hygiene cannot jeopardize plan delivery.
Fitness carries the highest unsubscribe rate of any vertical (~0.40%); our
3-email/6-day cadence is comfortably inside the safe zone.

### 2.10 A real annual comparison, and a legal catch · **[A]**
1,990 Ft × 52 = **103,480 Ft** against 39,900 Ft actual — a genuine 61% saving,
and dollar/forint-amount framing beats percentage-only. The band currently shows
„−44%", which is the comparison against annualized *monthly*.
→ **Compliance catch:** a strikethrough on monthly or annual would breach the EU
Omnibus Directive (in force in Hungary) because neither has ever had a higher
list price. The weekly 490 → 1,990 Ft step-up is a legitimate strikethrough and
may stay. Show annual's saving as a true 52-week comparison, never as a fake
former price.

### 2.11 The one true price anchor, unused · **[B]**
Hungarian PT hour 5,500–7,500 Ft ≈ one month of LEXFIT. Deploy it once, near the
band. „Less than a coffee" framing has no supporting evidence and risks
cheapening the product — skip it.

### 2.12 Show the plan assembling, not appearing · **[D]**
Noom's projected goal-date visibly recalculates as answers arrive; every screen
acknowledges, teaches, or moves a number. Fitbod and Runna both show a taste of
the plan *immediately before* pricing.
→ Our week strip should visibly react to the last answer rather than appear
whole, and the plan artifact must sit directly above the band, not several
scrolls up. Chips should travel into the tray, not pop in — under
`prefers-reduced-motion`.

---

## 3. Ideas worth testing, not shipping on faith

| Idea | Why it is interesting | Why it is not ranked above |
|---|---|---|
| **Embed Q1 in the landing hero** instead of a CTA button | Quiz pages convert ~40% vs 5–10% for static lead magnets [B]; a 2,000-page study found photo/video heroes lose to no-hero (+4%) or single-stat heroes (+18%) [B]; foot-in-the-door + Zeigarnik support it | No direct test of *this* combination. The landing track flagged it as the highest-value **untested** idea. It is also compatible with the approved page structure — Q1 becomes the CTA mechanism |
| **A longer „building your plan" beat at the reveal** (~4–6s) | Every competitor reserves its longest labor-illusion for the final plan build; ours is only the 2s mid-funnel interstitial | Register risk. A screen that *pretends* to compute is dishonest — but we genuinely derive the plan and run the energy maths, so an honest beat is defensible. Owner call on taste |
| **One concrete plan detail beside the email field** at the gate | Teaser-then-gate pattern [C] | Vendor-reported with no disclosed method |
| **Ask „how many times have you restarted" as a scored input** | Runna asks one layer deeper than generic; specificity is what makes a quiz feel personal [D] | Adds a mandatory question to a 7-question core sitting at the top of the completion bracket |
| **Name-personalized D0/D6 subject lines** | Personalization +31% relative open lift claimed [C] | We do not currently collect a first name. Adding a field costs gate conversion |

---

## 4. Conflicts requiring an owner decision

**A. Which plan is centred.** `PricingBand.tsx:22-24` records a deliberate past
decision: „The old band centred Éves. This steers to monthly." The evidence in
§2.1 is the strongest in the corpus and points the other way — annual centred and
pre-selected, monthly de-emphasized. Both cannot be true. Given zero annual sales
and a 54% first-renewal rate, the case for switching is strong, but it reverses a
call that was made on purpose.

**B. How much of the programme to preview.** The results-page track recommends
trimming the preview from all 30 workouts to 4–6, on the reasoning that a full
free catalogue undercuts the paid case **[D]**. The 680k-user RCT says extra free
value does not suppress conversion **[A]**. My reading: the workouts are *listed
but locked*, so this is proof of substance rather than giveaway — the [A]
evidence is closer to the situation than the [D] reasoning. Worth an explicit
decision either way.

**C. A fourth email.** A beauty-brand case found 7 emails beat 3 by 35%
conversion, with unsubscribes rising 15% after email 5 **[C]** — supporting
exactly *one* more send, at D9–D10, carrying proof rather than a deadline. This
partially reverses the offer-v3 decision to cut D10, though it honours the reason
that decision was taken (no real deadline exists).

**D. Whether a „building your plan" beat is honest.** See §3. We do real work at
that moment; the question is whether displaying it for 4–6 seconds is craft or
theatre.

---

## 5. What we still cannot answer

1. **No live funnel analytics.** Every number above is a prior, not a measurement
   of LEXFIT. The per-question drop-off instrumentation exists and will produce
   real data as soon as ads run — at which point several [C] and [D] items above
   become testable against our own funnel.
2. **No fitness-quiz → same-session-paid benchmark exists publicly.** Best
   triangulated range is **3–10%**; treat as a target, never as a promise.
3. **No reliable Hungarian/CEE landing-page data.** The landing track searched and
   found none, and said so rather than guessing. The only transferable signal is
   mobile share (60%+), which reinforces mobile-first.
4. **Several competitor teardowns could not be verified** — Ladder, Centr, 8fit,
   Future, Caliber, Lumen, Zoe (quiz), and the pre-purchase email sequences of
   BetterMe, Simple, Freeletics, Sweat. Recorded as gaps, not filled with
   invention.
5. **Facebook/Instagram in-app browser** runs WKWebView with documented freezing
   and `svh`/`dvh` snapping bugs, and reports of ~25% conversion loss. This needs
   a real device test before launch — it cannot be researched away.

---

## 6. The corpus

| File | Track |
|---|---|
| `00-internal-evidence.md` | What LEXFIT already knew — our numbers, constraints, the 38 objections |
| `01-quiz-mechanics.md` | Completion benchmarks, progress, gate placement, labor illusion |
| `02-results-page-offer.md` | Reveal order, paywall teardowns, defaults, urgency substitutes |
| `03-landing-page.md` | Message match, page length, hero, proof, in-app browser, Meta policy |
| `04-offer-architecture.md` | Intro pricing, annual, guarantees, anchoring, pause |
| `05-email-sequence.md` | Benchmarks, cadence, subjects, deliverability, segmentation |
| `06-design-craft.md` | Competitor UI patterns, progress, option rows, motion, palette |
