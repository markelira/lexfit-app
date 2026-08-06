"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminFetch } from "@/lib/admin-fetch";
import { ChallengeForm } from "@/components/admin/ChallengeForm";
import { SessionsBuilder, type PickVideo } from "@/components/admin/SessionsBuilder";
import type { Challenge, ChallengeDay } from "@/lib/types";

interface Loaded {
  challenge: Challenge | null;
  days: ChallengeDay[];
  videos: PickVideo[];
  bodyParts: string[];
}

export default function EditChallengePage() {
  const params = useParams();
  const slug = String(params.slug);
  const router = useRouter();
  const [data, setData] = useState<Loaded | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [cSnap, dSnap, vSnap, tSnap] = await Promise.all([
        getDoc(doc(db, "challenges", slug)),
        getDocs(query(collection(db, "challenges", slug, "days"), orderBy("order"))),
        getDocs(collection(db, "challengeVideos")),
        getDoc(doc(db, "challengeFilters", "theme")),
      ]);
      if (!active) return;
      const challenge = cSnap.exists() ? ({ slug: cSnap.id, ...(cSnap.data() as Omit<Challenge, "slug">) }) : null;
      const days = dSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChallengeDay, "id">) }));
      const videos: PickVideo[] = vSnap.docs
        .map((d) => ({
          code: d.id,
          title: (d.data().title as string) ?? d.id,
          theme: (d.data().bodyPart as string) ?? "",
          muxStatus: (d.data().muxStatus as string) ?? "none",
        }))
        .sort((a, b) => a.code.localeCompare(b.code));
      const bodyParts = (tSnap.data()?.options as string[]) ?? [];
      setData({ challenge, days, videos, bodyParts });
    })().catch(() => {
      if (active) setData({ challenge: null, days: [], videos: [], bodyParts: [] });
    });
    return () => {
      active = false;
    };
  }, [slug]);

  async function del() {
    if (!window.confirm(`Törlöd a(z) "${slug}" kihívást és az összes napját?`)) return;
    await adminFetch(`/api/admin/challenges/${encodeURIComponent(slug)}`, { method: "DELETE" });
    router.push("/admin/challenges");
  }

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">
            <Link href="/admin/challenges" style={{ color: "var(--ink-3)" }}>Kihívások</Link> · {slug}
          </div>
          <h1 className="adm-h1">{data?.challenge ? data.challenge.title : slug}</h1>
          <p className="adm-sub">Kihívás-adatok és a napok lejátszási listája.</p>
        </div>
      </div>

      {!data ? (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      ) : !data.challenge ? (
        <div className="adm-card">
          Ez a kihívás nem található. <Link href="/admin/challenges" className="linkish">Vissza a listához</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ChallengeForm initial={data.challenge} bodyParts={data.bodyParts} create={false} />
          <SessionsBuilder
            slug={slug}
            initialSessions={data.days}
            videos={data.videos}
            endpoint={`/api/admin/challenges/${encodeURIComponent(slug)}/days`}
            title="Napok (lejátszási lista)"
            hint="Kapcsold be a kihívás napi videóit, és húzd a ⠿ fogantyúval sorrendbe. A kihívás hossza (hány nap) a lista hosszából adódik."
            saveLabel="Napok mentése"
            pickLabel="Nap hozzáadása a kihívás-videókból"
            pickPlaceholder="Keresés a kihívás-videók között (kód, cím, testrész)…"
          />
          <div>
            <button className="adm-btn danger" style={{ color: "var(--accent-2)", borderColor: "oklch(0.85 0.03 168)" }} onClick={del}>
              Kihívás törlése
            </button>
          </div>
        </div>
      )}
    </>
  );
}
