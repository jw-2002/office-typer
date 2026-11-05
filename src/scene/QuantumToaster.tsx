// The quantum toaster's working parts: two slices of toast poking out of the slots and a lever for each. Click it and the
// levers go down and the toast drops in. When they let go, each slice may or may not come back (a joke about a certain
// cat). It sits inside PcCase, so everything here is in the toaster's own space: standing on y = 0, front toward +z.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { TOAST_COMES_BACK, toastMessage } from "@/game/toast";
import { useSoundCueStore } from "@/state/soundCueStore";
import { clicked, hoverHand } from "./extras/clickable";

const SLOT_X = [-0.07, 0.07] as const;
const TOAST = { width: 0.09, height: 0.08, thickness: 0.016 } as const;
/** How long the toast stays down before it is let go, in milliseconds. */
const TOAST_MS = 1300;
/** How long the joke stays up, in milliseconds. */
const MESSAGE_MS = 3200;
type QuantumToasterProps = {
  /** Height of the toaster body, so the toast and levers line up with it. */
  height: number;
  depth: number;
  /** Only the toaster in use reacts to clicks. The shelf copy is clicked to switch to it, so it is left alone. */
  interactive: boolean;
  /** The toaster body and anything else that should react to the click along with the toast and levers. */
  children: ReactNode;
};

export default function QuantumToaster({ height, depth, interactive, children }: QuantumToasterProps) {
  // Whether the levers are held down, and which slices are in the world (not lost to the cat).
  const [down, setDown] = useState(false);
  const [present, setPresent] = useState<[boolean, boolean]>([true, true]);
  const [message, setMessage] = useState("");
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(window.clearTimeout);
  }, []);

  const toast = useRef<(Group | null)[]>([null, null]);
  const levers = useRef<(Group | null)[]>([null, null]);

  // Everything moves toward where it should be, easing as it goes. Nothing here changes React state.
  useFrame((_, delta) => {
    SLOT_X.forEach((_x, slot) => {
      const rest = height - TOAST.height / 2 + 0.05; // Middle of a slice sitting up, poking 5 cm out.
      const inside = height - TOAST.height / 2 - 0.012; // Dropped in, just under the top.
      const slice = toast.current[slot];
      if (slice) {
        slice.position.y = MathUtils.damp(slice.position.y, down || !present[slot] ? inside : rest, 12, delta);
        // A lost slice is hidden once it has sunk out of sight.
        slice.visible = present[slot] || slice.position.y > inside + 0.002;
      }
      const lever = levers.current[slot];
      if (lever) lever.position.y = MathUtils.damp(lever.position.y, down ? height * 0.38 : height * 0.74, 14, delta);
    });
  });

  const press = () => {
    if (down) return;
    setDown(true);
    setMessage("");
    timers.current.push(
      window.setTimeout(() => {
        // Each slice is decided only now, when the lever is let go.
        const next: [boolean, boolean] = [Math.random() < TOAST_COMES_BACK, Math.random() < TOAST_COMES_BACK];
        setPresent(next);
        setDown(false);
        setMessage(toastMessage(next.filter(Boolean).length));
        if (next.some(Boolean)) useSoundCueStore.getState().play("ping");
        timers.current.push(window.setTimeout(() => setMessage(""), MESSAGE_MS));
      }, TOAST_MS),
    );
  };

  return (
    <group
      {...(interactive ? hoverHand : {})}
      onClick={
        interactive
          ? (event) => {
              clicked(event, "clunk");
              press();
            }
          : undefined
      }
    >
      {children}
      {SLOT_X.map((x, slot) => (
        <group key={x}>
          {/* A slice: golden crust all round and a paler middle on each face. */}
          <group
            ref={(element) => {
              toast.current[slot] = element;
            }}
            position={[x, height - TOAST.height / 2 + 0.05, 0]}
          >
            <mesh castShadow>
              <boxGeometry args={[TOAST.width, TOAST.height, TOAST.thickness]} />
              <meshStandardMaterial color="#b97a35" roughness={0.9} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                position={[0, 0, (side * TOAST.thickness) / 2 + side * 0.0005]}
                rotation={[0, side === 1 ? 0 : Math.PI, 0]}
              >
                <planeGeometry args={[TOAST.width - 0.014, TOAST.height - 0.014]} />
                <meshStandardMaterial color="#e8c07c" roughness={0.9} />
              </mesh>
            ))}
          </group>

          {/* The lever: a dark groove down the front and a knob that slides along it. */}
          <mesh position={[x, height * 0.56, depth / 2 + 0.001]}>
            <boxGeometry args={[0.012, height * 0.5, 0.004]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          <group
            ref={(element) => {
              levers.current[slot] = element;
            }}
            position={[x, height * 0.74, depth / 2 + 0.008]}
          >
            <mesh castShadow>
              <boxGeometry args={[0.034, 0.016, 0.014]} />
              <meshStandardMaterial color="#f97316" roughness={0.4} />
            </mesh>
          </group>
        </group>
      ))}

      {message !== "" && (
        // Floats out in front of the toaster (toward the middle of the desk, where it fits on screen) and faces the camera.
        <Billboard position={[0, height + 0.1, depth / 2 + 0.14]}>
          <Text
            fontSize={0.02}
            maxWidth={0.3}
            textAlign="center"
            anchorX="center"
            anchorY="bottom"
            color="#fff7e6"
            outlineWidth={0.002}
            outlineColor="#1f2937"
          >
            {message}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
