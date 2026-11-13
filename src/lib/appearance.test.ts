import { describe, expect, it } from "vitest";
import { C } from "../theme";
import { DEFAULT_APPEARANCE, PALETTES, cssVar, isDark, parseAppearance, themeTokens } from "./appearance";

// WCAG contrast ratio between two #RRGGBB colours.
function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const COMBOS = PALETTES.flatMap(p => [false, true].map(dark => ({ id: p.id, dark, t: themeTokens(p.id, dark) })));

describe("themeTokens", () => {
  it("defines a value for every token the app uses", () => {
    const used = Object.values(C).map(v => String(v).match(/^var\((--[a-z0-9-]+)\)$/)?.[1]).filter(Boolean);
    for (const { t } of COMBOS) {
      const defined = new Set(Object.keys(t).map(cssVar));
      for (const name of used) expect(defined.has(name!), name).toBe(true);
    }
  });

  it.each(COMBOS)("keeps text readable in $id (dark: $dark)", ({ t }) => {
    expect(contrast(t.text, t.bg)).toBeGreaterThanOrEqual(7);
    expect(contrast(t.text, t.card)).toBeGreaterThanOrEqual(7);
    expect(contrast(t.textMid, t.card)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.textSoft, t.card)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.textSoft, t.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.accentInk, t.card)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.accentInk, t.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.accentDeep, t.lavender)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.text, t.petal)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.accentInk, t.rose)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(COMBOS)("keeps food and phase colours readable in $id (dark: $dark)", ({ t }) => {
    expect(contrast(t.accFiber, t.sage)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.accCarbs, t.butter)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.accFats, t.peach)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.accWater, t.sky)).toBeGreaterThanOrEqual(4.5);
    for (const p of ["Menstrual", "Follicular", "Ovulation", "Luteal"]) {
      expect(contrast(t[`ph${p}Text`], t[`ph${p}Bg`]), p).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("isDark", () => {
  it("follows the setting, or the device for system", () => {
    expect(isDark("dark", false)).toBe(true);
    expect(isDark("light", true)).toBe(false);
    expect(isDark("system", true)).toBe(true);
    expect(isDark("system", false)).toBe(false);
  });
});

describe("parseAppearance", () => {
  it("falls back to defaults for missing or unknown values", () => {
    expect(parseAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance({ palette: "neon", mode: "dim", mascot: "dragon" })).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance({ palette: "matcha", mode: "dark", mascot: "buff" })).toEqual({ palette: "matcha", mode: "dark", mascot: "buff" });
  });
});
