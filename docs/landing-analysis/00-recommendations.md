# Landing analysis — prioritized recommendations (master list)

Rollup of `01-page-analysis.md` (persuasion/trust + claim audit),
`02-gap-analysis.md` (market/CRO gaps), `03-uxui-audit.md` (heuristic +
hedonic). 2026-08-07. References like "01 §3.7" point into those docs.

Guiding decision (owner, 2026-08-07): audience is **men and women**; structure
may be challenged; deliverable was analysis-only — nothing below is
implemented yet.

---

## P0 — Blockers before any paid traffic (truth + legality)

| # | Action | Why | Source |
|---|---|---|---|
| P0.1 | **Delete the Health/Naptár sync claim** (progress panel) | Named, verifiable, technically impossible integration; UCPD exposure | 01 §3.10 |
| P0.2 | **Delete/replace the badges section** (water/sleep/gratitude tiers) → rebuild around real mechanics: forgiving streak + megfigyelések + Grand Slam | 6 of 12 tiers name nonexistent features | 01 §3.11 |
| P0.3 | **Delete or "hamarosan" the recipes panel + carousel + nav link** | Paid-tier value claim with zero product | 01 §3.13 |
| P0.4 | **Rewrite the follow-along paragraph**: Alexa (singular), real themes (Alsótest/Felsőtest/Cardio+has/Teljes test/Mobility/Tartás), drop "minden héten új órák"; fix the "velem/lennének" grammar break | Two false claims + broken sentence in the page's 3rd section | 01 §3.3 |
| P0.5 | **Replace the "korlátlan lehetőség" block** (fake plan-builder + friend invites) with the real Kihívások section | Both sentences unbacked; the honest replacement is already built | 01 §3.8, §5.1 |
| P0.6 | **Real footer**: ÁSZF, Adatvédelmi tájékoztató, impresszum with company details; kill the `href="#"` no-ops | Statutory in HU; #1 local scam-tell; also an a11y trap | 02 H1, 03 E16 |
| P0.7 | **Fix the guarantee wording** to match the pro-rata withdrawal ("14 napos elállási jog, időarányos visszatérítéssel") or upgrade the refund logic for the intro week and scope "garancia" to it — also at `/login` and onboarding paywall copy | Copy promises full money-back; code refunds unused fraction; strategy doc explicitly warned | 01 §3.15 |
| P0.8 | **Resolve 2-fázis vs 4-seeded-phases** (likely fix the seed: `phase = Math.floor(w/2)` intent per prog-data comments) and align the journey weekday strip to the real H-K-Cs-P-Szo split | Contradicts the app one click after signup | 01 §3.7 |
| P0.9 | Singularize "Válassz egy programot"; soften "heti 5 nap" to "heti 3–5 nap — te választod" | One program exists; 5×/week-for-beginners is a documented HU skepticism trigger | 01 §3.6, 02 H8 |

## P1 — The conversion core (person + proof + entry)

| # | Action | Why | Source |
|---|---|---|---|
| P1.1 | **Founder block with a real face, moved into the top third**: Alexa's name, photo, credentials (10 év versenysport, specifics), 17k community — plus keep the promise-stack finale late as the emotional close | Creator-cluster pages convert on the person; page currently has zero humans | 01 §3.14, §7; 02 M5/H3 |
| P1.2 | **Quiz CTA**: lead the hero with "Állítsd össze a saját edzéstervedet" → `/onboarding` (the built 7-question flow); demote `/login` to secondary ("Már tag vagy?") | Highest-leverage single change; Centr/GwA pattern; near-zero build cost | 02 C1 |
| P1.3 | **Minimum viable social proof**: founder-stats band + 2–3 named FB-community quotes (photos; energy/consistency outcomes, no body numbers) — placed hero-adjacent AND beside pricing | Zero proof on page; NN/g decision-moment placement | 02 M4, §4, C4 |
| P1.4 | **FAQ section** (~6 items): miért fizessek, ha a YouTube ingyen van? · kezdőknek? · férfiaknak is? · milyen eszköz kell? · hogyan mondom le? · megy TV-n/böngészőben? | Present on every benchmark page that fights a free alternative; answers the audience question in-page | 02 M9 |
| P1.5 | **Audience line** in hero ("Nőknek és férfiaknak, minden szinten") + de-feminize the 9 coverflow sample titles | New mixed-gender positioning is invisible; sample titles set a female frame | 01 §3.1/3.4 |
| P1.6 | **Mobile sticky bottom CTA** (offer + one button) and a mobile variant of the sticky pill (wordmark + CTA only) | +14–31% evidence; current 5-link pill likely overflows ≤560px | 02 C3, 03 §5.1 |
| P1.7 | **Hero risk-microcopy at the button**: "Az első heted 490 Ft · bármikor lemondható" directly under the CTA; test first-person CTA copy ("Összeállítom a tervem") | Button-adjacent risk reversal is the 8/8 consensus pattern; +90–104% CTA-copy evidence | 02 M1/C2 |
| P1.8 | **Sell the shipped differentiators**: Kihívások section (P0.5), finish-share selfie strip, honest Mux-verified completion ("a pipa nálunk azt jelenti, tényleg megcsináltad"), Kiérdemelt Ár/Grand Slam teaser, web-app advantage ("nem kell letölteni — böngészőben fut, TV-re küldhető") | Free conversion material, all built, all unique vs local competitors | 01 §5, 02 §5 |
| P1.9 | **OG/Twitter meta + share image + richer description** | Shared links currently render bare | 02 C12 |
| P1.10 | Payment trust: card logos + "biztonságos bankkártyás fizetés" (Stripe stays processor, loses top billing) | Stripe has no HU consumer recognition | 02 H2 |

## P2 — UX/feel upgrades (03)

| # | Action | Source |
|---|---|---|
| P2.1 | Smooth anchor scrolling (+ `scroll-margin-top`), PRM-guarded; earlier reveal trigger (rootMargin) so nav jumps don't land on half-empty bands | 03 C8/C10 |
| P2.2 | Sticky-nav adaptive material over dark bands + benefit-word labels (drop RECEPTEK; rename VALÓS IDEJŰ/HALADÁSOM for strangers) | 03 B6/C9 |
| P2.3 | Coverflow: pointer-drag with velocity + snap (or at minimum arrows + keyboard access — cards are currently unreachable by keyboard) | 03 A1 |
| P2.4 | Journey day rows clickable (set tick on click) | 03 A2 |
| P2.5 | Price-anchor count-up on first reveal (PRM-guarded) | 03 §3 |
| P2.6 | Type floor: no mono label below 11px; raise hero trust/price lines to ≥12px ≥80% opacity | 03 B4/B5 |
| P2.7 | Journey `max-height` loop → cheaper animation (grid-rows/transform); single active auto-player arbiter; one ambient motion in hero, not two | 03 D11–13 |
| P2.8 | Card press states (match `.pill:active`); scrim guard behind trainer-card text; pricing-grid top padding for the badge | 03 §3, B7, E15 |
| P2.9 | Consolidate CTA taxonomy to two frames (start/quiz vs choose-plan) | 03 E18 |
| P2.10 | Keyboard/a11y pass: focus treatment on all interactive cards, remove focusable no-ops | 03 E16/E17 |

## P3 — Later / needs assets or data

- Real photography everywhere (hero = LCP: AVIF/WebP, preload, <2.5s budget) — 02 C8.
- Click-to-play real workout minute replacing/augmenting the showcase (lightbox pattern, not autoplay) — 02 C7.
- "App vs YouTube vs edzőterem" comparison table — 02 §5.
- Community section around the real FB group (join link, honest numbers, "Alapító jelvény" perk) — 02 H6.
- Real activity counters ("N edzés fejeződött be a héten") wired to Firestore — 02 §4.3.
- Cohort urgency with real Kihívások dates — 02 C11.
- Price positioning note: monthly 5,990 Ft is ~20% above the local 4,900–5,000 band — either justify the premium visibly (guided program + app + person) or keep steering annual (767 Ft/hét ≈ below-band) — 02 H9.
- "17 000+" → shared constant + resolve the open reconciliation note — 01 §4.14.
- Panel sheen sweep on first reveal; mobile on-device verification list — 03 §3/§5.

## Suggested narrative order (structure change, owner-approved to challenge)

Hero (Alexa in photo, audience line, quiz CTA) → Founder intro (short, face +
stats) → App intro → Follow-along (honest) → Coverflow → Foundation journey →
**Kihívások** → Cast/web-app → Progress (honest) + streak/Grand Slam →
Showcase (real screenshots) → Price anchor → Founder finale (promise stack) →
Pricing + FAQ → real footer. Two moves + two swaps; everything else stays.
