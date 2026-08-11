"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { useAuth } from "@/lib/auth-context";
import { IdentityCard } from "@/components/profile/IdentityCard";
import { StatTrio } from "@/components/profile/StatTrio";
import { WeekStrip } from "@/components/profile/WeekStrip";
import { monthYearHu, weekdayNamesHu } from "@/lib/profile";
import { useProfile } from "./useProfile";
import { IdentityEditor } from "./settings/IdentityEditor";
import "./profile.css";

// Profil - the read-only mirror (30 §30.3), now backed by loadProfile. The
// „Következő mérföldkő" card was dropped (visszamérés removed from Haladásom).
export default function ProfileV2() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { data: p, state, reload } = useProfile();

  const [avatarOpen, setAvatarOpen] = useState(false);

  if (state === "loading") {
    return (
      <div className="pf" aria-busy="true" aria-label="Betöltés">
        <div className="pf-identity pf-skel-idcard">
          <div className="pf-skel ava" />
          <div className="sk-lines"><div className="pf-skel line w40" /><div className="pf-skel line w60" /></div>
        </div>
        <div className="pf-stattrio">
          {[0, 1, 2].map((i) => (
            <div className="stat" key={i}><div className="pf-skel num" /><div className="pf-skel line w60" /></div>
          ))}
        </div>
        <div className="pf-card">
          <div className="pf-skel line w30" />
          <div className="pf-skel-week" style={{ marginTop: 14 }}>
            {Array.from({ length: 7 }).map((_, i) => <div className="pf-skel strip" key={i} />)}
          </div>
        </div>
      </div>
    );
  }
  if (state === "error" || !p) {
    return (
      <div className="pf-fallback">
        <p>Nem tudtuk betölteni a profilodat.</p>
        <button type="button" className="lxbtn m primary" onClick={reload}>Újra</button>
      </div>
    );
  }

  const meta = `${p.programme.label} · ${p.programme.step}/${p.programme.total}. edzés · tag ${monthYearHu(p.identity.memberSince)} óta`;
  const planSummary = `Heti ${p.plan.daysPerWeek} edzés · ${weekdayNamesHu(p.plan.weekdays)}`;
  const isNew = p.stats.doneCount === 0 && p.stats.streak === 0;

  return (
    <div className="pf">
      <IdentityCard
        name={p.identity.name}
        photoURL={p.identity.photoURL}
        meta={meta}
        streak={p.stats.streak}
        onEditAvatar={() => setAvatarOpen(true)}
        onSettings={() => router.push("/app/profile/settings")}
      />

      <StatTrio
        items={[
          { n: p.stats.doneCount, k: "elvégzett edzés" },
          { n: p.stats.minutes, k: "perc mozgás" },
          { n: p.stats.streak, k: "napos sorozat" },
        ]}
      />

      {isNew && (
        <div className="pf-empty-cta">
          <span>Még nincs sorozatod - az első edzés elindítja.</span>
          <button type="button" className="lxbtn m primary" onClick={() => router.push("/app")}>
            <LxIcon d={lxPaths.play} size={15} fill /> Kezdd el a mai edzést
          </button>
        </div>
      )}

      {/* Az edzésterved - the week strip */}
      <section className="pf-card pf-week">
        <div className="pf-card-ttl">
          <LxIcon d={lxPaths.calendarCheck} size={16} /> Az edzésterved
        </div>
        <WeekStrip week={p.week} />
        <div className="pf-week-foot">
          <span className="sum">{planSummary}</span>
          <button
            type="button"
            className="lxbtn s secondary"
            onClick={() => router.push("/app/profile/settings?section=plan")}
          >
            Terv módosítása
          </button>
        </div>
      </section>

      {/* Miért kezdted - hidden entirely when onboarding skipped */}
      {p.why && (
        <section className="pf-card pf-why">
          <div className="pf-card-ttl">
            <LxIcon d={lxPaths.messageCircle} size={16} /> Miért kezdted
          </div>
          <p className="why-text">„{p.why.text}”</p>
          <div className="why-src">Az onboardingból · {monthYearHu(p.why.at)}</div>
        </section>
      )}

      {avatarOpen && (
        <IdentityEditor
          editorKey="photo"
          provider={p.identity.provider}
          onClose={() => setAvatarOpen(false)}
          onSaved={async () => { await refreshUser(); reload(); }}
        />
      )}
    </div>
  );
}
