// A shelf on the back wall holding the computers you own but are not using, together in the middle. Click one to switch to it.
import { clicked, hoverHand } from "@/scene/clickable";
import { Outlines } from "@react-three/drei";
import { upgrades } from "@/game/data/upgrades";
import { useEquipped, useGameStore } from "@/state/game/gameStore";
import ComputerSet from "@/scene/computer/ComputerSet";
import { computerLook } from "@/scene/computer/computerLooks";
import { SET_CENTER, SHELF, outline, palette } from "@/scene/palette";

// The old computers are shown at a fraction of their real size, so a whole row fits on the shelf.
const SCALE = 0.3;

// One fixed spot (x position along the shelf) per computer, so each old one always sits in the same place. They share
// the middle of the shelf; the desk extras that live on the shelf are at the two ends (see `extras/Extras.tsx`).
const SPOTS: Readonly<Record<string, number>> = {
  "beige-box": -0.7,
  "grey-tower": -0.35,
  "silver-laptop": 0,
  "gaming-rig": 0.35,
  "quantum-toaster": 0.7,
};

const computers = upgrades.filter((upgrade) => upgrade.category === "computer");

export default function Shelf() {
  const owned = useGameStore((state) => state.upgrades);
  const inUse = useEquipped("computer");
  const equip = useGameStore((state) => state.equip);

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, SHELF.y - SHELF.thickness / 2, SHELF.z]}>
        <boxGeometry args={[SHELF.width, SHELF.thickness, SHELF.depth]} />
        <meshStandardMaterial color={palette.desk} roughness={0.8} />
        <Outlines {...outline} />
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
              {...hoverHand}
              onClick={(event) => {
                clicked(event);
                // The computer leaves the shelf, so the pointer is no longer over anything clickable.
                document.body.style.cursor = "";
                equip(computer.id);
              }}
            >
              <ComputerSet look={computerLook(computer.id)} />
            </group>
          );
        })}
    </group>
  );
}
