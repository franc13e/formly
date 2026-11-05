import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { C } from "../theme";
import { localDateKey } from "../lib/date";

/** How one day cell looks. Every field is optional; unset fields use the plain style. */
export interface DayLook {
  background?: string;
  border?: string;
  textColor?: string;
  /** Small content under the day number (dots, an icon). */
  content?: ReactNode;
}

interface MonthCalendarProps {
  /** YYYY-MM-DD of the highlighted day, if any. */
  selected?: string | null;
  onSelect?: (date: string) => void;
  /** Styles a day; called for every visible day of the month. */
  renderDay?: (date: string) => DayLook;
  /** Any day in the month to open on (YYYY-MM-DD); defaults to the current month. */
  initialMonth?: string;
}

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** Monday-first month grid with previous/next month buttons. */
export function MonthCalendar({ selected, onSelect, renderDay, initialMonth }: MonthCalendarProps) {
  const [month, setMonth] = useState(() => {
    const d = initialMonth ? new Date(initialMonth + "T12:00") : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1, 12);
  });
  const todayStr = localDateKey();
  const lead = (month.getDay() + 6) % 7; // blank cells before the 1st
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const shift = (n: number) => setMonth(m => new Date(m.getFullYear(), m.getMonth() + n, 1, 12));
  const navBtn = { background: C.bgDeep, border: "none", borderRadius: 10, width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.textMid } as const;

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 10 }}>
        <button style={navBtn} onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft size={18} /></button>
        <div style={{ fontWeight: 900, fontSize: 15, color: C.text }}>{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
        <button style={navBtn} onClick={() => shift(1)} aria-label="Next month"><ChevronRight size={18} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
        {WEEKDAYS.map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: C.textSoft, padding: "2px 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {Array.from({ length: lead }, (_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = localDateKey(new Date(month.getFullYear(), month.getMonth(), i + 1, 12));
          const look = renderDay?.(date) ?? {};
          const isSel = selected === date, isToday = date === todayStr;
          return (
            <button key={date} onClick={() => onSelect?.(date)} aria-label={new Date(date + "T12:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })} aria-pressed={isSel}
              style={{
                minHeight: 46, borderRadius: 10, padding: "5px 2px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                cursor: onSelect ? "pointer" : "default", fontFamily: "Nunito",
                border: isSel ? "2px solid #B5506E" : look.border ?? `1.5px solid ${isToday ? C.lavenderDeep : C.border}`,
                background: look.background ?? (isToday ? C.lavender : C.white),
              }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: look.textColor ?? (isToday ? "#B5506E" : C.text) }}>{i + 1}</span>
              {look.content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
