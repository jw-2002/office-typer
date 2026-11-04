// The songs you can unlock, and the goblin mode battle theme: each is a looping pattern of 16-step bars in the style of an old acid bass machine (a squelchy bass
// line, a kick, hats and claps). Keyed by upgrade id, so a song added to the shop will not compile until it has a track.
import type { MusicId } from "@/game/data/upgrades";

/** Steps in one bar. Every pattern is one or more whole bars long, and all the patterns of a track are the same length. */
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
  /** An optional lead tune over the top: a bright, slightly out-of-tune pair of square waves with a wobble. */
  lead?: {
    /** Semitones above the bass root for each step, or null for a rest. As long as the bass line. */
    notes: readonly (number | null)[];
    /** Steps (x) where the note glides up or down into the next one from the one before. */
    slides: string;
    level: number;
  };
};

export const musicTracks = {
  // The free song that plays from the start: gentle, slow lift music with a simple tune on top.
  "track-hold": {
    bpm: 92,
    rootHz: 65.41,
    wave: "triangle",
    bass: [0, null, null, null, 7, null, null, null, 5, null, null, null, 7, null, 4, null],
    accents: "x.......x.......",
    slides: "..............x.",
    filter: { base: 300, peak: 900, resonance: 2, decay: 0.3 },
    kick: "x.......x.......",
    hat: "..x...x...x...x.",
    openHat: "................",
    clap: "................",
    swing: 0.1,
    level: 0.6,
    lead: {
      // prettier-ignore
      notes: [24, null, 28, null, 31, null, 28, null, 29, null, 28, null, 26, null, 24, null],
      slides: "................",
      level: 0.6,
    },
  },
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
    // Higher than the other songs' bass: a perfect fifth up from A.
    rootHz: 82.41,
    wave: "triangle",
    bass: [0, null, null, null, 7, null, null, 5, null, null, 3, null, null, null, 5, null],
    accents: "x.......x.......",
    slides: "........x.....x.",
    filter: { base: 300, peak: 1300, resonance: 5, decay: 0.45 },
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

/**
 * The goblin mode battle theme (not for sale): fast and frantic, in a minor key with a nervous flat second. A galloping
 * bass, a pounding kick, a hat on every step and a wobbling lead that races up and down. Two bars long.
 */
export const GOBLIN_TRACK_ID = "goblin-mode";
const goblinTrack: TrackSpec = {
  bpm: 172,
  rootHz: 55,
  wave: "sawtooth",
  // prettier-ignore
  bass: [
    0, null, 0, 12, 0, null, 13, 12, 0, null, 0, 12, 3, null, 1, 0,
    0, null, 0, 12, 0, null, 13, 12, 7, null, 8, 7, 5, null, 3, 1,
  ],
  accents: "x..x..x.x..x..x.x..x..x.x..x.x.x",
  slides: "......x.......x.......x.......x.",
  filter: { base: 400, peak: 3200, resonance: 10, decay: 0.12 },
  kick: "x..xx..xx..xx..xx..xx..xx..xx.xx",
  hat: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  openHat: "..x...x...x...x...x...x...x...xx",
  clap: "....x.......x..x....x.......x.x.",
  swing: 0,
  level: 1,
  lead: {
    // prettier-ignore
    notes: [
      24, null, 27, null, 26, 24, null, 22, 24, null, 27, 28, 27, 26, 24, null,
      24, 27, 31, 27, 24, 27, 31, 36, 34, null, 33, null, 31, 27, 25, 24,
    ],
    slides: "......x.......x.........x.....x.",
    level: 1,
  },
};

const tracksById: Readonly<Record<string, TrackSpec>> = { ...musicTracks, [GOBLIN_TRACK_ID]: goblinTrack };

/** The song for a shop id, or null when there is none (including for null, meaning no music). */
export function trackFor(id: string | null): TrackSpec | null {
  return (id !== null && tracksById[id]) || null;
}

/** Whether a pattern string has a hit on this step. */
export const hitAt = (pattern: string, step: number): boolean => pattern[step % pattern.length] === "x";
