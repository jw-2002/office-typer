// The 3D keyboard: renders every key from the layout and animates the ones being pressed. Its colours come with the computer.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines, RoundedBox, Text } from "@react-three/drei";
import { BoxGeometry, Color, MathUtils, MeshStandardMaterial, type Group } from "three";
import { isOnDesk } from "@/game/progress";
import { useEquipped, useGameStore } from "@/state/gameStore";
import { useKeyInput } from "@/state/useKeyInput";
import HelpingHands from "./HelpingHands";
import { computerLook, type KeyboardLook } from "../computerLooks";
import { outline } from "../palette";
import { keys, layoutDepth, layoutWidth, type KeyDef } from "./layout";
import { DEFAULT_SWITCH_COLOR, switchColors } from "./switchColors";

const KEY_HEIGHT = 0.55;
const TRAVEL = 0.25;
// How far the bottom of a resting keycap is above the keyboard case. The switch housing fills this gap, and
// shows underneath the keycap when you look at the keyboard from above and in front.
const LIFT = 0.3;

// One shared shape for every switch housing, so the GPU holds one copy instead of 87.
const HOUSING = new BoxGeometry(1, LIFT, 0.7);

type Pressed = Set<string>;

type KeyProps = {
  def: KeyDef;
  pressed: Pressed;
  pressColor: Color;
  restColor: Color;
  legendColor: string;
  housing: MeshStandardMaterial;
};

function Key({ def, pressed, pressColor, restColor, legendColor, housing }: KeyProps) {
  const cap = useRef<Group>(null!);
  const material = useRef<MeshStandardMaterial>(null!);

  useFrame((_, delta) => {
    const down = pressed.has(def.code);
    // damp() eases toward the target independent of frame rate.
    cap.current.position.y = MathUtils.damp(
      cap.current.position.y,
      LIFT + KEY_HEIGHT / 2 - (down ? TRAVEL : 0),
      30,
      delta,
    );
    // The keycap flashes the colour of the switch under it.
    material.current.color.lerp(down ? pressColor : restColor, 1 - Math.exp(-20 * delta));
  });

  const press = (e: { stopPropagation: () => void }) => (e.stopPropagation(), pressed.add(def.code));
  const release = () => pressed.delete(def.code);

  return (
    <group position={[def.x, 0, def.z]}>
      {/* The switch does not move; only the keycap above it does. Scaling the shared 1-wide box sets its width. */}
      <mesh castShadow geometry={HOUSING} material={housing} position={[0, LIFT / 2, 0]} scale={[def.w - 0.3, 1, 1]} />
      <group ref={cap} position={[0, LIFT + KEY_HEIGHT / 2, 0]}>
        <RoundedBox
          castShadow
          args={[def.w - 0.1, KEY_HEIGHT, 0.9]}
          radius={0.08}
          smoothness={3}
          onPointerDown={press}
          onPointerUp={release}
          onPointerOut={release}
        >
          <meshStandardMaterial ref={material} color={restColor} roughness={0.5} />
        </RoundedBox>
        <Text
          position={[0, KEY_HEIGHT / 2 + 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.28}
          color={legendColor}
        >
          {def.label}
        </Text>
      </group>
    </group>
  );
}

// A thin strip of light along the front edge, brighter than white so the glow effect picks it up.
function GlowStrip({ color }: { color: string }) {
  const hot = useMemo(() => new Color(color).multiplyScalar(8), [color]);
  return (
    <mesh position={[layoutWidth / 2, -0.4, layoutDepth + 0.16]}>
      <boxGeometry args={[layoutWidth + 0.6, 0.12, 0.04]} />
      <meshBasicMaterial color={hot} toneMapped={false} />
    </mesh>
  );
}

export default function Keyboard() {
  // A Set mutated in place by the key input provider: useFrame reads it, so pressing a key never re-renders React.
  const { pressed } = useKeyInput();
  const look: KeyboardLook = computerLook(useEquipped("computer")?.id).keyboard;
  const restColor = useMemo(() => new Color(look.capColor), [look.capColor]);
  const switchId = useEquipped("switches")?.id;
  const hasHands = useGameStore((state) => isOnDesk(state, "helping-hands"));
  const colorHex = (switchId && switchColors[switchId]) || DEFAULT_SWITCH_COLOR;

  // Built once per switch colour and shared by every key. We create these ourselves, so we also dispose them.
  const pressColor = useMemo(() => new Color(colorHex), [colorHex]);
  const housing = useMemo(() => new MeshStandardMaterial({ color: colorHex, roughness: 0.6 }), [colorHex]);
  useEffect(() => () => housing.dispose(), [housing]);

  return (
    // Centre the board on the origin.
    <group position={[-layoutWidth / 2, 0, -(layoutDepth - 0.5) / 2]}>
      <RoundedBox
        castShadow
        receiveShadow
        args={[layoutWidth + 0.8, 0.8, layoutDepth + 0.3]}
        radius={0.15}
        position={[layoutWidth / 2, -0.4, (layoutDepth - 1) / 2]}
      >
        <meshStandardMaterial color={look.caseColor} roughness={0.7} />
        <Outlines {...outline} />
      </RoundedBox>
      {keys.map((def) => (
        <Key
          key={def.code}
          def={def}
          pressed={pressed}
          pressColor={pressColor}
          restColor={restColor}
          legendColor={look.legendColor}
          housing={housing}
        />
      ))}
      {look.glow && <GlowStrip color={look.glow} />}
      {hasHands && <HelpingHands pressed={pressed} />}
    </group>
  );
}
