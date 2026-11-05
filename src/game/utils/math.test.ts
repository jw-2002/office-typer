// Tests for the shared number helpers.
import { describe, expect, it } from "vitest";
import { clamp01 } from "./math";

describe("clamp01", () => {
  it("leaves numbers from 0 to 1 alone and pulls the rest in", () => {
    expect([-2, 0, 0.4, 1, 7].map(clamp01)).toEqual([0, 0, 0.4, 1, 1]);
  });
});
