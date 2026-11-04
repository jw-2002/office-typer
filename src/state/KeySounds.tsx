// Plays a key sound for every typed key, using the sound of the switches in use. Renders nothing.
import { useEffect, useEffectEvent, useState } from "react";
import { createKeyClicker } from "@/audio/keyClicker";
import { switchSounds } from "@/audio/switchSounds";
import { equippedUpgrade } from "@/game/progress";
import { useAudioStore } from "./audioStore";
import { useGameStore } from "./gameStore";
import { useKeyInput } from "./useKeyInput";

// Printable keys, Backspace and Enter make a sound. Shift, arrows and the like do not.
const makesSound = (key: string) => key.length === 1 || key === "Backspace" || key === "Enter";

export default function KeySounds() {
  const input = useKeyInput();
  const [clicker] = useState(createKeyClicker);

  const onKey = useEffectEvent((key: string) => {
    if (useAudioStore.getState().muted || !makesSound(key)) return;
    const switches = equippedUpgrade(useGameStore.getState(), "switches");
    // Every switch id has a sound (checked by switchSounds), but the data type only knows them as strings.
    const sound = switchSounds[(switches?.id ?? "mushy") as keyof typeof switchSounds];
    clicker.play(sound);
  });
  useEffect(() => input.subscribe((key) => onKey(key)), [input]);

  return null;
}
