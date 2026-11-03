import { describe, expect, it, vi } from "vitest";
import { createKeyInput, type KeyDownEventLike } from "./keyInput";

function down(overrides: Partial<KeyDownEventLike> = {}): KeyDownEventLike {
  return {
    key: "a",
    code: "KeyA",
    ctrlKey: false,
    metaKey: false,
    repeat: false,
    preventDefault: vi.fn(),
    ...overrides,
  };
}

describe("createKeyInput", () => {
  it("tracks physical keys while held", () => {
    const input = createKeyInput();
    input.keyDown(down());
    expect(input.pressed.has("KeyA")).toBe(true);
    input.keyUp({ code: "KeyA" });
    expect(input.pressed.has("KeyA")).toBe(false);
  });

  it("sends event.key to listeners and stops after unsubscribe", () => {
    const input = createKeyInput();
    const listener = vi.fn();
    const unsubscribe = input.subscribe(listener);
    input.keyDown(down({ key: "A", code: "KeyA" }));
    expect(listener).toHaveBeenCalledWith("A");

    unsubscribe();
    input.keyDown(down());
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("ignores auto-repeat for typing but keeps the key pressed", () => {
    const input = createKeyInput();
    const listener = vi.fn();
    input.subscribe(listener);
    input.keyDown(down({ repeat: true }));
    expect(listener).not.toHaveBeenCalled();
    expect(input.pressed.has("KeyA")).toBe(true);
  });

  it("does not treat Ctrl or Meta shortcuts as typing, and leaves them to the browser", () => {
    const input = createKeyInput();
    const listener = vi.fn();
    input.subscribe(listener);
    const event = down({ ctrlKey: true });
    input.keyDown(event);
    expect(listener).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("prevents default on normal keys but not on F5, F11 or F12", () => {
    const input = createKeyInput();
    const space = down({ key: " ", code: "Space" });
    input.keyDown(space);
    expect(space.preventDefault).toHaveBeenCalled();

    for (const code of ["F5", "F11", "F12"]) {
      const event = down({ key: code, code });
      input.keyDown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    }
  });

  it("releases every key at once", () => {
    const input = createKeyInput();
    input.keyDown(down({ code: "KeyA" }));
    input.keyDown(down({ code: "KeyB" }));
    input.releaseAll();
    expect(input.pressed.size).toBe(0);
  });
});
