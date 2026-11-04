// Tests for the time-of-day lighting.
import { describe, expect, it } from "vitest";
import { daylightAt, isDark, nightness, skySpot } from "./daylight";

const hour = (h: number) => h * 60;
const brightness = (hex: string) =>
  parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16);

describe("daylightAt", () => {
  it("is brightest at noon, dimmer at dawn and dusk, dimmest at night", () => {
    expect(daylightAt(hour(12)).intensity).toBeGreaterThan(daylightAt(hour(7)).intensity);
    expect(daylightAt(hour(7)).intensity).toBeGreaterThan(daylightAt(hour(2)).intensity);
    expect(daylightAt(hour(12)).intensity).toBeGreaterThan(daylightAt(hour(18)).intensity);
    expect(daylightAt(hour(12)).ambientIntensity).toBeGreaterThan(daylightAt(hour(0)).ambientIntensity);
  });

  it("has a bright sky by day and a dark one at night", () => {
    expect(brightness(daylightAt(hour(12)).sky)).toBeGreaterThan(brightness(daylightAt(hour(0)).sky) * 2);
  });

  it("is warm and orange at sunrise and sunset, and blue by moonlight", () => {
    const sunrise = daylightAt(hour(6.5)).color;
    const night = daylightAt(hour(1)).color;
    const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
    expect(channel(sunrise, 0)).toBeGreaterThan(channel(sunrise, 2));
    expect(channel(night, 2)).toBeGreaterThan(channel(night, 0));
  });

  it("always shines from above, from a direction of length one", () => {
    for (let minutes = 0; minutes < 1440; minutes += 15) {
      const [x, y, z] = daylightAt(minutes).direction;
      expect(y, `minute ${minutes}`).toBeGreaterThan(0.1);
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 5);
    }
  });

  it("always comes from behind the desk, through the window in the back wall", () => {
    for (let minutes = 0; minutes < 1440; minutes += 15) {
      expect(daylightAt(minutes).direction[2], `minute ${minutes}`).toBeLessThan(-0.1);
    }
  });

  it("swings across the sky during the day, left in the morning to right in the evening", () => {
    expect(daylightAt(hour(7)).direction[0]).toBeLessThan(-0.3);
    expect(Math.abs(daylightAt(hour(12)).direction[0])).toBeLessThan(0.1);
    expect(daylightAt(hour(17)).direction[0]).toBeGreaterThan(0.3);
  });

  it("is highest at noon", () => {
    expect(daylightAt(hour(12)).direction[1]).toBeGreaterThan(daylightAt(hour(8)).direction[1]);
    expect(daylightAt(hour(12)).direction[1]).toBeGreaterThan(daylightAt(hour(16.5)).direction[1]);
  });

  it("changes smoothly: a minute never makes the light jump", () => {
    let previous = daylightAt(0);
    for (let minutes = 1; minutes <= 1440; minutes++) {
      const now = daylightAt(minutes);
      expect(Math.abs(now.intensity - previous.intensity), `minute ${minutes}`).toBeLessThan(0.05);
      const move = Math.hypot(
        now.direction[0] - previous.direction[0],
        now.direction[1] - previous.direction[1],
        now.direction[2] - previous.direction[2],
      );
      expect(move, `minute ${minutes}`).toBeLessThan(0.05);
      previous = now;
    }
  });

  it("wraps around midnight, so day after day looks the same", () => {
    expect(daylightAt(1440 + hour(9))).toEqual(daylightAt(hour(9)));
    expect(daylightAt(-60)).toEqual(daylightAt(hour(23)));
  });
});

describe("isDark", () => {
  it("is dark at night and light in the day", () => {
    expect(isDark(hour(2))).toBe(true);
    expect(isDark(hour(23))).toBe(true);
    expect(isDark(hour(12))).toBe(false);
    expect(isDark(hour(9))).toBe(false);
  });
});

describe("skySpot", () => {
  it("is the sun by day and the moon by night", () => {
    expect(skySpot(hour(12)).body).toBe("sun");
    expect(skySpot(hour(2)).body).toBe("moon");
    expect(skySpot(hour(20)).body).toBe("moon");
  });

  it("moves left to right across the sky by day, and matches the side the light comes from", () => {
    expect(skySpot(hour(7)).across).toBeLessThan(skySpot(hour(12)).across);
    expect(skySpot(hour(12)).across).toBeLessThan(skySpot(hour(17)).across);
    for (let minutes = 0; minutes < 1440; minutes += 20) {
      const { across } = skySpot(minutes);
      const light = daylightAt(minutes).direction[0];
      // The sun is on the same side of the window as the light's sideways direction.
      if (Math.abs(across) > 0.15) expect(Math.sign(across), `minute ${minutes}`).toBe(Math.sign(light));
    }
  });

  it("is highest at noon and low at dawn and dusk", () => {
    expect(skySpot(hour(12)).height).toBeCloseTo(1, 1);
    expect(skySpot(hour(6.5)).height).toBeLessThan(0.3);
    expect(skySpot(hour(17.5)).height).toBeLessThan(0.3);
  });
});

describe("nightness", () => {
  it("is 0 by day, 1 at night, and fades in between", () => {
    expect(nightness(hour(12))).toBe(0);
    expect(nightness(hour(1))).toBe(1);
    expect(nightness(hour(23))).toBe(1);
    const dusk = nightness(hour(19));
    expect(dusk).toBeGreaterThan(0);
    expect(dusk).toBeLessThan(1);
  });
});
