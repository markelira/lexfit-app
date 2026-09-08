# Results / Plan-Reveal Page → Paid Conversion — Research Report

**Scope:** the LEXFIT reveal page (quiz → email gate → plan reveal → paywall) and how to convert a free-lead-magnet session into a same-session paying subscriber, with a specific sub-goal of shifting mix toward the 39,900 Ft annual plan (currently zero annual sales).

**Method:** four parallel research passes covering the 8 questions below, English-language sources, prioritizing 2024–2026. Every number below is labeled **MEASURED** (an actual study, RCT, or platform-scale dataset), **VENDOR CASE** (a real but single-company/uncontrolled result reported by a company like RevenueCat/Superwall/Adapty), or **OPINION/CONSENSUS** (teardown or practitioner framing with no controlled measurement behind it). Do not present OPINION items as data to stakeholders.

---

## TL;DR

1. Health & Fitness apps convert trial-to-paid at **62%** vs a **53%** all-category average — fitness is a high-converting vertical; don't under-sell out of price-shyness. **MEASURED**, Adapty 2026 (16,000+ apps, $3B+ revenue).
2. No verified "% of fitness-quiz completers who pay same session" statistic exists publicly. Best triangulated range from adjacent data: **roughly 3–10%**. Treat as an estimate/target band, not a benchmark to promise against.
3. Sequential, multi-screen onboarding-paywalls convert **12.41% vs 9.07%** for single-page/immediate-price layouts — a **37% relative lift**. **MEASURED**, Superwall, 40M+ paywall opens.
4. Pre-selecting a plan as the default is the single best-evidenced lever available: opt-out defaults raised real-world consent from **42% to 82%** in the classic Johnson & Goldstein study. **MEASURED**, robust, repeatedly replicated.
5. Centered position alone changes choice: **26.5% vs 10%** for center vs edge items in a menu-choice field study; center-positioned contestants won **45% vs 10%** in a game-show field study. **MEASURED**.
6. Fresh Start Effect (temporal landmarks trigger gym sign-ups/goal commitments) and Implementation Intentions (**d=0.65** meta-analytic effect on follow-through) are legitimate, measured substitutes for the banned countdown timer.
7. A 2-year RCT on **680,588 users** found giving away *more* free value did not suppress immediate paid conversion — the "free plan will cannibalize the subscription" fear is not supported by the strongest evidence found. **MEASURED**.
8. Fake strikethrough ("was X Ft") pricing carries real legal exposure under the **EU Omnibus Directive** (applies in Hungary) unless the reference price was genuinely charged in the last 30 days — LEXFIT's weekly 490→1,990 Ft is legitimate; a fabricated "was" price on monthly/annual would not be.

---

## Q1 — Quiz results page → paid conversion benchmarks

| # | Finding | Type | Source |
|---|---|---|---|
| 1 | Health & Fitness trial-to-paid conversion: **62%** vs **53%** all-category average (Entertainment: 38%). | MEASURED (16k+ apps, $3B+ rev) | [adapty.io/blog/health-fitness-app-subscription-benchmarks](https://adapty.io/blog/health-fitness-app-subscription-benchmarks/) |
| 2 | Health & Fitness weekly-plan specifics: install→trial **9.5%** (14.5% NA); trial→paid **42.2%**; first renewal **67.7%**; **86.1%** of conversions happen on Day 0. | MEASURED, Adapty 2026 | same as above |
| 3 | Hard paywalls convert **5×** freemium at Day 35 (**10.7% vs 2.1%**). | MEASURED (115k+ apps, $16B rev) | [revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026) |
| 4 | Generic (cross-industry) quiz funnel: **40.1%** start→lead, **65%** start→finish — stable since 2013. Not fitness-specific. | MEASURED, not fitness-specific | [tryinteract.com/blog/quiz-conversion-rate-report](https://www.tryinteract.com/blog/quiz-conversion-rate-report/) |
| 5 | Post-quiz purchase-rate thresholds: **≥6% = good, >8% = excellent** (beauty/skincare vertical). Quiz result pages convert **10–25%** vs **1.5–3%** for static store pages generally. | MEASURED, cross-vertical (beauty), extrapolated | [visualquizbuilder.com/...good-conversion-rate-by-vertical](https://www.visualquizbuilder.com/post/good-conversion-rate-by-vertical-quiz-benchmark-report) |
| 6 | Median fitness app converts only **3.8%** of installs to paid; showing value before paywalling correlates with **1.5–2×** higher trial-to-paid in some reports (contradicted by at least one named case where delaying the paywall *dropped* conversion 15%→3%, so this is directionally mixed). | Mixed, vertical-dependent | [rocketshiphq.com/paywall-structure-fitness-app-workouts](https://www.rocketshiphq.com/paywall-structure-fitness-app-workouts/) |
| 7 | Noom's funnel (113 screens, 10–15 min) is the most-cited fitness/diet case study but has **no published conversion %** anywhere found. | OPINION/consensus | [revenuecat.com/blog/growth/web-to-app-onboarding-funnel](https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel) |
| 8 | BetterMe: no public conversion-rate breakdown found despite being a major quiz-funnel operator. | Explicit data gap | — |

**Verdict:** there is no rigorous public "fitness-quiz → same-session-paid" number. The best defensible target is **3–10%**, stated as an estimate. Do not quote a false precision to stakeholders.

---

## Q2 — Element order on a results/reveal page

| # | Finding | Type | Source |
|---|---|---|---|
| 9 | Every fitness/diet quiz funnel examined puts result **before** price (email gate → personalized result → additional profiling → "building your plan" loader → price). | OPINION/consensus (observed structure) | [revenuecat.com/blog/growth/web-to-app-onboarding-funnel](https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel) |
| 10 | Multi-page onboarding-paywalls (value → expectations → price after relevance is established → payment last) convert **12.41% vs 9.07%** for single-page — **37% relative lift**. | MEASURED, large-scale observational (40M+ opens, min. 50 opens/paywall) | [superwall.com/blog/...convert-37-better-than-single-page](https://superwall.com/blog/new-postmulti-page-onboarding-paywalls-convert-37-better-than-single-page-heres-why) |
| 11 | Paywalls that reference the user's own onboarding answers lift conversion **10–15%**. | VENDOR CASE, MEASURED | [superwall.com/blog/superwall-best-practices](https://superwall.com/blog/superwall-best-practices-winning-paywall-strategies-and-experiments-to) |
| 12 | Raising paywall *exposure* itself (not just its content) drove a linear revenue lift in one case where only 40% of users ever reached the paywall in a long flow; raising exposure to 80% lifted revenue before any conversion-copy optimization. | VENDOR CASE, MEASURED (exposure point); "aha-moment timing" framing is OPINION | [superwall.com/blog/show-a-paywall-during-these-three-high-converting-app-experiences](https://superwall.com/blog/show-a-paywall-during-these-three-high-converting-app-experiences) |
| 13 | "If a paywall appears before context is established it feels jarring… onboarding-first conversion looks very different." | OPINION/editorial framing | [revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026) |
| 14 | Apps that trigger the paywall after a measurable value moment (vs. immediate hard paywall) see trial-start rates **2.1×** higher. | MEASURED via secondary summary of Adapty 2026, not independently re-verified | [rocketshiphq.com/adapty-subscription-app-benchmark-2025-summary](https://www.rocketshiphq.com/adapty-subscription-app-benchmark-2025-summary/) |
| 15 | GoodUI Pattern #114: making the price *more visible/prominent once shown* tends to increase conversion, across 8 tests — but only moderate statistical confidence (54.4% of the 90%-power target). | MEASURED, moderate confidence (flagged by GoodUI itself) | [goodui.org/patterns/114](https://goodui.org/patterns/114/) |
| 16 | Social-proof-placement stats (testimonials +34%, social proof below CTA +68%, 3.91%→6.38% after repositioning) are widely repeated but not from a verifiable primary source. | LOW-CONFIDENCE, aggregator-sourced | [tryflint.com](https://www.tryflint.com/blog/landing-page-social-proof-element-performance-statistics), [wisernotify.com](https://wisernotify.com/blog/landing-page-social-proof/) |
| 17 | Fitness-specific: 2–4 free workouts is the reported sweet spot before gating; personalized paywalls convert **15–30%** higher than generic ones; sampling before paywall cuts early churn **40–60%**. | Moderate confidence, case-study aggregator, methodology not fully traceable | [rocketshiphq.com/paywall-structure-fitness-app-workouts](https://www.rocketshiphq.com/paywall-structure-fitness-app-workouts/) |

**Verdict:** result-before-price is universal and LEXFIT already does this structurally. The two levers *not yet reflected* in LEXFIT's page: (a) break the long single scroll into discrete sequential sections rather than one continuous page (finding 10); (b) make the pricing band's own copy reference the user's specific quiz answers (findings 11, 17), not a generic 3-tier table.

---

## Q3 — Paywall teardowns (Noom, BetterMe, Yazio, Fastic, Simple, Sweat, Freeletics, Ladder, Zoe)

Coverage varies: Noom, BetterMe, Yazio, Fastic have real teardown detail; Sweat, Ladder, Zoe, Freeletics, Simple are thinner. Noted explicitly where unverifiable.

**Noom** — Reveal artifact: a goal-date/trend-line graph contrasting a "steady trend" against "yo-yo dieting." Pricing: pay-what-you-want 14-day trial ($0.50–$18.37), full price buried in a dense legal block below the headline trial price. Guarantee: none found. Urgency: **confirmed countdown timer** starts once the paywall loads, plus a free add-on "if you sign up within 15 minutes," plus 6 upsells across 25 more screens post-purchase. [revenuecat.com](https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel), [retention.blog](https://www.retention.blog/p/the-longest-onboarding-ever), [nutrola.app](https://nutrola.app/en/blog/is-noom-free-anymore), [FunnelFox](https://blog.funnelfox.com/web-funnels-insights-and-trends/)

**BetterMe** — Reveal artifact: a custom body avatar built from the user's stats, paired with before/after-style projections and a locked plan preview. Copy: "Get visible results in 4 weeks" beside the price, plus press logos and before/after photos. 3 plans (1-week / 4-week / 12-week), a "most popular" tier highlighted. Guarantee: real but tightly gated 30-day money-back — requires contacting within 30 days, having followed the program 7+ days, **and submitting screenshots proving 7+ completed sessions**; reviewers describe it as "a guarantee people say they can never actually claim." Urgency: confirmed countdown timer; an 80%-discount nudge tested as more effective than emotional design. [FunnelFox](https://blog.funnelfox.com/effective-paywall-screen-designs-mobile-apps/), [betterme.world money-back policy](https://betterme.world/en/money-back-policy), [Unstar](https://unstar.app/blog/is-betterme-legit-worth-it-fitness-app-reviews-2026), [Superwall](https://superwall.com/blog/5-paywall-patterns-used-by-million-dollar-apps)

**Yazio** — 2 plans at first paywall (12-month, 3-month), no free trial ("soft paywall"). Guarantee: none found. Urgency: on dismissal, a **spin-the-wheel modal** offers up to "75% OFF FOREVER." [screensdesign.com](https://screensdesign.com/showcase/yazio-calorie-counter-diet), [nutriscan.app](https://nutriscan.app/blog/posts/yazio-pricing-2026-free-vs-pro-what-pro-unlocks-33b26f8fc7)

**Fastic** — Copy: "Free to cancel anytime," heavy social proof (millions of users, ~half-million 5-star reviews), price reframed as "Only $3.33 per week." 3 plans, one "Most Popular" highlighted with 50% off shown on it. Guarantee: "free to cancel anytime" is the risk-reversal, no money-back guarantee found. [FunnelFox](https://blog.funnelfox.com/effective-paywall-screen-designs-mobile-apps/)

**Simple** — Criticized specifically for **not showing pricing until after the full quiz + account creation** ("a shady way to force interest," per reviewers). Pricing is algorithmic/variable by signup timing and device. No guarantee found. [autonomous.ai](https://www.autonomous.ai/ourblog/simple-app-review-for-weight-loss-and-intermittent-fasting)

**Sweat** — No genuine teardown found; 7-day trial requires card upfront, ~$20–25/mo. Do not treat any Sweat-specific copy claim as verified. [Tom's Guide](https://www.tomsguide.com/reviews/sweat-app)

**Freeletics** — "Building your plan" loading animation reinforces personalization. Guarantee: real 14-day money-back, but confusingly worded as "14 days *before* the renewal date" (a recurring complaint). Urgency: confirmed **two-stage "soft squeeze / hard squeeze"** paywall — standard offer, then on dismissal a personalized 50%-off offer *with a countdown timer*. [screensdesign.com](https://screensdesign.com/showcase/freeletics-workouts-fitness), [help.freeletics.com](https://help.freeletics.com/hc/en-us/articles/115004636089-Request-a-refund)

**Ladder** — No hard paywall with visible pricing on reveal — instead shows "a clear timeline of what to expect during the trial." 7-day free trial, **zero payment info required at signup** — the trial-led, no-card mechanic *is* the risk reversal. No urgency mechanics reported. [screensdesign.com](https://screensdesign.com/showcase/ladder-strength-training-plans), [garagegymreviews.com](https://www.garagegymreviews.com/ladder-app-review)

**Zoe** — Structurally different: requires buying a $359–499 physical test kit before personalization activates; result is a gut-health score /1000 plus food-response clusters, delivered after 4–6 weeks, not an instant reveal. Not comparable to LEXFIT's model. [zoe.com](https://zoe.com/how-it-works)

**Cross-app patterns:**
- The "your plan is ready" screen is always a **visual artifact**, never a checklist (trend-line graph, body avatar, numeric score, progress animation) — the visualization *is* the pitch.
- Price is always reframed to its smallest unit right beside the total ("$3.33/week").
- 3-tier pricing with a highlighted middle/annual "Most Popular" option is the dominant pattern where documented.
- Two mutually exclusive risk-reversal strategies: trial-led/no-card-upfront (Ladder, minimal guarantee copy) vs. charge-first/conditional-refund (BetterMe, Freeletics — heavy guarantee copy to offset the friction). LEXFIT is closer to the second model, so guarantee copy earns its place.
- Every documented app escalates pressure with countdown timers or exit-intent discount games — **none of the studied apps use a single clean "reveal + price, no games" screen.** LEXFIT deliberately not doing this is a genuine differentiator, not a gap to fix by copying them.

---

## Q4 — Number of plan options & default preselection

| # | Finding | Type | Source |
|---|---|---|---|
| 18 | 32M+ paywall interactions: 2 products beat 1 by **61%**; 3 beats 2 by **44%** (baseline conv. 3.77%) — confounded with visibility, price, and default selection per Superwall's own caveat. | MEASURED, platform-scale, confounded | [superwall.com/blog/how-many-products-should-you-offer-on-your-paywall](https://superwall.com/blog/how-many-products-should-you-offer-on-your-paywall) |
| 19 | 3-tier structures reported to convert 8–16% higher than 2-tier. | Secondary-blog paraphrase, unverified against primary source | [rocketshiphq.com/optimize-app-paywall-higher-conversion](https://www.rocketshiphq.com/optimize-app-paywall-higher-conversion/) |
| 20 | Choice overload: Iyengar & Lepper's jam study (30% vs 3% purchase) is contradicted by Scheibehenne et al.'s 50-study meta-analysis (~zero average effect); Chernev's moderator analysis says the effect only appears under high complexity + high task difficulty + high preference uncertainty + high effort-minimization goal — none of which apply to a returning quiz-taker choosing among 3 familiar cadence plans. | MEASURED academic, contested | [atticusli.com/choice-overload-jam-study](https://atticusli.com/replication-crisis/choice-overload-jam-study/), [arxiv.org/pdf/2212.03931](https://arxiv.org/pdf/2212.03931) |
| 21 | Decoy/asymmetric-dominance effect replicated in only **11 of 91** real-world attempts across 23 categories. | MEASURED academic, largely failed replication | [atticusli.com/decoy-effect-asymmetric-dominance](https://atticusli.com/replication-crisis/decoy-effect-asymmetric-dominance/) |
| 22 | Center-stage effect: center-positioned menu items chosen **26.5% vs 10%** at edges; center-positioned game-show contestants won **45% vs 10%**. | MEASURED academic | [coglode.com/research/centre-stage-effect](https://www.coglode.com/research/centre-stage-effect), [sciencedirect.com/S1057740809000291](https://www.sciencedirect.com/science/article/abs/pii/S1057740809000291) |
| 23 | Default effect: opt-out defaults raised consent **42%→82%** (Johnson & Goldstein, organ donation) — the most robust, most-replicated mechanism found in this whole research pass. Applied-to-paywalls table (secondary source, moderate confidence): annual selection rate **28%** (monthly default) → **56%** (annual badge only) → **69%** (annual pre-selected) → **74%** (annual pre-selected + monthly de-emphasized). | MEASURED (core mechanism); VENDOR/secondary numbers (applied table) | [dangoldstein.com/JohnsonGoldstein_Defaults](https://www.dangoldstein.com/papers/JohnsonGoldstein_Defaults_Transplantation2004.pdf), applied table via [rocketshiphq.com/optimize-app-paywall-higher-conversion](https://www.rocketshiphq.com/optimize-app-paywall-higher-conversion/) |
| 24 | Counter-context: industry-wide, weekly plans convert **1.7–7.4×** better than annual and now generate **55.5%** of all app subscription revenue (up from 43.3% in 2023) — the market is moving *away* from annual, not toward it. | MEASURED, Adapty 2026 (16k apps, $3B rev) | [adapty.io/state-of-in-app-subscriptions](https://adapty.io/state-of-in-app-subscriptions/) |

**Verdict:** LEXFIT's existing 3-plan structure is correct (finding 18); choice overload and decoy engineering are not reliable explanations for zero annual sales (20, 21) — **default selection and visual center position are the two evidenced, actionable levers** (22, 23). Frame the annual push honestly as a deliberate business bet against the market grain (24), not something defaults alone will fully reverse.

---

## Q5 — Price presentation / anchoring

| # | Finding | Type | Source |
|---|---|---|---|
| 25 | Showing the annual price as a monthly-equivalent lifted new revenue/impression **45%** (Brazil), **26%** (Mexico), **8%** (USA) — strong regional variance. | VENDOR CASE, MEASURED, single company | [revenuecat.com/blog/growth/subscription-pricing-psychology](https://www.revenuecat.com/blog/growth/subscription-pricing-psychology-how-to-influence-purchasing-decisions) |
| 26 | Hiding the monthly plan behind a "View all plans" link and defaulting to annual produced "a notable increase" in yearly subs (unquantified). | VENDOR CASE, MEASURED, unquantified | [revenuecat.com/blog/growth/guide-to-mobile-paywalls-subscription-apps](https://www.revenuecat.com/blog/growth/guide-to-mobile-paywalls-subscription-apps) |
| 27 | Gourville (1998), "Pennies-a-Day": reframing a lump sum as small recurring amounts lowers perceived cost — but the effect weakens/reverses as the base cost grows large. LEXFIT's 39,900 Ft reframed as ~767 Ft/week stays within the effect's working range (comparable to the real 1,990 Ft/week price). | MEASURED, peer-reviewed | [academic.oup.com/jcr/24/4/395](https://academic.oup.com/jcr/article-abstract/24/4/395/1797969) |
| 28 | "Costs less than a coffee/PT session per day" framing is mechanistically consistent with #27 but has **no isolated measured lift** found anywhere. | OPINION/consensus only | — |
| 29 | Strikethrough pricing: 3–10% lift *when the reference price is real*; fake "was" prices carry real legal/trust risk (JCPenney's $50M class-action settlement for fabricated regular prices) and are now regulated — the **EU Omnibus Directive requires any "was" price to reflect the lowest price actually charged in the preceding 30 days**, applicable in Hungary as an EU member state. | MEASURED (lift) + real legal constraint | [natlawreview.com/strike-through-pricing](https://natlawreview.com/article/dont-let-strike-through-pricing-strike-out-your-dtc-website-comparison-pricing) |
| 30 | Strikethrough pricing functions as a quality/credibility signal only when the reference price is realistic. | MEASURED academic | [sciencedirect.com/S0167811618300168](https://www.sciencedirect.com/science/article/abs/pii/S0167811618300168) |

**Verdict:** LEXFIT's weekly 490→1,990 Ft strikethrough is legitimate (real intro price) and can stay. **Do not** invent a "was X Ft" tag for monthly or annual — they've never had a higher list price, so faking one is both a trust risk and, per the Omnibus Directive, a compliance risk in an EU market. Instead show the *real* arithmetic: 52 weeks × 1,990 Ft = 103,480 Ft vs. 39,900 Ft — a genuine, defensible savings claim, plus the annual price shown as its real per-week/per-month equivalent next to the lump sum.

---

## Q6 — Risk reversal / guarantees on the paywall

| # | Finding | Type | Source |
|---|---|---|---|
| 31 | Hormozi's conditional-guarantee framing: phrase the conditions as "the things that virtually guarantee the result," leading with the action, not the refund clause — a success roadmap, not an escape hatch. | OPINION/framework, widely repeated | [alexhormozi.wiki/guarantee-types-and-examples](https://alexhormozi.wiki/frameworks/guarantee-types-and-examples) |
| 32 | Pink Gym coaching: refunds 100% of fees only if the client participated for the entire term *and* submitted weekly progress reports ≥95% of the time — a real-world precedent for a completion-gated guarantee structurally identical to LEXFIT's. | Industry case example | [pinkgym.com/return-policy](https://pinkgym.com/return-policy/) |
| 33 | Category default is *unconditional* time-window guarantees: Orangetheory (30-day risk-free), Snap Fitness (30-day, no completion requirement). LEXFIT's completion-gated guarantee is a differentiator from convention, signaling confidence rather than just de-risking — but needs copy that explains *why* completion is required so it doesn't read as a gotcha. | Case examples | search results, snapfitness.com, orangetheory.com |
| 34 | A widely-cited "moving the CTA below the fold lifted conversion 304%" case study could not be independently verified (primary CXL source returned 403) — treat as CRO folklore, not confirmed data. | Unverifiable, discard as evidence | — |
| 35 | Course/coaching refund-rate benchmarks circulating online (21% platform-wide, 28% premium, <4% for challenges) come from an uncited blog admitting these are "typical patterns," not sourced data. | Explicitly unverified — do not cite as fact | — |
| 36 | No industry data was found on guarantee placement (above vs. below the plan selector) specifically — RevenueCat's Experiments tooling supports testing this, but no public result exists. | Data gap — needs LEXFIT's own A/B test | [revenuecat.com/blog/growth/paywall-placement](https://www.revenuecat.com/blog/growth/paywall-placement) |

**Verdict:** no external number can justify a specific guarantee placement or predict LEXFIT's refund rate — track your own claims data as ground truth. What *is* well-supported is the phrasing principle (31): lead the guarantee with the completion action ("Csináld végig az első 10 edzést 5 hét alatt"), state the refund as the natural consequence if it still isn't working, not as a hedge.

---

## Q7 — Legitimate substitutes for urgency (no timers)

| # | Finding | Type | Source |
|---|---|---|---|
| 37 | Fresh Start Effect: Google searches for "diet," gym visits, and goal commitments spike at temporal landmarks (week/month/year start, semester start, after birthdays) — a landmark opens a new "mental accounting period," filing past failures under "the old self." | MEASURED, strong (3 field studies) | [Dai, Milkman & Riis, Management Science 2014](https://faculty.wharton.upenn.edu/wp-content/uploads/2014/06/Dai_Fresh_Start_2014_Mgmt_Sci.pdf) |
| 38 | Implementation intentions ("if [cue], then I will [behavior]"): meta-analysis of 94 studies, **d=0.65** medium-large effect on follow-through vs. goal intentions alone. | MEASURED, robust meta-analytic base | [Gollwitzer & Sheeran 2006](https://www.sciencedirect.com/science/chapter/bookseries/abs/pii/S0065260106380021) |
| 39 | Caveat: an NBER field RCT (877 subjects) found implementation-intention planning did **not** significantly improve sustained gym attendance, contradicting the broader meta-analysis — the mechanism likely helps *initiation* (workout #1) more reliably than *weeks-long adherence*. | MEASURED, mixed/contested | [nber.org/w24959](https://www.nber.org/system/files/working_papers/w24959/w24959.pdf) |
| 40 | Loss-framed messaging ("what you lose by staying static") outperforms equivalent gain-framing in established loss-aversion conversion research. | MEASURED (established literature) | [invespcro.com/loss-aversion-marketing](https://www.invespcro.com/blog/13-loss-aversion-marketing-strategies-to-increase-conversions/) |
| 41 | Personalization lifts conversion strongly in vendor case studies (40–60% lift from personalized result copy; one case reports 490%) — real numbers, but marketing-vendor sourced, not peer-reviewed. | VENDOR CASE, moderate confidence | [heyflow.com/personalized-results-quiz-funnel](https://heyflow.com/blog/personalized-results-quiz-funnel/), [quizell.com/case-studies/healthybud](https://quizell.com/case-studies/healthybud) |
| 42 | Activation/time-to-value: users not activated within 3 days are ~**90%** more likely to churn; one documented case moved activation from **17.4%→53.5%** by delivering value immediately instead of gating behind setup steps. | MEASURED, industry data with real before/after | [appcues.com/blog/time-to-value](https://www.appcues.com/blog/time-to-value) |

**Verdict:** three legitimate, evidence-backed urgency substitutes exist and none require faking a deadline: (a) let the user pick/commit to a specific start day, defaulting to the next Monday (Fresh Start Effect, 37); (b) prompt a specific day/time for workout #1 right after signup (implementation intentions, 38, for *initiation* specifically per caveat 39); (c) minimize clicks between reveal and first action (activation data, 42) — this is a stronger, better-evidenced lever than anything urgency-shaped.

---

## Q8 — Free lead magnet + paid product coexistence

| # | Finding | Type | Source |
|---|---|---|---|
| 43 | "Value gap" / structurally incomplete lead magnet: the free asset should be the *first structural piece* of the paid product (not a parallel, different offering) so its incompleteness makes the next step obvious — named failure modes are the "disconnect gap" (free ≠ paid topic) and the "value cliff" (huge free value, then a jarring pitch). | Practitioner consensus, convergent across independent sources | [leadmagnetagency.com](https://leadmagnetagency.com/how-to-use-lead-magnets-to-upsell-paid-products/), [aaronreid.substack.com](https://aaronreid.substack.com/p/the-exact-lead-magnet-framework-i) |
| 44 | 2-year field RCT, **n=680,588**, freemium image-editing SaaS: a longer free trial increased trial adoption (+11.1%) and delayed conversion (+42.4%); **immediate conversion was flat/non-significant** — cannibalization exists but is offset by learning/trust gains, netting to no harm. | MEASURED, strong, large-scale RCT | [pmc.ncbi.nlm.nih.gov/PMC12217587](https://pmc.ncbi.nlm.nih.gov/articles/PMC12217587/), [frontiersin.org/10.3389/fpsyg.2025.1568868](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1568868/full) |
| 45 | Freemium gating rule of thumb: block *after* emotional buy-in, not before value delivery — "gate too aggressively and you prevent the aha moment; gate too loosely and you remove the incentive to upgrade." | OPINION/practitioner consensus | [stackmatix.com/freemium-to-paid-conversion](https://www.stackmatix.com/blog/freemium-to-paid-conversion) |
| 46 | Framing: freemium/free-plan funnels can't rely on artificial time pressure the way a boxed trial can — the paywall context itself (clear next-step value, risk removal, why-now-is-reasonable) has to do the urgency work instead of a clock. | OPINION, directly on-point for the timer ban | synthesis of freemium literature above |

**Verdict:** LEXFIT's structure (free = plan/schedule only, paid = video execution + tracking + adaptive progression + community) already matches the evidenced "structurally incomplete" pattern (43). The strongest available evidence says a *more* generous free plan will not meaningfully cannibalize immediate conversion (44) — so there's room to make the free reveal feel more complete/valuable without fear, as long as the paywall sits right after peak emotional buy-in (45), which is exactly where it already sits in the funnel.

---

## Proposed element order for the LEXFIT reveal page

Current order: plan headline → 7-day week grid → adaptation notes → "your first workout" panel → programme preview (30 workouts) → calorie/macro result → full 3-plan pricing band → footer.

**Proposed order, with the evidence behind each position:**

1. **Personalized headline, referencing the user's own quiz answers directly** ("A te 8 hetes terved — [célod] alapján"). *Evidence: 9, 11, 17, 41 — personalized copy tied to quiz answers is the most consistently repeated lift across sources (10–15% to 40–60% depending on source quality).*

2. **The plan visualization as ONE cohesive artifact: 7-day week grid + calorie/macro result combined into a single visual block**, not split apart by other content. *Evidence: Q3 cross-app pattern — every major competitor's "plan is ready" screen is a single visual artifact (Noom's trend line, BetterMe's avatar, Zoe's score), not a scattered checklist. Currently LEXFIT strands the calorie/macro result down near pricing — move it up next to the week grid so the personalization payload lands in one look.*

3. **"Your first workout" panel, reframed as an implementation-intention prompt** — not just a preview, but a concrete "pick when you'll do this" moment ("Mikor csinálod meg az első edzésed? Hétfő reggel?"), defaulting to the next Monday. *Evidence: 37 (Fresh Start Effect), 38/39 (implementation intentions — strongest for initiation specifically), 42 (activation/time-to-value — fast first action beats any urgency mechanic). This is the single best-evidenced non-timer urgency substitute and it belongs early, right after the value reveal, not buried mid-page.*

4. **Adaptation notes (forgiveness mechanic / proof of fit)** — kept here as the "why this will actually work for you" proof layer. *Evidence: 9/13/14 — result → proof → offer is the consistent structure across sources; this section is the "proof" beat.*

5. **Programme preview — trimmed, not the full 30-workout list.** Show a representative taste (e.g., 4–6 workouts spanning the phases) rather than the complete catalog. *Evidence: 17 — 2–4 free workouts is the reported sweet spot before gating, and sampling before paywall is associated with lower early churn; showing all 30 up front risks feeling like the full product is already free (tension with 43's "value gap" principle), which works against paid conversion.*

6. **Guarantee, explained as a completion roadmap, positioned as the last piece of reassurance before the offer** — lead with the action ("Csináld végig az első 10 edzést 5 hét alatt"), state the refund as the natural consequence, not a hedge. *Evidence: 31 (Hormozi framing), 33 (LEXFIT's conditional guarantee is already a positioning differentiator vs. category-standard unconditional guarantees — the copy should make that intentional, not apologetic). No reliable data exists on above-vs-below-price placement (36), so putting it directly before the offer — as the last "why this is safe" beat — is the defensible default until LEXFIT runs its own test.*

7. **Pricing band — redesigned, not just relocated:**
   - **Annual (39,900 Ft) visually centered and pre-selected by default**, not neutral. *Evidence: 22 (center-stage effect), 23 (default effect — the strongest, most robust mechanism in the entire research set).*
   - Annual shown with its **real per-week/per-month equivalent** next to the lump sum (≈767 Ft/hét, ≈3,325 Ft/hó). *Evidence: 25, 27.*
   - A **genuine comparison line**, not a fake strikethrough: "52 hét áron heti bérlettel: 103 480 Ft — évesen: 39 900 Ft." *Evidence: 29, 30 — real arithmetic is both evidenced and legally safe under the EU Omnibus Directive; a fabricated "was" price on annual/monthly is not.*
   - Monthly plan present but visually de-emphasized (smaller card or behind a "más csomagok" toggle), since it's the plan most likely to cannibalize annual without being the acquisition engine weekly is. *Evidence: 26.*
   - Weekly plan keeps its real 490→1,990 Ft strikethrough (legitimate, already charged). *Evidence: 29.*
   - Pricing header copy references the user's goal/answers, not a generic "Válassz csomagot." *Evidence: 11, 17.*

8. **Footer** — unchanged position.

**A structural note independent of ordering:** per finding 10, converting this into distinct sequential sections (rather than one continuous scroll) is itself associated with a 37% relative lift over a single long page. Consider whether steps 1–3 and steps 4–7 should be visually/interaction-distinct "screens" or clearly separated sections rather than one uninterrupted scroll — and per finding 12, verify current scroll-depth analytics to confirm users are actually reaching the pricing band at all before optimizing what's in it.

---

## What this means for LEXFIT — action table

| Area | Current state | Evidenced change | Confidence |
|---|---|---|---|
| Same-session conversion target | Unstated | Target 3–10% same-session paid; do not promise a fitness-specific benchmark that doesn't exist | Estimate/triangulated |
| Page structure | One long continuous scroll | Break into clearer sequential sections/beats | MEASURED (37% relative lift, finding 10) |
| Calorie/macro result placement | Stranded near pricing, after programme preview | Merge into the top "plan is ready" visual block with the week grid | Cross-app pattern (Q3) |
| First-workout panel | Mid-page preview | Move up, reframe as an implementation-intention prompt ("pick your day"), default to next Monday | MEASURED (37, 38, 42) |
| Programme preview | Full 30-workout list | Trim to a 4–6 workout taste | Moderate confidence (17) + value-gap principle (43) |
| Guarantee copy | — | Lead with the completion action, not the refund clause; keep it positioned as the last reassurance before the offer | OPINION/framework (31) + no data against current placement (36) |
| Annual plan selection | Neutral / zero sales | Pre-select annual by default + center position | MEASURED, strongest lever found (22, 23) |
| Annual price display | Lump sum only (assumed) | Add real per-week/per-month equivalent | VENDOR CASE, regionally variable (25) |
| Annual "savings" claim | None / risk of fake strikethrough | Real "52 weeks vs. annual" arithmetic comparison, no fabricated "was" price | MEASURED + legal constraint (29, 30) |
| Monthly plan | Equal visual weight to annual/weekly | De-emphasize (smaller card or behind expand) | VENDOR CASE, unquantified (26) |
| Weekly plan strikethrough | 490→1,990 Ft | Keep as-is — it's a real, legally clean reference price | MEASURED + legal (29) |
| Urgency mechanic | None (correctly, per owner decision) | Do not add timers; use Fresh Start + implementation-intention framing instead | MEASURED (37, 38) |
| Free-plan generosity | Unclear if constrained by cannibalization fear | Don't under-deliver on the free plan out of cannibalization fear — evidence says it doesn't suppress immediate conversion | MEASURED, strong RCT (44) |
| Plan count on paywall | 3 plans | Keep 3 — don't reduce citing choice overload; that mechanism is contested/inapplicable here | MEASURED, contested-but-favors-status-quo (18, 20) |
| Decoy-tier engineering | N/A | Don't attempt — replication rate is only 11/91 in real-world tests | MEASURED, mostly fails (21) |

---

## Sources

- Adapty — Health & Fitness App Subscription Benchmarks 2026: https://adapty.io/blog/health-fitness-app-subscription-benchmarks/
- Adapty — State of In-App Subscriptions: https://adapty.io/state-of-in-app-subscriptions/
- RevenueCat — Subscription App Trends & Benchmarks 2026: https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026
- RevenueCat — Web-to-App Onboarding Funnel (Noom): https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel
- RevenueCat — Guide to Mobile Paywalls: https://www.revenuecat.com/blog/growth/guide-to-mobile-paywalls-subscription-apps
- RevenueCat — Subscription Pricing Psychology: https://www.revenuecat.com/blog/growth/subscription-pricing-psychology-how-to-influence-purchasing-decisions
- RevenueCat — Paywall Placement: https://www.revenuecat.com/blog/growth/paywall-placement
- Superwall — Multi-page onboarding paywalls convert 37% better: https://superwall.com/blog/new-postmulti-page-onboarding-paywalls-convert-37-better-than-single-page-heres-why
- Superwall — How many products should you offer on your paywall: https://superwall.com/blog/how-many-products-should-you-offer-on-your-paywall
- Superwall — Best practices, winning paywall strategies: https://superwall.com/blog/superwall-best-practices-winning-paywall-strategies-and-experiments-to
- Superwall — Show a paywall during these three high-converting experiences: https://superwall.com/blog/show-a-paywall-during-these-three-high-converting-app-experiences
- Superwall — 5 paywall patterns used by million-dollar apps: https://superwall.com/blog/5-paywall-patterns-used-by-million-dollar-apps
- RocketShip HQ — Paywall Optimization for Fitness Apps: https://www.rocketshiphq.com/paywall-optimization-fitness-apps/
- RocketShip HQ — Paywall Structure for Fitness App Workouts: https://www.rocketshiphq.com/paywall-structure-fitness-app-workouts/
- RocketShip HQ — Optimize App Paywall for Higher Conversion: https://www.rocketshiphq.com/optimize-app-paywall-higher-conversion/
- RocketShip HQ — Adapty Subscription App Benchmark 2025 Summary: https://www.rocketshiphq.com/adapty-subscription-app-benchmark-2025-summary/
- Interact — Quiz Conversion Rate Report: https://www.tryinteract.com/blog/quiz-conversion-rate-report/
- Visual Quiz Builder — Good Conversion Rate by Vertical: https://www.visualquizbuilder.com/post/good-conversion-rate-by-vertical-quiz-benchmark-report
- GoodUI — Pattern #114, Price Visibility: https://goodui.org/patterns/114/
- Flint — Landing Page Social Proof Stats: https://www.tryflint.com/blog/landing-page-social-proof-element-performance-statistics
- WiserNotify — Landing Page Social Proof: https://wisernotify.com/blog/landing-page-social-proof/
- Neoads (Substack) — Hard paywalls convert less but earn: https://neoads.substack.com/p/hard-paywalls-convert-less-but-earn
- Retention.blog — The Longest Onboarding Ever (Noom): https://www.retention.blog/p/the-longest-onboarding-ever
- Nutrola — Is Noom Free Anymore: https://nutrola.app/en/blog/is-noom-free-anymore
- CloneMRR — Noom clone breakdown: https://www.clonemrr.com/clone/noom
- FunnelFox — Web Funnels Insights and Trends: https://blog.funnelfox.com/web-funnels-insights-and-trends/
- FunnelFox — Effective Paywall Screen Designs: https://blog.funnelfox.com/effective-paywall-screen-designs-mobile-apps/
- FunnelFox — Top Web Funnels Breakdown: https://funnelfox.com/top-web-funnels-breakdown
- BetterMe — Money-Back Policy: https://betterme.world/en/money-back-policy
- Unstar — Is BetterMe Legit / Worth It: https://unstar.app/blog/is-betterme-legit-worth-it-fitness-app-reviews-2026
- ScreensDesign — Yazio showcase: https://screensdesign.com/showcase/yazio-calorie-counter-diet
- Nutriscan — Yazio Pricing 2026: https://nutriscan.app/blog/posts/yazio-pricing-2026-free-vs-pro-what-pro-unlocks-33b26f8fc7
- The App Fuel — Fastic onboarding example: https://www.theappfuel.com/examples/fastic_onboarding
- Nutriscan — Simple Premium Worth It: https://nutriscan.app/blog/posts/simple-premium-worth-it-2026-coach-avo-review-46d73e7a0e
- Nutriscan — Simple App Pricing 2026: https://nutriscan.app/blog/posts/simple-app-pricing-2026-free-vs-premium-coaching-20a26c6873
- Nutriscan — How to Cancel Simple Premium: https://nutriscan.app/blog/posts/how-to-cancel-simple-premium-step-by-step-869dc069e2
- Autonomous.ai — Simple App Review: https://www.autonomous.ai/ourblog/simple-app-review-for-weight-loss-and-intermittent-fasting
- Tom's Guide — Sweat App Review: https://www.tomsguide.com/reviews/sweat-app
- Reteno Gallery — Sweat Web Onboarding Flow: https://gallery.reteno.com/flows/web-screens-sweat
- ScreensDesign — Freeletics showcase: https://screensdesign.com/showcase/freeletics-workouts-fitness
- Freeletics Help Center — Request a Refund: https://help.freeletics.com/hc/en-us/articles/115004636089-Request-a-refund
- Medium (Kaan Saraç) — Is Freeletics renewal policy unethical: https://medium.com/@kaansarac/is-freeletics-renewal-policy-unethical-or-a-scam-97e3eac08b58
- ScreensDesign — Ladder showcase: https://screensdesign.com/showcase/ladder-strength-training-plans
- GiFit — How Much Is Ladder Workout App: https://gifit.io/blog/how-much-is-ladder-workout-app/
- Garage Gym Reviews — Ladder App Review: https://www.garagegymreviews.com/ladder-app-review
- Zoe — How It Works: https://zoe.com/how-it-works
- Wikipedia — Zoe Health Study: https://en.wikipedia.org/wiki/Zoe_Health_Study
- HealthRx — Zoe Brand Pricing Analysis: https://healthrx.com/brands-zoe/pricing-analysis
- Atticus Li — Choice Overload / Jam Study Replication Crisis: https://atticusli.com/replication-crisis/choice-overload-jam-study/
- arXiv — Choice overload moderator meta-analysis: https://arxiv.org/pdf/2212.03931
- Atticus Li — Decoy Effect / Asymmetric Dominance Replication Crisis: https://atticusli.com/replication-crisis/decoy-effect-asymmetric-dominance/
- Wikipedia — Decoy Effect: https://en.wikipedia.org/wiki/Decoy_effect
- Coglode — Centre-Stage Effect: https://www.coglode.com/research/centre-stage-effect
- ScienceDirect — Raghubir & Valenzuela, center-stage field study: https://www.sciencedirect.com/science/article/abs/pii/S1057740809000291
- Dan Goldstein — Johnson & Goldstein, Defaults and Organ Donation: https://www.dangoldstein.com/papers/JohnsonGoldstein_Defaults_Transplantation2004.pdf
- Oxford Academic (JCR) — Gourville, Pennies-a-Day: https://academic.oup.com/jcr/article-abstract/24/4/395/1797969
- National Law Review — Strike-Through Pricing legal risk: https://natlawreview.com/article/dont-let-strike-through-pricing-strike-out-your-dtc-website-comparison-pricing
- ScienceDirect — Quality signaling via strikethrough prices: https://www.sciencedirect.com/science/article/abs/pii/S0167811618300168
- Alex Hormozi Wiki — Guarantee Types and Examples: https://alexhormozi.wiki/frameworks/guarantee-types-and-examples
- Pink Gym — Return Policy: https://pinkgym.com/return-policy/
- Wharton / Dai, Milkman & Riis — The Fresh Start Effect (2014): https://faculty.wharton.upenn.edu/wp-content/uploads/2014/06/Dai_Fresh_Start_2014_Mgmt_Sci.pdf
- SSRN — Dai, Milkman & Riis paper: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2204126
- ScienceDirect — Gollwitzer & Sheeran, Implementation Intentions meta-analysis: https://www.sciencedirect.com/science/chapter/bookseries/abs/pii/S0065260106380021
- Goals and Progress — Implementation Intentions explainer: https://goalsandprogress.com/implementation-intentions-gollwitzer-how-to/
- NBER — Limits of Simple Implementation Intentions (gym RCT): https://www.nber.org/system/files/working_papers/w24959/w24959.pdf
- PubMed — related implementation-intentions/exercise study: https://pubmed.ncbi.nlm.nih.gov/30336306/
- Invesp CRO — Loss Aversion Marketing Strategies: https://www.invespcro.com/blog/13-loss-aversion-marketing-strategies-to-increase-conversions/
- Heyflow — Personalized Results Quiz Funnel: https://heyflow.com/blog/personalized-results-quiz-funnel/
- Quizell — HealthyBud Case Study: https://quizell.com/case-studies/healthybud
- Appcues — Time to Value: https://www.appcues.com/blog/time-to-value
- Lead Magnet Agency — Using Lead Magnets to Upsell Paid Products: https://leadmagnetagency.com/how-to-use-lead-magnets-to-upsell-paid-products/
- Aaron Reid (Substack) — Lead Magnet Framework: https://aaronreid.substack.com/p/the-exact-lead-magnet-framework-i
- PMC — Freemium trial-length field RCT (n=680,588): https://pmc.ncbi.nlm.nih.gov/articles/PMC12217587/
- Frontiers in Psychology — companion analysis of the same study: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1568868/full
- Stackmatix — Freemium to Paid Conversion: https://www.stackmatix.com/blog/freemium-to-paid-conversion
