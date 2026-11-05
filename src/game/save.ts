// The save file format: one versioned object, how to build it, and how to read old or damaged ones safely.
import { achievements } from "./data/achievements";
import { startingUpgradeIds, upgrades } from "./data/upgrades";
import { MAX_LEGACY } from "./economy";
import { GOBLIN_COOLDOWN_SECONDS, GOBLIN_SECONDS, cleanPlayerName, normaliseEquipped, type Progress } from "./progress";

export const SAVE_VERSION = 3;

export type SaveData = Progress & {
  version: number;
  /** Wall-clock ms when saved. Used later to work out offline progress. */
  savedAt: number;
};

/**
 * Where saves live. Async because the cloud version will be; the localStorage one just resolves at once.
 * `load` gives null when there is no usable save.
 */
export interface SaveRepository {
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
}

export function toSave(progress: Progress, now: number): SaveData {
  return { version: SAVE_VERSION, savedAt: now, ...progress };
}

// Each entry upgrades a save from version N to N + 1. Add one here when SAVE_VERSION goes up.
const migrations: Readonly<Record<number, (old: Record<string, unknown>) => Record<string, unknown>>> = {
  // 1 -> 2 added `equipped`. It needs no change here: validation below fills it in from the upgrades owned.
  1: (old) => old,
  // 2 -> 3 added the AI assistant category, `finale` and `stats.secondsPlayed`. All are filled in by validation below.
  2: (old) => old,
};

const knownAchievements = new Set(achievements.map((achievement) => achievement.id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A finite number of at least zero, otherwise 0. */
function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

/**
 * Turns whatever was stored into a valid, current save, or null when it cannot be trusted at all
 * (not an object, no version, or from a newer version of the game). Fields that are merely wrong are
 * repaired rather than rejected, so a small glitch never wipes a player's progress.
 */
export function migrate(raw: unknown): SaveData | null {
  if (!isRecord(raw)) return null;
  let current: Record<string, unknown> = raw;
  let version = current.version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1 || version > SAVE_VERSION) return null;

  while (version < SAVE_VERSION) {
    const step = migrations[version];
    if (!step) return null;
    current = step(current);
    version += 1;
  }

  const player = isRecord(current.player) ? current.player : {};
  const stats = isRecord(current.stats) ? current.stats : {};
  const known = new Set<string>(upgrades.map((upgrade) => upgrade.id));
  const owned = Array.isArray(current.upgrades)
    ? current.upgrades.filter((id): id is string => typeof id === "string" && known.has(id))
    : [];

  // The free starting upgrades are always owned; a Set drops duplicates.
  const ownedIds = [...new Set([...startingUpgradeIds, ...owned])];
  const equipped = isRecord(current.equipped) ? current.equipped : {};
  const finale = isRecord(current.finale) ? current.finale : {};
  const goblin = isRecord(current.goblin) ? current.goblin : {};

  return {
    version: SAVE_VERSION,
    savedAt: count(current.savedAt),
    player: {
      name: typeof player.name === "string" ? cleanPlayerName(player.name) : "",
      currency: count(player.currency),
    },
    upgrades: ownedIds,
    equipped: normaliseEquipped(ownedIds, equipped),
    finale: {
      stage: finale.stage === "pending" || finale.stage === "redundant" ? finale.stage : "none",
      seconds: count(finale.seconds),
    },
    stowed: Array.isArray(current.stowed)
      ? [...new Set(current.stowed.filter((id): id is string => typeof id === "string" && ownedIds.includes(id)))]
      : [],
    legacy: Math.min(Math.floor(count(current.legacy)), MAX_LEGACY),
    achievements: Array.isArray(current.achievements)
      ? [
          ...new Set(
            current.achievements.filter((id): id is string => typeof id === "string" && knownAchievements.has(id)),
          ),
        ]
      : [],
    // The timers are capped, so editing a save cannot give a longer goblin mode or a cooldown that never ends.
    goblin: {
      active: Math.min(count(goblin.active), GOBLIN_SECONDS),
      cooldown: Math.min(count(goblin.cooldown), GOBLIN_COOLDOWN_SECONDS),
    },
    stats: {
      totalChars: count(stats.totalChars),
      assignmentsCompleted: count(stats.assignmentsCompleted),
      bestWpm: count(stats.bestWpm),
      totalEarned: count(stats.totalEarned),
      secondsPlayed: count(stats.secondsPlayed),
      streak: Math.floor(count(stats.streak)),
      goblinUses: Math.floor(count(stats.goblinUses)),
      bestStreak: Math.floor(count(stats.bestStreak)),
      perfectLongs: Math.floor(count(stats.perfectLongs)),
      presents: Math.floor(count(stats.presents)),
      cardsSigned: Math.floor(count(stats.cardsSigned)),
      eventsHandled: Math.floor(count(stats.eventsHandled)),
    },
  };
}
