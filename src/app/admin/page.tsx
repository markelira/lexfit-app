"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminJson } from "@/lib/admin-fetch";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import type { MemberRow } from "@/app/api/admin/users/route";

const SECTIONS: { href: string; ic: keyof typeof lxPaths; tt: string; ds: string }[] = [
  { href: "/admin/videos", ic: "play", tt: "Videók", ds: "Feltöltés (Mux), adatok, publikálás." },
  { href: "/admin/programs", ic: "flame", tt: "Programok", ds: "Program + lejátszási lista." },
  { href: "/admin/filters", ic: "filter", tt: "Szűrők", ds: "Kategóriák és szűrő-értékek." },
  { href: "/admin/members", ic: "chart", tt: "Tagok", ds: "Tagok és előfizetések." },
];

const isActiveSub = (s: string) => s === "active" || s === "trialing";

export default function AdminHome() {
  const router = useRouter();
  const [users, setUsers] = useState<MemberRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    adminJson<{ users: MemberRow[] }>("/api/admin/users")
      .then((d) => setUsers(d.users))
      .catch(() => setFailed(true));
  }, []);

  const kpis = useMemo(() => {
    if (!users) return null;
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
    return {
      total: users.length,
      subs: users.filter((u) => isActiveSub(u.subscriptionStatus)).length,
      newThisMonth: users.filter((u) => (u.createdAt ?? "").slice(0, 7) === ym).length,
      activeThisWeek: users.filter((u) => (u.lastCompletedDate ?? "") >= weekAgo).length,
    };
  }, [users]);

  const recent = users?.slice(0, 6) ?? [];

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">LEXFIT ADMIN</div>
          <h1 className="adm-h1">Vezérlőpult</h1>
          <p className="adm-sub">Áttekintés és tartalomkezelés. A fejlécben lévő jelvény mutatja, melyik adatbázisba mennek a mentések (PROD / EMULATOR).</p>
        </div>
      </div>

      {failed ? (
        <div className="adm-card" style={{ marginBottom: 26 }}>A statisztikák betöltése nem sikerült.</div>
      ) : (
        <div className="adm-kpis">
          <div className="adm-kpi"><div className="v">{kpis ? kpis.total : "-"}</div><div className="k">Összes tag</div></div>
          <div className="adm-kpi"><div className="v">{kpis ? kpis.subs : "-"}</div><div className="k">Aktív előfizetés</div></div>
          <div className="adm-kpi"><div className="v">{kpis ? kpis.activeThisWeek : "-"}</div><div className="k">Aktív a héten</div></div>
          <div className="adm-kpi"><div className="v">{kpis ? kpis.newThisMonth : "-"}</div><div className="k">Új e hónapban</div></div>
        </div>
      )}

      <div className="adm-secttl">Gyors elérés</div>
      <div className="adm-grid" style={{ marginBottom: 26 }}>
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="adm-tile">
            <span className="ic"><LxIcon d={lxPaths[s.ic]} size={20} /></span>
            <span className="tt">{s.tt}</span>
            <span className="ds">{s.ds}</span>
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <>
          <div className="adm-secttl">Legutóbbi tagok</div>
          <table className="adm-table">
            <thead>
              <tr><th>Név</th><th>Email</th><th>Előfizetés</th></tr>
            </thead>
            <tbody>
              {recent.map((u) => (
                <tr key={u.uid} className="row" onClick={() => router.push(`/admin/members/${u.uid}`)}>
                  <td>{u.displayName ?? "-"}</td>
                  <td className="muted">{u.email ?? "-"}</td>
                  <td>{isActiveSub(u.subscriptionStatus) ? "Aktív" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
