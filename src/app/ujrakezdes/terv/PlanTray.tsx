"use client";

import * as C from "../copy";
import { trainingDays, WEEKDAY_SHORT, type Weekday } from "@/lib/ujrakezdes/plan";
import type { Answers } from "@/lib/ujrakezdes/types";

// The tray: the plan assembling itself while the questions are still running.
//
// This is the one place in the funnel that gets to be theatrical, and it earns
// it by being true - every chip is a restatement of something the person just
// chose, and the week strip is the real week the reveal will show. Nothing here
// is invented, scored or graded.
//
// WHY CONSTRUCTION AND NOT POINTS. The audience is people who have restarted and
// failed, repeatedly. A score is a thing you can be bad at, and a streak is a
// thing you can break - handing either to someone who arrived because the last
// four attempts collapsed is the one move this funnel must not make. A thing you
// are visibly building is a reason to reach the end instead.
//
// The pattern is the repo's own recommendation, not an invention:
// docs/onboarding-personalization-plan.md §5 lists "answers echoed back as
// labelled chips" and "the real weekday calendar" as what makes a fixed queue
// feel personally generated.

/**
 * The answers, as the labels the tray shows.
 *
 * Exported because the gate's mail preview echoes the same list, and two places
 * deriving „which answer becomes which word" independently is exactly how the
 * quiz and the email end up describing the same person differently.
 */
export function trayChips(a: Partial<Answers>): { key: string; step: string; label: string }[] {
  const chips: { key: string; step: string; label: string }[] = [];
  if (a.anchor) chips.push({ key: "anchor", step: "anchor", label: C.TRAY.anchor[a.anchor] });
  if (a.level) chips.push({ key: "level", step: "level", label: C.TRAY.level[a.level] });
  if (a.days) chips.push({ key: "days", step: "days", label: C.TRAY.days[a.days] });
  if (a.focus) chips.push({ key: "focus", step: "focus", label: C.TRAY.focus[a.focus] });
  for (const c of a.care ?? []) {
    chips.push({ key: `care-${c}`, step: "care", label: C.TRAY.care[c] });
  }
  if (a.place) chips.push({ key: "place", step: "place", label: C.TRAY.place[a.place] });
  if (a.daypart) chips.push({ key: "daypart", step: "daypart", label: C.TRAY.daypart[a.daypart] });
  return chips;
}

export default function PlanTray({
  a,
  latest,
}: {
  a: Partial<Answers>;
  /** The step just answered. Only that chip animates in - animating the whole
   *  row on every change would make the tray flicker rather than accumulate. */
  latest: string | null;
}) {
  const chips = trayChips(a);

  // The week appears only once it can say something true - that is, once they
  // have chosen how many days. Before that it would be decoration pretending to
  // be information.
  const week: Weekday[] | null = a.days ? trainingDays(a.days) : null;
  const training = new Set(week ?? []);

  if (!chips.length) return null;

  return (
    <div className="u-tray">
      {/* The chips are decorative repetition for a sighted user, but a screen
          reader should hear the state once, as a sentence, not as a list of
          fragments interrupting the question. */}
      <p className="u-sr-only" aria-live="polite">
        {C.TRAY.heading}: {chips.map((c) => c.label).join(", ")}
      </p>

      <ul className="u-tray-chips" aria-hidden="true">
        {chips.map((c) => (
          <li key={c.key} className={`u-tchip${c.step === latest ? " land" : ""}`}>
            {c.label}
          </li>
        ))}
      </ul>

      {week && (
        <ul className="u-tray-week" aria-hidden="true">
          {WEEKDAY_SHORT.map((d, i) => (
            <li key={d} className={training.has((i + 1) as Weekday) ? "on" : ""}>
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
