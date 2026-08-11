# Apple's weight strategy — measured across three pages

Date: 2026-08-11. Prompted by a direct challenge: *"you talked about weight based on
importance — how consistent are they actually? Because right now it looks pretty
inconsistent to me."*

Fair challenge. `12-apple-type-consistency-research.md` measured **one page** and I
flagged that as a limit. Measuring two more changed the finding.

---

## 0 · Correcting myself

I wrote: *"Two weights on the entire page. 600 for every heading at every size; 400
for body. That's the whole inventory."*

That was accurate for `/macbook-pro` and **not the general rule.** The homepage uses
three weights, and puts a 28px paragraph at weight **400** where macbook-pro puts a
40px paragraph at **600**. The invariant is real, but it isn't the one I described.

---

## 1 · The measurements

Main content only; nav, footer and localnav excluded. Format: `weight × count`.

### `/macbook-pro`
```
weights present:  400, 600
80 → 600    64 → 600    56 → 600    48 → 600    40 → 600
32 → 600    28 → 600    24 → 600    21 → 600/400
17 → 400 (body) + 600 (inline emphasis)
```

### `/iphone`
```
weights present:  400 (73×), 600 (135×)
80 → 600×1     56 → 600×21    32 → 600×3     28 → 600×77
20 → 600×5     19 → 600×13
17 → 400×71 + 600×15          14 → 400×2
```
**Every size ≥19px is weight 600. No exceptions in 135 instances.**

### `/` (homepage)
```
weights present:  400 (45×), 600 (19×), 700 (6×)
56 → 600×4     40 → 600×6
28 → 400×3     ← a display size at BODY weight
21 → 400×15 + 700×6
17 → 400×18    14 → 600×9 + 400×9
```

## 2 · What the homepage exceptions actually are

I sampled the elements rather than guessing:

| Spec | Sample content | What it is |
|---|---|---|
| `600 @ 56` | "iPhone" · "MacBook Air" · "College, sorted." | **Headline** |
| `600 @ 40` | "iPad Air" · "MacBook Pro" · "Apple Watch Series 11" | Headline, one step down |
| **`400 @ 28`** | "Meet the latest iPhone lineup." · "Now supercharged by M5." | **Subhead** |
| **`400 @ 21`** | "The ultimate way to watch your health." | **Subhead**, smaller tile |
| **`700 @ 21`** | "Comedy" · "Action" · "Sci-Fi" | Apple TV genre chips |
| `600 @ 14` | "Sabrina Carpenter: The Zane Lowe Interview" | Apple Music/TV card titles |

Two things fall out.

**The 400s at 21–28px are not body — they are subheads.** Apple is using **weight, not
size, to separate headline from subhead**. On a homepage tile: headline 56/600, subhead
28/400. Same block, same visual family, and the *only* thing distinguishing them
besides size is that one is semibold and one is regular.

**The 700s and the 14/600s are the embedded Apple TV and Music carousels** — modules
with their own design system dropped into the page. Structurally identical to LEXFIT's
`.lx-embed` app components sitting inside the landing.

## 3 · The invariant, stated properly

Not *"600 for everything"*. The rule that holds across all three pages:

> **Weight is binary within a page: one weight means "this is the statement," the
> other means "this is everything else." Which two weights, and which roles map to
> them, is set per page — but it is never more than two, and never a gradient.**

Corollaries the data supports:

1. **A given size never appears at two weights in the same role.** Where 17px shows
   both 400 and 600, the 600s are inline `<strong>` inside body copy — a different
   role, not a different importance.
2. **Weight never encodes importance *level*.** There is no 900-for-most-important,
   700-for-second, 500-for-third anywhere. Importance is carried by **size and
   position**. Weight only answers a yes/no question.
3. **Third weights are quarantined to embedded modules** with their own systems.
4. Across pages, the role→weight map can flip (macbook-pro's big subheads are 600;
   the homepage's are 400) — but *within* a page it never wavers.

So: **more consistent than my first answer suggested about the mechanism, less
consistent than it suggested about the specific value.** The discipline is in the
*count* (two) and the *binary decision*, not in a universal "600".

---

## 4 · Which brings us to why LEXFIT looks inconsistent to you right now

Here is the current state of the heading role, after phases 1–5:

| Class | Size | **Weight** |
|---|---|---|
| `.hero-copy h1` | 80 | **300** |
| `.aq-close` | 60 | **300** |
| `.starter-title` | 54 | **600** |
| `.alexa-pull-big` | 52 | **300** |
| `.h-thin` | 46 | **300** |
| `.price-card .amt` | 38 | **700** |
| `.h-bold` | 34 | **600** |
| `.j-week` | 34 | **300** |
| `.cap-title` | 23 | **500** |
| `.step-h` | 17 | **600** |
| `.hrow-head h3` | 16 | **800** |

**Five weights — 300, 500, 600, 700, 800 — inside one role.** That is precisely the
gradient Apple never uses. And two headings at the *same size* (34px: `.h-bold` 600 vs
`.j-week` 300) carry different weights for no stated reason.

**Your instinct is correct, and there's a reason it feels worse now rather than better.**
Phases 1–5 fixed leading, tracking, colour tokens and spacing — all of which are
*mechanics*. They were uniformly wrong before, and uniform wrongness reads as a
texture. Now that the mechanics are consistent, the remaining inconsistency has
nothing to hide behind. The weight spread and the size-by-layout problem are exactly
what **phase 6 exists to fix**, and phase 6 is the one I held for your decision.

So the honest status: **I shipped the half you can measure and held the half you can
see.**

## 5 · What this adds to the phase 6 spec

`13-lexfit-type-spec.md` §5 offered two voice options. This measurement says
**Option A is the one with precedent**, but tightens it:

- **Two weights for the whole heading role.** Proposal: **300** for the statement
  voice, **600** for everything else in the role. Not three, not five.
- **Weight must not vary with size.** Currently 34px appears at both 300 and 600.
  Under the rule, a heading's weight is decided by *what it is*, never by how big it is.
- **`.cap-title`'s 500 and `.hrow-head h3`'s 800 both go.** 500 is a half-step nobody
  can name; 800 is app-component weight leaking onto a landing heading.
- **`.amt` 700 and the display numerals stay** — they are the LEXFIT equivalent of
  Apple's quarantined carousel modules, and `13` §8 already scopes them out.

That reduces the landing's heading weights from **five to two**, which is the actual
Apple discipline — and it is a *smaller* change than the size re-tiering in §5, because
weight can be normalised without moving a single size.

## 6 · A cheaper option worth considering

If the §5 tier map is the blocker, **weight normalisation can ship on its own.** It
needs no positioning decision: mapping five weights onto two is a typographic call,
not a judgement about whether Programok matters more than GYIK.

That would land most of the visible consistency win now, and leave the size question
open. Whether it's actually preferable depends on whether the lowercase-300 voice
should belong to a tier or be retired — which is still §5 Option A vs B.

## 6b · SHIPPED — 2026-08-11

Weight normalisation is done, and it surfaced a second defect.

**Heading role: five weights → two.**
`.cap-title` 500 → 600 · `.hero-copy h1 b` 700 → 600 · `.hrow-head h3` 800 → 600
(app weight leaking onto a landing heading) · `.j-t` 500/700 → 400/600.
No size moved, so this needed no positioning decision.

**Faux bold — found while inventorying weights.** `layout.tsx` loads IBM Plex Mono at
**400 and 500 only**, but eight mono elements asked for 600 or 700:
`.hero-price b`, `.pa-row b`, `.wkp-count b`, `.price-badge`, `.price-pick`,
`.step-n`, `.wkp-day`, `.stickynav .links a.active`. With no drawn face at those
weights the browser **synthesises** bold — an algorithmic smear of the 500 face, not
a real cut. That reads as a different typeface, which is very likely part of the
original "sometimes the font feels different" report. All eight clamped to 500.

Verified against `document.fonts`: Poppins has all seven faces; IBM Plex Mono has
exactly two. (`document.fonts.check()` is *not* a reliable test here — it returns
`true` for mono at 600/700 because it reports whether the family can render the text
at all, not whether an exact-weight face exists. The face list is authoritative.)

**Final state**, non-quarantined:

| | Weights |
|---|---|
| Poppins | **300** (statement) · **400** (body) · **600** (heading + emphasis) |
| IBM Plex Mono | **400** · **500** |

Quarantined by design, per `13` §8: `.wordmark` 800 (logotype), `.j-weeknum` 800 and
`.pa-num b` 800 and `.amt` 700 (display numerals), and the `.lx-embed` app components.

**Process note:** I first measured `j-t` as still 700 after the fix and nearly logged
it as a straggler. It was stale — navigating `/` → `/#programok` is a same-document
fragment change and never reloads the page. The served CSS chunk had the correct
value all along. Same class of error as the stale-server incident in
`08-section-by-section-audit.md` §0.

## 7 · Limits

Three pages, one day, desktop only (1710px / default window). All three are marketing
pages; I did not measure Newsroom, Support, or the Store, which may use different
systems. Weight counts are of *rendered instances*, so a repeated component inflates
its weight's count — that's why §1 reports the per-size breakdown rather than
leaning on totals.
