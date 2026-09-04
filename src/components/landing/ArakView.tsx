"use client";

import { useEffect } from "react";
import { trackArakView } from "@/lib/track";

// /arak is a server component (metadata + JSON-LD + revalidate), so the one
// client-side thing it needs - the pageview event - lives in this leaf rather
// than turning the whole route into a client bundle.
export function ArakView() {
  useEffect(() => { trackArakView(); }, []);
  return null;
}
