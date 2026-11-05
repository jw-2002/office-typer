// Tests for finishing assignments, streaks, the AI assistants' earnings and the ending.
import { describe, expect, it } from "vitest";
import { jobs } from "@/game/data/jobs";
import { upgrades } from "@/game/data/upgrades";
import { FINALE_FALLBACK_SECONDS, currentJob, newProgress, type Progress } from "./progress";
import { buyStatus, buyUpgrade, equipUpgrade } from "./shop";
import { assistantRate, completeAssignment, tickGame } from "./gameplay";

const perfect = (characters: number) => ({ characters, accuracy: 1, wpm: 60, length: "short" as const });
const upgrade = (id: string) => upgrades.find((candidate) => candidate.id === id)!;
const withCredits = (currency: number): Progress => ({ ...newProgress(), player: { name: "", currency: currency } });

describe("completeAssignment", () => {
  it("pays out and updates stats", () => {
    const { progress, reward } = completeAssignment(newProgress(), perfect(120));
    expect(reward.payout).toBe(30);
    expect(progress.player.currency).toBe(30);
    expect(progress.stats).toMatchObject({
      totalChars: 120,
      assignmentsCompleted: 1,
      bestWpm: 60,
      totalEarned: 30,
      secondsPlayed: 0,
      streak: 1,
      goblinUses: 0,
    });
    expect(reward.promotedTo).toBeNull();
  });

  it("keeps the best WPM and does not lose it on a slower run", () => {
    const fast = completeAssignment(newProgress(), {
      characters: 120,
      accuracy: 1,
      wpm: 90,
      length: "short" as const,
    }).progress;
    const slow = completeAssignment(fast, { characters: 120, accuracy: 1, wpm: 40, length: "short" as const }).progress;
    expect(slow.stats.bestWpm).toBe(90);
  });

  it("remembers the title of the fastest document, and keeps it when a slower one follows", () => {
    const run = (progress: Progress, wpm: number, title: string) =>
      completeAssignment(progress, { characters: 50, accuracy: 1, wpm, length: "short", title }).progress;
    const fast = run(run(newProgress(), 50, "Slow Memo"), 90, "Fast Memo");
    expect(fast.stats.bestDocument).toBe("Fast Memo");
    expect(run(fast, 40, "Later Memo").stats.bestDocument).toBe("Fast Memo");
  });

  it("promotes when total characters cross a threshold, once", () => {
    const threshold = jobs[1].minChars;
    let progress = completeAssignment(newProgress(), perfect(threshold - 20)).progress;
    const promoted = completeAssignment(progress, perfect(40));
    expect(promoted.reward.promotedTo?.id).toBe("data-entry-clerk");
    expect(currentJob(promoted.progress).id).toBe("data-entry-clerk");

    progress = promoted.progress;
    expect(completeAssignment(progress, perfect(120)).reward.promotedTo).toBeNull();
  });

  it("pays the job held before the assignment, not the one it earns", () => {
    const { reward } = completeAssignment(newProgress(), perfect(2000));
    expect(reward.payout).toBe(500);
  });

  it("does not change the progress it was given", () => {
    const start = newProgress();
    completeAssignment(start, perfect(120));
    expect(start).toEqual(newProgress());
  });
});

describe("AI assistants", () => {
  const withAssistant = (id: string, currency = 0): Progress => ({
    ...newProgress(),
    player: { name: "", currency: currency },
    upgrades: [...newProgress().upgrades, id],
    equipped: { ...newProgress().equipped, assistant: id },
  });

  it("starts with none, earning nothing", () => {
    expect(assistantRate(newProgress())).toBe(0);
    expect(tickGame(newProgress(), 10).player.currency).toBe(0);
  });

  it("is bought in order like other upgrades, and put to use at once", () => {
    expect(buyStatus(withCredits(99999), upgrade("drama-llama-7b"))).toBe("locked");
    const bought = buyUpgrade(withCredits(400), "gippity-1");
    expect(bought.equipped.assistant).toBe("gippity-1");
    expect(bought.player.currency).toBe(0);
  });

  it("earns each second, counts as earned and does not count toward promotion", () => {
    const progress = withAssistant("gippity-1");
    const after = tickGame(progress, 10);
    expect(assistantRate(progress)).toBeGreaterThan(0);
    expect(after.player.currency).toBeCloseTo(assistantRate(progress) * 10);
    expect(after.stats.totalEarned).toBeCloseTo(after.player.currency);
    expect(after.stats.secondsPlayed).toBe(10);
    expect(after.stats.totalChars).toBe(0);
  });

  it("uses the assistant in use, so you can go back to an older one", () => {
    const owned = {
      ...withAssistant("drama-llama-7b"),
      upgrades: [...newProgress().upgrades, "gippity-1", "drama-llama-7b"],
    };
    const faster = assistantRate(owned);
    const older = assistantRate(equipUpgrade(owned, "gippity-1"));
    expect(older).toBeGreaterThan(0);
    expect(older).toBeLessThan(faster);
  });
});

describe("the ending", () => {
  const top: Progress = {
    ...newProgress(),
    player: { name: "", currency: 200_000 },
    upgrades: [...newProgress().upgrades, "gippity-1", "drama-llama-7b", "gemstone-flash"],
  };

  it("buying the top assistant starts the countdown to redundancy", () => {
    expect(buyUpgrade(top, "clyde-octet-5").finale.stage).toBe("pending");
    expect(buyUpgrade(top, "gemstone-flash").finale.stage).toBe("none");
  });

  it("the next assignment finished after that is the last", () => {
    const pending = buyUpgrade(top, "clyde-octet-5");
    const done = completeAssignment(pending, perfect(120)).progress;
    expect(done.finale.stage).toBe("redundant");
    // It still paid out, since it was a real piece of work.
    expect(done.player.currency).toBeGreaterThan(pending.player.currency);
  });

  it("if the player stops typing, redundancy arrives after the fallback wait", () => {
    const pending = buyUpgrade(top, "clyde-octet-5");
    const early = tickGame(pending, FINALE_FALLBACK_SECONDS - 1);
    expect(early.finale.stage).toBe("pending");
    expect(tickGame(early, 2).finale.stage).toBe("redundant");
  });

  it("nothing earns or counts once redundant", () => {
    const redundant = tickGame(buyUpgrade(top, "clyde-octet-5"), FINALE_FALLBACK_SECONDS + 1);
    expect(redundant.finale.stage).toBe("redundant");
    expect(tickGame(redundant, 100)).toBe(redundant);
  });
});

describe("clean streak", () => {
  const clean = (characters: number) => ({ characters, accuracy: 0.99, wpm: 60, length: "short" as const });
  const sloppy = (characters: number) => ({ characters, accuracy: 0.9, wpm: 60, length: "short" as const });

  it("grows with each clean assignment and pays the bonus from the next one", () => {
    const first = completeAssignment(newProgress(), clean(400));
    expect(first.progress.stats.streak).toBe(1);
    expect(first.reward).toMatchObject({ streak: 1, bonusStreak: 0 });
    const second = completeAssignment(first.progress, clean(400));
    expect(second.progress.stats.streak).toBe(2);
    expect(second.reward.payout).toBeGreaterThan(first.reward.payout);
  });

  it("resets after a sloppy assignment", () => {
    const warm = completeAssignment(completeAssignment(newProgress(), clean(100)).progress, clean(100)).progress;
    expect(completeAssignment(warm, sloppy(100)).progress.stats.streak).toBe(0);
  });
});
