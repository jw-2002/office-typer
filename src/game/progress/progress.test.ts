// Tests for the shape of progress: a fresh start, careers and ranks, the name and what counts as changed.
import { describe, expect, it } from "vitest";
import {
  MAX_NAME_LENGTH,
  careerRank,
  cleanPlayerName,
  newProgress,
  progressChanged,
  setPlayerName,
  startNewCareer,
  type Progress,
} from "./progress";
import { buyUpgrade, equipUpgrade } from "./shop";
import { completeAssignment } from "./gameplay";

const perfect = (characters: number) => ({ characters, accuracy: 1, wpm: 60, length: "short" as const });
const withCredits = (currency: number): Progress => ({ ...newProgress(), player: { name: "", currency: currency } });

describe("careerRank", () => {
  it("is empty on the first career and grows with experience", () => {
    expect([0, 1, 3, 6, 10].map(careerRank)).toEqual(["", "Veteran", "Old Hand", "Office Legend", "Fixture"]);
  });
});

describe("progressChanged", () => {
  it("notices a change to any saved part, including what is equipped", () => {
    const start = newProgress();
    expect(progressChanged(start, { ...start })).toBe(false);
    expect(progressChanged(start, { ...start, player: { name: "", currency: 1 } })).toBe(true);
    expect(progressChanged(start, { ...start, stats: { ...start.stats } })).toBe(true);
    expect(progressChanged(start, { ...start, equipped: { ...start.equipped } })).toBe(true);
    expect(progressChanged(start, equipUpgrade(buyUpgrade(withCredits(100), "grey-tower"), "beige-box"))).toBe(true);
  });
});

describe("player name", () => {
  it("starts empty and is tidied when set", () => {
    expect(newProgress().player.name).toBe("");
    expect(cleanPlayerName("  Mary   Jane  ")).toBe("Mary Jane");
    expect(cleanPlayerName("Zo\u00eb")).toBe("Zo");
    expect(cleanPlayerName("x".repeat(50))).toHaveLength(MAX_NAME_LENGTH);
  });

  it("sets a name, ignores an empty one, and keeps the money", () => {
    const rich = { ...newProgress(), player: { name: "", currency: 40 } };
    const named = setPlayerName(rich, " Dolores ");
    expect(named.player).toEqual({ name: "Dolores", currency: 40 });
    expect(setPlayerName(named, "   ")).toBe(named);
  });
});

describe("new careers and stats", () => {
  it("keeps the name, achievements and a growing legacy, and wipes the rest", () => {
    const old: Progress = {
      ...withCredits(500),
      player: { name: "Bo", currency: 500 },
      upgrades: ["beige-box", "mushy", "strawberry"],
      achievements: ["first-words"],
      legacy: 1,
    };
    const next = startNewCareer(old);
    expect(next.player).toEqual({ name: "Bo", currency: 0 });
    expect(next.legacy).toBe(2);
    expect(next.achievements).toEqual(["first-words"]);
    expect(next.upgrades).toEqual(newProgress().upgrades);
    expect(next.stats.totalChars).toBe(0);
  });

  it("pays more in a later career", () => {
    const first = completeAssignment(newProgress(), perfect(400)).reward.payout;
    const second = completeAssignment({ ...newProgress(), legacy: 3 }, perfect(400)).reward.payout;
    expect(second).toBe(Math.round(first * 1.3));
  });

  it("tracks the best streak and perfect Long assignments", () => {
    const clean = { characters: 100, accuracy: 1, wpm: 60, length: "long" as const };
    let progress = completeAssignment(newProgress(), clean).progress;
    progress = completeAssignment(progress, clean).progress;
    progress = completeAssignment(progress, { ...clean, accuracy: 0.5 }).progress;
    expect(progress.stats).toMatchObject({ streak: 0, bestStreak: 2, perfectLongs: 2 });
  });
});
