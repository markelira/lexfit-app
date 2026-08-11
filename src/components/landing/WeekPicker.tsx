"use client";

import { useMemo, useState } from "react";

// §7 "A heted" - the page's one genuinely interactive moment. Tapping a day
// re-flows the week, so the flexibility claim is demonstrated instead of asserted.
//
// Motion follows the house rules (apple-design): feedback lands on pointer-DOWN
// via :active, and the strip settles on a critically damped transition - nothing
// was flicked here, so overshoot would feel wrong. Under prefers-reduced-motion
// the transform is dropped and only opacity carries the change.

const DAYS: [string, string][] = [
  ["H", "Hétfő"], ["K", "Kedd"], ["SZE", "Szerda"], ["CS", "Csütörtök"],
  ["P", "Péntek"], ["SZO", "Szombat"], ["V", "Vasárnap"],
];

// The app's own default split (prefs.ts DEFAULT_PREFS.plan.weekdays = [1,2,4,5,6]),
// so the demo opens on exactly what a new member actually gets.
const DEFAULT: number[] = [1, 2, 4, 5, 6];
const MIN = 3;
const MAX = 6;

export function WeekPicker() {
  const [picked, setPicked] = useState<number[]>(DEFAULT);

  const toggle = (n: number) => {
    setPicked((cur) => {
      const has = cur.includes(n);
      if (has && cur.length <= MIN) return cur; // floor: the app clamps to 3–6
      if (!has && cur.length >= MAX) return cur;
      return has ? cur.filter((x) => x !== n) : [...cur, n].sort((a, b) => a - b);
    });
  };

  const rest = useMemo(() => DAYS.length - picked.length, [picked]);

  return (
    <div className="wkp">
      <div className="wkp-row" role="group" aria-label="Válaszd ki az edzésnapjaid">
        {DAYS.map(([short, full], i) => {
          const n = i + 1;
          const on = picked.includes(n);
          const locked = on ? picked.length <= MIN : picked.length >= MAX;
          return (
            <button
              key={n}
              type="button"
              className={`wkp-day${on ? " on" : ""}`}
              aria-pressed={on}
              aria-label={full}
              disabled={locked}
              onClick={() => toggle(n)}
            >
              <span className="wkp-d">{short}</span>
              <span className="wkp-mark" aria-hidden="true">{on ? "" : "·"}</span>
            </button>
          );
        })}
      </div>

      {/* Decorative duplicate of the live region below - the dot separator makes it
          run together when read aloud ("6 edzésnap1 pihenőnap"), so hide it. */}
      <div className="wkp-out" aria-hidden="true">
        <span className="wkp-count">
          <b>{picked.length}</b> edzésnap
        </span>
        <span className="wkp-sep" aria-hidden="true" />
        <span className="wkp-rest">{rest} pihenőnap - az is a terv része</span>
      </div>

      <p className="wkp-hint">
        {picked.length >= MAX
          ? "Ennél többet nem ajánlok - a pihenés is építi."
          : picked.length <= MIN
            ? "Három nap is elég. Ha az a három tényleg belefér."
            : "Koppints egy napra, és nézd, hogy változik."}
      </p>

      {/* Derived, not stored - the count is announced, every individual toggle isn't. */}
      <span className="lx-sr" role="status" aria-live="polite">
        {picked.length} edzésnap, {rest} pihenőnap egy héten.
      </span>
    </div>
  );
}
