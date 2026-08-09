"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { useAuth } from "@/lib/auth-context";
import { useIsMobile } from "@/lib/useIsMobile";
import { loadLibrary, type LibVideo } from "@/lib/library";
import { loadProgramIndex, type ProgramIndex } from "@/lib/program-index";
import { getMyList, setSaved } from "@/lib/mylist";
import { WorkoutCard } from "@/components/WorkoutCard";
import { BottomSheet } from "@/components/BottomSheet";

// Avatar menu — six labelled destinations (30 §30.2). Desktop dropdown / mobile
// bottom sheet share this list. Kijelentkezés is last, coloured, and separated.
type MenuItem = { label: string; icon: keyof typeof lxPaths; href?: string; action?: "logout"; danger?: boolean };
const AVATAR_MENU: MenuItem[] = [
  { label: "Profil", icon: "user", href: "/app/profile" },
  { label: "Az edzésterved", icon: "calendarCheck", href: "/app/profile/settings?section=plan" },
  { label: "Emlékeztetők", icon: "bell", href: "/app/profile/settings?section=reminders" },
  { label: "Beállítások", icon: "sliders", href: "/app/profile/settings" },
  { label: "Segítség", icon: "messageCircle", href: "mailto:hi@lexfit.hu" },
  { label: "Kijelentkezés", icon: "logOut", action: "logout", danger: true },
];

// The LEXFIT mark ("Az Ív") — arc + dot, white glyph on an accent tile.
function LexMark() {
  return (
    <span className="lxtb-mark" aria-hidden="true">
      <svg viewBox="0 0 680 616">
        <g transform="translate(-192,-152)">
          <path d="M248 712A400 400 0 0 1 648 312" fill="none" stroke="#fff" strokeWidth="112" strokeLinecap="round" />
          <circle cx="800" cy="224" r="72" fill="#fff" />
        </g>
      </svg>
    </span>
  );
}

// Quick filters (Gyors szűrők) — deep-link into Videótár with a filter param.
const QUICK: { label: string; href: string }[] = [
  { label: "10 PERC ALATT", href: `/app/library?dur=${encodeURIComponent("5–15 perc")}` },
  { label: "ALSÓTEST", href: `/app/library?theme=${encodeURIComponent("Alsótest")}` },
  { label: "KARDIÓ", href: `/app/library?theme=${encodeURIComponent("Kardió + has")}` },
  { label: "MOBILITÁS", href: `/app/library?theme=${encodeURIComponent("Mobilitás / nyújtás")}` },
  { label: "KEZDŐ", href: `/app/library?level=${encodeURIComponent("Kezdő")}` },
];

const RECENT_KEY = "lx:recent-search";
const readRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
};

/** Global top bar — logo, shell search (with overlay), streak, avatar menu. */
export function AppTopBar({ streak }: { streak: number }) {
  const router = useRouter();
  const { user, signOutUser } = useAuth();
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [videos, setVideos] = useState<LibVideo[]>([]);
  const [pindex, setPindex] = useState<ProgramIndex | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [myList, setMyList] = useState<Set<string>>(new Set());

  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mobileInput = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const initial = (user?.displayName?.[0] ?? user?.email?.[0] ?? "?").toUpperCase();
  // Menu identity header. Programme · week (30 §30.2) arrives with loadProfile in P4;
  // until then the sub-line is the account e-mail (real, already loaded).
  const menuName = user?.displayName || user?.email?.split("@")[0] || "Fiók";
  const menuSub = user?.email ?? "";

  useEffect(() => setRecent(readRecent()), []);

  // Navigating (e.g. tapping a tab while search is open) dismisses the overlays.
  const pathname = usePathname();
  useEffect(() => { setSearchOpen(false); setMenuOpen(false); }, [pathname]);

  // Mobile search is a full-screen view: lock scroll and focus its input on open.
  useEffect(() => {
    if (!(searchOpen && isMobile)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => mobileInput.current?.focus());
    return () => { document.body.style.overflow = prev; cancelAnimationFrame(raf); };
  }, [searchOpen, isMobile]);

  // Lazy-load the library + saved list the first time search is opened (cached after).
  useEffect(() => {
    if (!searchOpen) return;
    if (!videos.length) loadLibrary().then((d) => setVideos(d.videos)).catch(() => {});
    if (!pindex) loadProgramIndex().then(setPindex).catch(() => {});
    if (user) getMyList(user.uid).then(setMyList).catch(() => {});
  }, [searchOpen, videos.length, pindex, user]);

  // Program membership for search results: eyebrow + brand-hued cover.
  const memberOf = (code: string) => {
    const slug = pindex?.programOfVideo[code];
    return slug ? pindex?.bySlug[slug] ?? null : null;
  };
  const badgeFor = (code: string) => {
    const p = memberOf(code);
    return p ? { slug: p.slug, name: p.hu || p.title } : null;
  };

  async function toggleSave(code: string) {
    if (!user) return;
    const has = myList.has(code);
    setMyList((m) => {
      const n = new Set(m);
      has ? n.delete(code) : n.add(code);
      return n;
    });
    await setSaved(user.uid, code, !has);
  }

  // Desktop: close the dropdown on outside-click. Mobile is a full-screen view that
  // closes via its back button. Escape closes on both.
  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!isMobile && !searchRef.current?.contains(e.target as Node)) setSearchOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, isMobile]);

  // Avatar menu (desktop dropdown): close on outside-click / Escape (focus returns
  // to the trigger). On mobile the BottomSheet owns dismissal, so this stays off.
  useEffect(() => {
    if (!menuOpen || isMobile) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, isMobile]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return videos
      .filter((v) => `${v.title} ${v.code} ${v.theme} ${v.types.join(" ")}`.toLowerCase().includes(term))
      .slice(0, 8);
  }, [q, videos]);

  function pushRecent(term: string) {
    const next = [term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  }
  function clearRecent() {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
  }

  function go(href: string) {
    setSearchOpen(false);
    router.push(href);
  }
  // Any acted-on query is saved to recents (not just Enter — mobile users tap results).
  function commitAndGoLibrary() {
    const t = q.trim();
    if (t) pushRecent(t);
    go(t ? `/app/library?q=${encodeURIComponent(t)}` : "/app/library");
  }
  function commitAndPlay(code: string) {
    const t = q.trim();
    if (t) pushRecent(t);
    go(`/player/${code}?autostart=1`);
  }
  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) pushRecent(term);
    go(term ? `/app/library?q=${encodeURIComponent(term)}` : "/app/library");
  }

  async function logout() {
    setMenuOpen(false);
    await signOutUser();
    router.push("/login");
  }

  function onMenuItem(item: MenuItem) {
    setMenuOpen(false);
    if (item.action === "logout") { void logout(); return; }
    if (item.href?.startsWith("mailto:")) { window.location.href = item.href; return; }
    if (item.href) router.push(item.href);
  }

  const menuItems = AVATAR_MENU.map((item) => (
    <button
      key={item.label}
      role="menuitem"
      className={`lxam-item${item.danger ? " danger" : ""}`}
      onClick={() => onMenuItem(item)}
    >
      <LxIcon d={lxPaths[item.icon]} size={16} />
      <span>{item.label}</span>
    </button>
  ));
  const menuHeader = (
    <div className="lxam-head">
      <span className="lxam-ava">
        {user?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" />
        ) : initial !== "?" ? initial : <LxIcon d={lxPaths.user} size={18} />}
      </span>
      <span className="lxam-id">
        <span className="nm">{menuName}</span>
        {menuSub && <span className="sb">{menuSub}</span>}
      </span>
      {streak > 0 && (
        <span className="lxam-streak"><span className="fire" aria-hidden="true">🔥</span> {streak}</span>
      )}
    </div>
  );

  const hasQuery = q.trim().length > 0;

  const quickSec = (
    <div className="sp-sec">
      <div className="sp-h">Gyors szűrők</div>
      <div className="sp-chips">
        {QUICK.map((f) => (
          <button type="button" key={f.label} className="sp-chip" onClick={() => go(f.href)}>{f.label}</button>
        ))}
      </div>
    </div>
  );
  const recentSec = (
    <div className="sp-sec">
      <div className="sp-h">
        Legutóbbi keresések
        {recent.length > 0 && <button type="button" className="sp-clear" onClick={clearRecent}>Törlés</button>}
      </div>
      {recent.length > 0 ? (
        <ul className="sp-recent">
          {recent.map((term) => (
            <li key={term}>
              <button type="button" onClick={() => { setQ(term); pushRecent(term); go(`/app/library?q=${encodeURIComponent(term)}`); }}>
                <LxIcon d={lxPaths.clock} size={14} />
                <span>{term}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="sp-empty">Még nincs keresésed.</p>
      )}
    </div>
  );

  // Desktop dropdown: results replace the browse content (compact 2-col grid).
  const searchBody = hasQuery ? (
    <div className="sp-sec">
      {results.length > 0 ? (
        <>
          <div className="sp-grid">
            {results.map((v) => (
              <WorkoutCard key={v.code} v={v} isProgram={v.phase != null} programBadge={badgeFor(v.code)} programHue={memberOf(v.code)?.hue ?? null} saved={myList.has(v.code)} onToggleSave={toggleSave} onPlay={commitAndPlay} />
            ))}
          </div>
          <button type="button" className="sp-all" onClick={commitAndGoLibrary}>
            Összes találat a „{q.trim()}” kifejezésre <LxIcon d={lxPaths.arrowR} size={14} />
          </button>
        </>
      ) : (
        <p className="sp-empty">Nincs találat a „{q.trim()}” kifejezésre.</p>
      )}
    </div>
  ) : (
    <>{quickSec}{recentSec}</>
  );

  // Mobile full-screen: quick filters + recent stay; results are a 1-column list below.
  const mobileSearchBody = (
    <>
      {quickSec}
      {recentSec}
      {hasQuery && (
        <div className="sp-sec">
          <div className="sp-h">Találatok</div>
          {results.length > 0 ? (
            <>
              <div className="sp-grid">
                {results.map((v) => (
                  <WorkoutCard
                    key={v.code}
                    v={v}
                    isProgram={v.phase != null}
                    programBadge={badgeFor(v.code)}
                    programHue={memberOf(v.code)?.hue ?? null}
                    saved={myList.has(v.code)}
                    onToggleSave={toggleSave}
                    onPlay={commitAndPlay}
                  />
                ))}
              </div>
              <button type="button" className="sp-all" onClick={commitAndGoLibrary}>
                Összes találat a „{q.trim()}” kifejezésre <LxIcon d={lxPaths.arrowR} size={14} />
              </button>
            </>
          ) : (
            <p className="sp-empty">Nincs találat a „{q.trim()}” kifejezésre.</p>
          )}
        </div>
      )}
    </>
  );

  return (
    <header className="lxtb">
      <Link href="/app" className="lxtb-brand" aria-label="LEXFIT — Kezdőlap">
        <LexMark />
        <span className="wm">
          LEX<span>FIT</span>
        </span>
      </Link>

      {/* Desktop: a full inline search field. Mobile: it collapses to an icon in
          the right cluster (below) so the bar never overflows a narrow phone. */}
      {!isMobile && (
        <div className="lxtb-searchwrap" ref={searchRef}>
          <form className={`lxtb-search${searchOpen ? " open" : ""}`} role="search" onSubmit={submitSearch}>
            <LxIcon d={lxPaths.search} size={16} />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onClick={() => setSearchOpen(true)}
              placeholder="Keresés edzés, kategória, hossz…"
              aria-label="Keresés edzés, kategória, hossz"
            />
          </form>

          {searchOpen && (
            <div className="lxtb-spanel" role="dialog" aria-label="Keresés">{searchBody}</div>
          )}
        </div>
      )}

      {searchOpen && isMobile &&
        createPortal(
          <div className="lx lxms" role="dialog" aria-modal="true" aria-label="Keresés">
            <div className="lxms-head">
              <button className="lxms-back" onClick={() => setSearchOpen(false)} aria-label="Vissza">
                <LxIcon d={lxPaths.arrowR} size={20} style={{ transform: "rotate(180deg)" }} />
              </button>
              <span className="lxms-title">Keresés</span>
            </div>
            <form className="lxms-field" role="search" onSubmit={submitSearch}>
              <LxIcon d={lxPaths.search} size={18} />
              <input
                ref={mobileInput}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Keresés edzés, kategória, hossz…"
                aria-label="Keresés edzés, kategória, hossz"
              />
              {hasQuery && (
                <button type="button" className="lxms-clr" onClick={() => setQ("")} aria-label="Törlés">×</button>
              )}
            </form>
            <div className="lxms-body">{mobileSearchBody}</div>
          </div>,
          document.body,
        )}

      <div className="lxtb-right">
        {isMobile && (
          <button className="lxtb-iconbtn" onClick={() => setSearchOpen(true)} aria-label="Keresés">
            <LxIcon d={lxPaths.search} size={18} />
          </button>
        )}

        <span className="lxtb-streak" aria-label={`Sorozat: ${streak} nap`}>
          <span className="fire" aria-hidden="true">🔥</span>
          <b>{streak}<span className="u"> NAP</span></b>
        </span>

        <div className="lxtb-avwrap">
          <button
            ref={triggerRef}
            className="lxtb-av"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Fiók menü"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" />
            ) : initial !== "?" ? (
              <span className="ini">{initial}</span>
            ) : (
              <LxIcon d={lxPaths.user} size={18} />
            )}
          </button>

          {menuOpen && !isMobile && (
            <div ref={menuRef} className="lxtb-menu" role="menu" aria-label="Fiók">
              {menuHeader}
              {menuItems}
            </div>
          )}
        </div>
      </div>

      <BottomSheet open={menuOpen && isMobile} onClose={() => setMenuOpen(false)} ariaLabel="Fiók menü">
        <div className="lxam-sheet" role="menu" aria-label="Fiók">
          {menuHeader}
          {menuItems}
        </div>
      </BottomSheet>
    </header>
  );
}
