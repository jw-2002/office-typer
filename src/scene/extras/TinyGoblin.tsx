// The tiny goblin: a few green blocks with big ears, who sits on the desk and slowly turns his head to look at you.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

const SKIN = "#5fa33f";

export default function TinyGoblin({ position }: { position: [number, number, number] }) {
  const head = useRef<Group>(null!);

  useFrame((state) => {
    // Looks left and right, but never quite away from you.
    head.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.55;
  });

  const skin = <meshStandardMaterial color={SKIN} roughness={0.8} />;

  return (
    // Turned a little toward the player.
    <group position={position} rotation={[0, 0.5, 0]}>
      {/* Legs and body. */}
      {[-0.011, 0.011].map((x) => (
        <mesh key={x} castShadow position={[x, 0.01, 0]}>
          <boxGeometry args={[0.013, 0.02, 0.016]} />
          {skin}
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.045, 0]}>
        <boxGeometry args={[0.038, 0.05, 0.03]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.9} />
      </mesh>
      {/* Arms. */}
      {[-0.027, 0.027].map((x) => (
        <mesh key={x} castShadow position={[x, 0.045, 0.002]} rotation={[0, 0, x > 0 ? -0.2 : 0.2]}>
          <boxGeometry args={[0.01, 0.04, 0.012]} />
          {skin}
        </mesh>
      ))}
      <group ref={head} position={[0, 0.088, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.04, 0.036, 0.036]} />
          {skin}
        </mesh>
        {/* Big pointy ears, one each side. */}
        {[-1, 1].map((side) => (
          <mesh key={side} castShadow position={[side * 0.033, 0.006, 0]} rotation={[0, 0, side * 0.5]}>
            <boxGeometry args={[0.03, 0.009, 0.012]} />
            {skin}
          </mesh>
        ))}
        {/* A long nose, and eyes that are mostly pupil. */}
        <mesh castShadow position={[0, -0.003, 0.025]}>
          <boxGeometry args={[0.01, 0.014, 0.016]} />
          {skin}
        </mesh>
        {[-0.009, 0.009].map((x) => (
          <group key={x} position={[x, 0.007, 0.0185]}>
            <mesh>
              <boxGeometry args={[0.009, 0.009, 0.002]} />
              <meshStandardMaterial color="#fefce8" />
            </mesh>
            <mesh position={[0, 0, 0.0015]}>
              <boxGeometry args={[0.005, 0.006, 0.002]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
