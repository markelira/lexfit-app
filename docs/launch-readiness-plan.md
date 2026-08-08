# LEXFIT — Launch-readiness plan

**Date:** 2026-08-08 · **Status:** PROPOSED (awaiting owner approval; no changes executed yet)
**Basis:** four parallel audits of the full tree — security, cleanup inventory, Stripe/payments readiness, launch gaps. Every finding below was verified in code, not assumed.

**Locked scope decisions (from owner, 2026-08-08):**
- Full public launch, real payments from day one. No hard date (2+ months runway).
- Plan first → execute phase by phase after approval.
- Stripe live mode is already activated (business verification done).
- All four in-flight features ship at launch: embedded pay-to-join /register wizard, Kihívások, Finish Share, Profil V2 (already unflagged — done).
- Legal content: nothing exists; Claude drafts, owner reviews with a lawyer.
- Prod operations: Claude executes directly, confirming before each irreversible step.
- Landing ships as-is content-wise. ⚠️ Flagged anyway: the public homepage currently renders 9 striped `„Kép helye — később töltöm fel"` placeholder boxes and a Canva stock-template hero — see P6 owner-asset items; recommend at least removing the visible placeholder labels before launch.

---

## 0. The big picture

The app is in much better shape than a typical pre-launch codebase. The audits **verified clean**: admin auth gating (all 10 `/api/admin/*` + Mux upload routes), Stripe & Mux webhook signature verification, unforgeable client entitlements, Mux paid-gating (signed 6h JWTs behind `hasAccess`), no CSRF/XSS/SSRF surface, no tracked secrets, emulator wiring properly env-guarded, Firestore rules production-appropriate, `npm run build` passes, no USD/HUF mismatch (landing derives everything from the pricing config).

What stands between today and launch falls into six buckets, most-critical first:

| # | Priority area | Why it's ranked here |
|---|---|---|
| **P1** | **Legal & compliance** | Four live links — including the paid-consent checkbox at the moment of charging — point to `/aszf`, **which does not exist**. Charging EU consumers without ÁSZF/privacy/impressum is illegal, and the consent records we're already writing reference a nonexistent document. Longest external lead time (lawyer review). |
| **P2** | **Prod-safety & security hardening** | One High (Storage rules accept any file type/size from any authed user → unbounded billing), three fail-open cron routes, five seed scripts that write mock data **into production Firestore** if invoked without emulator env (`npm run seed` does exactly that today), missing security headers. Mostly one-line fixes; do first so nothing bites while we work. |
| **P3** | **Production infrastructure & ops** | No error monitoring at all, Firestore composite indexes almost certainly never deployed (two crons would die silently with FAILED_PRECONDITION), no backup story for paid users' data, 2 of 3 crons on a fragile GitHub-Actions scheduler that auto-disables after 60 days of inactivity, no custom domain / `NEXT_PUBLIC_APP_URL`, half the prod env (SendGrid, Billingo, CRON_SECRET) never mirrored to Vercel — and email/invoicing **silently no-op** when env is missing. |
| **P4** | **Content pipeline unblock** | On empty prod Firestore, the admin CMS **cannot author content**: the filters API is update-only (404s on missing docs), so `admin/videos/new` renders empty selects and no video can ever be tagged. `challengeFilters` and `settings/challenges` have no editor at all. This blocks the entire "upload real content" step. |
| **P5** | **Feature completion + Stripe live cutover** | E4 pay-to-join hard gate not built (unpaid users browse everything; landing pricing cards bounce anonymous visitors to `/login`); no embedded checkout has ever been verified end-to-end even in test mode; live keys/webhook/price-seed/dashboard config all pending; Kihívások & Finish Share need final QA passes. |
| **P6** | **Truthfulness & cleanup** | Fake community screen (`/app/szm`, "1 248 tag") linked in the live nav; six named "members" with fabricated stats shown after every real workout; "8 hét / heti 5 nap" claims that violate the recorded owner rule; unverifiable "17 000+ / 1 200+ / 200+" numbers; dev preview routes publicly crawlable; dead code. Cheap, but it's what users see. |

Execution order interleaves these (safety first, legal early because of lead time, Stripe cutover late so live keys only exist once everything around them is solid, content upload last).

---

## Phase 0 — Baseline: commit, guard, quick wins  *(effort: S · prerequisite for everything)*

**0.1 Commit the uncommitted landing/funnel work.** The 6 modified files + `docs/landing-analysis/` + `public/hero-alexa.jpg` are one coherent unit (the landing truth-purge; typecheck-clean per `docs/landing-analysis/FIX.md`) and carry the legally-more-correct „elállási jog" wording. Everything after builds on top.

**0.2 Guard the prod-dangerous scripts.** Add a top-of-file hard-exit unless `FIRESTORE_EMULATOR_HOST` is set (override flag `--i-really-mean-prod`) to: `scripts/seed.mjs`, `seed-challenges.mjs`, `attach-emulator-video.mjs`, `attach-emulator-challenge-video.mjs`, `attach-test-video.mjs`. Delete the prod-targeting `seed` / `seed:challenges` npm aliases (prod content comes via /admin). Remove the plain-`npm run seed` advertisement from `README.md:30`.

**0.3 One-line security fixes (from the audit):**
- **Storage rules (HIGH):** `storage.rules:14-19` — add `request.resource.size < 10MB && request.resource.contentType.matches('image/.*')` to the user-write rule (the comment already claims this exists); deploy.
- **Cron routes fail closed:** all three routes use `if (secret && …)` — flip to `if (!secret || …) return 401` (`api/cron/{purge-accounts,reminders,workout-reminders}/route.ts`).
- **`/api/health`:** stop returning `FIREBASE_ADMIN_PROJECT_ID` and raw admin-SDK error strings; return `{ok}` only.
- **`/api/mux/token`:** require `status == "published"` before signing (`route.ts:26-30`) — currently any draft/archived video with a playback ID is streamable by entitled users.
- **Origin fallback:** `api/stripe/checkout/route.ts:72` and `api/grandslam/redeem/route.ts:34` fall back to `http://localhost:3000` for Stripe return URLs — replace with canonical prod URL env (`NEXT_PUBLIC_APP_URL`).

**0.4 Delete dev surface + dead code.** Routes `/cards-preview`, `/finish-preview` (both public, no auth, no robots.txt exists). Dead files (zero import sites, verified): `Stub.tsx`, `AdminStub.tsx`, `CheckinWeek.tsx(+css)`, `FormatGlossary.tsx(+css)`, `ProgramOverviewModal.tsx`, `onboarding/PlanCard.tsx`, `lib/display-name.ts`; with the preview routes gone also `CourseCardTV.tsx`, `CourseCardShelf.tsx`, `course-cards.css` (keep `ProgramMark`/`ProgramLockup` — live via `WorkoutDetail`). Also: move `public/onboarding/README.md` out of `public/` (currently a public URL exposing internal art direction), delete Next scaffold SVGs, delete stale `/Users/mark/package-lock.json` (build warning), fix stale comment `EditorModal.tsx:9`.

---

## Phase 1 — Legal & compliance  *(effort: M for drafts + external lawyer lead time — START EARLY)*

**1.1 Draft the documents (Claude drafts → owner + lawyer review):**
- **ÁSZF** (general terms — subscription tiers incl. Kiérdemelt Ár mechanics, 14-day elállási jog with pro-rata rules matching `/api/withdrawal`, pause/cancel terms matching `/app/membership`).
- **Adatkezelési tájékoztató** (GDPR privacy policy — Firebase/EU-Frankfurt, Mux viewing data, Stripe, Billingo NAV invoicing, SendGrid, progress photos as owner-private data, 30-day deletion purge, data export right — the export/erase machinery already exists and should be cited).
- **Impressum / seller identity** (HU 45/2014 Korm. r. + Ekertv. requirements — company data, contact).
- **Cookie/local-storage notice** — currently defensible without a banner (no third-party scripts); write the policy so adding analytics later doesn't start from zero.

**1.2 Build the routes + wire every link.** `/aszf`, `/adatvedelem`, `/impresszum` (static, styled, printable). Fix the four 404 links: `AuthScreen.tsx:429`, `RegisterForm.tsx:245`, `OnboardingV2.tsx:835-836` (`/terms`,`/privacy` → real routes), `EmbeddedPay.tsx:92`. Replace landing footer `href="#"` (`LandingPage.tsx:1043`) with real links + impressum block.

**1.3 Consent-integrity fixes:**
- `EmbeddedPay.tsx:98` still says „14 napos pénzvisszafizetési garancia" — reword to elállási jog (strategy §8 explicitly forbids marketing it as money-back; the landing + AuthScreen were already fixed in the uncommitted diff).
- Email-reminder consent: the opt-in card designed in `_mock.ts:210-217` is never rendered and `src/lib/prefs.ts` hardcodes reminders `enabled: true` — render a real opt-in (or at minimum surface the toggle prominently + mention in the privacy policy) before launch.
- `api/withdrawal/route.ts:118` TODO: send the user a confirmation email on withdrawal (consumer-law relevant; SendGrid is already wired).

---

## Phase 2 — Security hardening (rest)  *(effort: S–M)*

- **Security headers** in `next.config.ts`: `X-Frame-Options: DENY` (or CSP `frame-ancestors`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS, `Permissions-Policy`. The logged-out QR finish-share page is an ideal framing target today.
- **Rate limiting** on expensive authed endpoints, modeled on the existing `/api/account/export` limiter: `/api/progress/sync` (fans out to ~100 Mux fetches per call), `/api/stripe/checkout` (writes a consent doc + creates a session per call), `/api/finish-share/session`. Verify the Firestore TTL policy on `shareSessions.expiresAt` actually exists in the console (nothing in the repo creates it).
- **`robots.txt` + `sitemap.ts` + `not-found.tsx` + root `error.tsx`** (zero App Router error/loading/404 files exist — any render-throw shows Next's unstyled default).
- Optional (accepted-risk today, revisit if pricing ever keys off progress): make `users/{uid}/progress` server-write-only in rules (self-forgeable vanity stats, L3).
- Admin allowlist: keep the hardcoded Google-pinned email for now, but document the single-point-of-failure risk; consider env-driven list or custom claim post-launch.

---

## Phase 3 — Production infrastructure & ops  *(effort: M · several owner/console actions)*

- **Custom domain** on Vercel + set `NEXT_PUBLIC_APP_URL` (drives QR handoff + Stripe return URLs — currently `localhost:3000` in `.env.example`). Decide email-sender identity: SendGrid verified sender is `hello@szavazzmagadra.hu` while support mailto is `team@lexfit.hu` — unify on the lexfit domain (new SendGrid domain auth).
- **Error monitoring:** add Sentry (`@sentry/nextjs` + `instrumentation.ts`); today a failing Stripe webhook or cron is completely invisible. Wire the write-only `adminNotifications` collection (`src/lib/pricing/events.ts:47`) to something that's actually read — simplest: email-on-critical via existing SendGrid.
- **Fail-loud email/invoicing:** `src/lib/email.ts:24` and `src/lib/pricing/invoice.ts:96` silently skip when env is missing — in prod, log to Sentry as error (misconfigured env must not mean "silently no NAV invoice").
- **Firestore indexes:** `firestore.indexes.json` is missing the `subscriptions (plan ASC, status ASC)` composite required by `cron/reminders/route.ts:52-55`; the collection-group override for workout-reminders exists in the file but was likely **never deployed** (no deploy command documented, no CI). Add the composite, deploy `firestore deploy --only firestore:indexes`, verify in console.
- **Consolidate crons onto Vercel:** `vercel.json` has only `/api/cron/reminders`; `workout-reminders` (hourly) and `purge-accounts` (the GDPR 30-day deletion you promise in the deletion email) run via `.github/workflows/cron.yml` — GH scheduled workflows auto-disable after 60 days of repo inactivity and depend on unverifiable repo secrets. Move both into `vercel.json`; verify `CRON_SECRET` set in Vercel (after the fail-closed fix in Phase 0 this becomes mandatory).
- **Backups:** enable Firestore PITR + a scheduled export (paid users' progress, consent records, invoice audit trail currently have zero recovery story). Document restore.
- **Mirror the full prod env into Vercel:** `SENDGRID_API_KEY`/`EMAIL_FROM`/`EMAIL_FROM_NAME`, `BILLINGO_API_KEY`/`BILLINGO_BLOCK_ID`, `CRON_SECRET` (currently `.env.local`-only per the pricing tracker). Add `NEXT_PUBLIC_USE_EMULATORS` to `.env.example` with a warning (undocumented today); confirm it's unset in Vercel.
- **Mux prod config:** register the prod-domain webhook in the Mux dashboard + set prod `MUX_WEBHOOK_SECRET` (route hard-500s without it; documented nowhere).
- **Uptime monitor** against the trimmed `/api/health`.
- **CI:** minimal GitHub Action running `build` + the three self-test scripts (`test:pricing`, `test:funnel`, `test:onboarding-draft`) on push — they currently never run automatically.

---

## Phase 4 — Content-pipeline unblock (admin → prod)  *(effort: S–M · blocks all content upload)*

- **Filters create-path:** `api/admin/filters/[key]/route.ts:27-30` is update-only → on empty prod, taxonomy can never be created and no video can be tagged. Add create/upsert + a Szűrők create affordance.
- **Challenge taxonomy:** admin editor for `challengeFilters/theme` (no route exists) and `settings/challenges` (`fbGroupUrl` — read at `lib/challenges.ts:140,185`, unauthorable today).
- **Backend badge:** `/api/admin/me` returns `{emulator: !!process.env.FIRESTORE_EMULATOR_HOST}` → persistent EMULATOR/PROD badge in the admin layout. Kills the "plain `npm run dev` writes to prod" footgun (`admin/page.tsx:52` currently claims „produkciós adatbázis" in both envs).
- **Fix hardcoded content references:** `LIB_SPOTS` codes N003/B007/R001 in `app/library/page.tsx:23-33` (spotlight Lejátszás would 404 on prod content) — drive from Firestore or hide when missing. Admin member page Stripe deep-link hardcoded to `/test/` (`admin/members/[uid]/page.tsx:85`) — make mode-aware.
- **Membership hardcoded price:** `app/membership/page.tsx:164` literal „1 990 Ft" → `formatHuf(PRICES.week_std.amountHuf)`.

---

## Phase 5 — Feature completion  *(effort: M–L · the four launch-scoped features)*

**5.1 Register wizard — finish E4 + E5 (owner decision embedded):**
- **DECISION NEEDED — hard gate:** today `Protected` checks auth+onboarding only; unpaid users browse all of `/app` with only video playback denied, and the pay step has a „Később" exit. Options: (a) ship soft gate as-is (defensible; conversion pressure lives in the paywall), or (b) build E4: entitlement check in `Protected`/`app/layout.tsx` routing unpaid → `/subscribe`. Recommendation: **(b)**, matching the locked "pay-to-join" product direction — effort S.
- **Funnel routing:** landing pricing cards link `/subscribe?plan=X`, which is `Protected` → anonymous visitors bounce to `/login` instead of the wizard (`LandingPage.tsx:1013`; the uncommitted diff fixed the main CTA → `/onboarding`, verify the pricing cards after Phase 0 commit). All public CTAs must land on `/register`.
- **E5:** funnel truth-table self-test + one full **test-mode embedded-checkout run** — no embedded purchase has ever been verified end-to-end (browser step; I can drive it via Chrome with Stripe test cards).

**5.2 Kihívások — phase 10 QA.** Code is ~95% done (data layer, admin CMS, archive, 9:16 player, Kezdőlap row all exist). Remaining: taxonomy authoring from Phase 4, end-to-end QA with emulator content, empty-state verification on prod-empty Firestore.

**5.3 Finish Share — device QA.** Components + token handoff + phone page all built. Remaining: real-device pass (iOS Safari camera permissions, QR desktop→phone handoff), confirm `shareSessions` TTL policy (Phase 2 overlap).

**5.4 Auth polish:**
- **Apple provider:** code-complete; needs Apple Developer Services ID + key + Firebase console enablement — without it the live button throws `auth/operation-not-allowed`. Also popup-only: add `signInWithRedirect` fallback for iOS in-app browsers.
- **Password reset:** send-only today; users land on Firebase's default English hosted page. Build the in-app `oobCode` handler (`verifyPasswordResetCode`/`confirmPasswordReset`) + at minimum customize the Firebase email template to Hungarian.
- **DECISION — email verification:** currently absent (users can pay with a typo'd address). Recommendation: send non-blocking verification email post-signup; don't gate access on it.
- Profile settings: wire or hide the two inert toggles (`community`, `newContent`, `settings/sections.ts:82-84`).

---

## Phase 6 — Truthfulness & content cleanup  *(effort: S–M · what users actually see)*

- **`/app/szm` (fake community):** 100% fixture data (1 248 tag, 37 online, fake polls) linked from live nav (`app/layout.tsx:76`, `AppTopBar.tsx:24`). **DECISION:** hide route + repoint nav links to a real help destination (recommended for launch), or keep behind a "hamarosan" teaser without fake numbers. Real community backend is post-launch.
- **`FinishExamples` fabricated members:** six named people with invented stats (`streak: 34` etc.) shown after every real workout completion; photos are real (EXIF confirms) — likeness/consent risk + fake social proof. **DECISION:** remove for launch, or replace with genuinely consented real examples.
- **Forbidden program claims:** `GuidedTour.tsx:17-45` („8 hét", „Heti 5 nap", named weekday split) and `JoinCinematic.tsx:24,147` („8 hetes alapprogram") directly violate the recorded owner rule (no 8-hetes/40-edzés claims, `OnboardingV2.tsx:61`). Rewrite copy to be program-agnostic.
- **Unverifiable numbers:** „200+ edzés" (`paywall.tsx:25`), „17 000+ ember" (`LandingPage.tsx:284,766`), „1 200+ csoporttag" (`_mock.ts:32,155` — self-declared PLACEHOLDER; also internally inconsistent with the 17 000 claim). Replace with true numbers or claim-free copy.
- **Owner assets (flagged despite "landing as-is"):** 9 striped `<Ph>` placeholders with visible „később töltöm fel" labels on the public homepage; Canva-template hero (`hero-alexa.jpg`) + all 11 Canva onboarding brand-panel images; missing 1200×630 OG share image (`page.tsx:20` TODO — every social share renders imageless). Minimum bar: remove visible placeholder labels; real photography can follow.
- **`_mock.ts`:** rename/absorb (it's the live funnel copy source, not a mock) and fix the placeholder stats block; verify `MOCK_FIRST_ENTRY` is orphaned and delete.
- **`PROGRAMS` registry:** confirm the 4 speculative entries (`kickstart`, `stretch`, `gym`, `comp`) with the owner or trim to `foundation`.
- **Hungarian-ize the fitness vocabulary** *(owner request 2026-08-08)*. English "professional" terms are baked into user-facing copy and the category taxonomy itself: `Mobility / nyújtás`, `Cardio + has`, display words `MOBILITY`/`CARDIO` (`src/lib/categories.ts:7-9`, `player/[code]/page.tsx:31-33`, `LandingPage.tsx:25-39`), "core" (`_mock.ts:57,169`, `benefit.ts:51`, landing titles like "Tabata core" / "7 napos core"), "mobility"/"cardio" in prose (`GuidedTour.tsx:24`, `JoinCinematic.tsx:48-51`, `onboarding-data.ts:133-135`, `benefit.ts`, `foundation-preview.ts`, `library/page.tsx` spotlight/theme rows), plus format words ("flow" etc.).
  - ⚠️ **Not a plain find-and-replace:** the theme strings double as Firestore data values — videos are tagged with them and library filters match them exactly. Two options: (a) rename the canonical taxonomy values now, **while prod Firestore is empty** (no migration; seed + filters + admin defaults updated together — recommended, must land before Phase 8 content upload), or (b) keep English keys and map to Hungarian display labels centrally in `categories.ts`.
  - Build a small HU glossary first for owner sign-off, e.g.: Mobility → Mobilitás, core → törzs, Cardio → Kardió, upper/lower body → felsőtest/alsótest (already HU), full body → teljes test (already HU); decide which loanwords stay because they're established Hungarian gym usage (kardió vs. cardio spelling; format names like Tabata/EMOM likely stay).
  - CSS variable names (`--cat-cardio`, `--cat-mobility`) and internal ids/slugs stay English — only user-visible strings and data-taxonomy labels change.

---

## Phase 7 — Stripe live cutover  *(effort: S code / M verification · LAST before content)*

Sequenced so live keys exist only once everything around them is ready. Code is live-ready (idempotent webhook, consent-before-charge, dunning, Billingo NAV invoicing, schedules test-clock-verified; no hardcoded price IDs — lookup_key binding makes live seeding a one-command step).

1. **Stripe dashboard (live):** statement descriptor; Smart Retries / failed-payment settings (the F5.1 dunning design assumes them); receipt-email setting (optional — Billingo emails the NAV invoice).
2. **Vercel env:** live `STRIPE_SECRET_KEY` (consider a **restricted** key), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`; delete dead `STRIPE_PRICE_MONTHLY` everywhere.
3. **Live webhook endpoint** at `https://<domain>/api/stripe/webhook` subscribing `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted` → set live `STRIPE_WEBHOOK_SECRET`.
4. **Seed live prices:** one run of `npm run seed:stripe` against the live key (idempotent, verified re-runnable, logs drift, never mutates).
5. **Grandfathering guard** (tracker "must not slip"): the referenced `scripts/price-migration.ts` doesn't exist — create the guard before any live legacy sub can appear.
6. **Live smoke test (owner + Claude together):** real 490 Ft intro purchase → access granted, consent doc written, Billingo NAV invoice with 27% ÁFA split emailed (first-ever live Billingo run — block `326476` unverified), then a 14-day withdrawal with pro-rata refund; plus a controlled card-decline → PAST_DUE + grace + dunning email. Verify `ui_mode: "embedded_page"` behaves identically in live mode.

---

## Phase 8 — Content upload, QA, launch  *(effort: owner-heavy)*

- Owner uploads real videos/programs/challenges via `/admin` on prod (pipeline proven in Phase 4; Mux uploads always hit real Mux).
- Full regression on prod content: funnel (landing → register wizard → pay → app), player, progress/streaks, Haladásom, Kihívások, Finish Share, membership management, account deletion/export.
- Mobile device pass (the deferred §11 player-mobile items + Finish Share camera).
- Docs refresh: CLAUDE.md ("Stripe not yet wired", roadmap stale), README (women-first, `npm run seed`), `build-plan.md` superseded header.
- Launch checklist run (env diff prod vs `.env.example`, cron firing confirmed in logs, Sentry receiving, backup verified, robots/sitemap live, legal pages linked, uptime green) → **go live**.

## Post-launch backlog (explicitly deferred)
Analytics (+ cookie-consent banner it triggers), welcome email + branded email templates, annual renewal reminders (−30/−7; `invoice.upcoming` currently no-op by design), un-delete/account-recovery path, real community backend to replace szm, F4 milestones/migration + F5 full email suite + F6 dashboards (per pricing tracker), Sentry-driven rate-limit tuning, hero image compression, `priceIdCache` TTL, admin allowlist → custom claims, `docs/` archive.

---

## Open decisions for the owner (blocking their phases)
1. **E4 hard gate** — soft gate vs entitlement-gated `/app` (Phase 5.1; recommend hard gate).
2. **`/app/szm`** — hide vs teaser-without-numbers (Phase 6; recommend hide + repoint help links).
3. **`FinishExamples`** — remove vs replace with consented real examples (Phase 6; recommend remove for launch).
4. **Email verification** — none vs non-blocking (Phase 5.4; recommend non-blocking).
5. **Landing placeholder images** — confirm "ship as-is" knowing the striped „később töltöm fel" boxes are publicly visible (recommend at least removing the labels).
6. **`PROGRAMS` registry** — confirm or trim the 4 speculative program entries.
7. **Company/legal data** for impressum + ÁSZF (company name, address, tax number, hosting info) — needed to draft Phase 1.
8. **HU fitness glossary sign-off** — approve the term-by-term translation list (Phase 6): which English terms get translated (Mobility → Mobilitás, core → törzs, …) and which stay as accepted Hungarian gym loanwords (cardio/kardió spelling, Tabata, EMOM). Taxonomy rename must happen before Phase 8 content upload while prod is still empty.
