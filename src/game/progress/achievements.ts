// Works out which achievements a player has newly earned. Pure, so it can be tested.
import { achievements } from "@/game/data/achievements";
import { type Progress } from "./progress";

/** Ids of achievements the progress has earned that it does not have yet. */
export function newlyEarned(progress: Progress): string[] {
  return achievements
    .filter((achievement) => !progress.achievements.includes(achievement.id) && achievement.earned(progress))
    .map((achievement) => achievement.id);
}

/** Adds any newly earned achievements to the progress. Returns the same object when there are none. */
export function withAchievements(progress: Progress): Progress {
  const earned = newlyEarned(progress);
  return earned.length === 0 ? progress : { ...progress, achievements: [...progress.achievements, ...earned] };
}
