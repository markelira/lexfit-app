"use client";

import { useRef } from "react";

// The 3/4/5/6 control (40 §40.4 step 3). A radiogroup rendered as a pill track;
// selected cell lifts to --surface. Numbers only - the "ajánlott · heti {n}"
// note is rendered by the step below the control. Full WAI radiogroup keyboard
// support (40 §40.12): one tab stop (roving tabindex), arrows move + select.
export function Segmented({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { v: number; label?: string }[];
  value: number | null;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Roving tabindex target: the selected cell, else the first.
  const selIdx = options.findIndex((o) => o.v === value);
  const rovingIdx = selIdx >= 0 ? selIdx : 0;

  const onKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const n = options.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(options[next].v);
    ref.current?.querySelectorAll<HTMLButtonElement>("[role=radio]")[next]?.focus();
  };

  return (
    <div className="fnl-seg" role="radiogroup" aria-label={ariaLabel} ref={ref}>
      {options.map((o, i) => {
        const on = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={i === rovingIdx ? 0 : -1}
            aria-label={o.label ? `${o.v} nap · ${o.label}` : `${o.v} nap`}
            className={`seg-cell${on ? " on" : ""}`}
            onClick={() => onChange(o.v)}
            onKeyDown={onKeyDown(i)}
          >
            <span className="v tabular">{o.v}</span>
          </button>
        );
      })}
    </div>
  );
}
