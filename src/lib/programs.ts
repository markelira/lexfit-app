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
}

const ICONS: ProgramIcon[] = ["dot", "square", "bar", "triangle", "diamond"];

const ICON_BY_SLUG: Record<string, ProgramIcon> = {
  foundation: "dot",
  elsolepes: "square",
  napindito: "bar",
  "5naposhasmelytorzschallange": "triangle",
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
  };
}

/** @deprecated legacy alias — prefer programVisual(slug, title). */
export const programOf = (key: string): ProgramVisual => programVisual(key || "foundation");
