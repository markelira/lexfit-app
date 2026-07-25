import "../course-cards.css";
import { CourseCardTV } from "@/components/CourseCardTV";
import { CourseCardShelf } from "@/components/CourseCardShelf";
import { ProgramMark } from "@/components/ProgramMark";
import { PROGRAMS } from "@/lib/programs";

// Dev preview of the course-card + program-thumbnail primitives (components-only pass).
// Not linked in the app — visit /cards-preview to review before wiring into screens.

const TRAINER = "/trainer-underlayer.jpg";

// one real Foundation cover per category — shows color=category, word=full name, program=●
const CATEGORIES = [
  { code: "F031", title: "Komplex láb-flow", theme: "Alsótest", mins: 30 },
  { code: "F027", title: "Fekvőtámasz minden szögből", theme: "Felsőtest", mins: 32 },
  { code: "F018", title: "Cardio combo + ferde has", theme: "Cardio + has", mins: 30 },
  { code: "F009", title: "Teljes test — alap kör", theme: "Teljes test", mins: 25 },
  { code: "N003", title: "Esti mély nyújtás", theme: "Mobility / nyújtás", mins: 18 },
  { code: "T002", title: "Tartás-fókusz irodai napra", theme: "Tartás-fókusz", mins: 12 },
];

// richer sample data (level/format/types) for the grid/list/shelf variants
const VARIANTS: { code: string; title: string; theme: string; mins: number; level: 1 | 2 | 3; format: string; types: string[] }[] = [
  { code: "F023", title: "Második fázis — cardio", theme: "Cardio + has", mins: 30, level: 2, format: "EMOM", types: ["🔇 Csendes"] },
  { code: "F027", title: "Fekvőtámasz minden szögből", theme: "Felsőtest", mins: 32, level: 3, format: "Pyramid", types: ["⚡ Intenzív"] },
  { code: "N003", title: "Esti mély nyújtás", theme: "Mobility / nyújtás", mins: 18, level: 1, format: "Folyamatos flow", types: ["🌙 Esti"] },
];

// the program family — same cover system, differentiated ONLY by icon + name
const FAMILY = [
  { prog: "foundation", v: { code: "F018", title: "Cardio combo + ferde has", theme: "Cardio + has", mins: 30 } },
  { prog: "kickstart", v: { code: "K007", title: "Gyors teljes test start", theme: "Teljes test", mins: 20 } },
  { prog: "stretch", v: { code: "S012", title: "Esti mély nyújtás", theme: "Mobility / nyújtás", mins: 18 } },
  { prog: "gym", v: { code: "G004", title: "Kézállás-alapok a falnál", theme: "Felsőtest", mins: 25 } },
  { prog: "comp", v: { code: "C009", title: "Verseny-tempó intervallok", theme: "Cardio + has", mins: 35 } },
];

export default function CardsPreviewPage() {
  return (
    <div className="lx" style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 32px 80px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)" }}>Course cards — előnézet</h1>
        <p style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 6, marginBottom: 8 }}>
          Szín + nagy szó = <b>kategória</b> (testrész). Ikon + név = <b>program</b>. A borító adatból generált — nincs
          feltöltött kép.
        </p>

        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "34px 0 14px" }}>
          TV key art — mind a 6 kategória (Foundation)
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {CATEGORIES.map((v) => (
            <CourseCardTV key={v.code} v={v} program="foundation" trainer={TRAINER} />
          ))}
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "40px 0 14px" }}>
          A program-család — csak név + ikon különbözik
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {FAMILY.map((f) => (
            <div key={f.prog}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 10,
                  padding: "8px 12px",
                  borderRadius: 11,
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--ink)",
                    color: "#fff",
                  }}
                >
                  <ProgramMark shape={PROGRAMS[f.prog as keyof typeof PROGRAMS].icon} size={14} />
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11.5,
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    color: "var(--ink)",
                  }}
                >
                  {PROGRAMS[f.prog as keyof typeof PROGRAMS].name}
                </span>
              </div>
              <CourseCardTV v={f.v} program={f.prog} trainer={TRAINER} />
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "40px 0 14px" }}>Sűrű polc (shelf)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          <CourseCardShelf v={VARIANTS[0]} program="foundation" trainer={TRAINER} resume={0.64} />
          <CourseCardShelf v={VARIANTS[1]} program="foundation" trainer={TRAINER} />
          <CourseCardShelf v={VARIANTS[2]} program="foundation" trainer={TRAINER} />
        </div>
      </div>
    </div>
  );
}
