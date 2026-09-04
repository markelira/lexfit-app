# Offer v3 — DEV PLAN (Phase 1)

**Version:** 1.0 · 2026-09-04 · Author: Claude Code · Reviewer: Márk
**Source of truth:** `docs/hormozi/offer_v3.md` + the Claude Code Handoff (this repo's brief).
**Status:** survey complete · **all 8 decisions locked by Márk 2026-09-04 (§8)** · nothing implemented.
Phase 2 (`docs/offer-v3-implementation-plan.md` + build) starts on approval of this plan.

This document does what §8 of the handoff asks: it checks every assumption in the brief against the
actual code, states the architecture decisions, lists the file-by-file change tree, registers the
risks, defines the tests, sequences the work for Sep 6, and ends with the decisions Márk has now
locked (§8). Two of them left an owner dependency: the ÁSZF clause and the `goal`-step wording.

---

## 1. Repo survey findings

I read the landing page, the funnel, the pricing library, the withdrawal/refund path, the email
templates, the analytics layer, the seed data and the legal docs. Below is what the brief assumed
versus what is actually there. **Deviations are numbered D1…D14 and are referenced throughout the
rest of the plan.**

### 1.1 Confirmed as described

| Assumption | Reality |
|---|---|
| Pricing SoT is `src/lib/pricing/config.ts` | ✅ `week_intro 490 · week_std 1990 · month_std 5990 · annual_std 39900`, all env-overridable. Hard rule "no amount outside this file" is genuinely enforced in the code I read. |
| Display helpers exist | ✅ `src/lib/pricing/display.ts` — `formatHuf`, `perWeekHuf`, `annualSavingsPct`, `monthlyAnnualized`. `annualSavingsPct()` already computes **44**, and `39 900 / 12 = 3 325` exactly, so both §4.4 annual numbers are derivable — no hardcoding needed. |
| Landing is `src/components/landing/LandingPage.tsx` | ✅ 1 100 lines, client component, fed by a server shell (`src/app/page.tsx`, `revalidate = 3600`, Admin-SDK catalog read). |
| Onboarding is `src/app/onboarding/OnboardingV2.tsx` | ✅ Steps `welcome → goal → focus → level → days → time → env → obstacle → why → reveal → plan → account → pay`, embedded Stripe Checkout at `pay`. |
| Renewal transparency + consent | ✅ `EmbeddedPay.tsx` gates checkout on a combined J1/J2 consent checkbox recorded server-side. |
| Analytics layer is vendor-neutral | ✅ `src/lib/track.ts` pushes `lx_*` events to `window.dataLayer`; GTM only loads after consent, so events need no consent check of their own — but must carry no personal data. |
| No exclamation marks / no body-transformation promises in shipped landing copy | ✅ Spot-checked hero, FAQ, Alexa, pricing — clean. (One exception inside the funnel, see D13.) |

### 1.2 Deviations

**D1 — The funnel lives at `/register`, not `/onboarding`.**
`src/app/onboarding/page.tsx` is a permanent `redirect("/register")`; `src/app/register/page.tsx`
re-exports `OnboardingV2`. But `LandingPage.tsx:229` still has `const CTA_START = "/onboarding"`, so
**every CTA on the homepage takes a redirect hop**, and a Next.js server-component `redirect()` does
**not** preserve the query string. That silently breaks `?plan=` preselect *and* would break any UTM
that arrived on a CTA link. Fix: `CTA_START = "/register"`. (The funnel's internal `goto()` already
writes `/register?...` and deliberately preserves the whole query string.)

**D2 — `#valos` is not the finish-cards section.**
The surface map row "`#valos` finish cards | P4 | ≥1 male member card" points at the wrong id.
`id="valos"` (line 734) is the **"edzés, ahogy neked jó"** FeaturePanel (player video + adaptation
chips). The finish cards are in an **unlabelled** band at line 853 (`.finish-band` → `FinishExamples`).

**D2b — P4 is already satisfied.** `FinishExamples` ships 7 consented member photos, of which
**three are male (Kristóf, Ádám, Ákos) and Kristóf is the first card**. The only real gap is
accessibility: `<img alt="">` is empty (line 50). Change reduces to giving the cards meaningful alt
text — not sourcing a new photo.

**D3 — `#heted` is not the Journey.**
`id="heted"` (line 828) is the **WeekPicker** band ("Három nap is elég"). The `Journey` component —
the one that walks the real Start sessions in groups of five — is in a separate **unlabelled**
"FOUNDATION" band (~line 795), rendered only when `entry.sessions.length > 0`. The milestone strip
`1 · 5 · 10 · 15 · 30` describes the 30-workout sequence, so it belongs on the **Journey** band, not
on the WeekPicker. See Q4.

**D4 — The real section order differs from what the brief assumes, and `#gyik` is already before `#alexa`.**
Actual order today:

```
hero → #hogyan → #programok → [price-anchor, navy, no id] → #valos → [cast, no id]
     → [foundation/Journey, no id] → #heted → [finish-band, no id] → #kihivasok
     → #gyik → #alexa → #elofizetes (footer nested inside it)
```

Target order (offer_v3 §2.1): `… #alexa → #garancia → #elofizetes → #gyik → footer`. So the work is
not "insert two sections" — it is **insert two sections *and* move `#gyik` from before `#alexa` to
after `#elofizetes`**, which also means **lifting `<div className="foot">` (line 1041) out of the
`#elofizetes` band** so the footer stays last. That is a structural edit to the page's JSX spine, not
a copy edit.

**D5 — There is a fourth pricing surface the brief does not mention: the `price-anchor` band.**
Line 712, navy, `"A te árad" / 490 Ft / első hét` with a `CountUp` animation and a `#elofizetes`
jump link. It is a second, independent rendering of the same numbers. Offer v3 never mentions it. It
does not contradict v3 (it already says 490 → 1 990 + "bármikor lemondható"), but it is a fifth place
a forint amount is presented and must be kept consistent. See Q5.

**D6 — The pricing band's card presentation is the inverse of what §4.4 specifies.**
Today (`LandingPage.tsx:201` `PRICING`): order **Heti → Éves → Havi**, with **Éves** in the centre,
`featured`, badged **"Legnépszerűbb"**, and its primary number rendered as **Ft/week**
(`perWeekHuf`). §4.4 wants: **Heti ("Kipróbálom") → Havi (centre, "Legnépszerűbb") → Éves ("Legjobb
ár")**, with the annual card leading on **39 900 Ft / év** and 3 325 Ft/hó as the derived line. This
is a deliberate strategy reversal (steer to Havi, not Éves) and it also contradicts
`docs/pricing-strategy.md`'s "steer-to-annual CLV plan" recorded in project memory. Not a blocker —
§4.4 is newer and explicit — but worth stating out loud. Needs a new display helper `perMonthHuf()`.

**D7 — The funnel's pay step has its *own* plan presentation, in a third place.**
`src/components/onboarding/paywall.tsx` exports `PAYWALL_PLANS` (Heti badged **"Ajánlott indulás"**,
order Heti → Havi → Éves), consumed by both the funnel `plan`/`pay` steps **and** `/subscribe`. So
after this project there are three plan-presentation sources: `PRICING` (landing), `PAYWALL_PLANS`
(funnel + /subscribe), and the new `/arak`. §4.4 says "landing `#elofizetes` + `/arak`, one
component" — it does **not** ask me to unify the funnel's paywall. I propose keeping `PAYWALL_PLANS`
separate (it is a different medium: a radio list, not marketing cards) but sourcing both from one
copy module. See §2.2.

**D8 — The `days` step is 3/4/5/6, not 2/3/4.**
`src/app/onboarding/_mock.ts:75` — `counts: [3 kényelmes, 4 haladós, 5 ajánlott, 6 intenzív]`,
`recommended: 5`, `defaults: {3:[1,3,5], 4:[…], 5:[…], 6:[…]}`. The landing `WeekPicker` clamps to
`MIN = 3, MAX = 6`. The app's own default (`prefs.ts DEFAULT_PREFS.plan.weekdays`) is `[1,2,4,5,6]`
= five days.
Offer v3 §4.1/§2.2 asks for **"heti 2, 3 vagy 4 nap"** and options **"2 nap · 3 nap · 4 nap · Ahogy
jön — legyen rugalmas"**. That is **not a copy edit**: it changes the cadence domain, and it cascades
into `MOCK.days.defaults`, the `WeekPicker` clamps, the reveal's `paceLine` maths, `prefs.ts`
defaults, and `lib/week-progress` (which memory records as the mandated source for every weekly
indicator). It also has a **guarantee-maths consequence**: at 2 days/week, 10 workouts takes exactly
5 weeks — zero slack for one missed session. **This is Q1, a blocking question.**

**D9 — The grep-migration list (§7) is already almost clean, and the email half of it does not exist in code.**
Full sweep over `src/`, `emails/`, `seed/`, `scripts/`, `docs/*.md`:

| String | Hits |
|---|---|
| `12 990` | **0** |
| `szeptember 30` | **0** |
| `hat héten` | **0** |
| `12 edzés garancia` | **0** (one unrelated hit in `docs/kviz-helyzetjelentes.md`) |
| `10 hét` as a duration | **0** |
| `40 edzés` | 2: `src/app/onboarding/OnboardingV2.tsx:66` (a *comment forbidding* the claim) and `seed/source/prog-data.jsx:31` (a comment) |
| `40 vezetett` | 1: `seed/source/onb-data.jsx:82` — `"8 hetes Foundation program — 40 vezetett edzés"` |
| `alapító` | 6 — see D10 |

And critically: **`W12` / `W20` / `W40` / "day 42" exist only in `docs/hormozi/funnel_v2.md`.** There
is no milestone-email code to migrate. `emails/` has 26 templates and none of them is a W-series
workout-milestone mail; `src/app/api/cron/reminders/route.ts` fires day-5 weekly, annual nudge,
dunning, pause-resume, day-2 nudge and weekly recap — no workout-count milestones. Likewise the
"D6 subject" is a spec line in `funnel_v2.md`, not a shipped template (the quiz sequence in
`src/lib/quiz/sequence.ts` is E1…E6 + W1 at 36h/3d/6d/10d/14d/45d).
**Consequence: workstream E collapses from "repo-wide sweep" to two seed-file strings + a docs-copy
migration.** That is good news for the Saturday cut line.

**D10 — "remove `alapító`" as a grep-clean criterion would delete Alexa's own founder label.**
The 6 hits are: `AuthBrand.tsx:59` (alt text "Alexa, a LEXFIT alapítója"), `BrandPanel.tsx:44,130`
("Az alapító" eyebrow), `LandingPage.tsx:968` ("Az alapító" eyebrow above the pull quote),
`config.ts:142` (`month_founder` nickname "Havi - alapító zárolás"), plus two docs. §7 says
"*remove `alapító` (founder price stays in config as dormant role; no UI reference)*" — i.e. the
intent is clearly **the founder *price***, not Alexa-as-founder. But §1's success criterion says the
literal string must appear nowhere in `src/`. I read the intent and propose: no UI reference to a
**founder price**; `Az alapító` (Alexa) and the `config.ts` nickname stay. **Q6 confirms this.**

**D11 — The elállási gomb is currently reachable from nowhere.**
Hard rule 8 says it "must remain reachable from `/`, `/arak`, and the app footer". Reality:
`POST /api/withdrawal` exists and is correct (releases the managing schedule first, refunds each paid
invoice's *unused* portion, cancels, logs `withdrawal_requested`, notifies admin, sends the durable
confirmation). `src/lib/billing.ts:71` exports `requestWithdrawal()`. **Nothing in `src/` calls it** —
grep across all `.tsx` returns zero. `/app/membership` offers pause / downgrade / cancel, but not
withdrawal. So the rule cannot be met by leaving things alone; a button has to be built. **Q3.**

**D12 — ÁSZF §10.3 currently states the opposite of the new guarantee's framing.**
`docs/legal/aszf.md:138` (rendered at `/aszf` via `LegalDoc`): *"A Szolgáltató ezt a visszatérítést
nem »pénzvisszafizetési garanciaként« hirdeti: ez a Fogyasztót jogszabály alapján megillető jog."*
That sentence is about the **statutory 14-day** refund and is correct — but from Sep 6 the site will
also advertise a **voluntary commercial guarantee** (10 edzés / 5 hét / full refund of fees paid).
Under Hungarian law that is a separate `kereskedelmi garancia`, which is fine — **but it must be
written into the ÁSZF**, otherwise we are advertising a contractual promise that our own T&C does not
contain, and §10.3 reads as a contradiction of the homepage. This is legal text and an owner call.
**Q2, blocking for the guarantee copy going live.**

**D13 — The `goal` step contains weight-loss vocabulary that hard rule 2 forbids.**
`_mock.ts:42` — `"Lefogyni, formálódni" / "Égessünk, formáljunk - fokozatosan, fenntarthatóan."`, and
the matching reveal outcome `forma: "Formálódsz - fokozatosan, fenntarthatóan."` Rule 3 says do not
rewrite Hungarian copy; rule 2 says no weight-loss vocabulary in strings I touch. I am not asked to
touch the `goal` step, so my default is **leave it and flag it**. Noted here so it is a decision, not
an oversight.

**D14 — Landing copy is hardcoded, not Firestore-sourced.**
The brief's §8.4 risk ("landing copy sourced from Firestore catalog → migration script needed") does
not apply. `FAQ` (line 155), `PRICING` (201), all headings and body copy are TSX literals. Firestore
supplies only **programs / workouts / challenges / filter taxonomy / fbGroupUrl** via
`landing-catalog.server.ts`. **No copy migration script is needed.** The corollary: `#programok`
ordering ("7 napos kezdő first, Esti rutinok within the first 4 on mobile") is driven by the
`order` field on `programs/{slug}` docs and is sorted in `landing-catalog.server.ts:52` — it is an
**/admin content change**, not code. Same for the §4.4 "what's included" program names: they are
authored content, and hardcoding them into the pricing band risks drift. See Q5/§4-R3.

---

## 2. Architecture decisions

### 2.1 Where the §4 copy lives — one module, one rule

New file `src/components/landing/offer-copy.ts` (plain TS, no JSX except where a `ReactNode` is
genuinely needed):

```
export const HERO      = { … }   // §4.1
export const ISMEROS   = { … }   // §4.2
export const GARANCIA  = { … }   // §4.3  ← consumed by landing, /arak AND the pay step
export const PRICING_BAND = { … }// §4.4  ← banner, intro, 3 cards, shared/value/hesitation lines, included list
export const FAQ_NEW   = [ … ]   // §4.5  ← also feeds the FAQPage JSON-LD, verbatim
```

**The single-source rule:** any string that appears on more than one surface (guarantee, plan
names/badges/CTAs, renewal disclosure) is defined **once here** and imported. Strings that appear on
exactly one surface stay inline next to their markup, matching how the file reads today. Amounts are
**never** in this module — every card interpolates `formatHuf(PRICES.…)` at render, per hard rule 6.

The existing `FAQ` const in `LandingPage.tsx` moves into this module unchanged and is concatenated
with `FAQ_NEW`, so `#gyik`, the `/arak` FAQ subset, and the JSON-LD all walk one array.

The funnel's `§4.6` strings stay in `src/app/onboarding/_mock.ts` (that is already the funnel's copy
module) **except** the guarantee short form and the renewal disclosure, which import from
`offer-copy.ts` so the promise is worded identically at the paywall and on the page.

### 2.2 `PricingBand` extraction

New `src/components/landing/PricingBand.tsx`, a client component:

```tsx
<PricingBand surface="landing" | "arak" />
```

- Owns: banner, intro line, the three cards, the shared/value/hesitation lines, the included list,
  the trust row, the "Kinek nem való?" block and the elállási-gomb slot.
- `surface` controls only two things: which analytics surface string is emitted, and whether the
  wrapping band chrome (`.band-sage`, wordmark, eyebrow) is rendered — `/arak` gets a page header
  instead of a band header.
- Cards become **`<Link href={planHref(role)}>`** where `planHref` = `` `/register?plan=${role}` ``
  (D1 fix folded in). Amounts from `PRICES`, formatting from `display.ts`, `perMonthHuf()` added.
- The footer (`.foot`) does **not** move into `PricingBand` — it is page chrome, and D4 requires it
  to be lifted out of `#elofizetes` anyway. It becomes a sibling section on `/` and a small shared
  `<LandingFooter />` reused by `/arak`.
- CSS: new rules appended to `src/app/landing.css` under `.lxl` (no new stylesheet, no Tailwind).
  `/arak` imports `landing.css` the same way `src/app/page.tsx` does.

### 2.3 `?plan=` preselect

A pure helper so it is testable without a browser:

```ts
// src/lib/pricing/preselect.ts
export function planFromParam(raw: string | null): CheckoutRole | null
```

It accepts only `week_intro | month_std | annual_std` (validated through the existing
`isRecurringRole`), returns `null` for anything else — no unknown string can reach Stripe.

Wiring in `OnboardingV2`:
- `initialAnswers()` reads `?plan=` **once, at mount**, and seeds `answers.plan`. It wins over
  `INITIAL.plan` but **not** over an explicit user choice later (the funnel already treats
  `answers.plan` as user state, and `plan` is deliberately not persisted in the draft — see
  `funnelFromDraft`, "plan isn't persisted in the draft yet"; I keep that behaviour).
- `goto()` already preserves the whole query string, so `?plan=` survives every step transition and
  the resume path — nothing else to do.
- Landing/`/arak` cards link to `/register?plan=<role>` directly. They do **not** deep-link to
  `?q=pay`: hard rule / §6 says nothing may shorten or skip the path to the plan, and a cold visitor
  landing on a Stripe form has answered no questions and has no account.

### 2.4 The `guarantee_10` refund

Modelled directly on the existing withdrawal route, which already solved the hard parts (schedule
release before money moves, per-invoice refund targets across Stripe API versions, event log, admin
notify, durable-medium confirmation email).

Differences from withdrawal:

| | Withdrawal (J2, statutory) | Guarantee (voluntary) |
|---|---|---|
| Trigger | member, self-serve | **admin only** (`isAdmin` + `verifyRequest`), v1 |
| Window | ≤ 14 days from `startedAt` | first 10 workouts completed within 5 weeks |
| Amount | **unused** portion per invoice | **full** `amount_paid` of every paid invoice to date |
| Event | `withdrawal_requested` | `guarantee_refund_requested` / `guarantee_refund_approved` |

New pieces:
- `src/lib/pricing/refund.ts` gains `fullRefundTotalMinor(periods)` (pure, sums `amountPaid`) and
  `guaranteeEligibility({ completed, startedAt, now })` → `{ eligible, completedCount, windowEndsAt }`.
  Pure and unit-testable; window length and required count come from **new config knobs**
  `GUARANTEE = { requiredWorkouts: envInt(…, 10), windowDays: envInt(…, 35) }` in `config.ts`, so no
  count/window is hardcoded (hard rule 6 applies to counts, not just amounts).
- Eligibility data already exists: `users/{uid}/progress/state.completed[]` is `{ code, at }` with
  `at = YYYY-MM-DD`, and the admin member API (`/api/admin/users/[uid]`) already reads both that doc
  and `subscriptions/{uid}`.
- New route `src/app/api/admin/guarantee-refund/route.ts` (POST `{ uid, note? }`).
  **Idempotency, three layers:** (1) `milestoneOnce(uid, "guarantee_10_refund")` claims the action
  before any money moves, `milestoneClear` rolls it back only on a *pre-Stripe* failure; (2) each
  `stripe.refunds.create` is sent with an `idempotencyKey` of `guar_${uid}_${invoice.id}`; (3) the
  route skips invoices that already carry a refund (`inv.charge.refunded` / non-zero
  `amount_refunded`). A partial failure therefore leaves a resumable state, never a double refund.
- Audit: `logEvent("guarantee_refund_approved", { uid, props: { plan, feesRefundedMinor, invoiceIds, adminEmail } })`
  plus `notifyAdmin`. `PricingEvent` union gains the two new names.
- Sets `status: "CANCELED"`, `accessUntil: now`, `cancelReason: "guarantee_10"` on the subscription
  doc — same shape the withdrawal route writes, so `hasAccessFromData` needs no change.
- Admin UI: a "10 edzés garancia — visszatérítés" panel on `/admin/members/[uid]` showing
  `completedCount / 10`, the window end date, an eligibility verdict, and a confirm-gated button.
  **If Saturday gets tight this ships API-only** and Márk triggers it with a signed request; the UI
  lands Sunday (see §6).

**No new Stripe objects are created** (refunds against existing charges only) — but per §10 this is
still a Stripe API call I have not made before, so it is flagged in Q7.

### 2.5 Analytics

Following the existing convention (`lx_` prefix, dataLayer, no personal data, no consent check
needed because GTM is consent-gated). Mapping to the brief's names:

| Brief | Emitted | Params |
|---|---|---|
| `garancia_view` | `lx_garancia_view` | `surface: "landing" \| "arak" \| "pay"` |
| `pricing_plan_select` | `lx_pricing_plan_select` | `plan`, `surface`, `value`, `currency` (from `PRICES`, like `trackCheckoutStart` already does) |
| `arak_view` | `lx_arak_view` | `ref` (document.referrer host only — never a full URL with query) |
| `onb_whisper_view` | `lx_onb_whisper_view` | — |
| `guarantee_refund_requested/_approved` | server-side `logEvent` only | as §2.4 |

Naming is within my §10 decision rights ("event plumbing"); the `lx_` prefix is required for the GTM
container to pick them up. `#garancia` viewport tracking reuses the file's existing `useInView` hook
at `threshold: 0.5`, fired once per session via `sessionStorage`.

### 2.6 SEO / `/arak`

- `src/app/arak/page.tsx` — server component, `revalidate = 3600` (same pattern as `/`), reads
  `loadLandingCatalog()` for the included-list counts, own `metadata` (title/description/canonical),
  added to `src/app/sitemap.ts` at priority 0.9.
- FAQPage JSON-LD as a `<script type="application/ld+json">` rendered **server-side** from the same
  `FAQ` array (`/` gets all entries, `/arak` the garancia/lemondás/szünet subset). Verbatim §4.5
  text, so the rich result and the page cannot diverge.
- Nav: `#elofizetes` in `NAV_LINKS`/hero nav becomes `Árak → /arak`? **No** — the sticky nav is a
  scroll-spy over same-page anchors and a cross-page link would break `active` state. Decision:
  keep `#elofizetes` as the in-page anchor, add `#garancia` to `NAV_LINKS`, and put the `/arak` link
  in the **hero nav** and the **footer** (both already contain cross-page links to `/login`,
  `/aszf` etc.).
- CLS: both new sections are text-only (no media), so nothing to reserve. The one real CLS risk is
  the `Rise` reveal wrapper — it animates opacity/transform only, which does not contribute to CLS.

---

## 3. Component / route change tree

Grouped by workstream. `NEW` = create, `MOD` = modify.

### (A) PricingBand + `/arak`
- `NEW src/components/landing/PricingBand.tsx` — §2.2
- `NEW src/components/landing/LandingFooter.tsx` — extracted from `LandingPage.tsx:1041`
- `NEW src/app/arak/page.tsx` — server shell, metadata, JSON-LD, `revalidate = 3600`
- `NEW src/lib/pricing/preselect.ts` — `planFromParam`
- `MOD src/lib/pricing/display.ts` — add `perMonthHuf()`
- `MOD src/components/landing/LandingPage.tsx` — delete the `PRICING` const (201–228) and the
  `#elofizetes` JSX (1004–1040); render `<PricingBand surface="landing" />`; lift the footer out
- `MOD src/app/sitemap.ts` — add `/arak`
- `MOD src/app/landing.css` — `/arak` page-header rules, `#garancia`/`#ismeros` blocks, card badge
  variants for "Kipróbálom" / "Legjobb ár"

### (B) Landing restructure
- `NEW src/components/landing/offer-copy.ts` — §2.1
- `MOD src/components/landing/LandingPage.tsx`
  - hero copy + chips + CTA label (§4.1) — lines ~540–560
  - `CTA_START = "/register"` (line 229) — **D1**
  - `NEW #ismeros` section above `#hogyan` (before line 568)
  - `#hogyan` three-step copy (§5 row) — lines ~588–612
  - `#kihivasok` headline + weekly badge — lines ~891–900
  - `#alexa` extra line — after line 1000
  - `NEW #garancia` between `#alexa` and `#elofizetes`
  - **move `#gyik` (934–950) to after `#elofizetes`**, footer last — **D4**
  - milestone strip on the Journey band — **D3**, pending Q4
  - `FinishExamples` alt text — **D2b**
  - `NAV_LINKS` + hero nav: add `#garancia`, add `/arak`
- `MOD src/components/finish/FinishExamples.tsx` — alt text per card
- `MOD src/components/landing/WeekPicker.tsx` — `MIN`/`MAX` **only if Q1 answers 2–4**

### (C) Onboarding edits
- `MOD src/app/onboarding/_mock.ts` — `days` helper + option copy (pending Q1), `env`/`focus`/
  `obstacle` care helpers, `plan` line, reveal milestone labels
- `MOD src/app/onboarding/OnboardingV2.tsx`
  - `?plan=` seed in `initialAnswers()`
  - Whisper after `days` + `lx_onb_whisper_view`
  - milestone strip `1 · 5 · 10 · 15 · 30` on `reveal`
  - guarantee short form **above** the plan selector on `pay`
- `MOD src/components/onboarding/EmbeddedPay.tsx` — per-plan renewal disclosure with next-charge
  date, trust row (Stripe · e-számla · 14 napos elállás), under-CTA cancel line
- `MOD src/components/onboarding/paywall.tsx` — plan `sub` lines sourced from `offer-copy.ts`
- `MOD src/app/onboarding/onbv2.css` — milestone strip + guarantee box styles

### (D) Guarantee refund path
- `MOD src/lib/pricing/config.ts` — `GUARANTEE` knobs
- `MOD src/lib/pricing/refund.ts` — `fullRefundTotalMinor`, `guaranteeEligibility`
- `MOD src/lib/pricing/events.ts` — two new `PricingEvent` names
- `NEW src/app/api/admin/guarantee-refund/route.ts`
- `MOD src/app/api/admin/users/[uid]/route.ts` — return the eligibility verdict
- `MOD src/app/admin/members/[uid]/…` — the refund panel (Sunday if needed)
- `NEW emails/guarantee-refund-confirm.tsx` + `MOD src/lib/mailer.ts` — durable-medium confirmation,
  same pattern as `withdrawal-confirm`

### (E) Grep migrations + emails (much smaller than the brief assumed — D9)
- `MOD seed/source/onb-data.jsx:82` — `"8 hetes Foundation program — 40 vezetett edzés"` → 30-edzés,
  tempo phrasing
- `MOD seed/source/prog-data.jsx:31` — comment
- `MOD src/app/onboarding/OnboardingV2.tsx:66` — comment (the forbidden-claims note itself)
- `MOD docs/hormozi/funnel_v2.md` — W12→W10, W20→W15, W40→W30, M2 day 42→35 with `<10`, D6 subject,
  cut D10; `MOD docs/hormozi/lead_magnet_v2.md` per §6
- `MOD docs/legal/aszf.md` — new voluntary-guarantee clause **(blocked on Q2)**

### (F) SEO / schema
- `NEW src/components/landing/FaqJsonLd.tsx` (server component)
- `MOD src/app/page.tsx` + `src/app/arak/page.tsx` — render it; `/arak` metadata

### (G) Analytics
- `MOD src/lib/track.ts` — four new `lx_*` emitters (§2.5)
- `MOD PricingBand.tsx` / `LandingPage.tsx` / `EmbeddedPay.tsx` — call sites

### (H) Withdrawal reachability — **new workstream, not in the brief** (D11, pending Q3)
- `NEW src/components/WithdrawalButton.tsx` — calls the existing `requestWithdrawal()`,
  confirm-gated, shows the refunded amount
- `MOD` footer (`/`, `/arak`) — a link to it; `MOD src/app/app/membership/page.tsx` — the button

---

## 4. Risk register

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | **The guarantee is advertised before the ÁSZF contains it** (D12). §10.3 currently says we do *not* advertise a money-back guarantee. | Legal / UCP exposure on the highest-traffic day of the launch. | Q2 to Márk **now**. Ship order: ÁSZF clause merges *before or with* the `#garancia` PR. If Q2 is unanswered by Saturday, ship `#garancia` copy behind an env flag and the rest of the page without it — the pricing band still carries "bármikor lemondható" and the statutory elállás. |
| R2 | **`days` domain change (D8)** touches plan generation, WeekPicker, reveal maths, `prefs.ts`, `week-progress`. | A wrong answer here breaks the plan every member gets, silently. | Q1 blocks workstream C's `days` edit only. Everything else in C proceeds. If Q1 says "keep 3–6", the hero chip copy must change instead (§4.1 says 2–4) — that is a §4-copy deviation and needs Márk's nod either way. |
| R3 | **The §4.4 "what's included" list names 8 programs with counts** that must exist in prod Firestore with those names. | The page makes a checkable promise the catalog may not keep. | Verify against prod `/admin` before the pricing PR merges. Render the counts from `catalog.counts` where the shape allows; keep the names as authored copy but treat any mismatch as a content task for Márk, not a code change. |
| R4 | **Stripe refund partial failure** mid-loop (invoice 3 of 5). | Member half-refunded, subscription state ambiguous. | Three-layer idempotency (§2.4): milestone claim → per-invoice `idempotencyKey` → skip-already-refunded. Route returns per-invoice results; re-running is safe and resumes. Schedule release happens *before* any money moves, exactly as the withdrawal route does. |
| R5 | **`#gyik` relocation + footer lift (D4)** is the riskiest edit in workstream B — it re-parents JSX across two band wrappers with scoped CSS. | A half-restructured `/` in production. | Do it as its own commit with a visual check at 3 viewports; `.band-cream`/`.band-sage` alternation must still read correctly. Rollback = revert one commit. Never deploy B mid-way (§9.4). |
| R6 | **Three plan-presentation sources (D6/D7)** drift: landing says "Legnépszerűbb: Havi", the funnel's paywall says "Ajánlott indulás: Heti". | A visitor who clicks the Havi card lands on a paywall recommending Heti — the exact inconsistency §6 warns about. | Route both through `offer-copy.ts`. `?plan=` preselect makes the funnel *open on the card they clicked*, which resolves most of it. The residual badge mismatch is Q5. |
| R7 | **CLS / Lighthouse ≥ 90** regression from two new sections plus a taller page. | Fails a stated success criterion. | Both new sections are text-only. Measure before/after on `/` and `/arak` with mobile throttling; the LCP image (`hero-alexa-cover.jpg`, `priority`) is untouched. `/arak` is a short page and should score higher than `/`. |
| R8 | **`?plan=` lost to the `/onboarding` redirect (D1)** if any CTA is missed. | Preselect silently no-ops; the acceptance item looks passed in code review but fails in QA. | Fix `CTA_START` (`LandingPage.tsx:229`). The other five `"/onboarding"` literals are **intentional and stay**: `AuthScreen.tsx:82` and `Protected.tsx:88` are post-auth redirects, and `src/lib/funnel.ts` is the routing truth table covered by `test:funnel` — so the PR check is "no *marketing CTA* points at `/onboarding`", not a blanket grep. Test `planFromParam` in the self-test suite and walk the real URL in the mobile QA script. |

---

## 5. Test strategy

**What exists** (`npm run test:*`, plain assertion scripts via `tsx`, no test framework — I will not
add one):
- `test:pricing` (`scripts/pricing-selftest.ts`) — entitlement matrix, Budapest day/hour, doc-id
  conventions, `formatHuf`/`perWeekHuf`/`annualSavingsPct`, `unusedFraction`/`computeRefundMinor`,
  earning + offer rules.
- `test:funnel`, `test:onboarding-draft`, `test:quiz` — funnel rules, draft round-trip, quiz sequence.
- `scripts/render-email-previews.ts` renders all templates with sample data.

**What I add:**

| Test | Where | Asserts |
|---|---|---|
| `perMonthHuf` | `pricing-selftest.ts` | `39 900 → 3 325`; `annualSavingsPct() === 44`; both formatted with the non-breaking-space grouping (guards the hydration bug the file already documents) |
| `planFromParam` | `pricing-selftest.ts` | the 3 valid roles round-trip; `week_oneoff`, `annual_earned`, `"free"`, `""`, `null`, `"../admin"` all → `null` |
| `guaranteeEligibility` | `pricing-selftest.ts` | 9 completions → not eligible; 10 → eligible; 10 where the 10th falls on day 36 → not eligible; day-35 boundary inclusive; duplicate codes counted once; empty/missing progress doc → not eligible, no throw |
| `fullRefundTotalMinor` | `pricing-selftest.ts` | full sum ≠ pro-rata; zero-invoice case → 0 |
| Refund idempotency | `pricing-selftest.ts` | pure part only: given a list of invoices where 2 are already refunded, the planner returns only the 3 unrefunded ones and a stable `idempotencyKey` per invoice |
| FAQ / JSON-LD validity | new `scripts/schema-selftest.ts` (wired to `test:pricing`'s runner style) | every FAQ entry has non-empty `q`/`a`; the emitted JSON-LD parses and matches FAQPage shape; **no `!` in any §4 string** — a cheap machine check of hard rule 1 across `offer-copy.ts` |
| Grep-clean | shell step in the PR checklist | the six §1 strings return zero hits in `src/`, `emails/`, `seed/` |

Manual (no harness exists for these): Lighthouse mobile on `/` and `/arak`; the FB in-app-browser
walkthrough in §9.3 of the implementation plan.

---

## 6. Sequencing for Sep 6

Today is **Thu Sep 4**. Ads go live **Sun Sep 7**.

**Saturday minimum (must be live Sep 6):**

1. **E** — the two seed strings + comments. ~20 min, zero risk, unblocks the grep criterion.
2. **B1** — hero copy/chips/CTA + `CTA_START = "/register"` (D1). The D1 fix is the single
   highest-value line in this project: it is currently costing a redirect on every ad click.
3. **B2** — `#ismeros`, `#kihivasok`, `#alexa`, `#hogyan` copy. Additive, low risk.
4. **B3** — `#garancia` section, **built behind an env flag** (Q3b). Ships dark; flips the moment
   Márk's ÁSZF clause lands. Same for the pay-step guarantee box in C1.
5. **A1** — `PricingBand` extraction + §4.4 copy, rendered on `/` only. `/arak` not required Saturday.
6. **B4** — the `#gyik` move + footer lift (R5). Do it last on Saturday, on its own commit, so it can
   be reverted without touching anything else.
7. **C1** — pay-step guarantee box + renewal disclosure + trust row + under-CTA line.
8. **G** — the four analytics events (cheap, and Sunday's ad spend is unmeasurable without
   `lx_pricing_plan_select`).

**Sunday–Monday:**

9. **A2** — `/arak` route + nav/footer links + sitemap.
10. **F** — FAQ JSON-LD on both surfaces.
11. **C2** — `?plan=` preselect, `days` copy (Q1), Whisper, `reveal` milestone strip.
12. **D** — guarantee refund: **API + tests Saturday-night if time allows, admin UI Sunday**. Nothing
    in the offer breaks without the UI — the guarantee promises "egy e-mail elég", and the first
    possible claim is 10 workouts away, i.e. **≥ 2 weeks after launch**. This is the safest thing to
    push right.
13. **H** — withdrawal button (Q3). Rule 8 says it must be reachable; it currently isn't, so this is
    a pre-existing gap, not a regression this project introduces. I recommend Sunday, not Saturday.

**Cut line:** if Saturday runs short, cut in this order — D (whole workstream, per above), then F,
then A2. **Do not cut** B1's `CTA_START` fix, the pricing band, or C1: those three are what the ad
spend lands on. Per §10 I will ask before cutting anything from items 1–8.

---

## 7. Effort estimate

| WS | Scope | Size | Note |
|---|---|---|---|
| A | PricingBand + `/arak` + footer extraction + `perMonthHuf` + preselect helper | **L** | The extraction is mechanical; `/arak` is a thin shell over it |
| B | Landing restructure (2 new sections, 5 copy edits, `#gyik` move, footer lift, nav) | **L** | R5 is the only hard part |
| C | Onboarding copy + preselect + Whisper + milestone strip + pay-step guarantee/renewal + days domain 3–6→2–4 + `PAYWALL_PLANS` badge | **L** | Q1 confirmed the days change, so this is now the largest single workstream. Q7 extends it to `/subscribe`. |
| D | Guarantee refund (config, pure maths, admin route, email, admin panel) | **M** | Pure parts are quick; the Stripe loop is a careful copy of a route that already works |
| E | Grep migrations + docs/email-copy migration | **S** | D9 — far smaller than the brief assumed |
| F | JSON-LD + `/arak` metadata + sitemap | **S** | |
| G | 4 analytics events + call sites | **S** | |
| H | Withdrawal button (new, D11) | **S** | Backend already exists and is correct |

---

## 8. Decisions — LOCKED 2026-09-04 (Márk)

All eight questions answered. Recorded verbatim so Phase 2 needs no re-litigation.

| # | Question | **Decision** |
|---|---|---|
| Q1 | `days` cadence domain (D8) | **Move to 2 / 3 / 4 + "Ahogy jön — legyen rugalmas"**, per §4 verbatim. "Ahogy jön" maps to **3 days, no fixed weekdays**; the reveal shows "rugalmas" instead of a weekday legend. |
| Q2 | `GUARANTEE.windowDays` | **35 days. Copy = reality** — we enforce exactly what we advertise. No hidden grace. |
| Q3 | ÁSZF guarantee clause (D12) | **Márk supplies the text.** ⛔ Blocking dependency. |
| Q3b | If the clause misses Saturday | **Build `#garancia` gated behind an env flag**; flip when the text lands. No rebuild, no redeploy of the rest. |
| Q4 | Milestone strip placement (D3) | **On the Journey band** (it renders the real 30-session sequence). The band gains an id; `#heted` keeps its cadence job. |
| Q5 | Elállási gomb (D11) | **Build it — ships Sunday.** Footer link on `/` and `/arak`, plus a row in `/app/membership`. |
| Q6 | `alapító` (D10) | **Strip the literal string everywhere.** Landing + BrandPanel eyebrows **deleted** (no substitute — the pull-quote and her story carry it). AuthBrand alt text → *"Alexa, a LEXFIT edzője"*. |
| Q6b | `config.ts:142` nickname | **Rename it, and re-run `seed:stripe`** so Stripe agrees. ✅ This is the project's one authorised live Stripe write (nickname metadata only; `lookup_key` unchanged). |
| Q7 | Funnel paywall badge (D7) | **Match the landing — Havi = "Legnépszerűbb"** in `PAYWALL_PLANS`. Note: this also changes **`/subscribe`**, which shares the constant. |
| Q8 | Weight-loss copy in `goal` (D13) | **In scope — Márk supplies the wording.** ⛔ Blocking dependency. The `forma` goal key stays; only the strings move (option label + sub, and the reveal `forma` outcome). |

### 8.1 Consequences that change §3, §6 and §7

1. **Workstream C grows M → L.** Q1 makes the days change real: `MOCK.days.counts`/`defaults`/
   `recommended`, `WeekPicker` `MIN`/`MAX` (3–6 → 2–4), `prefs.ts` `DEFAULT_PREFS.plan.weekdays`
   (currently `[1,2,4,5,6]` = five days — now out of domain), the reveal `paceLine` maths, and
   anything deriving from `lib/week-progress`. A non-numeric fourth option also means `days` must
   tolerate a `flexible` marker alongside its count — that is a type change in `FunnelAnswers` and
   `DraftAnswers`, so `test:onboarding-draft` gains a round-trip case.
2. **Q2 + Q1 interact and the result is tight.** At 2 days/week, 10 workouts is *exactly* 35 days.
   The guarantee is honest but unforgiving at the lowest cadence, and "Ahogy jön" users have no
   guaranteed cadence at all. `guaranteeEligibility` must therefore be exact on the day-35 boundary
   (inclusive) — that is now the highest-value assertion in the new test set.
3. **Two owner dependencies are on the critical path**, both needing Márk's text: the ÁSZF clause
   (Q3) and the `goal`-step wording (Q8). Neither blocks anything else — `#garancia` builds gated,
   and the `goal` strings are a two-line swap whenever they arrive.
4. **Workstream B gains three small deletions** (Q6): two eyebrows removed, one alt text reworded.
5. **Workstream C gains a `/subscribe` blast radius** (Q7) — the badge change is not funnel-only.
6. **A live Stripe write is now authorised** (Q6b). I will run `seed:stripe` as its own deliberate
   step, not folded into another PR, and verify with `npm run audit:stripe` after.
7. **§7's grep list gains `alapító` as a true zero-hit criterion** across `src/` — achievable now
   that Q6/Q6b removed the two legitimate exceptions.

### 8.2 Decided by default, not asked (D5)

The **`price-anchor` band** (`LandingPage.tsx:712`, the navy "A te árad / 490 Ft" moment) **stays
unchanged**. It is already consistent with offer v3 — 490 → 1 990, "bármikor lemondható" — and
leaving it alone is the option with zero §4-copy deviation. Flagging it here rather than silently
skipping it. Say the word if you want it restyled to match the new band.

## 9. What I am deciding myself (per §10)

Recorded here so nothing is a surprise: component naming and file placement (§2.1–2.3); CSS appended
to `landing.css`/`onbv2.css` under existing scopes, no new stylesheet; the `lx_` event prefix and
parameter shapes (§2.5); JSON-LD as a server-rendered `<script>` fed from the same FAQ array; the
copy-constant architecture (`offer-copy.ts` + the single-source rule); assertion-script tests in the
existing style rather than a new framework; the `#garancia` in-view threshold and once-per-session
firing; and minor responsive layout choices for the two new sections.

---

*Next step: Márk approves this plan, then Phase 2 produces `docs/offer-v3-implementation-plan.md` —
PR-by-PR, in the §6 order — and execution begins.*

**Waiting on Márk (neither blocks the rest of the build):**
1. **ÁSZF voluntary-guarantee clause** — `#garancia` and the pay-step box build gated until it lands.
2. **`goal`-step replacement wording** — the `forma` option label + sub, and the reveal `forma`
   outcome line. Two-line swap whenever it arrives.
