// The desk lamp: it glows warmly after dark and switches itself off in the daytime, following the game clock.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type MeshStandardMaterial, type PointLight } from "three";
import { timeOfDay } from "@/game/office/time";
import { useGameStore } from "@/state/game/gameStore";
import { isDark } from "@/scene/light/daylight";

export default function DeskLamp({ position }: { position: [number, number, number] }) {
  const bulb = useRef<MeshStandardMaterial>(null!);
  const glow = useRef<PointLight>(null!);
  // 0 is off and 1 is fully lit. It eases between them, so the lamp fades on rather than snapping.
  const level = useRef(0);

  useFrame((_, delta) => {
    const dark = isDark(timeOfDay(useGameStore.getState().stats.secondsPlayed));
    level.current = MathUtils.damp(level.current, dark ? 1 : 0, 3, delta);
    bulb.current.emissiveIntensity = level.current * 6;
    glow.current.intensity = level.current * 1.1;
  });

  const metal = <meshStandardMaterial color="#374151" roughness={0.5} metalness={0.3} />;

  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.0075, 0]}>
        <boxGeometry args={[0.1, 0.015, 0.1]} />
        {metal}
      </mesh>
      {/* An upright post, an arm out to one side, and a square shade at the end. */}
      <mesh castShadow position={[0, 0.115, 0]}>
        <boxGeometry args={[0.012, 0.2, 0.012]} />
        {metal}
      </mesh>
      <mesh castShadow position={[0.045, 0.215, 0]}>
        <boxGeometry args={[0.1, 0.012, 0.012]} />
        {metal}
      </mesh>
      <mesh castShadow position={[0.09, 0.2, 0]}>
        <boxGeometry args={[0.07, 0.035, 0.07]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>
      <mesh position={[0.09, 0.18, 0]}>
        <boxGeometry args={[0.035, 0.008, 0.035]} />
        {/* Emissive means the surface gives off its own light, so the bulb looks lit even in the dark. */}
        <meshStandardMaterial ref={bulb} color="#fff3c4" emissive="#ffd27a" emissiveIntensity={0} />
      </mesh>
      <pointLight ref={glow} position={[0.09, 0.16, 0]} color="#ffd9a0" intensity={0} distance={1.4} decay={2} />
    </group>
  );
}
