import { Cover } from "./Cover";
import { ProgramLockup } from "./ProgramLockup";

export interface CourseCardData {
  code: string;
  title: string;
  theme: string; // category → color + centered word
  mins: number;
  level?: 1 | 2 | 3; // used by grid/list/shelf variants
  format?: string;
  types?: string[];
}

// TV key art — the chosen primary thumbnail. Composition (per handoff):
//   Cover (gradient + trainer blend + category word)
//   · program lockup   top-left
//   · duration chip    top-right  "<mins> PERC"
//   · title band       bottom     (workout title)
// The centered category lockup is nudged up (CSS translateY) to clear the band.
export function CourseCardTV({
  v,
  program,
  trainer,
  onClick,
}: {
  v: CourseCardData;
  program: string;
  trainer?: string | null;
  onClick?: () => void;
}) {
  return (
    <button className="pt-tv" onClick={onClick} type="button">
      <Cover className="pt-tv-art" theme={v.theme} code={v.code} trainer={trainer}>
        <ProgramLockup program={program} variant="top-left" />
        <span className="cca-chip">{v.mins} PERC</span>
        <span className="cc-play" aria-hidden="true">
          <span>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5 L18.5 12 L8 18.5 Z" />
            </svg>
          </span>
        </span>
        <div className="pt-tv-foot">
          <div className="pt-tv-name">{v.title}</div>
        </div>
      </Cover>
    </button>
  );
}
