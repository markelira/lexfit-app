"use client";

import * as C from "../copy";
import type { EnergyResult as Result } from "@/lib/ujrakezdes/energy";

// The calculator's RESULT, rendered INSIDE the plan card.
//
// The questions that feed it are asked in the questionnaire itself (see the
// `body`, `goal` and `tempo` steps in PlanWizard) rather than here. That is the
// difference between a calculator bolted onto the end of a plan and a plan that
// happens to include a calculator: by the time somebody reaches the reveal they
// have already answered everything, so the result is simply there.
//
// ── REDESIGNED 2026-09-08 ────────────────────────────────────────────────────
// It used to be a full-width section of its own, several scrolls below the week
// grid and directly above the prices - a second „hero number" competing with the
// week for the same job, and stranded next to the offer where it read as sales
// material rather than as part of the plan.
//
// Now it is a strip inside the plan card. Every teardown in the corpus shows the
// „your plan is ready" moment as ONE cohesive artifact
// (docs/funnel-research/02-results-page-offer.md), so the week and the numbers
// are one object. Three things dropped out in the move, all of them duplicates:
//
//   - the gradient hero with the giant kcal figure  → the week is the artifact
//   - the „× N perces edzés / hét" split card       → the week grid says this
//   - the „Mivel kezdd" programme recommendation    → ProgramPreview does this
//
// Still no BMI badge, no goal-weight projection, no „X kg Y hét alatt".

export default function EnergyResult({
  result, goal, tempo,
}: {
  result: Result;
  goal: string;
  tempo: string;
}) {
  const hu = (n: number) => n.toLocaleString("hu-HU");

  const stats: { k: string; label: string; val: string; unit: string; lead?: boolean }[] = [
    { k: "kcal", label: C.ENERGY.resultEyebrow, val: hu(result.kcal), unit: "kcal", lead: true },
    { k: "p", label: C.ENERGY.proteinLabel, val: hu(result.macros.proteinG), unit: "g" },
    { k: "c", label: C.ENERGY.carbsLabel, val: hu(result.macros.carbsG), unit: "g" },
    { k: "f", label: C.ENERGY.fatLabel, val: hu(result.macros.fatG), unit: "g" },
    { k: "s", label: C.ENERGY.stepsLabel, val: hu(result.stepTarget), unit: "" },
    {
      k: "w",
      label: C.ENERGY.waterLabel,
      val: result.waterLitres.toString().replace(".", ","),
      unit: C.ENERGY.waterUnit,
    },
  ];

  return (
    <div className="u-nums" aria-labelledby="u-nums-h">
      <div className="u-nums-head">
        <h3 className="u-nums-h" id="u-nums-h">{C.ENERGY.resultHeading}</h3>
        {/* The one sentence that says why these numbers are these numbers. */}
        <p className="u-nums-why">{C.ENERGY.tempoDesc[goal]?.[tempo]}</p>
      </div>

      <dl className="u-nums-grid">
        {stats.map((s) => (
          <div key={s.k} className={s.lead ? "lead" : ""}>
            <dt>{s.label}</dt>
            <dd>
              {s.val}
              {s.unit && <span>{s.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>

      {result.floored && <p className="u-en-note">{C.ENERGY.flooredNote}</p>}
      <p className="u-en-disclaimer">{C.ENERGY.disclaimer}</p>
    </div>
  );
}
