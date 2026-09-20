import type { Metadata } from "next";
import { ThankYou } from "./ThankYou";

export const metadata: Metadata = {
  title: "Köszönöm | LEXFIT",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const id = typeof sp.session_id === "string" ? sp.session_id : null;
  return <ThankYou sessionId={id} />;
}
