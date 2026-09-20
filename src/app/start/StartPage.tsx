"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { marketingContext, trackProgramCheckout, trackProgramPreview, trackProgramView } from "@/lib/track";
import { formatHuf } from "@/lib/pricing/display";
import type { WorkoutCardVideo } from "@/components/WorkoutCard";
import { ProgramShelf } from "./ProgramShelf";
import { PreviewModal } from "./PreviewModal";
import { FinishExamples } from "@/components/finish/FinishExamples";
import { START } from "./copy";
import "../ujrakezdes/ujrakezdes.css"; // the shared look: .lxu / .lp-* bands
import "./start.css";                  // only what the pay panel adds

const PAY = "/start/fizetes";

/**
 * /start - the product page for the one-time Foundation purchase (P1).
 *
 * Built inside `.lxu lp`, the lead magnet's own layer, so the two ad landings
 * share one visual system instead of drifting apart. No navigation: a nav on an
 * ad landing page is a row of exits.
 *
 * Every CTA leads to /start/fizetes. The checkout used to open in a panel
 * here, which left the whole argument on screen behind the card form - and at
 * the payment step every remaining element is a reason to stop. A separate
 * page also makes the step a real funnel event rather than an inferred one.
 */
export function StartPage({ workouts }: { workouts: WorkoutCardVideo[] }) {
  const sessionCount = workouts.length;
  const router = useRouter();
  /** Which workout is open for a look, if any. */
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => { trackProgramView(START.slug); }, []);

  const perSession = formatHuf(Math.round(START.priceHuf / Math.max(1, sessionCount)));

  /** Every ask leads to the same place. The checkout, its consent and the
   *  in-app-browser fallback all live on the pay page now, so this page has no
   *  payment state to get wrong. */
  const go = useCallback(
    (where: string) => {
      trackProgramCheckout(START.role, where);
      router.push(PAY);
    },
    [router],
  );

  const Cta = ({ where, small }: { where: string; small?: boolean }) => (
    <button
      type="button"
      className={`lp-cta${small ? " lp-cta-sm" : ""}`}
      onClick={() => go(where)}
    >
      {START.hero.cta}
    </button>
  );

  // ── sticky mobile bar: arms on the first scroll, yields whenever an in-flow
  // CTA is on screen, so two identical buttons are never visible at once.
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLElement>(null);
  const [stickyOn, setStickyOn] = useState(false);
  useEffect(() => {
    const h = heroCtaRef.current, c = closeRef.current;
    if (!h || !c || typeof IntersectionObserver === "undefined") return;
    let ctaVis = true, closeVis = false, scrolled = window.scrollY > 120;
    const upd = () => setStickyOn(scrolled && !ctaVis && !closeVis);
    // Read the LAST entry of each batch: a flick can cross "enters viewport"
    // and "leaves above" between two frames, and the observer then delivers
    // both crossings in ONE callback - entries[0] is the stale one.
    const io1 = new IntersectionObserver((es) => {
      const e = es[es.length - 1]; ctaVis = !!e && e.isIntersecting; upd();
    });
    const io2 = new IntersectionObserver((es) => {
      const e = es[es.length - 1]; closeVis = !!e && e.isIntersecting; upd();
    });
    const onScroll = () => { scrolled = window.scrollY > 120; upd(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    io1.observe(h); io2.observe(c);
    return () => { io1.disconnect(); io2.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  /** The ask, repeated. A long page with two CTAs makes the reader carry their
   *  decision back up to the hero; one after every argument lets them act the
   *  moment they are convinced. */
  const CtaBlock = ({ where, line }: { where: string; line?: string }) => (
    <div className="lxs-ctablk">
      <Cta where={where} />
      <p className="lp-xs">{line ?? START.hero.ctaSub(START.price)}</p>
    </div>
  );

  return (
    <div className="lxu lp lxs">
      {/* ── S0 · header: the wordmark, and deliberately nothing else. ────── */}
      <header className="lp-head">
        <span className="lp-mark">LEXFIT</span>
      </header>

      {/* ── S1 · hero ───────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow lp-m1" style={{ ["--i" as string]: 0 }}>{START.hero.eyebrow}</p>
            <h1 className="lp-m1" style={{ ["--i" as string]: 1 }}>
              <span className="lp-h-num">{START.hero.hNum}</span>
              <span className="lp-h-rest">{START.hero.hRest}</span>
            </h1>
            <p className="lp-lead lp-m1" style={{ ["--i" as string]: 2 }}>{START.hero.lead}</p>
            <p className="lp-anti lp-m1" style={{ ["--i" as string]: 3 }}>{START.hero.anti}</p>
            <ul className="lp-chips lp-m1" style={{ ["--i" as string]: 4 }}>
              {START.hero.chips.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>

          {/* The price card stands where the lead magnet shows its week mock:
              this page's proof is the offer itself, not a preview of output. */}
          <div className="lp-pair lp-m1" style={{ ["--i" as string]: 5 }}>
            <div className="lxs-pricecard">
              <p className="lxs-price">
                <strong>{START.price}</strong>
                <span>egyszer</span>
              </p>
              <p className="lxs-per">{START.hero.perSession(perSession)}</p>
              <ul className="lxs-tick">
                {[
                  `${sessionCount} edzés, sorrendbe rakva`,
                  "Örökre a tiéd - nem jár le",
                  `${START.guaranteeDays} nap pénzvisszafizetés`,
                ].map((t) => (
                  <li key={t}><LxIcon d={lxPaths.check} size={15} sw={2.4} />{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lp-hero-after">
            <div className="lp-ctarow lp-m1" style={{ ["--i" as string]: 6 }} ref={heroCtaRef}>
              <Cta where="hero" />
              <p className="lp-ctasub">{START.hero.ctaSub(START.price)}</p>
            </div>
            <div className="lp-mechrow lp-m1" style={{ ["--i" as string]: 7 }}>
              <p><b>{START.hero.mechanism}</b></p>
              <p className="lp-xs">{START.hero.mechanismSub}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── S2 · what the price buys ────────────────────────────────────── */}
      <section className="lp-band">
        <div className="lp-col">
          <p className="lp-eyebrow">{START.gets.eyebrow}</p>
          <h2>{START.gets.hd}</h2>
          <p className="lp-body">{START.gets.lead}</p>
          <ul className="lxs-gets">
            {START.gets.items.map((g) => (
              <li key={g.k}>
                <span className="lxs-ic"><LxIcon d={lxPaths[g.icon]} size={22} sw={1.7} /></span>
                <div><strong>{g.k}</strong><p>{g.d}</p></div>
              </li>
            ))}
          </ul>
          <CtaBlock where="after-gets" />
        </div>
      </section>

      {/* ── S3 · the problem mirror ─────────────────────────────────────── */}
      <section className="lp-band lp-tight">
        <div className="lp-col">
          <p className="lp-eyebrow">{START.mirror.eyebrow}</p>
          <h2>{START.mirror.hd}</h2>
          <p className="lp-body">{START.mirror.body}</p>
          <p className="lp-body"><b>{START.mirror.close}</b></p>
        </div>
      </section>

      {/* ── S4 · the mechanism (navy) ───────────────────────────────────── */}
      <section className="lp-band lp-dark">
        <div className="lp-col">
          <p className="lp-eyebrow">{START.how.eyebrow}</p>
          <h2>{START.how.hd}</h2>
          <ol className="lxs-steps">
            {START.how.steps.map((s) => (
              <li key={s.n}>
                <span className="lxs-n">{s.n}</span>
                <div><strong>{s.k}</strong><p>{s.d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── S5 · what is inside. The one WIDE band: its copy, stats,
          billboards and rails all sit in the same 960px column, so the whole
          section scans down a single left edge. ───────────────────────────── */}
      <section className="lp-band lxs-productband">
        <div className="lp-col lp-col-wide">
          <p className="lp-eyebrow">{START.inside.eyebrow}</p>
          <h2>{START.inside.hd(sessionCount)}</h2>
          <p className="lp-body">{START.inside.lead(sessionCount, START.weeks)}</p>
          <dl className="lp-bar3">
            {START.inside.facts.map((f) => (
              <div key={f.l}><dt>{f.v}</dt><dd>{f.l}</dd></div>
            ))}
          </dl>
        </div>

        {/* Every session, in the app's own cards. Full-bleed: the rows scroll
            past the text column the way the app's shelves do. */}
        <ProgramShelf
          workouts={workouts}
          onPreview={(code) => { setPreview(code); trackProgramPreview(code); }}
          onSave={() => go("shelf-save")}
        />

        <div className="lp-col lp-col-wide">
          <p className="lp-xs lxs-shelfnote">{START.inside.shelfNote}</p>
          <CtaBlock where="after-shelf" />
        </div>
      </section>

      {/* ── S6 · who it is and is not for ───────────────────────────────── */}
      <section className="lp-band lp-tight">
        <div className="lp-col">
          <p className="lp-eyebrow">{START.fit.eyebrow}</p>
          <h2>{START.fit.hd}</h2>
          <div className="lxs-fit">
            {[START.fit.yes, START.fit.no].map((col, i) => (
              <div key={col.k} className={`lxs-fitcard${i ? " no" : " yes"}`}>
                <strong>{col.k}</strong>
                <ul>
                  {col.items.map((t) => (
                    <li key={t}>
                      <LxIcon d={lxPaths[i ? "close" : "check"]} size={14} sw={2.6} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <CtaBlock where="after-fit" />
        </div>
      </section>

      {/* ── S7 · Alexa (navy). The page's one long read. Someone deciding on a
          9 990 Ft purchase from a brand they met ninety seconds ago is deciding
          about a person as much as a product, so she gets the room. ───────── */}
      <section className="lp-band lp-dark lxs-ax">
        <div className="lp-col lp-alexa">
          <div>
            <p className="lp-eyebrow">{START.alexa.eyebrow}</p>
            <h2 className="lxs-ax-pull">{START.alexa.pull}</h2>
          </div>
          <div className="lp-alexa-photo">
            <Image
              src="/hero-alexa.jpg"
              alt="Alexa"
              width={420}
              height={520}
              sizes="(max-width: 1023px) 80vw, 380px"
            />
          </div>
        </div>

        <div className="lp-col lxs-ax-body">
          <div className="lxs-ax-story">
            {START.alexa.story.map((para) => <p key={para}>{para}</p>)}
          </div>
          <ul className="lp-chips lp-chips-d lxs-ax-facts">
            {START.alexa.facts.map((f) => <li key={f}>{f}</li>)}
          </ul>
          {/* Kept apart from the biography: inside one block the disclaimer
              disappears, and it is the half that answers the hype objection. */}
          <ul className="lxs-ax-promise">
            {START.alexa.promises.map((t) => <li key={t}>{t}</li>)}
          </ul>
          <p className="lxs-ax-vow">{START.alexa.vow}</p>
          <p className="lxs-ax-close">
            {START.alexa.close}<br />{START.alexa.close2}
          </p>
          <p className="lxs-ax-sign">{START.alexa.sign}</p>
          <CtaBlock where="after-alexa" />
        </div>
      </section>

      {/* ── S7b · the finish card. Shown as the feature it is, not as proof:
          the numbers on the sample cards are illustrative, and a row of photos
          headed "results" would claim something they do not support. ─────── */}
      <section className="lp-band lp-tight lxs-fin">
        <div className="lp-col">
          <p className="lp-eyebrow">{START.finish.eyebrow}</p>
          <h2>{START.finish.hd}</h2>
          <p className="lp-body">{START.finish.body}</p>
        </div>
        <FinishExamples onPick={() => go("finish")} />
        <div className="lp-col">
          <p className="lp-xs lxs-finnote">{START.finish.note}</p>
        </div>
      </section>

      {/* ── S8 · guarantee ──────────────────────────────────────────────── */}
      <section className="lp-band lp-tight">
        <div className="lp-col lxs-guar">
          <span className="lxs-gic"><LxIcon d={lxPaths.shield} size={26} sw={1.6} /></span>
          <p className="lp-eyebrow">{START.guarantee.eyebrow}</p>
          <h2>{START.guarantee.k(START.guaranteeDays)}</h2>
          <p className="lp-body">{START.guarantee.d(START.guaranteeDays)}</p>
          <CtaBlock where="after-guarantee" />
        </div>
      </section>

      {/* ── S9 · FAQ ────────────────────────────────────────────────────── */}
      <section className="lp-band">
        <div className="lp-col">
          <p className="lp-eyebrow">{START.faq.eyebrow}</p>
          <h2>{START.faq.hd}</h2>
          <div className="lxs-faq">
            {START.faq.items.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── S10 · the close (accent) ────────────────────────────────────── */}
      <section className="lp-band lp-acc" ref={closeRef}>
        <div className="lp-col lp-close">
          <p className="lp-eyebrow">{START.close.eyebrow}</p>
          <h2>{START.close.hd}</h2>
          <p className="lp-body">{START.close.body}</p>
          <Cta where="close" />
          <p className="lp-xs">{START.hero.ctaSub(START.price)}</p>
          <p className="lp-legal">
            A vásárlással elfogadod az <Link href="/aszf">ÁSZF</Link>-et és az{" "}
            <Link href="/adatvedelem" className="lp-privacy">Adatkezelési tájékoztatót</Link>.
          </p>
        </div>
      </section>

      {/* The card preview, and the ask it closes on. */}
      <PreviewModal
        code={preview}
        onClose={() => setPreview(null)}
        onBuy={() => { setPreview(null); go("preview"); }}
      />

      {/* ── sticky bar (mobile) ─────────────────────────────────────────── */}
      <div className={`lp-sticky${stickyOn ? " on" : ""}`} aria-hidden={!stickyOn}>
        <div className="lp-sticky-p">
          <b>{START.price}, egyszer</b>
          <span>{START.hero.stickySub}</span>
        </div>
        <Cta where="sticky" small />
      </div>
    </div>
  );
}
