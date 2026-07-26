# Card → payment → registration → experience: flow research + recommendation

Deep-research output (5 angles, 24 sources, adversarial 3-vote verification). The
auto-synthesis was cut off by a session limit, so this is hand-synthesized from
the **verified** claims. Claims marked ✓ passed 3-0 or 2-0; unverified angles
(paywall placement, activation metrics, ECJ Sofatutor) errored out and are NOT
relied on here.

## The core question: register BEFORE or AFTER payment?

The evidence pulls two ways, and the resolution is to separate **"Stripe
Customer"** from **"app account (Firebase login)"**:

- ✓ **Forcing account creation before payment hurts conversion.** 42% of sites
  ask too early; deferring account creation until *after* checkout performs
  better; users resent pausing a purchase to make an account + verify email.
  (Baymard, 3-0)
- ✓ **But a subscription cannot be a true "guest" checkout.** Stripe guest
  checkout does **not** save payment methods, so you can't take recurring
  charges — subscriptions **require** a Customer object. (Stripe docs, 3-0)
- ✓ Stripe's canonical subscription integration creates the Customer **before**
  payment; the subscription is created `incomplete` and confirmed by the first
  PaymentIntent. (Stripe docs, 3-0 / 2-0)
- ✗ "Just use guest checkout to skip accounts" was **refuted** (1-2) precisely
  because subscriptions need a saved payment method.

**Synthesis:** you always need a Stripe Customer (email captured at checkout).
What you should *defer* is the heavy **app-side registration** (password + email
verification) — not the payment rail.

## Recommendation for Lexfit (decisive)

**Register-first via one-tap Google, but move the heavy step — ONBOARDING — to
AFTER payment.** Rationale specific to this app:

- Lexfit's login is **Google one-tap** — no password, no email verification. That
  is NOT the heavy account-creation Baymard measures; its friction cost is tiny.
- The real "heavy step" sitting before value today is the **onboarding
  questionnaire**. Moving it to *after* payment is the genuine conversion lever
  here, and it matches the requested "payment → registration → experience" order.
- The alternative (checkout-first, create the Firebase account from the Stripe
  email afterward) adds a large, security-sensitive surface: an unauthenticated
  checkout endpoint, a subscription created with no uid, post-payment
  account-claiming, and email-mismatch/linking edge cases — disproportionate
  when Google sign-in is already one tap.

### Recommended concrete flow
1. **Landing pricing card click** (plan carried via `?plan=`) — done.
2. **One-tap Google sign-in** if not signed in (framed "Folytatás Google-fiókkal",
   not a form wall). Creates the Firebase uid → later the Stripe Customer.
3. **Consent step** (auto-renew + immediate-start checkboxes) for that plan — done.
4. **Stripe Checkout** → payment.
5. **Success page: dual, idempotent fulfillment** — ✓ (Stripe docs, 3-0): don't
   rely only on the webhook (the user may never hit the redirect, or the webhook
   may lag). Confirm/activate on the success page too, and make fulfillment
   idempotent (it can run from both, concurrently). Gives instant access.
6. **Onboarding** (the questionnaire) — now, post-payment.
7. **First experience** — today's workout / the app.

This reorders today's `login → onboarding → subscribe` into
`one-tap login → pay → onboarding → experience`, which is achievable with the
current architecture (the `/subscribe` route is already `requireOnboarded=false`,
so entering checkout via a card link naturally defers onboarding until after
payment).

### Other verified guidance
- ✓ **Fulfillment must be idempotent** and triggered from **both** webhook and
  success redirect (Stripe docs, 3-0). We already fulfill via webhook; add the
  success-page confirmation.
- ✓ **Stripe Checkout doesn't support the new Trial Offers API** — use legacy
  `trial_end` if we ever want a true trial (2-0). Our weekly intro uses a
  Subscription Schedule, so this is not currently blocking.

## Key risks
- **Webhook lag → "I paid but no access."** Mitigated by success-page dual
  fulfillment (verified). Highest-priority build item.
- **Onboarding-after-payment drop-off:** users who pay then abandon onboarding
  still have access — fine, but make onboarding skippable/short so they reach the
  first workout fast.
- Do NOT build an unauthenticated checkout endpoint unless we later commit to the
  full checkout-first + account-linking design; it's the biggest security surface.

## Sources (verified)
- Baymard — Delayed Account Creation: https://baymard.com/blog/delayed-account-creation
- Stripe — Guest customers: https://docs.stripe.com/payments/checkout/guest-customers
- Stripe — Checkout fulfillment: https://docs.stripe.com/checkout/fulfillment
- Stripe — Build subscriptions: https://docs.stripe.com/billing/subscriptions/build-subscriptions
- Stripe — Trials: https://docs.stripe.com/billing/subscriptions/trials
