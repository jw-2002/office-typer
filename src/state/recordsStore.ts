// Records that survive starting a new game: the fastest time anyone has been made redundant. Kept in localStorage.
import { create } from "zustand";

const RECORD_KEY = "office-typer.fastest";

function readFastest(): number | null {
  try {
    const stored = Number(window.localStorage.getItem(RECORD_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  } catch {
    return null;
  }
}

type RecordsStore = {
  /** The shortest run so far, in seconds, or null if no game has been finished. */
  fastestSeconds: number | null;
  /** Remembers a finished run if it beat the record. Returns true if it did. Safe to call twice for the same run. */
  recordRun: (seconds: number) => boolean;
};

export const useRecordsStore = create<RecordsStore>()((set, get) => ({
  fastestSeconds: readFastest(),
  recordRun: (seconds) => {
    const best = get().fastestSeconds;
    if (best !== null && seconds >= best) return false;
    set({ fastestSeconds: seconds });
    try {
      window.localStorage.setItem(RECORD_KEY, String(seconds));
    } catch {
      // Storage blocked: the record just will not be remembered.
    }
    return true;
  },
}));
