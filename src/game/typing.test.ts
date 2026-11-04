// Tests for the typing engine rules.
import { describe, expect, it } from "vitest";
import {
  MAX_WRONG_CHARS,
  accuracy,
  applyKey,
  createTyping,
  elapsedMs,
  finalWpm,
  isFinished,
  liveWpm,
  shiftTime,
  typedText,
  type TypingState,
} from "./typing";

// Presses each key one second apart, starting at `start`.
function type(state: TypingState, keys: readonly string[], start = 0): TypingState {
  return keys.reduce((s, key, i) => applyKey(s, key, start + i * 1000), state);
}

describe("elapsedMs", () => {
  it("is 0 before typing starts, and never negative when the clock reading is older than the first key", () => {
    expect(elapsedMs(createTyping("hi"), 5000)).toBe(0);
    const started = applyKey(createTyping("hi"), "h", 5000);
    expect(elapsedMs(started, 4000)).toBe(0);
    expect(elapsedMs(started, 5600)).toBe(600);
  });
});

describe("applyKey", () => {
  it("advances on correct keys and finishes at the end", () => {
    const state = type(createTyping("hi"), ["h", "i"]);
    expect(state.cursor).toBe(2);
    expect(isFinished(state)).toBe(true);
    expect(state.finishedAt).toBe(1000);
  });

  it("keeps accepting keys after a mistake, but they are all wrong until removed", () => {
    // 'c' is right, 'x' is wrong, then 'a' would have been right but is now part of the error run.
    const state = type(createTyping("cat"), ["c", "x", "a"]);
    expect(state.cursor).toBe(1);
    expect(state.wrong).toBe("xa");
    expect(typedText(state)).toBe("cxa");
  });

  it("removes wrong characters one at a time with Backspace, then continues", () => {
    let state = type(createTyping("cat"), ["c", "x", "y"]);
    state = type(state, ["Backspace"], 5000);
    expect(state.wrong).toBe("x");
    state = type(state, ["Backspace", "a", "t"], 6000);
    expect(state.wrong).toBe("");
    expect(isFinished(state)).toBe(true);
  });

  it("does not let Backspace undo correct characters", () => {
    const state = type(createTyping("cat"), ["c", "a", "Backspace", "Backspace"]);
    expect(state.cursor).toBe(2);
    expect(state.wrong).toBe("");
  });

  it("stops accepting wrong characters at the limit", () => {
    const state = type(createTyping("a".repeat(50)), Array(MAX_WRONG_CHARS + 5).fill("x"));
    expect(state.wrong).toHaveLength(MAX_WRONG_CHARS);
    expect(state.keystrokes).toBe(MAX_WRONG_CHARS);
  });

  it("never lets the error run extend past the end of the text", () => {
    const state = type(createTyping("abc"), ["a", "x", "x", "x", "x"]);
    expect(state.wrong).toBe("xx");
    expect(state.cursor + state.wrong.length).toBe(3);
  });

  it("ignores non-printable keys", () => {
    const state = type(createTyping("a"), ["Shift", "Enter", "Dead", "Control"]);
    expect(state.keystrokes).toBe(0);
    expect(state.startedAt).toBeNull();
  });

  it("starts the clock on the first printable key only", () => {
    let state = type(createTyping("ab"), ["Backspace", "Shift"], 0);
    expect(state.startedAt).toBeNull();
    state = applyKey(state, "a", 4000);
    expect(state.startedAt).toBe(4000);
  });

  it("is case and space sensitive", () => {
    expect(type(createTyping("A b"), ["a"]).wrong).toBe("a");
    expect(type(createTyping("A b"), ["A", " ", "b"]).cursor).toBe(3);
  });

  it("ignores input once finished", () => {
    const done = type(createTyping("a"), ["a"]);
    expect(applyKey(done, "b", 9000)).toBe(done);
  });

  it("never mutates the previous state", () => {
    const before = createTyping("ab");
    applyKey(before, "a", 0);
    expect(before.cursor).toBe(0);
    expect(before.recent).toEqual([]);
  });
});

describe("accuracy", () => {
  it("is 1 before typing", () => {
    expect(accuracy(createTyping("a"))).toBe(1);
  });

  it("counts every key in an error run as a mistake, even after it is erased", () => {
    // a ok, x wrong, b wrong (it follows an error), Backspace x2, b ok = 4 counted keys, 2 wrong.
    const state = type(createTyping("abcd"), ["a", "x", "b", "Backspace", "Backspace", "b"]);
    expect(state.mistakes).toBe(2);
    expect(accuracy(state)).toBeCloseTo(2 / 4);
  });
});

describe("wpm", () => {
  it("finalWpm uses the whole assignment", () => {
    // 10 chars in 9 seconds of typing = 2 words in 9s.
    const state = type(createTyping("abcdefghij"), [..."abcdefghij"]);
    expect(finalWpm(state, 99_999)).toBeCloseTo(2 / (9 / 60));
  });

  it("liveWpm ramps up then decays when you stop", () => {
    const state = type(createTyping("a".repeat(100)), Array(30).fill("a"));
    expect(liveWpm(state, 29_000)).toBeGreaterThan(0);
    expect(liveWpm(state, 60_000)).toBe(0);
  });

  it("liveWpm switches to the final figure when done", () => {
    const state = type(createTyping("abcde"), [..."abcde"]);
    expect(liveWpm(state, 50_000)).toBe(finalWpm(state, 50_000));
  });

  it("keeps recent timestamps bounded", () => {
    const state = type(createTyping("a".repeat(500)), Array(400).fill("a"));
    expect(state.recent.length).toBeLessThanOrEqual(11);
  });
});

describe("shiftTime", () => {
  it("makes time spent away not count towards elapsed time or WPM", () => {
    // 5 correct keys over 4 seconds, then 60 seconds away.
    const typed = type(createTyping("a".repeat(20)), Array(5).fill("a"));
    const before = liveWpm(typed, 4000);
    const shifted = shiftTime(typed, 60_000);
    expect(liveWpm(shifted, 64_000)).toBeCloseTo(before);
  });

  it("does nothing before the player starts, after finishing, or for no time", () => {
    const fresh = createTyping("ab");
    expect(shiftTime(fresh, 5000)).toBe(fresh);
    const done = type(createTyping("a"), ["a"]);
    expect(shiftTime(done, 5000)).toBe(done);
    const started = type(createTyping("ab"), ["a"]);
    expect(shiftTime(started, 0)).toBe(started);
  });
});
