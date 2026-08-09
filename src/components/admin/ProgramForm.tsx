"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminJson } from "@/lib/admin-fetch";
import type { Program, ProgramFact, ProgramPhase } from "@/lib/types";

type PhaseDraft = Omit<ProgramPhase, "idx">;
interface Draft {
  slug: string;
  title: string;
  hu: string;
  category: string;
  eyebrow: string;
  level: string;
  goal: string;
  equipment: string;
  synopsis: string;
  defaultMins: string;
  access: string;
  status: string;
  order: string;
  cover: string;
  trailerPlaybackId: string;
  facts: ProgramFact[];
  phases: PhaseDraft[];
}

const numStr = (n: number | null | undefined) => (n == null ? "" : String(n));

export function ProgramForm({ initial, create }: { initial: Program | null; create: boolean }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() => ({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    hu: initial?.hu ?? "",
    category: initial?.category ?? "Program",
    eyebrow: initial?.eyebrow ?? "",
    level: initial?.level ?? "",
    goal: initial?.goal ?? "",
    equipment: initial?.equipment ?? "",
    synopsis: initial?.synopsis ?? "",
    defaultMins: numStr(initial?.defaultMins),
    access: initial?.access ?? "members",
    status: initial?.status ?? "draft",
    order: numStr(initial?.order),
    cover: initial?.cover ?? "",
    trailerPlaybackId: initial?.trailerPlaybackId ?? "",
    facts: initial?.facts ?? [],
    phases: initial?.phases?.map(({ icon, name, short, desc, colorVar }) => ({ icon, name, short, desc, colorVar })) ?? [],
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((p) => ({ ...p, [k]: v }));
    setSaved(false);
  }

  // facts
  const addFact = () => set("facts", [...d.facts, { label: "", value: "" }]);
  const setFact = (i: number, patch: Partial<ProgramFact>) => set("facts", d.facts.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const rmFact = (i: number) => set("facts", d.facts.filter((_, j) => j !== i));
  // phases
  const addPhase = () => set("phases", [...d.phases, { icon: "🌱", name: "", short: "", desc: "", colorVar: "var(--cat-mobility)" }]);
  const setPhase = (i: number, patch: Partial<PhaseDraft>) => set("phases", d.phases.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const rmPhase = (i: number) => set("phases", d.phases.filter((_, j) => j !== i));

  async function save() {
    const slug = create ? d.slug.trim() : initial!.slug;
    if (create && !/^[a-z0-9-]{2,}$/.test(slug)) {
      setErr("Érvényes slug kell (kisbetű/szám/kötőjel, pl. foundation).");
      return;
    }
    if (!d.title.trim()) {
      setErr("A cím kötelező.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      if (create) {
        const existing = await getDoc(doc(db, "programs", slug));
        if (existing.exists()) {
          setErr(`A(z) "${slug}" program már létezik.`);
          setSaving(false);
          return;
        }
      }
      await adminJson(`/api/admin/programs/${encodeURIComponent(slug)}`, {
        method: "PUT",
        body: JSON.stringify({ create, ...d, slug: undefined }),
      });
      setSaved(true);
      if (create) router.push(`/admin/programs/${encodeURIComponent(slug)}`);
      else router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Mentési hiba.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="adm-card">
      <div className="adm-form">
        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Slug (azonosító) <span className="req">*</span></label>
            <input type="text" value={d.slug} disabled={!create} onChange={(e) => set("slug", e.target.value)} placeholder="foundation" />
            {!create && <span className="adm-fhint">A slug a dokumentum azonosítója — nem módosítható.</span>}
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Kategória</label>
            <input type="text" value={d.category} onChange={(e) => set("category", e.target.value)} placeholder="Program / Kihívás / Sorozat" />
          </div>
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Cím <span className="req">*</span></label>
            <input type="text" value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="Foundation" />
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Magyar cím (hu)</label>
            <input type="text" value={d.hu} onChange={(e) => set("hu", e.target.value)} placeholder="Az alapozó program" />
          </div>
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Eyebrow</label>
            <input type="text" value={d.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} placeholder="LEXFIT · 8 HETES PROGRAM" />
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Szint (level)</label>
            <input type="text" value={d.level} onChange={(e) => set("level", e.target.value)} placeholder="Kezdő – újrakezdő" />
          </div>
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Cél (goal)</label>
            <input type="text" value={d.goal} onChange={(e) => set("goal", e.target.value)} placeholder="Forma + szokás" />
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Eszköz (equipment)</label>
            <input type="text" value={d.equipment} onChange={(e) => set("equipment", e.target.value)} placeholder="nincs (matrac)" />
          </div>
        </div>

        <div className="adm-frow">
          <label className="adm-flabel">Összefoglaló (synopsis)</label>
          <textarea value={d.synopsis} onChange={(e) => set("synopsis", e.target.value)} />
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Alap hossz (perc)</label>
            <input type="number" value={d.defaultMins} onChange={(e) => set("defaultMins", e.target.value)} placeholder="30" />
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Katalógus sorrend (order)</label>
            <input type="number" value={d.order} onChange={(e) => set("order", e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Hozzáférés</label>
            <select value={d.access} onChange={(e) => set("access", e.target.value)}>
              <option value="members">Tagoknak (előfizetés)</option>
              <option value="free">Ingyenes</option>
            </select>
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Állapot</label>
            <select value={d.status} onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Vázlat</option>
              <option value="published">Publikált</option>
              <option value="soon">Hamarosan</option>
              <option value="archived">Archivált</option>
            </select>
          </div>
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Borító (cover URL)</label>
            <input type="text" value={d.cover} onChange={(e) => set("cover", e.target.value)} placeholder="opcionális" />
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Előzetes Mux playbackId</label>
            <input type="text" value={d.trailerPlaybackId} onChange={(e) => set("trailerPlaybackId", e.target.value)} placeholder="opcionális" />
          </div>
        </div>

        {/* facts */}
        <div className="adm-frow">
          <label className="adm-flabel">Tények (facts)</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {d.facts.map((f, i) => (
              <div className="adm-sub-row" key={i}>
                <input type="text" value={f.label} onChange={(e) => setFact(i, { label: e.target.value })} placeholder="Címke (pl. Időtartam)" />
                <input type="text" value={f.value} onChange={(e) => setFact(i, { value: e.target.value })} placeholder="Érték (pl. 8 hét)" />
                <button className="adm-iconbtn danger" onClick={() => rmFact(i)} title="Törlés">✕</button>
              </div>
            ))}
            <button className="adm-btn" onClick={addFact} style={{ alignSelf: "flex-start" }}>+ Tény</button>
          </div>
        </div>

        {/* phases */}
        <div className="adm-frow">
          <label className="adm-flabel">Fázisok (phases)</label>
          <span className="adm-fhint">A program szakaszai. Az index a sorrendből adódik; a session-ök a fázis-indexre hivatkoznak.</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            {d.phases.map((p, i) => (
              <div className="adm-sub" key={i}>
                <div className="adm-sub-row">
                  <input type="text" style={{ flex: "0 0 60px" }} value={p.icon} onChange={(e) => setPhase(i, { icon: e.target.value })} placeholder="🌱" />
                  <input type="text" value={p.name} onChange={(e) => setPhase(i, { name: e.target.value })} placeholder="Név (Alap)" />
                  <button className="adm-iconbtn danger" onClick={() => rmPhase(i)} title="Fázis törlése">✕</button>
                </div>
                <div className="adm-sub-row">
                  <input type="text" value={p.short} onChange={(e) => setPhase(i, { short: e.target.value })} placeholder="Rövid" />
                  <input type="text" value={p.colorVar} onChange={(e) => setPhase(i, { colorVar: e.target.value })} placeholder="var(--cat-mobility)" />
                </div>
                <input type="text" value={p.desc} onChange={(e) => setPhase(i, { desc: e.target.value })} placeholder="Leírás" />
              </div>
            ))}
            <button className="adm-btn" onClick={addPhase} style={{ alignSelf: "flex-start" }}>+ Fázis</button>
          </div>
        </div>

        <div className="adm-savebar">
          <button className="adm-btn primary" onClick={save} disabled={saving}>
            {saving ? "Mentés…" : create ? "Létrehozás" : "Mentés"}
          </button>
          {saved && <span className="status saved">Mentve ✓</span>}
          {err && <span className="status error">{err}</span>}
        </div>
      </div>
    </div>
  );
}
