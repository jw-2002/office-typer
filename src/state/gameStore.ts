// The game store (Zustand): the player's progress plus the actions that change it. Rules live in src/game.
import { create } from "zustand";
import {
  buyUpgrade,
  completeAssignment,
  newProgress,
  type AssignmentResult,
  type Progress,
  type Reward,
} from "@/game/progress";

type GameStore = Progress & {
  /** The payout from the most recent assignment, for the HUD to show. Not saved. */
  lastReward: Reward | null;
  finishAssignment: (result: AssignmentResult) => void;
  buy: (upgradeId: string) => void;
  /** Replaces progress with a loaded save. */
  load: (progress: Progress) => void;
};

/** Just the saved part of the store. */
export function progressOf({ player, upgrades, stats }: Progress): Progress {
  return { player, upgrades, stats };
}

export const useGameStore = create<GameStore>()((set, get) => ({
  ...newProgress(),
  lastReward: null,
  finishAssignment: (result) => {
    const { progress, reward } = completeAssignment(progressOf(get()), result);
    set({ ...progress, lastReward: reward });
  },
  buy: (upgradeId) => set(buyUpgrade(progressOf(get()), upgradeId)),
  load: (progress) => set({ ...progressOf(progress), lastReward: null }),
}));
