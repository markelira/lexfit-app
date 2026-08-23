"use client";

import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { StepProgress } from "./StepProgress";

// The question-screen chrome (40 §40.4): back · progress · counter, a scrolling
// <fieldset> body whose <legend> is the visible heading (40 §40.12), and a
// bottom-anchored CTA. Welcome and the reveal use their own layouts.
export function StepFrame({
  onBack,
  progressCurrent,
  counter,
  heading,
  sub,
  headingRef,
  children,
  cta,
}: {
  onBack?: () => void;
  progressCurrent?: number; // omit to hide the bar
  counter?: string; // "3 / 5" · "Kész"
  heading: string;
  sub?: string;
  headingRef?: React.Ref<HTMLLegendElement>;
  children: React.ReactNode;
  cta: React.ReactNode;
}) {
  return (
    <div className="fnl-main fnl">
      <div className="fnl-top">
        {onBack ? (
          <button className="fnl-back hit44" onClick={onBack} aria-label="Vissza">
            <LxIcon d={lxPaths.chevronLeft} size={18} />
          </button>
        ) : (
          <span className="fnl-back-spacer" aria-hidden="true" />
        )}
        {progressCurrent !== undefined && <StepProgress current={progressCurrent} />}
        {counter && <span className="fnl-counter mono">{counter}</span>}
      </div>

      {/* .fnl-sheet groups body+action into ONE object so the mobile layer can
          make it the dark glass sheet that floats over the step photo
          (docs/register-mobile-redesign-plan.md §2.2). On desktop it is
          `display: contents` - the box disappears and .fnl-scroll/.fnl-foot
          stay direct flex children of .fnl-main exactly as before, so the
          desktop layout is untouched. */}
      <div className="fnl-sheet">
        <fieldset className="fnl-scroll">
          <legend className="fnl-q" ref={headingRef} tabIndex={-1}>
            {heading}
          </legend>
          {sub && <p className="fnl-sub">{sub}</p>}
          <div className="fnl-fields">{children}</div>
        </fieldset>

        <div className="fnl-foot">{cta}</div>
      </div>
    </div>
  );
}
