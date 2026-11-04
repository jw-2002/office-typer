// Which background sound belongs to which time of day: birds in the morning and late afternoon, crickets at night.
// Pure, so it can be tested. The sounds themselves are made in src/audio.
import { MINUTES_PER_DAY } from "./time";

export type Ambience = "birds" | "crickets" | "none";

export function ambienceAt(minutes: number): Ambience {
  const hour = (((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY) / 60;
  if ((hour >= 6 && hour < 11) || (hour >= 15 && hour < 18.5)) return "birds";
  if (hour >= 20.5 || hour < 4.5) return "crickets";
  return "none";
}
