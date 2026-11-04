// The time of day in the office. It runs fast: one real second is one minute on the clock, so a whole day takes 24
// minutes of play. Pure, so it can be tested. The clock only moves while the game is being played.

export const MINUTES_PER_DAY = 1440;
/** The game starts at eight in the morning. */
export const START_MINUTES = 8 * 60;
/** How many clock minutes pass each real second. */
export const CLOCK_MINUTES_PER_SECOND = 1;

/** The time of day, in minutes since midnight (0 to 1439), after the game has been played for this many seconds. */
export function timeOfDay(secondsPlayed: number): number {
  const minutes = START_MINUTES + secondsPlayed * CLOCK_MINUTES_PER_SECOND;
  return ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** 485 -> "08:05". */
export function formatClock(minutes: number): string {
  const whole = Math.floor(((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY);
  const hours = Math.floor(whole / 60);
  return `${hours.toString().padStart(2, "0")}:${(whole % 60).toString().padStart(2, "0")}`;
}
