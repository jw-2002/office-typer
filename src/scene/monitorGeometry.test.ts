// Tests for lifting a tilted monitor clear of what it sits on.
import { describe, expect, it } from "vitest";
import { tiltClearance } from "./monitorGeometry";

describe("tiltClearance", () => {
  it("needs no lift when the monitor is not tilted", () => {
    expect(tiltClearance(0.45, 0.26, 0)).toBe(0);
  });

  it("lifts a deep old monitor by about two centimetres at the game's tilt", () => {
    expect(tiltClearance(0.45, 0.26, 0.2)).toBeCloseTo(0.021, 3);
  });

  it("barely lifts a thin modern monitor", () => {
    expect(tiltClearance(0.4, 0.012, 0.2)).toBeLessThan(0.001);
  });

  it("the lifted monitor never dips below the bottom edge it had", () => {
    for (const depth of [0.01, 0.05, 0.1, 0.26, 0.4]) {
      for (const tilt of [0.05, 0.2, 0.4]) {
        const height = 0.45;
        const lift = tiltClearance(height, depth, tilt);
        const lowestAfterLift = lift - (height / 2) * Math.cos(tilt) - (depth / 2) * Math.sin(tilt);
        expect(lowestAfterLift).toBeGreaterThanOrEqual(-height / 2 - 1e-9);
      }
    }
  });

  it("lifts more for a deeper monitor", () => {
    expect(tiltClearance(0.45, 0.3, 0.2)).toBeGreaterThan(tiltClearance(0.45, 0.1, 0.2));
  });
});
