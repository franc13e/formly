import { useState, useCallback, useRef } from "react";
import type { ShowToast } from "../types";

// ─── Toast hook ───────────────────────────────────────────────────────────────
/** Returns the current toast message (or null) and a function that shows a message for 2.2s. */
export function useToast(): [string | null, ShowToast] {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = useCallback((m: string) => {
    // Restart the timer so a toast shown shortly after another still gets its full 2.2s.
    clearTimeout(timer.current);
    setMsg(m);
    timer.current = setTimeout(()=>setMsg(null),2200);
  },[]);
  return [msg, show];
}
