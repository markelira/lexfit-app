# Onboarding personalization & the reveal — evaluation + recommendation

_Grounded in a 4-stream web research pass (plan-reveal leaders · workout-program
personalization · women-first/home niche · reveal UX & conversion psychology).
Sources cited at the end. This supersedes the placeholder arc in `_mock.ts`._

## The problem, stated precisely

Our reveal (step 8) isn't structurally un-personalized — the week strip and the
"Heti N edzés · reggelente · csendes variációkkal" caption are real. But the
**emotional centre** of the screen (headline + 3-beat arc) is a per-goal template
whose beats 2–3 are literal placeholders, and **two of our six answers are collected
and then thrown away**:

| Answer | Collected | Used in reveal today |
|---|---|---|
| goal | ✓ | headline + arc (arc beats = placeholder) |
| days + weekdays | ✓ | week strip + caption ✓ |
| time | ✓ | one word in caption |
| env | ✓ | one phrase in caption |
| **level** | ✓ | **discarded** |
| **why** (free text) | ✓ | **discarded** — the most emotional answer we take |

So the fix is **not primarily "add more questions."** It's: consume the answers we
already have, add the 1–2 highest-value missing levers, and rebuild the reveal so it
visibly echoes every answer back.

---

## What the research says (convergent findings)

1. **Length lifts conversion — but only plan-changing questions earn their place.**
   Longer onboarding measurably raises trial starts (Lose It! reported "double-digit"
   gains, extending until diminishing returns) via the IKEA-effect / sunk-cost /
   commitment-and-consistency mechanism — each answer is a micro-investment, so the
   built plan "becomes a reason to subscribe." But the failure signal is a drop-off
   spike right after a question block: that means the flow "asks for more effort than
   it returns." SWEAT and FitOn convert on ~5 focused questions; BetterMe (26) and
   MadMuscles (48) raise abandonment. **Sweet spot: ~6–8, all plan-changing.**

2. **Four questions fork the actual plan in _every_ app:** goal, experience/level,
   days-per-week, equipment/location. Second tier (differentiators only some ask):
   session length, **which specific weekdays**, **injuries/areas-to-protect**, and —
   almost nobody exposes it — **body-area focus**. For a women-first app, body-area
   focus is "the single biggest untapped 'this is mine' lever."

3. **Perceived personalization > actual personalization** for driving acceptance.
   Echo the user's own words back, name the plan, and show a short honest
   "building your plan" loader (labor-illusion: up to ~15% higher perceived value;
   instant results read as *fake*). Stay on growth.design's "reassure, not
   manipulate" side — a 2–4 s loader reflecting real inputs is honest; minutes-long
   fake "computing" for a lookup is the manipulative version.

4. **Project effort/consistency, never a body outcome.** Noom/Cal-AI's converting
   reveal is a weight-curve to a target date — which we've ruled out and which is the
   FTC substantiation trap (health claims need "competent and reliable scientific
   evidence"). Our body-positive, honest substitute keeps the "visualised future"
   pull without a body claim: **derive pace from days** ("heti 3 edzéssel a Foundation
   ~X hét alatt megvan") and show a habit/consistency trajectory. **No competitor
   tells the days→pace story — it's an honest moat.**

5. **A fixed queue can still feel personally generated** via: (a) answers echoed back
   as labelled chips, (b) the real weekday **calendar** (F001…F00N laid on the user's
   chosen days), (c) phase-name overlay, (d) an immediate **Day-1 card**, (e) light
   editability (reschedule which weekday), (f) the derived-pace honesty story.

6. **Women-first, body-positive guardrails (hard rules).** ADOPT: life-stage band,
   opt-in postpartum/limitation safety flag framed as _care_, focus areas framed as
   "where you want to feel stronger," "what stopped you before." AVOID (all
   criticised / legally risky): current-vs-dream-body silhouette pickers (MadMuscles/
   BetterMe — most-criticised pattern, dubious science), weight input & weight-target
   projections, "problem areas / trouble zones / bikini body / flat tummy" language,
   fixed-length body promises, and a required "how do you feel about your body now"
   deficit rating (frame forward: "how do you want to *feel*?").

7. **Where enforcement actually lands: subscription mechanics, not the plan.** Noom
   paid $56M over auto-renewal dark patterns; WW/Kurbo $1.5M + algorithm deletion over
   a weak age gate. Keep: clear auto-renew disclosure + separate affirmative opt-in
   (we have the consent box), one-click cancel, and **no fake/looping countdown timer**
   on the reveal (EU Omnibus + FTC). If we ever use urgency, make it a real,
   post-paywall, non-converter-only offer.

---

## Recommendation A — the question set

Keep all six (each earns its place _once the reveal consumes it_), add **focus area**,
and optionally add a **life-stage band**. Re-order so goal leads and the emotional
"why" sits last, right before the reveal (Fabulous/Noom pattern).

| # | Question | Status | Why it earns its place | How the reveal consumes it |
|---|---|---|---|---|
| 1 | **Goal** (feeling/capability) | keep | universal; reframes the whole plan | echoed headline + arc |
| 2 | **Focus area** — "hol szeretnél erősödni?" (fenék · core · kar · tartás · teljes test) | **ADD** | women-first's biggest untapped "this is mine" lever; body-positive rewrite of "problem areas" | focus chip + Day-1 framing + workout emphasis |
| 3 | **Level** | keep + **USE** | universal pace/complexity driver; today discarded | tempo line ("vezetlek végig" ↔ "jöhet a kihívás") + pace calc |
| 4 | **Days/week + weekdays** | keep | highest-ROI; the real calendar & pace driver | weekday calendar + derived-pace projection |
| 5 | **Time of day** | keep | cheap; powers the reminder + phrasing | reminder + "reggelente" |
| 6 | **Env / safety** (csendes · fal/szék · térd · hát · nincs) | keep (clarify it's equipment+safety) | doubles as our equipment & injury/areas-to-protect input | safety chips + variation phrasing ("térdkímélő variációkkal") |
| 7 | **Why now** (free text) | keep + **USE** | the emotional anchor | **quoted back in Alexa's voice** on the reveal |
| (8) | **Life-stage band** (20s/30s/40s/50+) | _optional add_ | tunes Alexa's voice + intensity framing; non-controversial | Alexa voice + framing |

Cut: nothing. Everything already collected earns its place — the sin was not
consuming it. Net: **7 questions (8 with life-stage)** — inside the evidence-backed
sweet spot.

**Deliberately NOT adding:** body silhouette / dream-body picker, weight, goal-weight,
baseline fitness test ("how many pushups" — no app asks it at onboarding), session
length (our sessions are ~22–30 min fixed — asking would imply a control we don't have).

---

## Recommendation B — the reveal, rebuilt to consume every answer

Top → bottom composition (each block cites the answer it echoes):

1. **Honest "building your plan" beat (2–4 s).** "Összerakom a heted a válaszaidból…"
   — reflecting real inputs; a slot for the one social-proof line. Optional but
   evidence-backed (labor illusion). Never fake-long.
2. **Alexa's voice + eyebrow.** "A te terved" — the coach speaks, turning a data
   screen into a relationship.
3. **Goal-echoed headline** (real per-goal capability line — already written).
4. **The "why" reflected back** — their own sentence, quoted: _"Azért kezdted, hogy
   »…«. Ezt viszem végig veled."_ ← **the missing emotional beat** (consumes `why`).
5. **Personalized summary chips** echoing every answer: focus · level/tempo · N nap ·
   weekdays · time · safety. Makes the plan read as a computed result (consumes focus,
   level, days, weekdays, time, env).
6. **The named first-week calendar** — F001…F00N placed on the user's chosen weekdays,
   with a phase label ("1. blokk · Alapozás") (consumes days + weekdays).
7. **Honest derived-pace trajectory** — replaces the placeholder arc beats with
   something real & computed: _"Heti {days} edzéssel a Foundation ~{weeks} hét alatt
   megvan — a lényeg a rendszer, nem a sebesség."_ Effort/consistency, no body numbers
   (consumes days; our moat).
8. **Day-1 hero card** — the real F001, personalized with focus/weekday: "Kezdd ezzel."
   The concrete first action is what makes the plan feel real.
9. **One honest social-proof line** — "17 000+ nő a csoportban."
10. **Single CTA** → plan/pay. **No countdown, no fake urgency** on this first reveal.

This turns the arc's two placeholder beats into (7), so **you no longer owe me
placeholder copy** — the trajectory is computed from `days`, and the emotional beats
are the quoted `why` (4) + the honest pace line (7).

---

## What changes in code (if approved)

- **_mock.ts**: add focus-area question block; (optional) life-stage; replace the
  placeholder-beat `outcomes` with per-goal headline + honest trajectory template.
- **foundation-preview.ts**: add `paceWeeks(days)` (queue length ÷ days) + phase names.
- **OnboardingV2.tsx**: new Focus step (auto-advance single-select); Reveal rebuilt to
  the 10-block composition; consume `level` (tempo line) and `why` (quoted). Optional
  loader component.
- **onbv2.css**: styles for chips, calendar, quoted-why, Day-1 card, loader.
- **user.ts / prefs.ts**: persist `focus` (and `lifeStage`) in onboarding answers.

---

## Sources
RevenueCat (onboarding length; web-to-app funnel; paywall guide); Airbridge
(pre-paywall onboarding); Superwall (Cal AI); Adapty (2026 paywall); growth.design
(labor perception / Buell-Norton); Behavioral Scientist (Noom & Fabulous critiques);
Growthwaves (Noom 113-screen teardown); App Fuel / BetterMe quiz; Fitness Drum (SWEAT);
FitOn reviews; MadMuscles funnel breakdown + Dr. Muscle criticism; 8fit body-positivity
tone spec; WILD.AI / trainwell (life-stage); Fitbod (algorithm, injuries), Freeletics,
Future, Caliber, Centr, Peloton, NTC, Ladder help/reviews; FTC health-claims & Negative
Option guidance; Hunton ($56M Noom settlement); EU Omnibus Directive.
