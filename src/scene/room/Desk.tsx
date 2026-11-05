// The desk: a flat top on four legs, built from boxes. Everything else in the office sits on top of it.
import { Outlines } from "@react-three/drei";
import { DESK_HEIGHT, outline, palette } from "@/scene/palette";

const SIZE = { width: 1.6, depth: 0.8, thickness: 0.04 } as const;
const LEG = { size: 0.05, height: DESK_HEIGHT - SIZE.thickness } as const;
// Legs sit just inside the corners.
const legX = SIZE.width / 2 - 0.05;
const legZ = SIZE.depth / 2 - 0.05;
const legPositions: [number, number, number][] = [
  [-legX, LEG.height / 2, -legZ],
  [legX, LEG.height / 2, -legZ],
  [-legX, LEG.height / 2, legZ],
  [legX, LEG.height / 2, legZ],
];

export default function Desk() {
  return (
    <group>
      {/* A mesh is a shape (boxGeometry) plus a surface (material). args are the box's width, height, depth. */}
      <mesh castShadow receiveShadow position={[0, DESK_HEIGHT - SIZE.thickness / 2, 0]}>
        <boxGeometry args={[SIZE.width, SIZE.thickness, SIZE.depth]} />
        <meshStandardMaterial color={palette.desk} roughness={0.8} />
        <Outlines {...outline} />
      </mesh>
      {legPositions.map((position) => (
        <mesh key={position.join()} castShadow position={position}>
          <boxGeometry args={[LEG.size, LEG.height, LEG.size]} />
          <meshStandardMaterial color={palette.deskLeg} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
