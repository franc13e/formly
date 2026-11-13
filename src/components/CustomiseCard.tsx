import { Check, Monitor, Moon, Sun } from "lucide-react";
import { C } from "../theme";
import { MASCOTS, PALETTES, type ModeSetting } from "../lib/appearance";
import { setAppearance, useAppearance } from "../hooks/useAppearance";
import { Mascot } from "./Mascot";
import type { PhaseId } from "../types";

const MODES: { id: ModeSetting; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "Device", icon: Monitor },
];

const sub = { fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8 } as const;

/** Profile → Customise: mascot, light/dark mode and colour palette. Changes apply straight away. */
export function CustomiseCard({ phase }: { phase: PhaseId | null }) {
  const a = useAppearance();
  return (
    <div className="card" style={{ display: "grid", gap: 18 }}>
      <div>
        <div style={sub} id="cz-mascot">Mascot</div>
        <div role="radiogroup" aria-labelledby="cz-mascot" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
          {MASCOTS.map(m => {
            const on = a.mascot === m.id;
            return (
              <button key={m.id} type="button" role="radio" aria-checked={on} onClick={() => setAppearance({ mascot: m.id })}
                style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "14px 8px 10px", borderRadius: 18, cursor: "pointer", fontFamily: "DM Sans",
                  background: on ? C.lavender : C.bgDeep, border: `2px solid ${on ? C.accentInk : "transparent"}`, color: C.text }}>
                {on && <span aria-hidden="true" style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", background: C.accentInk, color: C.card, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Check size={13} strokeWidth={3}/></span>}
                <span style={{ pointerEvents: "none", height: 58, display: "flex", alignItems: "flex-end" }}><Mascot phase={phase} size={72} variant={m.id}/></span>
                <span style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{m.name}</span>
                <span style={{ fontSize: 11, color: C.textSoft, fontWeight: 500 }}>{m.blurb}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div style={sub} id="cz-mode">Theme</div>
        <div role="radiogroup" aria-labelledby="cz-mode" style={{ display: "flex", gap: 4, background: C.bgDeep, borderRadius: 14, padding: 4 }}>
          {MODES.map(({ id, label, icon: Icon }) => {
            const on = a.mode === id;
            return (
              <button key={id} type="button" role="radio" aria-checked={on} onClick={() => setAppearance({ mode: id })}
                style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 4px", borderRadius: 11, border: "none", cursor: "pointer", fontFamily: "DM Sans", fontWeight: 700, fontSize: 13,
                  background: on ? C.card : "transparent", color: on ? C.accentInk : C.textSoft, boxShadow: on ? `0 1px 6px ${C.shadow}` : "none" }}>
                <Icon size={15} aria-hidden="true"/> {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div style={sub} id="cz-palette">Colours</div>
        <div role="radiogroup" aria-labelledby="cz-palette" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 8 }}>
          {PALETTES.map(p => {
            const on = a.palette === p.id;
            return (
              <button key={p.id} type="button" role="radio" aria-checked={on} aria-label={`${p.name} colours`} onClick={() => setAppearance({ palette: p.id })}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "4px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "DM Sans" }}>
                <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${p.swatch[0]} 50%, ${p.swatch[1]} 50%)`,
                  boxShadow: on ? `0 0 0 3px ${C.card}, 0 0 0 5px ${C.accentInk}` : `0 0 0 1px ${C.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "box-shadow .15s" }}>
                  {on && <Check size={16} strokeWidth={3} color="#FFFFFF"/>}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: on ? C.text : C.textSoft }}>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
