// The display settings (reduced motion, larger text, graphics quality), kept in this browser. A small store so the
// monitor's separate React root and the 3D scene can both read them.
import { create } from "zustand";

const KEY = "office-typer.display";

export type Quality = "high" | "low";

export type DisplaySettings = {
  /** No camera glide, floating dust or steam, and no animated screen changes. Starts on if the OS asks for it. */
  reducedMotion: boolean;
  /** Bigger assignment text. */
  largeText: boolean;
  /** Low turns down shadows, glow and sharpness for a slower computer. */
  quality: Quality;
};

/** Turns stored text into settings, repairing anything wrong. `prefersReduced` is the browser's own reduced-motion setting. */
export function parseDisplaySettings(raw: string | null, prefersReduced: boolean): DisplaySettings {
  let stored: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(raw ?? "{}");
    if (typeof parsed === "object" && parsed !== null) stored = parsed as Record<string, unknown>;
  } catch {
    // Damaged: use the defaults.
  }
  return {
    reducedMotion: typeof stored.reducedMotion === "boolean" ? stored.reducedMotion : prefersReduced,
    largeText: stored.largeText === true,
    quality: stored.quality === "low" ? "low" : "high",
  };
}

function readDisplaySettings(): DisplaySettings {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // Storage blocked: use the defaults.
  }
  const prefersReduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return parseDisplaySettings(raw, prefersReduced);
}

type DisplayStore = DisplaySettings & {
  set: (changes: Partial<DisplaySettings>) => void;
};

export const useDisplayStore = create<DisplayStore>()((set, get) => ({
  ...readDisplaySettings(),
  set: (changes) => {
    set(changes);
    const { reducedMotion, largeText, quality } = get();
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ reducedMotion, largeText, quality }));
    } catch {
      // Storage blocked: the setting just will not be remembered.
    }
  },
}));
