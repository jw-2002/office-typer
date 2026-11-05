// A stress ball. Click it to squeeze: it squashes flat, squeaks, and springs back.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { outline } from "../palette";
import { clicked, hoverHand } from "./clickable";

export default function StressBall({ position }: { position: [number, number, number] }) {
  const ball = useRef<Group>(null!);
  // How squashed it is, from 0 (round) to 1 (flat). It is set to 1 on a click and eases back to 0.
  const squash = useRef(0);

  useFrame((_, delta) => {
    squash.current = MathUtils.damp(squash.current, 0, 7, delta);
    const flat = squash.current;
    ball.current.scale.set(1 + flat * 0.35, 1 - flat * 0.45, 1 + flat * 0.35);
  });

  return (
    <group
      position={position}
      {...hoverHand}
      onClick={(event) => {
        clicked(event, "squeak");
        squash.current = 1;
      }}
    >
      <group ref={ball} position={[0, 0.03, 0]}>
        {/* A low-detail sphere, so it looks like the other blocky things. */}
        <mesh castShadow>
          <icosahedronGeometry args={[0.032, 1]} />
          <meshStandardMaterial color="#e2483a" roughness={0.7} flatShading />
          <Outlines {...outline} />
        </mesh>
      </group>
    </group>
  );
}
