import { useState } from "react";
import { C, ACCENT } from "../theme";
import { Icon } from "./Icon";
import { Icons } from "./icons";

interface SwipeToDeleteProps {
  onDelete: () => void;
}

// ─── Click to delete ─────────────────────────────────────────────────────────
export function SwipeToDelete({ onDelete }: SwipeToDeleteProps) {
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <button onClick={onDelete} style={{background:C.rose,border:"none",borderRadius:10,padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
      <Icon d={Icons.trash} size={14} stroke={ACCENT.protein.text} strokeWidth={2}/>
      <span style={{fontSize:11,fontWeight:700,color:ACCENT.protein.text}}>Delete?</span>
    </button>
  ) : (
    <button onClick={()=>setConfirm(true)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px",flexShrink:0,opacity:.5}}>
      <Icon d={Icons.trash} size={15} stroke={C.textSoft} strokeWidth={1.8}/>
    </button>
  );
}
