// Plays game sounds with the Web Audio API, built from noise and tones, so there are no sound files to load.
import type { KeySound } from "./switchSounds";

export type KeyClicker = {
  /** One key press, in the sound of the switches in use. */
  play: (sound: KeySound) => void;
  /** A short rising tune for a promotion. */
  fanfare: () => void;
};

const NOISE_SECONDS = 0.15;
// Each press is a little higher or lower than the last, so repeated keys do not sound like a machine.
const PITCH_JITTER = 0.1;
// C, E, G and a high C, one after another.
const FANFARE_NOTES = [523.25, 659.25, 783.99, 1046.5];
const FANFARE_STEP_SECONDS = 0.13;

type Audio = { ctx: AudioContext; noise: AudioBuffer; master: GainNode };

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

  const start = (): Audio | null => {
    if (typeof AudioContext === "undefined") return null;
    if (!audio) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
      const noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * NOISE_SECONDS), ctx.sampleRate);
      const samples = noise.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      audio = { ctx, noise, master };
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
  };
}
