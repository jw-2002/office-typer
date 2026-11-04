// Tests for payouts, multipliers, promotions and number formatting.
import { describe, expect, it } from "vitest";
import { jobs } from "./data/jobs";
import { upgrades } from "./data/upgrades";
import {
  BASE_PAYOUT_PER_CHAR,
  accuracyMultiplier,
  bestOwned,
  formatNumber,
  jobFor,
  nextJob,
  payout,
  upgradeMultiplier,
} from "./economy";

describe("accuracyMultiplier", () => {
  it("pays in full at 100% and punishes mistakes", () => {
    expect(accuracyMultiplier(1)).toBe(1);
    expect(accuracyMultiplier(0.9)).toBeCloseTo(0.81);
    expect(accuracyMultiplier(0)).toBe(0);
  });

  it("clamps out-of-range values", () => {
    expect(accuracyMultiplier(2)).toBe(1);
    expect(accuracyMultiplier(-1)).toBe(0);
  });
});

describe("bestOwned", () => {
  it("gives the highest tier owned in a category", () => {
    expect(bestOwned(["beige-box", "grey-tower", "mushy"], "computer")?.id).toBe("grey-tower");
    expect(bestOwned(["beige-box", "mushy", "strawberry"], "switches")?.id).toBe("strawberry");
  });

  it("gives undefined when nothing in the category is owned", () => {
    expect(bestOwned([], "computer")).toBeUndefined();
  });
});

describe("computers", () => {
  it("each has an operating system", () => {
    for (const upgrade of upgrades.filter((u) => u.category === "computer")) expect(upgrade.os).toBeDefined();
  });
});

describe("upgradeMultiplier", () => {
  it("is 1 with only the starting upgrades", () => {
    expect(upgradeMultiplier(["beige-box", "mushy"])).toBe(1);
  });

  it("uses only the best owned upgrade in each category, multiplied across categories", () => {
    const owned = ["beige-box", "grey-tower", "silver-laptop", "mushy", "strawberry"];
    expect(upgradeMultiplier(owned)).toBeCloseTo(1.7 * 1.15);
  });

  it("ignores unknown ids", () => {
    expect(upgradeMultiplier(["nope"])).toBe(1);
  });
});

describe("payout", () => {
  it("is base rate times characters for a perfect run at the first job", () => {
    expect(payout({ characters: 120, accuracy: 1, job: jobs[0], ownedUpgradeIds: [] })).toBe(
      120 * BASE_PAYOUT_PER_CHAR,
    );
  });

  it("scales with job, accuracy and upgrades", () => {
    const base = payout({ characters: 400, accuracy: 1, job: jobs[0], ownedUpgradeIds: [] });
    expect(payout({ characters: 400, accuracy: 1, job: jobs[3], ownedUpgradeIds: [] })).toBe(base * 2);
    expect(payout({ characters: 400, accuracy: 0.5, job: jobs[0], ownedUpgradeIds: [] })).toBe(base * 0.25);
    expect(payout({ characters: 400, accuracy: 1, job: jobs[0], ownedUpgradeIds: ["grey-tower"] })).toBe(
      Math.round(base * 1.3),
    );
  });

  it("pays about the same per character whatever the length", () => {
    const perChar = (characters: number) =>
      payout({ characters, accuracy: 1, job: jobs[0], ownedUpgradeIds: [] }) / characters;
    expect(perChar(450)).toBeCloseTo(perChar(120), 1);
  });
});

describe("jobs", () => {
  it("are listed in increasing order of requirement and pay", () => {
    for (let i = 1; i < jobs.length; i++) {
      expect(jobs[i].minChars).toBeGreaterThan(jobs[i - 1].minChars);
      expect(jobs[i].payoutMultiplier).toBeGreaterThan(jobs[i - 1].payoutMultiplier);
      expect(jobs[i].assignmentTier).toBeGreaterThanOrEqual(jobs[i - 1].assignmentTier);
    }
    expect(jobs[0].minChars).toBe(0);
  });

  it("jobFor picks the highest job whose threshold is reached", () => {
    expect(jobFor(0).id).toBe("intern");
    expect(jobFor(999).id).toBe("intern");
    expect(jobFor(1000).id).toBe("data-entry-clerk");
    expect(jobFor(10_000_000).id).toBe("chief-typing-executive");
  });

  it("nextJob gives the following job, and null at the top", () => {
    expect(nextJob(jobs[0])?.id).toBe("data-entry-clerk");
    expect(nextJob(jobs[jobs.length - 1])).toBeNull();
  });
});

describe("formatNumber", () => {
  it("shows small numbers whole", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(950.9)).toBe("950");
  });

  it("abbreviates large numbers", () => {
    expect(formatNumber(1000)).toBe("1K");
    expect(formatNumber(1234)).toBe("1.2K");
    expect(formatNumber(45_678)).toBe("45.6K");
    expect(formatNumber(123_456)).toBe("123K");
    expect(formatNumber(3_400_000)).toBe("3.4M");
  });
});
