// The base of a laptop: a flat slab that the screen hinges off, with a trackpad at the front. The keyboard sits on top of it.
import { Outlines } from "@react-three/drei";
import type { ComputerLook } from "./computerLooks";
import { LAPTOP_BASE } from "./laptopSize";
import { outline } from "./palette";

export default function LaptopBase({ look }: { look: ComputerLook }) {
  const { width, height, depth, z } = LAPTOP_BASE;
  const material = <meshStandardMaterial color={look.frameColor} roughness={0.4} metalness={0.3} />;
  const front = z + depth / 2;

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, height / 2, z]}>
        <boxGeometry args={[width, height, depth]} />
        {material}
        <Outlines {...outline} />
      </mesh>
      {/* The hinge along the back edge, where the lid meets the base. */}
      <mesh castShadow position={[0, height + 0.006, z - depth / 2 + 0.006]}>
        <boxGeometry args={[width * 0.8, 0.012, 0.012]} />
        <meshStandardMaterial color="#6b7280" roughness={0.5} />
      </mesh>
      {/* A dark well for the keys (hidden under the keyboard itself), and the trackpad in front of it. */}
      <mesh position={[0, height + 0.001, z - 0.02]}>
        <boxGeometry args={[width * 0.8, 0.002, 0.14]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, height + 0.001, front - 0.04]}>
        <boxGeometry args={[0.16, 0.002, 0.06]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.3} />
      </mesh>
    </group>
  );
}
