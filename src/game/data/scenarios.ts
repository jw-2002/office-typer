// Each scenario is one small, coherent document: an opening line, a pool of sentences about the
// same topic, and a closing line. An assignment picks one scenario, then one opening, as many
// body sentences (shuffled) as the length needs, and one closing.
//
// Writing rules, all enforced by tests where possible:
// - Body sentences must make sense in ANY order, so never start one with "It", "That", "Then" or
//   anything that refers to the sentence before.
// - Plain ASCII only (the player has to be able to type it), and every sentence ends with . ! or ?
// - {slots} come from slots.ts. A slot keeps the same value for the whole assignment. Add a digit
//   ({name2}) to get a second, different value from the same list.

import { everydayIntern } from "./scenariosEveryday1";
import { everydayAssociate } from "./scenariosEveryday2";
import { everydayManager } from "./scenariosEveryday3";
import { extraAssociate, extraIntern, extraManager } from "./scenariosExtra";
import { wildAssociate, wildIntern, wildManager } from "./scenariosWild";

export type DocumentKind = "email" | "memo" | "report";

export type Scenario = {
  /** Stable name, used to avoid showing the same scenario twice in a row. */
  id: string;
  kind: DocumentKind;
  /** Shown as the document heading. Not typed by the player. */
  title: string;
  opening: readonly string[];
  body: readonly string[];
  closing: readonly string[];
};

export const scenarioPools = [
  [...everydayIntern, ...wildIntern, ...extraIntern],
  [...everydayAssociate, ...wildAssociate, ...extraAssociate],
  [...everydayManager, ...wildManager, ...extraManager],
] as const satisfies readonly (readonly Scenario[])[];
