import { ROLLING_WINDOW_MS, rollingWpm, wpm } from "./wpm";

// Rules (TypeRacer style): keys keep being accepted after a mistake, but everything typed from the
// first mistake onward is wrong and must be removed with Backspace before progress continues.
// Backspace never removes correct characters. Time is passed in so this stays pure and testable.

/** How many wrong characters can pile up before further keys are ignored. */
export const MAX_WRONG_CHARS = 10;

export type TypingState = {
  readonly target: string;
  /** Number of characters typed correctly so far. */
  readonly cursor: number;
  /** Characters typed since the first mistake, in order. Empty when on track. */
  readonly wrong: string;
  /** Wrong keystrokes so far, including ones later erased. */
  readonly mistakes: number;
  /** Keystrokes that counted (correct or wrong). Keys ignored at the wrong-character limit are excluded. */
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
    wrong: "",
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

/** Everything the player has typed so far, correct and wrong. */
export function typedText(state: TypingState): string {
  return state.target.slice(0, state.cursor) + state.wrong;
}

/** `key` is a KeyboardEvent.key value. Callers should drop events with Ctrl or Meta held. */
export function applyKey(state: TypingState, key: string, now: number): TypingState {
  if (isFinished(state)) return state;

  if (key === "Backspace") {
    return state.wrong === "" ? state : { ...state, wrong: state.wrong.slice(0, -1) };
  }

  // Printable keys are a single character; "Shift", "Enter", "Dead" and friends are longer.
  if (key.length !== 1) return state;

  const startedAt = state.startedAt ?? now;
  const keystrokes = state.keystrokes + 1;

  const onTrack = state.wrong === "" && key === state.target[state.cursor];
  if (!onTrack) {
    // Piling up errors past the limit, or past the end of the text, does nothing useful.
    const wrongRoom = Math.min(MAX_WRONG_CHARS, state.target.length - state.cursor);
    if (state.wrong.length >= wrongRoom) return state;
    return { ...state, startedAt, keystrokes, mistakes: state.mistakes + 1, wrong: state.wrong + key };
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

/**
 * Moves the clock forward by `deltaMs`, as if that stretch of time never happened. Used to ignore time
 * the player spent away from the game, so walking off mid-assignment does not wreck their WPM.
 */
export function shiftTime(state: TypingState, deltaMs: number): TypingState {
  if (isFinished(state) || state.startedAt === null || deltaMs <= 0) return state;
  return { ...state, startedAt: state.startedAt + deltaMs, recent: state.recent.map((time) => time + deltaMs) };
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
