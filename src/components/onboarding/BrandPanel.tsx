import Image, { type StaticImageData } from "next/image";

// The step-aware brand imagery for the /register wizard.
//
// DESKTOP (≥768px): the left column of the split-screen shell - a full-bleed
// photo per step, a dark bottom scrim, the LEXFIT wordmark top, one caption.
//
// MOBILE (<768px): the same element becomes the FULL-VIEWPORT BACKGROUND that
// the question sheet floats over (docs/register-mobile-redesign-plan.md §2.1).
// No JSX branch does this - the mobile CSS layer assigns .authx-brand and
// .fnl-col to the same grid cell and stacks them. Keep it that way: one DOM,
// two compositions.
//
// Images live in public/onboarding/{key}.jpg. They are imported STATICALLY
// (not by URL string) on purpose - a static import gives Next the intrinsic
// size at build time plus an automatic blurDataURL, so a photo that is still
// downloading shows a blurred colour field rather than an empty scrim. On
// mobile the photo IS the background, so "empty scrim" would be a hole in the
// design. (plan §6)
//
// Slogan rule: default "A változás otthon kezdődik" (welcome); "Egyedül nehéz.
// Együtt muszáj." is reserved for the community/belonging captions.

import alone from "../../../public/onboarding/alone.jpg";
// community.jpg (a laptop mockup) is intentionally not imported - see PHOTO below.
import days from "../../../public/onboarding/days.jpg";
import env from "../../../public/onboarding/env.jpg";
import focus from "../../../public/onboarding/focus.jpg";
import level from "../../../public/onboarding/level.jpg";
import player from "../../../public/onboarding/player.jpg";
import promise from "../../../public/onboarding/promise.jpg";
import reassure from "../../../public/onboarding/reassure.jpg";
import story from "../../../public/onboarding/story.jpg";
import welcome from "../../../public/onboarding/welcome.jpg";

type PanelKey =
  | "welcome" | "community" | "focus" | "level" | "days" | "player" | "env"
  | "alone" | "story" | "promise" | "reassure";

// Panel key → file. NOTE the two deliberate re-points (audit, plan §7b): at
// full-bleed it became obvious that the captions and the images disagreed.
//   community  „1 200+ csoporttag, akik már csinálják."  showed a LAPTOP mockup,
//              while story.jpg is an actual photograph of ~20 real people.
//   story      „Az alapító - Alexa"                      showed that crowd.
// So the crowd photo now carries the community line, and the founder quote sits
// over a real photograph of someone training at home instead of a device shot.
// (welcome.jpg is reused here; welcome and why sit 8 steps apart, so it reads as
// a bookend rather than a repeat.) community.jpg/promise.jpg are now unused on
// mobile-facing steps - they are product mockups, not photography.
const PHOTO: Record<PanelKey, StaticImageData> = {
  welcome,
  community: story,   // ← the crowd photograph
  story: welcome,     // ← a person, not a laptop
  focus, level, days, player, env, alone, promise, reassure,
};

// Which assets are actual PHOTOGRAPHS, and which are product mockups / designed
// key art (audit, plan §7b). Only 4 of the 11 are photographs.
//
// This matters only on mobile. In the desktop side panel a device mockup on
// white reads fine — it is a product shot in a product-shot-shaped slot. Blown
// up to a full-viewport background behind a glass sheet it does not: the top
// ~40% is blank white and the middle is a band of cropped, unreadable UI
// fragments. So on mobile the mockup panels drop the image and use a designed
// brand ground instead, which at least looks deliberate. `reassure` is grouped
// with them because its baked-in "OTTHON" typography fights our own type and
// renders as a green smear under a tall sheet.
//
// This is a stopgap, not the answer. Replace these with real photography and
// flip the keys back to "photo" — nothing else has to change.
const ART: Record<PanelKey, "photo" | "ground"> = {
  welcome: "photo",   // woman stretching, real room
  community: "photo", // ~20 real people outdoors (see PHOTO above)
  story: "photo",     // a person training at home
  player: "photo",    // real living-room interior
  focus: "ground",
  level: "ground",
  days: "ground",
  env: "ground",
  alone: "ground",
  promise: "ground",
  reassure: "ground",
};

function panelFor(step: string): PanelKey {
  switch (step) {
    case "goal": return "community";
    case "focus": return "focus";
    case "level": return "level";
    case "days": return "days";
    case "time": return "player";
    case "env": return "env";
    case "obstacle": return "alone";
    case "why": return "story";
    case "reveal": return "promise";
    case "plan": case "account": case "pay": return "reassure";
    default: return "welcome";
  }
}

// The wizard's step order, duplicated here for ONE reason: to know which photo
// to fetch next. Under "a new photo every step" (plan D4) an un-prefetched
// background means a visible blank frame on every advance, which would make the
// whole direction feel broken. Kept in sync with STEPS in OnboardingV2.
const ORDER = [
  "welcome", "goal", "focus", "level", "days", "time", "env", "obstacle", "why",
  "reveal", "plan", "account", "pay",
];
function nextPanelFor(step: string): PanelKey | null {
  const i = ORDER.indexOf(step);
  if (i < 0 || i + 1 >= ORDER.length) return null;
  const next = panelFor(ORDER[i + 1]);
  if (next === panelFor(step)) return null; // plan/account/pay share a photo
  // A ground panel shows no photo on mobile, so prefetching one would be pure
  // waste on exactly the connection this exists to protect. Desktop does still
  // display those mockups - it simply loads them when the step arrives, which is
  // what it did before any of this, and it is not the constrained case.
  return ART[next] === "photo" ? next : null;
}

const CAP: Record<PanelKey, { eyebrow?: string; line: React.ReactNode; slogan?: boolean }> = {
  welcome: { line: <>A változás<br /><b>otthon kezdődik.</b></>, slogan: true },
  community: { eyebrow: "A közösség", line: <>1 200+ csoporttag,<br />akik már csinálják.</> },
  focus: { eyebrow: "Minden területre", line: "Van edzés arra, ahol erősödni akarsz." },
  level: { eyebrow: "Minden szint", line: "A szint hozzád igazodik - kezdőtől haladóig." },
  days: { eyebrow: "A heted", line: "Annyi nap, amennyi tényleg belefér." },
  player: { eyebrow: "A lejátszó", line: "Hang nélkül is végigvezet - TV-re is." },
  env: { eyebrow: "Minden helyzetre", line: "Bármi is az - van rá változat." },
  alone: { eyebrow: "Nem vagy egyedül", line: <>Egyedül nehéz. <b>Együtt muszáj.</b></>, slogan: true },
  story: { eyebrow: "Az alapító", line: <>„Egyedül nem megy.” <span className="bp-by">- Alexa</span></>, slogan: true },
  promise: { eyebrow: "A terved kész", line: "Innentől együtt csináljuk." },
  reassure: { eyebrow: "Itt a helyed", line: <>A terved kész - <b>már csak te hiányzol.</b></>, slogan: true },
};

// Mobile serves the photo at 100vw (it is the background); desktop at 50vw (the
// left column of the split shell). Without `sizes` a `fill` image is requested
// at the largest breakpoint on every device - which is what made these cost
// 270KB-1.2MB each.
//
// Quality is left at Next's default 75: since v16 the `quality` prop must match
// an entry in next.config `images.qualities` (default [75]) or it snaps to the
// nearest allowed value, and a custom quality is not worth a config change -
// the saving here comes from serving 1290px instead of 1600px, not from the
// quality knob. Format likewise stays the default WebP (AVIF is opt-in, encodes
// ~50% slower on first request, and buys ~20% on top of an already 6-8x win).
const SIZES = "(max-width: 767px) 100vw, 50vw";


export function BrandPanel({ step, ref }: { step: string; ref?: React.Ref<HTMLElement> }) {
  const k = panelFor(step);
  const c = CAP[k];
  const ahead = nextPanelFor(step);
  return (
    // ref → <StepStage> parallaxes this layer at 30% of the sheet's travel.
    // data-art lets the mobile layer swap a mockup background for a designed
    // brand ground. Desktop ignores it entirely and keeps every image.
    <aside className="authx-brand bp-img" data-panel={k} data-art={ART[k]} ref={ref}>
      <div className="bp-stage" key={k}>
        <Image
          className="bp-photo"
          src={PHOTO[k]}
          alt=""
          fill
          sizes={SIZES}
          placeholder="blur"
          priority={k === "welcome"}
        />
        <div className="bp-scrim" aria-hidden="true" />
        <div className="bp-cap">
          {c.eyebrow && <span className="bp-eyebrow mono">{c.eyebrow}</span>}
          <span className={c.slogan ? "bp-slogan" : "bp-line"}>{c.line}</span>
        </div>
      </div>

      {/* Prefetch the next step's photo at the exact same optimized URL the next
          render will ask for. Hidden, not lazy - the point is to have it in
          cache before the advance, so the background never flashes empty. */}
      {ahead && (
        <div className="bp-prefetch" aria-hidden="true">
          {/* loading="eager" is load-bearing: next/image defaults to lazy, and
              this element sits at left:-9999px, so native lazy-loading never
              brought it into range - the prefetch silently fetched nothing and
              every advance still started the next photo from zero. */}
          <Image src={PHOTO[ahead]} alt="" fill sizes={SIZES} loading="eager" />
        </div>
      )}

      <div className="bmark bp-mark">
        <span className="bmark-ico">
          <svg viewBox="0 0 680 616" aria-hidden="true">
            <g transform="translate(-192,-152)">
              <path d="M248 712A400 400 0 0 1 648 312" fill="none" stroke="#ffffff" strokeWidth="112" strokeLinecap="round" />
              <circle cx="800" cy="224" r="72" fill="#ffffff" />
            </g>
          </svg>
        </span>
        <span className="wm">LEXFIT</span>
      </div>
    </aside>
  );
}
