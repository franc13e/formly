import { useState, useCallback } from "react";
import type { ShowToast } from "../types";

// ─── Toast hook ───────────────────────────────────────────────────────────────
/** Returns the current toast message (or null) and a function that shows a message for 2.2s. */
export function useToast(): [string | null, ShowToast] {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((m: string) => { setMsg(m); setTimeout(()=>setMsg(null),2200); },[]);
  return [msg, show];
}
