"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_CHALLENGE_FILTERS } from "@/lib/filter-defaults";
import { adminJson } from "@/lib/admin-fetch";
import { ChallengeVideoForm } from "@/components/admin/ChallengeVideoForm";
import type { ChallengeVideo } from "@/lib/types";

export default function EditChallengeVideoPage() {
  const params = useParams();
  const code = String(params.code);
  const router = useRouter();
  const [video, setVideo] = useState<ChallengeVideo | null | undefined>(undefined);
  const [bodyParts, setBodyParts] = useState<string[] | null>(null);

  useEffect(() => {
    getDoc(doc(db, "challengeVideos", code))
      .then((s) => setVideo(s.exists() ? ({ code: s.id, ...(s.data() as Omit<ChallengeVideo, "code">) }) : null))
      .catch(() => setVideo(null));
    getDoc(doc(db, "challengeFilters", "theme"))
      .then((s) => setBodyParts(((s.data()?.options as string[]) ?? []).length ? (s.data()?.options as string[]) : DEFAULT_CHALLENGE_FILTERS[0].options))
      .catch(() => setBodyParts(DEFAULT_CHALLENGE_FILTERS[0].options));
  }, [code]);

  async function del() {
    if (!window.confirm(`Törlöd a(z) "${code}" kihívás-videó adatlapját?`)) return;
    try {
      await adminJson(`/api/admin/challenge-videos/${encodeURIComponent(code)}`, { method: "DELETE" });
      router.push("/admin/challenge-videos");
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "A törlés nem sikerült.");
    }
  }

  const loading = video === undefined || bodyParts === null;

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">
            <Link href="/admin/challenge-videos" style={{ color: "var(--ink-3)" }}>Kihívás-videók</Link> · {code}
          </div>
          <h1 className="adm-h1">{video ? video.title : code}</h1>
          <p className="adm-sub">A napi videó adatai és a Mux feltöltés.</p>
        </div>
      </div>

      {loading ? (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      ) : video === null ? (
        <div className="adm-card">
          Ez a videó nem található. <Link href="/admin/challenge-videos" className="linkish">Vissza a listához</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ChallengeVideoForm initial={video} bodyParts={bodyParts!} create={false} />
          <div>
            <button className="adm-btn danger" style={{ color: "var(--accent-2)", borderColor: "oklch(0.85 0.03 168)" }} onClick={del}>
              Kihívás-videó törlése
            </button>
          </div>
        </div>
      )}
    </>
  );
}
