// The office chair: a padded seat and backrest on a post with a cross-shaped base. While you are seated it is under you
// (out of sight, behind the camera). When you stand up it is pushed in under the desk, and it rolls back when you
// sit down again.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { useViewStore } from "@/state/view/viewStore";
import { outline, palette } from "@/scene/palette";

/** Where the chair is when you sit in it, and where it ends up when you stand up and push it away. */
const SEATED = { x: 0, z: 0.72, turn: 0.4 } as const;
// Pushed in: the seat is under the desk and the backrest stands just outside its front edge.
const ASIDE = { x: 0, z: 0.22, turn: 0 } as const;
/** Higher is snappier. */
const SPEED = 3;

const metal = <meshStandardMaterial color="#4b5563" roughness={0.4} metalness={0.4} />;
const fabric = <meshStandardMaterial color={palette.fabric} roughness={0.9} />;

export default function Chair() {
  const chair = useRef<Group>(null!);

  useFrame((_, delta) => {
    const goal = useViewStore.getState().view === "standing" ? ASIDE : SEATED;
    chair.current.position.x = MathUtils.damp(chair.current.position.x, goal.x, SPEED, delta);
    chair.current.position.z = MathUtils.damp(chair.current.position.z, goal.z, SPEED, delta);
    chair.current.rotation.y = MathUtils.damp(chair.current.rotation.y, goal.turn, SPEED, delta);
  });

  return (
    <group ref={chair} position={[SEATED.x, 0, SEATED.z]} rotation={[0, SEATED.turn, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.47, 0]}>
        <boxGeometry args={[0.46, 0.08, 0.46]} />
        {fabric}
        <Outlines {...outline} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.72, 0.21]}>
        <boxGeometry args={[0.44, 0.34, 0.06]} />
        {fabric}
        <Outlines {...outline} />
      </mesh>
      {/* The post, and a base made of two crossing bars with a little caster at each end. */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        {metal}
      </mesh>
      {[0, Math.PI / 2].map((angle) => (
        <group key={angle} rotation={[0, angle, 0]}>
          <mesh castShadow position={[0, 0.06, 0]}>
            <boxGeometry args={[0.56, 0.04, 0.06]} />
            {metal}
          </mesh>
          {[-0.27, 0.27].map((x) => (
            <mesh key={x} castShadow position={[x, 0.02, 0]}>
              <boxGeometry args={[0.04, 0.04, 0.04]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
