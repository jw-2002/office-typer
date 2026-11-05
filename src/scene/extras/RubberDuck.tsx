// A rubber duck wearing a tiny tie. Click it for a quack and a little hop.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { outline } from "../palette";
import { clicked, hoverHand } from "./clickable";

export default function RubberDuck({ position }: { position: [number, number, number] }) {
  const duck = useRef<Group>(null!);
  // How far through a hop it is: 1 just after a click, easing to 0.
  const hop = useRef(0);

  useFrame((_, delta) => {
    hop.current = MathUtils.damp(hop.current, 0, 5, delta);
    duck.current.position.y = Math.abs(Math.sin(hop.current * Math.PI * 2)) * hop.current * 0.05;
    duck.current.rotation.z = Math.sin(hop.current * 20) * hop.current * 0.2;
  });

  const yellow = <meshStandardMaterial color="#ffd23f" roughness={0.6} />;

  return (
    <group
      position={position}
      rotation={[0, 0.6, 0]}
      {...hoverHand}
      onClick={(event) => {
        clicked(event, "quack");
        hop.current = 1;
      }}
    >
      <group ref={duck}>
        {/* The body, the head, and an orange beak. */}
        <mesh castShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[0.06, 0.04, 0.05]} />
          {yellow}
          <Outlines {...outline} />
        </mesh>
        <mesh castShadow position={[0.012, 0.055, 0]}>
          <boxGeometry args={[0.032, 0.032, 0.032]} />
          {yellow}
          <Outlines {...outline} />
        </mesh>
        <mesh castShadow position={[0.036, 0.052, 0]}>
          <boxGeometry args={[0.016, 0.008, 0.018]} />
          <meshStandardMaterial color="#f97316" roughness={0.6} />
        </mesh>
        {/* A tail, two eyes and the tie. */}
        <mesh position={[-0.034, 0.034, 0]}>
          <boxGeometry args={[0.016, 0.014, 0.02]} />
          {yellow}
        </mesh>
        {[-0.011, 0.011].map((z) => (
          <mesh key={z} position={[0.024, 0.062, z]}>
            <boxGeometry args={[0.005, 0.005, 0.005]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        ))}
        <mesh position={[0.031, 0.036, 0]}>
          <boxGeometry args={[0.005, 0.016, 0.01]} />
          <meshStandardMaterial color="#b91c1c" />
        </mesh>
      </group>
    </group>
  );
}
