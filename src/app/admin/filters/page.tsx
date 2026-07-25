"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminJson } from "@/lib/admin-fetch";
import type { FilterDimension } from "@/lib/types";

// theme/format/type match videos by string value → adding is safe; phase/level are
// positional and dur is bucket-tied to durBucket() → structural, edit with care.
const STRUCTURAL = new Set(["phase", "level", "dur"]);

export default function AdminFiltersPage() {
  const [dims, setDims] = useState<FilterDimension[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getDocs(collection(db, "filters"))
      .then((snap) => {
        const list = snap.docs.map((d) => ({ key: d.id, ...(d.data() as Omit<FilterDimension, "key">) }));
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setDims(list);
      })
      .catch(() => setFailed(true));
  }, []);

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">TARTALOM</div>
          <h1 className="adm-h1">Szűrők</h1>
          <p className="adm-sub">
            A Videótár szűrő-értékei. Új érték hozzáadása biztonságos; a sorrend-érzékeny dimenziókat óvatosan
            szerkeszd.
          </p>
        </div>
      </div>

      {failed && <div className="adm-card">Nem sikerült betölteni a szűrőket.</div>}
      {!failed && !dims && <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>}

      {dims && (
        <div className="adm-fils">
          {dims.map((d) => (
            <DimensionEditor key={d.key} dim={d} />
          ))}
        </div>
      )}
    </>
  );
}

function DimensionEditor({ dim }: { dim: FilterDimension }) {
  const [options, setOptions] = useState<string[]>(dim.options ?? []);
  const [baseline, setBaseline] = useState<string[]>(dim.options ?? []);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState("");

  const structural = STRUCTURAL.has(dim.key);
  const dirty = useMemo(() => JSON.stringify(options) !== JSON.stringify(baseline), [options, baseline]);

  const rename = (i: number, v: string) => setOptions((o) => o.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => setOptions((o) => o.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) =>
    setOptions((o) => {
      const j = i + dir;
      if (j < 0 || j >= o.length) return o;
      const next = [...o];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const add = () => {
    const v = draft.trim();
    if (!v || options.includes(v)) return;
    setOptions((o) => [...o, v]);
    setDraft("");
  };

  async function save() {
    const clean = [...new Set(options.map((o) => o.trim()).filter(Boolean))];
    if (clean.length === 0) {
      setStatus("error");
      setErr("Legalább egy érték kell.");
      return;
    }
    setStatus("saving");
    setErr("");
    try {
      await adminJson(`/api/admin/filters/${dim.key}`, {
        method: "PUT",
        body: JSON.stringify({ options: clean }),
      });
      setOptions(clean);
      setBaseline(clean);
      setStatus("saved");
    } catch (e) {
      setStatus("error");
      setErr(e instanceof Error ? e.message : "Mentési hiba.");
    }
  }

  return (
    <div className="adm-card">
      <div className="adm-fil-hd">
        <h3>{dim.label}</h3>
        <span className="key">{dim.key}</span>
        <span className="cnt">{options.length} érték</span>
      </div>

      {dim.key === "dur" ? (
        <div className="adm-warn">
          ⚠️ Az időtartam-sávok az app logikájához (durBucket) kötöttek — átnevezésük elrontja a szűrést. Csak
          fejlesztői egyeztetéssel módosítsd.
        </div>
      ) : structural ? (
        <div className="adm-warn">
          ⚠️ Sorrend-érzékeny: a videók pozíció szerint hivatkoznak erre a dimenzióra. Az átrendezés vagy törlés
          megváltoztatja a meglévő videók jelentését.
        </div>
      ) : (
        <div className="adm-warn info">
          Az értékek szöveg szerint illeszkednek a videókhoz. Új érték hozzáadása biztonságos; az átnevezés/törlés nem
          írja át a már feltöltött videókat.
        </div>
      )}

      <div className="adm-opts">
        {options.map((opt, i) => (
          <div className="adm-opt" key={i}>
            <button className="adm-iconbtn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Fel" title="Fel">↑</button>
            <button className="adm-iconbtn" onClick={() => move(i, 1)} disabled={i === options.length - 1} aria-label="Le" title="Le">↓</button>
            <input value={opt} onChange={(e) => rename(i, e.target.value)} />
            <button className="adm-iconbtn danger" onClick={() => remove(i)} aria-label="Törlés" title="Törlés">✕</button>
          </div>
        ))}
      </div>

      <div className="adm-addrow">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Új érték hozzáadása…"
        />
        <button className="adm-btn" onClick={add} disabled={!draft.trim()}>Hozzáad</button>
      </div>

      <div className="adm-savebar">
        <button className="adm-btn primary" onClick={save} disabled={!dirty || status === "saving"}>
          {status === "saving" ? "Mentés…" : "Mentés"}
        </button>
        {status === "saved" && !dirty && <span className="status saved">Mentve ✓</span>}
        {status === "error" && <span className="status error">{err}</span>}
        {dirty && status !== "saving" && <span className="status idle">Nem mentett módosítás</span>}
      </div>
    </div>
  );
}
