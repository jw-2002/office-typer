// The steps of play: finishing an assignment pays out, and the game clock ticks the assistant, goblin timers and ending.
import { type Job } from "@/game/data/jobs";
import { CLEAN_ACCURACY, assistantIncome, payout } from "@/game/economy/economy";
import { type AssignmentLength } from "@/game/text/assignments";
import { type TypingState, accuracy, finalWpm } from "@/game/text/typing";
import {
  FINALE_FALLBACK_SECONDS,
  type Finale,
  type Goblin,
  type Progress,
  currentJob,
  equippedUpgrade,
} from "./progress";

/** What a finished assignment looked like. Built from the typing state by the caller. */
export type AssignmentResult = {
  characters: number;
  accuracy: number;
  wpm: number;
  length: AssignmentLength;
  /** The document's title. */
  title?: string;
  /** A goblin assignment (typed in goblin mode) pays much more. */
  goblin?: boolean;
  /** The document of the day pays a bit more. */
  featured?: boolean;
};

/** Summarises a finished typing run. */
export function assignmentResult(
  typing: TypingState,
  now: number,
  length: AssignmentLength,
  bonuses: { goblin?: boolean; featured?: boolean; title?: string } = {},
): AssignmentResult {
  return { characters: typing.cursor, accuracy: accuracy(typing), wpm: finalWpm(typing, now), length, ...bonuses };
}

export type Reward = {
  payout: number;
  promotedTo: Job | null;
  /** The clean streak after this assignment, and how many were in it before (which set the bonus paid). */
  streak: number;
  bonusStreak: number;
  /** Whether it was a goblin assignment, for the popup. */
  goblin: boolean;
};

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
    streak: progress.stats.streak,
    goblin: result.goblin,
    featured: result.featured,
    legacy: progress.legacy,
  });
  const streak = result.accuracy >= CLEAN_ACCURACY ? progress.stats.streak + 1 : 0;
  const next: Progress = {
    ...progress,
    player: { ...progress.player, currency: progress.player.currency + credits },
    stats: {
      ...progress.stats,
      totalChars: progress.stats.totalChars + result.characters,
      assignmentsCompleted: progress.stats.assignmentsCompleted + 1,
      bestWpm: Math.max(progress.stats.bestWpm, result.wpm),
      bestDocument: result.wpm > progress.stats.bestWpm && result.title ? result.title : progress.stats.bestDocument,
      totalEarned: progress.stats.totalEarned + credits,
      secondsPlayed: progress.stats.secondsPlayed,
      streak,
      bestStreak: Math.max(progress.stats.bestStreak, streak),
      perfectLongs: progress.stats.perfectLongs + (result.length === "long" && result.accuracy >= 1 ? 1 : 0),
    },
  };
  // The assignment after buying the top assistant is the player's last.
  const ending: Progress =
    progress.finale.stage === "pending" ? { ...next, finale: { stage: "redundant", seconds: 0 } } : next;
  const after = currentJob(ending);
  return {
    progress: ending,
    reward: {
      payout: credits,
      promotedTo: after.id === before.id ? null : after,
      streak,
      bonusStreak: progress.stats.streak,
      goblin: result.goblin === true,
    },
  };
}

/** Credits per second from the assistant in use. 0 with none. */
export function assistantRate(progress: Progress): number {
  const assistant = equippedUpgrade(progress, "assistant")?.assistant;
  return assistant ? assistantIncome(assistant, currentJob(progress), progress.upgrades, progress.legacy) : 0;
}

/**
 * Moves the game on by `seconds` of real time: the assistant earns, the clock runs, and a pending redundancy counts
 * down. Called about once a second. Does nothing once the player has been made redundant.
 */
export function tickGame(progress: Progress, seconds: number): Progress {
  if (progress.finale.stage === "redundant" || seconds <= 0) return progress;
  const credits = assistantRate(progress) * seconds;
  const goblin: Goblin =
    progress.goblin.active > 0 || progress.goblin.cooldown > 0
      ? {
          active: Math.max(0, progress.goblin.active - seconds),
          cooldown: Math.max(0, progress.goblin.cooldown - seconds),
        }
      : progress.goblin;
  const waited = progress.finale.seconds + seconds;
  const finale: Finale =
    progress.finale.stage === "pending"
      ? waited >= FINALE_FALLBACK_SECONDS
        ? { stage: "redundant", seconds: 0 }
        : { stage: "pending", seconds: waited }
      : progress.finale;
  return {
    ...progress,
    player: { ...progress.player, currency: progress.player.currency + credits },
    finale,
    goblin,
    stats: {
      ...progress.stats,
      totalEarned: progress.stats.totalEarned + credits,
      secondsPlayed: progress.stats.secondsPlayed + seconds,
    },
  };
}
