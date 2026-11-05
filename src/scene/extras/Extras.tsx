// The things you can buy just for fun, placed around the desk. Each appears once it is owned. (The helping hands
// belong to the keyboard, so they are drawn there.)
import { useGameStore } from "@/state/gameStore";
import { DESK_HEIGHT } from "../palette";
import DeskClock from "./DeskClock";
import DeskLamp from "./DeskLamp";
import MiniFridge from "./MiniFridge";
import Plant from "./Plant";
import RubberDuck from "./RubberDuck";
import SecondMonitor from "./SecondMonitor";
import StressBall from "./StressBall";
import TinyGoblin from "./TinyGoblin";

/**
 * Where each extra sits on the desk (x across, z from the back, which is negative, to the front), all in one place so they
 * can be checked against each other. The desk is 1.6 wide (x from -0.8 to 0.8) and 0.8 deep. Taken already: the monitor
 * and its case in the middle at the back, the keyboard and mouse mat at the front, the name plate, paper, mug and pen
 * pot, and a tower case or toaster at the back right. Each extra gets its own patch of desk that none of those use.
 */
const SPOTS = {
  plant: [-0.68, 0.2],
  "desk-clock": [0.38, -0.35],
  "desk-lamp": [-0.76, -0.33],
  "second-monitor": [-0.45, -0.3],
  "rubber-duck": [-0.46, 0.35],
  "stress-ball": [0.38, 0.38],
  "mini-fridge": [0.7, 0.29],
  "tiny-goblin": [0.5, 0.27],
} as const;

export default function Extras() {
  const owned = useGameStore((state) => state.upgrades);
  const stowed = useGameStore((state) => state.stowed);
  // An extra shows when it is owned and has not been put away.
  const out = (id: keyof typeof SPOTS) => owned.includes(id) && !stowed.includes(id);
  const at = (id: keyof typeof SPOTS): [number, number, number] => [SPOTS[id][0], 0, SPOTS[id][1]];

  return (
    <group position={[0, DESK_HEIGHT, 0]}>
      {out("plant") && <Plant position={at("plant")} />}
      {out("desk-clock") && <DeskClock position={at("desk-clock")} />}
      {out("desk-lamp") && <DeskLamp position={at("desk-lamp")} />}
      {out("second-monitor") && <SecondMonitor position={at("second-monitor")} />}
      {out("rubber-duck") && <RubberDuck position={at("rubber-duck")} />}
      {out("stress-ball") && <StressBall position={at("stress-ball")} />}
      {out("mini-fridge") && <MiniFridge position={at("mini-fridge")} />}
      {out("tiny-goblin") && <TinyGoblin position={at("tiny-goblin")} />}
    </group>
  );
}
