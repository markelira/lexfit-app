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
  filter: ["M4 5 H20", "M7 12 H17", "M10 19 H14"],
};
