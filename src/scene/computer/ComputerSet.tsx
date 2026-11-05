// One complete computer: monitor and PC case, laid out around a base point on the surface it stands on.
// The same layout is used on the desk (live, with the desktop on the screen) and on the shelf (a model only).
import type { ComputerLook } from "./computerLooks";
import Monitor, { MonitorBody } from "./Monitor";
import LaptopBase from "./LaptopBase";
import PcCase from "./PcCase";

/** Where the front of every monitor sits, so a deeper (older) one extends further back. */
const MONITOR_FRONT_Z = -0.15;

/** Where on the surface (x, z) each kind of case goes. A flat desktop case sits under the monitor, at the back. */
const caseSpots = { desktop: [0, -0.22], tower: [0.58, -0.12], toaster: [0.62, -0.12] } as const;

type ComputerSetProps = {
  look: ComputerLook;
  /** True for the computer in use, which shows the desktop on its screen. */
  live?: boolean;
};

export default function ComputerSet({ look, live = false }: ComputerSetProps) {
  return (
    <>
      <group position={[0, 0, MONITOR_FRONT_Z - look.depth / 2]}>
        {live ? <Monitor look={look} /> : <MonitorBody look={look} />}
      </group>
      {look.laptop && <LaptopBase look={look} />}
      {look.pcCase && (
        <PcCase
          live={live}
          look={look.pcCase}
          position={[caseSpots[look.pcCase.kind][0], 0, caseSpots[look.pcCase.kind][1]]}
        />
      )}
    </>
  );
}
