import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cachedFormTips, findLibraryWorkout, builtInGuide, FORM_TIPS_KEY, formVideoUrl, MAX_CACHED_TIPS, parseFormTips, rememberFormTips, tipsKey } from "./formTips";
import { ALL_WORKOUTS } from "../data/workouts";
import { WORKOUT_GUIDES } from "../data/workoutGuides";
import { WORKOUT_IMAGES } from "../data/workoutImages";

const REPLY = `CUES:
1. Brace your core.
2. Keep your knees soft.
3. Move slowly.
AVOID: Rushing the reps. Slow down.
HELPS: Builds strength. Worth doing.`;

describe("parseFormTips", () => {
  it("parses the structured reply", () => {
    expect(parseFormTips(REPLY)).toEqual({
      cues: ["Brace your core.", "Keep your knees soft.", "Move slowly."],
      mistake: "Rushing the reps. Slow down.",
      helps: "Builds strength. Worth doing.",
    });
  });

  it("tolerates bullets, bold, lower-case headers, wrapped lines and extra cues", () => {
    const text = "**Cues:**\n- Stand tall\n  with soft knees\n* Breathe out to lift\n2) Lower slowly\n4. Extra\n\nmistake: Arching\nyour back.\r\nHelps: Stronger glutes.";
    expect(parseFormTips(text)).toEqual({
      cues: ["Stand tall with soft knees", "Breathe out to lift", "Lower slowly"],
      mistake: "Arching your back.",
      helps: "Stronger glutes.",
    });
  });

  it("accepts a cue on the header line", () => {
    expect(parseFormTips("CUES: 1. One\nAVOID: x\nHELPS: y")?.cues).toEqual(["One"]);
  });

  it("returns null when a section is missing", () => {
    expect(parseFormTips("")).toBeNull();
    expect(parseFormTips("CUES:\n1. a\nAVOID: b")).toBeNull();
    expect(parseFormTips("AVOID: b\nHELPS: c")).toBeNull();
    expect(parseFormTips("Sorry, I can't help with that.")).toBeNull();
  });
});

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => { data.delete(k); },
    setItem: (k, v) => { data.set(k, String(v)); },
  };
}

describe("form tips cache", () => {
  beforeEach(() => { vi.stubGlobal("localStorage", memoryStorage()); });
  afterEach(() => { vi.unstubAllGlobals(); });
  const tips = { cues: ["a"], mistake: "b", helps: "c" };

  it("keys by normalised name", () => {
    expect(tipsKey("  Kettlebell   SWING ")).toBe("kettlebell swing");
    rememberFormTips("Kettlebell Swing", tips);
    expect(cachedFormTips(" kettlebell  swing")).toEqual(tips);
    expect(JSON.parse(localStorage.getItem(FORM_TIPS_KEY)!)).toEqual({ "kettlebell swing": tips });
  });

  it("ignores malformed entries and caps the cache", () => {
    localStorage.setItem(FORM_TIPS_KEY, JSON.stringify({ bad: { cues: "x" } }));
    expect(cachedFormTips("bad")).toBeNull();
    for (let i = 0; i < MAX_CACHED_TIPS + 5; i++) rememberFormTips(`w${i}`, tips);
    const stored = JSON.parse(localStorage.getItem(FORM_TIPS_KEY)!);
    expect(Object.keys(stored)).toHaveLength(MAX_CACHED_TIPS);
    expect(cachedFormTips(`w${MAX_CACHED_TIPS + 4}`)).toEqual(tips);
    expect(cachedFormTips("w0")).toBeNull();
  });
});

describe("built-in guides", () => {
  it("has guide content for every library workout", () => {
    for (const w of ALL_WORKOUTS) {
      const g = WORKOUT_GUIDES[w.id];
      expect(g, w.name).toBeDefined();
      expect(g!.cues).toHaveLength(3);
      expect(g!.mistake && g!.helps && g!.videoQuery).toBeTruthy();
    }
  });

  it("only ships https images for library workouts", () => {
    const ids = new Set(ALL_WORKOUTS.map(w => String(w.id)));
    for (const [id, img] of Object.entries(WORKOUT_IMAGES)) {
      expect(ids.has(id)).toBe(true);
      expect(img!.url.startsWith("https://")).toBe(true);
      expect(img!.source_url.startsWith("https://wger.de/")).toBe(true);
      expect(img!.author).toBeTruthy();
    }
  });

  it("finds library workouts by id or by name", () => {
    expect(findLibraryWorkout({ id: 2, name: "x" })?.name).toBe("Barbell Squat");
    expect(findLibraryWorkout({ name: " barbell squat " })?.id).toBe(2);
    expect(findLibraryWorkout({ name: "Kettlebell swing" })).toBeUndefined();
    expect(builtInGuide(undefined)).toEqual({});
  });

  it("builds a YouTube form search", () => {
    expect(formVideoUrl("Hip Thrust")).toBe("https://www.youtube.com/results?search_query=Hip%20Thrust%20proper%20form");
    expect(formVideoUrl("x", "barbell back squat proper form")).toBe("https://www.youtube.com/results?search_query=barbell%20back%20squat%20proper%20form");
  });
});
