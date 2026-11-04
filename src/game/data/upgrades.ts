// The upgrade catalogue. Every upgrade is one object; the shop and the payout maths read this list.
// Within a category the upgrades are tiers: each one needs the one before it. Costs are placeholders to balance later.

import type { OsId } from "./os";

export type UpgradeCategory = "computer" | "switches" | "assistant";

export type Upgrade = {
  id: string;
  category: UpgradeCategory;
  name: string;
  description: string;
  cost: number;
  /** Multiplies every payout. Only the best owned upgrade in each category counts. */
  payoutMultiplier: number;
  /** Computers only: the operating system, which sets how the whole UI looks. */
  os?: OsId;
  /** AI assistants only: how it works on its own. */
  assistant?: AssistantSpec;
  /** AI assistants only: buying this one gets the player made redundant, which ends the game. */
  endsGame?: boolean;
};

/** An AI assistant types by itself. Its mistakes lower its pay the same way yours do. */
export type AssistantSpec = {
  /** How fast it types. */
  wpm: number;
  /** From 0 to 1. */
  accuracy: number;
  /** A habit that shows in what it types. */
  quirk?: "goblins";
};

export const categoryLabels: Readonly<Record<UpgradeCategory, string>> = {
  computer: "Computer",
  switches: "Key switches",
  assistant: "AI assistant",
};

export const upgradeCategories = Object.keys(categoryLabels) as UpgradeCategory[];

export const upgrades = [
  {
    id: "beige-box",
    category: "computer",
    os: "classic",
    name: "Dusty Beige Box",
    description: "It works. Mostly.",
    cost: 0,
    payoutMultiplier: 1,
  },
  {
    id: "grey-tower",
    category: "computer",
    os: "sky",
    name: "Grey Tower",
    description: "Has a fan you can hear from space.",
    cost: 100,
    payoutMultiplier: 1.3,
  },
  {
    id: "silver-laptop",
    category: "computer",
    os: "pear",
    name: "Slim Silver Laptop",
    description: "Thin, light and very sure of itself.",
    cost: 500,
    payoutMultiplier: 1.7,
  },
  {
    id: "gaming-rig",
    category: "computer",
    os: "neon",
    name: "Gaming Rig",
    description: "Glows. Nobody knows why a spreadsheet needs that.",
    cost: 2500,
    payoutMultiplier: 2.3,
  },
  {
    id: "quantum-toaster",
    category: "computer",
    os: "quantum",
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
  {
    id: "gippity-1",
    category: "assistant",
    name: "Gippity-1",
    description: "Types slowly and keeps bringing up goblins.",
    cost: 400,
    payoutMultiplier: 1,
    assistant: { wpm: 8, accuracy: 0.8, quirk: "goblins" },
  },
  {
    id: "drama-llama-7b",
    category: "assistant",
    name: "Drama Llama 7B",
    description: "Quick, but sulks about every assignment.",
    cost: 3000,
    payoutMultiplier: 1,
    assistant: { wpm: 20, accuracy: 0.88 },
  },
  {
    id: "gemstone-flash",
    category: "assistant",
    name: "Gemstone Flash",
    description: "Brilliant, sparkly and easily distracted.",
    cost: 25000,
    payoutMultiplier: 1,
    assistant: { wpm: 45, accuracy: 0.94 },
  },
  {
    id: "clyde-octet-5",
    category: "assistant",
    name: "Clyde Octet 5",
    description: "Never tires, never complains and never needs you.",
    cost: 150000,
    payoutMultiplier: 1,
    assistant: { wpm: 100, accuracy: 0.99 },
    endsGame: true,
  },
] as const satisfies readonly Upgrade[];

export type UpgradeId = (typeof upgrades)[number]["id"];
export type ComputerId = Extract<(typeof upgrades)[number], { category: "computer" }>["id"];
export type AssistantId = Extract<(typeof upgrades)[number], { category: "assistant" }>["id"];
export type SwitchId = Extract<(typeof upgrades)[number], { category: "switches" }>["id"];

/** Upgrades the player starts with: everything that costs nothing. */
export const startingUpgradeIds: readonly string[] = upgrades
  .filter((upgrade) => upgrade.cost === 0)
  .map((upgrade) => upgrade.id);
