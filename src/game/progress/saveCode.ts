// Turns a save into a short text code you can copy somewhere safe, and reads one back. No accounts or servers needed.
import { migrate, toSave, type SaveData } from "./save";
import { type Progress } from "./progress";

const PREFIX = "OT1:";

/** The save as one line of text: a prefix, then the save as JSON in base64. */
export function encodeSave(progress: Progress, now: number): string {
  const bytes = new TextEncoder().encode(JSON.stringify(toSave(progress, now)));
  return PREFIX + btoa(String.fromCharCode(...bytes));
}

/** Reads a code back, repairing small problems like a normal load. Gives null when it is not a usable code. */
export function decodeSave(code: string): SaveData | null {
  const text = code.trim();
  if (!text.startsWith(PREFIX)) return null;
  try {
    const binary = atob(text.slice(PREFIX.length));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return migrate(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}
