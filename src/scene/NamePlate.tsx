// The desk name plate: a wedge with the job title on it. It gets fancier with every promotion, and pops in when it changes.
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { Group } from "three";
import { currentJob } from "@/game/progress";
import { useGameStore } from "@/state/gameStore";
import { nameplateLook } from "./nameplateLooks";

const HEIGHT = 0.045;
const DEPTH = 0.05;
// The face leans back about 30 degrees, like a real wedge plate, so it reads from above.
const LEAN = 0.5;
/** How long the pop-in takes, in seconds. */
const POP_SECONDS = 0.9;

/** Overshoots 1 and settles back, so the new plate bounces into place. t runs from 0 to 1. */
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

type NamePlateProps = { position: [number, number, number]; rotationY?: number };

export default function NamePlate({ position, rotationY = 0 }: NamePlateProps) {
  const job = useGameStore(currentJob);
  const look = nameplateLook(job.id);

  // The pop-in is animation state, not something React draws, so it lives in refs and is applied in useFrame.
  const group = useRef<Group>(null!);
  const popProgress = useRef(1);
  const shownJob = useRef(job.id);
  useEffect(() => {
    if (shownJob.current === job.id) return;
    shownJob.current = job.id;
    popProgress.current = 0;
  }, [job.id]);
  useFrame((_, delta) => {
    if (popProgress.current >= 1) return;
    popProgress.current = Math.min(1, popProgress.current + delta / POP_SECONDS);
    group.current.scale.setScalar(Math.max(0.001, easeOutBack(popProgress.current)));
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={group}>
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
    </group>
  );
}
