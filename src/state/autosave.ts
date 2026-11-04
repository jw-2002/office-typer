// Loads the saved game into the store, then saves again a few seconds after each change and when the tab is hidden.
import type { SaveRepository } from "@/game/save";
import { toSave } from "@/game/save";
import { progressOf, useGameStore } from "./gameStore";

/** Minimum gap between saves while the player is typing. */
export const AUTOSAVE_INTERVAL_MS = 5000;

/** Returns a function that stops autosaving. Safe to call twice under React StrictMode. */
export function startAutosave(repository: SaveRepository): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let dirty = false;
  let unsubscribe: (() => void) | null = null;

  const flush = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (!dirty) return;
    dirty = false;
    void repository.save(toSave(progressOf(useGameStore.getState()), Date.now()));
  };
  const onHidden = () => {
    if (document.hidden) flush();
  };

  void repository.load().then((save) => {
    if (stopped) return;
    if (save) useGameStore.getState().load(save);
    // Subscribe only after loading, so the load itself is not saved straight back.
    unsubscribe = useGameStore.subscribe((state, previous) => {
      if (state.player === previous.player && state.upgrades === previous.upgrades && state.stats === previous.stats) {
        return;
      }
      dirty = true;
      timer ??= setTimeout(flush, AUTOSAVE_INTERVAL_MS);
    });
  });

  document.addEventListener("visibilitychange", onHidden);
  window.addEventListener("pagehide", flush);
  return () => {
    stopped = true;
    flush();
    unsubscribe?.();
    document.removeEventListener("visibilitychange", onHidden);
    window.removeEventListener("pagehide", flush);
  };
}
