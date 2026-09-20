# LEXFIT — Meta static ads v1 (lead magnet /ujrakezdes)

Research-backed brief, 2026-09-09. Model: **nano_banana_pro** (native 4:5, multilingual
text, 2 cr/gen, edit-based iteration). Master size 4:5 (2k), then 1:1 via image_references.
QA gate: `image_text_detection` OCR must match every Hungarian string exactly (ő/ű
double-acute is the known failure mode — none of the chosen display strings contain them).

Method (research consensus): native/low-polish beats brand-poster; the artifact mockup is
the priority cell ("show the actual thing you get" — Noom/web2app pattern); typographic is
the volume/iteration engine; the no-people interior is the 20% differentiation cell.
Policy shape-check passed: no second-person attribute claims, no body imagery, no urgency.
Keeping weight-loss vocabulary off the ad AND the landing domain also lowers the odds of
Meta Tier-2 health categorization (which would kill Lead-event optimization).

## Ad 1 · Typographic (restart angle — matrix A1, utm s1_h1p2v2)
- Image: flat card, deep green-charcoal #18201d ground, off-white #f1f6f4 headline, sage
  #7a9b8d support line + pill. Almost un-designed, plain statement.
- On-image: „Azoknak, akik már többször újrakezdték." · „7 kérdés, és kész a heti terved
  — ingyen" · pill: „Kérem a tervem" · wordmark LEXFIT
- Primary text: P2 (restart mechanism) + calorie soft line + closer (below).
- Headline field: H1. CTA: Több információ.

## Ad 2 · Plan artifact (demo/free angle — matrix A8, utm s8_h2p4v4)
- Image: the delivered plan-email drawn as the ad. Soft mint #e1f1ea ground; realistic
  minimal email card (sender Alexa, subject „A heti terved" — the real D0 subject), inside:
  „A heted, készen.", week row H K Sze Cs P Szo V with H/Sze/P filled #18201d, stats
  „3 nap · 30 perc · 0 eszköz", small line „+ napi kalória-cél, ha kéred".
- Above card: „7 kérdés, és kész a heti edzésterved" · chip „ingyenes".
- Primary text: P4 (demo) + calorie soft line + closer.
- Headline field: H2. CTA: Több információ.

## Ad 3 · Lifestyle interior (napvégi angle — matrix A7, utm s7_h5p3v5)
- Image: warm evening living room, unrolled mat, lamp light, uninhabited. Text over:
  „A nap végén is elég 20 perc" (off-white) · „ingyenes heti terv · 7 kérdés" (sage).
- Primary text: P3 (napvégi) + calorie soft line + closer.
- Headline field: H5. CTA: Több információ.

## Shared copy blocks
- Calorie soft line (all primary texts, ONLY if ENERGY module is live in prod at launch):
  „Ha kéred, a terved mellé napi kalória-célt is számolunk — ez is ingyenes."
- Closer (all primary texts): „7 kérdés, és kész a heti terved. Ingyen. — Szeptemberi Újrakezdés"
- P2/P3/P4 verbatim from funnel_v2 §2.2 (no number migrations needed — they carry none).

## Generated set (2026-09-09, via Higgsfield MCP, nano_banana_pro)
Finals in `docs/ads/static-v1/` — all six passed the OCR/diacritics gate on eyes-on review.
The Ad 2 artifact was generated WITHOUT the „+ napi kalória-cél" line (ENERGY flags OFF at
generation time); add it back with a single reference-edit if the Art. 9 amendment lands.
- Ad 1 4:5 `ad1-typographic-4x5.png` (job 13d0842b) — v1 misspelled „többzör" + stray quotes; fixed in one edit.
- Ad 2 4:5 `ad2-artifact-4x5.png` (job e8a68fc6) — v1 had a stray leading „ before the headline; fixed in one edit.
- Ad 3 4:5 `ad3-napvegi-4x5.png` (job 29c63d30) — clean on first generation.
- 1:1 versions (jobs 3e651e82 / c5dc4bb7 / 723eedb6) — Ad 1's square needed two retries
  (smeared „újrakezdték", then a garbled wordmark); Ads 2–3 recomposed clean first try.
Iteration lesson recorded: never put Hungarian „" quote delimiters around display strings
inside prompts — the model paints them into the art.

## Launch dependencies
- UJRAKEZDES_ENABLED=true in Vercel Production.
- Calorie line requires the Art. 9 amendment published + ENERGY flags on; otherwise strip
  the calorie sentence and the artifact's „+ napi kalória-cél" line (ads stay valid without).
- Higgsfield account: trial state blocks CLI generation (only_mcp_usage_on_trial_is_available).
