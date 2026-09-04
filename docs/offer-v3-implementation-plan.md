# Offer v3 — IMPLEMENTATION PLAN (Phase 2)

**Version:** 1.0 · 2026-09-04 · Branch: `offer-v3` · Target: live Sep 6–7
**Prerequisite reading:** `docs/offer-v3-dev-plan.md` — §1.2 (the 14 deviations) and §8 (the locked
decisions). This document does not repeat them; it turns them into PRs.

Copy blocks are cited by their § number in the handoff (`§4.1`…`§4.6`) and pasted **verbatim** —
never retyped from memory, never "improved". Amounts always come from `PRICES` via `display.ts`.

---

## 0. PR map

Order follows dev-plan §6 (E → B → C → A → D → G → F), interleaved so that `/` is never left
half-restructured (§4 below). Each PR is one commit on `offer-v3`, revertible in isolation.

| PR | WS | Title | Size | Ships |
|---|---|---|---|---|
| 1 | E | Number migrations (30 edzés, tempo phrasing) | S | Sat |
| 2 | B | Hero copy + `CTA_START` → `/register` | S | Sat |
| 3 | B | `#ismeros` + `#hogyan`/`#kihivasok`/`#alexa` copy + `alapító` strip | M | Sat |
| 4 | A | `PricingBand` extraction + §4.4 copy + footer lift | L | Sat |
| 5 | B | `#garancia` (env-gated) + `#gyik` relocation | M | Sat |
| 6 | C | Pay-step: guarantee box, renewal disclosure, trust row, badge | M | Sat |
| 7 | G | Analytics events | S | Sat |
| 8 | C | `?plan=` preselect | S | Sun |
| 9 | C | Days domain 3–6 → 2–4 + Whisper + reveal milestone strip | L | Sun |
| 10 | A | `/arak` route | M | Sun |
| 11 | F | FAQPage JSON-LD | S | Sun |
| 12 | D | Guarantee refund (config + maths + admin API + email) | L | Sun |
| 13 | D | Guarantee refund admin UI | M | Sun |
| 14 | H | Withdrawal button | M | Sun |
| 15 | — | Stripe nickname rename + `seed:stripe` re-run | S | Sun, **manual** |

**Owner-blocked, built but dark:** PR5's `#garancia` and PR6's guarantee box render only when
`NEXT_PUBLIC_GUARANTEE_LIVE=1`. Flipping that env var in Vercel is the entire release step once the
ÁSZF clause lands. PR9 carries a `// COPY-REVIEW` placeholder for the `goal` step until Márk's
wording arrives — **the placeholder is the existing string, unchanged**, so nothing regresses.

---

## 1. PR detail

### PR1 — Number migrations · WS E
**Files:** `seed/source/onb-data.jsx:82`, `seed/source/prog-data.jsx:31`,
`src/app/onboarding/OnboardingV2.tsx:66`, `docs/hormozi/funnel_v2.md`, `docs/hormozi/lead_magnet_v2.md`
**Copy:** §7 grep list.
**Changes:** `"8 hetes Foundation program — 40 vezetett edzés"` → 30 edzés + „a te tempódban"
phrasing; two comments; docs milestones W12→W10, W20→W15, W40→W30, M2 day 42→35 with `<10`, D6
subject → §7's line, D10 deadline email cut.
**Tests:** grep-clean check (§3).
**QA:** none (seed is emulator-only; prod Firestore is authored via /admin).
**Rollback:** revert. **Closes:** §7 migration criterion.

### PR2 — Hero + `CTA_START` · WS B
**Files:** `src/components/landing/LandingPage.tsx`, `src/components/landing/offer-copy.ts` (new)
**Copy:** §4.1 verbatim (headline, sub, CTA label, 3 chips).
**Changes:** `CTA_START = "/register"` (D1 — the redirect currently eats `?plan=` and CTA-borne
UTMs); hero sub + chips; CTA label → „7 kérdés, és kész a heted"; `offer-copy.ts` created with
`HERO`.
**Tests:** manual URL walk. **QA:** click any CTA on `/`, confirm the URL is `/register?...` with the
query string intact and **no redirect hop** in the network panel.
**Rollback:** revert. **Closes:** P3, P8, P9, P25 (hero half).

### PR3 — `#ismeros` + copy edits + `alapító` strip · WS B
**Files:** `LandingPage.tsx`, `offer-copy.ts`, `src/components/onboarding/BrandPanel.tsx`,
`src/components/auth/AuthBrand.tsx`, `src/app/landing.css`
**Copy:** §4.2 verbatim; §5's `#hogyan` 3-step line; `#kihivasok` „Minden héten 5 új kihívás-videó.";
`#alexa` „Nem ígérek csodát. Egy rendszert ígérek, ami kibírja az életet."
**Changes:** new `#ismeros` section above `#hogyan`; three copy edits; **Q6** — delete „Az alapító"
eyebrow from `LandingPage.tsx:968` and `BrandPanel.tsx:130`, `AuthBrand.tsx:59` alt →
„Alexa, a LEXFIT edzője"; `FinishExamples` alt text (D2b, closes P4); `NAV_LINKS` unchanged this PR.
**Tests:** grep `alapító` → 0 in `src/` (after PR15 for config).
**QA:** read `/` top-to-bottom at 390px and 1440px; confirm the Alexa band still reads as hers
without the label. **Rollback:** revert. **Closes:** P2, P26, P15, P16, P27, P10, P4, P29.

### PR4 — `PricingBand` + footer lift · WS A
**Files:** `src/components/landing/PricingBand.tsx` (new), `LandingFooter.tsx` (new),
`offer-copy.ts`, `src/lib/pricing/display.ts`, `LandingPage.tsx`, `src/app/landing.css`
**Copy:** §4.4 in full — banner, intro, three cards with badges/CTAs, shared line, value line
(P1/P36), hesitation line (P13/P14), included list, „Kinek nem való?" (existing copy retained).
**Changes:** `perMonthHuf()` added to `display.ts`; `PRICING` const deleted from `LandingPage.tsx`;
card order/badges inverted per §4.4 (D6 — Heti „Kipróbálom" · Havi centre „Legnépszerűbb" · Éves
„Legjobb ár"); annual card leads on 39 900 Ft/év with 3 325 Ft/hó (−44%) derived; cards link to
`/register?plan=<role>`; footer extracted out of the `#elofizetes` band into `<LandingFooter />`.
**Tests:** `perMonthHuf` + `annualSavingsPct` assertions (§3).
**QA:** every amount on the band matches `config.ts`; no hardcoded forint in the diff.
**Rollback:** revert (footer lift and band extraction are one commit on purpose — they touch the same
JSX spine). **Closes:** P1, P13, P14, P36.

### PR5 — `#garancia` + `#gyik` relocation · WS B
**Files:** `LandingPage.tsx`, `offer-copy.ts`, `src/app/landing.css`
**Copy:** §4.3 verbatim + trust row; §4.5's five FAQ entries verbatim.
**Changes:** new `#garancia` between `#alexa` and `#elofizetes`, wrapped in
`GUARANTEE_LIVE` (env-gated, Q3b); §4.5 entries appended to the FAQ array; **`#gyik` moved from
before `#alexa` to after `#elofizetes`** (D4/R5) with `<LandingFooter />` last; `NAV_LINKS` gains
`#garancia`.
**Tests:** FAQ shape assertions. **QA:** the band alternation (`cream`/`navy`/`sage`) must still read
correctly after the move — check at 3 viewports. Toggle the env var both ways.
**Rollback:** revert — this is the highest-risk commit, deliberately isolated.
**Closes:** P2, P11, P12, P30, P7, P19, P34, P37, P38.

### PR6 — Pay step · WS C
**Files:** `src/components/onboarding/EmbeddedPay.tsx`, `paywall.tsx`, `offer-copy.ts`,
`src/app/onboarding/onbv2.css`
**Copy:** §4.6 — guarantee short form, renewal disclosure per plan, under-CTA cancel line.
**Changes:** guarantee box **above** the plan selector, quiet styling, no CTA of its own (§6 — it
de-risks the selector, it must not compete); renewal disclosure with the real next-charge date
computed in Budapest tz; trust row (Stripe · e-számla · 14 napos elállás); **Q7** — `PAYWALL_PLANS`
badge moves to Havi „Legnépszerűbb" (**also changes `/subscribe`**).
**Tests:** next-charge-date helper is pure → asserted for all three plans + a DST boundary.
**QA:** Stripe test-mode purchase on each plan; the date shown pre-payment must match Stripe's own.
**Rollback:** revert. **Closes:** P2, P11, P12, P30 (pay surface).

### PR7 — Analytics · WS G
**Files:** `src/lib/track.ts`, `PricingBand.tsx`, `LandingPage.tsx`, `EmbeddedPay.tsx`
**Changes:** `lx_garancia_view` (once/session, `useInView` at 0.5), `lx_pricing_plan_select`,
`lx_arak_view`, `lx_onb_whisper_view`. No personal data; GTM consent gating untouched.
**QA:** `dataLayer` inspection in the console on each surface.
**Rollback:** revert.

### PR8 — `?plan=` preselect · WS C
**Files:** `src/lib/pricing/preselect.ts` (new), `OnboardingV2.tsx`
**Changes:** `planFromParam()` validating against `isRecurringRole`; seeds `answers.plan` at mount
only; `goto()` already preserves the query string, so no other wiring.
**Tests:** valid roles round-trip; `week_oneoff`/`annual_earned`/`"free"`/`""`/`null`/`"../admin"` → `null`.
**QA:** `/register?plan=annual_std` opens with Éves selected; `?plan=bogus` falls back silently.
**Rollback:** revert. **Closes:** the `?plan=` acceptance item.

### PR9 — Days domain + Whisper + milestone strip · WS C
**Files:** `src/app/onboarding/_mock.ts`, `OnboardingV2.tsx`, `src/lib/onboarding-draft.ts`,
`src/lib/prefs.ts`, `src/components/landing/WeekPicker.tsx`, `onbv2.css`, `landing.css`
**Copy:** §4.6 — days helper, Whisper, care helper, quiet helper, `reveal` strip labels, `plan` line.
**Changes (Q1):** `counts` → 2/3/4 + a `flexible` option; `defaults` remapped (`2:[2,5]`, `3:[1,3,5]`,
`4:[1,2,4,6]`); `recommended` → 3; `WeekPicker` `MIN/MAX` → 2/4; `prefs.ts` default weekdays moved
into domain; `FunnelAnswers`/`DraftAnswers` gain a `flexible` marker; reveal `paceLine` maths follow;
Whisper after `days`; milestone strip `1 · 5 · 10 · 15 · 30` on `reveal` **and** on the Journey band
(Q4 — the band gains an id).
**Tests:** `test:onboarding-draft` round-trip incl. the flexible marker; pace-line maths.
**QA:** walk the funnel at each cadence; confirm the plan the app builds matches the selection.
**Rollback:** revert — but note this is the one PR whose revert also reverts a user-visible product
behaviour, not just copy. **Closes:** P22, P25, P26, P7, P17, P20, P3, P15, P24, P31.

### PR10 — `/arak` · WS A
**Files:** `src/app/arak/page.tsx` (new), `src/app/sitemap.ts`, `LandingPage.tsx` (hero nav + footer
links), `landing.css`
**Changes:** server component, `revalidate = 3600`, own metadata + canonical, renders
`<PricingBand surface="arak" />` + `#garancia` + the FAQ subset + elállási gomb slot; sitemap entry;
cross-page links from hero nav and footer (**not** StickyNav — it is a same-page scroll-spy, D-plan §2.6).
**QA:** direct load, Lighthouse mobile ≥ 90, canonical + sitemap present.
**Rollback:** revert (route deletion is safe — nothing links to it until this PR).

### PR11 — FAQPage JSON-LD · WS F
**Files:** `src/components/landing/FaqJsonLd.tsx` (new), `src/app/page.tsx`, `src/app/arak/page.tsx`
**Changes:** server-rendered `<script type="application/ld+json">` from the same FAQ array —
`/` gets all entries, `/arak` the garancia/lemondás/szünet subset. Organization schema untouched.
**Tests:** schema self-test (parses, FAQPage shape, no empty q/a).
**Rollback:** revert.

### PR12 — Guarantee refund: config, maths, API · WS D
**Files:** `src/lib/pricing/config.ts`, `refund.ts`, `events.ts`,
`src/app/api/admin/guarantee-refund/route.ts` (new), `emails/guarantee-refund-confirm.tsx` (new),
`src/lib/mailer.ts`
**Changes:** `GUARANTEE = { requiredWorkouts: 10, windowDays: 35 }` (Q2 — enforced exactly as
advertised, env-overridable); `guaranteeEligibility()` + `fullRefundTotalMinor()` (pure);
admin-only POST route modelled on `/api/withdrawal` — release the managing schedule **before** any
money moves, refund each paid invoice in **full**, cancel, log, notify, send the durable-medium
confirmation. Idempotency in three layers: `milestoneOnce(uid,"guarantee_10_refund")` →
per-invoice `idempotencyKey` → skip already-refunded invoices.
**Tests:** eligibility (9 → no, 10 → yes, day-35 inclusive, day-36 → no, duplicate codes counted
once, missing progress doc → no throw); full vs pro-rata totals; the refund planner's skip logic.
**QA:** Stripe test mode — run twice, assert exactly one refund per invoice.
**Rollback:** revert. Route is admin-only and unreferenced until PR13, so reverting is inert.

### PR13 — Guarantee refund admin UI · WS D
**Files:** `src/app/api/admin/users/[uid]/route.ts`, `src/app/admin/members/[uid]/…`
**Changes:** eligibility verdict in the member payload; a confirm-gated panel showing
`completedCount / 10`, window end date, verdict, and the trigger.
**Rollback:** revert (API survives).

### PR14 — Withdrawal button · WS H
**Files:** `src/components/WithdrawalButton.tsx` (new), `LandingFooter.tsx`,
`src/app/app/membership/page.tsx`
**Changes (Q5):** confirm-gated button calling the existing `requestWithdrawal()`; footer link on `/`
and `/arak`; a row in `/app/membership` beside pause/downgrade/cancel. **Backend already exists and
is correct** — this closes a pre-existing gap in hard rule 8 (D11).
**QA:** Stripe test mode, within the 14-day window; confirm the refund amount and the confirmation email.
**Rollback:** revert.

### PR15 — Stripe nickname · manual
`config.ts:142` nickname reworded, then **`npm run seed:stripe`** run against live Stripe, verified
with `npm run audit:stripe`. `lookup_key` unchanged, so the price object is updated, not replaced.
This is the project's **only** live Stripe write (Q6b) and is run as its own deliberate step.

---

## 2. Per-PR acceptance (the §5 surface map, closed)

| P# | Closed by |
|---|---|
| 1, 36 | PR4 (value line) |
| 2 | PR3 (`#ismeros`), PR5 (`#garancia`), PR6 (pay box) |
| 3 | PR2 (hero), PR9 (`plan` line) |
| 4 | PR3 (`FinishExamples` alt — already 3 male cards, Kristóf first) |
| 5, 6, 7, 23 | PR5 (FAQ) + **/admin content ordering, D14 — not code** |
| 8, 9, 25 | PR2 (chips), PR9 (`days`) |
| 10, 29 | PR3 |
| 11, 12, 30 | PR5, PR6 |
| 13, 14 | PR4 (hesitation line) |
| 15, 16 | PR3 (`#hogyan`), PR9 |
| 17, 20, 22 | PR9 |
| 19, 34, 37, 38 | PR5 (FAQ) |
| 24, 31 | PR9 (milestone strips) |
| 26 | PR3, PR9 |
| 27 | PR3 (`#kihivasok`) |
| 18, 21, 28, 32, 33, 35 | Out of scope — number migration only, PR1 |

**Not closed by code (owner tasks):** `#programok` ordering — „7 napos kezdő" first and „Esti
rutinok" within the first four on mobile — is the `order` field on `programs/{slug}` in /admin
(D14). And the §4.4 included-list program names must be verified against prod before PR4 merges (R3).

---

## 3. Verification run on every PR

```
npx tsc --noEmit
npm run lint
npm run test:pricing && npm run test:funnel && npm run test:onboarding-draft && npm run test:quiz
grep -rn "12 990\|40 edzés\|12 edzés garancia\|hat héten belül\|szeptember 30-ig\|alapító" src emails seed
npm run build
```

The grep must return zero after PR3 (and PR15 for the config nickname). A machine check that no §4
string contains `!` runs inside the schema self-test — hard rule 1, enforced rather than trusted.

---

## 4. Rollout & rollback

- **Preview per PR.** Vercel builds every commit on `offer-v3`; each PR is checked on its preview URL
  before the next one starts.
- **`/` is never half-restructured.** PR4 (band + footer lift) and PR5 (`#garancia` + `#gyik` move)
  are the two structural commits. They land back-to-back and are verified together at 390 / 768 /
  1440px before anything else merges on top. If either fails review, both revert.
- **`revalidate = 3600`** means `/` and `/arak` can serve up to an hour of stale HTML after deploy.
  A deploy purges the cache, so no manual step is needed — but the Saturday go-live should be at
  least an hour before the ads start, and the first check must be a hard reload.
- **Rollback = `git revert <sha>`.** No data migrations anywhere in this project: landing copy is
  hardcoded (D14), so there is no catalog script to re-run. The only non-revertible step is PR15's
  Stripe nickname, which is metadata on a dormant price and harmless either way.
- **The env flag is the release valve.** `NEXT_PUBLIC_GUARANTEE_LIVE` ships `0`. Turning it on is a
  Vercel env change plus a redeploy — no code change, no rebuild of anything else.

---

## 5. QA script — mobile, Facebook in-app browser

Run on a real phone, in the FB in-app browser (the ad's actual environment), before Sep 7.

1. **Ad URL** → `/?utm_source=facebook&utm_campaign=szeptember&fbclid=TEST123`.
   Confirm: hero copy §4.1, three chips, no exclamation marks anywhere on the page.
2. Scroll the whole page. Confirm section order: hero → `#ismeros` → `#hogyan` → `#programok` →
   price-anchor → `#valos` → cast → Journey (milestone strip) → `#heted` → finish → `#kihivasok` →
   `#alexa` → `#garancia` → `#elofizetes` → `#gyik` → footer. No layout shift on load.
3. **Tap a pricing card (Havi).** Confirm the URL is `/register?utm_source=…&fbclid=TEST123&plan=month_std`
   — **the UTMs and fbclid survived, and there was no redirect hop** (this is the D1 regression).
4. Walk the full funnel: 7 questions → Whisper after `days` → `reveal` with the milestone strip →
   `plan` → `account` → `pay`.
   Confirm at `pay`: Havi is preselected, the guarantee box sits **above** the selector, the renewal
   date is shown **before** payment, the trust row and the cancel line are present.
5. **Stripe test card** `4242 4242 4242 4242`. Confirm redirect to `/app?sub=success`, the
   subscription-started email, and the invoice.
6. **First workout plays.** This is the aha — time it from step 1 and confirm nothing this project
   added lengthened the path.
7. `/arak` direct load. Confirm parity with `#elofizetes`, the FAQ subset, and the elállási gomb.
8. **Elállási gomb** reachable from `/`, `/arak`, and `/app/membership`. Trigger it in test mode;
   confirm the pro-rata refund and the confirmation email.
9. `dataLayer` check: `lx_garancia_view`, `lx_pricing_plan_select`, `lx_arak_view`,
   `lx_onb_whisper_view` fire — and carry no personal data.
10. Lighthouse mobile on `/` and `/arak` ≥ 90; CLS unchanged from the pre-project baseline.
11. Grep-clean (§3) on the merged branch.

---

*Execution log lives in the commit history of `offer-v3`. Anything I had to decide mid-build that
was not covered by dev-plan §8 is recorded in the PR's commit message and flagged in the handoff
summary.*
