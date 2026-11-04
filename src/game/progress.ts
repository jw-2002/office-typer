// The player's progress (money, upgrades, stats) and the pure steps that change it: finish an assignment, buy an upgrade.
import type { Job } from "./data/jobs";
import { startingUpgradeIds, upgradeCategories, upgrades, type Upgrade, type UpgradeCategory } from "./data/upgrades";
import { assistantIncome, bestOwned, jobFor, payout } from "./economy";
import type { AssignmentLength } from "./assignments";
import { accuracy, finalWpm, type TypingState } from "./typing";

export type Stats = {
  /** Correct characters typed in finished assignments. Drives promotions. */
  totalChars: number;
  assignmentsCompleted: number;
  /** Best whole-assignment WPM, from finished assignments only. */
  bestWpm: number;
  /** Credits earned over the whole game, spending not subtracted. */
  totalEarned: number;
  /** Seconds the game has been open and running. How long a run took. */
  secondsPlayed: number;
};

/**
 * How the game ends. Buying the top AI assistant starts "pending": the next assignment finished (or a minute's wait)
 * makes the player redundant, and then nothing more earns.
 */
export type Finale = { stage: "none" | "pending" | "redundant"; seconds: number };

/** How long the player gets after buying the top assistant, if they stop typing, before they are made redundant. */
export const FINALE_FALLBACK_SECONDS = 60;

export type Progress = {
  player: { currency: number };
  /** Ids of owned upgrades. */
  upgrades: readonly string[];
  /**
   * The upgrade in use in each category. It only changes how things look and sound: payouts always use the
   * best upgrade owned, so swapping back to an old computer costs nothing.
   */
  equipped: Readonly<Record<UpgradeCategory, string>>;
  finale: Finale;
  stats: Stats;
};

/**
 * Works out the equipped upgrade for each category. A choice that is missing, unknown or not owned is
 * replaced by the best upgrade owned in that category.
 */
export function normaliseEquipped(
  ownedIds: readonly string[],
  wanted: Partial<Record<UpgradeCategory, unknown>>,
): Record<UpgradeCategory, string> {
  const pickFor = (category: UpgradeCategory): string => {
    const choice = wanted[category];
    const valid = upgrades.some((u) => u.id === choice && u.category === category) && ownedIds.includes(String(choice));
    return valid ? String(choice) : (bestOwned(ownedIds, category)?.id ?? "");
  };
  return Object.fromEntries(upgradeCategories.map((category) => [category, pickFor(category)])) as Record<
    UpgradeCategory,
    string
  >;
}

/** The upgrade in use in a category, which the scene and the UI draw. */
export function equippedUpgrade(progress: Pick<Progress, "equipped">, category: UpgradeCategory): Upgrade | undefined {
  return upgrades.find((upgrade) => upgrade.id === progress.equipped[category]);
}

/** What a finished assignment looked like. Built from the typing state by the caller. */
export type AssignmentResult = { characters: number; accuracy: number; wpm: number; length: AssignmentLength };

/** Summarises a finished typing run. */
export function assignmentResult(typing: TypingState, now: number, length: AssignmentLength): AssignmentResult {
  return { characters: typing.cursor, accuracy: accuracy(typing), wpm: finalWpm(typing, now), length };
}

export type Reward = { payout: number; promotedTo: Job | null };

export function newProgress(): Progress {
  return {
    player: { currency: 0 },
    upgrades: startingUpgradeIds,
    equipped: normaliseEquipped(startingUpgradeIds, {}),
    finale: { stage: "none", seconds: 0 },
    stats: { totalChars: 0, assignmentsCompleted: 0, bestWpm: 0, totalEarned: 0, secondsPlayed: 0 },
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
    length: result.length,
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
      secondsPlayed: progress.stats.secondsPlayed,
    },
  };
  // The assignment after buying the top assistant is the player's last.
  const ending: Progress =
    progress.finale.stage === "pending" ? { ...next, finale: { stage: "redundant", seconds: 0 } } : next;
  const after = currentJob(ending);
  return { progress: ending, reward: { payout: credits, promotedTo: after.id === before.id ? null : after } };
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
    // A new purchase is put to use straight away.
    equipped: { ...progress.equipped, [upgrade.category]: upgrade.id },
    // The top assistant can do the player's job, so the clock starts on being made redundant.
    finale: upgrade.endsGame && progress.finale.stage === "none" ? { stage: "pending", seconds: 0 } : progress.finale,
  };
}

/** Switches to an owned upgrade (for example an older computer). Returns the same object if it cannot. */
export function equipUpgrade(progress: Progress, upgradeId: string): Progress {
  const upgrade: Upgrade | undefined = upgrades.find((candidate) => candidate.id === upgradeId);
  if (!upgrade || !progress.upgrades.includes(upgrade.id) || progress.equipped[upgrade.category] === upgrade.id) {
    return progress;
  }
  return { ...progress, equipped: { ...progress.equipped, [upgrade.category]: upgrade.id } };
}

// Taken from newProgress, so a field added to Progress is automatically noticed by autosave.
const progressKeys = Object.keys(newProgress()) as (keyof Progress)[];

/** Whether any saved part of the progress is a different object, so it needs saving again. */
export function progressChanged(before: Progress, after: Progress): boolean {
  return progressKeys.some((key) => before[key] !== after[key]);
}

/** Credits per second from the assistant in use. 0 with none. */
export function assistantRate(progress: Progress): number {
  const assistant = equippedUpgrade(progress, "assistant")?.assistant;
  return assistant ? assistantIncome(assistant, currentJob(progress), progress.upgrades) : 0;
}

/**
 * Moves the game on by `seconds` of real time: the assistant earns, the clock runs, and a pending redundancy counts
 * down. Called about once a second. Does nothing once the player has been made redundant.
 */
export function tickGame(progress: Progress, seconds: number): Progress {
  if (progress.finale.stage === "redundant" || seconds <= 0) return progress;
  const credits = assistantRate(progress) * seconds;
  const waited = progress.finale.seconds + seconds;
  const finale: Finale =
    progress.finale.stage === "pending"
      ? waited >= FINALE_FALLBACK_SECONDS
        ? { stage: "redundant", seconds: 0 }
        : { stage: "pending", seconds: waited }
      : progress.finale;
  return {
    ...progress,
    player: { currency: progress.player.currency + credits },
    finale,
    stats: {
      ...progress.stats,
      totalEarned: progress.stats.totalEarned + credits,
      secondsPlayed: progress.stats.secondsPlayed + seconds,
    },
  };
}
