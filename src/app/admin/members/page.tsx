"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJson } from "@/lib/admin-fetch";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import type { MemberRow } from "@/app/api/admin/users/route";

export const SUB_LABEL: Record<string, string> = {
  active: "Aktív",
  trialing: "Próba",
  past_due: "Fizetés késik",
  canceled: "Lemondva",
  incomplete: "Függőben",
  none: "Nincs",
};
export const SUB_BADGE: Record<string, string> = {
  active: "st-published",
  trialing: "st-soon",
  past_due: "error",
  canceled: "st-archived",
  incomplete: "st-draft",
  none: "none",
};

const fmtDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso)) : "-";

export default function AdminMembersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<MemberRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    adminJson<{ users: MemberRow[] }>("/api/admin/users")
      .then((d) => setUsers(d.users))
      .catch(() => setFailed(true));
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const t = q.trim().toLowerCase();
    return t ? users.filter((u) => `${u.displayName ?? ""} ${u.email ?? ""}`.toLowerCase().includes(t)) : users;
  }, [users, q]);

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">TAGOK</div>
          <h1 className="adm-h1">Tagok</h1>
          <p className="adm-sub">{users?.length ?? 0} tag - előfizetés és aktivitás áttekintése (csak megtekintés).</p>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-searchbox">
          <LxIcon d={lxPaths.search} size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keresés név, email…" />
        </div>
      </div>

      {failed ? (
        <div className="adm-card">A tagok betöltése nem sikerült.</div>
      ) : !users ? (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Név</th>
              <th>Email</th>
              <th>Csatlakozott</th>
              <th>Előfizetés</th>
              <th>Sorozat</th>
              <th>Kész</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="adm-empty">{q ? "Nincs találat." : "Még nincs regisztrált tag."}</td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.uid} className="row" onClick={() => router.push(`/admin/members/${u.uid}`)}>
                <td>{u.displayName ?? "-"}</td>
                <td className="muted">{u.email ?? "-"}</td>
                <td className="muted">{fmtDate(u.createdAt)}</td>
                <td>
                  <span className={`adm-badge ${SUB_BADGE[u.subscriptionStatus] ?? "none"}`}>
                    {SUB_LABEL[u.subscriptionStatus] ?? u.subscriptionStatus}
                  </span>
                </td>
                <td className="muted">{u.streak}</td>
                <td className="muted">{u.doneCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
