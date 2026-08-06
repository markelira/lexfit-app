"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChallengeVideoForm } from "@/components/admin/ChallengeVideoForm";

export default function NewChallengeVideoPage() {
  const [bodyParts, setBodyParts] = useState<string[] | null>(null);

  useEffect(() => {
    getDoc(doc(db, "challengeFilters", "theme"))
      .then((s) => setBodyParts((s.data()?.options as string[]) ?? []))
      .catch(() => setBodyParts([]));
  }, []);

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">
            <Link href="/admin/challenge-videos" style={{ color: "var(--ink-3)" }}>Kihívás-videók</Link> · ÚJ
          </div>
          <h1 className="adm-h1">Új kihívás-videó</h1>
          <p className="adm-sub">Add meg a kódot, töltsd fel a függőleges (9:16) videót és állítsd be az adatokat. A Muxba tölt fel, aláírt lejátszással.</p>
        </div>
      </div>
      {bodyParts ? (
        <ChallengeVideoForm initial={null} bodyParts={bodyParts} create />
      ) : (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      )}
    </>
  );
}
