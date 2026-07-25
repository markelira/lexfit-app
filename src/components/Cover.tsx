import { catWord, cardGrad } from "@/lib/categories";

// The shared generated cover — the heart of the card system. Every card variant
// sits on this. Layers, bottom → top:
//   1. category gradient (from `theme`)
//   2. optional trainer underlayer (blended into the category color, edges dissolve)
//   3. decorative ring
//   4. centered category lockup: eyebrow `LEXFIT · <code>` → big full word → underline
//   5. `children` — variant overlays (program lockup, duration chip, title band, tags)
//
// There is NO per-video artwork: a cover is fully determined by data. The trainer
// image is a PROP (production binds it to a per-program/per-trainer hero field);
// absent → gradient + word only.
export function Cover({
  theme,
  code,
  trainer,
  focal = "64% 18%",
  className = "",
  children,
}: {
  theme: string;
  code?: string;
  trainer?: string | null;
  focal?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`lx-cover ${className}`} style={{ background: cardGrad(theme) }}>
      {trainer && (
        <div
          className="lx-cover-photo"
          style={{ backgroundImage: `url(${trainer})`, backgroundPosition: focal }}
          aria-hidden="true"
        />
      )}
      <span className="cc-ring" aria-hidden="true" />
      <div className="cca-lockup">
        {code && <div className="ey">LEXFIT · {code}</div>}
        <div className="wd">{catWord(theme)}</div>
        <div className="un" />
      </div>
      {children}
    </div>
  );
}
