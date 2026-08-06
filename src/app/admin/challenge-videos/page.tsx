"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminJson } from "@/lib/admin-fetch";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import type { ChallengeVideo, MuxStatus } from "@/lib/types";

const MUX_LABEL: Record<MuxStatus, string> = {
  none: "Nincs videó",
  uploading: "Feltöltés",
  processing: "Feldolgozás",
  ready: "Kész",
  error: "Hiba",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "Vázlat",
  published: "Publikált",
  soon: "Hamarosan",
  archived: "Archivált",
};

export default function AdminChallengeVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<ChallengeVideo[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");

  const load = () =>
    getDocs(collection(db, "challengeVideos"))
      .then((s) => {
        const list = s.docs.map((d) => ({ code: d.id, ...(d.data() as Omit<ChallengeVideo, "code">) }));
        list.sort((a, b) => a.code.localeCompare(b.code));
        setVideos(list);
      })
      .catch(() => setFailed(true));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!videos) return [];
    const t = q.trim().toLowerCase();
    return t ? videos.filter((v) => `${v.code} ${v.title} ${v.bodyPart}`.toLowerCase().includes(t)) : videos;
  }, [videos, q]);

  async function del(code: string) {
    if (!window.confirm(`Törlöd a(z) "${code}" kihívás-videó adatlapját? (A Mux asset ettől még megmarad.)`)) return;
    try {
      await adminJson(`/api/admin/challenge-videos/${encodeURIComponent(code)}`, { method: "DELETE" });
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "A törlés nem sikerült.");
    }
  }

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">KIHÍVÁSOK</div>
          <h1 className="adm-h1">Kihívás-videók</h1>
          <p className="adm-sub">A Szavazz Magadra napi videók (9:16) — {videos?.length ?? 0} videó. Külön a videótártól; csak kihívásokban jelennek meg.</p>
        </div>
        <div className="adm-actions">
          <Link href="/admin/challenge-videos/new" className="adm-btn primary">
            <LxIcon d={lxPaths.plus} size={16} /> Új kihívás-videó
          </Link>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-searchbox">
          <LxIcon d={lxPaths.search} size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keresés kód, cím, testrész…" />
        </div>
      </div>

      {failed ? (
        <div className="adm-card">Nem sikerült betölteni a videókat.</div>
      ) : !videos ? (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Kód</th>
              <th>Cím</th>
              <th>Testrész</th>
              <th>Szint</th>
              <th>Perc</th>
              <th>Videó</th>
              <th>Állapot</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="adm-empty">
                  {q ? "Nincs találat." : "Még nincs kihívás-videó. Kezdd az „Új kihívás-videó” gombbal."}
                </td>
              </tr>
            )}
            {filtered.map((v) => (
              <tr key={v.code} className="row" onClick={() => router.push(`/admin/challenge-videos/${encodeURIComponent(v.code)}`)}>
                <td className="code">{v.code}</td>
                <td>{v.title}</td>
                <td className="muted">{v.bodyPart}</td>
                <td className="muted">{v.level}</td>
                <td className="muted">{v.mins}′</td>
                <td>
                  <span className={`adm-badge ${v.muxStatus}`}>{MUX_LABEL[v.muxStatus] ?? v.muxStatus}</span>
                </td>
                <td>
                  <span className={`adm-badge st-${v.status}`}>{STATUS_LABEL[v.status] ?? v.status}</span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="adm-rowbtns">
                    <Link href={`/admin/challenge-videos/${encodeURIComponent(v.code)}`} className="adm-iconbtn" title="Szerkesztés">
                      <LxIcon d={lxPaths.arrowR} size={15} />
                    </Link>
                    <button className="adm-iconbtn danger" onClick={() => del(v.code)} title="Törlés">✕</button>
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
