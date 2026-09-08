# 00 — Internal evidence base

**Date:** 2026-09-08 · **Purpose:** everything LEXFIT already knows about its own
funnel, assembled before the external research so the web findings can be judged
against our real constraints instead of a generic SaaS.

Every claim below is sourced to a file in this repo. Where a number is *not*
verifiable from the repo, it is listed in §7 as a gap, not asserted.

---

## 1. The avatar and the promise (offer_v2 §1)

- **Avatar:** 35–54, works, gets home in the evening, has restarted and collapsed
  several times, often protects a back or a knee, does not want a gym and does not
  want hype, wants to be *led*.
- **Dream outcome, stated as a state and never as a body:** „rendszeres mozgás, ami
  egy rossz hetet is túlél" — a system that survives a bad week.
- **Named offer:** Szeptemberi Újrakezdés → core: LEXFIT Start → guarantee.

Source: `docs/hormozi/offer_v2.md:9-15`.

## 2. Product facts (offer_v3 §0, locked)

| Fact | Value |
|---|---|
| Start programme | **30 guided workouts**, no fixed week count — „a te tempódban" |
| Cadence | user picks 2 / 3 / 4 days per week at the `days` step |
| Guarantee | **10 edzés garancia** — first 10 workouts within **5 weeks**; gentle variants count; refund = all membership fees paid to date |
| Statutory right | 14-day EU withdrawal, **separate** from the guarantee and never merged with it |
| Milestones | 1 · 5 · **10** (guarantee met) · **15** (mid-point re-measure) · **30** (final) |
| Access model | all-access — every plan contains everything; differentiation is the guided journey, not feature gating |
| Weekly drop | 5 new challenge videos per week + new programmes |
| Urgency | **none.** „Szeptemberi Újrakezdés" is seasonal framing only — no date, no counter |

Source: `docs/hormozi/offer_v3.md:12-26`.

## 3. Prices (single source of truth — `src/lib/pricing/config.ts`)

| Role | Amount | Verified at |
|---|---|---|
| `week_intro` | 490 Ft (first week) | `config.ts:72-75` |
| `week_std` | 1 990 Ft / week | `config.ts:81-84` |
| `month_std` | 5 990 Ft / month | `config.ts:99-102` |
| `annual_std` | 39 900 Ft / year | `config.ts:117-120` |

Hard rule at `config.ts:4`: no pricing numeric may be written into copy. Every
forint on a page is interpolated from this file. **The research may not propose
changing an amount** — only how the amount is presented.

## 4. Measured performance (Stripe cohort, Aug 12–30 2026)

Reported in `docs/hormozi/research_offer.md` §Q1, against category benchmarks:

| Metric | LEXFIT | Benchmark (Adapty/RevenueCat 2026) |
|---|---|---|
| Payers acquired | 23 in 19 days | — |
| Register → pay | **88 %** | — |
| **First renewal** | **54 %** (7/13) | **67.7 %** (H&F weekly) |
| Second renewal | 40 % (2/5) | 45.1 % (all categories) |
| Annual plan sales | **0** | H&F: 61 % of category revenue is annual |
| Payers outside Budapest | 57 % | — |
| Target CAC | ~5 000 Ft (≈ €13) | — |

**The two facts that should drive every recommendation:** the funnel converts
strangers into payers well (88 %) and then loses them at the first renewal
(54 % vs 67.7 %), and the highest-LTV plan in this category has never sold once.

Caveat carried from the source: those benchmarks are app-store data; LEXFIT is
web + Stripe. Directional only.

## 5. Hungarian price anchors (research_offer §Q4)

Gym 11 200–22 400 Ft/mo · personal trainer 5 500–7 500 Ft/**hour** · Béres
Alexandra video membership 4 990 Ft/mo · Rubint Réka 2 990 Ft/mo.

The one clean, true anchor sentence available: **one PT hour ≈ one month of
LEXFIT.** Both Hungarian competitors sell *content volume* (690 / 200 videos);
LEXFIT sells sequence and adaptation — but the price tag currently says „same
category, slightly dearer".

## 6. Constraints the research cannot argue with

Voice and claims (`docs/hormozi/*`, `src/app/ujrakezdes/copy.ts`):
- no exclamation marks · no weight-loss vocabulary in the main funnel · no
  second-person health assumptions („Fáj a hátad?") · no body-outcome + timeframe
  claim · no fake urgency, counters or deadlines · no „alapító ár".
- The one scoped exception is the calculator module, which must say „fogyás"
  because that is what the arithmetic does — waiver documented at
  `copy.ts` §ENERGY and asserted by the selftest.

Legal:
- **Grtv. §6** — Hungary has no soft opt-in; marketing consent is a separate,
  unticked checkbox, and the plan must be delivered whether or not it is ticked.
- **GDPR Art. 9** — the calculator's body metrics are special-category data.
  Consent must be *freely given*, which is why those three questions are
  skippable and carry their own consent line and their own retention clock.
- The privacy-policy amendment
  (`docs/legal/adatkezelesi-tajekoztato-kviz-modositas-TERVEZET.md`) is **still
  unapproved** — an owner blocker before this collects body data from live ads.

Ad platform: Meta moved to claims-based enforcement on 2026-07-22; our own rules
are already stricter than the policy (`research_offer.md` §Q5).

## 7. The 38 objections — raw material for every surface

`docs/hormozi/offer_v2.md:17-64` inventories 38 real objections in the buyer's
own words, staged A–F (deciding → after the programme) and typed NW / NM / TH /
TS (not worth it · won't work for me · too hard · too slow), each mapped to the
deliverable that answers it and the surface it belongs on.

For this project the eight **stage-A (deciding)** entries are the ones the
landing, the quiz and the reveal have to carry. Ranked by how often they recur
across the source docs:

1. „A YouTube ingyen van." (#1) — the free-alternative objection
2. „Már fizettem ilyenre, aztán nem csináltam." (#2) — the guarantee's job
3. „Nem tudom pontosan, mit kapok." (#3)
4. „Nincs időm." (#9) / „Nincs eszközöm, se helyem." (#8)
5. „Derekam/térdem miatt nem merek." (#7) / „50 fölött ez már nem nekem való." (#5)
6. „Férfiaknak is?" (#4) — positioning changed to men *and* women in 2026-08
7. „Utálom a fitnesz-hype-ot." (#10) — answered by register, not by copy
8. „És ha le akarom mondani?" (#11) / „Bankkártyát adjak?" (#12)

**Note the version drift:** offer_v2's table still says 40 edzés / 12 edzés
garancia / 6 hét. offer_v3 supersedes those to 30 / 10 / 5. The *objections* are
still valid; the *answers* must be re-quoted from v3.

## 8. The funnel as actually built today

| # | Surface | Route / file | State |
|---|---|---|---|
| 1 | Ad | Meta, 15-ad matrix, launch set A1/A4/A7 | `funnel_v2.md` §2 |
| 2 | Landing | `/ujrakezdes` → `src/app/ujrakezdes/Landing.tsx` | single hero; being rebuilt to the full doc structure |
| 3 | Quiz | `/ujrakezdes/terv` → `terv/PlanWizard.tsx` | 7 questions, one per screen, tap-to-advance, section-labelled progress, answer chips + live week strip |
| 4 | Interstitial | same file | 2 s, shows their real week + the two forgiveness rules |
| 5 | Calculator | `body` / `goal` / `tempo` steps | in-flow, skippable, own consent |
| 6 | Gate | same file | email + separate consent checkbox + honeypot |
| 7 | Reveal | same file | week grid → care notes → first workout → programme preview → calorie result → full `PricingBand` |
| 8 | Email | `emails/ujrakezdes-d0|d3|d6` | D0 all, D3/D6 consented only; D10 cut (no deadline exists) |
| 9 | Storage | `quizLeads`, keyed on sha256(email) | `src/app/api/ujrakezdes-lead/route.ts` |

Copy source of truth: `src/app/ujrakezdes/copy.ts` (no amounts — the band
interpolates them from `config.ts`).

## 9. Data gaps — what we do NOT have

These are the things no amount of web research replaces. Flagged, not guessed:

1. **No live funnel analytics in hand.** Ads were scheduled for Sep 7. I have no
   landing→quiz-start rate, no per-question drop-off, no gate conversion and no
   reveal→checkout rate for this funnel. Every external benchmark below is
   therefore a *prior*, not a measurement of us.
2. **No baseline for the quiz itself.** The 88 % register→pay figure is from the
   *old* `/onboarding` path, not from `/ujrakezdes/terv`.
3. **No A/B infrastructure** documented for this funnel — so recommendations must
   be ranked by evidence strength, since we cannot cheaply test our way out.
4. **`UJRAKEZDES_ENABLED` is not set in Vercel**, so the endpoint is gated off in
   production until an owner sets it.
5. **The Art. 9 privacy amendment is unapproved** — a legal blocker on the
   calculator, not a design question.

---

## 10. How to read the rest of this folder

`01` quiz mechanics · `02` results page + offer transition · `03` landing page ·
`04` offer architecture · `05` email sequence · `06` design craft.

Each was researched against the constraints in §6 and the numbers in §4. The
brief given to every track was explicit: **optimize within the existing funnel,
do not propose rebuilding it.**
