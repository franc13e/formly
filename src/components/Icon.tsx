// ─── Icon components (clean SVG, no emoji) ───────────────────────────────────
interface IconProps {
  /** One path, or several paths drawn in order. */
  d: string | string[];
  size?: number;
  stroke?: string;
  strokeWidth?: number;
}

export const Icon = ({ d, size=20, stroke="#7A6055", strokeWidth=1.8 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p,i) => <path key={i} d={p}/>) : <path d={d}/>}
  </svg>
);
