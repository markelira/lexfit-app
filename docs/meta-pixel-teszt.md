# Meta mérés — részletes teszt-útmutató

**Dataset / Pixel:** `938411635181898` (Lexfit-web-page) · hirdetési fiók: ALEXA
**Kapcsolódó:** `docs/meta-pixel-setup.md` · `src/lib/track.ts` · `src/lib/meta-capi.ts`

---

# ELŐKÉSZÜLET

## E1. Melyik böngészőben tesztelj?

**Bármelyikben** — a tulajdonos Chromeja **nem blokkolja** a Facebookot. (2026-08-13-án
felmerült, hogy egy ad-blocker az oka a nem tüzelő Pixelnek; ez **tévedés volt**, lásd
alább.)

Ha mégis gyanakszol blokkolásra, ez a gyorsteszt dönti el. Nyisd meg a böngészőben:

```
https://connect.facebook.net/en_US/fbevents.js
```

| Amit látsz | Jelentés |
|---|---|
| Hosszú JavaScript-kód | ✅ tiszta böngésző |
| Üres oldal / hibaüzenet / „blokkolva" | 🔴 blokkol — próbálj Safarit vagy új profilt |

### ⚠️ A leggyakoribb téves diagnózis: a GTM cache

A GTM konténer `cache-control: private, max-age=900` fejléccel érkezik, tehát a
böngésző **15 percig a régi verziót** használja. Publikálás után ez pontosan úgy néz
ki, mintha a Pixel nem működne — és könnyű ad-blockerre gyanakodni.

**Minden GTM-publikálás után: `Cmd + Shift + R` (hard reload), mielőtt bármit
diagnosztizálnál.**

Ez a mérés dönti el, hogy tényleg a Pixelt látod-e (konzol a `www.lexfit.hu`-n,
sütik elfogadása után):

```js
({
  scriptTag: [...document.querySelectorAll('script[src*="connect.facebook.net"]')].map(s => s.src),
  valodiPixel: typeof fbq !== 'undefined' && typeof fbq.getState === 'function',
  queue: typeof fbq !== 'undefined' ? (fbq.queue || []).length : null,
  fbp: document.cookie.split('; ').find(c => c.startsWith('_fbp=')) || null,
})
```

| Kimenet | Diagnózis |
|---|---|
| `valodiPixel: true`, `queue: 0`, van `_fbp` | ✅ a Pixel él és fut |
| `scriptTag: []` | a GTM tag nem szúrta be a scriptet — tag- vagy trigger-hiba |
| van `scriptTag`, de `valodiPixel: false` | a script nem futott le — **először hard reload**, utána Network fül |

Kulcs: `typeof fbq === "function"` **önmagában semmit nem bizonyít** — az alap-stub is
függvény. Csak az `fbq.getState` megléte igazolja, hogy a valódi könyvtár lefutott.

## E2. A Meta Test Events fül megnyitása

1. `business.facebook.com/events_manager`
2. Bal oldalsávban: **Datasets**
3. Válaszd: **Lexfit-web-page** (`938411635181898`)
4. Felül a fülek közt: **Test events**

Ezt a fület **hagyd nyitva** a tesztek alatt — valós időben frissül.

Itt látsz egy **teszt-kódot** (`TEST` + számok). Ez kell a szerveroldali teszthez;
ha még nem tetted be a Vercelbe `META_CAPI_TEST_CODE` néven, most tedd meg + Redeploy.

## E3. Friss e-mail-cím

**Kötelező**, két okból:
- A saját fiókodon a `weekIntroUsed` be van állítva → **1990 Ft**-ot fizetnél 490 helyett
- A `CompleteRegistration` esemény **csak új fióknál** tüzel (szándékosan)

Bármilyen cím jó, amihez hozzáférsz. Gmail-trükk: `sajatcimed+teszt1@gmail.com` —
ugyanoda érkezik, de a rendszer új felhasználónak látja.

---

# 1. TESZT — a hozzájárulás elutasítása

**Ez a legfontosabb teszt.** Ezt igazolja vissza a publikált adatvédelmi
tájékoztatónk 7.1 pontja: *„elutasítás esetén semmilyen analitikai mérőkód nem
töltődik be"*.

> **Állapot: 2026-08-13-án lefuttatva, ÁTMENT.** Az alábbi lépések a megismétléshez
> vannak — érdemes minden Pixel-változtatás után újra elvégezni.

### Lépések

1. Nyiss **inkognitó ablakot** (Chrome: `Cmd + Shift + N`)
2. Menj a `https://www.lexfit.hu` címre
3. A süti-sávon kattints: **„Elutasítom"**
4. Nyisd meg a konzolt: **`Cmd + Option + J`**
   *(vagy: jobb klikk bárhol → „Vizsgálat" → felül a „Console" fül)*
5. Másold be és nyomj Entert:

```js
typeof fbq
```

### Elvárt eredmény

| Kimenet | Jelentés |
|---|---|
| `"undefined"` | ✅ **helyes** — a Pixel el sem indult |
| `"function"` | 🔴 **HIBA** — kilyukadt a gating, azonnal szólj |

### Kiegészítő ellenőrzés (ugyanabban a konzolban)

```js
({
  gtm: !!window.google_tag_manager,
  fbSutik: document.cookie.split('; ').filter(c => c.startsWith('_fb')).length
})
```

Elvárt: `{ gtm: false, fbSutik: 0 }` — a konténer sem indul el, Facebook-süti nincs.

### Ismert hiányosság (2026-08-13)

Ha korábban **elfogadtad** ugyanabban a böngészőben, a régi `_ga` sütik **ott
maradnak** elutasítás után is. Új süti nem kerül elhelyezésre (a tájékoztató ezt
állítja, és ez igaz), de a meglévők törlése még nincs megoldva. → Külön javítás,
lásd a záró szakaszt.

---

# 2. TESZT — böngésző-oldali események

**Tiszta böngészőben** (lásd E1), **friss e-mail-lel** (lásd E3).
A Meta **Test events** fület tartsd nyitva egy másik ablakban.

### 2/a — PageView

1. Nyiss **inkognitó ablakot**
2. `https://www.lexfit.hu`
3. Süti-sáv: **„Elfogadom"**

**Test events fülön:** megjelenik egy **`PageView`** esemény pár másodpercen belül.

**Konzolban ellenőrizhető:**
```js
typeof fbq.getState === 'function'   // true = a valódi Pixel fut
```

> ⚠️ **Ne a `typeof fbq`-t nézd.** Az akkor is `"function"`, ha csak a GTM-be
> illesztett alap-stub futott le, a valódi `fbevents.js` viszont nem — pontosan ez
> vezetett félrediagnózishoz 2026-08-13-án. A `getState` az igazi jelző.

Ha `false`: szinte biztosan a **GTM 15 perces cache-e** → `Cmd + Shift + R`.
Ha hard reload után is `false`, menj az E1 mérésre.

### 2/b — Lead (a kérdőív indítása)

4. Menj a `/register` oldalra
5. Kattints: **„Kezdjük"**

**Test events:** **`Lead`** esemény.

**Konzolban:**
```js
window.dataLayer.map(e => e.event).filter(Boolean)
```
Elvárt: tartalmazza az `lx_onboarding_start`-ot.

> ⚠️ Ez az esemény **csak új futásnál** tüzel, resume-nál nem. Ha újratöltesz és
> folytatod, szándékosan nem jön újra. Új teszthez: friss inkognitó ablak, vagy
> a konzolban `localStorage.removeItem('lexfit_onb_v1')` és újratöltés.

### 2/c — CompleteRegistration (fiók létrehozása)

6. Válaszold végig a kérdéseket (7 kérdés + reveal + plan)
7. A **fiók lépésnél** regisztrálj a **friss e-mail-címmel**

**Test events:** **`CompleteRegistration`** esemény.

**Konzolban:** a `dataLayer`-ben megjelenik az `lx_registration_complete`.

> Ha nem tüzel: meglévő fiókkal léptél be. A kód szándékosan csak akkor számolja
> regisztrációnak, ha tényleg új felhasználói dokumentum jött létre.

### 2/d — InitiateCheckout (fizetési lépés)

8. Lépj tovább a fizetési lépésre (`?q=pay`)

**Test events:** **`InitiateCheckout`** esemény.

**Konzolban:** `lx_checkout_start` — és ha megnézed a teljes bejegyzést,
tartalmazza a választott csomagot is:
```js
window.dataLayer.find(e => e.event === 'lx_checkout_start')
// { event: 'lx_checkout_start', plan: 'week_intro' }
```

### 2. teszt összefoglaló

| Meta esemény | dataLayer esemény | Mikor |
|---|---|---|
| `PageView` | — (a Pixel maga küldi) | minden oldalbetöltés |
| `Lead` | `lx_onboarding_start` | „Kezdjük" gomb |
| `CompleteRegistration` | `lx_registration_complete` | új fiók létrejött |
| `InitiateCheckout` | `lx_checkout_start` | paywall lépés elérve |

---

# 3. TESZT — a vásárlás (szerveroldal)

**Ez a te gépeden is működik**, mert nem a böngészőből megy. Ez a Conversions API
egész lényege.

### Lépések

1. Folytasd ott, ahol a 2. teszt véget ért (fizetési lépés, friss fiók)
2. Fizess végig — **490 Ft** (intro ár, mert friss a fiók)
3. Várj **10–30 másodpercet** (Stripe → webhook → Meta)

### Hol nézd

**Test events** fül → megjelenik:

| Mező | Elvárt érték |
|---|---|
| Esemény | **`Purchase`** |
| **Forrás** | **`Server`** ← ez a bizonyíték |
| Érték | `490 HUF` |

A **`Server`** jelölés az, ami igazolja, hogy a Stripe webhookból ment, nem a
böngészőből — tehát ad-blockertől függetlenül működik.

### Amit NEM szabad látnod

**Böngésző-oldali `Purchase` eseményt.** Ilyet szándékosan nem küldünk. Ha mégis
látsz, valaki felvett egy Purchase taget a GTM-be — azt törölni kell, mert duplán
számolna, és a Meta költségadatai elcsúsznának.

### Mellékhatás, ami jó jel

*Settings → Conversions API* alatt a **„Connection pending"** státusz **aktívra vált**.
Az első szerveroldali esemény kapcsolja be.

---

# 4. TESZT (opcionális) — vásárlás elutasított sütikkel

Ez igazolja, hogy a hozzájárulás a **szerveroldalon is** érvényesül. Egy extra
fizetésbe kerül, de ez a legerősebb megfelelőségi bizonyíték.

1. Új inkognitó ablak → **„Elutasítom"**
2. Új friss e-mail-cím → végig a tölcséren → fizess (490 Ft)
3. **Test events:** **NEM szabad `Purchase`-nek megjelennie**
4. **Vercel Runtime Logs**, szűrés `[meta-capi]`: meg kell jelennie ennek a sornak:
   `skipped: not reportable {"adConsent":"denied",…}`

A 4. pont a lényeg: az esemény hiánya önmagában nem bizonyíték (hálózati hiba is
okozhatná), a log-sor viszont megmutatja, hogy a **hozzájárulási kapu** állította meg.

**Miért működik:** a böngésző a checkout-session létrehozásakor ráírja a döntést a
Stripe metadatájára (`adConsent: "denied"`), és a webhook csak explicit `"granted"`
esetén hívja a Metát. Egységtesztben öt esetre ellenőrizve (elfogadta / elutasította /
nincs döntés / hamisított érték / üres metadata) — ez az élő megerősítés.

---

# HA VALAMI NEM JÖN MEG

## `Purchase` diagnózis — a Vercel log a forrás

A `sendPurchase()` **három esetben némán kihagyja** a jelentést (nincs env, nincs
azonosító, nincs hozzájárulás). Ezért a „nincs Sentry-hiba" **nem** jelenti azt, hogy
elment. Minden döntés egy sort ír a Vercel logba.

*Vercel → Deployments → a futó deploy → Runtime Logs* → szűrés: **`[meta-capi]`**

| Log-sor | Jelentés | Teendő |
|---|---|---|
| `sent {"eventsReceived":1,…}` | ✅ a Meta befogadta | kész |
| `sent {"eventsReceived":0,…}` | elfogadta a kérést, de eldobta az eseményt | rossz Pixel ID vagy hibás mező |
| `sent {"testMode":true,…}` | ⚠️ teszt-kóddal ment → **nem számít** a hirdetés-optimalizálásba | töröld a `META_CAPI_TEST_CODE`-ot |
| `skipped: not reportable {"adConsent":"denied"}` | a vevő elutasította a sütiket — **helyes működés** | semmi |
| `skipped: not reportable {"adConsent":null}` | a böngésző nem írt metaadatot a session-re | a checkout-hívás oldalán van baj |
| `skipped: env missing` | nincs `META_PIXEL_ID` / `META_CAPI_TOKEN` a Vercelben | állítsd be + redeploy |
| `skipped: no identifiers` | se e-mail, se `_fbp`, se `_fbc` | a Meta nem tudná párosítani |
| `purchase report failed …` | a Meta elutasította | a sor tartalmazza a Meta pontos hibáját (token, jogosultság) — Sentryben is |

**Egyetlen `[meta-capi]` sor sincs?** Akkor a `maybeReportPurchase` el sem indult: vagy
nem érkezett webhook (Stripe → Webhooks → delivery log), vagy előfizetésnél a
`checkout.session.completed` helyett az `invoice.paid` a mérvadó.

---

## Minden egyéb

| Tünet | Hol keresd |
|---|---|
| `Purchase` nem érkezik | a fenti `[meta-capi]` log-tábla — az mindig megmondja, melyik ágon állt meg |
| Semmilyen böngésző-esemény elfogadás után | **először hard reload** (GTM 15 perces cache), utána az E1 mérés |
| `lx_*` esemény sincs a `dataLayer`-ben | Az app oldalán van baj — ez kódhiba, szólj |
| `lx_*` megvan, de Meta-esemény nincs | A GTM trigger neve nem betűre egyezik. Kis-nagybetű számít: `lx_onboarding_start` |
| `Purchase` jön, de rossz összeggel | A `valueHuf` a Stripe `amount_paid`-ből jön, 100-zal osztva. Ha eltér, a Stripe-oldali összeg más |

**Fontos:** a CAPI **sosem dob kivételt** — egy Meta-hiba nem bukhatja meg a Stripe
webhookot. A fizetés akkor is rendben lefut, ha a jelentés elakad. Ezért kell a
Sentryben nézni, nem a fizetési folyamatban.

---

# A TESZT UTÁN — kötelező záró lépések

### 1. Töröld a teszt-kódot ⚠️

*Vercel → Settings → Environment Variables* → **`META_CAPI_TEST_CODE`** → **törlés**
→ **Redeploy**

**Ha bennmarad, minden valódi vásárlás teszt-forgalomnak számít, és nem számít bele
a hirdetés-optimalizálásba** — a kampányod vakon futna a konverziókra.

### 2. Teszt-fizetések visszatérítése

Stripe dashboard → Payments → a teszt-tranzakciók → Refund.
(Vagy hagyd bent, ha az összeg elhanyagolható.)

### 3. Teszt-fiókok

`/admin → Tagok` alatt látod őket. Törölni nem kötelező, de a KPI-kat torzítják.

---

# NYITOTT JAVÍTÁS

**A `_ga` sütik nem törlődnek a hozzájárulás visszavonásakor** (lásd 1. teszt).
Az „Elutasítom" megállítja az új betöltést, de a korábban elhelyezett sütiket
bennhagyja. Javítás: a `decide()` függvény (`src/components/Analytics.tsx`) törölje
a `_ga*` és `_fb*` sütiket, mielőtt újratölt. Néhány sor — még nincs megcsinálva.
