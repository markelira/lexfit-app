"use client";

import Link from "next/link";
import { ProgramForm } from "@/components/admin/ProgramForm";

export default function NewProgramPage() {
  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">
            <Link href="/admin/programs" style={{ color: "var(--ink-3)" }}>Programok</Link> · ÚJ
          </div>
          <h1 className="adm-h1">Új program</h1>
          <p className="adm-sub">Add meg a program adatait. A session-öket (lejátszási lista) a létrehozás után állítod össze.</p>
        </div>
      </div>
      <ProgramForm initial={null} create />
    </>
  );
}
