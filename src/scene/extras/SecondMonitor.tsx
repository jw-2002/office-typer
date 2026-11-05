// A second, smaller monitor on the desk, always showing lines of green "code" that scroll past, in case anyone is watching.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import type { Mesh } from "three";
import { outline } from "../palette";

const ROWS = 8;
const SCREEN = { width: 0.26, height: 0.16 } as const;

export default function SecondMonitor({ position }: { position: [number, number, number] }) {
  const bars = useRef<(Mesh | null)[]>([]);

  // Each row of "code" is a bar that grows and shrinks at its own pace, which looks like busy typing from a distance.
  useFrame((state) => {
    bars.current.forEach((bar, index) => {
      if (!bar) return;
      const length = 0.3 + 0.7 * Math.abs(Math.sin(state.clock.elapsedTime * (0.7 + index * 0.13) + index * 1.7));
      bar.scale.x = length;
      bar.position.x = -SCREEN.width / 2 + 0.014 + (length * (SCREEN.width - 0.03)) / 2;
    });
  });

  return (
    // Turned a little toward the player.
    <group position={position} rotation={[0, 0.35, 0]}>
      <mesh castShadow position={[0, 0.006, 0]}>
        <boxGeometry args={[0.1, 0.012, 0.07]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh castShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[0.02, 0.09, 0.02]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <group position={[0, 0.15, 0]}>
        <mesh castShadow>
          <boxGeometry args={[SCREEN.width + 0.02, SCREEN.height + 0.02, 0.02]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
          <Outlines {...outline} />
        </mesh>
        <mesh position={[0, 0, 0.0105]}>
          <planeGeometry args={[SCREEN.width, SCREEN.height]} />
          <meshBasicMaterial color="#04140a" />
        </mesh>
        {Array.from({ length: ROWS }, (_, index) => (
          <mesh
            key={index}
            ref={(element) => {
              bars.current[index] = element;
            }}
            position={[0, SCREEN.height / 2 - 0.015 - index * 0.0185, 0.011]}
          >
            <planeGeometry args={[SCREEN.width - 0.03, 0.007]} />
            <meshBasicMaterial color="#39ff88" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
