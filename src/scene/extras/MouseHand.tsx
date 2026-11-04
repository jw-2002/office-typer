// A white glove that rests on the mouse and clicks when you do. It belongs to the Helping Hands upgrade. It is a child of
// the mouse, so it slides around with it.
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { outline } from "../palette";

const glove = <meshStandardMaterial color="#f8fafc" roughness={0.7} />;
const FINGER_X = [-0.016, 0, 0.016] as const;

export default function MouseHand() {
  const index = useRef<Group>(null!);
  // Whether a mouse button is down. A ref, because it changes during animation and must not re-render React.
  const clicking = useRef(false);

  useEffect(() => {
    const down = () => (clicking.current = true);
    const up = () => (clicking.current = false);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  useFrame((_, delta) => {
    index.current.rotation.x = MathUtils.damp(index.current.rotation.x, clicking.current ? -0.5 : -0.2, 40, delta);
  });

  return (
    <group position={[0, 0.024, 0.01]}>
      {/* The palm, and a short cuff behind it where the wrist would be. */}
      <mesh castShadow position={[0, 0.02, 0.02]}>
        <boxGeometry args={[0.058, 0.026, 0.06]} />
        {glove}
        <Outlines {...outline} />
      </mesh>
      <mesh castShadow position={[0, 0.034, 0.075]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.044, 0.03, 0.06]} />
        {glove}
        <Outlines {...outline} />
      </mesh>
      {/* Three fingers curling over the front of the mouse; the first one dips when you click. */}
      {FINGER_X.map((x, i) => (
        <group key={x} ref={i === 1 ? index : undefined} position={[x, 0.026, -0.012]} rotation={[-0.2, 0, 0]}>
          <mesh castShadow position={[0, 0, -0.022]}>
            <boxGeometry args={[0.014, 0.012, 0.048]} />
            {glove}
            <Outlines {...outline} />
          </mesh>
        </group>
      ))}
      <mesh castShadow position={[0.036, 0.012, 0.02]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.016, 0.014, 0.04]} />
        {glove}
        <Outlines {...outline} />
      </mesh>
    </group>
  );
}
