// LEXFIT icon paths — ported from the prototype's lxPaths (lexfit-shared.jsx).
// Stroke-based 24×24 paths; a value may be a single path or an array of paths.
export const lxPaths: Record<string, string | string[]> = {
  check: "M5 12.5 L10 17.5 L19 7",
  flame: "M12 3 C12 8 7 9 7 14 a5 5 0 0 0 10 0 C17 10 12 8 12 3 Z",
  grid: ["M4 4 H10 V10 H4 Z", "M14 4 H20 V10 H14 Z", "M4 14 H10 V20 H4 Z", "M14 14 H20 V20 H14 Z"],
  chart: ["M4 20 V12", "M10 20 V6", "M16 20 V10", "M22 20 H2"],
  clock: ["M12 21 a9 9 0 1 0 0-18 a9 9 0 0 0 0 18 Z", "M12 7 V12 L15.5 14"],
  arrowR: ["M5 12 H19", "M13 6 L19 12 L13 18"],
  ballot: ["M5 4 H19 V20 H5 Z", "M8 9 H16", "M8 13 H16", "M8 17 H12"],
  plus: ["M12 5 V19", "M5 12 H19"],
  play: "M7 4 L19 12 L7 20 Z",
  lock: ["M6 11 H18 V20 H6 Z", "M9 11 V8 a3 3 0 0 1 6 0 V11"],
  search: ["M11 18 a7 7 0 1 0 0-14 a7 7 0 0 0 0 14 Z", "M16 16 L21 21"],
  // Magnifier with an × in the lens — the "no results" empty state (§20.2 C4).
  searchX: ["M11 18 a7 7 0 1 0 0-14 a7 7 0 0 0 0 14 Z", "M16 16 L21 21", "M9 9 L13 13", "M13 9 L9 13"],
  filter: ["M4 5 H20", "M7 12 H17", "M10 19 H14"],
  // ── Kezdőlap redesign additions (same 24×24 stroke style) ──
  house: ["M4 11 L12 4 L20 11", "M6 10 V20 H18 V10"],
  trophy: ["M7 4 H17 V9 a5 5 0 0 1-10 0 Z", "M7 6 H4 a3 3 0 0 0 3 3", "M17 6 H20 a3 3 0 0 1-3 3", "M12 14 V18", "M8 20 H16"],
  user: ["M12 12 a4 4 0 1 0 0-8 a4 4 0 0 0 0 8 Z", "M4 20 c0-4 3.6-6 8-6 s8 2 8 6"],
  close: ["M6 6 L18 18", "M18 6 L6 18"],
  chevD: "M6 9 L12 15 L18 9",
  chevronDown: "M6 9 L12 15 L18 9", // 00 §0.11 canonical name
  moon: "M21 12.8 A9 9 0 1 1 11.2 3 A7 7 0 0 0 21 12.8 Z",
};
