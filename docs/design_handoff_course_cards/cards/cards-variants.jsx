// LEXFIT — Course card · two complementary views on a design canvas.
// V2 = grid card (album cover) · V3 = list row (same cover, horizontal data-row).
// Reuses brand atoms from lexfit-shared.jsx (LxCover, LxIcon, lxPaths, LX_CAT_STYLE).

const { LxIcon, lxPaths, LX_CAT_STYLE } = window;

// ── helpers ──
const ccCat = (theme) => LX_CAT_STYLE[theme] || LX_CAT_STYLE["Teljes test"];
const ccColor = (theme) => ccCat(theme).c;
const ccWord = (theme) => ccCat(theme).word;
const ccGrad = (theme) => {
  const c = ccColor(theme);
  return `linear-gradient(135deg, oklch(from ${c} calc(l + 0.07) c h) 0%, ${c} 100%)`;
};
const ccLevel = (n) => ["Kezdő", "Közepes", "Haladó"][n - 1] || "Kezdő";

const CCFlames = ({ n = 1, size = 13 }) => (
  <span className="cc-flames">
    {[0, 1, 2].map((i) => (
      <LxIcon key={i} d={lxPaths.flame} size={size} sw={2} style={{ opacity: i < n ? 1 : 0.22 }} />
    ))}
  </span>
);
const CCPlay = ({ size = 18 }) => (
  <span className="cc-play"><span><LxIcon d={lxPaths.play} size={size} sw={0} style={{ fill: "currentColor" }} /></span></span>
);

// ── example dataset — the same three workouts in both views ──
const CC_EX = [
  { code: "F023", title: "Második fázis — cardio", theme: "Cardio + has", mins: 30, level: 2, format: "EMOM", types: ["🔇 Csendes"] },
  { code: "F027", title: "Fekvőtámasz minden szögből", theme: "Felsőtest", mins: 32, level: 3, format: "Pyramid", types: ["⚡ Intenzív"] },
  { code: "R001", title: "Reggeli flow · 1. nap", theme: "Mobility / nyújtás", mins: 8, level: 1, format: "Folyamatos flow", types: ["🌅 Reggeli", "🧘 Lazító"] },
];

// ════════ Rács-nézet — full-bleed cover, light bottom scrim ════════
function CardV2({ v }) {
  const tag = v.types[0];
  return (
    <button className="cc cc2" style={{ background: ccGrad(v.theme) }}>
      <span className="cc-ring cc2-ring"></span>
      <span className="cc-word cc2-word">{ccWord(v.theme)}</span>
      <div className="cc2-top">
        <span className="cc-code">{v.code}</span>
        <span className="cc-durpill"><LxIcon d={lxPaths.clock} size={12} /> {v.mins}′</span>
      </div>
      <CCPlay />
      <div className="cc2-scrim">
        <div className="cc2-tags">
          <span className="cc-tag"><CCFlames n={v.level} size={11} /> {ccLevel(v.level)}</span>
          {tag && <span className="cc-tag">{tag}</span>}
        </div>
        <div className="cc2-title">{v.title}</div>
        <div className="cc2-sub">{v.theme} · {v.format}</div>
      </div>
    </button>
  );
}

// ════════ Lista-nézet — full-bleed row, light left scrim ════════
function CardV3({ v }) {
  const tag = v.types[0];
  return (
    <button className="cc cc3" style={{ background: ccGrad(v.theme) }}>
      <span className="cc-ring cc3-ring"></span>
      <span className="cc-word cc3-word">{ccWord(v.theme)}</span>
      <span className="cc3-scrim"></span>
      <CCPlay />
      <div className="cc3-inner">
        <div className="cc3-main">
          <div className="cc3-eyebrow">{v.code} · {ccWord(v.theme)}</div>
          <div className="cc3-title">{v.title}</div>
          <div className="cc3-tags">
            <span className="cc-tag"><CCFlames n={v.level} size={11} /> {ccLevel(v.level)}</span>
            {tag && <span className="cc-tag">{tag}</span>}
            <span className="cc3-fmt">{v.format}</span>
          </div>
        </div>
        <div className="cc3-right">
          <div className="cc3-bigdur">{v.mins}<small>′</small></div>
          <div className="cc3-perc">perc</div>
        </div>
      </div>
    </button>
  );
}

// ════════ N-minta — a cím a képben él · sűrű polc · expand-on-focus ════════
function CardN({ v, mode }) {
  return (
    <button className={"ccn" + (mode === "expanded" ? " is-open" : "")}>
      <div className="ccn-art" style={{ background: ccGrad(v.theme) }}>
        <span className="cc-ring"></span>
        <div className="cca-lockup">
          <div className="ey">LEXFIT · {v.code}</div>
          <div className="wd">{ccWord(v.theme)}</div>
          <div className="un"></div>
        </div>
        <span className="ccn-vig"></span>
        {mode === "new" && <span className="ccn-badge">ÚJ EDZÉS</span>}
        <span className="cca-chip">{v.mins} PERC</span>
        <div className="ccn-lockup">{v.title}</div>
        {mode === "resume" && <div className="ccn-progress"><i style={{ width: "64%" }}></i></div>}
      </div>
      {mode === "expanded" && (
        <div className="ccn-panel">
          <div className="ccn-actions">
            <span className="ccn-bplay"><LxIcon d={lxPaths.play} size={15} sw={0} style={{ fill: "currentColor" }} /></span>
            <span className="ccn-badd">+</span>
            <span className="ccn-bmore"><LxIcon d={lxPaths.arrowR} size={14} style={{ transform: "rotate(90deg)" }} /></span>
          </div>
          <div className="ccn-match">96% — neked ajánlott</div>
          <div className="ccn-meta">
            <span className="ccn-lvlbox">{ccLevel(v.level).toUpperCase()}</span>
            <span>{v.mins} perc</span>
            <span className="ccn-codebox">{v.code}</span>
          </div>
          <div className="ccn-pills">{ccTypeWords(v)}</div>
        </div>
      )}
    </button>
  );
}
const ccTypeWords = (v) => {
  const parts = [v.theme, v.format, ...v.types.map((t) => t.split(" ").slice(1).join(" "))];
  return parts.slice(0, 3).map((p, i) => (
    <React.Fragment key={p}>{i > 0 && <i>·</i>}{p}</React.Fragment>
  ));
};

// ════════ TV-minta — cinematic key art · cím a kép alatt · levegős ════════
function CardA({ v }) {
  return (
    <button className="cca">
      <div className="cca-art" style={{ background: ccGrad(v.theme) }}>
        <span className="cc-ring"></span>
        <span className="cca-chip">{v.mins} PERC</span>
        <div className="cca-lockup">
          <div className="ey">LEXFIT · {v.code}</div>
          <div className="wd">{ccWord(v.theme)}</div>
          <div className="un"></div>
        </div>
      </div>
      <div className="cca-title">{v.title}</div>
      <div className="cca-sub">{v.mins} perc · {ccLevel(v.level)} · {v.format}</div>
    </button>
  );
}

// ── board wrapper ──
function CCBoard({ tag, name, note, dark, children }) {
  return (
    <div className="lx" style={{ height: "100%" }}>
      <div className={"cc-board" + (dark ? " dark" : "")}>
        <div className="cc-board-head">
          <span className="cc-board-tag">{tag}</span>
          <div>
            <div className="cc-board-name">{name}</div>
            <div className="cc-board-note">{note}</div>
          </div>
        </div>
        <div className="cc-stack">{children}</div>
      </div>
    </div>
  );
}

const CC_AB = { background: "var(--bg)" };

function CourseCardsCanvas() {
  return (
    <DesignCanvas>
      <DCSection id="cards" title="Kurzus-kártya — rács & lista"
        subtitle="Két nézet, egy nyelv. Ugyanaz a borító-kártya: rácsban a vizuális böngészéshez, listában a sűrű, gyorsan olvasható sorhoz — a felhasználó válthat köztük.">

        <DCArtboard id="v2" label="Rács-nézet (Grid)" width={300} height={956} style={CC_AB}>
          <CCBoard tag="◳" name="Rács-nézet" note="Borító-kártya: a cím és a címkék a képen ülnek, sötét fokozaton. Hosszú listák vizuális böngészéséhez.">
            {CC_EX.map((v) => <CardV2 key={v.code} v={v} />)}
          </CCBoard>
        </DCArtboard>

        <DCArtboard id="v3" label="Lista-nézet (List)" width={544} height={516} style={CC_AB}>
          <CCBoard tag="☰" name="Lista-nézet" note="Ugyanaz a borító vízszintes sorként. Sűrű listákhoz: nagy időadat jobbra, gyors stat-olvasás.">
            {CC_EX.map((v) => <CardV3 key={v.code} v={v} />)}
          </CCBoard>
        </DCArtboard>

        <DCArtboard id="vn" label="N-minta (sűrű polc)" width={360} height={856} style={CC_AB}>
          <CCBoard dark tag="N" name="N-minta" note="A cím a képben él, a kártyán nincs külső szöveg. Fókuszra nyílik az infó-panel: gombok, ajánlás, meta, címkék. Folytatás-sáv az alsó élen.">
            <CardN v={CC_EX[1]} mode="new" />
            <CardN v={CC_EX[0]} mode="expanded" />
            <CardN v={CC_EX[2]} mode="resume" />
          </CCBoard>
        </DCArtboard>

        <DCArtboard id="va" label="TV-minta (levegős)" width={360} height={874} style={CC_AB}>
          <CCBoard dark tag="TV" name="TV-minta" note="Mozi-szerű key art középre zárt lockuppal, nagy lekerekítés, üveg-chip. A cím és a meta a kép ALATT, halk tipográfiával — levegős polc.">
            {CC_EX.map((v) => <CardA key={v.code} v={v} />)}
          </CCBoard>
        </DCArtboard>

      </DCSection>
    </DesignCanvas>
  );
}

window.CourseCardsCanvas = CourseCardsCanvas;
