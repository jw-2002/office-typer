// Reports whether Caps Lock is on, for the warning in the HUD.
import { useSyncExternalStore } from "react";
import { useKeyInput } from "@/state/useKeyInput";

export function useCapsLock(): boolean {
  const input = useKeyInput();
  return useSyncExternalStore(input.subscribeCapsLock, input.isCapsLockOn);
}
