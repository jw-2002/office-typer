// The operating system of the computer in use, and a hook that applies it to the whole page.
import { useEffect } from "react";
import type { OsId } from "@/game/data/os";
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
