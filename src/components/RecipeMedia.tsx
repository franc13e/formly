import { useState } from "react";
import { C } from "../theme";
import { useRecipePhoto } from "../hooks/useRecipePhoto";
import { tiktokSearchUrl, youtubeSearchUrl } from "../lib/recipeLinks";
import { glyphFor, TONES } from "./glyphs";
import { Glyph } from "./Glyph";
import type { RecipePhoto } from "../types";

const creditLink = { color: C.textMid, fontWeight: 700, textDecoration: "underline" } as const;
const SOURCE_HOME: Record<RecipePhoto["source"], string> = { Pexels: "https://www.pexels.com", Openverse: "https://openverse.org" };

const isHttps = (url: string) => url.startsWith("https://");

function ExternalLink({ href, children }: { href: string; children: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" style={creditLink}>{children}</a>;
}

/** "Photo: <photographer> · <license> · <source>", linking the photographer and the photo's page when known. */
export function PhotoCredit({ photo }: { photo: RecipePhoto }) {
  const who = photo.photographer || "Unknown";
  const page = isHttps(photo.source_url) ? photo.source_url : SOURCE_HOME[photo.source];
  return (
    <div style={{fontSize:10,color:C.textSoft,fontWeight:600,marginTop:4,textAlign:"right"}}>
      Photo: {photo.photographer && isHttps(photo.photographer_url) ? <ExternalLink href={photo.photographer_url}>{who}</ExternalLink> : who}
      {` · ${photo.license} · `}<ExternalLink href={page}>{photo.source}</ExternalLink>
    </div>
  );
}

/**
 * A recipe's food photo (Pexels or Openverse): a 16:9 hero with credit, or a 64px square thumbnail.
 * Looks up `photoQuery` when given (a short dish name searches better), otherwise `name`; alt text uses `name`.
 * Shows the recipe's glyph on a tinted block while loading, when there's no photo, or if the image fails.
 */
export function RecipePhotoView({ name, photoQuery, emoji, variant }: { name: string; photoQuery?: string; emoji: string; variant: "hero" | "thumb" }) {
  const { photo } = useRecipePhoto(photoQuery?.trim() || name);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const tone = TONES[glyphFor(emoji)[1]];
  const hero = variant === "hero";
  const url = photo && photo.url !== failedUrl ? photo.url : null;
  const shown = url !== null && loadedUrl === url;

  const frame = (
    <div style={{position:"relative",overflow:"hidden",background:tone.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
      ...(hero ? {width:"100%",aspectRatio:"16 / 9",borderRadius:16} : {width:64,height:64,borderRadius:14})}}>
      <Glyph emoji={emoji} chip={false} size={hero ? 34 : 22} color={tone.fg}/>
      {url && (
        <img src={url} loading="lazy" decoding="async"
          // The thumbnail sits next to the recipe name inside its button, so it stays out of the accessible name.
          alt={hero ? `Food photo for ${name}` : ""}
          onLoad={() => setLoadedUrl(url)} onError={() => setFailedUrl(url)}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:shown?1:0,transition:"opacity .25s"}}/>
      )}
    </div>
  );
  if (!hero) return frame;
  return (
    <div style={{marginBottom:12}}>
      {frame}
      {shown && photo && <PhotoCredit photo={photo}/>}
    </div>
  );
}

function YouTubeLogo() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true" focusable="false">
      <rect width="20" height="14" rx="4" fill="#FF0000"/>
      <path d="M8 4l5.2 3L8 10z" fill="#FFFFFF"/>
    </svg>
  );
}

function TikTokLogo() {
  return (
    <svg width="14" height="16" viewBox="0 0 16 18" aria-hidden="true" focusable="false">
      <path fill="#161616" d="M11.6 0h-3v12.2a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.78.12V6.6a5.7 5.7 0 1 0 4.82 5.62V6.1A7.3 7.3 0 0 0 16 7.5V4.5a4.4 4.4 0 0 1-4.4-4.5z"/>
    </svg>
  );
}

const pill = {display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:50,border:`1.5px solid ${C.border}`,background:C.white,color:C.text,fontSize:12,fontWeight:700,fontFamily:"Nunito",textDecoration:"none"} as const;

/** "YouTube" and "TikTok" pill links that search for "<name> recipe" videos. */
export function RecipeVideoLinks({ name }: { name: string }) {
  return (
    <div className="row" style={{gap:8,flexWrap:"wrap",marginTop:12}}>
      <a href={youtubeSearchUrl(name)} target="_blank" rel="noopener noreferrer" aria-label={`Watch how to make ${name} on YouTube`} style={pill}>
        <YouTubeLogo/>YouTube
      </a>
      <a href={tiktokSearchUrl(name)} target="_blank" rel="noopener noreferrer" aria-label={`Watch how to make ${name} on TikTok`} style={pill}>
        <TikTokLogo/>TikTok
      </a>
    </div>
  );
}
