import { glyphFor, TONES } from "./glyphs";

interface GlyphProps {
  emoji?: string;
  /** Icon size in px. With a chip, the chip is about 1.9x this. */
  size?: number;
  /** Draw on a soft tinted circle (default) or bare, for inline use next to text. */
  chip?: boolean;
  /** Override the icon colour, e.g. to match a phase's text colour. */
  color?: string;
}

/** An emoji concept drawn as a line icon, optionally on a soft tinted chip. */
export function Glyph({ emoji = "🏋️", size = 18, chip = true, color }: GlyphProps) {
  const [IconCmp, tone] = glyphFor(emoji);
  const t = TONES[tone];
  const icon = <IconCmp size={size} color={color ?? t.fg} strokeWidth={2} aria-hidden="true" />;
  if (!chip) return <span style={{ display: "inline-flex", verticalAlign: "-0.15em", flexShrink: 0 }}>{icon}</span>;
  const box = Math.round(size * 1.9);
  return (
    <span style={{ width: box, height: box, borderRadius: "50%", background: t.bg, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {icon}
    </span>
  );
}
