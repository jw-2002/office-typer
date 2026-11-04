// The mouse and its mat. The mouse follows your pointer on the monitor screen (move up the screen and it slides away
// from you), and gets a glove holding it if you own the Helping Hands.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { Color, MathUtils, type Group } from "three";
import { useGameStore } from "@/state/gameStore";
import type { MouseLook } from "./computerLooks";
import MouseHand from "./extras/MouseHand";
import { outline } from "./palette";

/** How far the mouse can slide from the middle of the mat, in metres. */
const REACH = { x: 0.06, z: 0.04 } as const;

export default function Mouse({ look, position }: { look: MouseLook; position: [number, number, number] }) {
  const mouse = useRef<Group>(null!);
  const hasHands = useGameStore((state) => state.upgrades.includes("helping-hands"));
  // The glow colour is brighter than white, which is what makes the bloom effect light it up.
  const hot = look.glow ? new Color(look.glow).multiplyScalar(8) : null;

  useFrame((state, delta) => {
    // state.pointer is the pointer over the 3D view, from -1 to 1 with y up: left/right maps to the mat's width, and up
    // the screen maps to away from you (toward the monitor, which is -z).
    mouse.current.position.x = MathUtils.damp(mouse.current.position.x, state.pointer.x * REACH.x, 14, delta);
    mouse.current.position.z = MathUtils.damp(mouse.current.position.z, -state.pointer.y * REACH.z, 14, delta);
  });

  return (
    <group position={position}>
      <mesh receiveShadow position={[0, 0.002, 0]}>
        <boxGeometry args={[0.2, 0.004, 0.17]} />
        <meshStandardMaterial color={look.matColor} roughness={1} />
      </mesh>
      <group ref={mouse}>
        <mesh castShadow position={[0, 0.017, 0]}>
          <boxGeometry args={[0.04, 0.026, 0.065]} />
          <meshStandardMaterial color={look.color} roughness={0.5} />
          <Outlines {...outline} />
        </mesh>
        {/* The scroll wheel, or a light strip on the mice that have one. */}
        <mesh position={[0, 0.031, -0.02]}>
          <boxGeometry args={[0.004, 0.002, 0.02]} />
          {hot ? <meshBasicMaterial color={hot} toneMapped={false} /> : <meshStandardMaterial color="#374151" />}
        </mesh>
        {hasHands && <MouseHand />}
      </group>
    </group>
  );
}
