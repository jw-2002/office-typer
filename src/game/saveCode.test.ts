// Tests for save codes: they round-trip, and bad or tampered text is rejected or repaired rather than breaking the game.
import { describe, expect, it } from "vitest";
import { MAX_LEGACY } from "./economy";
import { newProgress } from "./progress";
import { decodeSave, encodeSave } from "./saveCode";

const progress = {
  ...newProgress(),
  player: { name: "Bo", currency: 1234 },
  legacy: 2,
  achievements: ["first-words"],
};

describe("save codes", () => {
  it("round-trips a save", () => {
    const code = encodeSave(progress, 5);
    expect(code.startsWith("OT1:")).toBe(true);
    expect(decodeSave(code)).toMatchObject({ ...progress, savedAt: 5 });
  });

  it("ignores spaces around the code", () => {
    expect(decodeSave(`  ${encodeSave(progress, 1)}\n`)?.player.name).toBe("Bo");
  });

  it("rejects text that is not a code", () => {
    for (const text of ["", "hello", "OT1:", "OT1:!!!", "OT1:" + btoa("not json"), "OT1:" + btoa("[1,2]")])
      expect(decodeSave(text), text).toBeNull();
  });

  it("still repairs edited values, so a code cannot give an impossible save", () => {
    const edited = JSON.stringify({ ...JSON.parse(atob(encodeSave(progress, 1).slice(4))), legacy: 9999 });
    expect(decodeSave("OT1:" + btoa(edited))?.legacy).toBe(MAX_LEGACY);
  });
});
