// Tests for the finger a key belongs to.
import { describe, expect, it } from "vitest";
import { fingerFor } from "./fingers";
import { keys } from "./layout";

const find = (code: string) => {
  const def = keys.find((key) => key.code === code);
  if (!def) throw new Error(`no key ${code}`);
  return fingerFor(def.code, def.x);
};

describe("fingerFor", () => {
  it("puts the home row under the right fingers", () => {
    // Left hand: pinky, ring, middle, index. Right hand: index, middle, ring, pinky.
    expect(["KeyA", "KeyS", "KeyD", "KeyF"].map((code) => find(code))).toEqual([
      { hand: "left", finger: 0, thumb: false },
      { hand: "left", finger: 1, thumb: false },
      { hand: "left", finger: 2, thumb: false },
      { hand: "left", finger: 3, thumb: false },
    ]);
    expect(["KeyJ", "KeyK", "KeyL", "Semicolon"].map((code) => find(code))).toEqual([
      { hand: "right", finger: 0, thumb: false },
      { hand: "right", finger: 1, thumb: false },
      { hand: "right", finger: 2, thumb: false },
      { hand: "right", finger: 3, thumb: false },
    ]);
  });

  it("splits the keyboard between the hands in the middle of each row", () => {
    for (const code of ["KeyT", "KeyG", "KeyB", "Digit5", "Digit6"]) expect(find(code).hand, code).toBe("left");
    for (const code of ["KeyY", "KeyH", "KeyN", "Digit7"]) expect(find(code).hand, code).toBe("right");
  });

  it("gives the same finger to the same column in neighbouring rows", () => {
    expect(find("KeyQ").finger).toBe(find("KeyA").finger);
    expect(find("KeyW").finger).toBe(find("KeyS").finger);
    expect(find("KeyE").finger).toBe(find("KeyD").finger);
    expect(find("KeyU").finger).toBe(find("KeyJ").finger);
    expect(find("KeyI").finger).toBe(find("KeyK").finger);
    expect(find("KeyP").finger).toBe(find("Semicolon").finger);
  });

  it("uses a thumb for the space bar", () => {
    expect(find("Space")).toEqual({ hand: "right", finger: 0, thumb: true });
  });

  it("gives every key a hand and one of four fingers, with the edges and arrow keys on the pinkies", () => {
    for (const def of keys) {
      const assignment = fingerFor(def.code, def.x);
      expect(["left", "right"]).toContain(assignment.hand);
      expect(assignment.finger).toBeGreaterThanOrEqual(0);
      expect(assignment.finger).toBeLessThanOrEqual(3);
    }
    expect(find("Escape")).toMatchObject({ hand: "left", finger: 0 });
    expect(find("ArrowRight")).toMatchObject({ hand: "right", finger: 3 });
  });
});
