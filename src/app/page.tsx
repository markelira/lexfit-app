import type { Metadata } from "next";
import "./landing.css";
// The app's own component styles - the landing renders the real ProgramBanner
// and WorkoutCard, so it needs their stylesheets. Both are `.lx`-scoped, so
// nothing leaks into the `.lxl` landing rules.
import "./app/home.css";
import "./app/programs/programs.css";
import LandingPage from "@/components/landing/LandingPage";
import { loadLandingCatalog } from "@/lib/landing-catalog.server";

const TITLE = "LEXFIT - otthoni edzésprogram, ami hozzád igazodik";
const DESCRIPTION =
  "Vezetett otthoni edzések magyarul, eszköz nélkül. Hét kérdés, és kész a heted - " +
  "annyi nappal, amennyi belefér. Programok, edzéstár, kihívások és fejlődéskövetés.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "A változás otthon kezdődik - LEXFIT",
    description:
      "Napi 20–30 perc, elég egy matrac. Vezetett otthoni edzések, és egy heti terv, " +
      "ami a te napjaidhoz igazodik.",
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

// Content changes when the owner publishes in /admin, not continuously - an hour
// of staleness is invisible to a visitor and keeps the Admin SDK off the hot path.
export const revalidate = 3600;

// `/` is a SERVER component: firestore.rules gates all content on isSignedIn(), so
// the catalog is read with the Admin SDK here and handed to the client component as
// props. This also means the marketing page finally renders to crawlers.
export default async function Home() {
  const catalog = await loadLandingCatalog();
  return <LandingPage catalog={catalog} />;
}
