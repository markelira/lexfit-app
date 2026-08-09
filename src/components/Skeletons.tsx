"use client";

// Skeleton building blocks + per-page composites. Every composite reuses the
// REAL layout containers (hb, pgs-hero, lib-spot, hrow, ch-grid, hp cards…) so
// the skeleton occupies exactly the space the loaded page will: no reflow jump
// when data arrives, and mobile/desktop sizing comes free from the layout CSS.
// Motion: the shared .skel shimmer (static under prefers-reduced-motion).

type S = React.CSSProperties;

export const Skel = ({ style, className = "" }: { style?: S; className?: string }) => (
  <div className={`skel ${className}`} style={style} aria-hidden="true" />
);

const Ghost = ({ style, pill = false }: { style?: S; pill?: boolean }) => (
  <div className={`skel-ghost${pill ? " pill" : ""}`} style={style} aria-hidden="true" />
);

/** Wrapper that announces loading once, hides the decorative blocks from AT. */
export function SkelPage({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={className} role="status" aria-label="Töltés…" aria-busy="true">
      {children}
    </div>
  );
}

/* ── shared parts ── */

/** WorkoutCard ghost — real .wc class so .hrow gives it the exact card width. */
export function SkelCard() {
  return (
    <div className="wc" aria-hidden="true">
      <Skel style={{ aspectRatio: "16 / 9", borderRadius: 14 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Skel style={{ width: 34, height: 34, borderRadius: "50%", flex: "none" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
          <Skel style={{ height: 12, width: "78%" }} />
          <Skel style={{ height: 10, width: "52%" }} />
        </div>
      </div>
    </div>
  );
}

/** A home-style row: heading bar + horizontally scrolling card ghosts. */
export function SkelRow({ cards = 4 }: { cards?: number }) {
  return (
    <section className="hrow-sec" aria-hidden="true">
      <div className="hrow-head">
        <Skel style={{ height: 16, width: 150 }} />
      </div>
      <div className="hrow">
        {Array.from({ length: cards }).map((_, i) => (
          <SkelCard key={i} />
        ))}
      </div>
    </section>
  );
}

/** Ghost content stack used inside dark hero surfaces (billboard/band/spot). */
function HeroGhosts({ title = 40, syn = 2, cta = true }: { title?: number; syn?: number; cta?: boolean }) {
  return (
    <>
      <Ghost pill style={{ height: 26, width: 180, marginBottom: 14 }} />
      <Ghost style={{ height: 12, width: 140, marginBottom: 12 }} />
      <Ghost style={{ height: title, width: "min(420px, 80%)", marginBottom: 14 }} />
      {Array.from({ length: syn }).map((_, i) => (
        <Ghost key={i} style={{ height: 11, width: i === syn - 1 ? "42%" : "60%", maxWidth: 460, marginBottom: 8 }} />
      ))}
      {cta && (
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <Ghost pill style={{ height: 48, width: 190 }} />
          <Ghost pill style={{ height: 48, width: 190 }} />
        </div>
      )}
    </>
  );
}

/* ── page composites ── */

/** Kezdőlap body: billboard + week strip + rows (also used by the shell gate). */
function HomeSkeletonBody() {
  return (
    <>
      <section className="hb skel-hero" style={{ boxShadow: "none" }} aria-hidden="true">
        <div className="hb-content">
          <HeroGhosts title={46} syn={2} />
        </div>
      </section>
      <Skel style={{ height: 76, borderRadius: 16 }} />
      <div className="home-rows">
        <SkelRow />
        <SkelRow cards={3} />
      </div>
    </>
  );
}

/** Kezdőlap: billboard + week strip + rows. */
export function HomeSkeleton() {
  return (
    <SkelPage className="home fade-in">
      <HomeSkeletonBody />
    </SkelPage>
  );
}

/** The /app auth+entitlement gate: the WHOLE shell as a skeleton — top bar,
 *  sidebar (desktop; CSS hides it on mobile) and Kezdőlap-shaped content — so
 *  entering the app never shows a blank branded screen. */
export function AppShellSkeleton() {
  return (
    <div className="lx lx-shell" role="status" aria-label="Töltés…" aria-busy="true">
      <header className="lxtb" aria-hidden="true">
        <div style={{ display: "flex", alignItems: "center", gap: 11, paddingLeft: 18, width: 244, flexShrink: 1 }}>
          <Skel style={{ width: 34, height: 34, borderRadius: 10, flex: "none" }} />
          <Skel style={{ width: 72, height: 14 }} />
        </div>
        <Skel style={{ height: 38, flex: 1, maxWidth: 480, borderRadius: 999, margin: "0 16px" }} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, paddingRight: 18 }}>
          <Skel style={{ width: 62, height: 30, borderRadius: 999 }} />
          <Skel style={{ width: 34, height: 34, borderRadius: "50%" }} />
        </div>
      </header>
      <div className="lx-body" aria-hidden="true">
        <aside className="lx-sidebar">
          <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "26px 16px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Skel style={{ width: 19, height: 19, borderRadius: 6, flex: "none" }} />
                <Skel style={{ height: 12, width: `${60 + (i % 3) * 14}%` }} />
              </div>
            ))}
          </div>
        </aside>
        <main className="lx-main">
          <div className="lx-main-in">
            <div className="home">
              <HomeSkeletonBody />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/** Player gate: dark theater skeleton — video stage + control/meta ghosts. */
export function PlayerSkeleton() {
  return (
    <div
      className="lx"
      role="status"
      aria-label="Edzés betöltése…"
      aria-busy="true"
      style={{ minHeight: "100dvh", background: "oklch(0.16 0.01 168)", display: "flex", flexDirection: "column" }}
    >
      <div style={{ width: "100%", maxWidth: 1160, margin: "0 auto", padding: "68px 20px 40px" }} aria-hidden="true">
        <div className="skel-hero" style={{ aspectRatio: "16 / 9", borderRadius: 18 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
          <div className="skel-ghost pill" style={{ width: 46, height: 46, borderRadius: "50%", flex: "none" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
            <div className="skel-ghost" style={{ height: 15, width: "min(320px, 60%)" }} />
            <div className="skel-ghost" style={{ height: 11, width: "min(200px, 38%)" }} />
          </div>
          <div className="skel-ghost pill" style={{ width: 120, height: 40 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skel-ghost" style={{ height: 46, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Programok: two banner bands, each with its playlist row. */
export function ProgramsSkeleton() {
  return (
    <SkelPage className="home fade-in">
      <div className="pgs-stack">
        {[0, 1].map((i) => (
          <section className="pgs" key={i} aria-hidden="true">
            <div className="pgs-hero skel-hero" style={{ boxShadow: "none" }}>
              <div className="pgs-content">
                <HeroGhosts title={34} syn={2} />
              </div>
            </div>
            <SkelRow cards={4} />
          </section>
        ))}
      </div>
    </SkelPage>
  );
}

/** Program detail: back link, header, facts, one phase row. */
export function ProgramDetailSkeleton() {
  return (
    <SkelPage className="home fade-in">
      <Skel style={{ height: 14, width: 110, marginBottom: 10 }} />
      <section aria-hidden="true">
        <Skel style={{ height: 30, width: "min(380px, 70%)" }} />
        <Skel style={{ height: 12, width: "min(520px, 90%)", marginTop: 14 }} />
        <Skel style={{ height: 12, width: "min(440px, 75%)", marginTop: 8 }} />
        <Skel className="pill" style={{ height: 48, width: 200, borderRadius: 999, marginTop: 18 }} />
      </section>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, margin: "22px 0" }} aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skel key={i} style={{ height: 64, borderRadius: 14 }} />
        ))}
      </div>
      <div className="home-rows">
        <SkelRow />
      </div>
    </SkelPage>
  );
}

/** Videótár: spotlight, category tiles, filter chips, rails. */
export function LibrarySkeleton() {
  return (
    <SkelPage className="lib-page fade-in">
      <div className="lib-spot skel-hero" style={{ boxShadow: "none", display: "flex", alignItems: "flex-end" }} aria-hidden="true">
        <div style={{ padding: "0 30px 38px", maxWidth: 560 }}>
          <HeroGhosts title={34} syn={2} />
        </div>
      </div>
      <section className="lib-cats" aria-hidden="true">
        <Skel style={{ height: 18, width: 120, margin: "26px 0 14px" }} />
        <div className="lib-cattiles">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skel key={i} style={{ height: 74, borderRadius: 14 }} />
          ))}
        </div>
      </section>
      <div style={{ display: "flex", gap: 8, margin: "18px 0" }} aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skel key={i} style={{ height: 34, width: 96, borderRadius: 999 }} />
        ))}
      </div>
      <SkelRow />
      <SkelRow cards={3} />
    </SkelPage>
  );
}

/** Haladásom: header + the Q1 ring/week card pair + two more cards. */
export function ProgressSkeleton() {
  return (
    <SkelPage className="hp fade-in">
      <header className="hp-top" aria-hidden="true">
        <Skel style={{ height: 24, width: 160 }} />
        <Skel style={{ height: 12, width: 190 }} />
      </header>
      <section className="hp-q1" aria-hidden="true">
        <div className="hp-card" style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <Skel style={{ width: 108, height: 108, borderRadius: "50%", flex: "none" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <Skel style={{ height: 24, width: 90 }} />
            <Skel style={{ height: 11, width: "60%" }} />
          </div>
        </div>
        <div className="hp-card">
          <Skel style={{ height: 12, width: 150, marginBottom: 16 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skel key={i} style={{ height: 46, borderRadius: 10 }} />
            ))}
          </div>
        </div>
      </section>
      <div className="hp-card" aria-hidden="true">
        <Skel style={{ height: 14, width: 180, marginBottom: 14 }} />
        <Skel style={{ height: 90 }} />
      </div>
      <div className="hp-card" aria-hidden="true">
        <Skel style={{ height: 14, width: 140, marginBottom: 14 }} />
        <Skel style={{ height: 60 }} />
      </div>
    </SkelPage>
  );
}

/** Kihívások archive: heading, chip strip, 3:4 card grid. */
export function ChallengesSkeleton() {
  return (
    <SkelPage className="ch-page fade-in">
      <Skel style={{ height: 24, width: 200, margin: "4px 0 18px" }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }} aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skel key={i} style={{ height: 34, width: 104, borderRadius: 999 }} />
        ))}
      </div>
      <div className="ch-grid" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skel key={i} style={{ aspectRatio: "3 / 4", borderRadius: 12 }} />
        ))}
      </div>
    </SkelPage>
  );
}

/** Kihívás detail: back link, cover + meta head, day rows. */
export function ChallengeDetailSkeleton() {
  return (
    <SkelPage className="ch-page fade-in">
      <Skel style={{ height: 14, width: 110, marginBottom: 16 }} />
      <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 24 }} aria-hidden="true">
        <Skel className="skel-hero" style={{ width: 180, aspectRatio: "3 / 4", borderRadius: 14, flex: "none" }} />
        <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: 10 }}>
          <Skel style={{ height: 12, width: 150 }} />
          <Skel style={{ height: 26, width: "min(340px, 85%)" }} />
          <Skel style={{ height: 11, width: "min(460px, 95%)" }} />
          <Skel style={{ height: 11, width: "min(380px, 70%)" }} />
          <Skel style={{ height: 44, width: 180, borderRadius: 999, marginTop: 8 }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }} aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Skel style={{ width: 54, aspectRatio: "3 / 4", borderRadius: 6, flex: "none" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <Skel style={{ height: 12, width: "50%" }} />
              <Skel style={{ height: 10, width: "32%" }} />
            </div>
          </div>
        ))}
      </div>
    </SkelPage>
  );
}
