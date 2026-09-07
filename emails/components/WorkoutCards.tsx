import * as React from "react";
import { Section, Text } from "react-email";
import { color, font, radius } from "../tokens";

// Workout cards for email, matching the app's card system as closely as email
// HTML allows.
//
// The app's cover is a CSS gradient built with `oklch(from ... )` over a CSS
// custom property, and neither survives an email client - so the category
// colours are resolved to fixed hex here, converted from the same
// `--cat-*` tokens in src/app/lexfit-tokens.css. If those tokens change, these
// change with them; the selftest pins the two together.
//
// Structure mirrors the real card: a coloured cover carrying the full category
// word, then a title band with the running number and the length. No images:
// a Mux thumbnail needs a signed URL, and a broken image in an inbox is worse
// than a solid cover that always renders.

/** The `--cat-*` tokens, resolved to hex for email. Keep in step with
 *  src/lib/categories.ts (CAT) - the selftest asserts every theme is covered. */
export const CAT_HEX: Record<string, string> = {
  "Alsótest": "#7a9b8d",
  "Felsőtest": "#4a5a4d",
  "Kardió + has": "#936c38",
  "Teljes test": "#865e4f",
  "Mobilitás / nyújtás": "#9bb4bf",
  "Tartás-fókusz": "#8b79bf",
};

/** The centred cover word, as on the real card. */
export const CAT_WORD: Record<string, string> = {
  "Alsótest": "ALSÓTEST",
  "Felsőtest": "FELSŐTEST",
  "Kardió + has": "KARDIÓ + HAS",
  "Teljes test": "TELJES TEST",
  "Mobilitás / nyújtás": "MOBILITÁS / NYÚJTÁS",
  "Tartás-fókusz": "TARTÁS-FÓKUSZ",
};

const FALLBACK = "Teljes test";
export const catHex = (theme: string) => CAT_HEX[theme] ?? CAT_HEX[FALLBACK]!;
export const catWordOf = (theme: string) => CAT_WORD[theme] ?? CAT_WORD[FALLBACK]!;

export interface EmailWorkout {
  code: string;
  title: string;
  theme: string;
  mins: number;
  /** 1-based position in the programme, shown as the card's step. */
  step: number;
}

/**
 * One card. Table-based on purpose: Outlook's Word renderer ignores flex and
 * grid entirely, and this has to survive there as well as in Gmail.
 */
export function WorkoutCardEmail({ w, href }: { w: EmailWorkout; href: string }) {
  const bg = catHex(w.theme);
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderRadius: radius.sm,
        overflow: "hidden",
        border: `1px solid ${color.line}`,
        marginBottom: 10,
      }}
    >
      <tbody>
        <tr>
          {/* The cover, at the card's real proportions rather than a thin strip. */}
          <td
            width="104"
            style={{
              width: 104,
              backgroundColor: bg,
              padding: "18px 8px",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            <a href={href} style={{ textDecoration: "none" }}>
              <span
                style={{
                  display: "block",
                  fontFamily: font.mono,
                  fontSize: 8,
                  letterSpacing: "0.09em",
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: "12px",
                }}
              >
                {w.code}
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: font.sans,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: "#ffffff",
                  lineHeight: "13px",
                  marginTop: 4,
                }}
              >
                {catWordOf(w.theme)}
              </span>
            </a>
          </td>

          <td style={{ padding: "14px 16px", verticalAlign: "middle", backgroundColor: color.surface }}>
            <a href={href} style={{ textDecoration: "none", color: color.ink }}>
              <span
                style={{
                  display: "block",
                  fontFamily: font.mono,
                  fontSize: 10.5,
                  letterSpacing: "0.06em",
                  color: color.ink3,
                  lineHeight: "14px",
                }}
              >
                {w.step}. edzés · {w.mins} perc
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: font.sans,
                  fontSize: 15,
                  fontWeight: 600,
                  color: color.ink,
                  lineHeight: "21px",
                  marginTop: 3,
                }}
              >
                {w.title}
              </span>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/**
 * The first few workouts of the programme, plus an honest line about the rest.
 *
 * Deliberately NOT all thirty: a mail that long gets clipped by Gmail (it hides
 * everything past ~102KB behind a "View entire message" link), and the clipped
 * part would be the CTA. The full programme lives on the plan page, which is
 * where the link goes.
 */
export function WorkoutCardList({
  workouts,
  total,
  href,
  moreLabel,
}: {
  workouts: EmailWorkout[];
  total: number;
  href: string;
  moreLabel: (rest: number) => string;
}) {
  if (!workouts.length) return null;
  const rest = Math.max(0, total - workouts.length);
  return (
    <Section style={{ padding: "6px 0 2px" }}>
      {workouts.map((w) => (
        <WorkoutCardEmail key={w.code} w={w} href={href} />
      ))}
      {rest > 0 && (
        <Text
          style={{
            fontFamily: font.sans,
            fontSize: 13,
            lineHeight: "20px",
            color: color.ink3,
            margin: "6px 0 0",
          }}
        >
          {moreLabel(rest)}
        </Text>
      )}
    </Section>
  );
}
