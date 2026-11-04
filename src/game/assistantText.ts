// The text an AI assistant seems to be typing on its Assistant screen. It is only for show: assistants earn money from
// their speed and accuracy, not from this text. Some have a quirk that leaks into what they type.
import { generateAssignment } from "./assignments";
import type { AssistantSpec } from "./data/upgrades";
import { pick, type Rng } from "./random";

// Plain ASCII, like all game text. Each is a whole sentence that fits anywhere.
const GOBLIN_LINES = [
  "Also, have you considered goblins?",
  "A goblin could have done this faster.",
  "I saw a goblin by the printer.",
  "Goblins are underrated.",
  "Please do not tell the goblins.",
  "The goblin in the cupboard says hello.",
  "This would be better with more goblins.",
  "I have written a short poem about goblins.",
  "No goblins were harmed in the making of this document.",
  "Quick note on goblins, for the record.",
] as const;

/** Where, as a share of the text, a quirk line may be slipped in. */
const EARLIEST = 0.15;
const LATEST = 0.7;

/** A text for the assistant to type, using the scenarios for the given job tier. */
export function assistantText(assistant: AssistantSpec, tier: number, rng: Rng): string {
  const text = generateAssignment(tier, "short", rng).text;
  if (assistant.quirk !== "goblins") return text;

  // Slip a goblin line in between two sentences, and sometimes add one more at the end.
  const line = pick(rng, GOBLIN_LINES);
  const from = Math.floor(text.length * EARLIEST);
  const to = Math.floor(text.length * LATEST);
  const breaks = [...text.matchAll(/[.!?] /g)]
    .map((match) => match.index + 2)
    .filter((index) => index >= from && index <= to);
  const at = breaks.length > 0 ? pick(rng, breaks) : text.length;
  const withLine = at >= text.length ? `${text} ${line}` : `${text.slice(0, at)}${line} ${text.slice(at)}`;
  return rng() < 0.5 ? `${withLine} ${pick(rng, GOBLIN_LINES)}` : withLine;
}
