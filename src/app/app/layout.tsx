"use client";

import "./shell.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/lib/auth-context";
import { AppTopBar } from "@/components/AppTopBar";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { getProgress, syncMuxProgress, getPendingCompletions } from "@/lib/progress";
import { getPrefs } from "@/lib/prefs";
import { computeStreak } from "@/lib/streak";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Four labelled destinations (RULE 02). Icon + permanently visible label on every
// item, at every breakpoint (F-10). Order matches the shell wireframe.
const NAV: [string, keyof typeof lxPaths, string][] = [
  ["/app", "house", "Kezdőlap"],
  ["/app/programs", "layers", "Programok"],
  ["/app/library", "grid", "Videótár"],
  ["/app/progress", "chart", "Haladásom"],
  ["/app/challenges", "trophy", "Kihívások"],
];

const isActive = (href: string, pathname: string) =>
  href === "/app"
    ? pathname === "/app"
    : href === "/app/programs"
      ? pathname.startsWith("/app/programs") || pathname.startsWith("/app/program/")
      : pathname.startsWith(href);

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    // Fold any freshly finished Mux views into the progress doc (throttled), then
    // derive the streak FRESH the same way Haladásom does (computeStreak over the
    // dated completions + the user's plan) — never the stored, drift-prone field.
    syncMuxProgress()
      .then(() => Promise.all([getProgress(uid), getPrefs(uid)]))
      .then(([p, pr]) => {
        const confirmed = p?.completed ?? [];
        const pending = getPendingCompletions();
        const merged = [
          ...confirmed,
          ...pending.filter((x) => !confirmed.some((c) => c.code === x.code && String(c.at) === String(x.at))),
        ];
        const dates = merged.map((c) => String(c.at));
        const workoutIdx = new Set(pr.plan.weekdays.map((w) => w - 1));
        setStreak(computeStreak(dates, workoutIdx, ymd(new Date()), pr.plan.restDayKeepsStreak));
      })
      .catch(() => {});
  }, [user]);

  return (
    <div className="lx lx-shell">
      <AppTopBar streak={streak} />

      <div className="lx-body">
        <aside className="lx-sidebar">
          <div className="lx-navsec">Menü</div>
          <nav className="lx-nav">
            {NAV.map(([href, ic, label]) => {
              const on = isActive(href, pathname);
              return (
                <Link key={href} href={href} className={`nav2${on ? " on" : ""}`} aria-current={on ? "page" : undefined}>
                  <LxIcon d={lxPaths[ic]} size={19} /> {label}
                </Link>
              );
            })}
          </nav>

          <a href="mailto:hi@lexfit.hu" className="lx-help">
            <span className="av">A</span>
            <span className="pi">
              <span className="nm">Alexa</span>
              <span className="sb">segítség</span>
            </span>
          </a>
        </aside>

        <main className="lx-main">
          <div className="lx-main-in">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tab bar (< 840px) — labels kept, 44px targets (RULE 06 / F-07). */}
      <nav className="lx-tabbar" aria-label="Fő navigáció">
        {NAV.map(([href, ic, label]) => {
          const on = isActive(href, pathname);
          return (
            <Link key={href} href={href} className={`lx-tab${on ? " on" : ""}`} aria-current={on ? "page" : undefined}>
              <span className="ic"><LxIcon d={lxPaths[ic]} size={20} /></span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected requirePaid>
      <Shell>{children}</Shell>
    </Protected>
  );
}
