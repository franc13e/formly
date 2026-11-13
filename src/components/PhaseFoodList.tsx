import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { C, ACCENT } from "../theme";
import { Glyph } from "./Glyph";
import { EASE_DETAILS, FOCUS_DETAILS } from "../data/foodDetails";
import type { CycleFoodGuide, PhaseId } from "../types";

const subhead = (color: string) => ({ fontSize: 11, fontWeight: 700, color, letterSpacing: .2, margin: "10px 0 6px" } as const);

function Chips({ items, bg, color }: { items: string[]; bg: string; color: string }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map(x => <span key={x} style={{ fontSize: 12, fontWeight: 600, color, background: bg, padding: "4px 10px", borderRadius: 99 }}>{x}</span>)}
    </div>
  );
}

function Bullets({ items, color }: { items: string[]; color: string }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
      {items.map(x => <li key={x} style={{ fontSize: 12, color, fontWeight: 500, lineHeight: 1.5 }}>{x}</li>)}
    </ul>
  );
}

function RowButton({ open, onClick, children, id }: { open: boolean; onClick: () => void; children: React.ReactNode; id: string }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={open} aria-controls={id}
      style={{ display: "flex", gap: 12, width: "100%", alignItems: "flex-start", background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "DM Sans", color: "inherit" }}>
      {children}
    </button>
  );
}

const Chevron = ({ open, color }: { open: boolean; color: string }) => (
  <ChevronDown size={18} color={color} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1, transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }} />
);

/** "Foods to focus on": each row opens to show why, foods that count and easy ideas. */
export function FocusFoods({ phase, foods }: { phase: PhaseId; foods: CycleFoodGuide["eat"] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      {foods.map((item, i) => {
        const d = FOCUS_DETAILS[phase][item.food];
        const isOpen = open === item.food;
        const id = `focus-${phase}-${i}`;
        return (
          <div key={item.food} style={{ padding: "10px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
            <RowButton open={isOpen} id={id} onClick={() => setOpen(isOpen ? null : item.food)}>
              <Glyph emoji={item.emoji} size={16} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: C.text }}>{item.food}</div>
                <div style={{ fontSize: 12, color: C.textSoft, fontWeight: 500, lineHeight: 1.5 }}>{item.why}</div>
              </div>
              {d && <Chevron open={isOpen} color={C.textSoft} />}
            </RowButton>
            {d && isOpen && (
              <div id={id} className="slide-in" style={{ margin: "8px 0 2px 40px" }}>
                <div style={subhead(C.textMid)}>Why it helps now</div>
                <Bullets items={d.reasons} color={C.textMid} />
                <div style={subhead(C.textMid)}>Foods that count</div>
                <Chips items={d.examples} bg={C.sage} color={ACCENT.fiber.text} />
                <div style={subhead(C.textMid)}>Easy ideas</div>
                <Bullets items={d.ideas} color={C.textMid} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/** "Ease off on": each row opens to show why, what to have instead and a kind note. */
export function EaseFoods({ phase, foods }: { phase: PhaseId; foods: CycleFoodGuide["ease"] }) {
  const [open, setOpen] = useState<string | null>(null);
  const ink = ACCENT.protein.text;
  return (
    <>
      {foods.map((item, i) => {
        const d = EASE_DETAILS[phase][item.food];
        const isOpen = open === item.food;
        const id = `ease-${phase}-${i}`;
        return (
          <div key={item.food} style={{ padding: "8px 0", borderTop: i > 0 ? `1px solid ${C.roseDeep}` : "none" }}>
            <RowButton open={isOpen} id={id} onClick={() => setOpen(isOpen ? null : item.food)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: ink }}>{item.food}</div>
                <div style={{ fontSize: 12, color: ink, fontWeight: 500, opacity: .8, marginTop: 2 }}>{item.why}</div>
              </div>
              {d && <Chevron open={isOpen} color={ink} />}
            </RowButton>
            {d && isOpen && (
              <div id={id} className="slide-in" style={{ marginTop: 6 }}>
                <div style={subhead(ink)}>Why go easy</div>
                <Bullets items={d.reasons} color={ink} />
                <div style={subhead(ink)}>Try instead</div>
                <Chips items={d.swaps} bg={C.white} color={ink} />
                <div style={{ fontSize: 12, color: ink, fontWeight: 600, marginTop: 10, lineHeight: 1.5, background: C.white, borderRadius: 10, padding: "8px 10px" }}>{d.note}</div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
