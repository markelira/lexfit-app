"use client";

import { useState } from "react";
import { EditorModal } from "@/components/profile/EditorModal";
import { DayPills } from "@/components/profile/DayPills";
import { weekdayNamesHu, type Prefs } from "@/lib/profile";

const TIME_PRESETS = ["06:30", "07:15", "18:00", "20:00"];
const LENGTH_OPTIONS = ["15–20 perc", "20–30 perc", "30–45 perc"];
const EQUIPMENT_OPTIONS = ["Szőnyeg", "Súlyzó", "Ellenállás gumi", "Szék / fal"];

// The prefs editors (explicit save). Each manages a pending value; Mentés persists
// via the writer, disabled until dirty. Reminder-day edits never touch the plan.
export function PrefsEditor({
  editorKey, prefs, onClose, writeTime, writePlan, writeLength, writeEquipment,
}: {
  editorKey: string;
  prefs: Prefs;
  onClose: () => void;
  writeTime: (t: string) => void;
  writePlan: (days: number, weekdays: number[]) => void;
  writeLength: (v: string) => void;
  writeEquipment: (v: string[]) => void;
}) {
  if (editorKey === "reminderTime") {
    return <TimeEditor value={prefs.reminders.workout.time} onClose={onClose} onSave={writeTime} />;
  }
  if (editorKey === "days") {
    return <PlanEditor weekdays={prefs.plan.weekdays} onClose={onClose} onSave={writePlan} />;
  }
  if (editorKey === "length") {
    return <ChoiceEditor title="Szokásos edzéshossz" options={LENGTH_OPTIONS} value={prefs.plan.sessionLength} onClose={onClose} onSave={writeLength} />;
  }
  if (editorKey === "equipment") {
    return <EquipmentEditor value={prefs.plan.equipment} onClose={onClose} onSave={writeEquipment} />;
  }
  return null;
}

function TimeEditor({ value, onClose, onSave }: { value: string; onClose: () => void; onSave: (t: string) => void }) {
  const [t, setT] = useState(value);
  const custom = !TIME_PRESETS.includes(t);
  return (
    <EditorModal open title="Emlékeztető időpontja" dirty={t !== value} onClose={onClose} onSave={() => { onSave(t); onClose(); }}>
      <div className="pf-ed-bigtime">{t}</div>
      <div className="pf-ed-pills">
        {TIME_PRESETS.map((p) => (
          <button key={p} type="button" className={`pf-ed-pill${t === p ? " on" : ""}`} onClick={() => setT(p)}>{p}</button>
        ))}
      </div>
      <label className="pf-ed-field">
        <span>Egyéb időpont</span>
        <input type="time" value={custom ? t : ""} onChange={(e) => setT(e.target.value || value)} />
      </label>
    </EditorModal>
  );
}

function PlanEditor({ weekdays, onClose, onSave }: { weekdays: number[]; onClose: () => void; onSave: (days: number, weekdays: number[]) => void }) {
  const [days, setDays] = useState<number[]>(weekdays);
  const count = days.length;
  const valid = count >= 3 && count <= 6;
  const changed = JSON.stringify(days) !== JSON.stringify(weekdays);
  return (
    <EditorModal
      open title="Heti edzésnapok" dirty={changed && valid}
      onClose={onClose} onSave={() => { onSave(count, [...days].sort((a, b) => a - b)); onClose(); }}
    >
      <p className="pf-editor-note">Válaszd ki, mely napokon edzel. Ez határozza meg, mi kerül a kezdőlapra.</p>
      <DayPills value={days} onChange={setDays} ariaLabel="Heti edzésnapok" />
      <p className="pf-ed-hint">
        {valid ? `Heti ${count} edzés · ${weekdayNamesHu(days)}` : "Válassz 3–6 napot."}
      </p>
    </EditorModal>
  );
}

function ChoiceEditor({ title, options, value, onClose, onSave }: { title: string; options: string[]; value: string; onClose: () => void; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <EditorModal open title={title} dirty={v !== value} onClose={onClose} onSave={() => { onSave(v); onClose(); }}>
      <div className="pf-ed-choices">
        {options.map((o) => (
          <button key={o} type="button" className={`pf-ed-choice${v === o ? " on" : ""}`} onClick={() => setV(o)}>{o}</button>
        ))}
      </div>
    </EditorModal>
  );
}

function EquipmentEditor({ value, onClose, onSave }: { value: string[]; onClose: () => void; onSave: (v: string[]) => void }) {
  const [sel, setSel] = useState<string[]>(value);
  const toggle = (o: string) => setSel((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));
  const changed = JSON.stringify([...sel].sort()) !== JSON.stringify([...value].sort());
  return (
    <EditorModal open title="Van otthon eszközöd?" dirty={changed} onClose={onClose} onSave={() => { onSave(sel); onClose(); }}>
      <div className="pf-ed-choices">
        {EQUIPMENT_OPTIONS.map((o) => (
          <button key={o} type="button" className={`pf-ed-choice${sel.includes(o) ? " on" : ""}`} onClick={() => toggle(o)}>{o}</button>
        ))}
      </div>
    </EditorModal>
  );
}
