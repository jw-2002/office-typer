// The "Goblin of the month" poster on the back wall, and the goblin mode easter egg: poke it to start goblin mode (ten
// times the pay, goblin emails, everything green). It can be used once every five minutes. While it cannot, a green
// loading symbol spins on it, and poking it gives a green "not yet". In goblin mode the goblin looks wilder and talks.
import { hoverHand } from "@/scene/clickable";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { Group } from "three";
import { useGameStore } from "@/state/game/gameStore";
import { palette } from "@/scene/palette";

const WALL_Z = -1.94;
const GREEN = "#39ff14";
const DARK_GREEN = "#04200a";

/** What the goblin shouts in goblin mode. The one shown follows how many times goblin mode has been used. */
const SHOUTS = [
  "TYPE FASTER,\nHUMAN!",
  "FEED ME\nWORDS!",
  "MORE GOBLIN,\nFEWER TYPOS!",
  "SNACKS FOR\nEVERY KEYSTROKE!",
];

/** A loading symbol: a ring of small squares that spins, with a fading tail. */
function Spinner() {
  const ring = useRef<Group>(null!);
  useFrame((state) => {
    ring.current.rotation.z = -state.clock.elapsedTime * 5;
  });
  return (
    <group ref={ring}>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        // The squares get smaller along the tail, so it looks like it is chasing itself.
        const size = 0.005 + (index / 8) * 0.01;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.026, Math.sin(angle) * 0.026, 0]}>
            <boxGeometry args={[size, size, 0.004]} />
            <meshBasicMaterial color={GREEN} />
          </mesh>
        );
      })}
    </group>
  );
}

/** A green "not yet" that rises and fades over a second. A new one is made for every poke (see the key where it is used). */
function NotYet() {
  const label = useRef<{ fillOpacity: number; outlineOpacity: number; position: { y: number } } | null>(null);
  const age = useRef(0);
  useFrame((_, delta) => {
    if (!label.current || age.current >= 1.2) return;
    age.current += delta;
    const t = Math.min(1, age.current / 1.2);
    label.current.position.y = 0.2 + t * 0.06;
    const opacity = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
    label.current.fillOpacity = opacity;
    label.current.outlineOpacity = opacity;
  });
  return (
    <Text
      ref={label as never}
      raycast={() => null}
      position={[0, 0.2, 0.04]}
      fontSize={0.045}
      color={GREEN}
      outlineWidth={0.005}
      outlineColor={DARK_GREEN}
      anchorX="center"
      anchorY="middle"
    >
      not yet
    </Text>
  );
}

export default function GoblinPoster({ x, y }: { x: number; y: number }) {
  const active = useGameStore((state) => state.goblin.active > 0);
  const cooling = useGameStore((state) => state.goblin.cooldown > 0);
  const uses = useGameStore((state) => state.stats.goblinUses);
  const startGoblin = useGameStore((state) => state.startGoblin);
  // Counts pokes while it is not ready, so each one shows a fresh "not yet".
  const [pokes, setPokes] = useState(0);

  const ready = !cooling && !active;

  const onClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    // Nothing happens during the intro, before the player has a name.
    if (useGameStore.getState().player.name === "") return;
    if (ready) startGoblin();
    else if (!active) setPokes((count) => count + 1);
  };

  const skin = (
    <meshStandardMaterial
      color={active ? GREEN : "#5fa33f"}
      emissive={GREEN}
      emissiveIntensity={active ? 0.6 : 0}
      roughness={0.8}
    />
  );

  return (
    <group position={[x, y, WALL_Z]} onClick={onClick} {...hoverHand}>
      <mesh castShadow position={[0, 0, 0.008]}>
        <boxGeometry args={[0.3, 0.34, 0.012]} />
        <meshStandardMaterial color={active ? DARK_GREEN : palette.paper} roughness={0.9} />
      </mesh>
      {/* A blocky goblin face: head, big ears, eyes and a nose. */}
      <mesh position={[0, 0.02, 0.016]}>
        <boxGeometry args={[active ? 0.12 : 0.1, 0.09, 0.006]} />
        {skin}
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (active ? 0.09 : 0.075), active ? 0.05 : 0.035, 0.016]}
          rotation={[0, 0, side * (active ? 0.8 : 0.5)]}
        >
          <boxGeometry args={[active ? 0.08 : 0.06, 0.02, 0.006]} />
          {skin}
        </mesh>
      ))}
      {[-0.022, 0.022].map((px) => (
        <mesh key={px} position={[px, 0.035, 0.02]}>
          <boxGeometry args={active ? [0.026, 0.026, 0.004] : [0.02, 0.02, 0.004]} />
          {/* In goblin mode the eyes glow red (bright enough to bloom). */}
          <meshStandardMaterial
            color={active ? "#ff2a2a" : "#111827"}
            emissive="#ff2a2a"
            emissiveIntensity={active ? 4 : 0}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.01, 0.02]}>
        <boxGeometry args={[0.02, 0.03, 0.004]} />
        {skin}
      </mesh>
      {/* A wide grin full of teeth, only in goblin mode. */}
      {active && (
        <group position={[0, -0.005, 0.021]}>
          <mesh>
            <boxGeometry args={[0.08, 0.018, 0.003]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          {[-0.03, -0.015, 0, 0.015, 0.03].map((tx) => (
            <mesh key={tx} position={[tx, 0.004, 0.003]}>
              <boxGeometry args={[0.008, 0.008, 0.002]} />
              <meshBasicMaterial color="#f8fafc" />
            </mesh>
          ))}
        </group>
      )}
      <Text
        position={[0, -0.11, 0.017]}
        fontSize={active ? 0.022 : 0.024}
        color={active ? GREEN : "#1f2937"}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        {active ? SHOUTS[uses % SHOUTS.length] : "GOBLIN\nOF THE MONTH"}
      </Text>
      {/* The loading symbol: shown while goblin mode cannot be started. */}
      {cooling && !active && (
        <group position={[0.118, -0.128, 0.02]}>
          <Spinner />
        </group>
      )}
      {pokes > 0 && cooling && !active && <NotYet key={pokes} />}
    </group>
  );
}
