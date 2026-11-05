// The office event that is happening now (a card going round, a cake sale), and the timer until the next one. Not saved:
// reloading just starts the wait again. The rules are in src/game/events.ts; this holds what is on screen.
import { create } from "zustand";
import { fillSlots } from "@/game/assignments";
import type { EventChoice } from "@/game/data/events";
import { FIRST_EVENT_SECONDS, nextEventDelay, pickEvent } from "@/game/events";
import { useGameStore } from "./gameStore";
import { useSoundCueStore } from "./soundCueStore";
import { useViewStore } from "./viewStore";

/** An event as shown: every {slot} already filled in, so the text keeps the same names throughout. */
export type ActiveEvent = {
  id: string;
  title: string;
  text: string;
  choices: readonly { label: string; result: string; choice: EventChoice }[];
};

type EventStore = {
  current: ActiveEvent | null;
  /** What happened after the player chose, shown until they close the box. */
  outcome: string | null;
  secondsUntilNext: number;
  lastId: string | null;
  /** Moves the timer on, and starts an event when it runs out and nothing is in the way. */
  tick: (seconds: number) => void;
  /** Makes a choice. Does nothing if it cannot be afforded. */
  choose: (index: number) => void;
  /** Closes the box and starts the wait for the next event. */
  close: () => void;
};

/** Whether now is a good moment: the player has a name, is still employed, is not in goblin mode or the intro. */
function quietMoment(): boolean {
  const game = useGameStore.getState();
  return (
    game.player.name !== "" &&
    game.finale.stage === "none" &&
    game.goblin.active <= 0 &&
    useViewStore.getState().view === "seated"
  );
}

export const useEventStore = create<EventStore>()((set, get) => ({
  current: null,
  outcome: null,
  secondsUntilNext: FIRST_EVENT_SECONDS,
  lastId: null,
  tick: (seconds) => {
    if (get().current !== null) return;
    const left = get().secondsUntilNext - seconds;
    if (left > 0 || !quietMoment()) {
      // Not time yet, or not a good moment: keep waiting, but never count below zero.
      set({ secondsUntilNext: Math.max(0, left) });
      return;
    }
    const event = pickEvent(Math.random, get().lastId);
    const chosen = new Map<string, string>();
    const fill = (template: string) => fillSlots(template, Math.random, chosen);
    set({
      current: {
        id: event.id,
        title: fill(event.title),
        text: fill(event.text),
        choices: event.choices.map((choice) => ({ label: fill(choice.label), result: fill(choice.result), choice })),
      },
      outcome: null,
      lastId: event.id,
    });
    useSoundCueStore.getState().play("ping");
  },
  choose: (index) => {
    const picked = get().current?.choices[index];
    if (!picked || get().outcome !== null) return;
    if (!useGameStore.getState().chooseEvent(picked.choice)) return;
    set({ outcome: picked.result });
    useSoundCueStore.getState().play("ping");
  },
  close: () => set({ current: null, outcome: null, secondsUntilNext: nextEventDelay(Math.random) }),
}));
