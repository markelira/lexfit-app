import { redirect } from "next/navigation";

// The funnel moved to /register (E1.3 - one join wizard). /onboarding is kept as
// a permanent redirect so old links / deep-links still land in the flow.
export default function OnboardingRedirect() {
  redirect("/register");
}
