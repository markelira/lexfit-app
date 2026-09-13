# Reveal redesign — dev plan (R1–R12)

**Source:** docs/reveal-council-analysis.md (council synthesis) + docs/lead-conversion-diagnosis.md.
**Goal metric:** reveal → register 4% → 8–10% (secondary: checkout-start /lead, paid /checkout-start).
**Ship strategy:** ONE release, no per-element A/B (n≈109/mo is statistically mute), analytics in the
same release so the next iteration argues from data.
**Scope:** `/ujrakezdes/terv` reveal (PlanWizard B0–B11) + the persisted-plan page `/ujrakezdes/terv/[token]`
(same component — email visitors get every improvement for free). **Non-goals:** quiz questions, gate,
landing, register wizard, emails (already fixed), pricing values.

## Design principles (locked by the council)

1. **Honest by construction** — no countdowns, no fake badges, no preselected-longest-plan, no
   body-number projections. The calendar (Monday), the guarantee, and transparency ARE the urgency.
2. **Mobile-first, FB-webview-safe** — CSS/SVG animation only, no new deps, no layout thrash;
   `prefers-reduced-motion` honored everywhere.
3. **Mobile DOM stays the master order**; desktop rearranges via the existing `.u2` grid only.
4. **Every string in `copy.ts`**, every forint interpolated from `PRICES` (F0.5 hard rule).

## New block order (mobile master DOM)

```
B0  progress bar (88%) + R2 endowed caption
R1  [transition] PlanBuild loader — gate→reveal only, never on /terv/[token]
B1  plan card (chips · week strip · milestones · stats)  ← "0 eszköz" tile reworded
R3  HabitCurve — the 8-week szokáserő curve with the missed-week dip
R4  StartDayPick — "Ma este · Hétfőn (szept 15.)" + first-workout line (absorbs B4's job)
B3  mechanism — compressed; the two rules become the curve's caption, not a separate essay
B8  Alexa — MOVED UP, real photo large, epiphany-bridge order + cohort line
B2/B6  OFFER — visual value stack → tiers (annual "legjobb ár", computed) → billing timeline
       → R6 cancel-anxiety line → R7 guarantee band (flag) → CTA
B4  first workout cover (kept as proof-of-product, now after the offer)
B9  anti-avatar (unchanged)
B10 FAQ — billing/cancel items FIRST, within one scroll of the offer CTA
B11 close (unchanged) + sticky bar (now desktop too)
```

---

## Workstream A — analytics first (R11) · ~0.5 nap

Everything else is unfalsifiable without this; build it first, merge with the rest.

| Change | File | Detail |
|---|---|---|
| `useSectionView(name)` hook | `src/app/ujrakezdes/terv/useSectionView.ts` (new) | IntersectionObserver, fires once per mount at ≥50% visibility → `push("lx_ujrakezdes_section", { s: name })`. Attach to: plan_card, curve, startday, mechanism, alexa, offer, guarantee, faq, close. |
| Offer/curve/sticky events | `src/lib/track.ts` | `trackUjrakezdesSection(s)`, `trackUjrakezdesStickyView()`, `trackUjrakezdesStartDay(pick)`, `trackUjrakezdesLoaderDone()`. Follow the existing `lx_ujrakezdes_*` naming. |
| Wire the orphan | `terv/PlanWizard.tsx` | `trackUjrakezdesQuizStart()` (defined at `track.ts:186`, never called) fires on first question mount — closes the landing→quiz bounce blind spot. |
| Token-page flag | `[token]/page.tsx` → PlanWizard | reveal-view event gets `{ src: "email" }` when `initial` is set, so email-revisit traffic separates from fresh-quiz traffic in GA. |

**Acceptance:** GA4 DebugView shows section events in order on one scroll-through; no duplicate fires
on scroll-up; token page tags `src:email`.

---

## Workstream B — the reveal moment (R1–R4) · ~1 nap

### R1 · PlanBuild loader
- **New screen state** `"building"` in `PlanWizard` (`Screen` union + not in `ORDER` — it is a
  transition, not a step; Vissza never lands on it).
- Trigger: gate `submit()` success → `go("building")`; a 7–9 s sequence then `go("reveal")`.
  `/terv/[token]` and sessionStorage-resume **skip it** (resume already lands on gate; a re-submit
  replays it, which is acceptable).
- **Truthful steps only** — each line names a derivation `buildWeekPlan` actually does, echoing the
  user's answers (Buell & Norton: the effect dies when the labor isn't believable):
  ```
  copy.ts → BUILD.steps(a):
  1. "Szinted beállítása — {levelLabel}"            ✓
  2. "Heti {n} nap beosztása, pihenőnapokkal"        ✓
  3. "{care} — kímélő változatok kiválasztása"       ✓   (skip if care=none)
  4. "Fókusz: {focusLabel} — edzések sorrendje"      ✓
  5. "A terved összeállt."
  ```
- Implementation: CSS-only checkmark cadence (`animation-delay` ladder), one thin progress line
  88%→96% (feeds R2's story). `prefers-reduced-motion`: render the full checked list statically for
  1.5 s, then advance. No JS timers per step — one `setTimeout` total to `go("reveal")`.
- Fire `trackUjrakezdesLoaderDone()` on advance.

### R2 · Endowed-progress caption
- `copy.ts REVEAL.progress` → add `caption: "A terved 88%-ban kész — már csak az indulást válaszd."`
  rendered under the B0 bar (small, muted). Bar itself unchanged.

### R3 · HabitCurve (the centerpiece)
- **New component** `terv/HabitCurve.tsx` — pure inline SVG (~220×120 viewBox, responsive), no libs.
- **Data → shape:** asymptotic habit-strength curve over 8 weeks (Lally-shaped: steep first 3 weeks,
  flattening toward week 8), with **one deliberate dip around week 4–5** that recovers *above* its
  pre-dip level. X-axis: Hét 1…8 (dates from the chosen start day, see R4). Y-axis label:
  „szokáserő" — no numbers, never kg.
- **Milestone flags** on the path at workouts 1 · 5 · 10 · 15 · 30 (x-position = milestone/`trainingCount`
  weeks). The 10 flag says „10." plain, or „10. — garancia" only when `GUARANTEE_LIVE` (fixes the
  dangling-promise bug in the same stroke; apply the same conditional to `REVEAL.b1.milestones`).
- **The dip label** is the purple cow — render it as a first-class annotation, accent-colored:
  „kihagyott hét — nem nulláz". The two rules (`REVEAL.b3.rules`) move under the curve as its
  caption; B3 keeps only the „Ismerős?" paragraph.
- **Draw animation:** `stroke-dasharray/dashoffset` transition triggered once by the section
  observer (reuse `useSectionView`'s observer); ~1.6 s ease-out; flags fade in after. Reduced
  motion → static. Both themes: stroke/fill from existing `.lxu` CSS custom properties.
- Selftest: pure helper `curvePoints(trainingCount)` exported → assert monotonic-except-dip,
  dip recovers higher, milestones within x-range (`scripts/ujrakezdes-selftest.ts`).

### R4 · StartDayPick + first-workout line
- **New component** `terv/StartDayPick.tsx` under the curve: two radio-chips —
  „Ma este" · „Hétfőn ({date})" (next Monday via Budapest calendar; if today IS Monday → „Ma,
  hétfőn"). Default: the plan's existing `firstDayName` logic.
- Effect of picking: (1) curve x-axis dates re-anchor; (2) the first-workout line updates:
  „Első edzésed: {ma este|hétfő} · {mins} perc, eszköz nélkül." (absorbs B4's eyebrow/copy);
  (3) `sessionStorage lexfit_ujra_start`; (4) `trackUjrakezdesStartDay(pick)`.
- Display-only in this release (no schedule write-through — the app's cadence setup owns that
  post-purchase). B4's cover block stays, relocated after the offer as product proof.

**Acceptance (B):** loader plays once per gate submit, never on token page; curve renders identically
(sans replay glitches) on `/terv/[token]`; reduced-motion path verified; no CLS from the SVG
(fixed aspect-ratio box); selftest green.

---

## Workstream C — the offer block (R5–R7, R10) · ~1 nap

### R5 · Visual value stack + price presentation
- Restructure `RevealOffer`/B6 into: **stack rows** (each: mini cover chip using the `Cover`
  primitive family (`src/components/cards`) with the program's theme color + the existing `k`
  count + title) → sum line „Mindez az első héten:" → **490 Ft** big.
- **Billing timeline** (new small component, reused in rail + B6):
  „Ma: **490 Ft** → {date, +7 nap}-tól: **1 990 Ft / hét** · bármikor lemondható" — date from
  `nextChargeLabel` (`src/lib/pricing/renewal.ts`), amounts from `PRICES`.
- **Per-day framing on annual:** add `perDayHuf(role)` to `src/lib/pricing/display.ts`
  (`Math.round(39900/365)` → „109 Ft / nap"); annual card tag becomes
  „/ év · {perMonth} / hó · **{perDay} / nap**". Monthly/weekly cards unchanged (weekly's honesty
  line stays — R12). Annual keeps „legjobb ár" **computed** from the real −% (existing
  `annualSavingsPct`), no „Popular" badge anywhere, nothing preselected beyond the current
  week_intro entry role.
- CTA text unchanged („Kezdem — az első hét 490 Ft") — it already passes the benefit-CTA test.

### R6 · Cancel-anxiety line (directly under every CTA placement)
- `copy.ts REVEAL.offer.calm`: „A megújulás előtt e-mailben szólunk. Bármikor lemondható, két
  kattintás." Render under B2 CTA, rail CTA, close CTA (small, not muted-to-invisible).
- **Honesty gate:** verify the weekly day-5 reminder (F2.2, `emails/weekly-day5-reminder` +
  reminders cron) fires for the intro week's first renewal. If it does not, extend the cron to
  send it on intro day 5 **before** this copy ships. The promise must be mechanically true.

### R7 · Guarantee band placement (+ interim fix)
- Move the flag-gated B7 band to sit **between the tier cards and the CTA** (Funnelfox winning
  sequence), same `GUARANTEE_LIVE` gate, framed as beyond the 14-day statutory right.
- **Interim (ships regardless):** the „10. — garancia" milestone label becomes conditional
  (see R3) so the dark-guarantee state no longer references an unexplained promise.
- Owner dependency: ÁSZF clause signature flips `NEXT_PUBLIC_GUARANTEE_LIVE=1` — no code needed
  beyond what exists.

### R10 · No desktop CTA deserts
- Enable the existing sticky bar on desktop: lift the `≤1023px` media guard on `.u2-sticky`
  (restyle as a slim top-anchored bar ≥1024 to avoid covering content), driven by the SAME
  IntersectionObservers (visible after B2 scrolls out, hidden while close CTA on screen).
- FAQ reorder in `copy.ts`: billing/cancel items (Szüneteltethetem?, guarantee-when-live, new
  „Mikor és mennyit vonnak le?" item) first; equipment/program items after.

**Acceptance (C):** timeline dates correct across month boundaries (reuse `nextChargeLabel`
tests); stack renders with catalog outage (covers degrade to count chips — same fallback posture
as D0); desktop scroll-through always shows a visible CTA; no fake-badge / preselection anywhere
(GVH checklist in PR description).

---

## Workstream D — story & proof (R8, R9, R12) · ~0.5 nap

- **R8:** move the Alexa block above the offer in the DOM; photo at ~2× current size (asset exists,
  `next/image`); copy reordered to epiphany-bridge (past → gap → system), append cohort line:
  „A szeptemberi újrakezdők most kezdik az első hetüket." (true by construction — the offer is
  named Szeptemberi Újrakezdés; revisit wording in October).
- **R9:** treat the „1 200+ ember" line as a visual element (count + short row of the existing
  member-avatar placeholders only if consented photos exist — B5's constraint stands; otherwise
  count + „valódi tagok, valódi nappalik" microcopy). No fabricated faces, no stock.
- **R12 (guard, not work):** the honesty line, the no-deadline stance, and „Most nem? A terved
  így is a tiéd" survive every edit above — add a selftest assertion that `REVEAL.entry.honesty`
  and `close.later` remain non-empty so a future cleanup can't silently drop them.
- **Micro-fix:** the „0 eszköz" stat tile → „nincs eszköz" (or „0 Ft eszköz") so it reads as a
  benefit, not an empty state.

---

## QA / rollout

1. `npm run test:ujrakezdes` (extended: curve helper, milestone conditional, honesty-copy guards),
   `test:funnel`, `npx tsc --noEmit`, `npm run build`, eslint on touched files.
2. Manual matrix: fresh quiz (loader→reveal), token page from D0 email, sessionStorage resume,
   `prefers-reduced-motion`, 390px + 1024px + 1440px, dark/light, `GUARANTEE_LIVE` on AND off,
   FB-webview UA (breakout still intact — R5 must not touch `goCheckout`).
3. One commit-train to `main` → Vercel. No feature flag (council: one release; traffic is low and
   the token page must match the fresh page anyway).
4. **Measurement window:** 4 weeks. Primary: reveal→register. Godin tripwire: consent-checkbox
   rate, unsubscribe rate, refund rate — if conversion ↑ while these ↓, retreat to R1–R4/R6/R12.
5. Owner actions in parallel: ÁSZF clause (gates R7 + stronger D6 subject) · resume Meta spend
   after ship, optimization on InitiateCheckout.

**Estimate:** ~3 munkanap (A 0.5 · B 1 · C 1 · D 0.5) + QA sweep.
**Risks:** desktop grid rework around the moved Alexa block (contained: `.u2` grid areas);
loader timing feeling long on fast connections (cap 8 s, content-driven); curve legibility at
320px (min-width test in matrix).
