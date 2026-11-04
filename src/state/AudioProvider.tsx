// Plays a key sound for every typed key, using the sound of the switches in use, and holds the mute setting.
import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { createKeyClicker } from "@/audio/keyClicker";
import { switchSounds } from "@/audio/switchSounds";
import { equippedUpgrade } from "@/game/progress";
import { useGameStore } from "./gameStore";
import { AudioSettingsContext } from "./useAudio";
import { useKeyInput } from "./useKeyInput";

const MUTED_KEY = "office-typer.muted";

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTED_KEY) === "true";
  } catch {
    return false;
  }
}

// Printable keys, Backspace and Enter make a sound. Shift, arrows and the like do not.
const makesSound = (key: string) => key.length === 1 || key === "Backspace" || key === "Enter";

export default function AudioProvider({ children }: { children: ReactNode }) {
  const input = useKeyInput();
  const [muted, setMuted] = useState(readMuted);
  const [clicker] = useState(createKeyClicker);

  const onKey = useEffectEvent((key: string) => {
    if (muted || !makesSound(key)) return;
    const switches = equippedUpgrade(useGameStore.getState(), "switches");
    // Every switch id has a sound (checked by switchSounds), but the data type only knows them as strings.
    const sound = switchSounds[(switches?.id ?? "mushy") as keyof typeof switchSounds];
    clicker.play(sound);
  });
  useEffect(() => input.subscribe((key) => onKey(key)), [input]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MUTED_KEY, String(muted));
    } catch {
      // Storage blocked: the setting just will not be remembered.
    }
  }, [muted]);

  return <AudioSettingsContext value={{ muted, setMuted }}>{children}</AudioSettingsContext>;
}
