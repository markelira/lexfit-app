import type { ReactNode } from "react";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/Analytics";
import "./legal.css";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="legal-shell">
      <header className="legal-top">
        <Link href="/" className="legal-mark">LEXFIT</Link>
        <nav>
          <Link href="/aszf">ÁSZF</Link>
          <Link href="/adatvedelem">Adatkezelés</Link>
          <Link href="/impresszum">Impresszum</Link>
        </nav>
      </header>
      <main className="legal-main">{children}</main>
      <footer className="legal-foot">
        <span>© AM Studios Group Kft.</span>
        <a href="mailto:info@amstudios.hu">info@amstudios.hu</a>
        <CookieSettingsButton className="legal-cookie-btn" />
      </footer>
    </div>
  );
}
