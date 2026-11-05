// Records that survive starting a new game: the fastest time anyone has been made redundant. Kept in localStorage.
import { create } from "zustand";
import { readStored, writeStored } from "@/state/storage";

const RECORD_KEY = "office-typer.fastest";

function readFastest(): number | null {
  const stored = Number(readStored(RECORD_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : null;
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
    writeStored(RECORD_KEY, String(seconds));
    return true;
  },
}));
