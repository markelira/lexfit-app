// Shared shell for every LEXFIT email - Apple structure (one column, one card,
// generous space), LEXFIT skin. The wordmark is live text (no image dependency,
// survives image-blocking), exactly like the app's .wm markup.

import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";
import { APP_URL, color, font, IMPRINT, radius, styles } from "../tokens";

export type FooterKind = "transactional" | "reminder" | "marketing";

const FOOTER_REASON: Record<FooterKind, string> = {
  transactional:
    "Ezt az emailt a LEXFIT-fiókodhoz kapcsolódó esemény miatt kaptad.",
  reminder: "Ezt az emlékeztetőt te kérted a beállításaidban.",
  marketing:
    "Ezt az emailt azért kaptad, mert feliratkoztál a LEXFIT újdonságaira.",
};

export function EmailLayout({
  preview,
  footer = "transactional",
  reason,
  children,
}: {
  preview: string;
  footer?: FooterKind;
  /** Overrides the default "why you got this" line. */
  reason?: string;
  children: React.ReactNode;
}) {
  const settingsUrl = `${APP_URL}/app/profile/settings`;
  return (
    <Html lang="hu" dir="ltr">
      <Head>
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Email template, not a Next page - the pages/_document rule doesn't apply. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: color.bg,
          margin: 0,
          padding: 0,
          fontFamily: font.sans,
        }}
      >
        <Container style={{ maxWidth: 480, margin: "0 auto", padding: "44px 16px 36px" }}>
          <Section style={{ textAlign: "center", paddingBottom: 26 }}>
            <Text
              style={{
                fontFamily: font.sans,
                fontWeight: 900,
                fontSize: 19,
                letterSpacing: "0.04em",
                color: color.ink,
                margin: 0,
              }}
            >
              LEX
              <span style={{ color: color.accent2 }}>FIT</span>
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: color.surface,
              borderRadius: radius.lg,
              border: `1px solid ${color.line}`,
              padding: "38px 32px 36px",
            }}
          >
            {children}
          </Section>

          <Section style={{ textAlign: "center", padding: "26px 10px 0" }}>
            <Text style={styles.small}>{reason ?? FOOTER_REASON[footer]}</Text>
            {footer === "reminder" && (
              <Text style={styles.small}>
                Bármikor kikapcsolhatod itt:{" "}
                <Link
                  href={settingsUrl}
                  style={{ color: color.accentInk, textDecoration: "underline" }}
                >
                  Profil → Beállítások
                </Link>
              </Text>
            )}
            {footer === "marketing" && (
              <Text style={styles.small}>
                <Link
                  href={settingsUrl}
                  style={{ color: color.accentInk, textDecoration: "underline" }}
                >
                  Leiratkozás
                </Link>{" "}
                - egy kattintás, nem kérdezünk vissza.
              </Text>
            )}
            <Text style={{ ...styles.small, margin: "14px 0 0", color: color.ink3 }}>
              {IMPRINT.company} · {IMPRINT.seat}
              <br />
              {IMPRINT.regNo} · {IMPRINT.taxNo} ·{" "}
              <Link
                href={`mailto:${IMPRINT.email}`}
                style={{ color: color.ink3, textDecoration: "underline" }}
              >
                {IMPRINT.email}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
