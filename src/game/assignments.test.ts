// Tests for assignment generation and for the validity of the scenario data.
import { describe, expect, it } from "vitest";
import {
  LENGTH_TARGETS,
  RECENT_SCENARIO_MEMORY,
  fillSlots,
  generateAssignment,
  rememberScenario,
  slotBase,
  type AssignmentLength,
} from "./assignments";
import { goblinPools, goblinScenarios, scenarioPools } from "./data/scenarios";
import { slots } from "./data/slots";
import { createRng } from "./random";

const PRINTABLE_ASCII = /^[\x20-\x7e]+$/;
const lengths = Object.keys(LENGTH_TARGETS) as AssignmentLength[];
const usedSlots = (template: string) => [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
const allScenarios = [...scenarioPools.flat(), ...goblinScenarios.flat()];

// Turns "Hi {name}." into a regex that matches any filled-in version of it.
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toPattern = (template: string) => escapeRegExp(template).replace(/\\\{\w+\\\}/g, ".+?");

describe("scenario data", () => {
  const allTemplates = allScenarios.flatMap((s) => [s.title, ...s.opening, ...s.body, ...s.closing]);

  it("only uses slots that exist", () => {
    for (const template of allTemplates) {
      for (const name of usedSlots(template)) {
        expect(slots, `{${name}} in "${template}"`).toHaveProperty(slotBase(name));
      }
    }
  });

  it("is typeable on a normal keyboard", () => {
    for (const template of allTemplates) expect(template).toMatch(PRINTABLE_ASCII);
    for (const values of Object.values(slots)) values.forEach((value) => expect(value).toMatch(PRINTABLE_ASCII));
  });

  it("has enough tiers and scenarios", () => {
    expect(scenarioPools.length).toBeGreaterThanOrEqual(3);
    // Comfortably more than the no-repeat memory, or the memory would leave nothing to pick from.
    scenarioPools.forEach((pool) => expect(pool.length).toBeGreaterThanOrEqual(RECENT_SCENARIO_MEMORY * 2));
  });

  it("gives every scenario a unique, tidy id", () => {
    const ids = allScenarios.map((scenario) => scenario.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
  });

  it("gives every scenario enough material, with sentences that end in punctuation", () => {
    for (const scenario of allScenarios) {
      expect(scenario.opening.length, scenario.title).toBeGreaterThanOrEqual(2);
      expect(scenario.closing.length, scenario.title).toBeGreaterThanOrEqual(2);
      expect(scenario.body.length, scenario.title).toBeGreaterThanOrEqual(8);
      expect(new Set(scenario.body).size).toBe(scenario.body.length);
      for (const sentence of [...scenario.opening, ...scenario.body, ...scenario.closing]) {
        expect(sentence).toMatch(/[.!?]$/);
      }
    }
  });

  it("does not start body sentences with a connective that points at the sentence before", () => {
    // Body sentences are shuffled, so "Then ..." or "But ..." would refer to nothing.
    for (const scenario of allScenarios) {
      for (const sentence of scenario.body) {
        expect(sentence, sentence).not.toMatch(/^(Then|So|But|And|Also|However|Therefore|Next|After that)/);
      }
    }
  });

  it("does not number its body sentences or point at other ones, because they are shuffled", () => {
    // A lone "Risk 1:" turning up after "Risk 6:" reads as a mistake. A whole list inside one sentence is fine.
    const label = /\b(Risk|Question|Item|Step|Point|Stage|Phase|Rule|Part) \d/g;
    for (const scenario of allScenarios) {
      for (const sentence of scenario.body) {
        const startsNumbered = /^(Risk|Question|Item|Step|Point|Stage|Phase|Rule|Part) \d/.test(sentence);
        if (startsNumbered) expect((sentence.match(label) ?? []).length, sentence).toBeGreaterThanOrEqual(2);
        expect(sentence, sentence).not.toMatch(/\b(firstly|secondly|thirdly|as before|as mentioned|as above)\b/i);
      }
    }
  });
});

describe("rememberScenario", () => {
  it("keeps only the most recent few", () => {
    const ids = ["a", "b", "c", "d", "e", "f"].reduce<string[]>((recent, id) => rememberScenario(recent, id), []);
    expect(ids).toEqual(["c", "d", "e", "f"].slice(-RECENT_SCENARIO_MEMORY));
    expect(ids).toHaveLength(RECENT_SCENARIO_MEMORY);
  });
});

describe("fillSlots", () => {
  it("replaces placeholders from the slot lists", () => {
    const result = fillSlots("Hi {name}, see {thing}.", createRng(1));
    expect(result).not.toContain("{");
    expect(slots.name.some((name) => result.includes(name))).toBe(true);
  });

  it("keeps a slot's value the same within one map", () => {
    const chosen = new Map<string, string>();
    const a = fillSlots("{name}|{thing}|{day}", createRng(1), chosen);
    const b = fillSlots("{day}|{thing}|{name}", createRng(2), chosen);
    expect(b.split("|").reverse()).toEqual(a.split("|"));
  });

  it("gives numbered slots a different value from the same list", () => {
    for (let seed = 0; seed < 50; seed++) {
      const [first, second] = fillSlots("{name}|{name2}", createRng(seed)).split("|");
      expect(first).not.toBe(second);
    }
  });

  it("throws on an unknown slot", () => {
    expect(() => fillSlots("Hello {nope}", createRng(1))).toThrow(/nope/);
  });
});

describe("generateAssignment", () => {
  it("is repeatable for the same seed", () => {
    expect(generateAssignment(1, "standard", createRng(99))).toEqual(generateAssignment(1, "standard", createRng(99)));
  });

  it("varies between seeds", () => {
    const texts = new Set([1, 2, 3, 4, 5, 6].map((seed) => generateAssignment(0, "standard", createRng(seed)).text));
    expect(texts.size).toBeGreaterThan(1);
  });

  it.each(lengths)("reaches the %s target without running far past it", (length) => {
    for (let tier = 0; tier < scenarioPools.length; tier++) {
      for (let seed = 0; seed < 40; seed++) {
        const { text } = generateAssignment(tier, length, createRng(seed));
        // A tiny one is only an opening line, so it can fall a little short of its target.
        const shortest = length === "tiny" ? 20 : LENGTH_TARGETS[length];
        expect(text.length, `tier ${tier} seed ${seed}`).toBeGreaterThanOrEqual(shortest);
        expect(text.length).toBeLessThan(LENGTH_TARGETS[length] + 120);
      }
    }
  });

  it("produces typeable text with every slot filled", () => {
    for (let seed = 0; seed < 60; seed++) {
      const { text, title } = generateAssignment(seed % 3, lengths[seed % 3], createRng(seed));
      for (const value of [text, title]) {
        expect(value).toMatch(PRINTABLE_ASCII);
        expect(value).not.toMatch(/[{}]/);
      }
    }
  });

  it("uses the same names, days and things in the title and the text", () => {
    // The "Re: {thing}" email puts the thing in its title and again in its opening line.
    const titled = Array.from({ length: 200 }, (_, seed) => generateAssignment(1, "short", createRng(seed))).filter(
      ({ title }) => title.startsWith("Re: the "),
    );
    expect(titled.length).toBeGreaterThan(0);
    for (const { title, text } of titled) expect(text).toContain(title.slice("Re: ".length));
  });

  it("is one scenario: one of its opening lines first and one of its closing lines last", () => {
    for (let tier = 0; tier < scenarioPools.length; tier++) {
      for (let seed = 0; seed < 40; seed++) {
        const { text } = generateAssignment(tier, "standard", createRng(seed));
        const fits = scenarioPools[tier].some(
          (scenario) =>
            scenario.opening.some((line) => new RegExp(`^${toPattern(line)} `).test(text)) &&
            scenario.closing.some((line) => new RegExp(` ${toPattern(line)}$`).test(text)),
        );
        expect(fits, `tier ${tier} seed ${seed}: ${text}`).toBe(true);
      }
    }
  });

  it("does not repeat a body sentence inside one assignment", () => {
    for (let seed = 0; seed < 20; seed++) {
      const sentences = generateAssignment(0, "long", createRng(seed)).text.split(/(?<=[.!?]) /);
      expect(new Set(sentences).size).toBe(sentences.length);
    }
  });

  it("never repeats a recent scenario", () => {
    for (let seed = 0; seed < 60; seed++) {
      const recent = scenarioPools[1].slice(0, RECENT_SCENARIO_MEMORY).map((scenario) => scenario.id);
      const { scenarioId } = generateAssignment(1, "short", createRng(seed), recent);
      expect(recent).not.toContain(scenarioId);
    }
  });

  it("falls back to any scenario if every one is recent", () => {
    const every = scenarioPools[0].map((scenario) => scenario.id);
    expect(() => generateAssignment(0, "short", createRng(1), every)).not.toThrow();
  });

  it("reports which scenario it used", () => {
    const { scenarioId } = generateAssignment(2, "short", createRng(3));
    expect(scenarioPools[2].map((scenario) => scenario.id)).toContain(scenarioId);
  });

  it("reuses the hardest tier for tiers beyond the content", () => {
    expect(generateAssignment(99, "short", createRng(1))).toEqual(generateAssignment(2, "short", createRng(1)));
  });

  it("treats negative tiers as the easiest", () => {
    expect(generateAssignment(-3, "short", createRng(1))).toEqual(generateAssignment(0, "short", createRng(1)));
  });
});

describe("goblin assignments", () => {
  it("come only from goblin scenarios, at the right tier", () => {
    for (let tier = 0; tier < goblinPools.length; tier++) {
      const ids = goblinPools[tier].map((scenario) => scenario.id);
      for (let seed = 0; seed < 30; seed++) {
        const { scenarioId } = generateAssignment(tier, "standard", createRng(seed), [], true);
        expect(ids).toContain(scenarioId);
        expect(scenarioId).toContain("goblin");
      }
    }
  });

  it("have a few scenarios in every tier, and are about goblins", () => {
    for (const pool of goblinPools) expect(pool.length).toBeGreaterThanOrEqual(4);
    for (const pool of goblinPools) {
      for (const scenario of pool) expect(JSON.stringify(scenario).toLowerCase()).toContain("goblin");
    }
  });

  it("differ from normal assignments", () => {
    const normal = generateAssignment(0, "standard", createRng(5));
    const goblin = generateAssignment(0, "standard", createRng(5), [], true);
    expect(goblin.text).not.toBe(normal.text);
  });
});
