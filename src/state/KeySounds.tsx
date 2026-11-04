// Plays a key sound for every typed key (in the sound of the switches in use), a fanfare on promotion, and a sad tune on redundancy. Renders nothing.
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

  // A promotion gets a fanfare, once, when the reward that carries it arrives. Being made redundant gets a sad tune.
  useEffect(
    () =>
      useGameStore.subscribe((state, previous) => {
        if (useAudioStore.getState().muted) return;
        if (state.lastReward !== previous.lastReward && state.lastReward?.promotedTo) clicker.fanfare();
        if (state.finale.stage === "redundant" && previous.finale.stage !== "redundant") clicker.redundancy();
      }),
    [clicker],
  );

  return null;
}
