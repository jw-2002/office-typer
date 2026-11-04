// Moves the camera between the intro, sitting at the desk and standing up. Seated, the camera is locked in place. Standing, the
// player can look around and zoom a little. Between those, this steers the camera along a smooth path.
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3, type Camera } from "three";
import { useDisplayStore } from "@/state/displayStore";
import { useViewStore, type CameraView } from "@/state/viewStore";
import { cameraPoses } from "./cameraViews";

/** How long standing up or sitting down takes, in seconds. */
const MOVE_SECONDS = 1.6;

/** The parts of the orbit controls used here. R3F keeps the controls typed only as a generic event source. */
type OrbitLike = { target: Vector3; enabled: boolean; enableDamping: boolean };

function isOrbit(controls: unknown): controls is OrbitLike {
  return (
    typeof controls === "object" &&
    controls !== null &&
    "target" in controls &&
    "enabled" in controls &&
    "enableDamping" in controls
  );
}

/** Starts slowly, speeds up, and slows down again. t runs from 0 to 1. */
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Jumps straight to a view's pose (no move to animate). */
function snapTo(camera: Camera, controls: OrbitLike, view: CameraView) {
  const pose = cameraPoses[view];
  camera.position.set(...pose.position);
  controls.target.set(...pose.target);
  camera.lookAt(controls.target);
}

type Move = { fromPosition: Vector3; fromTarget: Vector3; t: number };

export default function CameraRig() {
  const get = useThree((state) => state.get);
  const move = useRef<Move | null>(null);
  const started = useRef(false);

  // When the view changes, remember where the camera is now. The path to the new pose starts there.
  useEffect(() => {
    return useViewStore.subscribe((state, previous) => {
      if (state.view === previous.view) return;
      const { camera, controls } = get();
      if (!isOrbit(controls)) return;
      // With reduced motion the camera jumps instead of gliding.
      if (state.instant || useDisplayStore.getState().reducedMotion) {
        snapTo(camera, controls, state.view);
        move.current = null;
        return;
      }
      move.current = { fromPosition: camera.position.clone(), fromTarget: controls.target.clone(), t: 0 };
    });
  }, [get]);

  // A negative priority runs this before everything else each frame, so the monitor page (which follows the camera
  // in its own frame callback) always sees the camera's new position, not last frame's.
  useFrame((_, delta) => {
    const { camera, controls } = get();
    if (!isOrbit(controls)) return;
    // On the very first frame, start in whichever view the game is already in (the save may have loaded before the
    // controls existed, so the change could not be applied then).
    if (!started.current) {
      started.current = true;
      snapTo(camera, controls, useViewStore.getState().view);
      move.current = null;
    }
    const view = useViewStore.getState().view;
    const current = move.current;

    if (current) {
      current.t = Math.min(1, current.t + delta / MOVE_SECONDS);
      const pose = cameraPoses[view];
      const along = smooth(current.t);
      // Height gets there a little sooner than the rest, so standing up rises first and then steps back.
      const rise = smooth(Math.min(1, current.t * 1.3));
      const { fromPosition: from, fromTarget } = current;
      camera.position.set(
        MathUtils.lerp(from.x, pose.position[0], along),
        MathUtils.lerp(from.y, pose.position[1], rise),
        MathUtils.lerp(from.z, pose.position[2], along),
      );
      controls.target.set(
        MathUtils.lerp(fromTarget.x, pose.target[0], along),
        MathUtils.lerp(fromTarget.y, pose.target[1], rise),
        MathUtils.lerp(fromTarget.z, pose.target[2], along),
      );
      if (current.t >= 1) move.current = null;
    }

    // Locked while seated and while moving; free to look around only once standing.
    const free = view === "standing" && move.current === null;
    controls.enabled = free;
    // Which way the camera faces is normally worked out by the orbit controls, but only while they are switched on.
    // While they are off (seated, or during a move) we aim the camera at the target ourselves. Without this the
    // camera slides to its new spot still facing the old way, then snaps round the moment the controls come back.
    if (!free) camera.lookAt(controls.target);
    // The controls keep coasting after you let go of a drag. That must stop the moment we take over, or the leftover
    // spin would nudge the camera off its pose after it lands.
    controls.enableDamping = free;
  }, -2);

  return null;
}
