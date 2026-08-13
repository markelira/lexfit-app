"use client";

// LEXFIT marketing landing - rebuilt to docs/landing-analysis/05-homepage-wireframe.md
// (skeleton) + 06-homepage-copy.md (strings).
//
// Fourteen bands, one repeated action (/onboarding), Alexa threaded through all of
// them. Content comes from Firestore via the server shell in src/app/page.tsx - the
// nine invented coverflow titles and the hardcoded 4×5 Foundation calendar are gone.
//
// Styling lives in src/app/landing.css (scoped under `.lxl`).

import Image from "next/image";
import Link from "next/link";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf, perWeekHuf, annualSavingsPct } from "@/lib/pricing/display";
import { NcardModal, type CardVideo } from "@/components/NcardModal";
import { WorkoutCard } from "@/components/WorkoutCard";
import { ProgramBanner, bannerChips, bannerEyebrow, CATEGORY_WORD } from "@/components/ProgramBanner";
import { FinishExamples } from "@/components/finish/FinishExamples";
import { CookieSettingsButton } from "@/components/Analytics";
import { WeekPicker } from "@/components/landing/WeekPicker";
import { FbGroupCard } from "@/components/landing/FbGroupCard";
import { LexMark } from "@/components/LexMark";
import { PhoneVideo } from "@/components/landing/PhoneVideo";
import { ChallengeCard } from "@/components/ChallengeCard";
import { useRouter } from "next/navigation";
import { EMPTY_CATALOG, type LandingCatalog, type LandingWorkout } from "@/lib/landing-catalog";
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ------------------------------------------------------------------ */
/* shared category → color/word maps + the CourseCover gradient        */
/* ------------------------------------------------------------------ */
const CAT_VAR: Record<string, string> = {
  "Alsótest": "var(--cat-also)",
  "Felsőtest": "var(--cat-felso)",
  "Kardió + has": "var(--cat-cardio)",
  "Teljes test": "var(--cat-teljes)",
  "Mobilitás": "var(--cat-mobility)",
  "Mobilitás / nyújtás": "var(--cat-mobility)",
  "Tartás-fókusz": "var(--cat-felso)",
};
const catVar = (t: string) => CAT_VAR[t] ?? "var(--cat-also)";

/* ------------------------------------------------------------------ */
/* hooks                                                               */
/* ------------------------------------------------------------------ */
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
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
// One-shot scroll reveal - .rise → .in at 12% visibility, then unobserve.
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

// Count-up for the price-anchor number. Static under prefers-reduced-motion.
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

/* ------------------------------------------------------------------ */
/* static copy                                                         */
/* ------------------------------------------------------------------ */
const FAQ: [string, string][] = [
  [
    "Miért fizessek, ha a YouTube-on ingyen is van edzésvideó?",
    "A videó ingyen van - a sorrend nem. A LEXFIT egy felépített program: minden edzés tudja, mi jött előtte és mi jön utána, a haladásod magától követődik, és nem neked kell minden nap kitalálnod, mit csinálj. A lejátszóban ott a gyakorlatok listája időbélyeggel, teljes képernyőn látod, mi jön és mennyi van hátra, és ott folytatod, ahol abbahagytad.",
  ],
  [
    "Teljesen kezdő vagyok. Nekem való?",
    "Igen - a Foundation pontosan ide készült: lassú tempó, alapgyakorlatok, bőséges módosításokkal. A saját tempódban haladsz, és a pihenőnap nálunk a terv része.",
  ],
  [
    "Férfiként is használhatom?",
    "Igen. A LEXFIT nőknek és férfiaknak készült - a gyakorlatok saját testsúlyra épülnek, te pedig a saját szinteden és tempódban követed őket.",
  ],
  [
    "Milyen eszköz kell hozzá?",
    "Semmi - elég egy matrac.",
  ],
  [
    "Mennyi időm kell rá naponta?",
    "A program edzései jellemzően 20–30 percesek. Az edzéstárban van 5–15 perces is - azokra való a „ha csak tíz perced van” kategória. Nem a hossz visz előre, hanem hogy hétből hetet megcsinálj.",
  ],
  [
    "Mi van, ha kimaradok?",
    "Semmi. Nem kezdődik elölről, nem veszítesz el semmit, és nem kapsz érte bűntudatkeltő üzenetet. A pihenőnap eleve a terv része - az nem töri meg a sorozatot. Ha egy hetet hagysz ki, ott veszed fel, ahol abbahagytad.",
  ],
  [
    "Hogyan mondhatom le?",
    "Bármikor, egy kattintással, a profilodból. Nincs hűségidő - a lemondás után a már kifizetett időszak végéig még minden elérhető. És ha csak most nincs rá időd, nem kell lemondanod: szüneteltetheted 1–3 hónapra, vagy válthatsz olcsóbb csomagra.",
  ],
  [
    "Megy TV-n vagy laptopon is?",
    "Igen. A LEXFIT a böngészőben fut - nem kell letölteni semmit. Telefonon, laptopon és asztali gépen működik, az edzést pedig AirPlay-jel vagy Chromecasttal a TV-re is kiküldheted.",
  ],
  [
    "Kapok számlát?",
    "Igen, minden fizetésről automatikusan kapsz elektronikus számlát e-mailben.",
  ],
  [
    "Mi lesz a fotóimmal?",
    "A haladásfotóid csak a tieid. Nem látja őket más tag, nem kerülnek a közösségbe, és bármikor törölheted őket - ahogy a fiókodat és minden adatodat is, egy gombbal, a beállításokban.",
  ],
];

// Real HUF pricing - derived from the pricing config (single source of truth), so
// the landing can never drift from what Stripe charges. Annual sits in the CENTER,
// highlighted + pre-recommended.
const PRICING: {
  plan: string; role: string; amt: string; cur: string; badge?: string; save?: string; saveClass?: string; featured?: boolean; fine: ReactNode;
}[] = [
  {
    plan: "Heti", role: "week_intro",
    amt: formatHuf(PRICES.week_intro.amountHuf),
    cur: "első 7 nap",
    fine: <>utána {formatHuf(PRICES.week_std.amountHuf)}/hét, automatikusan megújul -<br />bármikor lemondhatod</>,
  },
  {
    plan: "Éves", role: "annual_std",
    amt: formatHuf(perWeekHuf(PRICES.annual_std.amountHuf)),
    cur: "/ hét",
    badge: "Legnépszerűbb",
    save: `Spórolj ${annualSavingsPct()}%`,
    saveClass: "cyan",
    featured: true,
    fine: <>{formatHuf(PRICES.annual_std.amountHuf)}/év, évente számlázva -<br />automatikusan megújul</>,
  },
  {
    plan: "Havi", role: "month_std",
    amt: formatHuf(PRICES.month_std.amountHuf),
    cur: "/ hó",
    fine: <>havonta automatikusan megújul -<br />bármikor lemondhatod</>,
  },
];

// One action, the whole page long: the 7-question funnel.
const CTA_START = "/onboarding";
const CTA_LABEL = "Összeállítom a tervem";

// Fallback for `settings/challenges.fbGroupUrl`. The group card is the only place
// the page explains what "a csoport" means, so it must not disappear because a
// settings doc is missing - that is a content gap, not a reason to drop the band.
const FB_GROUP_URL = "https://www.facebook.com/groups/2385379795277618";

/* ------------------------------------------------------------------ */
/* sticky nav + scroll-spy                                             */
/* ------------------------------------------------------------------ */
const NAV_LINKS: [string, string][] = [
  ["#hogyan", "Hogyan működik"],
  ["#programok", "Programok"],
  ["#heted", "A heted"],
  ["#kihivasok", "Kihívások"],
  ["#elofizetes", "Árak"],
];

// A 22-screen page needs a way back that isn't 22 screens of scrolling. Appears
// with the sticky nav, respects reduced motion, and clears the home indicator.
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 1600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      className={`totop ${show ? "show" : ""}`}
      aria-label="Vissza a tetejére"
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}

function StickyNav() {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState("#hogyan");
  useEffect(() => {
    const ids = NAV_LINKS.map(([h]) => h);
    const onScroll = () => {
      setShow(window.scrollY > 640);
      let cur = "#hogyan";
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
        <span className="wordmark" style={{ fontSize: 19, lineHeight: "26px" }}><LexMark />LEXFIT</span>
        <nav className="links">
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href} className={active === href ? "active" : ""}>
              {label}
            </a>
          ))}
        </nav>
        <Link className="mini" href={CTA_START}>
          {CTA_LABEL} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* §6 Foundation journey - real sessions, grouped in fives             */
/* ------------------------------------------------------------------ */
// 2.6s was faster than reading a Hungarian workout title plus its metadata line.
const DAY_MS = 4200;
const GROUP = 5; // presentation grouping only - NOT an authored week

function Journey({ catalog, onPick }: { catalog: LandingCatalog; onPick: (w: LandingWorkout) => void }) {
  const byCode = useMemo(() => new Map(catalog.workouts.map((w) => [w.code, w])), [catalog.workouts]);
  const [ref, inView] = useInView(0.4);
  const prm = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);

  // Chunk the real playlist into blocks of five. This is a display device: the
  // program is an ordered pool, so the label is "1–5. edzés", never "1. hét".
  const blocks = useMemo(() => {
    const s = catalog.entry?.sessions ?? [];
    const out: { from: number; to: number; phaseIdx: number | null; rows: typeof s }[] = [];
    for (let i = 0; i < s.length; i += GROUP) {
      const rows = s.slice(i, i + GROUP);
      out.push({ from: i + 1, to: i + rows.length, phaseIdx: rows[0]?.phaseIdx ?? null, rows });
    }
    return out.slice(0, 4);
  }, [catalog.entry]);

  const total = blocks.reduce((n, b) => n + b.rows.length, 0);
  const playing = inView && !prm && total > 0;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setTick((x) => x + 1), DAY_MS);
    return () => clearInterval(t);
  }, [playing]);

  if (!blocks.length) return null;

  // Walk the flat tick into (block, row).
  let acc = 0;
  let bi = 0;
  let di = 0;
  const pos = total ? tick % total : 0;
  for (let i = 0; i < blocks.length; i++) {
    if (pos < acc + blocks[i].rows.length) { bi = i; di = pos - acc; break; }
    acc += blocks[i].rows.length;
  }
  const block = blocks[bi];
  const phase = catalog.entry?.phases.find((p) => p.idx === block.phaseIdx) ?? null;
  const startOf = (n: number) => blocks.slice(0, n).reduce((s, b) => s + b.rows.length, 0);

  return (
    <div className="journey" ref={ref}>
      <div className={`jbg ${block.phaseIdx && block.phaseIdx > 0 ? "ph-epites" : "ph-alap"}`} />
      <div className="jglow" />
      <div className="journey-inner">
        <div className="j-left j-anim" key={bi}>
          <div className="j-eyebrow">{phase ? `${phase.icon} ${phase.name} fázis` : "Foundation"}</div>
          <div className="j-weeknum">{String(bi + 1).padStart(2, "0")}</div>
          <div className="j-week">{block.from}–{block.to}. edzés</div>
          <p className="j-desc">{phase?.desc ?? catalog.entry?.synopsis ?? ""}</p>
          <div className="j-meta">20–30 perc · eszköz nélkül</div>
        </div>
        <div className="j-days">
          {block.rows.map((r, n) => {
            const active = n === di;
            const op = n < di ? 0.34 : n > di ? Math.max(0.24, 1 - 0.2 * (n - di)) : 1;
            const card = byCode.get(r.code);
            return (
              // The header is the button; the card is a sibling. WorkoutCard contains
              // its own buttons, so it can never be nested inside one.
              <div key={r.code} className={`j-drow ${active ? "active" : ""}`} style={{ opacity: op }}>
                <button
                  type="button"
                  className="j-dhead"
                  aria-expanded={active}
                  onClick={() => setTick(startOf(bi) + n)}
                >
                  <span className="j-dot" style={{ background: catVar(r.theme) }} />
                  <span className="j-day">{r.order + 1}.</span>
                  <span className="j-t">{r.title}</span>
                </button>
                <div className="j-card">
                  <div className="j-card-inner">
                    {/* The real app card, on the app's own tokens remapped for a dark
                        surface - same object the visitor meets after they join. */}
                    <div className="lx lx-embed j-wc">
                      {card && (
                        <WorkoutCard
                          v={card}
                          isProgram
                          programStep={r.order + 1}
                          programTotal={catalog.entry?.sessionCount ?? block.rows.length}
                          programHue={card.programHue}
                          saved={false}
                          onPlay={() => onPick(card)}
                          onToggleSave={() => {}}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="j-chapters">
        {blocks.map((b, n) => (
          <button
            key={n}
            className={`j-chap ${n === bi ? "on" : ""} ${n < bi ? "done" : ""} ${!playing && n === bi ? "paused" : ""}`}
            style={n === bi ? ({ "--dur": `${DAY_MS * b.rows.length}ms` } as CSSProperties) : undefined}
            aria-label={`${b.from}–${b.to}. edzés`}
            onClick={() => setTick(startOf(n))}
          >
            {/* The visual is a 4px track; the BUTTON is 44px tall so it can actually
                be tapped (WCAG 2.5.8 / HIG). The track is a child so the fill
                animation keeps its own transform. */}
            <span className="j-track">
              <span className="fill" key={n === bi ? bi : undefined} />
            </span>
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
  extra,
  cta = CTA_LABEL,
}: {
  id?: string;
  media: ReactNode;
  mediaFirst?: boolean;
  icon: ReactNode;
  heading: ReactNode;
  body: ReactNode;
  extra?: ReactNode;
  cta?: string;
}) {
  const text = (
    <div className="ticon center">
      {icon}
      <h3 className="h-thin">{heading}</h3>
      <div className="body">{body}</div>
      {extra}
      <Link className="pill pill-outline" href={CTA_START}>{cta}</Link>
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
export default function LandingPage({ catalog = EMPTY_CATALOG }: { catalog?: LandingCatalog }) {
  // ChallengeCard's onOpen takes a slug, not an href - logged out there is nothing
  // to open, so the card starts the funnel like every other CTA on the page.
  const router = useRouter();
  const [open, setOpen] = useState<LandingWorkout | null>(null);
  // Where the panel should grow from - the card the user actually tapped.
  const [origin, setOrigin] = useState<{ x: number; y: number } | undefined>();
  // WorkoutCard's onPlay doesn't carry the event, so the rect is captured from a
  // wrapper on the way down rather than changing the shared component's signature.
  const noteOrigin = (el: Element | null) => {
    if (!el) return setOrigin(undefined);
    const r = el.getBoundingClientRect();
    setOrigin({
      x: Math.round(((r.left + r.width / 2) / window.innerWidth) * 100),
      y: Math.round(((r.top + r.height / 2) / window.innerHeight) * 100),
    });
  };

  const toCard = (w: LandingWorkout): CardVideo => ({
    code: w.code, title: w.title, theme: w.theme, mins: w.mins, level: w.level,
    format: w.format, types: w.types, blocks: w.blocks, phase: w.phase,
  });

  // Adaptation chips (§3). Firestore taxonomy wins; the fallback keeps the section
  // meaningful on an empty database rather than rendering an empty row.
  const typeChips = (catalog.typeOptions.length
    ? catalog.typeOptions
    : ["🔇 Csendes", "🪑 Falra fogva", "🧘 Lazító", "🌅 Reggeli", "🌙 Esti"]
  ).slice(0, 5);

  const { programs, workouts, challenges, counts, entry, fbGroupUrl } = catalog;

  return (
    <div className="lxl">
      <StickyNav />
      <BackToTop />

      {/* ═══ 1 · HERO ═══════════════════════════════════════════════
          Rebuilt 2026-08-11 (apple-design). Owner decisions: viewport-height ·
          no motion at all · trust row cut · photo stays a standalone object
          beside the copy, NOT a background (full-bleed was tried and rejected).
          `.hero-aura` and both infinite loop animations are gone. */}
      <header className="hero">
        <div className="wrap hero-inner">
          <div className="hero-nav">
            <span className="wordmark"><LexMark />LEXFIT</span>
            <nav className="links">
              <a href="#hogyan">Hogyan működik</a>
              <a href="#programok">Programok</a>
              <a href="#alexa">Alexa</a>
              <a href="#elofizetes">Árak</a>
              <Link href="/login">Belépés</Link>
            </nav>
          </div>
          <div className="hero-body">
          <div className="hero-copy">
            <div className="hero-eyebrow">Otthoni edzésprogram, magyarul</div>
            <h1>A változás<br /><b>otthon kezdődik</b></h1>
            <p className="body">Napi 20–30 perc, eszköz nélkül - elég egy matrac. Egy program, ami tudja, hol tartasz, és valaki, aki végigcsinálja veled. Nőknek és férfiaknak, minden szinten.</p>
            <div className="hero-row">
              <Link className="pill pill-dark" href={CTA_START}>{CTA_LABEL}</Link>
              <a className="hero-cta2" href="#hogyan">Hogyan működik →</a>
            </div>
            <div className="hero-price">
              Az első heted <b>{formatHuf(PRICES.week_intro.amountHuf)}</b> - utána {formatHuf(PRICES.week_std.amountHuf)}/hét. Bármikor lemondható.
            </div>
          </div>
          <div className="hero-device">
            {/* LCP image - priority, no lazy-load. */}
            <Image
              src="/hero-alexa-cover.jpg"
              alt="Alexa nyújtás közben a stúdióban"
              fill
              priority
              sizes="(max-width: 900px) 82vw, 420px"
              style={{ objectFit: "cover" }}
            />
          </div>
          </div>
        </div>
      </header>

      {/* ═══ 2 · HOGYAN MŰKÖDIK ═════════════════════════════════════ */}
      <div className="band-cream sec-first" id="hogyan">
        <div className="wrap">
          <Rise className="seq" style={{ textAlign: "center" }}>
            <div className="eyebrow">Hogyan működik</div>
            <h2 className="h-bold" style={{ marginTop: 10 }}>Hét kérdés, és kész a heted.</h2>
            <p className="cap-body">
              Nem kell tudnod, hol kezdd. Megkérdezem, mennyi idő fér bele, mikor a legjobb neked, és mire figyeljek - a többit bízd rám.
            </p>
          </Rise>
          {/* The three real screens, in order. All 772×1664 - the same device, the
              same capture settings - so the row reads as one journey rather than
              three unrelated pictures. The frame's 9:19.5 crops <0.5%. */}
          <Rise className="steps seq">
            {[
              {
                h: "Válaszolsz hét kérdésre",
                b: "Mi hozott ide, hol tartasz most, hány nap fér bele, mire figyeljek. Nagyjából egy perc.",
                src: "/step-1-question.png",
                alt: "A 6. kérdés: „Van bármi, amire figyeljek?” - csendben kell, van falam, kíméld a térdem, vigyázz a hátamra.",
              },
              {
                h: "Összeáll a heted",
                b: "Annyi nappal, amennyi tényleg belefér. A pihenőnap is benne van - az is a terv része.",
                src: "/step-2-plan.png",
                alt: "A kész heti terv: 3 nap / hét, a kiválasztott napokkal, fókusszal és tempóval.",
              },
              {
                h: "Megnyomod a playt",
                b: "Onnantól minden nap ott van, mi következik. Nem neked kell kitalálnod.",
                src: "/step-3-player.png",
                alt: "A lejátszó edzés közben: visszaszámláló, az aktuális gyakorlat és a mai menü listája.",
              },
            ].map((s, i) => (
              <div className="step" key={s.h}>
                <span className="step-n">{i + 1}</span>
                <div className="frame step-shot">
                  <Image src={s.src} alt={s.alt} fill sizes="(max-width: 900px) 68vw, 208px" />
                </div>
                <b className="step-h">{s.h}</b>
                <p className="step-b">{s.b}</p>
              </div>
            ))}
          </Rise>
          <Rise style={{ textAlign: "center", marginTop: 26 }}>
            <p className="step-kicker">A heted azelőtt látod, hogy fiókot csinálnál.</p>
            <Link className="pill pill-outline" href={CTA_START} style={{ marginTop: 16 }}>{CTA_LABEL}</Link>
          </Rise>
        </div>
      </div>

      {/* ═══ 3 · PROGRAMOK ══════════════════════════════════════════ */}
      <div className="band-cream sec-sm" id="programok">
        <Rise className="wrap seq">
          <h3 className="cap-title">Nem egy program. Az összes.</h3>
          <p className="cap-body">
            {counts.programs > 0 && counts.workouts > 0
              ? <>A terved ezekből áll össze: {counts.programs} program, {counts.workouts} edzés - és egy előfizetés, amiben mind benne van. Kezdd az elején, vagy válaszd azt, ami most kell. Ami új jön, azt is megkapod.</>
              : <>A terved ezekből áll össze: több felépített program, egy előfizetésben. Kezdd az elején, vagy válaszd azt, ami most kell. Ami új jön, azt is megkapod.</>}
          </p>
        </Rise>

        {/* The real app components, rendered 1:1 - the same ProgramBanner that
            /app/programs uses and the same WorkoutCard as the dashboard rows.
            `.lx-embed` neutralises the app shell's background so the cream band
            shows through; everything else is the app's own styling. */}
        {/* An outage used to make this section vanish silently. Say something instead. */}
        {programs.length === 0 && workouts.length === 0 && (
          <Rise className="wrap" style={{ textAlign: "center", marginTop: 26 }}>
            <p className="cap-body" style={{ marginTop: 0 }}>
              A programlista épp nem elérhető. Frissítsd az oldalt, vagy nézd meg pár perc múlva.
            </p>
          </Rise>
        )}

        {(programs.length > 0 || workouts.length > 0) && (
          <div className="wrap lx lx-embed">
            {programs.length > 0 && (
              // Compact two-up variant of the app's banner: same identity (hue,
              // watermark, lockup), scaled for a marketing page where seven
              // full-height billboards would eat the whole scroll. No CTA button -
              // the whole card is the link.
              <Rise className="pgs-grid" style={{ marginTop: 34 }}>
                {programs.map((p) => (
                  <Link key={p.slug} href={CTA_START} className="pgs-card" aria-label={`${p.hu} - kezdd el`}>
                    <ProgramBanner
                      slug={p.slug}
                      title={p.title}
                      name={p.hu}
                      hue={p.hue}
                      eyebrow={bannerEyebrow([
                        CATEGORY_WORD[p.category] ?? p.category?.toUpperCase() ?? "PROGRAM",
                        p.sessionCount > 0 ? `${p.sessionCount} EDZÉS` : "HAMAROSAN",
                      ])}
                      synopsis={p.synopsis}
                      chips={bannerChips(p).slice(0, 2)}
                    />
                  </Link>
                ))}
              </Rise>
            )}

            {workouts.length > 0 && (
              <Rise className="hrow-sec" style={{ marginTop: 44 }}>
                <div className="hrow-head">
                  {/* The row is the entry program's playlist now, so the heading says so
                      rather than implying a random slice of the library. */}
                  <h3>Így néznek ki az edzések</h3>
                </div>
                <div
                  className="hrow"
                  // Origin is read off the tapped card here rather than from a wrapper
                  // element - `.hrow > .wc` must stay a direct-child relationship.
                  onClickCapture={(e) => noteOrigin((e.target as HTMLElement).closest(".wc"))}
                >
                  {workouts.map((w) => (
                    <WorkoutCard
                      key={w.code}
                      v={w}
                      programHue={w.programHue}
                      saved={false}
                      // Logged out: the card opens the detail overlay instead of
                      // playing. The save control is hidden in CSS (no list exists),
                      // so this handler is never reachable.
                      onPlay={() => setOpen(w)}
                      onToggleSave={() => {}}
                    />
                  ))}
                </div>
                <p className="cap-body" style={{ marginTop: 18 }}>
                  {entry ? `A ${"kezdő program"} edzései, sorrendben. ` : ""}Koppints egy edzésre, és megnézheted, mi van benne.
                </p>
              </Rise>
            )}
          </div>
        )}
      </div>

      {/* ═══ 4 · ÁR-HORGONY ═════════════════════════════════════════
          Directly under the catalog, on purpose: the anchor only works if the
          visitor is still holding the number it is anchoring against - "all of
          this" is on screen one band up. The weekly entry leads because that is
          the decision being made here (start / don't start); the annual per-week
          stays in the fine row so the cheaper long game is visible without the
          page asking for a year of commitment before the story is told. */}
      <div className="band-navy sec price-anchor">
        <Rise className="wrap seq">
          <div className="eyebrow">A te árad</div>
          <h3 className="pa-num">
            <b><CountUp value={PRICES.week_intro.amountHuf} /></b>
            <span>/ első hét</span>
          </h3>
          <p className="cap-body pa-lead">
            Ennyiért nyílik ki az egész: minden program, minden edzés. Utána {formatHuf(PRICES.week_std.amountHuf)} hetente - és ha nem neked való, egy kattintás a lemondás.
          </p>
          <div className="pa-row">
            <span>Utána <b>{formatHuf(PRICES.week_std.amountHuf)}</b> / hét</span>
            <span>Évesen <b>{formatHuf(perWeekHuf(PRICES.annual_std.amountHuf))}</b> / hét</span>
            <span>Szüneteltethető</span>
            <span>Bármikor lemondható</span>
          </div>
          <Link className="pill pill-sage" href="#elofizetes">Válaszd ki a csomagod →</Link>
        </Rise>
      </div>

      {/* ═══ 5 · EDZÉS ALEXÁVAL (+ alkalmazkodás) ═══════════════════ */}
      <FeaturePanel
        id="valos"
        mediaFirst
        icon={<svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3" /></svg>}
        heading={<>edzés, ahogy<br />neked jó</>}
        body={
          <>
            <p>Vezetett edzések velem - alsótest, felsőtest, kardió és has, teljes test, mobilitás. Megnyomod a playt, és csinálod velem, mintha ott lennék a szobában.</p>
            <p style={{ marginTop: 14 }}>És ha a lakás nem engedi, van rá változat. Csendes edzések ugrálás nélkül, falra vagy székre támaszkodva, kíméletes variációkkal. Nem ugyanaz halkabban. Külön kategória.</p>
          </>
        }
        extra={
          <div className="starter-facts" style={{ justifyContent: "flex-start", marginBottom: 4 }}>
            {typeChips.map((t) => <span key={t}>{t}</span>)}
          </div>
        }
        media={
          // A real recording of the mobile player mid-workout - the ticking
          // countdown, the current exercise and the Mai menü checking itself off.
          // The source is 774×1658, so it fills the 9:19.5 frame with a ~1% crop.
          <div className="frame phone-frame" style={{ width: 280, aspectRatio: "9 / 19.5", borderRadius: 34 }}>
            <PhoneVideo
              src="/player-demo.mp4"
              poster="/player-demo-poster.jpg"
              label="A LEXFIT lejátszója edzés közben: visszaszámláló, az aktuális gyakorlat és a mai menü."
            />
          </div>
        }
      />

      {/* ═══ 6 · NAGY KÉPERNYŐ ══════════════════════════════════════ */}
      <div className="band-navy sec">
        <div className="wrap">
          <Rise className="cast">
            <div className="cast-copy">
              <div className="cast-icons">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M2 16a6 6 0 016 6M2 12a10 10 0 0110 10M2 20h.01M4 4h16v7" /><rect x="14" y="15" width="8" height="6" rx="1" /></svg>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M6 5h16v11h-8M4 20l8-9" /></svg>
              </div>
              <h3 className="h-thin" style={{ color: "#fff" }}>a nappali<br />a legnagyobb képernyőd</h3>
              <p className="body" style={{ color: "oklch(1 0 168/.8)", maxWidth: 420 }}>A lakás nem korlát. A LEXFIT a böngészőben fut, nem kell letöltened semmit: egy koppintás, és az edzésed a TV-n vagy a laptopon megy tovább, Chromecasttal és AirPlay-jel.</p>
              <p className="body" style={{ color: "oklch(1 0 168/.62)", maxWidth: 420, marginTop: 10 }}>Telefonon kezded, a nappaliban fejezed be.</p>
            </div>

            {/* ONE stage: the phone is positioned inside the TV's own box, so
                "sit at the bottom of the TV" is expressible as a percentage instead
                of a negative margin guessed against another row's height. */}
            <div className="cast-stage">
              <div className="cast-shot tv">
                <Image src="/cast-tv.jpg" alt="A LEXFIT edzés a nappali TV-jén" fill sizes="(max-width: 900px) 92vw, 660px" style={{ objectFit: "cover" }} />
              </div>
              <div className="cast-shot phone">
                <Image src="/cast-phone.jpg" alt="Ugyanaz az edzés a telefonon, TV-re küldés gombbal" fill sizes="(max-width: 900px) 34vw, 212px" style={{ objectFit: "cover" }} />
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

      {/* ═══ 7 · FOUNDATION ═════════════════════════════════════════ */}
      {entry && entry.sessions.length > 0 && (
        <div className="band-cream sec-sm">
          <Rise className="wrap seq">
            <div className="starter-head">
              <span className="starter-badge">A kezdő program</span>
              <h2 className="starter-title">Innen indulsz.</h2>
              {/* The program's display name is authored in /admin and is often all-caps,
                  so it is deliberately NOT interpolated into this sentence. */}
              <p className="cap-body">
                Akárhol nézed, ugyanott kezdődik. Az alapoktól épít: lassú tempó, alapgyakorlatok, bőséges módosításokkal.{" "}
                {entry.sessionCount} edzés, sorrendben - de te döntöd el, mely napokon és milyen ütemben mész végig rajta.
              </p>
            </div>
            <div className="starter-facts">
              <span>{entry.sessionCount} edzés</span><span>20–30 perc</span><span>eszköz nélkül</span>
              {entry.phases.length > 0 && <span>{entry.phases.length} fázis</span>}
              <span>a te napjaidon</span>
            </div>
            <Journey catalog={catalog} onPick={setOpen} />
          </Rise>
        </div>
      )}

      {/* ═══ 8 · A HETED ════════════════════════════════════════════ */}
      <div className="band-navy sec heted-band" id="heted">
        <Rise className="wrap seq">
          <div className="eyebrow" style={{ color: "#fff", opacity: 0.7 }}>A heted</div>
          <h2 className="starter-title" style={{ color: "#fff" }}>Három nap is elég.</h2>
          <p className="cap-body" style={{ color: "oklch(1 0 168/.74)" }}>
            A legtöbb terv heti ötöt ír elő, aztán a második héten megbukik rajta. Itt te választod ki, hány nap fér bele és melyek azok - a terv ehhez igazodik, nem fordítva.
          </p>
          <WeekPicker />
          <p className="cap-body" style={{ color: "oklch(1 0 168/.74)" }}>
            És ha kimaradsz, nem kezdődik elölről. A pihenőnap nem töri meg a sorozatot - az is a terv része.
          </p>
          <Link className="pill pill-sage" href={CTA_START}>{CTA_LABEL}</Link>
        </Rise>
      </div>

      {/* ═══ 9 · AMIKOR KÉSZ VAGY ═══════════════════════════════════
          Rebuilt 2026-08-11, then MOVED here (from band 9) the same day. It sells
          Finish Share - the post-workout selfie with the workout's numbers stamped
          on it - and was doing so from the SMALLEST heading tier on the page
          (.cap-title, 23px) with one sentence and an empty <p>. Promoted to
          .h-bold (34px, an existing ramp step - no new size invented).
          Sitting third, straight after "hét kérdés, és kész a heted", it now shows
          the PAYOFF before the product tour: this is what finishing looks like.
          Side effect: it also breaks up the navy run that A heted and this band
          formed when they were adjacent. */}
      <div className="band-cream sec finish-band">
        <div className="wrap">
          <Rise className="seq" style={{ textAlign: "center" }}>
            <div className="eyebrow">Amikor kész vagy</div>
            <h3 className="h-bold" style={{ marginTop: 10 }}>Megcsináltad. Mutasd meg.</h3>
            <p className="cap-body">
              Az edzés végén ott a kártyád: hány gyakorlat, mennyi idő, hányadik nap a sorozatban. Készíts hozzá egy szelfit - a számok rákerülnek a képre, te mozgatod őket, és te döntöd el, melyik szám legyen a főszereplő.
            </p>
            <p className="cap-body" style={{ marginTop: 14 }}>
              A kép a telefonodon marad. Nem töltjük fel, nem tároljuk - csak az megy tovább, amit te küldesz el. És ha nincs kedved szelfizni, kihagyod: az edzés ugyanannyit ér.
            </p>
            <div className="starter-facts" style={{ marginTop: 22 }}>
              <span>kihagyható</span>
            </div>
          </Rise>
        </div>
        <Rise style={{ marginTop: 34 }}>
          <FinishExamples onPick={() => { window.location.href = CTA_START; }} />
        </Rise>
        <div className="wrap">
          <Rise style={{ textAlign: "center", marginTop: 20 }}>
            {/* The photos are real, consented members; the numbers on them are
                illustrative. Saying so is what keeps these from reading as
                testimonials - the per-card "· minta" label alone is 11px. */}
            <p className="cap-body" style={{ fontSize: 14 }}>
              A fotók valódi tagoké, az ő engedélyükkel.
            </p>
            <Link className="pill pill-sage" href={CTA_START} style={{ marginTop: 24 }}>{CTA_LABEL}</Link>
          </Rise>
        </div>
      </div>

      {/* ═══ 10 · KIHÍVÁSOK + KÖZÖSSÉG ══════════════════════════════
          Rebuilt 2026-08-11. The copy always said "amit a csoportban kitalálunk"
          while the page never showed that a group exists - a cold visitor had no
          way to know what "a csoport" referred to. The group now identifies itself
          the way a group card does, and the archive below renders the app's real
          ChallengeCard instead of the landing-only lookalike. */}
      <div className="band-navy sec-sm" id="kihivasok">
        <Rise className="wrap seq">
          <h3 className="cap-title" style={{ color: "var(--tx-d1)" }}>Amit a csoportban kitaláltunk - mind megvan.</h3>
          {/* Short on purpose: the cover below already says "heti kihívás, együtt
              döntünk, együtt csináljuk", so spelling the mechanic out here twice
              only costs height. */}
          <p className="cap-body" style={{ color: "var(--tx-d2)" }}>
            Ismered a heti kihívásokat - együtt szavazzuk meg őket. Ami eddig elveszett a csoport görgetésében, az itt mind megvan: bármikor elővehető, és a napjaid ugyanabba a sorozatba számítanak, mint a többi edzésed.
          </p>
        </Rise>

        <Rise className="wrap" style={{ marginTop: 22 }}>
          <FbGroupCard url={fbGroupUrl ?? FB_GROUP_URL} />
        </Rise>

        {/* The archive, in the app's own card. `.lx-embed` neutralises the app shell
            background so the cream band shows through; the save control is hidden in
            CSS because a logged-out visitor has no list. The heading lives inside the
            `.lx` wrapper because `.hrow-head` is an app-scoped style. */}
        {challenges.length > 0 && (
          <div className="wrap lx lx-embed">
            <Rise className="hrow-sec" style={{ marginTop: 30 }}>
              <div className="hrow-head">
                <h3 style={{ color: "var(--tx-d1)" }}>Eddig ezeket találtuk ki</h3>
                <span className="ch-count">{challenges.length} kihívás</span>
              </div>
              <div className="chrow">
                {challenges.map((c) => (
                  <ChallengeCard
                    key={c.slug}
                    c={{ ...c, doneCount: 0, state: "elkezdetlen", progressFrac: 0, completedAt: null }}
                    saved={false}
                    onOpen={() => router.push(CTA_START)}
                    onToggleSave={() => {}}
                  />
                ))}
              </div>
            </Rise>
          </div>
        )}
      </div>

      {/* ═══ 11 · GYIK ══════════════════════════════════════════════ */}
      <div className="band-cream sec-sm" id="gyik">
        <Rise className="wrap seq">
          <h3 className="cap-title">Mielőtt belevágsz.</h3>
          {/* Catches "csoport" from the band above so the FAQ arrives as a
              continuation of the conversation rather than as admin. */}
          <p className="cap-body">Ezek jönnek a legtöbbször - a csoportban is, e-mailben is.</p>
          <div className="faq">
            {FAQ.map(([q, a]) => (
              <details key={q} className="faq-item">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </Rise>
      </div>

      {/* ═══ 12 · ALEXA - the peak ══════════════════════════════════ */}
      <section className="alexa-hero" id="alexa" aria-labelledby="alexa-headline">
        <div className="ax-photo">
          <Image
            src="/alexa-gymnastics.jpg"
            alt="Alexa gimnasztika-pózban, stúdióban"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="ax-scrim" />
        {/* The label + pull quote are a SIBLING of the photo, not inside the copy
            block - that is what lets mobile order them above the image while desktop
            keeps the whole column stacked at the bottom-left. */}
        <Rise className="wrap ax-head seq">
          <div className="ax-headin">
            <div className="eyebrow" style={{ color: "#fff", opacity: 0.72 }}>Az alapító</div>
            {/* The pull quote is the hinge: her ten years and a missed Wednesday are the
                same feeling - that stopping makes you a traitor. The account she lived
                is the SOURCE of this copy, not its content: no incident is retold, only
                what it taught her. That also removes every identifying detail. */}
            <h2 className="alexa-pull-big" id="alexa-headline">„Amikor újrakezdtem,<br />otthon kezdtem.”</h2>
          </div>
        </Rise>
        <div className="wrap">
          <Rise className="ax-inner seq">
            <div className="ax-story">
              <p>Ritmikus gimnasztika, heti hat edzés, tíz éven át. Szerettem. Aztán egyszer csak nem.</p>
              <p>Nem sérülés volt. Nem is lustaság. Egyszerűen elfogyott - és amikor kimondtam, kiderült, hogy ott a kilépés nem döntés. Hálátlanság.</p>
              <p>Tíz év kellett hozzá, hogy megértsem: nem a mozgással volt bajom. Azzal, hogy soha nem az enyém volt.</p>
              <p>Amikor újrakezdtem, otthon kezdtem. Nulláról, egy matracon. Senki nem nézte, senki nem mérte, senki nem kérte számon. És ott jöttem rá, mi hiányzott végig. Nem a fegyelem - abból volt bőven. Hanem hogy a mozgás az enyém legyen.</p>
              <p>Ezért van ez az app. Nem azért, hogy még valaki számonkérjen egy kihagyott napot - hanem azért, hogy ne kelljen megmagyaráznod. A pihenőnap itt nem engedmény. A terv része.</p>
              <p>Nem vagyok orvos, és nem vagyok gyógytornász - csodát nem ígérek. Azt viszont igen, hogy végig ott leszek veled, és olyan tempót tartunk, amihez holnap is lesz kedved.</p>
            </div>
            <div className="starter-facts founder-facts">
              <span>10 év versenysport</span>
              <span>minden edzést én vezetek</span>
              <span>1 200+ fős közösség</span>
            </div>
            <ul className="aq-promise">
              <li>Nem mondom meg, mit csinálj.</li>
              <li>Nem ítéllek el, ha kimaradsz.</li>
              <li>Nem játszom, hogy tökéletes vagyok.</li>
            </ul>
            <p className="aq-close">Egyedül nehéz.<br />Együtt muszáj.</p>
            <p className="aq-sign">- Alexa</p>
            <Link className="pill pill-sage aq-cta" href={CTA_START}>Kezdjük együtt →</Link>
          </Rise>
        </div>
      </section>

      {/* ═══ 13 · ELŐFIZETÉS + FOOTER ═══════════════════════════════ */}
      <div className="band-sage pricing-band" id="elofizetes">
        <div className="wrap">
          <Rise className="seq" style={{ textAlign: "center", marginBottom: 44 }}>
            <span className="wordmark" style={{ color: "var(--ink)", justifyContent: "center", fontSize: 26, lineHeight: "33px" }}><LexMark />LEXFIT</span>
            <div className="eyebrow" style={{ marginTop: 14 }}>Előfizetés</div>
            <h3 className="cap-title" style={{ marginTop: 10 }}>Kezdjük.</h3>
            <p className="cap-body">Egy előfizetés. Minden program, minden edzés, minden kihívás. Bármikor lemondhatod.</p>
          </Rise>
          <Rise className="price-grid">
            {PRICING.map((p) => (
              <Link
                key={p.role}
                href={CTA_START}
                className={`price-card ${p.featured ? "featured" : ""}`}
                aria-label={`${p.plan} csomag kiválasztása`}
              >
                {p.badge && <div className="price-badge">{p.badge}</div>}
                <div className="plan">{p.plan}</div>
                <div className="rule" />
                <div className="amt">{p.amt}</div>
                <div className="cur">{p.cur}</div>
                <div className={`save ${p.saveClass ?? ""}`}>{p.save ?? " "}</div>
                <div className="fine">{p.fine}</div>
                <div className="price-pick">Ezt választom →</div>
              </Link>
            ))}
          </Rise>
          <div className="price-trust">
            <span>14 napos elállási jog</span>
            <span>Bármikor lemondható vagy szüneteltethető</span>
            <span>Elektronikus számla</span>
            <span>Biztonságos bankkártyás fizetés · Visa · Mastercard</span>
          </div>
          <div className="price-foot">
            <Link className="pill pill-dark" href={CTA_START}>{CTA_LABEL}</Link>
          </div>
        </div>
        <div className="foot">
          <div className="help">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            <span>Kérdésed van? Írj nekünk, és segítünk - <a href="mailto:hi@lexfit.hu">hi@lexfit.hu</a></span>
          </div>
          <div className="legal">
            <a href="/aszf">Felhasználási feltételek</a> | <a href="/adatvedelem">Adatvédelem</a> |{" "}
            <a href="/impresszum">Impresszum</a> | <CookieSettingsButton className="lx-cookie-btn" />
          </div>
        </div>
      </div>

      {/* ═══ OVERLAY · workout detail ═══════════════════════════════ */}
      {open && (
        <NcardModal
          video={toCard(open)}
          pool={workouts.filter((w) => w.code !== open.code).map(toCard)}
          saved={false}
          onToggleSave={() => {}}
          onClose={() => setOpen(null)}
          onPlay={() => { window.location.href = CTA_START; }}
          origin={origin}
          program={open.program ?? "foundation"}
          programName={open.programName}
          programHue={open.programHue}
          publicMode
        />
      )}
    </div>
  );
}
