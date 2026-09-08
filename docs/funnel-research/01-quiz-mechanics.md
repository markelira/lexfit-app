# Quiz / Assessment Funnel Mechanics — Research for `/ujrakezdes` → `/ujrakezdes/terv`

Research date: 2026-09-08. Track: quiz/assessment funnel mechanics (completion benchmarks, one-Q-per-screen, progress indicators, email gate placement, personalization echo, labor illusion, optional bonus questions, competitor teardowns).

---

## TL;DR

1. **Lead-gen quizzes convert start→lead at ~40.1%** and complete at ~65% on average (Interact, 80M+ leads analyzed since 2013) — vastly ahead of static forms at 2–5% (Interact/Outgrow, secondary but consistent across sources).
2. **5–7 questions is the completion/depth sweet spot**; 3–7 questions clusters at 65–85% completion, 8–15 questions drops to 45–65%, 16+ questions falls to 25–45% (Outgrow benchmark; unverified sample/methodology — treat as directional). LEXFIT's core flow (7 Qs) sits at the top edge of the sweet spot; the +3 calorie add-on pushes a fully-engaged user to 10, still inside the "good" band.
3. **Question 3 is repeatedly cited as the single biggest drop-off point** in quiz funnels — after novelty fades, before sunk-cost momentum kicks in (Outgrow, secondary; corroborated qualitatively by CRO practitioner sources, not a controlled study).
4. **Multi-step / one-question-per-screen forms measurably beat single-page forms once you exceed ~5–6 fields**: HubSpot cites 86% higher conversion for multi-step; case studies report up to 300% lift (Vendio: +214% leads; BrokerNotes: 11%→46%). Below 5 fields, single-page wins.
5. **Progress bars lift completion 12–18%** when progress appears to accelerate and stays under ~5 minutes of implied effort (Outgrow claim, secondary/unverified number) — but backfire when placed at the top, when they imply >5 minutes remaining, or when early progress feels slow relative to what's shown (Irrational Labs meta-analysis of 32 studies + SurveyMonkey data, more credible but effect sizes not quantified in the source).
6. **Endowed progress roughly doubles completion in controlled lab conditions**: 34% vs 19% when the first step is pre-credited as "already done" (cited academic effect, well-established in behavioral-econ literature — the strongest, most credible single number in this report).
7. **Email-gate placement is a volume/quality trade, not a solved question**: full pre-quiz gating converts 20–30% of visitors; teaser-then-gate-at-results converts 35–45% of *starters* and is what ScoreApp/Interact/Woobox converge on as best practice for most cases — but none of the sources supply a controlled A/B, so treat these numbers as vendor-reported ranges, not measured causality.
8. **"Labor illusion" loading screens are near-universal in the top weight-loss/fitness apps** (Noom, BetterMe, Freeletics, Yazio) and the one documented time-boundary evidence (dating-site/travel-search A/B tests) says the illusion helps up to ~15–30 seconds of wait, with diminishing or negative returns beyond that.

---

## 1. Completion-rate benchmarks by question count

**Interact (tryinteract.com), "Quiz Conversion Rate Report 2026"** — the single largest, most credible dataset here (80M+ leads since 2013, ~2,738 customers analyzed for a related study):
- Start → Lead (email capture): **40.1%** overall.
- Start → Finish (completes all questions): **65%** overall.
- By vertical: Coaching/Courses 44.9% lead / 59.1% finish; E-commerce 37.6% / 55.5%; Service providers 42.2% / 47.3%.
- Source: https://www.tryinteract.com/blog/quiz-conversion-rate-report/

**Outgrow, "Quiz Engagement Benchmarks"** (secondary, no disclosed methodology — "thousands of quizzes across dozens of industries," no sample size given, treat as directional not verified):
- 3–7 questions: 65–85% completion.
- 8–15 questions: 45–65% completion.
- 16+ questions: 25–45% completion.
- Health & Wellness vertical specifically: 50–65% completion.
- Paid-ad traffic specifically: 35–50% completion (vs. 55–70% for organic/search) — **directly relevant**, since LEXFIT's traffic is 100% cold Meta.
- "Question 3 is the danger zone where most quizzes lose steam."
- Source: https://outgrow.co/blog/quiz-engagement-benchmarks-completion-rates

**Cross-source convergence on optimal length**: Fyrebox, Digioh, Marquiz, AdsQuiz, Dashform independently converge on 4–7 questions as optimal for paid-traffic lead quizzes, 5–10 as the outer bound before drop-off accelerates. This is consistent secondary/practitioner opinion, not one dataset repeated — moderate confidence.
- https://www.fyrebox.com/blog/quizzes-convert-better-than-forms
- https://outgrow.co/blog/how-to-create-a-lead-generation-quiz

**What this means for LEXFIT**: the current 7-question core (before the optional +3) is right at the edge of the highest-performing bracket for paid Meta traffic. Do not add mandatory questions to the core flow. The optional calorie module correctly keeps the extra 3 questions *outside* the counted "core" — that structure is exactly what the data supports (see §7).

---

## 2. One question per screen vs. multi-question pages

Evidence is one-directional and reasonably strong, though most of it is about long-form B2B/e-commerce forms rather than quizzes specifically — extrapolate with that caveat:

- HubSpot: **86% higher conversion** for multi-step vs. single-step forms. (https://blog.hubspot.com/marketing/optimize-conversion-forms)
- Venture Harbour aggregation of case studies: multi-step forms up to **300%** higher conversion than single-page; Vendio **+214% leads**; BrokerNotes **11% → 46%** after switching to multi-step. (https://ventureharbour.com/multi-step-lead-forms-get-300-conversions/)
- Zuko (form-analytics vendor, credible because they instrument real forms): the multi-step advantage applies specifically once a form has **6+ fields**; below 5 fields, a single page is fine or better because users can see the form is short. Zuko separately reports **up to 10%** conversion lift purely from fixing data-persistence bugs between steps (unrelated to step count, an implementation-quality finding). (https://www.zuko.io/blog/single-page-or-multi-step-form)
- Best-practice convergence: when you do split into steps, **1–2 questions per step**, not more — the "conversational form" pattern starts hurting past 12–14 questions (Instapage/ventureharbour).

No source directly A/B-tested "1 question per screen" vs. "3 questions per screen" inside a quiz product specifically — the evidence is from general lead-gen forms. Label this **moderate-strength, extrapolated** evidence.

**What this means for LEXFIT**: `/ujrakezdes/terv`'s one-question-per-screen, tap-to-advance pattern is directionally correct and matches the strongest available evidence (multi-step beats single-page once you're past ~5 fields, and 7 questions is well past that). No change needed here — this is already best-practice.

---

## 3. Progress indicators

Two effects, often conflated, with different evidence quality:

**Goal-gradient effect** (well-established in behavioral psychology, originally Hull 1932, replicated many times in loyalty-card and digital-UI contexts): effort increases as the perceived distance to the goal shrinks. In quiz/onboarding UI this is usually operationalized as a progress bar. Practical distillation: **4–6 visible steps is the sweet spot** — more than 6 makes the endpoint feel too distant and kills the effect. (https://productphilosophy.com/articles/goal-gradient-progress-mechanics)

**Endowed progress effect** (Nunes & Drèze 2006, the classic car-wash loyalty-card study, still the most-cited number in this space): pre-crediting people with "progress already made" **roughly doubled completion — ~34% vs. ~19% control**. This is the strongest, best-sourced number in this whole report because it traces to a peer-reviewed, widely-replicated study rather than a vendor blog. (cited via https://productphilosophy.com/articles/goal-gradient-progress-mechanics and https://learningloop.io/plays/psychology/goal-gradient-effect)

**When progress bars backfire** (Irrational Labs, citing a meta-analysis of 32 survey experiments + SurveyMonkey's own analytics — moderate-to-high credibility, but the source article does not give exact effect-size percentages, only directional findings):
- Progress bars that show **decelerating** speed (fast early, slow late) outperform bars with constant or accelerating-then-decelerating speed — early wins matter more than late ones.
- Stating an explicit time estimate **over 5 minutes** reduces completion versus not stating a time at all.
- Bars placed at the **top** of the page increased drop-off in SurveyMonkey's data (for both short and long surveys); bottom-placed bars did better.
- Source: https://irrationallabs.com/blog/knowledge-cuts-both-ways-when-progress-bars-backfire/

**Numeric vs. sectioned vs. none**: no source found a controlled test of "4/10" numeric counters vs. section labels vs. no indicator specifically in a quiz-funnel context. The closest evidence is indirect: numeric counters make the true remaining-question-count legible (which, combined with the "over 6 steps kills gradient" finding, argues against showing a literal "3 of 10" once you're past ~6). Section-based bars implicitly under-count perceived remaining effort by grouping several questions into one visual "chunk" — this is consistent with (but not proven by) the endowed-progress and deceleration findings, since it front-loads apparent progress. **Label this an inference, not a measured result.**

**What this means for LEXFIT**: the section-labeled (not numeric) progress bar is well-aligned with the evidence — it avoids the "7 discrete steps feels far" problem a literal counter would create, and it can be engineered to show fast early jumps (per-section, not per-question) which matches the "decelerating speed helps" finding. Two testable changes: (a) make sure the bar's first jump (after Q1) is visually larger than later jumps — front-load perceived progress; (b) never show an explicit total time estimate ("~2 minutes left") unless it's under ~1 minute, since the >5-minute-estimate penalty is documented and pretending precision you don't have risks the same trust cost.

---

## 4. The email gate

The most commercially important question and, frustratingly, the one with the weakest hard evidence — every source is a vendor blog with no disclosed underlying data.

**Numbers found (unverified, vendor-reported, internally consistent across 2 independent vendors — moderate confidence at best)**:
- Full pre-quiz gate (email required before *any* content): **20–30% conversion** of visitors.
- "Teaser then gate" (partial/blurred result shown, email required to unlock full result): **35–45% conversion** of *quiz starters/finishers*, and is what these sources call the best per-finisher rate. (unnamed vendor source, folded into search synthesis — corroborate independently before citing externally)
- ScoreApp explicitly frames this as **volume vs. quality**, not a universal winner: gate-before-questions maximizes lead count especially on paid-ad traffic (every click's cost is "recouped" as a lead even if they never finish); gate-after-questions maximizes lead *quality* and is recommended once you have 20+ leads/day and can afford to filter. ScoreApp states they generally see gate-before convert better but **supply no supporting percentages** — flag this as an assertion, not a measured claim. (https://www.scoreapp.com/quiz-leads-form/)
- ScoreApp's own length-based nuance: for ~5-question quizzes, gate-after works fine (finishing is close to guaranteed anyway); for 10–20+ questions, gate-before is safer because so many people won't reach the end.
- A **soft/skippable ask** ("we'll email you this result if you want it") is explicitly framed by one source as trading some email volume for higher total completions — nobody quantifies this trade-off numerically.

**What this means for LEXFIT**: LEXFIT's funnel already does the evidence-aligned thing — gate sits *after* all 7 core questions (and after the optional +3), at the point of maximum sunk cost, right before the payoff. This matches the "teaser then gate" pattern that vendors converge on as best for lead quality, and LEXFIT's traffic economics (CAC ~€13, i.e., not spray-and-pray volume, a case where quality > raw count) argue for keeping the gate late rather than moving it earlier. One concrete, testable change worth running: A/B a **partial-teaser variant** — show one piece of the plan (e.g., first workout name/day-count) *before* the email field with the rest blurred, rather than a fully blank gate screen, since "teaser then gate" is the specific pattern the sources credit with the higher 35–45% number, not "full black-box gate then result."

---

## 5. Personalization echo (chips, live preview, "your plan is building")

This is almost entirely psychological-theory-backed rather than measured. No source in this research reports a controlled A/B of "showing accumulating answer chips" vs. not.

**Theory chain, each individually well-established but not tested end-to-end for this exact UI pattern**:
- **IKEA effect** (Norton, Mochon, Ariely 2011): people overvalue outcomes they had a hand in building; effort → perceived value via effort-justification. (https://ixdf.org/literature/topics/ikea-effect)
- **Commitment/consistency** (Cialdini): once someone has made a small public/explicit commitment (answering Q1), they're more likely to behave consistently with it (answering Q2–Q7). Chips that "echo back" the commitment visually reinforce this.
- **Labor illusion** (see §6): visible assembly of the plan signals work is happening on the user's behalf specifically, which is one mechanism for perceived value at the reveal.
- Concrete analog cited: **Stitch Fix's style quiz** — users who took the quiz reported stronger attachment to curated results *because* they had a hand in specifying preferences (cited as an illustrative case, not a controlled experiment).

**What this means for LEXFIT**: the accumulating-chips + live week-strip pattern is well-theory-supported as a completion and perceived-value lever, but LEXFIT should not assume it's "free" — it adds screen complexity and could distract from the tap-to-advance speed that the one-Q-per-screen data favors. Recommended test: keep chips minimal (text label, not full re-render of the week-strip) on early questions, and reserve the *full* live week-strip animation for after the schedule questions (Q4–5+), where the "plan is visibly assembling" framing has the most to echo back. This is already close to what's described as happening (interstitial after schedule questions) — validate that the chips before that point stay lightweight so they don't slow tap-to-advance.

---

## 6. Labor illusion / fake loading screens

**Concept, well-established in UX literature**: users trust and value a result more when they see evidence of work happening, even if the delay is manufactured. Term traced to a Google-conducted A/B test popularized via UX-literature secondary sources (e.g., https://bootcamp.uxdesign.cc/labor-illusion-ux-psychology-e5d7cd240a89, https://lettersremain.com/the-labour-illusion-or-why-visible-effort-matters/).

**Timing evidence (secondary, cites unnamed A/B tests — moderate confidence)**:
- Dating site: wait beyond **~15 seconds** showed diminishing returns.
- Travel meta-search: optimal capped around **~30 seconds**.
- A trip-booking test: 30–60 second wait **paired with animated "checking" visuals** outperformed instant results.
- General framing: "a two-second animation suggesting the system carefully checked everything often feels more trustworthy even when the result is identical" — i.e., even very short (~2s) labor illusion beats zero delay.
- Source: search-synthesized from https://www.pencilandpaper.io/articles/ux-pattern-analysis-loading-feedback and related UX-pattern round-ups; no single primary study located and verifiable within this research pass — **flag as secondary, worth independent verification before quoting externally**.

**Competitor implementation (verified via teardown sources, see §8 for detail)**:
- **Noom**: multiple loading screens through its 113-screen flow, explicitly labeled "building your plan," some showing per-section progress bars rather than a spinner, reinforcing that "all those questions are actually going somewhere." (https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel)
- **Freeletics**: an explicit "Building your plan" animation after the equipment/goals questions.
- **BetterMe**: 26-question quiz, "marathon of questions... builds significant investment before a price is ever mentioned" — the labor illusion here is the quiz length itself acting as pre-reveal labor, not just a spinner.

**What this means for LEXFIT**: LEXFIT already has a 2-second auto-advancing interstitial after the schedule questions — this sits right at the low end of the evidence-backed "short but not zero" window (~2s baseline is credited with a trust lift; competitors' longer 15–30s versions are reserved for a much bigger, later "final plan compile" moment, not a mid-funnel breather). Two testable refinements: (a) confirm the 2-second interstitial shows *visible* assembly (partial chips resolving, a checkmark animation) rather than a generic spinner — the evidence specifically credits visible "checking" work, not blank waiting; (b) consider adding a second, slightly longer (~4–6s) labor-illusion moment at the *final* plan reveal (step 7, after the email gate) mirroring Noom/Freeletics' "building your plan" pattern — LEXFIT's funnel currently has only the one short interstitial mid-flow and none at the final reveal, which is where competitors put their longest, most visible one.

---

## 7. Optional extra questions mid-funnel (the +3 calorie module)

Weakest evidence base of the eight — mostly practitioner opinion, no controlled study located.

- One converging claim across quiz-funnel guides: an **optional, clearly-skippable bonus module gating a specific extra reward** performs well when framed as a discrete add-on rather than baked into the core count — cited example (different vertical, e-commerce discount-for-email) achieved a **42% opt-in rate** for the optional step (single vendor source, unverified, not directly comparable to LEXFIT's calorie module but the mechanism — explicit optional value-add — is analogous). (search-synthesized, landerlab.io / personizely.net cluster)
- General principle repeated across sources: making elements **optional preserves momentum**; forcing them **hard-gates and increases mid-funnel abandonment**. This directly supports LEXFIT's existing "explicitly skippable" framing for the calorie/macro questions.
- No source quantifies the completion-rate cost of adding 3 optional questions vs. omitting them entirely, nor whether perceived-value lift from the extra personalization offsets the friction for users who do engage.

**What this means for LEXFIT**: the current design (core 7 questions counted/gated, +3 calorie questions explicitly optional and skippable, positioned *after* the email-gate-relevant schedule questions but before the email gate itself) matches the one piece of directly relevant guidance found ("optional add-on gating a specific extra reward, not baked into the core flow"). No structural change indicated by the evidence. The one testable refinement: make sure the *skip* action itself requires no more friction than a single tap (equal prominence to "continue") — sources are consistent that a buried or effortful skip functions as a de facto hard gate and erodes the completion benefit optional framing is supposed to buy.

---

## 8. Competitor teardowns (2025–26, verifiable sources only)

| App | Question count / structure | Loading / labor illusion | Email gate position | Result screen leads with | Source |
|---|---|---|---|---|---|
| **Noom** | Up to 113 screens total (mix of hard questions, education, upsells), 10–15 min | Multiple "building your plan" loaders; later ones show per-section progress, not a spinner | Mid-flow, after weight-loss goal + demographics + health data, framed as "See my results" | Personalized weight-loss timeline graph with projected goal date | RevenueCat teardown: https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel |
| **BetterMe** | 26 questions, short Q&A pairs, no price mentioned until after | Quiz length itself is the labor illusion (investment before reveal) | Not required to access app (no email/AppleID gate found in this pass) | Personalized plan following comprehensive product tour | https://theappfuel.com/examples/bettermefitness_onboarding |
| **Freeletics** | 6 questions for Coach personalization (equipment, goals); slider UI for fitness level | Explicit "Building your plan" animation after quiz | Not detailed in sources found | Personalized coach plan | https://www.sensai.fit/blog/best-ai-fitness-apps-2026... (secondary) |
| **Fitbod** | Leads with "why did you join" (motivation) before demographics; asks equipment/location, muscle groups worked, workout frequency | Not documented in sources found | Not documented | Personalized workout plan; offers Apple Health sync | https://www.theappfuel.com/examples/fitbod_onboarding |
| **Yazio** | Goal (lose/build/maintain) → weight/activity/diet prefs → past challenges → weekend-eating/fasting prefs; mascot delivers encouragement throughout | Progressive disclosure, progress indicators shown | Not detailed in sources found | Customized dashboard preview | https://gallery.reteno.com/flows/app-screens-yazio |
| **MacroFactor** | Goal setting → macro prefs → expenditure calibration → weigh-in frequency → coaching style, before first meal log | Not documented | Not documented | TDEE-based energy needs estimate | https://mobbin.com/explore/flows/... (Mobbin flow library, requires account to view in full) |
| **Sweat** | Very short — "only a few questions," <1 minute total | Not documented (fast flow suggests minimal/no labor-illusion screen) | Not documented | Instant program recommendation (which of several trainer programs fits) | https://gallery.reteno.com/flows/app-screens-sweat |
| **Simple** | Not detailed in sources found beyond "onboarding quiz" driving variable pricing | Not documented | No free trial; paywall shown early, closable to use free tier first | Variable/personalized price point | Secondary source, low confidence: https://nutriscan.app/blog/posts/simple-app-pricing-2026... |
| **Ladder, Centr, 8fit, Future, Caliber, Lumen, Zoe, BetterMe upsell chain, Fitbod free-tier** | Sources located confirm each has a personalization quiz but did **not** yield verifiable screen-by-screen detail in this pass | — | — | — | Insufficient verifiable data — do not cite specifics for these without a dedicated follow-up pass (e.g., live App Store walkthrough or Mobbin/ScreensDesign paid access) |

**Cross-cutting pattern confirmed across every verifiable teardown**: none of these apps show the *actual app interface* during onboarding — they build anticipation via questions + loading screens + a static result summary, then reveal the product only after paywall/signup. RevenueCat's Noom teardown explicitly flags this as a **missed opportunity**, not a strength, noting users still haven't seen what daily use looks like even after 113 screens.

**What this means for LEXFIT**: LEXFIT's plan-reveal screen (step 7) already goes further than most competitors by showing a live week grid, the actual first workout, and a program preview before pricing — this is ahead of the Noom/BetterMe pattern of "summary graph only," and directly addresses the gap RevenueCat calls out. No change indicated; if anything, this is a differentiator worth keeping and potentially featuring in ad creative ("see your real first workout, not just a graph").

---

## What this means for LEXFIT — summary table

| Finding | Evidence strength | Change to make | Screen |
|---|---|---|---|
| 7-question core is at the top edge of the highest-converting bracket for paid traffic | Moderate (Outgrow directional + Interact aggregate, no controlled test) | Do not add mandatory questions to the core 7; resist scope creep | `/ujrakezdes/terv` core flow |
| Question 3 is the most common drop-off point industry-wide | Weak/secondary, repeated but unattributed | Instrument per-question drop-off now (funnel analytics by question index) to see if LEXFIT's Q3 matches this pattern before optimizing blind | `/ujrakezdes/terv` Q3 |
| One-question-per-screen beats multi-question pages once past ~5 fields | Moderate-strong (HubSpot, Zuko, multiple case studies), extrapolated from general forms to quizzes | No change — current tap-to-advance pattern already matches best evidence | `/ujrakezdes/terv` |
| Progress bars front-loaded with fast early movement outperform linear/decelerating-late bars; >6 visible steps or >5-min implied duration backfires | Moderate (Irrational Labs meta-analysis + SurveyMonkey data, no exact effect size given) | Keep the section-based (not numeric 1-of-N) bar; make the first section-jump visually larger than later ones; never show an explicit time estimate unless <1 min | Progress bar, all quiz screens |
| Endowed progress ~doubles completion (34% vs 19%) when first step is pre-credited | Strong (peer-reviewed, replicated academic effect) | Consider crediting the user with "step 0" already complete (e.g., landing-page promise counts as progress) so the bar isn't at 0% on Q1 | Landing page → Q1 transition |
| Teaser-then-gate (partial result shown before email) reportedly outperforms full pre-quiz or full blind post-quiz gates for lead quality (35–45% vs 20–30%, vendor-reported, unverified) | Weak-moderate (vendor blogs, no disclosed methodology, but two independent sources converge) | A/B test showing one concrete plan detail (e.g., "First workout: [Day], [X] min") before/beside the email field, not a fully blank gate | Email gate screen |
| Chips/live-preview echo is theory-backed (IKEA effect, commitment/consistency) but not directly measured | Weak (theory, no controlled test found) | Keep chips lightweight on Q1–Q3; reserve the full live week-strip animation for after the schedule questions where there's more to visibly echo | Chip UI across quiz + interstitial |
| Short (~2s) labor-illusion delays with visible "checking" motion lift trust; competitors reserve their longest labor-illusion moment for the final plan-build, not mid-funnel | Moderate (secondary UX literature, consistent across sources, exact studies not independently verified) | Confirm current 2s interstitial shows visible assembly, not a spinner; add a second, slightly longer (~4-6s) "building your plan" moment at the final reveal (post-gate), matching Noom/Freeletics | Mid-quiz interstitial + final reveal (step 7) |
| Optional, clearly-skippable bonus modules preserve completion; hard gates on non-essential questions hurt it | Weak (practitioner consensus, one unverified 42% opt-in stat from a different vertical) | Keep the calorie module optional; ensure "skip" is a single tap with equal visual weight to "continue" | +3 calorie/macro questions |
| No competitor teardown shows real app UI during onboarding — LEXFIT's reveal (live week grid + first workout + program preview) already exceeds this | Verified across 3 independent teardowns (Noom/RevenueCat explicitly flags the gap) | No change — keep and consider highlighting in ad creative as a differentiator | Plan reveal, step 7 |

---

## Sources

- Interact, "Quiz Conversion Rate Report 2026" — https://www.tryinteract.com/blog/quiz-conversion-rate-report/
- Outgrow, "Quiz Engagement Benchmarks: What is a Good Completion Rate?" — https://outgrow.co/blog/quiz-engagement-benchmarks-completion-rates
- Outgrow, "How to Create a Lead Generation Quiz That Converts" — https://outgrow.co/blog/how-to-create-a-lead-generation-quiz
- Fyrebox, "Quizzes vs Forms: Why Quizzes Convert 2-3x Better for Lead Gen" — https://www.fyrebox.com/blog/quizzes-convert-better-than-forms
- HubSpot, "10 Form Conversion Optimization Tips" — https://blog.hubspot.com/marketing/optimize-conversion-forms
- Venture Harbour, "Why Multi-Step Lead Forms Get up to 300% More Conversions" — https://ventureharbour.com/multi-step-lead-forms-get-300-conversions/
- Venture Harbour, "5 Studies on How Form Length Impacts Conversion Rates" — https://ventureharbour.com/how-form-length-impacts-conversion-rates/
- Zuko, "Is a Single Page Form or Multi Step Form Better for Conversion?" — https://www.zuko.io/blog/single-page-or-multi-step-form
- Fillout, "One-question-at-a-time vs single-page forms, which is best?" — https://www.fillout.com/blog/one-question-at-a-time-form
- Product Philosophy, "The Goal Gradient Effect: Progress Mechanics, Endowed Advancement, and the Post-Reward Reset" — https://productphilosophy.com/articles/goal-gradient-progress-mechanics
- Learning Loop, "Goal Gradient Effect: Speed up user progress" — https://learningloop.io/plays/psychology/goal-gradient-effect
- Irrational Labs, "Knowledge Cuts Both Ways: When Progress Bars Backfire" — https://irrationallabs.com/blog/knowledge-cuts-both-ways-when-progress-bars-backfire/
- ScoreApp, "Quiz Lead Form: Should it go Before or After your Quiz Questions" — https://www.scoreapp.com/quiz-leads-form/
- IxDF, "What is the IKEA Effect?" — https://ixdf.org/literature/topics/ikea-effect
- Renascence, "IKEA Effect: Overvaluing Products Customers Help Create" — https://www.renascence.io/journal/ikea-effect-overvaluing-products-customers-help-create
- UX Bootcamp, "Labor Illusion — UX Psychology" — https://bootcamp.uxdesign.cc/labor-illusion-ux-psychology-e5d7cd240a89
- Letters Remain, "The Labour Illusion, or Why Visible Effort Matters" — https://lettersremain.com/the-labour-illusion-or-why-visible-effort-matters/
- Pencil & Paper, "UX Design Patterns for Loading" — https://www.pencilandpaper.io/articles/ux-pattern-analysis-loading-feedback
- RevenueCat, "Inside Noom's Web-to-App Onboarding Funnel: UX Teardown + Key Takeaways" — https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel
- Growthwaves, "The 113-screen onboarding that doesn't feel long" — https://www.growthwaves.io/p/the-113-screen-onboarding-that-doesnt
- App Fuel, "BetterMe Fitness — Onboarding" — https://theappfuel.com/examples/bettermefitness_onboarding
- App Fuel, "Fitbod — Onboarding flow" — https://www.theappfuel.com/examples/fitbod_onboarding
- Reteno Gallery, "YAZIO Calorie Counter & Diet App Onboarding Flow" — https://gallery.reteno.com/flows/app-screens-yazio
- Reteno Gallery, "Sweat App Onboarding Flow Screens" — https://gallery.reteno.com/flows/app-screens-sweat
- Sensai.fit, "Best AI Fitness Apps in 2026: We Tested Fitbod, Freeletics, Future, and More" — https://www.sensai.fit/blog/best-ai-fitness-apps-2026-fitbod-freeletics-future-trainiac-alternatives
- Mobbin, "MacroFactor Android Onboarding Flow" — https://mobbin.com/explore/flows/8efb5656-fa99-47c3-a59e-1c378b787462
- Nutriscan, "Is the Simple App Free? Free Tier Limits and Premium Cost 2026" (secondary/low confidence) — https://nutriscan.app/blog/posts/simple-app-pricing-2026-free-vs-premium-coaching-20a26c6873
- tipsforteachers, "#43 Ask the easiest question first" (cites Anaya et al. 2022 study on question-order effects) — https://tipsforteachers.substack.com/p/43-ask-the-easiest-question-first

### Notes on confidence and gaps
- No source in this pass provided a rigorously disclosed, controlled experiment specifically on: chip/echo UI completion lift, exact optional-question completion cost, or numeric-vs-sectioned progress bar A/B — these are the weakest-evidence sections (§5, §7, part of §3) and should be treated as hypotheses to test on LEXFIT's own traffic, not settled facts.
- Ladder, Centr, 8fit, Future, Caliber, Lumen, Zoe, and Simple's full onboarding flow could not be verified screen-by-screen with public sources in this pass; a follow-up using Mobbin (paid) or fresh App Store walkthroughs is needed before citing their specifics externally.
- The 20–30% / 35–45% email-gate conversion figures (§4) are vendor-reported without disclosed methodology — corroborate with LEXFIT's own A/B before treating as a benchmark.
