// The context and hook for reaching the one running assignment from the HUD and the 3D monitor.
import { createContext, useContext } from "react";
import type { useAssignment } from "./useAssignment";

/** The running assignment, plus the live keyboard state the on-screen desktop needs. */
export type CurrentAssignment = ReturnType<typeof useAssignment> & { capsLock: boolean };

export const CurrentAssignmentContext = createContext<CurrentAssignment | null>(null);

export function useCurrentAssignment(): CurrentAssignment {
  const value = useContext(CurrentAssignmentContext);
  if (value === null) throw new Error("useCurrentAssignment must be used inside <AssignmentProvider>");
  return value;
}
