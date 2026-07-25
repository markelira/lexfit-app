// LEXFIT shared bits — icons, placeholder thumb, small atoms
const LxIcon = ({ d, size = 18, sw = 1.8, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const lxPaths = {
  play: "M8 5.5 L18.5 12 L8 18.5 Z",
  check: "M5 12.5 L10 17.5 L19 7",
  flame: "M12 3 C12 8 7 9 7 14 a5 5 0 0 0 10 0 C17 10 12 8 12 3 Z",
  home: ["M4 11 L12 4 L20 11", "M6 10 V20 H18 V10"],
  grid: ["M4 4 H10 V10 H4 Z", "M14 4 H20 V10 H14 Z", "M4 14 H10 V20 H4 Z", "M14 14 H20 V20 H14 Z"],
  chart: ["M4 20 V12", "M10 20 V6", "M16 20 V10", "M22 20 H2"],
  users: ["M9 13 a4 4 0 1 0 0-8 a4 4 0 0 0 0 8 Z", "M2 21 a7 7 0 0 1 14 0", "M16 5.5 a4 4 0 0 1 0 7.5", "M17.5 14.5 a6.5 6.5 0 0 1 4.5 6.5"],
  clock: ["M12 21 a9 9 0 1 0 0-18 a9 9 0 0 0 0 18 Z", "M12 7 V12 L15.5 14"],
  arrowR: ["M5 12 H19", "M13 6 L19 12 L13 18"],
  search: ["M11 18 a7 7 0 1 0 0-14 a7 7 0 0 0 0 14 Z", "M16 16 L21 21"],
  bell: ["M6 9 a6 6 0 0 1 12 0 c0 5 2 6 2 7 H4 c0-1 2-2 2-7 Z", "M10 19.5 a2.2 2.2 0 0 0 4 0"],
  moon: "M20 13 A8 8 0 1 1 11 4 A7 7 0 0 0 20 13 Z",
  ballot: ["M5 4 H19 V20 H5 Z", "M8 9 H16", "M8 13 H16", "M8 17 H12"],
};

// striped placeholder thumbnail — label tells what real asset goes there
const LxThumb = ({ label, h = 120, dark = false, radius = 12, style }) => (
  <div className={"ph" + (dark ? " dark" : "")}
    style={{ height: h, borderRadius: radius, flexShrink: 0, ...style }}>
    <span>{label}</span>
  </div>
);

// typographic cover — Spotify-playlist style, category-colored
const LX_CAT_STYLE = {
  "Alsótest":          { c: "var(--cat-also)",    word: "ALSÓ" },
  "Felsőtest":         { c: "var(--cat-felso)",   word: "FELSŐ" },
  "Cardio + has":      { c: "var(--cat-cardio)",  word: "CARDIO" },
  "Teljes test":       { c: "var(--cat-teljes)",  word: "TELJES" },
  "Mobility / nyújtás":{ c: "var(--cat-mobility)",word: "MOBILITY" },
  "Tartás-fókusz":     { c: "var(--cat-tartas)",  word: "TARTÁS" },
};
const LxCover = ({ theme, code, meta, word, h = 120, radius = 12, fontSize, style }) => {
  const cat = LX_CAT_STYLE[theme] || LX_CAT_STYLE["Teljes test"];
  const w = word || cat.word;
  const fs = fontSize || Math.round(h * (w.length > 6 ? 0.42 : 0.55));
  return (
    <div className="cover" style={{ height: h, borderRadius: radius, flexShrink: 0,
      background: `linear-gradient(135deg, oklch(from ${cat.c} calc(l + 0.07) c h) 0%, ${cat.c} 100%)`, ...style }}>
      <span className="cv-ring"></span>
      {code && <span className="cv-code">{code}</span>}
      {meta && <span className="cv-meta">{meta}</span>}
      <span className="cv-word" style={{ fontSize: fs }}>{w}</span>
    </div>
  );
};

// difficulty flames
const LxFlames = ({ n = 1, dark = false }) => (
  <span style={{ display: "inline-flex", gap: 1, color: "var(--accent)" }}>
    {[0, 1, 2].map(i => (
      <LxIcon key={i} d={lxPaths.flame} size={13} sw={2}
        style={{ opacity: i < n ? 1 : (dark ? 0.25 : 0.22) }} />
    ))}
  </span>
);

// canonical demo data — week 4, Thursday, mid-journey user
const lxData = {
  user: "Réka",
  streak: 16,
  todayLabel: "Csütörtök · 4. hét",
  phase: { num: 2, name: "Építés", icon: "🔨", weeks: "Hét 3–4" },
  phases: [
    { icon: "🌱", name: "Alap", weeks: "Hét 1–2", state: "done" },
    { icon: "🔨", name: "Építés", weeks: "Hét 3–4", state: "now" },
    { icon: "🔥", name: "Elmélyítés", weeks: "Hét 5–6", state: "next", note: "Hét 5 = visszamérés" },
    { icon: "🏆", name: "Kifejezés", weeks: "Hét 7–8", state: "next", note: "Hét 8 = visszamérés" },
  ],
  today: {
    code: "F023", title: "Második fázis — cardio", theme: "Cardio + has",
    mins: 30, level: 2, format: "EMOM", type: "🔇 Csendes",
  },
  week: [
    { d: "H", name: "Hétfő", theme: "Alsótest", code: "F021", state: "done" },
    { d: "K", name: "Kedd", theme: "Felsőtest", code: "F022", state: "done" },
    { d: "Sze", name: "Szerda", theme: "Pihenőnap", code: null, state: "rest" },
    { d: "Cs", name: "Csütörtök", theme: "Cardio + has", code: "F023", state: "today" },
    { d: "P", name: "Péntek", theme: "Teljes test", code: "F024", state: "todo" },
    { d: "Szo", name: "Szombat", theme: "Mobility", code: "F025", state: "todo" },
    { d: "V", name: "Vasárnap", theme: "Pihenőnap", code: null, state: "rest" },
  ],
  library: [
    { code: "B001", title: "7 napos has-kihívás", meta: "7 videó · 10–15 perc", tag: "Kihívás" },
    { code: "R001", title: "Reggeli flow sorozat", meta: "14 videó · 5–12 perc", tag: "🌅 Reggeli" },
    { code: "T002", title: "Tartás-fókusz irodai napra", meta: "12 perc · 🔥", tag: "Tartás" },
    { code: "N003", title: "Esti mély nyújtás", meta: "18 perc · 🧘 Lazító", tag: "🌙 Esti" },
  ],
  doneToday: 214,
  programDone: 17, programTotal: 40,
};

Object.assign(window, { LxIcon, lxPaths, LxThumb, LxFlames, LxCover, LX_CAT_STYLE, lxData });
