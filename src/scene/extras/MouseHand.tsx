// A white-gloved hand that rests on the mouse and clicks when you do, with a sleeve running back toward you. It belongs to
// the Helping Hands upgrade. It is a child of the mouse, so it slides around with it.
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { outline } from "../palette";

const glove = <meshStandardMaterial color="#f8fafc" roughness={0.7} />;
const sleeve = <meshStandardMaterial color="#3b6fb6" roughness={0.9} />;
const cuff = <meshStandardMaterial color="#e2e8f0" roughness={0.8} />;
/** Where the three fingers sit across the front of the hand, with gaps between them. */
const FINGER_X = [-0.017, 0, 0.017] as const;

/** One chunky finger with two parts: the long first part, and a tip that bends down over the mouse button. */
function Finger({ reach }: { reach: number }) {
  return (
    <>
      <mesh castShadow position={[0, 0, -reach / 2]}>
        <boxGeometry args={[0.013, 0.012, reach]} />
        {glove}
        <Outlines {...outline} />
      </mesh>
      <group position={[0, 0, -reach]} rotation={[0.7, 0, 0]}>
        <mesh castShadow position={[0, 0, -0.01]}>
          <boxGeometry args={[0.012, 0.011, 0.022]} />
          {glove}
          <Outlines {...outline} />
        </mesh>
      </group>
    </>
  );
}

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
    index.current.rotation.x = MathUtils.damp(index.current.rotation.x, clicking.current ? 0.35 : 0, 40, delta);
  });

  return (
    // The hand sits on top of the mouse, which is 0.026 tall, and a little toward the player.
    <group position={[0, 0.03, 0.012]}>
      {/* The palm: a domed block over the back of the mouse. */}
      <mesh castShadow position={[0, 0.006, 0.012]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.052, 0.022, 0.05]} />
        {glove}
        <Outlines {...outline} />
      </mesh>
      {/* Three fingers; the middle one dips when you click. */}
      {FINGER_X.map((x, i) => (
        <group key={x} ref={i === 1 ? index : undefined} position={[x, 0.012, -0.012]}>
          <Finger reach={0.03 + (i === 1 ? 0.006 : 0)} />
        </group>
      ))}
      {/* The thumb, on the side nearest the middle of the desk, pointing forward along the mouse. */}
      <group position={[-0.033, 0.002, 0.005]} rotation={[0, 0.25, -0.35]}>
        <mesh castShadow position={[0, 0, -0.012]}>
          <boxGeometry args={[0.014, 0.014, 0.036]} />
          {glove}
          <Outlines {...outline} />
        </mesh>
      </group>
      {/* A cuff, then a sleeve running back and up toward you, so it reads as an arm. */}
      <mesh castShadow position={[0, 0.012, 0.05]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.046, 0.026, 0.02]} />
        {cuff}
        <Outlines {...outline} />
      </mesh>
      <mesh castShadow position={[0, 0.026, 0.12]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.058, 0.04, 0.12]} />
        {sleeve}
        <Outlines {...outline} />
      </mesh>
    </group>
  );
}
