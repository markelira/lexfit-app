import type { Metadata } from "next";
import "./landing.css";
import LandingPage from "@/components/landing/LandingPage";

const TITLE = "LEXFIT — A változás otthon kezdődik";
const DESCRIPTION =
  "Vezetett otthoni edzésprogram Alexával: napi 30 perc, eszköz nélkül. " +
  "Felépített program, edzéstár, kihívások és fejlődéskövetés — nőknek és férfiaknak. " +
  "Az első heted 490 Ft, bármikor lemondható.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "hu_HU",
    siteName: "LEXFIT",
    // TODO(owner asset): add a real 1200×630 share image, then:
    // images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Home() {
  return <LandingPage />;
}
