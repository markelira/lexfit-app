"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminFetch } from "@/lib/admin-fetch";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import type { Challenge } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  draft: "Vázlat",
  published: "Publikált",
  soon: "Hamarosan",
  archived: "Archivált",
};

export default function AdminChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");

  const load = () =>
    getDocs(collection(db, "challenges"))
      .then((s) => {
        const list = s.docs.map((d) => ({ slug: d.id, ...(d.data() as Omit<Challenge, "slug">) }));
        list.sort((a, b) => (b.sortDate || "").localeCompare(a.sortDate || "") || (a.order ?? 0) - (b.order ?? 0));
        setChallenges(list);
      })
      .catch(() => setFailed(true));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!challenges) return [];
    const t = q.trim().toLowerCase();
    return t ? challenges.filter((c) => `${c.slug} ${c.title} ${c.bodyPart}`.toLowerCase().includes(t)) : challenges;
  }, [challenges, q]);

  async function del(slug: string) {
    if (!window.confirm(`Törlöd a(z) "${slug}" kihívást és az összes napját?`)) return;
    await adminFetch(`/api/admin/challenges/${encodeURIComponent(slug)}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">KIHÍVÁSOK</div>
          <h1 className="adm-h1">Kihívások</h1>
          <p className="adm-sub">A Szavazz Magadra heti kihívások archívuma — mindegyik napi videók lejátszási listája.</p>
        </div>
        <div className="adm-actions">
          <Link href="/admin/challenges/new" className="adm-btn primary">
            <LxIcon d={lxPaths.plus} size={16} /> Új kihívás
          </Link>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-searchbox">
          <LxIcon d={lxPaths.search} size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keresés slug, cím, testrész…" />
        </div>
      </div>

      {failed ? (
        <div className="adm-card">Nem sikerült betölteni a kihívásokat.</div>
      ) : !challenges ? (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Cím</th>
              <th>Hónap</th>
              <th>Napok</th>
              <th>Testrész</th>
              <th>Állapot</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="adm-empty">
                  {q ? "Nincs találat." : "Még nincs kihívás. Kezdd az „Új kihívás” gombbal."}
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.slug} className="row" onClick={() => router.push(`/admin/challenges/${encodeURIComponent(c.slug)}`)}>
                <td className="code">{c.slug}</td>
                <td>{c.title}</td>
                <td className="muted">{c.monthLabel}</td>
                <td className="muted">{c.totalDays ?? 0}</td>
                <td className="muted">{c.bodyPart}</td>
                <td>
                  <span className={`adm-badge st-${c.status}`}>{STATUS_LABEL[c.status] ?? c.status}</span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="adm-rowbtns">
                    <Link href={`/admin/challenges/${encodeURIComponent(c.slug)}`} className="adm-iconbtn" title="Szerkesztés">
                      <LxIcon d={lxPaths.arrowR} size={15} />
                    </Link>
                    <button className="adm-iconbtn danger" onClick={() => del(c.slug)} title="Törlés">✕</button>
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
