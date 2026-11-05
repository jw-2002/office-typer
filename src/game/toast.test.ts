// Tests for the quantum toaster joke: one line for each way the toast can turn out.
import { describe, expect, it } from "vitest";
import { TOAST_COMES_BACK, toastMessage } from "./toast";

describe("toastMessage", () => {
  it("has a different line for none, one and both slices", () => {
    const lines = [0, 1, 2].map(toastMessage);
    expect(new Set(lines).size).toBe(3);
    for (const line of lines) expect(line).toMatch(/^[\x20-\x7e]+$/);
  });

  it("mentions the cat when nothing comes back", () => {
    expect(toastMessage(0)).toContain("cat");
  });

  it("usually brings the toast back, but not always", () => {
    expect(TOAST_COMES_BACK).toBeGreaterThan(0.5);
    expect(TOAST_COMES_BACK).toBeLessThan(1);
  });
});
