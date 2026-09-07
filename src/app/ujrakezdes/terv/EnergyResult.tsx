"use client";

import * as C from "../copy";
import type { EnergyResult as Result } from "@/lib/ujrakezdes/energy";

// The calculator's RESULT, on the reveal.
//
// The questions that feed it are asked in the questionnaire itself (see the
// `body`, `goal` and `tempo` steps in PlanWizard) rather than here. That is the
// difference between a calculator bolted onto the end of a plan and a plan that
// happens to include a calculator: by the time somebody reaches the reveal they
// have already answered everything, so the result is simply there - no second
// form, no second submit, no "Kiszámolom" button standing between them and a
// number they already earned.
//
// Layout follows szavazzmagadra's own result: one very large figure in a
// gradient hero, three macro cards, the split exercise/steps card, the water
// panel. In LEXFIT's palette, and still without the BMI badge or the goal-weight
// projection.

export default function EnergyResult({
  result, trainingCount, goal, tempo,
}: {
  result: Result;
  /** From the plan, so the module never contradicts the week already shown. */
  trainingCount: number;
  goal: string;
  tempo: string;
}) {
  const hu = (n: number) => n.toLocaleString("hu-HU");

  return (
    <section className="u-calc u-calc-result" aria-labelledby="u-calc-h">
      <h3 className="u-calc-h" id="u-calc-h">{C.ENERGY.resultHeading}</h3>

      <div className="u-calc-body">
        <div className="u-res-hero">
          <span className="ring a" aria-hidden="true" />
          <span className="ring b" aria-hidden="true" />
          <p className="eyebrow">{C.ENERGY.resultEyebrow}</p>
          <p className="big">{hu(result.kcal)}<span>kcal</span></p>
          <p className="desc">{C.ENERGY.tempoDesc[goal]?.[tempo]}</p>
        </div>

        {result.floored && <p className="u-en-note">{C.ENERGY.flooredNote}</p>}

        <div className="u-macros">
          {[
            { k: "p", label: C.ENERGY.proteinLabel, v: result.macros.proteinG },
            { k: "c", label: C.ENERGY.carbsLabel, v: result.macros.carbsG },
            { k: "f", label: C.ENERGY.fatLabel, v: result.macros.fatG },
          ].map((m) => (
            <div className="u-macro" key={m.k}>
              <span className={`dot ${m.k}`} aria-hidden="true" />
              <p className="lbl">{m.label}</p>
              <p className="val">{hu(m.v)}<span>g</span></p>
            </div>
          ))}
        </div>

        <div className="u-split">
          <div>
            <p className="big">{trainingCount}</p>
            <p className="lbl">{C.ENERGY.weekSplitLabel(result.sessionMin ?? 30)}</p>
          </div>
          <span className="rule" aria-hidden="true" />
          <div>
            <p className="big">{hu(result.stepTarget)}</p>
            <p className="lbl">{C.ENERGY.stepsSplitLabel}</p>
          </div>
        </div>

        <div className="u-en-workout">
          <h4>{C.ENERGY.workoutHeading}</h4>
          <p className="u-fhint">{C.ENERGY.workoutLead(trainingCount)}</p>
          <ol>
            {result.programs.map((p) => (
              <li key={p.program}><b>{p.program}</b><span>{p.why}</span></li>
            ))}
          </ol>
        </div>

        <div className="u-water">
          <p className="eyebrow">{C.ENERGY.waterEyebrow}</p>
          <p className="val">
            {result.waterLitres.toString().replace(".", ",")}
            <span>{C.ENERGY.waterUnit}</span>
          </p>
        </div>

        <p className="u-en-disclaimer">{C.ENERGY.disclaimer}</p>
      </div>
    </section>
  );
}
