// Plays key sounds with the Web Audio API, built from noise and tones, so there are no sound files to load.
import type { KeySound } from "./switchSounds";

export type KeyClicker = { play: (sound: KeySound) => void };

const NOISE_SECONDS = 0.15;
// Each press is a little higher or lower than the last, so repeated keys do not sound like a machine.
const PITCH_JITTER = 0.1;

export function createKeyClicker(): KeyClicker {
  // Browsers only allow audio after a user gesture, so nothing is created until the first key press.
  let context: AudioContext | null = null;
  let noise: AudioBuffer | null = null;
  let master: GainNode | null = null;

  const start = (): { context: AudioContext; noise: AudioBuffer; master: GainNode } | null => {
    if (typeof AudioContext === "undefined") return null;
    if (!context || !noise || !master) {
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = 0.35;
      master.connect(context.destination);
      noise = context.createBuffer(1, Math.ceil(context.sampleRate * NOISE_SECONDS), context.sampleRate);
      const samples = noise.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    if (context.state === "suspended") void context.resume();
    return { context, noise, master };
  };

  return {
    play(sound) {
      const audio = start();
      if (!audio) return;
      const { context: ctx, noise: noiseBuffer, master: output } = audio;
      const now = ctx.currentTime;
      const pitch = 1 + (Math.random() - 0.5) * PITCH_JITTER;

      // A short burst that fades out fast. Exponential ramps cannot reach 0, so they end just above it.
      const burst = (gain: number, seconds: number, delay = 0) => {
        const node = ctx.createGain();
        node.gain.setValueAtTime(0, now + delay);
        node.gain.linearRampToValueAtTime(gain * sound.volume, now + delay + 0.001);
        node.gain.exponentialRampToValueAtTime(0.0001, now + delay + seconds);
        node.connect(output);
        return node;
      };

      const clack = ctx.createBufferSource();
      clack.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = sound.clack * pitch;
      filter.Q.value = sound.clackQ;
      clack.connect(filter).connect(burst(1, sound.decay));
      clack.start(now);
      clack.stop(now + sound.decay + 0.02);

      const tones: { type: OscillatorType; frequency: number; gain: number; seconds: number; delay: number }[] = [
        { type: "sine", frequency: sound.body, gain: sound.bodyGain, seconds: sound.decay * 1.6, delay: 0 },
      ];
      if (sound.click) tones.push({ type: "triangle", ...sound.click, seconds: 0.012 });
      for (const tone of tones) {
        const oscillator = ctx.createOscillator();
        oscillator.type = tone.type;
        oscillator.frequency.value = tone.frequency * pitch;
        oscillator.connect(burst(tone.gain, tone.seconds, tone.delay));
        oscillator.start(now + tone.delay);
        oscillator.stop(now + tone.delay + tone.seconds + 0.02);
      }
    },
  };
}
