"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminJson } from "@/lib/admin-fetch";
import { VideoUploader } from "@/components/admin/VideoUploader";
import type { ChallengeVideo } from "@/lib/types";
import { clockToSec, secToClock } from "@/lib/time";
import { normalizeExercise } from "@/lib/blocks";

interface ExerciseDraft { name: string; startText: string }
interface BlockDraft { name: string; startText: string; items: ExerciseDraft[] }
interface Draft {
  code: string;
  title: string;
  bodyPart: string;
  level: number;
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

export function ChallengeVideoForm({
  initial,
  bodyParts,
  create,
}: {
  initial: ChallengeVideo | null;
  bodyParts: string[];
  create: boolean;
}) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() => ({
    code: initial?.code ?? "",
    title: initial?.title ?? "",
    bodyPart: initial?.bodyPart ?? bodyParts[0] ?? "",
    level: initial?.level ?? 1,
    mins: initial?.mins ?? 12,
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
  const [codeBound, setCodeBound] = useState(!create);

  const effectiveCode = create ? d.code.trim() : (initial as ChallengeVideo).code;
  const validCode = /^[A-Za-z0-9_-]{2,}$/.test(effectiveCode);
  const codeEditable = create && !codeBound;

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((p) => ({ ...p, [k]: v }));
    setSaved(false);
  }
  const addBlock = () => set("blocks", [...d.blocks, { name: "", startText: "", items: [] }]);
  const setBlock = (i: number, patch: Partial<BlockDraft>) =>
    set("blocks", d.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const removeBlock = (i: number) => set("blocks", d.blocks.filter((_, j) => j !== i));
  const addItem = (bi: number) => setBlock(bi, { items: [...d.blocks[bi].items, { name: "", startText: "" }] });
  const setItem = (bi: number, ii: number, patch: Partial<ExerciseDraft>) =>
    setBlock(bi, { items: d.blocks[bi].items.map((ex, j) => (j === ii ? { ...ex, ...patch } : ex)) });
  const removeItem = (bi: number, ii: number) =>
    setBlock(bi, { items: d.blocks[bi].items.filter((_, j) => j !== ii) });

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

  async function save() {
    if (create && !validCode) {
      setErr("Érvényes kód kell (betűk/számok, pl. SZM24-1).");
      return;
    }
    if (!d.title.trim()) {
      setErr("A cím kötelező.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      if (create && !codeBound) {
        const existing = await getDoc(doc(db, "challengeVideos", effectiveCode));
        if (existing.exists()) {
          setErr(`A(z) "${effectiveCode}" kód már létezik.`);
          setSaving(false);
          return;
        }
      }
      await adminJson(`/api/admin/challenge-videos/${encodeURIComponent(effectiveCode)}`, {
        method: "PUT",
        body: JSON.stringify({
          create: create && !codeBound,
          title: d.title,
          bodyPart: d.bodyPart,
          level: d.level,
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
            <input type="text" value={d.code} disabled={!codeEditable} onChange={(e) => set("code", e.target.value)} placeholder="SZM24-1" />
            <span className="adm-fhint">
              {codeEditable ? "A videó azonosítója. A feltöltéshez add meg először." : "A kód a dokumentum azonosítója — rögzítve."}
            </span>
          </div>
          <div className="adm-frow">
            <label className="adm-flabel">Testrész</label>
            <select value={d.bodyPart} onChange={(e) => set("bodyPart", e.target.value)}>
              {bodyParts.length === 0 && <option value="">—</option>}
              {bodyParts.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Video upload — writes to challengeVideos/ via the challenge Mux pipeline. */}
        {create && !validCode ? (
          <div className="adm-upload">
            <div className="adm-upload-hd">Videó (9:16)</div>
            <div className="adm-upload-sub">Adj meg egy érvényes kódot fent — utána itt feltöltheted a függőleges videót a Muxba.</div>
          </div>
        ) : (
          <VideoUploader
            code={effectiveCode}
            initialStatus={initial?.muxStatus ?? "none"}
            initialPlaybackId={initial?.muxPlaybackId ?? null}
            onBound={() => setCodeBound(true)}
            uploadPath="/api/mux/challenge/upload"
            finalizePath="/api/mux/challenge/finalize"
          />
        )}

        <div className="adm-frow">
          <label className="adm-flabel">
            Cím <span className="req">*</span>
          </label>
          <input type="text" value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="1. nap · Alapozás" />
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
            A nap felépítése. Add meg minden blokk <b>kezdési idejét</b> (perc:mp) — a hossz a következő blokkig
            számolódik. Gyakorlatokhoz is megadható időbélyeg (a lejátszóban ráugorhatóvá válik).
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
                  {b.items.map((ex, ii) => (
                    <div className="adm-exrow" key={ii}>
                      <input type="text" className="mins" value={ex.startText} onChange={(e) => setItem(i, ii, { startText: e.target.value })} placeholder="—:—" title="Gyakorlat kezdése (opcionális)" />
                      <input type="text" value={ex.name} onChange={(e) => setItem(i, ii, { name: e.target.value })} placeholder="Gyakorlat neve" />
                      <button className="adm-iconbtn danger" onClick={() => removeItem(i, ii)} title="Gyakorlat törlése">✕</button>
                    </div>
                  ))}
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
