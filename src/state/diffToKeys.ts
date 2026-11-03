/**
 * Turns a change in a text field's value into key presses. On-screen keyboards often report every key as
 * "Unidentified", so instead of reading key events we compare the field before and after each edit:
 * characters removed become Backspaces, characters added become typed keys. This also copes with
 * autocorrect-style replacements, which arrive as one edit.
 */
export function diffToKeys(previous: string, next: string): string[] {
  let shared = 0;
  while (shared < previous.length && shared < next.length && previous[shared] === next[shared]) shared++;

  const removed = previous.length - shared;
  return [...Array<string>(removed).fill("Backspace"), ...next.slice(shared)];
}
