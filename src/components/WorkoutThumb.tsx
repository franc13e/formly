import { useState } from "react";
import { C } from "../theme";
import { Glyph } from "./Glyph";
import { glyphFor, TONES } from "./glyphs";
import { workoutPicture } from "../lib/formTips";

interface WorkoutThumbProps {
  workout: { id?: number; name: string; emoji?: string };
  /** Width in px (and height, unless `height` is given). */
  size?: number | string;
  height?: number | string;
  radius?: number;
  /** Hide from assistive tech when the name is read right next to it (e.g. stacked thumbnails). */
  decorative?: boolean;
}

/**
 * A small picture of a workout: the built-in or best-matching wger image,
 * with the workout's glyph on its soft tone underneath (shown while loading, when there's
 * no image or when it fails to load).
 */
export function WorkoutThumb({ workout, size = 48, height, radius = 12, decorative = false }: WorkoutThumbProps) {
  const image = workoutPicture(workout);
  const [state, setState] = useState<"loading" | "shown" | "failed">("loading");
  const emoji = workout.emoji || "🏋️";
  const tone = TONES[glyphFor(emoji)[1]];
  const url = image && state !== "failed" ? image.url : null;
  return (
    <span aria-hidden={decorative || undefined} title={image && state === "shown" ? `Image: ${image.author} · ${image.license} · wger` : undefined}
      style={{position:"relative",width:size,height:height ?? size,borderRadius:radius,overflow:"hidden",flexShrink:0,display:"inline-flex",alignItems:"center",justifyContent:"center",background:url&&state==="shown"?C.white:tone.bg,border:`1.5px solid ${C.border}`}}>
      <Glyph emoji={emoji} chip={false} size={typeof size === "number" ? Math.max(12, Math.round(size*0.42)) : 28} color={tone.fg}/>
      {url && (
        <img key={url} src={url} alt={decorative ? "" : `${workout.name} demonstration`} loading="lazy" decoding="async"
          onLoad={()=>setState("shown")} onError={()=>setState("failed")}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",background:C.white,opacity:state==="shown"?1:0,transition:"opacity .2s"}}/>
      )}
    </span>
  );
}
