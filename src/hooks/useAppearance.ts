import { useSyncExternalStore } from "react";
import { applyTheme, parseAppearance, type Appearance } from "../lib/appearance";
import { load, save } from "../lib/storage";

// The appearance lives in one small store so the mascot and Settings stay in step,
// and the theme is applied before the first render (see initAppearance in main.tsx).
const KEY = "appearance";
let current: Appearance = parseAppearance(load<unknown>(KEY, null));
const listeners = new Set<() => void>();
const media = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

const emit = () => listeners.forEach(l => l());

/** Applies the saved theme and follows the device's light/dark setting when "system" is chosen. */
export function initAppearance(): void {
  applyTheme(current, !!media?.matches);
  media?.addEventListener?.("change", () => { applyTheme(current, media.matches); emit(); });
}

export function setAppearance(patch: Partial<Appearance>): void {
  current = { ...current, ...patch };
  save(KEY, current);
  applyTheme(current, !!media?.matches);
  emit();
}

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function useAppearance(): Appearance {
  return useSyncExternalStore(subscribe, () => current, () => current);
}
