"use client";

import { useCallback, useEffect, useState } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { marketingContext, trackProgramCheckout, trackProgramView } from "@/lib/track";
import { START } from "./copy";
import "./start.css";

/**
 * The product page for the one-time Foundation purchase (P1).
 *
 * One message, one action, no navigation - a landing page in the strict sense.
 * The only interaction before the money is the legally required consent tick;
 * there is no account form, because the account is built from the receipt.
 */
export function StartPage({ sessionCount }: { sessionCount: number }) {
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => { trackProgramView(START.slug); }, []);

  const buy = useCallback(
    async (where: string) => {
      // First press with no tick: reveal the consent row and point at it
      // rather than refusing. The tick is a legal requirement, not a hurdle
      // we chose, so the page should not wear it until it is needed.
      if (!consented) {
        setShowConsent(true);
        setErr(null);
        requestAnimationFrame(() => {
          document.getElementById("s-consent")?.scrollIntoView({ block: "center", behavior: "smooth" });
        });
        return;
      }
      setBusy(true);
      setErr(null);
      trackProgramCheckout(START.role, where);
      try {
        const res = await fetch("/api/stripe/program-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: START.role,
            immediateStart: true,
            marketing: marketingContext(),
            where,
          }),
        });
        const body = (await res.json()) as { url?: string; error?: string };
        if (!body.url) throw new Error(body.error ?? "no_url");
        window.location.href = body.url;
      } catch {
        setBusy(false);
        setErr("Nem sikerült megnyitni a fizetést. Próbáld újra - a kártyádat még nem terheltük meg.");
      }
    },
    [consented],
  );

  const Cta = ({ where, label }: { where: string; label?: string }) => (
    <button type="button" className="s-cta" disabled={busy} onClick={() => void buy(where)}>
      {busy ? "Egy pillanat…" : (label ?? START.hero.cta)}
    </button>
  );

  return (
    <main className="lxs">
      <section className="s-hero">
        <p className="s-eyebrow">{START.hero.eyebrow}</p>
        <h1 className="s-h1">{START.hero.h1}</h1>
        <p className="s-sub">{START.hero.sub}</p>

        <div className="s-pricebox">
          <div className="s-price">
            <strong>{START.price}</strong>
            <span>egyszer</span>
          </div>
          <Cta where="hero" />
          <p className="s-reassure">{START.hero.reassure(START.price)}</p>
        </div>

        <ul className="s-trust">
          {START.hero.trust.map((t) => (
            <li key={t}>
              <LxIcon d={lxPaths.check} size={15} sw={2.4} />
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="s-gets">
        <h2 className="s-h2">Mit kapsz {START.price}-ért</h2>
        <ul className="s-getlist">
          {START.gets.map((g) => (
            <li key={g.k}>
              <span className="s-ic">
                <LxIcon d={lxPaths[g.icon]} size={22} sw={1.7} />
              </span>
              <div>
                <strong>{g.k}</strong>
                <p>{g.d}</p>
              </div>
            </li>
          ))}
        </ul>
        {/* The one number the buyer weighs the price against, stated once and
            read from the programme's own playlist - never a literal. */}
        <p className="s-count">
          <strong>{sessionCount} edzés</strong> a programban, az elsőtől az utolsóig.
        </p>
      </section>

      <section className="s-how">
        <h2 className="s-h2">{START.how.h}</h2>
        <ol className="s-steps">
          {START.how.steps.map((s) => (
            <li key={s.n}>
              <span className="s-n">{s.n}</span>
              <div>
                <strong>{s.k}</strong>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="s-fit">
        <h2 className="s-h2">{START.fit.h}</h2>
        <div className="s-fitgrid">
          <div className="s-fitcard yes">
            <strong>{START.fit.yes.k}</strong>
            <ul>
              {START.fit.yes.items.map((i) => (
                <li key={i}>
                  <LxIcon d={lxPaths.check} size={14} sw={2.6} />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="s-fitcard no">
            <strong>{START.fit.no.k}</strong>
            <ul>
              {START.fit.no.items.map((i) => (
                <li key={i}>
                  <LxIcon d={lxPaths.close} size={14} sw={2.6} />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="s-guarantee">
        <span className="s-gic">
          <LxIcon d={lxPaths.shield} size={26} sw={1.6} />
        </span>
        <strong>{START.guarantee.k(START.guaranteeDays)}</strong>
        <p>{START.guarantee.d(START.guaranteeDays)}</p>
      </section>

      <section className="s-faq">
        <h2 className="s-h2">{START.faq.h}</h2>
        <div className="s-faqlist">
          {START.faq.items.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="s-finale">
        <h2 className="s-h2">{START.finale.h}</h2>
        <p className="s-sub">{START.finale.d}</p>

        <label
          id="s-consent"
          className={`s-consent${showConsent ? " on" : ""}`}
          data-testid="start-consent"
        >
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => {
              setConsented(e.target.checked);
              setErr(null);
            }}
          />
          <span>{START.consent(START.guaranteeDays)}</span>
        </label>

        <Cta where="finale" />
        <p className="s-reassure">{START.hero.reassure(START.price)}</p>
        {err && (
          <p className="s-err" role="alert">
            {err}
          </p>
        )}
        <p className="s-legal">
          A vásárlással elfogadod az <a href="/aszf">ÁSZF</a>-et és az{" "}
          <a href="/adatvedelem">Adatkezelési tájékoztatót</a>.
        </p>
      </section>
    </main>
  );
}
