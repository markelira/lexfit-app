"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminFetch } from "@/lib/admin-fetch";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import type { Program } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  draft: "Vázlat",
  published: "Publikált",
  soon: "Hamarosan",
  archived: "Archivált",
};

export default function AdminProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");

  const load = () =>
    getDocs(collection(db, "programs"))
      .then((s) => {
        const list = s.docs.map((d) => ({ slug: d.id, ...(d.data() as Omit<Program, "slug">) }));
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setPrograms(list);
      })
      .catch(() => setFailed(true));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!programs) return [];
    const t = q.trim().toLowerCase();
    return t ? programs.filter((p) => `${p.slug} ${p.title}`.toLowerCase().includes(t)) : programs;
  }, [programs, q]);

  async function del(slug: string) {
    if (!window.confirm(`Törlöd a(z) "${slug}" programot és az összes session-jét?`)) return;
    await adminFetch(`/api/admin/programs/${encodeURIComponent(slug)}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">TARTALOM</div>
          <h1 className="adm-h1">Programok</h1>
          <p className="adm-sub">Programok és a heti lejátszási listájuk (session-ök videó-hivatkozásokból).</p>
        </div>
        <div className="adm-actions">
          <Link href="/admin/programs/new" className="adm-btn primary">
            <LxIcon d={lxPaths.plus} size={16} /> Új program
          </Link>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-searchbox">
          <LxIcon d={lxPaths.search} size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keresés slug, cím…" />
        </div>
      </div>

      {failed ? (
        <div className="adm-card">Nem sikerült betölteni a programokat.</div>
      ) : !programs ? (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Cím</th>
              <th>Session</th>
              <th>Sorrend</th>
              <th>Állapot</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="adm-empty">
                  {q ? "Nincs találat." : "Még nincs program. Kezdd az „Új program” gombbal."}
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.slug} className="row" onClick={() => router.push(`/admin/programs/${encodeURIComponent(p.slug)}`)}>
                <td className="code">{p.slug}</td>
                <td>{p.title}</td>
                <td className="muted">{p.totalSessions ?? 0}</td>
                <td className="muted">{p.order ?? 0}</td>
                <td>
                  <span className={`adm-badge st-${p.status}`}>{STATUS_LABEL[p.status] ?? p.status}</span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="adm-rowbtns">
                    <Link href={`/admin/programs/${encodeURIComponent(p.slug)}`} className="adm-iconbtn" title="Szerkesztés">
                      <LxIcon d={lxPaths.arrowR} size={15} />
                    </Link>
                    <button className="adm-iconbtn danger" onClick={() => del(p.slug)} title="Törlés">✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
