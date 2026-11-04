// The computer on the desk: the monitor and PC case for the computer in use.
import { useEquipped } from "@/state/gameStore";
import { computerLooks } from "./computerLooks";
import Monitor from "./Monitor";
import PcCase from "./PcCase";
import { DESK_HEIGHT } from "./palette";

const MONITOR_FRONT_Z = -0.15;

/** Where on the desk (x, z) each kind of case goes. A flat desktop case sits under the monitor, at the back. */
const caseSpots = { desktop: [0, -0.22], tower: [0.58, -0.12], toaster: [0.52, -0.12] } as const;

export default function Computer() {
  const id = useEquipped("computer")?.id ?? "beige-box";
  // The upgrade ids are plain strings in the data type, but every computer id has a look (checked by computerLooks).
  const look = computerLooks[id as keyof typeof computerLooks];

  return (
    <>
      {/* The front of every monitor sits at the same place, so a deeper (older) one extends further back. */}
      <Monitor look={look} position={[0, DESK_HEIGHT, MONITOR_FRONT_Z - look.depth / 2]} />
      {look.pcCase && (
        <PcCase
          look={look.pcCase}
          position={[caseSpots[look.pcCase.kind][0], DESK_HEIGHT, caseSpots[look.pcCase.kind][1]]}
        />
      )}
    </>
  );
}
