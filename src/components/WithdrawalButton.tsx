"use client";

import { useState } from "react";
import { requestWithdrawal } from "@/lib/billing";

// The statutory withdrawal control (45/2014. Korm. r. — 14 napos elállás).
//
// POST /api/withdrawal has existed and been correct for a long time, and
// lib/billing.ts has exported requestWithdrawal() to call it - but NOTHING in
// the app ever called either. The right was reachable only by emailing us,
// which is not what "a fogyasztó egyértelmű nyilatkozatot tehet" is supposed to
// cost. This is the control that closes that gap.
//
// Deliberately NOT dressed up as a save flow: no interstitial offer, no "biztos
// vagy benne, hiszen…". One confirm, because the action is irreversible, and
// then it happens.
export function WithdrawalButton({
  className,
  label = "Elállok a szerződéstől",
}: {
  className?: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [refunded, setRefunded] = useState<number | null>(null);

  if (state === "done") {
    return (
      <p className={className} role="status">
        Elállásodat rögzítettük.{" "}
        {refunded && refunded > 0
          ? `${refunded.toLocaleString("hu-HU")} Ft visszautalás úton van (5–10 munkanap).`
          : "A már felhasznált időszak alapján visszatérítendő összeg nem keletkezett."}{" "}
        A megerősítő emailt elküldtük.
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={state === "working"}
        onClick={async () => {
          if (
            !confirm(
              "Elállsz a szerződéstől? A hozzáférésed azonnal megszűnik, és a fel nem használt " +
                "időszak díját visszautaljuk. Ez nem vonható vissza.",
            )
          ) {
            return;
          }
          setState("working");
          try {
            setRefunded(await requestWithdrawal());
            setState("done");
          } catch (e) {
            setMsg(
              e instanceof Error && e.message === "withdrawal_window_expired"
                ? "A 14 napos elállási határidő letelt. Lemondani viszont bármikor tudsz."
                : e instanceof Error && e.message === "no_subscription"
                  ? "Nincs aktív előfizetésed, amitől el lehetne állni."
                  : "Nem sikerült rögzíteni. Írj a hi@lexfit.hu címre, és elintézzük.",
            );
            setState("error");
          }
        }}
      >
        {state === "working" ? "Feldolgozás…" : label}
      </button>
      {state === "error" && <p role="alert" className="lx-withdraw-err">{msg}</p>}
    </>
  );
}
