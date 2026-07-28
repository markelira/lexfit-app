import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { adminApp, adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, milestoneDocId } from "@/lib/pricing/keys";
import { sendEmail } from "@/lib/email";
import { streakRiskEmail, workoutReminderEmail } from "@/lib/notify-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// P6.3 — hourly habit reminders (email only). Separate from the billing cron: a
// daily reminder on the user's own edzésnapok at their chosen hour, plus a 20:00
// "Sorozat veszélyben" pass. ONE message per user per day across both, idempotent
// via a milestone doc. Never remind someone who already trained today.
const WD: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

function budapestNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Budapest",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false, weekday: "short",
    }).formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour) % 24,
    weekday: WD[parts.weekday as string] ?? 1,
  };
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { day, hour, weekday } = budapestNow();

  // Users who want the daily reminder. (Needs a collection-group index on
  // settings/reminders.workout.enabled — see firestore.indexes.json.)
  const snap = await adminDb
    .collectionGroup("settings")
    .where("reminders.workout.enabled", "==", true)
    .get();

  let sent = 0;
  for (const doc of snap.docs) {
    if (doc.id !== "prefs") continue;
    const uid = doc.ref.parent.parent?.id;
    if (!uid) continue;
    const prefs = doc.data() as {
      plan?: { weekdays?: number[] };
      reminders?: { workout?: { time?: string; weekdays?: number[] }; streakRisk?: boolean };
    };
    const workout = prefs.reminders?.workout;
    const [rh] = (workout?.time ?? "07:15").split(":").map(Number);

    const dailyDue = rh === hour && (workout?.weekdays ?? []).includes(weekday);
    const streakDue = hour === 20 && !!prefs.reminders?.streakRisk;
    if (!dailyDue && !streakDue) continue;

    // Never remind someone who already trained today.
    const progress = (await adminDb.doc(`users/${uid}/progress/state`).get()).data() as
      | { lastCompletedDate?: string | null; streak?: number }
      | undefined;
    if (progress?.lastCompletedDate === day) continue;

    // One message per user per day, across both passes.
    const mRef = adminDb.collection(COLLECTIONS.milestones).doc(milestoneDocId(uid, `workout_reminder_${day}`));
    if ((await mRef.get()).exists) continue;

    // Streak-risk pass only fires with a live streak + a workout planned today.
    const streakOnly = streakDue && !dailyDue;
    if (streakOnly) {
      const streak = progress?.streak ?? 0;
      const plannedToday = (prefs.plan?.weekdays ?? []).includes(weekday);
      if (streak <= 0 || !plannedToday) continue;
    }

    const email = await getAuth(adminApp).getUser(uid).then((u) => u.email).catch(() => null);
    if (!email) continue;

    const tmpl = streakOnly ? streakRiskEmail(progress?.streak ?? 0) : workoutReminderEmail();
    await sendEmail({ to: email, ...tmpl });
    await mRef.set({ kind: streakOnly ? "streak_risk" : "workout_reminder", day, sentAt: FieldValue.serverTimestamp() });
    sent += 1;
    console.log(`[workout-reminders] ${streakOnly ? "streak" : "daily"} → ${uid}`);
  }

  return NextResponse.json({ sent });
}
