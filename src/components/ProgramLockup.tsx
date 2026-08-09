import { programVisual } from "@/lib/programs";
import { ProgramMark } from "./ProgramMark";

// The consistent, COLORLESS program badge. Identical styling on every program and
// on every category color — only the icon shape + name change. Placement variants:
//   top-left    — glass pill, top-left corner (TV key art)
//   corner-tab  — smaller glass pill (dense shelf)
type Variant = "top-left" | "corner-tab";

export function ProgramLockup({
  program,
  name,
  variant = "top-left",
}: {
  program: string;
  /** Display name (the program's Hungarian title); falls back to the slug. */
  name?: string | null;
  variant?: Variant;
}) {
  const p = programVisual(program, name);

  if (variant === "corner-tab") {
    return (
      <span className="pt-tab">
        <span className="pt-tab-mark">
          <ProgramMark shape={p.icon} size={11} />
        </span>
        <span className="pt-tab-name">{p.name}</span>
      </span>
    );
  }

  return (
    <span className="pt-tv-tl">
      <span className="pt-mark">
        <ProgramMark shape={p.icon} size={13} />
      </span>
      <span className="pt-name">{p.name}</span>
    </span>
  );
}
