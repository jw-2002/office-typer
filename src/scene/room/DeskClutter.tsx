// Everyday things on the desk that make it look used: a steaming mug, a stack of paper, a pen pot, a
// sticky note. All plain blocks. Nothing here can be bought or clicked.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import type { Mesh, MeshBasicMaterial } from "three";
import { useDisplayStore } from "@/state/view/displayStore";
import { DESK_HEIGHT, outline, palette } from "@/scene/palette";

const STEAM_WISPS = 3;
/** How long one wisp takes to rise and fade, in seconds. */
const STEAM_SECONDS = 2.4;

/** Small boxes that rise from the mug, drift sideways and fade out, one after another. */
function Steam() {
  const wisps = useRef<(Mesh | null)[]>([]);

  useFrame((state) => {
    wisps.current.forEach((wisp, index) => {
      if (!wisp) return;
      // Each wisp is a third of a cycle behind the one before it.
      const age = (((state.clock.elapsedTime / STEAM_SECONDS + index / STEAM_WISPS) % 1) + 1) % 1;
      wisp.position.set(Math.sin(age * 6 + index) * 0.008, 0.012 + age * 0.09, 0);
      wisp.scale.setScalar(0.6 + age * 0.9);
      (wisp.material as MeshBasicMaterial).opacity = 0.45 * (1 - age);
    });
  });

  return (
    <group position={[0, 0.075, 0]}>
      {Array.from({ length: STEAM_WISPS }, (_, index) => (
        <mesh
          key={index}
          ref={(element) => {
            wisps.current[index] = element;
          }}
        >
          <boxGeometry args={[0.014, 0.014, 0.014]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Mug({ position }: { position: [number, number, number] }) {
  const reducedMotion = useDisplayStore((state) => state.reducedMotion);
  return (
    <group position={position} rotation={[0, 0.6, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.0375, 0]}>
        <cylinderGeometry args={[0.032, 0.03, 0.075, 8]} />
        <meshStandardMaterial color={palette.mug} roughness={0.5} />
        <Outlines {...outline} />
      </mesh>
      {/* The coffee, just below the rim. */}
      <mesh position={[0, 0.068, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.027, 8]} />
        <meshStandardMaterial color="#3b2418" roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0.041, 0.04, 0]}>
        <boxGeometry args={[0.012, 0.04, 0.012]} />
        <meshStandardMaterial color={palette.mug} roughness={0.5} />
      </mesh>
      {!reducedMotion && <Steam />}
    </group>
  );
}

function PaperStack({ position }: { position: [number, number, number] }) {
  // Sheets slightly off from one another, so the stack is a little untidy.
  const sheets = [
    [0, 0, 0],
    [0.004, 0.0035, 0.06],
    [-0.003, 0.007, -0.05],
    [0.002, 0.0105, 0.1],
  ] as const;
  return (
    <group position={position}>
      {sheets.map(([sx, sy, turn], index) => (
        <mesh key={index} castShadow receiveShadow position={[sx, 0.002 + sy, 0]} rotation={[0, turn, 0]}>
          <boxGeometry args={[0.15, 0.003, 0.21]} />
          <meshStandardMaterial color={palette.paper} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function PenPot({ position }: { position: [number, number, number] }) {
  const pens = [
    [-0.012, 0.2, "#2563eb"],
    [0.01, -0.15, "#dc2626"],
    [0.0, 0.05, "#111827"],
  ] as const;
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.032, 0.028, 0.08, 8]} />
        <meshStandardMaterial color="#4b5563" roughness={0.6} />
        <Outlines {...outline} />
      </mesh>
      {pens.map(([px, lean, colour]) => (
        <mesh key={colour} castShadow position={[px, 0.1, 0]} rotation={[0, 0, lean]}>
          <boxGeometry args={[0.008, 0.11, 0.008]} />
          <meshStandardMaterial color={colour} />
        </mesh>
      ))}
    </group>
  );
}

export default function DeskClutter() {
  return (
    <group position={[0, DESK_HEIGHT, 0]}>
      <Mug position={[-0.27, 0, 0.27]} />
      <PaperStack position={[-0.3, 0, 0.01]} />
      <PenPot position={[0.41, 0, -0.1]} />
      {/* A yellow sticky note by the keyboard. */}
      <mesh castShadow receiveShadow position={[0.2, 0.002, 0.34]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.07, 0.003, 0.07]} />
        <meshStandardMaterial color={palette.notes[0]} roughness={0.9} />
      </mesh>
    </group>
  );
}
