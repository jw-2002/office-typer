// The player's progress: its shape (money, upgrades, stats), a fresh start, a new career, the name and the equipped upgrades.
import { type Job } from "@/game/data/jobs";
import {
  type EquippableCategory,
  type Upgrade,
  equippableCategories,
  startingUpgradeIds,
  upgrades,
} from "@/game/data/upgrades";
import { bestOwned, jobFor } from "@/game/economy/economy";

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

// Taken from newProgress, so a field added to Progress is automatically noticed by autosave.
const progressKeys = Object.keys(newProgress()) as (keyof Progress)[];

/** Whether any saved part of the progress is a different object, so it needs saving again. */
export function progressChanged(before: Progress, after: Progress): boolean {
  return progressKeys.some((key) => before[key] !== after[key]);
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
