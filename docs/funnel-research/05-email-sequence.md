# Email sequence research — LEXFIT quiz lead-nurture (D0 / D3 / D6)

Research date: 2026-09-08. Track: lead-nurture email for the LEXFIT quiz funnel (delivery → belief-shift → offer).

**Source-quality note (read before citing any number below):** most fitness-specific stats found on the open web come from ESP-adjacent marketing blogs (Klaviyo, Brevo, Omnisend, Mailchimp-alike aggregators) or SEO content farms that repackage those reports without new methodology. I've labeled each stat **[ESP report]** (real aggregate data across thousands of real brands — trustworthy but not causal), **[case study]** (one company, N=1, useful as an existence proof only), or **[opinion/blog]** (best-practice claim, no measured data behind it, do not treat as evidence). Several numbers only exist as one blog's paraphrase of "the 2025 Global Email Deliverability Report" or similar with no link to the underlying report — flagged as **[unverifiable]**.

---

## TL;DR

- Health/beauty campaign open rate benchmark: **30.5%** open, **1.24%** click on campaigns; automated flows do **4.8%** click and **13x** the placed-order rate of one-off campaigns — Klaviyo, 183,000 brands, Feb 2026. [ESP report] Your D0/D3/D6 are flows, not campaigns — expect the flow numbers, not the campaign numbers.
- Welcome/transactional-moment emails open far above cold campaigns: automation/transactional averages **30.63% open / 7.39% CTR** vs **20.73% open / 2.27% CTR** for newsletters — Brevo 2026 aggregate. [ESP report] A quiz-result delivery email is the single highest-intent send you'll ever make to this list; D0 should outperform D3/D6 by a wide margin — if it doesn't, something in delivery/timing is broken.
- Fitness has the **highest unsubscribe rate of any vertical, ~0.40%**, and crossing ~4 sends/week correlates with a 30%+ unsubscribe spike [ESP report, aggregator-sourced, treat as directional]. Your 3-email, ~6-day cadence is well inside the safe zone.
- No dataset measures "3 vs 5 vs 7" on a controlled fitness list, but one retail case study found a 7-email sequence beat 3 on conversion by **35%** while unsubscribes rose **15%** after email 5 [case study, N=1]. That trade favors adding a 4th value email (not a deadline) rather than a 5th/6th pitch.
- Personalized subject lines: **46% open vs 35%** generic, a **31% relative lift** [aggregator, primary study not identified — treat as directional, not gospel]. Your D3 P.S. personalization by quiz segment is worth keeping; full subject-line personalization by segment for D0/D6 is lower-effort than full-body segmentation and should be tested first.
- Quiz-based email personalization case studies show **30–40% open / 8–12% click** vs **~20%/~3%** un-personalized flows, and **11–15%** higher order value when personalization traces back to a quiz answer [case studies, small N — not a controlled fitness benchmark]. This supports your one-P.S.-per-segment design; full per-segment bodies are not evidenced as worth the production cost yet.
- Gmail/Yahoo/Apple bulk-sender rules (effective, enforced since Nov 2025): SPF+DKIM+DMARC, one-click List-Unsubscribe (RFC 8058) honored within 2 days, spam-complaint rate **< 0.30%** — non-compliant bulk mail is now **rejected outright**, not spam-foldered. [ESP/deliverability vendor consensus, well-corroborated across 6+ independent sources]
- Hungary's Advertising Act requires **prior, explicit, opt-in consent** for any electronic direct marketing — there is no GDPR "soft opt-in" carve-out reliably available, and NAIH guidance requires consent to be *channel-specific* (a person can consent to email but not SMS, etc.) [legal — CMS/DLA Piper/NAIH secondary summaries]. Your two-checkbox design (transactional-only vs marketing-consent) is the legally correct shape; make sure D3/D6 truly gate on the marketing checkbox and D0 stays framed as service/transactional, not promotional.

---

## 1. Benchmarks: fitness/health lead-nurture opens, clicks, CTOR, unsubscribe

- Klaviyo (183,000 brands, Feb 2026) [ESP report]: "Health & beauty" campaigns — **30.5% open**, **1.24% click**, **0.19% placed-order rate**; automated flows in the same vertical — **4.8% click**, **1.96% placed-order rate**. Source: https://www.klaviyo.com/uk/blog/email-marketing-benchmarks-open-click-and-conversion-rates
- Other aggregators quote a wider "health & fitness" band of **22.8–48.9% open** and **~1.45% click**, with fitness carrying the **highest unsubscribe rate of any industry at ~0.40%** [aggregator, underlying source unclear — treat range as directional]. Source: https://www.webtonic.io/blog/fitness-email-marketing-statistics
- Cross-industry 2025 average: **43.46% open**, **6.81% click-to-open** [ESP aggregator, unclear primary source]. Source: https://www.mailerlite.com/blog/compare-your-email-performance-metrics-industry-benchmarks
- Welcome-email-specific opens are reported anywhere from **57.8%** to **83.63%** depending on source/definition [aggregator, wide disagreement — treat the high end skeptically, it likely mixes "welcome series" with "single confirmation email"]. Sources: https://www.mailerlite.com/blog/compare-your-email-performance-metrics-industry-benchmarks , https://blog.hubspot.com/sales/average-email-open-rate-benchmark
- Automation/transactional-moment emails beat newsletter campaigns by roughly **8x** on combined open+click in one Brevo-sourced comparison (30.63%/7.39% vs 20.73%/2.27%) [ESP report]. Source: https://www.brevo.com/blog/email-marketing-benchmarks/
- EU region open rates run higher than global average (~22.8% CTR-adjusted regional aggregate cited by Moosend/verified.email roll-ups) but **no Hungary-specific benchmark exists** in any source found — Hungary is not broken out by any major ESP's public report. [gap — do not cite a Hungary number, none exists]

**What this means for D0/D3/D6:** Because D0 fires at the exact moment of maximum intent (quiz just completed, plan just promised), expect it to land near the transactional/welcome ceiling — plausibly 55–75% open for a clean, freshly-consented list, not the 30% "health & beauty campaign" number. D3 and D6 are closer to genuine campaign sends and should be benchmarked against the flow numbers (4.8% click, ~30% open for the vertical), not the welcome-email numbers. If D0 opens land in the 30s, treat it as a deliverability or subject-line problem, not "normal for fitness."

---

## 2. Sequence timing: is D0/D3/D6 right, and when should the offer land?

- No study measures "hours since a fitness quiz" decay directly. The nearest measured proxy is web-lead follow-up speed: contacting a web lead within 5 minutes makes conversion **9x** more likely than slower follow-up [oft-cited stat, originates from older lead-response-time research (InsideSales/Velocify), re-surfaced in current sales-email roundups — treat as directional B2B sales data, not fitness-specific, but the mechanism (freshness matters enormously) generalizes]. Source: https://www.apollo.io/magazine/best-time-call-email-prospects
- General nurture cadence data (mostly B2B, SaaS) says weekly is now the modal cadence (41% of teams, 2026) and mainstream nurture sequences run 5–7 emails over 2–3+ weeks [opinion/aggregate survey, not fitness]. Source: https://prospeo.io/s/how-many-emails-in-a-nurture-sequence
- A SaaS educational-sequence benchmark shows steep decay: open rate 52%→28% and CTR 12%→4% from email 1 to email 8 [single blog's proprietary data set, unverifiable, B2B not fitness]. Source: https://leadsuitenow.com/blog/email-automation-lead-nurturing-2026 — directionally useful only: **most of the decay happens in the first 2–3 emails**, which argues for compressing your highest-value asks early rather than spacing them out.
- Time-of-day/day-of-week data (largely B2B/ecommerce, not fitness-specific) puts peak *conversion* windows at Tue/Fri mornings (7–8am) even though Tue/Thu are best for opens generally [aggregator]. Source: https://www.omnisend.com/blog/best-time-to-send-email/ — low direct relevance to a triggered (not scheduled-batch) sequence like yours, since D0/D3/D6 fire relative to quiz completion, not calendar day. Not worth re-architecting your trigger logic around.

**Verdict for LEXFIT:** D0/D3/D6 (immediate / +3 days / +6 days) sits inside the range every source treats as reasonable for a short pre-purchase nurture — closer to the "compressed" end that the decay data favors (most of the erosion in engagement happens fast, so don't stretch this out to weeks). Nothing in the evidence says the offer needs to land earlier than D6 — quite the opposite: D3's job (belief shift + forgiveness rules) is exactly the kind of "email 2 or 3" content that measured sequences show still converts once the pitch lands, and moving the pitch to D3 would collapse the belief-shift job that the evidence (§7) says matters. **Keep D0/D3/D6.** Do not compress the offer earlier than D6.

---

## 3. Sequence length: 3 vs 5 vs 7, and what replaces the cut deadline email

- No controlled fitness/consumer-subscription study directly compares 3 vs 5 vs 7 lead-nurture emails on revenue-per-lead net of unsubscribe cost.
- Closest real data points:
  - Sales-sequence research: 4–7 touch sequences get **~27% reply rate** vs **9%** for 1–3 touches — **~3x** [aggregator, B2B cold-outreach context, not lead-nurture-to-purchase — mechanism differs (replies, not purchases)]. Source: https://www.landbase.com/blog/email-sequence-statistics
  - Beauty-brand case study: 7-email sequence beat 3-email by **35% conversion**, but unsubscribes rose **15%** after email 5 [case study, N=1, ecommerce not fitness-subscription]. Same source as above.
  - General guidance: low-ticket ecommerce often closes by email 2–3; the "5 emails, personalized CTAs" number recurs across several blogs as a rough sweet spot for low-ticket consumer offers [opinion, repeated across sources without a shared primary study]. Source: https://encharge.io/how-long-should-my-automated-email-sequence-be/

**Verdict:** The evidence is too thin (mostly N=1 or B2B-context) to justify jumping straight to 5–7. But the *pattern* that recurs everywhere — incremental emails add conversion up to roughly the point where unsubscribe cost catches up around email 5 — supports adding **one** email, not two or three, and it should not be the cut deadline. Recommend a **4th email at D9–D10** whose job is *social proof / re-statement of the guarantee*, not urgency: e.g., "what the first 10 workouts actually look like" — short, one testimonial-style line from Alexa about what people say after week 2, reiterate the refund guarantee in one line, single CTA back to the same offer. This is evidenced by: (a) the belief-shift literature in §7 (story/value content improves eventual conversion), (b) the length data suggesting room for one more email before unsubscribe risk rises, and (c) it avoids the banned deadline mechanic entirely by being a *value/proof* email, not a countdown.

---

## 4. Subject lines: what's measured, and evaluation of your three

- Personalized subject lines: **46% open vs 35%** non-personalized (**+31% relative**) [aggregator claim, primary study not named — corroborated directionally by multiple sources but treat the exact numbers as soft]. Source: https://belkins.io/blog/b2b-cold-email-subject-line-statistics
- Question-form subject lines hit **46% open**, outperforming other framings in the same dataset [same source, same caveat].
- Length: **2–4 words** reportedly yields the top open rate in that dataset; a separate range cited elsewhere is 6–10 words / 30–50 characters as the safer general zone [conflicting aggregator claims — no consensus on exact length, but very long/very short outliers underperform the middle across nearly every source].
- Consistent, better-corroborated signal: **hype language, urgency words ("ASAP"), and generic greetings drag opens below 36%** — this shows up across nearly every subject-line source, unlike the precise percentage lifts. This is the one finding to trust with more confidence than the specific numbers above, because it's directionally consistent across B2B and B2C sources alike.

**Evaluating your three subjects:**
- **D0 "A heti terved"** (Your weekly plan) — clear, short, no hype, matches "clarity over cleverness" and avoids every flagged red-flag word. This is a transactional-moment subject; it will ride the high transactional open rate regardless of cleverness. Good as-is. Consider testing a lightly personalized variant ("A heti terved, [name]") since personalization is the best-corroborated single lever in this section — but only if you already capture first name at the quiz gate.
- **D3 "What falls apart on day 9"** (localize to Hungarian) — this is curiosity-plus-specificity (a number, a concrete moment) rather than vague curiosity ("you won't believe..."), which is exactly the pattern the evidence favors over generic curiosity bait. Keep it; it's well-formed by the data.
- **D6 offer subject** (not yet drafted in the brief) — avoid urgency words entirely (banned anyway per your no-deadline rule, and the data independently penalizes them). Favor a clear, concrete subject over a hypey one: something naming the guarantee or the concrete number (10 workouts, 5 weeks) rather than "special offer" language.

---

## 5. Plain text vs. designed HTML; visual plan grid vs. link

- Plain text vs. light HTML is context-dependent, not a flat winner either way: for cold outreach, one 2025 deliverability report claims plain text got blocked **30% more often** than light HTML because spam filters read zero formatting as a legitimacy red flag [unverifiable — "2025 Global Email Deliverability Report" is named but not linked in any source found; treat as low-confidence]. Source (secondary citation only): https://www.mailgenius.com/html-vs-text-email/
- Separately, plain text is claimed to get a **42% higher open rate** than image-heavy HTML [same low-confidence tier, no primary source located].
- The one point of broad agreement across every source: for **relationship/founder-voice email**, minimal/plain-feeling formatting outperforms heavy template HTML — "light HTML, one image if needed, one CTA" is the repeated recommendation, not "no HTML at all" or "full designed newsletter."
- No source directly tested "plan as inline image/HTML grid vs. link-to-plan" for a fitness delivery email. Reasoning from adjacent, better-evidenced findings: transactional-moment emails already get very high engagement without extra visual complexity (§1), and heavier HTML raises spam-filter risk on a brand-new sending domain (§8) — so the marginal gain from an embedded visual grid is unlikely to outweigh the deliverability risk on a fresh domain.

**Verdict:** Keep the plain-text-feeling format for all three emails (matches brand voice anyway). For D0, do **not** build a full HTML week-grid image — link to the on-screen plan (which the lead already saw seconds ago) and show the schedule as simple text/table rows, not an image. Revisit an inline visual grid only after the sending domain is fully warmed and IP/domain reputation is established (see §8) — introducing image-heavy HTML on a cold domain adds risk with no measured benefit.

---

## 6. Segmentation by quiz answer: is one P.S. enough?

- Case-study data on quiz-driven personalization: **30–40% open / 8–12% click** vs **~20%/~3%** for generic flows, and **11–15%** higher order value when personalization is tied to quiz answers [case studies, small N, ecommerce/CPG context — not a controlled study and not fitness-specific]. Sources: https://www.octaneai.com/blog/quiz-email-flows-klaviyo , https://revenuehunt.com/state-of-product-recommendation-quizzes/
- One coffee-subscription case: taste-profile quiz personalization moved conversion **2.1%→2.6%** over 90 days and cut first-month churn **12%** [case study, N=1].
- No source isolates "one personalized P.S." vs. "fully segmented email body" as a controlled comparison — this specific effort/return crossover has not been measured anywhere found.

**Verdict:** The evidence supports personalizing *something* tied to the quiz answer (consistent, if imprecise, lift across every case study found) but gives no basis for going further than your current single P.S. Given no measured crossover point, and given that full 5-segment body-rewrites multiply your QA/proofreading surface 5x for an unproven marginal gain, **keep the single personalized P.S. in D3** as the segmentation surface. If you want a second, cheap segmentation lever with better cost/effort ratio than 5 full bodies, personalize the D0 subject line by name/segment (see §4) before you invest in full-body segmentation anywhere.

---

## 7. The belief-shift/story email: does it help vs. going straight to the offer?

- No controlled fitness study isolates "story email before offer" vs. "offer immediately." The available evidence is indirect:
  - Sales-pitch-email guidance converges (without a shared primary study) on the idea that trust-building content — stories, third-party proof — is what closes people who didn't buy on the first ask, i.e., its value shows up specifically among people who *didn't* convert on the first touch [opinion, consistent across sources but not measured]. Source: https://campaignrefinery.com/sales-pitch-email/
  - The decay data in §2 (open/click erode fast, most of it happens by email 2–3) implies that whatever education/trust content you're going to deliver needs to land early — supporting a story/belief email specifically at position 2 (your D3), not later.
  - The quiz-conversion literature (§6) independently shows the value of *referencing what the person already told you* — Alexa's story plus the personalized P.S. in D3 does double duty: story-based trust-building *and* the referencing-the-quiz-answer mechanic that's better evidenced.

**Verdict:** No hard causal number exists for "story email lifts eventual conversion by X%," so don't cite one. But every adjacent signal (decay timing, trust-before-ask consensus, quiz-reference lift) points the same direction: keep D3 as a distinct belief/story email rather than folding it into D0 or D6. This is the best-supported structural decision in the whole sequence even though it's supported by convergent indirect evidence rather than one clean study.

---

## 8. Deliverability 2026: what must be true before sending

Well-corroborated across 6+ independent deliverability-vendor sources (PowerDMARC, Red Sift, Chronos, InboxWarm, DDMARC, MailRisk, EmailWarmup) — treat this section as high-confidence:

- **Authentication:** SPF, DKIM, and DMARC must all be configured for the sending domain. DMARC at minimum `p=none` to start, with expected progression toward `p=quarantine`/`p=reject`. Source: https://powerdmarc.com/google-and-yahoo-email-authentication-requirements/
- **One-click unsubscribe (RFC 8058):** required by Google, Yahoo, and Apple via `List-Unsubscribe` + `List-Unsubscribe-Post` headers; must work without login; must be honored within **2 days**. SendGrid supports this natively — confirm it's enabled, not just theoretically available.
- **Spam-complaint rate:** must stay **below 0.30%**; at/above that threshold Gmail makes the domain ineligible for delivery support, and it stays ineligible until the rate holds below 0.30% for **7 consecutive days**.
- **Enforcement:** since **November 2025**, non-compliant bulk mail is **rejected outright** by Gmail, not routed to spam — this raises the cost of shipping non-compliant infrastructure from "worse open rates" to "mail doesn't arrive at all." Source: https://redsift.com/guides/bulk-email-sender-requirements
- **Domain warm-up:** a fresh sending domain/subdomain needs gradual volume ramp-up before full-list sends; sending your entire quiz-lead backlog on day one to a cold domain is a known way to trip spam filters (consistent recommendation across all sources, no single number for ramp schedule found — use SendGrid's own warm-up guidance for exact volume steps).
- **Consented/non-consented split-list risk:** no source addresses this exact scenario, but the underlying mechanics are clear from the rules above — a **transactional-only** stream (D0, to everyone) and a **marketing** stream (D3/D6, consented only) should ideally use **separate subdomains** (e.g., `mail.lexfit.hu` for transactional, `news.lexfit.hu` or similar for marketing) so that if the marketing stream's complaint rate rises, it doesn't jeopardize deliverability of the transactional D0 plan-delivery email, which is the highest-value, highest-open send in the whole sequence and must never be at risk from marketing-list hygiene issues.

**Action items before sending to a fresh quiz-lead list:** (1) verify SPF/DKIM/DMARC and one-click unsubscribe are live on the sending domain now, not "SendGrid supports it" in the abstract; (2) confirm current spam-complaint rate is tracked and under 0.30%; (3) if this is a new domain/subdomain, ramp volume rather than blasting the full backlog; (4) strongly consider splitting transactional (D0) and marketing (D3/D6) onto separate subdomains given the consent-based audience split your funnel already creates.

---

## 9. Concrete examples

- **Peloton onboarding, days 1/3/7** [secondary teardown, specifics not independently verified against a primary source — treat as illustrative, not confirmed]: Day 1 "Your First Ride" (beginner classes by duration), Day 3 "Find Your Instructor" (profiles, encourages a favorite), Day 7 "Your First Week Recap" (summary or gentle nudge). Notably **no pitch in any of the three** — Peloton's post-signup sequence (its users are already paying) is pure activation, not conversion. Source: https://www.trypropel.ai/resources/blogs/peloton-retention-strategy-teardown — directly useful as a model for *what belongs in an activation sequence*, but not analogous to your pre-purchase D0/D3/D6 since your audience hasn't paid yet.
- **Noom web-to-app funnel** [teardown, credible — RevenueCat, a reputable subscription-analytics company]: 100+ screens, 10–15 minutes, converts through progressive commitment before the paywall — quiz questions double as education so that by the end the user already understands and half-believes the method, and the paywall appears only after that investment. Source: https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel — the directly relevant lesson for LEXFIT: your quiz is already doing Noom's "education-through-questions" job; D3's belief-shift email is the *email-channel* continuation of that same mechanic once the person has left the quiz screen.
- **Sequence (GLP-1 + dietitian weight program)** [case study, credible source mentions real launch]: quiz-personalized program plus a free first consult; after revamped email campaigns, **~50% of conversions included an email click** in the journey. Source found via search result, no direct link captured — treat as a directional data point that email genuinely closes a meaningful share of quiz-funnel conversions, consistent with your entire premise that D0/D3/D6 matters.
- I could **not** find verifiable, dated, email-by-email teardowns for BetterMe, Simple, Freeletics, Ladder, Sweat, or Future's *lead-nurture* (pre-purchase) sequences specifically — only general app reviews and TikTok comparison content came up, none of which document actual email content or timing. This is a genuine research gap; if a verified swipe file matters more than the indirect evidence above, it would need a Milled.com or Really Good Emails account search rather than open web search.

---

## Recommended sequence spec

| Email | Timing | Job | Subject-line direction | Single CTA |
|---|---|---|---|---|
| D0 | Immediate, everyone (transactional) | Deliver the plan; first workout instruction; the "don't schedule it on your best day" advice | Clear, short, no hype — keep "A heti terved"; test name-personalized variant if first name is captured | Open your plan |
| D3 | +3 days, consented only | Belief shift: why restarts really fail (day 9, not day 1); two forgiveness rules; Alexa's story; P.S. personalized by quiz segment | Specific + curiosity via a concrete number/moment (keep "what falls apart on day 9" direction) — avoid vague curiosity bait | Read Alexa's note / no hard offer CTA |
| D6 | +6 days, consented only, suppressed on purchase | The offer: 30 workouts, 10-workout guarantee, pricing | Clear and concrete (name the guarantee or the number), no urgency/hype language | Start your first week |
| **New: D9–D10** | +9/10 days, consented only, suppressed on purchase | Proof/reinforcement, NOT a deadline: what the first 10 workouts look like in practice; one short Alexa line on what people say after week 2; restate the guarantee in one sentence | Concrete, proof-oriented ("what week two actually feels like" direction) | Start your first week (same CTA as D6, not a new one) |

---

## What this means for LEXFIT

| Finding | Confidence | Action |
|---|---|---|
| D0 is a transactional-moment send and should open far above generic fitness benchmarks (30% campaign / ~57–84% welcome range) | Medium (ESP aggregate data, wide range) | Treat sub-40% D0 opens as a deliverability bug, not "normal," and investigate immediately |
| D0/D3/D6 cadence is well-supported; nothing says compress the offer earlier | Medium (indirect, converging signals) | Keep timing as-is |
| A 4th, non-deadline proof email at D9–D10 likely adds conversion with acceptable unsubscribe risk | Low–Medium (one N=1 case study + convergent reasoning) | Add it; make it proof-based, reuse the D6 CTA, no urgency |
| Personalized subject lines and the single D3 P.S. are the right amount of segmentation for now | Low–Medium (case studies, no controlled fitness study) | Keep single P.S.; test name/segment-personalized subjects before building full per-segment bodies |
| Story/belief email before the pitch is the best-supported structural choice in the whole plan | Medium (convergent indirect evidence, no direct causal study) | Keep D3 as-is structurally |
| Plain-text-feeling format is correct; no embedded HTML week-grid yet | Medium (deliverability risk reasoning + brand-voice fit) | Link to plan, don't embed a grid image, until domain is fully warmed |
| Gmail/Yahoo/Apple bulk rules are strict and enforced by rejection since Nov 2025 | High (well-corroborated across many vendors) | Verify SPF/DKIM/DMARC + one-click unsubscribe live now; track spam-complaint rate under 0.30% |
| Consent-split list (transactional D0 vs. marketing D3/D6) creates real deliverability risk if on one domain | Medium (reasoned from rules, not directly studied) | Consider separate subdomains for transactional vs. marketing streams |
| Hungary requires prior explicit, channel-specific opt-in for marketing email; no soft opt-in | High (legal, multiple corroborating summaries) | Confirm D3/D6 send only strictly gates on the marketing checkbox; D0 must read as service/transactional in tone and framing, not promotional |

---

## Sources

- Klaviyo, "Email marketing benchmarks 2026: open rates, click and conversion rates" (183,000 brands, Feb 2026) — https://www.klaviyo.com/uk/blog/email-marketing-benchmarks-open-click-and-conversion-rates
- Brevo, "Email Marketing Benchmarks: Region & Industry Data (2026)" — https://www.brevo.com/blog/email-marketing-benchmarks/
- Web Tonic, "Fitness Email Marketing Statistics 2026" — https://www.webtonic.io/blog/fitness-email-marketing-statistics
- MailerLite, "Email Marketing Benchmarks 2025" — https://www.mailerlite.com/blog/compare-your-email-performance-metrics-industry-benchmarks
- HubSpot, "Email marketing benchmarks by industry" — https://blog.hubspot.com/sales/average-email-open-rate-benchmark
- Omnisend, "The Best Time to Send an Email (2026 Research)" — https://www.omnisend.com/blog/best-time-to-send-email/
- Apollo, "Best Time to Email and Call Prospects for Higher Replies" — https://www.apollo.io/magazine/best-time-call-email-prospects
- Prospeo, "How Many Emails in a Nurture Sequence? (2026 Data)" — https://prospeo.io/s/how-many-emails-in-a-nurture-sequence
- LeadsuiteNow, "Email Automation and Lead Nurturing Sequences That Convert in 2026" — https://leadsuitenow.com/blog/email-automation-lead-nurturing-2026
- Landbase, "25 Email Sequence Statistics" — https://www.landbase.com/blog/email-sequence-statistics
- Encharge, "How Long Should My Automated Email Sequence Be?" — https://encharge.io/how-long-should-my-automated-email-sequence-be/
- Belkins, "B2B Cold Email Subject Lines and Engagement (2025 Study)" — https://belkins.io/blog/b2b-cold-email-subject-line-statistics
- MailGenius, "HTML vs Text Email: A 2026 Deliverability Guide" — https://www.mailgenius.com/html-vs-text-email/
- Octane AI, "How to Build Personalized Email Flows with Quiz Data" — https://www.octaneai.com/blog/quiz-email-flows-klaviyo
- RevenueHunt, "The state of product recommendation quizzes: 2026 benchmark report" — https://revenuehunt.com/state-of-product-recommendation-quizzes/
- Campaign Refinery, "Sales Pitch Email: Maximize Conversions" — https://campaignrefinery.com/sales-pitch-email/
- PowerDMARC, "Google And Yahoo Email Authentication Requirements 2026" — https://powerdmarc.com/google-and-yahoo-email-authentication-requirements/
- PowerDMARC, "Bulk Email Sender Rules For Google, Yahoo, Microsoft & Apple (2026)" — https://powerdmarc.com/bulk-email-sender-requirements/
- Red Sift, "2026 bulk email sender requirements checklist" — https://redsift.com/guides/bulk-email-sender-requirements
- Propel, "Peloton Retention Strategy Teardown" — https://www.trypropel.ai/resources/blogs/peloton-retention-strategy-teardown
- RevenueCat, "Inside Noom's Web-to-App Onboarding Funnel: UX Teardown" — https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel
- CMS, "Hungary's privacy decision on direct marketing" — https://cms.law/en/hun/legal-updates/Hungary-s-privacy-decision-on-direct-marketing-asks-how-much-consent-is-required-for-direct-marketing-through-different-channels
- DLA Piper, "Electronic marketing in Hungary" — https://www.dlapiperdataprotection.com/index.html?t=electronic-marketing&c=HU
