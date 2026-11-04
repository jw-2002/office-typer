// The money rules: payout per assignment, upgrade and job multipliers, and number formatting. Pure, no React.
import { jobs, type Job } from "./data/jobs";
import { upgradeCategories, upgrades, type Upgrade } from "./data/upgrades";

/** Credits earned per correct character before any multiplier. */
export const BASE_PAYOUT_PER_CHAR = 0.25;

/** Squared, so sloppy typing costs real money: 90% accuracy pays 81%. */
export function accuracyMultiplier(accuracy: number): number {
  const clamped = Math.min(1, Math.max(0, accuracy));
  return clamped * clamped;
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

export type PayoutInput = { characters: number; accuracy: number; job: Job; ownedUpgradeIds: readonly string[] };

/** Credits for one finished assignment, rounded so the HUD never shows long decimals. */
export function payout({ characters, accuracy, job, ownedUpgradeIds }: PayoutInput): number {
  const raw =
    BASE_PAYOUT_PER_CHAR *
    characters *
    accuracyMultiplier(accuracy) *
    job.payoutMultiplier *
    upgradeMultiplier(ownedUpgradeIds);
  return Math.round(raw);
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
