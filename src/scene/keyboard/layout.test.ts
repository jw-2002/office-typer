// Tests that the keyboard layout data is consistent.
import { describe, expect, it } from "vitest";
import { keys, layoutDepth, layoutWidth, type KeyDef } from "./layout";

describe("keyboard layout", () => {
  it("has a unique event.code for every key", () => {
    const codes = keys.map((key) => key.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("is a tenkeyless board", () => {
    expect(keys).toHaveLength(87);
  });

  it("keeps every key inside the board", () => {
    for (const { code, x, z, w } of keys) {
      expect(x - w / 2, `${code} left edge`).toBeGreaterThanOrEqual(0);
      expect(x + w / 2, `${code} right edge`).toBeLessThanOrEqual(layoutWidth);
      expect(z, `${code} row`).toBeLessThan(layoutDepth);
    }
  });

  it("never overlaps keys within a row", () => {
    const rows = new Map<number, KeyDef[]>();
    for (const key of keys) rows.set(key.z, [...(rows.get(key.z) ?? []), key]);

    for (const row of rows.values()) {
      const sorted = [...row].sort((a, b) => a.x - b.x);
      sorted.slice(1).forEach((key, i) => {
        const prev = sorted[i];
        expect(key.x - key.w / 2, `${prev.code} -> ${key.code}`).toBeGreaterThanOrEqual(prev.x + prev.w / 2 - 1e-9);
      });
    }
  });
});
