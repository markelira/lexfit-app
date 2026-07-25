// Program identity registry.
//
// Design rule: CATEGORY owns color + the big centered word; PROGRAM owns a
// colorless lockup (geometric icon + wordmark). Programs differ ONLY by `name`
// + `icon` — never by color — so the lockup looks identical on every program.
//
// Adding a program later = one row here + (if new) one simple geometric icon in
// ProgramMark. Keep icons to basic geometric primitives so they read at small
// sizes and stay colorless/colourblind-safe.
//
// NOTE: names below are the working labels; only `foundation` is live today.
// Confirm the real program list + localized names with the product owner.

export type ProgramKey = "foundation" | "kickstart" | "stretch" | "gym" | "comp";

export type ProgramIcon = "dot" | "square" | "bar" | "triangle" | "diamond";

export interface Program {
  key: ProgramKey;
  name: string; // wordmark, e.g. "FOUNDATION"
  icon: ProgramIcon;
}

export const PROGRAMS: Record<ProgramKey, Program> = {
  foundation: { key: "foundation", name: "FOUNDATION", icon: "dot" },
  kickstart: { key: "kickstart", name: "KICKSTART", icon: "square" },
  stretch: { key: "stretch", name: "STRETCH", icon: "bar" },
  gym: { key: "gym", name: "GYMNASTICS", icon: "triangle" },
  comp: { key: "comp", name: "COMPETITION", icon: "diamond" },
};

/** Safe lookup with a fallback to Foundation (the only live program today). */
export const programOf = (key: string): Program =>
  PROGRAMS[key as ProgramKey] ?? PROGRAMS.foundation;
