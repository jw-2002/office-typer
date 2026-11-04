// Things on the back wall: a window that shows the sky (so you can see the time of day), curtains, a cork board with
// sticky notes, and a goblin poster. The board and poster hang low, where the seated camera can see them.
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { Color, MeshBasicMaterial } from "three";
import { palette } from "./palette";

const WALL_Z = -1.94;
const trim = <meshStandardMaterial color={palette.trim} roughness={0.7} />;

function SkyWindow({ x, y }: { x: number; y: number }) {
  const glass = useRef<MeshBasicMaterial>(null!);
  const scene = useThree((state) => state.scene);

  // The glass is the colour of the sky, which the Sun component changes through the day.
  useFrame(() => {
    if (scene.background) glass.current.color.copy(scene.background as Color);
  });

  return (
    <group position={[x, y, WALL_Z]}>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[1.3, 0.75]} />
        {/* Basic material ignores lights, so the sky looks bright by day and dark at night. */}
        <meshBasicMaterial ref={glass} color="#8ab8e8" />
      </mesh>
      {/* Frame: top, bottom, sides and a cross. */}
      {[
        [0, 0.4, 1.46, 0.07],
        [0, -0.4, 1.5, 0.07],
        [-0.69, 0, 0.07, 0.87],
        [0.69, 0, 0.07, 0.87],
        [0, 0, 0.04, 0.75],
        [0, 0, 1.3, 0.04],
      ].map(([px, py, w, h], index) => (
        <mesh key={index} castShadow position={[px, py, 0.02]}>
          <boxGeometry args={[w, h, 0.04]} />
          {trim}
        </mesh>
      ))}
      {/* A curtain at each side, and the rod they hang from. */}
      {[-0.88, 0.88].map((side) => (
        <mesh key={side} castShadow position={[side, -0.02, 0.06]}>
          <boxGeometry args={[0.26, 0.98, 0.06]} />
          <meshStandardMaterial color={palette.curtain} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0.07]}>
        <boxGeometry args={[2.2, 0.025, 0.025]} />
        <meshStandardMaterial color="#4b5563" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

function CorkBoard({ x, y }: { x: number; y: number }) {
  // Notes at fixed spots (position, tilt, colour), so the board looks the same every time.
  const notes = [
    [-0.15, 0.04, 0.08, 0],
    [0.02, -0.03, -0.1, 1],
    [0.14, 0.05, 0.12, 2],
    [-0.06, -0.06, -0.05, 3],
    [0.18, -0.05, 0.04, 0],
  ] as const;
  return (
    <group position={[x, y, WALL_Z]}>
      <mesh castShadow position={[0, 0, 0.01]}>
        <boxGeometry args={[0.5, 0.3, 0.02]} />
        <meshStandardMaterial color="#7a5230" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.022]}>
        <boxGeometry args={[0.46, 0.26, 0.006]} />
        <meshStandardMaterial color={palette.corkBoard} roughness={1} />
      </mesh>
      {notes.map(([nx, ny, tilt, colour], index) => (
        <group key={index} position={[nx, ny, 0.03]} rotation={[0, 0, tilt]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.08, 0.004]} />
            <meshStandardMaterial color={palette.notes[colour]} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.03, 0.004]}>
            <boxGeometry args={[0.012, 0.012, 0.006]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GoblinPoster({ x, y }: { x: number; y: number }) {
  const green = <meshStandardMaterial color="#5fa33f" roughness={0.8} />;
  return (
    <group position={[x, y, WALL_Z]}>
      <mesh castShadow position={[0, 0, 0.008]}>
        <boxGeometry args={[0.3, 0.34, 0.012]} />
        <meshStandardMaterial color={palette.paper} roughness={0.9} />
      </mesh>
      {/* A blocky goblin face: head, big ears, eyes and a nose. */}
      <mesh position={[0, 0.02, 0.016]}>
        <boxGeometry args={[0.1, 0.09, 0.006]} />
        {green}
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.075, 0.035, 0.016]} rotation={[0, 0, side * 0.5]}>
          <boxGeometry args={[0.06, 0.02, 0.006]} />
          {green}
        </mesh>
      ))}
      {[-0.022, 0.022].map((px) => (
        <mesh key={px} position={[px, 0.035, 0.02]}>
          <boxGeometry args={[0.02, 0.02, 0.004]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}
      <mesh position={[0, 0.01, 0.02]}>
        <boxGeometry args={[0.02, 0.03, 0.004]} />
        {green}
      </mesh>
      <Text position={[0, -0.11, 0.017]} fontSize={0.024} color="#1f2937" anchorX="center" anchorY="middle">
        {"GOBLIN\nOF THE MONTH"}
      </Text>
    </group>
  );
}

export default function WallDecor() {
  return (
    <>
      <SkyWindow x={0} y={1.75} />
      {/* Below the shelf and beside where the monitor hides the wall, so the seated camera sees them. */}
      <CorkBoard x={-1.45} y={0.92} />
      <GoblinPoster x={1.55} y={0.93} />
    </>
  );
}
