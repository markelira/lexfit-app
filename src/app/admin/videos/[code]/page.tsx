"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminJson } from "@/lib/admin-fetch";
import { loadFilterOptions, type FilterOptions } from "@/lib/admin-filters";
import { VideoForm } from "@/components/admin/VideoForm";
import type { Video } from "@/lib/types";

export default function EditVideoPage() {
  const params = useParams();
  const code = String(params.code);
  const router = useRouter();
  const [video, setVideo] = useState<Video | null | undefined>(undefined);
  const [filters, setFilters] = useState<FilterOptions | null>(null);

  useEffect(() => {
    getDoc(doc(db, "videos", code))
      .then((s) => setVideo(s.exists() ? ({ code: s.id, ...(s.data() as Omit<Video, "code">) }) : null))
      .catch(() => setVideo(null));
    loadFilterOptions().then(setFilters).catch(() => setFilters({}));
  }, [code]);

  async function del() {
    if (!window.confirm(`Törlöd a(z) "${code}" videó adatlapját?`)) return;
    try {
      await adminJson(`/api/admin/videos/${encodeURIComponent(code)}`, { method: "DELETE" });
      router.push("/admin/videos");
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "A törlés nem sikerült.");
    }
  }

  const loading = video === undefined || !filters;

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">
            <Link href="/admin/videos" style={{ color: "var(--ink-3)" }}>Videók</Link> · {code}
          </div>
          <h1 className="adm-h1">{video ? video.title : code}</h1>
          <p className="adm-sub">A videó adatai és a Mux feltöltés.</p>
        </div>
      </div>

      {loading ? (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      ) : video === null ? (
        <div className="adm-card">
          Ez a videó nem található. <Link href="/admin/videos" className="linkish">Vissza a listához</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <VideoForm initial={video} filters={filters!} create={false} />
          <div>
            <button className="adm-btn danger" style={{ color: "var(--accent-2)", borderColor: "oklch(0.85 0.08 0)" }} onClick={del}>
              Videó törlése
            </button>
          </div>
        </div>
      )}
    </>
  );
}
