"use client";

import "./cplayer.css";
import MuxPlayer from "@mux/mux-player-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { Button } from "@/components/Button";
import { loadChallenge, type ChallengeDetail, type ChallengeDayItem } from "@/lib/challenges";
import { markDayDone, saveChallengeResume, clearChallengeResume } from "@/lib/challengeProgress";
import { notePendingCompletion, syncMuxProgress } from "@/lib/progress";

interface Token { playbackId: string; tokens: Record<string, string> }

export default function ChallengePlayerPage() {
  const params = useParams();
  const slug = String(params.slug);
  const code = String(params.code);
  const router = useRouter();
  const { user, loading } = useAuth();

  const [detail, setDetail] = useState<ChallengeDetail | null | undefined>(undefined);
  const [pb, setPb] = useState<Token | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const didFinish = useRef(false);
  const lastSave = useRef(0); // resume-save throttle (seconds), per video

  const back = useCallback(() => router.push(`/app/challenges/${slug}`), [router, slug]);

  // Load the challenge context (days + this video) and a signed token. Re-runs on
  // code change (day chaining via router.replace never remounts this component),
  // so per-video refs/state are reset here rather than in the next-day handler.
  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    didFinish.current = false;
    lastSave.current = 0;
    setFinished(false);
    setChallengeComplete(false);
    setPb(null);
    setErr(null);
    loadChallenge(slug, user.uid).then(setDetail).catch(() => setDetail(null));
    (async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        const res = await fetch(`/api/mux/token?type=challenge&code=${encodeURIComponent(code)}`, {
          headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
        });
        if (res.status === 403) { setErr("Ehhez előfizetés szükséges."); return; }
        if (res.status === 404) { setErr("Ehhez a naphoz még nincs feltöltött videó."); return; }
        if (!res.ok) { setErr("A videó nem tölthető be."); return; }
        setPb((await res.json()) as Token);
      } catch {
        setErr("A videó nem tölthető be.");
      }
    })();
  }, [slug, code, user, loading, router]);

  const day: ChallengeDayItem | undefined = detail?.days.find((x) => x.videoCode === code);
  const total = detail?.days.length ?? 0;
  const video = day?.video ?? null;
  const nextDay = detail?.days.find((x) => x.order > (day?.order ?? -1) && !x.done);

  // Persist resume position (throttled) while playing - read off the media element.
  const onTimeUpdate = (e: { target: EventTarget | null }) => {
    if (!user) return;
    const t = (e.target as HTMLMediaElement | null)?.currentTime ?? 0;
    if (t - lastSave.current >= 5) {
      lastSave.current = t;
      saveChallengeResume(user.uid, slug, code, t).catch(() => {});
    }
  };

  async function onEnded() {
    if (didFinish.current || !user) return;
    didFinish.current = true;
    notePendingCompletion(code); // optimistic bridge over Mux's finalization lag
    try {
      // markDayDone returns the reconciled completion (not a pre-completion estimate).
      const res = await markDayDone(user.uid, slug, code, total);
      setChallengeComplete(res.completed);
      await clearChallengeResume(user.uid, slug, code);
    } catch { /* the Mux sync reconciles regardless */ }
    syncMuxProgress({ force: true }).catch(() => {});
    setFinished(true);
  }

  const allDone = finished && challengeComplete;

  return (
    <div className="cpl">
      <header className="cpl-top">
        <button type="button" className="cpl-ex" onClick={back}>
          <LxIcon d={lxPaths.chevronLeft} size={16} /> Kilépés
        </button>
        <div className="cpl-ttl">
          <span className="nm">{video?.title ?? detail?.challenge.title ?? "Kihívás"}</span>
          {detail && <span className="c">{detail.challenge.series} · {(day?.order ?? 0) + 1}. NAP / {total}</span>}
        </div>
        <span style={{ width: 72 }} />
      </header>

      <div className="cpl-stage">
        {err ? (
          <div className="cpl-msg">
            <LxIcon d={lxPaths.play} size={30} sw={1.6} />
            <p className="t">{err}</p>
            <Button variant="secondary" onDark onClick={back}>Vissza a kihíváshoz</Button>
          </div>
        ) : finished ? (
          <div className="cpl-done">
            <div className="cpl-trophy"><LxIcon d={lxPaths.trophy} size={40} sw={1.7} /></div>
            {allDone ? (
              <>
                <div className="h">Végigcsináltad.</div>
                <div className="s">{detail?.challenge.title} · {total} / {total} nap</div>
              </>
            ) : (
              <>
                <div className="h">Kész a nap.</div>
                <div className="s">{(day?.order ?? 0) + 1}. nap kész - szép munka.</div>
              </>
            )}
            <div className="cpl-done-acts">
              {nextDay ? (
                <Button variant="primary" onClick={() => router.replace(`/challenge/${slug}/${nextDay.videoCode}`)}>
                  Következő nap
                </Button>
              ) : (
                <Button variant="primary" onClick={back}>Vissza a Kihívásokhoz</Button>
              )}
              <Button variant="secondary" onDark onClick={back}>Kihívás áttekintése</Button>
            </div>
          </div>
        ) : pb ? (
          <MuxPlayer
            className="cpl-video"
            playbackId={pb.playbackId}
            tokens={pb.tokens}
            streamType="on-demand"
            autoPlay
            accentColor="#7a9b8d"
            startTime={day?.resume ?? 0}
            onTimeUpdate={onTimeUpdate}
            onEnded={onEnded}
            metadata={{
              video_title: video?.title,
              video_id: code,
              viewer_user_id: user?.uid,
              video_duration: video?.muxDuration ? Math.round(video.muxDuration * 1000) : undefined,
            }}
          />
        ) : (
          <div className="cpl-msg"><p className="t" style={{ fontFamily: "var(--mono)", opacity: 0.7 }}>Töltés…</p></div>
        )}
      </div>
    </div>
  );
}
