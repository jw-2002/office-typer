// Composes every app-wide provider in one place, and starts loading and autosaving the game and the game clock.
import { useEffect, type ReactNode } from "react";
import { startAssistantLoop } from "./assistantLoop";
import { startAutosave } from "./autosave";
import AssignmentProvider from "./AssignmentProvider";
import KeyInputProvider from "./KeyInputProvider";
import KeySounds from "./KeySounds";
import { createLocalSaveRepository } from "./localSaveRepository";

// Providers sit outside <Canvas>, which bridges them inside.
export default function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => startAutosave(createLocalSaveRepository()), []);
  useEffect(() => startAssistantLoop(), []);
  return (
    <KeyInputProvider>
      <KeySounds />
      <AssignmentProvider>{children}</AssignmentProvider>
    </KeyInputProvider>
  );
}
