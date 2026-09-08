"use client";

import { useId } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { StepProgress } from "./StepProgress";

// The question-screen chrome (40 §40.4): back · progress · counter, a scrolling
// body, and a bottom-anchored action.
//
// NOT a <fieldset>/<legend>, deliberately. It was, and on iOS Safari the
// question title vanished on every step: WebKit paints a <legend> at the
// fieldset's border edge rather than as an in-flow block, so with
// `overflow-y: auto` on the fieldset the title landed outside the scrollport
// and was clipped away by the sheet — leaving its reserved space as an empty
// gap above the sub-line. Blink honours `display: block` on a legend and
// rendered it fine, which is why it survived every non-WebKit check.
//
// A plain <h2> loses nothing: the options carry their own labelled radiogroup
// (OptionList), the step change is announced through the live region in
// OnboardingV2, and focus still moves here on every step (40 §40.12).
export function StepFrame({
  onBack,
  progressCurrent,
  progressTotal,
  progressLabels,
  counter,
  heading,
  sub,
  helper,
  headingRef,
  children,
  cta,
}: {
  onBack?: () => void;
  progressCurrent?: number; // omit to hide the bar
  /** Segment count. Omit for the wizard's default of seven questions; the lead
   *  magnet passes its section count so the bar reads as sections, not steps. */
  progressTotal?: number;
  /** A row rendered directly under the bar, aligned to it. The lead magnet uses
   *  it to name every section at once instead of only the current one. */
  progressLabels?: React.ReactNode;
  counter?: string; // "3 / 5" · "Kész"
  heading: string;
  sub?: string;
  /** A quiet reassurance under the sub-line (offer v3 §4.6) - "van könnyített
   *  változat", "van csendes változat". It answers the objection the question
   *  itself provokes, so it belongs on the question, not a step later. */
  helper?: string;
  headingRef?: React.Ref<HTMLHeadingElement>;
  children: React.ReactNode;
  cta: React.ReactNode;
}) {
  const headingId = useId();
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
        {progressCurrent !== undefined && (
          <StepProgress current={progressCurrent} {...(progressTotal ? { total: progressTotal } : {})} />
        )}
        {counter && <span className="fnl-counter mono">{counter}</span>}
      </div>

      {progressLabels}

      {/* .fnl-sheet groups body+action into ONE object so the mobile layer can
          make it the dark glass sheet that floats over the step photo
          (docs/register-mobile-redesign-plan.md §2.2). On desktop it is
          `display: contents` - the box disappears and .fnl-scroll/.fnl-foot
          stay direct flex children of .fnl-main exactly as before, so the
          desktop layout is untouched. */}
      <div className="fnl-sheet">
        <div className="fnl-scroll" role="group" aria-labelledby={headingId}>
          <h2 className="fnl-q" id={headingId} ref={headingRef} tabIndex={-1}>
            {heading}
          </h2>
          {sub && <p className="fnl-sub">{sub}</p>}
          {helper && <p className="fnl-helper">{helper}</p>}
          <div className="fnl-fields">{children}</div>
        </div>

        <div className="fnl-foot">{cta}</div>
      </div>
    </div>
  );
}
