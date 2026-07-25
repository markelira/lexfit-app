import { Cover } from "./Cover";
import { ProgramLockup } from "./ProgramLockup";
import type { CourseCardData } from "./CourseCardTV";

// Dense shelf card — small 16:9 art, the title lives IN the art, program shows as a
// small corner-tab. Optional `resume` progress bar on the bottom edge.
export function CourseCardShelf({
  v,
  program,
  trainer,
  resume,
  onClick,
}: {
  v: CourseCardData;
  program: string;
  trainer?: string | null;
  resume?: number; // 0–1 progress
  onClick?: () => void;
}) {
  return (
    <button className="ccn" onClick={onClick} type="button">
      <Cover className="ccn-art" theme={v.theme} code={v.code} trainer={trainer}>
        <span className="ccn-vig" aria-hidden="true" />
        <ProgramLockup program={program} variant="corner-tab" />
        <span className="cca-chip">{v.mins} PERC</span>
        <div className="ccn-lockup">{v.title}</div>
        {resume != null && (
          <div className="ccn-progress" aria-hidden="true">
            <i style={{ width: `${Math.max(0, Math.min(1, resume)) * 100}%` }} />
          </div>
        )}
      </Cover>
    </button>
  );
}
