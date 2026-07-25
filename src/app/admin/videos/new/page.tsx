"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VideoForm } from "@/components/admin/VideoForm";
import { loadFilterOptions, type FilterOptions } from "@/lib/admin-filters";

export default function NewVideoPage() {
  const [filters, setFilters] = useState<FilterOptions | null>(null);

  useEffect(() => {
    loadFilterOptions().then(setFilters).catch(() => setFilters({}));
  }, []);

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">
            <Link href="/admin/videos" style={{ color: "var(--ink-3)" }}>Videók</Link> · ÚJ
          </div>
          <h1 className="adm-h1">Új videó</h1>
          <p className="adm-sub">
            Add meg a kódot, töltsd fel a videót és állítsd be az adatokat — bármilyen sorrendben. A videó a Muxba
            tölt fel, az appban aláírt lejátszással jelenik meg.
          </p>
        </div>
      </div>
      {filters ? (
        <VideoForm initial={null} filters={filters} create />
      ) : (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      )}
    </>
  );
}
