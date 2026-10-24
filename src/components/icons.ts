/** SVG path data for the `Icon` component (clean SVG, no emoji). */
export const Icons = {
  home:     ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"],
  nutrition:"M12 2a9 9 0 00-9 9c0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11A9 9 0 0012 2z",
  body:     ["M12 2a4 4 0 100 8 4 4 0 000-8z","M6 21v-1a6 6 0 0112 0v1"],
  workouts: ["M6.5 6.5h11","M6.5 17.5h11","M3 12h18","M16 6.5V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v1.5","M16 17.5V19a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1.5"],
  profile:  ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 3a4 4 0 100 8 4 4 0 000-8z"],
  trash:    ["M3 6h18","M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6","M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"],
  plus:     "M12 5v14M5 12h14",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  chevron:  "M6 9l6 6 6-6",
  leaf:     "M17 8C8 10 5.9 16.17 3.82 20.82a10.71 10.71 0 01-.82-4.82C3 9 9 5 17 8z",
} satisfies Record<string, string | string[]>;

export type IconName = keyof typeof Icons;
