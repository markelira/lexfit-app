// Small shared pieces: CTA button, tinted panel, fact rows, day dots.

import * as React from "react";
import { Button, Column, Row, Section, Text } from "react-email";
import { color, font, radius, styles } from "../tokens";

/** Primary CTA — ink fill + light text (the app's primary button; never white-on-green). */
export function Cta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Section style={{ textAlign: "center", padding: "10px 0 4px" }}>
      <Button
        href={href}
        style={{
          backgroundColor: color.ink,
          color: color.onInk,
          fontFamily: font.sans,
          fontSize: 15,
          fontWeight: 600,
          borderRadius: radius.sm,
          padding: "14px 28px",
          textDecoration: "none",
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

/** Tinted accent panel — the one place the green appears as a surface. */
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Section
      style={{
        backgroundColor: color.accentSoft,
        borderRadius: radius.md,
        padding: "18px 20px",
        margin: "6px 0 18px",
      }}
    >
      {children}
    </Section>
  );
}

export function PanelText({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: font.sans,
        fontSize: 15,
        lineHeight: 1.55,
        color: color.accentInk,
        margin: 0,
      }}
    >
      {children}
    </Text>
  );
}

/** Key–value rows for billing facts (price, dates). */
export function Facts({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <Section
      style={{
        borderTop: `1px solid ${color.line}`,
        margin: "22px 0 6px",
      }}
    >
      {rows.map((r) => (
        <Row key={r.label} style={{ borderBottom: `1px solid ${color.line}` }}>
          <Column style={{ padding: "11px 0" }}>
            <Text
              style={{
                fontFamily: font.mono,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: color.ink3,
                margin: 0,
              }}
            >
              {r.label}
            </Text>
          </Column>
          <Column style={{ padding: "11px 0", textAlign: "right" }}>
            <Text
              style={{
                fontFamily: font.sans,
                fontSize: 15,
                fontWeight: 600,
                color: color.ink,
                margin: 0,
              }}
            >
              {r.value}
            </Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

export type DayState = "done" | "rest" | "missed" | "today" | "upcoming";

/** Weekly recap day dots — H K Sz Cs P Szo V. */
export function WeekDots({
  days = [],
}: {
  days?: { label: string; state: DayState }[];
}) {
  const cell = (state: DayState): React.CSSProperties => {
    switch (state) {
      case "done":
        return { backgroundColor: color.accentSoft, color: color.accentInk, border: `1px solid ${color.accentSoft}` };
      case "rest":
        return { backgroundColor: color.surface2, color: color.ink3, border: `1px solid ${color.surface2}` };
      case "missed":
        return { backgroundColor: color.surface, color: color.ink3, border: `1px solid ${color.line}` };
      case "today":
        return { backgroundColor: color.surface, color: color.ink, border: `1px solid ${color.accent2}` };
      default:
        return { backgroundColor: color.surface, color: color.ink3, border: `1px dashed ${color.line}` };
    }
  };
  return (
    <Section style={{ margin: "6px 0 20px" }}>
      <Row>
        {days.map((d, i) => (
          <Column key={i} style={{ textAlign: "center", padding: "0 2px" }}>
            <Text
              style={{
                ...cell(d.state),
                display: "inline-block",
                width: 34,
                height: 34,
                lineHeight: "34px",
                borderRadius: 999,
                fontFamily: font.mono,
                fontSize: 11,
                margin: 0,
              }}
            >
              {d.state === "done" ? "✓" : d.label}
            </Text>
          </Column>
        ))}
      </Row>
    </Section>
  );
}

/** Alexa's sign-off. */
export function Sign() {
  return <Text style={styles.sign}>— Alexa</Text>;
}
