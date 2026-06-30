// Renders a LEXFIT icon from one or more SVG paths (stroke by default).
export function LxIcon({
  d,
  size = 20,
  sw = 2,
  fill = false,
  className,
  style,
}: {
  d: string | string[];
  size?: number;
  sw?: number;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}
