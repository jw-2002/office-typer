// The desk clock: a round face with an hour hand and a minute hand that follow the game clock, which runs one minute per second.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { CLOCK_MINUTES_PER_SECOND, START_MINUTES } from "@/game/time";
import { useGameStore } from "@/state/gameStore";
import { outline } from "../palette";

const FACE_RADIUS = 0.06;
// Hands are drawn pointing up (twelve o'clock) and rotated clockwise, which is a negative turn about the Z axis.
const FULL_TURN = Math.PI * 2;

export default function DeskClock({ position }: { position: [number, number, number] }) {
  const hourHand = useRef<Group>(null!);
  const minuteHand = useRef<Group>(null!);
  // What the hands show now. They chase the real time, so they glide instead of ticking a minute at a time.
  const shown = useRef({ hour: 0, minute: 0 });

  useFrame((_, delta) => {
    // Not wrapped at midnight, so the hands only ever turn forward.
    const total = START_MINUTES + useGameStore.getState().stats.secondsPlayed * CLOCK_MINUTES_PER_SECOND;
    shown.current.minute = MathUtils.damp(shown.current.minute, -(total / 60) * FULL_TURN, 8, delta);
    shown.current.hour = MathUtils.damp(shown.current.hour, -(total / 720) * FULL_TURN, 8, delta);
    minuteHand.current.rotation.z = shown.current.minute;
    hourHand.current.rotation.z = shown.current.hour;
  });

  return (
    // Tipped back a little, so the face looks up at the player.
    <group position={position} rotation={[-0.3, 0.25, 0]}>
      <mesh castShadow receiveShadow position={[0, FACE_RADIUS + 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[FACE_RADIUS + 0.008, FACE_RADIUS + 0.008, 0.032, 12]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} />
        <Outlines {...outline} />
      </mesh>
      <group position={[0, FACE_RADIUS + 0.005, 0.017]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[FACE_RADIUS, FACE_RADIUS, 0.004, 12]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.7} />
        </mesh>
        {/* Marks at twelve, three, six and nine. */}
        {[0, 1, 2, 3].map((quarter) => (
          <mesh
            key={quarter}
            position={[Math.sin((quarter * Math.PI) / 2) * 0.047, Math.cos((quarter * Math.PI) / 2) * 0.047, 0.003]}
          >
            <boxGeometry args={[0.008, 0.008, 0.002]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        ))}
        <group ref={hourHand} position={[0, 0, 0.005]}>
          <mesh position={[0, 0.0165, 0]}>
            <boxGeometry args={[0.009, 0.033, 0.003]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>
        <group ref={minuteHand} position={[0, 0, 0.008]}>
          <mesh position={[0, 0.0225, 0]}>
            <boxGeometry args={[0.006, 0.045, 0.003]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
        </group>
      </group>
      {/* Two little feet. */}
      {[-0.035, 0.035].map((x) => (
        <mesh key={x} castShadow position={[x, 0.005, -0.005]}>
          <boxGeometry args={[0.014, 0.01, 0.03]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}
    </group>
  );
}
