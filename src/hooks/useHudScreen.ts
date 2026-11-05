// Whether the desktop is showing full screen in the HUD (phones) rather than on the 3D monitor. Never both at once.
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useViewStore } from "@/state/view/viewStore";

export function useHudScreen(): boolean {
  const touch = useCoarsePointer();
  const view = useViewStore((state) => state.view);
  const screenOpen = useViewStore((state) => state.screenOpen);
  // The intro and the redundancy notice live on the desktop, so they always bring it up.
  return touch && (screenOpen || view === "intro" || view === "notice");
}
