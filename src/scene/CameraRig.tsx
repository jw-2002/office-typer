// Glides the camera between the desk view and the office view when the player switches. Between switches the
// player is free to orbit and zoom, so this only steers the camera while a move is in progress.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, type Vector3 } from "three";
import { useViewStore } from "@/state/viewStore";
import { cameraPoses } from "./cameraViews";

/** How long a move is steered for, in seconds. Easing is fast at first, so this is when it has fully settled. */
const MOVE_SECONDS = 1.4;
/** Higher is snappier. */
const SPEED = 4;

/** The parts of the orbit controls used here. R3F keeps the controls typed only as a generic event source. */
type OrbitLike = { target: Vector3; enabled: boolean };

function isOrbit(controls: unknown): controls is OrbitLike {
  return typeof controls === "object" && controls !== null && "target" in controls && "enabled" in controls;
}

export default function CameraRig() {
  const get = useThree((state) => state.get);
  const secondsLeft = useRef(0);

  useEffect(() => {
    return useViewStore.subscribe((state, previous) => {
      if (state.view !== previous.view) secondsLeft.current = MOVE_SECONDS;
    });
  }, []);

  useFrame((_, delta) => {
    if (secondsLeft.current <= 0) return;
    const { camera, controls } = get();
    if (!isOrbit(controls)) return;
    secondsLeft.current -= delta;
    const pose = cameraPoses[useViewStore.getState().view];
    // damp() eases toward the goal independent of frame rate. The orbit controls rebuild their state from the
    // camera and target every frame, so moving both is all that is needed.
    camera.position.set(
      MathUtils.damp(camera.position.x, pose.position[0], SPEED, delta),
      MathUtils.damp(camera.position.y, pose.position[1], SPEED, delta),
      MathUtils.damp(camera.position.z, pose.position[2], SPEED, delta),
    );
    controls.target.set(
      MathUtils.damp(controls.target.x, pose.target[0], SPEED, delta),
      MathUtils.damp(controls.target.y, pose.target[1], SPEED, delta),
      MathUtils.damp(controls.target.z, pose.target[2], SPEED, delta),
    );
    // The player cannot fight the move while it is happening.
    controls.enabled = secondsLeft.current <= 0;
  });

  return null;
}
