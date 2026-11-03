// One place that turns raw key events into (a) the set of physical keys held down, which the 3D
// keyboard animates, and (b) typed characters, which the typing game consumes. On-screen keyboards
// feed typed characters in through press(). Plain TypeScript so it can be tested without a browser.

type ModifierState = Pick<KeyboardEvent, "getModifierState">;

export type KeyDownEventLike = Pick<
  KeyboardEvent,
  "key" | "code" | "ctrlKey" | "metaKey" | "repeat" | "preventDefault"
> &
  ModifierState;
export type KeyUpEventLike = Pick<KeyboardEvent, "code"> & ModifierState;
export type KeyListener = (key: string) => void;

export type KeyInput = {
  /** Physical keys currently held (event.code). Mutated in place, so read it in useFrame, not render. */
  pressed: Set<string>;
  /** Called with a key name ("a", "Backspace", "Enter") for each typed key. Returns an unsubscribe function. */
  subscribe: (listener: KeyListener) => () => void;
  /** Types a key without a physical keydown. Used by the on-screen keyboard input. */
  press: (key: string) => void;
  keyDown: (event: KeyDownEventLike) => void;
  keyUp: (event: KeyUpEventLike) => void;
  /** Used when the window loses focus, otherwise keys held during alt-tab stay stuck down. */
  releaseAll: () => void;
  isCapsLockOn: () => boolean;
  /** Notifies when Caps Lock changes. Shaped for useSyncExternalStore. */
  subscribeCapsLock: (listener: () => void) => () => void;
};

// Browser shortcuts we leave alone so reload, full screen and dev tools keep working.
const BROWSER_KEYS = new Set(["F5", "F11", "F12"]);

export function createKeyInput(): KeyInput {
  const pressed = new Set<string>();
  const listeners = new Set<KeyListener>();
  const capsListeners = new Set<() => void>();
  let capsLock = false;

  const press = (key: string) => listeners.forEach((listener) => listener(key));

  const syncCapsLock = (event: ModifierState) => {
    const on = event.getModifierState("CapsLock");
    if (on === capsLock) return;
    capsLock = on;
    capsListeners.forEach((listener) => listener());
  };

  return {
    pressed,
    press,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    keyDown(event) {
      syncCapsLock(event);
      pressed.add(event.code);
      const shortcut = event.ctrlKey || event.metaKey;
      // Stops Space, Tab and the arrows from scrolling the page or moving focus.
      if (!shortcut && !BROWSER_KEYS.has(event.code)) event.preventDefault();
      // Held keys auto-repeat; only the first press counts as typing. Shortcuts are never typing.
      if (event.repeat || shortcut) return;
      press(event.key);
    },
    keyUp(event) {
      syncCapsLock(event);
      pressed.delete(event.code);
    },
    releaseAll() {
      pressed.clear();
    },
    isCapsLockOn: () => capsLock,
    subscribeCapsLock(listener) {
      capsListeners.add(listener);
      return () => capsListeners.delete(listener);
    },
  };
}
