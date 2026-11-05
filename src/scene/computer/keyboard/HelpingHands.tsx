// The helping hands: two white gloves that float over the keyboard and type for show. Each finger has its own job, as in
// touch typing: when a key goes down, the hand slides over so that the right finger is above it, and that finger
// bends down onto the key (two blocks, so it has a knuckle) while the others stay curled and wiggle a little.
// Drawn in keyboard units (one unit is one keycap).
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { palette } from "@/scene/palette";
import { fingerFor, type HandSide } from "./fingers";
import { keys, type KeyDef } from "./layout";

const byCode = new Map(keys.map((def) => [def.code, def]));

/** The gloves are drawn a bit smaller than life, so the keys under them can still be seen. */
const HAND_SCALE = 0.8;
/** Where each finger sits across the hand (left to right), before scaling. */
const FINGER_X = [-1.5, -0.5, 0.5, 1.5] as const;
const THUMB_X = { left: 2.5, right: -2.5 } as const;
/** Resting places over the home row (each hand's fingers sit above A S D F and J K L ;), and the heights of the gloves. */
const HOME: Record<HandSide, { x: number; z: number }> = { left: { x: 3.45, z: 5 }, right: { x: 9.45, z: 5 } };
const HOVER_Y = 3.5;
const TYPING_Y = 2.85;
/** How far in front of the glove the pressing fingertip lands, so the glove sits just behind the key. */
const REACH = 1.3;
/** Each finger bends at the knuckle (proximal) and again at the middle joint (distal). Angles are radians below flat. */
const KNUCKLE = { rest: 0.35, press: 0.6 } as const;
const JOINT = { rest: 0.45, press: 0.7 } as const;
/** Lengths of the two blocks of a finger. The middle two fingers are a touch longer, like real fingers. */
const KNUCKLE_LENGTH = 1.5;
const JOINT_LENGTH = 1.2;

const glove = <meshStandardMaterial color="#f8fafc" roughness={0.7} />;
/** Settings for the dark line round each block, in keyboard units (so it is thicker than the room's outlines). */
const GLOVE_OUTLINE = { thickness: 0.05, color: palette.outline } as const;

function Hand({ side, pressed }: { side: HandSide; pressed: Set<string> }) {
  const hand = useRef<Group>(null!);
  const knuckles = useRef<(Group | null)[]>([]);
  const joints = useRef<(Group | null)[]>([]);
  const thumb = useRef<Group>(null!);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    // Which of this hand's fingers are down, and the most recent key it is pressing.
    const down = [false, false, false, false];
    let thumbDown = false;
    let latest: { def: KeyDef; finger: number; thumb: boolean } | null = null;
    for (const code of pressed) {
      const def = byCode.get(code);
      if (!def) continue;
      const assignment = fingerFor(def.code, def.x);
      if (assignment.hand !== side) continue;
      if (assignment.thumb) thumbDown = true;
      else down[assignment.finger] = true;
      latest = { def, finger: assignment.finger, thumb: assignment.thumb };
    }

    // Slide so the pressing finger (or thumb) is over its key; with nothing down, drift back home with a gentle sway.
    const group = hand.current;
    let goalX: number = HOME[side].x + Math.sin(time * 0.9 + (side === "left" ? 0 : 2)) * 0.12;
    let goalZ: number = HOME[side].z;
    if (latest) {
      const offset = latest.thumb ? THUMB_X[side] : FINGER_X[latest.finger];
      goalX = latest.def.x - offset * HAND_SCALE;
      goalZ = latest.def.z + (latest.thumb ? 0.3 : REACH);
    }
    group.position.x = MathUtils.damp(group.position.x, goalX, 24, delta);
    group.position.z = MathUtils.damp(group.position.z, goalZ, 24, delta);
    group.position.y = MathUtils.damp(group.position.y, latest ? TYPING_Y : HOVER_Y, 18, delta);

    // Each finger bends down onto its key quickly and springs back. The idle fingers wiggle out of step with each other.
    for (let index = 0; index < FINGER_X.length; index++) {
      const knuckle = knuckles.current[index];
      const joint = joints.current[index];
      if (!knuckle || !joint) continue;
      const wiggle = Math.sin(time * 2.6 + index * 1.4 + (side === "left" ? 0 : 1)) * 0.07;
      const speed = down[index] ? 45 : 14;
      knuckle.rotation.x = MathUtils.damp(
        knuckle.rotation.x,
        -(down[index] ? KNUCKLE.press : KNUCKLE.rest + wiggle),
        speed,
        delta,
      );
      joint.rotation.x = MathUtils.damp(
        joint.rotation.x,
        -(down[index] ? JOINT.press : JOINT.rest + wiggle),
        speed,
        delta,
      );
    }
    thumb.current.rotation.x = MathUtils.damp(thumb.current.rotation.x, thumbDown ? -0.55 : -0.12, 30, delta);
  });

  return (
    <group ref={hand} position={[HOME[side].x, HOVER_Y, HOME[side].z]} scale={HAND_SCALE}>
      <mesh castShadow position={[0, 0, 1.2]}>
        <boxGeometry args={[4, 0.9, 2.6]} />
        {glove}
        <Outlines {...GLOVE_OUTLINE} />
      </mesh>
      {FINGER_X.map((x, index) => {
        const extra = index === 1 || index === 2 ? 0.2 : 0;
        return (
          // The pivot is at the knuckle, so rotating this group bends the whole finger; the joint group inside bends the tip.
          <group
            key={x}
            ref={(element) => {
              knuckles.current[index] = element;
            }}
            position={[x, 0, -0.1]}
            rotation={[-KNUCKLE.rest, 0, 0]}
          >
            <mesh castShadow position={[0, 0, -(KNUCKLE_LENGTH + extra) / 2]}>
              <boxGeometry args={[0.72, 0.65, KNUCKLE_LENGTH + extra]} />
              {glove}
              <Outlines {...GLOVE_OUTLINE} />
            </mesh>
            <group
              ref={(element) => {
                joints.current[index] = element;
              }}
              position={[0, 0, -(KNUCKLE_LENGTH + extra)]}
              rotation={[-JOINT.rest, 0, 0]}
            >
              <mesh castShadow position={[0, 0, -(JOINT_LENGTH + extra) / 2]}>
                <boxGeometry args={[0.68, 0.6, JOINT_LENGTH + extra]} />
                {glove}
                <Outlines {...GLOVE_OUTLINE} />
              </mesh>
            </group>
          </group>
        );
      })}
      <group ref={thumb} position={[THUMB_X[side], -0.1, 0.4]} rotation={[-0.12, side === "left" ? -0.5 : 0.5, 0]}>
        <mesh castShadow position={[0, 0, -0.8]}>
          <boxGeometry args={[1, 0.7, 2]} />
          {glove}
          <Outlines {...GLOVE_OUTLINE} />
        </mesh>
      </group>
    </group>
  );
}

export default function HelpingHands({ pressed }: { pressed: Set<string> }) {
  return (
    <>
      <Hand side="left" pressed={pressed} />
      <Hand side="right" pressed={pressed} />
    </>
  );
}
