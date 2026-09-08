# Design heuristics — heuristic and hedonic — for the LEXFIT plan-reveal

Track: design principles (heuristic + hedonic) for the plan-reveal / same-session-checkout page.
Palette is fixed (cream #f1f6f4, sage #7a9b8d accent-only, deep sage #496c5e, ink #18201d, white
surfaces); house motion standard is Apple fluid-interface (critically damped springs, respond on
pointer-down, reduced-motion respected); no confetti, no gamification badges.

Every claim below is labeled **Measured** (a cited empirical study/number), **Canonical**
(a seminal, widely-replicated HCI framework, not a single new number), or **Guidance /
practitioner consensus** (design-practice convention, not a controlled study — flagged
explicitly, never dressed up as research). Nothing below is invented; where I could not
retrieve a primary source in this session, I say so instead of fabricating a citation.

---

## TL;DR

- **Recognition, not recall, sells the plan.** The card must restate the user's own quiz
  inputs (days, target) so they *re-recognize* it as theirs, not decode it. Canonical —
  Nielsen heuristic #6.
- **Visible status at every input change** (day-pick, plan build, CTA click) is the single
  highest-leverage heuristic on a paywall page. Canonical — Nielsen heuristic #1.
- **Aesthetic polish is not decoration — it's the trust mechanism.** Perceived usability
  tracks aesthetics more tightly than actual usability does (Kurosu & Kashimura, 1995,
  n=252). This is the empirical spine for "why craft the card at all."
- **Give the reveal visible labor.** An assembling/building motion — not an instant swap —
  measurably raises perceived value and patience (Buell & Norton 2011 "labor illusion";
  Nebraska progress-bar study cited by NN/g: ~3× more willingness to wait, higher
  satisfaction, with a visible indicator vs none).
- **Structure the page as a layer-cake, not an F-pattern.** Bold, well-signaled headings
  outperform the default F-scan (NN/g eye-tracking, 2006–2020). This is a page-length
  argument for section rhythm, not just typography.
- **One saturated element = the CTA.** Everything else stays inside the quiet palette
  (isolation/Von Restorff logic) so the eye has exactly one place to land.
- **The darkest ground should carry the single most "serious" claim** — the guarantee —
  and the price sits on the lighter ground. This is documented practitioner convention,
  not a study we ran; flagged as such below.
- **Every anti-pattern this page must NOT do has a name and, increasingly, a regulator.**
  Mathur et al.'s 11K-site crawl (CSCW 2019) and the FTC's 2022 dark-patterns report give
  the taxonomy; LEXFIT's job is to be legible as the negative of each one.

---

## 1. Heuristic layer — Nielsen's 10, applied to a results+offer page

Nielsen's ten usability heuristics remain the baseline vocabulary NN/g uses for every
interface review, including commerce interfaces
([nngroup.com/articles/ten-usability-heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)).
Five matter disproportionately on a plan-reveal-to-checkout page:

- **#1 Visibility of system status** — "keep users informed about what is going on,
  through appropriate feedback within a reasonable amount of time"
  ([nngroup.com/articles/visibility-system-status](https://www.nngroup.com/articles/visibility-system-status/)).
  On this page that means: the week-grid must visibly recompute the instant the start-day
  is picked (no silent lag between click and date update); the CTA must show a distinct
  processing state on click, not freeze; and — per the same article — "a lack of
  information often equates to a lack of control," which is exactly the anxiety a paywall
  moment amplifies. **Implication:** start-day picker → week-grid must animate the diff
  (dates re-stamping), not hard-cut; the checkout CTA needs an explicit loading affordance
  before Stripe redirect/embed mounts.

- **#6 Recognition rather than recall** — "minimize the user's memory load by making
  elements, actions, and options visible" — because recognition carries more retrieval
  cues than recall
  ([nngroup.com/articles/recognition-and-recall](https://www.nngroup.com/articles/recognition-and-recall/)),
  citing Adar, Teevan & Dumais (2008) on how people prefer retracing a visible path over
  regenerating a query from memory. The user answered a quiz several screens ago; by the
  time the plan renders, they've likely forgotten the exact inputs. **Implication:** the
  week-grid card header should visibly restate the inputs that produced it ("4×/hét ·
  kezdő szint · [cél]") as small recognizable chips, not force the user to recall what
  they answered and mentally verify the plan matches.

- **#2 Match between system and real world** — "speak the users' language... rather than
  internal jargon." **Implication:** day names, not "D1/D2"; plain calorie/workout
  language, not internal taxonomy leaking into UI (program "phases," Mux terms, etc. stay
  server-side).

- **#3 User control and freedom** — clear exits without a forced path. **Implication:**
  the start-day pick must be revisable after the fact (not a one-shot choice baked into
  the checkout), and the guarantee/cancellation path must be reachable, matching the
  10-edzés-garancia refund flow already built (see `lexfit-offer-v3` memory).

- **#8 Aesthetic and minimalist design** — "remove irrelevant information that distracts
  from primary goals." On a page this dense (week-grid → picker → workout cards → program
  preview → rail → guarantee → pricing), every non-essential element is a tax on the one
  goal (checkout). **Implication:** the program-preview block should summarize, not
  enumerate; anything not load-bearing for the decision gets cut before it gets styled.

**2020s empirical note:** NN/g's heuristics remain the field's reference frame; the
notable post-2020 refinement is less "new heuristics" and more "heuristics for AI/complex
systems" (out of scope here) — the original ten still anchor commerce/results-page reviews.

---

## 2. Hedonic layer — Hassenzahl and successors

Hassenzahl's model splits product quality into **pragmatic quality** (can the user reach
their goal — usability) and **hedonic quality**, which itself splits into
**identification** (does the product let me express who I am / who I want to be) and
**stimulation** (does it offer novel, interesting engagement) — measured via the
AttrakDiff semantic-differential instrument
([attrakdiff.de/index-en.html](https://attrakdiff.de/index-en.html)). The seminal paper is
Hassenzahl, M. (2004), "The Interplay of Beauty, Goodness, and Usability in Interactive
Products," *Human–Computer Interaction* 19(4), DOI
[10.1207/s15327051hci1904_2](https://doi.org/10.1207/s15327051hci1904_2) — Canonical.

- **Identification, concretely, for a personalized plan:** the artifact must visibly
  encode *this specific user's* choices back at them — their day count, their calorie
  target, a start date they picked, ideally their name. This is what turns "a plan" into
  "*my* plan" in Hassenzahl's identification sense — the object becomes a vehicle for
  self-expression, not a generic template with numbers filled in. **Implication:** the
  week-grid card is the identification surface — treat its header (name/date/inputs) as
  the single most hedonically load-bearing element on the page, not a footnote.

- **Stimulation without hype:** Hassenzahl's stimulation axis is about novel/interesting
  *interaction*, not visual noise. On a no-confetti, no-badge system, stimulation has to
  come from restrained motion — the choreography of the reveal itself (§4) — rather than
  decoration. **Implication:** the "plan assembling" motion is doing double duty: it's
  both the labor-illusion trust cue (§4) and the page's only sanctioned dose of
  stimulation.

- **Evocation** (added in later Hassenzahl/McCarthy-Wright-influenced work): triggering
  memory/association — here, a quiet callback to *why* the user started (their stated
  goal from the quiz) rather than generic aspirational marketing copy. **Implication:**
  one short line near the plan, sourced from their own onboarding answer, not stock
  copy.

- **Aesthetics ↔ purchase-relevant measures:** the clearest *measured* bridge from
  aesthetics to a business outcome remains the aesthetic-usability effect: Kurosu &
  Kashimura (1995) tested 26 ATM interface variants with 252 participants and found "the
  correlation between... aesthetic appeal and perceived ease of use was stronger than...
  between aesthetic appeal and actual ease of use"
  ([nngroup.com/articles/aesthetic-usability-effect](https://www.nngroup.com/articles/aesthetic-usability-effect/)).
  No source retrieved this session ties hedonic quality to a specific willingness-to-pay
  percentage lift — flag that as a gap rather than inventing a number. The defensible
  claim is qualitative-with-a-measured-anchor: polish changes *perceived* competence and
  trustworthiness independent of the plan's actual content, and perceived trust is what
  moves a skeptical buyer at a paywall.

---

## 3. Visual hierarchy for decisions

- **Layer-cake beats F-pattern when headings are well-signaled.** NN/g: "the layer-cake
  pattern... consists of fixations made mostly on the page's headings and subheadings,
  with deliberate occasional fixations on the body text in between," and is markedly more
  efficient than F-scanning
  ([nngroup.com/articles/layer-cake-pattern-scanning](https://www.nngroup.com/articles/layer-cake-pattern-scanning/)).
  The F-pattern itself is real and durable across desktop and mobile eye-tracking
  (Nielsen 2006, Pernice 2020 update:
  [nngroup.com/articles/f-shaped-pattern-reading-web-content](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/))
  but it's what happens by *default* on unformatted text — not a target to design for.
  **Implication:** every band on this long page (week-grid, picker, workout cards,
  program preview, rail, guarantee, pricing) needs a strong, visually distinct heading so
  the whole page scans as stacked layer-cake sections, not one long F-scanned column.

- **One entry point.** The isolation effect (Von Restorff, 1933 — seminal, pre-digital,
  widely replicated in visual-search literature) predicts that a single item that differs
  from its surroundings on a salient dimension is disproportionately noticed and
  remembered. On LEXFIT's fixed quiet palette, that means exactly one saturated/high-
  contrast element should exist per screen: the CTA. **Implication:** if the CTA button
  is the only place using a fully-saturated fill against cream/sage/ink neutrals, it wins
  the isolation effect for free; adding a second bright element (a badge, a colored price
  tag) splits it and weakens both.

- **Price's visual weight relative to value elements** is a judgment call this session
  could not anchor to a fetched primary source (a CXL pricing-page fetch returned 403).
  Treat as **Guidance**: convention across SaaS/DTC pricing pages is that the number
  itself carries less visual weight than the value stack around it (the workout cards,
  the guarantee, the "what's included" list) — the price is *found*, not *shouted*.
  **Implication:** in the sticky decision rail, size the includes-list and guarantee
  mention at or above the price's type size; let the price read as a confirming detail
  once the value case is made, not the loudest line in the rail.

- **Direction cues:** the one *measured* cognitive-science mechanism here is gaze-cueing —
  Friesen & Kingstone (1998), "The eyes have it: Reflexive orienting is triggered by
  nonpredictive gaze," established that eye direction in a stimulus reflexively pulls
  observer attention, seminal and widely replicated. Arrows and generic "whitespace
  funnels" toward a CTA are common practitioner folklore with far weaker direct evidence
  behind the specific claim that they move conversion. **Implication:** if any photography
  or illustrated figure appears near the CTA, its gaze/orientation toward the CTA is the
  evidence-backed nudge; a decorative arrow graphic is not — skip it, it reads as hype
  under the no-hype rule anyway.

---

## 4. The reveal as choreography

- **Visible labor raises perceived value — this is the strongest empirical result in this
  whole report for the reveal moment.** Buell & Norton (2011), "The Labor Illusion: How
  Operational Transparency Increases Perceived Value," *Management Science*, DOI
  [10.1287/mnsc.1110.1376](https://doi.org/10.1287/mnsc.1110.1376) — showing that when a
  system visibly "works" to produce a result (vs. returning it instantly), people value
  the result more. NN/g cites a University of Nebraska–Lincoln study in the same vein: with
  a continuous progress bar, users "experienced higher satisfaction and were willing to
  wait on average 3 times longer" than with no indicator
  ([nngroup.com/articles/progress-indicators](https://www.nngroup.com/articles/progress-indicators/)).
  **Implication:** the plan should visibly *assemble* — week-grid cells populating, the
  first week's cards resolving — rather than paint in as one instant block. This is not
  decoration; it is the page's single best-evidenced lever for perceived value at zero
  extra selling copy.

- **Staggered vs. all-at-once, and the delay threshold:** neither Apple's nor Google's
  guidance gives a hard number for "when choreography becomes delay," but both converge on
  short, purposeful motion. Apple's fluid-interface standard (this repo's house style,
  `apple-design` skill) defaults UI springs to **damping 1.0 (critically damped), response
  0.3–0.4s**, reserving any overshoot for gesture-driven, momentum-carrying interactions —
  not for a passive reveal. **Guidance, not measured:** stagger deltas of roughly 80–120ms
  per element are common practitioner convention (Material's motion system uses similarly
  small offsets) to keep a multi-element reveal reading as "one choreographed moment"
  rather than a visible queue. **Implication:** budget the whole week-grid→picker→first-
  week-cards sequence to well under two seconds of perceived motion; use small (~100ms)
  per-card stagger deltas with 0.3–0.4s critically-damped settles, not a long marquee.

- **Reduced-motion equivalent that keeps the moment:** per the house Apple standard,
  `prefers-reduced-motion: reduce` should not delete the moment, it should replace
  slide/spring/stagger with a short opacity cross-fade that preserves the same *order* of
  appearance (week-grid, then picker, then cards) instantly or near-instantly, keeping
  the informational sequence — which is doing the "recognition" work from §1 — even
  without the physical motion doing the "labor illusion" work from this section.

- **Progressive disclosure supports staging the sequence itself**, not just its motion: NN/g
  frames staged disclosure as appropriate "when the steps are interdependent and users must
  alternate between them"
  ([nngroup.com/articles/progressive-disclosure](https://www.nngroup.com/articles/progressive-disclosure/)).
  Start-day genuinely gates the week-grid's dates, which gates which workout cards show as
  "this week" — a real interdependency, not an artificial gate. **Implication:** the
  existing order (week-grid → start-day picker → first week's cards → program preview) is
  structurally justified, not just a stylistic choice — keep the dependency order intact
  rather than flattening it into one static screen.

---

## 5. Card anatomy for a "kept" artifact

No primary academic source was retrieved this session for wallet-pass/ticket or
Notion/Linear-style "artifact" design — this section is **Guidance / practitioner
consensus** drawn from well-established interaction-design practice (Apple Wallet passes,
airline boarding passes, Notion/Linear card components), not a cited study. Flagging
explicitly rather than dressing it up.

- **Ownership cues:** a name, a date ("Kezdés: [dátum]"), and a possessive framing ("A te
  heti terved") are what separates a kept object from an ad unit — the same cues that make
  a boarding pass or a wallet pass feel like *yours* rather than a promotional flyer.
  **Implication:** the week-grid card header is the right and only place for this — one
  name/date stamp, not repeated on every child card.

- **Document metaphor:** LEXFIT's card radii (8/14/20px), soft shadows, and white surfaces
  on cream already read as a physical card/document rather than a banner ad — that
  restraint is the asset. Avoid ticket-stub gimmicks (perforated edges, torn-paper
  textures) that would read as decorative under the no-hype rule; the metaphor should live
  in structure (frame, elevation, a clear "front of card" hierarchy: name/date up top,
  numbers below) rather than in ornament.

- **Typography as metadata marker:** IBM Plex Mono (already in the token set) is well
  suited to the "stamped metadata" role — dates, day counts, calorie numbers — the way
  monospace type reads as data/receipt/ticket information in practice (this is a
  convention observed across ticket and boarding-pass design, not a cited study).
  **Implication:** reserve Plex Mono specifically for the card's factual/numeric fields
  (dates, counts, kcal) so its appearance itself signals "this is your specific data," while
  Poppins carries all voice/narrative copy.

---

## 6. Color psychology constrained to cream / sage / navy

The palette is fixed, so this section is about *sequencing* fixed tokens, not choosing new
ones. No controlled study was retrieved this session that measures LEXFIT's specific
cream/sage/navy system — everything here is **Guidance / practitioner convention**,
stated as such.

- **Dark grounds read as "serious," light grounds read as "safe."** This is a broadly
  observed convention (insurance, legal, and financial products routinely use a dark
  navy/ink band for terms, guarantees, and policy language, while lighter surfaces carry
  everyday product content) rather than a number we can cite. It is consistent with — but
  not proven by — the aesthetic-usability effect (§2): a deliberate visual *shift* at the
  guarantee band signals "this is a different kind of claim" (a promise, not a feature),
  which is exactly the navy-band-before-the-ask pattern already specified for this page.
  **Implication:** keep the guarantee on navy and the 3-card pricing band on the lighter
  sage/cream ground as currently planned — the contrast switch itself is the cue that the
  guarantee is a distinct, formal commitment, not more sales copy.

- **Contrast change as an attention amplifier for what follows:** a dark band ending and a
  light band beginning creates a strong luminance edge, which is a basic pop-out cue in
  visual search (again, general visual-perception convention, not a page-specific
  measurement). **Implication:** the guarantee-band-to-pricing-band transition should be a
  clean hard edge (not a gradient blend) so the luminance jump itself pulls the eye into
  the pricing band immediately after the trust claim lands — sequencing trust right before
  price is the load-bearing decision here, and the palette should make that sequence
  visually unmissable.

---

## 7. Section-level rhythm on long decision pages

- **Layer-cake structure (§3) is the primary lever for scan momentum** across a long page:
  strong, distinct headings per band let a scanning user skip confidently to the section
  that answers their current question (What do I get this week? What if it doesn't work?
  What does it cost?) rather than reading linearly or bailing.

- **Staged/progressive disclosure (§4) is the secondary lever**, keeping each band's
  content proportional to what's decision-relevant at that point in the scroll, deferring
  detail (full program preview, full pricing breakdown) to later bands.

- **Sticky-element etiquette:** a direct fetch to Baymard's sticky-elements guidance
  failed to load this session (server error), so this is stated as **Guidance**, not a
  cited number: the standing practitioner convention is that sticky rails/bars should stay
  small relative to the viewport, should not re-animate on every scroll tick, and should
  not duplicate the primary CTA more than once on screen at a time (a sticky rail CTA
  *and* a docked mobile CTA *and* an in-content CTA competing simultaneously dilutes the
  isolation effect from §3). **Implication:** on desktop, the sticky decision rail is the
  *only* persistent CTA — don't also float a second button; on mobile, the docked CTA bar
  replaces rather than supplements any in-content CTA once it's visible.

- **"Scent of information" down the page:** this is Pirolli & Card's information-foraging
  concept (seminal, HCI canon) — users keep scrolling as long as each section signals
  (via its heading/opening line) that it's worth the next section's cost. **Implication:**
  every band's heading should name the *payoff* of reading it ("Ha nem működik" for the
  guarantee, not a vague label), so the scent stays strong all the way to the pricing band
  at the bottom.

---

## 8. Anti-patterns

- **Mathur et al. (2019), "Dark Patterns at Scale: Findings from a Crawl of 11K Shopping
  Websites,"** *CSCW*, DOI
  [10.1145/3359183](https://doi.org/10.1145/3359183) — the empirical backbone of the
  modern dark-pattern taxonomy: 15 pattern types across 7 categories, found on ~11% of
  the shopping sites crawled. **Measured.**

- **Harry Brignull's Deceptive Patterns taxonomy**
  ([deceptive.design/types](https://www.deceptive.design/types)) gives the practitioner-
  facing names most relevant here: **Forced Action** (user must do something undesirable
  to get what they want), **Sneaking** (pertinent info hidden/delayed), **Hard to Cancel**
  (easy to buy, hard to leave), **Preselection** (defaults chosen for the user),
  **Hidden Costs** (fees revealed only at the end), **Fake Urgency** (manufactured time
  pressure), **Confirmshaming** (guilt-based copy on the decline option).

- **The FTC's September 2022 report, "Bringing Dark Patterns to Light"** (confirmed extant
  at [ftc.gov/reports/bringing-dark-patterns-light](https://www.ftc.gov/reports/bringing-dark-patterns-light))
  and the FTC's 2023–24 enforcement actions around subscription cancellation (culminating
  in the finalized "click-to-cancel" rule) show this taxonomy now carries regulatory
  teeth, not just design-ethics weight, in exactly LEXFIT's territory (subscription
  paywall + guarantee/refund flow).

- **Direct implications, mapped to what this page must NOT do:**
  - No countdown timer or manufactured scarcity on the offer (Fake Urgency).
  - No preselected upsell/add-on in the pricing band (Preselection).
  - Full price shown in the decision rail before checkout, never revealed only at a later
    step (Hidden Costs / Sneaking).
  - The guarantee/refund path stays one click away at all times, matching the already-
    built 10-edzés-garancia flow (counter to Hard to Cancel/Forced Action).
  - Decline/skip options (if any exist on this flow) use neutral copy, never guilt language
    (Confirmshaming).

- **Visual "hype tells" for a skeptical 35–54 audience** (practitioner consensus, not a
  cited study): countdown timers, saturated red/yellow urgency badges, stock fitness-model
  photography, fabricated scarcity counters ("only 3 spots left"), exclamation-heavy or
  superlative copy, and testimonial blocks with generic stock avatars. Every one of these
  is exactly what LEXFIT's fixed quiet palette and no-hype rule already structurally
  exclude — the discipline of staying inside cream/sage/navy/ink *is* the anti-dark-pattern
  visual signal for this audience.

---

## Design laws for the LEXFIT reveal

Each law states its evidence grade — **Measured** (cited number/study), **Canonical**
(seminal, broadly-replicated framework), or **Guidance** (practitioner consensus, no
primary study retrieved this session) — and the page section it governs.

1. **Make every input change visibly recompute the plan in real time** (start-day pick →
   week-grid dates re-stamp; CTA click → explicit processing state). *Canonical* — Nielsen
   heuristic #1. Governs: start-day picker, checkout CTA.

2. **Restate the user's own quiz inputs on the plan card** so recognition, not recall,
   confirms ownership. *Canonical* — Nielsen heuristic #6 (Adar, Teevan & Dumais 2008).
   Governs: week-grid card header.

3. **One saturated/high-contrast element per screen: the CTA.** Everything else stays
   inside the quiet cream/sage/ink palette. *Guidance* (isolation/Von Restorff logic).
   Governs: sticky decision rail CTA, mobile docked CTA bar.

4. **Structure the whole page as a layer-cake — strong, distinct headings per band —**
   rather than letting it default to F-scanning. *Measured* (NN/g eye-tracking,
   2006–2020). Governs: overall page/section rhythm.

5. **Front-load the key word or benefit in any explanatory copy; chunk or cut anything
   longer than ~3 lines.** *Measured* (F-pattern research). Governs: "Miért működik" copy,
   guarantee-band body text.

6. **Treat visual craft as a trust mechanism, not decoration** — polish measurably raises
   perceived usability/trust independent of actual function. *Measured* (Kurosu &
   Kashimura 1995). Governs: card shadows/radii/typography across week-grid, workout
   cards, pricing band.

7. **Give the plan visible "labor" — an assembling motion — instead of an instant swap.**
   *Measured* (Buell & Norton 2011 labor-illusion; Nebraska progress-bar study, ~3× more
   patience/satisfaction with visible progress vs. none). Governs: the plan-build moment
   immediately before the week-grid renders.

8. **Cap the reveal choreography at small, critically-damped beats** (response 0.3–0.4s,
   damping 1.0, ~80–120ms stagger) so it reads as one moment, not a queue. *Guidance*
   (Apple fluid-interface standard; Material convention). Governs: week-grid → picker →
   first-week-cards sequence.

9. **Reduced-motion must preserve the same reveal *order* via cross-fade, never a slide or
   spring.** *Guidance/accessibility standard* (`prefers-reduced-motion`). Governs: all
   reveal choreography.

10. **Keep the built-in dependency order (day picked → week dated → cards shown → preview
    summarized) intact** — it's a real interdependency, not a stylistic staging choice.
    *Canonical* (progressive/staged disclosure, NN/g). Governs: information sequence of
    the left column.

11. **Give the plan card explicit ownership cues** — name, start date, possessive framing —
    concentrated once at the card header, not repeated on every child card. *Guidance*
    (wallet-pass/boarding-pass/Notion-Linear convention). Governs: week-grid card header.

12. **Reserve monospace (IBM Plex Mono) for the card's factual/numeric fields** (dates,
    day counts, kcal) so its appearance itself marks "this is your data." *Guidance*
    (ticket/receipt typographic convention). Governs: week-grid numeric fields.

13. **Put the guarantee on the darkest ground (navy) and the price on the lighter ground,
    with a hard (not gradated) edge between them**, so the luminance jump sequences trust
    immediately before the ask. *Guidance* (dark=serious/light=safe convention;
    contrast-as-pop-out). Governs: navy guarantee band → sage/cream pricing band
    transition.

14. **Let the value stack (includes list + guarantee) outweigh the price number visually**
    in the sticky rail; the price should be found, not shouted. *Guidance* (pricing-page
    convention; not independently verified this session). Governs: sticky decision rail
    layout order.

15. **Structurally exclude every named dark-pattern tell** — no countdown timers, no
    preselected upsells, full price shown before checkout, refund/cancel path always one
    click away, neutral (non-shaming) decline copy. *Measured* (Mathur et al. 2019 CSCW
    taxonomy; FTC 2022 report; Brignull deceptive.design taxonomy). Governs: whole page,
    especially the pricing band and the guarantee/refund path.

---

## Sources

- Nielsen Norman Group, "10 Usability Heuristics for User Interface Design" —
  https://www.nngroup.com/articles/ten-usability-heuristics/
- Nielsen Norman Group, "Visibility of System Status" —
  https://www.nngroup.com/articles/visibility-system-status/
- Nielsen Norman Group, "Recognition vs. Recall in UX" (citing Adar, Teevan & Dumais 2008) —
  https://www.nngroup.com/articles/recognition-and-recall/
- Nielsen Norman Group, "The Aesthetic-Usability Effect" (citing Kurosu & Kashimura 1995) —
  https://www.nngroup.com/articles/aesthetic-usability-effect/
- Kurosu, M. & Kashimura, K. (1995), "Apparent usability vs. inherent usability,"
  CHI '95 Conference Companion, ACM. DOI: https://doi.org/10.1145/223355.223680
- Hassenzahl, M. (2004), "The Interplay of Beauty, Goodness, and Usability in Interactive
  Products," *Human–Computer Interaction*, 19(4). DOI:
  https://doi.org/10.1207/s15327051hci1904_2
- AttrakDiff (Hassenzahl's model, English overview) — https://attrakdiff.de/index-en.html
- Nielsen Norman Group, "F-Shaped Pattern of Reading on the Web" (Nielsen 2006, updated by
  Pernice 2020) —
  https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- Nielsen Norman Group, "The Layer-Cake Pattern of Scanning" —
  https://www.nngroup.com/articles/layer-cake-pattern-scanning/
- Nielsen Norman Group, "Progress Indicators" (citing University of Nebraska–Lincoln
  study) — https://www.nngroup.com/articles/progress-indicators/
- Buell, R. W. & Norton, M. I. (2011), "The Labor Illusion: How Operational Transparency
  Increases Perceived Value," *Management Science*, 57(9). DOI:
  https://doi.org/10.1287/mnsc.1110.1376
- Nielsen Norman Group, "Progressive Disclosure" —
  https://www.nngroup.com/articles/progressive-disclosure/
- Friesen, C. K. & Kingstone, A. (1998), "The eyes have it: Reflexive orienting is
  triggered by nonpredictive gaze," *Psychonomic Bulletin & Review*, 5(3). (Seminal gaze-
  cueing study; DOI: 10.3758/BF03208827)
- Von Restorff, H. (1933), isolation effect — foundational, widely cited in visual-search
  and memory literature (secondary reference: https://lawsofux.com/von-restorff-effect/)
- Pirolli, P. & Card, S. (1999), "Information Foraging," *Psychological Review* — origin of
  "information scent" (secondary reference via NN/g's ongoing use of the concept)
- Mathur, A. et al. (2019), "Dark Patterns at Scale: Findings from a Crawl of 11K Shopping
  Websites," *Proc. ACM Hum.-Comput. Interact.* (CSCW). DOI:
  https://doi.org/10.1145/3359183
- Harry Brignull, Deceptive Patterns taxonomy — https://www.deceptive.design/types
- FTC, "Bringing Dark Patterns to Light" (Sept. 2022) —
  https://www.ftc.gov/reports/bringing-dark-patterns-light
- Apple, Human Interface Guidelines — Motion (referenced via this repo's `apple-design`
  skill, itself distilled from Apple's WWDC 2018 "Designing Fluid Interfaces" and WWDC 2020
  "The Details of UI Typography" talks) —
  https://developer.apple.com/design/human-interface-guidelines/motion
- Material Design 3, Motion guidance —
  https://m3.material.io/styles/motion/overview/how-it-works

**Not independently verified this session (fetch failed; excluded from the numbered laws
above except as explicitly flagged Guidance):** Baymard Institute sticky-elements research
(500 error), CXL pricing-page A/B data (403), NN/g dark-mode/contrast article (404), NN/g
gaze-cues article (404), NN/g website-trust article (404).
