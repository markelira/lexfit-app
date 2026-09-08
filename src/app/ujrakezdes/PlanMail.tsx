import { subject as D0_SUBJECT } from "../../../emails/ujrakezdes-d0";

// The plan, drawn as the email that delivers it.
//
// ONE component, TWO places, and that is the point:
//
//   · the landing hero, with a typical answer set, marked „Példa"
//   · the quiz's gate, with the person's real week
//
// The landing promises „megkapod a heti terved" and the gate asks where to send
// it. Both are claims about a thing that arrives in a mailbox, so both show that
// thing rather than an abstraction of it - and because it is the same component,
// the sample on the landing page cannot drift away from what the funnel actually
// produces. The subject line is imported from the email template itself for the
// same reason.
//
// Presentational only: no state, no data fetching, and no interactivity. The
// „button" is a picture of a button, because in both placements this sits either
// behind a glass sheet or inside a hero whose real CTA is elsewhere, and a
// second live control would be a second ask.

export interface PlanMailDay {
  key: string;
  short: string;
  training: boolean;
  /** Minutes, when known. The hero's sample states them per day; the gate's
   *  real plan does too. Rest days show a dash. */
  minutes?: number;
}

export default function PlanMail({
  days, headline, stats, sub, answersLead, answers, sampleTag, cta,
}: {
  days: PlanMailDay[];
  headline: string;
  /** The plan's numbers, as the mail states them. */
  stats?: { k: string; v: string }[];
  sub?: string;
  answersLead?: string;
  answers?: readonly string[];
  /** Renders the „Példa" chip in the chrome. Omit for a real plan. */
  sampleTag?: string;
  cta: string;
}) {
  return (
    <div className="u-mail">
      {/* The client chrome. Two lines is what makes a card read as an email
          rather than as one more card in the funnel. */}
      <div className="u-mail-head">
        <div className="u-mail-from">
          <span className="u-mail-av">A</span>
          <span>
            <b>Alexa</b>
            <i>alexa@lexfit.hu</i>
          </span>
          {sampleTag && <span className="u-mail-tag">{sampleTag}</span>}
        </div>
        <p className="u-mail-subj">{D0_SUBJECT}</p>
      </div>

      <div className="u-mail-body">
        <p className="u-mail-eyebrow">LEXFIT</p>
        <p className="u-mail-h">{headline}</p>

        <ul className="u-mail-week">
          {days.map((d) => (
            <li key={d.key} className={d.training ? "on" : ""}>
              <span className="d">{d.short}</span>
              <span className="m">
                {d.training ? (d.minutes ? `${d.minutes}′` : "•") : "—"}
              </span>
            </li>
          ))}
        </ul>

        {stats && (
          <dl className="u-mail-stats">
            {stats.map((s) => (
              <div key={s.k}>
                <dt>{s.v}</dt>
                <dd>{s.k}</dd>
              </div>
            ))}
          </dl>
        )}

        {sub && <p className="u-mail-sub">{sub}</p>}

        {answers && answers.length > 0 && (
          <div className="u-mail-answers">
            {answersLead && <span className="u-mail-answers-l">{answersLead}</span>}
            <ul>
              {answers.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>
        )}

        <span className="u-mail-cta">{cta}</span>
      </div>
    </div>
  );
}
