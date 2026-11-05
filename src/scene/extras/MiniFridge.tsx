// A mini fridge on the desk. Click it to open the door, which shows a light and a lonely yogurt; click again to close it.
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { outline } from "../palette";
import { clicked, hoverHand } from "./clickable";

const WIDTH = 0.14;
const HEIGHT = 0.22;
const DEPTH = 0.16;

export default function MiniFridge({ position }: { position: [number, number, number] }) {
  const door = useRef<Group>(null!);
  const [open, setOpen] = useState(false);

  // The door swings on its left edge toward the player.
  useFrame((_, delta) => {
    door.current.rotation.y = MathUtils.damp(door.current.rotation.y, open ? -1.9 : 0, 8, delta);
  });

  const body = <meshStandardMaterial color="#9fd4d0" roughness={0.5} />;

  return (
    <group
      position={position}
      {...hoverHand}
      onClick={(event) => {
        clicked(event, "clunk");
        setOpen((value) => !value);
      }}
    >
      {/* The cabinet, hollow at the front so the inside can show: a back, two sides, a top and a bottom. */}
      <mesh castShadow position={[0, HEIGHT / 2, -DEPTH / 2 + 0.01]}>
        <boxGeometry args={[WIDTH, HEIGHT, 0.02]} />
        {body}
        <Outlines {...outline} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} castShadow position={[(side * (WIDTH - 0.016)) / 2, HEIGHT / 2, 0]}>
          <boxGeometry args={[0.016, HEIGHT, DEPTH]} />
          {body}
        </mesh>
      ))}
      {[0.008, HEIGHT - 0.008].map((y) => (
        <mesh key={y} castShadow position={[0, y, 0]}>
          <boxGeometry args={[WIDTH, 0.016, DEPTH]} />
          {body}
        </mesh>
      ))}
      {/* The inside: a shelf, a yogurt, and a light that is only on when the door is open. */}
      <mesh position={[0, HEIGHT * 0.5, 0]}>
        <boxGeometry args={[WIDTH - 0.03, 0.006, DEPTH - 0.04]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0.025, HEIGHT * 0.5 + 0.02, 0.01]}>
        <boxGeometry args={[0.03, 0.035, 0.03]} />
        <meshStandardMaterial color="#f9a8d4" />
      </mesh>
      {open && (
        <mesh position={[0, HEIGHT - 0.03, 0.02]}>
          <boxGeometry args={[0.06, 0.006, 0.06]} />
          <meshBasicMaterial color="#fff6c8" />
        </mesh>
      )}
      {/* The door, hinged at its left edge. */}
      <group ref={door} position={[-WIDTH / 2, 0, DEPTH / 2]}>
        <mesh castShadow position={[WIDTH / 2, HEIGHT / 2, 0.008]}>
          <boxGeometry args={[WIDTH, HEIGHT, 0.016]} />
          <meshStandardMaterial color="#c9ece8" roughness={0.4} />
          <Outlines {...outline} />
        </mesh>
        <mesh position={[WIDTH - 0.02, HEIGHT * 0.6, 0.026]}>
          <boxGeometry args={[0.008, 0.07, 0.012]} />
          <meshStandardMaterial color="#6b7280" metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
