// The things you can buy just for fun, placed on the desk or the shelf. Each appears once it is owned. (The helping hands
// belong to the keyboard, so they are drawn there.)
import type { ReactElement } from "react";
import { useGameStore } from "@/state/game/gameStore";
import { DESK_HEIGHT, SHELF } from "../palette";
import DeskClock from "./DeskClock";
import DeskLamp from "./DeskLamp";
import MiniFridge from "./MiniFridge";
import Plant from "./Plant";
import RubberDuck from "./RubberDuck";
import SecondMonitor from "./SecondMonitor";
import StressBall from "./StressBall";
import TinyGoblin from "./TinyGoblin";

/**
 * Where each extra sits, all in one place so they can be checked against each other: which surface, then x across and z
 * from the back (negative) to the front. The desk is 1.6 wide (x from -0.8 to 0.8) and 0.8 deep. Taken already: the
 * monitor and its case in the middle at the back, the keyboard and mouse mat at the front, the name plate, paper, mug
 * and pen pot, and a tower case or toaster at the back right. The bulkier or less-used extras live on the shelf instead,
 * at the two ends (the middle holds the old computers). On the shelf z is measured from the middle of the board.
 */
const SPOTS = {
  "desk-clock": ["desk", -0.46, 0.24],
  "desk-lamp": ["desk", -0.74, -0.17],
  "second-monitor": ["desk", -0.56, -0.3],
  "stress-ball": ["desk", 0.45, 0.2],
  plant: ["shelf", -1.65, 0],
  "tiny-goblin": ["shelf", -1.3, 0],
  "rubber-duck": ["shelf", -1.0, 0],
  "mini-fridge": ["shelf", 1.3, 0],
} as const;

type ExtraId = keyof typeof SPOTS;
const idsOn = (surface: "desk" | "shelf") => (Object.keys(SPOTS) as ExtraId[]).filter((id) => SPOTS[id][0] === surface);

// One component per extra. Each takes a position and is drawn standing on y = 0.
const components: Record<ExtraId, (props: { position: [number, number, number] }) => ReactElement> = {
  plant: Plant,
  "desk-clock": DeskClock,
  "desk-lamp": DeskLamp,
  "second-monitor": SecondMonitor,
  "rubber-duck": RubberDuck,
  "stress-ball": StressBall,
  "mini-fridge": MiniFridge,
  "tiny-goblin": TinyGoblin,
};

export default function Extras() {
  const owned = useGameStore((state) => state.upgrades);
  const stowed = useGameStore((state) => state.stowed);
  // An extra shows when it is owned and has not been put away.
  const shown = (id: ExtraId) => owned.includes(id) && !stowed.includes(id);
  const draw = (id: ExtraId) => {
    const Extra = components[id];
    return <Extra key={id} position={[SPOTS[id][1], 0, SPOTS[id][2]]} />;
  };

  return (
    <>
      <group position={[0, DESK_HEIGHT, 0]}>{idsOn("desk").filter(shown).map(draw)}</group>
      <group position={[0, SHELF.y, SHELF.z]}>{idsOn("shelf").filter(shown).map(draw)}</group>
    </>
  );
}
