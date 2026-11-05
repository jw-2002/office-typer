// Buying, equipping and putting away upgrades and desk extras. Pure steps that return new progress.
import { type Upgrade, isEquippable, upgrades } from "@/game/data/upgrades";
import { type Progress } from "./progress";

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
