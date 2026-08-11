"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Protected, Loader } from "@/components/Protected";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf } from "@/lib/pricing/display";
import {
  getSubscription,
  isSubscribed,
  pauseSubscription,
  downgradeSubscription,
  cancelSubscription,
  submitCancelReason,
  type Subscription,
} from "@/lib/billing";
import styles from "./membership.module.css";

const fmtDate = (ms: number) =>
  new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(ms),
  );

type View = "menu" | "pause" | "downgrade" | "cancel" | "done";

// The reason picker is shown AFTER cancellation and is fully skippable (J3).
const REASONS = [
  "Túl kevés időm van most",
  "Túl drága",
  "Nem nekem való",
  "Technikai gondom volt",
  "Egyéb",
];

function Membership() {
  const { user } = useAuth();
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null | undefined>(undefined);
  const [view, setView] = useState<View>("menu");
  const [months, setMonths] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string>("");
  const [askReason, setAskReason] = useState(false);
  const [reasonDone, setReasonDone] = useState(false);

  useEffect(() => {
    if (user) getSubscription(user.uid).then(setSub);
  }, [user]);

  if (sub === undefined) return <Loader label="Tagság…" />;

  const subscribed = isSubscribed(sub);
  const recurring = !!sub?.stripeSubscriptionId;
  const accessUntil = sub?.accessUntil ?? null;

  async function run(fn: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    } finally {
      setBusy(false);
    }
  }

  // ── Done screen (also used post-cancel with the skippable reason picker) ──
  if (view === "done") {
    return (
      <Shell>
        <p className={styles.eyebrow}>KÉSZ</p>
        <h1 className={styles.title}>{doneMsg}</h1>
        {askReason && !reasonDone && (
          <div className={styles.reasonBox}>
            <p className={styles.reasonQ}>Ha van egy perced: mi volt a fő ok? (nem kötelező)</p>
            <div className={styles.reasonList}>
              {REASONS.map((r) => (
                <button
                  key={r}
                  className={styles.reasonBtn}
                  disabled={busy}
                  onClick={() => run(async () => {
                    await submitCancelReason(r);
                    setReasonDone(true);
                  })}
                >
                  {r}
                </button>
              ))}
            </div>
            <button className={styles.skip} onClick={() => setReasonDone(true)}>
              Kihagyom
            </button>
          </div>
        )}
        {reasonDone && <p className={styles.sub}>Köszönjük, hogy megosztottad. 💗</p>}
        <button className={styles.primary} onClick={() => router.push("/app")}>
          Vissza az appba →
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </Shell>
    );
  }

  if (!subscribed) {
    return (
      <Shell>
        <p className={styles.eyebrow}>TAGSÁG</p>
        <h1 className={styles.title}>Nincs aktív tagságod</h1>
        <button className={styles.primary} onClick={() => router.push("/subscribe")}>
          Nézd meg a csomagokat →
        </button>
      </Shell>
    );
  }

  // ── Pause confirm ──
  if (view === "pause") {
    return (
      <Shell onBack={() => setView("menu")}>
        <p className={styles.eyebrow}>SZÜNETELTETÉS</p>
        <h1 className={styles.title}>Meddig szünetelteted?</h1>
        <p className={styles.sub}>
          A szünet alatt nem terhelünk, és a hozzáférés is pihen. A kifizetett idődből semmi
          nem vész el - ott folytatod, ahol abbahagytad.
        </p>
        <div className={styles.segmented}>
          {[1, 2, 3].map((m) => (
            <button
              key={m}
              className={months === m ? styles.segActive : styles.seg}
              onClick={() => setMonths(m as 1 | 2 | 3)}
            >
              {m} hónap
            </button>
          ))}
        </div>
        <button
          className={styles.primary}
          disabled={busy}
          onClick={() =>
            run(async () => {
              await pauseSubscription(months);
              setDoneMsg(`Szüneteltettük a tagságod ${months} hónapra. Emlékeztetünk, mielőtt újraindul.`);
              setView("done");
            })
          }
        >
          {busy ? "Folyamatban…" : "Szüneteltetem"}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </Shell>
    );
  }

  // ── Downgrade confirm ──
  if (view === "downgrade") {
    return (
      <Shell onBack={() => setView("menu")}>
        <p className={styles.eyebrow}>KISEBB CSOMAG</p>
        <h1 className={styles.title}>Váltás heti tagságra</h1>
        <p className={styles.sub}>
          A mostani, már kifizetett hónapod végéig minden marad. Onnantól heti{" "}
          {formatHuf(PRICES.week_std.amountHuf)}, automatikusan megújul - bármikor lemondhatod.
        </p>
        <button
          className={styles.primary}
          disabled={busy}
          onClick={() =>
            run(async () => {
              const at = await downgradeSubscription();
              setDoneMsg(`Rendben - ${fmtDate(at)}-tól heti tagságon folytatod.`);
              setView("done");
            })
          }
        >
          {busy ? "Folyamatban…" : "Átváltok hetire"}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </Shell>
    );
  }

  // ── Cancel confirm (single screen, one action, no guilt copy) ──
  if (view === "cancel") {
    return (
      <Shell onBack={() => setView("menu")}>
        <p className={styles.eyebrow}>LEMONDÁS</p>
        <h1 className={styles.title}>Lemondod a tagságod</h1>
        <p className={styles.sub}>
          {accessUntil
            ? `A hozzáférésed ${fmtDate(accessUntil)}-ig aktív marad, utána nem újul meg.`
            : "A hozzáférésed a periódus végéig aktív marad, utána nem újul meg."}
        </p>
        <button
          className={styles.primary}
          disabled={busy}
          onClick={() =>
            run(async () => {
              const at = await cancelSubscription();
              setDoneMsg(
                at
                  ? `Lemondtad a tagságod. A hozzáférésed ${fmtDate(at)}-ig aktív.`
                  : "Lemondtad a tagságod.",
              );
              setAskReason(true);
              setView("done");
            })
          }
        >
          {busy ? "Folyamatban…" : "Igen, lemondom"}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </Shell>
    );
  }

  // ── Menu: three equal options ──
  return (
    <Shell onBack={() => router.push("/app/profile")}>
      <p className={styles.eyebrow}>TAGSÁG</p>
      <h1 className={styles.title}>Mit szeretnél?</h1>
      {accessUntil && (
        <p className={styles.sub}>A hozzáférésed {fmtDate(accessUntil)}-ig aktív.</p>
      )}
      {!recurring ? (
        <p className={styles.sub}>Egyszeri hozzáférésed van - nincs mit lemondani, a végén magától lejár.</p>
      ) : (
        <div className={styles.options}>
          <OptionCard
            title="Szüneteltetem"
            body="1, 2 vagy 3 hónapra. A kifizetett idő megmarad."
            cta="Szünet beállítása"
            onClick={() => setView("pause")}
          />
          {sub?.plan === "MONTH" && (
            <OptionCard
              title="Kisebb csomagra váltok"
              body="Havi helyett heti - a mostani hónapod végétől."
              cta="Váltás hetire"
              onClick={() => setView("downgrade")}
            />
          )}
          <OptionCard
            title="Véglegesen lemondom"
            body="A periódus végéig marad a hozzáférés, utána megszűnik."
            cta="Lemondás"
            onClick={() => setView("cancel")}
          />
        </div>
      )}
    </Shell>
  );
}

/** All option cards are visually identical - no emphasized "stay" choice (J3). */
function OptionCard({
  title,
  body,
  cta,
  onClick,
}: {
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className={styles.opt}>
      <div className={styles.optTitle}>{title}</div>
      <div className={styles.optBody}>{body}</div>
      <button className={styles.optCta} onClick={onClick}>
        {cta}
      </button>
    </div>
  );
}

function Shell({ children, onBack }: { children: React.ReactNode; onBack?: () => void }) {
  return (
    <div className="lx">
      <div className={styles.page}>
        <main className={styles.card}>
          {onBack && (
            <button className={styles.back} onClick={onBack}>
              ← Vissza
            </button>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Protected requireOnboarded={false}>
      <Membership />
    </Protected>
  );
}
