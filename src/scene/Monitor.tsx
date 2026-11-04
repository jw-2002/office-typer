// The monitor: a plastic frame on a stand, with the desktop shown on its screen. The frame follows the computer look.
import { Html, RoundedBox } from "@react-three/drei";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useCurrentAssignment } from "@/state/useCurrentAssignment";
import MonitorScreen from "@/ui/MonitorScreen";
import { SCREEN_PX } from "@/ui/screenSize";
import type { ComputerLook } from "./computerLooks";
import { palette } from "./palette";

const SCREEN = { width: 0.64, height: 0.36 } as const;
// Centre of the glass above the desk. The same for every monitor, so the camera framing never changes.
const SCREEN_Y = 0.3;

// drei's <Html transform> draws one CSS pixel as (distanceFactor / 400) metres, so this makes the
// DOM page exactly as wide as the screen.
const DISTANCE_FACTOR = (SCREEN.width / SCREEN_PX.width) * 400;

type MonitorProps = { look: ComputerLook; position: [number, number, number] };

export default function Monitor({ look, position }: MonitorProps) {
  const current = useCurrentAssignment();
  // On touch devices the desktop is in the HUD instead, so the screen stays dark.
  const touch = useCoarsePointer();

  const frame = { width: SCREEN.width + look.bezel * 2, height: SCREEN.height + look.bezel * 2, depth: look.depth };
  const frameBottom = SCREEN_Y - frame.height / 2;
  // The glass sits just in front of the frame, so the two do not fight.
  const screenZ = frame.depth / 2 + 0.0005;
  const material = <meshStandardMaterial color={look.frameColor} roughness={0.5} />;

  return (
    <group position={position}>
      <RoundedBox args={[frame.width, frame.height, frame.depth]} radius={0.006} position={[0, SCREEN_Y, 0]}>
        {material}
      </RoundedBox>

      {/* Stand: a neck behind the frame and a flat foot. Monitors whose frame already reaches the desk have none. */}
      {frameBottom > 0.03 && (
        <mesh position={[0, frameBottom / 2, -0.035]}>
          <boxGeometry args={[0.05, frameBottom, 0.025]} />
          {material}
        </mesh>
      )}
      <mesh position={[0, 0.005, -0.01]}>
        <boxGeometry args={[0.24, 0.01, 0.17]} />
        {material}
      </mesh>

      {/* The dark glass. meshBasicMaterial ignores lights, which is right for something that glows. */}
      <mesh position={[0, SCREEN_Y, screenZ]}>
        <planeGeometry args={[SCREEN.width, SCREEN.height]} />
        <meshBasicMaterial color={palette.screenOff} />
      </mesh>

      {!touch && (
        // transform makes the DOM follow the 3D object, tilting and shrinking with the camera. A low
        // zIndexRange keeps the page beneath the 2D HUD.
        <Html transform distanceFactor={DISTANCE_FACTOR} position={[0, SCREEN_Y, screenZ + 0.001]} zIndexRange={[0, 0]}>
          <MonitorScreen current={current} />
        </Html>
      )}
    </group>
  );
}
