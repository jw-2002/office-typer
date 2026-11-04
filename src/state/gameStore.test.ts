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

  it("equips an owned computer and ignores one that is not owned", () => {
    useGameStore.getState().load({ ...newProgress(), upgrades: ["beige-box", "grey-tower", "mushy"] });
    useGameStore.getState().equip("grey-tower");
    expect(useGameStore.getState().equipped.computer).toBe("grey-tower");
    useGameStore.getState().equip("gaming-rig");
    expect(useGameStore.getState().equipped.computer).toBe("grey-tower");
  });

  it("reset erases progress, upgrades and the last reward", () => {
    useGameStore
      .getState()
      .load({ ...newProgress(), player: { currency: 500 }, upgrades: ["beige-box", "grey-tower", "mushy"] });
    useGameStore.getState().finishAssignment({ characters: 120, accuracy: 1, wpm: 50 });
    useGameStore.getState().reset();
    const state = useGameStore.getState();
    expect(state.player.currency).toBe(0);
    expect(state.upgrades).toEqual(newProgress().upgrades);
    expect(state.equipped).toEqual(newProgress().equipped);
    expect(state.stats).toEqual(newProgress().stats);
    expect(state.lastReward).toBeNull();
  });

  it("progressOf leaves out actions and the last reward", () => {
    expect(Object.keys(progressOf(useGameStore.getState())).sort()).toEqual([
      "equipped",
      "player",
      "stats",
      "upgrades",
    ]);
  });
});
