# Meta mérés — teszt-útmutató

**Pixel / Dataset:** `938411635181898` (Lexfit-web-page) · hirdetési fiók: ALEXA
Kapcsolódó: `docs/meta-pixel-setup.md` (a beállítás), `src/lib/track.ts`,
`src/lib/meta-capi.ts`

---

## Mielőtt belekezdesz — két dolog, amitől a teszt félrevezető lesz

**1. A saját Chromeod blokkolja a Facebookot.** Kimértük: az `fbevents.js` „betölt",
de üresen; a `facebook.com/tr` kérés el sem hagyja a böngészőt (`Failed to fetch`),
és a `_fbp` süti sem jön létre. Ad-blocker bővítmény, Chrome tracking protection vagy
DNS-szűrés okozza.

→ **A böngésző-oldali teszteket másik eszközön csináld** (telefon, mobilneten, ne
otthoni wifin), vagy egy bővítmény nélküli böngészőben.
→ A **szerveroldali** teszt (Purchase) a te gépeden is működik — épp ez a lényege.

**2. Az árat a fiókod előzményei döntik el.** A saját fiókodon a `weekIntroUsed` már
be van állítva, ezért **1990 Ft**-ot fizetnél, nem 490-et. Friss e-mail-címmel
490 Ft az intro ár — és ez egyben a `CompleteRegistration` eseményt is kipróbálja,
ami meglévő fiókkal (helyesen) soha nem tüzel.

→ **Használj friss e-mail-címet.** Egy futással négy eseményt igazolsz.

---

## 0. lépés — a teszt-kód bekapcsolása (a Purchase-hoz kötelező)

A Meta **Test events** füle a **szerveroldali** eseményt csak akkor mutatja, ha a
küldemény tartalmaz `test_event_code`-ot. Enélkül a `Purchase` valós esemény lesz, de
csak az Overview-ban jelenik meg, ~20 perc késéssel.

1. *Events Manager → Lexfit-web-page → **Test events*** → másold ki a képernyőn látható
   teszt-kódot (`TEST` kezdetű)
2. *Vercel → Settings → Environment Variables* → új változó:
   `META_CAPI_TEST_CODE` = a kód
3. **Redeploy**

> ⚠️ **A teszt után töröld a változót és deployolj újra.** A teszt-kóddal küldött
> események teszt-forgalomnak számítanak, és **nem számítanak bele a hirdetés-
> optimalizálásba**. Ha bennmarad, a kampányod vak marad a valódi vásárlásokra.

---

## 1. teszt — a hozzájárulás elutasítása (ezzel kezdd)

**Ez a legfontosabb teszt.** Ez igazolja vissza a publikált adatvédelmi
tájékoztatónkat (7.1: *„elutasítás esetén semmilyen analitikai mérőkód nem töltődik be"*).

1. Új **inkognitó** ablak → `https://www.lexfit.hu`
2. A süti-sávon: **„Elutasítom"**
3. Nyisd meg a fejlesztői konzolt és írd be:

```js
typeof fbq
```

| Elvárt | Ha ezt látod |
|---|---|
| `"undefined"` | ✅ helyes — a Pixel el sem indult |
| `"function"` | 🔴 **azonnal szólj** — kilyukadt a gating |

4. Ugyanitt: `document.cookie.split('; ').filter(c => c.startsWith('_fb'))`
   → **üres tömb** a helyes.

---

## 2. teszt — böngésző-oldali események (másik eszközön!)

Új inkognitó ablak, **„Elfogadom"**.

| # | Amit csinálsz | Meta esemény | Hol nézd |
|---|---|---|---|
| 1 | `www.lexfit.hu` betölt | `PageView` | Test events |
| 2 | `/register` → **„Kezdjük"** | `Lead` | Test events |
| 3 | Végigmész a kérdéseken → fiók létrehozása **friss e-mail-lel** | `CompleteRegistration` | Test events |
| 4 | Eljutsz a fizetési lépésig | `InitiateCheckout` | Test events |

**Ellenőrzés a konzolban is** (ugyanabban az ablakban):

```js
window.dataLayer.map(e => e.event).filter(Boolean)
```

Elvárt sorrend: `lx_onboarding_start` → `lx_registration_complete` → `lx_checkout_start`

> A `lx_onboarding_start` **csak új futásnál** tüzel. Ha újratöltesz és folytatod,
> szándékosan nem tüzel újra — ez nem hiba. Új teszthez töröld a `lexfit_onb_v1`
> kulcsot a localStorage-ból, vagy használj friss inkognitó ablakot.

---

## 3. teszt — a vásárlás (szerveroldal)

Fejezd be a fizetést (490 Ft friss fiókkal).

**Hol nézd:** *Events Manager → Test events*

| Amit keresel | Érték |
|---|---|
| Esemény | `Purchase` |
| **Forrás** | **`Server`** ← ez a lényeg |
| Érték | `490 HUF` |

A `Server` jelölés bizonyítja, hogy a Stripe webhookból ment, nem a böngészőből.

**Böngésző-oldali `Purchase` NEM lesz** — ilyet szándékosan nem küldünk. Ha mégis
látsz ilyet, valaki felvett egy Purchase taget a GTM-be; azt törölni kell, mert
duplán számolna.

**Mellékhatás, ami jó jel:** a *Settings → Conversions API* alatt a „Connection
pending" státusz aktívra vált. Az első szerveroldali esemény kapcsolja be.

---

## 4. teszt (opcionális, de érdemes) — vásárlás elutasított sütikkel

Ez igazolja, hogy a hozzájárulás a **szerveroldalon is** érvényesül.

1. Új inkognitó ablak → **„Elutasítom"**
2. Fizess végig (friss e-mail, 490 Ft)
3. *Test events* → **NEM szabad `Purchase`-nek megjelennie**

A kapu a Stripe session metadatájában van (`adConsent`): ha nem `granted`, a webhook
meg sem hívja a Metát. Öt esetre teszteltük egységtesztben (elfogadta / elutasította /
nincs döntés / hamisított érték / üres metadata) — ez az élő megerősítés.

---

## Ha valami nem jön meg

| Tünet | Hol nézd |
|---|---|
| `Purchase` nem érkezik | **Sentry**, `integration: meta-capi` címke — ott a Meta pontos hibaüzenete (rossz token, hiányzó azonosító, lejárt token) |
| Semmilyen böngésző-esemény | Ad-blocker / DNS-szűrés az eszközön (lásd a bevezetőt) |
| `lx_*` esemény sincs a dataLayerben | Az app oldalán van baj — ez már kódhiba, szólj |
| `lx_*` van, de Meta-esemény nincs | A GTM trigger neve nem egyezik pontosan (kis-nagybetű számít) |

A CAPI **sosem dob kivételt**: egy Meta-hiba nem bukhatja meg a Stripe webhookot, tehát
a fizetés akkor is rendben lefut, ha a jelentés elakad.

---

## A teszt után — kötelező záró lépések

1. **Töröld a `META_CAPI_TEST_CODE` változót** a Vercelből → **Redeploy**
   *(Enélkül minden valódi vásárlás teszt-forgalomnak számít.)*
2. **Térítsd vissza a teszt-fizetéseket** a Stripe felületén, ha nem akarod bennhagyni
3. A teszt-fiókokat a `/admin → Tagok` alatt látod
