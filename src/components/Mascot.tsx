import { useId, useState } from "react";
import type { PhaseId } from "../types";

// ─── Mascot: a soft "puffy" blob that changes colour, mood and movement with the phase ──
// It floats and breathes, blinks, glances around, and wobbles when tapped. Each phase moves
// a little differently (sleepy and slow, perky, bouncy, calm sway). All motion stops under
// "reduce motion" (see the mascot rules in theme.ts).
const LOOKS: Record<PhaseId | "none", { light: string; mid: string; deep: string }> = {
  menstrual:  { light: "#FFF1F4", mid: "#F7CBD5", deep: "#EFADBD" },
  follicular: { light: "#EEF8F0", mid: "#D2EAD8", deep: "#B3D9BE" },
  ovulation:  { light: "#FFF9E6", mid: "#F8E4AE", deep: "#EFCD78" },
  luteal:     { light: "#F8F5FD", mid: "#E4DDF4", deep: "#CFC3EC" },
  none:       { light: "#FFF1F4", mid: "#F7CBD5", deep: "#EFADBD" },
};

const INK = "#3A2630";

/** Eyes and mouth per phase: sleepy, bright, beaming, calm. Open eyes sit in a group that blinks. */
function Face({ phase }: { phase: PhaseId | "none" }) {
  const stroke = { fill: "none", stroke: INK, strokeWidth: 2.6, strokeLinecap: "round" as const };
  if (phase === "menstrual") return <>
    <path d="M38 53 Q43 57 48 53" {...stroke}/><path d="M62 53 Q67 57 72 53" {...stroke}/>
    <path d="M50 62 Q55 65 60 62" {...stroke}/>
  </>;
  if (phase === "ovulation") return <>
    <g className="mascot-eyes"><path d="M38 53 Q43 47 48 53" {...stroke}/><path d="M62 53 Q67 47 72 53" {...stroke}/></g>
    <path d="M48 59 Q55 68 62 59" {...stroke}/>
  </>;
  if (phase === "luteal") return <>
    <path d="M38 52 H48" {...stroke}/><path d="M62 52 H72" {...stroke}/>
    <g className="mascot-eyes"><ellipse cx="43" cy="54.5" rx="3" ry="2" fill={INK}/><ellipse cx="67" cy="54.5" rx="3" ry="2" fill={INK}/></g>
    <path d="M51 62 Q55 64.5 59 62" {...stroke}/>
  </>;
  return <>
    <g className="mascot-eyes"><ellipse cx="43" cy="52" rx="3.2" ry="4.2" fill={INK}/><ellipse cx="67" cy="52" rx="3.2" ry="4.2" fill={INK}/></g>
    <path d="M49 60 Q55 66 61 60" {...stroke}/>
  </>;
}

const SPARKLE_BIG = "M92 14 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z";
const SPARKLE_SMALL = "M16 22 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z";

interface MascotProps {
  phase: PhaseId | null;
  /** Width in px; height follows (110:88). */
  size?: number;
}

/** Decorative; the phase is always also stated in text next to it. */
export function Mascot({ phase, size = 110 }: MascotProps) {
  const key = phase ?? "none";
  const look = LOOKS[key];
  const gid = useId().replace(/:/g, "");
  // Tapping the blob makes it wobble; the class comes off when the wobble ends so it can replay.
  const [boop, setBoop] = useState(false);
  const cheek = key === "menstrual" || key === "none" ? 0.55 : 0.9;
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 110 88" aria-hidden="true" onClick={() => setBoop(true)} style={{ overflow: "visible", cursor: "pointer" }}>
      <defs>
        <radialGradient id={gid} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor={look.light}/><stop offset="0.6" stopColor={look.mid}/><stop offset="1" stopColor={look.deep}/>
        </radialGradient>
      </defs>
      <g className={"mascot m-" + key}>
        <g className={boop ? "mascot-body mascot-boop" : "mascot-body"} onAnimationEnd={e => { if (e.animationName === "mBoop") setBoop(false); }}>
          <path d="M10 82 C6 50 22 18 55 16 C88 14 106 46 100 82 Z" fill={"url(#" + gid + ")"}/>
          <ellipse className="mascot-shine" cx="38" cy="32" rx="12" ry="7" fill="#FFFFFF" opacity="0.7" transform="rotate(-20 38 32)"/>
          <g className="mascot-face">
            <ellipse cx="34" cy="61" rx="6" ry="3.5" fill="#F7CBD5" opacity={cheek}/>
            <ellipse cx="76" cy="61" rx="6" ry="3.5" fill="#F7CBD5" opacity={cheek}/>
            <Face phase={key}/>
          </g>
        </g>
        {key === "ovulation" && <path className="mascot-sparkle" d={SPARKLE_BIG} fill="#FFFFFF" stroke={look.deep} strokeWidth="0.8"/>}
        {key === "follicular" && <path className="mascot-sparkle" d={SPARKLE_SMALL} fill="#FFFFFF" stroke={look.deep} strokeWidth="0.8"/>}
        {key === "menstrual" && <>
          <text className="mascot-z" x="86" y="26" fontSize="11" fontWeight="700" fill={INK} fontFamily="DM Sans, sans-serif">z</text>
          <text className="mascot-z mascot-z2" x="94" y="16" fontSize="8" fontWeight="700" fill={INK} fontFamily="DM Sans, sans-serif">z</text>
        </>}
      </g>
    </svg>
  );
}
