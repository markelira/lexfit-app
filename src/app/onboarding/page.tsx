// The onboarding funnel (40 §40). Anonymous-first by design — no <Protected>,
// no flag: the P3 inversion is complete (onboarding → auth → checkout → app) and
// the legacy auth-first page has been removed.
export { OnboardingV2 as default } from "./OnboardingV2";
