"use client";

import "../challenges.css";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { Button } from "@/components/Button";
import { getMyList, setSaved } from "@/lib/mylist";
import { challengeCatOf, challengeGrad } from "@/lib/categories";
import { type ChallengeDetail, loadChallenge } from "@/lib/challenges";
import { ChallengeDetailSkeleton } from "@/components/Skeletons";

export default function ChallengeDetailPage() {
  const params = useParams();
  const slug = String(params.slug);
  const router = useRouter();
  const { user } = useAuth();
  const [d, setD] = useState<ChallengeDetail | null | undefined>(undefined);
  const [saved, setSavedState] = useState(false);

  useEffect(() => {
    loadChallenge(slug, user?.uid ?? null).then(setD).catch(() => setD(null));
    if (user) getMyList(user.uid).then((s) => setSavedState(s.has(slug))).catch(() => {});
  }, [slug, user]);

  const play = (code: string) => router.push(`/challenge/${slug}/${code}`);
  async function toggleSave() {
    if (!user) return;
    const next = !saved;
    setSavedState(next);
    await setSaved(user.uid, slug, next);
  }

  if (d === undefined) return <ChallengeDetailSkeleton />;
  if (d === null) return <p style={{ color: "var(--ink-2)", marginTop: 40 }}>Ez a kihívás nem található.</p>;

  const { challenge: c, days, doneCount, state, nextOrder, fbGroupUrl } = d;
  const total = days.length;
  const word = challengeCatOf(c.bodyPart).word;
  const nextDayNum = nextOrder != null ? nextOrder + 1 : 1;
  const firstCode = days[0]?.videoCode;
  const resumeCode = nextOrder != null ? days.find((x) => x.order === nextOrder)?.videoCode : firstCode;
  const ctaLabel =
    state === "elkezdetlen" ? "Kihívás indítása"
    : state === "kesz" ? "Kezdd újra"
    : `Folytatás — ${nextDayNum}. nap`;
  const fbHref = c.fbPostUrl || fbGroupUrl;

  return (
    <div className="ch-page fade-in">
      <button type="button" className="chp-back" onClick={() => router.push("/app/challenges")}>
        <LxIcon d={lxPaths.chevronLeft} size={15} /> Kihívások
      </button>

      <header className="chp-head">
        <div className="chp-cover" style={{ background: challengeGrad(c.bodyPart) }}>
          <span className="chc-ring" aria-hidden="true" />
          <span className="chp-cover-word">{word}</span>
        </div>
        <div className="chp-meta">
          <div className="chp-eyebrow">{c.series} · {c.monthLabel}</div>
          <h1 className="chp-title">{c.title}</h1>
          {c.synopsis && <p className="chp-syn">{c.synopsis}</p>}
          <div className="chp-chips">
            <span className="chp-chip"><LxIcon d={lxPaths.layers} size={12} /> {total} RÉSZ</span>
            {c.perDayMinsLabel && <span className="chp-chip"><LxIcon d={lxPaths.clock} size={12} /> {c.perDayMinsLabel.toUpperCase()}</span>}
            {c.bodyPart && <span className="chp-chip">{c.bodyPart.toUpperCase()}</span>}
            {c.equipment && <span className="chp-chip"><LxIcon d={lxPaths.dumbbell} size={12} /> {c.equipment.toUpperCase()}</span>}
          </div>
          <div className="chp-acts">
            <Button variant="primary" iconLeft={lxPaths.play} onClick={() => resumeCode && play(resumeCode)} disabled={!resumeCode}>
              {ctaLabel}
            </Button>
            <Button variant="secondary" iconLeft={saved ? lxPaths.check : lxPaths.plus} onClick={toggleSave}>Listám</Button>
            {total > 0 && <span className="chp-progtext">{doneCount} / {total} nap kész</span>}
          </div>
        </div>
      </header>

      <div className="chp-days">
        {days.map((day) => {
          const isOn = day.order === nextOrder;
          const label = day.dayTitle || day.video?.title || `${day.order + 1}. nap`;
          const cls = day.done ? "done" : isOn ? "on" : "";
          return (
            <button type="button" key={day.id} className={`chp-day ${cls}`} onClick={() => play(day.videoCode)}>
              <span className="ix">{day.done ? <LxIcon d={lxPaths.check} size={15} sw={2.6} /> : day.order + 1}</span>
              <span className="th" style={{ background: challengeGrad(c.bodyPart) }} aria-hidden="true" />
              <span className="nm">
                {day.order + 1}. nap · {label.replace(/^\d+\.\s*nap\s*·?\s*/i, "")}
                {day.done ? <span className="sub">Megcsináltad</span> : isOn ? <span className="sub">Itt tartasz</span> : null}
              </span>
              {day.video?.mins ? <span className="tm">{day.video.mins} PERC</span> : <span className="tm" />}
              <span className="go"><LxIcon d={lxPaths.play} size={13} /></span>
            </button>
          );
        })}
        {days.length === 0 && <div className="ch-empty" style={{ borderRadius: 12 }}><p className="s">Ehhez a kihíváshoz még nincsenek napok.</p></div>}
      </div>

      {(c.participantCount || fbGroupUrl) && (
        <div className="ch-fb">
          <LxIcon d={lxPaths.users} size={18} />
          <div className="tx">
            {c.participantCount ? (
              <>Ezt a kihívást <b>{c.participantCount.toLocaleString("hu-HU")}-en</b> csinálták végig a csoporttal {c.monthLabel}.</>
            ) : (
              <><b>A szavazás a Facebook-csoportban zajlik.</b></>
            )}
          </div>
          {fbHref && (
            <a className="ch-fb-btn" href={fbHref} target="_blank" rel="noopener noreferrer">
              {c.fbPostUrl ? "A csoport posztja" : "Ugrás a csoportba"}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
