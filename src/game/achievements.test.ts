// Tests for achievements: tidy data, and that they unlock when (and only when) the goal is met.
import { describe, expect, it } from "vitest";
import { newlyEarned, withAchievements } from "./achievements";
import { achievements } from "./data/achievements";
import { jobs } from "./data/jobs";
import { upgrades } from "./data/upgrades";
import { newProgress, type Progress } from "./progress";

const stats = (changes: Partial<Progress["stats"]>): Progress => ({
  ...newProgress(),
  stats: { ...newProgress().stats, ...changes },
});

describe("achievement data", () => {
  it("has unique, tidy ids and a name and description for each", () => {
    expect(new Set(achievements.map((a) => a.id)).size).toBe(achievements.length);
    for (const a of achievements) {
      expect(a.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(a.name.length).toBeGreaterThan(2);
      expect(a.description).toMatch(/[.!?]$/);
    }
  });

  it("starts with nothing earned", () => {
    expect(newlyEarned(newProgress())).toEqual([]);
  });

  it("can all be earned by someone who has done everything", () => {
    const everything: Progress = {
      ...newProgress(),
      upgrades: upgrades.map((u) => u.id),
      legacy: 1,
      stats: {
        totalChars: jobs[jobs.length - 1].minChars,
        assignmentsCompleted: 99,
        bestWpm: 150,
        totalEarned: 1_000_000,
        secondsPlayed: 1000,
        streak: 10,
        goblinUses: 9,
        bestStreak: 12,
        perfectLongs: 2,
        presents: 3,
        cardsSigned: 3,
        eventsHandled: 6,
      },
    };
    expect(newlyEarned(everything).sort()).toEqual(achievements.map((a) => a.id).sort());
  });
});

describe("unlocking", () => {
  it("unlocks the achievements whose goals are met", () => {
    expect(newlyEarned(stats({ assignmentsCompleted: 1 }))).toEqual(["first-words"]);
    expect(newlyEarned(stats({ goblinUses: 1 }))).toContain("poke-the-goblin");
    expect(newlyEarned(stats({ presents: 1 }))).toContain("whip-round");
    expect(newlyEarned(stats({ cardsSigned: 1 }))).toContain("sign-here");
  });

  it("adds them once, and keeps the same object when there is nothing new", () => {
    const first = withAchievements(stats({ assignmentsCompleted: 1 }));
    expect(first.achievements).toEqual(["first-words"]);
    expect(withAchievements(first)).toBe(first);
  });

  it("keeps an earned achievement even if the stat is later reset (a new career)", () => {
    const earned: Progress = { ...newProgress(), achievements: ["first-words"] };
    expect(withAchievements(earned).achievements).toEqual(["first-words"]);
  });
});
