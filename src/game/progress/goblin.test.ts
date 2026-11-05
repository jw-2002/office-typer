// Tests for goblin mode: starting it, its timers and its cooldown.
import { describe, expect, it } from "vitest";
import { newProgress, type Progress } from "./progress";
import { GOBLIN_COOLDOWN_SECONDS, GOBLIN_SECONDS, goblinActive, goblinReady, startGoblinMode } from "./goblin";
import { completeAssignment, tickGame } from "./gameplay";

const perfect = (characters: number) => ({ characters, accuracy: 1, wpm: 60, length: "short" as const });

describe("goblin mode", () => {
  it("is ready at the start of a game, and starting it turns it on with a cooldown", () => {
    const start = newProgress();
    expect(goblinReady(start)).toBe(true);
    const on = startGoblinMode(start);
    expect(goblinActive(on)).toBe(true);
    expect(on.stats.goblinUses).toBe(1);
    expect(on.goblin).toEqual({ active: GOBLIN_SECONDS, cooldown: GOBLIN_COOLDOWN_SECONDS });
    expect(goblinReady(on)).toBe(false);
  });

  it("cannot be started again while it is on or cooling down", () => {
    const on = startGoblinMode(newProgress());
    expect(startGoblinMode(on)).toBe(on);
    const off = tickGame(on, GOBLIN_SECONDS + 1);
    expect(goblinActive(off)).toBe(false);
    expect(startGoblinMode(off)).toBe(off);
  });

  it("turns off after its time, and is ready again after the cooldown, counted from the start", () => {
    let progress = startGoblinMode(newProgress());
    progress = tickGame(progress, GOBLIN_SECONDS);
    expect(progress.goblin.active).toBe(0);
    expect(progress.goblin.cooldown).toBe(GOBLIN_COOLDOWN_SECONDS - GOBLIN_SECONDS);
    progress = tickGame(progress, GOBLIN_COOLDOWN_SECONDS - GOBLIN_SECONDS);
    expect(goblinReady(progress)).toBe(true);
    expect(goblinActive(startGoblinMode(progress))).toBe(true);
  });

  it("pays ten times for a goblin assignment, and a bit extra for the document of the day", () => {
    const plain = completeAssignment(newProgress(), perfect(400)).reward.payout;
    const goblin = completeAssignment(newProgress(), { ...perfect(400), goblin: true }).reward.payout;
    const featured = completeAssignment(newProgress(), { ...perfect(400), featured: true }).reward.payout;
    expect(goblin).toBe(plain * 10);
    expect(featured).toBe(Math.round(plain * 1.5));
  });

  it("does nothing once made redundant", () => {
    const over: Progress = { ...newProgress(), finale: { stage: "redundant", seconds: 0 } };
    expect(startGoblinMode(over)).toBe(over);
  });
});
