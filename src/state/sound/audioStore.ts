// The sound settings (muted or not, volume, which song plays), in a small store so the monitor's separate React root can read them too.
import { create } from "zustand";
import { clamp01 } from "@/game/utils/math";
import { readStored, writeStored } from "@/state/storage";

const MUTED_KEY = "office-typer.muted";
const VOLUME_KEY = "office-typer.volume";
const TRACK_KEY = "office-typer.track";
/** The free song that plays until the player picks another or switches the music off. */
export const DEFAULT_TRACK = "track-hold";

/** A stored volume from 0 to 1, or full volume when there is none or it is nonsense. */
function readVolume(): number {
  const stored = Number(readStored(VOLUME_KEY) ?? "1");
  return Number.isFinite(stored) ? clamp01(stored) : 1;
}

type AudioStore = {
  muted: boolean;
  /** Master volume from 0 to 1. */
  volume: number;
  /** The song that is playing (an upgrade id), or null for no music. Starts with the free song; the others are bought in the shop. */
  track: string | null;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setTrack: (track: string | null) => void;
};

export const useAudioStore = create<AudioStore>()((set) => ({
  muted: readStored(MUTED_KEY) === "true",
  volume: readVolume(),
  // Nothing stored means the player has not chosen yet, so the free song plays. A stored empty text means off.
  track: ((stored) => (stored === null ? DEFAULT_TRACK : stored || null))(readStored(TRACK_KEY)),
  setMuted: (muted) => {
    set({ muted });
    writeStored(MUTED_KEY, String(muted));
  },
  setVolume: (volume) => {
    const clamped = clamp01(volume);
    set({ volume: clamped });
    writeStored(VOLUME_KEY, String(clamped));
  },
  setTrack: (track) => {
    set({ track });
    writeStored(TRACK_KEY, track ?? "");
  },
}));
