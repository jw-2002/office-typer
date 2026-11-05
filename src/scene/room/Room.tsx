// The room: a floor and three walls. The fourth side is open, which is where the player's camera sits.
import { palette } from "@/scene/palette";

const ROOM = { width: 5, depth: 4, height: 3, wall: 0.1 } as const;

function Slab({
  size,
  position,
  color,
}: {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

export default function Room() {
  const { width, depth, height, wall } = ROOM;
  return (
    <group>
      <Slab size={[width, wall, depth]} position={[0, -wall / 2, 0]} color={palette.floor} />
      <Slab size={[width, height, wall]} position={[0, height / 2, -depth / 2]} color={palette.wall} />
      <Slab size={[wall, height, depth]} position={[-width / 2, height / 2, 0]} color={palette.wall} />
      <Slab size={[wall, height, depth]} position={[width / 2, height / 2, 0]} color={palette.wall} />
    </group>
  );
}
