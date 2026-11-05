// The player's progress (money, upgrades, stats) and the pure steps that change it: finish an assignment, buy an upgrade.
import type { Job } from "./data/jobs";
import {
  equippableCategories,
  isEquippable,
  startingUpgradeIds,
  upgrades,
  type EquippableCategory,
  type Upgrade,
} from "./data/upgrades";
import { CLEAN_ACCURACY, assistantIncome, bestOwned, jobFor, payout } from "./economy";
import type { AssignmentLength } from "./assignments";
import { accuracy, finalWpm, type TypingState } from "./typing";

export type Stats = {
  /** Correct characters typed in finished assignments. Drives promotions. */
  totalChars: number;
  assignmentsCompleted: number;
  /** Best whole-assignment WPM, from finished assignments only. */
  bestWpm: number;
  /** The title of the assignment typed at the best WPM this career, for the ending recap. */
  bestDocument: string;
  /** Credits earned over the whole game, spending not subtracted. */
  totalEarned: number;
  /** Seconds the game has been open and running. How long a run took. */
  secondsPlayed: number;
  /** Clean assignments (98% accuracy or better) finished in a row. A sloppy one resets it. */
  streak: number;
  /** How many times goblin mode has been started. */
  goblinUses: number;
  /** The longest clean streak this career. */
  bestStreak: number;
  /** Long assignments finished with no mistakes at all. */
  perfectLongs: number;
  /** Presents chipped in for, and cards signed, in office events. */
  presents: number;
  cardsSigned: number;
  /** Office events dealt with. */
  eventsHandled: number;
};

/**
 * How the game ends. Buying the top AI assistant starts "pending": the next assignment finished (or a minute's wait)
 * makes the player redundant, and then nothing more earns.
 */
export type Finale = { stage: "none" | "pending" | "redundant"; seconds: number };

/** How long the player gets after buying the top assistant, if they stop typing, before they are made redundant. */
export const FINALE_FALLBACK_SECONDS = 60;

/** Goblin mode: how long it lasts, and how long before it can be used again (counted from when it starts). */
export const GOBLIN_SECONDS = 40;
export const GOBLIN_COOLDOWN_SECONDS = 300;

/** Seconds of goblin mode left (0 when off) and seconds until it can be started again (0 when ready). */
export type Goblin = { active: number; cooldown: number };

export type Progress = {
  /** The player's name (empty until they have introduced themselves) and their money. */
  player: { name: string; currency: number };
  /** Ids of owned upgrades. */
  upgrades: readonly string[];
  /**
   * The upgrade in use in each category. It only changes how things look and sound: payouts always use the
   * best upgrade owned, so swapping back to an old computer costs nothing.
   */
  equipped: Readonly<Record<EquippableCategory, string>>;
  finale: Finale;
  goblin: Goblin;
  /** How many careers have been finished before this one. Each one adds a little permanent pay. */
  legacy: number;
  /** Ids of the achievements earned. They are kept through a new career. */
  achievements: readonly string[];
  /** Desk extras that are owned but put away, so they are not on the desk. */
  stowed: readonly string[];
  stats: Stats;
};

/**
 * Works out the equipped upgrade for each category. A choice that is missing, unknown or not owned is
 * replaced by the best upgrade owned in that category.
 */
export function normaliseEquipped(
  ownedIds: readonly string[],
  wanted: Partial<Record<EquippableCategory, unknown>>,
): Record<EquippableCategory, string> {
  const pickFor = (category: EquippableCategory): string => {
    const choice = wanted[category];
    const valid = upgrades.some((u) => u.id === choice && u.category === category) && ownedIds.includes(String(choice));
    return valid ? String(choice) : (bestOwned(ownedIds, category)?.id ?? "");
  };
  return Object.fromEntries(equippableCategories.map((category) => [category, pickFor(category)])) as Record<
    EquippableCategory,
    string
  >;
}

/** The upgrade in use in a category, which the scene and the UI draw. */
export function equippedUpgrade(
  progress: Pick<Progress, "equipped">,
  category: EquippableCategory,
): Upgrade | undefined {
  return upgrades.find((upgrade) => upgrade.id === progress.equipped[category]);
}

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

export function newProgress(): Progress {
  return {
    player: { name: "", currency: 0 },
    upgrades: startingUpgradeIds,
    equipped: normaliseEquipped(startingUpgradeIds, {}),
    finale: { stage: "none", seconds: 0 },
    goblin: { active: 0, cooldown: 0 },
    legacy: 0,
    achievements: [],
    stowed: [],
    stats: {
      totalChars: 0,
      assignmentsCompleted: 0,
      bestWpm: 0,
      bestDocument: "",
      totalEarned: 0,
      secondsPlayed: 0,
      streak: 0,
      goblinUses: 0,
      bestStreak: 0,
      perfectLongs: 0,
      presents: 0,
      cardsSigned: 0,
      eventsHandled: 0,
    },
  };
}

/** A new career after being made redundant: everything starts again, but you keep your name, achievements and a permanent pay bonus. */
export function startNewCareer(progress: Progress): Progress {
  return {
    ...newProgress(),
    player: { name: progress.player.name, currency: 0 },
    legacy: progress.legacy + 1,
    achievements: progress.achievements,
  };
}

/** A title for experienced players, from how many careers they have finished. Empty on the first career. */
export function careerRank(legacy: number): string {
  if (legacy >= 10) return "Fixture";
  if (legacy >= 6) return "Office Legend";
  if (legacy >= 3) return "Old Hand";
  return legacy >= 1 ? "Veteran" : "";
}

export function currentJob(progress: Progress): Job {
  return jobFor(progress.stats.totalChars);
}

/** Whether a desk extra is owned and out on the desk (not put away). */
export const isOnDesk = (progress: Pick<Progress, "upgrades" | "stowed">, id: string): boolean =>
  progress.upgrades.includes(id) && !progress.stowed.includes(id);

/** Puts an owned desk extra away, or back out on the desk. Anything else changes nothing. */
export function toggleStowed(progress: Progress, id: string): Progress {
  const upgrade: Upgrade | undefined = upgrades.find((candidate) => candidate.id === id);
  if (!upgrade || upgrade.category !== "extra" || !progress.upgrades.includes(id)) return progress;
  return {
    ...progress,
    stowed: progress.stowed.includes(id) ? progress.stowed.filter((other) => other !== id) : [...progress.stowed, id],
  };
}

/** Whether goblin mode is on right now. */
export const goblinActive = (progress: Pick<Progress, "goblin">): boolean => progress.goblin.active > 0;

/** Whether goblin mode can be started: it is off and its cooldown is over. */
export const goblinReady = (progress: Pick<Progress, "goblin">): boolean =>
  progress.goblin.active <= 0 && progress.goblin.cooldown <= 0;

/** Starts goblin mode if it is ready, otherwise returns the same progress object. Not once made redundant. */
export function startGoblinMode(progress: Progress): Progress {
  if (!goblinReady(progress) || progress.finale.stage === "redundant") return progress;
  return {
    ...progress,
    goblin: { active: GOBLIN_SECONDS, cooldown: GOBLIN_COOLDOWN_SECONDS },
    stats: { ...progress.stats, goblinUses: progress.stats.goblinUses + 1 },
  };
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

export type BuyStatus = "ok" | "owned" | "locked" | "too-expensive";

/** Why an upgrade can or cannot be bought. "locked" means the previous tier in its category is not owned yet. */
export function buyStatus(progress: Progress, upgrade: Upgrade): BuyStatus {
  if (progress.upgrades.includes(upgrade.id)) return "owned";
  const tiers: readonly Upgrade[] = upgrades.filter((other) => other.category === upgrade.category);
  const previous = tiers[tiers.findIndex((tier) => tier.id === upgrade.id) - 1];
  // Extras are not tiers: any of them can be bought at any time.
  if (isEquippable(upgrade.category) && previous && !progress.upgrades.includes(previous.id)) return "locked";
  return progress.player.currency >= upgrade.cost ? "ok" : "too-expensive";
}

/** Buys an upgrade, or returns the same progress object when it cannot be bought. */
export function buyUpgrade(progress: Progress, upgradeId: string): Progress {
  const upgrade: Upgrade | undefined = upgrades.find((candidate) => candidate.id === upgradeId);
  if (!upgrade || buyStatus(progress, upgrade) !== "ok") return progress;
  return {
    ...progress,
    player: { ...progress.player, currency: progress.player.currency - upgrade.cost },
    upgrades: [...progress.upgrades, upgrade.id],
    // A new purchase is put to use straight away (extras are not swapped, so they have nothing to put to use).
    equipped: isEquippable(upgrade.category)
      ? { ...progress.equipped, [upgrade.category]: upgrade.id }
      : progress.equipped,
    // The top assistant can do the player's job, so the clock starts on being made redundant.
    finale: upgrade.endsGame && progress.finale.stage === "none" ? { stage: "pending", seconds: 0 } : progress.finale,
  };
}

/** Switches to an owned upgrade (for example an older computer). Returns the same object if it cannot. */
export function equipUpgrade(progress: Progress, upgradeId: string): Progress {
  const upgrade: Upgrade | undefined = upgrades.find((candidate) => candidate.id === upgradeId);
  if (!upgrade || !isEquippable(upgrade.category) || !progress.upgrades.includes(upgrade.id)) return progress;
  if (progress.equipped[upgrade.category] === upgrade.id) return progress;
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

/** Longest name the desk plate has room for. */
export const MAX_NAME_LENGTH = 20;

/** Tidies a typed name: plain typeable characters only, single spaces, no spaces at the ends, and not too long. */
export function cleanPlayerName(raw: string): string {
  return raw
    .replace(/[^ -~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LENGTH)
    .trim();
}

/** Sets the player's name. A name that is empty after tidying changes nothing. */
export function setPlayerName(progress: Progress, raw: string): Progress {
  const name = cleanPlayerName(raw);
  return name === "" ? progress : { ...progress, player: { ...progress.player, name } };
}
