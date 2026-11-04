// The two camera views. Positions are in metres. The camera starts in the desk view.
import type { CameraView } from "@/state/viewStore";

export type CameraPose = {
  position: readonly [number, number, number];
  /** The point the camera looks at. */
  target: readonly [number, number, number];
};

export const cameraPoses: Readonly<Record<CameraView, CameraPose>> = {
  // Close to the screen, looking down a little so the keyboard still shows along the bottom.
  desk: { position: [0, 1.33, 0.66], target: [0, 0.92, -0.1] },
  // Pulled back to take in the shelf, the name plate and the whole desk.
  office: { position: [0, 1.2, 0.78], target: [0, 0.93, -0.08] },
};
