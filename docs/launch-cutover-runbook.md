# LEXFIT — Phase 7 live cutover runbook

Follow in order, in one sitting. Owner + Claude together; ~60–90 min including the
smoke test. Prereq: the console checklist below is done.

## A. Console prerequisites (owner, before the session)

| # | Where | What | Status |
|---|---|---|---|
| A1 | Firebase console → Authentication → Templates | Action URL → `https://www.lexfit.hu/auth/action`; Hungarian template text | ☐ |
| A2 | Firebase console → Authentication → Sign-in method | Enable Apple (Services ID + key from Apple Developer) | ☐ |
| A3 | sentry.io | Create Next.js project; put `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` into Vercel prod env | ☐ |
| A4 | SendGrid → Sender Authentication | Authenticate `lexfit.hu` domain; then set `EMAIL_FROM=hi@lexfit.hu` (or noreply@) in Vercel | ☐ |
| A5 | Mux dashboard → Settings → Webhooks | Add `https://www.lexfit.hu/api/mux/webhook`; put its signing secret into Vercel `MUX_WEBHOOK_SECRET` | ☐ |
| A6 | Stripe dashboard (LIVE) → Settings | Statement descriptor (e.g. `LEXFIT.HU`); Billing → retries: Smart Retries ON; (receipts optional — Billingo emails the NAV invoice) | ☐ |

Already done by CLI (2026-08-08): Firestore PITR enabled (7-day), TTL policy on
`shareSessions.purgeAt`, indexes deployed, all other Vercel env mirrored.

## B. Stripe live wiring (Claude drives, owner supplies keys)

1. **Live keys into Vercel prod** (owner pastes; never into chat/files):
   `STRIPE_SECRET_KEY` = `sk_live_…` (or a restricted key with read+write on
   Customers, Checkout Sessions, Subscriptions, Subscription Schedules, Invoices,
   Refunds, Prices/Products), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_…`.
2. **Live webhook endpoint**: Stripe dashboard (LIVE) → Developers → Webhooks →
   Add endpoint `https://www.lexfit.hu/api/stripe/webhook`, events:
   `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
   → put the signing secret into Vercel `STRIPE_WEBHOOK_SECRET`.
3. **Seed the live catalog**: locally set the live key in `.env.local`
   temporarily → `npm run seed:stripe` (idempotent; creates 1 product + 11
   lookup_key-bound prices) → `npm run audit:stripe` must print
   "No legacy/grandfathered subscriptions" → restore the test key in `.env.local`.
4. **Redeploy** production (Vercel picks up the new env).

## C. Live smoke test (real money — 490 Ft; owner's own card)

1. Owner registers a fresh account through `https://www.lexfit.hu/register`
   (real e-mail), completes the 490 Ft weekly intro purchase in the embedded checkout.
2. Verify, in order:
   - `/app` loads with access (hard gate admits); `subscriptions/{uid}` in prod
     Firestore: `ACTIVE`, `WEEK`, `weekIntroUsed`, `accessUntil` ≈ +7d.
   - Stripe LIVE dashboard: subscription on `price_week_intro_490` **with a
     subscription schedule** stepping to `price_week_std_1990` (webhook attached it).
   - `users/{uid}/consents`: one doc.
   - **Billingo**: invoice issued from block `326476`, **AAM** (no VAT), e-mailed.
     ← first-ever live Billingo call; if it failed, check `issuedInvoices/{ref}`
     status + admin notification, fix env, wait for the daily cron retry (or re-trigger).
   - Reset-password e-mail lands on the HU `/auth/action` page (A1 verification).
3. **Controlled decline**: in `/app/membership` nothing to do — instead test
   dunning later via Stripe test clocks OR accept the F5.1 design as-is (already
   test-verified). Optional now.
4. **Withdrawal**: the owner exercises the 14-day elállás from the account
   (`/app/membership` → via support or the profile flow) → verify pro-rata refund
   in Stripe + confirmation e-mail + access closed. (This also legally cleans up
   the smoke purchase.)

## D. Post-cutover

- `npm run audit:stripe` against live (expect: only catalog subs).
- Watch Sentry + Vercel logs for the first organic signups.
- Content upload via `/admin` (Phase 8): Szűrők → Mentés (bootstraps taxonomy)
  → videos (Mux upload → finalize publishes) → programs playlist → challenges.
- Launch checklist (plan §Phase 8): robots/sitemap live, legal pages linked,
  crons firing (Vercel log + GH Actions), backup verified, uptime monitor armed.
- Fill the effective date in `docs/legal/*.md` + redeploy legal pages.
