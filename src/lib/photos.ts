"use client";

import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

// Milestone progress photos at Hét 1 / 5 / 8. Stored privately in Firebase
// Storage under users/{uid}/photos/… (owner-only rules), with a metadata doc in
// users/{uid}/photos/{milestone}.
export type Milestone = 1 | 5 | 8;
export const MILESTONES: Milestone[] = [1, 5, 8];

const storagePath = (uid: string, m: Milestone) => `users/${uid}/photos/milestone-${m}.jpg`;

export async function uploadMilestonePhoto(uid: string, m: Milestone, file: File): Promise<string> {
  const path = storagePath(uid, m);
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type || "image/jpeg" });
  const url = await getDownloadURL(r);
  await setDoc(
    doc(db, "users", uid, "photos", String(m)),
    { milestone: m, storagePath: path, takenAt: serverTimestamp() },
    { merge: true },
  );
  return url;
}

/** Returns a map of milestone → download URL for the photos the user has. */
export async function getPhotos(uid: string): Promise<Partial<Record<Milestone, string>>> {
  const snap = await getDocs(collection(db, "users", uid, "photos"));
  const out: Partial<Record<Milestone, string>> = {};
  await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data() as { milestone: Milestone; storagePath: string };
      try {
        out[data.milestone] = await getDownloadURL(ref(storage, data.storagePath));
      } catch {
        /* file missing - ignore */
      }
    }),
  );
  return out;
}
