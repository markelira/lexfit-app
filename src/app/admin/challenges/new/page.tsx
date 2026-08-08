"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_CHALLENGE_FILTERS } from "@/lib/filter-defaults";
import { ChallengeForm } from "@/components/admin/ChallengeForm";

export default function NewChallengePage() {
  const [bodyParts, setBodyParts] = useState<string[] | null>(null);

  useEffect(() => {
    getDoc(doc(db, "challengeFilters", "theme"))
      .then((s) => setBodyParts(((s.data()?.options as string[]) ?? []).length ? (s.data()?.options as string[]) : DEFAULT_CHALLENGE_FILTERS[0].options))
      .catch(() => setBodyParts(DEFAULT_CHALLENGE_FILTERS[0].options));
  }, []);

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">
            <Link href="/admin/challenges" style={{ color: "var(--ink-3)" }}>Kihívások</Link> · ÚJ
          </div>
          <h1 className="adm-h1">Új kihívás</h1>
          <p className="adm-sub">Add meg a kihívás adatait. A napokat (lejátszási lista) a létrehozás után állítod össze.</p>
        </div>
      </div>
      {bodyParts ? (
        <ChallengeForm initial={null} bodyParts={bodyParts} create />
      ) : (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      )}
    </>
  );
}
