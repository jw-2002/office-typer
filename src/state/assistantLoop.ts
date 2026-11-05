// The game clock: about once a second it moves the game on, so the AI assistant earns, the redundancy countdown runs and office events come round.
// One loop for everything that happens by itself, not a timer per feature. It never runs while the tab is hidden, and a
// long gap (a slept laptop) counts for at most a couple of seconds, so there is no earning while you are away.
import { useEventStore } from "./eventStore";
import { useGameStore } from "./gameStore";

const TICK_MS = 1000;
/** The most real time one tick may count for. */
const MAX_STEP_SECONDS = 2;

/** Returns a function that stops the loop. */
export function startAssistantLoop(): () => void {
  let last = performance.now();

  const id = setInterval(() => {
    const now = performance.now();
    const elapsed = (now - last) / 1000;
    last = now;
    if (document.hidden) return;
    const seconds = Math.min(elapsed, MAX_STEP_SECONDS);
    useGameStore.getState().tick(seconds);
    useEventStore.getState().tick(seconds);
  }, TICK_MS);

  return () => clearInterval(id);
}
