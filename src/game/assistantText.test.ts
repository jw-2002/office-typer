// Tests for the text assistants seem to type, and for the assistant data.
import { describe, expect, it } from "vitest";
import { assistantText } from "./assistantText";
import { generateAssignment } from "./assignments";
import { createRng } from "./random";
import { scenarioPools } from "./data/scenarios";
import { upgrades, type Upgrade } from "./data/upgrades";

const catalogue: readonly Upgrade[] = upgrades;
const assistants = catalogue.filter((upgrade) => upgrade.category === "assistant");

const goblin = { wpm: 8, accuracy: 0.8, quirk: "goblins" } as const;
const plain = { wpm: 45, accuracy: 0.94 };

describe("assistantText", () => {
  it("a goblin-loving assistant always mentions goblins, in readable ASCII", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const text = assistantText(goblin, seed % 3, createRng(seed));
      expect(text.toLowerCase(), `seed ${seed}`).toContain("goblin");
      expect(text).toMatch(/^[\x20-\x7e]+$/);
    }
  });

  it("an ordinary assistant gets the plain assignment text, with nothing slipped in", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const tier = seed % 3;
      expect(assistantText(plain, tier, createRng(seed)), `seed ${seed}`).toBe(
        generateAssignment(tier, "short", createRng(seed)).text,
      );
    }
  });

  it("is repeatable for the same seed", () => {
    expect(assistantText(goblin, 0, createRng(7))).toBe(assistantText(goblin, 0, createRng(7)));
  });
});

describe("assistant data", () => {
  it("every assistant has a speed and an accuracy, and they get faster and better, and cost more", () => {
    expect(assistants).toHaveLength(4);
    for (const assistant of assistants) {
      expect(assistant.assistant, assistant.id).toBeDefined();
      expect(assistant.assistant?.accuracy).toBeGreaterThan(0);
      expect(assistant.assistant?.accuracy).toBeLessThanOrEqual(1);
    }
    for (let i = 1; i < assistants.length; i++) {
      expect(assistants[i].assistant!.wpm).toBeGreaterThan(assistants[i - 1].assistant!.wpm);
      expect(assistants[i].assistant!.accuracy).toBeGreaterThan(assistants[i - 1].assistant!.accuracy);
      expect(assistants[i].cost).toBeGreaterThan(assistants[i - 1].cost);
    }
  });

  it("only the last and best assistant ends the game", () => {
    expect(catalogue.filter((upgrade) => upgrade.endsGame).map((upgrade) => upgrade.id)).toEqual(["clyde-octet-5"]);
    expect(assistants[assistants.length - 1].endsGame).toBe(true);
  });

  it("exactly one assistant loves goblins, and it is the first, cheapest one", () => {
    expect(assistants.filter((a) => a.assistant?.quirk === "goblins").map((a) => a.id)).toEqual(["gippity-1"]);
    expect(assistants[0].id).toBe("gippity-1");
  });

  it("assistants do not change the pay multiplier", () => {
    for (const assistant of assistants) expect(assistant.payoutMultiplier).toBe(1);
  });
});

describe("goblin scenarios", () => {
  it("every tier has at least one assignment about goblins, so the habit is not only the assistant's", () => {
    for (const pool of scenarioPools) {
      const goblins = pool.filter((scenario) => /goblin/i.test(JSON.stringify(scenario)));
      expect(goblins.length).toBeGreaterThanOrEqual(1);
    }
  });
});
