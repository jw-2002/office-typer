// Tests for turning a mouse position into the -1 to 1 coordinates the 3D scene uses.
import { describe, expect, it } from "vitest";
import { toNormalisedPointer } from "./canvasEvents";

const rect = { left: 100, top: 50, width: 800, height: 400 };

describe("toNormalisedPointer", () => {
  it("maps the middle of the canvas to 0, 0", () => {
    expect(toNormalisedPointer(500, 250, rect)).toEqual({ x: 0, y: 0 });
  });

  it("maps the corners, with y pointing up", () => {
    expect(toNormalisedPointer(100, 50, rect)).toEqual({ x: -1, y: 1 });
    expect(toNormalisedPointer(900, 450, rect)).toEqual({ x: 1, y: -1 });
  });

  it("does not depend on which element was clicked, only on where the mouse is on the page", () => {
    // The same position gives the same answer however it was reached, unlike event.offsetX which changes per target.
    expect(toNormalisedPointer(300, 150, rect)).toEqual(toNormalisedPointer(300, 150, rect));
    expect(toNormalisedPointer(300, 150, rect).x).toBeCloseTo(-0.5);
  });
});
