// A shelf on the back wall holding the computers you own but are not using. Click one to switch to it.
import { upgrades } from "@/game/data/upgrades";
import { useEquipped, useGameStore } from "@/state/gameStore";
import ComputerSet from "./ComputerSet";
import { computerLook } from "./computerLooks";
import { palette, SET_CENTER } from "./palette";

const SHELF = { width: 4.4, depth: 0.3, thickness: 0.04, y: 1.1, z: -1.8 } as const;
// The old computers are shown at a fraction of their real size, so a whole row fits on the shelf.
const SCALE = 0.3;

// One fixed spot (x position along the shelf) per computer, so each old one always sits in the same place.
// The middle of the shelf is hidden behind the monitor, so they sit in two groups at the sides.
const SPOTS: Readonly<Record<string, number>> = {
  "beige-box": -1.7,
  "grey-tower": -1.3,
  "silver-laptop": 1.2,
  "gaming-rig": 1.5,
  "quantum-toaster": 1.8,
};

const computers = upgrades.filter((upgrade) => upgrade.category === "computer");

export default function Shelf() {
  const owned = useGameStore((state) => state.upgrades);
  const inUse = useEquipped("computer");
  const equip = useGameStore((state) => state.equip);

  return (
    <group>
      <mesh position={[0, SHELF.y - SHELF.thickness / 2, SHELF.z]}>
        <boxGeometry args={[SHELF.width, SHELF.thickness, SHELF.depth]} />
        <meshStandardMaterial color={palette.desk} roughness={0.8} />
      </mesh>

      {computers
        .filter((computer) => owned.includes(computer.id) && computer.id !== inUse?.id)
        .map((computer) => {
          const x = SPOTS[computer.id] ?? 0;
          return (
            <group
              key={computer.id}
              // Move the scaled set so its middle is at the spot, resting on the board.
              position={[x - SET_CENTER.x * SCALE, SHELF.y, SHELF.z - SET_CENTER.z * SCALE]}
              scale={SCALE}
              onClick={(event) => {
                event.stopPropagation();
                document.body.style.cursor = "";
                equip(computer.id);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                document.body.style.cursor = "var(--cursor-pointer)";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "";
              }}
            >
              <ComputerSet look={computerLook(computer.id)} />
            </group>
          );
        })}
    </group>
  );
}
