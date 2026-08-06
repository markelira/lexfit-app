"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { adminJson } from "@/lib/admin-fetch";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

/** A video as shown in the session picker (a link target from the library). */
export interface PickVideo {
  code: string;
  title: string;
  theme: string;
  muxStatus: string;
}

/** Ordered-video builder is shared by Programok (sessions) and Kihívások (days) —
 *  both are "link existing videos + drag to order", differing only in endpoint,
 *  the source video pool, and copy. Only `videoCode` is read from initial items. */
interface OrderedItem {
  videoCode: string;
}

interface Row {
  uid: string;
  videoCode: string;
}

let counter = 0;
const newUid = () => `s${++counter}-${Math.random().toString(36).slice(2, 8)}`;

export function SessionsBuilder({
  slug,
  initialSessions,
  videos,
  endpoint,
  title = "Lejátszási lista",
  hint = "Kapcsolj be videókat a videótárból, és húzd a ⠿ fogantyúval a kívánt sorrendbe — mint egy lejátszási lista. A hét/nap-beosztást a program a sorrendből számolja.",
  saveLabel = "Lejátszási lista mentése",
  pickLabel = "Videó bekapcsolása a videótárból",
  pickPlaceholder = "Keresés a videótárban (kód, cím, téma)…",
}: {
  slug: string;
  initialSessions: OrderedItem[];
  videos: PickVideo[];
  /** POST target (full-replace). Defaults to the program sessions endpoint. */
  endpoint?: string;
  title?: string;
  hint?: string;
  saveLabel?: string;
  pickLabel?: string;
  pickPlaceholder?: string;
}) {
  const saveUrl = endpoint ?? `/api/admin/programs/${encodeURIComponent(slug)}/sessions`;
  const [rows, setRows] = useState<Row[]>(() => initialSessions.map((s) => ({ uid: newUid(), videoCode: s.videoCode })));
  const [pickQ, setPickQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const videoByCode = useMemo(() => Object.fromEntries(videos.map((v) => [v.code, v])) as Record<string, PickVideo>, [videos]);
  const dirtyReset = () => setSaved(false);

  const linkedCodes = useMemo(() => new Set(rows.map((r) => r.videoCode)), [rows]);
  const pickList = useMemo(() => {
    const t = pickQ.trim().toLowerCase();
    return videos.filter(
      (v) => !linkedCodes.has(v.code) && (!t || `${v.code} ${v.title} ${v.theme}`.toLowerCase().includes(t)),
    );
  }, [videos, pickQ, linkedCodes]);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setRows((rs) => arrayMove(rs, rs.findIndex((r) => r.uid === active.id), rs.findIndex((r) => r.uid === over.id)));
    dirtyReset();
  }
  const remove = (uid: string) => {
    setRows((rs) => rs.filter((r) => r.uid !== uid));
    dirtyReset();
  };
  const linkVideo = (code: string) => {
    setRows((rs) => [...rs, { uid: newUid(), videoCode: code }]);
    dirtyReset();
  };

  async function save() {
    setSaving(true);
    setErr("");
    try {
      await adminJson(saveUrl, {
        method: "PUT",
        body: JSON.stringify({ sessions: rows.map((r) => ({ videoCode: r.videoCode })) }),
      });
      setSaved(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Mentési hiba.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="adm-card">
      <div className="adm-fil-hd">
        <h3>{title}</h3>
        <span className="cnt">{rows.length} videó</span>
      </div>
      <div className="adm-fhint" style={{ marginBottom: 12 }}>{hint}</div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rows.map((r) => r.uid)} strategy={verticalListSortingStrategy}>
          <div className="adm-sess-list">
            {rows.map((r, i) => (
              <SortableSession key={r.uid} row={r} index={i} vid={videoByCode[r.videoCode]} onRemove={remove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {rows.length === 0 && <div className="adm-empty">Még nincs videó a listában. Kapcsolj be egyet lentről.</div>}

      {/* Link an existing library video */}
      <div style={{ marginTop: 18 }}>
        <label className="adm-flabel" style={{ display: "block", marginBottom: 8 }}>{pickLabel}</label>
        <div className="adm-searchbox" style={{ maxWidth: "none", marginBottom: 8 }}>
          <LxIcon d={lxPaths.search} size={15} />
          <input value={pickQ} onChange={(e) => setPickQ(e.target.value)} placeholder={pickPlaceholder} />
        </div>
        <div className="adm-vpick">
          {videos.length === 0 ? (
            <div className="adm-empty">Még nincs feltöltött videó. Előbb tölts fel a Videók menüben.</div>
          ) : pickList.length === 0 ? (
            <div className="adm-empty">{pickQ ? "Nincs találat." : "Minden videó bekerült a listába."}</div>
          ) : (
            pickList.map((v) => (
              <div className="adm-vpick-row" key={v.code}>
                <span className={`dot ${v.muxStatus === "ready" ? "ready" : "pending"}`} title={v.muxStatus === "ready" ? "Videó csatolva" : "Nincs kész videó"}>●</span>
                <span className="c">{v.code}</span>
                <span className="t">{v.title}</span>
                <span className="th">{v.theme}</span>
                <button className="adm-btn" onClick={() => linkVideo(v.code)}>+ Bekapcsolás</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="adm-savebar">
        <button className="adm-btn primary" onClick={save} disabled={saving}>
          {saving ? "Mentés…" : saveLabel}
        </button>
        {saved && <span className="status saved">Mentve ✓</span>}
        {err && <span className="status error">{err}</span>}
      </div>
    </div>
  );
}

function SortableSession({
  row,
  index,
  vid,
  onRemove,
}: {
  row: Row;
  index: number;
  vid: PickVideo | undefined;
  onRemove: (uid: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.uid });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div className="adm-vpick-row sortable" ref={setNodeRef} style={style}>
      <span className="adm-sess-handle" {...attributes} {...listeners} title="Húzd a rendezéshez">⠿</span>
      <span className="adm-sess-ord">{index + 1}.</span>
      <span className={`dot ${vid?.muxStatus === "ready" ? "ready" : "pending"}`} title={vid?.muxStatus === "ready" ? "Videó csatolva" : "Nincs kész videó"}>●</span>
      <span className="c">{row.videoCode}</span>
      <span className="t">{vid?.title ?? <span className="miss">⚠ ismeretlen videó</span>}</span>
      {vid?.theme && <span className="th">{vid.theme}</span>}
      <button className="adm-iconbtn danger" onClick={() => onRemove(row.uid)} title="Eltávolítás">✕</button>
    </div>
  );
}
