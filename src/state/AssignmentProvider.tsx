// Runs the one current assignment and shares it, so the monitor and the HUD show the same typing state.
import type { ReactNode } from "react";
import { currentJob } from "@/game/progress";
import { useAssignment } from "@/hooks/useAssignment";
import { useGameStore } from "./gameStore";
import { CurrentAssignmentContext } from "./useCurrentAssignment";

export default function AssignmentProvider({ children }: { children: ReactNode }) {
  const job = useGameStore(currentJob);
  const assignment = useAssignment(job.assignmentTier);
  return <CurrentAssignmentContext value={assignment}>{children}</CurrentAssignmentContext>;
}
