// Checks the whole game's pacing: a slow, a medium and a fast typist all finish in a sensible time.
import { describe, expect, it } from "vitest";
import { simulateGame } from "./simulate";

const minutes = (wpm: number) => simulateGame({ wpm, accuracy: 0.96, length: "standard" }).seconds / 60;

describe("game pacing", () => {
  it("takes a fast typist about 15 to 25 minutes", () => {
    expect(minutes(100)).toBeGreaterThan(12);
    expect(minutes(100)).toBeLessThan(28);
  });

  it("takes an average typist about 25 to 40 minutes", () => {
    expect(minutes(60)).toBeGreaterThan(20);
    expect(minutes(60)).toBeLessThan(42);
  });

  it("takes a slow typist no more than about an hour", () => {
    expect(minutes(40)).toBeLessThan(62);
  });

  it("is quicker for a faster typist", () => {
    expect(minutes(100)).toBeLessThan(minutes(60));
    expect(minutes(60)).toBeLessThan(minutes(40));
  });

  it("gives the first purchase within the first couple of minutes", () => {
    const { purchases } = simulateGame({ wpm: 60, accuracy: 0.96, length: "standard" });
    expect(purchases[0].at).toBeLessThan(150);
  });
});
