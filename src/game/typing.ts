import { ROLLING_WINDOW_MS, rollingWpm, wpm } from "./wpm";

// Rules: a wrong key is shown as a mistake and blocks progress until Backspace clears it.
// Backspace cannot undo correct characters. Time is passed in so this stays pure and testable.
export type TypingState = {
  readonly target: string;
  /** Number of characters typed correctly so far. */
  readonly cursor: number;
  /** The mistyped key currently blocking progress, or null. */
  readonly wrongKey: string | null;
  readonly mistakes: number;
  /** Keystrokes that counted (correct or wrong). Keys ignored while blocked are excluded. */
  readonly keystrokes: number;
  readonly startedAt: number | null;
  readonly finishedAt: number | null;
  /** Timestamps of recent correct keystrokes, trimmed to the rolling WPM window. */
  readonly recent: readonly number[];
};

export function createTyping(target: string): TypingState {
  return {
    target,
    cursor: 0,
    wrongKey: null,
    mistakes: 0,
    keystrokes: 0,
    startedAt: null,
    finishedAt: null,
    recent: [],
  };
}

export function isFinished(state: TypingState): boolean {
  return state.finishedAt !== null;
}

/** `key` is a KeyboardEvent.key value. Callers should drop events with Ctrl or Meta held. */
export function applyKey(state: TypingState, key: string, now: number): TypingState {
  if (isFinished(state)) return state;

  if (key === "Backspace") {
    return state.wrongKey === null ? state : { ...state, wrongKey: null };
  }

  // Printable keys are a single character; "Shift", "Enter", "Dead" and friends are longer.
  if (key.length !== 1) return state;
  if (state.wrongKey !== null) return state;

  const startedAt = state.startedAt ?? now;
  const keystrokes = state.keystrokes + 1;

  if (key !== state.target[state.cursor]) {
    return { ...state, startedAt, keystrokes, mistakes: state.mistakes + 1, wrongKey: key };
  }

  const cursor = state.cursor + 1;
  return {
    ...state,
    startedAt,
    keystrokes,
    cursor,
    finishedAt: cursor === state.target.length ? now : null,
    recent: [...state.recent.filter((time) => time > now - ROLLING_WINDOW_MS), now],
  };
}

/** Share of counted keystrokes that were correct, from 0 to 1. */
export function accuracy(state: TypingState): number {
  if (state.keystrokes === 0) return 1;
  return (state.keystrokes - state.mistakes) / state.keystrokes;
}

export function elapsedMs(state: TypingState, now: number): number {
  if (state.startedAt === null) return 0;
  return (state.finishedAt ?? now) - state.startedAt;
}

/** Whole-assignment speed. Use this for the result screen and best-ever WPM. */
export function finalWpm(state: TypingState, now: number): number {
  return wpm(state.cursor, elapsedMs(state, now));
}

/** Speed over the last few seconds. Use this for the live HUD counter. */
export function liveWpm(state: TypingState, now: number): number {
  if (isFinished(state)) return finalWpm(state, now);
  return rollingWpm(state.recent, state.startedAt, now);
}
