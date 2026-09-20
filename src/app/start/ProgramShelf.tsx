"use client";

import { WorkoutCard, type WorkoutCardVideo } from "@/components/WorkoutCard";
import { ProgramBanner, bannerEyebrow } from "@/components/ProgramBanner";
import { assignProgramHues } from "@/lib/programs";
import { catWord, levelWord } from "@/lib/categories";
import "@/app/app/programs/programs.css"; // `.lx .pgs-*` - the billboard itself

/**
 * The whole programme, shown rather than summarised (P1).
 *
 * "35 edzés" is a number; this is the thing. Every session the buyer receives
 * is here, in the app's OWN WorkoutCard - the same component, the same covers,
 * the same geometry they will meet after paying - so the page shows the
 * product instead of a picture of it.
 *
 * Each category gets the app's billboard (`ProgramBanner`, the same object
 * /app/programs and the marketing homepage render) rather than a bare heading.
 * Two reasons: a buyer who scrolls this far is being shown the inside of the
 * app, so it should look like the app; and a billboard can carry the things a
 * heading cannot - what the category is FOR, its length, its level.
 *
 * The wrapper carries `.lx` because that is the scope workout-card.css and
 * programs.css are both written against; see the comment at the return.
 *
 * Every card is a CTA. Tapping one cannot play anything - nothing has been
 * bought yet - so instead of a locked dead end it opens the checkout, which is
 * what someone who just tapped a workout is asking for.
 */

/** What each category is for, in the buyer's terms rather than the trainer's. */
const SYNOPSIS: Record<string, string> = {
  "Alsótest":
    "Comb, fenék, vádli - a legnagyobb izmaid. Ezektől lesz könnyebb a lépcső, a bevásárlás, a hosszú séta.",
  "Felsőtest":
    "Kar, hát, váll. Ez az, amitől egy laptop fölött töltött nap után is egyenes marad a tartásod.",
  "Kardió + has":
    "Felpörgeted a pulzust, és közben a törzsed is dolgozik. Ugrálás nélkül is megy - a szomszéd nem fogja hallani.",
  "Teljes test":
    "Egy edzés, ami mindent megmozgat. Ezek a program gerince: ha csak egy napra jut idő, ezek közül válassz.",
  "Mobilitás / nyújtás":
    "A nap, amikor nem hajtasz. Kinyújtod, ami merev lett, és marad energiád a napodra.",
  "Tartás-fókusz":
    "A görnyedés ellen. Rövid, célzott munka a hátsó láncra - a hátra, ami egész nap tartja a felsőtestedet.",
};

/** Stable key per category, so the mark and hue never move between renders. */
const keyOf = (theme: string) =>
  `cat-${theme.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export function ProgramShelf({
  workouts,
  onTap,
}: {
  workouts: WorkoutCardVideo[];
  onTap: () => void;
}) {
  if (!workouts.length) return null;

  // Insertion order = playlist order, so the categories appear in the order the
  // programme introduces them rather than alphabetically.
  const groups = new Map<string, WorkoutCardVideo[]>();
  for (const w of workouts) {
    const k = w.theme || "Egyéb";
    groups.set(k, [...(groups.get(k) ?? []), w]);
  }
  const themes = [...groups.keys()];
  // Same helper the app uses, so no two categories collide on a hue.
  const hues = assignProgramHues(themes.map(keyOf));

  // `.lx` is not decoration: every rule in workout-card.css and programs.css is
  // scoped under it. Without it the cards render unstyled - the trainer avatar
  // alone blows up to full width. It is applied HERE rather than on the page
  // root so the app's base layer cannot reach the landing's own bands, which
  // live under `.lxu`.
  return (
    <div className="lx lxs-shelf">
      {themes.map((theme) => {
        const list = groups.get(theme)!;
        const key = keyOf(theme);
        // Chips are DERIVED from the sessions in this category, never typed: a
        // banner claiming ~25 perc over a row of 20-minute workouts is the kind
        // of small lie that costs more than the sentence was worth.
        const avg = Math.round(list.reduce((s, v) => s + (v.mins || 0), 0) / list.length);
        const minLevel = Math.min(...list.map((v) => v.level ?? 1));
        return (
          <section key={theme} className="lxs-cat" aria-label={theme}>
            {/* `.lp-col lp-col-wide` is the page's OWN centring primitive, used
                here instead of a hand-rolled gutter. Two earlier attempts at
                percentage math put the billboard and its rail on different
                left edges; reusing the primitive cannot drift from the copy
                because it IS what the copy uses. */}
            <div className="lp-col lp-col-wide lxs-banner">
              <ProgramBanner
                slug={key}
                title={catWord(theme)}
                name={theme}
                hue={hues[key]}
                eyebrow={bannerEyebrow(["LEXFIT START", `${list.length} EDZÉS`])}
                synopsis={SYNOPSIS[theme]}
                titleAs="h3"
                chips={[
                  levelWord(minLevel).toUpperCase(),
                  `~${avg} PERC / EDZÉS`,
                  "ESZKÖZ NÉLKÜL",
                ]}
              />
            </div>
            <div className="lp-col lp-col-wide">
              <div className="lxs-row" role="list">
                {list.map((v) => (
                  <div className="lxs-cell" role="listitem" key={v.code}>
                    <WorkoutCard
                      v={v}
                      saved={false}
                      onPlay={onTap}
                      onToggleSave={onTap}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
