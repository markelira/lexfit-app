import "server-only";

// Habit-reminder emails (30 §P6.3) — separate from the billing templates. Tone per
// the retention research: warm, never guilt, the plan the user already set.

// Every reminder must carry an opt-out path (EU consent hygiene): the toggle
// lives at Profil → Beállítások, linked directly when the app URL is known.
function manageFooter(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  const where = base ? `${base}/app/profile/settings` : "a Profil → Beállítások oldalon";
  return `\n\n—\nEzt az emlékeztetőt te kérted. Bármikor kikapcsolhatod itt: ${where}`;
}

export function workoutReminderEmail(): { subject: string; text: string } {
  return {
    subject: "Ma van edzésnapod 💚",
    text:
      "Szia!\n\nMa az egyik edzésnapod — ahogy te állítottad be. Nincs nyomás, csak egy " +
      "emlékeztető: 20–30 perc, egy matrac, és Alexa végig veled csinálja.\n\n" +
      "Nyisd meg a LEXFIT-et, amikor kényelmes." +
      manageFooter(),
  };
}

export function streakRiskEmail(streak: number): { subject: string; text: string } {
  return {
    subject: `A ${streak} napos sorozatod ma megtartható`,
    text:
      `Szia!\n\nMa még nem mozogtál, és a ${streak} napos sorozatod ma tartható meg. ` +
      "Egy rövid edzés is elég — a pihenőnapok nem törik meg, csak a betervezett napok.\n\n" +
      "Ha ma pihensz, az is rendben. Holnap újra itt vagyunk." +
      manageFooter(),
  };
}
