/* LEXFIT icon system — Lucide (ISC licence, community fork of Feather Icons)
 * https://lucide.dev · loaded from CDN alongside the page
 *
 * WHY LUCIDE: the research requires that every glyph be the one users already
 * meet daily. Lucide is the open set closest to the outline language shared by
 * iOS/SF Symbols, YouTube, Instagram and Google Material — 24×24 grid,
 * 2px round-cap strokes. Using a named public set also means the same glyph
 * appears identically here, in Figma and in production.
 *
 * RULE: never substitute a decorative or bespoke glyph for a role below.
 * Icons carry meaning only through prior exposure (NN/g, Icon Usability) —
 * and every navigation icon keeps a permanently visible text label.
 */
window.LEXFIT_ICONS = {
  /* ── primary navigation (icon + permanent label, never icon-only) ── */
  home:        "house",              // Kezdőlap    · universal home glyph
  library:     "layout-grid",        // Videótár    · grid = a catalogue of things
  progress:    "chart-column",       // Haladásom   · bar chart = my numbers
  community:   "users",              // Közösség    · people = other humans

  /* ── global chrome ── */
  search:      "search",             // magnifier, top-right, on every screen
  profile:     "user-round",         // avatar fallback when no photo
  streak:      "flame",              // 🔥 day count in the header
  notify:      "bell",
  more:        "ellipsis",           // overflow menu
  back:        "chevron-left",
  forward:     "chevron-right",      // "Összes →" at the end of a row
  close:       "x",

  /* ── card ── */
  play:        "play",               // filled triangle in a circle — locked convention
  save:        "plus",               // + → adds to Listám
  saved:       "check",              // ✓ in place, no dialog
  done:        "circle-check",       // completed workout (never dimmed)
  duration:    "clock",
  intensity:   "flame",
  equipment:   "dumbbell",

  /* ── videótár / filters ── */
  filter:      "sliders-horizontal",
  sort:        "arrow-up-down",

  /* ── programme & habit ── */
  calendar:    "calendar-check",     // week strip / scheduled day
  rest:        "moon",               // pihenőnap — protects the streak
  trainer:     "message-circle",     // Alexa's line
};

/* Renders every <i data-lucide="…"> on the page. Call again after DOM changes. */
window.lexfitIcons = function () {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons({ attrs: { "stroke-width": 2 } });
    document.documentElement.setAttribute("data-icons", "lucide");
  } else {
    document.documentElement.setAttribute("data-icons", "missing");
  }
};
document.addEventListener("DOMContentLoaded", function () { window.lexfitIcons(); });
