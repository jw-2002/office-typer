// The light in the office at each time of day: where the sun (or, at night, the moon) is, how bright and what colour it
// is, and the colour of the sky. Pure maths, so it can be tested. The Sun component feeds it into the real lights.
import { MINUTES_PER_DAY } from "@/game/time";

export type Daylight = {
  /** Where the light comes from, as a direction pointing from the middle of the room toward the light (length 1). */
  direction: readonly [number, number, number];
  /** Colour of the sun or moon, as a hex string. */
  color: string;
  intensity: number;
  ambientColor: string;
  ambientIntensity: number;
  /** Colour of the sky beyond the room. */
  sky: string;
};

type Rgb = readonly [number, number, number];

const rgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const toHex = ([r, g, b]: Rgb) =>
  "#" +
  [r, g, b]
    .map((channel) =>
      Math.round(Math.min(255, Math.max(0, channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

type Keyframe = {
  hour: number;
  sun: string;
  intensity: number;
  ambient: string;
  ambientIntensity: number;
  sky: string;
};

// The colours at fixed times. In between, everything fades smoothly from one to the next. Midnight and 24:00 match.
const KEYFRAMES: readonly Keyframe[] = [
  { hour: 0, sun: "#8aa4ff", intensity: 0.5, ambient: "#5566a0", ambientIntensity: 0.55, sky: "#0b1226" },
  { hour: 5, sun: "#8aa4ff", intensity: 0.45, ambient: "#5566a0", ambientIntensity: 0.55, sky: "#101a38" },
  { hour: 6.5, sun: "#ff9a5a", intensity: 1.0, ambient: "#a8869a", ambientIntensity: 0.62, sky: "#f0a878" },
  { hour: 9, sun: "#ffe2b8", intensity: 1.5, ambient: "#cfd6e6", ambientIntensity: 0.65, sky: "#8ab8e8" },
  { hour: 12, sun: "#fff6e8", intensity: 1.8, ambient: "#e6ecf8", ambientIntensity: 0.75, sky: "#7fb2ea" },
  { hour: 15.5, sun: "#ffeccc", intensity: 1.6, ambient: "#d8dff0", ambientIntensity: 0.7, sky: "#86b4e6" },
  { hour: 17.5, sun: "#ffb070", intensity: 1.2, ambient: "#c49aa4", ambientIntensity: 0.68, sky: "#f09a6a" },
  { hour: 19, sun: "#a08ad0", intensity: 0.65, ambient: "#6a6aa0", ambientIntensity: 0.55, sky: "#2a2450" },
  { hour: 21, sun: "#8aa4ff", intensity: 0.5, ambient: "#5566a0", ambientIntensity: 0.55, sky: "#0f1630" },
  { hour: 24, sun: "#8aa4ff", intensity: 0.5, ambient: "#5566a0", ambientIntensity: 0.55, sky: "#0b1226" },
];

const DEGREES = Math.PI / 180;
/** The sun's highest point, and the moon's. */
const SUN_HIGHEST = 55 * DEGREES;
const MOON_HIGHEST = 38 * DEGREES;
/** The light never gets lower than this, so shadows do not stretch out forever at sunrise and sunset. */
const LOWEST = 22 * DEGREES;
/** How far from straight ahead the light swings, east to west. Kept modest, because it all has to come through the window. */
const SWING = 50 * DEGREES;

/** Where the sun (or the moon) is at an hour of the day. */
function celestial(hour: number) {
  // The sun crosses the sky from 6 to 18. At night the moon crosses the other way, so the light never jumps: at
  // 6 and 18 the sun and the moon are both on the horizon, in the same place.
  const daytime = hour >= 6 && hour < 18;
  const progress = daytime ? (hour - 6) / 12 : ((((hour - 18) % 24) + 24) % 24) / 12;
  const arc = Math.sin(Math.min(1, progress) * Math.PI);
  const elevation = Math.max(LOWEST, arc * (daytime ? SUN_HIGHEST : MOON_HIGHEST));
  const azimuth = (daytime ? -1 + 2 * progress : 1 - 2 * Math.min(1, progress)) * SWING;
  return { daytime, azimuth, elevation };
}

const hourOf = (minutes: number) => (((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY) / 60;

/** Where the sun or moon appears in the window, which is the same place the light (and so the shadows) comes from. */
export type SkySpot = {
  body: "sun" | "moon";
  /** From -1 (left edge of its path) to 1 (right edge). The light's sideways direction, so shadows fall the other way. */
  across: number;
  /** From 0 (as low as it goes) to 1 (highest). */
  height: number;
};

export function skySpot(minutes: number): SkySpot {
  const { daytime, azimuth, elevation } = celestial(hourOf(minutes));
  const highest = daytime ? SUN_HIGHEST : MOON_HIGHEST;
  return { body: daytime ? "sun" : "moon", across: azimuth / SWING, height: (elevation - LOWEST) / (highest - LOWEST) };
}

/** How night-like it is, from 0 (day) to 1 (full night), fading through dusk and dawn. For stars and the night sparkles. */
export function nightness(minutes: number): number {
  const hour = hourOf(minutes);
  const ramp = (from: number, to: number) => Math.min(1, Math.max(0, (hour - from) / (to - from)));
  // Dark until 5, fading out to 6.5; day until 18, fading in to 20.
  if (hour < 12) return 1 - ramp(5, 6.5);
  return ramp(18, 20);
}

/** The light at a time of day, given in minutes since midnight. */
export function daylightAt(minutes: number): Daylight {
  const hour = (((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY) / 60;

  // Fade between the two surrounding keyframes.
  let after = KEYFRAMES.findIndex((frame) => frame.hour > hour);
  if (after === -1) after = KEYFRAMES.length - 1;
  const from = KEYFRAMES[after - 1];
  const to = KEYFRAMES[after];
  const t = (hour - from.hour) / (to.hour - from.hour);
  const smooth = t * t * (3 - 2 * t);
  const fade = (a: string, b: string) => toHex(mix(rgb(a), rgb(b), smooth));
  const blend = (a: number, b: number) => a + (b - a) * smooth;

  const { azimuth, elevation } = celestial(hour);

  // The window is in the back wall, so the light comes from behind the desk (negative z, away from the player) and
  // above, swinging a little left to right. Shadows fall toward the player and across the desk.
  const direction: [number, number, number] = [
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    -Math.cos(azimuth) * Math.cos(elevation) * 0.8,
  ];
  const length = Math.hypot(...direction);

  return {
    direction: [direction[0] / length, direction[1] / length, direction[2] / length],
    color: fade(from.sun, to.sun),
    intensity: blend(from.intensity, to.intensity),
    ambientColor: fade(from.ambient, to.ambient),
    ambientIntensity: blend(from.ambientIntensity, to.ambientIntensity),
    sky: fade(from.sky, to.sky),
  };
}

/** Whether it is dark enough for a lamp to look good. */
export function isDark(minutes: number): boolean {
  const hour = (((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY) / 60;
  return hour < 6.5 || hour >= 18.5;
}
