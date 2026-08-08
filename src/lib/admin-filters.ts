"use client";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_FILTERS } from "@/lib/filter-defaults";

export type FilterOptions = Record<string, string[]>;

/** Load the editable filter option lists (theme/format/type/level/…) for admin
 *  forms. Dimensions missing from Firestore (empty prod, before the first
 *  Szűrők save) fall back to the canonical defaults so the selects work. */
export async function loadFilterOptions(): Promise<FilterOptions> {
  const snap = await getDocs(collection(db, "filters"));
  const out: FilterOptions = {};
  snap.forEach((d) => {
    out[d.id] = ((d.data().options as string[]) ?? []).slice();
  });
  for (const def of DEFAULT_FILTERS) {
    if (!out[def.key]?.length) out[def.key] = [...def.options];
  }
  return out;
}
