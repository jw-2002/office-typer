// Reading and writing the browser's localStorage without ever throwing. It can be blocked (private windows, strict
// settings), and then the game still works: things just are not remembered.

/** The stored text for a key, or null if there is none or storage is blocked. */
export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Stores text under a key. Silently does nothing if storage is blocked. */
export function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Blocked: the setting just will not be remembered.
  }
}
