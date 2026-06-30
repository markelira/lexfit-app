"use client";

import "./onb.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Protected, Loader } from "@/components/Protected";
import { OnbAside, Check } from "@/components/OnbAside";
import {
  BLANK_ONBOARDING,
  hasOnboarded,
  saveOnboarding,
  type OnboardingAnswers,
} from "@/lib/user";
import {
  AGES, DAYS, FLOW, LIFESTAGE, REQUIRED, REVEAL, STEP_COPY, STEP_OPTIONS, WEEK,
  type ChoiceOption,
} from "@/lib/onboarding-data";

const LS_KEY = "lexfit_onb_v2";
const SCREENS = [...FLOW, "reveal"] as const;
type Screen = (typeof SCREENS)[number];

function OnboardingFlow() {
  const { user } = useAuth();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>({ ...BLANK_ONBOARDING });
  const [idx, setIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    hasOnboarded(user.uid).then((done) => {
      if (!active) return;
      if (done) {
        router.replace("/app");
        return;
      }
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY) ?? "null");
        if (saved?.answers) setAnswers({ ...BLANK_ONBOARDING, ...saved.answers });
        if (Number.isInteger(saved?.idx)) setIdx(saved.idx);
      } catch {}
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [user, router]);

  useEffect(() => {
    if (ready) localStorage.setItem(LS_KEY, JSON.stringify({ idx, answers }));
  }, [idx, answers, ready]);

  const screen: Screen = SCREENS[Math.min(idx, SCREENS.length - 1)];
  const set = <K extends keyof OnboardingAnswers>(k: K, v: OnboardingAnswers[K]) =>
    setAnswers((a) => ({ ...a, [k]: v }));
  const go = (n: number) => setIdx(Math.max(0, Math.min(SCREENS.length - 1, n)));

  const isSetup = (FLOW as readonly string[]).includes(screen);
  const setupStep = (FLOW as readonly string[]).indexOf(screen) + 1;
  const pct = Math.round((setupStep / FLOW.length) * 100);

  const canNext = useMemo(() => {
    if (screen === "goal") return answers.goal != null;
    if (screen === "level") return answers.level != null;
    return true;
  }, [screen, answers]);
  const showSkip = isSetup && REQUIRED[screen] === false;

  const alexaLine = screen === "reveal" ? REVEAL.alexa : STEP_COPY[screen]?.alexa;

  async function activate() {
    if (!user) return;
    setSaving(true);
    try {
      await saveOnboarding(user.uid, answers);
      localStorage.removeItem(LS_KEY);
      router.replace("/app");
    } catch {
      setSaving(false);
    }
  }

  if (!ready) return <Loader label="Onboarding…" />;

  return (
    <div className="lx">
      <div className="onb-stage">
        <div className="onb-shell">
          <OnbAside alexaLine={alexaLine} />

          <div className="onb-main">
            <div className="onb-top">
              <button
                className="onb-back"
                onClick={() => go(idx - 1)}
                disabled={idx === 0}
                aria-label="Vissza"
              >
                ←
              </button>
              {isSetup && (
                <div className="onb-prog">
                  <div className="pg-bar">
                    <i style={{ width: `${pct}%` }} />
                  </div>
                  <span className="lbl">
                    {setupStep}/{FLOW.length}
                  </span>
                </div>
              )}
            </div>

            <div className="onb-scroll">
              {screen === "reveal" ? (
                <RevealBody name={user?.displayName?.split(" ")[0] ?? "te"} />
              ) : (
                <div className="step-in" key={screen}>
                  <StepHeading id={screen} />
                  <StepFields screen={screen} answers={answers} set={set} />
                </div>
              )}
            </div>

            <div className="onb-foot">
              {screen === "reveal" ? (
                <button className="btn accent" onClick={activate} disabled={saving}>
                  {saving ? "Mentés…" : `${REVEAL.cta} →`}
                </button>
              ) : (
                <>
                  <button className="btn accent" disabled={!canNext} onClick={() => go(idx + 1)}>
                    Tovább →
                  </button>
                  {showSkip && (
                    <button className="onb-skip" onClick={() => go(idx + 1)}>
                      Kihagyom most
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepHeading({ id }: { id: string }) {
  const c = STEP_COPY[id];
  if (!c) return null;
  return (
    <>
      <h1 className="onb-q">{c.hd}</h1>
      <p className="onb-sub">{c.sub}</p>
      <div style={{ height: 20 }} />
    </>
  );
}

function OptionCards({
  options,
  multi = false,
  value,
  onToggle,
}: {
  options: ChoiceOption[];
  multi?: boolean;
  value: string | number | string[] | null;
  onToggle: (v: string | number) => void;
}) {
  const isOn = (v: string | number) =>
    multi ? Array.isArray(value) && value.includes(v as string) : value === v;
  return (
    <div className="opt-list">
      {options.map((o) => {
        const on = isOn(o.v);
        return (
          <button
            key={String(o.v)}
            className={`opt${multi ? " sq" : ""}${on ? " on" : ""}`}
            onClick={() => onToggle(o.v)}
            aria-pressed={on}
          >
            <span
              className="ic"
              style={o.flames ? { fontSize: o.flames === 3 ? 15 : o.flames === 2 ? 18 : 21, letterSpacing: "-1px" } : undefined}
            >
              {o.flames ? "🔥".repeat(o.flames) : o.ic}
            </span>
            <span className="tx">
              <b>{o.b}</b>
              {o.s && <small>{o.s}</small>}
            </span>
            <span className="mk">{on && <Check size={multi ? 13 : 14} />}</span>
          </button>
        );
      })}
    </div>
  );
}

function StepFields({
  screen,
  answers,
  set,
}: {
  screen: string;
  answers: OnboardingAnswers;
  set: <K extends keyof OnboardingAnswers>(k: K, v: OnboardingAnswers[K]) => void;
}) {
  if (screen === "goal")
    return (
      <OptionCards
        options={STEP_OPTIONS.goal}
        value={answers.goal}
        onToggle={(v) => set("goal", answers.goal === v ? null : (v as string))}
      />
    );
  if (screen === "level")
    return (
      <OptionCards
        options={STEP_OPTIONS.level}
        value={answers.level}
        onToggle={(v) => set("level", answers.level === v ? null : (v as number))}
      />
    );
  if (screen === "env")
    return (
      <OptionCards
        options={STEP_OPTIONS.env}
        multi
        value={answers.env}
        onToggle={(v) => set("env", toggleExclusive(answers.env, v as string, "none"))}
      />
    );
  if (screen === "focus")
    return (
      <div className="chip-wrap">
        {STEP_OPTIONS.focus.map((f) => (
          <button
            key={f.v}
            className={`chip${answers.focus.includes(f.v as string) ? " on" : ""}`}
            onClick={() => set("focus", toggleExclusive(answers.focus, f.v as string, "egesz"))}
          >
            {f.ic} {f.b}
          </button>
        ))}
      </div>
    );
  if (screen === "motiv")
    return (
      <>
        <textarea
          className="onb-textarea"
          rows={3}
          maxLength={160}
          placeholder="Pl. Szeretném, ha a lépcső nem fárasztana ki, és jobban érezzem magam a bőrömben…"
          value={answers.motiv}
          onChange={(e) => set("motiv", e.target.value)}
        />
        <div className="onb-charcount">{answers.motiv.length}/160</div>
        <div className="onb-grouphd">Mi állt eddig az utadban?</div>
        <OptionCards
          options={STEP_OPTIONS.obstacle}
          value={answers.obstacle}
          onToggle={(v) => set("obstacle", answers.obstacle === v ? null : (v as string))}
        />
      </>
    );
  if (screen === "schedule")
    return (
      <>
        <div className="dayseg">
          {DAYS.map((d) => (
            <button
              key={d.v}
              className={answers.days === d.v ? "on" : ""}
              onClick={() => set("days", d.v)}
            >
              {d.v}
              <small>{d.label}</small>
            </button>
          ))}
        </div>
        <div className="onb-grouphd" style={{ marginTop: 22 }}>
          Mikor a legjobb?
        </div>
        <OptionCards
          options={STEP_OPTIONS.time}
          value={answers.time}
          onToggle={(v) => set("time", answers.time === v ? null : (v as string))}
        />
      </>
    );
  if (screen === "about")
    return (
      <>
        <div className="onb-grouphd" style={{ marginTop: 0 }}>
          Korosztály
        </div>
        <div className="chip-wrap">
          {AGES.map((a) => (
            <button
              key={a}
              className={`chip${answers.age === a ? " on" : ""}`}
              onClick={() => set("age", answers.age === a ? null : a)}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="onb-grouphd">
          Testadatok <span className="hd-opt">· opcionális</span>
        </div>
        <div className="num-row">
          <div className="onb-field">
            <label htmlFor="onb-h">Magasság</label>
            <div className="unit-input">
              <input
                id="onb-h"
                type="number"
                inputMode="numeric"
                placeholder="168"
                value={answers.height}
                onChange={(e) => set("height", e.target.value)}
              />
              <span>cm</span>
            </div>
          </div>
          <div className="onb-field">
            <label htmlFor="onb-w">Testsúly</label>
            <div className="unit-input">
              <input
                id="onb-w"
                type="number"
                inputMode="numeric"
                placeholder="64"
                value={answers.weight}
                onChange={(e) => set("weight", e.target.value)}
              />
              <span>kg</span>
            </div>
          </div>
        </div>

        <div className="onb-grouphd">Van olyan, amire figyeljek?</div>
        <OptionCards
          options={LIFESTAGE}
          value={answers.lifestage}
          onToggle={(v) => set("lifestage", answers.lifestage === v ? null : (v as string))}
        />
      </>
    );
  return null;
}

function RevealBody({ name }: { name: string }) {
  return (
    <div className="step-in">
      <div className="aside-eyebrow" style={{ color: "var(--accent-ink)" }}>
        {REVEAL.eyebrow}
      </div>
      <h1 className="onb-q" style={{ marginTop: 6 }}>
        {REVEAL.hd.replace("{n}", name)}
      </h1>
      <p className="onb-sub">{REVEAL.sub}</p>
      <div className="rv-week">
        {WEEK.map((d, i) => (
          <div key={d.dd} className={`rv-day${d.work ? "" : " rest"}${i === 0 ? " start" : ""}`}>
            <span className="dd">{d.dd}</span>
            <span className="nm">{d.theme}</span>
            {i === 0 && <span className="rv-pill">1. nap</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Toggle a value in a multi-select where `exclusive` (e.g. "none"/"egesz")
// clears the rest, and selecting another clears the exclusive one.
function toggleExclusive(arr: string[], v: string, exclusive: string): string[] {
  if (v === exclusive) return arr.includes(exclusive) ? [] : [exclusive];
  const base = arr.filter((x) => x !== exclusive);
  return base.includes(v) ? base.filter((x) => x !== v) : [...base, v];
}

export default function Page() {
  return (
    <Protected requireOnboarded={false}>
      <OnboardingFlow />
    </Protected>
  );
}
