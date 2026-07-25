"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getOnboarding } from "@/lib/user";
import { loadFoundation } from "@/lib/program";
import { getSubscription, isSubscribed, type Subscription } from "@/lib/billing";
import { STEP_OPTIONS, LIFESTAGE, type ChoiceOption } from "@/lib/onboarding-data";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import "./profile.css";

const ICN = {
  gear: ["M12 15.5 a3.5 3.5 0 1 0 0-7 a3.5 3.5 0 0 0 0 7 Z", "M12 2 l1.6 2.6 3-.5 .5 3 2.6 1.6 -1.3 2.7 1.3 2.7 -2.6 1.6 -.5 3 -3 -.5 L12 22 l-1.6 -2.6 -3 .5 -.5 -3 -2.6 -1.6 1.3 -2.7 -1.3 -2.7 2.6 -1.6 .5 -3 3 .5 Z"],
  out: ["M15 4 H6 V20 H15", "M10 12 H21", "M17 8 L21 12 L17 16"],
  download: ["M12 4 V15", "M7 11 L12 16 L17 11", "M5 20 H19"],
};

const findOpt = (opts: readonly ChoiceOption[], v: unknown): ChoiceOption | undefined =>
  v == null ? undefined : opts.find((o) => String(o.v) === String(v));

const fmtDate = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric" }).format(d) : "—";

function Flames({ n }: { n: number }) {
  return (
    <span className="prof-flames">
      {Array.from({ length: n }, (_, i) => (
        <LxIcon key={i} d={lxPaths.flame} size={13} fill />
      ))}
    </span>
  );
}

function ProfInfo({
  ic,
  lab,
  val,
  vs,
  children,
}: {
  ic: string;
  lab: string;
  val?: React.ReactNode;
  vs?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="prof-card">
      <span className="ic">{ic}</span>
      <div className="bd">
        <div className="lab">{lab}</div>
        {val && <div className="val">{val}</div>}
        {vs && <div className="vs">{vs}</div>}
        {children}
      </div>
    </div>
  );
}

function ProfSwitch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button className={"prof-sw" + (on ? " on" : "")} onClick={onClick} aria-pressed={on}>
      <i />
    </button>
  );
}

export default function ProfilePage() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const [onb, setOnb] = useState<Record<string, unknown> | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [streak, setStreak] = useState(0);
  const [week, setWeek] = useState(1);

  // settings — local/cosmetic for now (persistence ships with the admin work)
  const [tone, setTone] = useState("Vegyes");
  const [reminder, setReminder] = useState(true);
  const [quiet, setQuiet] = useState(true);
  const [community, setCommunity] = useState(true);
  const [days, setDays] = useState(5);

  useEffect(() => {
    if (!user) return;
    getOnboarding(user.uid).then((o) => {
      setOnb(o);
      if (typeof o?.days === "number") setDays(o.days as number);
    });
    getSubscription(user.uid).then(setSub);
    loadFoundation(user.uid)
      .then((f) => {
        if (!f) return;
        setStreak(f.streak);
        const all = f.weeks.flatMap((w) => w.workouts);
        const cur = all.find((w) => w.order === f.currentIndex) ?? all[all.length - 1];
        if (cur) setWeek(cur.week);
      })
      .catch(() => {});
  }, [user]);

  const name = useMemo(() => {
    const dn = user?.displayName?.trim();
    if (dn) return dn.split(" ")[0];
    return user?.email?.split("@")[0] ?? "Te";
  }, [user]);
  const initial = (name[0] ?? "L").toUpperCase();
  const since = useMemo(
    () => fmtDate(user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : null),
    [user],
  );

  // onboarding → labels
  const goal = findOpt(STEP_OPTIONS.goal, onb?.goal);
  const level = findOpt(STEP_OPTIONS.level, onb?.level ?? onb?.experience);
  const time = findOpt(STEP_OPTIONS.time, onb?.time);
  const obstacle = findOpt(STEP_OPTIONS.obstacle, onb?.obstacle);
  const lifestage = findOpt(LIFESTAGE, onb?.lifestage);
  const focus = ((onb?.focus as string[]) ?? [])
    .map((v) => findOpt(STEP_OPTIONS.focus, v))
    .filter(Boolean) as ChoiceOption[];
  const env = ((onb?.env as string[]) ?? [])
    .map((v) => findOpt(STEP_OPTIONS.env, v))
    .filter(Boolean) as ChoiceOption[];
  const why = (onb?.why as string) || (onb?.motiv as string) || "";
  const age = (onb?.age as string) || "";
  const height = (onb?.height as string) || "";
  const weight = (onb?.weight as string) || "";

  const subscribed = isSubscribed(sub);
  const renew = sub?.currentPeriodEnd ? fmtDate(new Date(sub.currentPeriodEnd)) : null;

  return (
    <div className="prof fade-in">
      <div className="prof-htitle">
        Profilom
        <small>Az onboardingból mentett adataid — bármit módosíthatsz.</small>
      </div>

      {/* identitás */}
      <div className="prof-hero">
        <span className="ring" />
        <div className="prof-ava">{initial}</div>
        <div className="prof-id">
          <h2>{name}</h2>
          <div className="prof-chips">
            {streak > 0 && (
              <span className="c">
                <LxIcon d={lxPaths.flame} size={14} fill /> {streak} napos sorozat
              </span>
            )}
            <span className="c">🌱 Foundation · {week}. hét</span>
            {since !== "—" && <span className="c">Tag {since} óta</span>}
          </div>
        </div>
      </div>

      {/* onboarding-adatok */}
      <section>
        <div className="prof-sec">
          <h3>A programom rólad</h3>
          <span className="sub">ezt mondtad az induláskor</span>
        </div>
        <div className="prof-grid">
          {goal && <ProfInfo ic={goal.ic ?? "🎯"} lab="A célom" val={goal.b} vs={goal.s} />}
          {level && (
            <ProfInfo
              ic="🎚️"
              lab="Hol tartok"
              val={
                <span>
                  {level.b}
                  <Flames n={level.flames ?? 1} />
                </span>
              }
              vs={level.s}
            />
          )}
          {focus.length > 0 && (
            <ProfInfo ic="🎯" lab="Fókusz-területek">
              <div className="prof-tags">
                {focus.map((f) => (
                  <span key={String(f.v)}>
                    {f.ic} {f.b}
                  </span>
                ))}
              </div>
            </ProfInfo>
          )}
          {time && <ProfInfo ic={time.ic ?? "⏰"} lab="Mikor mozgok" val={time.b} vs={`${days} edzésnap egy héten`} />}
          {env.length > 0 && (
            <ProfInfo ic="🛡️" lab="Amire figyelünk">
              <div className="prof-tags">
                {env.map((e) => (
                  <span key={String(e.v)}>
                    {e.ic} {e.b}
                  </span>
                ))}
              </div>
            </ProfInfo>
          )}
          {(age || lifestage) && (
            <ProfInfo
              ic="🪪"
              lab="Rólam"
              val={[age, lifestage?.b].filter(Boolean).join(" · ")}
              vs={lifestage ? `${lifestage.ic} A variációkat ehhez igazítjuk.` : undefined}
            />
          )}
        </div>
      </section>

      {/* a miértem */}
      {why && (
        <section>
          <div className="prof-sec">
            <h3>A miértem</h3>
            <span className="sub">ezzel emlékeztet Alexa a nehéz napokon</span>
          </div>
          <div className="prof-why">
            <div className="q">“</div>
            <p>{why}</p>
            <div className="src">
              A te szavaiddal · onboarding, 1. nap
              {obstacle && ` · Amivel régen elakadtál: ${obstacle.ic} ${obstacle.b}`}
            </div>
          </div>
        </section>
      )}

      {/* kiindulás + visszamérés */}
      {(height || weight) && (
        <section>
          <div className="prof-sec">
            <h3>Kiindulás &amp; visszamérés</h3>
            <span className="sub">a 8. héten újra megnézzük</span>
          </div>
          <div className="prof-base">
            <div className="m">
              <div className="lab">Magasság</div>
              <div className="v">{height ? `${height} cm` : "—"}</div>
            </div>
            <div className="m">
              <div className="lab">Súly (kiindulás)</div>
              <div className="v">{weight ? `${weight} kg` : "—"}</div>
            </div>
            <div className="note">
              <strong>📊 Hét 8:</strong> ugyanezt mérjük újra — a számok mellett azt is, mennyivel bírsz többet.
            </div>
          </div>
        </section>
      )}

      {/* beállítások */}
      <section>
        <div className="prof-sec">
          <h3>Beállítások</h3>
          <span className="sub">a hangnem és az emlékeztetők</span>
        </div>
        <div className="prof-set">
          <div className="prof-row">
            <span style={{ fontSize: 20 }}>🗣️</span>
            <div className="rt">
              <b>Alexa hangneme</b>
              <span>Ahogy Alexa beszél hozzád az edzéseken</span>
            </div>
            <div className="prof-seg">
              {["Meleg", "Őszinte", "Vegyes"].map((o) => (
                <button key={o} className={tone === o ? "on" : ""} onClick={() => setTone(o)}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div className="prof-row">
            <span style={{ fontSize: 20 }}>📅</span>
            <div className="rt">
              <b>Heti edzésnapok</b>
              <span>A Foundation 5 napra épül + 2 pihenő</span>
            </div>
            <div className="prof-seg">
              {[3, 4, 5, 6].map((d) => (
                <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="prof-row">
            <span style={{ fontSize: 20 }}>🔔</span>
            <div className="rt">
              <b>Reggeli emlékeztető</b>
              <span>Minden edzésnap reggelén — a választott időpontban</span>
            </div>
            <ProfSwitch on={reminder} onClick={() => setReminder(!reminder)} />
          </div>
          <div className="prof-row">
            <span style={{ fontSize: 20 }}>🔇</span>
            <div className="rt">
              <b>Csendes variációk alapból</b>
              <span>Szomszéd-barát, ugrálás nélküli verziók előnyben</span>
            </div>
            <ProfSwitch on={quiet} onClick={() => setQuiet(!quiet)} />
          </div>
          <div className="prof-row">
            <span style={{ fontSize: 20 }}>👥</span>
            <div className="rt">
              <b>Közösségi értesítések</b>
              <span>Heti check-in és a Szavazz Magadra üzenetek</span>
            </div>
            <ProfSwitch on={community} onClick={() => setCommunity(!community)} />
          </div>
        </div>
      </section>

      {/* előfizetés */}
      <section>
        <div className="prof-sec">
          <h3>Előfizetés</h3>
        </div>
        <div className="prof-plan">
          <span className="crown">👑</span>
          <div className="pd">
            {subscribed ? (
              <>
                <div className="pn">Foundation tagság</div>
                <div className="pm">
                  19 990 Ft / hó{renew ? ` · megújul: ${renew}` : ""} · a Facebook-közösség ingyenes marad
                </div>
              </>
            ) : (
              <>
                <div className="pn">Nincs aktív előfizetés</div>
                <div className="pm">Az edzések előnézete ingyenes — a teljes Foundation programhoz tagság kell.</div>
              </>
            )}
          </div>
          {subscribed ? (
            <button className="pbtn" onClick={() => router.push("/app/membership")}>
              Tagság kezelése
            </button>
          ) : (
            <button className="pbtn" onClick={() => router.push("/subscribe")}>
              Előfizetek
            </button>
          )}
        </div>
      </section>

      {/* fiók */}
      <section>
        <div className="prof-sec">
          <h3>Fiók</h3>
        </div>
        <div className="prof-actions">
          <button>
            <LxIcon d={ICN.download} size={16} /> Adataim letöltése
          </button>
          <button>
            <LxIcon d={ICN.gear} size={16} /> Adatvédelem
          </button>
          <button className="danger" onClick={signOutUser}>
            <LxIcon d={ICN.out} size={16} /> Kijelentkezés
          </button>
        </div>
      </section>
    </div>
  );
}
