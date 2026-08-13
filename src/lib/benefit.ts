// Benefit subhead for a workout card. A benefit = TARGET (from the category) ×
// EFFECT (from the signals that vary within a category: format / types / level).
//
// Layered so it works now and sharpens as content is authored:
//   1. video.subtitle  - authored free text (hero / special cards)
//   2. video.focus[]   - controlled outcome tags (editable `filters/focus`)
//   3. derived default - theme × intensity-bucket matrix (below), zero authoring
//
// The derived layer intentionally keys on format/types/level so two workouts in the
// SAME category surface DIFFERENT benefits.

type Bucket = "strength" | "burn" | "calm";

interface BenefitInput {
  theme: string;
  format?: string;
  types?: string[];
  level?: number;
  subtitle?: string | null;
  focus?: string[];
}

// theme → { the three intensity buckets }. Each phrase ≤ ~28 chars, one line.
const BENEFIT: Record<string, Record<Bucket, string>> = {
  "Alsótest": {
    strength: "Comb, fenék, vádli",
    burn: "Comb és fenék, felpörgetve",
    calm: "Kioldott csípő, nyújtott comb",
  },
  "Felsőtest": {
    strength: "Erős kar, feszes hát",
    burn: "Kar és váll, dinamikusan",
    calm: "Nyitott váll, oldott nyak",
  },
  "Kardió + has": {
    strength: "Stabil törzs, erős has",
    burn: "Felpörgő pulzus, ugrálás nélkül",
    calm: "Enyhe kardió, has-fókusz",
  },
  "Teljes test": {
    strength: "Erő az egész testben",
    burn: "Teljes test, egy körben",
    calm: "Átmozgató, kíméletes",
  },
  "Mobilitás / nyújtás": {
    strength: "Stabil, mozgékony ízületek",
    burn: "Aktív nyújtás, keringés",
    calm: "Kioldott gerinc, kevesebb merevség",
  },
  "Tartás-fókusz": {
    strength: "Egyenes hát, erős törzs",
    burn: "Aktív törzs, egyenes hát",
    calm: "Oldott hát, jobb tartás",
  },
};

const FALLBACK = BENEFIT["Teljes test"];

function bucket({ theme, format = "", types = [] }: BenefitInput): Bucket {
  const fmt = format.toLowerCase();
  if (theme === "Mobilitás / nyújtás" || /flow|nyújt|mobil/.test(fmt) || types.some((t) => /Esti|Lazító/i.test(t))) {
    return "calm";
  }
  if (/emom|amrap|tabata|hiit|50\/50/.test(fmt) || types.some((t) => /Intenzív/i.test(t))) {
    return "burn";
  }
  return "strength";
}

/** The card's benefit subhead. Authored subtitle/focus win; else derived. */
export function benefitOf(v: BenefitInput): string {
  if (v.subtitle?.trim()) return v.subtitle.trim();
  if (v.focus?.length) return v.focus.slice(0, 2).join(" · ");
  return (BENEFIT[v.theme] ?? FALLBACK)[bucket(v)];
}
