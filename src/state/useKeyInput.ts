import { createContext, useContext } from "react";
import type { KeyInput } from "./keyInput";

export const KeyInputContext = createContext<KeyInput | null>(null);

export function useKeyInput(): KeyInput {
  const input = useContext(KeyInputContext);
  if (!input) throw new Error("useKeyInput must be used inside <KeyInputProvider>");
  return input;
}
