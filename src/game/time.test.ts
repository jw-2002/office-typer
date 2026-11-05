// Tests for the fast office clock.
import { describe, expect, it } from "vitest";
import {
  CLOCK_MINUTES_PER_SECOND as RATE,
  MINUTES_PER_DAY,
  START_MINUTES,
  dayNumber,
  formatClock,
  timeOfDay,
} from "./time";

describe("timeOfDay", () => {
  it("starts at eight in the morning", () => {
    expect(timeOfDay(0)).toBe(START_MINUTES);
    expect(formatClock(timeOfDay(0))).toBe("08:00");
  });

  it("runs at the clock rate", () => {
    expect(timeOfDay(1)).toBe(START_MINUTES + RATE);
    expect(timeOfDay(60)).toBe(START_MINUTES + 60 * RATE);
    expect(formatClock(timeOfDay((4 * 60) / RATE))).toBe("12:00");
  });

  it("a whole day takes a few minutes of play, then starts again", () => {
    const daySeconds = MINUTES_PER_DAY / RATE;
    expect(daySeconds).toBeLessThanOrEqual(600);
    expect(timeOfDay(daySeconds)).toBe(START_MINUTES);
    expect(timeOfDay(daySeconds * 3 + 30)).toBe(START_MINUTES + 30 * RATE);
  });

  it("copes with odd input", () => {
    expect(timeOfDay(-5)).toBe(START_MINUTES - 5 * RATE);
    expect(timeOfDay(-(START_MINUTES + 1) / RATE)).toBe(MINUTES_PER_DAY - 1);
  });
});

describe("formatClock", () => {
  it("pads hours and minutes", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(5)).toBe("00:05");
    expect(formatClock(485)).toBe("08:05");
    expect(formatClock(1439)).toBe("23:59");
  });

  it("wraps past midnight and drops fractions", () => {
    expect(formatClock(1440 + 61.9)).toBe("01:01");
    expect(formatClock(-1)).toBe("23:59");
  });
});

describe("dayNumber", () => {
  it("counts days from the 8:00 start, changing at midnight", () => {
    expect(dayNumber(0)).toBe(0);
    const toMidnight = (16 * 60) / RATE;
    expect(dayNumber(toMidnight - 1)).toBe(0);
    expect(dayNumber(toMidnight)).toBe(1);
    expect(dayNumber(toMidnight + MINUTES_PER_DAY / RATE)).toBe(2);
  });
});
