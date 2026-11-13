import { useId, useState } from "react";
import type { PhaseId } from "../types";

// ─── Mascot: a soft "puffy" blob that changes colour, mood and movement with the phase ──
// It floats and breathes, blinks, glances around and waves. Each phase has its own face,
// movement and little accessory (a nightcap, a sprout, a flower, a bow). Tapping it makes it
// wobble, smile with its eyes and pop out hearts. All motion stops under "reduce motion"
// (see the mascot rules in theme.ts).
const LOOKS: Record<PhaseId | "none", { light: string; mid: string; deep: string }> = {
  menstrual:  { light: "#FFF1F4", mid: "#F7CBD5", deep: "#EFADBD" },
  follicular: { light: "#EEF8F0", mid: "#D2EAD8", deep: "#B3D9BE" },
  ovulation:  { light: "#FFF9E6", mid: "#F8E4AE", deep: "#EFCD78" },
  luteal:     { light: "#F8F5FD", mid: "#E4DDF4", deep: "#CFC3EC" },
  none:       { light: "#FFF1F4", mid: "#F7CBD5", deep: "#EFADBD" },
};

const INK = "#3A2630";
const stroke = { fill: "none", stroke: INK, strokeWidth: 2.6, strokeLinecap: "round" as const };

/** A big round eye with two sparkles in it. */
const Eye = ({ cx, cy, rx = 4.4, ry = 5.2 }: { cx: number; cy: number; rx?: number; ry?: number }) => <>
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={INK}/>
  <circle cx={cx - rx * 0.32} cy={cy - ry * 0.38} r={rx * 0.42} fill="#FFFFFF"/>
  <circle cx={cx + rx * 0.38} cy={cy + ry * 0.3} r={rx * 0.2} fill="#FFFFFF"/>
</>;

/** Happy closed eyes (^ ^), used when beaming or when tapped. */
const HappyEyes = () => <><path d="M38 54 Q43 47 48 54" {...stroke}/><path d="M62 54 Q67 47 72 54" {...stroke}/></>;

/** Eyes and mouth per phase: sleepy, bright, beaming, calm. Open eyes sit in a group that blinks. */
function Face({ phase, happy }: { phase: PhaseId | "none"; happy: boolean }) {
  if (happy) return <>
    <HappyEyes/>
    <path d="M49 60 Q55 61.5 61 60 Q60 68 55 68 Q50 68 49 60Z" fill={INK}/>
    <path d="M52 64.5 Q55 67.5 58 64.5" fill="#F08FA8"/>
  </>;
  if (phase === "menstrual") return <>
    <path d="M38 53 Q43 57.5 48 53" {...stroke}/><path d="M62 53 Q67 57.5 72 53" {...stroke}/>
    <path d="M51 62 Q55 64.5 59 62" {...stroke}/>
  </>;
  if (phase === "ovulation") return <>
    <g className="mascot-eyes"><HappyEyes/></g>
    <path d="M48.5 59.5 Q55 61 61.5 59.5 Q60.5 68 55 68 Q49.5 68 48.5 59.5Z" fill={INK}/>
    <path d="M51.5 64.5 Q55 68 58.5 64.5" fill="#F08FA8"/>
  </>;
  if (phase === "luteal") return <>
    <g className="mascot-eyes"><Eye cx={43} cy={54} rx={3.8} ry={4.4}/><Eye cx={67} cy={54} rx={3.8} ry={4.4}/></g>
    <path d="M50 62 Q52.5 64.5 55 62 Q57.5 64.5 60 62" {...stroke} strokeWidth={2.2}/>
  </>;
  // Follicular and "no phase yet": wide sparkly eyes and a little "w" smile.
  return <>
    <g className="mascot-eyes"><Eye cx={43} cy={52}/><Eye cx={67} cy={52}/></g>
    <path d="M49.5 61 Q52.25 64.5 55 61 Q57.75 64.5 60.5 61" {...stroke} strokeWidth={2.3}/>
  </>;
}

const HEART = "M0 2.2 C0 -0.6 3.6 -0.9 4 1.8 C4.4 -0.9 8 -0.6 8 2.2 C8 5 5 6.6 4 8 C3 6.6 0 5 0 2.2Z";

/** A small accessory on top that says which phase it is: nightcap, sprout, flower or bow. */
function Accessory({ phase, deep }: { phase: PhaseId | "none"; deep: string }) {
  if (phase === "menstrual") return <g className="mascot-hat">
    <path d="M38 22 Q56 11 73 18 Q80 10 90 5 Q72 3 58 8 Q46 12 38 22Z" fill="#B7A8E0"/>
    <path d="M37.5 22.5 Q56 12 73.5 18.5" fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round"/>
    <circle cx="90" cy="5" r="4" fill="#FFFFFF"/>
  </g>;
  if (phase === "follicular") return <g className="mascot-sprout">
    <path d="M55 17 Q55 10 56 5" fill="none" stroke="#6FAE80" strokeWidth={2.2} strokeLinecap="round"/>
    <path d="M56 7 Q62 0 69 3 Q64 10 56 7Z" fill="#8CC79A"/>
    <path d="M55.5 9 Q49 3 43 6 Q48 12 55.5 9Z" fill="#A8D8B2"/>
  </g>;
  if (phase === "ovulation") return <g transform="translate(76 18)"><g className="mascot-flower">
    {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="0" cy="-4.6" rx="3.2" ry="4.4" fill="#FFFFFF" stroke={deep} strokeWidth={0.8} transform={`rotate(${a})`}/>)}
    <circle r="2.8" fill="#F3B24A"/>
  </g></g>;
  // Luteal and "no phase yet": a little bow.
  const bow = phase === "luteal" ? "#B7A8E0" : "#F08FA8";
  return <g transform="translate(70 19) rotate(14)">
    <path d="M0 0 L-9 -6 Q-11 0 -9 6Z" fill={bow}/>
    <path d="M0 0 L9 -6 Q11 0 9 6Z" fill={bow}/>
    <circle r="2.6" fill={bow} stroke="#FFFFFF" strokeWidth={0.8}/>
  </g>;
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
  // Tapping makes it wobble, smile and pop hearts; the class comes off when the wobble ends so it can replay.
  const [boop, setBoop] = useState(false);
  const cheek = key === "menstrual" || key === "none" ? 0.7 : 0.95;
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 110 88" aria-hidden="true" onClick={() => setBoop(true)} style={{ overflow: "visible", cursor: "pointer" }}>
      <defs>
        <radialGradient id={gid} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor={look.light}/><stop offset="0.6" stopColor={look.mid}/><stop offset="1" stopColor={look.deep}/>
        </radialGradient>
      </defs>
      <g className={"mascot m-" + key}>
        <g className={boop ? "mascot-body mascot-boop" : "mascot-body"} onAnimationEnd={e => { if (e.animationName === "mBoop") setBoop(false); }}>
          {/* Feet and arms sit behind the body so only their tips peek out. */}
          <ellipse cx="34" cy="82.5" rx="8" ry="4" fill={look.deep}/>
          <ellipse cx="76" cy="82.5" rx="8" ry="4" fill={look.deep}/>
          <g transform="rotate(50 10 71)"><ellipse className="mascot-arm-l" cx="10" cy="71" rx="4.5" ry="7.5" fill={look.mid} stroke={look.deep} strokeWidth={1}/></g>
          <g transform="rotate(-50 100 71)"><ellipse className="mascot-arm-r" cx="100" cy="71" rx="4.5" ry="7.5" fill={look.mid} stroke={look.deep} strokeWidth={1}/></g>
          <path d="M10 82 C6 50 22 18 55 16 C88 14 106 46 100 82 Z" fill={"url(#" + gid + ")"}/>
          <ellipse className="mascot-shine" cx="38" cy="32" rx="12" ry="7" fill="#FFFFFF" opacity="0.7" transform="rotate(-20 38 32)"/>
          <circle cx="52" cy="27" r="2.2" fill="#FFFFFF" opacity="0.8"/>
          <g className="mascot-face">
            <ellipse cx="33" cy="62" rx="6.5" ry="4" fill="#F5A9BC" opacity={cheek * 0.75}/>
            <ellipse cx="77" cy="62" rx="6.5" ry="4" fill="#F5A9BC" opacity={cheek * 0.75}/>
            <Face phase={key} happy={boop}/>
          </g>
          <Accessory phase={key} deep={look.deep}/>
        </g>
        {key === "ovulation" && <path className="mascot-sparkle" d={SPARKLE_BIG} fill="#FFFFFF" stroke={look.deep} strokeWidth="0.8"/>}
        {key === "follicular" && <path className="mascot-sparkle" d={SPARKLE_SMALL} fill="#FFFFFF" stroke={look.deep} strokeWidth="0.8"/>}
        {key === "menstrual" && !boop && <>
          <text className="mascot-z" x="92" y="26" fontSize="11" fontWeight="700" fill={INK} fontFamily="DM Sans, sans-serif">z</text>
          <text className="mascot-z mascot-z2" x="100" y="16" fontSize="8" fontWeight="700" fill={INK} fontFamily="DM Sans, sans-serif">z</text>
        </>}
        {boop && <>
          {/* The position is on the wrapper so the float-up animation can use transform freely. */}
          <g transform="translate(16 20)"><path className="mascot-heart" d={HEART} fill="#F08FA8"/></g>
          <g transform="translate(84 10) scale(.8)"><path className="mascot-heart mascot-heart2" d={HEART} fill="#F5A9BC"/></g>
          <g transform="translate(97 34) scale(.6)"><path className="mascot-heart mascot-heart3" d={HEART} fill="#F08FA8"/></g>
        </>}
      </g>
    </svg>
  );
}
