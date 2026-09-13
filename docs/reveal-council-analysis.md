# The Reveal Council — conversion analysis of /ujrakezdes/terv's results screen

> **Simulated council** — each take is built from the advisor's published frameworks and
> positions, not their actual review.

**Date:** 2026-09-13 · **Subject:** the lead-magnet reveal (B0–B11, `PlanWizard.tsx` + `copy.ts REVEAL`)
**Goal:** visual + structural enhancement of the results screen, scoped to conversion (reveal → register → paid).
**Inputs:** prod funnel data, live-page visual audit (desktop screenshots), full copy audit, and a
source-cited external research pass (teardowns of Noom / MadMuscles / BetterMe / Reverse Health /
Fastic / Lasta; paywall datasets from RevenueCat / Adapty / Funnelfox; behavioral-science primary
sources). Research appendix at the bottom.

---

## 0. The evidence before the council

### Internal (measured)
| Fact | Value | Reading |
|---|---|---|
| Reveal views (≈ leads) | ~109 | every lead sees this screen |
| Reveal → register | **~4%** | the number on trial; industry paywall-view→trial median ~11% (Adapty H&F) |
| Register → checkout start | 3/4 | who acts, buys — intent is real |
| Segments | restart 36% · stronger 31% · no_energy 16% · careful 12% | Problem-Aware, self-doubting restarts |
| Level | none/rare 60% | they doubt *themselves*, not the product |
| Care mentions | knee 48 · back 38 · quiet 15 | fear of injury/judgment is loaded |
| Marketing consent refusal | 37% | a trust-skeptical audience, measurably |
| Reveal analytics | **none per-section** | offer-view, scroll depth, curve-view: unmeasured |

### Visual audit of the live page (what the screenshots show)
1. **Above the fold is good**: personalized plan card (answer chips, week strip, milestone chain,
   3 stat tiles) + the 490 Ft offer rail. This is already the winning "echo their answers" pattern.
2. **After fold 1 the page goes conversionally silent**: mechanism → Alexa → anti-avatar → FAQ →
   close is a long, image-free, monochrome stretch with **no price and no CTA on desktop** (the rail
   scrolls away; the sticky bar is mobile-only).
3. **One product visual on the whole page** (a single workout cover). No member photos, no
   testimonials, no outcome visualization, no app-in-use imagery.
4. **Dangling guarantee**: the milestone chain says "10. — GARANCIA" while the guarantee band, FAQ
   entry and close-line are flag-hidden. The page references a promise it never explains.
5. **"0 eszköz" stat tile** reads as an empty state, not a benefit.
6. **No plan-generation moment**: the gate submit jumps straight to the reveal — the personalization
   is computed invisibly, so it feels cheap (labor-illusion research says: show the work).
7. The honesty line ("Ha tudod, hogy maradsz, a havi olcsóbb.") is unusual and good — an asset to
   amplify, not sand off.

### External (research pass, full citations in appendix)
- Winning reveals converge on: **labor-illusion loader (8–15 s, named truthful steps)** →
  **personalized projection curve with dated milestones** → **plan framed as already-built, payment
  as unlocking** → 3 tiers with per-day framing and best-value preselection → **risk reversal
  between tiers and CTA** → billing-date transparency.
- Blinkist's "we'll remind you before renewal" honesty redesign: **+23% trial starts, −55% complaints**.
- Adapty: per-period price reframing lifts trial starts **10–18%**. RevenueCat-cited test: 3
  educational pre-paywall screens moved opt-in **2% → 15%**.
- Behavioral primaries: labor illusion (Buell & Norton 2011), endowed progress (Nunes & Drèze 2006,
  34% vs 19%), habit automaticity curve plateauing ~66 days (Lally 2010 — maps almost exactly onto
  an 8-week program), Fresh Start Effect (Dai/Milkman/Riis 2014), implementation intentions
  (Gollwitzer & Sheeran, d=.65; 91% vs 35% follow-through in the classic exercise study).
- Compliance tailwind: EU Digital Fairness Act + active GVH enforcement (AboutYou: 1Mrd Ft
  fine+compensation) make countdown timers, fake badges and weight-date curves a liability. LEXFIT's
  no-deadline / no-body-numbers rules are **pre-compliance, not handicap**.

---

## Seated: Schwartz, Brunson, Hormozi, Sutherland, Godin (council session)

Two funnel/offer natives (Brunson, Hormozi), the cold-traffic diagnostician (Schwartz), the
behavioral reframer (Sutherland), and **Godin seated as the designated dissenter** — the reveal is
the delivery of a promised gift, and someone at the table must defend the recipient.

---

### Eugene Schwartz — meet the prospect where she is

Schwartz would start with his two diagnostics. *Awareness:* this visitor is **Problem-Aware** — she
knows she stopped moving, feels it, and has restarted and failed before (36% literally answered
"restart"). She is not Product-Aware; she has never heard of LEXFIT before this morning's Facebook
scroll. *Sophistication:* home fitness is a **stage-4/5 market** — she has heard every claim
("get fit in 30 days") a hundred times. Claims are dead here. What sells at stage 4 is the
**mechanism**, and at stage 5, **identification**.

Against that ruler, the reveal's copy is better than most of the category — "Nem az akaraterővel van
baj: azzal, hogy minden kihagyás után nulláról kell kezdeni" works *with* her existing belief ("I
always quit") instead of arguing against it, exactly as *Breakthrough Advertising* prescribes. But
the mechanism lives in **body text**. At this sophistication stage the mechanism must be the *visual
centerpiece*, not a paragraph: the two rules ("a pihenőnap nem tör meg · a kihagyott hét nem
nulláz") should be *drawn*, not stated. The habit-strength curve from the research pass is the
mechanism made visible — and Schwartz would insist on the LEXFIT-specific version: a curve that
shows a **missed week that does not reset to zero**, because that dip-and-continue shape is the one
picture no competitor's yo-yo graph shows.

He would also invoke his assembly principle: copy is assembled from the market's own words, and the
quiz answers *are* the market's words. The page already echoes them as chips — good. But the offer
block speaks the product's language ("30 vezetett edzés") where it should keep speaking hers
("heti 3, a te térded miatt ugrálás nélkül"). Channel the desire that exists — to become someone who
doesn't have to restart again — never try to create appetite for a video library.

**Bottom line:** the mechanism is the message — turn the two rules into the page's central visual
(the missed-week-that-doesn't-zero curve), and keep every headline in the prospect's own words.

### Russell Brunson — hook, story, offer; you're one step away

Brunson's first question: what's broken — hook, story, or offer? The **hook is working** (34%
click→lead, and the plan-card reveal is a strong hook moment). The **offer is structurally right**
(490 Ft intro is a textbook front-end; the 88% bar is "you're one step away" made literal). What's
broken is the **story and the stack**. Alexa's epiphany bridge — ten years of competitive
gymnastics, then years of nothing, then a system that survives real life — is *exactly* the
belief-breaking story this audience needs (her false belief: "I'm the kind of person who quits").
And it's buried two-thirds down the page with a thumbnail avatar. The story earns the offer; it
belongs between the plan and the price, told with a real photograph, not appended after it.

Second: the value stack is presented as a nine-line text list in the rail. *DotCom Secrets* would
treat that as leaving the close on the table — the stack should build visually (program by program,
each with its cover art) and land on "mindez az első héten: 490 Ft." Payment must read as
**unlocking the thing that's already built** — the research pass found this exact framing across the
category's winners ("the paywall reads like unlocking what's already built"). The plan card the user
sees IS the product; the CTA should say so: "Kezdem a tervem," never "Előfizetek."

Third, the funnel doesn't end at purchase: the success page is a value-ladder moment (annual
upgrade with the earned framing) that currently sells nothing. And he'd note the desktop CTA desert
mid-page with disbelief — a funnel page where the buyer must scroll back up to buy has broken its
own spine.

**Bottom line:** move the story up and make it big, turn the flat list into a visual stack that
lands on 490 Ft, and never let a screenful pass without a way to say yes.

### Alex Hormozi — the weak variable is certainty

Run the value equation. *Dream outcome:* fine — restart and stay restarted. *Time delay:* strong —
"az első pipa ma este megvan" is the right instinct. *Effort:* strong — 20–30 minutes, living room,
zero equipment. The weak variable, by a mile, is **perceived likelihood of achievement** — and for
this audience the doubt is not "does the program work," it's "will *I* stick with it," because 60%
of them told the quiz they currently train never-or-rarely. Everything on the screen that raises
her certainty *about herself* converts; everything else is decoration.

What raises certainty: proof and risk reversal — and the page currently fields almost none. "1 200+
ember mozog velünk otthon" is one line of small text. No faces, no member stories, no
transformation-of-habit narratives. And the single strongest certainty device the product owns —
the 10-workout money-back guarantee — is **switched off pending an ÁSZF clause**, while the
milestone chain advertises it anyway. Hormozi would be blunt: you built a Grand-Slam-grade risk
reversal, wrote it into the milestones, and then shipped the page with it dark. Publishing that
clause is the highest-ROI marketing act available; it costs a legal signature, and refund-abuse
rates in the research run under 5–10%.

On price presentation: he'd endorse the per-day reframe (39 900 Ft = **109 Ft/nap** — cheaper than
any Hungarian comparison object you'd name), the explicit renewal timeline (the fear is never the
490 Ft, it's the invisible 1 990), and the Blinkist-style "emailben szólunk a megújulás előtt" —
that single line converts the renewal from trap to promise, and your email system already exists.
One caution from his volume doctrine: at 109 leads, don't A/B anything — ship the whole
high-evidence package at once, then go get more traffic; the screen can't teach you anything at
n=109.

**Bottom line:** turn the guarantee on, flood the page with self-efficacy proof, and make the
renewal transparent — certainty is the product.

### Rory Sutherland — sell the feeling of a plan, not the logic of one

Sutherland would begin by praising what the logical mind wants to delete. The honesty line — "Ha
tudod, hogy maradsz, a havi olcsóbb" — is precisely the sort of expensive-looking honesty that works
as a **costly signal**: it proves the page is not optimized against the reader, which in a market
where 37% refuse a marketing checkbox and half the country still pays cash on delivery is worth more
than any badge. Blinkist's numbers (+23% starts from promising a renewal reminder) are the measured
version of his thesis: the psychological problem here is not price, it's **the fear of being
quietly charged by strangers** — solve that feeling and the 490 Ft sells itself.

His psychological moonshot for this screen is the **reveal moment itself**. Ten seconds of visible
work — "elemzem a válaszaid… kiválasztom a mozgásformákat… beosztom a pihenőnapokat ✓" — costs
nothing and transforms the perceived value of the identical plan (Buell & Norton's labor illusion:
we value what we watched being made). The plan appearing instantly is, perceptually, a plan worth
nothing. He'd add an ownership twist a committee would reject for being too small: let her **choose
her start day** on the reveal ("Hétfőn vagy ma este?"). A plan she adjusted is *her* plan — endowment
via one tap — and it manufactures the only honest deadline that exists: the calendar (the Fresh
Start Effect is real and free, every Monday).

And a warning: the research pass is a catalog of what every Noom clone already does. If the redesign
becomes checklist-complete — curve, tiers, badges, loader — it converges on the category's median
look, and "a purely rational process gets you to the same place as your competitors." Keep one
extravagance: the missed-week-that-doesn't-zero curve is genuinely absurd by category standards
(a fitness app *advertising* that you will fail a week!) — that is the alchemy; protect it.

**Bottom line:** stage the reveal as watched labor, hand over ownership with one small choice, and
keep the radically honest bits — they are the differentiation, not the leak.

### Seth Godin — the dissenter: this is a gift; behave like it

Godin's opening questions land uncomfortably. *Who's it for?* A woman who trusted you with her email
in exchange for a plan. *What's it for?* The page under review answers: extracting a card number as
fast as psychology allows. He would remind the table that this is **permission marketing** in its
literal form — she opted in for a plan, not for a paywall — and that the 37% consent-refusal rate is
this audience telling you exactly how much selling they'll tolerate. Every manipulation mechanic the
teardowns celebrate (decoy tiers, "Popular" badges on the plan you want to move, preselected
longest-commitment, squeeze discounts) spends trust you cannot buy back in this market — and, he'd
note drily, is now also what the GVH fines people a milliárd forint for.

His constructive move: make the *free thing* so good it's remarkable. The persisted plan URL, the
TV instructions, the plan that survives a missed week — over-deliver these until she'd tell a
friend ("would anyone miss this page if it were gone?"). The tribe framing is sitting unused:
"szeptemberi újrakezdők" is a *people-like-us-do-things-like-this* movement, and the reveal could
welcome her into it honestly — real cohort, real people, real coach. Then let the paid offer be one
confident, quiet invitation: here's what the system costs, here's the guarantee, no tricks. He would
concede — importantly — that the offer *belongs* on this page: she finished the quiz asking "what's
next." His line is not "don't sell"; it's "sell like someone who expects to see her again."

**Bottom line:** over-deliver the gift, build the tribe, make one honest invitation — and treat
every dark-pattern-adjacent mechanic as a tax on the next thousand leads.

---

## Where the council disagrees

1. **Compress toward the price vs. educate before it.** Brunson (and the Funnelfox data: only ~13%
   of sessions reach paywalls — warm survivors need closing, not schooling) wants the pre-price
   beats tightened and coach/FAQ moved below the first price exposure. Schwartz counters that a
   Problem-Aware, stage-4 cold prospect needs mechanism-belief *built* before price means anything —
   and the RevenueCat 2%→15% pre-paywall-education test is on his side. **The real trade-off:**
   closing the warm few vs. warming the skeptical many. **What settles it:** per-section scroll +
   offer-view analytics on the reveal (currently zero instrumentation), then one position test.

2. **Persuasion machinery vs. permission.** Hormozi/Brunson want the full stack — preselection,
   anchoring, badges, stacked value. Godin calls preselected-longest-plan and decoy tiers a trust
   tax on a 37%-refusal audience; Sutherland splits the difference: honest costly signals
   (guarantee, renewal promise, honesty line) outperform mechanics *in this market*. **The real
   trade-off:** this month's conversion vs. the trust that determines next quarter's. **What
   settles it:** track unsubscribe rate, refund rate, and the consent-checkbox rate alongside
   conversion — if machinery lifts checkout but degrades the trust metrics, Godin was right.

3. **Test everything vs. ship the package.** The research pass implies a dozen A/B tests; Hormozi's
   volume doctrine says at 109 leads the screen is statistically mute — ship all high-evidence
   changes at once and buy traffic. **The real trade-off:** attribution of learning vs. speed to a
   working funnel. **What settles it:** lead volume. Below ~500 leads/month, ship-the-package wins;
   revisit per-element testing when the denominator supports it.

4. **The curve: mechanism or me-too?** Schwartz and the teardown evidence make the projection curve
   the centerpiece; Godin warns another rising graph pattern-matches to every Noom clone and fails
   the remarkability test; Sutherland brokers: the *generic* habit curve is me-too, but the
   **missed-week-doesn't-zero** curve — a dip drawn on purpose, annotated "ez benne van a tervben" —
   is a purple cow wearing a chart. **What settles it:** nothing needs to; build the LEXFIT-specific
   version and both camps get what they wanted.

---

## Chair's synthesis

The screen's conversion job, in one sentence: **raise her certainty about herself, and kill the
renewal fear** — everything else is staging. The bench agrees on far more than it fights about, and
the disagreements resolve into sequencing rather than contradiction.

**The recommended reveal, in order (mobile-first):**

| # | Element | Council authority | Evidence |
|---|---|---|---|
| R1 | **Labor-illusion loader** before the reveal: 8–12 s, named truthful steps with checkmarks (gyakoriság ✓ fókusz ✓ térd-kímélő változatok ✓ pihenőnapok ✓) | Sutherland, Brunson | Buell & Norton 2011; Noom/Web2App spec |
| R2 | **Plan card** (keep) + endowed-progress caption on the 88% bar: "A terved 88%-ban kész — már csak az indulást válaszd" | all | Nunes & Drèze 2006 |
| R3 | **The LEXFIT curve**: habit-strength over 8 weeks, milestone flags (1·5·10·15·30), one deliberate dip labeled "kihagyott hét — nem nulláz", animated draw once. Y-axis = szokáserő, never kg | Schwartz, Sutherland, Godin | Lally 2010; category teardowns; ASA/DFA-safe |
| R4 | **Start-day choice + fresh start**: "Mikor indulsz? Ma este · Hétfőn (szept 15.)" — one tap, writes the real date into the plan and the first-workout line | Sutherland, Hormozi | Fresh Start Effect; implementation intentions d=.65 |
| R5 | **Offer block**: visual value stack (program covers, not a text list) landing on "az első hét 490 Ft"; billing timeline ("Ma 490 Ft → szept 22-től 1 990 Ft/hét"); per-day framing on annual (109 Ft/nap); **no fake badges, no preselecting the longest plan** — annual highlighted as "legjobb ár" only because it arithmetically is | Brunson, Hormozi, Godin's veto on mechanics | Adapty +10–18%; Funnelfox; GVH compliance |
| R6 | **Cancel-anxiety killer directly under the CTA**: "A megújulás előtt e-mailben szólunk. Bármikor lemondható, két kattintás." (infra already exists) | Sutherland, Hormozi | Blinkist +23% starts, −55% complaints |
| R7 | **Guarantee band LIVE between tiers and CTA** — publish the ÁSZF clause (owner action); until then remove the dangling "10. — GARANCIA" milestone label | Hormozi (loudest), all | risk-reversal literature; internal inconsistency |
| R8 | **Alexa's story moved above the offer**, real photograph, epiphany-bridge structure; cohort line "a szeptemberi újrakezdők most kezdik" | Brunson, Godin | Expert Secrets; tribe framing |
| R9 | **Proof density**: member faces/stories when consented photos exist; until then, honest scale ("1 200+ ember") visually treated + the two rules as proof-of-design | Hormozi | BetterMe/Lasta pattern |
| R10 | **No CTA deserts**: desktop rail persists (or a desktop sticky appears) so no screenful lacks a path to yes; FAQ's billing questions within one scroll of the CTA | Brunson | Funnelfox sequence |
| R11 | **Instrument the screen**: section-view + offer-view + curve-view + sticky-impression events; quiz-start event finally wired | chair | disagreement #1 is unfalsifiable without it |
| R12 | Keep and amplify the honesty assets: the "havi olcsóbb" line, the no-deadline stance, "a terved így is a tiéd marad" | Sutherland, Godin | differentiation + DFA tailwind |

**Ship strategy** (per disagreement #3): one release, whole package, no per-element testing until
volume supports it. Success metric: reveal→register (target: 4% → 8–10%), with checkout-start and
paid as the true north now that the webview fix is live.

- **Do next:** (1) owner signs the ÁSZF guarantee clause — it gates R7 and unlocks the strongest
  D6 email subject too; (2) design pass on R1–R5 (the loader, curve, start-day chooser, and stack
  are the visual work); (3) wire R11 analytics *in the same release* so the next council has data.
- **Tripwire (Godin's):** watch consent-checkbox rate, unsubscribe rate, and refund rate for the
  four weeks after launch. If conversion rises while those degrade, the machinery is eating the
  brand — retreat to the honest core (R1–R4, R6, R12).
- **Execute with:** `frontend-design` + `copywriting` for the build; `ab-testing` once ≥500
  leads/month; `offers` if the guarantee clause stalls and the offer needs re-anchoring without it.

---

## Appendix — research sources

Teardowns: RevenueCat web-to-app funnel teardown (Noom), Web2App World (Noom, MadMuscles),
Funnelfox 311-funnel analysis + 2026 pattern report + paywall-design examples, Clarflow (Reverse
Health), ScreensDesign (Freeletics, MadMuscles), Appllama (Fastic, Yazio), tasu (Cal AI), Reteno
(Yazio), Heyflow quiz-results guides, Funnel of the Week (MadMuscles).
Data: Adapty State of In-App Subscriptions 2026 (+10–18% per-period framing; H&F benchmarks),
RevenueCat paywall guides (3-screen education 2%→15%; annual-lead anchoring), Growth.Design
Blinkist case (+23%/−55%), sticky-CTA tests (Blend Commerce, GrowthRock, Convertibles; nulls at
Online Dialogue).
Behavioral science: Buell & Norton 2011 (labor illusion, Management Science); Nunes & Drèze 2006
(endowed progress, JCR); Lally et al. 2010 (66-day automaticity, EJSP); Dai, Milkman & Riis 2014
(Fresh Start, Management Science); Gollwitzer & Sheeran 2006 + 2024 meta (implementation
intentions); Gourville 1998 (pennies-a-day, JCR).
Compliance: EU Digital Fairness Act briefings (EP thinktank, BEUC), ASA weight-loss rulings
(Osborne Clarke), GVH actions (airline sweep 2022, Ryanair 2025, AboutYou 500M+500M Ft).
