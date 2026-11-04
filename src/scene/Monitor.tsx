// The monitor: a plastic frame on a stand, with the assignment page shown on its screen.
import { Html, RoundedBox } from "@react-three/drei";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useCurrentAssignment } from "@/state/useCurrentAssignment";
import MonitorScreen from "@/ui/MonitorScreen";
import { SCREEN_PX } from "@/ui/screenSize";
import { palette } from "./palette";

const SCREEN = { width: 0.64, height: 0.36 } as const;
const FRAME = { width: 0.7, height: 0.42, depth: 0.03 } as const;
const FRAME_Y = 0.3; // Centre of the frame above the desk.
const SCREEN_Z = FRAME.depth / 2 + 0.0005; // Just in front of the frame, so the two do not fight.

// drei's <Html transform> draws one CSS pixel as (distanceFactor / 400) metres, so this makes the
// DOM page exactly as wide as the screen.
const DISTANCE_FACTOR = (SCREEN.width / SCREEN_PX.width) * 400;

export default function Monitor({ position }: { position: [number, number, number] }) {
  const current = useCurrentAssignment();
  // On touch devices the assignment is in the HUD instead, so the screen stays dark.
  const touch = useCoarsePointer();

  return (
    <group position={position}>
      <RoundedBox args={[FRAME.width, FRAME.height, FRAME.depth]} radius={0.008} position={[0, FRAME_Y, 0]}>
        <meshStandardMaterial color={palette.plastic} roughness={0.5} />
      </RoundedBox>

      {/* Stand: a neck behind the frame and a flat foot. */}
      <mesh position={[0, 0.06, -0.035]}>
        <boxGeometry args={[0.05, 0.12, 0.025]} />
        <meshStandardMaterial color={palette.plastic} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.005, -0.01]}>
        <boxGeometry args={[0.24, 0.01, 0.17]} />
        <meshStandardMaterial color={palette.plastic} roughness={0.5} />
      </mesh>

      {/* The dark glass. meshBasicMaterial ignores lights, which is right for something that glows. */}
      <mesh position={[0, FRAME_Y, SCREEN_Z]}>
        <planeGeometry args={[SCREEN.width, SCREEN.height]} />
        <meshBasicMaterial color={palette.screenOff} />
      </mesh>

      {!touch && (
        // transform makes the DOM follow the 3D object, tilting and shrinking with the camera. A low
        // zIndexRange keeps the page beneath the 2D HUD.
        <Html transform distanceFactor={DISTANCE_FACTOR} position={[0, FRAME_Y, SCREEN_Z + 0.001]} zIndexRange={[0, 0]}>
          <MonitorScreen current={current} />
        </Html>
      )}
    </group>
  );
}
