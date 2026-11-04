// The songs you can unlock: each is a looping 16-step pattern in the style of an old acid bass machine (a squelchy bass
// line, a kick, hats and claps). Keyed by upgrade id, so a song added to the shop will not compile until it has a track.
import type { MusicId } from "@/game/data/upgrades";

/** Steps in one bar. Every pattern below has exactly this many. */
export const STEPS = 16;

export type TrackSpec = {
  bpm: number;
  /** Frequency of the bass root note, in Hz. The bass line is in semitones above it. */
  rootHz: number;
  /** The bass wave: saw is buzzy, square is hollow, triangle is soft. */
  wave: OscillatorType;
  /** The bass line: semitones above the root for each step, or null for a rest. */
  bass: readonly (number | null)[];
  /** Steps (written as x and .) where the bass note is accented: louder and brighter. */
  accents: string;
  /** Steps where the bass slides up or down into the note from the one before, like the 303's slide. */
  slides: string;
  /** The filter that makes the squelch: it opens to `peak` on each note and closes to `base`. */
  filter: { base: number; peak: number; resonance: number; decay: number };
  /** Kick drum, closed hat, open hat and clap steps (x is a hit). */
  kick: string;
  hat: string;
  openHat: string;
  clap: string;
  /** How late every second step is, as a fraction of a step (0 is straight, 0.3 is very bouncy). */
  swing: number;
  /** Overall loudness of the song. */
  level: number;
};

export const musicTracks = {
  "track-upbeat": {
    bpm: 126,
    rootHz: 55,
    wave: "sawtooth",
    bass: [0, null, 0, 12, 0, null, 3, null, 0, 0, 12, null, 7, null, 3, 5],
    accents: "x..x..x...x..x..",
    slides: "...x.......x....",
    filter: { base: 280, peak: 2600, resonance: 14, decay: 0.2 },
    kick: "x...x...x...x...",
    hat: "x.x.x.x.x.x.x.x.",
    openHat: "..x...x...x...x.",
    clap: "....x.......x...",
    swing: 0,
    level: 1,
  },
  "track-chill": {
    bpm: 78,
    rootHz: 55,
    wave: "triangle",
    bass: [0, null, null, null, 7, null, null, 5, null, null, 3, null, null, null, 5, null],
    accents: "x.......x.......",
    slides: "........x.....x.",
    filter: { base: 220, peak: 900, resonance: 5, decay: 0.45 },
    kick: "x.....x...x.....",
    hat: "x.x.x.x.x.x.x.x.",
    openHat: "................",
    clap: "........x.......",
    swing: 0.18,
    level: 0.75,
  },
  "track-funky": {
    bpm: 106,
    rootHz: 55,
    wave: "square",
    bass: [0, null, 0, null, 3, null, 0, 5, null, 0, null, 7, null, 5, 3, null],
    accents: "x...x..x...x.x..",
    slides: "......x.......x.",
    filter: { base: 320, peak: 2000, resonance: 9, decay: 0.14 },
    kick: "x..x..x...x.x...",
    hat: "xxxxxxxxxxxxxxxx",
    openHat: "......x.......x.",
    clap: "....x.......x..x",
    swing: 0.12,
    level: 0.9,
  },
} as const satisfies Record<MusicId, TrackSpec>;

const tracksById: Readonly<Record<string, TrackSpec>> = musicTracks;

/** The song for a shop id, or null when there is none (including for null, meaning no music). */
export function trackFor(id: string | null): TrackSpec | null {
  return (id !== null && tracksById[id]) || null;
}

/** Whether a pattern string has a hit on this step. */
export const hitAt = (pattern: string, step: number): boolean => pattern[step % STEPS] === "x";
