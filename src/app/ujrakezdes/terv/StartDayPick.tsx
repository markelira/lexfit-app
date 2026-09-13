"use client";

import { useEffect, useState } from "react";
import * as C from "../copy";
import { useSectionView } from "./useSectionView";

// R4 · the start-day choice. One tap of ownership (a plan she adjusted is HER
// plan), and the only honest deadline the brand allows itself: the calendar.
// Monday is the Fresh Start Effect's temporal landmark; "tonight" is the
// implementation-intention play (a when/where plan ~doubles follow-through).
//
// CONTROLLED and display-only: the pick lives in PlanWizard's state (it also
// personalises the first-workout block further down), is remembered for the
// session there, and writes nothing to the server — the app's cadence setup
// owns real scheduling post-purchase.

export type StartPick = "today" | "monday";

/** Next Monday as "szept 15." in Budapest time — or null before mount.
 *  Resolved client-side only: the route is statically prerendered, and a
 *  build-time date shown to every visitor forever is the bug this avoids. */
function useMonday(): { label: string; isToday: boolean } | null {
  const [v, setV] = useState<{ label: string; isToday: boolean } | null>(null);
  useEffect(() => {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Budapest", weekday: "short",
    }).format(now);
    const isToday = weekday === "Mon";
    const DAY = 24 * 3600_000;
    const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const ahead = (7 - order.indexOf(weekday)) % 7;
    const monday = new Date(now.getTime() + ahead * DAY);
    const label = new Intl.DateTimeFormat("hu-HU", {
      timeZone: "Europe/Budapest", month: "short", day: "numeric",
    }).format(monday);
    setV({ label, isToday });
  }, []);
  return v;
}

export default function StartDayPick({
  pick,
  onPick,
  mins,
}: {
  pick: StartPick;
  onPick: (pick: StartPick) => void;
  /** First-workout length, from the plan. */
  mins: number;
}) {
  const monday = useMonday();
  const ref = useSectionView("startday");

  const mondayLabel = monday
    ? monday.isToday
      ? C.REVEAL.start.mondayToday
      : C.REVEAL.start.monday(monday.label)
    : C.REVEAL.start.monday("…");

  const when = pick === "today" ? "ma este" : monday?.isToday ? "ma" : "hétfőn";

  return (
    <div className="u2-start" ref={ref}>
      <p className="u2-eyebrow">{C.REVEAL.start.eyebrow}</p>
      <div className="u2-start-opts" role="radiogroup" aria-label={C.REVEAL.start.eyebrow}>
        <button
          type="button" role="radio" aria-checked={pick === "today"}
          className={pick === "today" ? "on" : ""} onClick={() => onPick("today")}
        >
          {C.REVEAL.start.today}
        </button>
        <button
          type="button" role="radio" aria-checked={pick === "monday"}
          className={pick === "monday" ? "on" : ""} onClick={() => onPick("monday")}
        >
          {mondayLabel}
        </button>
      </div>
      <p className="u2-start-line">{C.REVEAL.start.firstLine(when, mins)}</p>
    </div>
  );
}
