# Decision-page conversion mechanics — research for the plan-reveal page

Scope: the LEXFIT plan-reveal page (post-quiz, post-email-gate). Two-column desktop
layout — scrolling plan artifact on the left, sticky decision rail on the right — navy
guarantee band, 3-plan pricing band, footer. Mobile: single column + docked bottom bar.
Metric: same-session clicks into checkout and completed payments. No urgency/scarcity/
countdown tactics; prices are fixed (490 Ft intro week → 1,990 Ft/wk · 5,990 Ft/mo ·
39,900 Ft/yr).

---

## TL;DR

- **Sticky buy-boxes measurably lift conversion.** Case-study ranges cluster at
  **+8–15%** for well-executed sticky Add-to-Cart/summary bars, with some outlier tests
  as high as +25–48% and others closer to +5–10% depending on baseline design quality
  ([easyappsecom](https://easyappsecom.com/guides/sticky-add-to-cart-best-practices),
  [BlendCommerce](https://blendcommerce.com/blogs/ab-tests-shopify/adding-a-sticky-add-to-cart-on-desktop),
  [Zipify](https://zipify.com/mobile-sticky-button-split-test-results/)). Directionally
  robust, magnitude not to be taken literally for a Hungarian mid-market fitness app.
- **Hidden total cost is a top-3 abandonment cause.** Baymard: **48%** of cart
  abandonments cite unexpected costs; **21%** of US shoppers abandon specifically
  because they couldn't see total order cost before starting checkout; potential
  checkout-conversion lift from fixing usability issues is **35.26%**
  ([Baymard](https://baymard.com/lists/cart-abandonment-rate)). This argues for putting
  the price *in* the rail, not just a scroll-to-band CTA.
- **Forced account creation is a top-5 abandonment cause.** **19–26%** of shoppers
  abandon over mandatory account creation; ASOS-class case studies show completion
  jumping by ~50% after removing the forced-signup step
  ([Baymard](https://baymard.com/lists/cart-abandonment-rate),
  [Corbado](https://www.corbado.com/blog/guest-checkout-vs-forced-login)). LEXFIT's
  /register flow bundles account creation with checkout — this is real friction to
  budget against, even though a fitness subscription genuinely needs an account.
- **Above-the-fold concentrates attention hard.** Users spend **57% of viewing time
  above the fold and 74% in the first two screenfuls**; content 100px above the fold
  gets **102% more eye-tracking fixations** than content 100px below it
  ([NN/g, Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/);
  [NN/g, Page Fold Manifesto](https://www.nngroup.com/articles/page-fold-manifesto/)).
  The plan-reveal's first viewport must carry a real purchase signal, not just a promise
  of one further down.
- **Progressive disclosure caps out at ~2 levels before usability drops**, and NN/g's
  own case study concludes a single mega-screen with irrelevant fields mixed in
  underperforms a clean 2-screen split
  ([NN/g, Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)).
  Applied to us: rail → pricing band → /register is at the edge of what's tolerable;
  a 3rd hop (a bridge/interstitial screen) would likely cost more than it protects.
- **Subscription-app data (2025–26) favors defaulting to the plan you want kept, not
  the cheapest one.** RevenueCat: hiding the monthly plan behind a "view all plans"
  link and defaulting to yearly "led to a notable increase in yearly subscriptions with
  only a minor effect on overall conversion"
  ([RevenueCat paywall guide](https://www.revenuecat.com/blog/growth/guide-to-mobile-paywalls-subscription-apps)).
  Adapty: annual plans are now **47% of new subscriptions** industry-wide, and health/
  fitness apps convert trials at **62%** vs a 53% cross-category average
  ([Adapty State of In-App Subscriptions 2026](https://adapty.io/state-of-in-app-subscriptions/)).
- **Number-of-plans and offer-structure tests are among the highest-leverage paywall
  levers measured**: RevenueCat/Adapty-linked benchmarking shows "number of plans"
  A/B tests win **57.1%** of the time on LTV, and the gap between best- and
  worst-configured paywalls is **636% on LTV**
  ([RocketShipHQ on Adapty 2026](https://www.rocketshiphq.com/adapty-subscription-app-benchmark-2025-summary/)).
  This is evidence *for* keeping 3 cards, not collapsing to 1, and for treating the
  reveal's pricing band as a first-class design surface, not an afterthought.
- **Checkout drop-off between steps is large and mechanical**: typical funnel step-to-step
  attrition runs **30–80% per page**; cart→checkout abandonment alone is commonly
  cited near 70%
  ([Lucky Orange / industry funnel benchmarks](https://www.luckyorange.com/blog/posts/how-to-analyze-conversion-funnels-pro)).
  Every additional hop between "I've decided" and "payment submitted" is a real, non-trivial
  tax — argues for shortening rail→band→register where possible without removing the
  plan choice itself.

---

## Findings by question

### 1. Sticky decision rails / summary sidebars

Sticky "buy box" patterns (an always-visible price/CTA panel next to scrolling content)
are one of the most tested and most consistently positive CRO patterns in e-commerce.
Aggregated case-study results:

- Sticky Add-to-Cart bars: **+8–15%** conversion in controlled A/B tests across many
  Shopify stores, with **mobile improvements typically 12–25%** vs **5–12% desktop**
  ([easyappsecom](https://easyappsecom.com/guides/sticky-add-to-cart-best-practices)).
- A 13-day desktop sticky-bar test: **+25.95% conversion, +29.9% revenue**
  ([BlendCommerce](https://blendcommerce.com/blogs/ab-tests-shopify/adding-a-sticky-add-to-cart-on-desktop)).
- A mobile drawer-style sticky ATC: **+5.2% orders at 98% significance**; another test:
  **+10% ATC clicks, +9% conversion at 95% confidence**
  ([Zipify](https://zipify.com/mobile-sticky-button-split-test-results/)).
- One outlier test reported **+47.6% conversion, +48.3% revenue per visitor**
  ([growth-engines aggregation](https://growth-engines.com/insights/ecommerce/ecommerce-a-b-testing-the-data-driven-guide-to-higher-conversions))
  — treat as an upper bound, not a typical expectation; these are largely Shopify-vendor
  case studies (motivated sources), not peer-reviewed, so the *direction* (sticky > static)
  is trustworthy, the *magnitude* is not.

**What belongs in the box, per this evidence**: a persistent CTA, a clear value/what's-included
signal, and — per the price-transparency findings in §2 — the price itself. Guarantee
*summary* (one line) belongs; the full guarantee explanation does not (that's what the navy
band is for).

**Failure mode — banner blindness.** The mechanism NN/g and CXL-style CRO literature both
point to: a rail that *looks* like a house ad (isolated box, marketing-toned copy, generic
iconography, disconnected from the content beside it) gets filtered by the same perceptual
habit that filters banner ads. What prevents it, per the pattern's successful implementations:
(a) the rail must read as *functional* — order-summary typography, not ad typography; (b)
it must visually reference the specific content next to it (this plan, this price) rather
than generic claims; (c) it should update/react to what the user is doing in the left column
(e.g., reflect the chosen start day) rather than being static — static boxes are exactly what
banner-blindness habituates to.

**Change for the page**: Keep the sticky rail. Make it look like an order summary attached to
*this specific plan* (echo the person's chosen days/week structure), not a generic "why LEXFIT"
ad panel. This is also an argument for putting the price in it (see §2) — a rail with no price
and only marketing copy is structurally closest to the "looks like an ad" failure mode.

### 2. Should the rail show the price?

Evidence points toward **yes, show it**, at least as a "from 1,990 Ft/wk" or the actual
cheapest committed number, even if the full 3-plan comparison stays in the band below.

- Baymard: **48%** of all cart abandonments are attributed to unexpected costs; of
  abandoners who reject for a fixable reason, **39%** cite extra/surprise costs
  specifically; **21%** of US shoppers abandon because they can't see the *total* cost
  before starting checkout ([Baymard cart abandonment list](https://baymard.com/lists/cart-abandonment-rate)).
  These numbers are about checkout, but the underlying mechanism — anxiety from an
  unknown number — applies directly to a decision rail that asks for a click before
  revealing price.
- Baymard also finds **64%** of users actively look for costs (there: shipping) *on the
  page before the action*, i.e., before adding to cart / committing — meaning people
  actively route their eyes to hunt for the number if it's hidden, which is attention
  spent not reading your plan or guarantee.
- Counter-consideration (not found as direct evidence, reasoned inference): a currency
  gate that reveals price only after some engagement is a known technique in some
  high-ticket / info-product funnels to raise perceived value before the number lands —
  but that literature is about cold-traffic sales pages, not a person who already
  completed a 7-question quiz, gave their email, and is looking at a plan built
  specifically for them. At this stage in the funnel the person has already invested
  effort; withholding the price reads as friction, not persuasion. No dataset in this
  research directly measured "price in rail vs price-on-click at a post-quiz reveal" —
  this recommendation is an inference from adjacent cart/checkout price-transparency
  data, not a like-for-like study, and should be flagged as such if surfaced to
  stakeholders.

**Change for the page**: Put a real number in the rail — not full comparison-shopping,
but the entry price ("Kezdés: 490 Ft / hét" or similar single line) plus a short
"3 csomag, mindegyik felmondható bármikor" line, so the click into the pricing band is
a *confirmation* click, not a *reveal* click. This also directly shortens the emotional
distance in §3.

### 3. Anchor-link CTA vs direct-to-checkout

No study found measures this exact "rail-anchor-scroll → pricing band → /register"
pattern head-to-head against a rail that deep-links straight into a specific plan's
checkout. Two adjacent bodies of evidence pull in different directions:

- **Fewer hops wins, generally.** Funnel-attrition literature: typical step-to-step
  drop-off is **30–80% per additional page/step**
  ([Lucky Orange funnel analysis](https://www.luckyorange.com/blog/posts/how-to-analyze-conversion-funnels-pro)),
  and Baymard's broader checkout-usability finding is that the *average* site could gain
  **35.26%** in conversion by removing usability friction (of which excess steps is a
  named category) ([Baymard](https://baymard.com/lists/cart-abandonment-rate)). This
  argues for collapsing rail → band into one hop when the user already knows which plan
  they want.
- **Progressive disclosure / commitment gradient counter-argument.** NN/g's own applied
  case study on progressive disclosure concludes that cramming irrelevant detail into one
  screen (e.g., payment fields shown during an exploratory "what-if" phase) creates
  *more* errors and worse usability than a clean 2-screen split
  ([NN/g Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)),
  and explicitly recommends against exceeding roughly 2 disclosure levels. A rail that
  jumps straight into embedded Stripe checkout, without letting the user see and choose
  among the 3 plans first, risks looking premature (no plan chosen yet) and would need to
  default to one plan — which reintroduces the anchoring problem in §4 through the back
  door (whichever plan is the CTA's default becomes the de facto anchor).

**Verdict for this page**: the current 2-hop pattern (rail CTA → pricing band → /register)
is structurally reasonable *given that the rail's CTA is the only thing selecting a plan* —
it is not clear a person should be able to buy without seeing the 3-card comparison at
least once, since plan choice (weekly/monthly/annual) is itself the decision, not a
formality. Where to cut a hop: make the rail CTA a same-page anchor-scroll (not a
navigation event, no page reload, motion should carry the eye) — that's a near-zero-cost
hop, effectively "0.5 clicks." What should NOT be added: any interstitial "are you sure"
or bridge screen between the pricing band and /register — that would be adding the exact
extra step the funnel-attrition data argues against, for a user who has already made an
explicit choice.

### 4. The pricing band — card order, badges, intro-offer presentation

- **"Most popular" / defaulting mechanics move share without necessarily hurting overall
  conversion.** RevenueCat: hiding the monthly option behind a "view all plans" link and
  defaulting display to the yearly plan "led to a notable increase in yearly
  subscriptions with only a minor effect on overall conversion rates"
  ([RevenueCat](https://www.revenuecat.com/blog/growth/guide-to-mobile-paywalls-subscription-apps)).
  This is the closest available evidence to "monthly-centered vs annual-centered," and it
  favors steering visual weight toward the plan you want kept (monthly, per LEXFIT's own
  "most popular" framing) without literally hiding the others — hiding cost LEXFIT
  nothing to test since prices are fixed.
- **Plan-count and offer-structure are high-leverage, frequently-tested levers.**
  "Number of plans" tests have a **57.1%** win rate on LTV in aggregated 2025-26
  paywall data, and the spread between best- and worst-performing paywall
  configurations is **636% on LTV**
  ([RocketShipHQ summarizing Adapty 2026](https://www.rocketshiphq.com/adapty-subscription-app-benchmark-2025-summary/)).
  This says the pricing band is worth real design investment, not a template afterthought
  — badge copy, order, and framing all move numbers by industry consensus, even though
  this research did not find a study isolating card *order on mobile* specifically.
- **Industry-wide shift toward annual.** Annual plans are now **47% of new
  subscriptions** in 2025-26 benchmark data across 16,000+ apps, and weekly plans have
  grown from **43.3% to 55.6%** of subscription *revenue* over two years — i.e., both
  the cheap-recurring end and the annual end are growing, and the middle (monthly) is
  under pressure industry-wide ([Adapty](https://adapty.io/state-of-in-app-subscriptions/),
  [RevenueCat guide](https://www.revenuecat.com/blog/growth/guide-to-mobile-paywalls-subscription-apps)).
  For LEXFIT this is a caution against assuming "monthly is obviously the default
  center" without testing — the market data shows real bifurcation toward the cheap
  entry point and the annual commitment, exactly the two ends LEXFIT already prices at
  490 Ft/wk and 39,900 Ft/yr.
  Health/fitness specifically converts trials at a strong **62%** vs 53% cross-category
  average, meaning this category's users are unusually willing to commit once they've
  reached a pricing decision — a mild argument for not over-engineering the intro offer's
  prominence at the expense of the annual/monthly framing.
- **No direct 2024-26 study found isolating "mobile card order" (which of 3 stacked
  cards is seen first) for a first-purchase page with a cheap intro option** — this is a
  gap in the available evidence. The nearest applicable principle is the general
  above-the-fold/primacy finding in §5 (first-viewport content gets disproportionate
  attention) — reasoned inference, not a matching study: whichever card is first in the
  vertical mobile stack gets outsized attention share, so the "most popular"/monthly card
  should be first on mobile, with the 490 Ft intro framed as a sub-line under it or as a
  distinctly labeled first card — LEXFIT should treat this specific ordering choice as an
  open A/B test, not a settled call from this research.

**Change for the page**: Keep 3 cards. On mobile, put the plan you want kept (monthly)
first in the stack, badge it "Legnépszerűbb," and fold the 490 Ft intro-week price into
that same card as the framed entry point ("kezdd 490 Ft-ért, aztán 1 990 Ft/hét") rather
than giving the cheap intro its own competing card — this uses the RevenueCat "default to
the plan you want kept" finding while still surfacing the low-commitment number
transparently (per §2).

### 5. Above-the-fold on the reveal

- **57% of viewing time above the fold, 74% in the first two screenfuls**
  ([NN/g, Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/)).
  Historically (2010) it was 80% in the first screenful alone — the fold has *softened*
  over 15 years as scrolling became habitual, but attention is still heavily front-loaded.
- **Content 100px above the fold gets 102% more eye-tracking fixations** than content
  100px below it, across 57,453 fixations; Google ad-viewability data shows **73%
  viewability above the fold vs 44% below** — a 66% relative drop
  ([NN/g, Page Fold Manifesto](https://www.nngroup.com/articles/page-fold-manifesto/)).
- No 2024-26 study was found specifically measuring scroll depth on *post-quiz results
  pages* vs generic landing pages. Reasoned inference from the general pattern: a results
  page delivered after a 7-question quiz + email gate has earned real intent (the person
  actively invested time and an email address to get here), which plausibly raises
  scroll-through *willingness* relative to a cold landing page — but this research found
  no dataset that isolates and quantifies that lift. Treat "results pages scroll further
  than landing pages" as a plausible hypothesis worth instrumenting (scroll-depth
  analytics on this exact page), not a cited fact.

**Change for the page**: the first viewport (plan artifact + week grid/calorie card) must
co-occur with the sticky rail being already visible and already carrying a price signal —
if the rail only becomes sticky/visible after the person scrolls past the first card, the
page is wasting the highest-attention real estate it has. Confirm the rail's CTA and price
line render inside viewport 1 on both desktop and the mobile equivalent (docked bar), not
only after first scroll.

### 6. Friction inventory at the handoff (/register)

- Baymard: mandatory account creation drives **19%** of abandonments in one citation and
  **26%** in another ([Baymard](https://baymard.com/lists/cart-abandonment-rate)); a
  widely-cited large-retailer case (commonly referenced as the "$300 Million Button"
  study, not independently re-verified in this research pass) found removing forced
  signup lifted completed purchases by roughly 45%; a fashion-retail case in this
  research's search results shows checkout completion rising from **62% to 79%** after
  adding a guest-checkout path ([Corbado](https://www.corbado.com/blog/guest-checkout-vs-forced-login)).
- The **hybrid pattern that outperforms both extremes**, per the same sources: guest
  checkout (or checkout-first, account-after) captures the first-time conversion while
  still building an account post-purchase, rather than forcing signup before payment
  ([Corbado](https://www.corbado.com/blog/guest-checkout-vs-forced-login)).
- LEXFIT's own constraint: this is a recurring subscription requiring an authenticated
  account to gate content and manage billing, so pure guest checkout is not directly
  transferable — but the *sequencing* insight is: minimize what's asked *before*
  payment. If /register currently asks for account fields *before* the embedded Stripe
  checkout, evidence favors flipping or interleaving so payment method entry doesn't
  wait behind a full signup form.
- **Bridge/interstitial screens** ("you're about to create your account") were not found
  addressed in dedicated 2024-26 research in this pass. The adjacent finding from §3
  (progressive disclosure — don't exceed ~2 levels, don't add screens that don't reduce
  errors) argues against adding a bridge screen purely as reassurance; it only earns its
  place if it removes a genuine decision-point ambiguity (e.g., clarifying that "490 Ft"
  is a real one-time charge, not a typo) — a one-line inline note does that job without
  a new screen.

**Change for the page**: audit /register's actual field order (not requested here, but
flagged) — the fewest possible fields should sit between "click a pricing card" and
"card number entered." Do not add a bridge/confirmation screen; instead put any needed
reassurance ("nem szükséges új jelszó, ha Google-lal regisztrálsz" etc.) as inline
microcopy on the same screen as the Stripe element.

### 7. Mobile decision bars

- Lift ranges for mobile sticky bars cluster at **8–15%** generally, with a mobile-specific
  band of **12–25%** reported by one aggregator vs 5–12% desktop
  ([easyappsecom](https://easyappsecom.com/guides/sticky-add-to-cart-best-practices)); a
  controlled mobile split test found **+10% clicks, +9% conversion at 95% confidence**
  ([Zipify](https://zipify.com/mobile-sticky-button-split-test-results/)); another mobile
  test (drawer-style) found **+5.2% orders at 98% significance**
  ([Zipify](https://zipify.com/mobile-sticky-button-split-test-results/)). Sticky mobile
  bars are tested in an estimated **73%** of mobile optimization programs generally
  (secondary aggregation, not a primary study —
  [nector.io summary](https://www.nector.io/blog/ecommerce-conversion-rate-benchmarks)),
  indicating the pattern is close to default best practice, not a novel bet.
- **Single button vs button+price**: no isolated 2024-26 study found. Given §2's
  price-transparency findings and the general above-the-fold attention data, a docked bar
  with a visible price beats a bare "Folytatás" button on the same logic — the bar is
  effectively a miniature rail, so it inherits the §1/§2 findings.
- **Safe-area / iOS Safari interaction**: no dedicated 2024-26 measurement study was
  found in this research pass (Apple's own Human Interface Guidelines cover
  `env(safe-area-inset-bottom)` as an implementation requirement, not a conversion
  study). Practical implication, stated as engineering requirement rather than
  research finding: the docked bar must respect `safe-area-inset-bottom` so it never
  sits under or gets obscured by Safari's own bottom chrome, and must not visually
  collide with Safari's bottom toolbar when it's expanded — this is a correctness
  requirement, not something this research found A/B-tested.

**Change for the page**: mobile docked bar shows plan-agnostic price ("490 Ft-tól") +
one CTA, safe-area-aware, visible from first paint (not injected only after scroll-past),
same rail content logic as desktop (§1).

### 8. Section order and length-vs-conversion for decision pages

No 2024-26 study was found that measures section order specifically for a post-quiz
plan-reveal page (this is a narrow, non-commodity page type — most CRO literature covers
landing pages or product pages, not personalized-result pages). What the adjacent
evidence supports:

- The **above-the-fold concentration data (§5)** argues the plan artifact + rail/price
  must be in viewport 1 — everything else is secondary.
- The **progressive disclosure finding (§3)** — that mixing exploratory content with
  transactional content creates errors — suggests the calorie-numbers card and the
  start-day picker (both exploratory/personalization content) belong *before* the
  transactional elements (guarantee, pricing), which matches the page's current order.
- The **rest-of-program preview is the one section with no direct support in the
  evidence gathered** for lifting same-session conversion — it is a "here's more" element
  placed after the person has already seen enough of the real, working plan (first
  week's actual workouts) to evaluate the product. The general funnel-attrition
  literature (**30–80% drop per additional step/section**,
  [Lucky Orange](https://www.luckyorange.com/blog/posts/how-to-analyze-conversion-funnels-pro))
  applies to *length* only insofar as each additional scroll-section is a chance to lose
  the reader before they reach the CTA/pricing band — every section between "first week
  workouts" and "pricing band" is measured time away from conversion, not measured lift.
  This is a reasoned inference, not a study of this exact section, and should be tested
  (e.g., by moving the program-preview section below the pricing band, or A/B testing its
  removal) rather than treated as proven.
- No evidence was found for "shorter is unconditionally better" either — decision pages
  differ from landing pages in that the person is evaluating a product they will actually
  use, and Baymard-style usability data is about *friction*, not raw length; a long page
  with no friction is not penalized the way a short page with hidden costs and forced
  signup is. The recommendation below is therefore: keep the content, but move it,
  don't cut it blind.

---

## Recommended page architecture

**Viewport 1 (no scroll required, both desktop and mobile):**
- The person's actual plan artifact begins rendering (week grid, calorie numbers) —
  per §5, this is the highest-attention real estate on the page and must show something
  personalized within the first screenful, not a generic hero.
- The sticky rail (desktop) / docked bar (mobile) is visible from first paint, not
  triggered by scroll — per §5's "content 100px above fold gets 102% more fixations"
  finding, delaying the rail's appearance forfeits the page's best attention window.
- Rail/bar carries a real price line ("490 Ft-tól induló hét, utána 1 990 Ft/hét · 3
  csomag") per §2 — evidence favors transparency over reveal-on-click at this stage of
  intent.

**Rail contents (desktop sticky sidebar), per §1 and §2:**
1. One-line price signal (not the full 3-card comparison — that's the band's job)
2. "Mit kapsz" — 3–5 item what's-included list, framed around *this* plan, not generic
3. One-line guarantee summary (not the full clause — navy band owns that)
4. Single CTA, anchor-scroll to the pricing band (§3) — visually functional/order-summary
   styled, not ad-styled, to avoid banner-blindness (§1)
5. "Bármikor lemondható" line
6. "Ha most nem, a terved megmarad" line

**Section order (top to bottom), per §3/§5/§8:**
1. Plan artifact: week grid + calorie card (viewport 1, alongside rail)
2. Which-day-you-start picker (exploratory/personalization — keep before transactional
   content, per progressive-disclosure logic in §3)
3. First week's real workout cards with exercise detail (this is the proof-of-product;
   keep — it's what makes the guarantee and price credible)
4. Guarantee band (navy) — placed immediately before pricing so risk-reversal is the
   last thing read before the ask, standard risk-reversal-before-ask sequencing
5. Pricing band (3 cards) — monthly card first/most-visually-weighted on mobile (§4),
   490 Ft intro folded into that card's sub-line rather than a competing 4th option
6. Rest-of-program preview — **move here, after pricing**, or A/B test removing it
   from the pre-purchase path entirely and surfacing it post-purchase instead (§8) —
   no evidence found that it helps same-session conversion, and generic
   funnel-attrition logic (§8) suggests it currently costs attention before the ask
7. Footer note

**CTA strategy, per §3:**
- Rail CTA → same-page anchor-scroll into pricing band (near-zero-cost hop, not a
  navigation event)
- Pricing card CTA → directly into /register for that specific plan (no added bridge
  screen, per §3/§6)
- Do not add a confirmation/interstitial screen between band and /register

**Mobile, per §7:**
- Docked bottom bar visible from first paint, safe-area-aware
  (`env(safe-area-inset-bottom)`)
- Bar shows price + single CTA (not bare button), same content logic as desktop rail
- Pricing band on mobile: monthly plan first in the vertical stack, badged
  "Legnépszerűbb," 490 Ft intro shown as sub-line within that card rather than a
  separate first card (§4)

**What this research could not settle** (flag for A/B testing rather than treating as
decided): exact mobile card order for the 3 plans; whether removing the
rest-of-program-preview section actually helps (only inferred, not measured); whether a
literal "490 Ft-tól" number in the rail outperforms the current scroll-to-reveal pattern
for *this specific* post-quiz audience (inferred from adjacent checkout-abandonment data,
not a matching study).

---

## Sources

- [Baymard Institute — Cart Abandonment Rate Statistics (2026 data)](https://baymard.com/lists/cart-abandonment-rate)
- [Baymard Institute — Checkout Usability](https://baymard.com/checkout-usability)
- [Corbado — Guest Checkout vs. Forced Login](https://www.corbado.com/blog/guest-checkout-vs-forced-login)
- [NN/g — Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/)
- [NN/g — The Fold Manifesto: Why the Page Fold Still Matters](https://www.nngroup.com/articles/page-fold-manifesto/)
- [NN/g — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [RevenueCat — The Essential Guide to Mobile Paywalls for Subscription Apps](https://www.revenuecat.com/blog/growth/guide-to-mobile-paywalls-subscription-apps)
- [Adapty — State of In-App Subscriptions 2026](https://adapty.io/state-of-in-app-subscriptions/)
- [Adapty — What does a high-performing paywall look like in 2026?](https://adapty.io/blog/high-performing-paywall-2026/)
- [RocketShipHQ — The Adapty 2026 benchmark finding that should change how you time your paywall](https://www.rocketshiphq.com/adapty-subscription-app-benchmark-2025-summary/)
- [easyappsecom — Sticky Add to Cart for Shopify: Best Practices + 8–15% Conversion Lift](https://easyappsecom.com/guides/sticky-add-to-cart-best-practices)
- [BlendCommerce — Does a Sticky Add to Cart Bar Improve Desktop Conversions?](https://blendcommerce.com/blogs/ab-tests-shopify/adding-a-sticky-add-to-cart-on-desktop)
- [Zipify — Mobile Split Test: +10% Add to Carts, +9% Conversions](https://zipify.com/mobile-sticky-button-split-test-results/)
- [growth-engines — Ecommerce A/B Test Ideas: 2000+ Experiments in 2025-26](https://growth-engines.com/insights/ecommerce/ecommerce-a-b-testing-the-data-driven-guide-to-higher-conversions)
- [nector.io — Ecommerce Conversion Rate Benchmarks in 2025-26](https://www.nector.io/blog/ecommerce-conversion-rate-benchmarks)
- [Lucky Orange — What Is a Conversion Funnel? How to Analyze and Optimize Every Stage](https://www.luckyorange.com/blog/posts/how-to-analyze-conversion-funnels-pro)

### Evidence-quality note

Several sources above are vendor/SEO-content sites (Shopify-app vendors, checkout-tool
blogs) rather than peer-reviewed or primary research; their specific percentages are
marked as case-study data, not benchmarks, throughout this report, and are meant to
establish *direction* (sticky rails help, hidden costs hurt, forced signup hurts) rather
than precise expected lift for LEXFIT. Baymard, Nielsen Norman Group, RevenueCat, and
Adapty are treated as the higher-confidence sources in this set — Baymard and NN/g run
primary usability research; RevenueCat and Adapty aggregate real cross-app transaction
data (16,000+ apps / $3B revenue for Adapty's 2026 report). Two claims are explicitly
flagged in-text as reasoned inference rather than direct measurement: (1) whether
post-quiz results pages scroll deeper than cold landing pages, and (2) whether removing
the rest-of-program preview section improves same-session conversion. A widely-cited
"$300 Million Button" guest-checkout case study is mentioned in §6 as commonly
referenced in this literature but was not independently re-verified via a primary source
in this research pass — treat its specific number as folklore-adjacent, not confirmed.
