// Plays game sounds with the Web Audio API, built from noise and tones, so there are no sound files to load.
import { createMusicPlayer } from "./musicPlayer";
import type { KeySound } from "./switchSounds";
import type { TrackSpec } from "./tracks";

export type KeyClicker = {
  /** One key press, in the sound of the switches in use. */
  play: (sound: KeySound) => void;
  /** A short rising tune for a promotion. */
  fanfare: () => void;
  /** A slow falling tune for being made redundant. */
  redundancy: () => void;
  /** Turns the quiet hum of the office on or off. Needs a first sound (a key press) before it can start. */
  hum: (on: boolean) => void;
  /** A few quick bird calls. */
  birds: () => void;
  /** A short burst of cricket chirps. */
  crickets: () => void;
  /** A chair creaking, for standing up or sitting down. */
  creak: () => void;
  /** A little rising ping for a clean streak. The longer the streak, the higher it sounds. */
  streak: (count: number) => void;
  /** Plays a song on a loop (replacing any that is playing), or stops the music with null. Needs a first sound before it can start. */
  music: (track: TrackSpec | null) => void;
  /** Sets the master volume, from 0 to 1. */
  setVolume: (volume: number) => void;
};

const NOISE_SECONDS = 0.15;
// Each press is a little higher or lower than the last, so repeated keys do not sound like a machine.
const PITCH_JITTER = 0.1;
// C, E, G and a high C, one after another.
const FANFARE_NOTES = [523.25, 659.25, 783.99, 1046.5];
const FANFARE_STEP_SECONDS = 0.13;
// G, F, E flat and a low C, slowly: the sound of bad news.
const REDUNDANCY_NOTES = [392, 349.23, 311.13, 261.63];
const REDUNDANCY_STEP_SECONDS = 0.38;

/** The level of the music bus, kept low so it sits under the key sounds. */
const MUSIC_LEVEL = 0.4;
/** The master level at full volume. */
const MASTER_LEVEL = 0.35;

type Audio = { ctx: AudioContext; noise: AudioBuffer; master: GainNode; musicBus: GainNode };

/** A sound that jumps to `gain` and fades out over `seconds`, starting `delay` seconds from now. */
function fadingGain({ ctx, master }: Audio, gain: number, seconds: number, delay: number): GainNode {
  const start = ctx.currentTime + delay;
  const node = ctx.createGain();
  // Exponential ramps cannot reach 0, so they end just above it.
  node.gain.setValueAtTime(0, start);
  node.gain.linearRampToValueAtTime(gain, start + 0.001);
  node.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
  node.connect(master);
  return node;
}

/** A tone of one pitch, played from `delay` seconds from now and faded out over `seconds`. */
function tone(audio: Audio, type: OscillatorType, frequency: number, gain: number, seconds: number, delay: number) {
  const oscillator = audio.ctx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  oscillator.connect(fadingGain(audio, gain, seconds, delay));
  const start = audio.ctx.currentTime + delay;
  oscillator.start(start);
  oscillator.stop(start + seconds + 0.02);
}

export function createKeyClicker(): KeyClicker {
  // Browsers only allow audio after a user gesture, so nothing is created until the first sound.
  let audio: Audio | null = null;
  // The office hum is one looping noise that stays on until it is switched off.
  let humSource: AudioBufferSourceNode | null = null;
  const musicPlayer = createMusicPlayer(() => audio);
  let volume = 1;

  const start = (): Audio | null => {
    if (typeof AudioContext === "undefined") return null;
    if (!audio) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = MASTER_LEVEL * volume;
      master.connect(ctx.destination);
      const musicBus = ctx.createGain();
      musicBus.gain.value = MUSIC_LEVEL;
      musicBus.connect(master);
      const noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * NOISE_SECONDS), ctx.sampleRate);
      const samples = noise.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      audio = { ctx, noise, master, musicBus };
    }
    if (audio.ctx.state === "suspended") void audio.ctx.resume();
    return audio;
  };

  return {
    play(sound) {
      const ready = start();
      if (!ready) return;
      const pitch = 1 + (Math.random() - 0.5) * PITCH_JITTER;

      const clack = ready.ctx.createBufferSource();
      clack.buffer = ready.noise;
      const filter = ready.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = sound.clack * pitch;
      filter.Q.value = sound.clackQ;
      clack.connect(filter).connect(fadingGain(ready, sound.volume, sound.decay, 0));
      clack.start();
      clack.stop(ready.ctx.currentTime + sound.decay + 0.02);

      tone(ready, "sine", sound.body * pitch, sound.bodyGain * sound.volume, sound.decay * 1.6, 0);
      if (sound.click) {
        tone(
          ready,
          "triangle",
          sound.click.frequency * pitch,
          sound.click.gain * sound.volume,
          0.012,
          sound.click.delay,
        );
      }
    },

    fanfare() {
      const ready = start();
      if (!ready) return;
      FANFARE_NOTES.forEach((frequency, index) => {
        const last = index === FANFARE_NOTES.length - 1;
        tone(ready, "triangle", frequency, 0.5, last ? 0.9 : 0.25, index * FANFARE_STEP_SECONDS);
      });
    },

    redundancy() {
      const ready = start();
      if (!ready) return;
      REDUNDANCY_NOTES.forEach((frequency, index) => {
        const last = index === REDUNDANCY_NOTES.length - 1;
        tone(ready, "triangle", frequency, 0.45, last ? 1.6 : 0.5, index * REDUNDANCY_STEP_SECONDS);
      });
    },

    hum(on) {
      if (!on) {
        humSource?.stop();
        humSource = null;
        return;
      }
      if (humSource) return;
      const ready = start();
      if (!ready) return;
      // Looped noise with everything but the low rumble filtered out, and kept very quiet.
      const source = ready.ctx.createBufferSource();
      source.buffer = ready.noise;
      source.loop = true;
      const filter = ready.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 140;
      const level = ready.ctx.createGain();
      level.gain.value = 0.05;
      source.connect(filter).connect(level).connect(ready.master);
      source.start();
      humSource = source;
    },

    birds() {
      const ready = start();
      if (!ready) return;
      // Two to four chirps, each a quick upward slide in pitch.
      const chirps = 2 + Math.floor(Math.random() * 3);
      const base = 2600 + Math.random() * 900;
      for (let i = 0; i < chirps; i++) {
        const delay = i * 0.13;
        const oscillator = ready.ctx.createOscillator();
        oscillator.type = "sine";
        const start = ready.ctx.currentTime + delay;
        oscillator.frequency.setValueAtTime(base, start);
        oscillator.frequency.exponentialRampToValueAtTime(base * 1.5, start + 0.07);
        oscillator.connect(fadingGain(ready, 0.04, 0.09, delay));
        oscillator.start(start);
        oscillator.stop(start + 0.12);
      }
    },

    crickets() {
      const ready = start();
      if (!ready) return;
      // Three soft pulses of a lower, gentler note, spaced out so it does not read as a ticking.
      for (let i = 0; i < 3; i++) tone(ready, "sine", 3900, 0.025, 0.05, i * 0.09);
    },

    streak(count) {
      const ready = start();
      if (!ready) return;
      // Each step up the streak is a semitone higher, so a long streak is clearly a good one.
      const base = 660 * 1.0595 ** Math.min(count, 12);
      tone(ready, "triangle", base, 0.18, 0.12, 0);
      tone(ready, "triangle", base * 1.5, 0.18, 0.2, 0.07);
    },

    music(track) {
      // Make sure the audio exists first, because the player takes its clock from it.
      if (track) start();
      musicPlayer.play(track);
    },

    setVolume(next) {
      volume = Math.min(1, Math.max(0, next));
      if (audio) audio.master.gain.value = MASTER_LEVEL * volume;
    },

    creak() {
      const ready = start();
      if (!ready) return;
      // A burst of noise whose pitch sags, like a chair taking weight.
      const source = ready.ctx.createBufferSource();
      source.buffer = ready.noise;
      const filter = ready.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 6;
      const now = ready.ctx.currentTime;
      filter.frequency.setValueAtTime(420, now);
      filter.frequency.linearRampToValueAtTime(190, now + 0.14);
      source.connect(filter).connect(fadingGain(ready, 0.35, 0.16, 0));
      source.start();
      source.stop(now + 0.18);
    },
  };
}
