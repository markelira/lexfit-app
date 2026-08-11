/**
 * The LEXFIT brand mark - the rising arc with its dot, on a rounded tile.
 *
 * The same geometry already exists inline in `AppTopBar` and `onboarding/paywall`,
 * each with its own wrapper class. This is the canonical version: the glyph paints
 * in `currentColor` so the tile's own colour drives it, and the tile takes its size
 * from the surrounding font-size (`em`), so a lockup scales as one object without
 * the caller passing a pixel size. Those two older copies still work and are left
 * alone; they can migrate here whenever their surfaces are next touched.
 */
export function LexMark({ className = "" }: { className?: string }) {
  return (
    <span className={`lexmark ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 680 616">
        <g transform="translate(-192,-152)">
          <path
            d="M248 712A400 400 0 0 1 648 312"
            fill="none"
            stroke="currentColor"
            strokeWidth="112"
            strokeLinecap="round"
          />
          <circle cx="800" cy="224" r="72" fill="currentColor" />
        </g>
      </svg>
    </span>
  );
}
