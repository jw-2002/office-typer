// Plays a song from tracks.ts with the Web Audio API: a squelchy filtered bass plus drums made from tones and noise.
// It schedules a little ahead of the clock, which keeps the beat steady even when the page is busy drawing.
import { STEPS, hitAt, type TrackSpec } from "./tracks";

/** The parts of the audio setup the player needs. */
export type MusicAudio = { ctx: AudioContext; noise: AudioBuffer; musicBus: GainNode };

export type MusicPlayer = {
  /** Starts a song (replacing any that is playing), or stops the music with null. */
  play: (track: TrackSpec | null) => void;
};

/** How far ahead of now, in seconds, steps are scheduled, and how often the scheduler wakes up. */
const LOOKAHEAD_SECONDS = 0.15;
const TICK_MS = 30;

/** A drum or bass sound that jumps to `peak` and dies away over `seconds`. */
function burst(audio: MusicAudio, at: number, peak: number, seconds: number): GainNode {
  const node = audio.ctx.createGain();
  node.gain.setValueAtTime(0.0001, at);
  node.gain.linearRampToValueAtTime(peak, at + 0.003);
  node.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
  node.connect(audio.musicBus);
  return node;
}

function kick(audio: MusicAudio, at: number, level: number) {
  const oscillator = audio.ctx.createOscillator();
  oscillator.frequency.setValueAtTime(150, at);
  oscillator.frequency.exponentialRampToValueAtTime(42, at + 0.12);
  oscillator.connect(burst(audio, at, 0.9 * level, 0.28));
  oscillator.start(at);
  oscillator.stop(at + 0.3);
}

/** A burst of filtered noise: used for hats (high) and claps (middle). */
function noise(
  audio: MusicAudio,
  at: number,
  type: BiquadFilterType,
  frequency: number,
  peak: number,
  seconds: number,
) {
  const source = audio.ctx.createBufferSource();
  source.buffer = audio.noise;
  const filter = audio.ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  source.connect(filter).connect(burst(audio, at, peak, seconds));
  source.start(at);
  source.stop(at + seconds + 0.02);
}

function clap(audio: MusicAudio, at: number, level: number) {
  // Three quick bursts, like several hands that are nearly together.
  [0, 0.012, 0.026].forEach((offset) => noise(audio, at + offset, "bandpass", 1500, 0.35 * level, 0.1));
}

/** One bass note through a resonant low-pass filter that opens and closes: the squelch. */
function bassNote(
  audio: MusicAudio,
  track: TrackSpec,
  at: number,
  seconds: number,
  semitones: number,
  previous: number | null,
  accent: boolean,
) {
  const { ctx } = audio;
  const frequency = track.rootHz * 2 ** (semitones / 12);
  const oscillator = ctx.createOscillator();
  oscillator.type = track.wave;
  // A slide starts from the note before and glides into this one.
  if (previous !== null) {
    oscillator.frequency.setValueAtTime(track.rootHz * 2 ** (previous / 12), at);
    oscillator.frequency.exponentialRampToValueAtTime(frequency, at + seconds * 0.5);
  } else {
    oscillator.frequency.setValueAtTime(frequency, at);
  }

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = track.filter.resonance;
  const peak = track.filter.peak * (accent ? 1.5 : 1);
  filter.frequency.setValueAtTime(peak, at);
  filter.frequency.exponentialRampToValueAtTime(track.filter.base, at + track.filter.decay + (accent ? 0.05 : 0));

  const gain = ctx.createGain();
  const level = (accent ? 0.34 : 0.24) * track.level;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(level, at + 0.005);
  gain.gain.setValueAtTime(level, at + seconds * 0.8);
  gain.gain.linearRampToValueAtTime(0.0001, at + seconds);

  oscillator.connect(filter).connect(gain).connect(audio.musicBus);
  oscillator.start(at);
  oscillator.stop(at + seconds + 0.02);
}

export function createMusicPlayer(getAudio: () => MusicAudio | null): MusicPlayer {
  let timer: ReturnType<typeof setInterval> | null = null;

  const stop = () => {
    if (timer !== null) clearInterval(timer);
    timer = null;
  };

  return {
    play(track) {
      stop();
      const audio = track ? getAudio() : null;
      if (!track || !audio) return;

      const stepSeconds = 60 / track.bpm / 4;
      let step = 0;
      let nextAt = audio.ctx.currentTime + 0.05;
      let lastNote: number | null = null;

      const schedule = (index: number, base: number) => {
        // Every second step is a little late: that is the swing.
        const at = base + (index % 2 === 1 ? track.swing * stepSeconds : 0);
        const slot = index % STEPS;
        if (hitAt(track.kick, slot)) kick(audio, at, track.level);
        if (hitAt(track.hat, slot)) noise(audio, at, "highpass", 7500, 0.07 * track.level, 0.04);
        if (hitAt(track.openHat, slot)) noise(audio, at, "highpass", 6500, 0.08 * track.level, 0.14);
        if (hitAt(track.clap, slot)) clap(audio, at, track.level);

        const semitones = track.bass[slot];
        if (semitones === null) {
          lastNote = null;
          return;
        }
        const slide = hitAt(track.slides, slot) && lastNote !== null;
        bassNote(
          audio,
          track,
          at,
          stepSeconds * (slide ? 1.1 : 0.85),
          semitones,
          slide ? lastNote : null,
          hitAt(track.accents, slot),
        );
        lastNote = semitones;
      };

      timer = setInterval(() => {
        while (nextAt < audio.ctx.currentTime + LOOKAHEAD_SECONDS) {
          schedule(step, nextAt);
          step += 1;
          nextAt += stepSeconds;
        }
      }, TICK_MS);
    },
  };
}
