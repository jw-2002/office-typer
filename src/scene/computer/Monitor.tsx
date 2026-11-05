// The monitor: a plastic frame on a stand with dark glass. MonitorBody is just the model (used for the old
// computers on the shelf); Monitor adds the live desktop on the glass.
import type { ReactNode } from "react";
import { Html, Outlines, RoundedBox } from "@react-three/drei";
import { CustomBlending, DoubleSide, ZeroFactor } from "three";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useCurrentAssignment } from "@/state/assignment/useCurrentAssignment";
import MonitorScreen from "@/ui/desktop/MonitorScreen";
import { SCREEN_PX } from "@/ui/desktop/screenSize";
import type { ComputerLook } from "./computerLooks";
import { screenSize, tiltClearance } from "./monitorGeometry";
import { outline, palette } from "@/scene/palette";

// Centre of the glass above the desk. The same for every monitor, so the camera framing never changes.
const SCREEN_Y = 0.3;
// How far the screen leans back, in radians (about 11 degrees).
const TILT = 0.2;

// drei's <Html transform> draws one CSS pixel as (distanceFactor / 400) metres, so this makes the
// DOM page exactly as wide as the screen.
const distanceFactor = (screenWidth: number) => (screenWidth / SCREEN_PX.width) * 400;

// The glass as the 3D scene sees it: a surface that blends to nothing (zero colour, zero opacity), so the canvas is
// transparent there and the web page behind it shows through. It still hides whatever is behind it.
const HOLE = (
  <meshBasicMaterial
    side={DoubleSide}
    blending={CustomBlending}
    blendSrc={ZeroFactor}
    blendDst={ZeroFactor}
    blendSrcAlpha={ZeroFactor}
    blendDstAlpha={ZeroFactor}
  />
);

type MonitorBodyProps = {
  look: ComputerLook;
  /** Drawn on the glass. Its origin is the centre of the screen, facing out. */
  children?: ReactNode;
};

export function MonitorBody({ look, children }: MonitorBodyProps) {
  const glass = screenSize(look.screenWidth);
  const frame = { width: glass.width + look.bezel * 2, height: glass.height + look.bezel * 2, depth: look.depth };
  const screenY = look.screenY ?? SCREEN_Y;
  const frameBottom = screenY - frame.height / 2;
  // Leaning back swings the back-bottom edge of a deep monitor down, which would push it into the case under it.
  const lift = tiltClearance(frame.height, frame.depth, TILT);
  // The glass sits just in front of the frame, so the two do not fight.
  const screenZ = frame.depth / 2 + 0.0005;
  const material = <meshStandardMaterial color={look.frameColor} roughness={0.5} />;

  return (
    <group>
      {/* The frame, glass and screen tilt together about the middle of the screen. Real monitors lean back a
          little, and it makes the screen face a camera that looks down at it. */}
      <group position={[0, screenY + lift, 0]} rotation={[-TILT, 0, 0]}>
        <RoundedBox castShadow args={[frame.width, frame.height, frame.depth]} radius={0.006}>
          {material}
          <Outlines {...outline} />
        </RoundedBox>

        {/* The dark glass. meshBasicMaterial ignores lights, which is right for something that glows. */}
        <mesh position={[0, 0, screenZ]}>
          <planeGeometry args={[glass.width, glass.height]} />
          <meshBasicMaterial color={palette.screenOff} />
        </mesh>

        <group position={[0, 0, screenZ + 0.001]}>{children}</group>
      </group>

      {/* Stand: a neck behind the frame and a flat foot. Monitors whose frame already reaches the desk have none. */}
      {!look.laptop && frameBottom > 0.03 && (
        <mesh castShadow position={[0, frameBottom / 2, -0.035]}>
          <boxGeometry args={[0.05, frameBottom, 0.025]} />
          {material}
        </mesh>
      )}
      {!look.laptop && (
        <mesh castShadow receiveShadow position={[0, 0.005, -0.01]}>
          <boxGeometry args={[0.24, 0.01, 0.17]} />
          {material}
        </mesh>
      )}
    </group>
  );
}

/** The monitor in use, showing the desktop. */
export default function Monitor({ look }: { look: ComputerLook }) {
  const current = useCurrentAssignment();
  // On touch devices the desktop is in the HUD instead, so the screen stays dark.
  const touch = useCoarsePointer();

  return (
    <MonitorBody look={look}>
      {!touch && (
        // transform makes the DOM follow the 3D object, tilting and shrinking with the camera. A low
        // zIndexRange keeps the page beneath the 2D HUD. occlude="blending" puts the page BEHIND the canvas and cuts a
        // see-through hole in the 3D picture where the glass is. Anything in front of the screen (a hand, a mug, the
        // dust) is drawn over the hole, so the page can never appear in front of 3D objects.
        <Html
          transform
          occlude="blending"
          material={HOLE}
          distanceFactor={distanceFactor(screenSize(look.screenWidth).width)}
          zIndexRange={[0, 0]}
        >
          <MonitorScreen current={current} />
        </Html>
      )}
    </MonitorBody>
  );
}
