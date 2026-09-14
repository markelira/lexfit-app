"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
// The quiz adopts the /register wizard's layout wholesale - the split-screen
// shell, the per-step photography, the question chrome and the option rows are
// the SAME components, not a lookalike. A marketing funnel that looks like a
// different product than the one it sells is a funnel that leaks trust at
// exactly the moment it is asking for an email.
import "@/app/login/auth.css";
import "@/app/onboarding/onbv2.css";
import "../ujrakezdes.css";
// The offer block reuses the shipped <PricingBand>, whose styles live in
// landing.css scoped under `.lxl` - so the stylesheet comes along and the band
// is wrapped in that class below, exactly as /arak does it. Scoping means none
// of it leaks into `.lxu`.
import "@/app/landing.css";
import * as C from "../copy";
import Image from "next/image";
import { GARANCIA, GUARANTEE_LIVE } from "@/components/landing/offer-copy";
import { PRICES } from "@/lib/pricing/config";
import { annualSavingsPct, formatHuf, perDayHuf, perMonthHuf } from "@/lib/pricing/display";
import PlanTray, { trayChips } from "./PlanTray";
import { DeviceRow, LibraryGrid } from "./OfferGraphics";
import { MonthStory } from "./MonthStory";
import { CinemaReveal } from "../mozi/CinemaReveal";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import MailPreview from "./MailPreview";
import HabitCurve from "./HabitCurve";
import StartDayPick, { type StartPick } from "./StartDayPick";
import PlanBuild, { type BuildStep } from "./PlanBuild";
import { FirstWorkoutCard, WorkoutCardsRow, type MediaCard, type FirstMedia } from "./WorkoutCards";
import { FinishExamples } from "@/components/finish/FinishExamples";
import { useSectionView } from "./useSectionView";
import { nextChargeLabel } from "@/lib/pricing/renewal";
import { BrandPanel } from "@/components/onboarding/BrandPanel";
import { StepFrame } from "@/components/onboarding/StepFrame";
import { OptionList } from "@/components/onboarding/OptionList";
import type { LandingCatalog } from "@/lib/landing-catalog";
import {
  BODY_LIMITS, computeEnergy, parseBody, tempoDelta, tempoRate,
  type BodyInput, type EnergyGoal, type EnergyResult as Energy, type Tempo,
} from "@/lib/ujrakezdes/energy";
import { writeQuizHandoff } from "@/lib/ujrakezdes/handoff";
import { externalBrowserHref } from "@/lib/webview";
import { buildWeekPlan } from "@/lib/ujrakezdes/plan";
import { validateEmail } from "@/lib/quiz/validate";
import { STEP_IDS, type Answers, type Care, type StepId } from "@/lib/ujrakezdes/types";
import {
  marketingContext, newEventId,
  trackUjrakezdesCinemaCta, trackUjrakezdesCinemaDone, trackUjrakezdesCinemaStart,
  trackUjrakezdesFinishCta, trackUjrakezdesFinishView, trackUjrakezdesHeroCta,
  trackUjrakezdesGateView, trackUjrakezdesLead,
  trackUjrakezdesLoaderDone, trackUjrakezdesOfferClick, trackUjrakezdesOfferView, trackUjrakezdesQuizStart,
  trackUjrakezdesRevealView, trackUjrakezdesStartDay, trackUjrakezdesStep,
  trackUjrakezdesStickyClick, trackUjrakezdesStickyView, trackUjrakezdesWatchOpen,
} from "@/lib/track";

// The lead magnet v2 wizard: Q1-Q7 → interstitial → gate → reveal.
//
// State model, deliberately simple: answers live in one object, the screen is a
// string, and both are mirrored to sessionStorage so a refresh mid-funnel does
// not throw somebody back to the first question. NOTHING reaches the server
// before the gate submit - that is a promise the gate copy makes ("Hova
// küldjük"), not an implementation detail, so there is no autosave anywhere.
//
// Six of the seven questions auto-advance on tap, per the spec. Q5 is the
// exception because it is multi-select: a screen that advanced on the first tap
// would make the second choice impossible.

const STORE_KEY = "lexfit_ujrakezdes_v1";

type Screen =
  | StepId
  | "interstitial"
  /** The calculator's own questions, asked HERE rather than on the reveal,
   *  behind an explicit invitation so the „7 kérdés" promise stays true. */
  | "calc_invite" | "body" | "goal" | "tempo"
  /** R1 · the plan-build transition. Not in ORDER — it advances by itself
   *  and Vissza can never land on it. Gate submit → building → reveal. */
  | "building"
  | "gate" | "reveal";

/** Screen order. The interstitial sits between Q4 and Q5 exactly as specced:
 *  the two forgiveness rules are stated BEFORE we ask about knees and backs, so
 *  the caution question lands as care rather than as a risk assessment. */
/**
 * Grouped so each SECTION is contiguous - the progress bar names sections, and
 * a section that jumps around the flow would be a label pointing at nothing.
 *
 * `daypart` moved up next to `days`: both answer "when", and the two now form
 * the schedule section. That also puts the interstitial immediately after the
 * schedule questions, which is where its two lines belong - they are about rest
 * days and missed weeks. It still lands BEFORE the caution question, so that
 * one still reads as care rather than as a risk assessment.
 */
const CORE: Screen[] = [
  "anchor", "level",
  "days", "daypart",
  "interstitial",
  "focus", "care", "place",
];

/**
 * The calculator's three questions, asked in the flow rather than after it.
 *
 * SKIPPABLE, and that is not a UX nicety. These are Art. 9 body metrics, and
 * consent to special-category data is only valid if it is freely given -
 * making the plan conditional on handing them over would make the consent
 * worthless and the processing unlawful with it. So the first of the three
 * carries a "Kihagyom" that jumps straight to the gate.
 */
const CALC: Screen[] = ["body", "goal", "tempo"];

/** 1-7 for the progress dots; 0 for the screens that are not questions. */
const Q_NUMBER: Partial<Record<Screen, number>> = Object.fromEntries(
  STEP_IDS.map((id, i) => [id, i + 1]),
);

/** How long the commit state is held before the next question arrives. Long
 *  enough to read as acknowledgement, short enough that nobody waits on it. */
const COMMIT_MS = 230;

/**
 * Our screen → the /register step whose photograph and caption fit it.
 *
 * BrandPanel keys its imagery off the join wizard's own step ids, so mapping
 * onto those ids is what gets the right picture rather than a default. The
 * pairing is by MEANING, not by position: `session` takes the player photo
 * because it asks how long a session is, and `care` takes the focus photo
 * because it asks what to work around.
 */
const BRAND_STEP: Record<Screen, string> = {
  anchor: "goal",          // the community photo - why they came
  level: "level",
  days: "days",
  focus: "focus",
  interstitial: "why",     // Alexa's quote, under the two rules
  care: "obstacle",       // what to work around
  place: "env",
  daypart: "time",         // the player
  calc_invite: "reassure", // the offer of the calculator, before its questions
  body: "reassure",        // the calculator's own three, still in the flow
  goal: "reassure",
  tempo: "reassure",
  gate: "reveal",          // the promise photo, as the plan is handed over
  building: "reveal",      // unused - the build screen carries its own chrome
  reveal: "plan",
};

type Draft = Partial<Answers>;

type BodyDraft = {
  sex: BodyInput["sex"] | "";
  age: string;
  heightCm: string;
  weightKg: string;
  goal: EnergyGoal | "";
  tempo: Tempo;
};

const EMPTY_BODY: BodyDraft = {
  sex: "", age: "", heightCm: "", weightKg: "", goal: "", tempo: "kozepes",
};

/** The three calculator steps carry their own counter: the seven questions are
 *  genuinely finished by then, and inflating the denominator to ten from the
 *  first screen would overstate the length of a funnel most people will not
 *  extend. */
const CALC_NO: Partial<Record<Screen, number>> = { body: 1, goal: 2, tempo: 3 };

/** Which section each screen belongs to. The interstitial inherits the section
 *  it interrupts, so the bar does not blink between two states mid-beat. */
const SECTION_OF: Record<Screen, number> = {
  anchor: 0, level: 0,
  days: 1, daypart: 1, interstitial: 1,
  focus: 2, care: 2, place: 2,
  calc_invite: 3, body: 3, goal: 3, tempo: 3,
  gate: 3, building: 3, reveal: 3,
};

const isComplete = (d: Draft): d is Answers =>
  !!(d.anchor && d.level && d.days && d.focus && d.place && d.daypart && d.care);

export default function PlanWizard({
  catalog,
  initial,
}: {
  catalog: LandingCatalog;
  /** Seeded render for the persisted-plan URL (/ujrakezdes/terv/[token]): the
   *  emails link straight to the reveal with the stored answers, no re-quiz.
   *  When present, the sessionStorage restore is skipped - the server already
   *  knows this person's answers better than this browser does. */
  initial?: { answers: Answers; token: string };
}) {
  const [screen, setScreen] = useState<Screen>(initial ? "reveal" : "anchor");
  // The option being committed to, during the brief beat between the tap and
  // the advance. Null the rest of the time.
  const [picked, setPicked] = useState<string | null>(null);
  /** The step whose chip should animate into the tray. Cleared on navigation so
   *  going back does not replay a landing for an answer already sitting there. */
  const [landed, setLanded] = useState<string | null>(null);
  const [a, setA] = useState<Draft>(initial ? { ...initial.answers } : { care: [] });
  /** The lead's plan token, returned by the gate submit (or seeded on the
   *  persisted-plan page). The reveal's CTAs append it as ?lt= so /register
   *  can rebuild the answers server-side - the webview breakout below opens a
   *  DIFFERENT browser, where the localStorage handoff does not exist. */
  const [leadToken, setLeadToken] = useState<string | null>(initial?.token ?? null);
  /** The calculator's answers. Separate from `a` because they are Art. 9 data
   *  with their own consent and their own retention clock. */
  const [body, setBody] = useState<BodyDraft>(EMPTY_BODY);
  const [bodyConsent, setBodyConsent] = useState(false);
  const [skipCalc, setSkipCalc] = useState(false);
  /** S · the sticky price bar (M4). Shown once B2's CTA scrolls out, hidden
   *  again while the closing CTA is on screen. Mobile only - desktop's rail is
   *  the constant price. */
  const [stickyOn, setStickyOn] = useState(false);
  const b2Ref = useRef<HTMLElement>(null);
  const closeCtaRef = useRef<HTMLAnchorElement>(null);
  /** ≥1024 the fold offer lives in the rail (b2Ref's section is display:none
   *  there and never intersects), so the desktop sticky trigger observes the
   *  whole grid instead: bar appears once grid — offer, tiers and all — has
   *  scrolled fully past (R10: no CTA deserts). */
  const gridRef = useRef<HTMLDivElement>(null);
  /** Sprint P1-2: the sticky bar arms when the PLAN CARD leaves - the offer
   *  must be reachable the moment she scrolls past her plan, not only after
   *  the fold offer has gone by. */
  const planCardEl = useRef<HTMLElement | null>(null);
  /** Sprint P1-2: rail CTA element for the offer_view (50%) observer. */
  const railCtaEl = useRef<HTMLAnchorElement | null>(null);
  /** R4 · the chosen start day. Session-remembered; personalises the
   *  first-workout block and the curve's footing, writes nothing upstream. */
  const [startPick, setStartPick] = useState<StartPick>("today");
  /** The cinematic opener. Shown once per session and only after a fresh quiz
   *  run - someone returning through an e-mail link already knows what her
   *  plan is, and a four-beat intro on every visit turns from a reveal into a
   *  toll booth. `initial` marks the persisted-plan route (token URL). */
  const [cinema, setCinema] = useState(false);
  /** Today's clock for the cinema's dated renewal line. Post-mount: a
   *  render-time date on a prerendered route freezes at build. */
  const [cinemaToday, setCinemaToday] = useState<number | null>(null);
  useEffect(() => setCinemaToday(Date.now()), []);
  /** True when the player sent her back here after the free workout (`?w=1`).
   *  Resolved post-mount - the route is prerendered - and the URL is cleaned
   *  afterwards so a refresh or a shared link does not replay the greeting. */
  const [justWatched, setJustWatched] = useState(false);
  /** The reveal's media (v2): the first workout's full playback + the next
   *  sessions' poster/preview cards, fetched by plan token. Null until (and
   *  unless) it loads - every media surface degrades to the token-free UI. */
  const [media, setMedia] = useState<{ first: FirstMedia | null; cards: MediaCard[]; programs?: { slug: string; poster: string }[] } | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  /** The question heading. Focus lands here on every step, which is what makes
   *  the change audible to a screen reader and reachable from the keyboard.
   *  Kept separate from `stageRef` (the reveal's container) rather than casting
   *  one into the other - they are different elements with different jobs. */
  const headingRef = useRef<HTMLHeadingElement>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Any pending commit must die with the component, or it fires setState on an
  // unmounted tree when somebody leaves mid-answer.
  useEffect(() => () => { if (commitTimer.current) clearTimeout(commitTimer.current); }, []);

  // Restore once on mount. Failure is non-fatal: Safari private mode throws on
  // storage access, and a quiz that refuses to start is worse than a lost draft.
  useEffect(() => {
    if (initial) return; // the persisted-plan page IS the state - nothing to restore
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as { a?: Draft; screen?: Screen; token?: string };
      if (d.a) setA({ care: [], ...d.a });
      if (d.token) setLeadToken(d.token);
      const sp = sessionStorage.getItem("lexfit_ujra_start");
      if (sp === "today" || sp === "monday") setStartPick(sp);
      // Never resume INTO the reveal (or the build beat before it): both
      // depend on a submit whose result did not survive the refresh, and
      // re-showing them would imply a lead we never confirmed. But dropping
      // them to Q1 with every answer pre-filled made them re-tap seven
      // answered questions - so a lost reveal resumes at the GATE instead:
      // one submit away from the plan, and the lead upsert dedupes on the
      // email hash, so resubmitting is harmless.
      if (d.screen === "reveal" || d.screen === "building") setScreen("gate");
      // A draft saved while the calculator was live must not resume into a
      // branch that no longer exists (or is flagged off) - land on the gate.
      else if (!C.ENERGY_LIVE && d.screen && (["calc_invite", "body", "goal", "tempo"] as Screen[]).includes(d.screen))
        setScreen("gate");
      else if (d.screen && d.screen !== "interstitial") setScreen(d.screen);
    } catch { /* ignore */ }
    // `initial` is a mount-time prop (the persisted-plan page); the restore
    // genuinely runs once.
  }, [initial]);

  useEffect(() => {
    // The persisted-plan page never writes the draft: its answers came from
    // the lead document, and letting them shadow (or overwrite) a genuinely
    // in-progress quiz draft in this browser would be a silent hijack.
    if (initial) return;
    try {
      sessionStorage.setItem(
        STORE_KEY,
        JSON.stringify({ a, screen, ...(leadToken ? { token: leadToken } : {}) }),
      );
    } catch { /* ignore */ }
  }, [a, screen, leadToken, initial]);

  // The order depends on whether they are still in the calculator branch: once
  // somebody skips it, the three steps leave the flow entirely rather than
  // lingering as screens they have to dismiss again on the way back.
  const ORDER: Screen[] = useMemo(
    () => [
      ...CORE,
      // The invitation stays in the order even after a decline, so Vissza from
      // the gate lands back on the offer rather than skipping past it - saying
      // no once should not be irreversible. While the energy module is off
      // (Art. 9 amendment unsigned), the whole calculator branch leaves the
      // flow: no invitation, no body-metric form, nothing to consent to.
      ...(C.ENERGY_LIVE
        ? ["calc_invite" as Screen, ...(skipCalc ? [] : CALC)]
        : []),
      "gate" as Screen,
      "reveal" as Screen,
    ],
    [skipCalc],
  );

  const idx = ORDER.indexOf(screen);
  const qNum = Q_NUMBER[screen] ?? 0;

  const go = useCallback((next: Screen) => {
    setPicked(null);
    setScreen(next);
    // Move focus to the new question, or a screen change is silent to a screen
    // reader and lands nowhere for a keyboard user.
    requestAnimationFrame(() => (headingRef.current ?? stageRef.current)?.focus());
  }, []);

  const advance = useCallback(() => {
    const next = ORDER[ORDER.indexOf(screen) + 1];
    if (next) go(next);
  }, [screen, go]);

  const back = useCallback(() => {
    const prev = ORDER[ORDER.indexOf(screen) - 1];
    // Stepping back INTO the interstitial would replay a beat they already sat
    // through, so it is skipped in reverse.
    if (prev === "interstitial") go(ORDER[ORDER.indexOf(screen) - 2]!);
    else if (prev) go(prev);
  }, [screen, go]);

  /**
   * Answer a single-select question, then move on.
   *
   * The advance is held for one short beat so the choice is visibly
   * acknowledged first. Swapping the screen on the raw tap is faster but reads
   * as "did that register?" - the commit is what makes it feel answered.
   */
  const pick = useCallback(<K extends keyof Answers>(key: K, value: Answers[K]) => {
    if (picked) return;                      // ignore a double-tap mid-commit
    setA((prev) => ({ ...prev, [key]: value }));
    setPicked(String(value));
    setLanded(String(key));
    if (Q_NUMBER[screen]) trackUjrakezdesStep(String(screen), Q_NUMBER[screen]!);
    commitTimer.current = setTimeout(advance, COMMIT_MS);
  }, [picked, screen, advance]);

  // The interstitial holds for its own beat and then moves on by itself.
  useEffect(() => {
    if (screen !== "interstitial") return;
    const t = setTimeout(advance, C.INTERSTITIAL.holdMs);
    return () => clearTimeout(t);
  }, [screen, advance]);

  useEffect(() => { if (screen === "gate") trackUjrakezdesGateView(); }, [screen]);
  useEffect(() => {
    if (screen !== "reveal" || initial) return;
    try {
      if (sessionStorage.getItem("lx-mozi") === "1") return;
      sessionStorage.setItem("lx-mozi", "1");
    } catch { /* private mode: play it, once is better than never */ }
    setCinema(true);
    trackUjrakezdesCinemaStart();
    // `initial` is a mount-time prop; the rule cannot change mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);
  // Back from the free workout (`?w=1`). The flag is lifted into state and the
  // parameter stripped in the same pass: the greeting belongs to this return,
  // not to every later visit to the same token URL.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    if (u.searchParams.get("w") !== "1") return;
    setJustWatched(true);
    trackUjrakezdesFinishView();
    u.searchParams.delete("w");
    window.history.replaceState(null, "", u.pathname + u.search);
  }, []);
  // `src: "email"` separates persisted-plan (token URL) traffic from
  // fresh-quiz reveals in every funnel report.
  useEffect(() => {
    if (screen === "reveal") trackUjrakezdesRevealView(initial ? "email" : undefined);
    // `initial` is a mount-time prop - the reveal-view rule doesn't change mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);
  // Sprint P0-2 · orphan-rescue prefill: the recovery mail links here with
  // ?e=<base64url email> so the gate arrives pre-filled - the form lead
  // already typed this address once on Facebook; asking again is friction
  // with a memory. Invalid/absent → silently nothing.
  useEffect(() => {
    if (initial) return;
    try {
      const e = new URLSearchParams(window.location.search).get("e");
      if (!e) return;
      const decoded = atob(e.replace(/-/g, "+").replace(/_/g, "/"));
      if (!validateEmail(decoded)) setEmail(decoded);
    } catch { /* malformed param - the field just stays empty */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The landing CTA was taken into the wizard - defined since the first
  // build (track.ts:186) but never fired; landing→quiz bounce was
  // unmeasurable until now. Once per mount, fresh-quiz visits only.
  const quizStarted = useRef(false);
  useEffect(() => {
    if (initial || quizStarted.current) return;
    quizStarted.current = true;
    trackUjrakezdesQuizStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // M4. Two observers rather than scroll math: the bar appears when the fold
  // offer leaves upward, and yields while the closing CTA is visible so the
  // page never shows the same ask twice at once.
  const stickySeen = useRef(false);
  useEffect(() => {
    if (screen !== "reveal") return;
    const b2 = b2Ref.current, cl = closeCtaRef.current, grid = gridRef.current;
    if (!b2 || !cl || typeof IntersectionObserver === "undefined") return;
    let past = false, gridPast = false, closeVis = false;
    const upd = () => {
      const on = (past || gridPast) && !closeVis;
      // Impressions, once - so the bar's click-through has a denominator.
      if (on && !stickySeen.current) {
        stickySeen.current = true;
        trackUjrakezdesStickyView();
      }
      setStickyOn(on);
    };
    // Read the LAST entry of each batch: a flick can cross "enters viewport"
    // and "leaves above" between two frames, and the observer then delivers
    // both crossings in ONE callback - entries[0] is the stale one.
    const io1 = new IntersectionObserver((es) => {
      const e = es[es.length - 1];
      past = !!e && !e.isIntersecting && e.boundingClientRect.top < 0;
      upd();
    });
    const io2 = new IntersectionObserver((es) => {
      const e = es[es.length - 1];
      closeVis = !!e && e.isIntersecting;
      upd();
    });
    // Desktop trigger (R10): b2's section is display:none ≥1024 (the rail
    // carries the fold offer there), so the bar arms once the WHOLE grid -
    // offer, tiers, stack - has scrolled above the viewport.
    const io3 = new IntersectionObserver((es) => {
      const e = es[es.length - 1];
      gridPast = !!e && !e.isIntersecting && e.boundingClientRect.bottom < 0;
      upd();
    });
    // P1-2: the bar arms as soon as the PLAN CARD scrolls out (not the fold
    // offer) - reachable offer from the second screenful onward.
    io1.observe(planCardEl.current ?? b2);
    io2.observe(cl);
    if (grid) io3.observe(grid);

    // THE sprint event (P1-2): offer box 50% visible, once. Mobile = the
    // fold offer section; desktop = the rail CTA (the rail itself is taller
    // than a viewport, so the CTA stands in for "the offer is on screen").
    let offerSeen = false;
    const seeOffer = () => {
      if (offerSeen) return;
      offerSeen = true;
      trackUjrakezdesOfferView();
      io4.disconnect();
    };
    const io4 = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) seeOffer();
    }, { threshold: 0.5 });
    io4.observe(b2);
    if (railCtaEl.current) io4.observe(railCtaEl.current);

    return () => { io1.disconnect(); io2.disconnect(); io3.disconnect(); io4.disconnect(); };
  }, [screen]);

  /**
   * The programme's real session length, taken from the live catalogue: the
   * median of its published workouts. The quiz no longer ASKS how long a
   * session is, so the only honest number is the one the videos actually are.
   */
  const sessionMin = useMemo(() => {
    const mins = (catalog.entry?.sessions ?? []).map((s) => s.mins).filter((m) => m > 0).sort((x, y) => x - y);
    return mins.length ? mins[Math.floor(mins.length / 2)]! : undefined;
  }, [catalog]);

  const plan = useMemo(
    () => (isComplete(a) ? buildWeekPlan(a, sessionMin) : null),
    [a, sessionMin],
  );

  /** The week as far as it is known at the interstitial - `days` is answered by
   *  then, which is the whole reason the beat can show something true. */
  const interWeek = useMemo(
    () => (a.days ? buildWeekPlan({ ...(a as Answers), days: a.days }, sessionMin).days : []),
    [a, sessionMin],
  );

  /** Their answers, in the same labels the quiz's tray used - one source
   *  (trayChips), three surfaces (tray, gate mail, artifact). */
  const chips = useMemo(() => trayChips(a), [a]);

  /** The programme's first workout, for the artifact's last line item. Null on
   *  a degraded catalogue - the row simply does not render. */
  const firstW = useMemo(() => {
    const code = catalog.entry?.sessions[0]?.code;
    return code ? catalog.workouts.find((w) => w.code === code) ?? null : null;
  }, [catalog]);

  /** The parsed body block, or null when they skipped or have not finished. */
  const bodyInput = useMemo<BodyInput | null>(() => {
    if (skipCalc || !bodyConsent) return null;
    const parsed = parseBody({
      sex: body.sex, age: Number(body.age), heightCm: Number(body.heightCm),
      weightKg: Number(body.weightKg), goal: body.goal, tempo: body.tempo,
    });
    return Array.isArray(parsed) ? null : parsed;
  }, [skipCalc, bodyConsent, body]);

  /** Everything needed is answered by the gate, so the result is simply ready
   *  when the reveal arrives - no second form and no second submit. */
  const energy = useMemo<Energy | null>(
    () => (bodyInput && isComplete(a) ? computeEnergy(bodyInput, a.level, a.days, a.focus, sessionMin) : null),
    [bodyInput, a, sessionMin],
  );

  // R11 · the reveal's scroll map. One ref per instrumented section; the
  // mobile fold-offer and the desktop rail share the "offer" name because
  // exactly one of them is visible at any viewport. Declared unconditionally
  // (hooks) even though they only attach on the reveal.
  const planRef = useSectionView("plan_card");
  const mechRef = useSectionView("mechanism");
  const alexaRef = useSectionView("alexa");
  const offerMobRef = useSectionView("offer");
  const offerRailRef = useSectionView("offer");
  const membersRef = useSectionView("members");
  const faqRef = useSectionView("faq");
  const closeSecRef = useSectionView("close");

  // Fetch the reveal's media once per session on entering the reveal. A
  // failure (expired token, offline, emulator without videos) is silent: the
  // page renders its non-media fallbacks and sells exactly as before.
  useEffect(() => {
    if (screen !== "reveal" || !leadToken || media) return;
    let live = true;
    fetch(`/api/ujrakezdes-lead/media?lt=${leadToken}`)
      .then((r) => (r.ok ? r.json() : null))
      // `programs` belongs in the annotation: it survived only because a TS
      // type cannot delete a JSON field, and the next reader would reasonably
      // conclude the poster strip has no data behind it.
      .then((b: { first: FirstMedia | null; cards: MediaCard[]; programs?: { slug: string; poster: string }[] } | null) => {
        if (live && b) setMedia(b);
      })
      .catch(() => { /* fallbacks render */ });
    return () => { live = false; };
  }, [screen, leadToken, media]);

  /** R4's pick handler - state, session memory and the event in one place. */
  const pickStart = useCallback((p: StartPick) => {
    setStartPick(p);
    try { sessionStorage.setItem("lexfit_ujra_start", p); } catch { /* ignore */ }
    trackUjrakezdesStartDay(p);
  }, []);

  /**
   * The one place this funnel talks to the server. The gate calls it, and the
   * energy module calls it again with a body block attached; routing both
   * through the same function is what stops the two payloads drifting apart.
   */
  const post = useCallback((opts: { eventId?: string }) =>
    fetch("/api/ujrakezdes-lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        consent_marketing: consent,
        answers: a,
        hp_field: hp,
        ...(opts.eventId ? { event_id: opts.eventId, marketing_context: marketingContext() } : {}),
        ...(bodyInput ? { body: bodyInput, consent_health: true } : {}),
        utm: readUtm(),
      }),
    }), [email, consent, a, hp, bodyInput]);

  /** Q5's "Tovább". Hoisted rather than written inline in the cta prop: a
   *  handler created during render and closing over refs is what the compiler
   *  lint flags, and hoisting it is the fix rather than the silencer. */
  /**
   * Every section named, all the time, with the current one lifted out by
   * weight and opacity. Showing only the current label told somebody where they
   * were but never where they were going - the shape of the thing they had
   * agreed to was invisible until they reached the end of it.
   */
  const sectionLabels = (
    // Reuses `.fnl-top`'s own row so the horizontal padding, the gap and the
    // spacer width all track the back button at every breakpoint - the offsets
    // differ between desktop and the two mobile height ladders, and hardcoding
    // any of them would misalign the labels on some phone.
    <div className="fnl-top u-secs-row">
      <span className="fnl-back-spacer" aria-hidden="true" />
      <ol className="u-secs" aria-hidden="true">
        {C.SECTIONS.map((sec, i) => (
          <li
            key={sec.key}
            className={i === SECTION_OF[screen] ? "on" : i < SECTION_OF[screen] ? "done" : ""}
          >
            {sec.label}
          </li>
        ))}
      </ol>
    </div>
  );

  /** Every body field present. The consent is checked separately, because a
   *  filled form without it must still be able to move on - it just moves on
   *  without storing anything. */
  const bodyReady = !!(body.sex && body.age && body.heightCm && body.weightKg);

  const finishCare = useCallback(() => {
    setA((p) => ((p.care ?? []).length ? p : { ...p, care: ["none"] }));
    setLanded("care");
    trackUjrakezdesStep("care", 5);
    advance();
  }, [advance]);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (validateEmail(email)) { setErr(C.GATE.emailError); return; }
    if (!isComplete(a)) { back(); return; }

    setBusy(true);
    setErr(null);
    const eventId = newEventId();
    try {
      const res = await post({ eventId });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json().catch(() => ({}))) as { token?: string };
      if (body.token) setLeadToken(body.token);
      trackUjrakezdesLead(eventId);
      // R1: the build beat between gate and reveal. Watched work is valued
      // work - the plan appearing instantly read as a plan worth nothing.
      go("building");
    } catch {
      // The plan is theirs either way - but we cannot claim to have mailed it,
      // so the error says what actually failed and invites a retry.
      setErr(C.GATE.networkError);
    } finally {
      setBusy(false);
    }
  }, [busy, email, a, back, go, post]);


  // ── R1 · the plan-build beat (gate → reveal only) ──────────────────────────
  // Its own full-screen branch: it is not in ORDER, has no back button, and
  // advances by itself. The steps echo the person's OWN answers - the labor
  // must be legible as theirs, or the illusion is just a spinner.
  if (screen === "building") {
    const by = (step: string) => chips.find((c) => c.step === step)?.label;
    const careLabels = chips
      .filter((c) => c.step === "care" && c.key !== "care-none")
      .map((c) => c.label)
      .join(" · ");
    const steps: BuildStep[] = [
      { label: C.BUILD.steps.level, chip: by("level") },
      { label: C.BUILD.steps.days, chip: by("days") },
      ...(careLabels ? [{ label: C.BUILD.steps.care, chip: careLabels }] : []),
      { label: C.BUILD.steps.focus, chip: by("focus") },
    ];
    return (
      <PlanBuild
        steps={steps}
        onDone={() => { trackUjrakezdesLoaderDone(); go("reveal"); }}
      />
    );
  }

  // ââ The reveal is NOT a wizard step ââââââââââââââââââââââââââââââââââââââââ
  // It carries the week, the whole Foundation programme, the calculator and the
  // offer. The split-screen exists to keep a single question company; giving
  // long-form content half a viewport would be using the layout against itself.
  if (screen === "reveal" && plan) {
    // ═══ The reveal — design-handoff rebuild (2026-09-08) ═══════════════════
    //
    // Block order per ~/Downloads/design_handoff_reveal README §5 (the order IS
    // the design): B0 progress-at-88% → B1 plan card → B2 offer at the fold →
    // B3 mechanism → B4 first workout → (B5 hidden: no consented member photos)
    // → B6 entry → B7 guarantee band → B8 Alexa → B9 anti-avatar → B10 FAQ →
    // B11 close → S sticky price bar.
    //
    // Desktop ≥1024px: B1/B3/B4 form the left column, the decision panel is a
    // 320px sticky rail on the right (B2 and B6 fold into it), B7 onward runs
    // full-width. Mobile is the master DOM order; the rail and the mobile-only
    // blocks swap via CSS, never by re-ordering the document.
    //
    // Guest playback does not exist (pay-to-join hard gate, locked P0), so the
    // handoff's guest button and every „vendégként" string are omitted - the
    // handoff itself prescribes exactly that for this case (Q3).
    const intro = formatHuf(PRICES.week_intro.amountHuf);
    const weekStd = formatHuf(PRICES.week_std.amountHuf);
    const month = formatHuf(PRICES.month_std.amountHuf);
    const annual = formatHuf(PRICES.annual_std.amountHuf);
    const perMonth = formatHuf(perMonthHuf());
    // The honesty comparison: weekly rhythm at monthly scale. Computed, never
    // typed - 1 990 × 4.33 rounded to the nearest hundred (handoff §8).
    const weeklyMonthly = formatHuf(Math.round((PRICES.week_std.amountHuf * 4.33) / 100) * 100);

    /** The CTA target. `q=plan` opens the join wizard on the plan picker,
     *  `plan=week_intro` preselects the intro, and `lt` carries the plan token
     *  so the wizard can rebuild the answers even in a different browser. */
    const ctaHref = leadToken ? `${CTA_HREF}&lt=${leadToken}` : CTA_HREF;

    /** Rail v3's certainty lines, from HER answers - the personalized
     *  counter to "will I stick with it". Care picks ONE line by prevalence
     *  in the lead base (knee 48 > back 38 > quiet 15); four lines total,
     *  because a certainty list long enough to scroll stops being certain. */
    const fitLines = [
      a.level === "none" || a.level === "rare"
        ? C.REVEAL.rail.fit.levelLow
        : C.REVEAL.rail.fit.levelMid,
      a.care?.includes("knee")
        ? C.REVEAL.rail.fit.knee
        : a.care?.includes("back")
          ? C.REVEAL.rail.fit.back
          : a.care?.includes("quiet")
            ? C.REVEAL.rail.fit.quiet
            : null,
      C.REVEAL.rail.fit.home,
      a.days === "flex"
        ? C.REVEAL.rail.fit.flex
        : C.REVEAL.rail.fit.days(plan.trainingCount),
    ].filter((f): f is string => !!f);

    /** Every CTA runs through here before the browser follows the link: the
     *  quiz's answers become the join wizard's draft (so /register skips its
     *  questions without losing a single preference), then the click is
     *  counted. localStorage is synchronous - the write always lands.
     *
     *  ANDROID META WEBVIEW: the link is rerouted to the system browser via
     *  intent:// BEFORE any account exists. Embedded Stripe checkout inside
     *  the FB/IG webview killed 3/3 payment attempts of the first campaign
     *  flight (docs/lead-conversion-diagnosis.md L1) - and this is the one
     *  point in the funnel where escaping costs nothing: no auth state, no
     *  localStorage the next page cannot live without (?lt= carries the
     *  answers). */
    const goCheckout = (where: "offer" | "sticky" | "finish" | "cinema" | "hero") => (e: React.MouseEvent) => {
      if (isComplete(a)) writeQuizHandoff(a);
      if (where === "sticky") trackUjrakezdesStickyClick();
      else if (where === "finish") trackUjrakezdesFinishCta();
      else if (where === "cinema") trackUjrakezdesCinemaCta();
      else if (where === "hero") trackUjrakezdesHeroCta();
      else trackUjrakezdesOfferClick();
      const ext = externalBrowserHref(ctaHref);
      if (ext) {
        e.preventDefault();
        window.location.href = ext;
      }
    };

    return (
      <>
      {/* The cinematic opener sits OVER the page rather than replacing it: the
          reveal is already rendered underneath, so dismissing it is instant and
          the browser has had the whole sequence to load what is below. Beat 5
          is the offer, and its CTA is the same href and handler as every other
          CTA here - one destination, one tracked click. */}
      {cinema && media?.first && (
        <CinemaReveal
          plan={{
            days: plan.days.map((d) => ({ short: d.short, training: d.training })),
            trainingCount: plan.trainingCount,
            minutes: plan.firstWorkoutMinutes,
            firstWorkout: {
              title: media.first.title,
              theme: media.first.theme,
              mins: media.first.mins,
              poster: media.first.poster,
            },
          }}
          offer={{
            intro,
            weekStd,
            href: ctaHref,
            onGo: goCheckout("cinema"),
            guarantee: GUARANTEE_LIVE ? GARANCIA.shortLead + GARANCIA.shortBody : undefined,
            // The dated second charge - the diagnosis' "the fear is never the
            // 490, it is the invisible 1 990". Date resolved on the client
            // because this route is prerendered.
            timeline: cinemaToday
              ? C.REVEAL.offer.timeline(intro, weekStd, nextChargeLabel("week_intro", cinemaToday))
              : undefined,
            perDay: formatHuf(perDayHuf()),
            // Her own answers, turned into solutions. Picked by prevalence and
            // by which objection costs the most - see copy.pickCinemaAnswers.
            fit: C.REVEAL.pickCinemaAnswers(a),
          }}
          onDone={() => { setCinema(false); trackUjrakezdesCinemaDone(); }}
        />
      )}
      <main className="lxu u2" ref={stageRef} tabIndex={-1}>
        {/* ── B0 · the quiz's bar, parked at 88% ──────────────────────────── */}
        <div className="u2-top">
          <span className="u2-top-mark">LEXFIT</span>
          <span className="u2-top-lbl">
            <b>{C.REVEAL.progress.done}</b> · {C.REVEAL.progress.left}
          </span>
          <span className="u2-top-bar" aria-hidden="true">
            <i style={{ width: `${C.REVEAL.progress.pct}%` }} />
          </span>
        </div>
        {/* R2 · endowed progress: the bar read as work ALREADY DONE, so the
            last step is a completion, not a new decision. */}
        <p className="u2-top-cap">{C.REVEAL.progress.caption}</p>

        <div className="u2-grid" ref={gridRef}>
          <div className="u2-main">
            {/* ── B-W · back from the free workout. Renders ONLY on the return
                from the player (`?w=1`), above everything else: she has just
                been inside the product, and the one thing worth saying at that
                moment is that every other session looks exactly like it. The
                block claims no completion - the guest player reports none. ── */}
            {justWatched && (
              <section className="u2-blk u2-finish u2-m1" style={{ ["--i" as string]: 0 }}>
                <p className="u2-eyebrow">{C.REVEAL.finish.eyebrow}</p>
                <h2>{C.REVEAL.finish.hd}</h2>
                <p className="u2-body">{C.REVEAL.finish.body}</p>
                <a className="u2-cta" href={ctaHref} onClick={goCheckout("finish")}>
                  {C.REVEAL.offer.cta(intro)}
                </a>
                {GUARANTEE_LIVE && <p className="u2-guarline">{C.REVEAL.offer.guarLine}</p>}
              </section>
            )}

            {/* ── B1 · the plan card ──────────────────────────────────────── */}
            <section
              className="u2-plan"
              aria-labelledby="u2-h1"
              ref={(el) => { planRef(el); planCardEl.current = el; }}
            >
              <p className="u2-eyebrow u2-m1" style={{ ["--i" as string]: 0 }}>{C.REVEAL.b1.eyebrow}</p>
              <h1 id="u2-h1" className="u2-m1" style={{ ["--i" as string]: 1 }}>{C.REVEAL.b1.hd}</h1>
              <p className="u2-sub u2-m1" style={{ ["--i" as string]: 2 }}>
                {C.REVEAL.b1.sub(plan.trainingCount, plan.sessionLabel)}
              </p>
              <p className="u2-identity u2-m1" style={{ ["--i" as string]: 3 }}>{C.REVEAL.b1.identity}</p>

              <ul className="u2-chips u2-m1" style={{ ["--i" as string]: 4 }} aria-label={C.REVEAL.b1.chipsAria}>
                {chips.slice(0, 6).map((c) => <li key={c.key}>{c.label}</li>)}
              </ul>

              <div className="u2-week" role="list" aria-label="A heti terved">
                {plan.days.map((d, i) => (
                  <div
                    key={d.weekday}
                    role="listitem"
                    className={`u2-day u2-m1 ${d.training ? "on" : ""}`}
                    style={{ ["--i" as string]: 5 + i }}
                  >
                    <span className="d">{d.short}</span>
                    <span className="dot" aria-hidden="true" />
                    <span className="u-sr-only">
                      {d.full}: {d.training ? `${d.minutes} perc` : "pihenőnap"}
                    </span>
                  </div>
                ))}
              </div>

              <ol className="u2-miles u2-m1" style={{ ["--i" as string]: 12 }} aria-label="Mérföldkövek">
                {C.REVEAL.b1.milestones(GUARANTEE_LIVE).map((m, i) => (
                  <li key={m} className={i === C.REVEAL.b1.guardIdx ? "guard" : i === 0 ? "now" : ""}>{m}</li>
                ))}
              </ol>

              <dl className="u2-stats u2-m1" style={{ ["--i" as string]: 13 }}>
                <div><dt><Count to={plan.trainingCount} /></dt><dd>{C.REVEAL.b1.stats.days}</dd></div>
                <div><dt><Count to={plan.firstWorkoutMinutes} /></dt><dd>{C.REVEAL.b1.stats.mins}</dd></div>
                {/* "0 eszköz" read as an empty state; "0 Ft eszköz" is a benefit. */}
                {/* „0" and not „0 Ft": this stat sits ~60px above the price,
                    and a forint here invites the comparison the offer has to
                    survive. The claim is about equipment, not cost. */}
                <div><dt>0</dt><dd>{C.REVEAL.b1.stats.equip}</dd></div>
              </dl>

              {/* The hero's buy row. After the cinema has made the case and
                  named the price, the plan card is no longer only "here is your
                  week" - it is the answer to the offer she just watched, so the
                  one-tap path lives inside the hero instead of a screen below
                  it. Same href and handler as every other CTA; counted
                  separately so the cinema's effect on it is visible. */}
              <div className="u2-herobuy">
                <div className="u2-herobuy-p">
                  <b>{C.REVEAL.b1.buyLead(intro)}</b>
                  <span>{C.REVEAL.b1.buySub(weekStd)}</span>
                </div>
                <a className="u2-cta u2-cta-sm" href={ctaHref} onClick={goCheckout("hero")}>
                  {C.REVEAL.b1.buyCta}
                </a>
              </div>

              {C.ENERGY_LIVE && energy && (
                <p className="u2-calc u2-m1" style={{ ["--i" as string]: 14 }}>
                  {C.REVEAL.b1.calc(energy.kcal.toLocaleString("hu-HU"), energy.stepTarget.toLocaleString("hu-HU"))}
                </p>
              )}
            </section>

            {/* ── „Az első hónapod" - the plan, extended from one week to
                four. Sits directly after the plan card because it IS the plan
                card's continuation: the free week is what she came for, the
                month is what the membership is. Before the offer, so the
                value is on the table when the price arrives. ─────────────── */}
            <MonthStory plan={plan} />

            {/* ── R4 · when do you start. MOVED ABOVE THE OFFER (mobile audit
                2026-09-14): picking „ma este" is an implementation intention -
                a micro-commitment to a time - and commitment/consistency only
                works on what comes AFTER it. Sitting a screen below the price
                it was a nice touch; sitting above it, it is the first yes.
                It writes nothing upstream, so the move costs nothing. ─────── */}
            <StartDayPick pick={startPick} onPick={pickStart} mins={plan.firstWorkoutMinutes} />

            {/* ── B2 · the offer at the fold (mobile; desktop = the rail) ──── */}
            <section className="u2-offer u2-mobile u2-m1" style={{ ["--i" as string]: 15 }} ref={b2Ref}>
              <RevealOffer intro={intro} weekStd={weekStd} href={ctaHref} onGo={goCheckout("offer")} />
            </section>

            {/* ── R3 · the habit-strength curve - the mechanism, drawn ────── */}
            <HabitCurve trainingCount={plan.trainingCount} />

            {/* ── The first workout, watchable free (v2). The card is the
                real video; playing opens the REAL /player page in guest mode
                (?lt=) - same HUD the membership gets. Falls back to the
                static cover while media hasn't loaded (or can't). ─────────── */}
            <section className="u2-blk u2-firstblk">
              <p className="u2-eyebrow">
                {C.REVEAL.b4.eyebrow(startPick === "today" ? "ma este" : "hétfő")}
              </p>
              <h2>{C.REVEAL.b4.hd}</h2>
              {media?.first ? (
                <FirstWorkoutCard
                  title={media.first.title}
                  theme={media.first.theme}
                  mins={media.first.mins}
                  poster={media.first.poster}
                  onPlay={() => {
                    // The REAL player, guest mode: same HUD, same blocks,
                    // same everything the membership plays in. ?lt= carries
                    // access; autostart skips the redundant preview - she
                    // already pressed play on the real poster.
                    trackUjrakezdesWatchOpen(media.first!.code);
                    window.location.href = `/player/${media.first!.code}?lt=${leadToken}&autostart=1`;
                  }}
                />
              ) : (
                firstW && (
                  <div className="u2-cover" aria-hidden="true">
                    <span className="mono">LEXFIT · {firstW.code}</span>
                    <b>{firstW.theme}</b>
                    <i>{firstW.mins} PERC</i>
                  </div>
                )
              )}
              <p className="u2-xs">{C.REVEAL.b4.sub(plan.firstWorkoutMinutes)}</p>
            </section>

            {/* ── B3 · the mechanism's opening mirror. The two rules moved
                under the curve - they are what it draws; restating them here
                made the same argument twice. ─────────────────────────────── */}
            <section className="u2-blk" ref={mechRef}>
              <p className="u2-eyebrow">{C.REVEAL.b3.eyebrow}</p>
              <p className="u2-body">{C.REVEAL.b3.body}</p>
            </section>

            {/* ── B8 · Alexa - moved ABOVE the offer (R8): the story earns
                the price. Cohort line is the tribe's door. ───────────────── */}
            <section className="u2-blk u2-alexa" ref={alexaRef}>
              <Image src="/alexa-av.jpg" alt="Alexa" width={96} height={96} className="u2-face u2-face-lg" />
              <div>
                <p className="u2-eyebrow">{C.REVEAL.alexaEyebrow}</p>
                <h2>{C.ALEXA.name}</h2>
                <p className="u2-body">{C.ALEXA.story} {C.ALEXA.promise}</p>
                <p className="u2-signed">{C.REVEAL.alexaSigned}</p>
                <p className="u2-cohort">{C.REVEAL.alexaCohort}</p>
              </div>
            </section>

            {/* ── The shelf: the Start programme's next sessions as real
                cards (v2) - the product proving itself just before the
                offer. Locked taps land on the offer, honestly. ───────────── */}
            {media && media.cards.length > 0 && (
              <WorkoutCardsRow
                cards={media.cards}
                onLockedTap={() => b2Ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              />
            )}

            {/* ── B5 · „Akik már csinálják" - UNLOCKED 2026-09-13: consented
                member photos exist now (owner-supplied). Same finish-card
                marquee as the landing and the post-workout screen, adapted to
                the reveal's white ground; the honesty line ships with it, or
                the section does not ship. Tapping a card lands on the offer,
                same as the locked shelf cards. ─────────────────────────────── */}
            <section className="u2-blk u2-members" ref={membersRef}>
              <p className="u2-eyebrow">{C.REVEAL.members.eyebrow}</p>
              <h2>{C.REVEAL.members.hd}</h2>
              <div className="u2-members-belt">
                <FinishExamples
                  onPick={() => b2Ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
                />
              </div>
              <p className="u2-xs">{C.REVEAL.members.honesty}</p>
            </section>

            {/* ── B6 · the entry (mobile; desktop = the rail) ─────────────── */}
            <section className="u2-blk u2-entry u2-mobile" aria-labelledby="u2-entry-h" ref={offerMobRef}>
              <p className="u2-eyebrow">{C.REVEAL.entry.eyebrow}</p>
              <h2 id="u2-entry-h">{C.REVEAL.entry.hd(intro)}</h2>
              <p className="u2-body">{C.REVEAL.entry.lead(weekStd)}</p>

              {/* C7 · certainty before catalogue: the same four personalized
                  lines the desktop rail carries, on the surface ~100% of the
                  traffic actually uses. The audience's objection is "will I
                  stick with it" - answer it before listing what she gets. */}
              <p className="u2-label">{C.REVEAL.rail.fitTitle}</p>
              <ul className="u2-fit">
                {fitLines.map((f) => (
                  <li key={f}><span className="fk" aria-hidden="true">✓</span>{f}</li>
                ))}
              </ul>

              <p className="u2-label">{C.REVEAL.entry.listTitle}</p>
              {/* Each programme shows its own first frame (graphics audit
                  2026-09-14). This list was the page's most wordless stretch -
                  1 215px of numbers and prose with no image at all - and it is
                  the block that has to carry "this is what you get". The
                  programmes have no cover of their own, so the poster is the
                  real first session, signed at 192px. Degrades to the number
                  chip whenever media has not loaded (or cannot). */}
              <ul className="u2-inc u2-stack">
                {C.REVEAL.entry.items.map((it) => (
                  <li key={it.b}>
                    <span className="u2-inc-ic" aria-hidden="true">
                      <LxIcon d={lxPaths[it.icon as keyof typeof lxPaths]} size={17} sw={1.6} />
                    </span>
                    <span><b>{it.b}</b> - {it.d}</span>
                  </li>
                ))}
              </ul>
              {/* „Mire van edzésed" - what the library COVERS, next to what the
                  programmes ARE. The objection this answers is „lesz-e benne
                  olyan, ami nekem jó", and a spread of categories answers it
                  faster than any promise. Counts are over the same 130
                  sessions the offer claims. */}
              <div className="u2-cats">
                <p className="u2-label">{C.REVEAL.entry.catsTitle}</p>
                <ul className="u2-catchips">
                  {C.REVEAL.entry.cats.map((c) => (
                    <li key={c.l}><b>{c.n}</b> {c.l}</li>
                  ))}
                </ul>

                <p className="u2-label">{C.REVEAL.entry.typesTitle}</p>
                <ul className="u2-catchips u2-catchips-alt">
                  {C.REVEAL.entry.types.map((c) => (
                    <li key={c.l}><b>{c.n}</b> {c.l}</li>
                  ))}
                </ul>

                <p className="u2-label">{C.REVEAL.entry.durTitle}</p>
                <ul className="u2-catchips u2-catchips-alt">
                  {C.REVEAL.entry.durs.map((c) => (
                    <li key={c.l}><b>{c.n}</b> {c.l}</li>
                  ))}
                </ul>
                <p className="u2-xs">{C.REVEAL.entry.catsFoot}</p>
              </div>

              {/* R5 · the stack lands on one number. */}
              <p className="u2-sum">{C.REVEAL.entry.sum(intro)}</p>

              <RevealRhythm month={month} annual={annual} perMonth={perMonth} weeklyMonthly={weeklyMonthly} />
              <p className="u2-body u2-yt">{C.REVEAL.entry.youtube}</p>
            </section>

            {/* B4 folded into the first-workout watch block above (v2). */}
          </div>

          {/* ── The decision rail, v3 (desktop only) ────────────────────────
              Conversion order per the F-pattern read: the sticky rail's top
              ~350px is the page's highest-attention real estate, so it opens
              with the personal echo (her plan, not a product), the price with
              its dated timeline, the CTA and the trust line - all above the
              rail's own fold. The nine-row programme list is gone: for this
              audience (60% train never/rarely) the objection is "will I stick
              with it", answered by four certainty lines built from HER
              answers. The full programme list stays on mobile B6. */}
          <aside className="u2-rail" aria-label="A belépő">
            <div className="u2-rail-in" ref={offerRailRef}>
              <p className="u2-rail-done"><span className="tick" aria-hidden="true">✓</span>{C.REVEAL.rail.done}</p>
              <ul className="u2-chips u2-rail-chips" aria-hidden="true">
                {chips.slice(0, 3).map((c) => <li key={c.key}>{c.label}</li>)}
              </ul>

              <h2>{C.REVEAL.entry.hd(intro)}</h2>
              <RenewLine intro={intro} weekStd={weekStd} />

              <a className="u2-cta u2-rail-cta" href={ctaHref} onClick={goCheckout("offer")} ref={railCtaEl}>
                {C.REVEAL.offer.cta(intro)}
              </a>
              <p className="u2-calm">{C.REVEAL.offer.calm}</p>
              <p className="u2-rail-trust">
                {GUARANTEE_LIVE ? `${C.REVEAL.offer.proofGuar} · ${C.REVEAL.rail.trust}` : C.REVEAL.rail.trust}
              </p>

              <p className="u2-label">{C.REVEAL.rail.fitTitle}</p>
              <ul className="u2-fit">
                {fitLines.map((f) => (
                  <li key={f}><span className="fk" aria-hidden="true">✓</span>{f}</li>
                ))}
              </ul>

              <p className="u2-rail-allin">{C.REVEAL.rail.allIn}</p>
              <p className="u2-proof"><b>{C.REVEAL.offer.proofCount}</b>{C.REVEAL.offer.proofTail}</p>

              <RevealRhythm month={month} annual={annual} perMonth={perMonth} weeklyMonthly={weeklyMonthly} />
            </div>
          </aside>
        </div>

        {/* ── B7 · the guarantee band - the page's one ground change ──────── */}
        {GUARANTEE_LIVE && (
          <section className="u2-band u2-dark" id="garancia">
            <div className="u2-col">
              <p className="u2-eyebrow">{C.REVEAL.guarEyebrow}</p>
              <h2>{GARANCIA.heading}</h2>
              <p className="u2-body">
                {GARANCIA.bodyLead}<b>{GARANCIA.bodyStrong}</b>{GARANCIA.bodyTail}
              </p>
              <p className="u2-xs">{GARANCIA.statutory}</p>
            </div>
          </section>
        )}

        {/* B8 moved into the main column, above the offer (R8). */}

        {/* ── B9 · who it is not for ──────────────────────────────────────── */}
        <section className="u2-band u2-tight">
          <div className="u2-col u2-notfor">
            <p className="u2-eyebrow">{C.REVEAL.notFor.eyebrow}</p>
            <p className="u2-body">{C.REVEAL.notFor.body}</p>
          </div>
        </section>

        {/* ── B10 · FAQ - billing questions first (R10): the money
            objections live within one scroll of the offer. ───────────────── */}
        <section className="u2-band u2-tight" ref={faqRef}>
          <div className="u2-col">
            <p className="u2-eyebrow">{C.REVEAL.faqTitle}</p>
            <div className="u2-faq">
              {C.REVEAL.faq
                .filter((f) => !f.guar || GUARANTEE_LIVE)
                .map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.billing ? C.REVEAL.faqBilling(intro, weekStd) : f.a}</p>
                  </details>
                ))}
            </div>
          </div>
        </section>

        {/* ── B11 · the close ─────────────────────────────────────────────── */}
        <section className="u2-band u2-close" ref={closeSecRef}>
          <div className="u2-col">
            <blockquote>
              <p>{C.REVEAL.close.quote}</p>
              <footer>{C.REVEAL.close.by}</footer>
            </blockquote>
            <a
              className="u2-cta"
              href={ctaHref}
              ref={closeCtaRef}
              onClick={goCheckout("offer")}
            >
              {C.REVEAL.offer.cta(intro)}
            </a>
            {GUARANTEE_LIVE && <p className="u2-xs">{C.REVEAL.close.sub}</p>}
            {/* R6 · the cancel-anxiety line replaces the bare "bármikor
                lemondhatod" - naming the reminder email is what kills the
                quiet-charge fear (and the mail system really sends it). */}
            <p className="u2-xs u2-calm">{C.REVEAL.offer.calm}</p>
            <p className="u2-later">{C.REVEAL.close.later}</p>
            <p className="u2-trust">{C.REVEAL.close.trust}</p>
          </div>
        </section>

        {/* ── S · the sticky price bar (mobile only; M4) ──────────────────── */}
        <div className={`u2-sticky${stickyOn ? " on" : ""}`} aria-hidden={!stickyOn}>
          <div className="u2-sticky-p">
            <b>{C.REVEAL.sticky.line(intro)}</b>
            <span>{C.REVEAL.sticky.sub(weekStd)}</span>
          </div>
          <a className="u2-cta u2-cta-sm" href={ctaHref} onClick={goCheckout("sticky")}>
            {C.REVEAL.sticky.go}
          </a>
        </div>

      </main>
      </>
    );
  }

  // ââ The interstitial keeps the shell, and takes it over ââââââââââââââââââââ
  // Same photograph, same column; only the sheet is replaced by the two rules.
  // Dropping the shell for two seconds would read as a page break rather than a
  // beat inside the flow.
  return (
    <div className="lx authx fnl-wiz u-onb" data-step={BRAND_STEP[screen]}>
      <div className="authx-shell">
        {/* The gate asks where to send the plan, so the panel behind it shows
            the mail. Every other step keeps the photography. */}
        {screen === "gate"
          ? <MailPreview plan={plan} answers={a} />
          : <BrandPanel step={BRAND_STEP[screen]} />}

        <main className="fnl-col">
          <div className="fnl-sr" role="status" aria-live="polite">
            {C.SECTIONS[SECTION_OF[screen]]!.label}
          </div>

          {screen === "interstitial" && (
            <div className="fnl-main fnl u-inter-step">
              <div className="fnl-sheet">
                <div className="fnl-scroll">
                  {/* Not a loading screen. They have just answered how many days
                      and when, so at this exact point their week is knowable -
                      and showing it is worth more than two lines of text over a
                      photograph. The rules below then land as captions on
                      something concrete rather than as claims in the air. */}
                  <p className="u-inter-eyebrow">{C.INTERSTITIAL.eyebrow}</p>

                  <ul className="u-inter-week" aria-label="A heti terved">
                    {interWeek.map((d, i) => (
                      <li
                        key={d.weekday}
                        className={d.training ? "on" : ""}
                        style={{ ["--i" as string]: i }}
                      >
                        <span className="d">{d.short}</span>
                        <span className="m">{d.training ? "edzés" : "pihenő"}</span>
                      </li>
                    ))}
                  </ul>

                  {C.INTERSTITIAL.lines.map((l, i) => (
                    <p key={l} className="u-inter-line" style={{ ["--i" as string]: i }}>{l}</p>
                  ))}
                </div>
                <div className="fnl-foot">
                  <span className="u-inter-bar" aria-hidden="true"><i /></span>
                </div>
              </div>
            </div>
          )}

          {screen === "gate" && (
            <StepFrame
              onBack={back}
              progressCurrent={C.SECTIONS.length}
              progressTotal={C.SECTIONS.length}
              progressLabels={sectionLabels}
              heading={C.GATE.hd}
              sub={C.GATE.sub}
              headingRef={headingRef}
              cta={
                <>
                  <button className="fnl-cta" onClick={submit as unknown as () => void} disabled={busy}>
                    {busy ? C.GATE.ctaBusy : C.GATE.cta}
                  </button>
                  <p className="fnl-alt">
                    {C.GATE.fine} <Link href="/adatvedelem" className="link">{C.GATE.privacy}</Link>
                  </p>
                </>
              }
            >
              <form onSubmit={submit} noValidate>
                <label className="u-label" htmlFor="u-email">{C.GATE.emailLabel}</label>
                <input
                  id="u-email"
                  className="u-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={C.GATE.emailPlaceholder}
                  value={email}
                  aria-invalid={err ? true : undefined}
                  aria-describedby={err ? "u-email-err" : undefined}
                  onChange={(e) => { setEmail(e.target.value); if (err) setErr(null); }}
                />
                {err && <p className="u-err" id="u-email-err" role="alert">{err}</p>}

                <label className="u-consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>{C.GATE.consent}</span>
                </label>

                {/* Off-screen, never display:none - a bot reads the DOM. */}
                <div className="u-hp" aria-hidden="true">
                  <label htmlFor="u-company">Cég</label>
                  <input
                    id="u-company" name="company" tabIndex={-1} autoComplete="off"
                    value={hp} onChange={(e) => setHp(e.target.value)}
                  />
                </div>
              </form>
            </StepFrame>
          )}

          {/* ── The calculator, offered rather than assumed ───────────────
              Every ad promises „7 kérdés", and the calculator adds three. Asking
              permission keeps that promise true, and it is also the only shape
              under which the Art. 9 consent that follows can be called freely
              given: „no" is a whole button here, not a link under a form. */}
          {screen === "calc_invite" && (
            <StepFrame
              onBack={back}
              progressCurrent={SECTION_OF[screen] + 1}
              progressTotal={C.SECTIONS.length}
              progressLabels={sectionLabels}
              heading={C.CALC_INVITE.hd}
              sub={C.CALC_INVITE.sub}
              helper={C.CALC_INVITE.helper}
              headingRef={headingRef}
              cta={
                <>
                  <button
                    className="fnl-cta"
                    onClick={() => { setSkipCalc(false); go("body"); }}
                  >
                    {C.CALC_INVITE.yes}
                  </button>
                  <button
                    className="fnl-skip"
                    onClick={() => { setSkipCalc(true); go("gate"); }}
                  >
                    {C.CALC_INVITE.no}
                  </button>
                </>
              }
            >
              <></>
            </StepFrame>
          )}

          {/* ── The calculator's three questions, in the flow ─────────────
              They sit after the seven and before the gate, carry their own
              counter (the seven are genuinely done), and the first one can be
              skipped outright - Art. 9 consent has to be freely given, so the
              plan can never be made conditional on handing over body metrics. */}
          {CALC_NO[screen] && (
            <StepFrame
              onBack={back}
              progressCurrent={SECTION_OF[screen] + 1}
              progressTotal={C.SECTIONS.length}
              progressLabels={sectionLabels}
              heading={
                screen === "body" ? C.ENERGY.formHeading
                  : screen === "goal" ? C.ENERGY.goalLabel
                  : C.ENERGY.tempoHeading
              }
              sub={
                screen === "body" ? C.ENERGY.formSub
                  : screen === "goal" ? C.ENERGY.goalSub
                  : screen === "tempo" && body.goal ? C.ENERGY.tempoLead[body.goal]
                  : undefined
              }
              helper={screen === "body" ? C.ENERGY.formMicro : undefined}
              headingRef={headingRef}
              cta={
                screen === "body" ? (
                  <>
                    <button
                      className="fnl-cta"
                      disabled={!bodyReady}
                      onClick={advance}
                    >{C.ENERGY.next}</button>
                    <button
                      className="fnl-skip"
                      onClick={() => { setSkipCalc(true); go("gate"); }}
                    >{C.ENERGY.skip}</button>
                  </>
                ) : screen === "goal" ? (
                  <span className="u-cta-hint">{C.NAV.pickHint}</span>
                ) : (
                  <button className="fnl-cta" onClick={advance}>{C.ENERGY.next}</button>
                )
              }
            >
              {screen === "body" && (
                <>
                  <span className="u-flabel">{C.ENERGY.sexLabel}</span>
                  <div className="u-seg">
                    {C.ENERGY.sexOptions.map((o) => (
                      <button
                        key={o.value} type="button"
                        className={`u-seg-b${body.sex === o.value ? " on" : ""}`}
                        aria-pressed={body.sex === o.value}
                        onClick={() => setBody((p) => ({ ...p, sex: o.value }))}
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
                          min={lo} max={hi} value={body[k]}
                          onChange={(e) => setBody((p) => ({ ...p, [k]: e.target.value }))}
                        />
                      </label>
                    ))}
                  </div>

                  {/* The Art. 9 consent lives on the screen that asks for the
                      data, not bundled into the marketing box at the gate. */}
                  <label className="u-consent">
                    <input
                      type="checkbox" checked={bodyConsent}
                      onChange={(e) => setBodyConsent(e.target.checked)}
                    />
                    <span>{C.ENERGY.consent}</span>
                  </label>

                  {/* Tovább is enabled by the FIELDS, never by the consent -
                      requiring the tick would make the consent coerced. The
                      cost is a silent dead end: three questions answered, no
                      numbers at the reveal, no explanation. This says so. */}
                  {bodyReady && !bodyConsent && (
                    <p className="u-fhint u-consent-warn" role="status">
                      {C.ENERGY.consentMissing}
                    </p>
                  )}
                </>
              )}

              {screen === "goal" && (
                <OptionList
                  ariaLabel={C.ENERGY.goalLabel}
                  value={body.goal || null}
                  onChange={(v) => {
                    const val = v ?? body.goal;
                    if (!val) return;
                    setBody((p) => ({ ...p, goal: val as EnergyGoal }));
                    setLanded("goal");
                    commitTimer.current = setTimeout(advance, COMMIT_MS);
                  }}
                  items={C.ENERGY.goalOptions.map((o) => ({ v: o.value, label: o.label }))}
                />
              )}

              {screen === "tempo" && body.goal && (
                <div className="u-tempos">
                  {(["laza", "kozepes", "intenziv"] as Tempo[]).map((t) => (
                    <button
                      key={t} type="button"
                      className={`u-tempo${body.tempo === t ? " on" : ""}`}
                      aria-pressed={body.tempo === t}
                      onClick={() => setBody((p) => ({ ...p, tempo: t }))}
                    >
                      <span className="row">
                        <b>{C.ENERGY.tempoName[t]}</b>
                        {t === "kozepes" && <em>{C.ENERGY.tempoRecommended}</em>}
                        <span className="korr">{tempoDelta(body.goal as EnergyGoal, t)}</span>
                      </span>
                      <span className="desc">{C.ENERGY.tempoDesc[body.goal][t]}</span>
                      <span className="rate">{tempoRate(body.goal as EnergyGoal, t)}</span>
                    </button>
                  ))}
                </div>
              )}
            </StepFrame>
          )}

          {qNum > 0 && (
            <StepFrame
              onBack={idx > 0 ? back : undefined}
              progressCurrent={SECTION_OF[screen] + 1}
              progressTotal={C.SECTIONS.length}
              progressLabels={sectionLabels}
              heading={QUESTION[screen as StepId].hd}
              sub={QUESTION[screen as StepId].micro}
              headingRef={headingRef}
              cta={
                screen === "care" ? (
                  <button className="fnl-cta" onClick={finishCare}>{C.Q_CARE.cta}</button>
                ) : (
                  <span className="u-cta-hint">{C.NAV.pickHint}</span>
                )
              }
            >
              {screen === "care" ? (
                <OptionList
                  multi
                  ariaLabel={C.Q_CARE.hd}
                  exclusive="none"
                  value={a.care ?? []}
                  onChange={(v) => setA((p) => ({ ...p, care: v as Care[] }))}
                  items={C.Q_CARE.options.map((o) => ({
                    v: o.value, label: o.label, sub: o.sub, icon: o.icon,
                  }))}
                />
              ) : (
                <OptionList
                  ariaLabel={QUESTION[screen as StepId].hd}
                  value={(a as Record<string, string | undefined>)[screen] ?? null}
                  onChange={(v) => {
                    // OptionList treats a tap on the selected row as a deselect.
                    // These steps have no Tovább, so after coming back with an
                    // answer already chosen that would leave no way forward
                    // except changing it. Re-confirming advances instead.
                    const val = v ?? (a as Record<string, string | undefined>)[screen];
                    if (val) pick(screen as keyof Answers, val as never);
                  }}
                  items={QUESTION[screen as StepId].options.map((o) => ({
                    v: o.value,
                    label: o.label,
                    sub: o.sub,
                    icon: o.icon,
                    // "2 nap" and "20-30 perc" ARE numbers; an icon standing in
                    // for one is a worse tile than the number itself.
                    ...(o.icon ? {} : { leading: <span className="u-numtile">{NUM_TILE[o.value] ?? ""}</span> }),
                  }))}
                />
              )}

              {/* The plan assembling itself, inside the sheet where the answers
                  are given rather than floating above the chrome. */}
              <PlanTray a={a} latest={landed} />
            </StepFrame>
          )}
        </main>
      </div>
    </div>
  );
}

/** The reveal's CTA target. One destination for every button on the page.
 *  `q=plan` opens the join wizard DIRECTLY on the plan picker - the reveal's
 *  quiz already asked the questions, and writeQuizHandoff() carries the
 *  answers across as the wizard's own draft (owner decision 2026-09-08).
 *  `plan=week_intro` preselects the intro week there. */
const CTA_HREF = "/register?q=plan&plan=week_intro";

/** B2 / rail: the offer. Module scope - a component created during render gets
 *  a new identity every pass.
 *
 *  The renewal line upgrades itself once the client knows today's date
 *  (post-mount - the route is statically prerendered, so a render-time date
 *  would be frozen at build time): "Ma: 490 Ft → szept 22-től 1 990 Ft/hét".
 *  Naming the exact date and amount is the anti-bait move - the fear is never
 *  the 490, it is the invisible 1 990 (R5/R6). Until it resolves, the undated
 *  promise stands in. */
/** The dated renewal line, resolved post-mount (the route is statically
 *  prerendered; a render-time date would freeze at build). Shared by the
 *  mobile fold offer and the rail. */
function RenewLine({ intro, weekStd }: { intro: string; weekStd: string }) {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(Date.now()), []);
  const line = today == null
    ? C.REVEAL.offer.renew(weekStd)
    : C.REVEAL.offer.timeline(intro, weekStd, nextChargeLabel("week_intro", today));
  return <p className="u2-renew">{line}</p>;
}

/**
 * The offer, rebuilt 2026-09-14 for the offer_view → offer_click leak.
 *
 * What was here before: proof, price, button, guarantee footnote, renewal,
 * reassurance - six elements, none of which said what the money buys. On
 * Sep 14, 42 visitors reached this block and none clicked. The fix is not
 * louder copy, it is the missing half of the offer: the deliverable list now
 * opens the block, the guarantee is a framed promise instead of a footnote,
 * and the cohort has a name and a real end date.
 *
 * Order is the argument: what you join → what you get → who else is here →
 * what it costs → the button → what happens if it fails → when you are
 * charged → how to leave → how long this price lasts.
 */
function RevealOffer({ intro, weekStd, href, onGo }: {
  intro: string; weekStd: string; href: string;
  onGo: (e: React.MouseEvent) => void;
}) {
  return (
    <>
      {/* The cohort's name is NOT repeated here: the plan card carries it
          („A terved · Szeptemberi Újrakezdés") ~600px above, and the same
          label twice on one screen dilutes rather than reinforces. The
          deliverable title is the block's own opening line. */}
      <p className="u2-getstitle">{C.REVEAL.offer.getsTitle}</p>
      <ul className="u2-gets">
        {C.REVEAL.offer.gets.map((g) => (
          <li key={g.b}>
            <span className="u2-gets-ic" aria-hidden="true">
              <LxIcon d={lxPaths[g.icon as keyof typeof lxPaths]} size={15} sw={1.7} />
            </span>
            <b>{g.b}</b>
            <span className="u2-gets-d">{g.d}</span>
            {"devices" in g && g.devices && <DeviceRow />}
          </li>
        ))}
      </ul>

      {/* The library, shown rather than counted. */}
      <LibraryGrid slices={C.REVEAL.offer.libSlices} />

      <p className="u2-proof">
        <b>{C.REVEAL.offer.proofCount}</b>{C.REVEAL.offer.proofTail}
      </p>
      {/* P1-2 · the whole price story in one line, above the button. */}
      <p className="u2-priceline">
        {C.REVEAL.offer.priceLine(intro, weekStd, formatHuf(perDayHuf()))}
      </p>
      <a className="u2-cta" href={href} onClick={onGo}>
        {C.REVEAL.offer.cta(intro)}
      </a>
      {/* The risk reversal at the button: one line, framed. The FULL guarantee
          text has its own band further down (B7), so spelling it out here made
          it the page's third telling - the decision point needs the promise,
          not the paragraph. */}
      {GUARANTEE_LIVE && (
        <p className="u2-guarbox u2-guarbox-1">
          <b>{GARANCIA.shortLead}</b>{GARANCIA.shortBody}
        </p>
      )}
      <RenewLine intro={intro} weekStd={weekStd} />
      <p className="u2-calm">{C.REVEAL.offer.calm}</p>
    </>
  );
}

/** B6 / rail: the two rhythm cards. Information, not buttons (handoff Q2). */
function RevealRhythm({ month, annual, perMonth, weeklyMonthly }: {
  month: string; annual: string; perMonth: string; weeklyMonthly: string;
}) {
  return (
    <div className="u2-rhythm">
      <p className="u2-label">{C.REVEAL.entry.rhythmTitle}</p>
      <div className="u2-price2">
        <div className="on"><b>{month}</b><span>{C.REVEAL.entry.monthTag}</span></div>
        <div>
          <b>{annual}</b>
          <span>{C.REVEAL.entry.annualTag(perMonth, annualSavingsPct())}</span>
          {/* R5 · pennies-a-day, NEXT TO the full amount, never instead of it. */}
          <span className="u2-perday">{formatHuf(perDayHuf())} / nap</span>
        </div>
      </div>
      <p className="u2-xs">{C.REVEAL.entry.same}</p>
      <p className="u2-honesty">
        <b>{C.REVEAL.entry.honestyLead}</b>{C.REVEAL.entry.honesty(weeklyMonthly, month)}
      </p>
      <p className="u2-xs">{C.REVEAL.entry.later}</p>
    </div>
  );
}

/** M2 · a number that counts up to its value in ~700ms. Tabular numerals keep
 *  the width steady; reduced-motion renders the final value immediately. */
function Count({ to }: { to: number }) {
  // The node is driven directly rather than through state: the effect then
  // only touches an external system (the DOM), and the SERVER render already
  // contains the final value - no-JS and reduced-motion both simply keep it.
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 700);
      el.textContent = String(Math.round(to * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span ref={ref}>{to}</span>;
}

/** The numeric tiles for the two questions whose answers are quantities. */
const NUM_TILE: Record<string, string> = {
  "2": "2", "3": "3", "4": "4",
};

/** The seven questions, keyed by step, so the render can stay one branch. */
const QUESTION: Record<StepId, { hd: string; micro?: string; options: C.Choice<string>[] }> = {
  anchor: C.Q_ANCHOR as never,
  level: C.Q_LEVEL as never,
  days: C.Q_DAYS as never,
  focus: C.Q_FOCUS as never,
  care: C.Q_CARE as never,
  place: C.Q_PLACE as never,
  daypart: C.Q_DAYPART as never,
};

/** UTMs off the current URL. The campaign puts them on the ad link, and they
 *  ride along to Stripe metadata if this person later buys. */
function readUtm(): Record<string, string> {
  try {
    const p = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    for (const k of ["source", "medium", "campaign", "content", "term"]) {
      const v = p.get(`utm_${k}`);
      if (v) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}
