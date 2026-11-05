// The game store (Zustand): the player's progress plus the actions that change it. Rules live in src/game.
import { create } from "zustand";
import { useViewStore } from "./viewStore";
import { withAchievements } from "@/game/achievements";
import type { EventChoice } from "@/game/data/events";
import type { EquippableCategory, Upgrade } from "@/game/data/upgrades";
import { overallMultiplier } from "@/game/economy";
import { applyChoice } from "@/game/events";
import {
  buyUpgrade,
  completeAssignment,
  currentJob,
  goblinActive,
  startNewCareer,
  toggleStowed,
  tickGame,
  equippedUpgrade,
  equipUpgrade,
  newProgress,
  setPlayerName,
  startGoblinMode,
  type AssignmentResult,
  type Progress,
  type Reward,
} from "@/game/progress";

type GameStore = Progress & {
  /** The payout from the most recent assignment, for the HUD to show. Not saved. */
  lastReward: Reward | null;
  /** Achievements just earned, for the pop-up. Not saved. */
  justEarned: readonly string[];
  finishAssignment: (result: AssignmentResult) => void;
  buy: (upgradeId: string) => void;
  /** Moves the game on by this many seconds: the assistant earns and the clock runs. */
  tick: (seconds: number) => void;
  /** Closes the promotion message once the player has seen it. */
  dismissPromotion: () => void;
  /** Closes the achievement pop-up. */
  dismissEarned: () => void;
  /** Switches to an upgrade already owned, such as an older computer. */
  equip: (upgradeId: string) => void;
  /** Starts goblin mode, if it is ready. */
  startGoblin: () => void;
  /** Puts an owned desk extra away, or back out on the desk. */
  toggleStowed: (id: string) => void;
  /** Applies a choice in an office event. Returns false (and changes nothing) if it cannot be afforded. */
  chooseEvent: (choice: EventChoice) => boolean;
  /** Sets the player's name, and sends the camera from the intro to the desk. */
  setName: (name: string) => void;
  /** Starts another career after being made redundant, keeping the name, achievements and a permanent pay bonus. */
  newCareer: () => void;
  /** Erases everything and starts again. Autosave then overwrites the saved game. */
  reset: () => void;
  /** Replaces progress with a loaded save. */
  load: (progress: Progress) => void;
};

/** Just the saved part of the store. */
export function progressOf({
  player,
  upgrades,
  equipped,
  finale,
  goblin,
  legacy,
  achievements,
  stowed,
  stats,
}: Progress): Progress {
  return { player, upgrades, equipped, finale, goblin, legacy, achievements, stowed, stats };
}

/** Your overall pay multiplier right now, which sets what generosity costs in office events. */
export function multiplierOf(progress: Progress): number {
  return overallMultiplier(
    currentJob(progress),
    progress.upgrades,
    progress.stats.streak,
    goblinActive(progress),
    progress.legacy,
  );
}

export const useGameStore = create<GameStore>()((set, get) => {
  /** Stores new progress, adding any achievements it has earned (and noting them for the pop-up). */
  const commit = (next: Progress, extra: Partial<GameStore> = {}) => {
    const checked = withAchievements(next);
    const earned = checked.achievements.slice(get().achievements.length);
    set({ ...checked, ...extra, ...(earned.length > 0 ? { justEarned: earned } : {}) });
  };

  return {
    ...newProgress(),
    lastReward: null,
    justEarned: [],
    finishAssignment: (result) => {
      // Once made redundant, nothing earns.
      if (get().finale.stage === "redundant") return;
      const { progress, reward } = completeAssignment(progressOf(get()), result);
      commit(progress, { lastReward: reward });
    },
    buy: (upgradeId) => {
      if (get().finale.stage === "redundant") return;
      commit(buyUpgrade(progressOf(get()), upgradeId));
    },
    tick: (seconds) => commit(tickGame(progressOf(get()), seconds)),
    startGoblin: () => commit(startGoblinMode(progressOf(get()))),
    chooseEvent: (choice) => {
      const before = progressOf(get());
      const after = applyChoice(before, choice, multiplierOf(before));
      if (after === before) return false;
      commit(after);
      return true;
    },
    toggleStowed: (id) => set(toggleStowed(progressOf(get()), id)),
    equip: (upgradeId) => set(equipUpgrade(progressOf(get()), upgradeId)),
    dismissPromotion: () =>
      set((state) => (state.lastReward ? { lastReward: { ...state.lastReward, promotedTo: null } } : {})),
    dismissEarned: () => set({ justEarned: [] }),
    setName: (name) => {
      set(setPlayerName(progressOf(get()), name));
      // The first name ends the intro: the camera pans to the player sitting at the desk.
      if (get().player.name !== "" && useViewStore.getState().view === "intro")
        useViewStore.getState().setView("seated");
    },
    newCareer: () => {
      // Straight back to work: the name is kept, so there is no introduction.
      set({ ...startNewCareer(progressOf(get())), lastReward: null, justEarned: [] });
      useViewStore.getState().setView("seated");
    },
    reset: () => {
      set({ ...newProgress(), lastReward: null, justEarned: [] });
      // A new game starts with the introduction again.
      useViewStore.getState().setView("intro");
    },
    load: (progress) => set({ ...progressOf(progress), lastReward: null, justEarned: [] }),
  };
});

/** The upgrade in use in a category (the computer on the desk, the switches under the keys). */
export function useEquipped(category: EquippableCategory): Upgrade | undefined {
  return useGameStore((state) => equippedUpgrade(state, category));
}
