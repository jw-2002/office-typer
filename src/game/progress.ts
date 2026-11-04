// The player's progress (money, upgrades, stats) and the pure steps that change it: finish an assignment, buy an upgrade.
import type { Job } from "./data/jobs";
import { startingUpgradeIds, upgrades, type Upgrade } from "./data/upgrades";
import { jobFor, payout } from "./economy";
import { accuracy, finalWpm, type TypingState } from "./typing";

export type Stats = {
  /** Correct characters typed in finished assignments. Drives promotions. */
  totalChars: number;
  assignmentsCompleted: number;
  /** Best whole-assignment WPM, from finished assignments only. */
  bestWpm: number;
  /** Credits earned over the whole game, spending not subtracted. */
  totalEarned: number;
};

export type Progress = {
  player: { currency: number };
  /** Ids of owned upgrades. */
  upgrades: readonly string[];
  stats: Stats;
};

/** What a finished assignment looked like. Built from the typing state by the caller. */
export type AssignmentResult = { characters: number; accuracy: number; wpm: number };

/** Summarises a finished typing run. */
export function assignmentResult(typing: TypingState, now: number): AssignmentResult {
  return { characters: typing.cursor, accuracy: accuracy(typing), wpm: finalWpm(typing, now) };
}

export type Reward = { payout: number; promotedTo: Job | null };

export function newProgress(): Progress {
  return {
    player: { currency: 0 },
    upgrades: startingUpgradeIds,
    stats: { totalChars: 0, assignmentsCompleted: 0, bestWpm: 0, totalEarned: 0 },
  };
}

export function currentJob(progress: Progress): Job {
  return jobFor(progress.stats.totalChars);
}

/** Pays out a finished assignment, updates stats and reports a promotion if the job changed. */
export function completeAssignment(
  progress: Progress,
  result: AssignmentResult,
): { progress: Progress; reward: Reward } {
  const before = currentJob(progress);
  const credits = payout({
    characters: result.characters,
    accuracy: result.accuracy,
    job: before,
    ownedUpgradeIds: progress.upgrades,
  });
  const next: Progress = {
    ...progress,
    player: { currency: progress.player.currency + credits },
    stats: {
      totalChars: progress.stats.totalChars + result.characters,
      assignmentsCompleted: progress.stats.assignmentsCompleted + 1,
      bestWpm: Math.max(progress.stats.bestWpm, result.wpm),
      totalEarned: progress.stats.totalEarned + credits,
    },
  };
  const after = currentJob(next);
  return { progress: next, reward: { payout: credits, promotedTo: after.id === before.id ? null : after } };
}

export type BuyStatus = "ok" | "owned" | "locked" | "too-expensive";

/** Why an upgrade can or cannot be bought. "locked" means the previous tier in its category is not owned yet. */
export function buyStatus(progress: Progress, upgrade: Upgrade): BuyStatus {
  if (progress.upgrades.includes(upgrade.id)) return "owned";
  const tiers: readonly Upgrade[] = upgrades.filter((other) => other.category === upgrade.category);
  const previous = tiers[tiers.findIndex((tier) => tier.id === upgrade.id) - 1];
  if (previous && !progress.upgrades.includes(previous.id)) return "locked";
  return progress.player.currency >= upgrade.cost ? "ok" : "too-expensive";
}

/** Buys an upgrade, or returns the same progress object when it cannot be bought. */
export function buyUpgrade(progress: Progress, upgradeId: string): Progress {
  const upgrade: Upgrade | undefined = upgrades.find((candidate) => candidate.id === upgradeId);
  if (!upgrade || buyStatus(progress, upgrade) !== "ok") return progress;
  return {
    ...progress,
    player: { currency: progress.player.currency - upgrade.cost },
    upgrades: [...progress.upgrades, upgrade.id],
  };
}
