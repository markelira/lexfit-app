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

## The landing: `/start`

One page, no navigation. A nav on an ad landing is a row of exits, so the only
links are the two legal ones in the footer.

### Scan architecture

Eleven bands, each with a fixed three-part rhythm so the eye learns the pattern
once and then skims it: **eyebrow → heading → body**. Every band carries an
eyebrow, including the three that originally had none, because a band without
one breaks the rhythm and the reader has to re-read the heading to place it.

| # | Band | Ground | Eyebrow | Job |
|---|---|---|---|---|
| 1 | Hero | sage | Nincs havidíj | Offer + price + CTA above the fold |
| 2 | Pay panel | white | — | Opens in place on CTA press |
| 3 | Amit megveszel | cream | Amit megveszel | Four things the price buys |
| 4 | Problem mirror | cream, tight | Miért akad el | Say what they believe first |
| 5 | Így működik | **navy** | Így működik | Three steps to being inside |
| 6 | **Mi van benne** | **tinted** | Mi van benne | Six billboards, 35 cards |
| 7 | Kinek jó | cream, tight | Őszintén | Who it is NOT for |
| 8 | Alexa | **navy** | Aki végigvisz | Her story - the page's one long read |
| 8b | Befejező kártya | cream, tight | Minden edzés után | The share card, as a feature |
| 9 | Garancia | cream, tight | Semmit nem kockáztatsz | Risk removal |
| 10 | GYIK | cream | Kérdések | Objections |
| 11 | Close | accent | Kezdjük | Final ask |

Two navy bands and one tinted band break what would otherwise be a long cream
run. The tint on band 6 matters most: it is the page's longest stretch by far -
six billboards and thirty-five cards - and without its own ground the reader
loses their place in the middle of it.

### Heading tree

One `h1` (the hero), one `h2` per band, one `h3` per category billboard. The
billboard component gained a `titleAs` prop for this: it renders `h2` where the
band IS the section (/app/programs, the homepage) and `h3` where it sits inside
a band that already owns one, so the outline stays a tree rather than a flat run.

### Column system

Two widths, both the page's own primitive (`.lp-col` / `.lp-col-wide`), never
hand-rolled gutter math - two earlier attempts at percentage arithmetic put the
billboards and their rails on different left edges. Argument bands use 640px;
band 6 uses 960px for its copy, stats, billboards AND rails, so the whole
product section scans down a single left edge.

### Alexa

Her account is the homepage's, condensed - not a fresh bio. Two versions of a
founder's story drift, and the one on the page taking money would be the one
that drifted. No incident is retold, only what it taught her, which is also what
keeps it free of identifying detail. The disclaimer ("nem vagyok orvos, nem
ígérek csodát") is kept as its own beat: inside the biography it disappears, and
it is the half that answers the hype objection.

### The finish card, and why it is framed as a feature

The `FinishExamples` belt (the same component the homepage, the lead magnet and
the reveal render) uses consented photographs with **invented sample stats** -
minutes, streak, exercise counts. The per-card "minta" label and the
section-level qualifier were both removed on owner instruction on 2026-08-11.

On a lead page that is a smaller question than it is here. This page takes
money, so the section is headed as the FEATURE - "a saját kártyád, ha akarod",
this is what you can make after a workout - rather than as results. Framed that
way the numbers are illustrative of a product capability, which is what they
are, instead of implied member outcomes, which they are not.

**Open for the owner:** if those cards should ever carry real numbers, or a
qualifier, `src/components/finish/FinishExamples.tsx` is the one file to change
and all four surfaces follow.

### The card preview, and the sixty-second video that does not exist yet

Tapping a workout card opens a preview sheet: the workout's poster, an
**eight-second moving clip** from the sixty-second mark, its category, format
and length, the full **exercise list block by block**, and a pinned CTA.

A real sixty-second preview video is **not** built, and it is not a matter of
asking for a different token. A signed Mux playback token cannot be
duration-limited: handing one to a public page would make the whole workout
available to anyone who read it out of a network tab, and across 35 cards that
is most of the library. Mux caps an animated clip at ten seconds, so that is
the ceiling on preview *footage* without clipping.

**What a true 60s preview needs:** one clipped Mux asset per workout (Mux can
create an asset from a slice of another), its playback id stored on the video
document as `previewPlaybackId`, and the modal pointing at it. Leaking that id
then leaks a minute, not the library. Roughly a one-time script plus a field -
worth doing if the preview proves it moves the purchase.

Weight matters here because this page is served to phones from an ad: ten
seconds of gif at 480px measured **9.8MB**. The same clip as webp at 420px is
**1.2MB**, and it is only fetched when a card is actually tapped.

The exercise list carries more of the preview's weight than the footage does.
It answers the question a visitor is actually asking - not "what does this look
like" but "what will I be doing for twenty-six minutes" - and it comes from the
same `blocks` the player uses, so it cannot drift from the workout.

### CTA placement

Ten CTAs: hero, after what-you-get, after the shelf, after who-it-is-for,
after Alexa, after the guarantee, the close, the mobile sticky bar, and every one of the 35
workout cards (a tap opens the checkout rather than a locked dead end). Each
carries the price on its sub-line, so no CTA requires scrolling back up to
remember what it costs.

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
