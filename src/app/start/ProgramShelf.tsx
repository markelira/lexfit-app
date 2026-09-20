"use client";

import { WorkoutCard, type WorkoutCardVideo } from "@/components/WorkoutCard";

/**
 * The whole programme, shown rather than summarised (P1).
 *
 * "35 edzés" is a number; this is the thing. Every session the buyer receives
 * is here, in the app's OWN WorkoutCard - the same component, the same covers,
 * the same geometry they will meet after paying - so the page shows the
 * product instead of a picture of it.
 *
 * Grouped by category, because 35 cards in one run is a wall. The counts are
 * derived from the playlist, never typed: a category line that says seven
 * while the row holds eight is the kind of small lie that costs more than the
 * sentence was worth.
 *
 * Every card is a CTA. Tapping one cannot play anything - nothing has been
 * bought yet - so instead of a locked dead end it opens the checkout, which is
 * what someone who just tapped a workout is asking for.
 */
export function ProgramShelf({
  workouts,
  onTap,
}: {
  workouts: WorkoutCardVideo[];
  onTap: () => void;
}) {
  if (!workouts.length) return null;

  // Insertion order = playlist order, so the categories appear in the order the
  // programme introduces them rather than alphabetically.
  const groups = new Map<string, WorkoutCardVideo[]>();
  for (const w of workouts) {
    const k = w.theme || "Egyéb";
    groups.set(k, [...(groups.get(k) ?? []), w]);
  }

  return (
    <div className="lxs-shelf">
      {[...groups].map(([theme, list]) => (
        <section key={theme} className="lxs-cat" aria-label={theme}>
          <div className="lxs-cathead">
            <h3>{theme}</h3>
            <span>{list.length} edzés</span>
          </div>
          <div className="lxs-row" role="list">
            {list.map((v) => (
              <div className="lxs-cell" role="listitem" key={v.code}>
                <WorkoutCard
                  v={v}
                  saved={false}
                  onPlay={onTap}
                  onToggleSave={onTap}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
