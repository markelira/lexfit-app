import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Általános Szerződési Feltételek - LEXFIT",
  description: "A LEXFIT online edzésprogram-szolgáltatás Általános Szerződési Feltételei.",
};

export default function AszfPage() {
  return <LegalDoc file="aszf.md" />;
}
