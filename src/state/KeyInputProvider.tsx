import { useEffect, useState, type ReactNode } from "react";
import { createKeyInput } from "./keyInput";
import { KeyInputContext } from "./useKeyInput";

// The value never changes after the first render, so consumers do not re-render on keystrokes.
export default function KeyInputProvider({ children }: { children: ReactNode }) {
  const [input] = useState(createKeyInput);

  useEffect(() => {
    window.addEventListener("keydown", input.keyDown);
    window.addEventListener("keyup", input.keyUp);
    window.addEventListener("blur", input.releaseAll);
    return () => {
      window.removeEventListener("keydown", input.keyDown);
      window.removeEventListener("keyup", input.keyUp);
      window.removeEventListener("blur", input.releaseAll);
    };
  }, [input]);

  return <KeyInputContext value={input}>{children}</KeyInputContext>;
}
