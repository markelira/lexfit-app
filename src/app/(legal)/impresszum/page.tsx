import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Impresszum — LEXFIT",
  description: "A LEXFIT szolgáltatás üzemeltetőjének adatai (Ekertv. 4. §).",
};

export default function ImpresszumPage() {
  return <LegalDoc file="impresszum.md" />;
}
