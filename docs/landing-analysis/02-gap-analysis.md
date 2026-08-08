# Landing gap analysis — Phase 2: what the market has that we don't

Synthesis of three research passes (2026-08-07): (a) live teardowns of 8
fitness landing pages — Peloton App, Apple Fitness+, Centr, FitOn, Sweat,
Grow with Anna, Sydney Cummings/Royal Change, Heather Robertson (+ MadFit and
Alo as outliers); (b) the Hungarian online-fitness market (Rubint Réka/
Alakreform, Béres Alexandra, Katus Attila, iGym, Gymflix, Gyerünk anyukám!,
Anyatest, Fitt Kontroll, Kikkafitness); (c) CRO evidence base (Unbounce CBR,
NN/g, Baymard-derived, CXL, RevenueCat 2025/26, Deloitte). Source URLs in the
research transcripts; effect sizes below are directionally reliable,
magnitudes vary.

**Cluster identification:** LEXFIT is a *creator-cluster* product (single
founder-trainer, structured program + library, web checkout). Closest analog:
Grow with Anna (European, single female trainer, EUR, Stripe, quiz-first).
Closest program-presentation analog: Heather Robertson ("12 weeks · 60
workouts · 30–60 min · equipment" cards — LEXFIT's Foundation journey already
does this well). Closest Hungarian analog: Béres Alexandra (person-brand
subscription) and Gyerünk anyukám! (the local trust-wall benchmark).

---

## 1. Must-have gap table (consensus elements: 7–8 of 8 benchmark pages)

| # | Consensus element (8-page benchmark) | LEXFIT today | Gap |
|---|---|---|---|
| M1 | Trial/low-risk-first hero CTA with explicit terms at the button ("Try 30 days free", "Pay nothing today", "Cancel Anytime • Risk-Free" directly under CTA) | Hero states 490 Ft intro + cancel-anytime in a small mono line below the row; CTA itself says only "Kezdd el a programot" → `/login` | **Partial.** Move risk-reversal microcopy to the button's immediate vicinity; CTA should carry the offer ("Első heted 490 Ft") |
| M2 | 3–4 benefit blocks | Present (app intro + panels) | ✅ none |
| M3 | Program showcase with concrete specs | Foundation journey — best-in-class | ✅ none (fix data mismatches, see 01 §3.7) |
| M4 | ≥1 social-proof band (ratings OR testimonials OR member counts) | **Zero.** No testimonial, no rating, no count except "17 000+" buried in founder story | **Total gap — the single largest.** See §4 cold-start options |
| M5 | Founder/trainer credibility block with real face + credentials | Placeholder gradient cards, section 14 of 15 | **Critical for creator cluster** — every creator page leads with the person |
| M6 | Cancel-anytime near every price | Present on all cards + trust row | ✅ none — above market |
| M7 | Repeated CTA every ~2 sections | Present (panel CTAs → #elofizetes) | ✅ structure fine; CTA *wording* weak (§3 C2) |
| M8 | Community section | One FB-community number; no section, no Instagram | Partial — real 17k FB group is unmentioned as a *joinable thing* |
| M9 | FAQ answering the free-alternative objection (present on every paid app vs free YouTube: Apple, Sweat, GwA, HR) | None | **Total gap.** #1 required question in HU framing: "Miért fizessek, ha a YouTube ingyen van?" (+ beginner?, equipment?, cancel?, TV?, férfiaknak is?) |
| M10 | Annual steering when pricing shown | Present (centered, badged, per-week framing) | ✅ none |

## 2. Hungarian-market must-haves (local trust kit)

| # | Local norm (observed across HU competitors) | LEXFIT today | Gap |
|---|---|---|---|
| H1 | **ÁSZF + Adatvédelmi tájékoztató + impresszum with Kft. details** in footer — absence is a recognized scam tell | Footer links are `href="#"`; no company identity anywhere | **Blocker.** Statutory (e-commerce + UCPD) and the first thing a skeptical HU buyer checks |
| H2 | Card-payment trust via recognizable rails: SimplePay (OTP) / Barion logos; card-brand logos. Stripe has no consumer recognition in HU | "Biztonságos fizetés · Stripe" text only | Show **card logos (Visa/MC) + "biztonságos bankkártyás fizetés"**; keep Stripe as the processor, drop it as the *trust word*, or pair it with card logos |
| H3 | Person + credentials as #1 trust device ("20 év edzői tapasztalat", competition titles, physio MSc) | "10 év versenysport mögötte" in 11px 60%-opacity mono | Promote to a proper credential block with Alexa's name, face, and specifics |
| H4 | Trial / day-pass before commitment (free week standard; day pass 1,190–1,990 Ft) | 490 Ft intro week — **cheaper than any local day pass** | ✅ genuinely strong offer — currently under-marketed; "kevesebbe kerül, mint egy napijegy bárhol" is a free local anchor |
| H5 | "Bármikor lemondható" near CTA | Present | ✅ |
| H6 | Community = closed Facebook group (the default HU venue; Gyerünk anyukám & Fitt Kontroll both use it) | Real 17k FB group exists, page barely mentions it | Make the FB community an explicit, honest membership benefit (replaces the fake "invite friends" block) |
| H7 | Social proof norm = named testimonials + kg lost + before/after | None (and body-numbers conflict with brand guardrails) | Deviating from the local norm is a *deliberate differentiator* — but it must be replaced with substitute proof (§4), not with nothing |
| H8 | Realistic-frequency framing (forums flag 5×/week for beginners as a scam signal) | Landing leads with "heti 5 nap" as the only rhythm | Soften: real product supports 3–5 chosen weekdays; say "heti 3–5 nap — te választod" to defuse the known skepticism trigger |
| H9 | Price-band awareness: HU online fitness clusters at ~4,900–5,000 Ft/mo (Béres 4,990, iGym 4,900); gym 15–30k; pilates class 4–4.5k | Monthly 5,990 Ft is ~20% **above** the local band; annual works out to ~3,325 Ft/mo (below band); intro 490 Ft (floor) | Not a copy bug but a positioning fact: the page must justify the premium (guided program + modern app + person) or lean harder on annual/per-week framing, which is already good |
| H10 | Skepticism triggers to avoid: "gyors eredmény", hidden prices, anonymous team | Prices transparent ✅; team anonymous ❌ (no real Alexa); no speed promises ✅ | Fix the anonymity |

## 3. CRO-evidence gaps (directional effect sizes from documented tests)

| # | Evidence | LEXFIT today | Gap / action |
|---|---|---|---|
| C1 | **Quiz funnel as primary CTA** — Centr & GwA make it the dominant CTA; Noom/BetterMe pattern; front-loaded commitment counters the 55%-of-cancellations-on-day-0 problem | 7-question personalization onboarding **already built** (`/onboarding`), but hero CTA goes to `/login` | Surface the quiz on the landing: "Állítsd össze a saját tervedet — 2 perc" → `/onboarding`. Near-zero build cost, highest-leverage single change |
| C2 | First-person possessive CTA copy: "Start My Free Trial" vs "Sign up" +90–104% CTR in Unbounce tests | "Kezdd el a programot" (imperative, generic) | Test possessive/outcome forms: "Kérem az első hetem 490 Ft-ért", "Összeállítom a tervem" |
| C3 | Sticky bottom CTA on mobile: +14–31% in large-N studies; sticky elements ~2× A/B win rate on mobile | Sticky top pill exists on desktop; no mobile-specific sticky CTA; 5 nav links likely crowd ≤560px | Add a mobile sticky bottom bar: offer + one CTA |
| C4 | Social proof placement: NN/g — trust signals are read at the *decision* moment; put proof next to pricing/CTA, not only in a band | No proof anywhere | When proof exists (§4), place at hero-adjacent AND beside the price grid |
| C5 | Guarantees: +11–21% orders in CRE tests; but transparent terms beat generous-sounding vague ones (+18% from explaining cancellation) | "14 napos garancia" over-promises vs pro-rata reality (01 §3.15) | Reword precisely; precision *is* the conversion feature for skeptics |
| C6 | Reading level: ≤7th-grade copy converts ~56% better than complex copy | Copy is generally simple ✅; a few abstractions ("korlátlan lehetőség") | Minor pass |
| C7 | Click-to-play video (lightbox) doubled conversion vs autoplay/inline in 2026 benchmarks; autoplay hero video hurts LCP | Showcase is an auto-playing placeholder tour | When Alexa footage exists: thumbnail + click-to-play of a *real workout minute*, not autoplay |
| C8 | Speed: 0.1s mobile improvement → +8% conversions (Deloitte) | Currently image-free and fast; risk arrives with photography | Budget: hero image = LCP; AVIF/WebP, preload, keep < 2.5s LCP |
| C9 | Message match: ad → headline consistency | N/A yet | Note for future paid traffic: quiz-funnel ads should land on quiz-first variant |
| C10 | Multi-step > single form for paid asks (+59% to +743% in tests) | Funnel is onboarding-wizard style already ✅ | Keep; don't collapse to a bare signup form |
| C11 | Fake urgency destroys trust (60% of shoppers test countdown timers); safe urgency = real cohort dates | No urgency at all (clean) | Optional later: real challenge-cohort dates ("A következő kihívás szeptember 1-jén indul") — GwA pattern, matches built Kihívások |
| C12 | OG/social meta: shared links with no card get materially fewer clicks (hygiene, not A/B) | No OpenGraph/Twitter meta, 1-line description | Add full meta + share image |

## 4. The cold-start social-proof problem (no reviews at launch)

LEXFIT can't show 549K ratings. Evidence-backed substitutes, in order of
availability today:

1. **Founder stats block** (available now): 10 év versenysport · 17 000+ fős
   ingyenes közösség · X ezer levezetett edzés/óra — the creator-cluster
   standard (HR uses "2.85M subscribers / 1000+ workouts / 16 years").
2. **Named early-member quotes with photos** (collect from the existing FB
   community now): per HU norms names+faces matter; per brand guardrails,
   quote *energy/consistency/confidence* outcomes, not kg. GwA's "94% feel
   more confident" style fits the no-body-numbers rule; Gyerünk anyukám's
   kg-wall does not.
3. **Aggregate activity counters once real** (later, wire to Firestore):
   "N edzés fejeződött be a héten" — the Gyerünk anyukám "4,286 workouts this
   week" pattern; honest, body-neutral, and it compounds.
4. **External validation links** (NN/g: on-site-only proof is discounted):
   link the FB group and Alexa's public profiles — let skeptics verify her.

## 5. Rare differentiators worth stealing (2/8 pages or fewer)

| Pattern | Source | LEXFIT fit |
|---|---|---|
| "App vs YouTube vs gym" comparison table | GwA only | Direct fit — answers the objection LEXFIT will face most in HU; LEXFIT column wins on: vezetett program, magyar nyelv, sorrend + progresszió, közösség, TV-casting, honest tracking |
| Quiz→discount tie-in | Centr | Optional: quiz completion unlocks the 490 Ft intro framing |
| Outcome-stats band (non-body) | GwA | Once data exists ("a tagok X%-a a 4. hétnél is edz") |
| Cohort challenge with date | GwA | Kihívások is built; a dated cohort is real urgency |
| "No download, runs in browser, casts to TV" as sold feature | HR | **True today** — LEXFIT's web-app nature is an advantage, currently framed only as casting |
| QR desktop→phone handoff | Apple Fitness+ | LEXFIT already ships QR handoff in Finish Share; reusable pattern for "continue on your phone" at signup |
| Earned/loyalty pricing | *No benchmark page has this* | **Kiérdemelt Ár / Grand Slam is a unique, honest differentiator — put it on the page** |

## 6. Anti-patterns the page correctly avoids (keep it that way)

- No fake countdown/scarcity (fine to keep zero urgency until real cohorts).
- No strikethrough fake discounts (deliberate J4 decision — locally ubiquitous
  but trust-eroding; keep).
- No hidden pricing (Fitt Kontroll/SHE hide prices and it reads poorly).
- No before/after body imagery (Meta ad-policy risk + brand guardrail).
- Long page for a cold paid ask is *correct* per evidence — don't shorten it;
  fix what fills it.

## 7. Priority order (gap severity × cost)

**Blockers before paid traffic:** H1 legal footer · false-claims purge (01 §4)
· M5 founder block with real face · M4 minimum viable proof (founder stats +
2–3 named quotes).

**High leverage, low cost:** C1 quiz CTA to `/onboarding` · M9 FAQ (6 items)
· C3 mobile sticky CTA · H2 payment logos · C12 OG meta · H8 frequency
softening · C2 CTA copy tests.

**Medium:** comparison table · Kihívások section + finish-share showcase
(from 01 §5) · community section around the real FB group · C5 guarantee
rewording (also legal).

**Later / needs assets or data:** click-to-play real video (C7) · activity
counters (§4.3) · cohort dates (C11) · outcome stats band.
