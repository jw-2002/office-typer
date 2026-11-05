// A way for 3D objects and other parts of the app to ask for a sound without owning the sound player, which lives in
// KeySounds. Calling play() makes the player hear a cue once. Not saved.
import { create } from "zustand";

export type SoundCue = "squeak" | "quack" | "clunk" | "ping";

type SoundCueStore = {
  /** The latest cue. `count` goes up for every play, so asking for the same sound twice in a row still counts. */
  cue: { name: SoundCue; count: number } | null;
  play: (name: SoundCue) => void;
};

export const useSoundCueStore = create<SoundCueStore>()((set, get) => ({
  cue: null,
  play: (name) => set({ cue: { name, count: (get().cue?.count ?? 0) + 1 } }),
}));
