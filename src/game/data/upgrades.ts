// The upgrade catalogue. Every upgrade is one object; the shop and the payout maths read this list.
// Within a category the upgrades are tiers: each one needs the one before it. Costs are placeholders to balance later.

export type UpgradeCategory = "computer" | "switches";

export type Upgrade = {
  id: string;
  category: UpgradeCategory;
  name: string;
  description: string;
  cost: number;
  /** Multiplies every payout. Only the best owned upgrade in each category counts. */
  payoutMultiplier: number;
};

export const categoryLabels: Readonly<Record<UpgradeCategory, string>> = {
  computer: "Computer",
  switches: "Key switches",
};

export const upgrades = [
  {
    id: "beige-box",
    category: "computer",
    name: "Dusty Beige Box",
    description: "It works. Mostly.",
    cost: 0,
    payoutMultiplier: 1,
  },
  {
    id: "grey-tower",
    category: "computer",
    name: "Grey Tower",
    description: "Has a fan you can hear from space.",
    cost: 100,
    payoutMultiplier: 1.3,
  },
  {
    id: "silver-laptop",
    category: "computer",
    name: "Slim Silver Laptop",
    description: "Thin, light and very sure of itself.",
    cost: 500,
    payoutMultiplier: 1.7,
  },
  {
    id: "gaming-rig",
    category: "computer",
    name: "Gaming Rig",
    description: "Glows. Nobody knows why a spreadsheet needs that.",
    cost: 2500,
    payoutMultiplier: 2.3,
  },
  {
    id: "quantum-toaster",
    category: "computer",
    name: "Quantum Toaster",
    description: "Both finishes and does not finish your work.",
    cost: 12000,
    payoutMultiplier: 3.5,
  },
  {
    id: "mushy",
    category: "switches",
    name: "Generic Mushy",
    description: "Keys that feel like pressing a sponge.",
    cost: 0,
    payoutMultiplier: 1,
  },
  {
    id: "strawberry",
    category: "switches",
    name: "Strawberry Linear",
    description: "Smooth and quiet. Very sweet.",
    cost: 60,
    payoutMultiplier: 1.15,
  },
  {
    id: "chestnut",
    category: "switches",
    name: "Chestnut Tactile",
    description: "A little bump to tell you that you did it.",
    cost: 300,
    payoutMultiplier: 1.3,
  },
  {
    id: "blueberry",
    category: "switches",
    name: "Blueberry Clicky",
    description: "Your coworkers will hear everything.",
    cost: 1500,
    payoutMultiplier: 1.5,
  },
] as const satisfies readonly Upgrade[];

export type UpgradeId = (typeof upgrades)[number]["id"];

/** Upgrades the player starts with: everything that costs nothing. */
export const startingUpgradeIds: readonly string[] = upgrades
  .filter((upgrade) => upgrade.cost === 0)
  .map((upgrade) => upgrade.id);
