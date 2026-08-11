"use client";

import {
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "@/lib/firebase";

// Identity/account mutations (30 §P5.2–P5.5). Auth AND the users/{uid} mirror are
// written together so the read model (loadProfile reads users/{uid} first) stays
// consistent. `NEED_PASSWORD` signals the caller to collect the current password.
export const NEED_PASSWORD = "need-password";

function requireUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("no-user");
  return user;
}

/** P5.2 - display name to Auth + users/{uid} in one action. */
export async function updateDisplayName(name: string): Promise<void> {
  const user = requireUser();
  await updateProfile(user, { displayName: name });
  await setDoc(doc(db, "users", user.uid), { displayName: name }, { merge: true });
}

/** P5.3 - verify-first email change; re-auths on requires-recent-login. Never
 *  updateEmail directly. For password accounts the current password is needed. */
export async function changeEmail(newEmail: string, currentPassword?: string): Promise<void> {
  const user = requireUser();
  try {
    await verifyBeforeUpdateEmail(user, newEmail);
  } catch (e) {
    if ((e as { code?: string }).code !== "auth/requires-recent-login") throw e;
    const provider = user.providerData[0]?.providerId;
    if (provider === "google.com") {
      await reauthenticateWithPopup(user, new GoogleAuthProvider());
    } else {
      if (!currentPassword) throw new Error(NEED_PASSWORD);
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email ?? newEmail, currentPassword));
    }
    await verifyBeforeUpdateEmail(user, newEmail);
  }
}

/** P5.4 - password change with re-auth (password accounts only). */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = requireUser();
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email ?? "", currentPassword));
  await updatePassword(user, newPassword);
}

/** Downscale to a 512px-max square-ish JPEG on the client before upload (P5.5). */
function resize512(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const max = 512;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no-canvas"));
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob-failed"))), "image/jpeg", 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image-load-failed")); };
    img.src = url;
  });
}

const avatarPath = (uid: string) => `users/${uid}/avatar.jpg`;

/** P5.5 - resize, upload to Storage, mirror photoURL to Auth + users/{uid}. */
export async function uploadAvatar(file: File): Promise<string> {
  const user = requireUser();
  const blob = await resize512(file);
  const r = ref(storage, avatarPath(user.uid));
  await uploadBytes(r, blob, { contentType: "image/jpeg" });
  const url = await getDownloadURL(r);
  await updateProfile(user, { photoURL: url });
  await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
  return url;
}

/** P5.5 - remove the avatar (Storage + Auth + users/{uid}). */
export async function removeAvatar(): Promise<void> {
  const user = requireUser();
  try { await deleteObject(ref(storage, avatarPath(user.uid))); } catch { /* already gone */ }
  await updateProfile(user, { photoURL: null });
  await setDoc(doc(db, "users", user.uid), { photoURL: null }, { merge: true });
}

// ── P6 · account-level server actions ──

/** P6.1 - fetch the export JSON and trigger a download. */
export async function downloadMyData(): Promise<void> {
  const idToken = await auth.currentUser?.getIdToken();
  const res = await fetch("/api/account/export", {
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
  });
  if (!res.ok) throw new Error(res.status === 429 ? "rate_limited" : "export_failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lexfit-adataim-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Re-authenticate for a sensitive action. Password accounts need currentPassword. */
export async function reauthenticate(currentPassword?: string): Promise<void> {
  const user = requireUser();
  const provider = user.providerData[0]?.providerId;
  if (provider === "password") {
    if (!currentPassword) throw new Error(NEED_PASSWORD);
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email ?? "", currentPassword));
  } else if (provider === "google.com") {
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
  } else {
    await reauthenticateWithPopup(user, new OAuthProvider(provider ?? "apple.com"));
  }
}

/** P6.2 - request account deletion (typed TÖRLÉS). Returns "reauth" if a fresh
 *  login is required; the caller re-auths and retries. */
export async function requestAccountDeletion(): Promise<"ok" | "reauth"> {
  const idToken = await auth.currentUser?.getIdToken(true);
  const res = await fetch("/api/account/delete", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken ?? ""}`, "Content-Type": "application/json" },
    body: JSON.stringify({ confirm: "TÖRLÉS" }),
  });
  if (res.status === 401) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (body.error === "reauth_required") return "reauth";
  }
  if (!res.ok) throw new Error("delete_failed");
  return "ok";
}
