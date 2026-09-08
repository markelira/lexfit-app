# 08 — Funnel audit and the 2026-09-08 rewrite

Audit of `/ujrakezdes`, `/ujrakezdes/terv` and the reveal against the four source
documents (`offer_v3`, `funnel_v2`, `lead_magnet_v2`, `research_offer`) and the
research corpus in this folder, plus what was changed as a result.

Owner decisions this round: full-length landing (not hero-only) · calculator as
an opt-in bonus after Q7 · monthly stays the centred plan · programme preview
trimmed · fourth email approved · "building your plan" theatre rejected in
favour of honest motion.

---

## 1. Defects found

| # | Where | What | Severity |
|---|---|---|---|
| 1 | `copy.ts` Alexa transcript | „bírod-e egyben a **tíz hetet**" — offer v3 §0 migrated „10 hét → a te tempódban" months ago. The programme has no fixed length any more. | **Claim drift** |
| 2 | `scripts/ujrakezdes-selftest.ts:212` | The migration guard listed five migrated strings but never „10 hét" — which is exactly why #1 survived. | Test gap |
| 3 | Reveal | An empty grey box labelled „videó" rendered a video that does not exist and was never recorded. | Broken promise |
| 4 | Quiz progress | The final section was named „A számaid" for everyone — including people who declined the calculator and would never see a number. | Mislabel |
| 5 | Quiz flow | The calculator's three questions began automatically after Q7. Every ad promises „7 kérdés". | Promise/consent |
| 6 | Calculator step | `Tovább` is enabled by the fields, not the consent (correctly — a required tick is not freely-given consent). But declining silently produced no numbers at the reveal and said nothing. | Silent dead end |
| 7 | Reveal | The calorie result sat between the programme preview and the prices — a second hero number, stranded next to the offer. | Structure |
| 8 | Reveal | One undifferentiated scroll; sequential paywalls convert 12.41% vs 9.07%. | Structure |
| 9 | Reveal | The programme preview listed the entire catalogue. | Length |
| 10 | Reveal | „csütörtök az első edzésed napja." — Hungarian weekday names are lower-case mid-sentence, so the generated sentence began in lower case. | Copy |
| 11 | Landing CSS | `next/image` emits width/height **attributes**, which are presentational hints (real CSS `height: 900px`), and `aspect-ratio` only fills an `auto` dimension — so every member photo rendered at full height. The proof band was 2,162px tall on a phone. | Layout |
| 12 | Landing CSS | `repeat(3, 1fr)` is `minmax(auto, 1fr)`, so the step with the longest text widened its track: measured 101 / 128 / 101px instead of equal thirds. | Layout |
| 13 | `Landing.tsx` | The CTA was a component defined during render — new identity every pass, so React remounts rather than updates. | React |
| 15 | Landing content | `public/finish-examples/` was assumed to hold member **finish cards**. It holds the raw post-workout **selfies** that feed the Finish Share overlay — shirtless mirror shots, one in a gym locker room. Captioning them „valódi befejezett edzések" would have been false; physique imagery is the body-transformation frame this funnel avoids; and one of them shows a GYM on the landing page for a home programme. | **False claim / policy** |
| 14 | Quiz flow | Declining the calculator removed the invitation from the order, so `Vissza` from the gate skipped past it and the decline could not be undone. | Flow |

## 2. What changed

**`/ujrakezdes` — rewritten as a full-length landing.**
Hero (eyebrow „Szeptemberi Újrakezdés", H1 „7 kérdés, és kész a heti
edzésterved", the week-card artifact, CTA, chips, and the honest line that the
membership is paid) → `Ismerős?` carrying all three ad angles in third person →
the two rules on the page's single dark band → `Így néz ki` with the three real
product screenshots → member finish cards → Alexa → close, plus a mobile sticky
CTA that appears only when the hero's own button leaves the screen.

**`/ujrakezdes/terv` — audited, four changes.** The calculator is now offered
(„Kérsz mellé napi kalóriacélt is?") with a decline of equal weight; the final
section is „A terved"; the missing-consent case explains itself; the invitation
stays in the back-stack so a decline is reversible.

**The reveal — rebuilt as five sections.** The plan as ONE artifact (week grid
and the calorie numbers in a single card) → the start-day commitment → the
programme preview, trimmed to six → the guarantee framed as a roadmap, with the
miss-path → the offer → footer.

## 3. Evidence behind the reveal's order

| Position | Why | Grade |
|---|---|---|
| Plan as one artifact | Every teardown shows „your plan is ready" as one cohesive object | [D] |
| Start-day commitment replaces urgency | Implementation intentions, d = 0.65 | **[A]** |
| Sections, not one scroll | 12.41% vs 9.07%, 40M+ paywall opens | [B] |
| Guarantee last before the ask | Roadmap framing; StepBet failers regressed 5.3% below baseline, so the miss-path is the point | **[A]** |
| Three plans as one offer | Multi-offer pages generate 266% fewer leads | [B] |

## 4. The fourth email (D9)

D10 was cut because it was a deadline. D9 replaces it with proof — what the
first ten workouts are like — and says outright that there is no deadline and no
further mail. Evidence supports exactly one more send: a 7-vs-3 test gained 35%
conversion while unsubscribes rose 15% after email five, and fitness carries the
highest unsubscribe rate of any vertical (~0.40%). Nothing in it is
statistical; it is Alexa describing the coaching side, which is hers to say.

## 5. Deliberately NOT done

- **Annual pre-selected and centred.** The strongest single finding in the
  corpus (defaults 42% → 82%; centre-stage 26.5% vs 10%), overruled by owner
  decision: monthly stays „Legnépszerűbb". `PricingBand.tsx:22-24` still records
  the original reasoning. Revisit if annual stays at zero.
- **Q1 embedded in the landing hero.** Flagged by the research as the
  highest-value *untested* idea. Shipping it inside a rewrite would make every
  other change unattributable. First A/B once analytics exist.
- **A 4–6 s „building your plan" screen.** Competitors all use one. Rejected:
  we do real work at that moment, so the week grid animating into place is
  honest and a fake progress bar is not.
- **The pre-existing lint in `PlanWizard.tsx`** (one `set-state-in-effect`, two
  `exhaustive-deps` on `ORDER`). Verified identical at HEAD — untouched.

## 6. Still open, and not code

0. **Real proof assets are missing.** The photo proof band was removed (defect
   #15) and replaced with the one claim we can stand behind — the 1,200+
   community line from funnel_v2 §2.2 P5. A finish card is the selfie *plus*
   the data overlay; the overlay is what makes it evidence of a workout rather
   than a photograph of a person. If exported finish cards become available,
   `PROOF` in `src/app/ujrakezdes/copy.ts` is where they go. Named member
   quotes would be worth more still (up to +29%), but we have none, and
   inventing one for a real, named person is the thing this page must never do.

1. `UJRAKEZDES_ENABLED=true` is not set in Vercel; the endpoint is off in prod.
2. The Art. 9 privacy amendment is unapproved — a blocker on the calculator
   collecting body metrics from live traffic.
3. `NEXT_PUBLIC_GUARANTEE_LIVE` stays off until the ÁSZF clause is published.
   The guarantee block and both guarantee emails are already gated on it.
4. **Split the D0 transactional stream onto its own subdomain** from D3/D6/D9.
   Since Nov 2025 missing SPF/DKIM/DMARC or RFC 8058 one-click unsubscribe means
   rejection, not spam-foldering.
5. **Desktop was not visually verified.** The browser is pinned to a 430px
   emulated viewport (`outerWidth` 430 on a 1710px screen). The desktop *rules*
   were verified by applying them at the current width — equal grid tracks, no
   horizontal overflow — but nobody has looked at the real thing at 1440px.
6. **Test in the real Facebook/Instagram in-app browser.** WKWebView has
   documented freezing and `svh`/`dvh` snapping bugs, and reports of ~25%
   conversion loss. This cannot be researched away.
