# Meta Pixel — beállítási útmutató

**Pixel:** LEXFIT.HU · **ID:** `938411635181898` · létrehozva 2026-08-13
**Elhelyezés:** a GTM konténerben, **nem** a kódban (döntés: 2026-08-13)

---

## Miért a GTM, és miért fontos ez

A `src/components/Analytics.tsx` **hard-gateli** a mérőkódokat: hozzájárulás nélkül a
GTM konténer el sem indul. Ha a Pixel a konténerben van, **ingyen megörökli ezt a
gatinget** — nem kell külön hozzájárulás-logika hozzá. Ha a kódba tettük volna, a
gating-mechanizmust duplikálni kellett volna.

```
Böngésző
 └─ „Elfogadom"  (lx-consent = granted)
      └─ GTM konténer betölt
           ├─ GA4 tag
           └─ Meta Pixel tag        ← itt
```

Ebből következik egy szabály: **a Pixel tag triggere lehet nyugodtan „All Pages"** —
a hozzájárulást nem a triggernek kell ellenőriznie, mert a konténer maga sem fut
elutasításkor.

---

## ⚠️ Amit a Meta varázslója mond, és amit NE csinálj

A Meta „Install code manually" lépése azt írja, hogy illeszd a kódot a `<head>`-be, és
hogy „telepítsd minden oldalra". **A LEXFIT-nél ezt nem szabad megtenni**, két okból:

1. **Megkerülné a hozzájárulást.** A `<head>`-be írt Pixel minden látogatónál azonnal
   tüzelne — azoknál is, akik a süti-sávon elutasították. Ez ellentmondana az
   adatvédelmi tájékoztatónknak (7.1: *„elutasítás esetén semmilyen analitikai
   mérőkód nem töltődik be"*), és a GDPR hozzájárulási követelményének.
2. **Duplán számolna**, ha a GTM-ben is ott van.

A `<noscript>` képpontot **szintén hagyd ki**: az JavaScript nélkül is tüzel, tehát
végképp kikerülné a hozzájárulást — és a GTM Custom HTML tagben amúgy sem működik.

**Ebből következik egy fontos mellékhatás:** a Meta varázslójának „ellenőrizzük a
telepítést" lépése azt fogja mondani, hogy **nem találja a Pixelt**. Ez nem hiba —
ez a helyes működés: a Pixel csak azután indul el, hogy a látogató elfogadta a
sütiket. Az ellenőrzést a GTM Preview módban és a Test events fülön végezzük el.

## 1. lépés — a Pixel alaptag (PageView)

A GTM konténerben (`NEXT_PUBLIC_GTM_ID`, a Vercel env-ben van beállítva):

1. **Tags → New → Tag Configuration → Custom HTML**
   (A GTM-nek nincs beépített Meta-sablonja; a Community Template Gallery
   „Facebook Pixel" sablonja is használható, de a Custom HTML kevesebb meglepetés.)
2. Illeszd be a Meta által adott alap Pixel-kódot a `938411635181898` azonosítóval.
   A Meta felületén: **Events Manager → LEXFIT.HU → Add events → From a new website →
   Install code manually** — onnan másolható.
3. **Triggering → All Pages**
4. Név: `Meta Pixel — Base (PageView)`

> ⚠️ Ne tegyél a konténerbe egy második Google-taget ugyanazzal a `G-…` azonosítóval,
> ami már a kódban fut — az oldalmegtekintés duplán számolna. (Ez a `Analytics.tsx`
> kommentjében is ott van.)

## 2. lépés — a tölcsérevemények

Az app **vendor-semleges** `lx_*` eseményeket tol a `dataLayer`-be
(`src/lib/track.ts`). A GTM ezeket képezi le Meta-eseménynevekre — így új vendor vagy
átnevezés **nem igényel deployt**.

| dataLayer esemény | Mikor tüzel | Meta standard esemény |
|---|---|---|
| `lx_onboarding_start` | a látogató elhagyja a welcome képernyőt (**csak új futásnál**, resume-nál nem) | `Lead` |
| `lx_registration_complete` | új fiók jött létre (visszatérő belépés nem számít) | `CompleteRegistration` |
| `lx_checkout_start` | a paywall (`?q=pay`) lépés elérve; `plan` paraméterrel | `InitiateCheckout` |

Mindegyikhez ugyanaz a recept:

1. **Triggers → New → Custom Event** · Event name: `lx_onboarding_start`
   (pontosan így, kis-nagybetű számít)
2. **Tags → New → Custom HTML**, a tartalma a Meta `track` hívása a fenti táblázat
   szerinti standard eseménynévvel
3. **Triggering** → az imént létrehozott Custom Event trigger
4. Név: `Meta Pixel — Lead` / `— CompleteRegistration` / `— InitiateCheckout`

A `lx_checkout_start` `plan` mezője (`week_intro`, `annual_std`, …) átadható a Meta
eseménynek `content_name`-ként, ha szegmentálni akarsz csomag szerint.

### Amit a dataLayer SOHA nem tartalmaz

Se e-mail, se név, se uid, se a kérdőív válaszai. A push maga nem követés (csak egy
lapon belüli sor), de ez a szabály garantálja, hogy hozzájárulás nélkül se szivárogjon
személyes adat a queue-ba.

## 3. lépés — ellenőrzés élesítés előtt

1. GTM **Preview** mód a `www.lexfit.hu`-n
2. **Elutasítom** → a konténer el sem indul, a Pixel nem tüzel. Ezt látni kell.
3. Új session, **Elfogadom** → `PageView` megjelenik
4. Végigmenni a tölcséren: welcome → első kérdés (`Lead`) → fiók (`CompleteRegistration`)
   → paywall (`InitiateCheckout`)
5. **Meta Events Manager → Test events** — ott valós időben látszanak
6. Csak ezután **Submit** a konténerben

---

## Purchase — miért nincs a böngészőben

A vásárlás **szándékosan nem** a böngészőből megy, hanem szerveroldalról, a Stripe
webhookból, a **Conversions API**-n keresztül. Két okból:

1. **Megbízhatóság.** A beágyazott Stripe Checkout után a böngésző eseménye
   elveszhet (ad-blocker, bezárt fül, iOS in-app böngésző). A webhook nem.
2. **Nincs duplikáció.** Ha csak egy forrás küldi a `Purchase`-t, nem kell
   `event_id`-alapú deduplikációval bajlódni.

**Megépítve** (`src/lib/meta-capi.ts` + a webhook `maybeReportPurchase` függvénye).

### Hogyan oldottuk meg a hozzájárulás-kérdést

A webhook szerveroldalon fut, ahol **nem látja** sem a sütiket, sem a süti-sáv
döntését. A megoldás: a böngésző a checkout-session létrehozásakor ráírja a döntést
a Stripe **session metadatájára**, és a webhook onnan olvassa vissza.

```
Böngésző (checkout indul)
  marketingContext() → { consent, _fbp, _fbc }
        │
        ▼
POST /api/stripe/checkout → Stripe session metadata
  { adConsent: "granted" | "denied", fbp, fbc }
        │  (előfizetésnél a subscription_data.metadata is megkapja,
        │   így a megújulás invoice.paid eseménye is látja)
        ▼
Stripe webhook → maybeReportPurchase()
  adConsent !== "granted"  →  NEM jelent, soha
  adConsent === "granted"  →  Purchase a CAPI-ra
```

Mellékhaszon: az `_fbp`/`_fbc` süti a legerősebb párosítási jel, amit a Meta ismer —
és csak akkor létezik, ha a Pixel lefutott, tehát ha volt hozzájárulás. Elutasításból
nem tud átszivárogni.

Ellenőrizve: elfogadta → jelent; elutasította / nincs döntés / hamisított érték /
üres metadata → **nem jelent**. Az e-mail SHA-256 kivonatként megy (trim +
lowercase normalizálás a Meta elvárása szerint), a nyers cím soha.

### Amit még be kell állítanod

1. **Access token:** *Events Manager → Conversions API → Set up direct integration →
   Generate access token.* Titkos.
2. **Vercel env** (mindhárom környezetre):
   `META_PIXEL_ID=938411635181898` és `META_CAPI_TOKEN=<a token>`
   Amíg ez a kettő nincs beállítva, a CAPI **néma** — a fizetés és a webhook
   érintetlen marad.
3. Ellenőrzés: *Events Manager → Test events* — ott a szerveroldali események is
   megjelennek, `Server` forrásmegjelöléssel.

---

## Kapcsolódó

- Az adatvédelmi tájékoztató 2.3., 3.1 **l)**, 5. és 7.3. pontja már leírja a Pixelt —
  ez **a tag élesítése előtt** ment ki.
- A süti-sáv szövege is frissült („Google Analytics, Meta Pixel").
- Nyitott jogi pontok: `docs/legal/nyitott-jogi-kerdesek.md`
- Beállítási döntések (2026-08-13): *Automatic advanced matching* marad **KI**;
  a *„detailed page and product info"* marad **BE** (a tájékoztató 7.3. pontja
  emiatt említi a tartalmi jellemzők továbbítását).
