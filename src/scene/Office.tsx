// Assembles the office: the room, the desk, the computer, the shelf of old computers, the keyboard and mouse in their places.
import Chair from "@/scene/room/Chair";
import DeskClutter from "@/scene/room/DeskClutter";
import Desk from "@/scene/room/Desk";
import Floor from "@/scene/room/Floor";
import Computer from "@/scene/computer/Computer";
import Extras from "./extras/Extras";
import NamePlate from "@/scene/room/NamePlate";
import { DESK_HEIGHT } from "./palette";
import Peripherals from "@/scene/computer/Peripherals";
import Room from "@/scene/room/Room";
import Shelf from "@/scene/room/Shelf";
import Solid from "./Solid";
import WallDecor from "@/scene/room/WallDecor";

export default function Office() {
  return (
    <>
      <Room />
      <Floor />
      <WallDecor />
      <Shelf />
      {/* Everything on and around the desk is solid, so clicking it never reaches the shelf behind. */}
      <Solid>
        <Desk />
        <Chair />
        <DeskClutter />
        <Computer />
        <Extras />
        {/* Front left of the desk, turned a little toward the player. */}
        <NamePlate position={[-0.5, DESK_HEIGHT, -0.02]} rotationY={0.4} />
        <Peripherals />
      </Solid>
    </>
  );
}
