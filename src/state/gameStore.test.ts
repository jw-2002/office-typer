// Tests that the store wires the game rules to its actions.
import { beforeEach, describe, expect, it } from "vitest";
import { newProgress } from "@/game/progress";
import { progressOf, useGameStore } from "./gameStore";

beforeEach(() => useGameStore.getState().load(newProgress()));

describe("game store", () => {
  it("finishing an assignment pays out and remembers the reward", () => {
    useGameStore.getState().finishAssignment({ characters: 120, accuracy: 1, wpm: 50, length: "short" });
    const state = useGameStore.getState();
    expect(state.player.currency).toBe(30);
    expect(state.lastReward?.payout).toBe(30);
    expect(state.stats.assignmentsCompleted).toBe(1);
  });

  it("buys upgrades through one action, and ignores ones it cannot afford", () => {
    useGameStore.getState().buy("strawberry");
    expect(useGameStore.getState().upgrades).not.toContain("strawberry");

    useGameStore.getState().load({ ...newProgress(), player: { name: "", currency: 100 } });
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

  it("dismissPromotion clears the promotion but keeps the payout", () => {
    useGameStore.getState().finishAssignment({ characters: 400, accuracy: 1, wpm: 50, length: "short" });
    expect(useGameStore.getState().lastReward?.promotedTo?.id).toBe("data-entry-clerk");
    useGameStore.getState().dismissPromotion();
    expect(useGameStore.getState().lastReward?.promotedTo).toBeNull();
    expect(useGameStore.getState().lastReward?.payout).toBe(100);
  });

  it("reset erases progress, upgrades and the last reward", () => {
    useGameStore
      .getState()
      .load({ ...newProgress(), player: { name: "", currency: 500 }, upgrades: ["beige-box", "grey-tower", "mushy"] });
    useGameStore.getState().finishAssignment({ characters: 120, accuracy: 1, wpm: 50, length: "short" });
    useGameStore.getState().reset();
    const state = useGameStore.getState();
    expect(state.player.currency).toBe(0);
    expect(state.upgrades).toEqual(newProgress().upgrades);
    expect(state.equipped).toEqual(newProgress().equipped);
    expect(state.stats).toEqual(newProgress().stats);
    expect(state.lastReward).toBeNull();
  });

  it("tick makes the assistant earn and runs the clock", () => {
    useGameStore.getState().load({
      ...newProgress(),
      upgrades: [...newProgress().upgrades, "gippity-1"],
      equipped: { ...newProgress().equipped, assistant: "gippity-1" },
    });
    useGameStore.getState().tick(5);
    expect(useGameStore.getState().player.currency).toBeGreaterThan(0);
    expect(useGameStore.getState().stats.secondsPlayed).toBe(5);
  });

  it("once made redundant, nothing pays out or can be bought", () => {
    useGameStore
      .getState()
      .load({ ...newProgress(), player: { name: "", currency: 500 }, finale: { stage: "redundant", seconds: 0 } });
    useGameStore.getState().finishAssignment({ characters: 120, accuracy: 1, wpm: 50, length: "short" });
    useGameStore.getState().buy("strawberry");
    useGameStore.getState().tick(10);
    const state = useGameStore.getState();
    expect(state.player.currency).toBe(500);
    expect(state.upgrades).not.toContain("strawberry");
    expect(state.stats.secondsPlayed).toBe(0);
  });

  it("progressOf leaves out actions and the last reward", () => {
    expect(Object.keys(progressOf(useGameStore.getState())).sort()).toEqual([
      "equipped",
      "finale",
      "player",
      "stats",
      "upgrades",
    ]);
  });
});
