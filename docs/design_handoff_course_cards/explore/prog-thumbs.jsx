// LEXFIT — program thumbnail · TV key art (chosen execution)
// Category keeps its color + word (the cover art = body part). Program identity lives ONLY
// in the bottom lockup band: a geometric ICON + the program NAME. No per-program color —
// programs differ by name + icon alone, so the band stays consistent across every program.
// Reuses cover atoms from cards.css (cc-ring, cca-lockup, cca-chip).

const { LxIcon, lxPaths, LX_CAT_STYLE } = window;

const ptCat = (t) => LX_CAT_STYLE[t] || LX_CAT_STYLE["Teljes test"];
const ptGrad = (t) => { const c = ptCat(t).c; return `linear-gradient(135deg, oklch(from ${c} calc(l + 0.07) c h) 0%, ${c} 100%)`; };
const LEVEL = (n) => ["Kezdő", "Közepes", "Haladó"][n - 1] || "Kezdő";

// ── program registry — the ONLY things that differ per program: name + icon ──
const PROGRAMS = {
  foundation: { name: "FOUNDATION",  shape: "dot" },
  kickstart:  { name: "KICKSTART",   shape: "square" },
  stretch:    { name: "STRETCH",     shape: "bar" },
  gym:        { name: "GYMNASTICS",  shape: "triangle" },
  comp:       { name: "COMPETITION", shape: "diamond" },
};

// simple geometric marks — the non-color cue that distinguishes programs
const MSHAPE = {
  dot:      <circle cx="12" cy="12" r="6" />,
  square:   <rect x="6" y="6" width="12" height="12" rx="2.5" />,
  bar:      <rect x="3" y="10" width="18" height="4" rx="2" />,
  triangle: <path d="M12 4.5 L19.8 18 L4.2 18 Z" />,
  diamond:  <path d="M12 3.5 L20.5 12 L12 20.5 L3.5 12 Z" />,
};
const PMark = ({ shape, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">{MSHAPE[shape]}</svg>
);

// ══ TV key art — the chosen thumbnail ══
function PtTV({ v, prog }) {
  const p = PROGRAMS[prog];
  return (
    <div className="pt-tv">
      <div className="pt-tv-art" style={{ background: ptGrad(v.theme) }}>
        <div className="pt-tv-photo"></div>
        <span className="cc-ring"></span>
        <span className="pt-tv-tl">
          <span className="pt-mark"><PMark shape={p.shape} size={13} /></span>
          <span className="pt-name">{p.name}</span>
        </span>
        <span className="cca-chip">{v.mins} PERC</span>
        <div className="cca-lockup"><div className="ey">LEXFIT · {v.code}</div><div className="wd">{v.theme.toUpperCase()}</div><div className="un"></div></div>
        <div className="pt-tv-foot">
          <div className="pt-tv-name">{v.title}</div>
        </div>
      </div>
    </div>
  );
}

// ── board wrapper (reuses cc-board) ──
function Board({ tag, name, note, children }) {
  return (
    <div className="lx" style={{ height: "100%" }}>
      <div className="cc-board">
        <div className="cc-board-head">
          <span className="cc-board-tag">{tag}</span>
          <div><div className="cc-board-name">{name}</div><div className="cc-board-note">{note}</div></div>
        </div>
        <div className="cc-stack">{children}</div>
      </div>
    </div>
  );
}

// ── real Foundation workouts (from prog-data) ──
const FND = [
  { code: "F018", title: "Cardio combo + ferde has", theme: "Cardio + has", mins: 30, level: 2, format: "EMOM" },
  { code: "F027", title: "Fekvőtámasz minden szögből", theme: "Felsőtest", mins: 30, level: 3, format: "Pyramid" },
  { code: "F031", title: "Komplex láb-flow", theme: "Alsótest", mins: 30, level: 3, format: "Folyamatos flow" },
];
// one representative cover per program (synthetic for the not-yet-built programs)
const FAMILY = [
  { prog: "foundation", v: { code: "F018", title: "Cardio combo + ferde has", theme: "Cardio + has", mins: 30, level: 2, format: "EMOM" } },
  { prog: "kickstart",  v: { code: "K007", title: "Gyors teljes test start", theme: "Teljes test", mins: 20, level: 1, format: "AMRAP" } },
  { prog: "stretch",    v: { code: "S012", title: "Esti mély nyújtás", theme: "Mobility / nyújtás", mins: 18, level: 1, format: "Folyamatos flow" } },
  { prog: "gym",        v: { code: "G004", title: "Kézállás-alapok a falnál", theme: "Felsőtest", mins: 25, level: 2, format: "Időzített tartások" } },
  { prog: "comp",       v: { code: "C009", title: "Verseny-tempó intervallok", theme: "Cardio + has", mins: 35, level: 3, format: "Tabata" } },
];

function ProgThumbsCanvas() {
  return (
    <DesignCanvas>
      <DCSection id="chosen" title="TV key art — a választott borító"
        subtitle="A borító színe és nagy szava a KATEGÓRIÁT adja (testrész) — változatlan. A program kizárólag az alsó lockup-sávon él: geometriai ikon + programnév. Nincs program-szín; a programok csak névben és ikonban térnek el, így a sáv minden programon ugyanúgy néz ki. Három valódi Foundation-borító.">
        <DCArtboard id="foundation" label="Foundation — három borító" width={360} height={860} style={{ background: "var(--bg)" }}>
          <Board tag="TV" name="TV key art" note="Cinematic borító, alján a program-sáv: ● ikon + FOUNDATION. A kategória-szín (Cardio, Felső, Alsó) hozza a vizuális változatosságot; a program-sáv konzisztens.">
            {FND.map((v) => <PtTV key={v.code} v={v} prog="foundation" />)}
          </Board>
        </DCArtboard>
      </DCSection>

      <DCSection id="family" title="A program-család — csak név + ikon"
        subtitle="Ugyanaz a borító-rendszer öt programon. A programot egyedül az ikon FORMÁJA és a NÉV különbözteti meg — a sáv színe, stílusa mindenhol azonos. Az ikon formája szín nélkül is elkülöníti a programokat (akadálymentes)."
        >
        <DCArtboard id="fam" label="Öt program egymás mellett" width={760} height={720} style={{ background: "var(--bg)" }}>
          <Board tag="◆" name="Program-család" note="Egy reprezentatív borító programonként. A Foundation valódi adat; a többi (Kickstart, Stretch, Gymnastics, Competition) minta — a rendszer skálázódását mutatja. A borító színe a kategória, nem a program.">
            <div className="pt-grid2">
              {FAMILY.map((f) => (
                <div key={f.prog}>
                  <div className="pt-legend">
                    <span className="pt-legend-mark"><PMark shape={PROGRAMS[f.prog].shape} size={14} /></span>
                    <span className="pt-legend-name">{PROGRAMS[f.prog].name}</span>
                  </div>
                  <PtTV v={f.v} prog={f.prog} />
                </div>
              ))}
            </div>
          </Board>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

window.ProgThumbsCanvas = ProgThumbsCanvas;
