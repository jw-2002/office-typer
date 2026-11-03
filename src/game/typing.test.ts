import { describe, expect, it } from "vitest";
import { accuracy, applyKey, createTyping, finalWpm, isFinished, liveWpm, type TypingState } from "./typing";

// Types each character of `keys` one second apart, starting at `start`.
function type(state: TypingState, keys: readonly string[], start = 0): TypingState {
  return keys.reduce((s, key, i) => applyKey(s, key, start + i * 1000), state);
}

describe("applyKey", () => {
  it("advances on correct keys and finishes at the end", () => {
    const state = type(createTyping("hi"), ["h", "i"]);
    expect(state.cursor).toBe(2);
    expect(isFinished(state)).toBe(true);
    expect(state.finishedAt).toBe(1000);
  });

  it("blocks on a wrong key until Backspace clears it", () => {
    let state = type(createTyping("cat"), ["c", "x"]);
    expect(state.wrongKey).toBe("x");
    expect(state.cursor).toBe(1);

    // Further keys are ignored while blocked, even the right one.
    state = type(state, ["a"], 5000);
    expect(state.cursor).toBe(1);
    expect(state.keystrokes).toBe(2);

    state = type(state, ["Backspace", "a", "t"], 6000);
    expect(state.wrongKey).toBeNull();
    expect(isFinished(state)).toBe(true);
    expect(state.mistakes).toBe(1);
  });

  it("does not let Backspace undo correct characters", () => {
    const state = type(createTyping("cat"), ["c", "a", "Backspace"]);
    expect(state.cursor).toBe(2);
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
    const state = type(createTyping("A b"), ["a"]);
    expect(state.wrongKey).toBe("a");
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

  it("counts only keystrokes that were not ignored", () => {
    // 1 correct, 1 wrong, 1 ignored while blocked, backspace, 1 correct = 3 counted, 1 wrong.
    const state = type(createTyping("ab"), ["a", "x", "b", "Backspace", "b"]);
    expect(accuracy(state)).toBeCloseTo(2 / 3);
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
    const typing = liveWpm(state, 29_000);
    const idle = liveWpm(state, 60_000);
    expect(typing).toBeGreaterThan(0);
    expect(idle).toBe(0);
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
