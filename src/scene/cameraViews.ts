// The two camera views. Positions are in metres. The camera starts seated.
import type { CameraView } from "@/state/viewStore";

export type CameraPose = {
  position: readonly [number, number, number];
  /** The point the camera looks at. */
  target: readonly [number, number, number];
};

export const cameraPoses: Readonly<Record<CameraView, CameraPose>> = {
  // Seated at the desk: the screen fills most of the view and the keyboard shows below it. The camera is locked here.
  seated: { position: [0, 1.36, 0.8], target: [0, 0.93, -0.12] },
  // Standing up and a step back: eye height of a standing person, taking in the shelf, name plate and desk.
  standing: { position: [0, 1.65, 1.2], target: [0, 0.95, -0.4] },
};
