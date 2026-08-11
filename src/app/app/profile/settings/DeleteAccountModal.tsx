"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditorModal } from "@/components/profile/EditorModal";
import { useAuth } from "@/lib/auth-context";
import { NEED_PASSWORD, reauthenticate, requestAccountDeletion } from "@/lib/account";

// P6.2 - the deletion flow (30 §30.7 copy). Typed TÖRLÉS confirm; re-auths if the
// login isn't fresh; on success signs out and returns to /login.
export function DeleteAccountModal({ provider, onClose }: { provider: string | null; onClose: () => void }) {
  const router = useRouter();
  const { signOutUser } = useAuth();
  const [confirm, setConfirm] = useState("");
  const [pw, setPw] = useState("");
  const [needPw, setNeedPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const valid = confirm === "TÖRLÉS" && (!needPw || pw.length > 0);

  const doDelete = async () => {
    setBusy(true); setErr(null);
    try {
      let r = await requestAccountDeletion();
      if (r === "reauth") {
        try {
          await reauthenticate(needPw ? pw : undefined);
        } catch (e) {
          if ((e as Error).message === NEED_PASSWORD) {
            setNeedPw(true);
            setErr("A biztonság kedvéért írd be újra a jelszavadat.");
            setBusy(false);
            return;
          }
          throw e;
        }
        r = await requestAccountDeletion();
      }
      if (r === "ok") { await signOutUser(); router.push("/login"); }
    } catch {
      setErr("Nem sikerült törölni. Próbáld újra.");
      setBusy(false);
    }
  };

  return (
    <EditorModal
      open title="Fiók törlése" dirty={valid} saving={busy}
      saveLabel="Végleges törlés" onClose={onClose} onSave={doDelete}
    >
      <p className="pf-editor-note">
        Ezzel az edzéseid, a sorozatod és a fotóid is törlődnek. 30 napig visszavonható - írj Alexának.
      </p>
      <label className="pf-ed-field2"><span>Írd be: TÖRLÉS</span>
        <input autoFocus value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="TÖRLÉS" />
      </label>
      {(needPw || provider === "password") && (
        <label className="pf-ed-field2"><span>Jelenlegi jelszó</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </label>
      )}
      {err && <p className="pf-ed-err">{err}</p>}
    </EditorModal>
  );
}
