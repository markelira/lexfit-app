# LEXFIT — Meta static ads, programme purchase (/start)

Brief, 2026-09-20. **Optimisation event: Purchase**, not Lead — this is the whole point of
the campaign. Destination `/start`, the one-time Foundation product page.

## Why this set exists

The lead-magnet campaign works as a lead machine and fails as a business: 518 leads between
Sep 14 and 19, 0 registrations, 0 sales. Three causes, in order of size:

1. The free weekly plan is complete, so there is no reason to pay for anything after it.
2. Meta was optimising for `Lead` at 117 Ft CPL, which trains the system to find people who
   collect free things.
3. The first "yes" asked for an account, a password, a card and an auto-renewing
   subscription simultaneously.

This set attacks all three at once by selling a **finished product for one payment**: no
free thing to collect, a Purchase event to optimise on, and a checkout that asks for an
email and a card and nothing else.

## The offer on the ad

| | |
|---|---|
| Product | Lexfit Start — the 35-session programme |
| Price | 9 990 Ft, one payment (285 Ft per session) |
| Access | Forever, that one programme |
| Guarantee | 14 days, unconditional |
| Objection it answers | "nem akarok havidíjat" |

## Production rules (carried from the v1 set — all learned the hard way)

- Model **`nano_banana_pro`**. Master at 4:5 (2k), then 1:1 via `image_references`.
- **No ő/ű in any display string.** The double acute is the known garbling mode; every
  string below was chosen to avoid it (`NINCS HAVIDÍJ` deliberately replaces
  `NEM ELŐFIZETÉS`, which says the same thing and contains an ő).
- **Never put Hungarian „" quote marks around display strings in a prompt** — the model
  paints the quote marks into the art.
- OCR gate: every Hungarian string must read back exactly before a creative ships.
- No urgency, no countdown, no deadline (offer v3 §2/§10; GVH AboutYou precedent).
- No body imagery, no weight or calorie claim, no second-person attribute claims — keeping
  weight-loss vocabulary off the ad lowers the odds of a Meta Tier-2 health
  categorisation, which would cripple Purchase optimisation.

## Ad 1 · Product poster — THE LEAD CREATIVE

The structure of the reference creative the owner supplied: busy, high-information,
unmistakably a product. Adapted to brand colour, not to the reference's peach palette.

**Built as a composite, not a single generation.** The trainer is a REAL photograph
(`IMG_9032`, supplied 2026-09-20: standing, full body, holding a phone with the app on
screen), background-removed and composited onto a generated, person-free poster ground.
An AI-generated likeness was tried first and rejected — a face the audience knows must
not be synthesised. Source files kept in `assets/` so the layout can be re-cut for other
sizes without regenerating anything:

- `assets/alexa-cutout.png` — the real trainer, transparent, reusable
- `assets/poster-bg-empty-4x5.png` — the poster with an empty centre column

Composite recipe (ImageMagick): scale the cut-out to 1450px tall, add a 26px transparent
border, dilate the alpha by Disk:10 filled white for the sticker outline, drop a
`28x20+0+6` shadow in `#2a3a33`, then place `-gravity south -geometry +120+0`. The +120
offset is not cosmetic: centred, her feet cover the `Ft` in the price.

- Ground: cream `#f1f6f4`, faint diagonal tick pattern in pale sage.
- Badge `NINCS HAVIDÍJ` · Display `8 HÉT,` / `VÉGIG TERVVEL` · `35 EDZÉS` · `9 990 Ft`
- Wordmark `LEXFIT`
- Six USP bubbles — see below.

### The six bubbles come from the lead database, not from taste

Aggregated over the 456 quiz leads that answered (counts only; Q5 is health-adjacent and
never leaves the aggregate):

| what the leads said | bubble |
|---|---|
| 57% living room + 15% small space = 72% train in a room at home | `OTTHON` |
| product truth — the whole programme is bodyweight | `ESZKÖZ NÉLKÜL` |
| 31% rarely trained + 28% never = **59% are beginners** | `ALAPOKTÓL` |
| 50% chose whole-body over any single area | `TELJES TEST` |
| 40% evening + 35% varies | `ESTE IS` |
| 37% answered "újrakezdő" — what they lack is a plan, not willingness | `NEM KELL TERVEZNED` |

One finding argues with our own headline and must stay on the record: **43% want 3 days a
week and 32% want 4**. The 8-week framing assumes 4-5, so for most buyers this runs 9-12
weeks. The ad may lead with 8 weeks (it is how LEXFIT has always positioned Lexfit Start),
but `/start` states the cadence outright and says that training less often simply takes
longer. A selftest enforces both halves of that.

## Ad 2 · Price anchor (volume / iteration engine)

Mental accounting: the same money, counted per session instead of per purchase. Lowest
text risk of the three, so it is the cell to iterate angles on.

- Ground: deep green-charcoal `#18201d`. Off-white `#f1f6f4` numerals, sage `#7a9b8d` support.
- `285 Ft` (enormous) · `EGY EDZÉS ÁRA` · `35 edzés · 9 990 Ft, egyszer` · `LEXFIT`

## Ad 3 · The product in hand (native cell)

Research consensus from the v1 set: native, low-polish beats brand-poster in feed. A real
photograph with minimal type, so it reads as a post rather than an ad.

- Trainer on a mat in a bright home room, holding a phone showing the app.
- `EGYSZER FIZETSZ. ÖRÖKRE A TIÉD.` · `9 990 Ft` · `LEXFIT`

## Primary text (Meta body copy)

**P1 — objection first** (pairs with Ad 1)
> Nem előfizetés. Nem havidíj. Egy kész edzésprogram, amit egyszer kifizetsz, és örökre a tiéd marad.
> 35 videós edzés otthonra, eszköz nélkül. Megmondja, mikor mit csinálj - neked csak el kell indítanod.
> 9 990 Ft, egyszer. 14 nap pénzvisszafizetés, kérdés nélkül.

**P2 — restart angle** (pairs with Ad 3; the audience we already know converts to leads)
> Már többször elkezdted, és mindig elakadtál?
> A legtöbbször nem az akarat fogy el, hanem a terv. Ez egy kész program: 35 edzés sorrendbe rakva, otthonra, eszköz nélkül.
> Egyszer fizetsz, és örökre a tiéd. Nincs havidíj, nincs mit lemondani.

**P3 — price math** (pairs with Ad 2)
> 35 edzés. 9 990 Ft. Egyszer.
> Ez 285 Ft egy edzés - és nem havonta, hanem összesen. A program a tiéd marad akkor is, ha csak jövő hónapban veszed elő.
> Otthonra, eszköz nélkül, Alexával. 14 nap pénzvisszafizetés.

## Headline field

- H1 `35 edzés, egyszeri fizetéssel`
- H2 `Nincs havidíj. Örökre a tiéd.`
- H3 `9 990 Ft, és a program a tiéd`

CTA button: **Vásárlás**. Destination `/start`.

## Measurement

The page emits `lx_program_view` → `lx_program_checkout` → `lx_program_purchase`, all
vendor-neutral and all carrying `value` + `currency` (a value-based bid needs one). GTM maps
them to ViewContent / InitiateCheckout / **Purchase**. Map `lx_program_purchase` to Purchase
before spending anything — an ad set optimising for a conversion that never arrives spends
its whole learning budget on nothing, which is exactly what happened with Lead.

## Generated set

**The shipping set is `final-v3/` — see its README for the full spec, the build recipe and
the list of defects that were fixed.** Twelve creatives: three copy variants across 4:5,
1:1, 9:16 and 16:9, all 2160px or larger. The trainer in them is a real photograph, not a
generated likeness.

Two standalone creatives sit alongside it, from the first exploration:
- `ad2-price-4x5.png` — the price anchor (`285 Ft / EGY EDZÉS ÁRA`), typographic, no people.
  Runs as-is.
- `ad4-ferfi-4x5.png` — native cell, male subject, not a likeness of anyone real. Runs
  as-is, and it is the only cell speaking to the half of the audience the positioning has
  covered since Aug 2026.

### Earlier exploration (2026-09-20, Higgsfield MCP, nano_banana_pro)

All Hungarian display strings passed the OCR gate on eyes-on review. Every string was
chosen to avoid the double acute (ő/ű), the known garbling mode — which is why the badge
reads `NINCS HAVIDÍJ` and not `NEM ELŐFIZETÉS`, the same objection without the ő.

- `ad-poster-8het-alexa-4x5.png` — **the lead creative**. Real trainer composite, six
  data-driven bubbles, `8 HÉT, VÉGIG TERVVEL`.
- `ad1b-poster-4x5.png` — earlier poster variant, `35 EDZÉS / EGYSZER FIZETSZ`, two
  bubbles, AI figure. Kept as a layout reference only; do not run it with the AI likeness.
- `ad2-price-4x5.png` — price anchor, typographic, no people. Runs as-is.
- `ad3b-native-4x5.png` — native cell, female subject. AI likeness; replace with a real
  photo before spending.
- `ad4-ferfi-4x5.png` — native cell, male subject. Not a likeness of anyone real, so it
  runs as-is, and it is the only cell that speaks to the half of the audience the
  positioning covers since Aug 2026.

Two production notes recorded for next time:
- The first attempt at "leave the right third empty" produced a poster split into two
  panels with a hard vertical seam. Phrasing it as "one single continuous background,
  the centre column simply has nothing placed on it" fixed it.
- Cloning background over an already-generated figure is not viable — the patch clipped
  the headline. Generate the ground without the figure instead.

## Still open

- 1:1 and 9:16 recomposition (the composite recipe above re-runs against a square ground).
- Map `lx_program_purchase` to Purchase in GTM before any spend.
