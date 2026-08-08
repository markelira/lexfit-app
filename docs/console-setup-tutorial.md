# Console setup — what's actually left (updated 2026-08-08, after the API pass)

Claude drove everything reachable by API/CLI. The list shrank — here's the state
and the few remaining clicks.

## Already DONE by API (no action needed)

- ✅ **Stripe (A6)**: statement descriptor `LEXFIT`, Smart Retries ON (8×/2 weeks),
  customer e-mails off (the app sends its own Hungarian dunning) — was already configured.
- ✅ **Firebase e-mail language**: default locale set to **Hungarian** via the
  Identity Toolkit API — all auth e-mails (reset, verification) now use Google's
  own Hungarian translations. (Custom body text would need custom SMTP — not worth it.)
- ✅ **SendGrid domain auth created** for `lexfit.hu` (API) — it's waiting for the
  3 DNS records below.
- ✅ Firestore PITR + TTL policy, indexes, all Vercel env, CI, crons — done earlier.

## Remaining — 4 small tasks

### 1 · dns24.hu — add 3 CNAME records (3 min)
lexfit.hu's DNS runs on **dns24.hu**. Log in there and add:

| Type | Host (név) | Value (cél) |
|---|---|---|
| CNAME | `em2898.lexfit.hu` | `u85393214.wl215.sendgrid.net` |
| CNAME | `s1._domainkey.lexfit.hu` | `s1.domainkey.u85393214.wl215.sendgrid.net` |
| CNAME | `s2._domainkey.lexfit.hu` | `s2.domainkey.u85393214.wl215.sendgrid.net` |

(If the panel wants only the subdomain part, drop the `.lexfit.hu` suffix.)
Then tell Claude **"dns done"** — I validate via the SendGrid API (no login
needed) and switch `EMAIL_FROM` to `hi@lexfit.hu` in Vercel. Make sure the
`hi@lexfit.hu` mailbox/alias exists at your mail provider.

### 2 · Firebase console — ONE field (1 min)
The action-URL field is console-only (the API refused it).
1. https://console.firebase.google.com → sign in as **gorgeimarko@gmail.com**
   (the picker defaults to info@elira.hu — switch!).
2. lexfit-app → **Authentication → Templates** → open any template → click the
   small ✏️ next to the action URL at the bottom → set:
   `https://www.lexfit.hu/auth/action` → Save. (One save covers all templates.)

While you're there — **Apple decision**: enabling Apple sign-in needs a paid
Apple Developer membership (99 USD/yr) + a Services ID. No membership? Tell
Claude **"hide Apple"** and the button disappears for launch.

### 3 · Mux dashboard — recreate the webhook on www (2 min)
Found by Claude: the existing webhook points at `https://lexfit.hu/...` which
**308-redirects to www** — deliveries would bounce. The fix (URL isn't editable):
1. https://dashboard.mux.com → Settings → Webhooks (LEXFIT production environment).
2. **Delete** the old webhook (`https://lexfit.hu/api/mux/webhook`).
3. **Create new** with URL: `https://www.lexfit.hu/api/mux/webhook`
4. Click it → **Show Signing Secret** → **paste the secret to Claude** — I update
   `MUX_WEBHOOK_SECRET` in Vercel and redeploy. (Safe to paste; it's a webhook
   signature key, not a password.)

### 4 · Sentry — create the account (3 min)
1. https://sentry.io/signup/ → "Sign up with Google" (gorgeimarko@gmail.com), free plan.
2. Create project: platform **Next.js**, name `lexfit`.
3. **Paste the DSN to Claude** (looks like `https://…@o….ingest.….sentry.io/…`) —
   I set `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` in Vercel and verify an error arrives.

## Then
All green → live cutover session (docs/launch-cutover-runbook.md): live Stripe
keys → live webhook → `npm run seed:stripe` → 490 Ft smoke purchase → launchable.
