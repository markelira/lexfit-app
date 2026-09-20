import type { Metadata } from "next";
import { LoginLinkScreen } from "./LoginLinkScreen";

// /belepes - passwordless sign-in (P1).
//
// Programme buyers never choose a password, so "Elfelejtettem a jelszavam" is
// the wrong question to ask them: there is nothing to forget. This page asks
// only for the address and mails a link.

export const metadata: Metadata = {
  title: "Belépés | LEXFIT",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LoginLinkScreen />;
}
