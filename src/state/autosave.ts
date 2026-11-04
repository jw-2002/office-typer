// Loads the saved game into the store, then saves again a few seconds after each change and when the tab is hidden.
import type { SaveRepository } from "@/game/save";
import { toSave } from "@/game/save";
import { progressChanged } from "@/game/progress";
import { progressOf, useGameStore } from "./gameStore";
import { useViewStore } from "./viewStore";

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
    // Someone without a name has not been introduced yet; everyone else starts seated at the desk.
    useViewStore.getState().setViewInstantly(useGameStore.getState().player.name === "" ? "intro" : "seated");
    // Subscribe only after loading, so the load itself is not saved straight back.
    unsubscribe = useGameStore.subscribe((state, previous) => {
      if (!progressChanged(state, previous)) return;
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
