// The operating system of the computer in use, and hooks that apply it and the display settings to the whole page.
import { useEffect } from "react";
import type { OsId } from "@/game/data/os";
import { useDisplayStore } from "@/state/displayStore";
import { useEquipped } from "@/state/gameStore";

/** The OS for the computer currently in use. */
export function useOs(): OsId {
  return useEquipped("computer")?.os ?? "classic";
}

/** Sets <html data-os="..."> so osThemes.css restyles everything, including the page on the 3D monitor. */
export function useOsTheme() {
  const os = useOs();
  useEffect(() => {
    document.documentElement.dataset.os = os;
  }, [os]);
}

/** Sets <html data-reduced-motion> and <html data-large-text> from the display settings, for the CSS to react to. */
export function useDisplayTheme() {
  const reducedMotion = useDisplayStore((state) => state.reducedMotion);
  const largeText = useDisplayStore((state) => state.largeText);
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
    document.documentElement.dataset.largeText = String(largeText);
  }, [reducedMotion, largeText]);
}
