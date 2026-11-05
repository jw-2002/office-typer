// Tests that the name plates get bigger and grander with every promotion, and that their lettering is easy to read.
import { describe, expect, it } from "vitest";
import { jobs } from "@/game/data/jobs";
import { nameplateLook, nameplateLooks } from "./nameplateLooks";

/** Brightness of a #rrggbb colour as the eye sees it, from 0 (black) to 1 (white). */
function luminance(hex: string): number {
  const [red, green, blue] = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** WCAG contrast ratio between two colours: 1 is none, 21 is black on white. */
function contrast(first: string, second: string): number {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

describe("name plates", () => {
  it("has lettering that stands out clearly from every plate", () => {
    for (const job of jobs) {
      const { color, textColor } = nameplateLooks[job.id];
      // 4.5 is the usual minimum for small text. The extra margin allows for the plate being lit unevenly.
      expect(contrast(color, textColor), job.id).toBeGreaterThanOrEqual(6.5);
    }
  });

  it("has a plate for every job, each wider than the one before", () => {
    const widths = jobs.map((job) => nameplateLooks[job.id].width);
    for (let i = 1; i < widths.length; i++) expect(widths[i]).toBeGreaterThan(widths[i - 1]);
  });

  it("falls back to the first plate for an unknown job", () => {
    expect(nameplateLook("nope")).toBe(nameplateLooks.intern);
  });
});
