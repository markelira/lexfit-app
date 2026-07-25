# LEXFIT — Pricing & CLV Strategy

**Status:** Strategy proposal (no code). Market: **Hungary only, HUF**. Product: one
full-access subscription sold at **weekly / monthly / annual** durations, with a **cheap
intro that steps up** to the standard price. Posture: **behaviorally optimized but fully
EU/HU-compliant**. Goal: **maximize Customer Lifetime Value (CLV)**.

All prices in this doc are **gross (ÁFA 27% included)** — Hungarian consumer prices must be
displayed VAT-inclusive. Every number is a **recommended starting point to validate by
A/B testing**, not a fixed truth.

---

## 1. TL;DR — the recommended model

1. **Three plans, one product:** Heti (weekly) · Havi (monthly) · Éves (annual). Same full
   access to Foundation + the 200+ library + community + recipes.
2. **Annual is the hero**, framed as a tiny **per-week** number (`537 Ft/hét`) with a
   "Legnépszerűbb · Spórolj 33%" badge. It is pre-selected. This is where CLV lives.
3. **Monthly is the decoy/anchor** — priced so that 12× monthly is dramatically more than
   annual, making annual an obvious "smart" choice.
4. **Weekly is the low-friction on-ramp** — the smallest sticker on the page
   (`első hét 490 Ft`), catching commitment-averse users who won't commit to a year. It
   *annualizes highest*, and the lifecycle then migrates these users to annual.
5. **Cheap intro then jump:** `Első hét 490 Ft, utána 1 690 Ft/hét` (and an optional
   `Első hónap 1 490 Ft, utána 3 490 Ft/hó`). Legal only with a clear step-up + auto-renew
   disclosure and affirmative consent at checkout.
6. **CLV is won after purchase:** four retention levers (annual lock-in, pause-instead-of-
   cancel, community/streaks, win-back) mapped to the exact points where fitness apps churn.

> **The core reframe:** your instinct — "make the cheapest option the one people pick, but
> maximize CLV" — is right, *if* the cheapest sticker is an **acquisition hook** and the
> page + lifecycle **steer the value to annual**. A user who stays on weekly is your *worst*
> CLV outcome (see §3), so the whole machine is designed to move them off it.

---

## 2. What "customer lifetime" means in a fitness app

Fitness is the **steepest churn curve of any consumer subscription category**. The evidence:

| Metric | Benchmark | Source |
|---|---|---|
| Monthly churn (fitness) | ~**7.2%** (2025); top-quartile **2.0%** | RetentionCheck / Business of Apps |
| Day 1 / Day 7 / Day 30 retention | ~20% / ~8% / ~4% | Snoopr / enable3 |
| **Annual** retention @ 12 mo | **44.1%** | RevenueCat *State of Subscription Apps* |
| **Monthly** retention @ 12 mo | **17.5%** | RevenueCat |
| **Weekly** retention @ 12 mo | **3.4%** | RevenueCat |
| Yearly plans' share of H&F revenue | **67%** | RevenueCat |
| H&F median monthly price | **$9.70** | RevenueCat |
| "January effect" | 40–60% of resolution-driven signups cancel by February | Digital Yield Group |
| **LTV compounding point** | **~24 months** (second annual renewal) — churn stabilizes | RevenueCat |

**Reading it:** "customer lifetime" in fitness is bimodal. Most users are gone within
weeks (the resolutioner curve); a committed minority renew annually and their churn
*flattens* after the second renewal (~24 months). The entire CLV game is **(a)** getting
past the early-churn cliff via activation, and **(b)** pushing as many users as possible
onto annual billing, whose retention is ~2.5× monthly and ~13× weekly.

**Billing period alone — holding price constant — creates a ~3× LTV gap** between annual and
monthly subscribers (RevenueCat). This single fact dominates the strategy.

---

## 3. The tension in your idea, and how we resolve it

You want the cheapest, least-understood option to be the one people pick — yet CLV
maximized. There's a real conflict:

- **Weekly plans feel tiny** (`1 690 Ft/hét` reads smaller than `3 490 Ft/hó`) and convert
  hesitant buyers → good for **acquisition breadth**.
- **But weekly retains at 3.4%** and yields ~⅓ the LTV of annual → bad for **CLV** if users
  *stay* weekly.

**Resolution — "acquire cheap, migrate to annual":**

1. Keep the cheap weekly intro as the **on-ramp** (low commitment, small number, the
   "wouldn't-do-the-annual-math" psychology you described).
2. Make **annual the visually-dominant, pre-selected choice** using anchoring + a decoy, so
   the *majority* actually pick annual at the pricing page.
3. For those who still enter via weekly, run **in-app upgrade nudges** to annual within the
   first 2–3 weeks (before weekly churn hits).

This way the "cheapest sticker" does its job (kills entry friction) **without** trapping your
CLV on the worst-retaining plan. The introductory-offer pattern itself is CLV-positive:
apps using a discounted first period alongside a higher standard price see **12–18% higher
LTV** than apps with a flat low price (Subscribe & Conquer / RocketShip).

---

## 4. Recommended price architecture (HUF, ÁFA-inc)

Anchored to the Hungarian market: net **median** wage ≈ **397 400 Ft/mo** (KSH, Sep 2025);
Netflix Standard **3 990 Ft**, Netflix Basic **2 890 Ft**, Disney+ Standard **2 990 Ft**,
Spotify Family **3 290 Ft**. A women-first, coached-feeling fitness product can sit at the
**upper streaming band** without looking expensive.

**Standard "real" monthly = `3 490 Ft/hó`** (≈ Netflix-Standard territory; ≈0.9% of median
net income — the same mental bucket as a streaming service).

| Plan | Sticker (what they see) | Renews at | Annualized cost | Role |
|---|---|---|---|---|
| **Heti** (weekly) | **Első hét 490 Ft** | `1 690 Ft/hét` | **87 880 Ft/yr** | Low-friction on-ramp; smallest number; highest annualized cost |
| **Havi** (monthly) | `3 490 Ft/hó` | `3 490 Ft/hó` | **41 880 Ft/yr** | Decoy / reference — makes annual obvious |
| **Éves** (annual) ⭐ | **`537 Ft/hét`** (`27 900 Ft/év`) | `27 900 Ft/év` | **27 900 Ft/yr** | **Hero. Best retention → best CLV.** Pre-selected. |

- **Annual "Spórolj 33%"** vs. 12× monthly (41 880 → 27 900). Displayed primarily as a
  **per-week** figure (`537 Ft/hét`) so it undercuts the weekly plan's per-week price by
  ~68% — that contrast is the anchor.
- **Weekly intro `490 Ft`** is the acquisition hook; step-up to `1 690 Ft/hét` **must** be
  shown adjacent (`utána 1 690 Ft/hét, automatikusan megújul`).
- **Optional monthly intro** (`Első hónap 1 490 Ft, utána 3 490 Ft/hó`) if you want a second,
  slightly-higher-commitment hook. Test one intro at a time.
- **No lifetime plan** (per your decision) — also correct for CLV: lifetime caps per-user
  revenue and is best priced 2.5–3× annual if ever added.

### Why these exact framings

- **Three tiers convert ~1.4× better than two** (Price Intelligently), and a
  good-better-best structure with a dominated option shifts mix toward the target by
  **10–30 percentage points** (ConversionXL / decoy-effect literature).
- Here the "dominated" option is **monthly**: obviously worse value than annual, obviously
  more commitment than weekly — it exists to make annual the rational pick, not to be sold.
- **Charm pricing** (`490`, `1 690`, `27 900`) and **per-unit reframing** (`537 Ft/hét`) are
  standard, compliant psychological levers.

---

## 5. Choice architecture on the pricing page

```
        Heti                 Havi                 Éves ⭐ (kiemelve, előre kiválasztva)
   ┌───────────┐        ┌───────────┐        ╔═══════════════╗
   │ Első hét  │        │ 3 490 Ft  │        ║ LEGNÉPSZERŰBB ║
   │  490 Ft   │        │  / hó     │        ║   537 Ft/hét  ║
   │ utána     │        │           │        ║  27 900 Ft/év ║
   │1 690Ft/hét│        │ havonta   │        ║  Spórolj 33%  ║
   └───────────┘        └───────────┘        ╚═══════════════╝
   "Kipróbálom"          "Ezt kérem"          "Kezdd el – legjobb ár"
```

Rules:
- **Annual card is larger, badged, and pre-selected.** The eye lands there first (primacy)
  and the per-week number makes it feel cheapest-per-use.
- **Weekly is smallest/quietest** but present — it exists to *not lose* the hesitant buyer,
  not to be promoted.
- **Show the annualized/step-up cost inline** on weekly (`utána … automatikusan megújul`).
  This is both legally required *and*, usefully, makes annual look smarter.
- **One primary CTA per card**, consistent verb through the flow ("Kezdd el" → "Elindítva").
- Reuse the existing landing pricing section's visual system (cream cards, mono labels,
  `--accent` badges); only the **content and hierarchy** change.

Copy tone stays on-brand (warm, plain, non-judgmental — "Egyedül nem megy"): e.g.
*"Bármikor lemondhatod. Nincs kötelezettség."*

---

## 6. Acquisition → annual migration funnel

| Stage | Trigger | Action | CLV purpose |
|---|---|---|---|
| **Acquire** | Pricing page | Cheap weekly intro / pre-selected annual | Maximize signups without capping CLV |
| **Activate** | First 0–7 days | Drive **first workout completed** (the single best early-retention predictor) | Beat the Day-30 cliff (~4% baseline) |
| **Migrate** | Weekly user, day 10–18 | In-app offer: *"Válts évesre, spórolj 68% hetente"* | Move worst-retention plan → best |
| **Deepen** | Week 3–7 of Foundation | Streaks, community (Szavazz Magadra), progress photos | Habit = retention |
| **Bridge** | ~Week 8 (Foundation ends) | Auto-surface the **next program + a challenge** *before* completion | Kill the post-program churn cliff |
| **Renew** | Month 11 / annual renewal | Reminder + "your progress this year" recap | Reach the 24-month compounding point |

The **post-program churn cliff (~week 8)** and the **January resolutioner cohort** are the two
highest-value interventions. Continuous new content (which you confirmed exists) is the
prerequisite that makes this funnel real — schedule drops so no cohort hits an empty library.

---

## 7. Retention playbook — the four levers you approved

1. **Annual prepay lock-in.** The highest-leverage move. It removes ~11 monthly cancel
   decisions and lifts realized lifetime ~3×. Everything above steers here.
2. **Pause instead of cancel.** At cancel intent, offer a **1–3 month freeze** (single,
   neutral step). Recovers a large share of would-be churn *and* is EU-friendly (respects
   intent). **Must not** be a guilt-trip or a maze (see §8 — confirmshaming is illegal).
3. **Community / streaks / challenges.** Engaged users churn far less. Use the existing
   Szavazz Magadra community, Foundation structure, streaks, and badges as the engagement
   engine. Engagement is the true retention driver; price only sets the ceiling.
4. **Win-back & save-offers.** At the cancel moment and for lapsed users: a downgrade
   (annual→monthly) or a time-boxed discount to extend/restart. Cheaper than re-acquisition.

---

## 8. Compliance guardrails (EU + Hungary) — non-negotiable

Hungary applies the EU consumer framework via **Fgytv** and **45/2014. (II. 26.) Korm.
rendelet** (distance contracts). The "optimized but compliant" posture you chose means:

1. **14-day withdrawal (elállási jog) is effectively mandatory and non-waivable for an
   ongoing digital *service*.** The CJEU has held consumers can't validly waive it for
   streaming-type subscriptions. **Practical effect:** a new subscriber can withdraw within
   14 days; you may charge **pro-rata** for the service actually used *only if* they
   expressly requested immediate start and acknowledged it at checkout. → "No money-back
   guarantee" means **don't advertise a generous refund**, but you **must** honor the
   statutory 14-day cooling-off. Build the checkout consent accordingly.
2. **Auto-renewal transparency (CRD Art. 6/8, UCPD).** *Before* purchase, show — adjacent to
   the price and with equal prominence — that it **auto-renews**, the **renewal price**, the
   **period**, and **how to cancel**. The cheap intro is legal **only** if
   `utána X Ft / időszak, automatikusan megújul` sits right next to the intro price with an
   affirmative opt-in. Hiding the step-up = misleading omission = fine.
3. **Easy cancellation / "cancel" button** (Directive (EU) 2023/2673). Cancelling must be as
   easy as subscribing — a clear in-app/web cancel function, no phone calls or mazes.
   Transposition deadline **19 Dec 2025**, application from **19 Jun 2026** — build it now.
4. **No dark patterns** (UCPD; incoming Digital Fairness Act). Banned: **confirmshaming**
   (guilt-tripping at cancel), hidden renewals, convoluted cancellation, fake urgency. The
   pause/save-offer in §7 is fine as a **single, skippable, neutral** step — one screen, no
   emotional pressure.
5. **VAT (ÁFA 27%) included** in every displayed price; show gross.
6. **Show annualized cost of the weekly plan.** Recommended (and DFA-aligned): displaying
   `≈ 87 880 Ft/év` or the per-week comparison keeps you clean *and* actually makes annual
   look better — honesty and conversion align here.

**Net:** you can run anchoring, decoy, charm pricing, per-week framing, and a cheap intro —
all legal. What you cannot do is obscure the step-up, hide the renewal, block cancellation,
or guilt-trip. None of those are needed for the CLV plan to work.

---

## 9. CLV model (illustrative)

Using `CLV ≈ average revenue × expected lifetime`, benchmark retention, and the prices in §4:

| Plan | Price | ~Expected lifetime* | ~Gross CLV | Notes |
|---|---|---|---|---|
| Weekly (stays weekly) | 1 690 Ft/hét | ~10–15 weeks | ~20–25 000 Ft | High weekly rev, but churns out fast |
| Monthly | 3 490 Ft/hó | ~6–8 months | ~24–28 000 Ft | The reference case |
| **Annual** | 27 900 Ft/év | **~2+ years** (44% reach y2) | **~55–70 000 Ft** | **~2.5–3× the others** |

\*Derived from RevenueCat 12-month retention (weekly 3.4% / monthly 17.5% / annual 44.1%).
Directional, not a forecast.

**Implication:** every percentage point of mix you shift **weekly/monthly → annual** is worth
more than almost any price change. Optimize the funnel for **annual mix**, not for sticker
price.

---

## 10. KPIs & north star

- **North star:** share of the active base on **annual** billing, and **% reaching the
  second annual renewal (~24 months)**.
- **Acquisition:** pricing-page → paid conversion; **annual mix at checkout** (target the
  majority via the §5 layout).
- **Activation:** **% completing first workout in 7 days** (leading indicator of survival).
- **Early churn:** Day-30 retention vs. the ~4% baseline; weekly→annual migration rate.
- **Cliff watch:** week-8 (post-Foundation) and February (post-January) retention.
- **Save rate:** % of cancel-intent recovered by pause/downgrade.
- **Guardrail:** refund/withdrawal rate and chargebacks (a spike = the intro/renewal
  disclosure is too aggressive; back off).

---

## 11. Rollout & experiments

- **Ship v1** as the §4/§5 layout on the existing landing pricing section; wire the three
  plans + intro into Stripe as: `price_weekly_intro` → `price_weekly`,
  `price_monthly` (+ optional `price_monthly_intro`), `price_annual`. Use Stripe's
  trial/`billing_cycle_anchor` + a scheduled price change for the intro step-up, and set
  clear renewal metadata for the cancel/withdrawal flow.
- **First A/B tests, in priority order:**
  1. Annual **per-week framing** (`537 Ft/hét`) vs. per-year (`27 900 Ft/év`).
  2. Presence/absence of the **monthly decoy** (2-tier vs 3-tier).
  3. **Intro on weekly** vs. **intro on monthly** vs. **no intro** — measure *LTV*, not just
     conversion.
  4. Annual **discount depth** (Spórolj 29% vs 33% vs 40%) → find the point that maximizes
     annual mix without eroding margin.
- **Decide by CLV/LTV, never by signup conversion alone** — the whole lesson of §2–3 is that
  conversion and CLV can point in opposite directions.

---

## 12. Sources

- RevenueCat — *State of Subscription Apps 2025/2026* (annual vs monthly vs weekly retention;
  H&F LTV; yearly-plan dominance): https://www.revenuecat.com/state-of-subscription-apps
- Business of Apps — *Health & Fitness App Benchmarks*:
  https://www.businessofapps.com/data/health-fitness-app-benchmarks/
- RetentionCheck — *Fitness App Retention & Churn 2026*:
  https://retentioncheck.com/churn-benchmarks/fitness-apps
- Snoopr — *Mobile App Retention Benchmarks 2026*:
  https://www.snoopr.co/blog/mobile-app-retention-benchmarks-2026-what-good-looks-like-for-fitness-ecommerce-gaming-and-more
- Digital Yield Group — *Health & Fitness Apps: the "Resolutioner" Churn Problem*:
  https://digitalyieldgroup.com/blog/health-fitness-apps-the-resolutioner-churn-problem/
- Subscribe & Conquer — *Mobile App Subscription Pricing* (weekly framing; intro-offer LTV):
  https://www.subscribeandconquer.com/guide/mobile-app-subscriptions
- Apphud — *Pricing Psychology for Subscription Apps*:
  https://apphud.com/blog/subscription-pricing-psychology
- getMonetizely / ConversionXL — *Decoy Effect & tiered-pricing uplift*:
  https://www.getmonetizely.com/articles/the-decoy-effect-how-strategic-pricing-tiers-can-maximize-revenue
- EU Consumer Rights Directive — right of withdrawal (EUR-Lex summary):
  https://eur-lex.europa.eu/EN/legal-content/summary/consumer-information-right-of-withdrawal-and-other-consumer-rights.html
- CJEU — non-waivable withdrawal for streaming subscriptions (Lexology):
  https://www.lexology.com/library/detail.aspx?g=f4162127-e34d-4891-8e4c-63a9eafc3678
- Directive (EU) 2023/2673 — the "cancel contract" button (Arnold & Porter):
  https://www.arnoldporter.com/en/perspectives/advisories/2026/05/eu-withdrawal-button-uk-subscription-rules-and-data-protection-risks-for-us-online-sellers
- Terms.Law — *Dark patterns, subscriptions & the law now*:
  https://www.terms.law/2025/12/05/dark-patterns-subscriptions-and-ai-designed-flows-where-the-law-draws-the-line-now/
- KSH — *Keresetek, 2025* (net median/average wage):
  https://www.ksh.hu/gyorstajekoztatok/ker/ker2509.html
- Hungarian streaming price references (Pénzcentrum / Szukits, 2025):
  https://www.penzcentrum.hu/szorakozas/20251104/mennyibe-kerul-a-disney-plus-elofizetes-havonta-2025-ben-itt-az-disney-plus-csomagok-ara-novembertol-1188045
```
