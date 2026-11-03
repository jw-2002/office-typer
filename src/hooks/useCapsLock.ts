import { useSyncExternalStore } from "react";
import { useKeyInput } from "@/state/useKeyInput";

export function useCapsLock(): boolean {
  const input = useKeyInput();
  return useSyncExternalStore(input.subscribeCapsLock, input.isCapsLockOn);
}
