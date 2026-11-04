// Runs the one current assignment and shares it, so the monitor and the HUD show the same typing state.
import type { ReactNode } from "react";
import { currentJob } from "@/game/progress";
import { useAssignment } from "@/hooks/useAssignment";
import { useCapsLock } from "@/hooks/useCapsLock";
import { useGameStore } from "./gameStore";
import { CurrentAssignmentContext } from "./useCurrentAssignment";

export default function AssignmentProvider({ children }: { children: ReactNode }) {
  const job = useGameStore(currentJob);
  const assignment = useAssignment(job.assignmentTier);
  // Caps Lock comes from the key input context, which the monitor's separate React root cannot reach, so it
  // travels with the assignment instead.
  const capsLock = useCapsLock();
  return <CurrentAssignmentContext value={{ ...assignment, capsLock }}>{children}</CurrentAssignmentContext>;
}
