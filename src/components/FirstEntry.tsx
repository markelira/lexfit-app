"use client";

import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import type { Prefs } from "@/lib/profile";

// First-entry additions to the home (40 §40.9 / P7), shown ONCE:
//  · the first-workout whisper while the user has done nothing yet (doneCount 0);
//  · the reminder card until it's answered (prefs.reminders.workout.prompted).
// Both persist their "seen" state in Firestore, not a flag or localStorage.

// Day-part label for the reminder time, derived from the seeded hour.
function dayPart(time: string): string {
  const h = Number.parseInt(time.split(":")[0] ?? "7", 10);
  if (h < 11) return "Reggel";
  if (h < 17) return "Napközben";
  return "Este";
}

export function FirstEntry({
  doneCount,
  prefs,
  onSetReminder,
  onDismissReminder,
}: {
  doneCount: number;
  prefs: Prefs | null;
  onSetReminder: () => void;
  onDismissReminder: () => void;
}) {
  const showHero = doneCount === 0;
  const showReminder = prefs != null && !prefs.reminders.workout.prompted;
  if (!showHero && !showReminder) return null;

  const time = prefs?.reminders.workout.time ?? "07:15";

  return (
    <section className="firstentry" aria-label="Első belépés">
      {showHero && (
        <div className="fe-hero">
          <span className="fe-kicker mono">Kezdjük az elsőt</span>
          <p className="fe-whisper">
            <span className="mark" aria-hidden="true">
              <LxIcon d={lxPaths.messageCircle} size={14} />
            </span>
            „Itt vagyok. Az első nap a legnehezebb — utána már csak csináljuk.”
          </p>
        </div>
      )}

      {showReminder && (
        <div className="fe-reminder">
          <div className="fe-rtext">
            <span className="fe-rl mono">Beállítanál egy emlékeztetőt?</span>
            <p className="fe-rb">
              {dayPart(time)} {time}-kor szólok az edzésnapjaidon.
            </p>
          </div>
          <div className="fe-ractions">
            <button type="button" className="fe-btn ghost" onClick={onDismissReminder}>
              Most nem
            </button>
            <button type="button" className="fe-btn primary" onClick={onSetReminder}>
              Beállítom
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
