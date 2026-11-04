// Gerald the Plant: a terracotta pot with a bush of blocky leaves that sways very slightly.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import type { Group } from "three";
import { outline } from "../palette";

// Eight leaves around the pot, each a different height and lean, so the bush is not a perfect fan.
const LEAVES = Array.from({ length: 8 }, (_, i) => ({
  yaw: (i / 8) * Math.PI * 2 + (i % 2) * 0.3,
  lean: 0.35 + (i % 3) * 0.2,
  length: 0.1 + (i % 2) * 0.035,
}));

export default function Plant({ position }: { position: [number, number, number] }) {
  const leaves = useRef<Group>(null!);

  useFrame((state) => {
    leaves.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.1) * 0.025;
  });

  return (
    <group position={position}>
      {/* Few sides on purpose: eight, so it looks chunky like everything else. */}
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.055, 0.04, 0.08, 8]} />
        <meshStandardMaterial color="#c2703a" roughness={0.85} />
        <Outlines {...outline} />
      </mesh>
      <mesh position={[0, 0.081, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshStandardMaterial color="#3b2a1e" roughness={1} />
      </mesh>
      <group ref={leaves} position={[0, 0.08, 0]}>
        {LEAVES.map(({ yaw, lean, length }) => (
          // Turn to face outward, then lean the leaf away from the middle.
          <group key={yaw} rotation={[0, yaw, 0]}>
            <group rotation={[lean, 0, 0]}>
              <mesh castShadow position={[0, length / 2, 0]}>
                <boxGeometry args={[0.03, length, 0.006]} />
                <meshStandardMaterial color={length > 0.12 ? "#3f9b4a" : "#56b45c"} roughness={0.8} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}
