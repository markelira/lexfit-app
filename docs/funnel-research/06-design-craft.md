# Design craft & interaction patterns for /ujrakezdes, /ujrakezdes/terv, and the plan reveal

Research pass for the offer-v3 funnel redesign. English report on a Hungarian product. Brand
tokens are fixed (cream `#f1f6f4`, sage `#7a9b8d`, deep sage `#496c5e`, ink `#18201d`, Poppins,
IBM Plex Mono, radii 8/14/20, single soft shadow) — every recommendation below respects them.

Caveat up front: several "onboarding teardown" aggregator sites (Page Flows, ScreensDesign,
App Fuel, Uiland) gate their actual screenshots/video behind logins or return only text
metadata to a fetcher, so a few products below are backed by secondary summaries rather than
screen-by-screen verification. I've flagged every one of those explicitly — never presented as
if I'd seen the screen myself. Where I could not verify a specific product's UI at all
(Simple, Centr, Ladder in visual depth), I say so rather than inventing detail.

---

## TL;DR

1. **Noom's core trick isn't the questions, it's that every single screen either
   acknowledges, teaches, or moves a number** (the projected goal-date recalculates ~21
   screens later and visibly gets closer). A 25–30 screen quiz doesn't hurt completion *as
   long as every screen visibly reshapes what's coming next* — this is the single most
   load-bearing finding for `/terv`.
2. **Measured, not just taste: progress bars that look like they're moving fast early lower
   abandonment.** Conrad et al. (Univ. of Michigan, published in *Interacting with Computers*,
   2010) found a fast-to-slow progress bar cut abandonment to 11.3% vs. 21.8% for an honest
   slow-to-fast bar. Front-load visible progress.
3. **Section labels beat step counts.** Every well-regarded flow (Noom, Fastic, Runna) groups
   questions into 3–4 labelled phases (e.g. "Rólad" / "Céljaid" / "Szokásaid") rather than
   showing "Question 14 of 42" — the number alone reads as a chore, the label reads as a
   process with a shape.
4. **44×44pt is the accessibility floor, not a design target** — undersized targets measurably
   increase mis-taps (60–80% error reduction moving to 44–48px per touch-target usability
   research); build the quiz's tap rows at 56px+ to sit comfortably above it.
5. **The paywall-adjacent "taste of the plan" is a universal pattern**: Fitbod shows a 3-month
   projection graph, Noom a recalculated goal date, Runna a plan summary — all *immediately
   before* pricing, all built from the user's own answers. Our reveal's week grid + first
   workout does this natively; make sure it's positioned right before the pricing band, not
   buried above it.
5. **Trust-first health brands (Whoop, Calm, Hims) converge on the same formula**: one
   near-neutral base (ink/off-white/grey-blue), one restrained accent used sparingly, no
   gradient-heavy "hype" color, and a plain geometric sans. LEXFIT's cream+sage+plum-black is
   already this formula — the risk is decoration, not the palette.
6. **Reduced motion is not cosmetic** — for users with vestibular sensitivity, parallax/zoom
   transitions in a quiz can cause real dizziness; every transition in `/terv` needs a static
   fallback under `prefers-reduced-motion`.
7. **The Facebook/Instagram in-app browser is a genuinely hostile WKWebView**, not just "a
   browser" — known failure modes are frozen/unresponsive pages, dvh/svh viewport units
   behaving unpredictably, and inconsistent device-specific bugs. Treat `/ujrakezdes` as a
   worst-case rendering target, not a Safari proxy.
8. **Multi-step form abandonment correlates with total field burden, not step count** — a
   9-question quiz split into 9 taps-to-advance screens will outperform the same 9 questions
   crammed into fewer, denser screens.

---

## 1. Best-in-class onboarding-quiz UI, screen by screen

### Noom — verified in reasonable depth (RevenueCat teardown, growthwaves.io, Behavioral
Scientist critique; could not access the actual screenshots, only detailed written teardowns)

- **Length & structure**: the web-to-app funnel runs to 113 screens, but it's organized into
  named sections (demographic profile → weight-loss goals → eating habits), each with its own
  mini loading/progress screen before the next section starts.
  [RevenueCat](https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel),
  [growthwaves.io](https://www.growthwaves.io/p/the-113-screen-onboarding-that-doesnt)
- **Question format is mixed, not uniform**: standard tap-to-select rows for most questions,
  but a distinct **either/or slider** format for the "behavioral profile" section — two
  opposing statements at top and bottom of the screen, a draggable slider between them, and a
  *lighter background fill for a softer agreement vs. a fuller fill for strong agreement* —
  giving continuous-feeling data from a single gesture instead of 5 discrete buttons.
- **Every answer gets acknowledged before advancing.** After a hard input (e.g. current
  weight), the next screen opens with a line like "Thank you for sharing. That's an important
  (and hard) first step" before the following question — this is explicitly called out as the
  reason a 100+ screen flow doesn't feel punishing.
- **The goal date moves.** An early screen predicts "You could reach your goal by [date]";
  ~21 screens later, after more answers, the *same prediction re-renders closer* — a visible,
  literal payoff for continuing.
- **Loading screens do double duty.** Short loaders are simple pauses; longer loaders mix in
  *more education* (Noom's green/yellow/red food classification) while "building your plan" —
  so wait-time becomes content time, not dead air.
- **Plan reveal**: a personalized line graph plotting a steady downward trend vs. a jagged
  yo-yo-diet comparison line, anchored to any deadline/event the user gave earlier.
- Users reportedly never see real app UI during onboarding — everything is bespoke
  onboarding-only screens, which lets the flow control every pixel for conversion.

**Applies to**: `/terv`'s section-labelled progress bar (see §3) should literally borrow the
"acknowledge before the next question" beat — a half-second micro-copy line under the newly
landed chip ("Értjük.") before advancing. The reveal's week grid is our version of Noom's
moving goal-date: it should feel like it's assembling in response to the last answer, not
appearing whole.

### Runna — moderately verified (UX Collective / growthdives summary, ScreensDesign
metadata; the actual screenshot detail — colors, row anatomy — was not accessible, flagged as
unverified)

- ~25-screen quiz covering goals, current ability, weekly availability, even **local route
  hilliness** — deep enough that the first workout is calibrated to reported fitness, not a
  generic Week 1.
- Uses a **story-carousel model for parts of the flow**: screens auto-advance like Instagram
  Stories rather than requiring a tap, described as creating "variable reward" pacing.
  [growthdives.com](https://www.growthdives.com/p/how-to-nail-onboarding-a-case-study)
- Before the paywall: a **plan summary screen recapping the user's own choices** — explicitly
  functions as the "taste of value" beat.
- Paywall: two plans (Annual/Monthly), annual carries a "SAVE 50%" badge, price shown as a
  weekly figure to look smaller, social proof (star rating + testimonials) alongside.
- Reviewer note: even Runna's own case-study critique flags the quiz as long enough to be a
  friction point, and recommends *adding a visible progress bar* — i.e., even a well-regarded
  flow gets dinged for weak progress signaling, not for length itself.

**Applies to**: the "local route hilliness"-style depth is the model for `/terv` — go one
layer more specific than a generic goal question (e.g. not just "cél: fogyás" but "hányszor
akartál már újrakezdeni" as an actual quiz input that visibly shapes copy later, since that's
literally our audience's stated pain).

### Fitbod — verified via multiple secondary sources (RevenueCat, PaywallScreens, Uiland
metadata; again, no direct screenshot access — treat structural claims as sourced, exact pixel
values as unverified)

- Onboarding quiz is comparatively short (goal, experience level, equipment).
- **Plan-adjacent proof point right before paywall**: a 3-month progress projection built from
  the user's own answers, shown as the very last thing before pricing. Cited repeatedly across
  sources as a meaningful conversion lever.
  [RevenueCat](https://www.revenuecat.com/blog/growth/why-your-onboarding-experience-might-be-too-short)
- Smart permission framing: instead of a bare "Allow notifications?" it asks a concrete
  question tied to a benefit ("On days you exercise, want a preview of your workout?").

**Applies to**: our calorie/macro result plus the 30-workout list plays the same role as
Fitbod's projection graph — it must sit *immediately adjacent to* the pricing band, not several
scrolls above it, or we lose the "just proved value, now here's the ask" adjacency that these
products all rely on.

### BetterMe — verified via secondary source (screensdesign + betterme.world's own quiz
explainer; not screenshot-verified)

- 26-question flow but each individual question/answer pair is short — it's paced as many
  small taps rather than few big ones.
- Interactive **3D avatar for selecting target body areas** — an example of turning a
  data-collection step into something that feels like play rather than a form field. (Not
  applicable to LEXFIT given the no-body-numbers/no-gendering constraint, but the *pattern* —
  turn a necessary data field into a small interactive moment rather than a dropdown — is
  reusable elsewhere in `/terv`, e.g. for equipment or time-of-day selection.)
- No email/AppleID required to reach the quiz — registration is deferred past the value
  moment.

### MacroFactor, Freeletics, Yazio — partially verified, listed with explicit caveats

- **MacroFactor**: onboarding is long and "exhaustive" (includes a visual body-fat estimator
  and a full equipment inventory), explicitly criticized in sourced reviews as a drop-off risk
  without an optional "quick start" shortcut. Recent rebrand added space-themed illustration
  and animation across onboarding and weekly check-ins.
  [macrofactor.com/new-look](https://macrofactor.com/new-look/) — I could not access actual
  screen images, so layout/anatomy is unverified.
- **Freeletics**: opens by asking users to rank their **top three goals** (not one goal — an
  ordered set), uses a **slider for self-reported fitness level**, and closes the quiz with a
  "Building your plan" animated screen before showing the recommended "Training Journey."
  Equipment confirmation after journey selection is called out as what makes the plan "feel
  specific and trustworthy" rather than generic. Unverified beyond this written teardown.
- **Yazio**: uses a mascot character for encouragement through a long flow, and a **tap-and-hold
  gesture (not a tap) for final goal commitment** — a deliberately heavier commit gesture,
  explicitly designed to feel like more investment than a normal tap. Interesting but a real
  risk of over-cuteness for our "quiet, non-hype" brief — noted as a pattern to avoid, not
  steal.

### Products I could not verify at all

**Simple, Centr, Ladder, Caliber, Future, Lumen, Zoe, Whoop, Oura, Fastic** — search results
returned only aggregator metadata, marketing copy, or 403'd screenshot galleries; no source let
me confirm actual screen layout, option-row anatomy, or transition behavior firsthand. Where
these appear elsewhere in this report (color, brand tone) it's sourced separately and flagged.
Two general facts did surface with enough independent corroboration to trust: Caliber's
onboarding is "20+ steps" and considered long by reviewers
([BarBend](https://barbend.com/caliber-fitness-app-review/),
[GarageGymReviews](https://www.garagegymreviews.com/caliber-app-review)); Zoe's quiz funnel
uses a strong yellow brand moment as its dominant visual signature
([Medium/Bootcamp](https://medium.com/design-bootcamp/how-flo-and-zoe-use-a-web-to-app-to-boost-their-conversion-6f424171b1b7)).
Do not treat anything beyond that as verified for these products.

---

## 2. Plan-reveal visualizations

Across every source, the plan reveal that "feels earned" shares three traits, not one:

1. **It's built from the user's own inputs, restated.** Noom's moving goal date, Fitbod's
   3-month graph, Runna's answer-recap screen — none of these show a generic template; all
   visibly reference something the user just typed or tapped.
2. **It sits at the seam right before pricing**, functioning as proof-of-personalization
   immediately adjacent to the ask, not earlier in the flow where its persuasive value decays.
3. **It uses a chart/grid type the product can defend without inventing data.** Noom uses a
   trend line because it's tracking a real number (weight) over time. Fitbod uses a bar/graph
   because it's tracking projected training volume. We explicitly cannot show a weight/body
   trend line (no body-outcome claims) — which argues strongly for LEXFIT's actual plan
   reveal shape: a **calendar/week grid** (structural, not outcome-based) plus the concrete
   **first workout** and **30-workout list**. That is the correct category of visualization for
   a "no body-outcome claims" brand — it's closer to Runna's plan-summary and MacroFactor's
   dashboard-trend framing (process/structure, not projected result) than to Noom's outcome
   graph.

**Recommendation for the reveal**: keep the week grid as the hero visual (it is the
appropriate, claim-safe analogue to Noom's moving goal-date and Fitbod's projection — "here's
the concrete thing you're getting," not "here's what your body will look like"). Make sure it
visibly derives from specific quiz answers (days/week, time available, goal) with a one-line
callout near the grid naming which answer produced which placement — this is what makes a
generic-looking grid read as personal rather than templated, per finding #1 above.

---

## 3. Progress indicators in multi-step flows

**Measured research (not just taste):**

- Conrad, Couper, Tourangeau & Peytchev, "The impact of progress indicators on task
  completion," *Interacting with Computers* 22(5), 2010 — two large web-survey experiments.
  A **fast-to-slow bar** (overstates progress early, true rate revealed later) produced the
  **lowest abandonment (11.3%)**; a technically-honest **slow-to-fast bar** produced the
  **highest (21.8%)**.
  [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S095354381000024X),
  summarized in [Heyflow's writeup](https://heyflow.com/blog/reduce-form-abandonment-progress-indicators/)
- Villar, Callegaro & Yang, "Where Am I? A Meta-Analysis of Experiments on the Effects of
  Progress Indicators for Web Surveys," *Social Science Computer Review*, 2013 — broader
  meta-analysis; effects are real but smaller and more context-dependent than any single study
  suggests (worth citing as "directionally supportive, not a guarantee").
  [SAGE](https://journals.sagepub.com/doi/10.1177/0894439313497468)
- Industry-reported (not peer-reviewed, treat as a data point not a law): Formstack's 2026
  State of Forms report (9.3M sessions) found forms over 4 steps saw completion around 9.7%,
  but the same analysis attributes this primarily to **total field burden**, not the step
  count itself — i.e. splitting a heavy form into more, lighter steps helps more than it hurts.
  [amraandelma.com summary](https://www.amraandelma.com/multi-step-form-abandonment-stats/)

**Design consensus (taste, cross-referenced across Noom/Fastic/Runna teardowns):**
Label sections, don't count questions. Noom's loading screens show 3 named categories
(profile/goals/habits) filling in; nobody's teardown of a well-regarded flow shows a bare
"Question 7 of 40" as the *only* progress signal — it's always paired with, or replaced by, a
phase label.

**Applies to `/terv`**: the spec already calls for "a section-labelled progress bar" — this is
directly supported. Concretely: 3–4 named phases (e.g. "Rólad", "Célod", "Napjaid",
"Kész terv"), each phase's segment fills faster at the start of that phase and settles near
the end (mimicking the fast-to-slow effect within each segment, not just across the whole bar)
— cheap to build, matches the one dataset we have real numbers for.

---

## 4. Option-row / choice-card anatomy

No source gave me exact pixel specs for a *specific* product's option row (Noom's teardown
mentions background-fill differences for slider agreement levels but not a static row
component). What's consistently reported across teardowns and UX-pattern write-ups:

- **Touch target floor is 44×44pt (Apple HIG)** — this is a *minimum*, and usability research
  cited across multiple sources shows targets at 44–48px reduce mis-tap error 60–80% and
  improve selection speed 30–50% vs. undersized rows. The *tappable* area can exceed the
  *visible* row — pad the hit area past the visual card edge if the card itself is drawn
  smaller.
  [design research summary](https://uxuiprinciples.com/en/principles/touch-target-sizing)
- **Single-select tap-to-advance is standard for a 2–5 option question**; an explicit "Next"
  button is reserved for multi-select or free-text screens where advancing on the first tap
  would be wrong. This split is consistent across every teardown that discusses interaction
  model (Noom mixes both depending on question type; BetterMe explicitly flags multi-select
  screens with a different affordance so users know they can pick more than one).
- **"Change my answer" handling**: the pattern reported across write-ups is a **back
  chevron/gesture that returns to the exact prior screen with the previous selection still
  visually marked** — not a full restart, and not a generic "edit answers" summary list mid-flow
  (that pattern shows up only at the *end*, as the pre-paywall recap screen, not mid-quiz).

**Applies to `/terv`**: build the option row at ≥56px height (well above the 44pt floor, matching
the "56px row with leading icon" scale mentioned in the brief's own framing), single-select
questions advance on tap with a brief acknowledgment micro-copy (per Noom pattern above),
multi-select questions get a visible "Tovább" button and a distinct multi-pick affordance
(checkmark vs. radio-dot), and back navigation always restores the prior selection state rather
than resetting.

---

## 5. Motion

Direct sourcing on *which specific motion techniques* the named products use was thin — most
teardown sources describe motion in vague terms ("smooth," "animated") rather than naming
transition types. What is well-established and directly actionable:

- **`prefers-reduced-motion` is not optional polish.** For users with vestibular disorders,
  large parallax/zoom/spin transitions can cause genuine dizziness and nausea — described
  across accessibility sources as "the difference between a usable page and one they have to
  close," not a nice-to-have.
  [MotionSpec](https://motionspec.dev/blog/prefers-reduced-motion),
  [dev.to](https://dev.to/keevcodes/improve-accessibility-with-prefers-reduced-motion-54i6)
- **Progress-bar fill animation and any celebratory effect should specifically respect this
  setting** — called out by name in accessibility guidance, since these are exactly the
  animations a quiz flow leans on most.
- Apple's fluid-interface principles (already the house standard per your `apple-design`
  skill) are the right reference for *what kind* of motion is defensible here: **directional,
  interruptible, physically continuous** transitions (the next question slides in from the
  direction implied by "forward," a selected chip visibly travels into the answer tray rather
  than popping into existence) read as considered; **generic fade+scale on every element** or
  bouncy overshoot on low-stakes UI reads as template/stock and is explicitly the kind of
  motion that teardown critiques call out as cheap.

**Applies to `/terv`**: directional slide for question-to-question advance (forward = next
question slides in from the right, back = from the left — spatially consistent, matches the
Apple-standard "you know where you came from" cue); the chip that lands in the week-strip tray
should travel from the tapped answer's position, not appear instantly; wrap all of it in a
`prefers-reduced-motion` branch that keeps the *state change* (new question visible, chip in
tray) but drops the travel animation to an instant cut or opacity crossfade only.

---

## 6. Long results/sales page structure and rhythm

- **Repeat the primary CTA at fixed intervals** (hero, mid-page, end) rather than once at the
  top; keep secondary CTAs visually quieter so they don't compete.
- **Sticky CTA bars on long pages** are the standard mitigation for scroll depth — visible
  research-adjacent claim (not an RCT, but consistently reported practice) is that a persistent
  CTA keeps users "always one tap away" without forcing a scroll-back.
- **Whitespace has directly measured conversion effects** in unrelated but often-cited case
  studies: a documented Xerox test found +20% engagement / +33% purchase completion from added
  whitespace around a CTA; a separate case study reported a jump from 6% to 15%+ conversion
  from whitespace changes alone.
  [CXL summary](https://cxl.com/blog/how-to-build-a-high-converting-landing-page/)
- **Single-offer pages dramatically outperform multi-offer pages** — cited stat: pages
  presenting multiple offers generate 266% fewer leads than single-offer pages. Directly
  relevant to the reveal's 3-plan pricing band: present it as *one* offer with 3 payment
  shapes (weekly/monthly/annual), not as three competing offers, framed and ordered so the
  intended choice (likely annual, given LEXFIT's existing steer-to-annual pricing strategy) is
  visually the resting point.
- Best-in-class fitness apps that get away with long onboarding (Me+ at 45–50 screens, Noom at
  113) share the trait that **length correlates with visible personalization, not with
  arbitrary padding** — the CXL/landing-page literature's "focused sequence: promise → proof →
  action" maps directly onto our page order: landing (promise) → quiz (data-gathering proof
  build) → reveal (proof delivered) → pricing (action).

**Applies to `/ujrakezdes` and the reveal**: break page density every 2–3 sections with a
full-bleed whitespace pause or a single strong visual (member finish-card photo, week-grid
snapshot) rather than stacking text blocks; repeat one CTA style at hero/mid/pre-pricing;
treat the 3-plan pricing band as one offer, three shapes, not three separate offers.

---

## 7. Colour and type for a quiet, trust-first health brand

- **Whoop**: near-monochrome — described across sources as primarily "Cod Gray, white, and a
  signature red" used sparingly as the single accent.
  [Mobbin brand colors](https://mobbin.com/colors/brand/whoop)
- **Calm**: sky blue as primary, white for clarity, soft lavender as a secondary — a
  two-to-three-color system, no more.
- **Headspace** is the *counter-example* worth naming explicitly: it deliberately went
  brighter/warmer (vibrant orange + blue) specifically to differentiate from "a dreary sea of
  blues and greys" in mental health — i.e., Headspace chose energetic-friendly over
  clinical-calm on purpose. That's a legitimate strategy but it is **not** LEXFIT's brief
  (quiet, non-hype, trust-first) — flagged as a pattern to actively avoid for us, not a
  benchmark to match.
- **Hims**: minimalist, lowercase sans typography, calming light blues/greys/whites, explicitly
  built to "de-medicalize" the aesthetic; one design critique (themasterly.com) calls the
  broader category a "healthtech design monoculture" now — worth naming as the exact cliché to
  avoid: soft pastel gradient + lowercase geometric sans + rounded pill buttons has become
  *so* standard in 2025–26 health-tech that it now reads as generic-startup rather than
  trustworthy.
  [themasterly.com](https://www.themasterly.com/blog/hims-effect-healthtech-design-monoculture)

**Consensus takeaway**: the products that read as calm-competent restrict themselves to one
near-neutral base plus one accent, used sparingly, and lean on typographic weight/spacing
contrast rather than color contrast to create hierarchy. LEXFIT's tokens (cream base, sage
accent, plum-black ink) already match this formula almost exactly. **The actual risk for us in
2026 is not the palette — it's decoration**: rounded-pill badges everywhere, gradient chips,
soft-drop-shadow-on-everything, an illustrated mascot. Any of those would push LEXFIT toward
the exact "healthtech monoculture" the Hims critique names. Recommendation: use sage
sparingly (selected states, the accent CTA, the live week-strip fill) and let ink-on-cream
typography do most of the hierarchy work, per the existing token set.

---

## 8. Photography vs illustration vs data-graphics

- Health-specific research/commentary is split but converges on one clear rule: **generic stock
  is recognized and actively erodes trust** — "visitors can tell when you are using stock
  photos," and in health/medical-adjacent contexts this recognition cost is explicitly called
  out as expensive.
- Illustration can substitute *if* it's specific and not template-recognizable — one cited
  example used **named human roles interacting** in the illustration (not abstract shapes) to
  make onboarding "feel instantly more trustworthy, less sterile." Generic stock illustration
  packs get the same trust penalty as generic stock photography once recognized as a template.
- No source directly tested real-member photography vs. professional/stock photography in a
  fitness-onboarding context specifically, so treat this section as consensus/taste, not
  measured.

**Applies to us**: this argues *for* the brief's existing decision to use real, consented
member finish-card photos and actual product screenshots instead of trainer glamour shots or
stock/illustration — it's the higher-trust choice per every source that discusses the
generic-stock trust penalty, and it sidesteps the 2026 "healthtech illustration monoculture"
risk from §7 entirely. Use the calendar/week-grid as pure data-graphic (typographic, not
illustrated) so it reads as a real interface artifact rather than a marketing graphic.

---

## 9. Mobile specifics: thumb zone, sheets, safe areas, FB/IG in-app browser

- **Facebook/Instagram in-app browsers run on WKWebView (iOS)**, not the system Safari/Chrome
  — a distinction that matters because these webviews are documented to behave unpredictably:
  pages going fully unresponsive ("frozen like a screenshot," inconsistent across otherwise
  identical devices), a modified user-agent string that breaks any UA-sniffing logic, and image
  loading glitches.
  [community reports](https://community.shopify.com/t/instagramm-in-app-browser-problem/409392),
  [technical background](https://blog.tomayac.com/2019/12/09/inspecting-facebooks-webview/)
- **Viewport units are a specific, documented trap**: `svh` can behave like `dvh` inside these
  in-app browsers, producing unexpected layout "snapping" as the address-bar chrome shows/hides
  during scroll.
  [Medium technical writeup](https://medium.com/@python-javascript-php-html-css/solving-svh-viewport-issues-in-mobile-in-app-browsers-8808cb4faa3f)
- Standard thumb-zone/sheet/safe-area guidance (bottom-anchored primary CTA, safe-area insets
  respected, bottom sheets rather than modals for secondary choices) is well-established
  consensus across mobile design literature generally, not FB/IG-specific — no new citation
  needed beyond standard iOS HIG practice already implicit in your Apple-design skill.

**Applies to us**: test `/ujrakezdes` and `/terv` specifically inside the actual Instagram
and Facebook in-app browsers on iOS before launch (not just Safari/Chrome) — this is a testing
requirement, not a design one. In CSS, avoid relying on `svh`/`dvh` alone for full-height quiz
screens; use a JS-measured fallback or a conservative fixed-with-min-height approach for the
sticky CTA and the question sheet so it doesn't snap mid-scroll. Never gate critical
functionality (payment, quiz submit) behind a UA check, given the modified UA string risk.

---

## 10. Accessibility as craft

- **WCAG 2.2 AA floor: 4.5:1 for normal text, 3:1 for large text (≥18pt/14pt bold)** — this is
  the actual floor, not a suggestion; low-contrast text is reported as the single most common
  accessibility failure on the web (present on the large majority of audited homepages).
  [WCAG technique G18](https://www.w3.org/TR/WCAG20-TECHS/G18.html)
- Because LEXFIT's palette is deliberately low-contrast-by-taste (cream on cream-adjacent
  surfaces, sage accents), **audit every text/background pairing against the 4.5:1 floor
  explicitly** rather than eyeballing it — sage `#7a9b8d` on cream `#f1f6f4` is very unlikely to
  clear 4.5:1 for body text (it's a light-on-light, low-saturation pairing) and should be
  reserved for large text, icon fills, or decorative use, never for a paragraph of copy; use
  ink `#18201d` on cream for anything that must clear the floor as body text.
- Reduced motion (see §5) and touch target size (see §4) are both accessibility floors, not
  aesthetic choices, and are cited above with their respective sourcing.
- Form/field legibility: no source above specifically tested quiz-field accessibility, but the
  general WCAG floor plus the 44pt touch-target research together set the two hard numbers this
  brief needs (4.5:1 contrast, 44×44pt hit target) — everything else is achievable within the
  existing token set without design compromise.

---

## Patterns to steal / patterns to avoid

| Pattern | Source | Steal or avoid | Why |
|---|---|---|---|
| Section-labelled progress (not "Q7/40") | Noom, Fastic, Runna teardowns | **Steal** | Matches the fast-to-slow abandonment research directly |
| Acknowledge-before-advance micro-copy | Noom | **Steal** | Turns extraction into conversation, cheap to build |
| Recalculating/moving result mid-flow | Noom (goal date) | **Steal (adapted)** | We adapt this as the week-grid visibly filling as answers land — no body-outcome claim needed |
| Plan-proof immediately pre-paywall | Fitbod, Runna, Noom | **Steal** | Our week grid + first workout + 30-workout list is the correct claim-safe version |
| Directional, interruptible transitions | Apple fluid-interface standard | **Steal** | Already house standard; motion should feel physically continuous, not decorative |
| Chip travels into a live tray | Brief's own concept, reinforced by "cumulative acknowledgment" pattern above | **Steal** | Matches both the Noom acknowledgment finding and Apple motion principles |
| Tap-and-hold for "commitment" gestures | Yazio | **Avoid** | Cute/gamified register works against "quiet, non-hype" brief |
| 3D avatar / mascot characters | BetterMe, Yazio | **Avoid** | Wrong register for trust-first brand; also risks re-introducing body-focus we've deliberately dropped |
| Soft-pastel-gradient + lowercase-sans + pill-everything | Hims-style healthtech monoculture | **Avoid** | Named 2026 cliché — reads generic-startup, not trustworthy, per design critique |
| Bright energetic palette to stand out from clinical competitors | Headspace | **Avoid for us** | Legitimate strategy elsewhere, but directly contradicts LEXFIT's quiet/trust-first brief |
| Generic stock photography or stock illustration packs | Cross-source consensus | **Avoid** | Recognized-as-stock actively erodes trust; we already have the better asset (real member photos) |
| Multi-offer pricing framed as competing choices | CXL landing-page research | **Avoid** | 266%-fewer-leads effect reported for multi-offer framing; frame the 3 plans as one offer, three shapes |
| Relying on `svh`/`dvh` alone for full-height mobile layout | FB/IG in-app browser bug reports | **Avoid** | Known viewport-snapping bug in exactly our primary traffic surface |

---

## Recommendations per surface

**`/ujrakezdes` (landing)**
- Structure as promise → proof → action, repeated CTA at hero/mid/end, sticky bottom CTA
  respecting safe-area insets.
- Break density every 2–3 sections with a whitespace pause or one strong photo (real member
  finish-card), not more copy.
- Build and test specifically inside the iOS Instagram/Facebook in-app browser before launch;
  avoid `svh`/`dvh`-only height logic for any full-bleed section.
- No stock photography or illustrated mascots; real photos and real screenshots only, per
  existing brief.

**`/ujrakezdes/terv` (quiz)**
- Section-labelled progress bar (3–4 phases), each phase's fill front-loaded (fast-to-slow
  visual pacing within the phase), never a bare question counter.
- Option rows ≥56px tall, 44pt+ enforced hit area even where the visible card is smaller;
  single-select advances on tap with a one-line acknowledgment; multi-select gets an explicit
  "Tovább" and a distinct check affordance.
- Back navigation restores the previous selection rather than resetting.
- Directional slide transitions (forward from right, back from left); the answer chip visibly
  travels from the tapped row into the week-strip tray; both wrapped in a
  `prefers-reduced-motion` branch that keeps state changes but drops travel animation.
- Sage (`#7a9b8d`) used only for selected-state fills/accents/the live week-strip, never for
  body copy; ink-on-cream for anything requiring the 4.5:1 contrast floor.

**Plan reveal**
- Keep the week grid as hero — it's the claim-safe analogue to what Noom/Fitbod do with
  outcome graphs; add a one-line callout tying specific grid placements to specific quiz
  answers, so it reads as derived rather than templated.
- Position the calorie/macro result and 30-workout list immediately adjacent to (just above)
  the pricing band — proof-then-ask adjacency is the pattern every sourced product relies on.
- Present the 3-plan pricing band as one offer with three payment shapes, not three competing
  offers; visually rest on the intended default (annual, per existing pricing strategy).
- No projected-body-outcome chart of any kind (already excluded by brief, and also excluded by
  the "claim-safe visualization" reasoning in §2).

---

## Sources

- [RevenueCat — Inside Noom's Web-to-App Onboarding Funnel](https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel)
- [RevenueCat — Why your onboarding experience might be too short](https://www.revenuecat.com/blog/growth/why-your-onboarding-experience-might-be-too-short)
- [growthwaves.io — The 113-screen onboarding that doesn't feel long](https://www.growthwaves.io/p/the-113-screen-onboarding-that-doesnt)
- [Page Flows — Noom onboarding](https://pageflows.com/post/ios/onboarding/noom/) (metadata only, screenshots gated)
- [The Behavioral Scientist — Noom Product Critique: Onboarding](https://www.thebehavioralscientist.com/articles/noom-product-critique-onboarding)
- [growthdives.com — How to nail onboarding: a case study of Runna](https://www.growthdives.com/p/how-to-nail-onboarding-a-case-study)
- [ScreensDesign — Runna showcase](https://screensdesign.com/showcase/runna-running-training-plans)
- [ScreensDesign — MacroFactor macro tracker](https://screensdesign.com/showcase/macrofactor-macro-tracker)
- [macrofactor.com — A new look for a new chapter](https://macrofactor.com/new-look/)
- [BarBend — Caliber Fitness App Review](https://barbend.com/caliber-fitness-app-review/)
- [Garage Gym Reviews — Caliber App Review](https://www.garagegymreviews.com/caliber-app-review)
- [betterme.world — BetterMe Quiz](https://betterme.world/articles/betterme-quiz/)
- [screensdesign — BetterMe Health Coaching showcase](https://screensdesign.com/showcase/betterme-health-coaching)
- [Medium/Bootcamp — How Flo and Zoe use a web-to-app quiz funnel](https://medium.com/design-bootcamp/how-flo-and-zoe-use-a-web-to-app-to-boost-their-conversion-6f424171b1b7)
- [theappfuel.com — Fastic onboarding](https://www.theappfuel.com/examples/fastic_onboarding)
- [theappfuel.com — Yazio onboarding](https://theappfuel.com/examples/yazio_onboarding)
- [Adapty — Fitbod paywall library](https://adapty.io/paywall-library/fitbod-gym-fitness-planner/)
- [PaywallScreens — Fitbod](https://www.paywallscreens.com/apps/fitbod-gym-fitness-planner-mobile-paywall-1809)
- [Conrad, Couper, Tourangeau & Peytchev — "The impact of progress indicators on task completion," Interacting with Computers 22(5), 2010](https://www.sciencedirect.com/science/article/abs/pii/S095354381000024X)
- [Villar, Callegaro & Yang — "Where Am I? A Meta-Analysis of Experiments on the Effects of Progress Indicators for Web Surveys," Social Science Computer Review, 2013](https://journals.sagepub.com/doi/10.1177/0894439313497468)
- [Heyflow — Reduce Form Abandonment With Progress Indicators](https://heyflow.com/blog/reduce-form-abandonment-progress-indicators/)
- [amraandelma.com — Top 20 multi-step form abandonment stats 2026](https://www.amraandelma.com/multi-step-form-abandonment-stats/)
- [uxuiprinciples.com — Touch Target Sizing Law](https://uxuiprinciples.com/en/principles/touch-target-sizing)
- [Mobbin — Whoop brand color palette](https://mobbin.com/colors/brand/whoop)
- [Mobbin — Calm brand color palette](https://mobbin.com/colors/brand/calm-com)
- [Kimp — Designing Tranquility: Headspace visual identity](https://www.kimp.io/headspace-brand/)
- [themasterly.com — The Hims Effect: Why Healthtech Became a Clone Factory](https://www.themasterly.com/blog/hims-effect-healthtech-design-monoculture)
- [DesignRush — The Hims Website](https://www.designrush.com/best-designs/websites/hims-website)
- [CXL — How to Build a High-Converting Landing Page](https://cxl.com/blog/how-to-build-a-high-converting-landing-page/)
- [W3C — WCAG 2.0 Technique G18 (4.5:1 contrast)](https://www.w3.org/TR/WCAG20-TECHS/G18.html)
- [MotionSpec — prefers-reduced-motion, explained](https://motionspec.dev/blog/prefers-reduced-motion)
- [dev.to — Improve accessibility with prefers-reduced-motion](https://dev.to/keevcodes/improve-accessibility-with-prefers-reduced-motion-54i6)
- [Shopify Community — Instagram in-app browser problem reports](https://community.shopify.com/t/instagramm-in-app-browser-problem/409392)
- [blog.tomayac.com — Inspecting Facebook's WebView](https://blog.tomayac.com/2019/12/09/inspecting-facebooks-webview/)
- [Medium — Solving svh viewport issues in mobile in-app browsers](https://medium.com/@python-javascript-php-html-css/solving-svh-viewport-issues-in-mobile-in-app-browsers-8808cb4faa3f)
