import type { Metadata } from "next";
import { Poppins, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// LEXFIT brand fonts (per Build Plan §Phase 0). Real design tokens from
// lexfit-tokens.css get layered in once the prototype files are dropped in.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LEXFIT",
  description: "LEXFIT — vezetett, nőközpontú edzésprogram.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu" className={`${poppins.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
