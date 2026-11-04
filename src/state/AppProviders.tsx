// Composes every app-wide provider in one place, and starts loading and autosaving the game.
import { useEffect, type ReactNode } from "react";
import { startAutosave } from "./autosave";
import KeyInputProvider from "./KeyInputProvider";
import { createLocalSaveRepository } from "./localSaveRepository";

// Providers sit outside <Canvas>, which bridges them inside.
export default function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => startAutosave(createLocalSaveRepository()), []);
  return <KeyInputProvider>{children}</KeyInputProvider>;
}
