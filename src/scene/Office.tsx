// Assembles the office: the room, the desk, the monitor and the keyboard in their places.
import Keyboard from "@/scene/keyboard/Keyboard";
import { layoutDepth } from "@/scene/keyboard/layout";
import Desk from "./Desk";
import Monitor from "./Monitor";
import { DESK_HEIGHT, KEY_UNIT } from "./palette";
import Room from "./Room";

export default function Office() {
  return (
    <>
      <Room />
      <Desk />
      <Monitor position={[0, DESK_HEIGHT, -0.2]} />
      {/* The keyboard is modelled with 1 unit per keycap, so scale it down to real size. Its case spans
          y from -0.8 to 0 in those units, so lift it to rest on the desk. */}
      <group position={[0, DESK_HEIGHT + 0.8 * KEY_UNIT, 0.12 + (layoutDepth * KEY_UNIT) / 2]} scale={KEY_UNIT}>
        <Keyboard />
      </group>
    </>
  );
}
