"use client";

import { useState } from "react";
import * as C from "../copy";
import {
  BODY_LIMITS, computeEnergy, parseBody, tempoDelta, tempoRate,
  type BodyInput, type EnergyGoal, type EnergyResult, type Tempo,
} from "@/lib/ujrakezdes/energy";
import type { Days, Focus, Level } from "@/lib/ujrakezdes/types";

// The calculator, ported from szavazzmagadra's own (app/src/components/
// calculator/*). Its shape is the point, not just its arithmetic: it is a
// THREE-STEP flow with numbered section cards and a result built around one
// very large number - not a form and a table.
//
// Steps here are Adatok · Tempó · Eredmény. The source has a fourth, an email
// gate before the result; ours is already behind the quiz's own gate, so
// repeating it would be asking the same person for the same address twice.
//
// Two pieces of the source's result are deliberately absent, as decided when
// the maths was ported: the BMI badge (body-category labelling) and the
// goal-weight projection. Everything else - the gradient hero, the three macro
// cards, the split exercise/steps card, the water panel - is here, in LEXFIT's
// palette rather than the pink one.

type Step = 1 | 2 | 3;

type Draft = {
  sex: BodyInput["sex"] | "";
  age: string;
  heightCm: string;
  weightKg: string;
  goal: EnergyGoal | "";
  tempo: Tempo;
};

const EMPTY: Draft = { sex: "", age: "", heightCm: "", weightKg: "", goal: "", tempo: "kozepes" };
const TEMPOS: Tempo[] = ["laza", "kozepes", "intenziv"];
const hu = (n: number) => n.toLocaleString("hu-HU");

export default function EnergyModule({
  level, days, focus, trainingCount, sessionMin, onComputed,
}: {
  level: Level;
  days: Days;
  /** Q4 - decides which programme the result recommends second. */
  focus: Focus;
  /** From the plan, so the module never contradicts the week already shown. */
  trainingCount: number;
  /** The programme's real session length, from the live catalogue. */
  sessionMin: number;
  onComputed: (body: BodyInput) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [d, setD] = useState<Draft>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<EnergyResult | null>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  const step1Ready = d.sex && d.goal && d.age && d.heightCm && d.weightKg;

  function compute() {
    const parsed = parseBody({
      sex: d.sex, age: Number(d.age), heightCm: Number(d.heightCm),
      weightKg: Number(d.weightKg), goal: d.goal, tempo: d.tempo,
    });
    if (Array.isArray(parsed)) { setErr(C.ENERGY.error); setStep(1); return; }
    setErr(null);
    // Computed on the client for an instant result; the server recomputes from
    // the same inputs when it stores the lead, and its numbers are the ones
    // that count.
    setResult(computeEnergy(parsed, level, days, focus, sessionMin));
    setStep(3);
    onComputed(parsed);
  }

  // ── The invitation ─────────────────────────────────────────────────────────
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

  return (
    <section className="u-calc" aria-labelledby="u-calc-h">
      <h3 className="u-calc-h" id="u-calc-h">{C.ENERGY.teaserHeading}</h3>

      {/* Where you are in the calculator, as in the source: dots over labels. */}
      <ol className="u-calc-steps" aria-label="A kalkulátor lépései">
        {C.ENERGY.steps.map((label, i) => (
          <li key={label} className={i + 1 === step ? "on" : i + 1 < step ? "done" : ""}>
            <span className="dot" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ol>

      {/* ── 1 · Adatok ───────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="u-calc-body">
          <div className="u-calc-card">
            <h4><span className="n">1</span>{C.ENERGY.card1}</h4>

            <span className="u-flabel">{C.ENERGY.sexLabel}</span>
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
            <p className="u-fhint">{C.ENERGY.sexMicro}</p>

            <div className="u-calc-nums">
              {([
                ["age", C.ENERGY.ageLabel, BODY_LIMITS.age],
                ["heightCm", C.ENERGY.heightLabel, BODY_LIMITS.heightCm],
                ["weightKg", C.ENERGY.weightLabel, BODY_LIMITS.weightKg],
              ] as const).map(([k, label, [lo, hi]]) => (
                <label key={k} className="u-calc-num">
                  <span className="u-flabel">{label}</span>
                  <input
                    className="u-input" type="number" inputMode="numeric"
                    min={lo} max={hi} value={d[k]}
                    onChange={(e) => { set(k, e.target.value); if (err) setErr(null); }}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="u-calc-card">
            <h4><span className="n">2</span>{C.ENERGY.card2}</h4>
            <div className="u-goals">
              {C.ENERGY.goalOptions.map((o) => (
                <button
                  key={o.value} type="button"
                  className={`u-goal${d.goal === o.value ? " on" : ""}`}
                  aria-pressed={d.goal === o.value}
                  onClick={() => set("goal", o.value)}
                >{o.label}</button>
              ))}
            </div>
          </div>

          {err && <p className="u-err" role="alert">{err}</p>}

          <button
            type="button" className="u-cta"
            disabled={!step1Ready}
            onClick={() => setStep(2)}
          >{C.ENERGY.next}</button>
        </div>
      )}

      {/* ── 2 · Tempó ────────────────────────────────────────────────────── */}
      {step === 2 && d.goal && (
        <div className="u-calc-body">
          <div className="u-calc-head">
            <span className="u-calc-tag">{C.ENERGY.tempoTag[d.goal]}</span>
            <h4>{C.ENERGY.tempoHeading}</h4>
            <p>{C.ENERGY.tempoLead[d.goal]}</p>
          </div>

          <div className="u-calc-card">
            <h4><span className="n">3</span>{C.ENERGY.card3}</h4>
            <div className="u-tempos">
              {TEMPOS.map((t) => (
                <button
                  key={t} type="button"
                  className={`u-tempo${d.tempo === t ? " on" : ""}`}
                  aria-pressed={d.tempo === t}
                  onClick={() => set("tempo", t)}
                >
                  <span className="row">
                    <b>{C.ENERGY.tempoName[t]}</b>
                    {t === "kozepes" && <em>{C.ENERGY.tempoRecommended}</em>}
                    <span className="korr">{tempoDelta(d.goal as EnergyGoal, t)}</span>
                  </span>
                  <span className="desc">{C.ENERGY.tempoDesc[d.goal][t]}</span>
                  <span className="rate">{tempoRate(d.goal as EnergyGoal, t)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* The Art. 9 consent sits on the step that triggers the calculation
              and the store - not buried on the first screen, where it would be
              agreed to long before anything is computed. */}
          <label className="u-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>{C.ENERGY.consent}</span>
          </label>

          <div className="u-calc-foot">
            <button type="button" className="u-cta u-cta-quiet" onClick={() => setStep(1)}>
              {C.ENERGY.back}
            </button>
            <button type="button" className="u-cta" disabled={!consent} onClick={compute}>
              {C.ENERGY.submit}
            </button>
          </div>
        </div>
      )}

      {/* ── 3 · Eredmény ─────────────────────────────────────────────────── */}
      {step === 3 && result && (
        <div className="u-calc-body">
          {/* One very large number, as in the source. The result has to read as
              an answer, not as a row in a table. */}
          <div className="u-res-hero">
            <span className="ring a" aria-hidden="true" />
            <span className="ring b" aria-hidden="true" />
            <p className="eyebrow">{C.ENERGY.resultEyebrow}</p>
            <p className="big">{hu(result.kcal)}<span>kcal</span></p>
            <p className="desc">{C.ENERGY.tempoDesc[d.goal as string][d.tempo]}</p>
          </div>

          {result.floored && <p className="u-en-note">{C.ENERGY.flooredNote}</p>}

          <div className="u-macros">
            {[
              { k: "p", label: C.ENERGY.proteinLabel, v: result.macros.proteinG },
              { k: "c", label: C.ENERGY.carbsLabel, v: result.macros.carbsG },
              { k: "f", label: C.ENERGY.fatLabel, v: result.macros.fatG },
            ].map((m) => (
              <div className="u-macro" key={m.k}>
                <span className={`dot ${m.k}`} aria-hidden="true" />
                <p className="lbl">{m.label}</p>
                <p className="val">{hu(m.v)}<span>g</span></p>
              </div>
            ))}
          </div>

          <div className="u-split">
            <div>
              <p className="big">{trainingCount}</p>
              <p className="lbl">{C.ENERGY.weekSplitLabel(result.sessionMin ?? 30)}</p>
            </div>
            <span className="rule" aria-hidden="true" />
            <div>
              <p className="big">{hu(result.stepTarget)}</p>
              <p className="lbl">{C.ENERGY.stepsSplitLabel}</p>
            </div>
          </div>

          <div className="u-en-workout">
            <h4>{C.ENERGY.workoutHeading}</h4>
            <p className="u-fhint">{C.ENERGY.workoutLead(trainingCount)}</p>
            <ol>
              {result.programs.map((p) => (
                <li key={p.program}><b>{p.program}</b><span>{p.why}</span></li>
              ))}
            </ol>
          </div>

          <div className="u-water">
            <p className="eyebrow">{C.ENERGY.waterEyebrow}</p>
            <p className="val">
              {result.waterLitres.toString().replace(".", ",")}
              <span>{C.ENERGY.waterUnit}</span>
            </p>
          </div>

          <p className="u-en-disclaimer">{C.ENERGY.disclaimer}</p>
          <button
            type="button" className="u-cta u-cta-quiet"
            onClick={() => { setResult(null); setStep(1); }}
          >{C.ENERGY.recalcCta}</button>
        </div>
      )}
    </section>
  );
}
