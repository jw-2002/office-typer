// Composes every app-wide provider in one place, and starts loading and autosaving the game and the game clock.
import { useEffect, type ReactNode } from "react";
import { startAssistantLoop } from "@/state/game/assistantLoop";
import { startAutosave } from "@/state/game/autosave";
import AssignmentProvider from "@/state/assignment/AssignmentProvider";
import KeyInputProvider from "@/state/input/KeyInputProvider";
import KeySounds from "@/state/sound/KeySounds";
import { createLocalSaveRepository } from "@/state/game/localSaveRepository";

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
