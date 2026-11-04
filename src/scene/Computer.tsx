// The computer on the desk: the one in use, with the desktop shown on its screen.
import { useEquipped } from "@/state/gameStore";
import ComputerSet from "./ComputerSet";
import { computerLook } from "./computerLooks";
import { DESK_HEIGHT } from "./palette";

export default function Computer() {
  const look = computerLook(useEquipped("computer")?.id);

  return (
    <group position={[0, DESK_HEIGHT, 0]}>
      <ComputerSet look={look} live />
    </group>
  );
}
