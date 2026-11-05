// Sparkling specks that drift slowly through the air, only at night. They fade in at dusk and out at dawn.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type BufferAttribute, type PointsMaterial } from "three";
import { timeOfDay } from "@/game/office/time";
import { useDisplayStore } from "@/state/view/displayStore";
import { useGameStore } from "@/state/game/gameStore";
import { nightness } from "@/scene/light/daylight";

const COUNT = 40;
/** The box the dust floats in: around the desk, from desk height up to above the monitor. */
const BOX = { x: [-0.9, 0.9], y: [0.82, 1.5], z: [-0.6, 0.7] } as const;

const between = ([low, high]: readonly [number, number] | readonly number[]) => low + Math.random() * (high - low);

function makeMotes() {
  const positions = new Float32Array(COUNT * 3);
  // How fast and which way each speck drifts, so they do not all move together.
  const drift = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = between(BOX.x);
    positions[i * 3 + 1] = between(BOX.y);
    positions[i * 3 + 2] = between(BOX.z);
    drift[i * 3] = (Math.random() - 0.5) * 0.02;
    drift[i * 3 + 1] = (Math.random() - 0.3) * 0.012;
    drift[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }
  return { positions, drift };
}

// There is one cloud of dust in the office, so its specks are made once here rather than inside the component.
const MOTES = makeMotes();

export default function DustMotes() {
  const reducedMotion = useDisplayStore((state) => state.reducedMotion);
  const geometryAttribute = useRef<BufferAttribute>(null!);
  const material = useRef<PointsMaterial>(null!);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    const { positions, drift } = MOTES;
    for (let i = 0; i < COUNT; i++) {
      for (let axis = 0; axis < 3; axis++) {
        const index = i * 3 + axis;
        positions[index] += drift[index] * delta;
        const [low, high] = [BOX.x, BOX.y, BOX.z][axis];
        // A speck that drifts out of the box comes back in on the other side.
        if (positions[index] < low) positions[index] = high;
        else if (positions[index] > high) positions[index] = low;
      }
    }
    geometryAttribute.current.needsUpdate = true;

    const night = nightness(timeOfDay(useGameStore.getState().stats.secondsPlayed));
    material.current.opacity = MathUtils.damp(material.current.opacity, night * 0.5, 2, delta);
  });

  // No drifting dust when motion is reduced.
  if (reducedMotion) return null;

  return (
    // raycast is switched off so the specks never count as something in front of the monitor screen.
    <points frustumCulled={false} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute ref={geometryAttribute} attach="attributes-position" args={[MOTES.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        size={0.005}
        sizeAttenuation
        color="#fff6dc"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </points>
  );
}
