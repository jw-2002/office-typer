// The desk name plate: a wedge with the job title on it. It gets fancier with every promotion.
import { Text } from "@react-three/drei";
import { currentJob } from "@/game/progress";
import { useGameStore } from "@/state/gameStore";
import { nameplateLook } from "./nameplateLooks";

const HEIGHT = 0.045;
const DEPTH = 0.05;
// The face leans back about 30 degrees, like a real wedge plate, so it reads from above.
const LEAN = 0.5;

export default function NamePlate({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  const job = useGameStore(currentJob);
  const look = nameplateLook(job.id);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* The plate: a thin slab tipped back, standing on a small base. */}
      <mesh position={[0, 0.004, 0]}>
        <boxGeometry args={[look.width + 0.01, 0.008, DEPTH]} />
        <meshStandardMaterial color="#1f2937" roughness={0.6} />
      </mesh>
      <group position={[0, 0.008 + (HEIGHT / 2) * Math.cos(LEAN), 0]} rotation={[-LEAN, 0, 0]}>
        <mesh>
          <boxGeometry args={[look.width, HEIGHT, 0.008]} />
          <meshStandardMaterial
            color={look.color}
            roughness={0.35}
            metalness={look.metalness}
            emissive={look.glow ?? "#000000"}
            emissiveIntensity={look.glow ? 0.35 : 0}
          />
        </mesh>
        <Text
          position={[0, 0, 0.0045]}
          fontSize={0.0125}
          maxWidth={look.width - 0.02}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color={look.textColor}
        >
          {job.title}
        </Text>
      </group>
    </group>
  );
}
