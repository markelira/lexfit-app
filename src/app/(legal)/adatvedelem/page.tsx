import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Adatkezelési tájékoztató - LEXFIT",
  description: "A LEXFIT szolgáltatás GDPR szerinti adatkezelési tájékoztatója.",
};

export default function AdatvedelemPage() {
  return <LegalDoc file="adatkezelesi-tajekoztato.md" />;
}
