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
  "8 hetes Foundation program — 40 vezetett edzés",
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

  return (
    <div className="lx">
      <div className={styles.pricingPage}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>SZAVAZZ MAGADRA</p>
          <h1 className={styles.h1}>Válaszd ki, hogyan kezded</h1>
          <p className={styles.lede}>
            Bármelyikkel ugyanaz a teljes hozzáférés. A lemondás mindig egy kattintás.
          </p>
        </header>

        <div className={styles.grid}>
          {/* HETI */}
          <div className={styles.tier}>
            <div className={styles.tierName}>Heti</div>
            <div className={styles.price}>
              <span className={styles.bigAmt}>{formatHuf(WEEK_INTRO)}</span>
              <span className={styles.unit}>első 7 nap</span>
            </div>
            {/* J1: renewal terms at EQUAL weight, next to the intro price. */}
            <p className={styles.renew}>
              utána {formatHuf(WEEK_STD)}/hét, automatikusan megújul — bármikor egy
              kattintással lemondhatod.
            </p>
            <button
              className={styles.pick}
              onClick={() =>
                setChosen({
                  role: "week_intro",
                  title: "Heti tagság",
                  recurring: true,
                  terms: `Ma ${formatHuf(WEEK_INTRO)} az első 7 napért, utána ${formatHuf(WEEK_STD)}/hét, automatikusan megújul.`,
                })
              }
            >
              Kezdd el
            </button>
            {/* J4: separate product, NO strikethrough, NO "kedvezmény". */}
            <button
              className={styles.oneoff}
              onClick={() =>
                setChosen({
                  role: "week_oneoff",
                  title: "Egy hét (7 nap)",
                  recurring: false,
                  terms: `Egyszeri ${formatHuf(WEEK_ONEOFF)} a 7 napos hozzáférésért. Nem újul meg.`,
                })
              }
            >
              Csak egy hetet szeretnék → {formatHuf(WEEK_ONEOFF)}
            </button>
          </div>

          {/* ÉVES — hero, pre-highlighted */}
          <div className={`${styles.tier} ${styles.hero}`}>
            <div className={styles.badge}>Legnépszerűbb · Spórolj {SAVINGS}%</div>
            <div className={styles.tierName}>Éves</div>
            <div className={styles.price}>
              <span className={styles.bigAmt}>{formatHuf(ANNUAL_PER_WEEK)}</span>
              <span className={styles.unit}>/hét</span>
            </div>
            <p className={styles.renew}>{formatHuf(ANNUAL)}/év, évente számlázva. Automatikusan megújul.</p>
            <button
              className={`${styles.pick} ${styles.pickHero}`}
              onClick={() =>
                setChosen({
                  role: "annual_std",
                  title: "Éves tagság",
                  recurring: true,
                  terms: `Ma ${formatHuf(ANNUAL)} egy teljes évre (${formatHuf(ANNUAL_PER_WEEK)}/hét), évente automatikusan megújul.`,
                })
              }
            >
              Kezdd el
            </button>
            <div className={styles.oneoffSpacer} />
          </div>

          {/* HAVI */}
          <div className={styles.tier}>
            <div className={styles.tierName}>Havi</div>
            <div className={styles.price}>
              <span className={styles.bigAmt}>{formatHuf(MONTH_STD)}</span>
              <span className={styles.unit}>/hó</span>
            </div>
            <p className={styles.renew}>Automatikusan megújul havonta — bármikor egy kattintással lemondhatod.</p>
            <button
              className={styles.pick}
              onClick={() =>
                setChosen({
                  role: "month_std",
                  title: "Havi tagság",
                  recurring: true,
                  terms: `Ma ${formatHuf(MONTH_STD)}, havonta automatikusan megújul.`,
                })
              }
            >
              Kezdd el
            </button>
            <button
              className={styles.oneoff}
              onClick={() =>
                setChosen({
                  role: "month_oneoff",
                  title: "Egy hónap (30 nap)",
                  recurring: false,
                  terms: `Egyszeri ${formatHuf(MONTH_ONEOFF)} a 30 napos hozzáférésért. Nem újul meg.`,
                })
              }
            >
              Csak egy hónapot szeretnék → {formatHuf(MONTH_ONEOFF)}
            </button>
          </div>
        </div>

        <ul className={styles.featRow}>
          {FEATURES.map((f) => (
            <li key={f}>
              <span className={styles.fk}><LxIcon d={lxPaths.check} size={12} sw={3} /></span>
              {f}
            </li>
          ))}
        </ul>
        <p className={styles.note}>Biztonságos fizetés a Stripe-pal · A közösség ingyenes marad.</p>
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
