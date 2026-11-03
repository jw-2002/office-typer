export const ROLLING_WINDOW_MS = 10_000;

// Standard typing convention: one "word" is five characters, so punctuation and long words count fairly.
const CHARS_PER_WORD = 5;
// Stops the first keystroke reading as thousands of WPM.
const MIN_ELAPSED_MS = 1000;

export function wpm(correctChars: number, elapsedMs: number): number {
  if (correctChars <= 0 || elapsedMs <= 0) return 0;
  return correctChars / CHARS_PER_WORD / (Math.max(elapsedMs, MIN_ELAPSED_MS) / 60_000);
}

// Speed over the last few seconds, for the live counter. It decays when you stop typing.
// `recent` holds timestamps of correct keystrokes.
export function rollingWpm(
  recent: readonly number[],
  startedAt: number | null,
  now: number,
  windowMs = ROLLING_WINDOW_MS,
): number {
  if (startedAt === null) return 0;
  const inWindow = recent.filter((time) => time > now - windowMs).length;
  // Before a full window has passed, divide by the time actually spent so the counter ramps up quickly.
  return wpm(inWindow, Math.min(windowMs, now - startedAt));
}
