"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Protected, Loader } from "@/components/Protected";
import {
  BLANK_ONBOARDING,
  hasOnboarded,
  saveOnboarding,
  type OnboardingAnswers,
} from "@/lib/user";
import {
  AGES, DAYS, FLOW, LIFESTAGE, REQUIRED, REVEAL, STEP_COPY, STEP_OPTIONS, WEEK, WELCOME,
  type ChoiceOption,
} from "@/lib/onboarding-data";
import styles from "./onboarding.module.css";

const LS_KEY = "lexfit_onb_v2";
const SCREENS = ["welcome", ...FLOW, "reveal"] as const;
type Screen = (typeof SCREENS)[number];

function OnboardingFlow() {
  const { user } = useAuth();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>({ ...BLANK_ONBOARDING });
  const [idx, setIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  // If already onboarded, skip straight to the app. Otherwise restore any
  // in-progress answers from localStorage.
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
    <div className={styles.stage}>
      <div className={styles.shell}>
        {screen === "welcome" ? (
          <Welcome onNext={() => go(idx + 1)} />
        ) : screen === "reveal" ? (
          <Reveal
            name={user?.displayName?.split(" ")[0] ?? "te"}
            onActivate={activate}
            saving={saving}
            onBack={() => go(idx - 1)}
          />
        ) : (
          <div className={styles.main}>
            <div className={styles.top}>
              <button className={styles.back} onClick={() => go(idx - 1)} aria-label="Vissza">
                ←
              </button>
              <div className={styles.progress}>
                <div className={styles.bar}>
                  <i style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.progLbl}>
                  {setupStep}/{FLOW.length}
                </span>
              </div>
            </div>

            <div className={styles.scroll}>
              <StepHeading id={screen} />
              <StepFields screen={screen} answers={answers} set={set} />
            </div>

            <div className={styles.foot}>
              <button className={styles.cta} disabled={!canNext} onClick={() => go(idx + 1)}>
                Tovább →
              </button>
              {showSkip && (
                <button className={styles.skip} onClick={() => go(idx + 1)}>
                  Kihagyom most
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className={styles.center}>
      <p className={styles.kicker}>{WELCOME.eyebrow}</p>
      <h1 className={styles.welcomeTitle}>
        {WELCOME.line1}
        <br />
        {WELCOME.line2}
      </h1>
      <p className={styles.welcomeSub}>{WELCOME.sub}</p>
      <button className={styles.cta} onClick={onNext}>
        {WELCOME.cta} →
      </button>
    </div>
  );
}

function StepHeading({ id }: { id: string }) {
  const c = STEP_COPY[id];
  if (!c) return null;
  return (
    <div className={styles.heading}>
      <h1 className={styles.q}>{c.hd}</h1>
      <p className={styles.qsub}>{c.sub}</p>
      <p className={styles.alexa}>
        <span className={styles.alexaDot} /> {c.alexa}
      </p>
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
      <ChoiceList
        options={STEP_OPTIONS.goal}
        selected={answers.goal}
        onSelect={(v) => set("goal", v as string)}
      />
    );
  if (screen === "level")
    return (
      <ChoiceList
        options={STEP_OPTIONS.level}
        selected={answers.level}
        onSelect={(v) => set("level", v as number)}
      />
    );
  if (screen === "focus")
    return (
      <ChoiceList
        options={STEP_OPTIONS.focus}
        multi
        selected={answers.focus}
        onToggle={(v) => set("focus", toggle(answers.focus, v as string))}
      />
    );
  if (screen === "env")
    return (
      <ChoiceList
        options={STEP_OPTIONS.env}
        multi
        selected={answers.env}
        onToggle={(v) => set("env", toggle(answers.env, v as string))}
      />
    );
  if (screen === "motiv")
    return (
      <textarea
        className={styles.textarea}
        placeholder="Pl. hogy bírjam a gyerekek mellett, és jó legyen a tükörben…"
        value={answers.motiv}
        onChange={(e) => set("motiv", e.target.value)}
        rows={4}
      />
    );
  if (screen === "schedule")
    return (
      <div className={styles.segment}>
        {DAYS.map((d) => (
          <button
            key={d.v}
            className={`${styles.seg} ${answers.days === d.v ? styles.segOn : ""}`}
            onClick={() => set("days", d.v)}
          >
            <span className={styles.segNum}>{d.v}</span>
            <span className={styles.segLbl}>{d.label}</span>
          </button>
        ))}
      </div>
    );
  if (screen === "about") return <AboutFields answers={answers} set={set} />;
  return null;
}

function AboutFields({
  answers,
  set,
}: {
  answers: OnboardingAnswers;
  set: <K extends keyof OnboardingAnswers>(k: K, v: OnboardingAnswers[K]) => void;
}) {
  return (
    <div className={styles.about}>
      <label className={styles.fieldLabel}>Korosztály</label>
      <div className={styles.chips}>
        {AGES.map((a) => (
          <button
            key={a}
            className={`${styles.chip} ${answers.age === a ? styles.chipOn : ""}`}
            onClick={() => set("age", a)}
          >
            {a}
          </button>
        ))}
      </div>

      <div className={styles.twoCol}>
        <div>
          <label className={styles.fieldLabel}>Magasság (cm)</label>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            value={answers.height}
            onChange={(e) => set("height", e.target.value)}
            placeholder="168"
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>Testsúly (kg)</label>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            value={answers.weight}
            onChange={(e) => set("weight", e.target.value)}
            placeholder="64"
          />
        </div>
      </div>

      <label className={styles.fieldLabel}>Életszakasz (opcionális)</label>
      <ChoiceList
        options={LIFESTAGE}
        selected={answers.lifestage}
        onSelect={(v) => set("lifestage", v as string)}
      />
    </div>
  );
}

function ChoiceList({
  options,
  selected,
  multi = false,
  onSelect,
  onToggle,
}: {
  options: ChoiceOption[];
  selected: string | number | string[] | null;
  multi?: boolean;
  onSelect?: (v: string | number) => void;
  onToggle?: (v: string | number) => void;
}) {
  const isOn = (v: string | number) =>
    multi ? Array.isArray(selected) && selected.includes(v as string) : selected === v;
  return (
    <div className={styles.choices}>
      {options.map((o) => (
        <button
          key={o.v}
          className={`${styles.choice} ${isOn(o.v) ? styles.choiceOn : ""}`}
          onClick={() => (multi ? onToggle?.(o.v) : onSelect?.(o.v))}
        >
          {o.ic && <span className={styles.choiceIc}>{o.ic}</span>}
          {o.flames != null && (
            <span className={styles.choiceIc}>{"🔥".repeat(o.flames)}</span>
          )}
          <span className={styles.choiceText}>
            <span className={styles.choiceB}>{o.b}</span>
            {o.s && <span className={styles.choiceS}>{o.s}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

function Reveal({
  name,
  onActivate,
  saving,
  onBack,
}: {
  name: string;
  onActivate: () => void;
  saving: boolean;
  onBack: () => void;
}) {
  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <button className={styles.back} onClick={onBack} aria-label="Vissza">
          ←
        </button>
      </div>
      <div className={styles.scroll}>
        <p className={styles.kicker}>{REVEAL.eyebrow}</p>
        <h1 className={styles.q}>{REVEAL.hd.replace("{n}", name)}</h1>
        <p className={styles.qsub}>{REVEAL.sub}</p>

        <div className={styles.week}>
          {WEEK.map((d) => (
            <div key={d.dd} className={`${styles.day} ${d.work ? "" : styles.dayRest}`}>
              <span className={styles.dayDd}>{d.dd}</span>
              <span className={styles.dayTheme}>{d.theme}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.foot}>
        <button className={styles.cta} onClick={onActivate} disabled={saving}>
          {saving ? "Mentés…" : `${REVEAL.cta} →`}
        </button>
      </div>
    </div>
  );
}

function toggle(arr: string[], v: string): string[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export default function Page() {
  return (
    <Protected requireOnboarded={false}>
      <OnboardingFlow />
    </Protected>
  );
}
