"use client";

// LEXFIT marketing landing — recreated from docs/design_handoff_lexfit_landing.
// Long-scroll narrative: hero → app intro → feature panels interleaved with
// cinematic auto-players → founder story → pricing → footer. All copy is
// Hungarian and verbatim from the handoff. Styling lives in src/app/landing.css
// (scoped under `.lxl`). Every image is a striped <Ph> placeholder until real
// photography exists (see handoff "Assets").

import Image from "next/image";
import Link from "next/link";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf, perWeekHuf, annualSavingsPct } from "@/lib/pricing/display";
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

/* ------------------------------------------------------------------ */
/* shared category → color/word maps + the CourseCover gradient        */
/* ------------------------------------------------------------------ */
type Cat = "Alsótest" | "Felsőtest" | "Cardio + has" | "Teljes test" | "Mobility";

const CAT_VAR: Record<Cat, string> = {
  "Alsótest": "var(--cat-also)",
  "Felsőtest": "var(--cat-felso)",
  "Cardio + has": "var(--cat-cardio)",
  "Teljes test": "var(--cat-teljes)",
  "Mobility": "var(--cat-mobility)",
};
const CAT_WORD: Record<Cat, string> = {
  "Alsótest": "ALSÓ",
  "Felsőtest": "FELSŐ",
  "Cardio + has": "CARDIO",
  "Teljes test": "TELJES",
  "Mobility": "MOBILITY",
};
// The app's LxCover gradient (relative-color OKLCH) — precomputed per category
// by the browser at paint time. Identical formula for coverflow / journey / unlim.
const coverGrad = (v: string) =>
  `linear-gradient(125deg, oklch(from ${v} calc(l - 0.16) calc(c * 0.85) h) 0%, ${v} 65%, oklch(from ${v} calc(l + 0.07) c h) 100%)`;

/* ------------------------------------------------------------------ */
/* hooks                                                               */
/* ------------------------------------------------------------------ */
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function usePrefersReducedMotion() {
  const [prm, setPrm] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setPrm(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return prm;
}

/* ------------------------------------------------------------------ */
/* primitives                                                          */
/* ------------------------------------------------------------------ */
// One-shot scroll reveal — .rise → .in at 12% visibility, then unobserve.
function Rise({
  className = "",
  children,
  id,
  style,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} id={id} style={style} className={`rise ${shown ? "in" : ""} ${className}`}>
      {children}
    </div>
  );
}

// Count-up for the price-anchor number: rolls 0 → value on first reveal so the
// per-week price lands as an event. Static under prefers-reduced-motion.
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prm = usePrefersReducedMotion();
  const [n, setN] = useState(value);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || prm) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const t0 = performance.now();
        const dur = 900;
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(value * eased));
          if (p < 1) requestAnimationFrame(step);
        };
        setN(0);
        requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prm, value]);
  return <span ref={ref}>{formatHuf(n)}</span>;
}

// Striped image placeholder — production swaps each for a real <Image>.
function Ph({
  label,
  dark = false,
  abs = false,
  style,
}: {
  label: string;
  dark?: boolean;
  abs?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div className={`ph ${dark ? "dark" : ""} ${abs ? "abs" : ""}`} style={style} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* data                                                                */
/* ------------------------------------------------------------------ */
const coverflowCards: { cat: Cat; title: string; min: string }[] = [
  { cat: "Alsótest", title: "Fenék & comb égő", min: "24 perc" },
  { cat: "Cardio + has", title: "Zsírégető cardio", min: "22 perc" },
  { cat: "Felsőtest", title: "Erős kar & váll", min: "21 perc" },
  { cat: "Teljes test", title: "Teljes test égő", min: "28 perc" },
  { cat: "Mobility", title: "Reggeli mobilitás", min: "14 perc" },
  { cat: "Alsótest", title: "Lépcsőző comb-sorozat", min: "19 perc" },
  { cat: "Cardio + has", title: "Tabata core", min: "10 perc" },
  { cat: "Felsőtest", title: "Tartás-reset", min: "17 perc" },
  { cat: "Teljes test", title: "Multi-mozgás mindenre", min: "26 perc" },
];

type JRow = { day: string; cat: Cat; title: string; code: string };
const starterWeeks: {
  n: number;
  ph: "alap" | "epites";
  eyebrow: string;
  desc: string;
  rows: JRow[];
}[] = [
  {
    n: 1, ph: "alap", eyebrow: "🌱 Alap fázis",
    desc: "Forma és szokás. Lassú tempó, alapgyakorlatok, bőséges modifikációkkal.",
    rows: [
      { day: "H", cat: "Alsótest", title: "Láb alapokról", code: "F001" },
      { day: "K", cat: "Felsőtest", title: "Felsőtest indító", code: "F002" },
      { day: "Sze", cat: "Cardio + has", title: "Csendes cardio", code: "F003" },
      { day: "Cs", cat: "Teljes test", title: "Mindent egy edzésben", code: "F004" },
      { day: "P", cat: "Mobility", title: "Reset — alap flow", code: "F005" },
    ],
  },
  {
    n: 2, ph: "alap", eyebrow: "🌱 Alap fázis",
    desc: "Beépül a rutin. Ugyanaz a ritmus, kicsit mélyebben, magabiztosabban.",
    rows: [
      { day: "H", cat: "Alsótest", title: "Fenék-fókusz, első réteg", code: "F006" },
      { day: "K", cat: "Felsőtest", title: "Egyenes hát, nyitott mell", code: "F007" },
      { day: "Sze", cat: "Cardio + has", title: "Lépés-alapú cardio + has", code: "F008" },
      { day: "Cs", cat: "Teljes test", title: "Egész test flow, könnyedén", code: "F009" },
      { day: "P", cat: "Mobility", title: "Csípő + váll mobility", code: "F010" },
    ],
  },
  {
    n: 3, ph: "epites", eyebrow: "🔨 Építés fázis",
    desc: "Új variációk és cardio-alapozás. Belép a tempó és az új formátumok.",
    rows: [
      { day: "H", cat: "Alsótest", title: "Combé az erő — pulzusok", code: "F011" },
      { day: "K", cat: "Felsőtest", title: "Felsőtest variációkkal", code: "F012" },
      { day: "Sze", cat: "Cardio + has", title: "Step it up — cardio építés", code: "F013" },
      { day: "Cs", cat: "Teljes test", title: "Teljes test fél órában", code: "F014" },
      { day: "P", cat: "Mobility", title: "Lazító flow + mély nyújtás", code: "F015" },
    ],
  },
  {
    n: 4, ph: "epites", eyebrow: "🔨 Építés fázis",
    desc: "Erősebb terhelés. Pyramid, EMOM, AMRAP — és érzed, hogy bírod.",
    rows: [
      { day: "H", cat: "Alsótest", title: "Lábmunka oldalra, átlósan", code: "F016" },
      { day: "K", cat: "Felsőtest", title: "Lapockák erősítése", code: "F017" },
      { day: "Sze", cat: "Cardio + has", title: "Cardio combo + ferde has", code: "F018" },
      { day: "Cs", cat: "Teljes test", title: "Multi-mozgás mindenre", code: "F019" },
      { day: "P", cat: "Mobility", title: "Mély nyújtás — egész test", code: "F020" },
    ],
  },
];

// Real seeded challenges (scripts/seed-challenges.mjs) — titles, lengths and
// per-day minutes are the actual archive, not marketing filler.
const challengeCards: { cat: Cat; title: string; days: string; mins: string }[] = [
  { cat: "Cardio + has", title: "7 napos has-kihívás", days: "7 nap", mins: "napi 10–14 perc" },
  { cat: "Alsótest", title: "10 napos alsótest", days: "10 nap", mins: "napi 15–20 perc" },
  { cat: "Mobility", title: "5 napos reggeli ébresztő", days: "5 nap", mins: "napi 8–12 perc" },
  { cat: "Felsőtest", title: "5 napos tartás-kihívás", days: "5 nap", mins: "napi 8–12 perc" },
  { cat: "Mobility", title: "14 napos reggeli flow", days: "14 nap", mins: "napi 12–18 perc" },
  { cat: "Felsőtest", title: "7 napos hát & tartás", days: "7 nap", mins: "napi 10–14 perc" },
  { cat: "Cardio + has", title: "7 napos core", days: "7 nap", mins: "napi 10–14 perc" },
  { cat: "Mobility", title: "6 napos mobilitás", days: "6 nap", mins: "napi 10–15 perc" },
];

// FAQ — every answer must stay true to the shipped product (no roadmap claims).
const faq: [string, string][] = [
  [
    "Miért fizessek, ha a YouTube-on ingyen is van edzésvideó?",
    "A videó ingyen van — a sorrend nem. A LEXFIT egy felépített program: minden edzés tudja, mi jött előtte és mi jön utána, a haladásod magától követődik, és nem neked kell minden nap kitalálnod, mit csinálj. Pont ezért működik akkor is, amikor a motiváció épp nincs otthon.",
  ],
  [
    "Teljesen kezdő vagyok. Nekem való?",
    "Igen — a Foundation pontosan ide készült: lassú tempó, alapgyakorlatok, bőséges modifikációkkal. A saját tempódban haladsz, és a pihenőnap nálunk a terv része.",
  ],
  [
    "Férfiként is használhatom?",
    "Igen. A LEXFIT nőknek és férfiaknak készült — a gyakorlatok saját testsúlyra épülnek, te pedig a saját szinteden és tempódban követed őket.",
  ],
  [
    "Milyen eszköz kell hozzá?",
    "Semmi — csak egy matrac és napi nagyjából 30 perc.",
  ],
  [
    "Hogyan mondhatom le?",
    "Bármikor, egy kattintással, a profilodból. Nincs hűségidő — a lemondás után a már kifizetett időszak végéig még minden elérhető.",
  ],
  [
    "Megy TV-n vagy laptopon is?",
    "Igen. A LEXFIT a böngészőben fut — nem kell letölteni semmit. Telefonon, laptopon és asztali gépen működik, az edzést pedig AirPlay-jel vagy Chromecasttal a TV-re is kiküldheted.",
  ],
];

const alexaChapters: [string, string, string][] = [
  ["A VERSENYZŐ", "10 év a szőnyegen", "linear-gradient(160deg,var(--cat-felso),oklch(.34 0.05 168))"],
  ["A FORDULAT", "2023 — abbahagytam", "linear-gradient(160deg,var(--cat-teljes),oklch(.34 0.05 168))"],
  ["A FELISMERÉS", "„Egyedül nem megy”", "linear-gradient(160deg,var(--accent),var(--accent-2))"],
  ["A KÖZÖSSÉG", "17 000+ ember", "linear-gradient(160deg,var(--cat-cardio),oklch(.56 .13 40))"],
  ["AZ ÍGÉRET", "Együtt muszáj", "linear-gradient(160deg,var(--accent-2),var(--cat-felso))"],
];

// Real HUF pricing — figures derived from the pricing config (single source of
// truth), so the landing can never drift from what Stripe charges. J1: every
// card states the renewal terms. J4: no strikethrough "old" prices and the only
// savings claim is annual vs 12× monthly.
// Order puts the annual plan in the CENTER, highlighted + pre-recommended.
// `role` is carried into the checkout so a card click starts that plan's flow.
const pricing: {
  plan: string; role: string; amt: string; cur: string; badge?: string; save?: string; saveClass?: string; featured?: boolean; fine: ReactNode;
}[] = [
  {
    plan: "Heti", role: "week_intro",
    amt: formatHuf(PRICES.week_intro.amountHuf),
    cur: "első 7 nap",
    fine: <>utána {formatHuf(PRICES.week_std.amountHuf)}/hét, automatikusan megújul —<br />bármikor lemondhatod</>,
  },
  {
    plan: "Éves", role: "annual_std",
    amt: formatHuf(perWeekHuf(PRICES.annual_std.amountHuf)),
    cur: "/ hét",
    badge: "Legnépszerűbb",
    save: `Spórolj ${annualSavingsPct()}%`,
    saveClass: "cyan",
    featured: true,
    fine: <>{formatHuf(PRICES.annual_std.amountHuf)}/év, évente számlázva —<br />automatikusan megújul</>,
  },
  {
    plan: "Havi", role: "month_std",
    amt: formatHuf(PRICES.month_std.amountHuf),
    cur: "/ hó",
    fine: <>havonta automatikusan megújul —<br />bármikor lemondhatod</>,
  },
];

// Primary conversion path: the built 7-question personalization quiz
// (onboarding → auth → checkout). Login stays as the secondary "már tag vagy" path.
const CTA_START = "/onboarding";

/* ------------------------------------------------------------------ */
/* sticky nav + scroll-spy                                             */
/* ------------------------------------------------------------------ */
// Labels are benefit words a stranger understands, not app-internal names.
const NAV_LINKS: [string, string][] = [
  ["#valos", "Edzések"],
  ["#programok", "Program"],
  ["#kihivasok", "Kihívások"],
  ["#youtube", "Bemutató"],
  ["#elofizetes", "Árak"],
];

function StickyNav() {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState("#valos");
  useEffect(() => {
    const ids = NAV_LINKS.map(([h]) => h);
    const onScroll = () => {
      setShow(window.scrollY > 640);
      let cur = "#valos";
      for (const id of ids) {
        const el = document.querySelector(id);
        if (el && el.getBoundingClientRect().top < 220) cur = id;
      }
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`stickynav ${show ? "show" : ""}`}>
      <div className="row1">
        <span className="wordmark" style={{ fontSize: 19 }}>LEXFIT</span>
        <nav className="links">
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href} className={active === href ? "active" : ""}>
              {label}
            </a>
          ))}
        </nav>
        <Link className="mini" href={CTA_START}>
          Összeállítom a tervem <span aria-hidden="true">→</span>
        </Link>
      </div>
      {/* Mobile-only sticky bottom bar: offer + one CTA (02 C3). */}
      <div className={`mcta ${show ? "show" : ""}`}>
        <span>Az első heted <b>{formatHuf(PRICES.week_intro.amountHuf)}</b></span>
        <Link className="pill pill-dark" href={CTA_START}>Összeállítom a tervem</Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* coverflow                                                           */
/* ------------------------------------------------------------------ */
const CARD_STEP = 118; // px between adjacent coverflow cards
function Coverflow() {
  const [ref, inView] = useInView(0.3);
  const prm = usePrefersReducedMotion();
  const N = coverflowCards.length;
  const [center, setCenter] = useState(Math.floor(N / 2));
  // 1:1 drag: fractional card offset while the pointer is down; on release the
  // flick velocity is projected forward (exponential decay) and snapped.
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; lastX: number; lastT: number; vx: number } | null>(null);
  // Survives past pointerup so the trailing click can tell a drag from a tap.
  const movedRef = useRef(false);
  useEffect(() => {
    if (!inView || prm || dragging) return;
    const t = setInterval(() => setCenter((c) => (c + 1) % N), 2800);
    return () => clearInterval(t);
  }, [inView, prm, N, dragging]);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, lastX: e.clientX, lastT: performance.now(), vx: 0 };
    movedRef.current = false;
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) d.vx = (e.clientX - d.lastX) / dt; // px/ms, latest sample
    d.lastX = e.clientX;
    d.lastT = now;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6) movedRef.current = true; // hysteresis before it counts as a drag
    setDragOffset(-dx / CARD_STEP);
  };
  const onPointerUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    setDragging(false);
    // Momentum projection (decelerationRate .998), clamped to ±3 cards.
    const projPx = d.vx * 1000 * 0.998 / (1 - 0.998) / 1000;
    const extra = Math.max(-3, Math.min(3, -projPx / CARD_STEP));
    const target = Math.round(center + dragOffset + extra);
    setCenter(((target % N) + N) % N);
    setDragOffset(0);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") { setCenter((c) => (c - 1 + N) % N); e.preventDefault(); }
    if (e.key === "ArrowRight") { setCenter((c) => (c + 1) % N); e.preventDefault(); }
  };
  const eff = center + dragOffset;
  return (
    <div
      className={`coverflow ${dragging ? "dragging" : ""}`}
      ref={ref}
      tabIndex={0}
      role="group"
      aria-label="Edzés-kártyák — nyilakkal vagy húzással lapozható"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {coverflowCards.map((c, i) => {
        let o = i - eff;
        if (o > N / 2) o -= N;
        else if (o < -N / 2) o += N;
        const a = Math.abs(o);
        const hidden = a >= 4;
        const style: CSSProperties = {
          transform: `translateX(${o * CARD_STEP}px) scale(${Math.max(0.52, 1 - a * 0.14)})`,
          opacity: hidden ? 0 : 1,
          zIndex: 20 - Math.round(a),
          pointerEvents: hidden ? "none" : "auto",
        };
        return (
          <div
            key={i}
            className="cf-card"
            style={style}
            onClick={() => { if (!movedRef.current) setCenter(i); }}
          >
            <div className="cf-cover" style={{ background: coverGrad(CAT_VAR[c.cat]) }}>
              <span className="cf-ring" />
              <span className="cf-word">{CAT_WORD[c.cat]}</span>
              <div className="cf-meta">
                <span className="cf-cat">{c.cat}</span>
                <b>{c.title}</b>
                <span className="cf-min">{c.min} · Alexa</span>
              </div>
            </div>
            <span className="cf-glass" style={{ opacity: hidden ? 0 : Math.min(0.85, a * 0.3) }} />
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* foundation journey                                                  */
/* ------------------------------------------------------------------ */
const DAY_MS = 2600;
function Journey() {
  const [ref, inView] = useInView(0.4);
  const prm = usePrefersReducedMotion();
  // Every week has exactly 5 days, so a single monotonic tick derives week+day.
  const [tick, setTick] = useState(0);
  const playing = inView && !prm;
  const wi = Math.floor(tick / 5) % starterWeeks.length;
  const di = tick % 5;
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setTick((x) => x + 1), DAY_MS);
    return () => clearInterval(t);
  }, [playing]);
  const week = starterWeeks[wi];
  return (
    <div className="journey" ref={ref}>
      <div className={`jbg ph-${week.ph}`} />
      <div className="jglow" />
      <div className="journey-inner">
        {/* left column re-animates on week change via key remount */}
        <div className="j-left j-anim" key={wi}>
          <div className="j-eyebrow">{week.eyebrow}</div>
          <div className="j-weeknum">0{week.n}</div>
          <div className="j-week">{week.n}. hét · 5 edzés</div>
          <p className="j-desc">{week.desc}</p>
          <div className="j-meta">Napi 30 perc · eszköz nélkül</div>
        </div>
        <div className="j-days">
          {week.rows.map((r, n) => {
            const active = n === di;
            const op = n < di ? 0.34 : n > di ? Math.max(0.24, 1 - 0.2 * (n - di)) : 1;
            return (
              // The rows look like an accordion, so they behave like one:
              // clicking a day jumps the tour to it (03 A2).
              <button
                key={n}
                type="button"
                className={`j-drow ${active ? "active" : ""}`}
                style={{ opacity: op }}
                onClick={() => setTick(wi * 5 + n)}
                aria-label={`${r.day} — ${r.title}`}
              >
                <div className="j-dhead">
                  <span className="j-dot" style={{ background: CAT_VAR[r.cat] }} />
                  <span className="j-day">{r.day}</span>
                  <span className="j-t">{r.title}</span>
                </div>
                <div className="j-card">
                  <div className="j-card-inner">
                    <div className="j-cover" style={{ background: coverGrad(CAT_VAR[r.cat]) }}>
                      <span className="j-ring" />
                      <span className="j-word">{CAT_WORD[r.cat]}</span>
                      <div className="j-cmeta">
                        <b>{r.title}</b>
                        <span>{r.code} · Foundation · 30 perc</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="j-chapters">
        {starterWeeks.map((w, n) => (
          <button
            key={n}
            className={`j-chap ${n === wi ? "on" : ""} ${n < wi ? "done" : ""} ${!playing && n === wi ? "paused" : ""}`}
            style={n === wi ? ({ "--dur": `${DAY_MS * 5}ms` } as CSSProperties) : undefined}
            aria-label={`${w.n}. hét`}
            onClick={() => setTick(n * 5)}
          >
            {/* key on the active fill restarts the CSS animation each week */}
            <span className="fill" key={n === wi ? wi : undefined} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* cinematic showcase                                                  */
/* ------------------------------------------------------------------ */
const SC_DUR = 5000;
const scCaptions = [
  "A mai edzésed egy koppintásra",
  "Mozogj együtt Alexával, valós időben",
  "A heted, felépítve — program és edzéstár",
  "Kihívások — rövid célok, gyors sikerek",
  "Lásd, milyen messzire jutottál",
];
const scSlots = [
  "Kezdőképernyő — a mai edzésed",
  "Valós idejű edzés — együtt Alexával",
  "Program — a heted egy helyen",
  "Kihívások — mini-programok",
  "Profil — lásd a fejlődésed",
];

function Showcase() {
  const [ref, inView] = useInView(0.4);
  const prm = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false); // explicit user intent
  const [i, setI] = useState(0);
  const [capI, setCapI] = useState(0);
  const [capVis, setCapVis] = useState(true);

  // Play whenever visible, not reduced-motion, and not user-paused — derived,
  // so the play/pause button and the viewport observer compose cleanly.
  const playing = inView && !prm && !paused;
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((x) => (x + 1) % scSlots.length), SC_DUR);
    return () => clearInterval(t);
  }, [playing]);
  // Caption fades out, swaps text after 250ms, fades in (scene image swaps now).
  useEffect(() => {
    const raf = requestAnimationFrame(() => setCapVis(false));
    const t = setTimeout(() => {
      setCapI(i);
      setCapVis(true);
    }, 250);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [i]);

  return (
    <div className="showcase" ref={ref}>
      <div className="sc-head">
        <button
          className={`sc-play ${playing ? "playing" : ""}`}
          aria-label={playing ? "Szünet" : "Lejátszás"}
          onClick={() => setPaused((p) => !p)}
        >
          <svg className="i-play" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          <svg className="i-pause" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
        </button>
        <span className="sc-eyebrow">Nézd meg egy perc alatt</span>
      </div>
      <div className="sc-stage">
        <div className="sc-glow" />
        <div className="device sc-device">
          <div className="notch" />
          <div className="screen sc-screen">
            {scSlots.map((label, n) => (
              <div key={n} className={`sc-scene ${n === i ? "on" : ""}`}>
                <Ph dark abs label={label} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="sc-caption" style={{ opacity: capVis ? 1 : 0 }}>
        {scCaptions[capI]}
      </div>
      <div className="sc-chapters">
        {scSlots.map((_, n) => (
          <button
            key={n}
            className={`sc-chap ${n === i ? "on" : ""} ${n < i ? "done" : ""} ${!playing && n === i ? "paused" : ""}`}
            style={n === i ? ({ "--dur": `${SC_DUR}ms` } as CSSProperties) : undefined}
            aria-label={`${n + 1}. jelenet`}
            onClick={() => setI(n)}
          >
            <span className="fill" key={n === i ? i : undefined} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* reusable feature panel                                              */
/* ------------------------------------------------------------------ */
function FeaturePanel({
  id,
  media,
  mediaFirst = false,
  icon,
  heading,
  body,
  cta = "Válaszd ki a csomagod",
}: {
  id?: string;
  media: ReactNode;
  mediaFirst?: boolean;
  icon: ReactNode;
  heading: ReactNode;
  body: string;
  cta?: string;
}) {
  const text = (
    <div className="ticon center">
      {icon}
      <h3 className="h-thin">{heading}</h3>
      <p className="body">{body}</p>
      <a className="pill pill-outline" href="#elofizetes">{cta}</a>
    </div>
  );
  const mediaEl = <div className="panel-media">{media}</div>;
  return (
    <div className="band-cream sec" id={id}>
      <div className="wrap">
        <Rise className="panel panel-pad">
          <div className="panel-grid">
            {mediaFirst ? (<>{mediaEl}{text}</>) : (<>{text}{mediaEl}</>)}
          </div>
        </Rise>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="lxl">
      <StickyNav />

      {/* HERO */}
      <header className="hero">
        <div className="hero-aura" />
        <div className="wrap">
          <div className="hero-nav">
            <span className="wordmark">LEXFIT</span>
            <nav className="links">
              <a href="#alexa">Alexa</a>
              <a href="#funkciok">Funkciók</a>
              <a href="#elofizetes">Előfizetés</a>
              <Link href="/login">Belépés</Link>
            </nav>
          </div>
          <div className="hero-body">
            <div className="hero-copy">
              <div className="hero-eyebrow">A teljes otthoni edzésprogram</div>
              <h1>A változás<br /><b>otthon kezdődik</b></h1>
              <p className="body">Napi 30 perc, eszköz nélkül. Egy program, ami tudja, hol tartasz — és egy edző, aki végig veled marad. Nőknek és férfiaknak, minden szinten.</p>
              <div className="hero-row">
                <Link className="pill pill-dark" href={CTA_START}>Összeállítom a tervem</Link>
                <a className="hero-cta2" href="#youtube">Bemutató →</a>
              </div>
              <div className="hero-price">
                Az első heted <b>{formatHuf(PRICES.week_intro.amountHuf)}</b> — utána {formatHuf(PRICES.week_std.amountHuf)}/hét, bármikor lemondható
              </div>
              <div className="hero-trust">Alexa — 10 év versenysport · 14 napos elállási jog</div>
            </div>
            <div className="hero-device">
              {/* LCP image — priority, no lazy-load. */}
              <Image
                src="/hero-alexa.jpg"
                alt="Alexa nyújtás közben a stúdióban"
                fill
                priority
                sizes="(max-width: 900px) 82vw, 320px"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* FOUNDER — the hero closes on "egy edző, aki végig veled marad";
          the next section answers "ki ő?". A creator brand converts on the
          person, so she opens the narrative; the promise-stack finale stays late. */}
      <div className="band-cream sec-first" id="alexa">
        <Rise className="wrap seq" style={{ paddingBottom: 30 }}>
          <div className="eyebrow">Az alapító</div>
          <h2 className="h-bold">Ismerd meg Alexát.</h2>
          <p className="body" style={{ marginTop: 12, maxWidth: 560 }}>Tíz év versenysport, egy összeomlás, és egy felismerés, ami közösséggé vált. Ez az ő története — és innentől a tiéd is.</p>
          <div className="starter-facts founder-facts">
            <span>10 év versenysport</span>
            <span>17 000+ fős ingyenes közösség</span>
            <span>minden edzést ő vezet</span>
          </div>
        </Rise>
        <Rise className="carousel">
          {alexaChapters.map(([role, name, grad], i) => (
            <div key={i} className="trainer-card">
              <div className="grad" style={{ background: grad }} />
              <Ph abs label={`Alexa — ${role.toLowerCase()}`} />
              <span className="role">{role}</span>
              <span className="name">{name}</span>
            </div>
          ))}
        </Rise>
      </div>

      {/* APP INTRO — person established, now the product in one sentence. */}
      <div className="band-cream sec-sm" id="funkciok">
        <div className="wrap">
          <Rise className="app-intro seq">
            <div className="eyebrow">Az app</div>
            <h2 className="h-bold" style={{ fontSize: "clamp(28px,3vw,38px)", marginTop: 10 }}>
              Minden, ami az edzéshez kell — egy appban.
            </h2>
            <p className="body" style={{ marginTop: 14 }}>
              Edzésprogram, videótár és fejlődéskövetés egy helyen. Nincs több app, nincs több kifogás — csak te, Alexa, és a következő edzésed.
            </p>
          </Rise>
        </div>
      </div>

      {/* FOLLOW-ALONG PANEL */}
      <div className="band-cream sec-sm" id="valos">
        <div className="wrap">
          <Rise className="panel panel-pad">
            <div className="panel-grid">
              <div className="panel-media">
                <div className="frame" style={{ width: 280, aspectRatio: "9 / 19.5", borderRadius: 34 }}>
                  <Ph abs label="Telefon mockup helye — később töltöm fel" />
                </div>
              </div>
              <div className="ticon center">
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3" /></svg>
                <h3 className="h-thin">edzés, amikor<br />neked jó</h3>
                <p className="body">Vezetett, követhető edzések Alexával — alsótest, felsőtest, cardio és has, teljes test, mobility. Válaszd ki a hangulatod, nyomd meg a lejátszást, és mozogj vele, mintha ott lenne a szobában.</p>
                <a className="pill pill-outline" href="#elofizetes">Válaszd ki a csomagod</a>
              </div>
            </div>
          </Rise>
        </div>
      </div>

      {/* CAST — completes the follow-along scene: the workout runs in your
          living room, in the browser, on any screen. */}
      <div className="band-navy sec">
        <div className="wrap">
          <Rise className="cast">
            <div className="cast-top">
              <div className="cast-copy">
                <div className="cast-icons">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M2 16a6 6 0 016 6M2 12a10 10 0 0110 10M2 20h.01M4 4h16v7" /><rect x="14" y="15" width="8" height="6" rx="1" /></svg>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M6 5h16v11h-8M4 20l8-9" /></svg>
                </div>
                <h3 className="h-thin" style={{ color: "#fff" }}>vidd a<br />nagy képernyőre</h3>
                <p className="body" style={{ color: "oklch(1 0 168/.8)", maxWidth: 340 }}>A LEXFIT a böngészőben fut — nem kell letölteni semmit. Egy koppintás, és az edzésed a TV-n vagy a laptopon megy tovább, Chromecasttal és AirPlay-jel.</p>
              </div>
              <div className="cast-phone">
                <div className="cast-beam" />
                <div className="cast-shot ph" style={{ position: "relative" }}>
                  <Ph abs label="Telefon — futó edzés" />
                </div>
              </div>
            </div>
            <div className="cast-tvwrap">
              <div className="cast-shot tv">
                <Ph abs label="Nappali — TV-n futó edzés" />
              </div>
            </div>
            <div className="castrow">
              <div className="dev"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2" /></svg><span className="lab">TELEFON</span></div>
              <div className="dots">
                <i /><i /><i /><i /><i /><i /><i />
                <span className="wave"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ transform: "rotate(90deg) scaleX(-1)" }} aria-hidden="true"><path d="M5 12.5a9 9 0 0114 0M8 16a5 5 0 018 0" /><circle cx="12" cy="19.5" r="1.1" fill="currentColor" stroke="none" /></svg></span>
              </div>
              <div className="dev"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1" /><path d="M8 20h8" /></svg><span className="lab">ASZTALI GÉP</span></div>
              <div className="dev"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="4" y="5" width="16" height="10" rx="1" /><path d="M2 19h20" /></svg><span className="lab">LAPTOP</span></div>
              <div className="dev"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="1" /><path d="M8 21h8" /></svg><span className="lab">OKOS TV</span></div>
            </div>
          </Rise>
        </div>
      </div>

      {/* COVERFLOW */}
      <div className="band-cream sec-sm">
        <Rise className="wrap seq">
          <h3 className="cap-title">Minden napra más edzés. Egy sem unalmas.</h3>
          <p className="cap-body">Kövesd valós időben. Mentsd a kedvenceid, és nézd, ahogy gyűlnek a befejezett edzéseid. Program, edzéstár és kihívások — sosem fogysz ki a következőből.</p>
        </Rise>
        <Rise>
          <Coverflow />
        </Rise>
      </div>

      {/* PROGRAMS PANEL */}
      <FeaturePanel
        id="programok"
        mediaFirst={false}
        icon={<svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 17l4-2 5 1 8-4 3 2v3H2z" /><path d="M6 15l1-4 4 1" /></svg>}
        heading={<>programok,<br />amik célba<br />érnek</>}
        body="Nem kell kitalálnod, mit csinálj. Kezdd el a programot, és mi végigvezetünk rajta — az első naptól az eredményig."
        media={
          <div className="frame" style={{ width: "100%", maxWidth: 340, aspectRatio: "4 / 5", borderRadius: 20 }}>
            <Ph abs label="Kép helye — később töltöm fel" />
          </div>
        }
      />

      {/* FOUNDATION JOURNEY */}
      <div className="band-cream sec-sm">
        <Rise className="wrap seq">
          <div className="starter-head">
            <span className="starter-badge">A kezdő program</span>
            <h2 className="starter-title">4 hét, ami elindít.</h2>
            <p className="cap-body">A teljes Foundation első fele: 4 hét, 20 vezetett edzés, napi fix 30 perc — eszköz nélkül. Heti 5 napra tervezve, de te választod meg, mely napokon és milyen tempóban haladsz. Két fázis vezet a forma és a szokás kialakításától az első igazi építésig.</p>
          </div>
          <div className="starter-facts">
            <span>20 edzés</span><span>fix 30 perc</span><span>eszköz nélkül</span><span>2 fázis</span><span>a te napjaidon</span>
          </div>
          <Journey />
        </Rise>
      </div>

      {/* KIHÍVÁSOK — the real challenge archive (8 mini-programs, own player) */}
      <div className="band-cream sec-sm" id="kihivasok">
        <Rise className="wrap seq">
          <h3 className="cap-title">kihívások</h3>
          <p className="cap-body">Rövid, 5–14 napos mini-programok a nagy program mellé. Válassz egyet, csináld végig a saját tempódban — és közben a sorozatod is épül.</p>
        </Rise>
        <Rise className="carousel" style={{ marginTop: 34 }}>
          {challengeCards.map((u, i) => (
            <div key={i} className="unlim-card" style={{ background: coverGrad(CAT_VAR[u.cat]) }}>
              <span className="uc-ring" />
              <span className="uc-word">{CAT_WORD[u.cat]}</span>
              <div className="uc-meta">
                <b>{u.title}</b>
                <span>{u.days} · {u.mins}</span>
              </div>
            </div>
          ))}
        </Rise>
      </div>

      {/* CINEMATIC SHOWCASE */}
      <div className="band-navy showcase-band" id="youtube">
        <div className="wrap">
          <Rise>
            <Showcase />
          </Rise>
        </div>
      </div>

      {/* PROGRESS PANEL */}
      <div className="band-cream sec" id="profil">
        <div className="wrap">
          <Rise className="panel panel-pad">
            <div className="panel-grid">
              <div className="ticon center">
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>
                <h3 className="h-thin">lásd, milyen<br />messzire jutottál</h3>
                <p className="body">Minden befejezett edzés automatikusan beszámít — nálunk a pipát nem lehet átpörgetéssel megszerezni. Egy pillantás, és látod a fejlődésed — ami látszik, az motivál.</p>
                <a className="pill pill-outline" href="#elofizetes">Válaszd ki a csomagod</a>
              </div>
              <div className="panel-media" style={{ gap: 16 }}>
                <div className="frame" style={{ flex: 1, maxWidth: 200, aspectRatio: "4 / 5", borderRadius: 18 }}>
                  <Ph abs label="Kép helye" />
                </div>
                <div className="frame" style={{ flex: 1, maxWidth: 200, aspectRatio: "4 / 5", borderRadius: 18 }}>
                  <Ph abs label="Kép helye" />
                </div>
              </div>
            </div>
          </Rise>
        </div>
      </div>

      {/* PRICE ANCHOR — the value reframe, mid-narrative */}
      <div className="band-navy sec price-anchor">
        <Rise className="wrap seq">
          <div className="eyebrow">A te árad</div>
          <div className="pa-num">
            <b><CountUp value={perWeekHuf(PRICES.annual_std.amountHuf)} /></b>
            <span>/ hét</span>
          </div>
          <p className="cap-body pa-lead">
            Ennyiért van veled Alexa minden reggel — éves tagsággal. Kevesebb, mint egy kávé, és sokkal tovább kitart.
          </p>
          <div className="pa-row">
            <span>Az első heted <b>{formatHuf(PRICES.week_intro.amountHuf)}</b></span>
            <span>Havonta <b>{formatHuf(PRICES.month_std.amountHuf)}</b></span>
            <span>Bármikor lemondható</span>
          </div>
          <Link className="pill pill-sage" href="#elofizetes">Válaszd ki a csomagod →</Link>
        </Rise>
      </div>

      {/* FOUNDER FINALE */}
      <div className="band-navy sec alexa-band">
        <Rise className="wrap seq">
          <div className="alexa-pull-big">„Egyedül nem megy.”</div>
          <div className="aq-promise">
            <span>Nem mondom meg, mit csinálj.</span>
            <span>Nem ítéllek el, ha kimaradsz.</span>
            <span>Nem játszom, hogy tökéletes vagyok.</span>
          </div>
          <div className="aq-close">Egyedül nehéz.<br />Együtt muszáj.</div>
          <div className="aq-sign">— Alexa</div>
          <Link className="pill pill-sage aq-cta" href={CTA_START}>Kezdjük együtt →</Link>
        </Rise>
      </div>

      {/* FAQ */}
      <div className="band-cream sec-sm" id="gyik">
        <Rise className="wrap seq">
          <h3 className="cap-title">Gyakori kérdések</h3>
          <div className="faq">
            {faq.map(([q, a], i) => (
              <details key={i} className="faq-item">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </Rise>
      </div>

      {/* PRICING */}
      <div className="band-sage pricing-band" id="elofizetes">
        <div className="wrap">
          <Rise className="seq" style={{ textAlign: "center", marginBottom: 44 }}>
            <span className="wordmark" style={{ color: "var(--ink)", justifyContent: "center", fontSize: 26 }}>LEXFIT</span>
            <div className="eyebrow" style={{ marginTop: 14 }}>Előfizetés</div>
            <p className="cap-body" style={{ marginTop: 10 }}>Egy előfizetés. Minden funkció. Bármikor lemondhatod.</p>
          </Rise>
          <Rise className="price-grid">
            {pricing.map((p, i) => (
              <Link
                key={i}
                href={`/subscribe?plan=${p.role}`}
                className={`price-card ${p.featured ? "featured" : ""}`}
                aria-label={`${p.plan} csomag kiválasztása`}
              >
                {p.badge && <div className="price-badge">{p.badge}</div>}
                <div className="plan">{p.plan}</div>
                <div className="rule" />
                <div className="amt">{p.amt}</div>
                <div className="cur">{p.cur}</div>
                <div className={`save ${p.saveClass ?? ""}`}>{p.save ?? " "}</div>
                <div className="fine">{p.fine}</div>
                <div className="price-pick">Ezt választom →</div>
              </Link>
            ))}
          </Rise>
          <div className="price-trust">
            <span>14 napos elállási jog</span>
            <span>Bármikor egy kattintással lemondható</span>
            <span>Biztonságos bankkártyás fizetés · Visa · Mastercard</span>
          </div>
          <div className="price-foot">
            <Link className="pill pill-dark" href={CTA_START}>Összeállítom a tervem</Link>
          </div>
        </div>
        <div className="foot">
          <div className="help">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            <span>Kérdésed van? Írj nekünk, és segítünk — <a href="mailto:team@lexfit.hu">team@lexfit.hu</a></span>
          </div>
          <div className="legal">
            <a href="#">Felhasználási feltételek</a> | <a href="#">Adatvédelem</a>
          </div>
        </div>
      </div>
    </div>
  );
}
