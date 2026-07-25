"use client";

import "./szm.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import {
  SZM_ARCHIVE, SZM_DAYS, SZM_GROUP, SZM_VOTE, SZM_WEEK,
  szmArchiveDays, szmAvColor, szmGrad, szmLevelWord, szmWord,
  type SzmDay,
} from "@/lib/szm";

const szmPaths = {
  ballot: ["M5 4 H19 V20 H5 Z", "M8 9 H16", "M8 13 H16", "M8 17 H12"],
  lock: ["M7 11 V8 a5 5 0 0 1 10 0 V11", "M5 11 H19 V20 H5 Z"],
  bolt: "M13 3 L5 13 H11 L10 21 L18 10 H12 Z",
};

// ── stacked avatar faces ──
function SzmFaces({ faces, n = 5, size = 26, dark = false }: { faces: string[]; n?: number; size?: number; dark?: boolean }) {
  const list = faces.slice(0, n);
  return (
    <div className="szm-gh-faces" style={{ display: "flex", alignItems: "center" }}>
      {list.map((f, i) => (
        <span
          key={i}
          className="fc"
          style={{
            width: size, height: size, background: szmAvColor(f),
            borderColor: dark ? "var(--d-bg)" : "var(--surface)",
            marginLeft: i ? -Math.round(size * 0.3) : 0, zIndex: list.length - i,
          }}
        >
          {f}
        </span>
      ))}
    </div>
  );
}

// ── vertical (9:16) video card ──
function SzmVCard({ d, theme, onPlay, showBadge = true, prog }: { d: SzmDay; theme: string; onPlay?: (d: SzmDay) => void; showBadge?: boolean; prog?: number }) {
  const locked = d.state === "locked";
  const today = d.state === "today";
  const done = d.state === "done";
  const dayName = SZM_DAYS[d.day];
  return (
    <button className={"szm-vc" + (locked ? " locked" : "") + (today ? " today" : "")} onClick={() => !locked && onPlay?.(d)}>
      <div className="szm-vc-art" style={{ background: szmGrad(theme) }}>
        <span className="szm-vc-ring" />
        <span className="szm-vc-vig" />

        <div className="szm-vc-day">
          <div className="dl">NAP {d.day + 1}</div>
          <div className="dn">{dayName}</div>
        </div>
        <span className="szm-vc-mins">{d.mins}′</span>
        {showBadge && today && <span className="szm-vc-badge">MAI DROP</span>}
        {showBadge && done && <span className="szm-vc-badge" style={{ background: "var(--ok)" }}>LEEDZVE</span>}

        {locked ? (
          <div className="szm-vc-lock">
            <span className="ic"><LxIcon d={szmPaths.lock} size={18} sw={1.8} /></span>
            <div className="tx">Hamarosan</div>
            <div className="sub">{d.drops}</div>
          </div>
        ) : (
          <>
            <div className="szm-vc-portrait">
              <div className="pw">{szmWord(theme)}</div>
            </div>
            <span className="szm-vc-play"><LxIcon d={lxPaths.play} size={20} fill /></span>
          </>
        )}

        <div className="szm-vc-foot">
          <div className="szm-vc-title">{d.title}</div>
        </div>
        {(today || done) && <div className="szm-vc-prog"><i style={{ width: (done ? 100 : prog ?? 0) + "%" }} /></div>}
      </div>
    </button>
  );
}

// ── vote panel (interactive) ──
function SzmVotePanel() {
  const [pick, setPick] = useState(SZM_VOTE.myPick);
  const counts = SZM_VOTE.options.map(
    (o) =>
      o.votes +
      (o.theme === pick && o.theme !== SZM_VOTE.myPick ? 1 : 0) -
      (o.theme === SZM_VOTE.myPick && pick !== SZM_VOTE.myPick ? 1 : 0),
  );
  const total = counts.reduce((a, b) => a + b, 0);
  const lead = Math.max(...counts);
  const mineLabel = pick === SZM_VOTE.myPick ? "a tied: " + pick : "átszavaztál: " + pick;
  return (
    <div className="szm-vote">
      <div className="szm-vote-head">
        <div>
          <div className="ey">SZAVAZÁS · HÉT {SZM_VOTE.forWeek}</div>
          <h2>Mire szavazol a jövő hétre?</h2>
        </div>
        <span className="clock"><LxIcon d={lxPaths.clock} size={14} /> {SZM_VOTE.closes}-ig</span>
      </div>
      <div className="szm-vote-list">
        {SZM_VOTE.options.map((o, i) => {
          const pct = Math.round((counts[i] / total) * 100);
          const mine = o.theme === pick;
          const winning = counts[i] === lead;
          return (
            <button key={o.theme} className={"szm-vopt" + (mine ? " mine" : "")} onClick={() => setPick(o.theme)}>
              <span className="fill" style={{ width: pct + "%" }} />
              <span className="swatch" style={{ background: szmGrad(o.theme) }}><b>{szmWord(o.theme)}</b></span>
              <span className="vmid">
                <span className="vt">
                  {o.theme}
                  {mine && <span className="vcheck"><LxIcon d={lxPaths.check} size={12} sw={3} /></span>}
                </span>
                <span className="vb">{o.blurb}</span>
              </span>
              <span className="vright">
                <div className="vpct" style={winning ? { color: "var(--d-accent)" } : undefined}>{pct}%</div>
                <div className="vnum">{counts[i]} szavazat</div>
              </span>
            </button>
          );
        })}
      </div>
      <div className="szm-vote-foot">
        <SzmFaces faces={SZM_GROUP.faces} n={6} size={24} dark />
        <span>{total} tag szavazott · {mineLabel}</span>
      </div>
    </div>
  );
}

// ── FB-group header ──
function SzmGroupHeader({ activeTab, onTab }: { activeTab: string; onTab: (t: string) => void }) {
  const G = SZM_GROUP;
  const tabs = ["Hírfolyam", "Videók", "Szavazás", "Tagok", "Névjegy"];
  return (
    <div className="szm-gh">
      <div className="szm-gh-cover">
        <span className="ring" />
        <span className="ring two" />
        <span className="word">SZAVAZZ</span>
        <span className="scrim" />
      </div>
      <div className="szm-gh-body">
        <div className="szm-gh-av"><LxIcon d={szmPaths.ballot} size={42} sw={1.6} /></div>
        <div className="szm-gh-meta">
          <h1>{G.name}</h1>
          <div className="szm-gh-sub">
            <span>
              <LxIcon d={szmPaths.lock} size={13} sw={2} style={{ verticalAlign: "-2px", marginRight: 4 }} />
              {G.privacy}
            </span>
            <span className="sep" />
            <span><b style={{ color: "var(--ink)", fontWeight: 800 }}>{G.members}</b> tag</span>
            <span className="sep" />
            <SzmFaces faces={G.faces} n={5} size={24} />
            <span style={{ color: "var(--ink-3)" }}>+ {G.online} online</span>
          </div>
        </div>
        <div className="szm-gh-actions">
          <span className="szm-joined"><LxIcon d={lxPaths.check} size={15} sw={2.6} /> Csatlakozva</span>
          <button className="btn ghost" style={{ padding: "11px 16px" }}>Megosztás</button>
        </div>
      </div>
      <p className="szm-gh-blurb">{G.tagline}</p>
      <div className="szm-tabs">
        {tabs.map((t) => (
          <button key={t} className={"szm-tab" + (t === activeTab ? " on" : "")} onClick={() => onTab(t)}>
            {t}
            {t === "Szavazás" && <span className="cnt">{SZM_VOTE.total}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── today drop spotlight ──
function SzmTodaySpotlight({ d, theme, week, onPlay }: { d: SzmDay; theme: string; week: typeof SZM_WEEK; onPlay: (d: SzmDay) => void }) {
  return (
    <section className="szm-spot">
      <div className="szm-spot-art" style={{ background: szmGrad(theme) }}>
        <span className="ring" />
        <span className="word">{szmWord(theme)}</span>
      </div>
      <span className="szm-spot-scrim" />
      <div className="szm-spot-content">
        <div className="szm-spot-ey">
          <span className="live"><span className="d" />MAI DROP</span>
          {SZM_DAYS[d.day].toUpperCase()} · HÉT {week.num} · {d.day + 1}/{week.days.length}. RÉSZ
        </div>
        <h2>{d.title}</h2>
        <p>{d.mins} perces {theme.toLowerCase()} fókusz, eszköz nélkül — Alexa végig veled csinálja, a tempót te tartod.</p>
        <div className="szm-spot-meta">
          <span className="szm-stat"><LxIcon d={lxPaths.clock} size={14} /> {d.mins} perc</span>
          <span className="szm-stat"><LxIcon d={szmPaths.bolt} size={14} fill /> {szmLevelWord(d.level)}</span>
          <span className="szm-stat">{theme}</span>
          {d.quiet && <span className="szm-stat">🔇 Csendes</span>}
        </div>
        <div className="szm-spot-ctas">
          <button className="nhb-playw" onClick={() => onPlay(d)}>
            <LxIcon d={lxPaths.play} size={18} fill /> Edzés indítása
          </button>
        </div>
      </div>
      <div className="szm-spot-card">
        <SzmVCard d={d} theme={theme} onPlay={onPlay} showBadge prog={0} />
      </div>
    </section>
  );
}

export default function SzmPage() {
  const router = useRouter();
  const W = SZM_WEEK;
  const [tab, setTab] = useState("Videók");
  const play = (d: SzmDay) => {
    if (d.state !== "locked") router.push(`/player/${d.code}?autostart=1`);
  };
  const today = W.days[W.todayIdx];

  return (
    <div className="fade-in szm-page">
      <SzmGroupHeader activeTab={tab} onTab={setTab} />

      <SzmTodaySpotlight d={today} theme={W.theme} week={W} onPlay={play} />

      {/* 1. current week — videos in order */}
      <section>
        <div className="szm-secthd">
          <h3>A hét műsora</h3>
          <span className="szm-mark"><span className="dot" />HÉT {W.num} · {W.theme}</span>
          <span className="all">{W.days.filter((d) => d.state !== "locked").length}/{W.days.length} fent</span>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: "-6px 0 16px", maxWidth: 680 }}>{W.tagline}</p>
        <div className="szm-weekgrid">
          {W.days.map((d) => (
            <SzmVCard key={d.code} d={d} theme={W.theme} onPlay={play} prog={d.state === "today" ? 0 : undefined} />
          ))}
        </div>
      </section>

      {/* 2. vote — next week's theme */}
      <section>
        <SzmVotePanel />
      </section>

      {/* 3. previous weeks — by month, then week */}
      <section>
        <div className="szm-secthd">
          <h3>Korábbi hetek</h3>
          <span className="sub">amit eddig választottatok — hónapok, azon belül hetek szerint</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {SZM_ARCHIVE.map((m) => (
            <div key={m.month + m.year}>
              <div className="szm-month-hd">
                <span className="mn">{m.month}</span>
                <span className="yr">{m.year}</span>
                <span className="ln" />
                <span className="ct">{m.weeks.length} hét</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {m.weeks.map((w) => (
                  <div key={w.wim}>
                    <div className="szm-pastweek-hd">
                      <span className="sw" style={{ background: szmGrad(w.theme) }}><b>{szmWord(w.theme)}</b></span>
                      <div className="pi">
                        <div className="t">{w.wim}. hét · {w.theme}</div>
                        <div className="m">{w.win}% nyert · 5 rész</div>
                      </div>
                    </div>
                    <div className="szm-vrail sm">
                      {szmArchiveDays(m.month, w).map((d) => (
                        <SzmVCard key={d.code} d={d} theme={w.theme} onPlay={play} showBadge={false} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
