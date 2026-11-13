import type { PhaseId } from "../types";

// ─── Appearance: colour palette, light/dark mode and mascot style ──────────────
// Every colour in the app is a CSS variable (see `C` in theme.ts). `themeTokens` returns the
// values for a palette and mode, and `applyTheme` writes them onto <html>.

export type PaletteId = "ballet" | "matcha" | "lilac" | "peach" | "ocean";
export type ModeSetting = "light" | "dark" | "system";
export type MascotStyle = "classic" | "buff" | "bunny" | "kitty";

export interface Appearance {
  palette: PaletteId;
  mode: ModeSetting;
  mascot: MascotStyle;
}

export const DEFAULT_APPEARANCE: Appearance = { palette: "ballet", mode: "light", mascot: "classic" };

export const PALETTES: { id: PaletteId; name: string; swatch: [string, string] }[] = [
  { id: "ballet", name: "Ballet", swatch: ["#FADBE2", "#A95C76"] },
  { id: "matcha", name: "Matcha", swatch: ["#D6EBD9", "#3F7A4E"] },
  { id: "lilac", name: "Lilac", swatch: ["#E5DDF6", "#6A50A8"] },
  { id: "peach", name: "Peach", swatch: ["#FBDCCB", "#A5552E"] },
  { id: "ocean", name: "Ocean", swatch: ["#D3E6F4", "#2F6A92"] },
];

export const MASCOTS: { id: MascotStyle; name: string; blurb: string }[] = [
  { id: "classic", name: "Blobby", blurb: "The original soft blob" },
  { id: "buff", name: "Buff Blobby", blurb: "Never skips arm day" },
  { id: "bunny", name: "Bunny", blurb: "Floppy ears, big hops" },
  { id: "kitty", name: "Kitty", blurb: "Pointy ears, little whiskers" },
];

/** The colours that change with the palette. */
interface PaletteTones {
  page: string; bg: string; bgDeep: string; card: string; white: string; inputBg: string;
  border: string; shadow: string; text: string; textMid: string; textSoft: string; ink: string;
  petal: string; accentInk: string; accentDeep: string; accentMid: string;
  lavender: string; lavenderDeep: string; rose: string; roseDeep: string;
}

const LIGHT: Record<PaletteId, PaletteTones> = {
  ballet: {
    page: "#F8E6EA", bg: "#FFF9F9", bgDeep: "#FCF1F3", card: "#FFFFFF", white: "#FFFFFF", inputBg: "#FFF8F9",
    border: "#F5E6EA", shadow: "rgba(201,130,150,0.11)", text: "#3A2630", textMid: "#6E5662", textSoft: "#82677A", ink: "#2E2229",
    petal: "#FADBE2", accentInk: "#A1566F", accentDeep: "#8A4862", accentMid: "#B9728A",
    lavender: "#FDF0F3", lavenderDeep: "#F4D3DC", rose: "#FDF3F5", roseDeep: "#F4CDD6",
  },
  matcha: {
    page: "#E3EFE5", bg: "#F8FBF8", bgDeep: "#EEF5EF", card: "#FFFFFF", white: "#FFFFFF", inputBg: "#F6FAF6",
    border: "#E2EEE4", shadow: "rgba(110,160,120,0.12)", text: "#24332A", textMid: "#4F6556", textSoft: "#5E7466", ink: "#1F2A23",
    petal: "#D6EBD9", accentInk: "#3F7A4E", accentDeep: "#2F5E3B", accentMid: "#5E9A6D",
    lavender: "#EFF7F0", lavenderDeep: "#CFE6D4", rose: "#F2F8F3", roseDeep: "#CDE3D2",
  },
  lilac: {
    page: "#ECE6F7", bg: "#FBF9FE", bgDeep: "#F2EEFA", card: "#FFFFFF", white: "#FFFFFF", inputBg: "#FAF8FE",
    border: "#EAE4F6", shadow: "rgba(140,120,200,0.12)", text: "#2D2640", textMid: "#5B5272", textSoft: "#6C6385", ink: "#251F33",
    petal: "#E5DDF6", accentInk: "#6A50A8", accentDeep: "#533D88", accentMid: "#8A72C4",
    lavender: "#F4F0FC", lavenderDeep: "#DDD3F2", rose: "#F6F2FC", roseDeep: "#D9CEF0",
  },
  peach: {
    page: "#F8E7DC", bg: "#FFFAF6", bgDeep: "#FCF0E8", card: "#FFFFFF", white: "#FFFFFF", inputBg: "#FFF8F3",
    border: "#F5E5DB", shadow: "rgba(210,140,100,0.12)", text: "#3A2A22", textMid: "#6E584C", textSoft: "#7E665A", ink: "#2E231D",
    petal: "#FBDCCB", accentInk: "#A5552E", accentDeep: "#874423", accentMid: "#C27650",
    lavender: "#FFF2EA", lavenderDeep: "#F6D5C3", rose: "#FFF4EE", roseDeep: "#F3CDB9",
  },
  ocean: {
    page: "#E2EDF6", bg: "#F8FBFE", bgDeep: "#EDF4FA", card: "#FFFFFF", white: "#FFFFFF", inputBg: "#F6FAFD",
    border: "#E0EBF4", shadow: "rgba(100,150,200,0.12)", text: "#22303B", textMid: "#4E6170", textSoft: "#5C7181", ink: "#1C2730",
    petal: "#D3E6F4", accentInk: "#2F6A92", accentDeep: "#245273", accentMid: "#4F87AE",
    lavender: "#EEF5FB", lavenderDeep: "#CDE0EF", rose: "#F1F7FC", roseDeep: "#C9DDEE",
  },
};

const DARK: Record<PaletteId, PaletteTones> = {
  ballet: {
    page: "#120D10", bg: "#1A1417", bgDeep: "#231B1F", card: "#261E22", white: "#2E252A", inputBg: "#211A1E",
    border: "#3A2F35", shadow: "rgba(0,0,0,0.35)", text: "#F6EAEF", textMid: "#D8C5CE", textSoft: "#B8A3AE", ink: "#0E0A0C",
    petal: "#6E3A50", accentInk: "#F2A7BE", accentDeep: "#F8C6D5", accentMid: "#C7728F",
    lavender: "#33232B", lavenderDeep: "#5A3848", rose: "#2E2027", roseDeep: "#4E3240",
  },
  matcha: {
    page: "#0D120F", bg: "#141A16", bgDeep: "#1B231E", card: "#1E2721", white: "#252F28", inputBg: "#19211C",
    border: "#304036", shadow: "rgba(0,0,0,0.35)", text: "#E8F3EB", textMid: "#C2D6C8", textSoft: "#9FB8A8", ink: "#0A0E0B",
    petal: "#2F5A3B", accentInk: "#9FD6AE", accentDeep: "#C2E8CC", accentMid: "#6BA87C",
    lavender: "#22322A", lavenderDeep: "#36503F", rose: "#1F2D25", roseDeep: "#344B3C",
  },
  lilac: {
    page: "#100D16", bg: "#17131F", bgDeep: "#1F1A29", card: "#221C2D", white: "#2A2336", inputBg: "#1D1826",
    border: "#382F47", shadow: "rgba(0,0,0,0.35)", text: "#EFEAF8", textMid: "#CFC6E2", textSoft: "#ADA2C6", ink: "#0C0A11",
    petal: "#4C3A7A", accentInk: "#C3B2F0", accentDeep: "#DCD1F7", accentMid: "#9A84D6",
    lavender: "#2B2240", lavenderDeep: "#463863", rose: "#261F37", roseDeep: "#41355C",
  },
  peach: {
    page: "#130E0B", bg: "#1B1512", bgDeep: "#241C18", card: "#28201B", white: "#302620", inputBg: "#221A16",
    border: "#3E322B", shadow: "rgba(0,0,0,0.35)", text: "#F7ECE6", textMid: "#DCC8BD", textSoft: "#BCA698", ink: "#0E0A08",
    petal: "#6E3E26", accentInk: "#F4B08C", accentDeep: "#F9CDB5", accentMid: "#C9805B",
    lavender: "#352720", lavenderDeep: "#593F31", rose: "#30231D", roseDeep: "#4F3A2E",
  },
  ocean: {
    page: "#0C1116", bg: "#12181F", bgDeep: "#19212A", card: "#1C252F", white: "#232D38", inputBg: "#17202A",
    border: "#2E3B48", shadow: "rgba(0,0,0,0.35)", text: "#E8F1F8", textMid: "#C2D3E1", textSoft: "#9EB3C5", ink: "#090D11",
    petal: "#2A4E6B", accentInk: "#9CCBEF", accentDeep: "#C3E0F6", accentMid: "#5F98C2",
    lavender: "#1F2E3C", lavenderDeep: "#33495E", rose: "#1C2A37", roseDeep: "#2F4558",
  },
};

/** Colours shared by every palette (food, macro and status colours). */
const SHARED = {
  light: {
    sage: "#EEF7F0", sageDeep: "#D2EAD8", butter: "#FFF8E8", butterDeep: "#F8E4AE",
    peach: "#FFF1EA", peachDeep: "#F8D3C1", sky: "#EEF5FA", skyDeep: "#CFE3F0",
    navIcon: "#E9D9E0", danger: "#C05070",
    accCarbs: "#8A6A12", accFats: "#A65A33", accSugar: "#9A4F78", accFiber: "#3F7A4E", accWater: "#2F6A92",
  },
  dark: {
    sage: "#1C2A21", sageDeep: "#2D4434", butter: "#2A2416", butterDeep: "#4A3F1E",
    peach: "#2E211B", peachDeep: "#4D3428", sky: "#18232D", skyDeep: "#2A3E4F",
    navIcon: "#B9A9B1", danger: "#FF8FA8",
    accCarbs: "#E6C873", accFats: "#F0A982", accSugar: "#E6A6CC", accFiber: "#9FD6AE", accWater: "#9CCBEF",
  },
};

/** Phase colours: `color` (borders, rings), `bg` (cards), `text` (on bg), `ground` (home tint), `arc`/`mark` (cycle ring). */
const PHASES: Record<"light" | "dark", Record<PhaseId, { color: string; bg: string; text: string; ground: string; arc: string; mark: string }>> = {
  light: {
    menstrual:  { color: "#F4BBC6", bg: "#FDF1F3", text: "#A33D5A", ground: "#FFF7F8", arc: "#F7CBD5", mark: "#E59AAD" },
    follicular: { color: "#C2E2CB", bg: "#F3FAF5", text: "#336B43", ground: "#F9FCF9", arc: "#D2EAD8", mark: "#97C9A5" },
    ovulation:  { color: "#F5DE9C", bg: "#FFFAEE", text: "#7E5C10", ground: "#FFFCF5", arc: "#F8E4AE", mark: "#DDBB63" },
    luteal:     { color: "#DDD3F1", bg: "#F8F5FC", text: "#5E4592", ground: "#FBFAFE", arc: "#E4DDF4", mark: "#B7A8E0" },
  },
  dark: {
    menstrual:  { color: "#7A3D4F", bg: "#2E1F25", text: "#F5B5C5", ground: "#1D1418", arc: "#7A4052", mark: "#E58FA6" },
    follicular: { color: "#4A7A58", bg: "#1D2A21", text: "#A8DDB6", ground: "#151B17", arc: "#3E6B4B", mark: "#8CCB9E" },
    ovulation:  { color: "#8A7333", bg: "#2A2414", text: "#EED68A", ground: "#1C1A12", arc: "#7A6630", mark: "#E3C566" },
    luteal:     { color: "#6A5A99", bg: "#241F33", text: "#CBBDF2", ground: "#18151F", arc: "#5A4C85", mark: "#B5A3EA" },
  },
};

const PHASE_IDS: PhaseId[] = ["menstrual", "follicular", "ovulation", "luteal"];

/** camelCase token name → CSS variable name ("accentInk" → "--accent-ink"). */
export const cssVar = (name: string) => "--" + name.replace(/[A-Z]/g, m => "-" + m.toLowerCase());

/** All token values for a palette and mode, keyed by token name (see `C` in theme.ts). */
export function themeTokens(palette: PaletteId, dark: boolean): Record<string, string> {
  const mode = dark ? "dark" : "light";
  const tones = (dark ? DARK : LIGHT)[palette] ?? LIGHT.ballet;
  const out: Record<string, string> = { ...tones, ...SHARED[mode], accProtein: tones.accentInk };
  for (const id of PHASE_IDS) {
    const p = PHASES[mode][id];
    out[`ph${cap(id)}Color`] = p.color;
    out[`ph${cap(id)}Bg`] = p.bg;
    out[`ph${cap(id)}Text`] = p.text;
    out[`ph${cap(id)}Ground`] = p.ground;
    out[`ph${cap(id)}Arc`] = p.arc;
    out[`ph${cap(id)}Mark`] = p.mark;
  }
  return out;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Whether a mode setting resolves to dark right now. */
export function isDark(mode: ModeSetting, systemDark: boolean): boolean {
  return mode === "dark" || (mode === "system" && systemDark);
}

/** Writes the tokens onto <html> as CSS variables and updates the browser bar colour. */
export function applyTheme(a: Appearance, systemDark: boolean): void {
  if (typeof document === "undefined") return;
  const dark = isDark(a.mode, systemDark);
  const tokens = themeTokens(a.palette, dark);
  const root = document.documentElement;
  for (const [k, v] of Object.entries(tokens)) root.style.setProperty(cssVar(k), v);
  root.style.colorScheme = dark ? "dark" : "light";
  root.dataset.mode = dark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", tokens.bg);
}

/** Reads a stored appearance, keeping only known values. */
export function parseAppearance(raw: unknown): Appearance {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof Appearance, unknown>>;
  return {
    palette: PALETTES.some(p => p.id === r.palette) ? (r.palette as PaletteId) : DEFAULT_APPEARANCE.palette,
    mode: r.mode === "light" || r.mode === "dark" || r.mode === "system" ? r.mode : DEFAULT_APPEARANCE.mode,
    mascot: MASCOTS.some(m => m.id === r.mascot) ? (r.mascot as MascotStyle) : DEFAULT_APPEARANCE.mascot,
  };
}
