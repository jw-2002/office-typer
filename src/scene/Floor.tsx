// The floor and what is on it: boards in three browns, skirting boards round the walls, and a rug under the desk.
import { palette } from "./palette";

const BOARDS = 12;
const ROOM = { width: 4.9, depth: 3.9 } as const;
const BOARD_DEPTH = ROOM.depth / BOARDS;

export default function Floor() {
  return (
    <group>
      {/* Boards run left to right. A thin gap between them (the boards are a hair narrower) reads as a joint. */}
      {Array.from({ length: BOARDS }, (_, index) => (
        <mesh key={index} receiveShadow position={[0, 0.003, -ROOM.depth / 2 + BOARD_DEPTH * (index + 0.5)]}>
          <boxGeometry args={[ROOM.width, 0.006, BOARD_DEPTH - 0.012]} />
          <meshStandardMaterial color={palette.planks[index % palette.planks.length]} roughness={0.85} />
        </mesh>
      ))}

      {/* Skirting boards along the bottom of the three walls. */}
      <mesh receiveShadow position={[0, 0.05, -1.94]}>
        <boxGeometry args={[ROOM.width, 0.1, 0.02]} />
        <meshStandardMaterial color={palette.trim} roughness={0.7} />
      </mesh>
      {[-2.44, 2.44].map((x) => (
        <mesh key={x} receiveShadow position={[x, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.1, ROOM.depth]} />
          <meshStandardMaterial color={palette.trim} roughness={0.7} />
        </mesh>
      ))}

      {/* The rug: a border and a slightly smaller middle. */}
      <mesh receiveShadow position={[0, 0.009, 0.15]}>
        <boxGeometry args={[2.3, 0.006, 1.7]} />
        <meshStandardMaterial color={palette.rugBorder} roughness={1} />
      </mesh>
      <mesh receiveShadow position={[0, 0.0125, 0.15]}>
        <boxGeometry args={[2.1, 0.006, 1.5]} />
        <meshStandardMaterial color={palette.rug} roughness={1} />
      </mesh>
    </group>
  );
}
