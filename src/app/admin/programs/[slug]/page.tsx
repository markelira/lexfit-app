"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminFetch } from "@/lib/admin-fetch";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { SessionsBuilder, type PickVideo } from "@/components/admin/SessionsBuilder";
import type { Program, ProgramSession } from "@/lib/types";

interface Loaded {
  program: Program | null;
  sessions: ProgramSession[];
  videos: PickVideo[];
}

export default function EditProgramPage() {
  const params = useParams();
  const slug = String(params.slug);
  const router = useRouter();
  const [data, setData] = useState<Loaded | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [pSnap, sSnap, vSnap] = await Promise.all([
        getDoc(doc(db, "programs", slug)),
        getDocs(query(collection(db, "programs", slug, "sessions"), orderBy("order"))),
        getDocs(collection(db, "videos")),
      ]);
      if (!active) return;
      const program = pSnap.exists() ? ({ slug: pSnap.id, ...(pSnap.data() as Omit<Program, "slug">) }) : null;
      const sessions = sSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProgramSession, "id">) }));
      const videos: PickVideo[] = vSnap.docs
        .map((d) => ({
          code: d.id,
          title: (d.data().title as string) ?? d.id,
          theme: (d.data().theme as string) ?? "",
          muxStatus: (d.data().muxStatus as string) ?? "none",
        }))
        .sort((a, b) => a.code.localeCompare(b.code));
      setData({ program, sessions, videos });
    })().catch(() => {
      if (active) setData({ program: null, sessions: [], videos: [] });
    });
    return () => {
      active = false;
    };
  }, [slug]);

  async function del() {
    if (!window.confirm(`Törlöd a(z) "${slug}" programot és az összes session-jét?`)) return;
    await adminFetch(`/api/admin/programs/${encodeURIComponent(slug)}`, { method: "DELETE" });
    router.push("/admin/programs");
  }

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">
            <Link href="/admin/programs" style={{ color: "var(--ink-3)" }}>Programok</Link> · {slug}
          </div>
          <h1 className="adm-h1">{data?.program ? data.program.title : slug}</h1>
          <p className="adm-sub">Program-adatok és a heti lejátszási lista.</p>
        </div>
      </div>

      {!data ? (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      ) : !data.program ? (
        <div className="adm-card">
          Ez a program nem található. <Link href="/admin/programs" className="linkish">Vissza a listához</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ProgramForm initial={data.program} create={false} />
          <SessionsBuilder slug={slug} initialSessions={data.sessions} videos={data.videos} />
          <div>
            <button className="adm-btn danger" style={{ color: "var(--accent-2)", borderColor: "oklch(0.85 0.08 0)" }} onClick={del}>
              Program törlése
            </button>
          </div>
        </div>
      )}
    </>
  );
}
