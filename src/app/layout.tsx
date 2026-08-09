import type { Metadata } from "next";
import { Poppins, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Analytics } from "@/components/Analytics";

// LEXFIT brand fonts (per Build Plan §Phase 0). Real design tokens from
// lexfit-tokens.css get layered in once the prototype files are dropped in.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  // 300 = thin lowercase headings (.h-thin, hero h1); 900 = cover category words.
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu"),
  title: "LEXFIT",
  description: "LEXFIT — vezetett otthoni edzésprogram.",
  // Google Search Console ownership proof (URL-prefix property). Unset = no tag.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu" className={`${poppins.variable} ${plexMono.variable}`}>
      <head>
        {/* Warm DNS+TCP+TLS to the Mux origins so the first HLS manifest/segment and
            poster fetch skip connection setup (~100–500ms) when a video starts. */}
        <link rel="preconnect" href="https://stream.mux.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://image.mux.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
