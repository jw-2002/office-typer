// The sound recipe for each key switch. A key press is a burst of filtered noise (the "clack"), a low tone
// (the "thock" of the case), and for some switches a sharp extra "click". Keyed by upgrade id, so a new
// switch will not compile until it has a sound.
import type { SwitchId } from "@/game/data/upgrades";

export type KeySound = {
  /** Centre frequency of the noisy clack, in Hz. Higher sounds sharper. */
  clack: number;
  /** How narrow the clack is. Higher is more tonal. */
  clackQ: number;
  /** How long the clack lasts, in seconds. */
  decay: number;
  /** Frequency of the low thock, in Hz. */
  body: number;
  bodyGain: number;
  /** A sharp extra click, for tactile and clicky switches. */
  click?: { frequency: number; gain: number; delay: number };
  volume: number;
};

export const switchSounds = {
  mushy: { clack: 500, clackQ: 0.8, decay: 0.06, body: 110, bodyGain: 0.5, volume: 0.5 },
  strawberry: { clack: 900, clackQ: 1, decay: 0.045, body: 170, bodyGain: 0.45, volume: 0.55 },
  chestnut: {
    clack: 1300,
    clackQ: 1.2,
    decay: 0.05,
    body: 210,
    bodyGain: 0.4,
    click: { frequency: 2200, gain: 0.25, delay: 0.012 },
    volume: 0.6,
  },
  blueberry: {
    clack: 2600,
    clackQ: 2,
    decay: 0.035,
    body: 240,
    bodyGain: 0.3,
    click: { frequency: 4300, gain: 0.6, delay: 0.004 },
    volume: 0.7,
  },
} as const satisfies Record<SwitchId, KeySound>;
