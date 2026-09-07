"use client";

import { useState } from "react";
import * as C from "../copy";
import { BODY_LIMITS, computeEnergy, parseBody, type BodyInput, type EnergyResult } from "@/lib/ujrakezdes/energy";
import type { Days, Level } from "@/lib/ujrakezdes/types";

// The energy module: the szavazzmagadra calculator, offered AFTER the plan.
//
// Placement is the whole design. It sits below the reveal, opt-in, collapsed by
// default - so the lead is already captured, the plan is already delivered, and
// nobody is asked for their weight in order to receive what they were promised.
// Putting body metrics before the gate would have made the funnel's headline
// claim ("7 kérdés, és kész a heti edzésterved") false.
//
// It renders only when NEXT_PUBLIC_ENERGY_MODULE=1, and the server refuses the
// body block unless ENERGY_MODULE_ENABLED=true. Both stay off until the Art. 9
// privacy amendment is published.

type Draft = {
  sex: BodyInput["sex"] | "";
  age: string;
  heightCm: string;
  weightKg: string;
  goal: BodyInput["goal"] | "";
  tempo: BodyInput["tempo"];
};

const EMPTY: Draft = { sex: "", age: "", heightCm: "", weightKg: "", goal: "", tempo: "kozepes" };

const hu = (n: number) => n.toLocaleString("hu-HU");

export default function EnergyModule({
  level, days, trainingCount, onComputed,
}: {
  level: Level;
  days: Days;
  /** From the plan, so the module never contradicts the week already shown. */
  trainingCount: number;
  /** Hands the parent the block to submit with the lead, plus the consent. */
  onComputed: (body: BodyInput) => void;
}) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState<Draft>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<EnergyResult | null>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setD((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseBody({
      sex: d.sex, age: Number(d.age), heightCm: Number(d.heightCm),
      weightKg: Number(d.weightKg), goal: d.goal, tempo: d.tempo,
    });
    if (Array.isArray(parsed)) { setErr(C.ENERGY.error); return; }
    setErr(null);
    // Computed on the client for an instant result; the server recomputes from
    // the same inputs when it stores the lead, and its numbers are the ones
    // that count.
    setResult(computeEnergy(parsed, level, days));
    onComputed(parsed);
  }

  if (!open) {
    return (
      <section className="u-energy-teaser" aria-labelledby="u-en-teaser">
        <h3 id="u-en-teaser">{C.ENERGY.teaserHeading}</h3>
        <p>{C.ENERGY.teaserBody}</p>
        <button type="button" className="u-cta u-cta-quiet" onClick={() => setOpen(true)}>
          {C.ENERGY.teaserCta}
        </button>
      </section>
    );
  }

  if (result) {
    const m = result.macros;
    return (
      <section className="u-energy" aria-labelledby="u-en-res">
        <h3 id="u-en-res">{C.ENERGY.resultHeading}</h3>

        <div className="u-en-hero">
          <strong>{hu(result.kcal)}</strong>
          <span>{C.ENERGY.kcalLabel}</span>
        </div>
        {result.floored && <p className="u-en-note">{C.ENERGY.flooredNote}</p>}

        <ul className="u-en-grid">
          <li><b>{hu(m.proteinG)} g</b><span>{C.ENERGY.proteinLabel}</span></li>
          <li><b>{hu(m.carbsG)} g</b><span>{C.ENERGY.carbsLabel}</span></li>
          <li><b>{hu(m.fatG)} g</b><span>{C.ENERGY.fatLabel}</span></li>
          <li><b>{hu(result.stepTarget)}</b><span>{C.ENERGY.stepsLabel}</span></li>
          <li><b>{result.waterLitres.toString().replace(".", ",")} l</b><span>{C.ENERGY.waterLabel}</span></li>
        </ul>

        {/* The workout half: which LEXFIT programmes to start with. Named from
            the real catalogue rather than the source's band-and-dumbbell
            advice, which would sell equipment this product does not use. */}
        <div className="u-en-workout">
          <h4>{C.ENERGY.workoutHeading}</h4>
          <p className="u-en-micro">{C.ENERGY.workoutLead(trainingCount)}</p>
          <ol>
            {result.programs.map((p) => (
              <li key={p.program}>
                <b>{p.program}</b>
                <span>{p.why}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="u-en-disclaimer">{C.ENERGY.disclaimer}</p>
        <button type="button" className="u-cta u-cta-quiet" onClick={() => setResult(null)}>
          {C.ENERGY.recalcCta}
        </button>
      </section>
    );
  }

  const ready = d.sex && d.goal && d.age && d.heightCm && d.weightKg && consent;

  return (
    <section className="u-energy" aria-labelledby="u-en-form">
      <h3 id="u-en-form">{C.ENERGY.formHeading}</h3>
      <p className="u-en-micro">{C.ENERGY.formMicro}</p>

      <form onSubmit={submit} noValidate>
        <fieldset className="u-en-fs">
          <legend className="u-label">{C.ENERGY.sexLabel}</legend>
          <div className="u-seg">
            {C.ENERGY.sexOptions.map((o) => (
              <button
                key={o.value} type="button"
                className={`u-seg-b${d.sex === o.value ? " on" : ""}`}
                aria-pressed={d.sex === o.value}
                onClick={() => set("sex", o.value)}
              >{o.label}</button>
            ))}
          </div>
          <p className="u-en-micro">{C.ENERGY.sexMicro}</p>
        </fieldset>

        <div className="u-en-nums">
          {([
            ["age", C.ENERGY.ageLabel, BODY_LIMITS.age],
            ["heightCm", C.ENERGY.heightLabel, BODY_LIMITS.heightCm],
            ["weightKg", C.ENERGY.weightLabel, BODY_LIMITS.weightKg],
          ] as const).map(([k, label, [lo, hi]]) => (
            <label key={k} className="u-en-num">
              <span className="u-label">{label}</span>
              <input
                className="u-input"
                type="number"
                inputMode="numeric"
                min={lo}
                max={hi}
                value={d[k]}
                onChange={(e) => { set(k, e.target.value); if (err) setErr(null); }}
              />
            </label>
          ))}
        </div>

        <fieldset className="u-en-fs">
          <legend className="u-label">{C.ENERGY.goalLabel}</legend>
          <div className="u-seg">
            {C.ENERGY.goalOptions.map((o) => (
              <button
                key={o.value} type="button"
                className={`u-seg-b${d.goal === o.value ? " on" : ""}`}
                aria-pressed={d.goal === o.value}
                onClick={() => set("goal", o.value)}
              >{o.label}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className="u-en-fs">
          <legend className="u-label">{C.ENERGY.tempoLabel}</legend>
          <div className="u-seg">
            {C.ENERGY.tempoOptions.map((o) => (
              <button
                key={o.value} type="button"
                className={`u-seg-b${d.tempo === o.value ? " on" : ""}`}
                aria-pressed={d.tempo === o.value}
                onClick={() => set("tempo", o.value)}
              >{o.label}</button>
            ))}
          </div>
          <p className="u-en-micro">{C.ENERGY.tempoMicro}</p>
        </fieldset>

        {/* The Art. 9 consent. Separate from the marketing box by law, and
            separate on screen so it cannot be mistaken for it. */}
        <label className="u-consent">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>{C.ENERGY.consent}</span>
        </label>

        {err && <p className="u-err" role="alert">{err}</p>}

        <button type="submit" className="u-cta" disabled={!ready}>
          {C.ENERGY.submit}
        </button>
      </form>
    </section>
  );
}
