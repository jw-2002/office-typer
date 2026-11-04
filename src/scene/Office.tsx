// Assembles the office: the room, the desk, the computer, the shelf of old computers and the keyboard in their places.
import Keyboard from "@/scene/keyboard/Keyboard";
import { layoutDepth } from "@/scene/keyboard/layout";
import Desk from "./Desk";
import Computer from "./Computer";
import NamePlate from "./NamePlate";
import { DESK_HEIGHT, KEY_UNIT } from "./palette";
import Room from "./Room";
import Shelf from "./Shelf";

export default function Office() {
  return (
    <>
      <Room />
      <Desk />
      <Computer />
      <Shelf />
      {/* Front left of the desk, turned a little toward the player. */}
      <NamePlate position={[-0.5, DESK_HEIGHT, -0.02]} rotationY={0.4} />
      {/* The keyboard is modelled with 1 unit per keycap, so scale it down to real size. Its case spans
          y from -0.8 to 0 in those units, so lift it to rest on the desk. */}
      <group position={[0, DESK_HEIGHT + 0.8 * KEY_UNIT, 0.12 + (layoutDepth * KEY_UNIT) / 2]} scale={KEY_UNIT}>
        <Keyboard />
      </group>
    </>
  );
}
