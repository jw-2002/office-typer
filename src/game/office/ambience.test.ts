// Tests for the background sound by time of day.
import { describe, expect, it } from "vitest";
import { ambienceAt } from "./ambience";

const hour = (h: number) => h * 60;

describe("ambienceAt", () => {
  it("has birds in the morning and late afternoon", () => {
    expect(ambienceAt(hour(8))).toBe("birds");
    expect(ambienceAt(hour(16))).toBe("birds");
  });

  it("has crickets at night", () => {
    expect(ambienceAt(hour(23))).toBe("crickets");
    expect(ambienceAt(hour(2))).toBe("crickets");
  });

  it("is quiet in the middle of the day and at twilight", () => {
    expect(ambienceAt(hour(13))).toBe("none");
    expect(ambienceAt(hour(19.5))).toBe("none");
    expect(ambienceAt(hour(5))).toBe("none");
  });

  it("repeats every day", () => {
    expect(ambienceAt(1440 + hour(8))).toBe(ambienceAt(hour(8)));
    expect(ambienceAt(-hour(1))).toBe("crickets");
  });
});
