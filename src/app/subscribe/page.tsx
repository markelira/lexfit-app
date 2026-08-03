"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Protected, Loader } from "@/components/Protected";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import {
  getSubscription,
  isSubscribed,
  startCheckout,
  type Consents,
  type Subscription,
} from "@/lib/billing";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf, perWeekHuf, annualSavingsPct } from "@/lib/pricing/display";
import styles from "./subscribe.module.css";

// Every figure is derived from the pricing config — never a literal here (J4/J5).
const WEEK_INTRO = PRICES.week_intro.amountHuf;
const WEEK_STD = PRICES.week_std.amountHuf;
const WEEK_ONEOFF = PRICES.week_oneoff.amountHuf;
const MONTH_STD = PRICES.month_std.amountHuf;
const MONTH_ONEOFF = PRICES.month_oneoff.amountHuf;
const ANNUAL = PRICES.annual_std.amountHuf;
const ANNUAL_PER_WEEK = perWeekHuf(ANNUAL);
const SAVINGS = annualSavingsPct();

const FEATURES = [
  // Reframed off the stale "8 hetes Foundation — 40 edzés" claim: no fixed
  // program length, not centred on one program (pending the marketing rewrite).
  "Vezetett programok, lépésről lépésre",
  "Teljes videótár · F·B·R·T·N·M kódrendszer",
  "Heti közösségi kihívás — együtt, minden héten",
  "Alexa végig veled — follow-along minden edzésen",
];

type Role = "week_intro" | "month_std" | "annual_std" | "week_oneoff" | "month_oneoff";

interface Chosen {
  role: Role;
  title: string;
  recurring: boolean;
  /** Line describing what will be charged now + renewal terms (J1). */
  terms: string;
}

// Landing pricing cards deep-link here with ?plan=<role> — jump straight to that
// plan's consent step.
const CHOSEN_BY_ROLE: Record<string, Chosen> = {
  week_intro: { role: "week_intro", title: "Heti tagság", recurring: true, terms: `Ma ${formatHuf(WEEK_INTRO)} az első 7 napért, utána ${formatHuf(WEEK_STD)}/hét, automatikusan megújul.` },
  month_std: { role: "month_std", title: "Havi tagság", recurring: true, terms: `Ma ${formatHuf(MONTH_STD)}, havonta automatikusan megújul.` },
  annual_std: { role: "annual_std", title: "Éves tagság", recurring: true, terms: `Ma ${formatHuf(ANNUAL)} egy teljes évre (${formatHuf(ANNUAL_PER_WEEK)}/hét), évente automatikusan megújul.` },
};

// The three recurring plans, as the radio selection layer (40 §40.7 / P6). Every
// figure is from PRICES via the display helpers — annual pre-selected. The
// per-week line makes SPÓROLJ verifiable like-for-like (monthly ÷ 52 weeks via
// its annualised amount; weekly = the standard weekly).
type RecurringRole = "annual_std" | "month_std" | "week_intro";
interface Plan {
  role: RecurringRole;
  label: string;
  amount: string; // headline price
  unit: string;
  terms: string;
  perWeek: string; // like-for-like comparison line
  badge?: string;
  savings?: string;
  ctaAmount: string;
  ctaPeriod: string; // CTA repeats "{amount} / {period}" (J1)
}
const PLANS: Plan[] = [
  {
    role: "annual_std", label: "ÉVES",
    amount: formatHuf(ANNUAL_PER_WEEK), unit: "/ hét",
    terms: `${formatHuf(ANNUAL)} / év · évente számlázva`,
    perWeek: `${formatHuf(ANNUAL_PER_WEEK)} / hét`,
    badge: "LEGNÉPSZERŰBB", savings: `SPÓROLJ ${SAVINGS}%`,
    ctaAmount: formatHuf(ANNUAL), ctaPeriod: "év",
  },
  {
    role: "month_std", label: "HAVI",
    amount: formatHuf(MONTH_STD), unit: "/ hó",
    terms: "Havonta automatikusan megújul",
    perWeek: `${formatHuf(perWeekHuf(MONTH_STD * 12))} / hét`,
    ctaAmount: formatHuf(MONTH_STD), ctaPeriod: "hó",
  },
  {
    role: "week_intro", label: "HETI",
    amount: formatHuf(WEEK_INTRO), unit: "/ első 7 nap",
    terms: `Utána ${formatHuf(WEEK_STD)} / hét`,
    perWeek: `${formatHuf(WEEK_STD)} / hét`,
    ctaAmount: formatHuf(WEEK_INTRO), ctaPeriod: "első 7 nap",
  },
];
const planToChosen = (p: Plan): Chosen => ({ ...CHOSEN_BY_ROLE[p.role] });

// The community whisper + one-off products, kept as secondary links (J4 — no
// strikethrough, no "kedvezmény"; 40 §40.7).
const COMMUNITY = "„A Facebook-közösség ingyenes marad — ez az előfizetés a programot nyitja meg.”";

function SubscribeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null | undefined>(undefined);
  // Landing cards deep-link with ?plan=<role> — preselect it at init (no effect,
  // and no hydration mismatch: the page shows a Loader until `sub` loads).
  const [chosen, setChosen] = useState<Chosen | null>(() => {
    if (typeof window === "undefined") return null;
    const plan = new URLSearchParams(window.location.search).get("plan");
    return (plan && CHOSEN_BY_ROLE[plan]) || null;
  });
  // The radio selection layer (P6); annual pre-selected.
  const [selected, setSelected] = useState<RecurringRole>("annual_std");
  // Returned from a cancelled Stripe checkout (cancel_url=/subscribe?canceled=1).
  // The plan is intact — reassure and let them continue (40 §40.11 / P9.1).
  const [canceled] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("canceled") === "1";
  });

  useEffect(() => {
    // If the read fails (e.g. rules deny it, offline), treat it as "no
    // subscription" and show the pricing options rather than hanging on the
    // loader forever — the server re-validates entitlement at checkout anyway.
    if (user) getSubscription(user.uid).then(setSub, () => setSub(null));
  }, [user]);

  const subscribed = useMemo(() => isSubscribed(sub ?? null), [sub]);

  if (sub === undefined) return <Loader label="Előfizetés…" />;

  if (subscribed) {
    return (
      <div className="lx">
        <div className={styles.page}>
          <main className={styles.card}>
            <p className={styles.eyebrow}>AKTÍV TAGSÁG</p>
            <h1 className={styles.title}>Az előfizetésed aktív 💗</h1>
            <p className={styles.sub}>Teljes hozzáférésed van a programhoz és a videótárhoz.</p>
            <button className={styles.cta} onClick={() => router.push("/app")}>
              Belépek az appba →
            </button>
          </main>
        </div>
      </div>
    );
  }

  if (chosen) {
    return <ConsentStep chosen={chosen} onBack={() => setChosen(null)} />;
  }

  const selectedPlan = PLANS.find((p) => p.role === selected) ?? PLANS[0];
  const rovingIdx = PLANS.findIndex((p) => p.role === selected);

  const onPlanKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % PLANS.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + PLANS.length) % PLANS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = PLANS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setSelected(PLANS[next].role);
    document.getElementById(`plan-${PLANS[next].role}`)?.focus();
  };

  return (
    <div className="lx">
      <div className={styles.page}>
        <main className={styles.card}>
          <p className={styles.eyebrow}>ELŐFIZETÉS</p>
          <h1 className={styles.title}>Egy előfizetés. Minden funkció.</h1>
          <p className={styles.sub}>Bármikor lemondhatod.</p>

          {canceled && (
            <p className={styles.cancelNote} role="status">
              Nem történt fizetés. A terved megvan — bármikor folytathatod.
            </p>
          )}

          {/* P6.1 — radio selection; annual pre-selected. One CTA below, not per card. */}
          <div className={styles.plans} role="radiogroup" aria-label="Előfizetési csomag">
            {PLANS.map((p, i) => {
              const on = p.role === selected;
              return (
                <button
                  key={p.role}
                  id={`plan-${p.role}`}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={i === rovingIdx ? 0 : -1}
                  className={`${styles.planOpt} ${on ? styles.planOptOn : ""}`}
                  onClick={() => setSelected(p.role)}
                  onKeyDown={onPlanKeyDown(i)}
                >
                  {p.badge && <span className={styles.planBadge}>{p.badge}</span>}
                  <span className={styles.planLeft}>
                    <span className={styles.planLabel}>{p.label}</span>
                    <span className={styles.planPriceRow}>
                      <b className={styles.planAmt}>{p.amount}</b>
                      <span className={styles.planUnit}>{p.unit}</span>
                    </span>
                    <span className={styles.planTerms}>{p.terms}</span>
                    {/* P6.4 — like-for-like per-week, so SPÓROLJ is verifiable. */}
                    <span className={styles.planPerWeek}>{p.perWeek}</span>
                  </span>
                  <span className={styles.planRight}>
                    {p.savings && <span className={styles.planSavings}>{p.savings}</span>}
                    <span className={styles.planTick} aria-hidden="true">
                      {on && <LxIcon d={lxPaths.check} size={13} sw={3} />}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* P6.3 — the single fixed CTA repeats the exact amount. */}
          <button
            className={`${styles.cta} ${styles.ctaMain}`}
            onClick={() => setChosen(planToChosen(selectedPlan))}
          >
            Előfizetek — {selectedPlan.ctaAmount} / {selectedPlan.ctaPeriod}
          </button>
          <p className={styles.ctaFoot}>Bármikor lemondható · 14 napos pénzvisszafizetési garancia</p>

          {/* P6.2 — one-off products as secondary links (J4: no strikethrough, no "kedvezmény"). */}
          <div className={styles.oneoffs}>
            <button
              className={styles.oneoffLink}
              onClick={() => setChosen({ role: "week_oneoff", title: "Egy hét (7 nap)", recurring: false, terms: `Egyszeri ${formatHuf(WEEK_ONEOFF)} a 7 napos hozzáférésért. Nem újul meg.` })}
            >
              Csak egy hetet szeretnék → {formatHuf(WEEK_ONEOFF)}
            </button>
            <button
              className={styles.oneoffLink}
              onClick={() => setChosen({ role: "month_oneoff", title: "Egy hónap (30 nap)", recurring: false, terms: `Egyszeri ${formatHuf(MONTH_ONEOFF)} a 30 napos hozzáférésért. Nem újul meg.` })}
            >
              Csak egy hónapot szeretnék → {formatHuf(MONTH_ONEOFF)}
            </button>
          </div>

          {/* P6.5 — feature list + community whisper below the fold. */}
          <div className={styles.featBlock}>
            <p className={styles.featHd}>Mind a három csomagban</p>
            <ul className={styles.feat}>
              {FEATURES.map((f) => (
                <li key={f}>
                  <span className={styles.fk}><LxIcon d={lxPaths.check} size={12} sw={3} /></span>
                  {f}
                </li>
              ))}
            </ul>
            <p className={styles.community}>{COMMUNITY}</p>
          </div>

          <p className={styles.note}>Biztonságos fizetés a Stripe-pal · A közösség ingyenes marad.</p>
        </main>
      </div>
    </div>
  );
}

/** F1.2 — dual-consent step. Both checkboxes start empty; the CTA stays
 *  disabled until the required ones are ticked. The server re-validates and
 *  persists the consent before any Stripe session is created. */
function ConsentStep({ chosen, onBack }: { chosen: Chosen; onBack: () => void }) {
  const [autoRenew, setAutoRenew] = useState(false);
  const [immediate, setImmediate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = immediate && (chosen.recurring ? autoRenew : true);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const consents: Consents = {
        autoRenew: chosen.recurring ? autoRenew : null,
        immediateStart: immediate,
      };
      await startCheckout(chosen.role, consents);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
      setBusy(false);
    }
  }

  return (
    <div className="lx">
      <div className={styles.page}>
        <main className={styles.card}>
          <button className={styles.back} onClick={onBack}>← Vissza</button>
          <p className={styles.eyebrow}>MEGERŐSÍTÉS</p>
          <h1 className={styles.title}>{chosen.title}</h1>
          <p className={styles.sub}>{chosen.terms}</p>

          <label className={styles.consent}>
            <input
              type="checkbox"
              checked={immediate}
              onChange={(e) => setImmediate(e.target.checked)}
            />
            <span>
              Kérem a szolgáltatás azonnali megkezdését, és tudomásul veszem, hogy elállás
              esetén az igénybe vett időszakra időarányos díj kerül elszámolásra.
            </span>
          </label>

          {chosen.recurring && (
            <label className={styles.consent}>
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
              />
              <span>
                Tudomásul veszem, hogy az előfizetés automatikusan megújul a fenti ár és
                periódus szerint, és bármikor lemondhatom.
              </span>
            </label>
          )}

          <button className={styles.cta} onClick={submit} disabled={!ready || busy}>
            {busy ? "Átirányítás…" : "Kezdd el"}
          </button>
          {error && <p className={styles.error}>{error}</p>}
          <p className={styles.note}>Biztonságos fizetés a Stripe-pal.</p>
        </main>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Protected requireOnboarded={false}>
      <SubscribeScreen />
    </Protected>
  );
}
