import { beforeEach, describe, expect, it } from "vitest";
import { applySnapshot, clearAppData, isAppKey, isSnapshot, takeSnapshot } from "./sync";

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(key: string) { return this.map.get(key) ?? null; }
  key(index: number) { return [...this.map.keys()][index] ?? null; }
  removeItem(key: string) { this.map.delete(key); }
  setItem(key: string, value: string) { this.map.set(key, value); }
}

let storage: MemoryStorage;
beforeEach(() => {
  storage = new MemoryStorage();
  storage.setItem("goals", '{"protein":120}');
  storage.setItem("user-name", '"Maya"');
  storage.setItem("sb-abc-auth-token", "session");
  storage.setItem("formly:guest", "1");
});

describe("sync helpers", () => {
  it("treats Supabase session and internal keys as non-app keys", () => {
    expect(isAppKey("goals")).toBe(true);
    expect(isAppKey("nutrition-2026-10-24")).toBe(true);
    expect(isAppKey("sb-abc-auth-token")).toBe(false);
    expect(isAppKey("formly:guest")).toBe(false);
  });

  it("snapshots only app data", () => {
    expect(takeSnapshot(storage)).toEqual({ goals: '{"protein":120}', "user-name": '"Maya"' });
  });

  it("clears app data but keeps the session", () => {
    clearAppData(storage);
    expect(storage.getItem("goals")).toBeNull();
    expect(storage.getItem("sb-abc-auth-token")).toBe("session");
    expect(storage.getItem("formly:guest")).toBe("1");
  });

  it("applying a snapshot replaces app data and ignores internal keys in it", () => {
    applySnapshot(storage, { "workout-log": "[]", "sb-evil": "x" });
    expect(takeSnapshot(storage)).toEqual({ "workout-log": "[]" });
    expect(storage.getItem("sb-evil")).toBeNull();
    expect(storage.getItem("sb-abc-auth-token")).toBe("session");
  });

  it("validates snapshots from the database", () => {
    expect(isSnapshot({ goals: "{}" })).toBe(true);
    expect(isSnapshot({ goals: 1 })).toBe(false);
    expect(isSnapshot([])).toBe(false);
    expect(isSnapshot(null)).toBe(false);
  });
});
