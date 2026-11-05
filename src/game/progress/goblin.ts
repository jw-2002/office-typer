// Goblin mode: the easter egg that pays ten times for a short while, and how long it takes to be ready again.
import { type Progress } from "./progress";

/** Goblin mode: how long it lasts, and how long before it can be used again (counted from when it starts). */
export const GOBLIN_SECONDS = 40;
export const GOBLIN_COOLDOWN_SECONDS = 300;

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
