import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import { Color, MathUtils, type Group, type MeshStandardMaterial } from "three";
import { keys, layoutDepth, layoutWidth, type KeyDef } from "./layout";

const KEY_HEIGHT = 0.6;
const TRAVEL = 0.25;
const REST = new Color("#e5e7eb");
const DOWN = new Color("#f59e0b");

type Pressed = Set<string>;

function Key({ def, pressed }: { def: KeyDef; pressed: Pressed }) {
  const group = useRef<Group>(null!);
  const material = useRef<MeshStandardMaterial>(null!);

  useFrame((_, delta) => {
    const down = pressed.has(def.code);
    // damp() eases toward the target independent of frame rate.
    group.current.position.y = MathUtils.damp(
      group.current.position.y,
      down ? KEY_HEIGHT / 2 - TRAVEL : KEY_HEIGHT / 2 + 0.05,
      30,
      delta,
    );
    material.current.color.lerp(down ? DOWN : REST, 1 - Math.exp(-20 * delta));
  });

  const press = (e: { stopPropagation: () => void }) => (e.stopPropagation(), pressed.add(def.code));
  const release = () => pressed.delete(def.code);

  return (
    <group ref={group} position={[def.x, KEY_HEIGHT / 2 + 0.05, def.z]}>
      <RoundedBox
        args={[def.w - 0.1, KEY_HEIGHT, 0.9]}
        radius={0.08}
        smoothness={3}
        onPointerDown={press}
        onPointerUp={release}
        onPointerOut={release}
      >
        <meshStandardMaterial ref={material} color={REST} roughness={0.5} />
      </RoundedBox>
      <Text position={[0, KEY_HEIGHT / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.28} color="#1f2937">
        {def.label}
      </Text>
    </group>
  );
}

export default function Keyboard() {
  // A stable Set that is mutated in place: useFrame reads it, so pressing a key never re-renders React.
  const [pressed] = useState<Pressed>(() => new Set());

  useEffect(() => {
    // event.code is the physical key, so this works regardless of keyboard layout.
    const down = (e: KeyboardEvent) => {
      pressed.add(e.code);
      // Stop Space/Tab/arrows etc. from scrolling or moving focus, but leave browser shortcuts alone.
      if (!e.ctrlKey && !e.metaKey && !["F5", "F11", "F12"].includes(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => pressed.delete(e.code);
    const clear = () => pressed.clear();

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear); // otherwise keys stick if you alt-tab while holding one
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [pressed]);

  return (
    // Centre the board on the origin.
    <group position={[-layoutWidth / 2, 0, -(layoutDepth - 0.5) / 2]}>
      <RoundedBox
        args={[layoutWidth + 0.8, 0.8, layoutDepth + 0.3]}
        radius={0.15}
        position={[layoutWidth / 2, -0.4, (layoutDepth - 1) / 2]}
      >
        <meshStandardMaterial color="#1f2937" roughness={0.7} />
      </RoundedBox>
      {keys.map((def) => (
        <Key key={def.code} def={def} pressed={pressed} />
      ))}
    </group>
  );
}
