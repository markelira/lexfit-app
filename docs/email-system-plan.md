# LEXFIT system-email program — research & plan

*2026-08-10. Research synthesis (web research + codebase audit) + the template system built
from it. Companion code: `emails/` (react-email templates, `npm run email:dev` to preview).*

This is the canonical plan for every automatic email LEXFIT sends: what, when, why,
under which legal basis, and with what discipline so we never spam. It builds on what
already exists — SendGrid is live (`src/lib/email.ts`, domain-authenticated on
`lexfit.hu`, sender `Alexa <hi@lexfit.hu>`) and 8 plain-text Hungarian emails already
ship from crons/webhooks. This plan closes the gaps: no welcome email, Google-hosted
auth emails, no renewal reminders, no withdrawal confirmation, no weekly recap, and no
HTML design anywhere.

---

## 1. Where we are today

| Already live (plain text) | Trigger |
|---|---|
| Dunning day 0 — "Nem ment át a kártyád" | `invoice.payment_failed` webhook |
| Dunning day 3 — "Emlékeztető: frissítsd a kártyád" | daily cron (`/api/cron/reminders`) |
| Intro week day 5 — "Két nap múlva indul a rendes heted" | daily cron |
| Earned annual unlocked — "Feloldottad az Alapító Éves árat" | check-in flow |
| Annual nudge (days 10–18) — "Ugyanaz, csak okosabban" | daily cron |
| Pause resuming soon | daily cron |
| Workout reminder — "Ma van edzésnapod 💚" | hourly cron (GitHub Actions) |
| Streak risk — "A {n} napos sorozatod ma megtartható" | hourly cron, 20:00 pass |

Deliberate configuration that shapes everything below:
- **Stripe customer emails are OFF** (console-setup A6) — we own every billing email.
- **Billingo AAM** sends the NAV-compliant invoice; our "payment" emails are the UX
  layer, not the legal invoice.
- **No Stripe Customer Portal** — every manage-link goes to `/app/membership` or
  `/app/profile/settings`; the only external link is `invoice.hosted_invoice_url` in
  dunning (card update).
- Recipient addresses always come from Firebase Auth (`getUser(uid).email`), never the
  Firestore user doc.
- Idempotency patterns already exist: dunning booleans on `subscriptions/{uid}`, and
  milestone docs (`milestoneDocId(uid, kind)`) for everything else. **Every new email
  reuses the milestone pattern.**

## 2. Principles (what the research actually supports)

1. **Less is more — proven.** Strava cut email volume 60–70% and engagement *rose*;
   "too many emails" is the #1 unsubscribe reason (43% in ZeroBounce's survey). Every
   email below has to earn its place; when in doubt, fold content into an already
   scheduled email (Peloton's discipline) instead of adding a send.
2. **Behavior-triggered > scheduled blasts.** Trigger-based emails "rarely annoy";
   generic blasts do. Almost everything below is triggered by something the user did
   or a date they chose.
3. **Two strictly separated streams.** Transactional (contract performance, no consent
   needed, no unsubscribe link) vs. everything else (needs its own consent gate, needs
   opt-out). One promotional sentence inside a transactional email reclassifies it —
   never mix. Hungary has **no soft opt-in** (Grtv. 2008/XLVIII §6): marketing to
   existing customers still needs express prior consent.
4. **Warm, never guilt** — the retention research already encoded in
   `notify-templates.ts`. Alexa's voice: E/1, te-form, short, the em-dash reassurance
   beat, ≤1 emoji at the end, reflect the user's own choices back ("ahogy te
   állítottad be"), permission to rest. Guilt-based streak pressure is the
   most-complained-about message in the industry (Duolingo) — we use forgiveness
   framing instead (rest days keep the streak, and we say so).
5. **Email is our only channel** (no push). Push-native patterns get adapted, not
   copied: the workout reminder is one morning email on planned days only
   (completion-suppressed), and "streak at risk" is a 20:00 same-day note / weekly-goal
   framing — never a midnight countdown.
6. **Activation is the retention lever.** Users reaching ~3 workouts in 14 days retain
   at 2.4× (Peloton). The onboarding sequence exists to get people to the first and
   third workout, not to tour features.

## 3. Legal ground rules (HU/EU)

- **Transactional exemption:** receipts, auth emails, dunning, subscription notices are
  contract performance (GDPR Art. 6(1)(b)) — no marketing consent, no unsubscribe
  required. Keep them promotion-free.
- **Grtv. §6 (Hungary):** any advertising email to a natural person needs express prior
  consent — existing-customer status is NOT enough. Gate: `users/{uid}.marketingOptIn`
  (defaults false — correct). Consent must be revocable anytime; keep a consent record
  (timestamp + source when it's granted).
- **Reminder consent gap (pre-launch fix):** `prefs.ts` seeds
  `reminders.workout.enabled: true` before the user is ever asked — the opt-in card
  exists (`FirstEntry.tsx`) but the default makes it opt-out. Habit reminders are
  arguably "service messages the user configured", but the clean fix is: seed
  `enabled: false`, let the FirstEntry card (or onboarding) turn it on. Already flagged
  in `launch-readiness-plan.md:65`.
- **Imprint footer in every email** (Ektv. §4 / e-Commerce Directive Art. 5): operator
  legal name, registered seat, company reg. no., tax no., contact email. The template
  footer has placeholders — **fill in the real company data before go-live**
  (`emails/tokens.ts` → `IMPRINT`).
- **Renewal transparency:** every email that touches billing states price, period, next
  charge date, and the one-click cancel path (already house rule "J1/J6"). The intro
  step-up email (490→1990 Ft) and annual renewal reminders are the load-bearing ones —
  the EU Digital Fairness Act is expected to mandate pre-renewal reminders; France/
  Germany/Austria already do variants. Send them regardless of current HU law.
- **Withdrawal (elállás) confirmation** within the 14-day window is consumer-law
  relevant and currently TODO'd (`api/withdrawal/route.ts:118`) — must-have.
- **List-Unsubscribe headers (RFC 8058)** on every non-transactional email from day
  one. Gmail/Yahoo only require them at 5k+/day, but Grtv. opt-out applies at any
  volume and the headers are cheap: add `List-Unsubscribe` +
  `List-Unsubscribe-Post: List-Unsubscribe=One-Click` to `sendEmail()` for the
  lifecycle/marketing streams.

## 4. MUST-HAVE emails

Legend: ⚙️ = exists as plain text (gets the HTML template), ★ = new.
"Basis": T = transactional (no consent), R = reminder consent
(`prefs.reminders.*`), M = marketing consent (`marketingOptIn`).

### 4a. Account & auth (T)

| # | Email | Trigger | Timing | Notes |
|---|---|---|---|---|
| 1 ★ | **Welcome** — „Üdvözöllek a LEXFIT-ben" | first `ensureUserDoc()` (new account) | instant | Single CTA: start the first workout. No feature tour, no pricing. Highest-open email we'll ever send. Idempotent via milestone doc `welcome`. |
| 2 ★ | **Email verification** | signup with email+password | instant | Admin SDK `generateEmailVerificationLink()` → SendGrid, replacing Google's default. Link expires in 3 days — say so. Non-blocking stays (P5.4 decision). |
| 3 ★ | **Password reset** | user request | instant — latency IS the product | Server route + `generatePasswordResetLink()` → SendGrid. Link expires in 1 hour — say so. Route must catch `auth/email-not-found` and answer generically (no account enumeration; the UI copy already does this). Remove the client-side `sendPasswordResetEmail` call once live, or users get both emails. |

### 4b. Billing & subscription (T)

| # | Email | Trigger | Timing | Notes |
|---|---|---|---|---|
| 4 ★ | **Subscription started / payment confirmed** — „Elindult az előfizetésed" | `checkout.session.completed` / first `invoice.paid` | instant | Plan, price, period, next charge date, auto-renewal statement, cancel path. Merges "welcome to paid" + receipt UX (Billingo sends the legal invoice separately). |
| 5 ⚙️ | **Intro step-up reminder** (weekly day 5) | daily cron, day 5 of intro week | 2 days before step-up | Existing copy kept. The legally load-bearing renewal email: 490→1990 Ft, auto-renews, one-click cancel. |
| 6 ★ | **Annual renewal reminder** | `invoice.upcoming` (currently a deliberate no-op) | −30 days (recap framing) and −7 days | `M11` config already exists (`recapDaysBefore:30, reminderDaysBefore:7`). −30: year-recap ("mit csináltál idén") + renewal facts; −7: plain facts + cancel path. One template, two variants. |
| 7 ⚙️ | **Dunning day 0** | `invoice.payment_failed` | instant | Existing copy kept. Links `hosted_invoice_url`. |
| 8 ⚙️ | **Dunning day 3** | daily cron | day 3 of `PAST_DUE` | Existing copy kept. Research says add a **final-notice rung near the end of the 7-day grace** (day ~6: "holnap szünetel a hozzáférésed") — recommended follow-up, config `DUNNING.graceDays: 7`. Recovery email on `invoice.paid` after dunning is a nice-to-have (§5). |
| 9 ★ | **Cancellation confirmed** — „Lemondtad — így néz ki mostantól" | `/api/subscription/manage` action `cancel` (or `cancel_at_period_end` flip) | instant | Exact access-end date, no further charges, progress/data stays, low-key comeback path. Top chargeback-prevention email. Also covers `downgrade` with a variant. |
| 10 ★ | **Withdrawal (elállás) confirmed** | `/api/withdrawal` success | instant | Consumer-law confirmation: refund amount, method, 5–10 business days. Currently only `notifyAdmin` fires — the user gets nothing. |
| 11 ⚙️ | **Pause resuming soon** | daily cron, `PAUSE_RESUME_REMINDER_DAYS: 3` | 3 days before resume | Existing copy kept. |

Subscription-ended email (access actually lapsing on `customer.subscription.deleted`):
classified nice-to-have (§5) — the cancel confirmation already states the end date, and
the end-date email's main job is win-back, which belongs to the consented stream.

### 4c. Pricing mechanics (T — status/contract facts, "status not sale")

| # | Email | Trigger | Timing | Notes |
|---|---|---|---|---|
| 12 ⚙️ | **Earned annual unlocked** | 5 check-ins in first 7 days | instant | Existing copy kept; 💗 → 💚 (pink-era leftover). 72h real deadline stated. Legal note: this announces a *price the user earned* on their existing contract path — but it is promotional in character, so keep it gated on the pricing-flow context (user opted into the challenge in-app) and keep the copy status-framed. |
| 13 ⚙️ | **Annual nudge** (days 10–18, non-earners) | daily cron | once, in window | Existing copy kept ("comparison, not discount"). ⚠️ This one is genuinely promotional → **gate on `marketingOptIn`** going forward (Grtv. §6). |

### 4d. Habit & lifecycle (R — `prefs.reminders.*`, opt-out link in every one)

| # | Email | Trigger | Timing | Notes |
|---|---|---|---|---|
| 14 ⚙️ | **Workout reminder** | hourly cron on `plan.weekdays` at `reminders.workout.time` | user-chosen time, planned days only | Existing copy kept. Suppressions already right: skip if trained today, one/day. Fix the consent default (§3). |
| 15 ⚙️ | **Streak risk** | 20:00 pass, streak ≥ 3 | evening of a missed planned day | Existing copy kept — already the forgiveness-framed version ("Ha ma pihensz, az is rendben"). Gate: `reminders.streakRisk`. |
| 16 ★ | **Weekly recap** — „A heted, ahogy volt" | new weekly cron (Monday 08:00) | Monday morning, covers Mon–Sun | THE loved fitness email (Fitbit users complain when it's missing). Data from `computeWeekProgress` + `computeStreak` (both pure, server-safe — MUST use these or numbers diverge from the app). Content: done/target days, day dots, streak, minutes, next week's plan. **Zero-activity week → restart variant** („Új hét, tiszta lap"), never a 0/4 scoreboard. New pref toggle: `reminders.weeklyRecap` (default asked at FirstEntry or on). "Új ezen a héten" content block rides here when there's news — no separate announcement email. |
| 17 ★ | **First workout done** — „Az első megvan" | first item in `progress.completed` | same day, ~1h after | The activation milestone email. Celebrate + name the next planned day. Milestone doc `first-workout`. |

### 4e. Onboarding activation (T/R hybrid — service messages, first 7 days)

| # | Email | Trigger | Timing | Notes |
|---|---|---|---|---|
| 18 ★ | **Day-2 first-workout nudge** | milestone check: no completion 48h after signup | once | Remove friction: link the shortest session, reflect their `motiv` (their own words for why they started). Skip entirely if #17 already fired. |
| — | Day-7 first-week recap | — | — | Covered by #16 (the Monday recap includes their first week) — no separate email; Peloton folds it the same way. |

**Must-have total: 18 emails, of which 8 already exist as copy** — the build is 10 new
emails + HTML for all 18.

## 5. NICE-TO-HAVE (specs only — build after launch, in this order)

1. **Payment recovered** („Rendben van a kártyád") — on `invoice.paid` clearing a
   dunning episode. Closes the loop; cheap. (T)
2. **Dunning final notice** (day ~6 of grace) — "holnap szünetel a hozzáférésed". (T)
3. **Subscription ended** — on `customer.subscription.deleted`: access ended, data
   kept, resubscribe link. Factual version T; anything more → win-back. (T)
4. **Milestone: 10th workout / program completed / 7- and 30-day streak** — trigger-based
   celebration, zero frequency cost, the most-forwarded email type (Peloton's Century
   Club). Reuse milestone docs. (R)
5. **Win-back ladder** — 7d inactive (soft, references their last week), 14d (what's
   new / easiest way back), 30d (offer — `annual_winback` price exists; offers LAST,
   never first). Stop after 3 unanswered; suppress all other lifecycle sends while
   active. (M — needs `marketingOptIn`)
6. **New program / big content drop announcement** — standalone only for major
   launches; weekly news rides in the recap. (M)
7. **LEXFIT-versary / year in review** — Strava's flagship pattern; needs a year of
   data, revisit 2027. (R)
8. **Email change / security notices** — password changed, new sign-in method linked. (T)
9. **Progress-photo monthly nudge** — visszamérés reminder aligned to their start date. (R)

Explicitly **not** doing (push-native or evidence-negative): same-evening streak
countdowns, multiple same-day touches, "class starts soon" urgency, generic weekly
promo blasts, early discounts in win-back, 0/4 guilt scoreboards.

## 6. Governance — the anti-spam contract

- **Hard cap: 1 email per user per day** (transactional excepted only when
  simultaneous, e.g. a receipt + a reset the user requested). Practical ceiling
  ~3–4/week steady-state; onboarding may briefly run denser.
- **Priority order when two want the same day:** transactional > step-up/renewal >
  dunning > workout reminder > milestone/streak > weekly recap > news. Lower-priority
  sends drop or fold in — a milestone landing on a reminder day becomes one email.
- **Suppression rules:** no reminder if today's workout is done (already implemented);
  no recap for week 0 activity (restart variant instead); no lifecycle emails while
  dunning or win-back is active (one narrative at a time); no marketing to
  `PAST_DUE`/`CANCELED` users except billing + win-back.
- **Quiet hours:** send window 08:00–21:00 Europe/Budapest (single-market luxury —
  trivially enforceable; crons already anchor at 08:00). Overnight triggers queue to
  08:00. Auth emails exempt (user is waiting).
- **Preference center** (maps to existing `users/{uid}/settings/prefs.reminders` +
  `marketingOptIn`, surfaced at `/app/profile/settings`):
  1. Edzés-emlékeztetők (`reminders.workout` — with day/time, already built)
  2. Sorozat-figyelmeztetés (`reminders.streakRisk`)
  3. Heti összefoglaló (`reminders.weeklyRecap` — new field)
  4. Újdonságok és ajánlatok (`marketingOptIn`)
  Transactional is never toggleable. Later: pause-all for 30/60/90 days as the
  step before unsubscribe.
- **Sunset policy:** after 3 consecutive unengaged win-back touches, suppress
  non-transactional email entirely. Deliverability outranks the marginal open.
- **KPI: CTR, not opens** (Apple MPP inflates opens). Watch SendGrid per-category
  stats — tag every send with a category (`auth`, `billing`, `habit`, `recap`,
  `marketing`) so spam-complaint spikes are attributable.

## 7. Infrastructure changes — status (implemented 2026-08-10)

1. ✅ **`sendEmail()` upgrades** (`src/lib/email.ts`): `categories` +
   `listUnsubscribeUrl` (RFC 8058 headers), Sentry capture on missing env in prod.
2. ✅ **Auth email routes**: `POST /api/auth/reset-request` (public, rate-limited
   5/address/hour, enumeration-safe) and `POST /api/auth/post-register` (welcome +
   branded verification via Admin SDK `generate*Link`; freshness- and milestone-
   gated). Client `sendPasswordResetEmail`/`sendEmailVerification` removed; both
   register flows fire post-register when `ensureUserDoc` creates the doc.
   ⚠️ Still to verify on the real project before cutover (emulator link generation
   is quirky) — send yourself a reset + a registration.
3. ✅ **Annual renewal reminders** — implemented in the daily CRON off
   `currentPeriodEnd` (not `invoice.upcoming`, which stays a deliberate no-op:
   Stripe fires it once at one configured offset, the cron does both −30 and −7
   with per-period milestone keys and no Dashboard dependency).
4. ✅ **Triggers**: welcome + verification (post-register route), subscription-
   started (webhook, milestone-keyed on session id), first-workout (Mux sync
   route, fires on the first-ever completion), day-2 nudge + weekly recap (daily
   cron). All milestone-doc idempotent.
5. ✅ **Weekly recap** rides the existing Monday pass of the daily 8:00 cron (no
   new cron entry). ⬜ Cron consolidation: `workout-reminders` is still on GitHub
   Actions (Vercel Hobby has no hourly crons) — the 60-day auto-disable risk from
   launch-plan :86 stands.
6. ✅ **Withdrawal email** — branded template (was a plain-text send).
7. ✅ **Consent fixes**: `reminders.workout.enabled` seeds **false** (FirstEntry
   card is the opt-in; existing docs with explicit true untouched); `annualNudge`
   gated on `marketingOptIn` + sent with unsubscribe; new `reminders.weeklyRecap`
   pref (default on — owner may revisit). One-click unsubscribe endpoint:
   `/api/email/unsubscribe` (HMAC-signed via CRON_SECRET, GET+POST).
   ⬜ Surface a "Heti összefoglaló" toggle in Beállítások (pref exists; UI not
   yet rendered — unsubscribe link works meanwhile).
8. ⬜ **Owner**: fill in `IMPRINT` company data in `emails/tokens.ts` before the
   first branded send (legal name, seat, reg. no., tax no.).
9. ⬜ **Owner**: DMARC `p=none` TXT record for lexfit.hu; confirm `hi@lexfit.hu`
   mailbox receives replies.
10. ⬜ **Privacy policy**: reflect the email program + consent categories
    (`docs/legal/`), including reCAPTCHA (existing App Check note).

Removed in this pass: `src/lib/pricing/templates.ts` and
`src/lib/notify-templates.ts` — the react-email templates are now the single
copy source; every send goes through `src/lib/mailer.ts`.

## 8. Design system (the `emails/` workspace)

Apple's structure, LEXFIT's skin. Rules derived from `/apple-design` + email-client
constraints:

- **One idea per email.** One headline, one primary CTA, supporting facts in a single
  card. No feature grids, no three-column anything. Restraint is the aesthetic.
- **Typography**: Poppins via web font (renders in Apple Mail etc., falls back to
  `Helvetica Neue → Arial` in Gmail/Outlook — designed so the fallback is the
  baseline). Display headings: Poppins 300, tight leading (1.15), `-0.02em` tracking,
  lowercase-leaning — the app's thin display style. Body 16px/1.6 `#44544d`. Eyebrow:
  11px uppercase, `0.14em` tracking, mono stack (`IBM Plex Mono, SFMono-Regular,
  Menlo, monospace`), `#5c6e66`.
- **Color**: page `#f1f6f4` (never white), card `#ffffff` radius 20px, borders
  `#d8e0dd`. **The inversion rule: never non-ink text on the accent green** — white on
  `#7a9b8d` fails contrast (3.04:1). CTA buttons = ink `#18201d` fill, `#f0f4f3` text,
  radius 8px (the app's primary button). Accent green appears as: the FIT half of the
  wordmark (`#496c5e`), tinted panels `#e1f1ea` with `#355c4d` text, and small accents.
  Near-white/near-ink values chosen so Gmail's forced dark-mode inversion degrades
  gracefully; `color-scheme: light dark` meta set.
- **Wordmark**: live text `LEX`(ink)+`FIT`(#496c5e), 900 weight, 0.04em — no image
  dependency, renders everywhere, survives image-blocking.
- **Footer**: Alexa sign-off where the voice warrants it; imprint block (small,
  `#5c6e66`); reminder emails add the "te kérted / kikapcsolhatod itt" manage line;
  transactional emails add "why you got this" instead.
- **Copy**: existing template copy is kept verbatim where it exists — the HTML is a
  re-skin, not a re-write. New emails follow the documented voice rules
  (`pricing/templates.ts:1-4`, `notify-templates.ts:3-4`).
- All styles inline (Gmail strips `<style>` in places), images only as absolute
  `https://www.lexfit.hu/...` URLs, plain-text part generated for every send.

### Template inventory (`emails/`)

| File | Email (§4 #) |
|---|---|
| `components/*` + `tokens.ts` | shared layout, button, panel, footer, brand tokens |
| `welcome.tsx` | 1 |
| `verify-email.tsx` | 2 |
| `password-reset.tsx` | 3 |
| `subscription-started.tsx` | 4 |
| `weekly-day5-reminder.tsx` | 5 |
| `annual-renewal-reminder.tsx` | 6 (−30/−7 variants via prop) |
| `dunning-day0.tsx` / `dunning-day3.tsx` | 7, 8 |
| `cancel-confirm.tsx` | 9 (cancel/downgrade variants) |
| `withdrawal-confirm.tsx` | 10 |
| `pause-resuming.tsx` | 11 |
| `earned-unlocked.tsx` | 12 |
| `annual-nudge.tsx` | 13 |
| `workout-reminder.tsx` | 14 |
| `streak-risk.tsx` | 15 |
| `weekly-recap.tsx` | 16 (zero-week variant via prop) |
| `first-workout.tsx` | 17 |
| `day2-nudge.tsx` | 18 |

Preview: `npm run email:dev` → http://localhost:3001. Sending pattern (implementation
session): `const html = await render(Welcome({...})); const text = await
render(Welcome({...}), { plainText: true }); sendEmail({ to, subject, text, html })`.

## 9. Key sources

Transactional canon & tone: Postmark transactional guides · Baremetrics dunning
(cadence 0/3/7/13; helpful-not-collections tone) · Stripe docs (Smart Retries 8×/2wk,
webhook events, customer emails). Lifecycle evidence: Peloton retention teardown
(Propel; 3-workouts/14-days = 2.4× retention; offers-last win-back) · Strava/Twilio
(volume cut 60–70% → engagement up) · Fitbit weekly report · Duolingo streak research
(forgiveness > loss-aversion) · ZeroBounce (over-mailing = #1 unsubscribe reason).
Legal: Grtv. 2008/XLVIII §6 (GVH English text; no HU soft opt-in) · DLA Piper HU
e-marketing · Ektv. §4 imprint · Covington on the Digital Fairness Act (pre-renewal
reminders incoming) · Gmail/Yahoo bulk-sender rules (RFC 8058). Tech: react.email docs
(v6 single package, async `render`) · caniemail (@font-face ≈ Apple Mail only) ·
Litmus dark-mode guides. Full URLs in the session research reports.
