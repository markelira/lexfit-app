"use client";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type FilterOptions = Record<string, string[]>;

/** Load the editable filter option lists (theme/format/type/level/…) for admin forms. */
export async function loadFilterOptions(): Promise<FilterOptions> {
  const snap = await getDocs(collection(db, "filters"));
  const out: FilterOptions = {};
  snap.forEach((d) => {
    out[d.id] = ((d.data().options as string[]) ?? []).slice();
  });
  return out;
}
