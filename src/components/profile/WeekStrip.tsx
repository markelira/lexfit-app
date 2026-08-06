import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import type { WeekCellState } from "@/lib/profile";

// Seven equal cells, Monday-first. Five states incl. `missed` (planned, past, not
// done — no red, no scolding; 30 §30.3.3). Day letters mono above each cell.
const DAY_LABELS = ["H", "K", "SZE", "CS", "P", "SZO", "V"];

export function WeekStrip({ week }: { week: { weekday: number; state: WeekCellState }[] }) {
  return (
    <div className="pf-weekstrip">
      {week.map((d, i) => (
        <div className="col" key={d.weekday}>
          <span className="dl">{DAY_LABELS[i]}</span>
          <span className={`cell ${d.state}`}>
            {d.state === "done" && <LxIcon d={lxPaths.check} size={12} sw={2.8} />}
            {d.state === "rest" && <LxIcon d={lxPaths.moon} size={12} />}
            {d.state === "missed" && <LxIcon d={lxPaths.close} size={12} />}
          </span>
        </div>
      ))}
    </div>
  );
}
