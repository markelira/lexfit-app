// Renders every email template WITH its PreviewProps (sample data) to standalone
// HTML files — unlike `email export`, which renders without props. Useful for
// eyeballing real output or attaching to a review.
// Run: node --import tsx scripts/render-email-previews.ts [outDir]

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as React from "react";
import { render } from "react-email";

import AnnualNudge from "../emails/annual-nudge";
import AnnualRenewalReminder from "../emails/annual-renewal-reminder";
import CancelConfirm from "../emails/cancel-confirm";
import Day2Nudge from "../emails/day2-nudge";
import DunningDay0 from "../emails/dunning-day0";
import DunningDay3 from "../emails/dunning-day3";
import EarnedUnlocked from "../emails/earned-unlocked";
import FirstWorkout from "../emails/first-workout";
import LeadRightsConfirm from "../emails/lead-rights-confirm";
import PasswordReset from "../emails/password-reset";
import QuizHowItWorks from "../emails/quiz-how-it-works";
import QuizLastCall from "../emails/quiz-last-call";
import QuizObjections from "../emails/quiz-objections";
import QuizObstacle from "../emails/quiz-obstacle";
import QuizOffer from "../emails/quiz-offer";
import QuizResult from "../emails/quiz-result";
import QuizWinback from "../emails/quiz-winback";
import PauseResuming from "../emails/pause-resuming";
import StreakRisk from "../emails/streak-risk";
import SubscriptionStarted from "../emails/subscription-started";
import VerifyEmail from "../emails/verify-email";
import WeeklyDay5Reminder from "../emails/weekly-day5-reminder";
import WeeklyRecap from "../emails/weekly-recap";
import Welcome from "../emails/welcome";
import WithdrawalConfirm from "../emails/withdrawal-confirm";
import WorkoutReminder from "../emails/workout-reminder";

type Template = React.ComponentType<never> & { PreviewProps?: object };

const templates: Record<string, Template> = {
  "annual-nudge": AnnualNudge as Template,
  "annual-renewal-reminder": AnnualRenewalReminder as Template,
  "cancel-confirm": CancelConfirm as Template,
  "day2-nudge": Day2Nudge as Template,
  "dunning-day0": DunningDay0 as Template,
  "dunning-day3": DunningDay3 as Template,
  "earned-unlocked": EarnedUnlocked as Template,
  "first-workout": FirstWorkout as Template,
  "lead-rights-confirm": LeadRightsConfirm as Template,
  "password-reset": PasswordReset as Template,
  "quiz-result": QuizResult as Template,
  "quiz-obstacle": QuizObstacle as Template,
  "quiz-how-it-works": QuizHowItWorks as Template,
  "quiz-offer": QuizOffer as Template,
  "quiz-objections": QuizObjections as Template,
  "quiz-last-call": QuizLastCall as Template,
  "quiz-winback": QuizWinback as Template,
  "pause-resuming": PauseResuming as Template,
  "streak-risk": StreakRisk as Template,
  "subscription-started": SubscriptionStarted as Template,
  "verify-email": VerifyEmail as Template,
  "weekly-day5-reminder": WeeklyDay5Reminder as Template,
  "weekly-recap": WeeklyRecap as Template,
  welcome: Welcome as Template,
  "withdrawal-confirm": WithdrawalConfirm as Template,
  "workout-reminder": WorkoutReminder as Template,
};

async function main() {
  const outDir = process.argv[2] ?? ".email-previews";
  mkdirSync(outDir, { recursive: true });
  for (const [name, Comp] of Object.entries(templates)) {
    const el = React.createElement(Comp, (Comp.PreviewProps ?? {}) as never);
    writeFileSync(join(outDir, `${name}.html`), await render(el));
    console.log("rendered", name);
  }
  console.log(`\n${Object.keys(templates).length} templates → ${outDir}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
