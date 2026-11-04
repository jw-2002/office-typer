// The money rules: payout per assignment, upgrade and job multipliers, and number formatting. Pure, no React.
import type { AssignmentLength } from "./assignments";
import { jobs, type Job } from "./data/jobs";
import { upgradeCategories, upgrades, type AssistantSpec, type Upgrade } from "./data/upgrades";

/** Credits earned per correct character before any multiplier. */
export const BASE_PAYOUT_PER_CHAR = 0.25;

/**
 * Longer assignments pay clearly more per character, so choosing one is a real trade-off: a Tiny one is over in a
 * breath but pays a quarter less, a Short one is quick and easy to finish, a Long one needs sustained focus (one slip costs accuracy over many more characters) but earns more.
 */
export const LENGTH_PAY: Readonly<Record<AssignmentLength, number>> = {
  tiny: 0.75,
  short: 1,
  standard: 1.25,
  long: 1.5,
};

/** Squared, so sloppy typing costs real money: 90% accuracy pays 81%. */
export function accuracyMultiplier(accuracy: number): number {
  const clamped = Math.min(1, Math.max(0, accuracy));
  return clamped * clamped;
}

/** Goblin mode multiplies the pay of the goblin assignments typed while it is on. */
export const GOBLIN_MULTIPLIER = 10;
/** The "document of the day" pays this much more. */
export const FEATURED_MULTIPLIER = 1.5;

/** An assignment finished at this accuracy or better is "clean" and adds to the streak. */
export const CLEAN_ACCURACY = 0.98;
/** Each clean assignment in a row adds this much pay, up to `MAX_STREAK` of them. */
export const STREAK_BONUS_STEP = 0.04;
export const MAX_STREAK = 10;

/** Pay multiplier for a run of clean assignments: 1 with none, 1.4 at the cap of ten in a row. */
export function streakMultiplier(streak: number): number {
  return 1 + STREAK_BONUS_STEP * Math.min(Math.max(Math.floor(streak), 0), MAX_STREAK);
}

/** The best (highest tier) upgrade owned in a category. Tiers are listed in order in the data. */
export function bestOwned(ownedIds: readonly string[], category: Upgrade["category"]): Upgrade | undefined {
  const owned: readonly Upgrade[] = upgrades.filter((u) => u.category === category && ownedIds.includes(u.id));
  return owned[owned.length - 1];
}

/** Combined multiplier from owned upgrades: the best one in each category, multiplied together. */
export function upgradeMultiplier(ownedIds: readonly string[]): number {
  return upgradeCategories.reduce(
    (product, category) => product * (bestOwned(ownedIds, category)?.payoutMultiplier ?? 1),
    1,
  );
}

export type PayoutInput = {
  characters: number;
  accuracy: number;
  length: AssignmentLength;
  job: Job;
  ownedUpgradeIds: readonly string[];
  /** Clean assignments in a row before this one. Leave out for none. */
  streak?: number;
  /** A goblin assignment, typed in goblin mode. */
  goblin?: boolean;
  /** The document of the day. */
  featured?: boolean;
};

/** Everything that multiplies your pay at once: job, upgrades and clean streak (not length or accuracy). */
export function overallMultiplier(
  job: Job,
  ownedUpgradeIds: readonly string[],
  streak = 0,
  goblinMode = false,
): number {
  return (
    job.payoutMultiplier *
    upgradeMultiplier(ownedUpgradeIds) *
    streakMultiplier(streak) *
    (goblinMode ? GOBLIN_MULTIPLIER : 1)
  );
}

/** 3 -> "3", 4.5 -> "4.5", 3.4204 -> "3.42". For showing a multiplier. */
export function formatMultiplier(multiplier: number): string {
  return multiplier.toFixed(2).replace(/\.?0+$/, "");
}

/** Credits for one finished assignment, rounded so the HUD never shows long decimals. */
export function payout({
  characters,
  accuracy,
  length,
  job,
  ownedUpgradeIds,
  streak = 0,
  goblin = false,
  featured = false,
}: PayoutInput): number {
  const raw =
    BASE_PAYOUT_PER_CHAR *
    characters *
    accuracyMultiplier(accuracy) *
    LENGTH_PAY[length] *
    job.payoutMultiplier *
    streakMultiplier(streak) *
    (goblin ? GOBLIN_MULTIPLIER : 1) *
    (featured ? FEATURED_MULTIPLIER : 1) *
    upgradeMultiplier(ownedUpgradeIds);
  return Math.round(raw);
}

/**
 * Credits an AI assistant earns per second. It uses your job and upgrade multipliers, like your own typing, but gets no
 * length bonus, so a skilled typist on Long assignments stays ahead of the cheaper assistants.
 */
export function assistantIncome(assistant: AssistantSpec, job: Job, ownedUpgradeIds: readonly string[]): number {
  const charactersPerSecond = (assistant.wpm * 5) / 60;
  return (
    charactersPerSecond *
    BASE_PAYOUT_PER_CHAR *
    accuracyMultiplier(assistant.accuracy) *
    job.payoutMultiplier *
    upgradeMultiplier(ownedUpgradeIds)
  );
}

/** The job held at a given total of correct characters. */
export function jobFor(totalChars: number): Job {
  return jobs.reduce<Job>((best, job) => (totalChars >= job.minChars ? job : best), jobs[0]);
}

/** The next promotion, or null at the top of the ladder. */
export function nextJob(current: Job): Job | null {
  const index = jobs.findIndex((job) => job.id === current.id);
  return jobs[index + 1] ?? null;
}

/** The job before this one, or null at the bottom of the ladder. */
export function previousJob(current: Job): Job | null {
  const index = jobs.findIndex((job) => job.id === current.id);
  return index > 0 ? jobs[index - 1] : null;
}

/** How far the player is from the next promotion. */
export type PromotionProgress = {
  job: Job;
  /** The next job, or null at the top of the ladder. */
  next: Job | null;
  /** From 0 to 1 of the way to the next job. 1 at the top of the ladder. */
  fraction: number;
  /** Characters still to type for the next job. 0 at the top of the ladder. */
  remaining: number;
};

export function promotionProgress(totalChars: number): PromotionProgress {
  const job = jobFor(totalChars);
  const next = nextJob(job);
  if (!next) return { job, next, fraction: 1, remaining: 0 };
  return {
    job,
    next,
    fraction: (totalChars - job.minChars) / (next.minChars - job.minChars),
    remaining: next.minChars - totalChars,
  };
}

/** 0.43 -> "0.4", 2.46 -> "2.5", 36.2 -> "36", 1200 -> "1.2K". For credits per second. */
export function formatRate(perSecond: number): string {
  return perSecond < 10 ? perSecond.toFixed(1) : formatNumber(perSecond);
}

/** 45 -> "0m 45s", 754 -> "12m 34s", 4320 -> "1h 12m". For how long a game took. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  return `${minutes}m ${(seconds % 60).toString().padStart(2, "0")}s`;
}

const SUFFIXES = ["", "K", "M", "B", "T"];

/** 950 -> "950", 1200 -> "1.2K", 3400000 -> "3.4M". The one place numbers are formatted for display. */
export function formatNumber(value: number): string {
  const whole = Math.floor(value);
  if (whole < 1000) return whole.toString();
  const magnitude = Math.min(Math.floor(Math.log10(whole) / 3), SUFFIXES.length - 1);
  const scaled = whole / 1000 ** magnitude;
  // One decimal below 100 (1.2K, 45.6K), none above (123K), and no trailing ".0".
  const text =
    scaled < 100 ? (Math.floor(scaled * 10) / 10).toFixed(1).replace(/\.0$/, "") : Math.floor(scaled).toString();
  return text + SUFFIXES[magnitude];
}
