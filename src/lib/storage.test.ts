import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { load, save } from "./storage";

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

describe("storage helpers", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("load returns the fallback when the key is missing", () => {
    expect(load("missing", 42)).toBe(42);
    const fallback = { a: 1 };
    expect(load("missing", fallback)).toBe(fallback);
  });

  it("load returns the fallback for invalid JSON", () => {
    localStorage.setItem("bad", "{not json");
    expect(load("bad", ["fallback"])).toEqual(["fallback"]);
  });

  it("load returns the fallback for an empty stored string", () => {
    localStorage.setItem("empty", "");
    expect(load("empty", "fb")).toBe("fb");
  });

  it("load returns stored JSON values, including falsy ones", () => {
    localStorage.setItem("n", "0");
    localStorage.setItem("f", "false");
    localStorage.setItem("nul", "null");
    expect(load("n", 28)).toBe(0);
    expect(load("f", true)).toBe(false);
    expect(load<string | null>("nul", "fb")).toBeNull();
  });

  it("save + load round-trips JSON", () => {
    const schedule = { "2026-07-15": [{ name: "Walk", emoji: "🏋️" }], "2026-07-16": "rest" };
    save("schedule", schedule);
    expect(localStorage.getItem("schedule")).toBe(JSON.stringify(schedule));
    expect(load("schedule", {})).toEqual(schedule);
  });

  it("load returns the fallback when localStorage throws", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("SecurityError"); } });
    expect(load("x", "fb")).toBe("fb");
  });

  it("save swallows storage errors", () => {
    vi.stubGlobal("localStorage", { setItem: () => { throw new Error("QuotaExceededError"); } });
    expect(() => save("x", { big: true })).not.toThrow();
  });
});
