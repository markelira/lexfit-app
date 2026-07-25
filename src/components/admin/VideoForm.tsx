"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminJson } from "@/lib/admin-fetch";
import { VideoUploader } from "@/components/admin/VideoUploader";
import type { FilterOptions } from "@/lib/admin-filters";
import type { Video } from "@/lib/types";
import { clockToSec, secToClock } from "@/lib/time";
import { normalizeExercise } from "@/lib/blocks";

/** Editor-side exercise: start is held as typed "m:ss" text (empty = unstamped). */
interface ExerciseDraft {
  name: string;
  startText: string;
}
/** Editor-side block: start is held as the typed "m:ss" text; converted to seconds on save. */
interface BlockDraft {
  name: string;
  startText: string;
  items: ExerciseDraft[];
}
interface Draft {
  code: string;
  kind: "workout" | "bonus";
  series: string;
  title: string;
  theme: string;
  level: number;
  format: string;
  types: string[];
  mins: number;
  status: string;
  blocks: BlockDraft[];
}

const LEVELS = [
  { v: 1, label: "1 · Kezdő" },
  { v: 2, label: "2 · Közepes" },
  { v: 3, label: "3 · Haladó" },
];
const CONTENT_STATUS = [
  { v: "draft", label: "Vázlat" },
  { v: "published", label: "Publikált" },
  { v: "soon", label: "Hamarosan" },
  { v: "archived", label: "Archivált" },
];

export function VideoForm({
  initial,
  filters,
  create,
}: {
  initial: Video | null;
  filters: FilterOptions;
  create: boolean;
}) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() => ({
    code: initial?.code ?? "",
    kind: initial?.kind ?? "workout",
    series: initial?.series ?? "",
    title: initial?.title ?? "",
    theme: initial?.theme ?? filters.theme?.[0] ?? "",
    level: initial?.level ?? 1,
    format: initial?.format ?? filters.format?.[0] ?? "",
    types: initial?.types ?? [],
    mins: initial?.mins ?? 20,
    status: initial?.status ?? "draft",
    blocks: (initial?.blocks ?? []).map((b) => ({
      name: b.name,
      startText: b.start != null ? secToClock(b.start) : "",
      items: (b.items ?? []).map((it) => {
        const ex = normalizeExercise(it);
        return { name: ex.name, startText: ex.start != null ? secToClock(ex.start) : "" };
      }),
    })),
  }));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  // Once the code is bound (by an upload or a first save) it can't change — the
  // Mux upload and the doc id are tied to it. Existing videos are already bound.
  const [codeBound, setCodeBound] = useState(!create);

  const effectiveCode = create ? d.code.trim() : (initial as Video).code;
  const validCode = /^[A-Za-z0-9_-]{2,}$/.test(effectiveCode);
  const codeEditable = create && !codeBound;

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((p) => ({ ...p, [k]: v }));
    setSaved(false);
  }
  const toggleType = (t: string) =>
    set("types", d.types.includes(t) ? d.types.filter((x) => x !== t) : [...d.types, t]);

  const addBlock = () => set("blocks", [...d.blocks, { name: "", startText: "", items: [] }]);
  const setBlock = (i: number, patch: Partial<BlockDraft>) =>
    set("blocks", d.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const removeBlock = (i: number) => set("blocks", d.blocks.filter((_, j) => j !== i));

  const addItem = (bi: number) =>
    setBlock(bi, { items: [...d.blocks[bi].items, { name: "", startText: "" }] });
  const setItem = (bi: number, ii: number, patch: Partial<ExerciseDraft>) =>
    setBlock(bi, { items: d.blocks[bi].items.map((ex, j) => (j === ii ? { ...ex, ...patch } : ex)) });
  const removeItem = (bi: number, ii: number) =>
    setBlock(bi, { items: d.blocks[bi].items.filter((_, j) => j !== ii) });

  // A block's length = gap to the next start (last block runs to the video's end).
  const muxDuration = initial?.muxDuration ?? null;
  const blockStarts = d.blocks
    .map((b) => clockToSec(b.startText))
    .filter((x): x is number => x != null)
    .sort((a, b) => a - b);
  const durationLabel = (startText: string): string => {
    const s = clockToSec(startText);
    if (s == null) return "—";
    const end = blockStarts.find((x) => x > s) ?? muxDuration;
    return end != null && end > s ? secToClock(end - s) : "—";
  };

  // Soft, non-blocking warning for an exercise time: outside its block's window, or
  // out of ascending order relative to earlier stamped exercises in the same block.
  const exWarn = (bi: number, ii: number): string | null => {
    const ex = clockToSec(d.blocks[bi].items[ii].startText);
    if (ex == null) return null;
    const blockStart = clockToSec(d.blocks[bi].startText);
    if (blockStart != null) {
      if (ex < blockStart) return "a blokk kezdése előtt";
      const nextStart = blockStarts.find((x) => x > blockStart) ?? muxDuration;
      if (nextStart != null && ex >= nextStart) return "átnyúlik a következő blokkba";
    }
    for (let j = 0; j < ii; j++) {
      const prev = clockToSec(d.blocks[bi].items[j].startText);
      if (prev != null && prev > ex) return "korábbi, mint egy fölötte lévő gyakorlat";
    }
    return null;
  };

  async function save() {
    if (create && !validCode) {
      setErr("Érvényes kód kell (betűk/számok, pl. F001).");
      return;
    }
    if (!d.title.trim()) {
      setErr("A cím kötelező.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      // Guard against clobbering an existing code — but only before we've bound it
      // (if an upload already created this doc, codeBound is true and we skip).
      if (create && !codeBound) {
        const existing = await getDoc(doc(db, "videos", effectiveCode));
        if (existing.exists()) {
          setErr(`A(z) "${effectiveCode}" kód már létezik.`);
          setSaving(false);
          return;
        }
      }
      await adminJson(`/api/admin/videos/${encodeURIComponent(effectiveCode)}`, {
        method: "PUT",
        body: JSON.stringify({
          create: create && !codeBound,
          kind: d.kind,
          series: d.series,
          title: d.title,
          theme: d.theme,
          level: d.level,
          format: d.format,
          types: d.types,
          mins: d.mins,
          status: d.status,
          blocks: d.blocks.map((b) => {
            const s = clockToSec(b.startText);
            const items = b.items
              .map((ex) => {
                const es = clockToSec(ex.startText);
                return { name: ex.name.trim(), ...(es != null ? { start: es } : {}) };
              })
              .filter((ex) => ex.name.length > 0);
            return { name: b.name, items, ...(s != null ? { start: s } : {}) };
          }),
        }),
      });
      setSaved(true);
      setCodeBound(true);
      if (!create) router.refresh();
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
            <label className="adm-flabel">
              Kód <span className="req">*</span>
            </label>
            <input
              type="text"
              value={d.code}
              disabled={!codeEditable}
              onChange={(e) => set("code", e.target.value)}
              placeholder="F001"
            />
            <span className="adm-fhint">
              {codeEditable
                ? "A videó azonosítója. A feltöltéshez add meg először."
                : "A kód a dokumentum azonosítója — rögzítve."}
            </span>
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Típus (kind)</label>
            <select value={d.kind} onChange={(e) => set("kind", e.target.value as Draft["kind"])}>
              <option value="workout">Edzés (workout)</option>
              <option value="bonus">Bónusz (bonus)</option>
            </select>
          </div>
        </div>

        {d.kind === "bonus" && (
          <div className="adm-frow">
            <label className="adm-flabel">Sorozat (series)</label>
            <input type="text" value={d.series} onChange={(e) => set("series", e.target.value)} placeholder="has-kihivas" />
          </div>
        )}

        {/* Video upload — on the first screen, right under the code. */}
        {create && !validCode ? (
          <div className="adm-upload">
            <div className="adm-upload-hd">Videó</div>
            <div className="adm-upload-sub">
              Adj meg egy érvényes kódot fent (pl. F001) — utána itt rögtön feltöltheted a videót a Muxba.
            </div>
          </div>
        ) : (
          <VideoUploader
            code={effectiveCode}
            initialStatus={initial?.muxStatus ?? "none"}
            initialPlaybackId={initial?.muxPlaybackId ?? null}
            onBound={() => setCodeBound(true)}
          />
        )}

        <div className="adm-frow">
          <label className="adm-flabel">
            Cím <span className="req">*</span>
          </label>
          <input type="text" value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="Ébresztő-guggoló sorozat" />
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Téma</label>
            <select value={d.theme} onChange={(e) => set("theme", e.target.value)}>
              {(filters.theme ?? []).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Formátum</label>
            <select value={d.format} onChange={(e) => set("format", e.target.value)}>
              {(filters.format ?? []).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="adm-2col">
          <div className="adm-frow">
            <label className="adm-flabel">Nehézség</label>
            <select value={d.level} onChange={(e) => set("level", Number(e.target.value))}>
              {LEVELS.map((l) => (
                <option key={l.v} value={l.v}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Hossz (perc)</label>
            <input type="number" min={0} value={d.mins} onChange={(e) => set("mins", Number(e.target.value))} />
          </div>
        </div>

        <div className="adm-frow">
          <label className="adm-flabel">Típusok</label>
          <div className="adm-checks">
            {(filters.type ?? []).map((t) => (
              <button
                type="button"
                key={t}
                className={`adm-check${d.types.includes(t) ? " on" : ""}`}
                onClick={() => toggleType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="adm-frow">
          <label className="adm-flabel">Állapot</label>
          <select value={d.status} onChange={(e) => set("status", e.target.value)}>
            {CONTENT_STATUS.map((s) => (
              <option key={s.v} value={s.v}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="adm-frow">
          <label className="adm-flabel">Blokkok (opcionális)</label>
          <span className="adm-fhint">
            Az edzés felépítése. Add meg minden blokk <b>kezdési idejét</b> (perc:mp, pl. 2:30) — a hossz automatikusan
            számolódik a következő blokkig{muxDuration ? "" : " (az utolsó blokk hosszához a videó kell)"}. Minden
            gyakorlathoz megadhatsz egy <b>kezdési időt</b> is (opcionális) — akkor a lejátszóban rá lehet ugrani és
            kiemelődik. Időbélyeg nélkül a gyakorlat sima listaelem marad.
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            {d.blocks.map((b, i) => (
              <div className="adm-block" key={i}>
                <div className="adm-block-hd">
                  <input type="text" value={b.name} onChange={(e) => setBlock(i, { name: e.target.value })} placeholder="Blokk neve (pl. Bemelegítés)" />
                  <input type="text" className="mins" value={b.startText} onChange={(e) => setBlock(i, { startText: e.target.value })} placeholder="0:00" title="Kezdés (perc:mp)" />
                  <span className="adm-blockdur" title="Hossz (számított)">{durationLabel(b.startText)}</span>
                  <button className="adm-iconbtn danger" onClick={() => removeBlock(i)} title="Blokk törlése">✕</button>
                </div>
                <div className="adm-exlist">
                  {b.items.map((ex, ii) => {
                    const warn = exWarn(i, ii);
                    return (
                      <div className="adm-exrow" key={ii}>
                        <input
                          type="text"
                          className="mins"
                          value={ex.startText}
                          onChange={(e) => setItem(i, ii, { startText: e.target.value })}
                          placeholder="—:—"
                          title="Gyakorlat kezdése (perc:mp, opcionális)"
                        />
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => setItem(i, ii, { name: e.target.value })}
                          placeholder="Gyakorlat neve (pl. Guggolás)"
                        />
                        {warn && <span className="adm-exwarn" title={`Figyelem: ${warn}`}>⚠</span>}
                        <button className="adm-iconbtn danger" onClick={() => removeItem(i, ii)} title="Gyakorlat törlése">✕</button>
                      </div>
                    );
                  })}
                  <button className="adm-btn ghost sm" onClick={() => addItem(i)} style={{ alignSelf: "flex-start" }}>+ Gyakorlat hozzáadása</button>
                </div>
              </div>
            ))}
            <button className="adm-btn" onClick={addBlock} style={{ alignSelf: "flex-start" }}>+ Blokk hozzáadása</button>
          </div>
        </div>

        <div className="adm-savebar">
          <button className="adm-btn primary" onClick={save} disabled={saving}>
            {saving ? "Mentés…" : create && !codeBound ? "Létrehozás" : "Mentés"}
          </button>
          {saved && <span className="status saved">Mentve ✓</span>}
          {err && <span className="status error">{err}</span>}
        </div>
      </div>
    </div>
  );
}
