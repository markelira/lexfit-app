"use client";

import { useState } from "react";
import { adminJson } from "@/lib/admin-fetch";

// The 10 edzés garancia panel on a member's page.
//
// The refund is admin-triggered by decision (the promise is "egy e-mail elég",
// and a human reads that mail), so this is the button behind that conversation.
// It shows the numbers the decision rests on rather than just a verdict: a
// near-miss - the work done, but past five weeks - is a judgement call the
// owner should make with the facts in front of them, not something the UI
// silently answers "no" to.

export interface GuaranteeVerdictDto {
  eligible: boolean;
  completedInWindow: number;
  required: number;
  windowEndsAt: number;
  missedWindow: boolean;
}

const day = (ms: number) =>
  new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "short", day: "numeric" }).format(
    new Date(ms),
  );

export function GuaranteePanel({
  uid,
  verdict,
  subStatus,
}: {
  uid: string;
  verdict: GuaranteeVerdictDto;
  subStatus: string;
}) {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string>("");
  const [refunded, setRefunded] = useState<number | null>(null);

  const alreadyClosed = subStatus === "CANCELED" || subStatus === "EXPIRED";
  const canRefund = verdict.eligible || verdict.missedWindow;

  const run = async (override: boolean) => {
    const what = override
      ? "A garancia feltétele NEM teljesült. Biztosan visszautalod így is a teljes befizetett díjat?"
      : `Biztosan visszautalod ${uid} teljes befizetett tagsági díját? Ez visszavonhatatlan.`;
    if (!confirm(what)) return;
    setState("working");
    try {
      const res = await adminJson<{ refundedHuf: number }>("/api/admin/guarantee-refund", {
        method: "POST",
        body: JSON.stringify({ uid, overrideEligibility: override }),
      });
      setRefunded(res.refundedHuf);
      setState("done");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Ismeretlen hiba");
      setState("error");
    }
  };

  return (
    <div className="adm-card">
      <div className="adm-secttl">10 edzés garancia</div>
      <dl className="adm-dl">
        <dt>Teljesített edzés</dt>
        <dd>
          {verdict.completedInWindow} / {verdict.required}
        </dd>
        <dt>Ablak vége</dt>
        <dd>{verdict.windowEndsAt ? day(verdict.windowEndsAt) : "-"}</dd>
        <dt>Jogosult</dt>
        <dd>
          <span className={`adm-badge ${verdict.eligible ? "ok" : "none"}`}>
            {verdict.eligible ? "Igen" : verdict.missedWindow ? "Megvan, de késett" : "Nem"}
          </span>
        </dd>
      </dl>

      {state === "done" ? (
        <p style={{ marginTop: 12, color: "var(--ink-2)" }}>
          Visszautalva: {refunded?.toLocaleString("hu-HU")} Ft. A megerősítő emailt elküldtük.
        </p>
      ) : alreadyClosed ? (
        <p style={{ marginTop: 12, color: "var(--ink-3)" }}>
          Az előfizetés már lezárt - nincs mit visszautalni.
        </p>
      ) : canRefund ? (
        <>
          <button
            className="adm-btn"
            style={{ marginTop: 12 }}
            disabled={state === "working"}
            onClick={() => run(!verdict.eligible)}
          >
            {state === "working"
              ? "Visszautalás…"
              : verdict.eligible
                ? "Teljes díj visszautalása"
                : "Visszautalás mégis (kivétel)"}
          </button>
          {!verdict.eligible && (
            <p style={{ marginTop: 8, fontSize: 12, color: "var(--ink-3)" }}>
              Az ablak lejárt, de a {verdict.required} edzés megvan. A kivétel naplózásra kerül.
            </p>
          )}
        </>
      ) : (
        <p style={{ marginTop: 12, fontSize: 12, color: "var(--ink-3)" }}>
          A garancia feltétele még nem teljesült.
        </p>
      )}

      {state === "error" && (
        <p style={{ marginTop: 10, color: "var(--danger, #b3261e)" }}>{msg}</p>
      )}
    </div>
  );
}
