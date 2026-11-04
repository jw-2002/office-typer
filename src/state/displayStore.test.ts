// Tests for reading the display settings.
import { describe, expect, it } from "vitest";
import { parseDisplaySettings } from "./displayStore";

const defaults = { reducedMotion: false, largeText: false, quality: "high" };

describe("parseDisplaySettings", () => {
  it("starts with motion on, normal text and high quality when nothing is stored", () => {
    expect(parseDisplaySettings(null, false)).toEqual(defaults);
  });

  it("follows the browser's reduced-motion setting until the player chooses", () => {
    expect(parseDisplaySettings(null, true).reducedMotion).toBe(true);
    expect(parseDisplaySettings('{"reducedMotion":false}', true).reducedMotion).toBe(false);
  });

  it("reads stored choices", () => {
    expect(parseDisplaySettings('{"largeText":true,"quality":"low"}', false)).toMatchObject({
      largeText: true,
      quality: "low",
    });
  });

  it("repairs nonsense and damaged text", () => {
    expect(parseDisplaySettings('{"quality":"ultra","largeText":"yes","reducedMotion":5}', false)).toEqual(defaults);
    expect(parseDisplaySettings("{oops", false)).toEqual(defaults);
    expect(parseDisplaySettings("[1,2]", false)).toEqual(defaults);
  });
});
