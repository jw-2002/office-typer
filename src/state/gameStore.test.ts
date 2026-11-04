// Tests that the store wires the game rules to its actions.
import { beforeEach, describe, expect, it } from "vitest";
import { newProgress } from "@/game/progress";
import { progressOf, useGameStore } from "./gameStore";

beforeEach(() => useGameStore.getState().load(newProgress()));

describe("game store", () => {
  it("finishing an assignment pays out and remembers the reward", () => {
    useGameStore.getState().finishAssignment({ characters: 120, accuracy: 1, wpm: 50 });
    const state = useGameStore.getState();
    expect(state.player.currency).toBe(30);
    expect(state.lastReward?.payout).toBe(30);
    expect(state.stats.assignmentsCompleted).toBe(1);
  });

  it("buys upgrades through one action, and ignores ones it cannot afford", () => {
    useGameStore.getState().buy("strawberry");
    expect(useGameStore.getState().upgrades).not.toContain("strawberry");

    useGameStore.getState().load({ ...newProgress(), player: { currency: 100 } });
    useGameStore.getState().buy("strawberry");
    expect(useGameStore.getState().upgrades).toContain("strawberry");
    expect(useGameStore.getState().player.currency).toBe(40);
  });

  it("progressOf leaves out actions and the last reward", () => {
    expect(Object.keys(progressOf(useGameStore.getState())).sort()).toEqual(["player", "stats", "upgrades"]);
  });
});
