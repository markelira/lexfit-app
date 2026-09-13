# The lead-magnet email bundle — sequence · copy · offer audit

**Date:** 2026-09-13 · **Scope:** every mail an lm_v2 lead can receive — D0 (instant), D3, D6,
D9 (cron, anchored to `createdAt`), checkout-resume (event-driven) · **Lenses:** emails
(sequence design), copywriting, offers (value equation / Grand Slam test).
**Context that changed under the sequence:** the reveal now carries a FREE first workout in the
real player, a habit curve, personalized certainty lines, and a LIVE money-back guarantee —
the emails were written before all of it.

---

## 1 · Inventory (as shipped)

| Mail | When | Subject | Job | CTA → |
|---|---|---|---|---|
| D0 | instant, transactional | „A heti terved" | deliver the plan | persisted plan page (token) |
| D3 | day 3, marketing | „Mi esik szét a 9. napon" | belief (the two rules) | plan page |
| D6 | day 6 | „30 edzés, és visszakapod a pénzed, ha nem vált be" | the offer | wizard, 490 Ft preselected |
| D9 | day 9, final | „Mi történik az első tíz edzés alatt" | proof; explicit goodbye | wizard |
| resume | ~24h after abandoned checkout | „Egy lépésre álltál meg" | recovery | pay step |

Stop rules: payment (`paidAt`), unsubscribe, consent-withdrawal. After D9: silence by design.

---

## 2 · Findings

### 🔴 F1 — The sequence breaks its own founding promise
The gate checkbox sells **„Alexa 6 napos induló sorozatát"** and D0 doubles down:
*„Holnaptól hat napon át küldök egy-egy rövid levelet…"* — **tomorrow, six days, daily.**
Reality: the next mail arrives on **day 3**, and there are **three** letters, not six.
The funnel's entire brand is kept promises („a kihagyott hét nem nulláz", dated renewals) —
and its very first promise to a consented lead is false. Every consented lead experiences
this: sign up for a daily 6-day series, get silence for three days.

### 🔴 F2 — The bundle's strongest asset doesn't exist in it
The **free first workout** — the funnel's try-before-you-buy centerpiece — is mentioned in
**zero emails**. D0 shows workout *cards* but its CTA is „Megnyitom a tervem"; no mail ever
says „nézd meg az első edzésed **ingyen**, most". The single most clickable, most
conversion-correlated sentence available is absent from all five sends. (The watch link works
from email by construction: `/player/{code}?lt={token}&autostart=1`.)

### 🟠 F3 — First marketing touch on day 3 is late for cold Facebook leads
Our own research (reveal analysis): paywall-dismisser intent decays hard after ~48h; welcome
sequences standardly touch on day 1. D0→D3 is three days of silence exactly when interest
peaks. (The 4-send ceiling itself is evidence-based and should stand — the fix is *jobs*, not
volume: D0 must carry the free-watch hook so day 1 doesn't need a new send.)

### 🟠 F4 — D6 fails the 6th-grader test (the offers lens)
What D6 asks a reader to assemble: Start = 30 edzés → tagság = Start + minden program + heti
5 kihívás → havi 5 990 **vagy** éves 39 900 → ami 3 325/hó → *és mellesleg* az első hét 490.
**Four prices, two constructs, and the stupid-to-say-no number arrives in the 6th paragraph.**
The Grand Slam ingredients all exist — full-refund guarantee (now live), 490 Ft entry,
everything-included — but no sentence states them together. The 6th-grader version fits in
three lines:

> **Az első heted 490 Ft.** Benne van minden edzés és minden program.
> Csináld végig az első 10 edzést — ha nem vált be, **visszakapod a pénzed.**

That box currently exists nowhere in the bundle.

### 🟡 F5 — D3 sells nothing and links backwards
The belief content is excellent (the two rules, Alexa's story — genuinely the market's own
words). But its only CTA re-opens the plan page, and it never mentions the free watch, the
guarantee, or the price. A belief mail may sell softly; this one doesn't sell at all.

### 🟡 F6 — D9's goodbye forfeits the offer box
The proof narrative is strong and the honest „no more letters" is brand-right — but the final
impression a lead ever gets shows the CTA without restating the offer's three facts. The last
mail is exactly where the compressed box belongs.

### ✅ What's right (keep)
Voice and register (no hype, VoC verbatim), subject lines (curiosity + benefit, D6's
guarantee subject is excellent), transactional/marketing split with per-lead one-click unsub
(Grtv-clean), `createdAt`-anchored catch-up scheduling, stop-on-paid, the resume email
(clear, honest, webview-aware), prices interpolated from PRICES everywhere.

---

## 3 · The fix plan (4 sends stay 4 sends)

| # | Change | Where |
|---|---|---|
| P1 | **Honest promise**: gate checkbox → „Kérem mellé Alexa induló leveleit…" (drop „6 napos"); D0 line → „A következő napokban három rövid levelet küldök…". Consent wording changes ⇒ bump `textVersion` → `consent_lm_v2` (new leads only; existing consents keep v1 record). | `copy.ts` GATE, `d0.tsx`, `lead.ts` |
| P2 | **Free watch into D0**: second CTA block — „Nézd meg az első edzésed — ingyen" → `/player/{firstCode}?lt={token}&autostart=1`; the route already loads the catalog for the cards. | `d0.tsx`, lead route |
| P3 | **Free watch into D3**: the belief mail's postscript becomes the watch push („Az első edzést ingyen megnézheted — 20 perc, ma este"). Cron loads the landing catalog for the first code. | `d3.tsx`, cron |
| P4 | **The offer box** (6th-grader, three lines as above) as a shared email component; D6 leads with it — 490 first, guarantee second, everything-included third, ONE CTA — monthly/annual demoted to a one-line footnote. | new `components/OfferBox`, `d6.tsx` |
| P5 | **D9 closes with the same box** above its goodbye. | `d9.tsx` |
| P6 | Resume mail: add the guarantee line (it's live now). | `checkout-resume.tsx` |

Selftest guards to add: no „6 nap"/„hat nap" promise anywhere in gate/D0 copy; the offer box
names exactly one action price; D0/D3 watch links carry the token.

## 4 · Verdict

The bundle's craft is high but its **conversion architecture predates the funnel it serves**:
it breaks its opening promise (F1), omits the strongest asset (F2), goes quiet during peak
intent (F3), and never states the one offer a 6th grader could repeat (F4). The offer itself —
*490 Ft, everything included, 10 workouts or your money back* — IS stupid-to-say-no grade;
the emails just never say it in one breath. All six fixes are code+copy, no new sends, no new
infrastructure.
