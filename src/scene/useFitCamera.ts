// Widens the camera's field of view on tall, narrow screens so the whole desk still fits across the width.
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera } from "three";

const BASE_FOV = 50;
const MAX_FOV = 75;
/** Half the width, in metres, that should always be visible at the monitor's distance. */
const HALF_WIDTH = 0.55;
const DISTANCE = 0.9;

export function useFitCamera() {
  const get = useThree((state) => state.get);
  const aspect = useThree((state) => state.size.width / state.size.height);

  useEffect(() => {
    // Read lazily: the camera object is mutated in place, which is normal in three.js.
    const { camera } = get();
    if (!(camera instanceof PerspectiveCamera)) return;
    // fov is the vertical angle. Working backwards from the width we want gives the angle that fits it.
    const needed = MathUtils.radToDeg(2 * Math.atan(HALF_WIDTH / DISTANCE / aspect));
    camera.fov = Math.min(MAX_FOV, Math.max(BASE_FOV, needed));
    camera.updateProjectionMatrix();
  }, [get, aspect]);
}
