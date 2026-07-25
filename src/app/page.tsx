import type { Metadata } from "next";
import "./landing.css";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "LEXFIT — A változás otthon kezdődik",
  description:
    "A teljes otthoni edzésprogram nőknek. Napi 30 perc, eszköz nélkül — egy vezetett program, 200+ edzés, fejlődéskövetés és közösség.",
};

export default function Home() {
  return <LandingPage />;
}
