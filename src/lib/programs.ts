// Program identity visuals.
//
// Design rule: CATEGORY owns color + the big centered word; PROGRAM owns a
// colorless lockup (geometric icon + wordmark). Programs differ ONLY by `name`
// + `icon` — never by color — so the lockup looks identical on every program.
//
// The program LIST itself is data (programs/ in Firestore — see
// lib/program-index.ts); this module only assigns each slug its geometric mark.
// Known slugs get a hand-picked shape; unknown future slugs get a stable
// hash-picked one, so a brand-new program never renders without an icon.

export type ProgramIcon = "dot" | "square" | "bar" | "triangle" | "diamond";

export interface ProgramVisual {
  key: string;
  name: string; // wordmark, e.g. "ALAPOZÓ"
  icon: ProgramIcon;
  hue: number; // oklch hue for the program's BANNER art (cards/lockups stay colorless)
}

const ICONS: ProgramIcon[] = ["dot", "square", "bar", "triangle", "diamond"];
// Program brand hues — same lightness/chroma treatment everywhere so the family
// stays cohesive. Chosen AWAY from the category hues (168/150/72/42/225/295)
// so a program cover never masquerades as a category color, and used for both
// the /app/programs banner and program-member workout-card covers.
const HUES = [168, 255, 110, 25, 315, 200, 60, 340];

const ICON_BY_SLUG: Record<string, ProgramIcon> = {
  foundation: "dot",
  elsolepes: "square",
  napindito: "bar",
  "5naposhasmelytorzschallange": "triangle",
};

const HUE_BY_SLUG: Record<string, number> = {
  foundation: 168, // green (the app accent)
  elsolepes: 255, // blue
  napindito: 110, // olive/lime
  "5naposhasmelytorzschallange": 25, // coral
};

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

/** Visual identity for a program slug. `displayName` (the program's Hungarian
 *  title from Firestore) becomes the wordmark; without it the slug is shown. */
export function programVisual(slug: string, displayName?: string | null): ProgramVisual {
  return {
    key: slug,
    name: (displayName || slug).toUpperCase(),
    icon: ICON_BY_SLUG[slug] ?? ICONS[hash(slug) % ICONS.length],
    hue: HUE_BY_SLUG[slug] ?? HUES[hash(slug) % HUES.length],
  };
}

/** @deprecated legacy alias — prefer programVisual(slug, title). */
export const programOf = (key: string): ProgramVisual => programVisual(key || "foundation");

/**
 * Assign every live program a UNIQUE hue, deterministically. Call with the
 * published slugs in catalog order (lib/program-index does this): each program
 * takes its preferred hue (hand-picked or hash-picked), and on a collision
 * probes forward through the palette to the next free hue. Two live programs
 * can therefore never share a color (until there are more programs than
 * palette entries — 8 today).
 */
export function assignProgramHues(slugsInOrder: string[]): Record<string, number> {
  const used = new Set<number>();
  const out: Record<string, number> = {};
  for (const slug of slugsInOrder) {
    let h = HUE_BY_SLUG[slug] ?? HUES[hash(slug) % HUES.length];
    if (used.has(h)) {
      let i = HUES.indexOf(h);
      if (i === -1) i = hash(slug) % HUES.length;
      for (let step = 1; step <= HUES.length && used.has(h); step++) {
        h = HUES[(i + step) % HUES.length];
      }
    }
    used.add(h);
    out[slug] = h;
  }
  return out;
}

/**
 * Program-brand cover art for workout cards — the SAME art as the program's
 * /app/programs banner, miniaturized: the 120° dark→light band gradient
 * (identical stops to .pgs-hero) under a bottom vignette, so a card reads as
 * a cut-out of its program's banner.
 */
export function programGrad(hue: number): string {
  const band = `linear-gradient(120deg, oklch(0.28 0.05 ${hue}) 0%, oklch(0.5 0.05 ${hue}) 58%, oklch(0.66 0.05 ${hue}) 100%)`;
  const vignette = `linear-gradient(to top, oklch(0.2 0.03 ${hue} / 0.5), transparent 55%)`;
  return `${vignette}, ${band}`;
}
