// The keyboard and mouse on the desk. Both come with the computer in use, so they change look when you swap computers;
// a laptop has its keyboard built into its base and no mouse.
import { useEquipped } from "@/state/gameStore";
import Keyboard from "@/scene/keyboard/Keyboard";
import { layoutDepth } from "@/scene/keyboard/layout";
import { computerLook } from "./computerLooks";
import { LAPTOP_BASE, LAPTOP_KEYBOARD_SHIFT } from "./laptopSize";
import Mouse from "./Mouse";
import { DESK_HEIGHT, KEY_UNIT } from "./palette";

export default function Peripherals() {
  const look = computerLook(useEquipped("computer")?.id);
  // A laptop's keyboard sits on top of its base and closer to the screen.
  const lift = look.laptop ? LAPTOP_BASE.height : 0;
  const shift = look.laptop ? LAPTOP_KEYBOARD_SHIFT : 0;

  return (
    <>
      {/* The keyboard is modelled with 1 unit per keycap, so scale it down to real size. Its case spans y from -0.8 to
          0 in those units, so lift it to rest on the desk. */}
      <group
        position={[0, DESK_HEIGHT + lift + 0.8 * KEY_UNIT, 0.12 + shift + (layoutDepth * KEY_UNIT) / 2]}
        scale={KEY_UNIT}
      >
        <Keyboard />
      </group>
      {look.mouse && (
        <group position={[0, DESK_HEIGHT, 0]}>
          {/* The keyboard's cable, a thin black box running back toward the monitor. */}
          <mesh position={[0.06, 0.003, 0]}>
            <boxGeometry args={[0.006, 0.005, 0.2]} />
            <meshStandardMaterial color="#111827" roughness={0.8} />
          </mesh>
          <Mouse look={look.mouse} position={[0.3, 0, 0.22]} />
        </group>
      )}
    </>
  );
}
