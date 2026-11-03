import { sentencePools } from "./data/sentences";
import { slots } from "./data/slots";
import { titleTemplates } from "./data/titles";
import { pick, shuffled, type Rng } from "./random";

export type AssignmentLength = "short" | "standard" | "long";
export type DocumentKind = keyof typeof titleTemplates;

/** Target character counts. An assignment runs up to one sentence over its target. */
export const LENGTH_TARGETS = { short: 120, standard: 300, long: 600 } as const satisfies Record<
  AssignmentLength,
  number
>;

export type Assignment = {
  kind: DocumentKind;
  /** Shown as the document heading. Not typed by the player. */
  title: string;
  /** The text the player types. */
  text: string;
};

/** Replaces every {slot} with a random value from slots.ts. Unknown slots throw, so data typos surface early. */
export function fillSlots(template: string, rng: Rng): string {
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const options: readonly string[] | undefined = slots[name];
    if (!options) throw new Error(`Unknown slot {${name}} in "${template}"`);
    return pick(rng, options);
  });
}

/**
 * Builds an assignment from the sentence pool for `tier` (0 is easiest). Tiers beyond the available
 * content reuse the hardest pool. Pass a seeded rng for repeatable output.
 */
export function generateAssignment(tier: number, length: AssignmentLength, rng: Rng): Assignment {
  const pool = sentencePools[Math.min(Math.max(tier, 0), sentencePools.length - 1)];
  const target = LENGTH_TARGETS[length];

  // Shuffling first means no sentence repeats inside one assignment.
  const sentences: string[] = [];
  let size = 0;
  for (const template of shuffled(rng, pool)) {
    const sentence = fillSlots(template, rng);
    sentences.push(sentence);
    size += sentence.length + 1;
    if (size > target) break;
  }

  const kind = pick(rng, Object.keys(titleTemplates) as DocumentKind[]);
  return { kind, title: fillSlots(pick(rng, titleTemplates[kind]), rng), text: sentences.join(" ") };
}
