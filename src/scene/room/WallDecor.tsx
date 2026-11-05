// Things on the back wall: a window that shows the sky (the sun and moon cross it, and stars come out at night), curtains, a cork board with
// sticky notes, and a goblin poster. The board and poster hang low, where the seated camera can see them.
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Color as ThreeColor,
  MathUtils,
  type Color,
  type Group,
  type MeshBasicMaterial,
  type PointsMaterial,
} from "three";
import { timeOfDay } from "@/game/office/time";
import { useGameStore } from "@/state/game/gameStore";
import { nightness, skySpot } from "@/scene/light/daylight";
import GoblinPoster from "./GoblinPoster";
import { palette } from "@/scene/palette";

const WALL_Z = -1.94;
const trim = <meshStandardMaterial color={palette.trim} roughness={0.7} />;

/** Stars at fixed spots on the glass, so the night sky looks the same every time. x and y are from -1 to 1. */
const STAR_COUNT = 40;
const STARS = (() => {
  const positions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    // A simple repeatable scatter (no Math.random), spread over the window.
    positions[i * 3] = (((i * 0.6180339) % 1) * 2 - 1) * 0.6;
    positions[i * 3 + 1] = (((i * 0.7548776) % 1) * 2 - 1) * 0.33;
    positions[i * 3 + 2] = 0.004;
  }
  return positions;
})();

/** How far across and up the window the sun or moon can go, in metres from its middle. */
const SKY_REACH = { x: 0.5, low: -0.2, high: 0.24 } as const;
const SUN_COLOUR = new ThreeColor("#fff1b8").multiplyScalar(4);

function SkyWindow({ x, y }: { x: number; y: number }) {
  const glass = useRef<MeshBasicMaterial>(null!);
  const stars = useRef<PointsMaterial>(null!);
  const sun = useRef<Group>(null!);
  const moon = useRef<Group>(null!);
  const scene = useThree((state) => state.scene);

  useFrame((state, delta) => {
    // The glass is the colour of the sky, which the Sun component changes through the day.
    if (scene.background) glass.current.color.copy(scene.background as Color);

    // The sun and moon cross the window in the same direction the light comes from, so the shadows agree with them.
    const minutes = timeOfDay(useGameStore.getState().stats.secondsPlayed);
    const spot = skySpot(minutes);
    const body = spot.body === "sun" ? sun.current : moon.current;
    sun.current.visible = spot.body === "sun";
    moon.current.visible = spot.body === "moon";
    body.position.x = spot.across * SKY_REACH.x;
    body.position.y = MathUtils.lerp(SKY_REACH.low, SKY_REACH.high, spot.height);

    // Stars come out as it gets dark, and twinkle a little.
    stars.current.opacity = nightness(minutes) * (0.75 + 0.25 * Math.sin(state.clock.elapsedTime * 2 + delta));
  });

  return (
    <group position={[x, y, WALL_Z]}>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[1.3, 0.75]} />
        {/* Basic material ignores lights, so the sky looks bright by day and dark at night. */}
        <meshBasicMaterial ref={glass} color="#8ab8e8" />
      </mesh>
      {/* Stars: fixed dots of light, only visible at night. */}
      <points raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[STARS, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={stars}
          size={2.5}
          sizeAttenuation={false}
          color="#ffffff"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
      {/* The sun: a bright blocky disc with a soft square glow. It is brighter than white, so it blooms. */}
      <group ref={sun} position={[0, 0, 0.006]}>
        <mesh>
          <boxGeometry args={[0.11, 0.11, 0.002]} />
          <meshBasicMaterial color={SUN_COLOUR} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.001]}>
          <boxGeometry args={[0.2, 0.2, 0.002]} />
          <meshBasicMaterial color="#ffe9a0" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      </group>
      {/* The moon: a pale disc with a few darker craters. */}
      <group ref={moon} position={[0, 0, 0.006]}>
        <mesh>
          <boxGeometry args={[0.08, 0.08, 0.002]} />
          <meshBasicMaterial color="#e6ecfa" />
        </mesh>
        {[
          [-0.015, 0.012, 0.016],
          [0.017, -0.012, 0.012],
          [0.008, 0.024, 0.008],
        ].map(([cx, cy, size]) => (
          <mesh key={cx} position={[cx, cy, 0.0015]}>
            <boxGeometry args={[size, size, 0.001]} />
            <meshBasicMaterial color="#b9c4de" />
          </mesh>
        ))}
      </group>
      {/* Frame: top, bottom, sides and a cross. */}
      {[
        [0, 0.4, 1.46, 0.07],
        [0, -0.4, 1.5, 0.07],
        [-0.69, 0, 0.07, 0.87],
        [0.69, 0, 0.07, 0.87],
        [0, 0, 0.04, 0.75],
        [0, 0, 1.3, 0.04],
      ].map(([px, py, w, h], index) => (
        <mesh key={index} castShadow position={[px, py, 0.02]}>
          <boxGeometry args={[w, h, 0.04]} />
          {trim}
        </mesh>
      ))}
      {/* A curtain at each side, and the rod they hang from. */}
      {[-0.88, 0.88].map((side) => (
        <mesh key={side} castShadow position={[side, -0.02, 0.06]}>
          <boxGeometry args={[0.26, 0.98, 0.06]} />
          <meshStandardMaterial color={palette.curtain} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0.07]}>
        <boxGeometry args={[2.2, 0.025, 0.025]} />
        <meshStandardMaterial color="#4b5563" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

function CorkBoard({ x, y }: { x: number; y: number }) {
  // Notes at fixed spots (position, tilt, colour), so the board looks the same every time.
  const notes = [
    [-0.15, 0.04, 0.08, 0],
    [0.02, -0.03, -0.1, 1],
    [0.14, 0.05, 0.12, 2],
    [-0.06, -0.06, -0.05, 3],
    [0.18, -0.05, 0.04, 0],
  ] as const;
  return (
    <group position={[x, y, WALL_Z]}>
      <mesh castShadow position={[0, 0, 0.01]}>
        <boxGeometry args={[0.5, 0.3, 0.02]} />
        <meshStandardMaterial color="#7a5230" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.022]}>
        <boxGeometry args={[0.46, 0.26, 0.006]} />
        <meshStandardMaterial color={palette.corkBoard} roughness={1} />
      </mesh>
      {notes.map(([nx, ny, tilt, colour], index) => (
        <group key={index} position={[nx, ny, 0.03]} rotation={[0, 0, tilt]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.08, 0.004]} />
            <meshStandardMaterial color={palette.notes[colour]} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.03, 0.004]}>
            <boxGeometry args={[0.012, 0.012, 0.006]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function WallDecor() {
  return (
    <>
      <SkyWindow x={0} y={1.75} />
      {/* Below the shelf and beside where the monitor hides the wall, so the seated camera sees them. */}
      <CorkBoard x={-1.45} y={0.92} />
      <GoblinPoster x={1.55} y={0.93} />
    </>
  );
}
