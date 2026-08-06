// The funnel progress bar (40 §40.4). One segment per question; `current`
// filled. role="progressbar" with real values (40 §40.12 a11y).
export function StepProgress({
  current,
  total = 7,
}: {
  current: number; // number of filled segments (1–7); the "why" step fills all 7
  total?: number;
}) {
  const now = Math.max(0, Math.min(current, total));
  return (
    <div
      className="fnl-prog"
      role="progressbar"
      aria-label="Onboarding"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={Math.max(1, now)}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`seg${i < now ? " on" : ""}`} aria-hidden="true" />
      ))}
    </div>
  );
}
