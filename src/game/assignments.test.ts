import { describe, expect, it } from "vitest";
import { fillSlots, generateAssignment, LENGTH_TARGETS, type AssignmentLength } from "./assignments";
import { sentencePools } from "./data/sentences";
import { slots } from "./data/slots";
import { titleTemplates } from "./data/titles";
import { createRng } from "./random";

const PRINTABLE_ASCII = /^[\x20-\x7e]+$/;
const lengths = Object.keys(LENGTH_TARGETS) as AssignmentLength[];
const usedSlots = (template: string) => [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);

describe("content data", () => {
  const allTemplates = [...sentencePools.flat(), ...Object.values(titleTemplates).flat()];

  it("only uses slots that exist", () => {
    for (const template of allTemplates) {
      for (const name of usedSlots(template)) expect(slots, `{${name}} in "${template}"`).toHaveProperty(name);
    }
  });

  it("is typeable on a normal keyboard", () => {
    for (const template of allTemplates) expect(template).toMatch(PRINTABLE_ASCII);
    for (const values of Object.values(slots)) values.forEach((value) => expect(value).toMatch(PRINTABLE_ASCII));
  });

  it("has enough unique sentences per tier, each ending in punctuation", () => {
    for (const pool of sentencePools) {
      expect(pool.length).toBeGreaterThanOrEqual(25);
      expect(new Set(pool).size).toBe(pool.length);
      pool.forEach((sentence) => expect(sentence).toMatch(/[.!?]$/));
    }
  });
});

describe("fillSlots", () => {
  it("replaces placeholders from the slot lists", () => {
    const result = fillSlots("Hi {name}, see {thing}.", createRng(1));
    expect(result).not.toContain("{");
    expect(slots.name.some((name) => result.includes(name))).toBe(true);
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
    const texts = new Set([1, 2, 3, 4, 5].map((seed) => generateAssignment(0, "standard", createRng(seed)).text));
    expect(texts.size).toBeGreaterThan(1);
  });

  it.each(lengths)("reaches the %s target without running far past it", (length) => {
    for (let tier = 0; tier < sentencePools.length; tier++) {
      for (let seed = 0; seed < 25; seed++) {
        const { text } = generateAssignment(tier, length, createRng(seed));
        expect(text.length, `tier ${tier} seed ${seed}`).toBeGreaterThanOrEqual(LENGTH_TARGETS[length]);
        expect(text.length).toBeLessThan(LENGTH_TARGETS[length] + 120);
      }
    }
  });

  it("produces typeable text with every slot filled", () => {
    for (let seed = 0; seed < 50; seed++) {
      const { text, title } = generateAssignment(seed % 3, lengths[seed % 3], createRng(seed));
      for (const value of [text, title]) {
        expect(value).toMatch(PRINTABLE_ASCII);
        expect(value).not.toMatch(/[{}]/);
      }
    }
  });

  it("does not repeat a sentence template inside one assignment", () => {
    const { text } = generateAssignment(0, "long", createRng(5));
    const sentences = text.split(/(?<=[.!?]) /);
    expect(new Set(sentences).size).toBe(sentences.length);
  });

  it("reuses the hardest tier for tiers beyond the content", () => {
    expect(generateAssignment(99, "short", createRng(1))).toEqual(generateAssignment(2, "short", createRng(1)));
  });

  it("treats negative tiers as the easiest", () => {
    expect(generateAssignment(-3, "short", createRng(1))).toEqual(generateAssignment(0, "short", createRng(1)));
  });
});
