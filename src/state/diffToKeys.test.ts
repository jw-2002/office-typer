// Tests for converting text-field changes into key presses.
import { describe, expect, it } from "vitest";
import { diffToKeys } from "./diffToKeys";

describe("diffToKeys", () => {
  it("returns nothing when the field did not change", () => {
    expect(diffToKeys(" ", " ")).toEqual([]);
  });

  it("turns appended characters into typed keys", () => {
    expect(diffToKeys(" ", " a")).toEqual(["a"]);
    expect(diffToKeys(" ", " cat")).toEqual(["c", "a", "t"]);
  });

  it("turns a deleted character into Backspace", () => {
    expect(diffToKeys(" ", "")).toEqual(["Backspace"]);
  });

  it("treats a replacement as Backspaces then the new characters", () => {
    expect(diffToKeys(" teh", " the")).toEqual(["Backspace", "Backspace", "h", "e"]);
  });

  it("keeps spaces and capitals", () => {
    expect(diffToKeys(" ", " A b")).toEqual(["A", " ", "b"]);
  });
});
