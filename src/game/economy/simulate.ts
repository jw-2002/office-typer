// A stand-in player that types at a steady speed and buys upgrades, to estimate how long a whole game takes. Pure.
import type { AssignmentLength } from "@/game/text/assignments";
import { LENGTH_TARGETS } from "@/game/text/assignments";
import { isEquippable, upgrades, type Upgrade } from "@/game/data/upgrades";
import { buyStatus, buyUpgrade } from "@/game/progress/shop";
import { completeAssignment, tickGame } from "@/game/progress/gameplay";
import { newProgress, type Progress } from "@/game/progress/progress";

export type Typist = {
  wpm: number;
  /** From 0 to 1. */
  accuracy: number;
  length: AssignmentLength;
};

/** Seconds the player takes between assignments to read the next one and press Enter. */
const GAP_SECONDS = 2;
/** Safety stop so a balance mistake can never loop forever. */
const MAX_SECONDS = 4 * 3600;

const catalogue: readonly Upgrade[] = upgrades;

/** The cheapest upgrade the player can buy right now that is part of the main climb (not a desk extra or a song). */
function cheapestBuy(progress: Progress): Upgrade | undefined {
  return catalogue
    .filter((upgrade) => isEquippable(upgrade.category) && buyStatus(progress, upgrade) === "ok")
    .sort((a, b) => a.cost - b.cost)[0];
}

/** Plays a whole game and returns how many seconds it took until redundancy, and when each purchase happened. */
export function simulateGame(typist: Typist): { seconds: number; purchases: { id: string; at: number }[] } {
  let progress = newProgress();
  const purchases: { id: string; at: number }[] = [];
  const characters = LENGTH_TARGETS[typist.length];
  const secondsPerAssignment = characters / ((typist.wpm * 5) / 60) + GAP_SECONDS;

  while (progress.finale.stage !== "redundant" && progress.stats.secondsPlayed < MAX_SECONDS) {
    progress = completeAssignment(progress, {
      characters,
      accuracy: typist.accuracy,
      wpm: typist.wpm,
      length: typist.length,
    }).progress;
    progress = tickGame(progress, secondsPerAssignment);
    for (let buy = cheapestBuy(progress); buy; buy = cheapestBuy(progress)) {
      progress = buyUpgrade(progress, buy.id);
      purchases.push({ id: buy.id, at: progress.stats.secondsPlayed });
    }
  }
  return { seconds: progress.stats.secondsPlayed, purchases };
}
