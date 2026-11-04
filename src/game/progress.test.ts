// Tests for finishing assignments and buying upgrades.
import { describe, expect, it } from "vitest";
import { upgrades } from "./data/upgrades";
import {
  buyStatus,
  buyUpgrade,
  completeAssignment,
  currentJob,
  equippedUpgrade,
  equipUpgrade,
  newProgress,
  normaliseEquipped,
  progressChanged,
  assistantRate,
  tickGame,
  FINALE_FALLBACK_SECONDS,
  type Progress,
} from "./progress";

const perfect = (characters: number) => ({ characters, accuracy: 1, wpm: 60, length: "short" as const });
const upgrade = (id: string) => upgrades.find((candidate) => candidate.id === id)!;
const withCredits = (currency: number): Progress => ({ ...newProgress(), player: { currency } });

describe("completeAssignment", () => {
  it("pays out and updates stats", () => {
    const { progress, reward } = completeAssignment(newProgress(), perfect(120));
    expect(reward.payout).toBe(30);
    expect(progress.player.currency).toBe(30);
    expect(progress.stats).toEqual({
      totalChars: 120,
      assignmentsCompleted: 1,
      bestWpm: 60,
      totalEarned: 30,
      secondsPlayed: 0,
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

  it("promotes when total characters cross a threshold, once", () => {
    let progress = completeAssignment(newProgress(), perfect(180)).progress;
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

describe("equipping", () => {
  it("starts with the free upgrades in use", () => {
    const progress = newProgress();
    expect(equippedUpgrade(progress, "computer")?.id).toBe("beige-box");
    expect(equippedUpgrade(progress, "switches")?.id).toBe("mushy");
  });

  it("puts a new purchase to use straight away", () => {
    const bought = buyUpgrade(withCredits(100), "grey-tower");
    expect(bought.equipped.computer).toBe("grey-tower");
    expect(bought.equipped.switches).toBe("mushy");
  });

  it("swaps between owned upgrades without changing what is owned or paid", () => {
    const bought = buyUpgrade(withCredits(100), "grey-tower");
    const back = equipUpgrade(bought, "beige-box");
    expect(back.equipped.computer).toBe("beige-box");
    expect(back.upgrades).toEqual(bought.upgrades);
    expect(back.player.currency).toBe(bought.player.currency);
  });

  it("will not equip something not owned, unknown, or already in use", () => {
    const start = newProgress();
    expect(equipUpgrade(start, "gaming-rig")).toBe(start);
    expect(equipUpgrade(start, "nope")).toBe(start);
    expect(equipUpgrade(start, "beige-box")).toBe(start);
  });

  it("normaliseEquipped repairs missing, unknown and unowned choices with the best owned", () => {
    const owned = ["beige-box", "grey-tower", "mushy"];
    expect(normaliseEquipped(owned, {})).toEqual({ computer: "grey-tower", switches: "mushy", assistant: "" });
    expect(normaliseEquipped(owned, { computer: "beige-box", switches: "blueberry" })).toEqual({
      computer: "beige-box",
      switches: "mushy",
      assistant: "",
    });
    // A switch is not a valid computer, even though it is owned.
    expect(normaliseEquipped(owned, { computer: "mushy" }).computer).toBe("grey-tower");
  });
});

describe("progressChanged", () => {
  it("notices a change to any saved part, including what is equipped", () => {
    const start = newProgress();
    expect(progressChanged(start, { ...start })).toBe(false);
    expect(progressChanged(start, { ...start, player: { currency: 1 } })).toBe(true);
    expect(progressChanged(start, { ...start, stats: { ...start.stats } })).toBe(true);
    expect(progressChanged(start, { ...start, equipped: { ...start.equipped } })).toBe(true);
    expect(progressChanged(start, equipUpgrade(buyUpgrade(withCredits(100), "grey-tower"), "beige-box"))).toBe(true);
  });
});

describe("AI assistants", () => {
  const withAssistant = (id: string, currency = 0): Progress => ({
    ...newProgress(),
    player: { currency },
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
    player: { currency: 200_000 },
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
