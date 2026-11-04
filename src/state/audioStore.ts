// The sound setting (muted or not), in a small store so the monitor's separate React root can read it too.
import { create } from "zustand";

const MUTED_KEY = "office-typer.muted";

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTED_KEY) === "true";
  } catch {
    return false;
  }
}

type AudioStore = { muted: boolean; setMuted: (muted: boolean) => void };

export const useAudioStore = create<AudioStore>()((set) => ({
  muted: readMuted(),
  setMuted: (muted) => {
    set({ muted });
    try {
      window.localStorage.setItem(MUTED_KEY, String(muted));
    } catch {
      // Storage blocked: the setting just will not be remembered.
    }
  },
}));
