"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { adminJson } from "@/lib/admin-fetch";
import { STEP_OPTIONS, LIFESTAGE, type ChoiceOption } from "@/lib/onboarding-data";
import { SUB_BADGE, SUB_LABEL } from "@/app/admin/members/page";

interface Detail {
  uid: string;
  profile: Record<string, unknown>;
  onboarding: Record<string, unknown> | null;
  progress: Record<string, unknown> | null;
  subscription: Record<string, unknown> | null;
  stripeLive?: boolean;
}

const label = (opts: readonly ChoiceOption[], v: unknown) =>
  v == null || v === "" ? "—" : opts.find((o) => String(o.v) === String(v))?.b ?? String(v);
const many = (opts: readonly ChoiceOption[], v: unknown) =>
  Array.isArray(v) && v.length ? v.map((x) => label(opts, x)).join(", ") : "—";
const str = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmt = (v: unknown) => {
  if (!v) return "—";
  const s = String(v);
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "short", day: "numeric" }).format(d);
};

export default function MemberDetailPage() {
  const uid = String(useParams().uid);
  const [d, setD] = useState<Detail | null | undefined>(undefined);

  useEffect(() => {
    adminJson<Detail>(`/api/admin/users/${uid}`)
      .then(setD)
      .catch(() => setD(null));
  }, [uid]);

  const p = d?.profile ?? {};
  const onb = d?.onboarding ?? {};
  const prog = d?.progress ?? {};
  const sub = d?.subscription ?? {};
  const subStatus = (sub.status as string) ?? "none";
  const stripeId = sub.stripeCustomerId as string | undefined;

  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">
            <Link href="/admin/members" style={{ color: "var(--ink-3)" }}>Tagok</Link> · tag
          </div>
          <h1 className="adm-h1">{(p.displayName as string) ?? (p.email as string) ?? uid}</h1>
          <p className="adm-sub">Tag adatai — csak megtekintés.</p>
        </div>
      </div>

      {d === undefined ? (
        <div className="adm-card" style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>Töltés…</div>
      ) : d === null ? (
        <div className="adm-card">Ez a tag nem található. <Link href="/admin/members" className="linkish">Vissza</Link></div>
      ) : (
        <div className="adm-detailgrid">
          <div className="adm-card">
            <div className="adm-secttl">Fiók</div>
            <dl className="adm-dl">
              <dt>Email</dt><dd>{str(p.email)}</dd>
              <dt>Bejelentkezés</dt><dd>{str(p.provider)}</dd>
              <dt>Nyelv</dt><dd>{str(p.locale)}</dd>
              <dt>Csatlakozott</dt><dd>{fmt(p.createdAt)}</dd>
            </dl>
          </div>

          <div className="adm-card">
            <div className="adm-secttl">Előfizetés</div>
            <dl className="adm-dl">
              <dt>Állapot</dt>
              <dd><span className={`adm-badge ${SUB_BADGE[subStatus] ?? "none"}`}>{SUB_LABEL[subStatus] ?? subStatus}</span></dd>
              <dt>Csomag</dt><dd>{str(sub.plan)}</dd>
              <dt>Lejár / megújul</dt><dd>{fmt(sub.currentPeriodEnd)}</dd>
              <dt>Stripe</dt>
              <dd>
                {stripeId ? (
                  <a
                    className="linkish"
                    href={`https://dashboard.stripe.com/${d?.stripeLive ? "" : "test/"}customers/${stripeId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {stripeId}
                  </a>
                ) : "—"}
              </dd>
            </dl>
          </div>

          <div className="adm-card">
            <div className="adm-secttl">Onboarding</div>
            <dl className="adm-dl">
              <dt>Cél</dt><dd>{label(STEP_OPTIONS.goal, onb.goal)}</dd>
              <dt>Szint</dt><dd>{label(STEP_OPTIONS.level, onb.level ?? onb.experience)}</dd>
              <dt>Fókusz</dt><dd>{many(STEP_OPTIONS.focus, onb.focus)}</dd>
              <dt>Figyelem</dt><dd>{many(STEP_OPTIONS.env, onb.env)}</dd>
              <dt>Kor</dt><dd>{str(onb.age)}</dd>
              <dt>Életszakasz</dt><dd>{label(LIFESTAGE, onb.lifestage)}</dd>
              <dt>Magasság</dt><dd>{onb.height ? `${onb.height} cm` : "—"}</dd>
              <dt>Súly</dt><dd>{onb.weight ? `${onb.weight} kg` : "—"}</dd>
              <dt>Heti napok</dt><dd>{str(onb.days)}</dd>
              <dt>Mikor</dt><dd>{label(STEP_OPTIONS.time, onb.time)}</dd>
              <dt>Miért</dt><dd>{str(onb.why ?? onb.motiv)}</dd>
            </dl>
          </div>

          <div className="adm-card">
            <div className="adm-secttl">Haladás</div>
            <dl className="adm-dl">
              <dt>Program</dt><dd>{str(prog.programId)}</dd>
              <dt>Sorozat</dt><dd>{str(prog.streak)} nap</dd>
              <dt>Kész edzések</dt><dd>{str(prog.doneCount)}</dd>
              <dt>Aktuális index</dt><dd>{str(prog.currentIndex)}</dd>
              <dt>Utolsó edzés</dt><dd>{fmt(prog.lastCompletedDate)}</dd>
              <dt>Csatlakozott</dt><dd>{fmt(prog.joinedAt)}</dd>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
