"use client";

import "@/app/login/auth.css"; // shared split-screen shell + brand panel
import "@/app/onboarding/onbv2.css"; // .fnl-* / .pw-* / .authx-* funnel styles
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Protected, Loader } from "@/components/Protected";
import { getSubscription, isSubscribed, purchasedPrograms, type Subscription } from "@/lib/billing";
import { BrandPanel } from "@/components/onboarding/BrandPanel";
import { PaywallOffer, PAYWALL_PLANS } from "@/components/onboarding/paywall";
import { EmbeddedPay } from "@/components/onboarding/EmbeddedPay";

// The unpaid-user paywall - now the SAME "A teljes LEXFIT" offer as the onboarding
// funnel (split-screen shell + brand panel + selectable plans + embedded Stripe),
// so there is one paywall design everywhere. Exit = log out (owner decision).
// paidDestination() routes every unpaid user here; on success Stripe returns to
// /app?sub=success, where entitlement is granted.
function SubscribeScreen() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null | undefined>(undefined);
  // Landing cards deep-link with ?plan=<role>; else the funnel default (Heti).
  const [role, setRole] = useState<string>(() => {
    if (typeof window === "undefined") return "week_intro";
    const p = new URLSearchParams(window.location.search).get("plan");
    return p && PAYWALL_PLANS.some((x) => x.role === p) ? p : "week_intro";
  });
  // Returned from a cancelled Stripe checkout (cancel_url=/subscribe?canceled=1).
  const canceled = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("canceled") === "1";
  }, []);

  useEffect(() => {
    if (user) getSubscription(user.uid).then(setSub, () => setSub(null));
  }, [user]);

  const subscribed = useMemo(() => isSubscribed(sub ?? null), [sub]);
  // P1: a programme owner arrives here by clicking content their purchase does
  // not cover. Telling them "nincs előfizetésed" minutes after they paid reads
  // as a broken product; the honest frame is that they own one thing and this
  // is the other. This screen is the membership upsell for exactly that person.
  const owns = useMemo(() => purchasedPrograms(sub ?? null), [sub]);
  const isOwner = owns.length > 0;

  // Subscribed users don't belong on the paywall - send them into the app.
  useEffect(() => {
    if (subscribed) router.replace("/app");
  }, [subscribed, router]);

  async function logout() {
    try { await signOutUser(); } catch { /* ignore - still leave */ }
    router.replace("/login");
  }

  if (sub === undefined || subscribed) return <Loader label="Előfizetés…" />;

  return (
    <div className="lx authx fnl-wiz">
      <div className="authx-shell">
        <BrandPanel step="pay" />
        <main className="fnl-col">
          <div className="fnl-main fnl">
            <div className="fnl-top">
              <button className="fnl-later" onClick={isOwner ? () => router.push("/app") : logout}>
                {isOwner ? "Vissza a programomhoz" : "Kilépés"}
              </button>
            </div>
            <div className="fnl-scroll pw-scroll">
              {isOwner && (
                <p className="pw-fine" role="status">
                  A megvásárolt programod a tiéd marad - ez nem változik. Ez a videó a
                  többi programhoz és a heti kihívásokhoz tartozik, amit a tagság nyit meg.
                </p>
              )}
              <PaywallOffer />
              {canceled && (
                <p className="pw-fine" role="status">
                  Nem történt fizetés - a terved megvan, bármikor folytathatod.
                </p>
              )}
              <EmbeddedPay plans={PAYWALL_PLANS} role={role} onRoleChange={setRole} />
            </div>
          </div>
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
