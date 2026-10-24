/**
 * Calendar date as "YYYY-MM-DD" in the user's local time zone.
 *
 * `toISOString().slice(0, 10)` gives the UTC date, which is "yesterday" for users
 * ahead of UTC until their offset has passed (e.g. before 8am in UTC+8).
 */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
