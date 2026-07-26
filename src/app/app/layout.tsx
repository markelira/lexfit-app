"use client";

import "./shell.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

const NAV: [string, keyof typeof lxPaths, string][] = [
  ["/app", "flame", "Foundation"],
  ["/app/library", "grid", "Videótár"],
  ["/app/progress", "chart", "Haladásom"],
  ["/app/szm", "ballot", "Szavazz Magadra"],
];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const initial = (user?.displayName?.[0] ?? "?").toUpperCase();
  const name = user?.displayName?.split(" ")[0] ?? "te";

  return (
    <div className="lx lx-shell" style={{ minHeight: "100dvh", display: "flex", fontSize: 15 }}>
      <div className="lx-ambient" aria-hidden="true" />
      <aside className="lx-sidebar">
        <div className="lx-brand">
          <span className="mark">
            <Image src="/lexfit-icon.png" alt="LEXFIT" width={35} height={32} priority />
          </span>
          <span className="wm">
            LEX<span>FIT</span>
          </span>
        </div>

        <div className="lx-navsec">Menü</div>
        <nav className="lx-nav">
          {NAV.map(([href, ic, label]) => (
            <Link key={href} href={href} className={`nav2${pathname === href ? " on" : ""}`}>
              <LxIcon d={lxPaths[ic]} size={19} /> {label}
              {href === "/app/szm" && <span className="szm-newdot">MAI</span>}
            </Link>
          ))}
        </nav>

        <Link href="/app/profile" className={`lx-prof${pathname === "/app/profile" ? " on" : ""}`}>
          <span className="av">{initial}</span>
          <span className="pi">
            <span className="nm">{name}</span>
            <span className="sb">Profil &amp; beállítások</span>
          </span>
          <LxIcon d={lxPaths.arrowR} size={17} className="chev" />
        </Link>
      </aside>

      <main style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: 1208, padding: "30px 36px 48px 28px" }}>{children}</div>
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected>
      <Shell>{children}</Shell>
    </Protected>
  );
}
