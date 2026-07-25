# "Kiérdemelt Ár" pricing system — implementation status

Living tracker for the hybrid pricing build (full spec: the implementation plan
provided to Claude Code; strategy: `docs/pricing-strategy.md`). Data layer is
**Firestore**, not the Prisma/Postgres the plan's §2 assumed (adapted per the
plan's "igazodj a meglévő stackhez").

## Architecture decisions (locked in F0)
- **Single source of truth for access:** `subscriptions/{uid}` — one doc holding
  `status` + `accessUntil`. `hasAccess()` reads ONLY this doc via the pure
  `hasAccessFromData()` rule (`src/lib/pricing/types.ts`). Access is never
  re-derived from Stripe status, check-ins, or any other collection.
- **Doc-IDs carry uniqueness/idempotency** (Firestore has no `@@unique`):
  `subscriptions/{uid}`, `checkins/{uid}_{YYYY-MM-DD}` (Budapest day, never UTC),
  `offers/{uid}_{OfferType}`, `milestones/{uid}_{kind}`,
  `stripeWebhookEvents/{eventId}`. Built in `src/lib/pricing/keys.ts`.
- **All prices/windows/thresholds in `src/lib/pricing/config.ts`**, env-overridable
  for the F6 A/B framework. Nothing pricing-numeric is hardcoded elsewhere.
- **Timestamps are epoch ms** in the subscription doc (comparable to `Date.now()`).

## Phase status
- **F0 — Foundations: ✅ DONE & verified.**
  - Config, keys, types, server subscription module + entitlement.
  - Webhook rewritten: transactional dedup-create + business write; fuller event
    set; dunning grace window; EXPIRED on delete.
  - `scripts/seed-stripe.ts` (`npm run seed:stripe`) — idempotent by lookup_key.
  - Firestore rules for the new collections; `.env.example` documented; `tsx` dep.
  - Self-test `npm run test:pricing` (entitlement matrix, Budapest-day, doc-ids).
  - **Verified by execution:** seed run twice against Stripe TEST; independent
    query confirms 1 product, 11 prices, no duplicate lookup_keys, keys match spec.
- **F1 — Pricing page + dual-consent checkout + withdrawal: ✅ DONE.**
  - `/subscribe` rebuilt: 3 tiers, annual hero pre-highlighted ("Legnépszerűbb ·
    Spórolj 44%"), 767 Ft/hét primary; J1 renewal terms at equal weight; J4-clean
    one-off secondary links (no strikethrough, no "kedvezmény"). All figures
    derived from config via `src/lib/pricing/display.ts`.
  - Dual-consent step (both checkboxes empty by default; CTA gated). Consent is
    **persisted server-side before the Stripe session** (`users/{uid}/consents`);
    checkout route re-validates and refuses without it. Consent id flows into
    session + subscription/payment metadata.
  - Checkout route accepts a role (recurring→subscription, one-off→payment).
  - `POST /api/withdrawal`: pro-rata refund + immediate close + emits
    `withdrawal_requested` event (F6) + `notifyAdmin` (guardrail). Events infra
    seeded early (`src/lib/pricing/events.ts`, `events`/`adminNotifications`).
  - Verified: strict tsc, eslint, extended self-test (767/44%/hu-grouping), and a
    visual render of the pricing + consent screens (J4/J1 confirmed by eye).
  - NOTE: weekly recurring enters on the intro price; the intro→standard schedule
    + once-per-user guard are F2.1. User confirmation email on withdrawal is F5.
- **F2 — Weekly machine + reminders + cancel flow: ✅ DONE (both chunks).**
  - **Chunk A ✅ DONE:**
    - F2.1 intro→standard step-up via Subscription Schedule (intro 1 wk → std →
      release). **Test-clock verified: 490 → 1990 transition confirmed** against
      real Stripe (`ensureWeeklySchedule` in checkout-server.ts).
    - Once-per-user intro guard is **server-side at session creation** (checkout
      route reads `weekIntroUsed`; returning weekly buyers get std price directly,
      no schedule). UI can only ever request `week_intro`; the server decides.
    - F1.3 withdrawal now sums **actual Stripe invoices** per-period, so the
      490+1990 two-price first period refunds correctly (pure `refund.ts`;
      self-test asserts the day-10 case = 113 714 minor).
    - Email provider wired (SendGrid v3, `src/lib/email.ts`) + F2.2 day-5 reminder
      (`/api/cron/reminders`, idempotent via milestone doc, `vercel.json` cron,
      CRON_SECRET). Alexa-voice template in `templates.ts`.
    - `weekIntroUsed` + `pausedDaysTotal` fields added to the subscription doc.
  - **Chunk B ✅ DONE: F2.3 J3 cancel flow.**
    - `/app/membership` — single screen, three equal-weight options (pause /
      downgrade / cancel); profile "Tagság kezelése" routes here (no more Portal).
    - Pause 1/2/3 mo (`pause_collection: void` + PAUSED hard-denies access);
      **test-clock verified**: 2-month pause banks the exact remaining paid time
      (27 days back), **no charge while paused**, and `pausedDaysTotal` = ACTUAL
      paused days (60), not requested months. Auto-resume + 3-day reminder in cron.
    - Downgrade monthly→weekly std at period end (schedule, no proration, no intro).
    - Cancel = one action + one confirm screen, access-until shown; skippable
      reason picker AFTER cancel. No confirmshaming, no save-offer (J3).
    - **Visual review passed** (three equal cards, single-confirm cancel, post-
      cancel skippable reason, "hozzáférésed [dátum]-ig aktív").
    - Endpoint: `POST /api/subscription/manage` (pause/downgrade/cancel/reason).
      Events: pause_started / pause_resumed / downgrade_scheduled / canceled.
- **F3 — Earning engine + Grand Slam: ✅ DONE. (F0→F3 launchable MVP complete.)**
  - Check-in (`POST /api/checkin`, `CheckinWeek` bar on the app home) works for
    EVERY user — community mechanic, explicitly separate from the offer engine.
  - Offer engine (`earning-server.ts`) only for WEEK/MONTH; annual/one-off never
    get an offer. Unlock order: (1) offer-doc existence [anti-abuse: cancel→
    resubscribe can't re-earn], (2) eligibility, (3) window count, (4) tx create.
  - Window = day0..day0+6 where day0 = purchase Budapest day (counts as first).
    Self-test covers 23:30 purchase, 5/7 boundary, and the 04:00 makeup vs the
    last window day.
  - Grand Slam `/app/grandslam`: itemized bonus stack, **server-time** countdown,
    written step-up. Redeem via `POST /api/grandslam/redeem` with a **transactional
    gate** (`lockOfferForRedeem`: validates redeemable + not-redeeming, stamps
    `redeemingAt`) BEFORE any Stripe session. Earned→std step-up **test-clock
    verified (34 900 → 39 900)**. Expiry voids the offer (cron), FINAL, quiet
    "lezárult" state — no drama (J4).
  - F3.4 non-earner annual nudge (days 10–18, once) in the cron.
  - Pure logic in `earning.ts`; offer state machine in `types.ts` (OfferDoc).
- **PRE-LAUNCH PACKAGE — 🚧 (reprioritized ahead of F4, timeline-driven):**
  - **F0.6 invoicing (Billingo): ✅ CODE DONE + CONFIGURED. ⏳ verify via first real purchase.**
    API key + `BILLINGO_BLOCK_ID=326476` (block "Számlák") set in `.env.local`
    (also add to Vercel). Key/plan confirmed live (200), org tax_code present.
    NOT verified with a synthetic invoice on purpose — the single block is LIVE
    (real NAV numbering). Verify via the first genuine 490 Ft purchase in the
    smoke test, which issues the first real, legitimate invoice.
    Chose Billingo (v3 REST/JSON, NAV Online Invoice) over Számlázz.hu (XML). Issued
    on `invoice.paid` (subscriptions) and `checkout.session.completed` mode=payment
    (one-off). Gross HUF + `vat "27%"` → Billingo derives the split (J5). Idempotent
    per Stripe ref via `issuedInvoices/{ref}`; failures recorded + cron-retried +
    admin-notified. Env: `BILLINGO_API_KEY`, `BILLINGO_BLOCK_ID` (no-op without).
    Checkout now collects billing name+address (`billing_address_collection`).
    **Cannot be verified here — needs your Billingo key/block + one real invoice.**
  - **F5.1 dunning: ✅ DONE.** `invoice.payment_failed` → PAST_DUE + accessUntil
    extended by 7-day grace (access kept); day-0 email (Stripe hosted-invoice pay/
    card-update link), once per episode. Cron day-3 reminder. `invoice.paid` while
    PAST_DUE → recovery (clears dunning, `dunning_recovered`). Stripe Smart Retries
    = dashboard config (see checklist). Events: dunning_started / dunning_recovered.
  - **Portal route: ✅ DELETED** (`/api/stripe/portal` + `openPortal` removed).
  - **Live-Stripe smoke test: ⏳ YOURS TO RUN** (see Launch checklist).
- F4 — Migration/milestone automations (first post-launch sprint; M2 not needed
  until ~day 60, founder-lock/M11 ~1 year — well within runway).
- F5 (rest) — win-back + full email suite.
- F6 — Measurement/dashboard (events already accumulating).

## Launch checklist (pre-go-live)
1. **Billingo:** ✅ configured (key + block 326476 in `.env.local`). Add both to
   Vercel env. Verify via the first real purchase (step 6) → confirm a valid NAV
   invoice is issued + emailed with the 27% ÁFA split. (Single block is LIVE — no
   synthetic test invoices.)
2. **Stripe (live):** switch to live keys in Vercel; run `npm run seed:stripe`
   against live to create the 11 prices; set the live webhook secret; enable
   **Smart Retries** + failed-payment settings in the Stripe dashboard.
3. **SendGrid:** ✅ configured — key valid, verified sender `hello@szavazzmagadra.hu`
   (name "Alexa"). `SENDGRID_API_KEY` / `EMAIL_FROM` / `EMAIL_FROM_NAME` in
   `.env.local`; add all three to Vercel. (Consider a mail-send-restricted key —
   the current one is full-access.)
4. **Cron:** confirm `CRON_SECRET` set and the Vercel cron is scheduled.
5. **Legacy grandfathering guard** (below) in place before any live legacy sub.
6. **Smoke test (live, small amount — YOU run it):** buy the weekly intro (490 Ft)
   with a real card → verify: access granted, consent doc written, Billingo invoice
   issued, day-5 reminder scheduling, then withdraw within 14 days → verify pro-rata
   refund. Then let a card fail (Stripe test-in-live not possible — use a low-value
   real card decline scenario or a controlled test) → verify dunning email + grace.
7. Remove `STRIPE_PRICE_MONTHLY` once the new pricing is the only path.

## Carry-forward items (must not slip)

### ✅ RESOLVED (F2.3 + pre-launch) — Portal gone
Cancellation runs through the J3-compliant `/app/membership` flow. The
`/api/stripe/portal` route + `openPortal()` are now **DELETED**. Dunning uses the
Stripe **hosted invoice URL** for pay/card-update, so no portal is needed.

### Grandfather legacy monthly subscribers at cutover (first grandfathering use)
`STRIPE_PRICE_MONTHLY` (the old single-plan flow) is still configured. When the
new pricing goes live, any existing subscription on that legacy price must get
`isGrandfathered=true` and stay on its old price — the first real application of
the F4 grandfathering principle ("meglévő előfizetőnek nem emelünk"). **Cheapest
to do now while user count is ~0** (prod Firestore is intentionally empty and
Stripe is not yet live-wired, so there are likely zero real legacy subs today —
but the migration guard must exist before any legacy sub can be created live).
Belongs with F4.4 (`scripts/price-migration.ts --new-cohort-only`).

## Deferred (post-launch)
- F4 automations, F5 win-back + full email suite, F6 dashboard. None gate launch.
