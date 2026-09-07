# Lead Magnet v2 — dev plan (`/ujrakezdes`)

**Version:** 1.0 · 2026-09-07 · Source spec: *LEXFIT — Lead Magnet v2 (final copy, 2026-09-04)*
**Branch:** `offer-v3` · **Target:** live for the Meta ads on Sep 7.

---

## 1. Repo survey — what the spec assumes vs. what is actually here

| v2 spec assumes | Repo reality | Consequence |
|---|---|---|
| A new 7-question quiz | `/onboarding` **already asks v2's seven questions** — `goal · focus · level · days · time · env · obstacle`, with Q1 headed literally „Mi hozott ide?", plus „Hány nap fér bele?", „Hol tartasz most?", „Van bármi, amire figyeljek?", „Mikor a legjobb?" (`src/app/onboarding/OnboardingV2.tsx:37`, `src/app/onboarding/_mock.ts`) | v2's questions are not new work; they are a second, marketing-side rendering of a set the product already uses |
| No lead machinery exists | A **full lead system is built**: `quizLeads` collection, GDPR erase/export tokens, 12/24-month retention clocks, one-click unsubscribe keyed on the lead id, a daily cron, SendGrid + react-email (`src/lib/quiz/*`, `src/app/api/cron/quiz-leads/route.ts`, `src/app/api/email/unsubscribe/route.ts`) | Reuse it. Forking GDPR plumbing for a second funnel would be the single most dangerous thing in this project |
| `/terv` is available | `/terv` exists but is the **v3.0 MASTER calorie quiz** (11 screens: sex, height, weight, target weight, kcal, steps) and is **shipped disabled** behind `QUIZ_ENABLED`, pending an Art. 9 privacy amendment (`src/app/api/quiz-lead/route.ts:31`) | `/terv` is not a foundation to build on, and its vocabulary („Fogyás, zsírégetés", cél-testsúly, kalória) violates offer v3 §3 rule 2 outright |
| A one-time 12 990 Ft product with a Sep 30 deadline | No such product. Pricing is the subscription only — 490 → 1 990 Ft/hét · 5 990 Ft/hó · 39 900 Ft/év (`src/lib/pricing/config.ts`) | D6/D10 copy cannot ship as written (see §3) |
| The offer module is "offer_v2 §5" | Superseded — the shipped offer is offer v3: **LEXFIT Start 30 edzés**, **10 edzés garancia**, no urgency (`src/components/landing/offer-copy.ts`, `PricingBand.tsx`) | The reveal's offer block reuses `PricingBand`, it does not restate prices |
| The guarantee can be advertised | Guarantee copy ships **dark** behind `NEXT_PUBLIC_GUARANTEE_LIVE` pending the ÁSZF clause (`offer-copy.ts:251`) | Every guarantee mention in the new surfaces must respect the same flag |

**Grep state:** `12 990`, `40 edzés`, `12 edzés`, `hat héten belül`, `szeptember 30`, `alapító` are already absent from `src/`, `emails/`, `seed/`. Offer v3's 15 PRs are all shipped on this branch. Nothing I add may reintroduce them.

---

## 2. Owner decisions taken 2026-09-07

1. **Funnel architecture — parallel.** `/ujrakezdes` is built as a **standalone** funnel: its own landing, its own 7-question wizard, its own gate, its own reveal. `/onboarding` and `/terv` are left exactly as they are. *(The alternative — inserting a gate into `/onboarding` — was declined; it would have put a new failure mode in the paid funnel four days before ads.)*
2. **No guest workout.** v2 §4's „Kezdd el az első edzést — most, vendégként is. 22 perc" is **dropped**. The pay-to-join hard gate (`src/lib/billing.ts`) and the locked P0 „no free workout" decision stand. `billing.ts`, `firestore.rules` and auth are untouched.
3. **Offer-v3 rules win in the emails.** D6 is rewritten to the subscription with the 10 edzés garancia and **no deadline**; its subject becomes offer v3 §7's „30 edzés, és visszakapod a pénzed, ha nem vált be". **D10 is dropped** — its entire content was a deadline, which offer v3 §10 lists under *Never*.

---

## 3. Copy deviations from the v2 spec, and why

Every deviation is forced by a rule the v2 document itself does not override. All are listed here rather than buried.

| v2 §  | Spec text | Shipped as | Forced by |
|---|---|---|---|
| §5 D6 | „40 edzés" | **30 edzés** | offer v3 §7 grep migration |
| §5 D6 | „az első 12 edzést hat héten belül" | **az első 10 edzést öt héten belül** | offer v3 §2 locked guarantee |
| §5 D6 | „12 990 Ft-ért (1 299 Ft/hét)" | the subscription, rendered from `PRICES` | offer v3 §3 rule 6 — no product exists at that price |
| §5 D6 | „**szeptember 30-ig** él" | removed | offer v3 §2: „No deadlines, no counters, ever" |
| §5 D6 | bonuses „…együtt" as a bundle | „Egy tagság, minden benne" (all-access) | offer v3 §2 access model |
| §5 D10 | whole email | **dropped** | as above; a replacement non-urgency nudge is proposed in §8 for Alexa's review |
| §4 | „Kezdd el az első edzést — vendégként is" | replaced with a paywall-honest line, marked `// COPY-REVIEW` | decision 2 |
| §1 | „1 200+ fős közösség" | kept, but sourced from the existing FB-group figure already used on `/` | claim consistency |

Everything else in §1–§4 is pasted **verbatim**, including the interstitial, the gate, the Alexa video script and the Q1 segment P.S. variants.

---

## 4. Architecture

### Routes (site-architecture: 2 levels, readable, no orphans)

```
/ujrakezdes            landing — v2 §1, server-rendered, noindex+follow (paid traffic)
└── /ujrakezdes/terv   wizard  — Q1…Q7 → interstitial → gate → reveal
```

`noindex, follow` follows the `/terv` precedent: a half-funnel entry point is a poor organic result and must not compete with `/` in search.

### Where copy lives

One module, `src/app/ujrakezdes/copy.ts`, holds every v2 string — the same single-source rule as `src/components/landing/offer-copy.ts`. **No forint amount appears in it**; the offer block renders `PricingBand`, which interpolates from `PRICES`. Anything written that v2 did not supply is marked `// COPY-REVIEW`.

### Data — reuse `quizLeads`, discriminated by `variant`

The two funnels stay separate at the product level (own landing, own wizard, own reveal, own emails) but **share the legally load-bearing plumbing**: unsubscribe tokens, GDPR erase/export, both retention clocks, rate limiting. A second collection would have meant a second unsubscribe route, a second rights flow and a second purge job — three places for a GDPR bug to hide.

- New docs carry `variant: "lm_v2"`; existing docs have no `variant` and are read as `"quiz_v3"`.
- `LeadDoc` becomes a discriminated union; the cron branches on `variant` before dispatching a step.
- Q5 („Mire figyeljünk a testednél?") is the one health-adjacent answer, so it is stored under the **existing 12-month Art. 9 clock** (`healthPurgeAt`), not the 24-month one — even though v2's gate asks for no separate health consent. This is the conservative reading and costs nothing.

### Sequence

`D0` inline on submit (transactional, everyone) · `D3` at 72 h · `D6` at 6 d — both consented-only, both suppressed on `convertedAt` / `unsubscribedAt`. Steps are timed from `createdAt`, matching the existing module so a missed cron run catches up instead of drifting.

---

## 5. File tree

**Create**
```
src/app/ujrakezdes/page.tsx              landing route (§1)
src/app/ujrakezdes/Landing.tsx           landing view
src/app/ujrakezdes/ujrakezdes.css        scoped .lxu
src/app/ujrakezdes/copy.ts               ALL v2 copy, single source
src/app/ujrakezdes/terv/page.tsx         wizard route
src/app/ujrakezdes/terv/PlanWizard.tsx   Q1–Q7 · interstitial · gate · reveal
src/lib/ujrakezdes/types.ts              answer types
src/lib/ujrakezdes/lead.ts               validate · build · doc shape
src/lib/ujrakezdes/plan.ts               week-plan derivation
src/lib/ujrakezdes/sequence.ts           D0/D3/D6 schedule
src/app/api/ujrakezdes-lead/route.ts     gate submit
emails/ujrakezdes-d0.tsx                 delivery
emails/ujrakezdes-d3.tsx                 belief + Q1 segment P.S.
emails/ujrakezdes-d6.tsx                 offer (offer-v3 numbers, no deadline)
scripts/ujrakezdes-selftest.ts           acceptance tests
```

**Modify**
```
src/lib/mailer.ts                        three send exports
src/lib/quiz/lead.ts                     LeadDoc → union + variant
src/app/api/cron/quiz-leads/route.ts     branch the sequence + health purge on variant
src/lib/track.ts                         new events
package.json                             test:ujrakezdes
```

**Untouched, by decision:** `billing.ts` · `firestore.rules` · auth · `pricing/config.ts` · `/onboarding` · `/terv` · every offer-v3 surface.

---

## 6. Analytics

Extends the existing `dataLayer` layer and the same consent gate; no new vendor, no new secret.

| Event | Trigger |
|---|---|
| `lx_ujrakezdes_view` | `/ujrakezdes` pageview |
| `lx_ujrakezdes_quiz_start` | CTA → wizard |
| `lx_ujrakezdes_step` | each question answered (`step_id`, `q`) |
| `lx_ujrakezdes_gate_view` | gate shown |
| `lx_ujrakezdes_lead` | lead stored (shared `event_id` with the Meta Pixel `Lead`) |
| `lx_ujrakezdes_reveal_view` | reveal shown |
| `lx_ujrakezdes_offer_click` | offer CTA |

Meta CAPI `Lead` is reported server-side with the **shared `event_id`**, and only when `consent === "granted"` — identical to the `/terv` route's contract, so the pair still collapses instead of double-counting.

---

## 7. Risks

1. **Ads point at a page gated by an env flag.** `/terv` shipped disabled and stayed disabled. The new route gets its own flag `UJRAKEZDES_ENABLED`, and it must be set in Vercel **before** the ads go live. Listed first because it is the one that silently kills the campaign.
2. **Art. 9 exposure via Q5.** Mitigated by the 12-month clock above; the gate carries the privacy-policy link v2 §3 specifies. If legal wants an explicit health consent, it is one checkbox in one file.
3. **The guarantee is dark.** D6 and the reveal both render guarantee copy only under `GUARANTEE_LIVE`; with the flag off they fall back to the statutory-withdrawal wording that the ÁSZF already supports. No email can promise something the terms do not.
4. **Two reveals will drift.** Accepted cost of the parallel decision. The offer block is `PricingBand`, so at least prices, badges and the guarantee cannot drift.
5. **Retake / re-submit.** Upsert on the email hash keeps the original `createdAt`, so acquisition date and the D3/D6 schedule stay honest.
6. **In-app browser (FB/IG) email field.** The known QA item from v2 §6; covered in the QA script.
7. **CLS on the landing.** Media boxes get reserved aspect ratios; the page is server-rendered like `/`.
8. **Cron regression.** The variant branch is additive — an unknown or absent `variant` takes the existing path unchanged, and the selftest asserts it.

---

## 8. Open items for Alexa (not blocking the build)

- A replacement for D10 in the no-urgency register — a quiet „a terved megvár" nudge rather than a close. Proposed draft ships as a `// COPY-REVIEW` stub, unscheduled, until approved.
- The `// COPY-REVIEW` line replacing the guest-workout block on the reveal.
- Two member finish-card photos, one male (v2 §1 below-the-fold) — placeholders reserve the space.
