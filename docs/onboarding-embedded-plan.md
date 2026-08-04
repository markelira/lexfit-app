# Onboarding → embedded pay-to-join wizard — build plan

Collapse the funnel's route hops into ONE `/register` wizard with embedded Stripe Checkout and a
pay-to-join hard gate. Data-backed (deep-research wf_8fdc08c7-f57): hard gate kept, but the pay step
**leads with the 490 Ft weekly intro** (low-friction commitment), annual/monthly still selectable.

Builds on the shipped inversion (`docs/onboarding-p0-decisions.md`, commit e1a918b) — reuses the
questions, reveal, draft store, P6 `PlanCard`s, the consent/pricing engine, and `paidDestination`.

**Target flow (one route = `/register`):**
```
welcome → 5 questions → reveal → plan picker → account → embedded pay → /app
                                  (490 default)  (AuthScreen)  (Stripe Embedded Checkout + 1 consent box)
```

## Phases (execute in order; review gate before E2 and E4)

### E1 — Unified wizard shell (client only; safe/reversible; NO Stripe/guard changes)
- Make **`/register` the wizard**; `/onboarding` → redirect to `/register`; `/login` unchanged.
- Extend the `OnboardingV2` step machine: add `plan` and `account` steps (URL `?q=plan`, `?q=account`,
  `?q=pay`). Reveal CTA → `plan` (not the old `/register` hop).
- **Plan step:** reuse P6 `PlanCard`s inside the funnel shell; **default = weekly intro (490)**, annual
  shown with "best value/SPÓROLJ", one-off links kept. Selected plan stored in the draft.
- **Account step:** reuse `AuthScreen`'s split-screen (email + Google/Apple) with an `onAuthed → advance
  to pay` hook instead of its redirect; attach answers on account creation (existing P3.3 logic).
- **Pay step:** placeholder for now (E2 mounts the embedded checkout).
- DoD: full wizard navigable end-to-end with a stubbed pay step; tsc/lint green; no Stripe/guard change yet.

### E2 — Embedded Stripe Checkout (server + client; RISKY — Stripe test mode; **review before starting**)
- Convert the checkout route to `ui_mode: 'embedded'` + `return_url`; create an embedded session for the
  selected plan (subscription; weekly-intro uses the existing intro→standard price). Keep the server
  consent persistence + `week_intro` once-per-user guard + webhook entitlement grant.
- Mount `<EmbeddedCheckout>` (@stripe/react-stripe-js) on the pay step; `return_url` → confirm → grant → `/app`.
- Keep `confirmCheckout`/webhook. Do NOT rebuild pricing (`PRICES`/display helpers).
- DoD: real emulator + Stripe-test checkout completes end-to-end from the wizard; access granted; `/app` reached.

### E3 — One-box consent
- Replace the dual J1/J2 checkboxes with ONE compact checkbox whose sentence names both auto-renew +
  immediate-start + a terms link; persisted server-side before the session. (Legal to review wording.)

### E4 — Hard-gate /app + retire public /subscribe (**review before starting** — app-wide guard)
- Add an entitlement check to the `/app` guard (Protected/app layout): unpaid → `/register?q=pay`.
  Catches existing free/unpaid accounts too.
- Remove `/subscribe` as a public route: landing plan CTAs → wizard (plan pre-selected, full funnel);
  active-sub management → membership/profile page; returning unpaid → wizard pay step (plan from draft).
- `paidDestination` already routes paid → `/app`.

### E5 — Truth table + tests + verify
- Update `funnelDestination` + `funnel-selftest` for pay-to-join / hard-gate / resume-at-pay semantics.
- End-to-end verify (emulator + Stripe test): cold → questions → plan → account → pay → /app; abandon at
  pay → return → resume at pay; unpaid opens /app → bounced; existing paid → /app.

## Do-not
- Do not rebuild the pricing engine or the webhook/entitlement logic — adapt the session creation only.
- Do not delete `AuthScreen` (it's `/login` + the account step).
- Do not ship E2/E4 without a review gate — they touch billing and app-wide access.
