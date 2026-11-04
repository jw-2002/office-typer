// Assembles the office: the room, the desk, the computer, the shelf of old computers, the keyboard and mouse in their places.
import Chair from "./Chair";
import DeskClutter from "./DeskClutter";
import Desk from "./Desk";
import Floor from "./Floor";
import Computer from "./Computer";
import Extras from "./extras/Extras";
import NamePlate from "./NamePlate";
import { DESK_HEIGHT } from "./palette";
import Peripherals from "./Peripherals";
import Room from "./Room";
import Shelf from "./Shelf";
import Solid from "./Solid";
import WallDecor from "./WallDecor";

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
