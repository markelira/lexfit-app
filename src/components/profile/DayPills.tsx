"use client";

// Weekday multi-select. Monday-first; weekday values are 1=Mon … 7=Sun.
// role="group" + aria-pressed pills (30 §30.9). Selected = --accent-2 fill / white
// (never white-on-light-accent — 30 §30.9 contrast trap).
const DAY_LABELS = ["H", "K", "SZE", "CS", "P", "SZO", "V"];

export function DayPills({
  value, onChange, ariaLabel = "Mely napokon", disabled,
}: {
  value: number[];
  onChange: (v: number[]) => void;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const toggle = (wd: number) => {
    const s = new Set(value);
    if (s.has(wd)) s.delete(wd); else s.add(wd);
    onChange([...s].sort((a, b) => a - b));
  };
  return (
    <div className="pf-daypills" role="group" aria-label={ariaLabel}>
      {DAY_LABELS.map((lb, i) => {
        const wd = i + 1;
        const on = value.includes(wd);
        return (
          <button
            key={wd}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            className={`pill${on ? " on" : ""}`}
            onClick={() => toggle(wd)}
          >
            {lb}
          </button>
        );
      })}
    </div>
  );
}
