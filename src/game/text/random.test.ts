// Tests for the seeded random helpers.
import { describe, expect, it } from "vitest";
import { createRng, pick, shuffled } from "./random";

describe("createRng", () => {
  it("repeats for the same seed and differs between seeds", () => {
    const a = Array.from({ length: 5 }, createRng(1));
    const b = Array.from({ length: 5 }, createRng(1));
    const c = Array.from({ length: 5 }, createRng(2));
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("stays within [0, 1)", () => {
    const rng = createRng(42);
    for (let i = 0; i < 1000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("pick and shuffled", () => {
  it("pick returns an item from the list", () => {
    expect(["a", "b", "c"]).toContain(pick(createRng(7), ["a", "b", "c"]));
  });

  it("shuffled keeps the same items without touching the input", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const result = shuffled(createRng(3), input);
    expect(result).not.toBe(input);
    expect([...result].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
