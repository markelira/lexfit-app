"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { budapestDay, budapestHour, addDaysToDay } from "@/lib/pricing/keys";
import { logCheckin, getCheckedInDays } from "@/lib/billing";
import styles from "./CheckinWeek.module.css";

const LABELS = ["H", "K", "Sz", "Cs", "P", "Sz", "V"]; // Mon..Sun

/** Monday-anchored week containing `day` (a Budapest YYYY-MM-DD). */
function weekDays(day: string): string[] {
  const [y, m, d] = day.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun
  const monday = addDaysToDay(day, -((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDaysToDay(monday, i));
}

/**
 * F3.1 weekly check-in bar — the community "Szavazz Magadra" ✅ mechanic.
 * Renders for every user; the offer engine (server) decides eligibility.
 */
export function CheckinWeek() {
  const { user } = useAuth();
  const router = useRouter();
  // Date-derived values are computed once (lazy init) — not set in an effect.
  const [today] = useState<string>(() => budapestDay(new Date()));
  const [yesterday] = useState<string | null>(() =>
    budapestHour(new Date()) < 4 ? addDaysToDay(budapestDay(new Date()), -1) : null,
  );
  const days = useMemo(() => weekDays(today), [today]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  // Only the async fetch touches state, inside .then (allowed in effects).
  useEffect(() => {
    if (!user) return;
    getCheckedInDays(user.uid, days).then(setDone).catch(() => {});
  }, [user, days]);

  const loggable = (day: string) => day === today || day === yesterday;

  async function check(day: string) {
    if (busy || done.has(day) || !loggable(day)) return;
    setBusy(day);
    try {
      const { earned } = await logCheckin(day);
      setDone((s) => new Set(s).add(day));
      if (earned) router.push("/app/grandslam");
    } catch {
      /* silent — the bar just won't fill */
    } finally {
      setBusy(null);
    }
  }

  if (!user) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.title}>Szavazz magadra</span>
        <span className={styles.sub}>napi pipa · együtt, minden nap</span>
      </div>
      <div className={styles.row}>
        {days.map((day, i) => {
          const isDone = done.has(day);
          const canLog = loggable(day) && !isDone;
          const isToday = day === today;
          return (
            <button
              key={day}
              className={[
                styles.cell,
                isDone ? styles.cellDone : "",
                isToday ? styles.cellToday : "",
                canLog ? styles.cellCanLog : "",
              ].join(" ")}
              disabled={!canLog}
              aria-label={`${LABELS[i]} ${day}${isDone ? " — kész" : ""}`}
              onClick={() => check(day)}
            >
              <span className={styles.dot}>
                {isDone ? <LxIcon d={lxPaths.check} size={14} sw={3} /> : LABELS[i]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
