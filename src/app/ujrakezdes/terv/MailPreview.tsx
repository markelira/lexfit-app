"use client";

import PlanMail from "../PlanMail";
import { trayChips } from "./PlanTray";
import * as C from "../copy";
import type { WeekPlan } from "@/lib/ujrakezdes/plan";
import type { Answers } from "@/lib/ujrakezdes/types";

// The gate's background: the email they are about to be sent.
//
// WHY. The gate asks „Hova küldjük, hogy meg is maradjon?" and, until now,
// asked it over an empty dark gradient - the step maps to a BrandPanel "ground"
// panel, which drops its image on mobile, so the top two thirds of the screen
// were literally nothing. A question about where to send something, asked over
// a void.
//
// The card itself is <PlanMail>, the same component the landing hero renders
// with sample data. What the ad promised and what the funnel delivers are then
// the same object by construction, not by two designers agreeing.
//
// Decorative for assistive tech - the sheet in front already states the offer in
// words - so the whole panel is aria-hidden.

export default function MailPreview({
  plan, answers,
}: {
  plan: WeekPlan | null;
  /** Their own answers, echoed exactly as the tray echoed them mid-quiz. */
  answers: Partial<Answers>;
}) {
  const chips = trayChips(answers).map((c) => c.label);
  return (
    <aside
      className="authx-brand bp-img u-mailpanel"
      data-panel="mail"
      data-art="ground"
      aria-hidden="true"
    >
      <div className="u-mailwrap">
        <PlanMail
          headline={C.REVEAL.b1.hd}
          cta="Megnyitom a tervem"
          days={(plan?.days ?? []).map((d) => ({
            key: String(d.weekday),
            short: d.short,
            training: d.training,
            // `minutes` is null on a rest day in the plan model; PlanMail takes
            // an optional number and draws a dash when it is absent.
            ...(d.minutes != null ? { minutes: d.minutes } : {}),
          }))}
          {...(plan
            ? {
                stats: [
                  { k: "nap / hét", v: String(plan.trainingCount) },
                  { k: "perc", v: String(plan.firstWorkoutMinutes) },
                  { k: "eszköz", v: "0" },
                ],
                sub: C.REVEAL.b1.sub(plan.trainingCount, plan.sessionLabel),
              }
            : {})}
          {...(chips.length ? { answersLead: C.HERO_WEEK.answersLead, answers: chips } : {})}
        />
      </div>

      <div className="bmark bp-mark">
        <span className="bmark-ico">
          <svg viewBox="0 0 680 616" aria-hidden="true">
            <g transform="translate(-192,-152)">
              <path
                d="M248 712A400 400 0 0 1 648 312"
                fill="none"
                stroke="#ffffff"
                strokeWidth="112"
                strokeLinecap="round"
              />
              <circle cx="800" cy="224" r="72" fill="#ffffff" />
            </g>
          </svg>
        </span>
        <span className="wm">LEXFIT</span>
      </div>
    </aside>
  );
}
