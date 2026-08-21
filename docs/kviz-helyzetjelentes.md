# LexFit lead magnet kvíz — helyzetjelentés és döntés-előkészítés

**Dátum:** 2026-08-21 · **Készítette:** Claude Code (felderítő elemzés, kódmódosítás nélkül)
**Vizsgált spec:** `docs/lexfit-kviz-MASTER-specifikacio.md` (v3.0 MASTER, 2026-08-19)
**Módszer:** a spec ütköztetése a repo tényleges állapotával. Minden állítás fájl-hivatkozással.
Futtatott (kockázatmentes, lokális) ellenőrzés: `npm run test:funnel` ✅ 20/20 assertion,
`npm run test:onboarding-draft` ✅ mind a négy blokk. Production rendszerhez nem nyúltam.
**Utóellenőrzés (2026-08-21):** a jelentés minden fájl-hivatkozásos állítása újra
ütköztetve a kódbázissal; három pontosítás átvezetve (mailer send-függvények száma,
a 9. cikk említésének pontos hatóköre a jogi doksiban, egy sorszám-elcsúszás).

> **STOP-szabály feloldva (2026-08-21).** A 4. fejezet minden döntésére megvan a tulajdonosi
> válasz — lásd a **7. fejezetet (Döntési napló)**, amely a jelen dokumentum kötelező
> érvényű záradéka. Ahol a 4. fejezet ajánlása és a 7. fejezet döntése eltér, **a 7. fejezet
> az irányadó**. Az 5. fejezet (integrációs vázlat) a döntéseknek megfelelően frissítve.

---

## 1. Vezetői összefoglaló

1. **A „kvíz mint tölcsér" nem hiányzik — már ez a termék fő tölcsére.** A landing
   *minden* CTA-ja ugyanoda visz: `CTA_START = "/onboarding"`
   (`src/components/landing/LandingPage.tsx:229`, 15+ hivatkozási hely), a `/register`
   pedig ugyanaz a komponens (`src/app/register/page.tsx`). Ez egy 7 kérdéses,
   reveal-lel záruló kvíz, amelynek válaszai anonim módon `localStorage`-ban élnek
   (`src/lib/onboarding-draft.ts`) és regisztrációkor automatikusan a felhasználóra
   íródnak (`src/components/auth/RegisterForm.tsx:43`). **A spec 8.4 „handoff token"
   fejezete tehát nagyrészt felesleges: az átadás megoldott mechanizmus.** A saját
   landing-auditunk (`docs/landing-analysis/02-gap-analysis.md:57`, C1) is ezt a meglévő
   kvízt javasolta erősíteni, nem másikat építeni.

2. **A spec érdemi magja két rögzített termékdöntéssel ütközik.** (a) A testsúly, a
   cél-testsúly, a kalóriadeficit és a heti fogyási ütem — vagyis az **O1 output teljes
   egésze** — kifejezetten **elvetett** kategória:
   `docs/onboarding-personalization-plan.md:106-108` szó szerint így sorolja fel („Deliberately
   NOT adding: … weight, goal-weight …"), a 66–74. sorok pedig jogi (FTC-substantiation) és
   body-positive indokkal tiltják a súlycél-projekciót. (b) **Nincs ingyenes próba** a
   rendszerben (a `src/lib/pricing/config.ts`-ben egyetlen `trial` sincs; a belépő
   `week_intro` = 490 Ft), és **pay-to-join hard gate** van (`src/lib/billing.ts:168`) —
   a spec R5 CTA-ja („Kezdem a programom — **ingyenes próbával**") és a 8.4 ígérete
   („regisztráció után **azonnal a neki ajánlott programnál landol**") ma **hamis állítás**.

3. **Az e-mail rendszer kész, de kizárólag `uid`-hez kötött — egy fiók nélküli lead ma
   nem kaphat levelet.** SendGrid + 18 react-email sablon él (`src/lib/mailer.ts`,
   `emails/`), de a címzett mindig a Firebase Auth-ból jön
   (`src/app/api/cron/reminders/route.ts:44`), a leiratkozó token `uid`-re HMAC-elt
   (`src/lib/email-unsub.ts:26`), a marketing-kapu pedig `users/{uid}.marketingOptIn`
   (`src/lib/user.ts:55`). Az E1–E6 + W1 szekvencia tehát **nem konfiguráció, hanem új,
   uid-mentes e-mail-ág** (ütemezés + szegmentálás + Grtv.-konform leiratkozás) —
   viszont ehhez **külső eszköz (MailerLite/ActiveCampaign) nem kell**.

**Ajánlott irány egy mondatban:** építsük meg a kvízt **önálló, marketing-oldali lead
magnetként** (saját route, saját `quizLeads` kollekció, a meglévő SendGrid/react-email
rendszer uid-mentes kiterjesztésével), amely a **meglévő onboarding-draftba** írja a
közös válaszokat — **de az O1 (kalória/testsúly) blokk csak a tulajdonos kifejezett,
jogásszal validált döntése után kerülhet bele**, és a spec ingyenes-próba-copyját
előbb a valós árazásra kell javítani.

> **A tulajdonos döntött (7. fejezet):** a keret **Meta Ads lead magnet**, a hosztolás
> a meglévő appban (`lexfit.hu/terv`), és **az O1 teljes egészében marad**. Ez utóbbi az
> itteni ajánlással szemben született — érvényes döntés, de **aktiválja a 7.3 jogi
> hard blokkereket** (9. cikkes adatkezelés jogalapja + lead-törlési út), amelyek az
> élesítés kritikus útját adják. A CTA-ígéret „az első hét 490 Ft"-ra javítva.

---

## 2. Rendszertérkép — mi létezik ma

### 2.1 Tölcsér és routing

| Elem | Hol | Valóság |
|---|---|---|
| Funnel-igazságtábla (§40.8) | `src/lib/funnel.ts` | 5 állapot × 4 route = 20 cella. **Fontos: `funnelDestination()`-t a `src/app` alatt SEMMI nem importálja** — csak a saját selftestje (`scripts/funnel-selftest.ts`). A tábla ma *dokumentált szerződés + teszt*, nem futó guard. |
| Tényleges guardok | `src/components/Protected.tsx`, `src/lib/billing.ts:168` (`paidDestination`), `OnboardingV2.tsx` belső redirectek | A hard gate valós: fizetés nélkül `/subscribe`-ra dob. |
| A kvíz-tölcsér | `src/app/onboarding/OnboardingV2.tsx` (917 sor) | Egyetlen wizard: `welcome → goal → focus → level → days → time → env → obstacle → why → reveal → plan → account → pay` (`:30`). 7 kérdés (`QUESTION_TOTAL = 7`, `:47`). URL a source of truth (`?q=…`). |
| `/register` | `src/app/register/page.tsx` | Ugyanaz a komponens, csak más URL. Nincs külön regisztrációs oldal. |
| Anonim draft (= „anon_draft") | `src/lib/onboarding-draft.ts` | `localStorage["lexfit_onb_v1"]`, alak: `{v:1, idx, answers, startedAt}`. Minden hozzáférés try/catch-elt (Safari private mode). Élettartam: a böngészőben, amíg regisztráció nem történik. |
| Draft → user átadás | `src/components/auth/RegisterForm.tsx:43-44` | `saveOnboarding(uid, {...BLANK_ONBOARDING, ...draft.answers})` majd `clearDraft()`. **Ez a meglévő „handoff".** |
| Landing CTA | `src/components/landing/LandingPage.tsx:229-230` | `CTA_START="/onboarding"`, `CTA_LABEL="Összeállítom a tervem"` — 15+ helyen ugyanez az egyetlen akció. |

### 2.2 Az onboarding kérdéssora (a spec Q1–Q11 valódi párja)

Forrás: `src/app/onboarding/_mock.ts` (copy + opciók), `src/app/onboarding/OnboardingV2.tsx:70-81` (`FunnelAnswers`).

| # | Mező | Típus | Opciók (érték) |
|---|---|---|---|
| 1 | `goal` | single | `ero`, `forma`, `vissza`, `tartas`, `szokas` |
| 2 | `focus` | single (tárolva tömbként) | `fenek`, `core`, `kar`, `tartas`, `teljes` |
| 3 | `level` | single (1–3) | Kezdő / Közepes / Haladó |
| 4 | `days` + `weekdays` | szám + naptár | 3/4/5/6 nap + konkrét hétköznapok (1=H…7=V) |
| 5 | `time` | single | `reggel`, `napkozben`, `este` |
| 6 | `env` | multi | `csendes`, `fal`, `terd`, `hat`, `none` |
| 7 | `obstacle` | single | `ido`, `motiv`, `tudas`, `serules`, `elso` |
| — | `why` | szabad szöveg (max 160) | átugorható |

**Amit az onboarding NEM kérdez:** nem, kor, magasság, testsúly, cél-testsúly, élethelyzet,
edzéshossz, lépésszám. A `OnboardingAnswers` típus (`src/lib/user.ts:16-33`) ugyan *tartalmaz*
`age`/`height`/`weight`/`lifestage` mezőt, de **a v2 funnel egyiket sem tölti** (a
`FunnelAnswers` interfészben nem is szerepelnek) — ezek a régi, prototípus-kori
`src/lib/onboarding-data.ts`-ből (`AGES:55`, `LIFESTAGE:57`) maradt, ma már csak az
`OnbAside.tsx` és az admin tagnézet által hivatkozott holt mezők.

### 2.3 E-mail rendszer

| Elem | Hol | Valóság |
|---|---|---|
| Küldő | `src/lib/email.ts` | SendGrid v3 Mail Send, `fetch`-csel, SDK nélkül. `EMAIL_FROM` = `Alexa <hi@lexfit.hu>`, domain-authentikált. Kulcs hiányában némán skip + Sentry. |
| Sablonok | `emails/` (18 `.tsx` sablon) + `src/lib/mailer.ts` | react-email, `npm run email:dev` előnézettel. 18 `send*` függvény (`mailer.ts:142-301`). |
| Kategóriák | `mailer.ts` `deliver()` | `auth` / `billing` / `habit` / `recap` / `marketing` — SendGrid statisztikához. |
| Leiratkozás | `src/lib/email-unsub.ts`, `src/app/api/email/unsubscribe/route.ts` | RFC 8058 one-click. **Token = HMAC(`unsub:{uid}:{kind}`)** — `uid` nélkül nem képezhető. `UnsubKind`: `workout`, `streakRisk`, `weeklyRecap`, `marketing`. |
| Ütemezés | `vercel.json` | Napi 2 cron (`/api/cron/reminders` 08:00, `/api/cron/purge-accounts` 03:30) + óránkénti `workout-reminders` GitHub Actions-ről (`docs/email-system-plan.md`). **Nincs generikus „N nappal később küldd el" scheduler** — az idempotenciát `milestones/{uid}_{kind}` dokumentumok adják. |
| Marketing-jogalap | `docs/email-system-plan.md:75-77` | Grtv. 2008/XLVIII. §6: **Magyarországon nincs soft opt-in**, minden reklámlevélhez kifejezett előzetes hozzájárulás kell. Kapu: `users/{uid}.marketingOptIn` (`src/lib/user.ts:55`), a regisztrációs űrlapon alapból üres checkbox (`RegisterForm.tsx:26`). |

**Következtetés:** minden marketing-primitív létezik — de mind `uid`-központú. Lead ≠ user.

### 2.4 Programok és tartalom

| Elem | Hol | Valóság |
|---|---|---|
| Adatmodell | `src/lib/types.ts:89-130` | `programs/{slug}` (title, hu, category, level, goal, synopsis, facts, `phases[]`, `totalSessions`, `access: "members"\|"free"`, `status: draft\|published\|soon\|archived`, `order`) + `programs/{slug}/sessions/{id}` playlist (`videoCode`, `order`, `phaseIdx`, `retest`). |
| **Nincs `active` flag** | ugyanott | A spec `active: true/false` fogalmának a **`status === "published"`** felel meg (`src/lib/program-index.ts:29` csak ezt kérdezi le). |
| Nincs `next_step` | ugyanott | A programok között ma **semmilyen „utána ez jön" reláció nem létezik**. |
| Kihívások | `src/lib/types.ts:166-197` | Külön világ: `challenges/{slug}` + `challenges/{slug}/days/{id}` + saját 9:16-os videópool (`challengeVideos`). A spec „bónusz mini-programjai" **ide** tartoznának, nem a `programs`-ba. |
| Ismert slug-ok | `src/lib/programs.ts:31-40` | `foundation`, `elsolepes`, `napindito`, `5naposhasmelytorzschallange` — de ezek csak **ikon/szín-hintek**, nem tartalom. |
| Belépő program | `src/lib/landing-catalog.server.ts:20` | `ENTRY_SLUG = "foundation"`. |
| Tartalom-elv | `CLAUDE.md` | **A production Firestore szándékosan üres**; a tartalom a `/admin`-on át érkezik. A `docs/workouts/`-ban 7 db workout-leírás van (F001–F007), nem 20. |

### 2.5 Mérés

| Elem | Hol | Valóság |
|---|---|---|
| Esemény-réteg | `src/lib/track.ts` | **Vendor-semleges** `lx_*` események a `dataLayer`-be. Ma három: `lx_onboarding_start`, `lx_registration_complete`, `lx_checkout_start`. |
| Hard szabály | `track.ts:13` | „**NEVER carry personal data** (no e-mail, no name, no uid, no answers)". |
| Vendor-leképezés | `docs/meta-pixel-setup.md:72-76` | GTM-ben: `lx_onboarding_start → Lead`, `lx_registration_complete → CompleteRegistration`, `lx_checkout_start → InitiateCheckout`. Pixel ID `938411635181898`, **a konténerben, nem a kódban**. |
| Hozzájárulás | `src/components/Analytics.tsx` + `lx-consent` localStorage | Elutasításnál **a GTM konténer el sem indul** — se GA4, se Pixel. |
| Szerveroldali CAPI | `src/lib/meta-capi.ts` | Ma **kizárólag `Purchase`**, hozzájárulás-kötötten, hashelt e-maillel. |

### 2.6 Jog

`docs/legal/adatkezelesi-tajekoztato.md` — **élesben van**, hatályos 2026-08-11-től,
`/adatvedelem` alatt renderelve. Amit tartalmaz: 13 adatkezelési cél (a)–(m), köztük
**b) „Személyre szabás (regisztrációs kérdőív)" — jogalap: szerződés teljesítése**,
h) edzés-emlékeztető (hozzájárulás), k) GA4, l) Meta Pixel, m) Meta CAPI.
Amit **nem** tartalmaz: lead-gyűjtés, hírlevél/marketing-levél mint önálló cél, és
**semmilyen GDPR 9. cikk szerinti adatkezelés**. A 9. cikk a teljes dokumentumban
**egyetlen egyszer** szerepel (`:60`), ott is szűkítő értelemben: a haladásfotókra
kimondja, hogy azokból az Adatkezelő különleges adatot *nem képez*. Vagyis a tájékoztató
nem tiltja a 9. cikkes kezelést — **egyszerűen nem is ismeri**, tehát a kvíz testadatai
alá ma nincs alátámasztó fejezet. Nyitott kockázatok: `docs/legal/nyitott-jogi-kerdesek.md:18-25`
(a fotók és az edzésnapló 9. cikkes minősítése ügyvédi ellenőrzésre vár).

---

## 3. Gap- és ütközéselemzés — a spec fejezetenként

| Fejezet | Ítélet | Indoklás |
|---|---|---|
| **1. Áttekintés, KPI-k** | **ADAPTÁLANDÓ** | A KPI-k mérhetők (GTM/GA4 él), de új `lx_*` eseményeket kell definiálni. A „Valóság-szabály" (`active:true`) helyes elv — csak a `status === "published"` fogalomra kell fordítani. |
| **2. Flow (S0–S15)** | **ADAPTÁLANDÓ** | Mint UI-flow átvehető, DE 11-ből 8 kérdés vagy átfed, vagy tiltott adatot kér (lásd 3.1). |
| **3. Globális UI-szabályok** | **ÁTVEHETŐ** | Mobil-first, egy kérdés/képernyő, kliensoldali állapotmentés, „szerverre semmi az S14 előtt" — mind egyezik a meglévő funnel mintáival (URL-alapú lépés, localStorage draft). |
| **4. S0–S12 kérdések** | **RÉSZBEN ÜTKÖZIK** | Lásd 3.1. és 3.2. |
| **4. S13 betöltő (8–12 mp)** | **ÜTKÖZIK** | `docs/onboarding-personalization-plan.md:114-118` a „labor illusion" beat-et 2–4 mp-ben rögzíti, és kimondja: „**Never fake-long**". A 8–12 mp szándékos késleltetés ezzel szemben áll (és EU Omnibus/dark-pattern-kockázat). |
| **4. S14 adat-bekérő** | **ADAPTÁLANDÓ** | A két külön checkbox mintája jó és követi a meglévő dual-consent checkoutot. De: a `consent_health` létjogosultsága eldől azon, marad-e az O1 blokk; a `consent_policy_version` mezőnek **nincs mai megfelelője** (`recordConsent`, `src/lib/pricing/checkout-server.ts:117-129`, nem tárol verziót). |
| **5.1 O1 — kalória** | **ÜTKÖZIK (a legsúlyosabban)** | `docs/onboarding-personalization-plan.md:106-108`: „Deliberately NOT adding: … **weight, goal-weight** …"; `:67-74`: a súlycél-projekció „legkritizáltabb minta", FTC-substantiation csapda, body-positive szabálysértés. Ez a spec O1-jének teljes bemenete (Q2 sex, Q3 age, Q4 body, Q5 target_weight). Emellett a hatályos adatkezelési tájékoztató nem ismer 9. cikkes adatkezelést. |
| **5.2 O3 — lépéscél** | **ÁTVEHETŐ** | Önmagában ártalmatlan, nincs vele ütköző döntés. Viszont a termék **nem mér lépést** — ez tisztán tanácsadó output, nincs mögötte funkció. |
| **5.3 O2 — program-ajánló** | **ADAPTÁLANDÓ** | A döntési fa logikája jó, de a katalógusa fiktív (lásd 3.3). |
| **6. Program-katalógus** | **ÜTKÖZIK** | A `P_*`/`B_*` kódok közül **egy sem létezik** a kódbázisban entitásként. A spec „forrás-hierarchiája" F001–F020-at (4 hét) állít késznek; a repóban `docs/workouts/` alatt **F001–F007** van. A prod Firestore szándékosan üres (`CLAUDE.md`). |
| **7. Eredményoldal R0–R5** | **RÉSZBEN ÜTKÖZIK** | R1 az O1-től függ. R3 `next_step` blokkjához **nincs adatmodell**. **R5 CTA („ingyenes próbával") hamis** — nincs trial (`src/lib/pricing/config.ts`), a belépő 490 Ft/hét. |
| **8.1–8.2 Backend** | **ADAPTÁLANDÓ** | Next.js API route + Firestore + Admin SDK. Minta készen: publikus, rate-limitelt POST → `src/app/api/auth/reset-request/route.ts`; limiter → `src/lib/rate-limit.ts` (`allowRequest`, kulcs lehet e-mail is). Szerveroldali újraszámolás elve helyes. |
| **8.3 E-mail-továbbítás** | **ADAPTÁLANDÓ / a MailerLite-feltevés ELVETENDŐ** | Nem kell külső rendszer: SendGrid + react-email + kategóriák + one-click unsub már él. Ami hiányzik: uid-mentes címzés, uid-mentes leiratkozó token, és **időzített szekvencia-motor** (ma csak fix napi/óránkénti cron van). |
| **8.4 Handoff token** | **NAGYRÉSZT FELESLEGES** | A `localStorage` draft + `RegisterForm.tsx:43` már pontosan ezt csinálja, token nélkül, egészségügyi adat URL-be kerülése nélkül. Ha mégis kell szerveroldali átadás (pl. cross-device e-mail-linkről), a mintája kész: `src/app/api/finish-share/session/route.ts:12,44-56` (`randomBytes(18).toString("base64url")` + `expiresAt` + Firestore TTL `purgeAt`). |
| **8.5 `quiz_leads` tábla** | **ADAPTÁLANDÓ** | Postgres-séma → Firestore kollekció. `email` mint doc-ID adja az upsert-kulcsot (a repo bevett mintája: „doc-IDs carry uniqueness", `docs/pricing-implementation-status.md`). **Rules-módosítás NEM kell**: a `firestore.rules` alja default-deny, tehát egy új kollekció automatikusan kliens-olvashatatlan és csak az Admin SDK írja. |
| **9. Analytics** | **ADAPTÁLANDÓ + egy ütközés** | A 7 esemény felvehető `lx_quiz_*` néven a GTM-be. **Ütközés:** a Meta `Lead` standard esemény ma a `lx_onboarding_start`-ra van kötve (`docs/meta-pixel-setup.md:73`) — el kell dönteni, melyik a „Lead". A `quiz_step` `answer` paramétere pedig **sérti a `track.ts:13` hard szabályt** (a válasz személyes adat-jellegű; nem mehet a dataLayerbe). |
| **10. GDPR** | **RÉSZBEN FELESLEGES, RÉSZBEN ÜTKÖZIK** | Az adatkezelési tájékoztató **létezik és élesben van** (nem „jogi feladat nulláról"), tehát a 10.2 blokkoló feltétel részben teljesült — **viszont ki kell egészíteni** lead-gyűjtéssel, marketinglevéllel és (ha marad az O1) 9. cikkes adatkezeléssel. A `consent_policy_version` verziókövetéshez ma nincs mechanizmus. |
| **11. Edge case-ek** | **ÁTVEHETŐ** | Semmi ütköző. |
| **12. E1–E6 + W1 szekvencia** | **ADAPTÁLANDÓ (nagy munka)** | Nem sablonírás a szűk keresztmetszet, hanem az **időzített, uid-mentes szekvencia-motor** + a Grtv.-konform leiratkozás. Ütközés az e-mail-doktrínával: `docs/email-system-plan.md:2` „Less is more" — 7 levél 30 napon belül a rendszer eddigi fegyelmének a többszöröse. |
| **13. Élesítési checklist** | **ADAPTÁLANDÓ** | A „nem fejlesztői blokkolók" közül a Meta Pixel/GA4/UTM **kész**, az adatkezelési tájékoztató **kész, de módosítandó**, a program-katalógus **nem létezik**. |
| **14. T1–T11 tesztek** | **ÁTVEHETŐ** | A repo mintája pontosan ez: keretrendszer nélküli, `node --import tsx scripts/*-selftest.ts` plain assertion (3 ilyen létezik, `package.json:20-22`). A T1–T11 közvetlenül egy `scripts/quiz-selftest.ts`-be fordítható. |

### 3.1 Kérdés-átfedési mátrix (a legfontosabb tábla)

| Kvíz Q | Meglévő onboarding mező | Ítélet |
|---|---|---|
| Q1 `goal` (5 opció) | `goal` (5 opció) | **Átfed, de az értékkészlet más.** `fat_loss↔forma`, `strength↔ero`, `posture_energy↔tartas`, `restart↔vissza`, `tone↔?` (nincs pár), `szokas↔?` (nincs pár). Leképezés kell, nem azonosság. |
| Q2 `sex` | — | **Új.** Ütközik a 2026-08-as pozicionálással? Nem tiltott, de indoklás kell (lásd 4.5). |
| Q3 `age_band` | `age` (a típusban létezik, **nem gyűjtött**) | Új gyűjtés. |
| Q4 `body` (magasság+súly) | `height`/`weight` (a típusban létezik, **nem gyűjtött, sehol nem használt**) | **ÜTKÖZIK** a body-positive döntéssel. |
| Q5 `target_weight_kg` | — | **ÜTKÖZIK** (kifejezetten elvetett: „goal-weight"). |
| Q6 `daily_move` | — | Új, ártalmatlan. |
| Q7 `steps_now` | — | Új, ártalmatlan. |
| Q8 `training_now` | `level` (1–3) | **Átfed** (`none↔1`, `sometimes↔2`, `regular↔3`) — kettő helyett egy kell. |
| Q9 `life_stage` | `lifestage` (típusban létezik, nem gyűjtött) + `env` safety-flagek | **Részben átfed.** A meglévő `LIFESTAGE` lista 5 elemű (várandós is), a kvízé 3. |
| Q10 `session_min` | — | **ÜTKÖZIK.** `onboarding-personalization-plan.md:106-108`: a session-length kérdést tudatosan nem tesszük fel, mert „a mi edzéseink ~22–30 perc fixek — a kérdés olyan kontrollt sugallna, ami nincs". |
| Q11 `obstacle` (5 opció) | `obstacle` (5 opció) | **Átfed, más értékkészlettel.** `no_time↔ido`, `no_motivation↔motiv`, `dont_know_how↔tudas`, `gave_up↔?`, `bad_experience↔?` vs. `serules`, `elso`. |

**Összegzés: 11 kérdésből 4 közvetlenül átfed (Q1, Q8, Q9, Q11), 3 ütközik rögzített
döntéssel (Q4, Q5, Q10), 4 valóban új (Q2, Q3, Q6, Q7).**

### 3.2 Funnel-illeszkedés (§40.8 / a 20 assertion)

**Tényszerű válasz: a kvíz nem tudja megsérteni a 20 assertiont, mert azok négy konkrét
route-ra (`/onboarding`, `/register`, `/subscribe`, `/app`) vonatkoznak, és a
`funnelDestination()` ma amúgy sem fut sehol** (csak a selftest hívja). Egy ötödik,
publikus, anonim route (pl. `/terv`) a tábla szempontjából **láthatatlan**: nincs új
`FunnelState`, nincs új `FunnelRoute`, a selftest változatlanul zöld marad.

**Amire viszont figyelni kell:** ha a kvíz *írja* a `lexfit_onb_v1` draftot, akkor a
felhasználó a kvíz után `anon` helyett `anon_draft` állapotba kerül. A táblában ez a két
állapot **azonos** (`funnel.ts:18-30`), tehát ez sem sérti a szerződést — de a `/onboarding`
belépéskor a wizard fel fogja ajánlani a folytatást a kvízbeli válaszokkal.

### 3.3 Program-katalógus leképezés

> **⚠️ EZT A TÁBLÁZATOT A 8. FEJEZET FELÜLÍRJA.** Az alábbi „nem létezik" ítéletek a
> **kódbázisra** igazak, és abból a feltevésből indultak, hogy a production Firestore
> üres (`CLAUDE.md`). **A 2026-08-21-i prod-leltár szerint ez a feltevés téves:** a spec
> aktív programjai közül **mind a hét létezik és `published` állapotban van.** A tényleges
> leképezést a **8.2 táblázat** tartalmazza — az alábbi csak dokumentálja, mi látszik
> pusztán a kódból.

| Spec-kód | Spec-név | Valóság a repóban |
|---|---|---|
| `P_ELSO_LEPES` | 7 napos Első Lépés | **Nem létezik tartalomként.** Egyetlen nyoma: `elsolepes` ikon/szín-hint (`src/lib/programs.ts:32`). |
| `P_START` | Lexfit Start | **Nem létezik ezen a néven.** A belépő program a `foundation` (`landing-catalog.server.ts:20`), amiből `docs/workouts/` alatt 7 edzés van dokumentálva, nem 20. |
| `P_TARTAS` | A görnyedés vége — 4 hetes Tartásjavító | **Nem létezik.** A repóban egyetlen találat maga a spec. |
| `P_ELINDULOK`, `P_OTTHONI_ERO`, `P_VALTOZOKOR`, `P_IROASZTAL`, `P_ANYA` | — | Nem léteznek (a spec is inaktívnak jelöli őket). |
| `B_LAB_FENEK`, `B_HAS_TORZS` | 5 napos challenge-ek | **Nem léteznek.** `5naposhasmelytorzschallange` szintén csak ikon-hint (`programs.ts:33`). |
| `B_NAPINDITO`, `B_NAPZARO` | 3 rutin | `napindito` szintén csak ikon-hint. |
| `B_HAS_7` | 7 napos Has-kihívás | Csak példa-cím a típusdefinícióban (`types.ts:168`). |

**A spec 6. fejezete tehát ma nem konfiguráció, hanem kívánságlista.** Ráadásul a
„flag átállítása = élesítés, kódmódosítás nélkül" elv (T7) **már megvalósult** a valós
rendszerben: a `status: draft → published` átállítás az adminban pontosan ezt csinálja.

---

## 4. Döntési lista a tulajdonosnak

### D1 — Kvíz vs. meglévő onboarding

| Opció | Előny | Hátrány |
|---|---|---|
| **(a) Marketing-oldali lead magnet, a draftba írva** | Az e-mail-lead valóban új érték (ma nulla lead-gyűjtés van). A közös válaszok (goal, level/training, obstacle, life_stage) előtöltik az onboardingot → a kitöltő nem kérdez kétszer. A funnelt nem bántja. | Két kérdéskészlet + két értékkészlet karbantartása; leképezési réteg kell (3.1). A landing egyetlen, tiszta CTA-ja megkettőződik. |
| **(b) A kvíz VÁLTJA az onboarding első felét** | Egy kérdéssor, nulla duplikáció, a legerősebb konverziós ív (kalkulátor-érték → e-mail → fizetés). | A `/onboarding` = `/register` wizard szétszedése; a reveal-logika (`_mock.ts` reveal blokk, minden válasz visszaköszön) újraírása; a body-kérdések bekerülése a **fizető** onboardingba is → a body-positive döntés teljes felülírása. Nagy, kockázatos átépítés élő tölcséren. |
| **(c) Teljesen különálló rendszerek** | Leggyorsabb; nulla regressziós kockázat a fizető tölcséren. | A kitöltő a regisztrációnál újra végigmegy 7 kérdésen → mérhető drop-off; két igazság ugyanarról a felhasználóról. |

**Ajánlásom: (a).** Indoklás: ez az egyetlen opció, ami *új* értéket teremt (lead-lista)
anélkül, hogy hozzányúlna a most is konvertáló, frissen auditált fizető tölcsérhez. A
draft-mechanizmus már létezik és tesztelt (`npm run test:onboarding-draft` zöld), tehát
az átadás lényegében ingyen van. A (b)-t akkor érdemes elővenni, ha a kvíz mért
konverziója 4–6 hét után magasabb, mint a jelenlegi onboardingé — akkor viszont már
adattal döntünk, nem feltevéssel.

### D2 — E-mail infrastruktúra

| Opció | Előny | Hátrány |
|---|---|---|
| **(a) Külső eszköz (MailerLite/ActiveCampaign) a spec szerint** | Kész szekvencia-motor, kész szegmentálás, kész leiratkozás-kezelés; marketinges önállóan szerkeszt. | Új adatfeldolgozó → **az adatkezelési tájékoztató 5. pontját bővíteni kell** (ügyvéd); második e-mail-domain-reputáció; havi díj; a lead-adat kikerül a saját rendszerünkből (törlési folyamat két helyen); a react-email arculat nem öröklődik. |
| **(b) A meglévő SendGrid + react-email rendszer kiterjesztése** | Nulla új adatfeldolgozó, nulla új jogi lábjegyzet, egységes arculat, a kód már tud kategóriát + one-click unsubot. | **Nincs időzített szekvencia-motor** — meg kell építeni (napi cron + `dueAt` mezős lead-dokumentum). A leiratkozó tokent uid-mentesre kell általánosítani (`email-unsub.ts` ma `uid`-re HMAC-el). Marketinges nem tud önállóan szerkeszteni. |

**Ajánlásom: (b).** Indoklás: a hiányzó darab (időzítés) egy napi cron + egy `nextEmailAt`
mező — ez lényegesen kisebb munka, mint egy új adatfeldolgozó jogi és üzemeltetési
átvezetése. A rendszer minden más primitívje (transport, sablon, kategória, RFC 8058
unsub, Sentry-riasztás, fail-safe cron-szekciózás) már megvan és éles forgalomban
bizonyított. Külső eszközre akkor váltsunk, ha a marketing önálló szerkesztési igénye
konkrét, ismétlődő és mérhető szűk keresztmetszet lesz.

### D3 — A spec 8. fejezetének leképezése

**Ajánlott leképezés (nem opció, hanem a stack diktálja):**

| Spec | Valós megfelelő |
|---|---|
| `POST /api/quiz-lead` | Next.js Route Handler, `runtime="nodejs"`, `dynamic="force-dynamic"`. Minta 1:1: `src/app/api/auth/reset-request/route.ts`. |
| Spam-védelem, rate limit | `src/lib/rate-limit.ts` → `allowRequest("quizLead", email, 3, HOUR_MS)`. Honeypot marad. |
| `quiz_leads` tábla | `quizLeads/{sha256(email)}` (vagy normalizált e-mail mint doc-ID) — Admin SDK írja, kliens nem éri el (default-deny, `firestore.rules` alja). **Rules-módosítás nem kell.** |
| `handoff_token` | **Elhagyható** (a draft megoldja). Ha mégis kell: `finish-share` minta (`randomBytes` + `expiresAt` + TTL `purgeAt`). |
| Consent-napló | A `recordConsent()` mintája (`checkout-server.ts:117-129`), kiegészítve a hiányzó `policyVersion` mezővel. |
| Aszinkron továbbítás + retry | (b) opció esetén tárgytalan: közvetlenül a `mailer.ts` küld, a `deliver()` már soha nem dob. |

**Kérdés a tulajdonosnak:** kell-e cross-device átadás (a kitöltő telefonon tölti ki, de
gépen regisztrál)? **Ha nem, a handoff-token teljes fejezete törölhető a scope-ból.**
Ajánlásom: **nem kell** az 1.0-ban — a lead az E1 levélben úgyis kap egy linket.

### D4 — Program-kódok és a katalógus forrása

| Opció | Előny | Hátrány |
|---|---|---|
| **(a) Saját, kódba/config-ba égetett katalógus (a spec szerint)** | A kvíz üres Firestore mellett is működik; a marketing-copy szabadon írható. | **Két igazság**: a kvíz olyan programot nevezhet meg, ami az appban nem létezik vagy máshogy hívják. A spec saját „Valóság-szabálya" sérülne. |
| **(b) Firestore `programs` + `challenges` olvasása (`status === "published"`)** | Egyetlen igazság; a „flag-átállítás = élesítés" elv (T7) **automatikusan** teljesül; a kvíz sosem ígérhet nem létező programot. | A kvíz eredményoldala Firestore-függő lesz (megoldás: a meglévő `loadLandingCatalog()` fail-safe mintája, `landing-catalog.server.ts:31-39` — kiesésnél sem 500, hanem fallback). Marketing-copy (`pitch`) mezőt fel kell venni a program-modellbe vagy az adminban. |

**Ajánlásom: (b), egy kiegészítéssel** — a *döntési fa* (melyik profil melyik programra
mutat) maradjon kódban/konfigban, de a **programok létezése, neve és állapota**
Firestore-ból jöjjön. A mapping ne kódokra (`P_START`) hivatkozzon, hanem valós
slug-okra (`foundation`, …), és minden ág fallbackje a `foundation` legyen.
**Blokkoló előfeltétel:** a tulajdonosnak meg kell mondania, mely programok/kihívások
lesznek élesben a kvíz indulásakor — ma a prod tartalom-állapota a repóból nem látszik.

### D5 — Pozicionálás és a `sex` / `life_stage` kérdés

**Tény:** a `CLAUDE.md` 2026-08-as frissítése kimondja: „**NO LONGER women-first; don't
gender the copy or assume a female-only audience**". A spec ezzel **formálisan
konzisztens** (van `male` opció, a férfi-ág végig kezelt), **de két ponton aszimmetrikus**:
a `life_stage` kérdés csak nőknek jelenik meg, és a `B_LAB_FENEK` / `B_HAS_TORZS`
bónusz-szétosztás nemi alapú (`5.3`).

Ugyanakkor a meglévő tervdokumentum (`onboarding-personalization-plan.md:67`) még
„women-first, body-positive guardrails" néven hivatkozik a szabályokra — **a doksi
elavult, a guardrailek viszont érvényben vannak**.

| Opció | Előny | Hátrány |
|---|---|---|
| **(a) `sex` marad (BMR-hez kell), `life_stage` marad nő-specifikusan** | Számítási pontosság; a postpartum/menopauza valós, kiszolgálatlan igény. | Aszimmetria; férfi-specifikus élethelyzet nincs → a férfi kitöltő kevésbé érzi személyre szabottnak. |
| **(b) `sex` marad, `life_stage` mindkét nemnél megjelenik** (férfiaknál pl. ülőmunka/ízület) | Szimmetrikus, konzisztens az új pozicionálással. | Több copy, több ág. |
| **(c) Mindkettő kimarad** (ha az O1 is kimarad) | Legegyszerűbb; nulla érzékeny adat. | Elveszik a kalória-output és a program-finomhangolás. |

**Ajánlásom: (b)**, ha az O1 marad; **(c)**, ha az O1 kimarad. A bónusz-szétosztást pedig
kössük a `focus` válaszhoz, ne a nemhez — így a nemi alapú testrész-sztereotípia eltűnik,
és ráadásul jobban is találunk.

### D6 — Az O1 (kalória + testsúly) blokk sorsa — **ez a legfontosabb döntés**

Ez nem szerepel a Fázis 2 listáján, de a felderítés alapján ez a spec legkockázatosabb
eleme. Ütközik egy rögzített termékdöntéssel (`onboarding-personalization-plan.md:67-74,
107`), és 9. cikkes adatkezelést hozna be egy olyan rendszerbe, amelynek hatályos
adatkezelési tájékoztatója **ilyen adatkezelést egyáltalán nem ismer** (a 9. cikk
egyetlen említése, `:60`, a haladásfotókra vonatkozó kizáró mondat).

| Opció | Előny | Hátrány |
|---|---|---|
| **(a) O1 marad, teljes egészében** | A kalória-kalkulátor a legerősebb lead magnet-mechanika (konkrét szám → azonnali észlelt érték); a spec számítási része auditált. | Felülírja a saját body-positive döntésünket; **9. cikkes adatkezelés** → tájékoztató-módosítás + ügyvédi jóváhagyás + kifejezett hozzájárulás; törlési/hozzáférési folyamat leadekre is; márkakockázat (a LexFit eddig kifejezetten *nem* súlyközpontú). |
| **(b) O1 kimarad; a kvíz 2 outputos (program + lépéscél)** | Nulla jogi és márka-kockázat; a Q2/Q3/Q4/Q5 kérdések elhagyásával a kvíz 6 kérdésre rövidül → magasabb befejezési arány. | Gyengébb „wow"-faktor; a lépéscél önmagában kevés érzékelt értéket ad. |
| **(c) O1 helyett nem-testsúly-alapú érték** — pl. „heti mozgás-költségvetés", „ennyi edzés fér bele 4 hét alatt", energiaszint-index | Megtartja a „konkrét szám" mechanikát, illeszkedik a rögzített „derived pace, honest moat" gondolathoz (`personalization-plan.md:59-60`); nulla különleges adat. | Új számítási logika kitalálása; nincs hozzá auditált referencia-implementáció. |

**Ajánlásom: (c), másodsorban (b).** Indoklás: a spec maga is a *személyre szabottság
érzetét* nevezi meg mechanizmusként, nem a kalóriaszámot mint terméket. Ugyanezt az
érzetet elő lehet állítani a saját, már rögzített és jogilag tiszta „napok → tempó"
sztorival, amiről a saját kutatásunk azt írja: „**No competitor tells the days→pace story
— it's an honest moat**". Az (a) csak akkor vállalható, ha a tulajdonos tudatosan
felülírja a body-positive döntést **és** kifizeti a jogi átvezetést.

### D7 — A „14 napos ingyenes próba" copy

**Tény:** nincs trial. A belépő ajánlat 490 Ft/hét (`src/lib/pricing/config.ts:72-75`),
és pay-to-join hard gate van (`src/lib/billing.ts:168`) — regisztráció után a felhasználó
**nem a programjánál landol, hanem a fizetésnél**.

**Ajánlásom (nem opció, javítás):** a spec R5 CTA-ját és a 8.4 ígéretét át kell írni a
valóságra: „**Kezdem a programom — az első hét 490 Ft**". Ez egyben azt is jelenti, hogy
az E4 levél („ingyenes próba / kedvezményes első hónap") tartalmát is újra kell tervezni.

### D8 — Analytics: melyik esemény a Meta `Lead`?

Ma `lx_onboarding_start → Lead`. Ha a kvíz e-mail-submitja is `Lead`, két különböző
minőségű esemény keveredik egy optimalizálási célban.

**Ajánlásom:** a kvíz e-mail-submit legyen a `Lead` (ez a valódi lead), a
`lx_onboarding_start` pedig menjen át `InitiateCheckout` előtti egyedi eseménybe
(vagy Meta `ViewContent`-be). **Ez GTM-konténer-munka, nem deploy** — pontosan ezért
lett a réteg vendor-semleges. Emellett: a `quiz_step` eseményhez **nem szabad** a
választ paraméterként adni (`track.ts:13`); helyette csak `step_id` menjen.

---

## 5. Javasolt integrációs vázlat (a nyertes opciók szerint, kód nélkül)

A **7. fejezet szerinti tényleges döntésekkel**: D1=(a) előtöltéssel · D2=(b) saját SendGrid ·
D3=token nélkül · D4=(b) Firestore · D5=nem-semleges · **D6=(a) — az O1 teljes egészében
marad** · D7=„az első hét 490 Ft" · D8=a kvíz-submit a `Lead`.

> **Az O1=(a) döntés miatt ez a vázlat NEM indítható jogi átvezetés nélkül.** A 7.3 blokkoló
> listája élesítési előfeltétel, nem párhuzamosítható utómunka.

**Route-ok**
- `GET /terv` — publikus, anonim kvíz-oldal (saját, könnyű CSS-scope, a `.lxl` landing
  mintájára). Nem `Protected`. A wizard-minta (URL = igazság, `?q=…`) átvehető.
- `POST /api/quiz-lead` — publikus, honeypot + `allowRequest("quizLead", email, …)`,
  szerveroldali validáció és újraszámolás, Admin SDK írás. Válasz: `{ ok: true }`.
- Az eredményoldal marad kliensoldali (a számítás azonnali) — a szerver csak ment és küld.

**Firestore**
- `quizLeads/{normalizedEmail}` — `firstName`, `email`, `consents` (+ `policyVersion`,
  `at`, `ip`, `userAgent`), `answers`, `computed`, `utm`, `quizVersion`, `retakeCount`,
  `createdAt`/`updatedAt`, `convertedAt`, `deletedAt`, valamint a szekvenciához:
  `nextEmailAt`, `nextEmailStep`, `unsubscribedAt`.
- **Rules: nem módosul** (default-deny már fedi).
- **Index:** a napi cronhoz kell egy `nextEmailAt` szerinti lekérdezés → `firestore.indexes.json`
  bővítés (ma egyetlen index van benne).
- **Program-katalógus:** nem új kollekció — a meglévő `programs` + `challenges`
  `status === "published"` olvasata, a `loadLandingCatalog()` fail-safe mintájával.

**Átadás az onboardingnak (a handoff-token helyett)**
- A kvíz sikeres submitja után a kliens megírja a `lexfit_onb_v1` draftot a leképezett
  közös válaszokkal (goal → `goal`, training_now → `level`, obstacle → `obstacle`,
  life_stage → `lifestage`), `idx: 0`-val, hogy a wizard elölről induljon, de kitöltve.
- A `/onboarding` így a meglévő, tesztelt úton veszi át őket; regisztrációkor a
  `RegisterForm.tsx:43` menti. **Új kód a funnelben nem kell.**
- A leadet a regisztráció után `convertedAt`-tel jelöljük (a webhook vagy a
  `/api/auth/post-register` route már fut ilyenkor — ez a természetes hely).

**E-mail**
- Új react-email sablonok az `emails/` alá (E1 tranzakciós; E2–E6, W1 marketing).
- **Uid-mentes unsub:** az `email-unsub.ts` `UnsubKind`-ját ki kell egészíteni egy
  lead-ággal, és a HMAC alanya `uid` helyett a lead doc-ID legyen. E nélkül a
  marketing-levelek Grtv.-sértők.
- **Szekvencia-motor:** a meglévő napi cron (`/api/cron/reminders`, `vercel.json`) kap egy
  új, izolált szekciót (`section()` minta), ami a `nextEmailAt <= now` leadeket lépteti.
  Nincs szükség új infrastruktúrára.
- E1 azonnal, a submit route-ból (a `deliver()` soha nem dob, tehát nem blokkolja a választ).

**Mérés**
- Új `lx_quiz_*` események a `track.ts`-be, **válasz-paraméter nélkül**.
- GTM-ben leképezés Meta/GA4 eseményekre (deploy nélkül), a `Lead` átcímkézésével (D8).
- Szerveroldali CAPI a lead-re: **az 1.0 része** (a jelentés eredeti „halasszuk el"
  ajánlását a G2/G3 válasz felülírta). Evergreen kampánynál, `Lead`-re optimalizálva a
  match quality közvetlenül a CPL-ben jelentkezik; a `meta-capi.ts` már él, csak egy
  második `event_name` ág kell. **Kizárólag hozzájárulás mellett, és `custom_data`-ban
  a kvíz-válaszok nélkül** (lásd 7.4).

**Jog**
- Az adatkezelési tájékoztató bővítése egy új céllal (**n) Lead-kvíz és hírlevél**) +
  a Grtv. szerinti marketing-hozzájárulás rögzítése + megőrzési idő + a törlési folyamat
  kiterjesztése a `quizLeads`-re (a meglévő `/api/account/delete` csak uid-alapú).
- **Az O1=(a) döntés miatt ehhez jön a GDPR 9. cikkes adatkezelés** (testadat, cél-testsúly,
  `life_stage`) — jogalap: 6(1)(a) + **9(2)(a) kifejezett hozzájárulás**. Ez ügyvédi
  feladat, és **élesítési hard blokker** (7.3).

**Tesztek**
- `scripts/quiz-selftest.ts` a T1–T11-gyel, `npm run test:quiz` néven — pontosan a
  `funnel-selftest`/`pricing-selftest` mintájára (plain assertion, nincs keretrendszer).
  A spec 14. fejezete átvételi feltételként megtartható.

**Sorrend:** lásd a **7.5 pontot** (a döntésekkel frissített, függőség-helyes sorrend).

---

## 6. Kockázatok és nyitott kérdések (emberi válasz kell)

**Kockázatok**

1. **Két konverziós út versenye.** A landing ma egyetlen akciót ismétel 15+ helyen
   (`/onboarding`). Egy második, „puhább" CTA (kvíz) elszívhatja a forgalmat a fizetős
   útról. Mérési terv kell a bevezetéssel egy időben, nem utána.
2. **A lead-adat törlési kötelezettsége.** A meglévő GDPR-gépezet (`/api/account/delete`,
   `/api/account/export`, `purge-accounts` cron) **kizárólag `uid`-alapú**. Egy fiók
   nélküli lead törlési kérelmét ma semmi nem tudja kiszolgálni — ezt együtt kell
   megépíteni a kollekcióval, nem utólag.
3. **E-mail-reputáció.** Az `hi@lexfit.hu` ma tranzakciós/lifecycle forgalmat visz. Egy
   hideg lead-listára küldött 7 levél panaszaránya ezt a domaint terheli, tehát a
   fizető ügyfelek számláit és emlékeztetőit is veszélyezteti. Külön subdomain vagy
   külön SendGrid sender megfontolandó.
4. **A spec „a fejlesztőre csak a UI marad" állítása nem áll.** A felderítés alapján a
   valódi munka: uid-mentes e-mail-ág, szekvencia-motor, katalógus-integráció, jogi
   átvezetés, mérési átcímkézés — a UI ennek kisebbik fele.

**Nyitott kérdések**

1. ~~**Mi a production Firestore tényleges tartalma ma?**~~ ✅ **MEGVÁLASZOLVA (2026-08-21)** —
   lásd a **8. fejezetet**. A prod **nem üres**: 7 published program (mind playlisttel),
   16 published kihívás, 47 videó, 68 challenge-videó. A spec minden aktív programjának
   van valós, published megfelelője. **Új, ebből fakadó kérdések: 8.4/1 (`tartasjavito`
   edzésszám-ellentmondás) és 8.4/4 (a „Lexfit Start" vs. „Foundation" névütközés).**
2. **Hol tart valójában a launch?** A `docs/launch-cutover-runbook.md` státusz-oszlopa
   végig üres (☐), miközben a commit-történet és a doksik szerint a Sentry, a SendGrid
   domain-autentikáció, a GA4, a GTM, a Meta Pixel, a Meta CAPI és a jogi oldalak
   **élesek**, és a `docs/launch-readiness-plan.md` fejléce még mindig „PROPOSED".
   *A runbook elavult — kérdés: a Stripe live cutover lezárult? A kvíz élesítése előtt
   vagy után van a nyilvános launch?*
3. **A `docs/onboarding-personalization-plan.md` guardrail-fejezete (66–74., 107.) érvényben
   marad?** A teljes D6 döntés ezen áll. Ha a tulajdonos felülírja, azt írásban kell
   rögzíteni, mert a mai kód és copy erre a döntésre épül.
4. **Kell-e cross-device átadás?** Ha nem, a spec 8.4 fejezete törölhető (D3).
5. ~~**A spec 6. fejezete azt állítja, F001–F020 (4 hét) kész.**~~ ✅ **MEGVÁLASZOLVA
   (2026-08-21)** — a `foundation` programnak **20 feltöltött edzése** van a prodban
   (8.3/3). A spec állítása igaz; a `docs/workouts/` alatti 7 fájl csak hiányos
   dokumentáció, nem a tartalom állapota.
6. **Ki írja a lead-levelek szövegét, és mikor?** A spec ezt „marketing feladatnak"
   sorolja — a 12. fejezet 7 levele nélkül a szekvencia-motor önmagában értéktelen.
7. **A KSH ELEF 2019-es hivatkozások (S7 interstitial, R2 „hol állsz") forrás-ellenőrzése
   megtörtént?** A repo eddigi szabálya (`docs/landing-analysis/FIX.md`, a „hat hamis
   állítás" purge) az volt, hogy alátámasztatlan számot nem publikálunk. Ugyanez a mérce
   vonatkozik ezekre a statisztikákra is.
8. **Mi a `consent_policy_version` forrása?** Ma nincs verziószám az adatkezelési
   tájékoztatón, csak hatálybalépési dátum („2026. augusztus 11."). *Kérdés: a dátum
   legyen a verzió, vagy vezessünk be külön verziószámozást — utóbbi a meglévő
   `recordConsent()`-et is érinti?*

---

## 7. Döntési napló — tulajdonosi válaszok (2026-08-21)

Ez a fejezet a dokumentum **kötelező érvényű záradéka**. Ahol a 3–4. fejezet elemzése vagy
ajánlása ettől eltér, **ez a fejezet az irányadó**.

### 7.1 Keret-tisztázás (a tulajdonos közlése)

A kvíz **Meta Ads kampány lead magnetje**, NEM az app feature-e. Kizárólag hirdetési
forgalmat fogad („töltsd ki, hogy megtudd, milyen edzés illik hozzád" típusú kampány).

**Amit ez felülír a jelentésben:**
- A 6.1 kockázat („két konverziós út versenye a landingen") **tárgytalan** — a landing
  egyetlen CTA-ja érintetlen marad, a kvízre csak fizetett forgalom érkezik.
- A D1 (b) opció — „a kvíz váltja az onboarding első felét" — **lekerült az asztalról**.
- A `Lead` esemény nem könyvelési kérdés, hanem **a kampány optimalizálási jele** →
  a szerveroldali CAPI felértékelődött (7.4).

### 7.2 A nyolc döntés

| # | Döntés | Válasz | Következmény |
|---|---|---|---|
| **G1** | Hosztolás | **A meglévő appban, `lexfit.hu/terv`** | Azonos origin → draft-előtöltés ingyen; Firestore-katalógus közvetlenül olvasható; a handoff-token elhagyható. |
| **G2** | Kampány-élettartam | **Evergreen** | Megéri saját szekvencia-motort építeni; a lead-lista hosszú távú eszköz. |
| **G3** | Meta optimalizálás | **`Lead` = a kvíz e-mail-submitja** | Az `lx_onboarding_start` átcímzendő a GTM-ben (konténer-munka, nem deploy). |
| **D1** | Kvíz vs. onboarding | **(a) marketing lead magnet + draft-átadás**, előtöltéssel, de végigkattinthatóan | A wizard előtöltött válaszokkal indul; a felhasználó jóváhagyja őket. **`OnboardingV2.tsx` lépéslogikájához NEM nyúlunk** → a 20 funnel-assertion érintetlen. |
| **D2** | E-mail infra | **(b) a meglévő SendGrid + react-email kiterjesztése** | Nincs új adatfeldolgozó. Két valódi tétel: **uid-mentes leiratkozó token** + **időzített szekvencia-motor**. |
| **D3** | Handoff token | **Elhagyva** | A spec 8.4 fejezete törölve a scope-ból. |
| **D4** | Katalógus forrása | **(b) Firestore `programs` + `challenges`, `status === "published"`** | A döntési fa marad kódban, de **valós slugokra** hivatkozik (`P_START` → `foundation` stb.), minden ág fallbackje a `foundation`. `pitch` mező felveendő. |
| **D5** | Pozicionálás | **Nem-semleges**: a bónusz a **célhoz/fókuszhoz** kötve (nem a nemhez), a `life_stage` **mindkét nemnél** megjelenik | A spec 5.3 bónusz-szabályainak 3–5. sora átírandó. `sex` marad (a BMR-hez kell), de **csak számításra**, nem szegmentálásra. |
| **D6** | **O1 (kalória + testsúly)** | **(a) — teljes egészében marad** | ⚠️ Az ajánlásommal szemben. A T1–T11 audit használható, de **jogi hard blokkert aktivál** (7.3), és szűkíti a hirdetési kreatívot (7.4). |
| **D7** | CTA-ígéret | **„Az első hét 490 Ft"** | A spec „ingyenes próbával" copyja **javítandó** az R5-ben és a 8.4-ben. Az **E4 levél** tartalma is újratervezendő. |
| **D8** | Meta `Lead` | **A kvíz-submit** | Lásd G3. |

### 7.3 Élesítési hard blokkerek (a D6=(a) döntés következményei)

**Ezek nélkül a kvíz nem mehet élesbe.** Nem párhuzamosítható utómunka — a jogi átfutás
a projekt kritikus útja, ezért **elsőként indítandó**.

1. **Az adatkezelési tájékoztató bővítése** (`docs/legal/adatkezelesi-tajekoztato.md`,
   hatályos 2026-08-11) egy új céllal, amely tartalmazza:
   - a lead-kvízt mint önálló adatkezelési célt;
   - a **GDPR 9. cikkes adatkezelést** — testadat, cél-testsúly, `life_stage`, mozgási
     szokások — jogalap: **6(1)(a) + 9(2)(a) kifejezett hozzájárulás**;
   - a hírlevelet/marketinglevelet mint önálló célt (Grtv. 2008/XLVIII §6, **HU-ban nincs
     soft opt-in** — `docs/email-system-plan.md:54,75`);
   - a leadek **megőrzési idejét** (a 9. cikkes adatnál rövid és definiált legyen);
   - az érintetti jogokat **fiók nélküli leadekre** is.
   ⚠️ A hatályos szöveg ma a 9. cikket **egyetlen helyen** említi (`:60`), ott is szűkítően,
   a haladásfotókra. A kvíz testadatai alá **nincs alátámasztó fejezet**.
2. **Ügyvédi jóváhagyás** a fenti szövegre.
3. **`consent_policy_version` mechanizmus** — ma nincs verziószám, csak hatálybalépési dátum
   (nyitott kérdés: 6.8). A meglévő `recordConsent()`-et is érinti.
4. **Lead-törlési és -export út.** A meglévő GDPR-gépezet (`/api/account/delete`,
   `/api/account/export`, `purge-accounts` cron) **kizárólag `uid`-alapú** — fiók nélküli
   lead kérelmét ma semmi nem tudja kiszolgálni. **A `quizLeads` kollekcióval EGYÜTT
   építendő, nem utólag.**
5. **Uid-mentes leiratkozó token** (`src/lib/email-unsub.ts` ma `uid`-re HMAC-el). Enélkül
   minden marketinglevél Grtv.-sértő.

### 7.4 Meta-specifikus korlátok (nem döntés — korlát)

1. **Kvíz-válasz SOHA nem mehet a mérési rétegbe.** A spec 9. fejezete `quiz_step`
   eseményt küldene `answer` paraméterrel — ez sérti a `src/lib/track.ts:13` hard szabályt
   („NEVER carry personal data … no answers"), és egészségügyi válasznál vélhetően a Meta
   Business Tools Terms-öt is. **Csak `step_id` mehet.**
2. **A CAPI lead-esemény `custom_data`-ja nem tartalmazhat testadatot** — csak hashelt
   e-mail + esemény, a `meta-capi.ts` meglévő, hozzájárulás-kötött mintája szerint.
3. **A hirdetési kreatív korlátozott.** A Meta „Personal health and appearance" szabályai
   tiltják a negatív önképre építő fogyás-hirdetést, és a fogyás-témájú célzás 18+
   korlátozott. Gyakorlati következmény: **az O1 a kvíz belsejében élhet, de a hirdetés
   nem épülhet a fogyás-ígéretre.**
   ⚠️ *Ez általános szabályzat-ismeretből származó állítás, nem a repóból. Élesítés előtt
   a hatályos Meta Advertising Standards szövegével ellenőrzendő — felelős: marketing.*

### 7.5 Végrehajtási sorrend (függőség-helyes)

| # | Lépés | Felelős | Blokkolja |
|---|---|---|---|
| 1 | **Jogi átvezetés indítása** (7.3/1–2) | tulajdonos + ügyvéd | az élesítést (nem a fejlesztést) — ✅ **a szövegtervezet elkészült:** `docs/legal/adatkezelesi-tajekoztato-kviz-modositas-TERVEZET.md`. Ügyvédi jóváhagyásra vár (8 nevesített kérdéssel). |
| 2 | ~~**Prod tartalom-leltár**~~ | ~~tulajdonos~~ | ✅ **KÉSZ (2026-08-21)** — lásd a **8. fejezetet**. 7 published program, 16 kihívás; a spec minden aktív programjának van valós megfelelője. |
| 3 | Kvíz UI (S0–S15) + számítási modul + `scripts/quiz-selftest.ts` (T1–T11) | fejlesztés | — |
| 4 | `POST /api/quiz-lead` + `quizLeads` kollekció **+ a lead-törlési/export út együtt** (7.3/4) | fejlesztés | — |
| 5 | E1 eredmény-e-mail (tranzakciós, azonnal a submit route-ból) | fejlesztés + copy | — |
| 6 | Uid-mentes unsub token (7.3/5) | fejlesztés | az E2–E6/W1-et |
| 7 | Szekvencia-motor (`nextEmailAt` + napi cron-szekció) + E2–E6/W1 | fejlesztés + copy | — |
| 8 | GTM-átcímkézés (`Lead` → kvíz-submit) + CAPI lead-ág | marketing + fejlesztés | — |

### 7.6 Ami továbbra is nyitott (nem blokkolja a tervezést)

- **S13 betöltő hossza.** A spec 8–12 mp-et ír; a saját doktrínánk 2–4 mp és „**Never
  fake-long**" (`docs/onboarding-personalization-plan.md:114-118`). **Javaslatom: 3–5 mp** —
  megtartja a labor illusion hatását a befejezési arány feláldozása nélkül. Ellenvetés
  hiányában ezzel megyünk.
- **A KSH ELEF 2019 hivatkozások** (S7 interstitial, R2 „hol állsz") forrás-ellenőrzése.
  A repo bevett szabálya (`docs/landing-analysis/FIX.md` — a „hat hamis állítás" purge),
  hogy alátámasztatlan számot nem publikálunk.
- **F008–F020 státusza.** A spec 4 kész hetet állít; a repóban `docs/workouts/` alatt
  **F001–F007** van dokumentálva.
- **Ki írja az E1–E6 + W1 szövegét, és mikor.** A szekvencia-motor a levelek nélkül
  önmagában értéktelen.
- **`consent_policy_version` formátuma** — a hatálybalépési dátum legyen a verzió, vagy
  külön verziószámozás (utóbbi a meglévő `recordConsent()`-et is érinti).

---

## 8. Production tartalom-leltár (2026-08-21)

**Módszer:** egyszeri, **kizárólag olvasó** Admin SDK lekérdezés a `lexfit-app` projekt
production Firestore-jára (`.get()` hívások, nulla írás). A szkript ideiglenes volt, a
repóba nem került be. Ez a 6. fejezet **1. és 5. nyitott kérdésére** ad választ.

### 8.1 A legfontosabb megállapítás

> **A production Firestore NEM üres.** A `CLAUDE.md` „production Firestore is intentionally
> empty until real content is uploaded" állítása **elavult** — a tartalom időközben
> feltöltésre került az adminon keresztül. A jelentés 2.4 és 3.3 pontja erre az elavult
> feltevésre épült, és ezért **alábecsülte, mennyi valós tartalom áll a kvíz rendelkezésére.**

| Kollekció | Darab | Megjegyzés |
|---|---|---|
| `programs` | **7** — mind `published`, mind `access: "members"` | Playlistek feltöltve (`sessions` alkollekció) |
| `challenges` | **16** — mind `published` | „Szavazz Magadra" archívum, saját `days` alkollekcióval |
| `videos` | 47 | |
| `challengeVideos` | 68 | |
| `filters` | **0** | ⚠️ üres |
| `challengeFilters` | **0** | ⚠️ üres |
| `quizLeads` | 0 | még nem létezik — várt |

### 8.2 A spec katalógusának leképezése a valóságra

**Ez a táblázat váltja ki a 3.3 pontot, és zárja le a D4 döntést.**

| Spec-kód | Spec-név | **Valós slug** | Cím a prodban | Edzés | Státusz |
|---|---|---|---|---|---|
| `P_START` | Lexfit Start | **`foundation`** | „Foundation" | **20** | ✅ published |
| `P_ELSO_LEPES` | 7 napos Első Lépés | **`elsolepes`** | „Első Lépés - 7 napos kezdő program" | 7 | ✅ published |
| `P_TARTAS` | A görnyedés vége — 4 hetes Tartásjavító | **`tartasjavito`** | „A görnyedés vége - 4 hetes tartásjavító program" | 4 | ✅ published ⚠️ (8.4) |
| `B_LAB_FENEK` | 5 napos Láb & Fenék-Challenge | **`5naposlabfenekchallange`** | „Láb & Fenék Challenge" | 5 | ✅ published |
| `B_HAS_TORZS` | 5 napos Has & Mély Törzs | **`5naposhasmelytorzschallange`** | „Has & Mély Törzs Challenge" | 5 | ✅ published |
| `B_NAPINDITO` | Napindító — 3 reggeli rutin | **`napindito`** | „Reggeli rutinok - napindító program" | 3 | ✅ published |
| `B_NAPZARO` | Napzáró — 3 esti rutin | **`napzaro`** | „Napzáró - 3 esti rutin…" | 3 | ✅ published |
| `P_ELINDULOK`, `P_OTTHONI_ERO`, `P_VALTOZOKOR`, `P_IROASZTAL`, `P_ANYA` | — | — | nem létezik | — | ✅ egyezik (a spec is inaktívnak jelöli) |
| `B_HAS_7` | Lexfit 7 napos Has-kihívás | `has-kihivas` (a `challenges`-ben) | „Has kihívás" | **5 nap**, nem 7 | ⚠️ névütközés |

**Következtetés: a spec 6. fejezete nem kívánságlista — a valóság lefedi.** A spec minden
`active: true` programjának van valós, published megfelelője. **A mapping tehát azonnal
megírható**, csak a kódokat kell slugokra cserélni.

### 8.3 Három szerkezeti felismerés, ami egyszerűsíti a fejlesztést

1. **A bónusz mini-programok a `programs` kollekcióban élnek, nem a `challenges`-ben.**
   A jelentés 2.4 pontja azt feltételezte, hogy „a spec bónusz mini-programjai ide
   [challenges] tartoznának" — **tévedés**. A `5naposlabfenekchallange`, `napindito`,
   `napzaro` mind `category: "Program"` a `programs`-ban. A `challenges` egy külön világ
   (a 16 elemű „Szavazz Magadra" archívum), amihez a kvíznek **semmi köze**.
   → **A kvíz program-ajánlójának egyetlen kollekciót kell olvasnia.**
2. **A `pitch` mező már létezik `synopsis` néven, és kész marketing-szöveg.** A D4
   döntésnél még nyitott tételként szerepelt („`pitch` mezőt fel kell venni a
   program-modellbe vagy az adminban") — **ez tárgytalan.** Minden published programnak
   van kidolgozott `synopsis`-a és `facts` tömbje (pl. `elsolepes`: *„7 nap, napi 8-10 perc,
   eszköz nélkül. Csendes, ízület-kímélő edzések… A cél nem a teljesítmény, hanem hogy
   hétből hetet teljesíts."*). A spec `pitch` szövegei helyett **a prod `synopsis`
   használandó** — így nem keletkezik két igazság.
3. **A spec „F001–F020 kész (4 hét)" állítása IGAZ.** A jelentés 6.5 nyitott kérdése
   („hol van a maradék 13?") **megválaszolva**: a `foundation` programnak **20 feltöltött
   edzése** van a prodban. A `docs/workouts/` alatti 7 fájl csak hiányos dokumentáció,
   nem a tartalom állapota. ✅ **Nyitott kérdés lezárva.**

### 8.4 Új megállapítások, amik döntést vagy javítást igényelnek

1. **⚠️ `tartasjavito` — adat-ellentmondás a prodban.** A `synopsis` azt ígéri: *„Négy hét,
   heti 3 edzés"* (= 12 edzés), a playlistben viszont **4 edzés** van (`totalSessions: 4`,
   `sessions` = 4). **A kvíz ezt a programot ajánlaná a `posture_energy` célra** — vagyis
   egy olyan programot, amelynek a saját leírása többet ígér, mint amennyi benne van. A
   spec „Valóság-szabálya" ezt tiltja. *Kérdés: hiányzik 8 edzés, vagy a synopsis pontatlan?*
2. **⚠️ `filters` és `challengeFilters` üresek a prodban.** A kvízt közvetlenül nem érinti
   (saját döntési fája lesz), de a **Videótár szűrői** ebből olvasnak — érdemes külön
   ellenőrizni, hogy ez szándékos-e.
3. **`phases: []` minden programon.** A programok fázis-csoportosítása üres. A kvíz nem
   használja, de a `next_step` reláció (spec R3) továbbra sem létezik adatmodellként —
   **ez a megállapítás érvényben marad**: a „És ha megvan? Utána rád vár: …" blokkhoz vagy
   új mező kell, vagy a kvíz konfigjában kell tárolni a lánc-relációt.
4. **Névütközés: `P_START` = „Lexfit Start" vs. a valós „Foundation".** A spec a fő
   programot „Lexfit Start"-nak hívja; a prodban a címe **„Foundation"**. *Kérdés a
   tulajdonoshoz: a kvíz a valós („Foundation") nevet használja, vagy a program átnevezése
   a terv?* **Amíg nincs döntés, a kvíznek a prod címét kell mutatnia** (Valóság-szabály).
5. **Hangnem-ütközés a `synopsis`-okkal.** A published programleírások következetesen
   **kerülik a testátalakulás-ígéretet**: *„Nem kockás hasat ígér, hanem stabil törzset"*
   (`5naposhasmelytorzschallange`), *„Nem öt napos átalakulást ígér"* (`5naposlabfenekchallange`).
   A D6=(a) döntés nyomán a kvíz eredményoldala viszont **kalóriadeficittel és heti
   fogyási ütemmel** nyit. Ez nem jogi, hanem **márka-konzisztencia** kérdés: a kvíz
   ígérete és a mögötte lévő termék hangneme eltér. *Nem döntéskérés — csak jelzem, mert
   a lead a kvíz után pontosan ezeket a leírásokat fogja olvasni.*

### 8.5 Amit ez a D4 döntésen változtat

A D4=(b) **megerősítve és egyszerűsödött**:

- a döntési fa **közvetlenül a valós slugokra** hivatkozhat (8.2 táblázat);
- **egyetlen kollekciót** kell olvasni (`programs`), nem kettőt (8.3/1);
- a marketing-copy **már megvan** (`synopsis` + `facts`), nem kell új mező (8.3/2);
- a „flag-átállítás = élesítés" elv (spec T7) a `status: draft → published` átállítással
  **már működik** — a T7 teszt tehát valós rendszerviselkedést ír le, nem kívánságot;
- **fallback:** minden ág végső fallbackje a `foundation` (20 edzés, `order: 0`, a
  `landing-catalog.server.ts:20` szerinti `ENTRY_SLUG`).

**A 6. fejezet 1. nyitott kérdése ezzel lezárva.** ✅

---

## 9. A 8. fejezet nyitott pontjainak lezárása (2026-08-21)

### 9.1 `tartasjavito` — a 8.4/1 megállapítás VISSZAVONVA

**Nincs hiányzó tartalom.** A 8.4/1 pont félreolvasta a programmodellt: azt feltételezte,
hogy 4 edzés = 4 alkalom. A tulajdonosi tisztázás szerint a valóság:

> **4 hét, hetente egy edzés, amit azon a héten ismételsz.**

Ez konzisztens a programmodell logikájával (az edzések rendezett **készletet** alkotnak,
amit a felhasználó heti üteme oszt be — nem 1:1 alkalomlista). A `tartasjavito` tehát
**teljes**, és a kvíz nyugodtan ajánlhatja a `posture_energy` célra.

**Marad viszont egy copy-pontatlanság a prod `synopsis`-ban**, amit a kvíz szó szerint
meg fog jeleníteni:

| Ma | Javasolt |
|---|---|
| „Négy hét, **heti 3 edzés**, alkalmanként 10–15 perc." | „Négy hét, hetente **egy új edzés, amit a héten háromszor ismételsz** — alkalmanként 10–15 perc." |

A mostani megfogalmazás úgy olvasható, hogy hetente három **különböző** edzés jár (= 12).
A javítás az adminban végzendő; a kvíz automatikusan az új szöveget mutatja, mert a
`synopsis` mezőt olvassa. **Tulajdonosi feladat, nem fejlesztői.**

### 9.2 `next_step` — eldőlt: a kvíz konfigjában

A lánc gyakorlatilag két bejegyzés (`elsolepes → foundation`, `tartasjavito → foundation`;
a `foundation` a végállomás). A bónusz mini-programok nem igényelnek next_step-et.

**Megvalósítás:** a döntési fa melletti konfigban, kódban. Rendereléskor a kód
**ellenőrzi, hogy a lánc célpontja `published`-e** — ha nem, az R3 folytatás-blokk
egyszerűen elmarad. Így a spec „Valóság-szabálya" nem sérülhet, és a program-modellhez
nem kell hozzányúlni.

### 9.3 A fő program átnevezése — VÉGREHAJTVA

**Döntés:** a `foundation` program megjelenített neve „Foundation" → **„Lexfit Start"**.

**Elvégezve (2026-08-21):**

1. **Production Firestore:** `programs/foundation.title` = `"Lexfit Start"`.
   A `slug` **szándékosan változatlan** (`foundation`) — a haladási adatok hivatkoznak rá
   (`src/lib/progress.ts:14`, `src/app/api/progress/sync/route.ts:273`), az átírásuk törné
   a meglévő előzményeket. A `hu`/`eyebrow` mezők és a 20 `sessions` érintetlenek.
2. **Kilenc beégetett szöveg kilenc fájlban.** A név **nem csak adat volt** — a kódban is
   szerepelt felhasználónak látható sztringként. Ha csak a Firestore-t írjuk át, a
   lejátszó és az onboarding továbbra is „Foundation"-t mondott volna a fizető
   felhasználóknak:

   | Fájl | Mi volt |
   |---|---|
   | `src/app/player/[code]/page.tsx:920` | `Foundation · {téma} · {perc}` — **minden lejátszott edzésnél** |
   | `src/lib/finish-overlays.ts:76` | `Foundation · {n}. hét` — **a közösségi médiába megosztott képen** |
   | `src/app/onboarding/OnboardingV2.tsx:754` | a reveal edzéskártyája |
   | `src/components/onboarding/paywall.tsx:24` | a paywall funkciólistája |
   | `src/components/landing/LandingPage.tsx:162, 365` | GYIK-válasz + a journey-blokk felütése |
   | `src/lib/profile-load.ts:116` | a profil program-címkéjének fallbackje |
   | `src/lib/onboarding-data.ts:102, 123` | (vélhetően holt kód, de a név így sem évül el) |
   | `src/app/onboarding/_mock.ts:208` | a reveal mock-adata |

**Ellenőrzés:** `npx tsc --noEmit` tiszta; `test:funnel` ✅, `test:onboarding-draft` ✅,
`test:pricing` ✅. Változás: 9 fájl, 11 sor.

> ⚠️ **A kódváltozás csak a következő deploy után látszik.** Addig rövid eltérés van:
> a Firestore-ból olvasó felületek (kezdőlap, programoldal, kvíz) már „Lexfit Start"-ot
> mondanak, a fenti kilenc hely még „Foundation"-t. **A deploy lezárja az eltérést.**

**Nem változtattam:** `src/components/admin/ProgramForm.tsx:125` — ott a „Foundation"
csak *placeholder* (kitöltési példa egy új program létrehozásához), nem állítás.
A `foundation.css`, `foundation-preview.ts` fájlnevek és a kódkommentek szintén maradtak
— ezek a `slug`-ra utalnak, ami nem változott.

### 9.4 KSH ELEF 2019 — forrásellenőrzés elrendelve

**Döntés:** a három konkrét szám (41% ülés / 59% nem sportol / 81,5% jó egészség)
visszakeresendő a KSH publikációjában; **csak az maradhat a copyban, ami tételesen áll.**
Ez a `docs/landing-analysis/FIX.md` precedensét követi (hat alátámasztatlan állítás
korábbi purge-e). **A UI copy megírása ELŐTT elvégzendő**, különben kétszer kell írni.

### 9.5 Frissített állapot

| Tétel | Állapot |
|---|---|
| Prod tartalom-leltár | ✅ kész (8. fejezet) |
| Jogi szövegtervezet | ✅ kész — `docs/legal/adatkezelesi-tajekoztato-kviz-modositas-TERVEZET.md`, ügyvédi jóváhagyásra vár |
| `tartasjavito` tisztázás | ✅ lezárva — csak a `synopsis` javítandó az adminban |
| Fő program átnevezése | ✅ végrehajtva — deploy szükséges |
| `next_step` helye | ✅ eldőlt — kvíz-konfig |
| KSH-számok | ⏳ ellenőrzés alatt |
| E1–E6 + W1 levélszövegek | ⏳ nincs felelős kijelölve |
| S13 betöltő hossza | ⏳ 3–5 mp javasolva, ellenvetés hiányában ez megy |
| `filters` / `challengeFilters` üresek | ⏳ tisztázandó (a kvízt nem érinti, a Videótárat igen) |

---

## 10. KSH ELEF 2019 — forrásellenőrzés eredménye (2026-08-21)

**Forrás:** KSH, „Testmozgás, 2019" (ELEF 2019) —
https://www.ksh.hu/docs/hun/xftp/idoszaki/elef/testmozgas_2019/index.html

| # | Spec-állítás | KSH-adat | Ítélet |
|---|---|---|---|
| 1 | „A magyar felnőttek **41%**-a napi 7 óránál többet ül" | „A lakosság **41%**-a napja legalább hét órát tölt **üléssel vagy fekvéssel az alvásidőn túl**" | ⚠️ **PONTOSÍTANDÓ** |
| 2 | „a felnőttek **59%**-a szabadidejében egyáltalán nem sportol" | szó szerint egyezik | ✅ **ÁLL** |
| 3 | „**81,5%**-a érzi jónak az egészségét — a teljes lakosságnál ez csak **60%**" | 81% / 81,5% a táblázatban; a teljes népességnél **60,3%** | ✅ **ÁLL** |
| 4 | „Csak **minden 6.** magyar felnőtt mozog annyit, amennyit a WHO ajánl" | az aerob + izomerősítő ajánlást együtt „minden hatodik ember teljesíti" (~17%) | ✅ **ÁLL** |

### 10.1 Az egy pontatlanság javítása (S7, A változat)

A 41% igaz, de a spec **három ponton szűkíti/torzítja** a KSH állítását: „felnőttek"
helyett *lakosság*, „7 óránál többet" helyett *legalább hét órát*, és „ül" helyett
*üléssel **vagy fekvéssel az alvásidőn túl***.

| Ma a specben | Javasolt |
|---|---|
| „A magyar felnőttek 41%-a napi 7 óránál többet ül" | „A magyar lakosság **41%-a** naponta **legalább hét órát** tölt **üléssel vagy fekvéssel** — az alvásidőn túl." |

### 10.2 ⚠️ Egy negyedik állítás, amit a spec HIBÁSAN forrásol

Az S7/A kártya második fele így folytatódik:

> „…ez önmagában egészségügyi rizikófaktor. A jó hír: már **napi 15 perc célzott mozgás
> is mérhetően ellensúlyozza**." *(Forrás: KSH ELEF 2019)*

**Ez a mondat nem a KSH-tól van.** Az ELEF 2019 leíró felmérés — nem vizsgál
ok-okozati összefüggést, és nem tartalmaz „napi 15 perc" intervenciós állítást.
A 15 perces adat a szakirodalomból ismerős (tajvani kohorszvizsgálat, Wen et al., 2011,
*The Lancet*), de **az nem ez a forrás**, és a hatás sem „az ülés ellensúlyozása".

**Ez pontosan az a hibatípus, amit a `docs/landing-analysis/FIX.md` purge-e célzott:
igaz-hangzású szám, rossz forrásmegjelöléssel.** Három lehetőség:

1. **Elhagyni** a mondatot — a 41% önmagában megáll (ajánlott, ha nincs kapacitás forrásolni).
2. **Külön forrásolni** a valós hivatkozással, és a kártya alján két forrást feltüntetni.
3. **Átfogalmazni** konkrét szám nélkül: „A jó hír: már napi néhány perc célzott mozgás is
   számít — és a terved pontosan ilyen." (nincs mérési állítás, tehát nincs mit alátámasztani)

**Ajánlásom: (3)** — megtartja a bíztató zárást, nulla forrásolási teher, és nem
mond olyat, amit alá kellene támasztani.

---

## 11. Számítási modul + átvételi tesztek — MEGÉPÜLT (2026-08-21)

A spec 5. fejezetének teljes logikája és a §14 átvételi táblázata implementálva.
**Ez a rész szándékosan a jogi jóváhagyás előtt készült el:** tiszta függvényekről van
szó, amelyek nem érintenek személyes adatot, és a T1–T11 zöldre futtatása a spec szerint
átvételi feltétel.

### 11.1 Új fájlok

| Fájl | Tartalom |
|---|---|
| `src/lib/quiz/types.ts` | válasz-alakzat, enumok, a korsáv/lépéssáv számítási értékei |
| `src/lib/quiz/calc.ts` | **O1** (BMR, additív szorzó, cél-kalória, felülírási szabály, alsó korlát két ága, fogyási ütem) + **O3** (lépéscél, 4 megjelenítési ág) |
| `src/lib/quiz/recommend.ts` | **O2** döntési fa valós slugokkal + a Valóság-szabályt kikényszerítő `resolve()` |
| `src/lib/quiz/validate.ts` | S14 mezővalidáció, kliens és szerver által közösen használva |
| `scripts/quiz-selftest.ts` | T1–T11 + kimerítő ág-sweepek · `npm run test:quiz` |

### 11.2 Az eredmény

```
✓ rounding · ✓ T1 · ✓ T2 · ✓ T3 · ✓ T4 · ✓ T5 · ✓ T6 · ✓ T7 · ✓ T8 (120 ág)
✓ T9 · ✓ T10 · ✓ T11 · ✓ lépés-ágak (20 komb.) · ✓ szélsőértékek (50 testalkat) · ✓ D5
All quiz self-tests passed (15 blocks).
```

**A spec minden száma elsőre egyezett** — BMR 1494 és 1867,5; szorzók 1,25 / 1,47 / 1,57;
1 850→1 600 kcal; 0,25 kg/hét; lépéscélok 8 000 / 8 500 / 7 000 / 11 000. Ez megerősíti,
hogy a spec 14.1 „gépi audit" melléklete valós futtatáson alapult, nem becslésen.

**A T8 túlteljesíti a specet:** nem csak azt állítja, hogy minden ág aktív programra fut,
hanem **mind a 120 kombinációra** (cél × nem × edzésszint × élethelyzet) ellenőrzi, és
külön teszteli az **üres katalógus** esetét is — ilyenkor a bónusz és a next_step blokk
egyszerűen elmarad, hibaüzenet nélkül.

### 11.3 A döntések, amik a kódba kerültek

- **D5** — a bónusz **kizárólag a célból** következik, a nem sehol nem szerepel a
  választásban; külön assertion őrzi, hogy a férfi és a női kimenet minden célra azonos.
  A spec eredeti „nő→Láb&Fenék / férfi→Has&Törzs" szabálya megszűnt.
- **D4** — a döntési fa **valós prod slugokat** nevez meg; a `resolve()` a Firestore
  published halmazához méri őket, tehát a `status` átállítása önmagában átirányít (T7).
- **§9.2** — a `next_step` lánc a kvíz konfigjában, published-ellenőrzéssel.
- **D6** — az O1 teljes egészében megépült, a spec két korlát-ágával és a
  felülírási szabállyal együtt.

### 11.4 ⚠️ Egy döntés, amit implementálás közben kellett meghozni

A D5 („a bónusz a célhoz/fókuszhoz kötve") elvette a nemet mint megkülönböztetőt, **de a
kvíznek nincs `focus` kérdése** — az az app onboardingjának a kérdése. Így a
Láb&Fenék vs. Has&Törzs választáshoz a **célt** használtam:

```
no_motivation      → napindito     (változatlan)
restart            → napzaro       (változatlan)
fat_loss | tone    → 5naposlabfenekchallange
strength           → 5naposhasmelytorzschallange
posture_energy     → napindito     (a spec szerint)
```

*Ha ehelyett külön `focus` kérdést szeretnél a kvízben, az egy plusz képernyő —
szólj, és átépítem. A mostani megoldás nem kér új kérdést.*

### 11.5 Ami még hátravan a kvízből

| Tétel | Állapot |
|---|---|
| Számítási modul + T1–T11 | ✅ kész |
| S0–S15 UI | ⏳ nincs elkezdve |
| `POST /api/quiz-lead` + `quizLeads` + lead-törlési út | ⏳ nincs elkezdve |
| E1 levél | ⏳ szöveg hiányzik |
| Uid-mentes unsub + szekvencia-motor | ⏳ nincs elkezdve |
| GTM-átcímkézés + CAPI lead-ág | ⏳ nincs elkezdve |

---

## 12. Backend — MEGÉPÜLT (2026-08-21)

A 7.5 sorrend **4. lépése**: a lead-mentő route, a `quizLeads` kollekció, és — ahogy a
7.3/4 pont előírta — **ezekkel egyszerre** az e-mail alapú jogérvényesítési út.

### 12.1 ⚠️ Alapértelmezetten KIKAPCSOLVA szállítva

A `POST /api/quiz-lead` **503-at ad**, amíg a `QUIZ_ENABLED=true` env-változó nincs
beállítva. Ez szándékos védelem: a kvíz GDPR 9. cikkes adatot gyűjt, amit a **hatályos**
adatkezelési tájékoztató nem fed le. A kapcsoló nélkül a legelső beküldés jogsértő lenne
— így az élesítés **egy tudatos, auditálható döntés**, nem egy deploy mellékhatása.

**Az élesítés sorrendje kötött:**
1. a módosított tájékoztató ügyvédi jóváhagyása és publikálása;
2. a `QUIZ_POLICY_VERSION` env beállítása a **tájékoztató új hatálybalépési dátumára**
   (különben a hozzájárulási napló rossz verziót nevez meg — értéktelen bizonyíték);
3. **csak ezután** `QUIZ_ENABLED=true`.

### 12.2 Új fájlok

| Fájl | Szerep |
|---|---|
| `src/lib/quiz/lead.ts` | dokumentum-alak, `leadId`, szerveroldali validáció + újraszámolás, retake-patch |
| `src/lib/quiz/catalog.server.ts` | a published katalógus olvasása, **fail-safe** (Firestore-kiesésnél a belépő programra degradál, nem 500-azik) |
| `src/lib/quiz/lead-token.ts` | aláírt, **lejáró** tokenek a törléshez/exporthoz |
| `src/app/api/quiz-lead/route.ts` | a beküldő route |
| `src/app/api/quiz-lead/rights/route.ts` | „töröljétek / küldjétek el az adataim" — kérés |
| `src/app/api/quiz-lead/rights/confirm/route.ts` | a linkről érkező végrehajtás |
| `emails/lead-rights-confirm.tsx` | a megerősítő levél |

### 12.3 A négy tervezési döntés, ami magyarázatot érdemel

1. **A dokumentum-azonosító `sha256(normalizált e-mail)`, nem maga a cím.** Ingyen
   upsert-kulcsot ad a retake-hez, **és** kiveszi a címet a dokumentum-útvonalból —
   ami azért számít, mert az azonosító **leiratkozó és törlő URL-ekben utazik**, ahol
   egy nyílt e-mail-cím szivárgás lenne.
2. **A megőrzés két külön óra.** A 9. cikkes testadat **12 hónap** után lejár, a lead
   maga **24** után (`healthPurgeAt` / `purgeAt`). A lead tehát jóval azután is a listán
   maradhat, hogy a testsúlyát elfelejtettük. *(A purge-cron még nincs megírva — ezek ma
   csak mezők; lásd 12.5.)*
3. **A törlés HARD DELETE, nincs 30 napos türelmi idő.** A fiókos folyamatban azért van,
   hogy egy elhamarkodott lemondást vissza lehessen vonni az előzmények megtartásával —
   a leadnek egyik sincs. Egy „soft-deleted" rekord arról, aki a felejtést kérte,
   ugyanaz az adatkezelés lenne, csak egy flaggel.
4. **A jogérvényesítés mindig postafiók-igazoláshoz kötött.** Kérés e-mailben → aláírt,
   **24 órás** linket küldünk → a link hajtja végre. Egy csupasz `?email=` paraméter
   engedélyezése azt jelentené, hogy bárki bárki adatát törölheti egy cím kitalálásával.
   A kérő végpont **mindig `{ok:true}`-t ad**, létezik-e a lead vagy sem — különben
   orákulum lenne arra, hogy „benne van-e X az adatbázisotokban".

### 12.4 Uid-mentes leiratkozás (7.3/5) — kész

Az `email-unsub.ts` `UnsubKind`-ja kiegészült a **`leadMarketing`** ággal, és a token
alanya általánosodott uid → *uid vagy lead-azonosító*. **A HMAC bemeneti formátuma
szándékosan változatlan**: a tokenek nem járnak le, tehát bármilyen formátumváltás
csendben eltörné a leiratkozó linket **minden eddig kiküldött levélben**.

A leiratkozó route lead-ágon a `nextEmailAt`-et is nullázza — a cron e szerint választ,
tehát egy puszta flag nem állítaná meg a szekvenciát. A visszaigazoló oldal lead esetén
nem az app-beállításokra mutat (oda a leadnek nincs belépése), hanem a törlési útra.

### 12.5 Ellenőrzés

`npx tsc --noEmit` tiszta · `npx next build` sikeres, mindhárom route regisztrálva
(`/api/quiz-lead`, `/api/quiz-lead/rights`, `/api/quiz-lead/rights/confirm`) ·
`test:funnel` ✅ · `test:onboarding-draft` ✅ · `test:pricing` ✅ ·
**`test:quiz` ✅ 19 blokk** (a 15 számítási + 4 új backend-blokk: szerveroldali
validáció zárt enumokkal és tartományokkal, a 9. cikkes hozzájárulás kikényszerítése,
a lead upsert-kulcs és a kettős megőrzési óra, a lejáró jogérvényesítési tokenek).

**Firestore rules: nem módosultak** — a `firestore.rules` alja default-deny, tehát a
`quizLeads` kollekció kliens felől eleve elérhetetlen, és csak az Admin SDK írja.

### 12.6 Ami a backendből még hiányzik

| Tétel | Miért nincs kész |
|---|---|
| **E1 eredmény-levél kiküldése** | a route-ban `TODO` — **a levél szövege hiányzik** (6.6 nyitott kérdés). A mentés kész, csak a küldés nincs bekötve. |
| **Szekvencia-motor** (E2–E6, W1) | a `nextEmailAt` mező már íródik, de a napi cron-szekció nincs megírva — és levélszöveg sincs hozzá |
| **Purge-cron** | a `healthPurgeAt` / `purgeAt` ma csak mezők; a lejárat érvényesítéséhez cron-szekció kell |
| **`convertedAt` jelölés** | a regisztráció utáni visszajelölés (a funnel-mérés zárása) nincs bekötve |
| **Firestore index** | a szekvencia-cron `nextEmailAt` szerinti lekérdezéséhez kell majd egy index (`firestore.indexes.json` ma egy indexet tartalmaz) |

---

## 13. Kvíz-UI (S0–S15) — MEGÉPÜLT ÉS VÉGIGJÁRVA (2026-08-21)

A 7.5 sorrend **3. lépésének** hátralévő fele. Route: **`/terv`** (a G1 döntés szerint
a meglévő appban), publikus és anonim.

### 13.1 Új fájlok

| Fájl | Szerep |
|---|---|
| `src/app/terv/page.tsx` | szerver-shell: beolvassa a katalógust, `robots: noindex` (fizetett forgalom, ne versenyezzen a landinggel) |
| `src/app/terv/QuizWizard.tsx` | a 16 képernyős wizard |
| `src/app/terv/quiz-copy.ts` | **minden felhasználónak látható szöveg egy helyen** |
| `src/app/terv/terv.css` | `.lxq` alá scope-olva, a landing `.lxl` konvenciója szerint |

### 13.2 Három elv, amit a kód kikényszerít

1. **A submit előtt semmi nem hagyja el a böngészőt.** Nincs autosave, nincs
   részleges beküldés — a félkész válaszok `sessionStorage`-ban élnek. Ez a copyban
   és a jogi tervezetben tett ígéret, nem implementációs részlet.
2. **A copy egy helyen van.** A kockázatos rész a számok: a KSH-adatok most **a forrás
   szóhasználatával** szerepelnek, a hibásan forrásolt „15 perc" mondat helyén a
   szám nélküli átfogalmazás áll, a CTA pedig a valós 490 Ft-os ajánlatot mondja.
3. **A betöltő 3,6 mp**, és `prefers-reduced-motion` mellett teljesen kimarad.

### 13.3 Végigjárva a valós production katalógussal

Lokális dev, prod Firestore-ból olvasva. A **T1 teszteset** végigvitele:

| Elvárt (spec §14) | Amit a képernyő mutatott |
|---|---|
| kb. 1 850 → kb. 1 600 kcal | ✅ „kb. 1850 → kb. 1600" |
| heti kb. 0,25 kg | ✅ |
| program: Első Lépés | ✅ „Első Lépés - 7 napos kezdő program" **a valós prod `synopsis`-ával** |
| next_step: a fő program | ✅ „Lexfit Start" — **az átnevezés végigment** |
| bónusz: Láb & Fenék | ✅ |
| lépéscél 8 000, „+1 000 az első héten" ág | ✅ 8000, jelenlegi 5500 |

**Egyéb ellenőrzött viselkedés:** a haladásjelző és a Vissza gomb; a feltételes
cél-testsúly képernyő csak `fat_loss`-nál; a **D5 élethelyzet-szűrés** (férfinál 2 opció,
nőnél 30–39-ben 3 — szülés utáni igen, változókor nem); a keresztnév normalizálása
(„anna" → „Anna"); a CTA pontosan a három feltétel együttes teljesülésekor aktiválódik,
marketing-pipa nélkül is; oldalfrissítés után a válaszok megmaradnak.

**A production érintetlen maradt:** `POST /api/quiz-lead` → `503 {"error":"not_enabled"}`,
a `quizLeads` kollekció **0 dokumentum**. A kikapcsolt állapot tehát nem elmélet — élőben
is megtagadja az írást.

### 13.4 Két apróság, amit szándékosan nem javítottam

- A `🎁` emoji utáni szóköz szűknek látszik egyes rendereléseken — betűtípus-kérdés,
  nem kód.
- A 4 hetes kontrollpont „kb. −1 kg"-ot ír „−1,0" helyett. A spec 1 tizedest kér;
  egész értéknél a magyar tipográfia szerint a „−1 kg" a helyes.

---

## 14. Levelek (E1–E6 + W1) és az admin-javítás — 2026-08-21

### 14.1 A `tartasjavito` synopsis javítva a prodban

| Előtte | Utána |
|---|---|
| „Négy hét, **heti 3 edzés**, alkalmanként 10–15 perc. …" | „Négy hét, **hetente egy új edzés, amit a héten többször ismételsz meg** — alkalmanként 10–15 perc. …" |

**Szándékosan nem írtam „háromszor".** A tulajdonosi tisztázás annyit mondott, hogy a heti
edzést ismételni kell — a *hányszor* nem hangzott el, és nem találok ki számot egy
felhasználónak látható állításba. A „többször" biztosan igaz, és ha van pontos szám,
egy szó cseréje.

`title`, `totalSessions`, `facts` és a 4 `sessions` érintetlen. **A többi 6 published
program leírása és edzésszáma egyezik** — csak ez az egy tért el.

### 14.2 Hét sablon a meglévő react-email stacken

| # | Fájl | Időzítés | Kategória |
|---|---|---|---|
| E1 | `emails/quiz-result.tsx` | azonnal, a submit route-ból | **tranzakciós** |
| E2 | `emails/quiz-obstacle.tsx` | +36 óra, **5 variáns** az akadály szerint | marketing |
| E3 | `emails/quiz-how-it-works.tsx` | +3 nap | marketing |
| E4 | `emails/quiz-offer.tsx` | +6 nap | marketing |
| E5 | `emails/quiz-objections.tsx` | +10 nap | marketing |
| E6 | `emails/quiz-last-call.tsx` | +14 nap | marketing |
| W1 | `emails/quiz-winback.tsx` | +45 nap | marketing |

Az **E1 tranzakciós**, tehát a marketing-pipától függetlenül megy — ezt kérte a lead az
e-mail-címéért cserébe. A többi hatra a pipa a feltétel, és mind visz **működő,
egykattintásos leiratkozót a lead-azonosítóra kulcsolva** (Grtv. §6).

### 14.3 ⚠️ Három pont, ahol a spec §12 vázlatát NEM lehetett szó szerint követni

Mindhárom esetben azért, mert hamis állítást tett volna a vásárló elé.

1. **E3 — „magyar sikersztori".** Nincs valós ügyfél-történetünk, és kitalálni egy
   **koholt vélemény** lenne valós emberekről. Ehelyett a levél azt mutatja be, amit a
   termék bizonyíthatóan tud. *Amikor lesznek valódi vélemények, ez a helyük.*
2. **E4 — „ingyenes próba / kedvezményes első hónap, határidővel".** Nincs ingyenes
   próba és nincs havi kedvezmény — a belépő **490 Ft/első hét** —, és **valódi határidő
   sincs**, tehát a visszaszámláló dark pattern lenne. A levél a tényleges ajánlatot
   mondja, és őszintén sürget. *Ha kell valódi, időzített ajánlat, az előbb árazási
   döntés (új Stripe price valós dátumokkal), és a copy követi.*
3. **E5 — „garancia".** A saját **ÁSZF §10.3 szó szerint kimondja**, hogy a visszatérítést
   „nem »pénzvisszafizetési garanciaként« hirdeti: ez a Fogyasztót jogszabály alapján
   megillető jog" — ráadásul **időarányos**, nem teljes összegű. A levél pontosan ezt írja.

### 14.4 Ellenőrzés

`tsc` tiszta · `next build` sikeres · `test:quiz` ✅ 19 blokk · **mind a 26 sablon
renderel** mintaadattal (`node --import tsx scripts/render-email-previews.ts`).
A kimeneten ellenőrizve: az E1-ben **nincs** leiratkozó lábléc (0 találat), mind a hat
marketing-levélben **van**, `kind=leadMarketing` kulccsal; az E4-ben a **490 Ft és
1 990 Ft a configból** jön, és nem szerepel benne az „ingyenes"/„próbaidő" szó.

Az **E1 be van kötve** a `/api/quiz-lead` route-ba (a korábbi `TODO` megszűnt).

### 14.5 Ami még hátravan

| Tétel | Állapot |
|---|---|
| Szekvencia-motor (E2–E6, W1 léptetése) | ⏳ a sablonok készen állnak, a napi cron-szekció nincs megírva |
| Firestore-index a `nextEmailAt` lekérdezéshez | ⏳ |
| Purge-cron (a két megőrzési óra érvényesítése) | ⏳ |
| `convertedAt` visszajelölés regisztrációkor | ⏳ |
| GTM-átcímkézés + CAPI lead-ág | ⏳ |
