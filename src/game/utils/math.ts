// Small number helpers shared by the rules and the code that plays them.

/** Keeps a number between 0 and 1. */
export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
