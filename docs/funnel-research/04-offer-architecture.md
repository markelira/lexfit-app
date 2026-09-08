# Offer Architecture & Value Communication — Research Report

Track 4 of the funnel research series. Research conducted September 2026. Prices, guarantee terms, and program structure are FIXED inputs — this report only addresses how to *present* them. Hungarian-language product; sources are English-language industry/academic research on subscription fitness apps and consumer psychology.

---

## TL;DR

1. **Fitness is the one category where annual should lead, not follow.** Health & Fitness is the only App Store category where annual revenue share is *growing* (51%→61%, 2023–2025), and monthly plans "consistently underperform both weekly and annual at every price tier." ([Adapty](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/)) LEXFIT has zero annual sales — the plan card architecture is very likely the cause, not lack of demand.
2. **Our stated 54% first-renewal rate vs. 67.7% benchmark is a real, quantified gap** — 67.7% is Adapty's own measured Health & Fitness first-renewal rate, confirming the number in our brief is a legitimate external benchmark, not a guess. ([Adapty](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/))
3. **Paid intro pricing (our 490 HUF week) beats free trials on commitment quality**, but converts fewer people in: paid "trials" (micro-subscriptions) convert ~13% after the intro period vs. 34% for free trials, but buyers who paid something already have "skin in the game." ([RevenueCat](https://www.revenuecat.com/blog/growth/free-trials-dont-make-sense-anymore))
4. **Defaulting the pricing UI to annual, with a savings badge, is the single most-replicated lever for annual adoption** — A/B tests show 20–30% lift in annual adoption from defaulting; dollar-amount savings framing ("save 33,980 Ft/year") outperforms percentage-only framing. (Baremetrics via [m3ter](https://www.m3ter.com/blog/15-data-driven-pricing-page-optimizations))
5. **Completion-conditional guarantees work, but the failure path is the dangerous part.** StepBet's own data: successful completers increased activity 44%, but people who *failed* their challenge dropped activity −5.3% *below* their own baseline. ([PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9982638/)) Our "10 edzés / 5 hét" guarantee needs an explicit near-miss/soft-landing design, not silent failure.
6. **Refund rates on completion-gated guarantees are very low in practice**: GMB Fitness reports ~3% refund requests across 125,000+ customers. ([GMB](https://gmb.io/guarantee/)) The guarantee is a conversion lever, not a real cost driver, once conditional.
7. **Hype/value-stacking backfires with skeptical, trust-first audiences**: overstated or padded value claims trigger "defensive scepticism" and measurably reduce brand trust — the opposite of what a low-hype Hungarian brand needs. ([sciencedaily.com](https://www.sciencedaily.com/releases/2007/03/070327113414.htm), [leaphumanx](https://leaphumanx.com/insights/industry-insights/marketing-in-the-age-of-distrust-building-brands-for-a-skeptical-audience/))
8. **A pause option is one of the highest-leverage, lowest-risk retention levers available at the offer stage**: measured 9.6–10% reduction in churn and up to 46% LTV increase where implemented, plus 51.7% of would-be cancellers use it instead of leaving. ([Chargebee](https://www.chargebee.com/blog/power-of-pause-subscription-retention-strategy/), [Recharge](https://getrecharge.com/blog/reduce-your-cancellations-by-10-with-pause-subscriptions/))

---

## 1. Intro pricing vs. free trial vs. freemium (2025–26 evidence)

**Measured:**
- Hard paywalls: median Day-35 trial-to-paid conversion 10.7%, vs. 2.1% for freemium — but 1-year retention converges (28% freemium vs. 27% hard paywall). ([Business of Apps](https://www.businessofapps.com/data/app-subscription-trial-benchmarks/), RevenueCat 2026)
- Free trial conversion has fallen from 47% (2021) to 34% (2025) — market saturation/trial fatigue. ([Adapty](https://adapty.io/blog/trial-conversion-rates-for-in-app-subscriptions/))
- Paid trials/micro-subscriptions convert lower after the intro window (~13%) than free trials (~34%), but users with a completed paid trial show up to 64% higher LTV, and paid-trial users are described as having "skin in the game" — more primed to actually use the product. ([RevenueCat](https://www.revenuecat.com/blog/growth/free-trials-dont-make-sense-anymore))
- Health & Fitness specifically: install→trial 9.5%, trial→paid 42.2%, first renewal 67.7% (Adapty's measured Health & Fitness benchmark — matches the external number already in our brief). 86.1% of trial conversions happen Day 0; a secondary bump at Days 4–7 (2.6%) represents people who engaged with the app before deciding. ([Adapty](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/))
- Trials of 17–32 days convert far better (42.5–45.7% median) than trials under 4 days (25.5%). ([RevenueCat](https://www.revenuecat.com/state-of-subscription-apps-2026-business/), [Adapty](https://adapty.io/blog/trial-conversion-rates-for-in-app-subscriptions/))

**Reading for our 490 Ft/week → 1,990 Ft/week structure:** this is structurally a *paid* intro, not a free trial, which the evidence favors for retention quality even though raw conversion is lower than free-trial equivalents. The literature's real warning for us is the **first-renewal cliff**: 30–50% churn on weekly plans at first renewal industry-wide ([Lifecycle Architect](https://lifecyclearchitect.com/benchmarks/fitness-apps-churn-rate-benchmarks/)) is exactly where our weekly plan is exposed, and our 54% first-renewal vs. category's 67.7% says this cliff is currently costing us disproportionately on the *weekly* tier specifically.

**Change to make:** Don't try to "fix" the weekly plan's inherent renewal risk with messaging alone — instead stop it from being the path of least resistance. Use the intro price to get people in the door, but actively route intent toward monthly/annual before the first weekly renewal ever fires (see §2 and the presentation spec).

## 2. Making annual sell

**Measured:**
- Health & Fitness is the *only* App Store category where annual share is still growing: 51%→61% of category revenue, 2023→2025. Monthly underperforms weekly AND annual at every price point tested. ([Adapty](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/))
- Defaulting a pricing page/toggle to annual, with a visible savings badge, produced a documented 40% ACV increase in one SaaS case ($1,200→$1,680) and Baremetrics-cited A/B tests show 20–30% lift in annual adoption purely from defaulting the toggle. ("Most popular" badges separately lift conversion 16–30%, with one case going from 1.2%→3.1% after simplification + badge.) ([m3ter](https://www.m3ter.com/blog/15-data-driven-pricing-page-optimizations))
- Dollar-amount savings framing ("save $118/year") outperforms percentage-only framing because it anchors to a concrete number rather than an abstract ratio. (same source)
- Annual subscribers in Health & Fitness churn at 48% after year 1 vs. 79% for monthly — annual is ~3x more valuable over 24 months. ([Adapty](https://adapty.io/blog/weekly-monthly-annual-subscription-plan/))
- Education and Health & Fitness both price annual at ~5x the weekly rate as a category norm. ([Adapty](https://adapty.io/blog/weekly-monthly-annual-subscription-plan/)) — LEXFIT's own math: 1,990 Ft/week × 52 ≈ 103,480 Ft/year list-equivalent vs. 39,900 Ft actual annual price = a real, sayable 61% saving, well past typical anchor multiples.

**Opinion (industry commentary, not measured):** Adapty's growth team argues the standard SaaS pattern "lead with weekly, upsell to annual" is backwards specifically for fitness, because fitness goals are annual in nature (New Year's, "get in shape for X"), so leading with annual may convert better than in other categories. This is a hypothesis in their commentary, not an isolated A/B result — treat as directional, not proof.

**Change to make:** Our pricing band currently (per the offer-v3 branch context) presents three co-equal cards. Given zero annual sales and this evidence, the annual card should be visually pre-selected/highlighted by default (not just "available"), carry an explicit HUF savings amount (not just "−44%"), and the weekly card should be reframed from "the default" to "the trial-priced option" — see the presentation spec below.

## 3. Conditional completion guarantees

**Measured:**
- StepBet (N=72,974 participants, 2015–2020): overall challenge success rate 73%; successful completers' daily steps rose 44% from a 7,774 baseline; but participants who *failed* their challenge saw steps fall **−5.3% below their own pre-challenge baseline**. ([PMC — Rewley et al.](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9982638/), [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2214782923000106)) This is the critical finding for us: the miss-path is not neutral, it's actively worse than never having tried — a real regression risk, not just a missed upsell.
- GMB Fitness: ~3% refund-request rate across 125,000+ customers under a conditional guarantee. ([GMB](https://gmb.io/guarantee/)) FASTer Way to Fat Loss requires a minimum activity threshold ("15 stars," i.e., demonstrated participation) within 30 days to qualify for their guarantee — i.e., they also gate the refund on doing the work, not just asking. ([FASTer Way](https://www.fasterwaytofatloss.com/satisfaction-guarantee))
- Refund rates for Health & Fitness apps generally run 4.71% (vs. category averages), and apps with hard paywalls see higher refund rates (5.8%) than freemium (3.4%) — useful context for what "high" looks like; a 3% conditional-guarantee refund rate is *below* the category's ordinary refund noise floor. ([Lifecycle Architect / Adapty compilation](https://lifecyclearchitect.com/benchmarks/fitness-apps-churn-rate-benchmarks/))

**Opinion, well-supported by the above data pattern (Hormozi's taxonomy, industry commentary):** conditional guarantees convert better than unconditional ones because they signal the seller's confidence *and* pre-filter for people who intend to do the work — but this literature doesn't offer a clean isolated "guarantee A vs B lift %" figure; the StepBet numbers are the closest thing to a controlled measurement of the completion-guarantee mechanic itself.

**Change to make:** LEXFIT's guarantee already requires 10 workouts in 5 weeks (correctly conditional, easier variants count — already good design per StepBet's own finding that *flexibility in what counts* matters). The gap: nothing in the current guarantee copy appears to address the miss-path. Add a soft-landing message for people approaching week 5 without 10 workouts done — before the deadline, not after — offering a schedule reset or extension conversation, framed as "let's fix the plan," not "you failed." This directly targets the StepBet regression finding: intervene *before* the miss becomes a failure event, since failure itself predicts a self-esteem-driven pullback, not just a lapsed subscription.

## 4. Value stacking and the "value equation"

**Measured/documented:** Hormozi's Value Equation (Value = Dream Outcome × Perceived Likelihood ÷ (Time Delay × Effort)) and itemized bonus-stacking are widely deployed in US direct-response/info-product marketing; reported lifts (2–3x) come from the practitioner's own case studies, not independent measurement — treat as **opinion/anecdote**, not verified data.

**Measured, opposing consideration:** overstated/padded claims measurably reduce trust and increase "defensive scepticism" in consumers who detect exaggeration ([ScienceDaily summary of Kirmani & Zhu research](https://www.sciencedaily.com/releases/2007/03/070327113414.htm)); 96% of consumers report general distrust of advertising claims ([Inc./consumer trust surveys](https://www.inc.com/dakota-shane/96-percent-of-consumers-dont-trust-ads-heres-how-to-sell-your-product-without-coming-off-sleazy.html)); modern brand-trust literature explicitly recommends transparency over hype for trust-dependent categories. ([leaphumanx](https://leaphumanx.com/insights/industry-insights/marketing-in-the-age-of-distrust-building-brands-for-a-skeptical-audience/))

**Reading for LEXFIT:** the itemized "$X value, you pay $Y" hard stack is a US direct-response convention with real conversion claims behind it but built on unverified case studies, and it directly collides with a trust-first, low-hype, non-scarcity Hungarian brand identity (which the LEXFIT positioning explicitly commits to). Given no independently measured advantage and a real, documented trust cost from over-claiming, itemized dollar-value stacking is **not recommended**.

**Change to make:** present included programs (morning routines, 7-day beginner, core, legs/glutes, evening, posture, challenge archive) as a plain, named inclusion list ("mind included:" style) rather than "$X value each, $Y total value, you pay only $Z." Let breadth read as substance through specificity (name each program, one-line what it's for) rather than through invented dollar figures.

## 5. Price anchoring that is true

**Measured/documented:**
- Anchoring effect itself is one of the most robust findings in behavioral economics (Tversky & Kahneman 1974) — first number seen sets the reference frame for everything after. ([cited via Gymkee](https://gymkee.com/blog/personal-training-pricing/))
- Unit-cost comparison practice for trainers: convert subscription cost to a per-contact/per-session figure to compare fairly against per-session PT pricing — an established practitioner technique, not an isolated RCT, but logically sound and directly usable with our real numbers. ([unleashdstrength.com](https://unleashdstrength.com/fitness/online-personal-training-cost/))
- No direct causal study was found (in this search) proving "less than a coffee" framing backfires; the concern is theoretical/reputational rather than measured. Do not over-claim a "backfire" citation here — flag as **unverified concern**, not evidence.

**True anchors available to us, arithmetically real (not invented):**
- One Hungarian PT hour (5,500–7,500 Ft) ≈ one *month* of LEXFIT monthly plan (5,990 Ft) or well over a month of annual (3,325 Ft/mo). This is a true, checkable comparison — safe to use.
- Annual plan per-workout: if a member does the 30-workout Start program plus weekly content drops, the per-workout cost falls fast — but only claim a per-workout number we can actually substantiate from real usage data, not an assumed usage rate. Do not manufacture a "30 workouts ÷ price" number for the annual plan, since annual includes unlimited access, not a fixed 30-workout allotment — that number is only true for evaluating the Start program in isolation.

**Change to make:** use the true PT-hour-vs-month anchor once, prominently, near the pricing band ("egy szem személyi edzés ára Magyarországon 5.500–7.500 Ft — ennyiből egy teljes hónap LEXFIT"). Avoid manufactured per-day/per-coffee language since it's unverified and risks the "cheapening" problem the user explicitly flagged; if a per-workout number is used, it must be scoped explicitly to the 30-workout Start program, not the open-ended subscription.

## 6. Naming and framing the product

**Measured:** none of the searches surfaced a controlled study directly comparing "named fixed-length program" vs. "open library" framing on adherence; the closest adjacent evidence is MOOC research showing shorter, chunked courses have *better* completion than long ones ([IRRODL](https://www.irrodl.org/index.php/irrodl/article/view/2112/3340)) — directionally supports LEXFIT's existing "30 guided workouts" framing over an undifferentiated open library, but is not a direct match (online course completion ≠ fitness app retention).

**Measured, process vs. outcome goals:** process/action goals (e.g., "show up 4x this week") outperform outcome-only goals for adherence because they're fully within the user's control and don't stall out when results lag; combining process + performance + outcome goals is recommended over any single type. ([exercise-science-informed goal-setting summaries](https://levelupgym.app/blog/fitness-goal-setting-best-practices-for-real-results))

**Meta ad policy (2026), directly relevant to any outcome+timeframe claims in paid acquisition:** ads may not promise specific outcomes within a set timeframe without disclaimers; time-bound transformation claims ("lose X in 30 days") are restricted; general fitness/wellness content (not weight-loss/diet products) sits in a lighter-restriction tier, but guaranteed-or-specific-outcome-in-a-timeframe language is still rejected regardless of category. ([Accelerated Digital Media](https://www.accelerateddigitalmedia.com/insights/guide-to-social-media-health-ad-restrictions-2026/), [AuditSocials](https://www.auditsocials.com/blog/meta-ad-policy-updates-2026-guide))

**Change to make:** "LEXFIT Start — 30 guided workouts, at your own pace" is already the *better*-supported framing (action goal, self-paced, not a hard timeframe) — keep it, and keep the milestone framing (1·5·10·15·30) since it's process/action-based, which the goal-setting evidence favors over pure outcome claims. For any Meta ad copy referencing the guarantee or milestones, state the action ("10 edzés, 5 hét") without pairing it with a body-outcome claim (weight/inches) in the same ad unit, to stay clear of the outcome+timeframe restriction.

## 7. Objection handling that converts

**Measured (general, non-fitness-specific but robust):** 60–80% of gym members lapse within 8 months, most within 3; top cited reasons for gym cancellation: too expensive (41%), circumstances changed (25%), no time (23%). ([YouGov](https://yougov.com/en-us/articles/49804-us-why-do-consumers-turn-their-backs-on-gym-memberships), [uscreen survey](https://www.uscreen.tv/blog/fitness-motivation-survey/)) These map directly to LEXFIT's actual audience (repeat quitters), and none of them is "content isn't good enough" or "YouTube is free" — the literature located here doesn't surface "free alternative exists" as a commonly *cited* blocking objection at all; the real blockers are self-belief/consistency and value-for-money perception, not content availability.
- No direct "YouTube is free, why pay" study was found in this search — treat the objection as real (it's a known category objection in practitioner commentary) but **not independently measured** in the sources located.
- Adjacent, measured: fitness apps that show value *before* the paywall see 1.5–2x higher trial-to-paid conversion than immediate hard-paywall apps; apps gating personalization/guidance (not just content) convert meaningfully better than apps gating content alone — i.e., people pay for structure and being told what to do, not for exclusive video access. ([RocketShip HQ / Adapty-sourced](https://www.rocketshiphq.com/paywall-structure-fitness-app-workouts/))

**Change to make:** the strongest evidence-backed answer to "YouTube is free" isn't a rebuttal line, it's structural: emphasize what YouTube structurally cannot offer — the guided sequence/pacing, the milestone tracking, the "what do I do today" decision removed — rather than competing on video-content breadth. This lines up with the gating-personalization-not-content finding. On page: lead objection-handling copy with "nem videókat veszel, hanem azt, hogy pontosan tudod mit csinálj ma" (paraphrase) rather than defending catalog size.

## 8. Churn/retention levers at the offer stage

**Measured:**
- Pause option: reduces churn by up to 9.6–10%, reduces involuntary churn 15–20% when paired with dunning, and 51.7% of would-be cancellers use a pause instead if offered; 58% of subscribers report having paused *something* rather than cancel in the past year; well-implemented pause programs show up to 46% LTV increase. ([Chargebee](https://www.chargebee.com/blog/power-of-pause-subscription-retention-strategy/), [Recharge](https://getrecharge.com/blog/reduce-your-cancellations-by-10-with-pause-subscriptions/))
- Pre-renewal reminder emails: legally required in a growing number of jurisdictions (e.g., Massachusetts 2025 law: 5–30 days advance notice for subscriptions >31 days; California similar tiered windows) and — even where not required — measurably reduce chargeback/dispute rates because "forgot I was charged" disputes drop. ([toslawyer.com](https://toslawyer.com/auto-renewal-and-subscription-compliance-what-saas-and-e-commerce-companies-must-fix-in-2026/), [Davis+Gilbert](https://www.dglaw.com/spring-cleaning-your-subscription-practices-what-to-toss-before-regulators-do/)) The EU's own direction (Digital Omnibus / Digital Fairness Act track) is toward mandatory one-click cancel buttons and transparent renewal terms — a dedicated cancel button becomes required for EU online sales; exact date varies by source (mid-2026 timeframe cited). ([Churnkey](https://churnkey.co/guides/eu-consumer-rights-directive), [Taylor Wessing](https://www.taylorwessing.com/en/interface/2025/predictions-2026/digital-fairness-act-and-digital-omnibus))
- Failed payments/dunning account for 30–50% of *all* fitness-app churn — a large share of "churn" is not a decision at all, it's a card failure. ([Lifecycle Architect](https://lifecyclearchitect.com/benchmarks/fitness-apps-churn-rate-benchmarks/))
- Annual plans structurally skip the weekly/monthly renewal cliff and show ~2x first-renewal retention vs. monthly. ([arpubrothers](https://arpubrothers.com/blog/2025-saas-mobile-apps-trends/), Adapty)

**Change to make:** promise the pause option and easy-cancel *at the point of purchase*, not just in the FAQ/ToS — this is a conversion asset (removes the "am I locked in" objection) as much as a retention one, and the EU is heading toward requiring it as a visible mechanism anyway, so surfacing it now is free future-proofing. Given failed payments are 30–50% of churn, make sure pre-renewal reminder emails exist for every plan (not just annual) — this is as much a retention lever as a compliance one.

---

## Recommended presentation spec — 3 plan cards + guarantee block

| Element | Weekly (490→1,990 Ft) | Monthly (5,990 Ft) | Annual (39,900 Ft) |
|---|---|---|---|
| **Card role** | Low-friction entry point, not the anchor | Middle option, no badge | **Preselected/highlighted by default** |
| **Leads with** | "Próbáld ki 490 Ft-ért az első héten" (price-of-entry framing) | Flat monthly framing, no gimmick | Per-month equivalent first: "3.325 Ft/hó" in large type, "39.900 Ft/év" as the supporting line |
| **Savings framing** | none needed — it *is* the cheap option | none | Explicit HUF saved, not just "%": "−44%, azaz 33.980 Ft-ot spórolsz egy évben a heti tarifához képest" (dollar-amount framing outperforms % alone per m3ter data above) |
| **Badge** | "Kezdéshez" / none | none | "Ajánlott" or equivalent "most popular"-style badge — evidence-backed 16–30% lift lever |
| **Fine print under card** | "Az első hét után 1.990 Ft/hét" stated plainly (renewal-cliff transparency, not buried) | — | Pause + easy-cancel line surfaced here directly, not just in FAQ |
| **Anchor line (shared, once, near the band, not per-card)** | "Egy személyi edzés Magyarországon 5.500–7.500 Ft — ennyiből egy teljes hónap LEXFIT." | | |
| **What NOT to do** | No itemized "$X value" bonus stack on any card. No per-day/coffee framing. No countdown/scarcity (per existing owner decision, now also evidence-supported: hype/exaggeration reduces trust in skeptical audiences). | | |

**Guarantee block placement:** directly beneath the plan cards (not in a separate FAQ/footer section) — since it's a genuine risk-reversal on the exact decision being made at that scroll position. Structure:
1. The condition, stated as an action goal: "Végezd el az első 10 edzést 5 héten belül (a könnyített változatok is számítanak)."
2. The reward for following through, framed positively first (this *is* also milestone #10 in the product) — not led with the refund.
3. The refund promise, stated plainly, once: one email, full refund of fees paid to date.
4. **New addition based on the StepBet failure-regression finding:** a proactive week-4 check-in promise — "ha úgy látod, nem fog összejönni az 5 hét, írj nekünk a határidő előtt — újratervezzük veled, nem büntetünk" (paraphrase) — placed as a small supporting line under the guarantee, not hidden in support docs. This is the single highest-leverage new copy element this research surfaces: it's the one place the evidence says the current design has an open risk (silent failure → regression below baseline) with no visible mitigation.
5. Separate one-line mention of the statutory 14-day EU withdrawal right, kept distinct from the guarantee so the two aren't conflated (already correct per existing docs — retain).

---

## What this means for LEXFIT — summary table

| Finding | Evidence strength | Concrete change |
|---|---|---|
| Annual underperforms because it's not the default | Measured (Adapty category data + SaaS A/B tests) | Pre-select/highlight annual card, per-month-first framing, HUF savings called out |
| Weekly renewal cliff is the real 54%-vs-67.7% gap | Measured (industry weekly-renewal churn 30-50%) | Keep weekly as entry point but don't let it be the "default"; be transparent about the 1,990 Ft/week step-up on the card itself |
| Conditional guarantees convert but the miss-path is a real regression risk | Measured (StepBet N=72,974) | Add a pre-deadline "let's replan" check-in message to the guarantee block |
| Refund rates under conditional guarantees are low | Measured (GMB ~3%) | Don't be afraid of the guarantee's cost; it's a conversion asset, not a P&L risk |
| Itemized value-stacking risks trust in a low-hype market | Measured (trust/scepticism research) + explicit brand positioning | Present included programs as a clean named list, no invented dollar values |
| True PT-hour anchor is available and unused | Logical/arithmetic, verifiable | Add one anchor line near pricing: PT hour ≈ 1 month of LEXFIT |
| Per-day/coffee framing is unverified and risks cheapening | No supporting measured evidence found either way | Do not add it; if per-unit framing is used, scope strictly to the 30-workout Start program |
| Action-goal naming ("30 workouts") outperforms outcome-timeframe claims for both adherence and ad compliance | Measured (goal-setting research) + policy (Meta 2026 rules) | Keep "30 guided workouts" framing; never pair milestone/guarantee claims with body-outcome claims in ad copy |
| "YouTube is free" isn't the actual top objection — price-for-value and self-doubt are | Measured (gym cancellation surveys) | Reframe objection copy from "our videos vs. free videos" to "structure and being told what to do today" |
| Pause option + pre-renewal reminders are high-leverage, low-cost retention levers, and EU is heading toward requiring visible cancel/pause mechanisms anyway | Measured (9.6–10% churn reduction) + regulatory direction | Surface pause + easy-cancel on the pricing band itself, not buried in FAQ; ensure renewal reminder emails exist for every plan tier |

---

## Sources

- [RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps)
- [RevenueCat — State of Subscription Apps 2026 (10-minute summary)](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026)
- [RevenueCat — Why free trials don't make sense anymore](https://www.revenuecat.com/blog/growth/free-trials-dont-make-sense-anymore)
- [RevenueCat — Should your app stop offering free trials?](https://www.revenuecat.com/blog/growth/should-your-app-stop-offering-free-trials)
- [Adapty — In-app subscription benchmarks for Health & Fitness apps](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/)
- [Adapty — Weekly vs. monthly vs. annual: which plan type should you offer?](https://adapty.io/blog/weekly-monthly-annual-subscription-plan/)
- [Adapty — Trial conversion rates for in-app subscriptions](https://adapty.io/blog/trial-conversion-rates-for-in-app-subscriptions/)
- [Business of Apps — App Subscription Trial Benchmarks (2026)](https://www.businessofapps.com/data/app-subscription-trial-benchmarks/)
- [RocketShip HQ — The Adapty benchmark that should make fitness apps rethink hard paywalls](https://www.rocketshiphq.com/paywall-optimization-fitness-apps/)
- [RocketShip HQ — Most fitness apps gate workouts immediately; the data says that's backwards](https://www.rocketshiphq.com/paywall-structure-fitness-app-workouts/)
- [Lifecycle Architect — Fitness App Churn Rate in 2026](https://lifecyclearchitect.com/benchmarks/fitness-apps-churn-rate-benchmarks/)
- [m3ter — 15 Data-Driven Pricing Page Optimizations](https://www.m3ter.com/blog/15-data-driven-pricing-page-optimizations)
- [PMC — Put your money where your feet are: StepBet gamified deposit contracts (Rewley et al.)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9982638/)
- [ScienceDirect — same StepBet study](https://www.sciencedirect.com/science/article/pii/S2214782923000106)
- [PMC — Corrigendum to the StepBet study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10235419/)
- [GMB Fitness — 30-Day Trial Period and Program Guarantee](https://gmb.io/guarantee/)
- [FASTer Way to Fat Loss — Satisfaction Guarantee](https://www.fasterwaytofatloss.com/satisfaction-guarantee)
- [ScienceDaily — Marketing: Too Much Hype Backfires](https://www.sciencedaily.com/releases/2007/03/070327113414.htm)
- [leaphumanx — Marketing in the Age of Distrust](https://leaphumanx.com/insights/industry-insights/marketing-in-the-age-of-distrust-building-brands-for-a-skeptical-audience/)
- [Inc. — 96% of consumers don't trust ads](https://www.inc.com/dakota-shane/96-percent-of-consumers-dont-trust-ads-heres-how-to-sell-your-product-without-coming-off-sleazy.html)
- [Gymkee — 7 Ways to Price Your Personal Training Services](https://gymkee.com/blog/personal-training-pricing/)
- [unleashdstrength.com — Online Personal Training Cost](https://unleashdstrength.com/fitness/online-personal-training-cost/)
- [Accelerated Digital Media — 2026 Health Advertising Policies on Social Media](https://www.accelerateddigitalmedia.com/insights/guide-to-social-media-health-ad-restrictions-2026/)
- [AuditSocials — Meta Ad Policy Updates 2026](https://www.auditsocials.com/blog/meta-ad-policy-updates-2026-guide)
- [levelupgym.app — Fitness Goal-Setting Best Practices](https://levelupgym.app/blog/fitness-goal-setting-best-practices-for-real-results)
- [IRRODL — Massive open online course completion rates revisited](https://www.irrodl.org/index.php/irrodl/article/view/2112/3340)
- [YouGov — US: Why do consumers turn their backs on gym memberships?](https://yougov.com/en-us/articles/49804-us-why-do-consumers-turn-their-backs-on-gym-memberships)
- [Uscreen — The Motivation Gap survey](https://www.uscreen.tv/blog/fitness-motivation-survey/)
- [Chargebee — The Power of Pause: Reduce Churn and Retain Subscribers](https://www.chargebee.com/blog/power-of-pause-subscription-retention-strategy/)
- [Recharge — Reduce Your Cancellations by 10% With Pause Subscriptions](https://getrecharge.com/blog/reduce-your-cancellations-by-10-with-pause-subscriptions/)
- [toslawyer.com — Auto-Renewal and Subscription Compliance 2026](https://toslawyer.com/auto-renewal-and-subscription-compliance-what-saas-and-e-commerce-companies-must-fix-in-2026/)
- [Davis+Gilbert — Spring Cleaning Your Subscription Practices](https://www.dglaw.com/spring-cleaning-your-subscription-practices-what-to-toss-before-regulators-do/)
- [Churnkey — The EU consumer rights directive: a subscription cancellation guide](https://churnkey.co/guides/eu-consumer-rights-directive)
- [Taylor Wessing — Digital Fairness Act and Digital Omnibus predictions 2026](https://www.taylorwessing.com/en/interface/2025/predictions-2026/digital-fairness-act-and-digital-omnibus)
- [arpubrothers — 2025 Mobile App Report: LTV, Paywalls & Pricing Benchmarks](https://arpubrothers.com/blog/2025-saas-mobile-apps-trends/)

**Note on source quality:** a few secondary blog sources returned by search (e.g., generic "commitment devices" listicle sites) carry specific-sounding statistics (e.g., a claimed 90-day public-vs-private commitment study with N=1,247) that could not be traced to a primary study within this research session. These are flagged as **unverified** in §8 rather than cited as measured fact, and are excluded from the TL;DR and the recommendation table.
