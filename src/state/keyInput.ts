// One place that turns raw window key events into (a) the set of physical keys held down, which
// the 3D keyboard animates, and (b) typed characters, which the typing game consumes.
// Plain TypeScript so it can be tested without a browser.

export type KeyDownEventLike = Pick<
  KeyboardEvent,
  "key" | "code" | "ctrlKey" | "metaKey" | "repeat" | "preventDefault"
>;
export type KeyUpEventLike = Pick<KeyboardEvent, "code">;
export type KeyListener = (key: string) => void;

export type KeyInput = {
  /** Physical keys currently held (event.code). Mutated in place, so read it in useFrame, not render. */
  pressed: Set<string>;
  /** Called with event.key for each fresh keydown. Returns an unsubscribe function. */
  subscribe: (listener: KeyListener) => () => void;
  keyDown: (event: KeyDownEventLike) => void;
  keyUp: (event: KeyUpEventLike) => void;
  /** Used when the window loses focus, otherwise keys held during alt-tab stay stuck down. */
  releaseAll: () => void;
};

// Browser shortcuts we leave alone so reload, full screen and dev tools keep working.
const BROWSER_KEYS = new Set(["F5", "F11", "F12"]);

export function createKeyInput(): KeyInput {
  const pressed = new Set<string>();
  const listeners = new Set<KeyListener>();

  return {
    pressed,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    keyDown(event) {
      pressed.add(event.code);
      const shortcut = event.ctrlKey || event.metaKey;
      // Stops Space, Tab and the arrows from scrolling the page or moving focus.
      if (!shortcut && !BROWSER_KEYS.has(event.code)) event.preventDefault();
      // Held keys auto-repeat; only the first press counts as typing. Shortcuts are never typing.
      if (event.repeat || shortcut) return;
      listeners.forEach((listener) => listener(event.key));
    },
    keyUp(event) {
      pressed.delete(event.code);
    },
    releaseAll() {
      pressed.clear();
    },
  };
}
