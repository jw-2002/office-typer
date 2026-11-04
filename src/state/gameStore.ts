// The game store (Zustand): the player's progress plus the actions that change it. Rules live in src/game.
import { create } from "zustand";
import { useViewStore } from "./viewStore";
import type { EquippableCategory, Upgrade } from "@/game/data/upgrades";
import {
  buyUpgrade,
  completeAssignment,
  tickGame,
  equippedUpgrade,
  equipUpgrade,
  newProgress,
  setPlayerName,
  type AssignmentResult,
  type Progress,
  type Reward,
} from "@/game/progress";

type GameStore = Progress & {
  /** The payout from the most recent assignment, for the HUD to show. Not saved. */
  lastReward: Reward | null;
  finishAssignment: (result: AssignmentResult) => void;
  buy: (upgradeId: string) => void;
  /** Moves the game on by this many seconds: the assistant earns and the clock runs. */
  tick: (seconds: number) => void;
  /** Closes the promotion message once the player has seen it. */
  dismissPromotion: () => void;
  /** Switches to an upgrade already owned, such as an older computer. */
  equip: (upgradeId: string) => void;
  /** Sets the player's name, and sends the camera from the intro to the desk. */
  setName: (name: string) => void;
  /** Erases everything and starts again. Autosave then overwrites the saved game. */
  reset: () => void;
  /** Replaces progress with a loaded save. */
  load: (progress: Progress) => void;
};

/** Just the saved part of the store. */
export function progressOf({ player, upgrades, equipped, finale, stats }: Progress): Progress {
  return { player, upgrades, equipped, finale, stats };
}

export const useGameStore = create<GameStore>()((set, get) => ({
  ...newProgress(),
  lastReward: null,
  finishAssignment: (result) => {
    // Once made redundant, nothing earns.
    if (get().finale.stage === "redundant") return;
    const { progress, reward } = completeAssignment(progressOf(get()), result);
    set({ ...progress, lastReward: reward });
  },
  buy: (upgradeId) => {
    if (get().finale.stage === "redundant") return;
    set(buyUpgrade(progressOf(get()), upgradeId));
  },
  tick: (seconds) => set(tickGame(progressOf(get()), seconds)),
  equip: (upgradeId) => set(equipUpgrade(progressOf(get()), upgradeId)),
  dismissPromotion: () =>
    set((state) => (state.lastReward ? { lastReward: { ...state.lastReward, promotedTo: null } } : {})),
  setName: (name) => {
    set(setPlayerName(progressOf(get()), name));
    // The first name ends the intro: the camera pans to the player sitting at the desk.
    if (get().player.name !== "" && useViewStore.getState().view === "intro") useViewStore.getState().setView("seated");
  },
  reset: () => {
    set({ ...newProgress(), lastReward: null });
    // A new game starts with the introduction again.
    useViewStore.getState().setView("intro");
  },
  load: (progress) => set({ ...progressOf(progress), lastReward: null }),
}));

/** The upgrade in use in a category (the computer on the desk, the switches under the keys). */
export function useEquipped(category: EquippableCategory): Upgrade | undefined {
  return useGameStore((state) => equippedUpgrade(state, category));
}
