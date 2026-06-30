"use client";

import { arrayRemove, arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// users/{uid}/myList/saved → { codes: string[] } — replaces the prototype's
// localStorage lx_mylist.
const ref = (uid: string) => doc(db, "users", uid, "myList", "saved");

export async function getMyList(uid: string): Promise<Set<string>> {
  const snap = await getDoc(ref(uid));
  return new Set((snap.data()?.codes as string[] | undefined) ?? []);
}

export async function setSaved(uid: string, code: string, saved: boolean): Promise<void> {
  await setDoc(ref(uid), { codes: saved ? arrayUnion(code) : arrayRemove(code) }, { merge: true });
}
