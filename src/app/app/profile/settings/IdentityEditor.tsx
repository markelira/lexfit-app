"use client";

import { useRef, useState } from "react";
import { EditorModal } from "@/components/profile/EditorModal";
import { auth } from "@/lib/firebase";
import {
  NEED_PASSWORD, changeEmail, changePassword, removeAvatar, updateDisplayName, uploadAvatar,
} from "@/lib/account";

const GENERIC_ERR = "Nem sikerült mentenünk. Próbáld újra.";

// The identity/auth/storage editors (30 §P5.2–P5.5). onSaved re-reads Auth + the
// profile so the top bar and screen reflect the change without a reload.
export function IdentityEditor({
  editorKey, provider, onClose, onSaved,
}: {
  editorKey: string;
  provider: string | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  if (editorKey === "name") return <NameEditor onClose={onClose} onSaved={onSaved} />;
  if (editorKey === "email") return <EmailEditor provider={provider} onClose={onClose} />;
  if (editorKey === "password") return <PasswordEditor onClose={onClose} />;
  if (editorKey === "photo") return <PhotoEditor onClose={onClose} onSaved={onSaved} />;
  return null;
}

function NameEditor({ onClose, onSaved }: { onClose: () => void; onSaved: () => Promise<void> | void }) {
  const orig = auth.currentUser?.displayName ?? "";
  const [name, setName] = useState(orig);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = async () => {
    setSaving(true); setErr(null);
    try { await updateDisplayName(name.trim()); await onSaved(); onClose(); }
    catch { setErr(GENERIC_ERR); setSaving(false); }
  };
  return (
    <EditorModal open title="Név" dirty={!!name.trim() && name.trim() !== orig} saving={saving} onClose={onClose} onSave={save}>
      <label className="pf-ed-field2"><span>Név</span>
        <input autoFocus value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
      </label>
      {err && <p className="pf-ed-err">{err}</p>}
    </EditorModal>
  );
}

function EmailEditor({ provider, onClose }: { provider: string | null; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [needPw, setNeedPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      await changeEmail(email.trim(), pw || undefined);
      setSent(true);
    } catch (e) {
      if ((e as Error).message === NEED_PASSWORD) { setNeedPw(true); setErr("A biztonság kedvéért írd be újra a jelszavadat."); }
      else if ((e as { code?: string }).code === "auth/email-already-in-use") setErr("Ez az e-mail cím már foglalt.");
      else setErr(GENERIC_ERR);
      setSaving(false);
    }
  };

  return (
    <EditorModal open title="E-mail" dirty={valid && !sent} saving={saving} saveLabel="Küldés" onClose={onClose} onSave={save}>
      {sent ? (
        <p className="pf-editor-note">Küldtünk egy megerősítő levelet a(z) <b>{email}</b> címre. Amíg nem kattintasz rá, a régi cím marad érvényes.</p>
      ) : (
        <>
          <label className="pf-ed-field2"><span>Új e-mail cím</span>
            <input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pl. neved@example.hu" />
          </label>
          {(needPw || provider === "password") && (
            <label className="pf-ed-field2"><span>Jelenlegi jelszó</span>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </label>
          )}
          {err && <p className="pf-ed-err">{err}</p>}
        </>
      )}
    </EditorModal>
  );
}

function PasswordEditor({ onClose }: { onClose: () => void }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const valid = cur.length > 0 && next.length >= 6;
  const save = async () => {
    setSaving(true); setErr(null);
    try { await changePassword(cur, next); onClose(); }
    catch (e) {
      if ((e as { code?: string }).code === "auth/wrong-password") setErr("A jelenlegi jelszó nem stimmel.");
      else setErr(GENERIC_ERR);
      setSaving(false);
    }
  };
  return (
    <EditorModal open title="Jelszó" dirty={valid} saving={saving} onClose={onClose} onSave={save}>
      <label className="pf-ed-field2"><span>Jelenlegi jelszó</span>
        <input autoFocus type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
      </label>
      <label className="pf-ed-field2"><span>Új jelszó</span>
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="legalább 6 karakter" />
      </label>
      {err && <p className="pf-ed-err">{err}</p>}
    </EditorModal>
  );
}

function PhotoEditor({ onClose, onSaved }: { onClose: () => void; onSaved: () => Promise<void> | void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const hasPhoto = !!auth.currentUser?.photoURL;

  const pick = () => fileRef.current?.click();
  const onFile = async (file: File) => {
    setBusy(true); setErr(null);
    try { await uploadAvatar(file); await onSaved(); onClose(); }
    catch { setErr(GENERIC_ERR); setBusy(false); }
  };
  const remove = async () => {
    setBusy(true); setErr(null);
    try { await removeAvatar(); await onSaved(); onClose(); }
    catch { setErr(GENERIC_ERR); setBusy(false); }
  };

  return (
    <EditorModal open title="Profilkép" dirty={false} saving={busy} onClose={onClose} onSave={onClose} saveLabel="Kész">
      <input ref={fileRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      <p className="pf-editor-note">A kép 512px-re kicsinyítve, csak neked látható helyre kerül.</p>
      <div className="pf-photo-actions">
        <button type="button" className="lxbtn m primary" disabled={busy} onClick={pick}>Kép kiválasztása</button>
        {hasPhoto && <button type="button" className="lxbtn m secondary" disabled={busy} onClick={remove}>Kép törlése</button>}
      </div>
      {err && <p className="pf-ed-err">{err}</p>}
    </EditorModal>
  );
}
