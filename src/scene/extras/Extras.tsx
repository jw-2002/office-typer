// The things you can buy just for fun, placed around the desk. Each appears once it is owned. (The helping hands
// belong to the keyboard, so they are drawn there.)
import { useGameStore } from "@/state/gameStore";
import { DESK_HEIGHT } from "../palette";
import DeskClock from "./DeskClock";
import DeskLamp from "./DeskLamp";
import Plant from "./Plant";
import TinyGoblin from "./TinyGoblin";

export default function Extras() {
  const owned = useGameStore((state) => state.upgrades);

  return (
    // Positions are on the desk: x across it, z from the back (negative) to the front.
    <group position={[0, DESK_HEIGHT, 0]}>
      {owned.includes("plant") && <Plant position={[-0.52, 0, 0.22]} />}
      {owned.includes("desk-clock") && <DeskClock position={[-0.5, 0, -0.3]} />}
      {owned.includes("desk-lamp") && <DeskLamp position={[-0.72, 0, -0.3]} />}
      {owned.includes("tiny-goblin") && <TinyGoblin position={[0.5, 0, 0.27]} />}
    </group>
  );
}
