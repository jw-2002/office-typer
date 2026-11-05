// The base of a laptop: a flat slab that the screen hinges off, with a trackpad at the front. The keyboard sits on top of it.
import { Outlines } from "@react-three/drei";
import type { ComputerLook } from "./computerLooks";
import { layoutDepth, layoutWidth } from "./keyboard/layout";
import { screenSize } from "./monitorGeometry";
import { KEYBOARD_BACK_Z, LAPTOP_BASE, laptopBaseWidth } from "./laptopSize";
import { KEY_UNIT, outline } from "./palette";

export default function LaptopBase({ look }: { look: ComputerLook }) {
  const { height, depth, z } = LAPTOP_BASE;
  const width = laptopBaseWidth(screenSize(look.screenWidth).width, look.bezel);
  const material = <meshStandardMaterial color={look.frameColor} roughness={0.6} metalness={0.05} />;
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
      <mesh position={[0, height + 0.001, KEYBOARD_BACK_Z - 0.005 + (layoutDepth * KEY_UNIT) / 2]}>
        <boxGeometry args={[layoutWidth * KEY_UNIT + 0.03, 0.002, layoutDepth * KEY_UNIT + 0.02]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, height + 0.001, front - 0.052]}>
        <boxGeometry args={[0.16, 0.002, 0.06]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.3} />
      </mesh>
    </group>
  );
}
