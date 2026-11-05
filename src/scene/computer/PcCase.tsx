// The PC case on the desk: a flat desktop case (under the monitor), a tower beside it, or a toaster.
import { Outlines, RoundedBox } from "@react-three/drei";
import { Color } from "three";
import type { CaseLook } from "./computerLooks";
import { outline } from "@/scene/palette";
import QuantumToaster from "./QuantumToaster";

type PcCaseProps = {
  look: CaseLook;
  position: [number, number, number];
  /** True for the computer in use, whose parts can be clicked (the toaster lever). */
  live?: boolean;
};

export default function PcCase({ look, position, live = false }: PcCaseProps) {
  const [width, height, depth] = look.size;
  // A colour brighter than white (each channel above 1) is what makes the glow effect light it up.
  const hot = new Color(look.glow ?? "#ffffff").multiplyScalar(10);

  // The box itself, lifted by half its height so its base touches the desk.
  const body = (
    <RoundedBox castShadow receiveShadow args={[width, height, depth]} radius={0.01} position={[0, height / 2, 0]}>
      <meshStandardMaterial
        color={look.color}
        roughness={look.kind === "toaster" ? 0.3 : 0.6}
        metalness={look.kind === "toaster" ? 0.2 : 0}
      />
      <Outlines {...outline} />
    </RoundedBox>
  );

  if (look.kind === "toaster") {
    return (
      // Turned a quarter turn, so its front faces the middle of the desk and it takes less room sideways.
      <group position={position} rotation={[0, -Math.PI / 2, 0]}>
        {/* The whole toaster is inside the clickable part, so a click anywhere on it works the levers. */}
        <QuantumToaster height={height} depth={depth} interactive={live}>
          {body}
          {/* Two slots on top, glowing from inside. */}
          {[-0.07, 0.07].map((x) => (
            <mesh key={x} position={[x, height + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.1, 0.02]} />
              <meshBasicMaterial color={hot} toneMapped={false} />
            </mesh>
          ))}
        </QuantumToaster>
      </group>
    );
  }

  return (
    <group position={position}>
      {body}

      {look.kind === "desktop" && (
        <>
          {/* A floppy disk slot and a power light on the front. */}
          <mesh position={[-width * 0.2, height * 0.5, depth / 2 + 0.001]}>
            <boxGeometry args={[0.1, 0.012, 0.004]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          <mesh position={[width * 0.38, height * 0.5, depth / 2 + 0.002]}>
            <circleGeometry args={[0.005, 12]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </>
      )}

      {look.kind === "tower" && (
        <>
          {/* Drive bays and a power button on the front. */}
          <mesh position={[0, height * 0.78, depth / 2 + 0.001]}>
            <boxGeometry args={[width * 0.8, 0.025, 0.004]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
          <mesh position={[0, height * 0.66, depth / 2 + 0.001]}>
            <boxGeometry args={[width * 0.8, 0.025, 0.004]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
          <mesh position={[0, height * 0.12, depth / 2 + 0.002]}>
            <circleGeometry args={[0.012, 16]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
        </>
      )}

      {look.glow && look.kind === "tower" && (
        // meshBasicMaterial ignores lighting, so the strip glows at full colour.
        <mesh position={[0, height * 0.4, depth / 2 + 0.002]}>
          <boxGeometry args={[0.008, height * 0.4, 0.002]} />
          <meshBasicMaterial color={hot} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
