"use client";

import "./admin.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminFetch } from "@/lib/admin-fetch";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

const NAV: [string, keyof typeof lxPaths, string][] = [
  ["/admin", "grid", "Vezérlőpult"],
  ["/admin/videos", "play", "Videók"],
  ["/admin/programs", "flame", "Programok"],
  ["/admin/filters", "filter", "Szűrők"],
  ["/admin/members", "chart", "Tagok"],
];

function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    let active = true;
    adminFetch("/api/admin/me")
      .then((res) => {
        if (!active) return;
        if (res.ok) {
          setOk(true);
        } else {
          setOk(false);
          router.replace("/app");
        }
      })
      .catch(() => {
        if (!active) return;
        setOk(false);
        router.replace("/app");
      });
    return () => {
      active = false;
    };
  }, [user, loading, router]);

  if (loading || !user || ok !== true) {
    return (
      <div className="lx">
        <div className="adm-loader">Belépés ellenőrzése…</div>
      </div>
    );
  }
  return <>{children}</>;
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(true);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="lx adm-shell">
      {!navOpen && (
        <button className="adm-navopen" onClick={() => setNavOpen(true)} title="Menü megnyitása" aria-label="Menü megnyitása">
          <LxIcon d={["M4 7 H20", "M4 12 H20", "M4 17 H20"]} size={19} sw={2} />
        </button>
      )}
      <aside className={`adm-side${navOpen ? "" : " collapsed"}`}>
        <div className="adm-brand">
          <span className="mark">
            <Image src="/lexfit-icon.png" alt="LEXFIT" width={30} height={30} priority />
          </span>
          <span className="wm">
            LEX<span>FIT</span>
          </span>
          <span className="tag">Admin</span>
          <button className="adm-navtoggle" onClick={() => setNavOpen(false)} title="Menü bezárása" aria-label="Menü bezárása">
            <LxIcon d={["M13 6 L7 12 L13 18", "M18 6 L12 12 L18 18"]} size={17} sw={2} />
          </button>
        </div>

        <div className="adm-navsec">Tartalom</div>
        <nav className="adm-nav">
          {NAV.map(([href, ic, label]) => (
            <Link key={href} href={href} className={`adm-navitem${isActive(href) ? " on" : ""}`}>
              <LxIcon d={lxPaths[ic]} size={18} /> {label}
            </Link>
          ))}
        </nav>

        <Link href="/app" className="adm-back">
          <LxIcon d={lxPaths.arrowR} size={16} style={{ transform: "rotate(180deg)" }} /> Vissza az appba
        </Link>
      </aside>

      <main className="adm-main">
        <div className="adm-inner">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <AdminShell>{children}</AdminShell>
    </AdminGate>
  );
}
