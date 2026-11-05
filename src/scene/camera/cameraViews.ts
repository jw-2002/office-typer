// The camera views. Positions are in metres. The camera starts seated.
import type { CameraView } from "@/state/view/viewStore";

export type CameraPose = {
  position: readonly [number, number, number];
  /** The point the camera looks at. */
  target: readonly [number, number, number];
};

export const cameraPoses: Readonly<Record<CameraView, CameraPose>> = {
  // The intro: right up to the monitor, so the screen fills the whole view while you type your name.
  intro: { position: [0, 1.07, 0.22], target: [0, 1.05, -0.2] },
  // The redundancy notice: close to the monitor like the intro, but far enough back that the whole screen fits the window.
  notice: { position: [0, 1.06, 0.42], target: [0, 1.05, -0.2] },
  // Seated at the desk: the screen fills most of the view and the keyboard shows below it. The camera is locked here.
  seated: { position: [0, 1.36, 0.8], target: [0, 0.93, -0.12] },
  // Standing up and a step back: eye height of a standing person, taking in the window, shelf, desk and the chair.
  standing: { position: [0, 1.65, 1.55], target: [0, 1.05, -0.35] },
};
