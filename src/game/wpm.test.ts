// Tests for the WPM maths.
import { describe, expect, it } from "vitest";
import { rollingWpm, wpm } from "./wpm";

describe("wpm", () => {
  it("counts five characters as a word", () => {
    expect(wpm(50, 60_000)).toBe(10);
    expect(wpm(300, 60_000)).toBe(60);
  });

  it("returns 0 for no progress or no time", () => {
    expect(wpm(0, 5000)).toBe(0);
    expect(wpm(10, 0)).toBe(0);
  });

  it("does not spike on the very first keystroke", () => {
    expect(wpm(1, 10)).toBeLessThan(15);
  });
});

describe("rollingWpm", () => {
  it("is 0 before the player starts", () => {
    expect(rollingWpm([], null, 1000)).toBe(0);
  });

  it("only counts keystrokes inside the window", () => {
    const recent = [0, 1000, 20_000, 21_000];
    // At t=25s with a 10s window only the last two count: 2 chars over 10s.
    expect(rollingWpm(recent, 0, 25_000, 10_000)).toBeCloseTo(wpm(2, 10_000));
  });

  it("uses elapsed time while the window is not yet full", () => {
    expect(rollingWpm([1000, 2000, 3000], 1000, 4000, 10_000)).toBeCloseTo(wpm(3, 3000));
  });
});
