// Builds an assignment (title and text) from a scenario, a length and a random source. Pure, no React.
import { scenarioPools, type DocumentKind } from "./data/scenarios";
import { slots } from "./data/slots";
import { pick, shuffled, type Rng } from "./random";

export type { DocumentKind };
export type AssignmentLength = "tiny" | "short" | "standard" | "long";

/** Target character counts. An assignment runs up to one sentence over its target. */
export const LENGTH_TARGETS = { tiny: 45, short: 90, standard: 170, long: 300 } as const satisfies Record<
  AssignmentLength,
  number
>;

export type Assignment = {
  /** Which scenario this came from, so callers can avoid repeating it. */
  scenarioId: string;
  kind: DocumentKind;
  /** Shown as the document heading. Not typed by the player. */
  title: string;
  /** The text the player types. */
  text: string;
};

/** How many recent scenarios to avoid repeating. Every tier has more scenarios than this. */
export const RECENT_SCENARIO_MEMORY = 4;

/** Adds a scenario to the recent list, keeping only the last few. */
export function rememberScenario(recentIds: readonly string[], id: string): string[] {
  return [...recentIds, id].slice(-RECENT_SCENARIO_MEMORY);
}

/** {name2} and {name} are separate slots that draw from the same list ("name"). */
export const slotBase = (slotName: string): string => slotName.replace(/\d+$/, "");

/**
 * Replaces every {slot} with a value from slots.ts. `chosen` remembers each slot's value, so reusing
 * the same map keeps a name or day consistent across a whole assignment. Slots that share a list
 * ({name}, {name2}) never get the same value. Unknown slots throw, so data typos surface early.
 */
export function fillSlots(template: string, rng: Rng, chosen = new Map<string, string>()): string {
  return template.replace(/\{(\w+)\}/g, (_match, slotName: string) => {
    const existing = chosen.get(slotName);
    if (existing !== undefined) return existing;

    const base = slotBase(slotName);
    const options: readonly string[] | undefined = slots[base];
    if (!options) throw new Error(`Unknown slot {${slotName}} in "${template}"`);

    const taken = new Set([...chosen].filter(([name]) => slotBase(name) === base).map(([, value]) => value));
    const free = options.filter((option) => !taken.has(option));
    const value = pick(rng, free.length > 0 ? free : options);
    chosen.set(slotName, value);
    return value;
  });
}

/**
 * Builds one coherent document: a scenario from the pool for `tier` (0 is easiest), then its opening,
 * shuffled body sentences up to the length target, and its closing. Tiers beyond the available
 * content reuse the hardest pool. Scenarios listed in `recentIds` are skipped, unless that would
 * leave none. Pass a seeded rng for repeatable output.
 */
export function generateAssignment(
  tier: number,
  length: AssignmentLength,
  rng: Rng,
  recentIds: readonly string[] = [],
): Assignment {
  const scenarios = scenarioPools[Math.min(Math.max(tier, 0), scenarioPools.length - 1)];
  const fresh = scenarios.filter((candidate) => !recentIds.includes(candidate.id));
  const scenario = pick(rng, fresh.length > 0 ? fresh : scenarios);
  const chosen = new Map<string, string>();
  const fill = (template: string) => fillSlots(template, rng, chosen);

  const opening = fill(pick(rng, scenario.opening));
  const closing = fill(pick(rng, scenario.closing));

  // A tiny assignment is just the opening line. Otherwise fill the body until the text, including the closing line,
  // reaches the target.
  if (length === "tiny")
    return { scenarioId: scenario.id, kind: scenario.kind, title: fill(scenario.title), text: opening };
  const sentences = [opening];
  let size = opening.length + closing.length + 1;
  for (const template of shuffled(rng, scenario.body)) {
    if (size >= LENGTH_TARGETS[length]) break;
    const sentence = fill(template);
    sentences.push(sentence);
    size += sentence.length + 1;
  }
  sentences.push(closing);

  return { scenarioId: scenario.id, kind: scenario.kind, title: fill(scenario.title), text: sentences.join(" ") };
}
