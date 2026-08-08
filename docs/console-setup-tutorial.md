# Console setup — step-by-step tutorial (do these once, ~30–40 min total)

Four services need a one-time login + a few clicks. Everything is copy-paste ready.
Where a step says **→ give to Claude**, just paste the value into the chat (none of
them are passwords — DSNs, webhook secrets and DNS records are safe to share).
Tip: do it in the same Chrome profile Claude uses, then Claude can verify each step.

---

## 1 · Firebase — Hungarian e-mail templates + action URL (10 min)

1. Go to **https://console.firebase.google.com** and sign in as
   **gorgeimarko@gmail.com** (⚠️ not info@elira.hu — the account picker defaults
   to the wrong one; use "Másik fiók használata" if needed).
2. Open the **lexfit-app** project → left menu **Authentication** → **Templates** tab.
3. You'll see templates: *Password reset*, *Email address verification*, *Email
   address change*. For **each** one, click the ✏️ (edit) icon and:
   - Click **customize action URL** (small link at the bottom of the editor) and set:
     ```
     https://www.lexfit.hu/auth/action
     ```
     (You only have to set this once — it applies to all templates.)
   - Set the sender name to `LEXFIT`.
   - Replace subject + body with the Hungarian texts below, then **Save**.

   **Password reset (Jelszó visszaállítása)**
   - Subject: `Jelszó visszaállítása — LEXFIT`
   - Body:
     ```
     Szia!

     Kaptunk egy kérést a(z) %EMAIL% fiók jelszavának visszaállítására.
     Az alábbi linkre kattintva adhatsz meg új jelszót:

     %LINK%

     Ha nem te kérted, hagyd figyelmen kívül ezt a levelet — a jelszavad nem változik.

     LEXFIT
     ```
   **Email verification (E-mail cím megerősítése)**
   - Subject: `Erősítsd meg az e-mail címed — LEXFIT`
   - Body:
     ```
     Szia!

     Már csak egy kattintás: erősítsd meg, hogy a(z) %EMAIL% cím a tiéd.

     %LINK%

     Ha nem te regisztráltál a LEXFIT-be, hagyd figyelmen kívül ezt a levelet.

     LEXFIT
     ```
   **Email change (E-mail cím módosítása)**
   - Subject: `E-mail cím módosítása — LEXFIT`
   - Body:
     ```
     Szia!

     A fiókod e-mail címét a(z) %NEW_EMAIL% címre módosították.
     Ha nem te voltál, az alábbi linkkel visszaállíthatod:

     %LINK%

     LEXFIT
     ```
4. ✅ Test later: on https://www.lexfit.hu/login click „Elfelejtetted?” — the e-mail
   should be Hungarian and the link should open a LEXFIT-branded page.

### 1b · Apple sign-in (decision needed)
The Apple button already exists in the app, but enabling it requires an
**Apple Developer Program membership (99 USD/year)** + creating a Services ID and
key at developer.apple.com. If you don't have a membership:
- **Option A (recommended for launch):** tell Claude "hide Apple" — the button is
  removed until you enroll. (15-min change.)
- **Option B:** enroll at https://developer.apple.com/programs/, then in Firebase →
  Authentication → **Sign-in method** → Apple → follow the wizard (it tells you
  exactly what to create on the Apple side).

---

## 2 · Sentry — error monitoring (5 min)

1. Go to **https://sentry.io/signup/** → sign up (the free plan is enough).
   Easiest: "Sign up with Google" using gorgeimarko@gmail.com.
2. When asked to create a project: platform **Next.js**, project name `lexfit`.
3. Sentry shows a **DSN** — a URL that looks like
   `https://abc123...@o12345.ingest.de.sentry.io/45678`.
   (If you missed it: Settings → Projects → lexfit → Client Keys (DSN).)
4. **→ give the DSN to Claude** — I'll put it into Vercel as both `SENTRY_DSN`
   and `NEXT_PUBLIC_SENTRY_DSN` and redeploy. (Or do it yourself: vercel.com →
   lexfit-app → Settings → Environment Variables → add both for Production.)

---

## 3 · SendGrid — send e-mail from lexfit.hu (10 min + DNS wait)

Today reminder/dunning e-mails go out from hello@szavazzmagadra.hu. To send as
`hi@lexfit.hu`:

1. Log in at **https://app.sendgrid.com**.
2. Left menu **Settings → Sender Authentication → Authenticate Your Domain**.
3. DNS host: pick your registrar from the list (or "Other"). Domain: `lexfit.hu`.
   Leave the advanced options as defaults → **Next**.
4. SendGrid shows **3 CNAME records** (names like `em1234.lexfit.hu`,
   `s1._domainkey.lexfit.hu`, `s2._domainkey.lexfit.hu`).
   **→ add these at wherever lexfit.hu's DNS is managed** (the same place you set
   up the domain for Vercel). Copy them exactly.
   *(Not sure where the DNS lives? → give the 3 records to Claude and tell me the
   registrar name — I'll write you the exact clicks.)*
5. Back in SendGrid press **Verify**. If it fails, wait 10–30 min (DNS) and retry.
6. When it's verified, **tell Claude "sendgrid verified"** — I'll switch
   `EMAIL_FROM` to `hi@lexfit.hu` in Vercel and redeploy.
   *(Also make sure the `hi@lexfit.hu` mailbox/alias actually exists at your mail
   provider so replies reach you.)*

---

## 4 · Mux — production webhook (5 min)

1. Log in at **https://dashboard.mux.com** and make sure the **production
   environment** for LEXFIT is selected (top-left environment switcher).
2. **Settings → Webhooks → Create new webhook**.
3. URL:
   ```
   https://www.lexfit.hu/api/mux/webhook
   ```
   Environment: the LEXFIT production environment. Save.
4. Click the new webhook → **Show Signing Secret** → copy it.
5. **→ give the signing secret to Claude** — I'll set `MUX_WEBHOOK_SECRET` in
   Vercel production and redeploy. (Or set it yourself in Vercel env vars.)

---

## Done? The scoreboard

| # | Task | Status when finished |
|---|---|---|
| 1 | Firebase HU templates + action URL | reset e-mail arrives in Hungarian, link opens lexfit.hu |
| 1b | Apple: hide OR enroll | decided |
| 2 | Sentry DSN → Vercel | Claude confirms errors arrive in Sentry |
| 3 | SendGrid lexfit.hu verified | e-mails sent as hi@lexfit.hu |
| 4 | Mux webhook + secret → Vercel | Claude confirms via a test upload |

When the scoreboard is green, the next session is the **live cutover**
(docs/launch-cutover-runbook.md): your live Stripe keys → live webhook → price
seed → the real 490 Ft smoke purchase → LEXFIT is launchable.
