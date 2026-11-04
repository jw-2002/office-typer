// Tests for finishing assignments and buying upgrades.
import { describe, expect, it } from "vitest";
import { upgrades } from "./data/upgrades";
import { buyStatus, buyUpgrade, completeAssignment, currentJob, newProgress, type Progress } from "./progress";

const perfect = (characters: number) => ({ characters, accuracy: 1, wpm: 60 });
const upgrade = (id: string) => upgrades.find((candidate) => candidate.id === id)!;
const withCredits = (currency: number): Progress => ({ ...newProgress(), player: { currency } });

describe("completeAssignment", () => {
  it("pays out and updates stats", () => {
    const { progress, reward } = completeAssignment(newProgress(), perfect(120));
    expect(reward.payout).toBe(30);
    expect(progress.player.currency).toBe(30);
    expect(progress.stats).toEqual({ totalChars: 120, assignmentsCompleted: 1, bestWpm: 60, totalEarned: 30 });
    expect(reward.promotedTo).toBeNull();
  });

  it("keeps the best WPM and does not lose it on a slower run", () => {
    const fast = completeAssignment(newProgress(), { characters: 120, accuracy: 1, wpm: 90 }).progress;
    const slow = completeAssignment(fast, { characters: 120, accuracy: 1, wpm: 40 }).progress;
    expect(slow.stats.bestWpm).toBe(90);
  });

  it("promotes when total characters cross a threshold, once", () => {
    let progress = completeAssignment(newProgress(), perfect(900)).progress;
    const promoted = completeAssignment(progress, perfect(120));
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

describe("buyStatus and buyUpgrade", () => {
  it("starts owning the free upgrades", () => {
    expect(buyStatus(newProgress(), upgrade("beige-box"))).toBe("owned");
    expect(buyStatus(newProgress(), upgrade("mushy"))).toBe("owned");
  });

  it("reports too-expensive, ok and locked", () => {
    expect(buyStatus(withCredits(10), upgrade("strawberry"))).toBe("too-expensive");
    expect(buyStatus(withCredits(60), upgrade("strawberry"))).toBe("ok");
    expect(buyStatus(withCredits(99999), upgrade("chestnut"))).toBe("locked");
  });

  it("buys an upgrade, taking the cost", () => {
    const bought = buyUpgrade(withCredits(100), "strawberry");
    expect(bought.upgrades).toContain("strawberry");
    expect(bought.player.currency).toBe(40);
  });

  it("will not buy twice, when poor, when locked, or an unknown id", () => {
    const start = withCredits(100);
    const once = buyUpgrade(start, "strawberry");
    expect(buyUpgrade(once, "strawberry")).toBe(once);
    expect(buyUpgrade(withCredits(10), "strawberry").upgrades).not.toContain("strawberry");
    expect(buyUpgrade(withCredits(99999), "chestnut").upgrades).not.toContain("chestnut");
    expect(buyUpgrade(start, "nope")).toBe(start);
  });

  it("lets tiers be bought in order", () => {
    let progress = withCredits(1000);
    progress = buyUpgrade(progress, "strawberry");
    expect(buyStatus(progress, upgrade("chestnut"))).toBe("ok");
    progress = buyUpgrade(progress, "chestnut");
    expect(progress.upgrades).toContain("chestnut");
  });
});
