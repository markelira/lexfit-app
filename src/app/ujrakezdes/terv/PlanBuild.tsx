"use client";

import { useEffect } from "react";
import * as C from "../copy";

// R1 · the plan-build transition (gate → reveal only; the persisted-plan page
// and any sessionStorage resume skip it — see PlanWizard).
//
// Labor illusion, honestly (Buell & Norton 2011: watched work is valued work,
// and the effect DIES when the labor isn't believable): every line names a
// derivation buildWeekPlan actually performs, and the chip next to it is the
// user's own answer. Nothing here is theater about the theater — the plan
// really is assembled from exactly these inputs.
//
// Timing is CSS-staggered off one custom property; JS holds two timeouts
// total (the done-beat, then the advance). Reduced motion renders the list
// fully checked and advances after a short read beat.

export interface BuildStep {
  label: string;
  /** The user's own answer, echoed. */
  chip?: string;
}

export default function PlanBuild({
  steps,
  onDone,
}: {
  steps: BuildStep[];
  onDone: () => void;
}) {
  useEffect(() => {
    const reduced =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(onDone, reduced ? C.BUILD.reducedHoldMs : C.BUILD.holdMs);
    return () => clearTimeout(t);
    // onDone is a stable callback from the wizard (go); re-arming on identity
    // churn would stretch the hold.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="lxu u2 u2-build" aria-live="polite">
      <div className="u2-top">
        <span className="u2-top-mark">LEXFIT</span>
        <span className="u2-top-lbl"><b>{C.BUILD.eyebrow}</b></span>
        <span className="u2-top-bar" aria-hidden="true">
          <i className="u2-build-bar" />
        </span>
      </div>

      <div className="u2-build-col">
        <h1>{C.BUILD.hd}</h1>
        <ol className="u2-build-steps">
          {steps.map((s, i) => (
            <li key={s.label} style={{ ["--i" as string]: i }}>
              <span className="tick" aria-hidden="true" />
              <span className="lbl">{s.label}</span>
              {s.chip && <span className="chip">{s.chip}</span>}
            </li>
          ))}
          <li className="done" style={{ ["--i" as string]: steps.length }}>
            <span className="tick" aria-hidden="true" />
            <span className="lbl"><b>{C.BUILD.done}</b></span>
          </li>
        </ol>
      </div>
    </main>
  );
}
